import Validator from './Validator'

export default class UriValidator extends Validator {
    compile() {
        let [ uri = '', query = '' ] = this.value.split('?')

        uri   = this.splitUri(uri)
        query = query.split('&').filter((v) => v)

        this.query = null

        if ( query.length ) {
            this.query = {}
            for ( let item of query ) this.query[item] = true
        }

        this.validators = uri.map((part) => {
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
        const [ uri, query ] = value.split('?')
        const uriParts = this.splitUri(uri)

        // Checks /some/url/22/path
        for ( let [index, validate] of this.validators.entries() ) {
            const part = uriParts[index]

            if ( ! validate || ! validate(part, data) ) return false
        }

        // Checks ?orderBy&direction
        if ( this.query && query ) {
            const queryKeys = query.split('&')
                .map((v) => v.split('=')[0])
                .filter((v) => v)

            for ( let key of queryKeys )
                if ( ! ( key in this.query ) ) return false
        }
        return true
    }
}
