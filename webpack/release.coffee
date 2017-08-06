require('dotenv').config()
pkg = require('../package.json')
version = require('./version')
path = require('path')

Bluebird = require('bluebird')
GitHubApi = require("github")

process.exit() if process.env.CI_PULL_REQUEST

if process.env.CIRCLE_TAG && "v#{pkg.version}" != process.env.CIRCLE_TAG
  console.log("Building tag #{process.env.CIRCLE_TAG}, but package version is #{pkg.version}")
  process.exit(1)

github = new GitHubApi({
  headers: {
    "user-agent": "Zotero-Better-BibTeX"
  },
  Promise: Bluebird,
  timeout: 5000
})

github.authenticate({ type: "token", token: process.env.GITHUB_TOKEN })
repo = { owner: 'retorquere', repo: 'zotero-better-bibtex' }

do Bluebird.coroutine(->
  console.log('finding releases')
  release = {
    static: 'static-files',
    current: "v#{pkg.version}",
    builds: 'builds',
  }

  for id, tag of release
    try
      release[id] = yield github.repos.getReleaseByTag(Object.assign({ tag: tag }, repo))
      console.log("#{tag} found")

  xpi = "zotero-better-bibtex-#{version}.xpi"

  if process.env.CIRCLE_TAG
    if release.current
      console.log("release #{process.env.CIRCLE_TAG} exists, bailing")
      process.exit(1)

    if !release.static
      console.log("release 'static-files' does not exists, bailing")
      process.exit(1)


    # upload XPI
    release.current = yield github.repos.createRelease(Object.assign({ tag_name: process.env.CIRCLE_TAG }, repo))

    console.log("uploading #{xpi} to #{process.env.CIRCLE_TAG}")
    # application/x-xpinstall
    yield github.repos.uploadAsset(Object.assign({ id: release.current.data.id, name: xpi, filePath: path.join(__dirname, "../xpi/#{xpi}")}, repo))

    # update update.rdf
    assets = yield github.repos.getAssets(Object.assign({ id: release.static.data.id}, repo))
    update_rdf = assets.data.find((asset) -> asset.name == 'update.rdf')
    yield github.repos.deleteAsset(Object.assign({ id: update_rdf.id }, repo)) if update_rdf

    # 'application/rdf+xml'
    yield github.repos.uploadAsset(Object.assign({ id: release.static.data.id, name: 'update.rdf', filePath: path.join(__dirname, "../gen/update.rdf")}, repo))

  else
    if !release.builds
      console.log('no release for builds')
      process.exit(1)

    assets = yield github.repos.getAssets(Object.assign({ id: release.builds.data.id}, repo))
    assets.data.sort((a, b) -> (new Date(b.created_at)).getTime() - (new Date(a.created_at)).getTime())
    for asset, i in assets.data
      continue if i < 10 && asset.name != xpi
      yield github.repos.deleteAsset(Object.assign({ id: asset.id }, repo))

    console.log("uploading #{xpi} to builds")
    # application/x-xpinstall
    yield github.repos.uploadAsset(Object.assign({ id: release.builds.data.id, name: xpi, filePath: path.join(__dirname, "../xpi/#{xpi}")}, repo))

  return
)
