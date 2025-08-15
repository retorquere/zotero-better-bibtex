import { Collected } from './lib/collect'
import type { Header } from '../gen/translators'
import { detectImport as zotero_detectImport } from '../gen/ZoteroBibTeX.mjs'

declare const Zotero: any
declare var ZOTERO_TRANSLATOR_INFO: Header // eslint-disable-line no-var

export function doExport(): void {
  const translation = Zotero.BetterBibTeX.generateBibTeX(new Collected(ZOTERO_TRANSLATOR_INFO, 'export'))
  translation.saveAttachments()
  Zotero.write(translation.output.body)
}

export function detectImport(): boolean {
  return Zotero.BetterBibTeX && Zotero.getHiddenPref('better-bibtex.import') && zotero_detectImport() as boolean
}

export async function doImport(): Promise<void> {
  await Zotero.BetterBibTeX.importBibTeX(new Collected(ZOTERO_TRANSLATOR_INFO, 'import'))
}
