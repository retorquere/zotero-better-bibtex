import { Formatter } from '../content/key-manager/formatter'
import { kuroshiro } from '../content/key-manager/kuroshiro'
import { jieba } from '../content/key-manager/jieba'
import KuromojiAnalyzer from 'kuroshiro-analyzer-kuromoji'

export async function init(): Promise<void> {
  await kuroshiro.init()
  jieba.init()
  new KuromojiAnalyzer
  Formatter.update('init')
  Formatter.format(Zotero.items[0])
}

init()
