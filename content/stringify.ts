// import _stringify from 'fast-safe-stringify'
import _stringify from 'safe-stable-stringify'

export function asciify(str) {
  return str.replace(/[\u007F-\uFFFF]/g, chr => '\\u' + ('0000' + chr.charCodeAt(0).toString(16)).substr(-4)) // eslint-disable-line no-magic-numbers
}

export function stringify(obj, replacer?, indent?, ucode?) {
  const stringified = _stringify(obj, replacer, indent)

  return ucode ? asciify(stringified) : stringified
}
