import * as fs from 'fs'
import * as path from 'path'
import * as ejs from 'ejs'
import { ConcatSource } from 'webpack-sources'

import version from 'zotero-plugin/version'
import root from 'zotero-plugin/root'

class TranslatorHeaderPlugin {
  private translator: string

  constructor(translator) {
    this.translator = translator
  }

  public apply(compiler) {
    compiler.hooks.emit.tap('TranslatorHeaderPlugin', compilation => {
      const header = require(path.join(root, 'translators', this.translator + '.json'))
      header.lastUpdated = (new Date).toISOString().replace('T', ' ').replace(/\..*/, '')
      const overrides = {}
      for (const [pref, meta] of Object.entries(require(path.join(root, 'gen/preferences.json')))) {
        overrides[pref] = (meta as any).ae_override
      }
      const asset = this.translator + '.js'
      compilation.assets[asset] = new ConcatSource(
        ejs.render(
          fs.readFileSync(path.join(__dirname, 'translator-header.ejs'), 'utf8'),
          {overrides, header, version}
        ),
        compilation.assets[asset]
      )
    })
  }
}

export = TranslatorHeaderPlugin
