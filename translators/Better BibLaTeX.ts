declare const Zotero: any

import { print } from '../content/logger'
import { Translation, collect } from './lib/translator'
import type { Translators } from '../typings/translators.d.ts'
declare var ZOTERO_TRANSLATOR_INFO: Translators.Header // eslint-disable-line no-var

export function doExport(): void {
  const translation = Translation.Export(ZOTERO_TRANSLATOR_INFO, collect())
  Zotero.BetterBibTeX.generateBibLaTeX(translation)
  translation.saveAttachments()
  Zotero.write(translation.output.body)
  translation.erase()
}
