import { Preference } from '../prefs'
import { Events } from '../events'
import { log } from '../logger'

import type { splitName, Jieba, pinyin } from './chinese-optional'

class Chinese {
  #loaded = false
  public jieba!: Jieba
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

  private load() {
    if (Preference.chinese && !this.#loaded) {
      this.#loaded = true
      Services.scriptloader.loadSubScriptWithOptions('chrome://zotero-better-bibtex/content/key-manager/chinese-optional.js', {
        target: this,
        charset: 'utf-8',
        // ignoreCache: true,
      })

      if (this.jieba.error) log.error('jieba.cut failed to load:', this.jieba.error)
    }
  }

  init() {
    Events.on('preference-changed', ({ data: pref }) => {
      if (pref === 'chinese') this.load()
    })
  }
}

export const chinese = new Chinese
