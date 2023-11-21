/* eslint-disable @typescript-eslint/no-unsafe-return */

import { Translation, collect } from './lib/translator'
import type { Translators } from '../typings/translators.d.ts'

declare const Zotero: any
declare var ZOTERO_TRANSLATOR_INFO: Translators.Header // eslint-disable-line no-var

import html2md from 'html-to-md'

import { log } from '../content/logger'
import { Item } from '../gen/typings/serialized-item'

import * as escape from '../content/escape'
import * as Extra from '../content/extra'

function clean(item: Item): Item {
  switch (item.itemType) {
    case 'note':
    case 'annotation':
    case 'attachment':
      return item
  }
  const cleaned: Item = {...item, extra: Extra.get(item.extra, 'zotero').extra }
  cleaned.extra = cleaned.extra.split('\n').filter(line => !line.match(/^OCLC:/i)).join('\n')
  return cleaned
}

type ExpandedCollection = {
  name: string
  items: Item[]
  collections: ExpandedCollection[]
  root: boolean
}

function sorted(collections: ExpandedCollection[]) {
  return collections.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }))
}

class Exporter {
  private translation: Translation
  private levels = 0
  private body = ''
  public html = ''
  public markdown = ''

  constructor(translation: Translation) {
    this.translation = translation
    const items: Record<number, Item> = {}
    const filed: Set<number> = new Set
    const collections: Record<string, ExpandedCollection> = {}

    for (const item of this.translation.input.items) {
      const cleaned = clean(item)
      if (this.keep(cleaned)) items[item.itemID] = cleaned
    }

    for (const [key, collection] of Object.entries(this.translation.collections)) {
      for (const itemID of collection.items) filed.add(itemID)

      collections[key] = {
        name: collection.name,
        // resolve item IDs to items
        items: (collection.items || []).map(itemID => items[itemID]).filter(item => item),
        // resolve collection IDs to collections
        collections: [],
        root: !this.translation.collections[collection.parent],
      }
    }

    for (const [key, collection] of Object.entries(this.translation.collections)) {
      collections[key].collections = (collection.collections || []).map(coll => collections[coll]).filter(coll => coll)
    }

    const unfiled = { name: 'Unfiled', items: Object.values(items).filter(item => !filed.has(item.itemID)), collections: [], root: true }
    if (!this.prune(unfiled)) this.write_collection(unfiled)

    for (const collection of sorted(Object.values(collections))) {
      if (collection.root && !this.prune(collection)) this.write_collection(collection)
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
    if (this.translation.options.markdown) this.markdown = html2md(this.html)
  }

  show(context, args) {
    log.debug(`collectednotes.${context}: ${JSON.stringify(Array.from(args))}`)
  }

  write_collection(collection, level = 1) {
    this.levels = Math.max(this.levels, level)

    this.body += `<h${ level }>${ escape.html(collection.name) }</h${ level }>\n`
    for (const item of collection.items) {
      this.write_item(item)
    }

    for (const coll of sorted(collection.collections)) {
      this.write_collection(coll, level + 1)
    }
  }

  write_item(item) {
    switch (item.itemType) {
      case 'note':
        this.note(item.note, 'note')
        break
      case 'attachment':
        this.item(item)
        break
      default:
        this.item(item)
        break
    }
  }

  prune(collection) {
    if (!collection) return true

    collection.collections = collection.collections.filter(sub => !this.prune(sub))

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
    return [cr.lastName, cr.name, cr.firstName].find(v => v) || ''
  }

  creators(cr: string[]): string {
    switch (cr.length) {
      case 0:
      case 1:
        return cr[0]
      case 2:
        return cr.join(' and ')
      default:
        return `${cr.slice(0, cr.length - 1).join(', ')}, and ${cr[cr.length - 1]}`
    }
  }

  item(item) {
    let notes = []
    let title = ''

    if (item.itemType === 'attachment') {
      if (item.note) notes = [ { note: item.note } ]
      if (item.title) title = `<samp>${ escape.html(item.title) }</samp>`

    }
    else {
      notes = (item.notes || []).filter(note => note.note)

      const creators = this.creators(item.creators.map(creator => this.creator(creator)).filter(v => v))

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
    switch (item.itemType) {
      case 'note':
      case 'annotation':
        return item.note

      case 'attachment':
        return item.notes?.find(note => note.note)

      default:
        return item.extra || item.notes?.find(note => note.note) || item.attachments?.find(att => att.note)
    }
  }
}

export function doExport(): void {
  const translation = Translation.Export(ZOTERO_TRANSLATOR_INFO, collect())
  const exporter = new Exporter(translation)
  translation.output.body += exporter[translation.options.markdown ? 'markdown' : 'html']
  Zotero.write(translation.output.body)
  translation.erase()
}
