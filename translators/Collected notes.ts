declare const Zotero: any
declare const Translator: ITranslator

import { htmlEscape } from './lib/html-escape.ts'

function _collection(collection, level = 1) {
  Zotero.write(`<h${ level }>${ htmlEscape(collection.name) }</h${ level }>\n`)
  for (const item of collection.items) {
    _item(item, level)
  }

  for (const subcoll of collection.collections) {
    _collection(subcoll, level + 1)
  }
}

function _item(item, level) {
  if (item.itemType === 'note') {
    _note(item.note)
  } else {
    _reference(item, level)
  }
}

function _prune(collection) {
  let keep = collection.items.length > 0

  collection.collections = collection.collections.filter(subcoll => {
    if (_prune(subcoll)) {
      return false
    } else {
      keep = true
      return true
    }
  })

  return !keep
}

function _note(body) {
  Zotero.write(`<hr/><div>${ body }</div>\n`)
}

function _creator(cr) {
  return [cr.lastName, cr.firstName, cr.name].filter(v => v).join(', ')
}

function _reference(item, level) {
  const creators = item.creators.map(_creator).filter(v => v).join(' and ')

  let date = null
  if (item.date) {
    date = Zotero.BetterBibTeX.parseDate(item.date)
    if (date.from) date = date.from
    date = typeof date.year === 'number' ? date.year : item.date
  }

  const author = [creators, date].filter(v => v).join(', ')

  const title = [item.title || '', author].filter(v => v).join(' ')

  Zotero.write(`<h${ level + 1 }>${ htmlEscape(title) }</h${ level + 1 }>\n`)

  for (const note of item.notes || []) {
    _note(note)
  }
}

Translator.doExport = () => {
  // collect all notes
  const items = {}
  let z_item
  while (z_item = Zotero.nextItem()) {
    if (z_item.itemType === 'note' || (z_item.notes || []).length || z_item.extra) items[z_item.itemID] = z_item
  }
  const filed = {}

  // expand collections
  for (const collection of Object.values(Translator.collections)) {
    collection.collections = collection.collections.map(key => Translator.collections[key]).filter(v => v)
    collection.items = collection.items.map(id => filed[id] = items[id]).filter(v => v)
  }

  // prune empty branches
  const collections = Object.values(Translator.collections).filter(collection => !collection.parent && !_prune(collection))

  Zotero.write('<html><body>')

  for (const item of (Object.values(items) as Array<{ itemID: number }>)) {
    if (filed[item.itemID]) continue
    _item(item, 1)
  }

  for (const collection of collections) {
    _collection(collection)
  }

  Zotero.write('</body></html>')
}
