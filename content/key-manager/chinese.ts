import { Preference } from '../prefs'
import { Events } from '../events'

import Pinyin from 'pinyin'
import createJieba from 'js-jieba'
import * as cn from 'jieba-zh-cn'
import * as tw from 'jieba-zh-tw'

export const jieba = new class {
  private cn: any
  private tw: any

  init() {
    this.load()
    Events.on('preference-changed', pref => {
      if (pref === 'jieba') this.load()
    })
  }

  private load() {
    if (Preference.jieba && !this.cn) {
      this.cn = createJieba(
        cn.JiebaDict,
        cn.HMMModel,
        cn.UserDict,
        cn.IDF,
        cn.StopWords
      )
      this.tw = createJieba(
        tw.JiebaDict,
        tw.HMMModel,
        tw.UserDict,
        tw.IDF,
        tw.StopWords
      )
    }
  }

  public cut(input: string, mode: 'cn' | 'tw' ='cn'): string[] {
    if (Preference.jieba) {
      this.load()
    }
    else {
      throw new Error('jieba not loaded')
    }
    return (this[mode].cut(input, true).filter((w: string) => w.trim()) as string[])
  }
}

export function pinyin(str: string): string {
  return Pinyin(str).map((c: string[]) => c.join('')).join('')
}
