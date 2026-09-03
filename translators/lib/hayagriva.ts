declare const Zotero: any

import * as hg from '../../gen/typings/hayagriva'

import * as dateparser from '../../content/dateparser'
import { Serialized } from '../../gen/typings/serialized'
import type { Collected } from './collect'
import { Translation } from './translator'
import { Schema, simplifyForExport } from '../../content/item-schema'
import { log } from '../../content/logger'
import { Fields as ParsedExtraFields, get as getExtra } from '../../content/extra'
import { Postscript, postscript as compile, noop } from '../lib/postscript'
import { clone } from '../../content/object'
import clean from 'clean-deep'

type Bibliography = Record<string, hg.TopLevelEntry>

const hayagrivaType: Record<Serialized.RegularItem['itemType'], hg.EntryType> = {
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
  preprint: 'report',
  presentation: 'article',
  radioBroadcast: 'audio',
  report: 'report',
  standard: 'report',
  statute: 'legislation',
  thesis: 'thesis',
  tvBroadcast: 'video',
  videoRecording: 'video',
  webpage: 'web',
}

const zoteroType: Record<hg.EntryType, Serialized.RegularItem['itemType']> = {
  anthology: 'book',
  anthos: 'bookSection',
  article: 'journalArticle',
  artwork: 'artwork',
  audio: 'audioRecording',
  blog: 'webpage',
  book: 'book',
  case: 'case',
  chapter: 'bookSection',
  conference: 'conferencePaper',
  entry: 'dictionaryEntry',
  exhibition: 'document',
  legislation: 'statute',
  manuscript: 'manuscript',
  misc: 'document',
  newspaper: 'newspaperArticle',
  original: 'document',
  patent: 'patent',
  performance: 'document',
  periodical: 'journalArticle',
  post: 'webpage',
  proceedings: 'document',
  reference: 'dictionaryEntry',
  report: 'report',
  repository: 'computerProgram',
  scene: 'document',
  thesis: 'thesis',
  thread: 'forumPost',
  video: 'videoRecording',
  web: 'webpage',
}

function sanitizeKey(id: string): string {
  return (id || 'item').replace(/[^a-zA-Z0-9:_-]/g, '_')
}

function normalizeScalar(value: unknown): string {
  if (value === null || typeof value === 'undefined') return ''
  if (typeof value === 'string') return value.trim()
  if (typeof value === 'number') return `${value}`.trim()
  if (typeof value === 'boolean') return (value ? 'true' : 'false')
  if (typeof value === 'bigint') return value.toString().trim()
  return ''
}

function normalizePageRange(value: unknown): string {
  const pages = normalizeScalar(value)
  if (!pages) return ''
  return pages.replace(/--+/g, '-')
}

const seasons = ['', 'Spring', 'Summer', 'Autumn', 'Winter']

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

function normalizeType(value: unknown): string {
  return normalizeScalar(value).toLowerCase()
}

function makeParent(item: Serialized.RegularItem): hg.ParentEntry | undefined {
  switch (item.itemType) {
    case 'journalArticle':
    case 'magazineArticle':
      if (item.publicationTitle) return { type: 'periodical', title: item.publicationTitle }
      break

    case 'newspaperArticle':
      if (item.publicationTitle) return { type: 'newspaper', title: item.publicationTitle }
      break

    case 'bookSection':
      if (item.publicationTitle) return { type: 'book', title: item.publicationTitle }
      break

    case 'conferencePaper': {
      const title = item.conferenceName || item.publicationTitle || item.meetingName
      if (title) return { type: item.DOI || item.publicationTitle ? 'proceedings' : 'conference', title }
      break
    }

    case 'blogPost':
      if (item.publicationTitle) return { type: 'blog', title: item.publicationTitle }
      break

    case 'webpage':
      if (item.publicationTitle) return { type: 'web', title: item.publicationTitle }
      break

    case 'forumPost':
      if (item.publicationTitle) return { type: 'thread', title: item.publicationTitle }
      break

    case 'presentation':
      return {
        title: item.meetingName || item.publisher,
        location: item.place,
        type: item.meetingName ? 'conference' : undefined,
      }

    case 'preprint':
      if (item.libraryCatalog) return { title: item.libraryCatalog }
      break
  }

  return undefined
}

type SerialNumberObject = Extract<hg.SerialNumber, object>
function parseExtraSerialNumbers(extra: unknown): SerialNumberObject {
  const serial: SerialNumberObject = {}
  const lines = normalizeScalar(extra).split(/\r?\n/)

  for (const line of lines) {
    const matched = line.trim().match(/^(DOI|ISBN|ISSN|PMID|PMCID|Version|Version Number|Report Number|Patent Number|Docket Number)\s*:\s*(.+)$/i)
    if (!matched) continue

    const label = matched[1].toLowerCase()
    const value = normalizeScalar(matched[2])
    if (!value) continue

    switch (label) {
      case 'version':
      case 'version number':
        serial.version = value
        break

      case 'report number':
      case 'patent number':
      case 'docket number':
        serial.serial = value
        break

      default:
        serial[label] = value
        break
    }
  }

  return serial
}

function serialNumber(item: Serialized.RegularItem): SerialNumberObject {
  const serial: SerialNumberObject = {
    doi: item.DOI,
    isbn: item.ISBN,
    issn: item.ISSN,
    pmid: item.PMID,
    pmcid: item.PMCID,
  }

  switch (item.itemType) {
    case 'report':
    case 'patent':
    case 'case':
      serial.serial = item.number
      break

    case 'computerProgram':
      serial.version = item.versionNumber
      break
  }

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

const zoteroCreatorType: Record<string, string> = {
  collaborator: 'contributor',
  composer: 'composer',
  director: 'director',
  holder: 'inventor',
  illustrator: 'artist',
  producer: 'producer',
  translator: 'translator',
  writer: 'contributor',
}

function parseAffiliated(entry: hg.BibliographyEntry): Array<{ creatorType: string; firstName?: string; lastName?: string; name?: string; fieldMode?: number }> {
  return asArray(entry.affiliated).flatMap(affiliated => {
    const creatorType = zoteroCreatorType[normalizeType(affiliated?.role)]
    if (!creatorType) return []

    return asArray(affiliated?.names)
      .map(person => parsePerson(person))
      .filter(parsed => Object.keys(parsed).length > 0)
      .map(parsed => ({ creatorType, ...parsed }))
  })
}

function parsePerson(person: hg.Person): { firstName?: string; lastName?: string; name?: string; fieldMode?: number } {
  if (typeof person === 'string') {
    const parts = person.split(',').map(part => part.trim()).filter(Boolean)
    if (parts.length >= 2) return { lastName: parts[0], firstName: parts.slice(1).join(', ') }
    if (parts.length === 1) return { name: parts[0], fieldMode: 1 }
  }
  else {
    if (person['given-name']) return { lastName: person.name || '', firstName: person['given-name'] || '' }
    if (person.name) return { name: person.name, fieldMode: 1 }
  }

  return {}
}

function asArray<T>(source: T | T[] | null | undefined): T[] {
  if (!source) return []
  return Array.isArray(source) ? source : [source]
}

function normalizeURL(url: hg.BibliographyEntry['url']): { value?: string; date?: string } {
  if (!url) return {}
  if (typeof url === 'string') return { value: url }

  return {
    value: url.value,
    date: typeof url.date === 'number' || typeof url.date === 'string' ? `${url.date}` : undefined,
  }
}

function normalizePublisher(publisher?: hg.Publisher): { name?: string; location?: string } {
  if (!publisher) return {}
  if (typeof publisher === 'string') return { name: publisher }
  return { name: publisher.name, location: publisher.location }
}

function pickParent(entry: hg.BibliographyEntry): hg.BibliographyEntry | null {
  return asArray(entry.parent)[0] || null
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
  public fromZotero(item: Serialized.RegularItem, skipField: RegExp): hg.TopLevelEntry {
    const entry: hg.BibliographyEntry = {
      type: hayagrivaType[item.itemType] || 'misc',
      title: item.title,
      language: item.language,
      volume: item.volume,
      issue: item.issue,
      'page-range': normalizePageRange(item.pages),
      url: {
        value: item.url,
        date: dateOnly(item.accessDate),
      },
      parent: makeParent(item),
      genre: item.type,
    }

    if (item.date) {
      entry.date = dateOnly(item.date, item.originalDate)
    }
    else if (item.itemType === 'webpage' && item.accessDate) {
      entry.date = dateOnly(item.accessDate)
    }

    const serial = serialNumber(item)
    if (hasContent(serial)) entry['serial-number'] = serial

    const primary = Schema.primaryCreator[item.itemType] || 'author'
    const creators: Record<string, string[]> = {
      author: [],
      editor: [],
      translator: [],
      collaborator: [],
    }
    for (const creator of item.creators || []) {
      const name = creator.name || [creator.lastName, creator.firstName].filter(part => part).join(', ')
      if (!name) continue

      switch (creator.creatorType) {
        case primary:
        case 'author':
          creators.author.push(name)
          break
        case 'editor':
          creators.editor.push(name)
          break
        case 'translator':
          creators.translator.push(name)
          break
        default:
          creators.collaborator.push(name)
          break
      }
    }

    for (const [ role, persons ] of Object.entries(creators)) {
      entry[role] = persons.length === 1 ? persons[0] : persons
    }

    if (skipField) {
      for (const field of Object.keys(entry)) {
        if (`hayagriva.${entry.type}.${field}`.match(skipField)) delete entry[field]
      }
    }

    return clean(entry) as hg.TopLevelEntry
  }

  private compile(postscript?: string): Postscript {
    postscript = postscript?.trim() || ''
    if (!postscript) return noop

    try {
      return compile('hayagriva', postscript)
    }
    catch (err) {
      log.error(`failed to install postscript\n${postscript}`, err)
      return noop
    }
  }

  public export(items: Iterable<Serialized.RegularItem>, translation: Translation): string {
    const postscript = this.compile(translation.collected.preferences.postscript)

    const doc: Bibliography = {}
    const duplicates: Set<string> = new Set
    for (const item of items) {
      const key = sanitizeKey(item.citationKey || item.itemKey)
      if (doc[key]) {
        duplicates.add(key)
      }
      else {
        const extraFields: ParsedExtraFields = clone(item.extraFields)
        Object.assign(item, getExtra(item.extra, 'zotero'))
        simplifyForExport(item, { clone: false })
        doc[key] = this.fromZotero(item, translation.skipField)
        postscript(doc[key], item, translation, extraFields)
      }
    }

    const header = duplicates.size
      ? `# duplicate keys found, only first duplicate retained:\n# ${JSON.stringify([...duplicates].sort())}\n`
      : ''
    return header + Zotero.BetterBibTeX.yamlDump(doc, { skipInvalid: true, sortKeys: true, lineWidth: -1 })
  }

  public async import(bib: Bibliography): Promise<void> {
    for (const [id, entry] of Object.entries(bib)) {
      if (!entry || typeof entry !== 'object') continue

      const type = normalizeType(entry.type) || 'misc'
      const item = new Zotero.Item(zoteroType[type] || 'document')

      item.extra = `${item.extra || ''}\nCitation Key: ${sanitizeKey(id)}`.trim()

      if (entry.title) item.title = entry.title
      if (entry.date) item.date = entry.date
      if (entry.language) item.language = entry.language
      if (entry.volume) item.volume = `${entry.volume}`
      if (entry.issue) item.issue = `${entry.issue}`
      if (entry['page-range']) item.pages = normalizePageRange(entry['page-range'])

      const url = normalizeURL(entry.url)
      if (url.value) item.url = url.value
      if (url.date) item.accessDate = url.date

      const publisher = normalizePublisher(entry.publisher)
      if (publisher.name) item.publisher = publisher.name
      if (publisher.location) item.place = publisher.location

      let serial: SerialNumberObject
      if (!entry['serial-number']) {
        serial = {}
      }
      else if (typeof entry['serial-number'] === 'number' || entry['serial-number'] === 'string') {
        serial = { serial: `${entry['serial-number']}` }
      }
      else {
        serial = entry['serial-number'] as SerialNumberObject
      }
      if (serial.doi) item.DOI = serial.doi
      if (serial.isbn) item.ISBN = serial.isbn
      if (serial.issn) item.ISSN = serial.issn
      if (serial.pmid) item.PMID = serial.pmid
      if (serial.pmcid) item.PMCID = serial.pmcid
      if (serial.serial) {
        if (item.itemType === 'report') item.reportNumber = serial.serial
        else if (item.itemType === 'patent') item.patentNumber = serial.serial
        else if (item.itemType === 'case') item.docketNumber = serial.serial
        else item.extra = `${item.extra || ''}\nSerial Number: ${serial.serial}`.trim()
      }
      if (serial.version) {
        if (item.itemType === 'computerProgram') {
          item.versionNumber = serial.version
        }
        else {
          item.extra = `${item.extra || ''}\nVersion: ${serial.version}`.trim()
        }
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

      for (const person of asArray(entry.author)) {
        const parsed = parsePerson(person)
        if (!Object.keys(parsed).length) continue
        item.creators.push({ creatorType: 'author', ...parsed })
      }

      for (const person of asArray(entry.editor)) {
        const parsed = parsePerson(person)
        if (!Object.keys(parsed).length) continue
        item.creators.push({ creatorType: 'editor', ...parsed })
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

export function generateHayagriva(collected: Collected): Translation {
  const translation = Translation.Export(collected)
  translation.output.body = Hayagriva.export(collected.items.regular, translation)
  return translation
}
