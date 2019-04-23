export function html(str) {
  const entity = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
  }
  // return str.replace(/[\u00A0-\u9999<>\&]/gim, c => entity[c] || `&#${c.charCodeAt(0)};`)
  return str.replace(/[<>\&"']/g, c => entity[c] || `&#${c.charCodeAt(0)};`)
}

export function rtf(str) {
  return str
    .replace(/([{}\\])/g, '\\$1')
    .replace(/\n/g, '\\par ')
}
