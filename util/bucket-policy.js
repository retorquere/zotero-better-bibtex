#!/usr/bin/env node

require("dotenv/config")

var arn = process.env.AWSARN || process.argv[2]
var user = arn.match(/^arn:aws:iam::([0-9]+):user\/([a-z]+)$/)
var pkg = require('../package.json')
var fs = require('fs')

function compact(region) {
  return region
    .replace('-northeast-', 'ne')
    .replace('-south-', 's')
    .replace('-southeast-', 'se')
    .replace('-central-', 'c')
    .replace('-north-', 'n')
    .replace('-northwest-', 'nw')
    .replace('-west-', 'w')
    .replace('-east-', 'e')
}

for (const region of pkg.bugs.logs.regions) {
  const bucket = pkg.bugs.logs.bucket + '-' + compact(region)

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
        Resource: `arn:aws:s3:::${bucket}/*`,
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
        Resource: `arn:aws:s3:::${bucket}/*`
      }
    ]
  }

  fs.writeFileSync(`${bucket}.json`, JSON.stringify(policy, null, 2), 'utf8')
}
