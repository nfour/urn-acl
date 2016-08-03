# URN Schema

This library handles URN schemas, similar to AWS ARN's, useful for access control.

Features:
- [x] Variable interpolation `urn:${some.dataset}`
- [x] Wildcarding `urn:*`
- [x] Precompilation for performance
- [x] Uri validation `urn:this/${is.a}/*/uri?with&a&query`
- [x] ACL's
- [x] Conforms to [URN](https://en.wikipedia.org/wiki/Uniform_Resource_Name)

```js
import UrnSchema, { UriValidator } from 'urn-schema'

const schema = new UrnSchema('version:method:scope:uri', {
    uri: UriValidator,
})

const acl = schema.createAcl({
    group_a: [
        "urn:1.0:POST:testing:products/*/items/*"
    ]
})

acl.validate('group_a', {
    version : '1.0',
    method  : 'POST',
    scope   : 'testing',
    uri     : 'products/22/items'
}) // returns { valid: true, group: 'group_a' }

acl.validate('group_a', {
    version : '2.0',
    method  : 'GET',
    scope   : 'testing',
    uri     : 'products/22/items'
}) // returns { valid: false, group: 'group_a' }

```

In the basic example above we have defined a schema which matches predefined properties, including parsing the `uri` appropriately.

Below is a more advanced example.

```js
const acl = schema.createAcl({
    group_a: [
        "urn:${versions}:GET:${scopes}:products/${user['!~validIds~!']}/*?direction&order"
    ]
})

const data = {
    versions: [ '1.0', '2.0' ],
    scopes: [ 'testing', 'staging' ],
    user: {
        "!~validIds~!": [ 22, 24, 77 ]
    }
}

acl.validate('group_a', {
    version : '2.0',
    method  : 'GET',
    scope   : 'testing',
    uri     : 'products/22/items?order=size'
}, data) // returns { valid: true, group: 'group_a' }
```

In the above example the variables defined in `group_a`'s first urn are interpolated from the `data` object.

These uri's would also pass:
- `products/24/`
- `products/27/something?direction=asc`

And so too would version `1.0` and scope `staging`.

It's easy to parse a full URL into something you can use against the schema.
Imagine the below `originalUrl` is `/2.0/testing/products/22`.

```js
app.use((req, res, next) => {
    const { method, originalUrl, auth } = req

    // Take off the first 2 parts
    let [ version, scope, ...uri ] = originalUrl
        .replace(/^\/|\/$/g, '') // Remove trailing & leading slashes
        .split('/')

    uri = uri.join('/') // Join it back up

    const aclCheck = acl.validate(auth.scope, {
        version, scope, method, uri
    }).valid

    if ( aclCheck.valid )
        return next()
    else
        return next( new ForbiddenError("Permission denied!!!") )
})

```

### Interpolation Mechanics

When a variable is interpolated, the type matters.

- If `${some.data}` resolves to an array `[1, 2]`, then the value can match either of them, as a string comparison
- If `${some.data}` resolves to any other type, it will be stringified and compared against the value
