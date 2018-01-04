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
    compiler.plugin('emit', (compilation, done) => {
      const header = require(path.join(root, 'resource', this.translator + '.json'))
      header.lastUpdated = (new Date).toISOString().replace('T', ' ').replace(/\..*/, '')
      const preferences = require(path.join(root, 'gen/preferences.json'))
      const asset = this.translator + '.js'
      compilation.assets[asset] = new ConcatSource(
        ejs.render(
          fs.readFileSync(path.join(__dirname, 'translator-header.ejs'), 'utf8'),
          {preferences, header, version}
        ),
        compilation.assets[asset]
      )
      done()
    })
  }
}

export = TranslatorHeaderPlugin
