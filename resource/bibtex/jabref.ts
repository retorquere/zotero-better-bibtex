declare const Translator: ITranslator

declare const Zotero: any

export class JabRef {
  public citekeys: any

  constructor() {
    this.citekeys = {}
  }

  public exportGroups() {
    let meta
    if ((Object.keys(Translator.collections).length === 0) || !Translator.preferences.jabrefFormat) return

    if (Translator.preferences.jabrefFormat === 3) { // tslint:disable-line:no-magic-numbers
      meta = 'groupsversion:3'
    } else if (Translator.BetterBibLaTeX) {
      meta = 'databaseType:biblatex'
    } else {
      meta = 'databaseType:bibtex'
    }

    Zotero.write(`@comment{jabref-meta: ${meta};}\n`)
    Zotero.write('@comment{jabref-meta: groupstree:\n')
    Zotero.write('0 AllEntriesGroup:;\n')
    for (const collection of Object.values(Translator.collections)) {
      if (collection.parent) continue
      Zotero.write(this.exportGroup(collection, 1))
    }
    Zotero.write(';\n')
    Zotero.write('}\n')
  }

  private serialize(list, wrap = false) {
    let serialized = list.map(elt => elt.replace(/\\/g, '\\\\').replace(/;/g, '\\;'))
    if (wrap) serialized = serialized.map(elt => elt.match(/.{1,70}/g).join('\n'))
    return serialized.join(wrap ? ';\n' : ';')
  }

  private exportGroup(collection, level) {
    let collected = [`${level} ExplicitGroup:${collection.name}`, '0']

    if (Translator.preferences.jabrefFormat === 3) { // tslint:disable-line:no-magic-numbers
      const references = ((collection.items || []).filter(id => this.citekeys[id]).map(id => this.citekeys[id]))
      if (Translator.preferences.testing) references.sort()
      collected = collected.concat(references)
    }

    // what is the meaning of the empty cell at the end, JabRef?
    collected = collected.concat([''])

    collected = [this.serialize(collected)]

    for (const key of collection.collections || []) {
      if (Translator.collections[key]) collected = collected.concat(this.exportGroup(Translator.collections[key], level + 1))
    }

    if (level > 1) {
      return collected
    } else {
      return this.serialize(collected, true)
    }
  }
}
