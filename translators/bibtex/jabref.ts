import { Translation } from '../lib/translator.js'

import { stringCompare } from '../lib/string-compare.js'

export class JabRef {
  public citekeys: Map<number, string>
  private groups: string[]
  private translation: Translation

  constructor(translation: Translation) {
    this.translation = translation
    this.citekeys = new Map
  }

  public toString(): string {
    if ((Object.keys(this.translation.collected.collections).length === 0) || !this.translation.collected.preferences.jabrefFormat) return ''

    let meta
    if (this.translation.collected.preferences.jabrefFormat === 3) {
      meta = 'groupsversion:3'
    }
    else if (this.translation.BetterBibLaTeX) {
      meta = 'databaseType:biblatex'
    }
    else {
      meta = 'databaseType:bibtex'
    }

    this.groups = ['0 AllEntriesGroup:']
    const collections = Object.values(this.translation.collections).filter(coll => !coll.parent)
    if (this.translation.collected.preferences.testing) collections.sort((a, b) => stringCompare(a.name, b.name))
    for (const collection of collections) {
      this.exportGroup(collection, 1)
    }

    if (this.groups.length === 1) return ''

    let groups = `@comment{jabref-meta: ${ meta };}\n`
    groups += `@comment{jabref-meta: ${ this.translation.collected.preferences.jabrefFormat === 5 ? 'grouping' : 'groupstree' }:\n`
    groups += this.groups.map(group => this.quote(group, true)).concat('').join(';\n')
    groups += '}\n'
    return groups
  }

  private exportGroup(collection, level: number): void {
    let group = [ `${ level } ${ this.translation.collected.preferences.jabrefFormat === 5 ? 'Static' : 'Explicit' }Group:${ this.quote(collection.name) }`, '0' ]

    if (this.translation.collected.preferences.jabrefFormat === 3) {
      const items = ((collection.items || []).filter(id => this.citekeys.has(id)).map(id => this.quote(this.citekeys.get(id))))
      if (this.translation.collected.preferences.testing) items.sort()
      group = group.concat(items)
    }

    if (this.translation.collected.preferences.jabrefFormat === 5) {
      group = group.concat([ '1', '0x8a8a8aff', '', '' ]) // isexpanded?, color, icon, description
    }
    else {
      group.push('') // what is the meaning of the empty cell at the end, JabRef?
    }

    this.groups.push(group.join(';'))

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    const children = (collection.collections || []).map(key => this.translation.collections[key]).filter(coll => coll)
    if (this.translation.collected.preferences.testing) children.sort((a, b) => stringCompare(a.name, b.name))
    for (const child of children) {
      this.exportGroup(child, level + 1)
    }
  }

  private quote(s: string, wrap = false): string {
    s = s.replace(/([\\;])/g, '\\$1')
    if (wrap) s = s.match(/.{1,70}/g).join('\n')
    return s
  }
}
