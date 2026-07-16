declare const Zotero: any

import * as YAML from 'js-yaml'
import * as dateparser from '../../content/dateparser'
import { Serialized } from '../../gen/typings/serialized'

type HayagrivaPerson = string | { name?: string; given?: string; family?: string }
type HayagrivaSerial = { doi?: string; isbn?: string; issn?: string }
type HayagrivaPublisher = string | { name?: string; location?: string }

type HayagrivaEntry = {
  type?: string
  title?: string
  author?: HayagrivaPerson | HayagrivaPerson[]
  editor?: HayagrivaPerson | HayagrivaPerson[]
  translator?: HayagrivaPerson | HayagrivaPerson[]
  date?: string
  language?: string
  volume?: string | number
  issue?: string | number
  'page-range'?: string
  publisher?: HayagrivaPublisher
  url?: string | { value?: string; date?: string }
  'serial-number'?: HayagrivaSerial
  parent?: HayagrivaEntry | HayagrivaEntry[]
}

type HayagrivaDoc = Record<string, HayagrivaEntry>

const hayagrivaType: Record<string, string> = {
  artwork: 'Artwork',
  book: 'Book',
  bookSection: 'Chapter',
  conferencePaper: 'Article',
  dictionaryEntry: 'Reference',
  document: 'Misc',
  encyclopediaArticle: 'Reference',
  journalArticle: 'Article',
  magazineArticle: 'Article',
  manuscript: 'Manuscript',
  newspaperArticle: 'Article',
  presentation: 'Article',
  preprint: 'Report',
  report: 'Report',
  thesis: 'Thesis',
  videoRecording: 'Misc',
  webpage: 'Web',
}

const zoteroType: Record<string, Serialized.RegularItem['itemType']> = {
  anthology: 'book',
  article: 'journalArticle',
  artwork: 'artwork',
  book: 'book',
  chapter: 'bookSection',
  conference: 'conferencePaper',
  manuscript: 'manuscript',
  misc: 'document',
  periodical: 'journalArticle',
  reference: 'dictionaryEntry',
  report: 'report',
  thesis: 'thesis',
  video: 'videoRecording',
  web: 'webpage',
}

function sanitizeKey(id: string): string {
  return (id || 'item').replace(/[^a-zA-Z0-9:_-]/g, '_')
}

function parsePerson(person: HayagrivaPerson): { firstName?: string; lastName?: string; name?: string; fieldMode?: number } {
  if (typeof person !== 'string') {
    if (person.family || person.given) return { lastName: person.family || '', firstName: person.given || '' }
    if (person.name) return { name: person.name, fieldMode: 1 }
    return {}
  }

  const parts = person.split(',').map(part => part.trim()).filter(part => part)
  if (parts.length >= 2) return { lastName: parts[0], firstName: parts.slice(1).join(', ') }
  if (parts.length === 1) return { name: parts[0], fieldMode: 1 }
  return {}
}

function personList(source: HayagrivaPerson | HayagrivaPerson[] | undefined): HayagrivaPerson[] {
  if (!source) return []
  return Array.isArray(source) ? source : [ source ]
}

function normalizeURL(url: HayagrivaEntry['url']): { value?: string; date?: string } {
  if (!url) return {}
  if (typeof url === 'string') return { value: url }
  return { value: url.value, date: url.date }
}

function normalizePublisher(publisher: HayagrivaPublisher): { name?: string; location?: string } {
  if (!publisher) return {}
  if (typeof publisher === 'string') return { name: publisher }
  return { name: publisher.name, location: publisher.location }
}

function pickParent(entry: HayagrivaEntry): HayagrivaEntry | null {
  if (!entry.parent) return null
  if (Array.isArray(entry.parent)) return entry.parent[0] || null
  return entry.parent
}

const seasons = [ '', 'Spring', 'Summer', 'Autumn', 'Winter' ]

function formatParsedDate(date: dateparser.RichDate): string {
  switch (date.type) {
    case 'date': {
      if (typeof date.year !== 'number') return ''
      let value = `${date.year}`.padStart(4, '0')
      if (typeof date.month === 'number') {
        value += `-${`${date.month}`.padStart(2, '0')}`
        if (typeof date.day === 'number') value += `-${`${date.day}`.padStart(2, '0')}`
      }
      return value
    }

    case 'season':
      if (typeof date.year !== 'number') return ''
      return `${seasons[date.season] || date.season} ${`${date.year}`.padStart(4, '0')}`

    case 'verbatim':
      return date.verbatim || ''

    case 'interval':
      return formatParsedDate(date.from?.type === 'open' ? date.to : date.from)

    case 'list':
      return formatParsedDate(date.dates.find(d => d.type !== 'open') || date.dates[0])

    default:
      return ''
  }
}

function dateOnly(date: string, origDate?: string): string {
  const parsed = dateparser.parse(date, origDate)
  return formatParsedDate(parsed) || date
}

export const Hayagriva = new class {
  public fromZotero(item: Serialized.RegularItem): HayagrivaEntry {
    const entry: HayagrivaEntry = {
      type: hayagrivaType[item.itemType] || 'Misc',
    }

    if (item.title) entry.title = item.title

    if (item.date) {
      entry.date = dateOnly(item.date, item.originalDate)
    }
    else if (item.itemType === 'webpage' && item.accessDate) {
      entry.date = dateOnly(item.accessDate)
    }

    if (item.language) entry.language = item.language
    if (item.volume) entry.volume = item.volume
    if (item.issue) entry.issue = item.issue
    if (item.pages) entry['page-range'] = item.pages

    if (item.url || item.accessDate) {
      entry.url = {
        ...(item.url ? { value: item.url } : {}),
        ...(item.accessDate ? { date: item.accessDate } : {}),
      }
    }

    if (item.publisher || item.place) {
      entry.publisher = {
        ...(item.publisher ? { name: item.publisher } : {}),
        ...(item.place ? { location: item.place } : {}),
      }
    }

    if (item.DOI || item.ISBN || item.ISSN) {
      entry['serial-number'] = {
        ...(item.DOI ? { doi: item.DOI } : {}),
        ...(item.ISBN ? { isbn: item.ISBN } : {}),
        ...(item.ISSN ? { issn: item.ISSN } : {}),
      }
    }

    const creators: Record<string, string[]> = { author: [], editor: [], translator: [] }
    for (const creator of item.creators || []) {
      const name = creator.name || [ creator.lastName, creator.firstName ].filter(part => part).join(', ')
      if (!name) continue

      switch (creator.creatorType) {
        case 'author':
          creators.author.push(name)
          break
        case 'editor':
          creators.editor.push(name)
          break
        case 'translator':
          creators.translator.push(name)
          break
      }
    }

    for (const role of Object.keys(creators)) {
      if (!creators[role].length) continue
      entry[role] = creators[role].length === 1 ? creators[role][0] : creators[role]
    }

    if (item.publicationTitle || item.bookTitle || item.proceedingsTitle) {
      entry.parent = {
        type: item.publicationTitle ? 'Periodical' : 'Anthology',
        title: item.publicationTitle || item.bookTitle || item.proceedingsTitle,
      }
    }

    return entry
  }

  public export(items: Iterable<Serialized.RegularItem>): string {
    const doc: HayagrivaDoc = {}
    for (const item of items) {
      const key = sanitizeKey(item.citationKey || item.itemKey)
      doc[key] = this.fromZotero(item)
    }

    return YAML.dump(doc, { skipInvalid: true, sortKeys: true, lineWidth: -1 })
  }

  public async import(data: unknown): Promise<void> {
    const doc = data as HayagrivaDoc

    for (const [ id, entry ] of Object.entries(doc)) {
      if (!entry || typeof entry !== 'object') continue

      const type = (entry.type || 'misc').toLowerCase()
      const item = new Zotero.Item(zoteroType[type] || 'document')

      item.citationKey = id

      if (entry.title) item.title = entry.title
      if (entry.date) item.date = entry.date
      if (entry.language) item.language = entry.language
      if (entry.volume) item.volume = `${entry.volume}`
      if (entry.issue) item.issue = `${entry.issue}`
      if (entry['page-range']) item.pages = entry['page-range']

      const url = normalizeURL(entry.url)
      if (url.value) item.url = url.value
      if (url.date) item.accessDate = url.date

      const publisher = normalizePublisher(entry.publisher)
      if (publisher.name) item.publisher = publisher.name
      if (publisher.location) item.place = publisher.location

      const serial = entry['serial-number'] || {}
      if (serial.doi) item.DOI = serial.doi
      if (serial.isbn) item.ISBN = serial.isbn
      if (serial.issn) item.ISSN = serial.issn

      const parent = pickParent(entry)
      if (parent?.title) {
        switch ((parent.type || '').toLowerCase()) {
          case 'periodical':
            item.publicationTitle = parent.title
            break
          case 'anthology':
          case 'book':
            item.bookTitle = parent.title
            break
          default:
            if (!item.publicationTitle) item.publicationTitle = parent.title
            break
        }
      }

      for (const person of personList(entry.author)) {
        const parsed = parsePerson(person)
        if (!Object.keys(parsed).length) continue
        item.creators.push({ creatorType: 'author', ...parsed })
      }

      for (const person of personList(entry.editor)) {
        const parsed = parsePerson(person)
        if (!Object.keys(parsed).length) continue
        item.creators.push({ creatorType: 'editor', ...parsed })
      }

      for (const person of personList(entry.translator)) {
        const parsed = parsePerson(person)
        if (!Object.keys(parsed).length) continue
        item.creators.push({ creatorType: 'translator', ...parsed })
      }

      await item.complete()
    }
  }
}
