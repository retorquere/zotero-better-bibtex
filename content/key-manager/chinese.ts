import { Preference } from '../prefs'
import { Events } from '../events'

declare const ChromeUtils: any

if (typeof Services == 'undefined') {
  var { Services } = ChromeUtils.import('resource://gre/modules/Services.jsm') // eslint-disable-line no-var
}

import type { jieba as jiebaFunc, pinyin as pinyinFunc } from './chinese-optional'

export const chinese = new class {
  public jieba: typeof jiebaFunc
  public pinyin: typeof pinyinFunc

  public load(on: boolean) {
    if (on && !this.jieba) Services.scriptloader.loadSubScript('resource://zotero-better-bibtex/key-manager/chinese.js', this)
    return on
  }

  init() {
    Events.on('preference-changed', pref => {
      if (pref === 'jieba') this.load(Preference.jieba)
    })
  }
}
