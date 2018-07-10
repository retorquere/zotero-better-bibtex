declare const Zotero: any

import { Logger } from './logger.ts'

export function debug(...msg) {
  if (!Zotero.Debug.enabled) return
  Logger.log('better-bibtex', ...msg)
}
