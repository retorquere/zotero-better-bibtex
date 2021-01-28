declare const Zotero: any

import { Translator } from './lib/translator'
export { Translator }

import * as escape from '../content/escape'
import * as Extra from '../content/extra'

function cleanExtra(extra) {
  const cleaned = Extra.get(extra, 'zotero')
  cleaned.extra = cleaned.extra.split('\n').filter(line => !line.match(/^OCLC:/i)).join('\n')
  return cleaned
}
class Exporter {
  private levels = 0
  private body = ''
  private items: Record<number, ISerializedItem> = {}
  public html = ''

  constructor() {
    for (const item of Translator.items()) {
      if (!this.keep(item)) continue
      this.items[item.itemID] = Object.assign(item, cleanExtra(item.extra)) // eslint-disable-line prefer-object-spread
    }

    const filed = {}
    const root = []
    for (const collection of Object.values(Translator.collections)) {
      for (const itemID of collection.items) filed[itemID] = this.items[itemID]
      if (!Translator.collections[collection.parent]) delete collection.parent
      if (!collection.parent && !this.prune(collection)) root.push(collection) // prune empty roots
    }
    Zotero.debug('root collections: ' + JSON.stringify(root))
    Zotero.debug('items: ' + JSON.stringify(Object.keys(this.items)))

    for (const item of (Object.values(this.items) as { itemID: number }[])) {
      if (!filed[item.itemID] && this.keep(item)) this.item(item)
    }

    for (const collection of root) {
      this.collection(collection)
    }

    let style = `  body { ${ this.reset(1) } }\n`
    for (let level = 1; level <= this.levels; level++) {
      style += `  h${ level } { ${ this.reset(level + 1) } }\n`
      const label = Array.from({length: level}, (x, i) => `counter(h${ i + 1 }counter)`).join(' "." ')
      style += `  h${ level }:before { counter-increment: h${ level }counter; content: ${ label } ".\\0000a0\\0000a0"; }\n`
    }
    style += '  blockquote { border-left: 1px solid gray; }\n'

    this.html = `<html><head><style>${ style }</style></head><body>${ this.body }</body></html>`
  }

  show(context, args) {
    Zotero.debug(`collectednotes.${context}: ${JSON.stringify(Array.from(args))}`)
  }

  collection(collection, level = 1) {
    this.show('collection', arguments)
    if (level > this.levels) this.levels = level

    this.body += `<h${ level }>${ escape.html(collection.name) }</h${ level }>\n`
    for (const itemID of collection.items) {
      this.item(this.items[itemID])
    }

    for (const subcoll of collection.collections) {
      this.collection(Translator.collections[subcoll], level + 1)
    }
  }

  item(item) {
    this.show('item', arguments)
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
    this.show('prune', arguments)
    if (!collection) return true

    collection.items = collection.items.filter(itemID => this.keep(this.items[itemID]))
    collection.collections = collection.collections.filter(subcoll => !this.prune(Translator.collections[subcoll]))

    return !collection.items.length && !collection.collections.length
  }

  note(note, type) {
    this.show('note', arguments)
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
    this.show('creator', arguments)
    return [cr.lastName, cr.firstName, cr.name].filter(v => v).join(', ')
  }

  reference(item) {
    this.show('reference', arguments)
    let notes = []
    let title = ''

    if (item.itemType === 'attachment') {
      if (item.note) notes = [ { note: item.note } ]
      if (item.title) title = `<samp>${ escape.html(item.title) }</samp>`

    } else {
      notes = (item.notes || []).filter(note => note.note)

      Zotero.debug('this.reference: ' + JSON.stringify(item))
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

  reset(starting) {
    this.show('reset', arguments)
    if (starting > this.levels) return ''

    let reset = 'counter-reset:'
    for (let level = starting; level <= this.levels; level++) {
      reset += ` h${ level }counter 0`
    }
    return reset + ';'
    // return `counter-reset: h${ starting }counter;`
  }

  keep(item) {
    this.show('keep', arguments)
    if (!item) return false
    if (item.extra) return true
    if (item.note) return true
    if (item.notes && item.notes.find(note => note.note)) return true
    if (item.attachments && item.attachments.find(att => att.note)) return true
    return false
  }
}

export function doExport() {
  Translator.init('export')
  Zotero.write((new Exporter).html)
}
