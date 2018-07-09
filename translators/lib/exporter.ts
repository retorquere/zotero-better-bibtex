declare const Translator: ITranslator

declare const Zotero: any

import { JabRef } from '../bibtex/jabref.ts' // not so nice... BibTeX-specific code
import { debug } from '../lib/debug.ts'

// export singleton: https://k94n.com/es6-modules-single-instance-pattern
export let Exporter = new class { // tslint:disable-line:variable-name
  public preamble: { DeclarePrefChars: string, noopsort?: boolean }
  public attachmentCounter = 0
  public caching: boolean
  public jabref: JabRef

  constructor() {
    this.preamble = {DeclarePrefChars: ''}
    this.caching = !Translator.options.exportFileData
    this.jabref = new JabRef()
  }

  public unique_chars(str) {
    let uniq = ''
    for (const c of str) {
      if (uniq.indexOf(c) < 0) uniq += c
    }
    return uniq
  }

  public nextItem(): ISerializedItem {
    let item
    while (item = Zotero.nextItem()) {
      if (['note', 'attachment'].includes(item.itemType)) continue
      debug('fetched item:', item)

      if (!item.citekey) {
        debug(new Error('No citation key found in'), item)
        throw new Error(`No citation key in ${JSON.stringify(item)}`)
      }

      this.jabref.citekeys.set(item.itemID, item.citekey)

      const cached = Zotero.BetterBibTeX.cacheFetch(item.itemID, Translator.options)
      if (cached) {
        if (Translator.preferences.sorted && (Translator.BetterBibTeX || Translator.BetterBibLaTeX)) {
          Translator.references.push({ citekey: item.citekey, reference: cached.reference })
        } else {
          Zotero.write(cached.reference)
        }

        if (cached.metadata && cached.metadata.DeclarePrefChars) this.preamble.DeclarePrefChars += cached.metadata.DeclarePrefChars
        continue
      }

      debug('pre-simplify', item)
      Zotero.BetterBibTeX.simplifyFields(item)
      debug('post-simplify', item)
      Object.assign(item, Zotero.BetterBibTeX.extractFields(item))
      debug('exporting', item)

      return item
    }

    return null
  }

  // TODO: move to bibtex-exporters
  public complete() {
    debug('sorted:', { prefs: Translator.preferences, bbt: Translator.BetterBibTeX, bbl: Translator.BetterBibLaTeX })
    if (Translator.preferences.sorted && (Translator.BetterBibTeX || Translator.BetterBibLaTeX)) {
      const order = Translator.references.map((ref, index) => ({ index, citekey: ref.citekey.toLowerCase() }))
      order.sort((a, b) => (a.citekey < b.citekey ? -1 : (a.citekey > b.citekey ? 1 : 0)))
      debug('sorted:', order)
      const references = order.map(o => Translator.references[o.index].reference)
      Zotero.write(references.join(''))
    }

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
