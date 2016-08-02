import UrnSchema, { UriValidator } from './src/Urn'

const schema = new UrnSchema('version:method:scope:uri', {
    uri: UriValidator,
})

const aclSchema = schema.createAcl({
    rpo_audit_criteria: [
        'urn:1.0:POST:rpo:audit_criteria/*/test',
        'urn:3.0:*',
        'urn:2.0:GET:rpo:audit_criteria',
    ],

    pass_all: [
        'urn:*'
    ]
})

const testCases = {
    rpo_audit_criteria: [
        "1.0/rpo/audit_criteria/22/test",
        "3.0/rpo/test",
        "2.0/erp/orders/2",
        "4.0/fails/on/version",
    ]
}

for ( let key in testCases )
    for ( let test of testCases[key] ) {
        let [ version, scope, ...uri ] = test.split('/')
        const method = 'POST'

        uri = uri.join('/')

        // console.log(aclSchema.groups.rpo_audit_criteria)
        console.log('-----------')
        console.log(key, test)
        console.log(key, test)

        console.log(
            aclSchema.validate(key, {
                version, scope, uri, method
            })
        )

    }
