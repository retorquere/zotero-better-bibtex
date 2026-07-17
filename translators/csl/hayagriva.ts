declare const Zotero: any

import * as YAML from 'js-yaml'
import { Serialized } from '../../gen/typings/serialized'
import { strToISO as parseDateToISO } from '../../content/dateparser'

type HayagrivaPerson = string | { name?: string; given?: string; family?: string }
type HayagrivaSerial = {
  doi?: string
  isbn?: string
  issn?: string
  pmid?: string
  pmcid?: string
  serial?: string
  version?: string
}
type HayagrivaPublisher = string | { name?: string; location?: string }
type HayagrivaAffiliated = {
  role?: string
  names?: HayagrivaPerson | HayagrivaPerson[]
}

type HayagrivaEntry = {
  type?: string
  title?: string
  author?: HayagrivaPerson | HayagrivaPerson[]
  editor?: HayagrivaPerson | HayagrivaPerson[]
  translator?: HayagrivaPerson | HayagrivaPerson[]
  affiliated?: HayagrivaAffiliated | HayagrivaAffiliated[]
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
  audioRecording: 'audio',
  artwork: 'artwork',
  bill: 'legislation',
  blogPost: 'article',
  book: 'book',
  bookSection: 'chapter',
  case: 'case',
  computerProgram: 'repository',
  conferencePaper: 'article',
  dataset: 'misc',
  dictionaryEntry: 'entry',
  document: 'misc',
  email: 'misc',
  encyclopediaArticle: 'entry',
  film: 'video',
  forumPost: 'thread',
  hearing: 'misc',
  instantMessage: 'misc',
  interview: 'misc',
  journalArticle: 'article',
  letter: 'misc',
  magazineArticle: 'article',
  manuscript: 'manuscript',
  map: 'misc',
  newspaperArticle: 'article',
  patent: 'patent',
  podcast: 'audio',
  preprint: 'article',
  presentation: 'misc',
  radioBroadcast: 'audio',
  report: 'report',
  standard: 'report',
  statute: 'legislation',
  thesis: 'thesis',
  tvBroadcast: 'video',
  videoRecording: 'video',
  webpage: 'web',
}

const zoteroType: Record<string, Serialized.RegularItem['itemType']> = {
  anthos: 'bookSection',
  anthology: 'book',
  article: 'journalArticle',
  audio: 'audioRecording',
  artwork: 'artwork',
  book: 'book',
  case: 'case',
  chapter: 'bookSection',
  conference: 'conferencePaper',
  entry: 'dictionaryEntry',
  legislation: 'statute',
  manuscript: 'manuscript',
  misc: 'document',
  newspaper: 'newspaperArticle',
  patent: 'patent',
  periodical: 'journalArticle',
  reference: 'dictionaryEntry',
  repository: 'computerProgram',
  report: 'report',
  thread: 'forumPost',
  thesis: 'thesis',
  video: 'videoRecording',
  web: 'webpage',
}

function sanitizeKey(id: string): string {
  return (id || 'item').replace(/[^a-zA-Z0-9:_-]/g, '_')
}

function normalizeScalar(value: unknown): string {
  if (value === null || typeof value === 'undefined') return ''
  if (typeof value === 'string') return value.trim()
  if (typeof value === 'number') return `${ value }`.trim()
  if (typeof value === 'boolean') return (value ? 'true' : 'false')
  if (typeof value === 'bigint') return value.toString().trim()
  return ''
}

function normalizeDate(value: unknown): string {
  const source = normalizeScalar(value)
  if (!source) return ''
  try {
    return parseDateToISO(source) || source
  }
  catch {
    return source
  }
}

function normalizePageRange(value: unknown): string {
  const pages = normalizeScalar(value)
  if (!pages) return ''
  return pages.replace(/--+/g, '-')
}

function normalizeType(value: unknown): string {
  return normalizeScalar(value).toLowerCase()
}

function makeParent(item: Serialized.RegularItem): HayagrivaEntry | null {
  if ([ 'journalArticle', 'magazineArticle', 'newspaperArticle' ].includes(item.itemType)) {
    const title = item.publicationTitle || ''
    if (!title) return null
    return {
      type: item.itemType === 'newspaperArticle' ? 'newspaper' : 'periodical',
      title,
    }
  }

  if (item.itemType === 'bookSection') {
    const title = item.publicationTitle || ''
    if (!title) return null
    return {
      type: 'book',
      title,
    }
  }

  if (item.itemType === 'conferencePaper') {
    const title = item.publicationTitle || item.conferenceName || ''
    if (!title) return null
    return {
      type: item.publicationTitle ? 'proceedings' : 'conference',
      title,
    }
  }

  if (item.itemType === 'blogPost') {
    const title = item.publicationTitle || ''
    if (!title) return null
    return {
      type: 'blog',
      title,
    }
  }

  if (item.itemType === 'webpage') {
    const title = item.publicationTitle || ''
    if (!title) return null
    return {
      type: 'web',
      title,
    }
  }

  if (item.itemType === 'forumPost') {
    const title = item.publicationTitle || ''
    if (!title) return null
    return {
      type: 'thread',
      title,
    }
  }

  return null
}

function parseExtraSerialNumbers(extra: unknown): HayagrivaSerial {
  const serial: HayagrivaSerial = {}
  const lines = normalizeScalar(extra).split(/\r?\n/)

  for (const line of lines) {
    const matched = line.trim().match(/^(DOI|ISBN|ISSN|PMID|PMCID|Version|Version Number|Report Number|Patent Number|Docket Number)\s*:\s*(.+)$/i)
    if (!matched) continue

    const label = matched[1].toLowerCase()
    const value = normalizeScalar(matched[2])
    if (!value) continue

    if ([ 'version', 'version number' ].includes(label)) serial.version = value
    else if ([ 'report number', 'patent number', 'docket number' ].includes(label)) serial.serial = value
    else serial[label] = value
  }

  return serial
}

function serialNumber(item: Serialized.RegularItem): HayagrivaSerial {
  const serial: HayagrivaSerial = {
    ...(item.DOI ? { doi: item.DOI } : {}),
    ...(item.ISBN ? { isbn: item.ISBN } : {}),
    ...(item.ISSN ? { issn: item.ISSN } : {}),
    ...(item.PMID ? { pmid: item.PMID } : {}),
    ...(item.PMCID ? { pmcid: item.PMCID } : {}),
  }

  if ([ 'report', 'patent', 'case' ].includes(item.itemType) && item.number) serial.serial = item.number
  if (item.itemType === 'computerProgram' && item.versionNumber) serial.version = item.versionNumber

  const extra = parseExtraSerialNumbers(item.extra)
  return {
    ...serial,
    ...extra,
  }
}

function hasContent(entry: Record<string, unknown>): boolean {
  return Object.values(entry).some(value => {
    if (Array.isArray(value)) return value.length > 0
    if (value && typeof value === 'object') return Object.keys(value).length > 0
    return !!value
  })
}

function parseAffiliated(entry: HayagrivaEntry): Array<{ creatorType: string; firstName?: string; lastName?: string; name?: string; fieldMode?: number }> {
  const people: Array<{ creatorType: string; firstName?: string; lastName?: string; name?: string; fieldMode?: number }> = []
  const affiliated = entry.affiliated ? (Array.isArray(entry.affiliated) ? entry.affiliated : [ entry.affiliated ]) : []

  const creatorType: Record<string, string> = {
    collaborator: 'contributor',
    composer: 'composer',
    director: 'director',
    holder: 'inventor',
    illustrator: 'artist',
    producer: 'producer',
    translator: 'translator',
    writer: 'contributor',
  }

  for (const role of affiliated) {
    const mapped = creatorType[normalizeType(role?.role)]
    if (!mapped) continue
    for (const person of personList(role?.names)) {
      const parsed = parsePerson(person)
      if (!Object.keys(parsed).length) continue
      people.push({ creatorType: mapped, ...parsed })
    }
  }

  return people
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

function creatorFingerprint(creator: { creatorType: string; firstName?: string; lastName?: string; name?: string; fieldMode?: number }): string {
  return [
    creator.creatorType,
    creator.fieldMode || 0,
    normalizeScalar(creator.name).toLowerCase(),
    normalizeScalar(creator.lastName).toLowerCase(),
    normalizeScalar(creator.firstName).toLowerCase(),
  ].join('|')
}

export const Hayagriva = new class {
  public fromZotero(item: Serialized.RegularItem): HayagrivaEntry {
    const entry: HayagrivaEntry = {
      type: hayagrivaType[item.itemType] || 'misc',
    }

    if (item.title) entry.title = item.title
    if (item.date) entry.date = normalizeDate(item.date)
    if (item.language) entry.language = item.language
    if (item.volume) entry.volume = item.volume
    if (item.issue) entry.issue = item.issue
    if (item.pages) entry['page-range'] = normalizePageRange(item.pages)

    if (item.url || item.accessDate) {
      entry.url = {
        ...(item.url ? { value: item.url } : {}),
        ...(item.accessDate ? { date: normalizeDate(item.accessDate) } : {}),
      }
    }

    if (item.publisher || item.place) {
      entry.publisher = {
        ...(item.publisher ? { name: item.publisher } : {}),
        ...(item.place ? { location: item.place } : {}),
      }
    }

    const serial = serialNumber(item)
    if (hasContent(serial)) entry['serial-number'] = serial

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

    const parent = makeParent(item)
    if (parent) entry.parent = parent

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

      const type = normalizeType(entry.type) || 'misc'
      const item = new Zotero.Item(zoteroType[type] || 'document')

      item.extra = `${ item.extra || '' }\nCitation Key: ${ sanitizeKey(id) }`.trim()

      if (entry.title) item.title = entry.title
      if (entry.date) item.date = entry.date
      if (entry.language) item.language = entry.language
      if (entry.volume) item.volume = `${ entry.volume }`
      if (entry.issue) item.issue = `${ entry.issue }`
      if (entry['page-range']) item.pages = normalizePageRange(entry['page-range'])

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
      if (serial.pmid) item.PMID = serial.pmid
      if (serial.pmcid) item.PMCID = serial.pmcid
      if (serial.serial) {
        if (item.itemType === 'report') item.reportNumber = serial.serial
        else if (item.itemType === 'patent') item.patentNumber = serial.serial
        else if (item.itemType === 'case') item.docketNumber = serial.serial
        else item.extra = `${ item.extra || '' }\nSerial Number: ${ serial.serial }`.trim()
      }
      if (serial.version) {
        if (item.itemType === 'computerProgram') item.versionNumber = serial.version
        else item.extra = `${ item.extra || '' }\nVersion: ${ serial.version }`.trim()
      }

      const parent = pickParent(entry)
      if (parent?.title) {
        switch ((parent.type || '').toLowerCase()) {
          case 'newspaper':
            item.publicationTitle = parent.title
            break

          case 'conference':
            item.conferenceName = parent.title
            break

          case 'periodical':
            item.publicationTitle = parent.title
            break

          case 'blog':
            item.websiteTitle = parent.title
            break

          case 'thread':
            item.forumTitle = parent.title
            break

          case 'web':
            item.websiteTitle = parent.title
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

      const seenCreators = new Set(item.creators.map(creatorFingerprint))
      for (const creator of parseAffiliated(entry)) {
        const key = creatorFingerprint(creator)
        if (seenCreators.has(key)) continue
        seenCreators.add(key)
        item.creators.push(creator)
      }

      await item.complete()
    }
  }
}
