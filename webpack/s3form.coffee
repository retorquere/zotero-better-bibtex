require('dotenv').config()
AwsS3Form = require('aws-s3-form')
Bluebird = require('bluebird')
github = require('./github')

for key in ['AWSAccessKeyId', 'AWSSecretAccessKey']
  if !process.env[key]
    console.log("#{key} not set, cannot proceed")
    process.exit(1)

formGenerator = new AwsS3Form({
  accessKeyId: process.env.AWSAccessKeyId,
  secretAccessKey: process.env.AWSSecretAccessKey,
  region: 'eu-central-1',
  bucket: 'better-bibtex-error-reports-62200312',
  policyExpiration: 6 * 24 * 60 * 60, # 6 days
  acl: 'private',
  useUuid: false
})

form = formGenerator.create('${filename}')

do Bluebird.coroutine(->
  json = 'error-report.json'

  release = yield github("/releases/tags/static-files")

  existing = release.assets?.find((asset) -> asset.name == json)
  yield github({ method: 'DELETE', uri: "/releases/assets/#{existing.id}" }) if existing

  yield github.upload({release, name: json, body: JSON.stringify(form, null, 2), content_type: 'application/json'})
  return
)
