// import _stringify from 'fast-safe-stringify'
import _stringify from 'safe-stable-stringify'

export function asciify(str: string): string {
  return str.replace(/[\u007F-\uFFFF]/g, chr => `\\u${(`0000${chr.charCodeAt(0).toString(16)}`).substr(-4)}`) // eslint-disable-line no-magic-numbers
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function stringify(obj: any, replacer?: any, indent?: string | number, ucode?: boolean): string {
  const stringified = _stringify(obj, replacer, indent)

  return ucode ? asciify(stringified) : stringified
}
