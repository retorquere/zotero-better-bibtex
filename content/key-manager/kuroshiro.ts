declare const Components: any

import _kuroshiro = require('kuroshiro')
import _kuromojiLoader = require('kuromoji/src/loader/NodeDictionaryLoader')
import { debug } from '../debug.ts'

_kuromojiLoader.prototype.loadArrayBuffer = function(url, callback) { // tslint:disable-line:only-arrow-functions
  url = url.replace(/^resource:\/\/?/, 'resource://') // kuromoji replaces the double-slash for some reason
  debug('kuromoji: loading', url)
  const xhr = Components.classes['@mozilla.org/xmlextras/xmlhttprequest;1'].createInstance()

  xhr.open('GET', url.replace(/\.gz$/, ''), true)
  xhr.responseType = 'arraybuffer'

  xhr.onload = function() {
    debug('kuromoji: loaded', url, this.status)
    const err = this.status > 0 && this.status !== 200 // tslint:disable-line:no-magic-numbers
    callback(err ? xhr.statusText : null, err ? null : this.response)
  }

  xhr.onerror = function(err) { // tslint:disable-line:only-arrow-functions
    err = new Error(`could not load ${url}: ${err}`)
    debug('kuromoji: load failed', url, err)
    callback(err, null)
  }

  xhr.send()
}

export let kuroshiro = new class {
  private initialized = false

  public init() {
    debug('kuroshiri: initializing...')
    return new Promise((resolve, reject) => {
      _kuroshiro.init({ dicPath: 'resource://zotero-better-bibtex/kuromoji' }, err => {
        if (err) {
          debug('kuroshiri: initializing failed')
          reject(err)
        } else {
          debug('kuroshiri: ready')
          this.initialized = true
          resolve()
        }
      })
    })
  }

  public convert(str, options) {
    if (!this.initialized) throw new Error('kuroshori not initialized')
    return _kuroshiro.convert(str, options)
  }
}
