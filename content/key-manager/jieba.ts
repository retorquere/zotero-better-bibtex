declare const Zotero: any

import { init, cut } from '../../gen/jieba'
import { Preference } from '../../gen/preferences'
import { log } from '../logger'

function ignore() {} // eslint-disable-line @typescript-eslint/no-empty-function

export const jieba = new class {
  private dict: any

  init() {
    log.debug('Jieba enabled:', Preference.jieba)
    if (Preference.jieba && !this.dict) {
      this.dict = JSON.parse(Zotero.File.getContentsFromURL('resource://zotero-better-bibtex/jieba/dict.json'))
      log.debug('Jieba enabled:', Object.keys(this.dict).length, 'entries')
      init(this.dict)
    }
  }

  cut(input: string): string[] {
    if (Preference.jieba) {
      this.init()
    }
    else {
      throw new Error('Jieba not loaded')
    }
    return (cut([this.dict], input, ignore) as string[])
  }
}
