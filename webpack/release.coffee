require('dotenv').config()
pkg = require('../package.json')
_ = require('lodash')
xml = require('xml')

Bluebird = require('bluebird')
request = require('request-promise')

if process.env.CI_PULL_REQUEST || !process.env.CIRCLE_TAG
  process.exit()

if "v#{pkg.version}" != process.env.CIRCLE_TAG
  console.log("Building tag #{process.env.CIRCLE_TAG}, but package version is #{pkg.version}")
  process.exit(1)

base = {
  # uri: 'https://api.github.com/user/repos',
  # qs: { access_token: 'xxxxx xxxxx' # -> uri + '?access_token=xxxxx%20xxxxx' },
  headers: {
    Authorization: "token #{process.env.GITHUB_TOKEN}",
    'User-Agent': 'Better BibTeX release script',
  },
  json: true # Automatically parses the JSON string in the response 
}

do Bluebird.coroutine(->
  statics = yield request(_.merge({}, base, {
    uri: "https://api.github.com/repos/retorquere/zotero-better-bibtex/releases/tags/static-files"
  }))
  upload_url = statics.upload_url.replace(/{.*/, '')

  assets = yield request(_.merge({}, base, {
    uri: statics.assets_url
  }))

  update_rdf = assets.find((asset) -> asset.name == 'update.rdf')
  if update_rdf && false
    yield request(_.merge({}, base, {
      method: 'DELETE'
      uri: "https://api.github.com/repos/retorquere/zotero-better-bibtex/releases/assets/#{update_rdf.id}"
    }))
  yield request(_.merge({}, base, {
    method: 'POST',
    uri: upload_url
    headers: { 'Content-Type': 'application/rdf+xml' },
    qs: { name: 'update.rdf' },
    body:
  }))
    

#  octo = new Octokat({token: process.env.GITHUB_TOKEN})
#
#  repo = octo.repos('retorquere', 'zotero-better-bibtex')
#  releases = yield repo.releases.fetchAll()
#  release = {}
#  for rel in releases
#    release.static = rel if rel.tagName == 'static-files'
#    release.current = rel if rel.tagName == process.env.CIRCLE_TAG
#
#  if !release.static
#    console.log('no release for static files')
#    process.exit(1)
#  if release.current
#    console.log("release #{process.env.CIRCLE_TAG} exists, bailing")
#    process.exit(1)
#
#  yield release.static.remove('update.rdf') if exists
#  yield release.static.upload('update.rdf', 'application/rdf+xml', contents_of_rdf)
#
#  yield release.bbt.upload(xpi, 'application/x-xpinstall', contents_of_xpi)
)
