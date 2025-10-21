import { Preference } from '../prefs.js'
import { Events } from '../events.js'
// import { discard } from '../logger'

import type { splitName as splitNameFunc, jieba as jiebaFunc, pinyin as pinyinFunc } from './chinese-optional.js'

// Replace the console object with the empty shim
export const chinese = new class {
  // public window: Window
  // public document: Document
  // public console = discard

  public jieba: typeof jiebaFunc
  public pinyin: typeof pinyinFunc
  public splitName: typeof splitNameFunc

  constructor() {
    // this should give jieba time to load the dicts
    this.load()
  }

  public get enabled(): this {
    if (!Preference.chinese) return null
    this.load()
    return this
  }

  public get loaded(): this {
    return this.enabled
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
    Events.on('preference-changed', pref => {
      if (pref === 'chinese') this.load()
    })
  }
}
