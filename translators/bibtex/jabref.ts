declare const Translator: ITranslator

declare const Zotero: any

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
    const collections = Object.values(Translator.collections).filter(coll => !coll.parent)
    if (Translator.preferences.testing) collections.sort((a, b) => Translator.stringCompare(a.name, b.name))
    for (const collection of collections) {
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

    const children = (collection.collections || []).map(key => Translator.collections[key]).filter(coll => coll)
    if (Translator.preferences.testing) children.sort((a, b) => Translator.stringCompare(a.name, b.name))
    for (const child of children) {
      this.exportGroup(child, level + 1)
    }
  }

  private quote(s, wrap = false) {
    s = s.replace(/([\\;])/g, '\\$1')
    if (wrap) s = s.match(/.{1,70}/g).join('\n')
    return s
  }
}
