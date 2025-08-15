declare const Zotero: any

import { Collected } from './lib/collect'
import type { Header } from '../gen/translators'
declare var ZOTERO_TRANSLATOR_INFO: Header // eslint-disable-line no-var

const chunkSize = 0x100000

export function detectImport(): boolean {
  let str
  let json = ''
  while (str = Zotero.read(chunkSize)) {
    json += str
    if (json[0] !== '{') return false
  }

  let data
  try {
    data = JSON.parse(json)
  }
  catch {
    return false
  }

  if (!data.config || (data.config.id !== ZOTERO_TRANSLATOR_INFO.translatorID)) return false
  return true
}

export async function doImport(): Promise<void> {
  await Zotero.BetterBibTeX.importBBTJSON(new Collected(ZOTERO_TRANSLATOR_INFO, 'import'))
}

export function doExport(): void {
  const translation = Zotero.BetterBibTeX.generateBBTJSON(new Collected(ZOTERO_TRANSLATOR_INFO, 'export'))
  Zotero.write(translation.output.body)
}
