declare const Zotero: any

import { debug } from './debug.ts'

const seconds = 1000

export function flash(title, body = null, timeout = 8) {
  try {
    debug('flash:', {title, body})
    const pw = new Zotero.ProgressWindow()
    pw.changeHeadline(`Better BibTeX: ${title}`)
    if (!body) body = title
    if (Array.isArray(body)) body = body.join('\n')
    pw.addDescription(body)
    pw.show()
    pw.startCloseTimer(timeout * seconds)
  } catch (err) {
    debug('@flash failed:', {title, body}, err)
  }
}
