declare const Zotero: any

import { log } from './logger'

const seconds = 1000

export function flash(title, body = null, timeout = 8) {
  try {
    log.debug('flash:', {title, body})
    const pw = new Zotero.ProgressWindow()
    pw.changeHeadline(`Better BibTeX: ${title}`)
    if (!body) body = title
    if (Array.isArray(body)) body = body.join('\n')
    pw.addDescription(body)
    pw.show()
    pw.startCloseTimer(timeout * seconds)
  } catch (err) {
    log.error('@flash failed:', {title, body}, err)
  }
}
