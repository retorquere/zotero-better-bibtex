import { Preference } from '../prefs'
import { Events } from '../events'

import Pinyin from 'pinyin'
import createJieba from 'js-jieba'
import * as cn from 'jieba-zh-cn'
// import * as tw from 'jieba-zh-tw'

/*
const cnjieba = createJieba(
  cn.JiebaDict,
  cn.HMMModel,
  cn.UserDict,
  cn.IDF,
  cn.StopWords
)
const twjieba = createJieba(
  tw.JiebaDict,
  tw.HMMModel,
  tw.UserDict,
  tw.IDF,
  tw.StopWords
)
*/

export const jieba = new class {
  private jieba: any

  init() {
    this.load()
    Events.on('preference-changed', pref => {
      if (pref === 'jieba') this.load()
    })
  }

  private load() {
    if (Preference.jieba && !this.jieba) {
      this.jieba = createJieba(
        cn.JiebaDict,
        cn.HMMModel,
        cn.UserDict,
        cn.IDF,
        cn.StopWords
      )
    }
  }

  public cut(input: string): string[] {
    if (Preference.jieba) {
      this.load()
    }
    else {
      throw new Error('jieba not loaded')
    }
    return (this.jieba.cut(input, true).filter((w: string) => w.trim()) as string[])
  }
}

export function pinyin(str: string): string {
  return (Pinyin(str) as string[][]).map((c: string[]) => c.join('')).join('')
}
