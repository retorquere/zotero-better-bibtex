#!/usr/bin/env npx ts-node

/* eslint-disable @typescript-eslint/no-unsafe-return, no-magic-numbers, no-console, @typescript-eslint/no-shadow, no-eval, @typescript-eslint/no-empty-function, id-blacklist */

import * as pug from 'pug'
import * as fs from 'fs'

const pugs = [
  'content/zotero-preferences.pug',
  'content/ErrorReport.pug',
  'content/FirstRun.pug',
]

for (const src of pugs) {
  console.log(' ', src)
  const xul = pug.renderFile(src, { pretty: true })
  fs.writeFileSync(`build/${src.replace(/pug$/, 'xul')}`, xul.replace(/&amp;/g, '&').trim())
}
