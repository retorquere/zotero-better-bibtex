declare const Zotero: any

import { Collected, slurp } from './lib/collect'
import { Hayagriva } from './lib/hayagriva'
import { detectFormat } from './lib/yaml'
import type { Header } from '../gen/translators'
declare var ZOTERO_TRANSLATOR_INFO: Header // eslint-disable-line no-var

export function doExport(): void {
  const translation = Zotero.BetterBibTeX.generateHayagriva(new Collected(ZOTERO_TRANSLATOR_INFO, 'export'))
  Zotero.write(translation.output.body)
}

export function detectImport(): boolean {
  try {
    const parsed = Zotero.BetterBibTeX.parseYAML(slurp())
    return detectFormat(parsed) === 'hayagriva'
  }
  catch {
    return false
  }
}

export async function doImport(): Promise<void> {
  const parsed = Zotero.BetterBibTeX.parseYAML(slurp())
  if (detectFormat(parsed) !== 'hayagriva') {
    throw new Error('Input is not in Hayagriva format')
  }

  await Hayagriva.import(parsed)
}
