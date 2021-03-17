/* eslint-disable @typescript-eslint/no-unsafe-return */

declare const Zotero: any

import { Translator } from './lib/translator'
export { Translator }

import { ZoteroTranslator } from '../gen/typings/serialized-item'

import * as escape from '../content/escape'
import * as Extra from '../content/extra'

function clean(item: ZoteroTranslator.Item): ZoteroTranslator.Item {
  item = {...item, ...Extra.get(item.extra, 'zotero') }
  item.extra = item.extra.split('\n').filter(line => !line.match(/^OCLC:/i)).join('\n')
  return item
}

type ExpandedCollection = {
  name: string
  items: ZoteroTranslator.Item[]
  collections: ExpandedCollection[]
  root: boolean
}

function sorted(collections: ExpandedCollection[]) {
  return collections.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }))
}

class Exporter {
  private levels = 0
  private body = ''
  public html = ''

  constructor() {
    const items: Record<number, ZoteroTranslator.Item> = {}
    const filed: Set<number> = new Set
    const collections: Record<string, ExpandedCollection> = {}

    for (let item of Translator.items()) {
      item = clean(item)
      if (this.keep(item)) items[item.itemID] = item
    }

    for (const [key, collection] of Object.entries(Translator.collections)) {
      for (const itemID of collection.items) filed.add(itemID)
      collections[key] = {
        name: collection.name,
        // resolve item IDs to items
        items: (collection.items || []).map(itemID => items[itemID]).filter(item => item),
        // resolve collection IDs to collections
        collections: [],
        root: !Translator.collections[collection.parent],
      }
    }
    for (const [key, collection] of Object.entries(collections)) {
      Zotero.debug(`collected notes: ${key}, ${collection.name}, root: ${collection.root}`)
    }
    for (const [key, collection] of Object.entries(Translator.collections)) {
      collections[key].collections = (collection.collections || []).map(coll => collections[coll]).filter(coll => coll)
      Zotero.debug(`collection ${key} has ${collection.collections.length} subcollections ${collections[key].collections}, is root: ${collections[key].root}`)
    }

    const unfiled = { name: 'Unfiled', items: Object.values(items).filter(item => !filed.has(item.itemID)), collections: [], root: true }
    if (!this.prune(unfiled)) this.collection(unfiled)

    for (const collection of sorted(Object.values(collections))) {
      if (collection.root && !this.prune(collection)) this.collection(collection)
    }

    let style = '\n  body {\n    counter-reset: h1;\n  }\n\n'
    for (let level = 1; level <= this.levels; level++) {
      if (level !== this.levels) style += `  h${level} {\n    counter-reset: h${level + 1};\n  }\n`

      style += `  h${level}:before {\n`
      const label = Array.from({length: level}, (_x, i) => `counter(h${ i + 1 }, decimal)`).join(' "." ')
      style += `    content: ${label} ".\\0000a0\\0000a0";\n`
      style += `    counter-increment: h${level};\n`
      style += '  }\n\n'
    }
    style += '  blockquote { border-left: 1px solid gray; }\n'

    this.html = `<html><head><style>${ style }</style></head><body>${ this.body }</body></html>`
  }

  show(context, args) {
    Zotero.debug(`collectednotes.${context}: ${JSON.stringify(Array.from(args))}`)
  }

  collection(collection, level = 1) {
    Zotero.debug(`collection ${collection.name} @ ${level} with ${collection.collections.length} subcollections`)
    this.levels = Math.max(this.levels, level)

    this.body += `<h${ level }>${ escape.html(collection.name) }</h${ level }>\n`
    for (const item of collection.items) {
      this.item(item)
    }

    for (const coll of sorted(collection.collections)) {
      this.collection(coll, level + 1)
    }
  }

  item(item) {
    switch (item.itemType) {
      case 'note':
        this.note(item.note, 'note')
        break
      case 'attachment':
        this.reference(item)
        break
      default:
        this.reference(item)
        break
    }
  }

  prune(collection) {
    if (!collection) return true

    collection.collections = collection.collections.filter(sub => !this.prune(sub))

    Zotero.debug(`prune: ${collection.name}: ${collection.items.length} items, ${collection.collections.length} collections: ${!collection.items.length && !collection.collections.length}`)
    return !collection.items.length && !collection.collections.length
  }

  note(note, type) {
    switch (type) {
      case 'extra':
        if (!note) return
        this.body += `<blockquote><pre>${ escape.html(note) }</pre></blockquote>\n`
        break
      case 'attachment':
        if (!note.note) return
        this.body += `<blockquote><div><samp>${ note.title }</samp></div>${ note.note }</blockquote>\n`
        break
      default:
        if (!note.note) return
        this.body += `<blockquote>${ note.note }</blockquote>\n`
        break
    }
  }

  creator(cr) {
    return [cr.lastName, cr.firstName, cr.name].filter(v => v).join(', ')
  }

  reference(item) {
    let notes = []
    let title = ''

    if (item.itemType === 'attachment') {
      if (item.note) notes = [ { note: item.note } ]
      if (item.title) title = `<samp>${ escape.html(item.title) }</samp>`

    }
    else {
      notes = (item.notes || []).filter(note => note.note)

      const creators = item.creators.map(creator => this.creator(creator)).filter(v => v).join(' and ')

      let date = null
      if (item.date) {
        date = Zotero.BetterBibTeX.parseDate(item.date)
        if (date.from) date = date.from
        date = typeof date.year === 'number' ? date.year : item.date
      }

      const author = [creators, date].filter(v => v).join(', ')

      if (item.title) title += `<i>${ escape.html(item.title) }</i>`
      if (author) title += ` (${ escape.html(author) })`
      title = title.trim()
    }

    this.body += `<div>${ title }</div>\n`

    this.note(item.extra, 'extra')

    for (const note of notes) {
      this.note(note, 'note')
    }

    for (const att of item.attachments || []) {
      this.note(att, 'attachment')
    }
  }

  keep(item) {
    if (!item) return false
    if (item.extra) return true
    if (item.note) return true
    if (item.notes && item.notes.find(note => note.note)) return true
    if (item.attachments && item.attachments.find(att => att.note)) return true
    return false
  }
}

export function doExport(): void {
  Translator.init('export')
  Zotero.write((new Exporter).html)
}
