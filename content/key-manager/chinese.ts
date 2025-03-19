import { Preference } from '../prefs'
import { Events } from '../events'
// import { discard } from '../logger'

import type { splitName as splitNameFunc, jieba as jiebaFunc, pinyin as pinyinFunc } from './chinese-optional'

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

  public get loaded(): this {
    this.load()
    return this.jieba ? this : null
  }

  private load(): void {
    if (!Preference.jieba || this.jieba) return

    // this.window = this.window || Zotero.getMainWindow()
    // this.document = this.document || this.window.document
    Services.scriptloader.loadSubScriptWithOptions('chrome://zotero-better-bibtex/content/key-manager/chinese-optional.js', {
      target: this,
      charset: 'utf-8',
      // ignoreCache: true,
    })
  }

  init() {
    Events.on('preference-changed', pref => {
      if (pref === 'jieba') this.load()
    })
  }
}
