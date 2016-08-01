import { clone, typeOf } from 'lutils'
import { escapeRegex } from './utils'
import Transposer from 'transposer'

export class Validator {
    config = {
        open: "${",
        close: "}"
    }

    constructor(key, value, config = {}) {
        this.key    = key
        this.value  = value
        this.config = { ...this.config, ...config }

        //
        // TODO: move this to UrnSchema, inherit an intance for each validators constructor
        //
        
        this.open  = escapeRegex(this.config.open)
        this.close = escapeRegex(this.config.close)

        this.regex = {
            variable: new RegExp(`^${this.open}([^${this.close}])+${this.close}$`)
        }
    }

    compile() {
        const match       = this.value.match(this.regex.variable) || []
        this.transposeKey = match[1] || null

        if ( this.transposeKey )
            this.validate = this.validateInterpolated
    }

    validateInterpolated(value, data) {
        const resolvedValue = new Transposer(data).get(this.transposeKey)

        const compare = (input) => String(input) === value

        if ( typeOf.Array(resolvedValue) )
            return resolvedValue.some(compare)

        return compare(resolvedValue)
    }

    validate(value, data) {
        return value === this.value
    }
}

export class UriValidator extends Validator {
    compile() {

    }

    validate() {
        /// Use compiled uri here!

        return true
    }
}

export default class UrnSchema {
    constructor(keyInput, mapping = {}) {
        this.keys       = keyInput.split(':')
        this.validators = this.keys.map((key) => mapping[key] || Validator)
    }

    /**
     *  Compiles an URN
     *
     *  @return {Object}
     */
    compile(urnStr) {
        const [ ident, ...parts ] = urnStr.split(':')

        if ( ident !== "urn" ) throw new Error(`Invalid urn at 0, ${urnStr}`)

        const compiled = []

        for ( let [index, value] of parts.entries() ) {
            const key = this.keys[index]
            const Fn  = this.validators[index]

            if ( ! key ) break

            console.log(key, { Fn })

            const validator = new Fn(key, value)
            validator.compile()

            compiled.push(validator)
        }

        return compiled
    }

    createAcl(roles) {
        return new Acl(this, roles)
    }
}

class Acl {
    constructor(schema, groups) {
        this.schema      = schema
        this.inputGroups = groups

        this.groups = this.compile(groups)
    }

    compile(urnGroups) {
        const validatorGroups = {}

        for ( let key in urnGroups ) {
            validatorGroups[key] = urnGroups[key].map((urn) =>
                this.schema.compile(urn)
            )
        }

        return validatorGroups
    }

    validate(key, request, data) {
        const group = this.groups[key]

        if ( ! group )
            throw new Error(`Invalid group '${key}'`)

        for ( let validators of group ) {
            let urnInvalidated = false

            const last = validators.length - 1

            for ( let [index, validator] of validators.entries() ) {
                const value = request[validator.key]

                const wildcarded = validator.value === '*' || ( validator.value === '' && index !== last )
                const valid      = wildcarded || validator.validate(value, data)

                console.log({ valid, wildcarded, value, last, index })

                if ( ! valid ) {
                    urnInvalidated = true
                    break
                }
            }

            if ( ! urnInvalidated )
                return true
        }

        return false
    }
}
