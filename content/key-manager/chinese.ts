import { Preference } from '../prefs'
import { Events } from '../events'
import { log } from '../logger'
import { CJK } from '../text'

declare const ChromeUtils: any

if (typeof Services == 'undefined') {
  var { Services } = ChromeUtils.import('resource://gre/modules/Services.jsm') // eslint-disable-line no-var
}

import type { jieba as jiebaFunc, pinyin as pinyinFunc } from './chinese-optional'
const surnames = require('./chinese-surnames.json')

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
      Services.scriptloader.loadSubScriptWithOptions('chrome://zotero-better-bibtex/content/key-manager/chinese-optional.js', {
        target: this,
        charset: 'utf-8',
        // ignoreCache: true,
      })
    }
    return on
  }

  // eslint-disable-next-line @typescript-eslint/array-type
  public familyName(name: string, lang: 'zh-hans' | 'zh-hant', tables: Array<'compound' | 'single' | 'common'> = ['compound', 'single', 'common']): string {
    if (!this.load(Preference.jieba) || !name.match(CJK) || !tables.length) return name

    const candidates: ['compound' | 'single' | 'common', number][] = [
      ['compound', 2],
      ['compound', 3],
      ['single', 1],
      ['single', 2],
      ['common', 1],
      ['common', 2],
    ]

    let familyname = ''
    for (const [table, length] of candidates) {
      if (!tables.includes(table)) continue
      if (surnames[lang][table].includes(familyname = name.substr(0, length))) return familyname
    }
    return name
  }

  init() {
    Events.on('preference-changed', pref => {
      if (pref === 'jieba') this.load(Preference.jieba)
    })
  }
}
