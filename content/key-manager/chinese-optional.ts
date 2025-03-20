import Pinyin from 'pinyin'
import _wasm from 'wasmjieba-web/wasmjieba-web_bg.wasm'
import { cut, initSync } from 'wasmjieba-web'

const wasm = _wasm as unknown as { bytes: Uint8Array }
initSync(wasm.bytes)
wasm.bytes = null

export function jieba(input: string): string[] {
  return (cut(input, true) as string[]).filter(w => w.trim())
}

export function pinyin(str: string): string {
  return Pinyin(str).join('')
}
