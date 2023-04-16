import Pinyin from 'pinyin'
import createJieba from 'js-jieba'
import * as cn from 'jieba-zh-cn'
import * as tw from 'jieba-zh-tw'

const cutter = {
  cn: createJieba(cn.JiebaDict, cn.HMMModel, cn.UserDict, cn.IDF, cn.StopWords),
  tw: createJieba(tw.JiebaDict, tw.HMMModel, tw.UserDict, tw.IDF, tw.StopWords),
}

export function jieba(input: string, mode: 'cn' | 'tw' = 'cn'): string[] {
  return cutter[mode].cut(input, true).filter((w: string) => w.trim())
}

export function pinyin(str: string): string {
  return Pinyin(str).map((c: string[]) => c[0]).join('')
}
