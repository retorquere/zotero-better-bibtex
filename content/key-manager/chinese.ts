import { Preference } from '../prefs'
import { Events } from '../events'
import { log } from '../logger'

declare const ChromeUtils: any

if (typeof Services == 'undefined') {
  var { Services } = ChromeUtils.import('resource://gre/modules/Services.jsm') // eslint-disable-line no-var
}

import type { jieba as jiebaFunc, pinyin as pinyinFunc } from './chinese-optional'

export const chinese = new class {
  public window: Window
  public document: Document
  public console = log

  public jieba: typeof jiebaFunc
  public pinyin: typeof pinyinFunc

  public load(on: boolean) {
    if (on && !this.jieba) {
      // needed because jieba-js does environment detection
      this.window = this.window || Zotero.getMainWindow()
      this.document = this.document || this.window.document
      Services.scriptloader.loadSubScript('chrome://zotero-better-bibtex/content/key-manager/chinese.js', this)
    }
    return on
  }

  init() {
    Events.on('preference-changed', pref => {
      if (pref === 'jieba') this.load(Preference.jieba)
    })
  }
}
