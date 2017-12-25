// tslint:disable:no-console

import 'dotenv/config'

import AWSS3Form = require('aws-s3-form')
import moment = require('moment')

import * as GitHub from 'github'
const github = new GitHub
github.authenticate({ type: 'token', token: process.env.GITHUB_TOKEN })

const pkg = require('../../package.json')
const [ , owner, repo ] = pkg.repository.url.match(/:\/\/github.com\/([^\/]+)\/([^\.]+)\.git$/)

const expireAfterDay = 6

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
    policyExpiration: moment.duration(expireAfterDay, 'days').asSeconds(),
    acl: 'private',
    useUuid: false,
  })

  const form = formGenerator.create('${filename}')

  const name = 'error-report.json'

  const release = await github.repos.getReleaseByTag({ owner, repo, tag: pkg.xpi.releaseURL.split('/').filter(part => part).reverse()[0] })

  for (const asset of release.data.assets || []) {
    if (asset.name === name) await github.repos.deleteAsset({ owner, repo, id: asset.id })
  }

  const body = JSON.stringify(form, null, 2)

  await github.repos.uploadAsset({
    url: release.data.upload_url,
    file: body,
    contentType: 'application/json',
    contentLength: body.length,
    name,
  })
}

main()
