import { Preference } from '../prefs'
import { Events } from '../events'

import type { splitName, jieba, pinyin } from './chinese-optional'

class Chinese {
  public jieba!: typeof jieba
  public pinyin!: typeof pinyin
  public splitName!: typeof splitName

  constructor() {
    // this should give jieba time to load the dicts
    this.load()
  }

  public get enabled(): Chinese | null {
    if (!Preference.chinese) return null
    this.load()
    return this
  }

  private load() {
    if (!this.jieba) {
      Services.scriptloader.loadSubScriptWithOptions('chrome://zotero-better-bibtex/content/key-manager/chinese-optional.js', {
        target: this,
        charset: 'utf-8',
        // ignoreCache: true,
      })
    }
  }

  init() {
    Events.on('preference-changed', ({ data: pref }) => {
      if (pref === 'chinese') this.load()
    })
  }
}

export const chinese = new Chinese
