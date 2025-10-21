import { log } from './logger.js'

const seconds = 1000

export function flash(title: string, body?: string, timeout = 8): void {
  try {
    log.info(`{better-bibtex} flash: ${ JSON.stringify({ title, body }) }`)
    const pw = (new Zotero.ProgressWindow)
    pw.changeHeadline(`Better BibTeX: ${ title }`)
    if (!body) body = title
    if (Array.isArray(body)) body = body.join('\n')
    pw.addDescription(body)
    pw.show()
    pw.startCloseTimer(timeout * seconds)
  }
  catch (err) {
    log.info(`{better-bibtex} flash: ${ JSON.stringify({ title, body, err: `${ err }` }) }`)
  }
}
