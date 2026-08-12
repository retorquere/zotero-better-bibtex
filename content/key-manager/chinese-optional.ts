import { pinyin as Pinyin } from 'pinyin'
import wasm from 'wasmjieba-web/wasmjieba-web_bg.wasm'
import { cut, initSync } from 'wasmjieba-web'
import { CjkName, splitName as $splitName } from 'spellnames'

initSync(wasm.bytes);
export function jieba(input: string): string[] {
  return cut(input, true).map(token => token.word.trim()).filter(String)
}
(wasm as any).bytes = null

export function pinyin(str: string): string {
  return Pinyin(str).join('')
}

export function splitName(name: string): CjkName {
  return $splitName(name, 'Chinese', pinyin)
}
