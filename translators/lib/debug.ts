import { Translator } from './translator'

declare const Zotero: any

// import { format } from '../../content/debug-formatter'

export function debug(...msg) {
  // if (!Translator.debugEnabled && !Translator.preferences.testing) return
  // Zotero.debug(format(`better-bibtex:${Translator.header.label}`, msg))
  Zotero.BetterBibTeX.debug(Translator.header.label, ...msg)
}
