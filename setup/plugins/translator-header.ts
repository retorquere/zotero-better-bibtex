import * as fs from 'fs'
import * as path from 'path'
import * as ejs from 'ejs'
import { ConcatSource } from 'webpack-sources'

import version from 'zotero-plugin/version'
import root from 'zotero-plugin/root'

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
      const header = translators.byName[this.translator]
      const overrides = {}
      for (const pref of Object.keys(prefs.defaults)) {
        overrides[pref] = prefs.overrides.includes(pref)
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
