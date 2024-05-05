import rescape from '@stdlib/utils-escape-regexp-string'

const entity: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
}
export function html(str: string): string {
  // return str.replace(/[\u00A0-\u9999<>\&]/gim, c => entity[c] || `&#${c.charCodeAt(0)};`)
  return str.replace(/[<>&"']/g, (c: string) => entity[c] || `&#${c.charCodeAt(0)};`)
}

export function rtf(str: string): string {
  return str
    .replace(/([{}\\])/g, '\\$1')
    .replace(/\n/g, '\\par ')
}

export function regex(text: string): string {
  return rescape(text)
}
