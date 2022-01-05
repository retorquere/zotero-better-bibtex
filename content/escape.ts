export function html(str: string): string {
  const entity = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
  }
  // return str.replace(/[\u00A0-\u9999<>\&]/gim, c => entity[c] || `&#${c.charCodeAt(0)};`)
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return str.replace(/[<>&"']/g, c => entity[c] || `&#${c.charCodeAt(0)};`)
}

export function rtf(str: string): string {
  return str
    .replace(/([{}\\])/g, '\\$1')
    .replace(/\n/g, '\\par ')
}
