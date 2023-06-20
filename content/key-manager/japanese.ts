/* eslint-disable @typescript-eslint/no-unsafe-return */
import Kuroshiro from 'kuroshiro'
import NodeDictionaryLoader from 'kuromoji/src/loader/NodeDictionaryLoader'
import { log } from '../logger'
import { Preference } from '../prefs'
import KuromojiAnalyzer from 'kuroshiro-analyzer-kuromoji'
import { Events } from '../events'
import { client } from '../client'

if (client !== 'node') {
  NodeDictionaryLoader.prototype.loadArrayBuffer = function(url, callback) { // eslint-disable-line prefer-arrow/prefer-arrow-functions
    url = `chrome://zotero-better-bibtex/content/resource/kuromoji/${url.replace(/.*[\\/]/, '').replace(/\.gz$/, '')}`
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
}

export const kuroshiro = new class {
  public enabled = false
  private kuroshiro: any
  private kuromoji: any

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
      const analyzer = new KuromojiAnalyzer(client === 'node' ? undefined : 'chrome://zotero-better-bibtex/content/resource/kuromoji')
      await this.kuroshiro.init(analyzer)
      this.kuromoji = analyzer._analyzer // eslint-disable-line no-underscore-dangle
      this.enabled = true
    }
    catch (err) {
      log.error('kuroshiro: initializing failed', err)
      throw err
    }
  }

  public convert(str: string, options: any): string {
    if (!this.enabled) throw new Error('kuroshiro not initialized')
    if (this.hasJapanese(str)) return this.kuroshiro.convert(str, options)
    return str
  }

  public tokenize(str: string): string[] {
    if (!this.enabled) throw new Error('kuroshiro not initialized')
    return this.kuromoji.tokenize(str).map(c => c.surface_form)
  }

  public hasJapanese(str: string): boolean {
    if (!this.enabled) throw new Error('kuroshiro not initialized')
    return str && Kuroshiro.Util.hasJapanese(str)
  }
}
