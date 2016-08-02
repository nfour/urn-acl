import UrnSchema, { UriValidator } from './src/Schema'

const schema = new UrnSchema('version:method:scope:uri', {
    uri: UriValidator,
})

const aclSchema = schema.createAcl({
    rpo_audit_criteria: [
        'urn:1.0:POST:rpo:audit_criteria/*/test',
    ],

    pass_all: [
        'urn:*'
    ]
})

const testCases = {
    rpo_audit_criteria: [
        "1.0/rpo/audit_criteria/22/test?orderBy&direction",
    ]
}

for ( let key in testCases )
    for ( let test of testCases[key] ) {
        let [ version, scope, ...uri ] = test.split('/')
        const method = 'POST'

        uri = uri.join('/')

        // console.log(aclSchema.groups.rpo_audit_criteria)
        console.log('-----------')
        console.log({ version, scope, uri, method }, test)

        console.log(
            aclSchema.validate(key, {
                version, scope, uri, method
            })
        )

    }
