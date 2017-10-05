declare const Zotero: any

import format = require('./debug-formatter.ts')

export = function debug(...msg) {
  if (!Zotero.Debug.enabled) return
  Zotero.debug(format('better-bibtex', msg))
}
