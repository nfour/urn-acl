import Transposer from 'transposer'
import { typeOf } from 'lutils'

export default class Validator {
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

    validate(value) {
        return value === this.value
    }
}
