declare const Translator: ITranslator

declare const Zotero: any

import { JabRef } from '../bibtex/jabref' // not so nice... BibTeX-specific code
import { debug } from '../lib/debug'
import * as itemfields from '../../gen/itemfields'
import * as bibtexParser from '@retorquere/bibtex-parser'

// export singleton: https://k94n.com/es6-modules-single-instance-pattern
export let Exporter = new class { // tslint:disable-line:variable-name
  public preamble: { DeclarePrefChars: string, noopsort?: boolean }
  public packages: { [key: string]: boolean }
  public jabref: JabRef
  public strings: {[key: string]: string}
  public time: number

  constructor() {
    this.preamble = {DeclarePrefChars: ''}
    this.jabref = new JabRef()
    this.strings = {}
    this.packages = {}
    this.time = (new Date).getTime()
  }

  public prepare_strings() {
    if (!Translator.BetterTeX || !Translator.preferences.strings) return

    if (Translator.preferences.exportBibTeXStrings === 'match') {
      this.strings = (bibtexParser.parse(Translator.preferences.strings, { markup: (Translator.csquotes ? { enquote: Translator.csquotes } : {}) }) as bibtexParser.Bibliography).strings
    }

    /*
    if (Translator.preferences.exportBibTeXStrings !== 'off') {
      Zotero.write(`${Translator.preferences.strings}\n\n`)
    }
    */
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

      if (!item.citekey) {
        debug(new Error('No citation key found in'), item)
        throw new Error(`No citation key in ${JSON.stringify(item)}`)
      }

      this.jabref.citekeys.set(item.itemID, item.citekey)

      // this is not automatically lazy-evaluated?!?!
      const cached: Types.DB.Cache.ExportedItem = Translator.caching ? Zotero.BetterBibTeX.cacheFetch(item.itemID, Translator.options, Translator.preferences) : null
      Translator.cache[cached ? 'hits' : 'misses'] += 1

      debug(`nextItem: +${(new Date).getTime() - this.time}: cache ${cached ? 'hit' : 'miss' }`)
      this.time = (new Date).getTime()

      if (cached) {
        debug(':cache:hit', item.itemID)
        if (Translator.preferences.sorted && (Translator.BetterBibTeX || Translator.BetterBibLaTeX)) {
          Translator.references.push({ citekey: item.citekey, reference: cached.reference })
        } else {
          Zotero.write(cached.reference)
        }

        if (cached.metadata) {
          if (cached.metadata.DeclarePrefChars) this.preamble.DeclarePrefChars += cached.metadata.DeclarePrefChars
          if (cached.metadata.noopsort) this.preamble.noopsort = true
          if (cached.metadata.packages) {
            for (const pkg of cached.metadata.packages) {
              this.packages[pkg] = true
            }
          }
        }
        continue
      }

      debug(':cache:miss', item.itemID)
      itemfields.simplifyForExport(item)
      Object.assign(item, Zotero.BetterBibTeX.extractFields(item))
      debug('exporting', item)

      item.raw = Translator.preferences.rawLaTag === '*'
      item.tags = item.tags.filter(tag => {
        if (tag.tag === Translator.preferences.rawLaTag) {
          item.raw = true
          return false
        }
        return true
      })

      return item
    }

    return null
  }

  // TODO: move to bibtex-exporters
  public complete() {
    debug('sorted:', { prefs: Translator.preferences, bbt: Translator.BetterBibTeX, bbl: Translator.BetterBibLaTeX })
    if (Translator.preferences.sorted && (Translator.BetterBibTeX || Translator.BetterBibLaTeX)) {
      Translator.references.sort((a, b) => Translator.stringCompare(a.citekey, b.citekey))
      Zotero.write(Translator.references.map(ref => ref.reference).join(''))
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

    if (Translator.preferences.qualityReport) {
      const packages = Object.keys(this.packages)
      if (packages.length) Zotero.write('\n%Required packages:\n')
      for (const pkg of packages) {
        Zotero.write(`% * ${pkg}\n`)
      }
    }
  }
}
