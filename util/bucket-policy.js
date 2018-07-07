#!/usr/bin/env node

require("dotenv/config")

var arn = process.env.AWSARN || process.argv[2]
var user = arn.match(/^arn:aws:iam::([0-9]+):user\/([a-z]+)$/)
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
        StringEquals: { 's3:x-amz-acl': 'bucket-owner-full-control' },
        StringLike: { 's3:x-amz-storage-class': 'STANDARD' },
      }
    },
    {
      Sid: 'deny-other-actions',
      Effect: 'Deny',
      NotPrincipal: {
        AWS: [
          `arn:aws:iam::${user[1]}:root`,
          arn,
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
