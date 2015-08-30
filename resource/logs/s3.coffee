AwsS3Form = require('aws-s3-form')
fs = require('fs')

if !process.env.ZOTPLUSAWSKEY || !process.env.ZOTPLUSAWSSECRET
  if process.env.TRAVIS_PULL_REQUEST
    process.env.ZOTPLUSAWSKEY = process.env.ZOTPLUSAWSSECRET = "travis-pull-request-#{process.env.TRAVIS_PULL_REQUEST}"
  else
    for data in require('babyparse').parse(fs.readFileSync(process.env.ZOTPLUSAWSCREDENTIALS, 'utf8'), {header: true}).data
      process.env.ZOTPLUSAWSKEY ||= data['Access Key Id']
      process.env.ZOTPLUSAWSSECRET ||= data['Secret Access Key']

if !process.env.ZOTPLUSAWSKEY || !process.env.ZOTPLUSAWSSECRET
  throw new Error('No AWS signing credentials present')

formGen = new AwsS3Form(
  accessKeyId: process.env.ZOTPLUSAWSKEY
  secretAccessKey: process.env.ZOTPLUSAWSSECRET
  region: 'eu-central-1'
  bucket: 'zotplus-964ec2b7-379e-49a4-9c8a-edcb20db343f'
  policyExpiration: 60 * 60 * 24 * 365 * 10
  acl: 'private'
  useUuid: false
)

fs.writeFileSync('resource/logs/s3.json', JSON.stringify(formGen.create('${filename}'), null, 2))
