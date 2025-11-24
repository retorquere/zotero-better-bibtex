import { Collected } from './lib/collect'
import type { Header } from '../gen/translators'
declare var ZOTERO_TRANSLATOR_INFO: Header // eslint-disable-line no-var

export function doExport(): void {
  const translation = Zotero.BetterBibTeX.generateCSLJSON(new Collected(ZOTERO_TRANSLATOR_INFO, 'export'))
  Zotero.write(translation.output.body)
}
