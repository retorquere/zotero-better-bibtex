// tslint:disable:no-console

require('dotenv').config()
require('../circle')
import path = require('path')

const pkg = require('../../package.json')
const version = require('../version')
const build_root = path.join(__dirname, '../../')

import * as github from './github'

const PRERELEASE = false
const KEEP_BUILDS = 20

function bail(msg, status = 1) {
  console.log(msg)
  process.exit(status)
}

function dedup(arr) {
  return arr.sort().filter((item, pos, ary) => !pos || (item !== ary[pos - 1]))
}

if (!process.env.CIRCLE_BRANCH) bail('Not running on CircleCI')

if (process.env.CI_PULL_REQUEST) bail('Not releasing pull requests', 0)

if (process.env.CIRCLE_TAG) {
  if (`v${pkg.version}` !== process.env.CIRCLE_TAG) bail(`Building tag ${process.env.CIRCLE_TAG}, but package version is ${pkg.version}`)

  if (process.env.CIRCLE_BRANCH !== 'master') bail(`Building tag ${process.env.CIRCLE_TAG}, but branch is ${process.env.CIRCLE_BRANCH}`)
}

if (process.env.CIRCLE_BRANCH.startsWith('@')) bail(`Not releasing ${process.env.CIRCLE_BRANCH}`, 0)

let tags = []
for (let regex = /(?:^|\s)(?:#)([a-zA-Z\d]+)/gm, tag; tag = regex.exec(process.env.CIRCLE_COMMIT_MSG); ) {
  tags.push(tag[1])
}
tags = dedup(tags)

if (tags.indexOf('norelease') >= 0) bail(`Not releasing ${process.env.CIRCLE_BRANCH} because of 'norelease' tag`, 0)

let issues = tags.filter(tag => !isNaN(parseInt(tag)))

if (process.env.CIRCLE_BRANCH.match(/^[0-9]+$/)) issues.push(process.env.CIRCLE_BRANCH)
issues = dedup(issues)

async function announce(issue, release) {
  let build, reason
  if (process.env.CIRCLE_TAG) {
    build = `${PRERELEASE ? 'pre-' : ''}release ${process.env.CIRCLE_TAG}`
    reason = ''
  } else {
    build = `test build ${process.env.CIRCLE_BUILD_NUM}`
    reason = ` (${JSON.stringify(process.env.CIRCLE_COMMIT_MSG)})`
  }

  const msg = `:robot: this is your friendly neighborhood build bot announcing [${build}](https://github.com/retorquere/zotero-better-bibtex/releases/download/${release}/zotero-better-bibtex-${version}.xpi)${reason}.`

  try {
    await github.request({
      uri: `/issues/${issue}/comments`,
      method: 'POST',
      body: { body: msg },
    })
  } catch (error) {}
}

async function main() {
  const release: { [key: string]: { tag_name: string, assets?: any } } = {
    static: { tag_name: pkg.xpi.releaseURL.split('/').filter(name => name).reverse()[0] },
    current: { tag_name: `v${pkg.version}` },
    builds: { tag_name: 'builds' },
  }

  for (const [id, rel] of Object.entries(release)) {
    try {
      release[id] = await github.request({ uri: `/releases/tags/${rel.tag_name}` })
    } catch (error) {
      release[id] = null
    }
  }

  if (process.env.CIRCLE_BRANCH === 'l10n_master') {
    const translations = await github.request({ uri: '/issues?state=open&labels=translation' })
    issues = issues.concat(translations.map(issue => issue.number))
  }
  issues = dedup(issues)

  const xpi = `zotero-better-bibtex-${version}.xpi`

  if (process.env.CIRCLE_TAG) {
    if (release.current) bail(`release ${process.env.CIRCLE_TAG} exists, bailing`)

    if (!release.static) bail('No release found to hold release pointers, bailing')

    const update_rdf = release.static.assets && release.static.assets.find(asset => asset.name === 'update.rdf')
    if (update_rdf) await github.request({ method: 'DELETE', uri: `/releases/assets/${update_rdf.id}` })

    // create release.current
    release.current = await github.request({
      uri: '/releases',
      method: 'POST',
      body: {
        tag_name: process.env.CIRCLE_TAG,
        prerelease: !!PRERELEASE,
      },
    })

    console.log(`uploading ${xpi} to ${release.current.tag_name}`)
    await github.upload({
      release: release.current,
      name: xpi,
      path: path.resolve(__dirname, path.join(build_root, `xpi/${xpi}`)),
      contentType: 'application/x-xpinstall',
    })

    await github.upload({
      release: release.static,
      name: 'update.rdf',
      path: path.resolve(__dirname, '../../gen/update.rdf'),
      contentType: 'application/rdf+xml',
    })

    for (const issue of issues) {
      await announce(issue, release.current.tag_name)
    }

  } else {
    if (!release.builds) bail('no release for builds')

    if (!release.builds.assets) release.builds.assets = []
    release.builds.assets.sort((a, b) => (new Date(b.created_at)).getTime() - (new Date(a.created_at)).getTime())
    for (let i = 0; i < release.builds.assets.length; i++) {
      const asset = release.builds.assets[i]
      if ((i < KEEP_BUILDS) && (asset.name !== xpi)) continue
      await github.request({ method: 'DELETE', uri: `/releases/assets/${asset.id}` })
    }

    console.log(`uploading ${xpi} to builds`)
    await github.upload({
      release: release.builds,
      name: xpi,
      path: path.resolve(__dirname, path.join(build_root, `xpi/${xpi}`)),
      contentType: 'application/x-xpinstall',
    })

    if (process.env.NIGHTLY === 'true') {
      issues = []
    }

    for (const issue of issues) {
      await announce(issue, 'builds')
    }
  }
}

main()
