import { Translation } from '../lib/translator'

declare const Zotero: any

export class JabRef {
  public citekeys: Map<number, string>
  private groups: string[]

  constructor() {
    this.citekeys = new Map
  }

  public exportGroups(): void {
    if ((Object.keys(Translation.collections).length === 0) || !Translation.preferences.jabrefFormat) return

    let meta
    if (Translation.preferences.jabrefFormat === 3) { // eslint-disable-line no-magic-numbers
      meta = 'groupsversion:3'
    }
    else if (Translation.BetterBibLaTeX) {
      meta = 'databaseType:biblatex'
    }
    else {
      meta = 'databaseType:bibtex'
    }

    Zotero.write(`@comment{jabref-meta: ${meta};}\n`)
    Zotero.write(`@comment{jabref-meta: ${Translation.preferences.jabrefFormat === 5 ? 'grouping' : 'groupstree'}:\n`) // eslint-disable-line no-magic-numbers

    this.groups = ['0 AllEntriesGroup:']
    const collections = Object.values(Translation.collections).filter(coll => !coll.parent)
    if (Translation.preferences.testing) collections.sort((a, b) => Translation.stringCompare(a.name, b.name))
    for (const collection of collections) {
      this.exportGroup(collection, 1)
    }

    Zotero.write(this.groups.map(group => this.quote(group, true)).concat('').join(';\n'))
    Zotero.write('}\n')
  }

  private exportGroup(collection, level: number): void {
    let group = [`${level} ${Translation.preferences.jabrefFormat === 5 ? 'Static' : 'Explicit'}Group:${this.quote(collection.name)}`, '0'] // eslint-disable-line no-magic-numbers

    if (Translation.preferences.jabrefFormat === 3) { // eslint-disable-line no-magic-numbers
      const items = ((collection.items || []).filter(id => this.citekeys.has(id)).map(id => this.quote(this.citekeys.get(id))))
      if (Translation.preferences.testing) items.sort()
      group = group.concat(items)
    }

    if (Translation.preferences.jabrefFormat === 5) { // eslint-disable-line no-magic-numbers
      group = group.concat(['1', '0x8a8a8aff', '', '']) // isexpanded?, color, icon, description
    }
    else {
      group.push('') // what is the meaning of the empty cell at the end, JabRef?
    }

    this.groups.push(group.join(';'))

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    const children = (collection.collections || []).map(key => Translation.collections[key]).filter(coll => coll)
    if (Translation.preferences.testing) children.sort((a, b) => Translation.stringCompare(a.name, b.name))
    for (const child of children) {
      this.exportGroup(child, level + 1)
    }
  }

  private quote(s:string, wrap = false): string {
    s = s.replace(/([\\;])/g, '\\$1')
    if (wrap) s = s.match(/.{1,70}/g).join('\n')
    return s
  }
}
