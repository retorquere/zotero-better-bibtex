import fast_safe_stringify from 'fast-safe-stringify'
import { stringify as faster_safer_stringify } from '@ungap/structured-clone/json'

export function asciify(str: string): string {
  return str.replace(/[\u007F-\uFFFF]/g, chr => `\\u${(`0000${chr.charCodeAt(0).toString(16)}`).substr(-4)}`) // eslint-disable-line no-magic-numbers
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function stable_stringify(obj: any, replacer?: any, indent?: string | number, ucode?: boolean): string {
  const stringified: string = fast_safe_stringify.stable(obj, replacer, indent)

  return ucode ? asciify(stringified) : stringified
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function fast_stringify(obj: any, replacer?: any, indent?: string | number, ucode?: boolean): string {
  const stringified: string = faster_safer_stringify(obj, replacer, indent)

  return ucode ? asciify(stringified) : stringified
}
