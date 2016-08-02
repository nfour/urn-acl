import { clone, typeOf } from 'lutils'
import { escapeRegex } from './utils'
import Transposer from 'transposer'

export class Validator {
    constructor(schema, { key, value }) {
        this.schema = schema
        this.key    = key
        this.value  = value
    }

    compile() {
        const varKey = this.schema.getVariableKey(this.value)

        if ( varKey )
            this.validate = (value, data) => this.validateVariable(varKey, value, data)
    }

    validateVariable(varKey, value, data) {
        const resolvedValue = new Transposer(data).get(varKey)

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
        this.validators = this.splitUri(this.value)
            .map((part) => {
                if ( part === '' || part === '*' )
                    return () => true

                const varKey = this.schema.getVariableKey(part)

                if ( varKey )
                    return (value, data) => this.validateVariable(varKey, value, data)
                else
                    return (value) => value === part
            })

    }

    splitUri(uri) {
        return uri.replace(/^\/|\/$/g, '').split('/')
    }

    validate(value, data) {
        const uriParts = this.splitUri(value)

        for ( let [index, part] of uriParts.entries() ) {
            const fn = this.validators[index]

            if ( ! fn || ! fn(part, data) ) return false
        }

        return true
    }
}

export default class UrnSchema {
    config = {
        open: "${",
        close: "}"
    }

    constructor(keyInput, mapping = {}, config = {}) {
        this.keys       = keyInput.split(':')
        this.validators = this.keys.map((key) => mapping[key] || Validator)

        this.config = { ...this.config, ...config }

        this.open  = escapeRegex(this.config.open)
        this.close = escapeRegex(this.config.close)

        this.regex = {
            // "${some.variable}" to "some.variable"
            variable: new RegExp(`^${this.open}([^${this.close}])+${this.close}$`)
        }
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

            const validator = new Fn(this, { key, value })
            validator.compile()

            compiled.push(validator)
        }

        return compiled
    }

    createAcl(roles) {
        return new Acl(this, roles)
    }

    getVariableKey(value) {
        const match  = value.match(this.regex.variable) || []
        const varKey = match[1] || null

        return varKey
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
