import { Preference } from '../prefs'
import { Events } from '../events'
// import { CJK } from '../text'
import { discard } from '../logger'

declare const ChromeUtils: any

if (typeof Services == 'undefined') {
  var { Services } = ChromeUtils.import('resource://gre/modules/Services.jsm') // eslint-disable-line no-var
}

import type { jieba as jiebaFunc, pinyin as pinyinFunc } from './chinese-optional'

// Replace the console object with the empty shim
export const chinese = new class {
  public window: Window
  public document: Document
  public console = discard

  public jieba: typeof jiebaFunc
  public pinyin: typeof pinyinFunc

  constructor() {
    // this should give jieba time to load the dicts
    this.load(Preference.jieba)
  }

  public load(on: boolean) {
    if (on && !this.jieba) {
      // needed because jieba-js does environment detection
      this.window = this.window || Zotero.getMainWindow()
      this.document = this.document || this.window?.document
      if (this.window) {
        Services.scriptloader.loadSubScriptWithOptions('chrome://zotero-better-bibtex/content/key-manager/chinese-optional.js', {
          target: this,
          charset: 'utf-8',
          // ignoreCache: true,
        })
      }
    }
    return on
  }

  init() {
    Events.on('preference-changed', pref => {
      if (pref === 'jieba') this.load(Preference.jieba)
    })
  }
}
