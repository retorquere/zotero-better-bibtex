declare const Translator: any
declare const Zotero: any

import format = require('../../content/debug-formatter.ts')

export = (...msg) => {
  if (!Translator.debugEnabled && !Translator.preferences.testing) return
  Zotero.debug(format(`better-bibtex:${Translator.header.label}`, msg))
}
