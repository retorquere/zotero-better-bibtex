/* eslint-disable @typescript-eslint/no-unsafe-return */
import Kuroshiro from 'kuroshiro/src/core-sync'
import _kuromojiLoader = require('kuromoji/src/loader/NodeDictionaryLoader')
import { log } from '../logger'
import { Preference } from '../../gen/preferences'
import KuromojiAnalyzer from 'kuroshiro-analyzer-kuromoji/src/kuroshiro-analyzer-kuromoji-sync'

_kuromojiLoader.prototype.loadArrayBuffer = function(url, callback) { // eslint-disable-line prefer-arrow/prefer-arrow-functions
  url = `resource://zotero-better-bibtex/kuromoji/${url.replace(/.*\//, '').replace(/\.gz$/, '')}`
  const xhr = new XMLHttpRequest()

  xhr.open('GET', url, true)
  xhr.responseType = 'arraybuffer'

  xhr.onload = function() {
    const err = this.status > 0 && this.status !== 200 // eslint-disable-line no-magic-numbers
    callback(err ? new Error(xhr.statusText) : null, err ? null : this.response)
  }

  xhr.onerror = function(pge) { // eslint-disable-line prefer-arrow/prefer-arrow-functions
    const err = new Error(`could not load ${url}: ${pge}`)
    log.error('kuromoji: load failed', url, err)
    callback(err, null)
  }

  xhr.send()
}

export const kuroshiro = new class {
  public enabled = false
  private kuroshiro: any

  public async init() {
    if (!Preference.kuroshiro) return

    try {
      this.kuroshiro = new Kuroshiro()
      await this.kuroshiro.init(new KuromojiAnalyzer('resource://zotero-better-bibtex/kuromoji'))
    }
    catch (err) {
      log.error('kuroshiro: initializing failed')
      throw err
    }

    this.enabled = true
  }

  public convert(str: string, options): string {
    if (!this.enabled) throw new Error('kuroshiro not initialized')
    if (str && Kuroshiro.Util.hasJapanese(str)) return this.kuroshiro.convert(str, options)
    return str
  }
}
