declare const Zotero: any

import { Logger } from './logger'

export function debug(...msg) {
  if (Zotero.Debug.enabled) Logger.log('better-bibtex', ...msg)
}

export function error(...msg) {
  Logger.error('better-bibtex', ...msg)
}
