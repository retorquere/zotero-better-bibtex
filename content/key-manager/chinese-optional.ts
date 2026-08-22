import { pinyin as Pinyin } from 'pinyin'
import wasm from 'wasmjieba-web/wasmjieba-web_bg.wasm'
import { cut, initSync } from 'wasmjieba-web'
import { CjkName, splitName as $splitName } from 'spellnames'

function $cut(input: string): string[] {
  return cut(input, true).map(token => token.word.trim()).filter(String)
}

export type Jieba = {
  error: string
  cut?: typeof $cut
}
export const jieba: Jieba = {
  error: '',
  cut: $cut,
}
try {
  initSync(wasm.bytes!)
}
catch (err) {
  jieba.error = (err as any).message
  jieba.cut = undefined
}
wasm.bytes = undefined

export function pinyin(str: string): string {
  return Pinyin(str).join('')
}

export function splitName(name: string): CjkName {
  return $splitName(name, 'Chinese', pinyin)
}

export const loaded = true
