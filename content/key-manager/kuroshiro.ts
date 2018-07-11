declare const Zotero: any
declare const Components: any

import _kuroshiro = require('kuroshiro')
import _kuromojiLoader = require('kuromoji/src/loader/NodeDictionaryLoader')
import { debug } from '../debug'
import { Preferences as Prefs } from '../prefs'

_kuromojiLoader.prototype.loadArrayBuffer = function(url, callback) { // tslint:disable-line:only-arrow-functions
  url = url.replace(/^resource:\/\/?/, 'resource://') // kuromoji replaces the double-slash for some reason
  debug('kuromoji: loading', url)
  const xhr = Components.classes['@mozilla.org/xmlextras/xmlhttprequest;1'].createInstance()

  xhr.open('GET', url.replace(/\.gz$/, ''), true)
  xhr.responseType = 'arraybuffer'

  xhr.onload = function() {
    debug('kuromoji: loaded', url, this.status)
    const err = this.status > 0 && this.status !== 200 // tslint:disable-line:no-magic-numbers
    callback(err ? new Error(xhr.statusText) : null, err ? null : this.response)
  }

  xhr.onerror = function(err) { // tslint:disable-line:only-arrow-functions
    err = new Error(`could not load ${url}: ${err}`)
    debug('kuromoji: load failed', url, err)
    callback(err, null)
  }

  xhr.send()
}

export let kuroshiro = new class {
  public enabled = false

  public init() {
    debug('kuroshiro: initializing...')

    const deferred = Zotero.Promise.defer()

    if (!Prefs.get('kuroshiro')) {
      debug('kuroshiro: disabled')
      return deferred.resolve()
    }

    _kuroshiro.init({ dicPath: 'resource://zotero-better-bibtex/kuromoji' }, err => {
      if (err) {
        debug('kuroshiro: initializing failed')
        deferred.reject(err)
      } else {
        debug('kuroshiro: ready')
        this.enabled = true
        deferred.resolve()
      }
    })

    return deferred.promise
  }

  public convert(str, options) {
    if (!this.enabled) throw new Error('kuroshoro not initialized')
    if (!str) return str
    if (this.isJapanese(str)) return _kuroshiro.convert(str, options)
    return str
  }

  private isJapanese(str) {
    for (const c of str) {
      if (_kuroshiro.isKanji(c)) return true
      if (_kuroshiro.isHiragana(c)) return true
      if (_kuroshiro.isKatakana(c)) return true
    }
    return false
  }
}
