// tslint:disable:no-console

const parser = require('../content/keymanager/formatter.pegjs')

for (const pattern of ['pre:[>0][zotero:fold]:post[Title]', '[auth][year]']) {
  console.log(pattern)
  console.log(parser.parse(pattern, { methods: { zotero: true, auth: true, year: true }, filters: { fold: true } }))
}
