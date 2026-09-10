import { pinyin as Pinyin } from 'pinyin'
import init, { cut } from 'wasmjieba-web'
import { CjkName, splitName as $splitName } from 'spellnames'

export type Jieba = {
  error?: string
  cut?: (str: string) => string[]
}
export const jieba: Jieba = {}

export async function loadJieba(): Promise<void> {
  try {
    await init({ module_or_path: 'chrome://zotero-better-bibtex/content/resource/jieba/wasmjieba-web_bg.wasm' })
    jieba.cut = (input: string) => cut(input, true).map(token => token.word.trim()).filter(String)
  }
  catch (err) {
    jieba.error = `jieba.cut failed to load: ${(err as any).message}`
    jieba.cut = undefined
  }
}

export function pinyin(str: string): string {
  return Pinyin(str).join('')
}

export function splitName(name: string): CjkName {
  return $splitName(name, 'Chinese', pinyin)
}
