import { Preference } from '../prefs'
import { Events } from '../events'
import { log } from '../logger'

import type { splitName, Jieba, loadJieba, pinyin } from './chinese-optional'

class Chinese {
  #loaded = false
  #loading = false
  public jieba!: Jieba
  public loadJieba!: typeof loadJieba
  public pinyin!: typeof pinyin
  public splitName!: typeof splitName

  constructor() {
    // this should give jieba time to preload the dicts
    this.load()
  }

  public get enabled(): Chinese | null {
    this.load()
    return this.#loaded && Preference.chinese ? this : null
  }

  private load(): void {
    if (!Preference.chinese || this.#loaded || this.#loading) return

    this.#loading = true
    try {
      Services.scriptloader.loadSubScriptWithOptions('chrome://zotero-better-bibtex/content/key-manager/chinese-optional.js', {
        target: this,
        charset: 'utf-8',
        // ignoreCache: true,
      })

      void this.loadJieba().then(() => {
        this.#loading = false
        this.#loaded = true
        if (this.jieba.error) log.error('jieba.cut failed to load:', this.jieba.error)
      }, err => {
        this.#loading = false
        log.error('jieba.cut failed to load:', err)
      })
    }
    catch (err) {
      this.#loading = false
      log.error('jieba.cut failed to load:', err)
    }
  }

  init() {
    Events.on('preference-changed', ({ data: pref }) => {
      if (pref === 'chinese') this.load()
    })
  }
}

export const chinese = new Chinese
