require('dotenv').config()
pkg = require('../package.json')

Bluebird = require('bluebird')
Octokat = require('octokat')

if process.env.CI_PULL_REQUEST || !process.env.CIRCLE_TAG
  process.exit()

if pkg.version != process.env.CIRCLE_TAG
  console.log("Building tag #{process.env.CIRCLE_TAG}, but package version is #{pkg.version}")
  process.exit(1)

Bluebird.coroutine(->
  octo = new Octokat({token: process.env.GITHUB_TOKEN})

  repo = octo.repos('retorquere', 'zotero-better-bibtex')
  releases = yield repo.releases.fetchAll()
  release = {}
  for rel in releases
    release.static = rel if rel.tagName == 'static-files'
    release.current = rel if rel.tagName == process.env.CIRCLE_TAG

  if !release.static
    console.log('no release for static files')
    process.exit(1)
  if release.current
    console.log("release #{process.env.CIRCLE_TAG} exists, bailing")
    process.exit(1)

  yield release.static.remove('update.rdf') if exists
  yield release.static.upload('update.rdf', 'application/rdf+xml', contents_of_rdf)

  yield release.bbt.upload(xpi, 'application/x-xpinstall', contents_of_xpi)
)()
