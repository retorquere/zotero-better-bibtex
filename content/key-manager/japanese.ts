/* eslint-disable @typescript-eslint/no-unsafe-return */
import Kuroshiro from 'kuroshiro'
import NodeDictionaryLoader from 'kuromoji/src/loader/NodeDictionaryLoader'
import { log } from '../logger'
import { Preference } from '../prefs'
import KuromojiAnalyzer from 'kuroshiro-analyzer-kuromoji'
import { Events } from '../events'
import * as client from '../client'

async function fetchArrayBuffer(url): Promise<ArrayBuffer> {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`kuroshiro: loading ${ url } failed: status = ${ response.status }`)
  return await response.arrayBuffer()
}
if (client.slug !== 'node') {
  NodeDictionaryLoader.prototype.loadArrayBuffer = function(url, callback) {
    url = `chrome://zotero-better-bibtex/content/resource/kuromoji/${ url.replace(/.*[\\/]/, '').replace(/\.gz$/, '') }`
    fetchArrayBuffer(url)
      .then(arrayBuffer => {
        callback(null, arrayBuffer)
      })
      .catch(err => {
        log.error(`kuroshiro: loading ${ url } failed: ${ err }`)
        callback(err, null)
      })
  }
}

export const japanese = new class {
  public enabled: typeof this = null
  private kuroshiro: any
  private kuromoji: any

  public async init() {
    Events.on('preference-changed', async pref => {
      if (pref === 'japanese') {
        this.enabled = null
        await this.load()
        if (Preference.japanese) this.enabled = this
      }
    })
    await this.load()
  }

  private async load() {
    try {
      if (!Preference.japanese) {
        this.enabled = null
      }
      else {
        if (!this.kuroshiro) {
          this.kuroshiro = new Kuroshiro
          const analyzer = new KuromojiAnalyzer(client.slug === 'node' ? undefined : 'chrome://zotero-better-bibtex/content/resource/kuromoji')
          await this.kuroshiro.init(analyzer)
          this.kuromoji = analyzer._analyzer // eslint-disable-line no-underscore-dangle
        }
        this.enabled = this
      }
    }
    catch (err) {
      this.enabled = null
      this.kuroshiro = null
      log.error(`kuroshiro: initializing failed ${ await err }`)
      throw await err
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
