import _stringify from 'fast-safe-stringify'

export function stringify(obj, replacer?, indent?, ucode?) {
  const stringified = _stringify(obj, replacer, indent)

  return ucode ? stringified.replace(/[\u007F-\uFFFF]/g, chr => '\\u' + ('0000' + chr.charCodeAt(0).toString(16)).substr(-4)) : stringified // tslint:disable-line:no-magic-numbers
}
