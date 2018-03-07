// tslint:disable:no-console

const parser = require('../content/key-manager/formatter.pegjs')

const patterns = [
  'pre:[>0][zotero:fold]:post[Title]',
  '[auth][year]',
  '[auth][Title:fold]',
  '[auth][Title:fold,german]',
]

for (const pattern of patterns) {
  console.log(pattern)
  console.log(parser.parse(pattern, { $zotero: true, $auth: true, $year: true, _fold: true }))
}
