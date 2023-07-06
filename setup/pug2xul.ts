#!/usr/bin/env npx ts-node

/* eslint-disable @typescript-eslint/no-unsafe-return, no-magic-numbers, no-console, @typescript-eslint/no-shadow, no-eval, @typescript-eslint/no-empty-function, id-blacklist */

import * as pug from 'pug'
import * as fs from 'fs'

const options = {
  pretty: true,
}

const xul = pug.renderFile('content/zotero-preferences.pug', options)
fs.writeFileSync('build/content/zotero-preferences.xul', xul.replace(/&amp;/g, '&').trim())
