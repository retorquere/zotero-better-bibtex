// tslint:disable:no-console

import 'dotenv/config'
import * as path from 'path'
import * as moment from 'moment'
import * as fs from 'fs'

import * as GitHub from 'github'
const github = new GitHub
github.authenticate({ type: 'token', token: process.env.GITHUB_TOKEN })

import '../circle'
import root from '../root'

const pkg = require(path.join(root, 'package.json'))
const [ , owner, repo ] = pkg.repository.url.match(/:\/\/github.com\/([^\/]+)\/([^\.]+)\.git$/)

import version from '../version'
const xpi = `zotero-better-bibtex-${version}.xpi`

const PRERELEASE = false
// tslint:disable-next-line:no-magic-numbers
const EXPIRE_BUILDS = moment().subtract(7, 'days').toDate().toISOString()

function bail(msg, status = 1) {
  console.log(msg)
  process.exit(status)
}

const dryRun = !process.env.CIRCLE_BRANCH
if (dryRun) {
  console.log('Not running on CircleCI, switching to dry-run mode')
  process.env.CIRCLE_BRANCH = require('current-git-branch')
}

function report(msg) {
  console.log(`${dryRun ? 'dry-run: ' : ''}${msg}`)
}

if (process.env.CI_PULL_REQUEST) bail('Not releasing pull requests', 0)

if (process.env.CIRCLE_TAG) {
  if (`v${pkg.version}` !== process.env.CIRCLE_TAG) bail(`Building tag ${process.env.CIRCLE_TAG}, but package version is ${pkg.version}`)

  if (process.env.CIRCLE_BRANCH !== 'master') bail(`Building tag ${process.env.CIRCLE_TAG}, but branch is ${process.env.CIRCLE_BRANCH}`)
}

const tags = new Set
for (let regex = /(?:^|\s)(?:#)([a-zA-Z\d]+)/gm, tag; tag = regex.exec(process.env.CIRCLE_COMMIT_MSG); ) {
  tags.add(tag[1])
}

if (tags.has('norelease')) bail(`Not releasing on ${process.env.CIRCLE_BRANCH} because of 'norelease' tag`, 0)

const issues = new Set(Array.from(tags).map(parseInt).filter(tag => !isNaN(tag)))

if (process.env.CIRCLE_BRANCH.match(/^[0-9]+$/)) issues.add(parseInt(process.env.CIRCLE_BRANCH))

async function announce(issue, release) {
  let build, reason
  if (process.env.CIRCLE_TAG) {
    build = `${PRERELEASE ? 'pre-' : ''}release ${process.env.CIRCLE_TAG}`
    reason = ''
  } else {
    build = `test build ${process.env.CIRCLE_BUILD_NUM}`
    reason = ` (${JSON.stringify(process.env.CIRCLE_COMMIT_MSG)})`
  }

  const msg = `:robot: this is your friendly neighborhood build bot announcing [${build}](https://github.com/retorquere/zotero-better-bibtex/releases/download/${release.data.tag_name}/zotero-better-bibtex-${version}.xpi)${reason}.`

  report(msg)
  if (dryRun) return

  try {
    await github.issues.createComment({ owner, repo, number: issue, body: msg })
  } catch (error) {
    console.log(`Failed to announce '${build}: ${reason}' on ${issue}`)
  }
}

async function uploadAsset(release, asset, contentType) {
  report(`uploading ${path.basename(asset)} to ${release.data.tag_name} using ${release.data.upload_url}`)
  if (dryRun) return

  await github.repos.uploadAsset({
    url: release.data.upload_url,
    file: fs.readFileSync(asset, null).buffer,
    contentType,
    contentLength: fs.statSync(asset).size,
    name: path.basename(asset),
  })
  console.log('done')
}

async function getRelease(tag, failonerror = true) {
  try {
    return await github.repos.getReleaseByTag({ owner, repo, tag })
  } catch (err) {
    if (failonerror) bail(`Could not get release ${tag}: ${err}`)
    return null
  }
}

async function update_rdf(tag, failonerror) {
  const release = await getRelease(tag, failonerror)

  report(`uploading update.rdf to ${release.tag_name}`)
  if (dryRun) return

  for (const asset of release.data.assets || []) {
    if (asset.name === 'update.rdf') await github.repos.deleteAsset({ owner, repo, id: asset.id })
  }
  await uploadAsset(release, path.join(root, 'gen/update.rdf'), 'application/rdf+xml')
}

async function _main() {
  if (process.env.NIGHTLY === 'true') return

  if (process.env.CIRCLE_BRANCH === 'l10n_master') {
    for (const issue of await github.issues.getForRepo({ owner, repo, state: 'open', labels: 'translation' })) {
      issues.add(parseInt(issue.number))
    }
  }

  let release
  if (process.env.CIRCLE_TAG) {
    // upload XPI
    release = await getRelease(process.env.CIRCLE_TAG, false)
    if (release) bail(`release ${process.env.CIRCLE_TAG} exists, bailing`)

    report(`uploading ${xpi} to new release ${process.env.CIRCLE_TAG}`)
    if (!dryRun) {
      release = github.repos.createRelease({ owner, repo, tag_name: process.env.CIRCLE_TAG, prerelease: !!PRERELEASE })
      await uploadAsset(release, path.join(root, `xpi/${xpi}`), 'application/x-xpinstall')
    }

    // RDF update pointer(s)
    update_rdf(pkg.xpi.releaseURL.split('/').filter(name => name).reverse()[0], true)
    // legacy RDF pointer
    update_rdf('update.rdf', false)

  } else {
    release = await getRelease('builds')

    for (const asset of release.data.assets || []) {
      if (asset.created_at < EXPIRE_BUILDS) {
        report(`deleting ${asset.name}`)
        if (!dryRun) await github.repos.deleteAsset({ owner, repo, id: asset.id })
      }
    }
    await uploadAsset(release, path.join(root, `xpi/${xpi}`), 'application/x-xpinstall')
  }

  for (const issue of Array.from(issues)) {
    await announce(issue, release)
  }
}

async function main() {
  try {
    await _main()
  } catch (err) {
    bail(`release failed: ${err}`)
  }
}

main()
