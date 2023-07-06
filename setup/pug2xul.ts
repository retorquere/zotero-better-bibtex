#!/usr/bin/env npx ts-node

/* eslint-disable @typescript-eslint/no-unsafe-return, no-magic-numbers, no-console, @typescript-eslint/no-shadow, no-eval, @typescript-eslint/no-empty-function, id-blacklist */

import * as pug from 'pug'
import * as fs from 'fs'

const pugs = [
  'content/Preferences.pug',
  'content/zotero-preferences.pug',
  'content/ErrorReport.pug',
  'content/FirstRun.pug',
  'content/ServerURL.pug',
  'content/ZoteroPane.pug',
]

for (let src of pugs) {
  console.log(' ', src)
  const tgt = `build/${src.replace(/pug$/, 'xul')}`
  src = fs.readFileSync(src, 'utf-8')

  fs.writeFileSync(tgt, pug.render(src, { pretty: true }).replace(/&amp;/g, '&').trim())

  if (src.match(/\nwizard/)) {
    src = src
      .split('\n')
      .map(line => {
        if (line.startsWith('|')) {
          return line
        }
        else if (line.startsWith('wizard')) {
          return [
            'window(xmlns="http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul" xmlns:html="http://www.w3.org/1999/xhtml")',
            '  script(src="chrome://global/content/customElements.js")/',
            `  ${line.replace(/xmlns=['"]http:[/][/]www.mozilla.org.+?['"]\s*/, '')}`,
          ].join('\n')
        }
        else {
          return `  ${line}`
        }
      })
      .join('\n')

    fs.writeFileSync(tgt.replace('.', '-7.'), pug.render(src, { pretty: true }).replace(/&amp;/g, '&').trim())
  }
}
