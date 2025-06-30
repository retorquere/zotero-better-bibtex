declare const Zotero: any

import { Collected } from './lib/collect'
import type { Header } from '../gen/translators'
declare var ZOTERO_TRANSLATOR_INFO: Header // eslint-disable-line no-var

export function doExport(): void {
  const translation = Zotero.BetterBibTeX.generateBibLaTeX(new Collected(ZOTERO_TRANSLATOR_INFO, 'export'))
  translation.saveAttachments()
  Zotero.write(translation.output.body)
}
