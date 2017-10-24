require('dotenv').config()

import AWSS3Form = require('aws-s3-form')
import * as github from './github'
const Package = require('../../package.json')

function verify(key) {
  if (process.env[key]) return
  console.log(`${key} not set, cannot proceed`)
  process.exit(1)
}

async function main() {
  verify('AWSAccessKeyId')
  verify('AWSSecretAccessKey')

  const formGenerator = new AWSS3Form({
    accessKeyId: process.env.AWSAccessKeyId,
    secretAccessKey: process.env.AWSSecretAccessKey,
    region: 'eu-central-1',
    bucket: 'better-bibtex-error-reports-62200312',
    policyExpiration: 6 * 24 * 60 * 60, // 6 days
    acl: 'private',
    useUuid: false
  })

  const form = formGenerator.create('${filename}')

  const json = 'error-report.json'

  const release_name = Package.xpi.releaseURL.split('/').filter(path => path).reverse()[0]

  const release = await github.request({ uri: `/releases/tags/${release_name}` })

  const existing = release.assets && release.assets.find((asset) => asset.name == json)
  if (existing) await github.request({ method: 'DELETE', uri: `/releases/assets/${existing.id}` })

  await github.upload({release, name: json, body: JSON.stringify(form, null, 2), contentType: 'application/json'})
}

main()
