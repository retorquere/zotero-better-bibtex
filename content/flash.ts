declare const Zotero: any

const debug = require('./debug.ts')

const seconds = 1000

export = (title, body, timeout = 8) => {
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
