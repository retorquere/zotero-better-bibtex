import { ITranslator } from '../../gen/translator'
declare const Translator: ITranslator

declare const Zotero: any

import { format } from '../../content/debug-formatter.ts'

export function debug(...msg) {
  if (!Translator.debugEnabled && !Translator.preferences.testing) return
  Zotero.debug(format(`better-bibtex:${Translator.header.label}`, msg))
}
