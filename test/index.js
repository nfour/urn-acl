import 'babel-polyfill'
import { expect } from 'chai'

import UrnSchema, { UriValidator } from '../'

describe('Urn', function() {
    const schema = new UrnSchema('version:method:scope:uri', {
        uri: UriValidator,
    })


    function parseUrl(url, method) {
        let [ version, scope, ...uri ] = url.split('/')

        uri = uri.join('/')

        return { version, scope, uri, method }
    }


    it('Validates valid urns', () => {
        const acl = schema.createAcl({
            a: [
                'urn:1.0:POST:foo:bar/*/${bazStr}',
            ],

            b: [
                'urn:*' // All should pass on this one, even invalid
            ]
        })

        const validSamples = [
            {
                url: "1.0/foo/bar/what/baz",
                method: 'POST',
            },
            {
                url: "1.0/foo/bar/22/baz",
                method: 'POST',
            }
        ]


        const data = {
            bazStr: 'baz'
        }


        for ( let { url, method } of validSamples ) {
            const params = parseUrl(url, method)
            const a = acl.validate('a', params, data)
            console.log({ params, a })
            expect( a ).to.be.true
            expect( acl.validate('b', params, data) ).to.be.true
        }
    })

    it('Validates invalid urns appropriately', () => {
        const acl = schema.createAcl({
            a: [
                'urn:1.0:POST:foo:bar/*/${bazStr}',
            ],

            b: [
                'urn:*' // All should pass on this one, even invalid
            ]
        })

        const invalidSamples = [
            {
                url: "1.0/foo/bar/1",
                method: 'POST',
            },
            {
                url: "1.0/foo/z/2/baz",
                method: 'POST',
            },
            {
                url: "1.0/x/bar/3/baz",
                method: 'POST',
            },
            {
                url: "2.0/foo/bar/3/baz",
                method: 'POST',
            },
            {
                url: "1.0/foo/bar/3/baz",
                method: 'GET',
            },
        ]

        const data = {
            bazStr: 'baz'
        }

        for ( let { url, method } of invalidSamples ) {
            const params = parseUrl(url, method)

            expect( acl.validate('a', params, data) ).to.be.false
            expect( acl.validate('b', params, data) ).to.be.true
        }
    })
})
