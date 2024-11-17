import { Collected } from './lib/collect'
import type { Translators } from '../typings/translators.d.ts'
declare var ZOTERO_TRANSLATOR_INFO: Translators.Header // eslint-disable-line no-var

export function doExport(): void {
  const translation = Zotero.BetterBibTeX.generateCSLJSON(new Collected(ZOTERO_TRANSLATOR_INFO, 'export'))
  Zotero.write(translation.output.body)
}
