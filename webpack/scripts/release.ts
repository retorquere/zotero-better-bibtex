// tslint:disable:no-console

require('dotenv').config()
import * as path from 'path'

import '../circle'

import root from '../root'
import version from '../version'
import * as github from './github'
import CommandLineOptions = require ('command-line-args')
import camelCase = require('lodash.camelcase')
import GitHub = require('github')

const pkg = require('../../package.json')

const options = CommandLineOptions([
  { name: 'verbose', alias: 'v', type: Boolean },
  { name: 'dry-run', alias: 'd', type: Boolean },
  { name: 'pre-release', alias: 'p', type: Boolean },
  { name: 'ttl', alias: 't', type: Number, defaultValue: 14 },
  { name: 'repo', alias: 'r', type: String },
  { name: 'owner', alias: 'o', type: String },
])
for (const [key, value] of Object.entries(options)) {
  const camelCased = camelCase(key)
  if (camelCased != key) {
    options[camelCased] = options[key]
    delete options[key]
  }
}
if (options.repo.indexOf('/') >= 0 && !options.owner) {
  [options.owner, options.repo] = options.repo.split('/')
}
github = new GitHub({ debug: options.verbose })
github.authenticate({ type: 'token', token: process.env.GITHUB_TOKEN })

/*
class Releaser {
  private release: { [key: string]: { tag_name: string, assets?: any }

  constructor() {

    this.tags = new Set

    for (let regex = /(?:^|\s)(?:#)([a-zA-Z\d]+)/gm, tag; tag = regex.exec(process.env.CIRCLE_COMMIT_MSG || ''); ) {
      this.tags.add(tag[1])
    }

    // numeric tags are assumed to be issues to be notified
    this.issues = new Set(Array.from(this.tags).filter(tag => !isNaN(parseInt(tag))))

    // if the branch is a number, assume it is an issues to be notified
    if (process.env.CIRCLE_BRANCH.match(/^[0-9]+$/)) this.issues.add(process.env.CIRCLE_BRANCH)
  }

  private bail(msg, status = 1) {
    console.log(msg)
    process.exit(status)
  }

  public async run() {
    this.release = {
      static: this.getRelease(pkg.xpi.releaseURL.split('/').filter(name => name).reverse()[0]),
      legacy: this.getRelease('update.rdf'),
      current: this.getRelease(`v${pkg.version}`),
      builds: this.getRelease('builds'),
    }

    this.verifyEnv()
  }

  private async getRelease(name, tag) {
    try {
      return await this.github.repos.getReleaseByTag({ owner: options.owner, repo: options.repo, tag })
    } catch (error) {
      return null
    }
  }

  private verifyEnv() {
    ef (!process.env.CIRCLE_BRANCH && !options.dryRun) bail('Not running on CircleCI')

    if (process.env.CI_PULL_REQUEST) bail('Not releasing pull requests', 0)

    if (process.env.CIRCLE_TAG) {
      if (`v${pkg.version}` !== process.env.CIRCLE_TAG) bail(`Building tag ${process.env.CIRCLE_TAG}, but package version is ${pkg.version}`)

      if (process.env.CIRCLE_BRANCH !== 'master') bail(`Building tag ${process.env.CIRCLE_TAG}, but branch is ${process.env.CIRCLE_BRANCH}`)
    }

    if (process.env.CIRCLE_BRANCH.startsWith('@')) {
      console.log(`switching to dry-run mode because branch name starts with '@'`)
      options.dryRun = true
    }
    if (!option.dryRun && this.tags.has('norelease'))
      console.log(`switching to dry-run mode because commit is tagged with '#norelease'`)
      options.dryRun = true
    }
  }

  private async function announce(issue, release) {
    let build, reason
    if (process.env.CIRCLE_TAG) {
      build = `${options.prerelease ? 'pre-' : ''}release ${process.env.CIRCLE_TAG}`
      reason = ''
    } else {
      build = `test build ${process.env.CIRCLE_BUILD_NUM}`
      reason = ` (${JSON.stringify(process.env.CIRCLE_COMMIT_MSG)})`
    }

    const msg = `:robot: this is your friendly neighborhood build bot announcing [${build}](https://github.com/retorquere/zotero-better-bibtex/releases/download/${release}/zotero-better-bibtex-${version}.xpi)${reason}.`

    if (options.dryRun) {
      console.log(msg)
    } else {
      try {
        await this.github.issues.createComment({ options: this.owner, repo: options.repo, number: parseInt(issue), body: msg })
      } catch (error) {}
    }
  }
}

async function main() {

  if (process.env.CIRCLE_BRANCH === 'l10n_master') {
    const translations = await github.request({ uri: '/issues?state=open&labels=translation' })
    issues = issues.concat(translations.map(issue => issue.number))
  }
  issues = dedup(issues)

  const xpi = `zotero-better-bibtex-${version}.xpi`

  if (process.env.CIRCLE_TAG) {
    if (release.current) bail(`release ${process.env.CIRCLE_TAG} exists, bailing`)

    if (!release.static) bail('No release found to hold release pointers, bailing')

    for (const rel of [release.static, release.legacy]) {
      if (!rel) continue
      const update_rdf = rel.assets && rel.assets.find(asset => asset.name === 'update.rdf')
      if (update_rdf) await github.request({ method: 'DELETE', uri: `/releases/assets/${update_rdf.id}` })
    }

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
      path: path.join(root, `xpi/${xpi}`),
      contentType: 'application/x-xpinstall',
    })

    for (const rel of [release.static, release.legacy]) {
      await github.upload({
        release: rel,
        name: 'update.rdf',
        path: path.join(root, 'gen/update.rdf'),
        contentType: 'application/rdf+xml',
      })
    }

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
      path: path.resolve(__dirname, path.join(root, `xpi/${xpi}`)),
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
*/
