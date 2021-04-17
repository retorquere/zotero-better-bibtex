/* eslint-disable @typescript-eslint/no-unsafe-return */
import Kuroshiro from 'kuroshiro'
import NodeDictionaryLoader from 'kuromoji/src/loader/NodeDictionaryLoader'
import { log } from '../logger'
import { Preference } from '../../gen/preferences'
import KuromojiAnalyzer from 'kuroshiro-analyzer-kuromoji'
import { Events } from '../events'

NodeDictionaryLoader.prototype.loadArrayBuffer = function(url, callback) { // eslint-disable-line prefer-arrow/prefer-arrow-functions
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
    Events.on('preference-changed', pref => {
      if (pref === 'kuroshiro') this.load().catch(err => log.error('kuroshiro load failed:', err))
    })
    await this.load()
  }

  private async load() {
    try {
      if (!Preference.kuroshiro || this.enabled) return

      this.kuroshiro = new Kuroshiro()
      await this.kuroshiro.init(new KuromojiAnalyzer('resource://zotero-better-bibtex/kuromoji'))
      this.enabled = true
    }
    catch (err) {
      log.error('kuroshiro: initializing failed', err)
      throw err
    }
  }

  public convert(str: string, options): string {
    if (!this.enabled) throw new Error('kuroshiro not initialized')
    if (str && Kuroshiro.Util.hasJapanese(str)) return this.kuroshiro.convert(str, options)
    return str
  }
}
