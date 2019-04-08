export function html(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export function rtf(str) {
  return str
    .replace(/([{}\\])/g, '\\$1')
    .replace(/\n/g, '\\par ')
}
