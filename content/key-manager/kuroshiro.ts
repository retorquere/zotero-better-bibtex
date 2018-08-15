declare const Components: any

import Kuroshiro from 'kuroshiro/src/core-sync'
import _kuromojiLoader = require('kuromoji/src/loader/NodeDictionaryLoader')
import * as log from '../debug'
import { Preferences as Prefs } from '../prefs'
import KuromojiAnalyzer from 'kuroshiro-analyzer-kuromoji/src/kuroshiro-analyzer-kuromoji-sync'

_kuromojiLoader.prototype.loadArrayBuffer = function(url, callback) { // tslint:disable-line:only-arrow-functions
  url = `resource://zotero-better-bibtex/kuromoji/${url.replace(/.*\//, '').replace(/\.gz$/, '')}`
  log.debug('kuromoji: loading', url)
  const xhr = Components.classes['@mozilla.org/xmlextras/xmlhttprequest;1'].createInstance()

  xhr.open('GET', url, true)
  xhr.responseType = 'arraybuffer'

  xhr.onload = function() {
    log.debug('kuromoji: loaded', url, this.status)
    const err = this.status > 0 && this.status !== 200 // tslint:disable-line:no-magic-numbers
    callback(err ? new Error(xhr.statusText) : null, err ? null : this.response)
  }

  xhr.onerror = function(err) { // tslint:disable-line:only-arrow-functions
    err = new Error(`could not load ${url}: ${err}`)
    log.error('kuromoji: load failed', url, err)
    callback(err, null)
  }

  xhr.send()
}

export let kuroshiro = new class {
  public enabled = false
  private kuroshiro: any

  public async init() {
    log.debug('kuroshiro: initializing...')

    if (!Prefs.get('kuroshiro')) {
      log.debug('kuroshiro: disabled')
      return
    }

    try {
      this.kuroshiro = new Kuroshiro()
      await this.kuroshiro.init(new KuromojiAnalyzer('resource://zotero-better-bibtex/kuromoji'))
    } catch (err) {
      log.error('kuroshiro: initializing failed')
      throw err
    }

    log.debug('kuroshiro: ready')
    this.enabled = true
  }

  public convert(str, options) {
    if (!this.enabled) throw new Error('kuroshoro not initialized')
    if (str && Kuroshoro.Util.hasJapanese(str)) return this.kuroshiro.convert(str, options)
    return str
  }
}
