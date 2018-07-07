#!/usr/bin/env node

var user = process.argv[2].match(/^arn:aws:iam::([0-9]+):user\/([a-z]+)$/)
var pkg = require('../package.json')
var fs = require('fs')

var policy = {
  Version: '2012-10-17',
  Statement: [
    {
      Sid: 'allow-anon-put',
      Effect: 'Allow',
      Principal: {
        AWS: '*'
      },
      Action: 's3:PutObject',
      Resource: `arn:aws:s3:::${pkg.bugs.logs.bucket}/*`,
      Condition: {
        StringEquals: {
          's3:x-amz-acl': 'bucket-owner-full-control'
        }
      }
    },
    {
      Sid: 'deny-other-actions',
      Effect: 'Deny',
      NotPrincipal: {
        AWS: [
          `arn:aws:iam::${user[1]}:root`,
          process.argv[2],
        ]
      },
      NotAction: [
        's3:PutObject',
        's3:PutObjectAcl'
      ],
      Resource: `arn:aws:s3:::${pkg.bugs.logs.bucket}/*`
    }
  ]
}

console.log(JSON.stringify(policy, null, 2))
