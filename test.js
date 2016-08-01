import UrnSchema, { UriValidator } from './src/Urn'

const schema = new UrnSchema('version:method:scope:uri', {
    uri: UriValidator,
})

const aclSchema = schema.createAcl({
    rpo_audit_criteria: [
        'urn:1.0:POST:rpo:audit_criteria',
        'urn:3.0:*',
        'urn:2.0:GET:rpo:audit_criteria',
    ],

    pass_all: [
        'urn:*'
    ]
})

let [ version, scope, ...uri ] = "3.0/rpo/audit_criteria".split('/')
const method = 'POST'

uri = uri.join('/')

console.log(aclSchema.groups.rpo_audit_criteria)
console.log({ version, scope, uri, method })

console.log(
    aclSchema.validate('rpo_audit_criteria', {
        version, scope, uri, method
    })
)

console.log(
    aclSchema.validate('pass_all', {
        version, scope, uri, method
    })
)
