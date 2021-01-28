import { Translator } from '../lib/translator'

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
    if (Translator.preferences.jabrefFormat === 3) { // eslint-disable-line no-magic-numbers
      meta = 'groupsversion:3'
    } else if (Translator.BetterBibLaTeX) {
      meta = 'databaseType:biblatex'
    } else {
      meta = 'databaseType:bibtex'
    }

    Zotero.write(`@comment{jabref-meta: ${meta};}\n`)
    Zotero.write(`@comment{jabref-meta: ${Translator.preferences.jabrefFormat === 5 ? 'grouping' : 'groupstree'}:\n`) // eslint-disable-line no-magic-numbers

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
    let group = [`${level} ${Translator.preferences.jabrefFormat === 5 ? 'Static' : 'Explicit'}Group:${this.quote(collection.name)}`, '0'] // eslint-disable-line no-magic-numbers

    if (Translator.preferences.jabrefFormat === 3) { // eslint-disable-line no-magic-numbers
      const references = ((collection.items || []).filter(id => this.citekeys.has(id)).map(id => this.quote(this.citekeys.get(id))))
      if (Translator.preferences.testing) references.sort()
      group = group.concat(references)
    }

    if (Translator.preferences.jabrefFormat === 5) { // eslint-disable-line no-magic-numbers
      group = group.concat(['1', '0x8a8a8aff', '', '']) // isexpanded?, color, icon, description
    } else {
      group.push('') // what is the meaning of the empty cell at the end, JabRef?
    }

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
