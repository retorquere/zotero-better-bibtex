import safeStableStringify from 'safe-stable-stringify'

export function stringify(obj, replacer?, indent?) {
  return safeStableStringify(obj, replacer, indent).replace(/[\u007F-\uFFFF]/g, chr => '\\u' + ('0000' + chr.charCodeAt(0).toString(16)).substr(-4)) // tslint:disable-line:no-magic-numbers
}
