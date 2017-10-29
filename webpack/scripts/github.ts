import requestAsync = require('request-promise')
import uriTemplate = require('uri-templates')
import _ = require('lodash')
import fs = require('fs')

interface IRequest {
  uri: string
  json?: boolean
  headers?: { 'User-Agent': string, 'Content-Type': string, Authorization: string }
  body?: any
  method?: string
}
export async function request(req: IRequest) {
  req = _.merge({
    json: true,
    headers: {
      'User-Agent': 'Zotero Better BibTeX',
      Authorization: `token ${process.env.GITHUB_TOKEN}`,
    },
  }, req)
  req.uri = `https://api.github.com/repos/retorquere/zotero-better-bibtex${req.uri}`

  return await requestAsync(req)
}

interface IUploadOptions {
  release: any,
  name: string
  body?: string | Buffer,
  contentType: string
  path?: string
}
export async function upload(options: IUploadOptions) {
  if (options.path) options.body = fs.readFileSync(options.path)

  await requestAsync({
    uri: uriTemplate(options.release.upload_url).fill({name: options.name}),
    body: options.body,
    headers: {
      'User-Agent': 'Zotero Better BibTeX',
      'Content-Type': options.contentType,
      Authorization: `token ${process.env.GITHUB_TOKEN}`,
    },
  })
}
