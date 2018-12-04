import * as fs from 'fs'
import * as path from 'path'
import * as ejs from 'ejs'
import { ConcatSource } from 'webpack-sources'
import * as crypto from 'crypto'

import version from 'zotero-plugin/version'
import root from 'zotero-plugin/root'

import stringify = require('json-stable-stringify')

const prefs = {
  overrides: require(path.join(root, 'gen/preferences/auto-export-overrides.json')),
  defaults: require(path.join(root, 'gen/preferences/defaults.json')),
}

const translators = require(path.join(root, 'gen/translators.json'))

class TranslatorHeaderPlugin {
  private translator: string

  constructor(translator) {
    this.translator = translator
  }

  public apply(compiler) {
    compiler.hooks.emit.tap('TranslatorHeaderPlugin', compilation => {
      const asset = this.translator + '.js'

      const header = JSON.parse(JSON.stringify(translators.byName[this.translator]))
      const overrides = {}
      for (const pref of Object.keys(prefs.defaults)) {
        overrides[pref] = prefs.overrides.includes(pref)
      }

      const headerCode = ejs.render(
        fs.readFileSync(path.join(__dirname, 'translator-header.ejs'), 'utf8'),
        {overrides, header, version}
      )

      delete header.description
      header.configOptions = header.configOptions || {}
      header.configOptions.hash = crypto.createHash('md5').update(headerCode + compilation.assets[asset].source()).digest('hex')

      // because Zotero doesn't allow headers that have a object at the last key, so put lastUpdated at the end as a safeguard
      const header_order = [
        'translatorID',
        'translatorType',
        'label',
        'creator',
        'target',
        'minVersion',
        'maxVersion',
        'priority',
        'inRepository',
        'configOptions',
        'displayOptions',
        'exportCharset',
        'exportNotes',
        'exportFileData',
        'useJournalAbbreviation',
      ]
      const json_header = stringify(header, {
        space: 2,
        cmp: (a, b) => {
          // lastUpdated always at the end
          if (a.key === 'lastUpdated') return 1
          if (b.key === 'lastUpdated') return -1

          a.pos = (header_order.indexOf(a.key) + 1) || header_order.length + 1
          b.pos = (header_order.indexOf(b.key) + 1) || header_order.length + 1
          if (a.pos !== b.pos) return a.pos - b.pos
          return a.key.localeCompare(b.key) // can only happen if they're both not in the order
        },
      }) + '\n\n'

      compilation.assets[asset] = new ConcatSource(json_header + headerCode, compilation.assets[asset])
    })
  }
}

export = TranslatorHeaderPlugin
