Bluebird = require('bluebird')
request = require('request-promise')
uriTemplate = require('uri-templates');
_ = require('lodash')
fs = require('fs')

github = Bluebird.coroutine(function* (req) {
  if (typeof req == 'string') req = { uri: req }
  req = _.merge({
    json: true,
    headers: {
      'User-Agent': 'Zotero Better BibTeX',
      Authorization: `token ${process.env.GITHUB_TOKEN}`
    }
  }, req);
  req.uri = `https://api.github.com/repos/retorquere/zotero-better-bibtex${req.uri}`

  return yield request(req)
})

github.upload = Bluebird.coroutine(function* (options) {
  if (options.path) options.body = fs.readFileSync(options.path);

  yield request({
    uri: uriTemplate(options.release.upload_url).fill({name: options.name}),
    body: options.body,
    headers: {
      'User-Agent': 'Zotero Better BibTeX',
      'Content-Type': options.content_type,
      Authorization: `token ${process.env.GITHUB_TOKEN}`
    }
  })
})

module.exports = github
