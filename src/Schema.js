import { typeOf } from 'lutils'
import { escapeRegex } from './utils'
import Validator from './Validator'
import UriValidator from './UriValidator'

export { Validator, UriValidator }

export default class UrnSchema {
    config = {
        open: "${",
        close: "}"
    }

    constructor(keyInput, mapping = {}, config = {}) {
        this.config = { ...this.config, ...config }

        this.keys       = keyInput.split(':')
        this.validators = this.keys.map((key) => mapping[key] || Validator)

        this.open  = escapeRegex(this.config.open)
        this.close = escapeRegex(this.config.close)

        this.regex = {
            // "${some.variable}" to "some.variable"
            variable: new RegExp(`^${this.open}([^${this.close}]+)${this.close}$`)
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

    getVariableKey(value = '') {
        const match  = value.match(this.regex.variable) || []
        const varKey = match[1] || null

        return varKey
    }
}

export class Acl {
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

    validateMany(groups, request, data) {
        let result
        for ( let item of groups ) {
            result = this.validate(item, request, data)

            if ( result.valid ) break
        }

        return result
    }

    validate(grouping, request, data) {
        if ( typeOf.Array(grouping) )
            return this.validateMany(grouping, request, data)

        const group = this.groups[grouping]

        if ( ! group )
            return { valid: false, error: `Invalid group '${grouping}'` }

        let result = { valid: true, group: grouping }

        for ( let validators of group ) {
            let isValidUrn = false

            const last = validators.length - 1

            for ( let index in validators ) {
                const validator = validators[index]
                const value     = request[validator.key]

                const wildcarded = validator.value === '*' || ( validator.value === '' && index !== last )
                const valid      = wildcarded || validator.validate(value, data)

                result = { ...result, valid, value, index, wildcarded, key: validator.key }

                if ( ! valid ) {
                    isValidUrn = true
                    break
                }
            }

            if ( ! isValidUrn )
                return result
        }

        return { ...result, valid: false }
    }
}
