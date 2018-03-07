declare const Translator: ITranslator

declare const Zotero: any

import { debug } from '../lib/debug.ts'

export class JabRef {
  public citekeys: Map<number, string>
  private groups: string[]

  constructor() {
    this.citekeys = new Map
  }

  public exportGroups() {
    if ((Object.keys(Translator.collections).length === 0) || !Translator.preferences.jabrefFormat) return

    let meta
    if (Translator.preferences.jabrefFormat === 3) { // tslint:disable-line:no-magic-numbers
      meta = 'groupsversion:3'
    } else if (Translator.BetterBibLaTeX) {
      meta = 'databaseType:biblatex'
    } else {
      meta = 'databaseType:bibtex'
    }

    Zotero.write(`@comment{jabref-meta: ${meta};}\n`)
    Zotero.write('@comment{jabref-meta: groupstree:\n')

    this.groups = ['0 AllEntriesGroup:']
    for (const collection of Object.values(Translator.collections)) {
      if (collection.parent) continue
      this.exportGroup(collection, 1)
    }

    Zotero.write(this.groups.map(group => this.quote(group, true)).concat('').join(';\n'))
    Zotero.write('}\n')
  }

  private exportGroup(collection, level) {
    let group = [`${level} ExplicitGroup:${this.quote(collection.name)}`, '0']

    if (Translator.preferences.jabrefFormat === 3) { // tslint:disable-line:no-magic-numbers
      const references = ((collection.items || []).filter(id => this.citekeys.has(id)).map(id => this.quote(this.citekeys.get(id))))
      if (Translator.preferences.testing) references.sort()
      group = group.concat(references)
    }

    // what is the meaning of the empty cell at the end, JabRef?
    group.push('')

    this.groups.push(group.join(';'))

    for (const key of collection.collections || []) {
      if (Translator.collections[key]) this.exportGroup(Translator.collections[key], level + 1)
    }
  }

  private quote(s, wrap = false) {
    s = s.replace(/([\\;])/g, '\\$1')
    debug('JabRef.quote:', s)
    if (wrap) s = s.match(/.{1,70}/g).join('\n')
    return s
  }
}
