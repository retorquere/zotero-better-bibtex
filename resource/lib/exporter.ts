import { ITranslator } from '../../gen/translator'
declare const Translator: ITranslator

declare const Zotero: any

import JabRef = require('../bibtex/jabref.ts') // not so nice... BibTeX-specific code in general exporter lib
import debug = require('../lib/debug.ts')
debug('exporter: so far so good')

export = new class Exporter {
  public preamble: { DeclarePrefChars: string, noopsort?: boolean }
  public attachmentCounter = 0
  public caching: boolean
  public jabref: any
  public citekeys: any

  constructor() {
    this.preamble = {DeclarePrefChars: ''}

    this.caching = !Translator.options.exportFileData

    this.jabref = new JabRef()

    this.citekeys = {}
  }

  public unique_chars(str) {
    let uniq = ''
    for (const c of str) {
      if (uniq.indexOf(c) < 0) uniq += c
    }
    return uniq
  }

  public nextItem() {
    let item
    while (item = Zotero.nextItem()) {
      if (['note', 'attachment'].includes(item.itemType)) continue
      debug('fetched item:', item)

      if (!item.citekey) {
        debug(new Error('No citation key found in'), item)
        throw new Error(`No citation key in ${JSON.stringify(item)}`)
      }

      this.jabref.citekeys[item.itemID] = item.citekey

      const cached = Zotero.BetterBibTeX.cacheFetch(item.itemID, Translator.options)
      if (cached) {
        Zotero.write(cached.reference)
        if (cached.metadata && cached.metadata.DeclarePrefChars) this.preamble.DeclarePrefChars += cached.metadata.DeclarePrefChars
        continue
      }

      Zotero.BetterBibTeX.simplifyFields(item)
      Object.assign(item, Zotero.BetterBibTeX.extractFields(item))
      debug('exporting', item)

      return item
    }

    return null
  }

  // TODO: move to bibtex-exporters
  public complete() {
    debug('Exporter.complete: write JabRef groups')
    this.jabref.exportGroups()

    let preamble = []
    if (this.preamble.DeclarePrefChars) preamble.push("\\ifdefined\\DeclarePrefChars\\DeclarePrefChars{'’-}\\else\\fi")
    if (this.preamble.noopsort) preamble.push('\\newcommand{\\noopsort}[1]{}')
    if (preamble.length > 0) {
      preamble = preamble.map(cmd => `"${cmd} "`)
      Zotero.write(`@preamble{ ${preamble.join(' \n # ')} }\n`)
    }
  }
}
