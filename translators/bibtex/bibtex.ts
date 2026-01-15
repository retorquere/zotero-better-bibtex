declare const Zotero: any

import * as escape from '../../content/escape'
import { log } from '../../content/logger'
import { Exporter as BibTeXExporter } from './exporter'
import { parse as arXiv } from '../../content/arXiv'
import { ItemType } from '../../content/item-type'
import wordsToNumbers from '@insomnia-dev/words-to-numbers'

import { ParsedDate, parse as parseDate, strToISO as strToISODate, century } from '../../content/dateparser'
import { toEnglishOrdinal } from '../../content/text'

import { parseBuffer as parsePList } from 'bplist-parser'

import type { Collected } from '../lib/collect'
import { Translation } from '../lib/translator'

import { Entry as BaseEntry, Config } from './entry'

import { Library, Entry as BibTeXEntry, JabRefMetadata, ParseError, Creator, parseAsync as parse } from '@retorquere/bibtex-parser'

function unique(value, index, self) {
  return self.indexOf(value) === index
}
function asarray(v?: string | number | string[]): string[] {
  if (!v) return []
  if (Array.isArray(v)) return v
  return [ `${v}` ]
}

const config: Config = {
  caseConversion: {
    title: true,
    series: true,
    shorttitle: true,
    booktitle: true,
    type: true,

    // only for imports
    origtitle: true,
    maintitle: true,
    eventtitle: true,
  },

  fieldEncoding: {
    groups: 'verbatim', // blegh jabref field
    url: 'verbatim',
    doi: 'verbatim',
    // school: 'literal'
    institution: 'literal_list',
    publisher: 'literal_list',
    organization: 'literal_list',
    address: 'literal',
  },

  typeMap: {
    csl: {
      article: 'article',
      'article-journal': 'article',
      'article-magazine': 'article',
      'article-newspaper': 'article',
      bill: 'misc',
      book: 'book',
      broadcast: 'misc',
      chapter: 'incollection',
      dataset: 'misc',
      entry: 'incollection',
      'entry-dictionary': 'incollection',
      'entry-encyclopedia': 'incollection',
      figure: 'misc',
      graphic: 'misc',
      interview: 'misc',
      legal_case: 'misc',
      legislation: 'misc',
      manuscript: 'unpublished',
      map: 'misc',
      motion_picture: 'misc',
      musical_score: 'misc',
      pamphlet: 'booklet',
      'paper-conference': 'inproceedings',
      patent: 'misc',
      personal_communication: 'misc',
      post: 'misc',
      'post-weblog': 'misc',
      report: 'techreport',
      review: 'article',
      'review-book': 'article',
      song: 'misc',
      speech: 'misc',
      thesis: 'phdthesis',
      treaty: 'misc',
      webpage: 'misc',
    },
    zotero: {
      artwork: 'misc',
      audioRecording: 'misc',
      bill: 'misc',
      blogPost: 'misc',
      book: 'book',
      bookSection: 'incollection',
      case: 'misc',
      computerProgram: 'misc',
      conferencePaper: 'inproceedings',
      dictionaryEntry: 'misc',
      document: 'misc',
      email: 'misc',
      encyclopediaArticle: 'article',
      film: 'misc',
      forumPost: 'misc',
      hearing: 'misc',
      instantMessage: 'misc',
      interview: 'misc',
      journalArticle: 'article',
      letter: 'misc',
      magazineArticle: 'article',
      manuscript: 'unpublished',
      map: 'misc',
      newspaperArticle: 'article',
      patent: 'patent',
      podcast: 'misc',
      preprint: 'misc',
      presentation: 'misc',
      radioBroadcast: 'misc',
      report: 'techreport',
      statute: 'misc',
      thesis: 'phdthesis',
      tvBroadcast: 'misc',
      videoRecording: 'misc',
      webpage: 'misc',
    },
  },
}

class Entry extends BaseEntry {
  private lintrules: Record<string, { required: string[]; optional: string[] }> = {
    article: {
      required: [ 'author', 'title', 'journal', 'year' ],
      optional: [ 'volume', 'number', 'pages', 'month', 'note', 'key' ],
    },
    book: {
      required: [ 'author/editor', 'title', 'publisher', 'year' ],
      optional: [ 'volume/number', 'series', 'address', 'edition', 'month', 'note', 'key' ],
    },
    booklet: {
      required: ['title'],
      optional: [ 'author', 'howpublished', 'address', 'month', 'year', 'note', 'key' ],
    },
    conference: {
      required: [ 'author', 'title', 'booktitle', 'year' ],
      optional: [ 'editor', 'volume/number', 'series', 'pages', 'address', 'month', 'organization', 'publisher', 'note', 'key' ],
    },
    inbook: {
      required: [ 'author/editor', 'title', 'chapter/pages', 'publisher', 'year' ],
      optional: [ 'volume/number', 'series', 'type', 'address', 'edition', 'month', 'note', 'key' ],
    },
    incollection: {
      required: [ 'author', 'title', 'booktitle', 'publisher', 'year' ],
      optional: [ 'editor', 'volume/number', 'series', 'type', 'chapter', 'pages', 'address', 'edition', 'month', 'note', 'key' ],
    },
    inproceedings: {
      required: [ 'author', 'title', 'booktitle', 'year' ],
      optional: [ 'editor', 'volume/number', 'series', 'pages', 'address', 'month', 'organization', 'publisher', 'note', 'key' ],
    },
    manual: {
      required: ['title'],
      optional: [ 'author', 'organization', 'address', 'edition', 'month', 'year', 'note', 'key' ],
    },
    mastersthesis: {
      required: [ 'author', 'title', 'school', 'year' ],
      optional: [ 'type', 'address', 'month', 'note', 'key' ],
    },
    misc: {
      required: [],
      optional: [ 'author', 'title', 'howpublished', 'month', 'year', 'note', 'key' ],
    },
    phdthesis: {
      required: [ 'author', 'title', 'school', 'year' ],
      optional: [ 'type', 'address', 'month', 'note', 'key' ],
    },
    proceedings: {
      required: [ 'title', 'year' ],
      optional: [ 'editor', 'volume/number', 'series', 'address', 'month', 'organization', 'publisher', 'note', 'key' ],
    },
    techreport: {
      required: [ 'author', 'title', 'institution', 'year' ],
      optional: [ 'type', 'number', 'address', 'month', 'note', 'key' ],
    },
    unpublished: {
      required: [ 'author', 'title', 'note' ],
      optional: [ 'month', 'year', 'key' ],
    },
  }

  public lint(_explanation) {
    const type = this.lintrules[this.entrytype.toLowerCase()]
    if (!type) return

    // let fields = Object.keys(this.has)
    const warnings: string[] = []

    for (const required of type.required) {
      const match = required.split('/').find(field => this.has[field])
      if (match) {
        // fields = fields.filter(field => field !== match)
      }
      else {
        warnings.push(`Missing required field '${ required }'`)
      }
    }

    // bibtex is so incredibly lax, forget about optionals-checking
    /*
    for (const field of fields) {
      if (!type.optional.find(allowed => allowed.split('/').includes(field))) warnings.push(`Unexpected field '${field}'`)
    }
    */

    return warnings
  }

  public addCreators() {
    if (!this.item.creators || !this.item.creators.length) return

    // split creators into subcategories
    const authors = []
    const editors = []
    const translators = []
    const collaborators = []
    const primaryCreatorType = Zotero.Utilities.getCreatorsForType(this.item.itemType)[0]

    for (const creator of this.item.creators) {
      switch (creator.creatorType) {
        case 'editor':
        case 'seriesEditor':
          editors.push(creator)
          break
        case 'translator':
          translators.push(creator)
          break
        case primaryCreatorType:
          authors.push(creator)
          break
        default:
          collaborators.push(creator)
          break
      }
    }

    this.remove('author')
    this.remove('editor')
    this.remove('translator')
    this.remove('collaborator')

    this.add({ name: 'author', value: authors, enc: 'creators' })
    this.add({ name: 'editor', value: editors, enc: 'creators' })
    this.add({ name: 'translator', value: translators, enc: 'creators' })
    this.add({ name: 'collaborator', value: collaborators, enc: 'creators' })
  }
}

class Importer {
  private translation: Translation
  private itemIDs: Record<string, number> = {}

  constructor(collected: Collected) {
    this.translation = Translation.Import(collected)
  }

  importGroup(group, root = false) {
    const collection = this.translation.collected.collection()
    collection.type = 'collection'
    collection.name = group.name
    collection.children = group.entries.filter(citekey => this.itemIDs[citekey]).map(citekey => ({ type: 'item', id: this.itemIDs[citekey] }))

    for (const subgroup of group.groups || []) {
      collection.children.push(this.importGroup(subgroup))
    }

    if (root) collection.complete()
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return collection
  }

  public async import(): Promise<void> {
    const collected = this.translation.collected

    if (collected.preferences.strings && collected.preferences.importBibTeXStrings) {
      collected.input = `${ collected.preferences.strings }\n${ collected.input }`
    }

    const bib = await parseBibTeX(this.translation)
    const errors: ParseError[] = bib.errors

    const whitelist = bib.comments
      .filter((comment: string) => comment.startsWith('zotero-better-bibtex:whitelist:'))
      .map((comment: string) => comment.toLowerCase().replace(/\s/g, '').split(':').pop().split(',').filter((key: string) => key))[0]

    let imported = 0
    let id = 0
    for (const bibtex of bib.entries) {
      if (bibtex.key && whitelist && !whitelist.includes(bibtex.key.toLowerCase())) continue

      id++
      if ((id % 1000) === 0) await new Promise(resolve => setTimeout(resolve, 0))

      if (bibtex.key) this.itemIDs[bibtex.key] = id // Endnote has no citation keys

      try {
        const item = collected.item('journalArticle')
        item.itemID = id
        const builder = new ZoteroItem(this.translation, item, bibtex, bib.jabref)
        if (builder.import(errors)) await item.complete()
      }
      catch (err) {
        errors.push({ error: err.message, input: '' })
      }

      imported += 1
      collected.progress(imported / bib.entries.length * 100)
    }

    for (const group of bib.jabref.root || []) {
      this.importGroup(group, true)
    }

    if (errors.length) {
      const item = collected.item('note')
      item.note = 'Import errors found: <ul>'
      for (const err of errors) {
        item.note += '<li>'
        item.note += escape.html(err.error)
        if (err.input) {
          item.note += `<pre>${ escape.html(err.input) }</pre>`
        }
        item.note += '</li>'
      }
      item.note += '</ul>'
      item.tags = [{ tag: '#Better BibTeX import error', type: 1 }]
      await item.complete()
    }

    collected.progress(100)
  }
}

export async function importBibTeX(collected: Collected): Promise<void> {
  const importer = new Importer(collected)
  await importer.import()
}

function addDate(ref: Entry, date: ParsedDate | { type: 'none' }, verbatim: string) {
  const print = (d: ParsedDate) => {
    switch (d.type) {
      case 'date':
      case 'season':
        return d.year
      case 'century':
        return century(d.century)
      default:
        return ''
    }
  }
  if (date.type === 'interval') {
    const { from, to } = date

    if (from.type === 'open' && to.type === 'open') return

    if (from.type === 'open') {
      date = to
    }
    else if (to.type === 'open' || (from.year && from.year === to.year)) {
      date = from
    }
    else if (ref.add({ name: 'year', value: [print(from), print(to)].filter(_ => _).join('\u2013') })) {
      return
    }
    else {
      ref.add({ name: 'year', value: verbatim })
    }
  }

  switch (date.type) {
    case 'open':
    case 'none':
      return

    case 'verbatim':
      ref.add({ name: 'year', value: date.verbatim })
      return

    case 'century':
      ref.add({ name: 'year', value: century(date.century) })
      return

    case 'date':
      if (date.month) ref.add({ name: 'month', value: months[date.month - 1], bare: date.month <= 12 })
      if (date.orig?.type === 'date') {
        ref.add({ name: 'year', value: `[${ date.orig.year }] ${ date.year }` })
      }
      else {
        ref.add({ name: 'year', value: `${date.year}`, bare: true })
      }
      return

    case 'season':
      ref.add({ name: 'year', value: date.year, bare: true })
      break

    default:
      if (!date.type && date.orig?.type === 'date') {
        ref.add({ name: 'year', value: `[${ date.orig.year }]` })
      }
      else {
        log.error(`Unexpected date type ${ JSON.stringify({ date: verbatim, parsed: date }) }`)
      }
  }
}

export function generateBibTeX(collected: Collected): Translation {
  const translation = Translation.Export(collected)
  translation.bibtex = new BibTeXExporter(translation)

  Entry.installPostscript(translation)
  translation.bibtex.prepare_strings()

  // translation.output += `\n% ${translation.header.label}\n`

  for (const item of translation.bibtex.items) {
    const ref = new Entry(item, config, translation)
    if (item.itemType === 'report' && item.type?.toLowerCase().includes('manual')) ref.entrytype = 'manual'
    if ([ 'zotero.bookSection', 'csl.chapter', 'tex.chapter' ].includes(ref.entrytype_source) && ref.hasCreator('bookAuthor')) ref.entrytype = 'inbook'

    ref.add({ name: 'address', value: item.place })
    ref.add({ name: 'chapter', value: item.section })
    ref.add({ name: 'edition', value: ref.english && collected.preferences.bibtexEditionOrdinal ? toEnglishOrdinal(item.edition) : item.edition })
    ref.add({ name: 'type', value: item.type })
    ref.add({ name: 'series', value: item.series, bibtexStrings: true })
    ref.add({ name: 'title', value: item.title })
    ref.add({ name: 'copyright', value: item.rights })
    ref.add({ name: 'isbn', value: item.ISBN })
    ref.add({ name: 'issn', value: item.ISSN })
    ref.add({ name: 'lccn', value: item.callNumber })
    ref.add({ name: 'shorttitle', value: item.shortTitle })
    ref.add({ name: 'abstract', value: item.abstractNote?.replace(/\n+/g, ' ') })
    ref.add({ name: 'nationality', value: item.country })
    ref.add({ name: 'assignee', value: item.assignee })

    // this needs to be order volume - number for #1475
    ref.add({ name: 'volume', value: ref.normalizeDashes(item.volume) })
    if (![ 'book', 'inbook', 'incollection', 'proceedings', 'inproceedings' ].includes(ref.entrytype) || !ref.has.volume) ref.add({ name: 'number', value: item.number || item.issue || item.seriesNumber })
    ref.add({ name: 'urldate', value: item.accessDate && item.accessDate.replace(/\s*T?\d+:\d+:\d+.*/, '') })

    const journalAbbreviation = translation.collected.displayOptions.useJournalAbbreviation && (item.journalAbbreviation || item.autoJournalAbbreviation)
    if (ref.entrytype_source === 'zotero.conferencePaper') {
      ref.add({ name: 'booktitle', value: journalAbbreviation || item.publicationTitle || item.conferenceName, bibtexStrings: true })
    }
    else if ([ 'zotero.bookSection', 'tex.chapter', 'csl.chapter' ].includes(ref.entrytype_source)) {
      ref.add({ name: 'booktitle', value: item.publicationTitle || item.conferenceName, bibtexStrings: true })
    }
    else if (ref.getBibString(item.publicationTitle)) {
      ref.add({ name: 'journal', value: item.publicationTitle, bibtexStrings: true })
    }
    else {
      ref.add({ name: 'journal', value: journalAbbreviation || item.publicationTitle, bibtexStrings: true })
    }

    let reftype = ref.entrytype_source.split('.')[1]
    if (reftype.endsWith('thesis')) reftype = 'thesis' // # 1965
    switch (reftype) {
      case 'thesis':
        ref.add({ name: 'school', value: item.publisher, bibtexStrings: true })
        break

      case 'report':
        ref.add({ name: 'institution', value: item.publisher, bibtexStrings: true })
        break

      case 'computerProgram':
        ref.add({ name: 'howpublished', value: item.publisher, bibtexStrings: true })
        break

      default:
        ref.add({ name: 'publisher', value: item.publisher, bibtexStrings: true })
        break
    }

    const doi = item.DOI || item.extraFields.kv.DOI
    let urlfield = null
    if (collected.preferences.DOIandURL !== 'doi' || !doi) {
      switch (collected.preferences.bibtexURL) {
        case 'url':
        case 'url-ish':
          urlfield = ref.add({
            name: 'url',
            value: item.url || item.extraFields.kv.url,
            enc: translation.collected.preferences.bibtexURL === 'url' && translation.isVerbatimField('url') ? 'url' : 'literal',
          })
          break

        case 'note':
        case 'note-url-ish':
          urlfield = ref.add({
            name: ([ 'misc', 'booklet' ].includes(ref.entrytype) && !ref.has.howpublished ? 'howpublished' : 'note'),
            value: item.url || item.extraFields.kv.url,
            enc: translation.collected.preferences.bibtexURL === 'note' ? 'url' : 'literal',
          })
          break

        default:
          if ([ 'csl.webpage', 'zotero.webpage', 'csl.post', 'csl.post-weblog' ].includes(ref.entrytype_source)) {
            urlfield = ref.add({ name: 'howpublished', value: item.url || item.extraFields.kv.url })
          }
          break
      }
    }
    if (translation.collected.preferences.DOIandURL !== 'url' || !urlfield) {
      ref.add({ name: 'doi', value: (doi || '').replace(/^https?:\/\/doi.org\//i, ''), enc: translation.isVerbatimField('doi') ? 'verbatim' : 'literal' })
    }

    if (ref.entrytype_source.split('.')[1] === 'thesis') {
      const thesistype = ref.thesistype(item.type, 'phdthesis', 'mastersthesis')
      if (thesistype) {
        ref.entrytype = thesistype
        ref.remove('type')
      }
    }

    // #1471 and http://ctan.cs.uu.nl/biblio/bibtex/base/btxdoc.pdf: organization The organization that sponsors a conference or that publishes a manual.
    if (ref.entrytype === 'inproceedings') {
      const sponsors = []
      item.creators = item.creators.filter(creator => {
        if (creator.creatorType !== 'sponsor') return true

        let sponsor = creator.source
        sponsor = sponsor.replace(/ and /g, ' {and} ')
        if (translation.and.names.repl !== ' {and} ') sponsor = sponsor.replace(translation.and.names.re, translation.and.names.repl)

        sponsors.push(sponsor)
        return false
      })
      ref.add({ name: 'organization', value: sponsors.join(translation.collected.preferences.separatorList) })
    }
    ref.addCreators()
    // #1541
    if (ref.entrytype === 'inbook' && ref.has.author && ref.has.editor) delete ref.has.editor

    addDate(ref, ref.date, item.date)

    ref.add({ name: 'pmid', value: item.PMID })
    ref.add({ name: 'pmcid', value: item.PMCID })

    ref.add({ name: 'keywords', value: item.tags, enc: 'tags' })

    ref.add({ name: 'pages', value: ref.normalizeDashes(item.pages) })

    ref.add({ name: 'file', value: item.attachments, enc: 'attachments' })

    ref.complete()
  }

  translation.bibtex.complete()
  return translation
}

const preloadedStrings = new class PreloadedStrings {
  public strings = ''
  public enabled = false

  private loaded = false

  load(translation: Translation) {
    this.enabled = translation.collected.preferences.importJabRefStrings

    if (this.enabled && !this.loaded) {
      this.loaded = true
      this.strings = Zotero.File.getContentsFromURL('chrome://zotero-better-bibtex/content/resource/bibtex/strings.bib')
    }
  }
}

const unabbreviations = new class Unabbreviations {
  public unabbr: Record<string, string> = {}
  public enabled = false

  private loaded = false

  load(translation: Translation) {
    this.enabled = translation.collected.preferences.importJabRefAbbreviations

    if (this.enabled && !this.loaded) {
      this.loaded = true
      this.unabbr = JSON.parse(Zotero.File.getContentsFromURL('chrome://zotero-better-bibtex/content/resource/bibtex/unabbrev.json'))
    }
  }
}

async function parseBibTeX(translation: Translation): Promise<Library> {
  preloadedStrings.load(translation)
  unabbreviations.load(translation)

  return await parse(translation.collected.input, {
    // we are actually sure it's a valid enum value; stupid workaround for TS2322: Type 'string' is not assignable to type 'boolean | "as-needed" | "strict"'.
    unsupported: (node, tex: string, _entry) => {
      switch (translation.collected.preferences.importUnknownTexCommand) {
        case 'tex':
          return `<script>${tex}</script>`
        case 'text':
          return node.type === 'macro' ? node.content : tex
        case 'ignore':
          return ''
        default:
          return tex
      }
    },
    english: translation.collected.preferences.importSentenceCase !== 'off',
    sentenceCase: {
      guess: translation.collected.preferences.importSentenceCase === 'on+guess',
      preserveQuoted: !translation.collected.preferences.importSentenceCaseQuoted,
    },
    caseProtection: (translation.collected.preferences.importCaseProtection as 'as-needed'),
    verbatimFields: translation.verbatimFields,
    raw: translation.collected.preferences.rawImports,
    strings: preloadedStrings.enabled ? preloadedStrings.strings : '',
    removeOuterBraces: [ 'doi', 'publisher', 'location', 'title', 'booktitle' ],
  })
}

const months = [ 'jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec', 'spring', 'summer', 'fall', 'winter' ]
class ZoteroItem {
  private event: Set<string>

  public typeMap = {
    article: 'journalArticle',
    audio: 'audioRecording',
    book: 'book',
    book_section: 'bookSection', // mendeley made-up entry type
    booklet: 'book',
    codefragment: 'computerProgram',
    collection: 'book',
    conference: 'conferencePaper',
    constitution: 'statute',
    dataset: 'dataset',
    film: 'film', // mendeley made-up entry type
    generic: 'journalArticle', // mendeley made-up entry type
    hardware: 'computerProgram',
    inbook: 'bookSection',
    image: 'artwork',
    incollection: 'bookSection',
    inproceedings: 'conferencePaper',
    inreference: 'encyclopediaArticle',
    jurisdiction: 'case',
    legadminmaterial: 'statute',
    legal: 'statute',
    legislation: 'statute',
    legmaterial: 'bill', // could also be 'hearing'
    magazine_article: 'magazineArticle', // mendeley made-up entry type
    manual: 'report',
    mastersthesis: 'thesis',
    movie: 'film',
    misc: 'document',
    newspaper_article: 'newspaperArticle', // mendeley made-up entry type
    online: 'webpage',
    patent: 'patent',
    periodical: 'document',
    phdthesis: 'thesis',
    presentation: 'presentation',
    proceedings: 'book',
    reference: 'book',
    report: 'report',
    software: 'computerProgram',
    softwaremodule: 'computerProgram',
    softwareversion: 'computerProgram',
    talk: 'presentation',
    techreport: 'report',
    thesis: 'thesis',
    unpublished: 'manuscript',
    video: 'videoRecording',
    web_page: 'webpage', // mendeley made-up entry type
    webpage: 'webpage', // papers3 made-up entry type

    // need better equivalents
    nameonly: '$document',
  }

  private extra: string[] = []
  private eprint: Record<string, string> = {}
  private validFields: Record<string, boolean>
  private patentNumberPrefix = ''

  constructor(private translation: Translation, private item: any, private bibtex: BibTeXEntry, private jabref: JabRefMetadata) {
    // hard for users to debug, replace with regular spaces
    this.bibtex = JSON.parse(JSON.stringify(this.bibtex, (k, v) => (typeof v === 'string' ? v.replace(/\u00A0/g, ' ').trim() : v) as string))
    this.event = new Set(translation.collected.preferences.importPlaceEvent.trim().split(/\s*,\s*/).filter(_ => _))
  }

  private fallback(fields: string[], value: string): boolean {
    const field = fields.reduce((acc: ItemType.Field, f: string) => (acc ?? ItemType.field(f)), null)
    if (field) {
      if (typeof value === 'string') value = value.replace(/\n+/g, '')
      this.extra.push(`${ field.extra }: ${ value }`)
      return true
    }
    return false
  }

  protected $crossref(): boolean {
    return true
  }

  protected $titleaddon(): boolean { return this.$title() }
  protected $subtitle(): boolean { return this.$title() }
  protected $title(): boolean {
    const title = [ ...asarray(this.bibtex.fields.title), ...asarray(this.bibtex.fields.titleaddon), ...asarray(this.bibtex.fields.subtitle) ].filter(unique).join('. ')
    return this.set(this.bibtex.fields.lista && this.validFields.publicationTitle ? 'publicationTitle' : 'title', title)
  }

  protected $holder(): boolean {
    if (this.item.itemType === 'patent') {
      this.item.assignee = this.bibtex.fields.holder
        .map(creator => [ creator.name, creator.lastName, creator.firstName ]
          .filter(name => name)
          .map((name: string) => name.replace(/"/g, ''))
          .join(', ')
        )
        .join('; ')
    }
    return true
  }

  protected $publisher(value: string, field: string): boolean {
    // difference between jurism and zotero. Prepending 'field' makes the import prefer exact matches to the input
    const candidates = [field].concat([ 'institution', 'publisher' ])
    field = candidates.find(f => this.validFields[f])
    if (!field) return this.fallback(candidates, value)

    const flatten = (v): string => typeof v === 'string' ? v : Array.isArray(v) ? v.join(' and ') : ''

    this.item[field] = [
      flatten(this.bibtex.fields.publisher),
      flatten(this.bibtex.fields.institution),
      flatten(this.bibtex.fields.school),
      flatten(this.bibtex.fields.organization),
    ].filter(v => v.replace(/[ \t\r\n]+/g, ' ').trim()).join(' / ')

    return true
  }

  protected $institution(value: string, field: string): boolean { return this.$publisher(value, field) }
  protected $school(value: string, field: string): boolean { return this.$publisher(value, field) }
  protected $organization(value: string, field: string): boolean { return this.$publisher(value, field) }

  protected $address(value: string, field: string): boolean {
    return this.$location(value, field)
  }

  protected $location(_value: string, _field: string): boolean {
    const clean = (a: string[]) => a.map((v: string) => v.replace(/[\n ]+/g, ' ').trim()).filter(_ => _).join(' and ')
    const location = {
      source: 'location',
      value: clean(asarray(this.bibtex.fields.location)),
    }
    const address = {
      source: 'address',
      value: clean(asarray(this.bibtex.fields.address)),
    }
    const place = this.event.size && this.event.has(this.bibtex.type) // #3287
      ? { field: location, extra: address }
      : { extra: location, field: address }
    if (!place.field.value) Object.assign(place, { field: place.extra, extra: place.field })

    if (place.field.value) {
      this.set('place', place.field.value, ['place'])
      if (place.extra.value) this.extra.push(`tex.${place.extra.source}: ${place.extra.value}`)

      // scrub so they are not double-dipped
      delete this.bibtex.fields.location
      delete this.bibtex.fields.address
    }

    return true
  }

  protected '$call-number'(value: string): boolean {
    return this.set('callNumber', value)
  }

  protected $edition(value: string): boolean {
    if (typeof value === 'string') {
      value = value.replace(/^([0-9]+)(st|nd|th)$/, '$1')
      const int = wordsToNumbers(value)
      if (typeof int === 'number') {
        value = `${ int }`
      }
      else if (int.match(/^[0-9]+$/)) {
        value = int
      }
    }
    return this.set('edition', value)
  }

  protected $isbn(value: string): boolean { return this.set('ISBN', value) }

  protected $booktitle(value: string): boolean {
    switch (this.item.itemType) {
      case 'book':
        if (this.bibtex.fields.title && this.bibtex.crossref?.donated.includes('booktitle')) return true
        if (this.bibtex.fields.title === value) return true
        if (!this.item.title) return this.set('title', value)
        break
    }

    if (this.validFields.publicationTitle) return this.set('publicationTitle', value)

    return this.fallback(['booktitle'], value)
  }

  protected $entrysubtype(value: string): boolean {
    const type = value.toLowerCase()

    switch (this.item.itemType) {
      case 'encyclopediaArticle':
      case 'journalArticle':
      case 'magazineArticle':
      case 'newspaperArticle':
        switch (type) {
          case 'encyclopedia':
          case 'magazine':
          case 'newspaper':
            this.item.itemType = `${ type }Article`
            return true
        }
        break

      case 'film':
      case 'tvBroadcast':
      case 'videoRecording':
        switch (type) {
          case 'film':
            this.item.itemType = 'film'
            return true
          case 'tvbroadcast':
          case 'tvepisode':
            this.item.itemType = 'tvBroadcast'
            return true
        }
        break
    }

    return false
  }

  protected $journaltitle(): boolean {
    let journal: { field: string; value: string }, abbr: { field: string; value: string } = null

    // journal-full is bibdesk
    const titles = [ 'journal-full', 'journal', 'journaltitle', 'shortjournal' ]
      .map(field => {
        const value = this.bibtex.fields[field]
        delete this.bibtex.fields[field] // this makes sure we're not ran again
        return { field, value }
      })
      .filter(candidate => candidate.value) // skip empty
      .filter(candidate => {
        if (unabbreviations.enabled && !abbr && candidate.field === 'shortjournal') { // shortjournal is assumed to be an abbrev
          abbr = candidate
          return false
        }
        return true
      })
      .filter(candidate => {
        // to be considered an abbrev, it must have at least two periods, and there can be no periods that are not followed by a space, and no space that are not preceded by a period
        const assumed_abbrev = unabbreviations.enabled && candidate.value.match(/[.].+[.]/) && !candidate.value.match(/[.][^ ]/) && !candidate.value.match(/[^.] /)
        if (assumed_abbrev) {
          if (!abbr) {
            abbr = candidate
            return false
          }
        }
        else if (!journal) { // first title is assumed to be the journal title
          journal = candidate
          return false
        }
        return true
      }).filter(candidate => {
        if (unabbreviations.enabled && journal && !abbr) {
          abbr = candidate
          return false
        }
        return true
      })

    // the remainder goes to the `extra` field
    for (const candidate of titles) {
      this.extra.push(`tex.${ candidate.field }: ${ candidate.value }`)
    }

    const resolve = (a: string): string => {
      if (!unabbreviations.enabled) return ''

      a = a.toUpperCase()
      let j: string

      if (j = unabbreviations.unabbr[a]) return j

      const m = a.match(/(.*)(\s+\S*\d\S*)$/)
      if (m && (j = unabbreviations.unabbr[m[1]])) return `${ j }${ m[2] }`

      return ''
    }

    let resolved: string
    if (abbr && !journal && (resolved = resolve(abbr.value))) {
      journal = { field: '', value: resolved }
    }
    else if (journal && !abbr && (resolved = resolve(journal.value))) {
      abbr = { ...journal }
      journal = { field: '', value: resolved }
    }

    if (journal) {
      switch (this.item.itemType) {
        case 'conferencePaper':
          this.set('series', journal.value)
          break

        default:
          this.set('publicationTitle', journal.value)
          break
      }
    }

    if (abbr) {
      if (this.validFields.journalAbbreviation) {
        this.item.journalAbbreviation = abbr.value
      }
      else if (!this.extra.find(line => line.startsWith('Journal abbreviation:'))) {
        this.extra.push(`Journal abbreviation: ${ abbr.value }`)
      }
      else if (abbr.field) {
        this.extra.push(`tex.${ abbr.field }: ${ abbr.value }`)
      }
    }

    return true
  }

  protected $journal(): boolean { return this.$journaltitle() }
  protected $shortjournal(): boolean { return this.$journaltitle() }
  protected '$journal-full'(): boolean { return this.$journaltitle() }

  protected $pages(value: string): boolean {
    if (!this.validFields.pages) return this.fallback(['pages'], value)
    this.set('pages', value)
    return true
  }

  protected $pagetotal(value: string): boolean {
    if (!this.validFields.numPages) return this.fallback(['numPages'], value)
    this.set('numPages', value)
    return true
  }

  protected $numpages(value: string): boolean { return this.$pagetotal(value) }

  protected $volume(value: string): boolean { return this.set('volume', value) }

  protected $doi(value: string): boolean { return this.set('DOI', value) }

  protected $abstract(value: string): boolean { return this.set('abstractNote', value) }

  protected $keywords(): boolean {
    const tags: string[] = []

    const add = (data: string | string[]) => {
      if (typeof data === 'string') {
        tags.push(...(data.split(/\s*[,;]\s*/)))
      }
      else if (data) {
        tags.push(...data)
      }
    }

    add(this.bibtex.fields.keywords)
    add(this.bibtex.fields.keyword)
    add(this.bibtex.fields.mesh)
    add(this.bibtex.fields.tags)

    this.item.tags = [...(new Set(tags.map(t => t.replace(/[\s\r\n]+/g, ' ')).filter(t => t)))].sort()
    return true
  }

  protected $keyword(): boolean { return this.$keywords() }
  protected $tags(): boolean { return this.$keywords() }
  protected $mesh(): boolean { return this.$keywords() } // bibdesk

  protected $date(): boolean {
    if (this.item.date) return true

    const dates: string[] = []
    if (this.bibtex.fields.date) dates.push(this.bibtex.fields.date)

    const year = this.bibtex.fields.year || ''

    let month = this.bibtex.fields.month || ''
    if (month) month = month.padStart(2, '0')

    let day = this.bibtex.fields.day || ''
    if (day) day = day.padStart(2, '0')

    if (year && month.match(/^[0-9]+$/) && day.match(/^[0-9]+$/)) {
      dates.push(`${ year }-${ month }-${ day }`)
    }
    else if (year && month.match(/^[0-9]+$/)) {
      dates.push(`${ year }-${ month }`)
    }
    else if (year && month && day) {
      dates.push(`${ day } ${ month } ${ year }`)
    }
    else if (year && month) {
      dates.push(`${ month } ${ year }`)
    }
    else if (year) {
      dates.push(year)
    }

    this.item.date = Array.from(new Set(dates)).join(', ')
    return true
  }

  protected $year(): boolean { return this.$date() }
  protected $month(): boolean { return this.$date() }
  protected $day(): boolean { return this.$date() }

  private addAttachment(att: any) {
    if (!att.path) return
    if (!this.item.attachments) this.item.attachments = []

    if (this.jabref.fileDirectory) att.path = `${ this.jabref.fileDirectory }${ this.translation.paths.sep }${ att.path }`

    att.title = att.title || att.path.split(/[\\/]/).pop().replace(/\.[^.]+$/, '')
    if (!att.title) delete att.title

    if (att.mimeType?.toLowerCase() === 'pdf' || (!att.mimeType && att.path.toLowerCase().endsWith('.pdf'))) {
      att.mimeType = 'application/pdf'
    }
    else if (att.mimeType?.toLowerCase() === 'epub' || (!att.mimeType && att.path.toLowerCase().endsWith('.epub'))) {
      att.mimeType = 'application/epub+zip'
    }
    if (!att.mimeType) delete att.mimeType

    this.item.attachments = this.item.attachments.filter(a => a.path !== att.path)

    const paths: string[] = this.translation.collected.platform === 'lin'
      ? [...(new Set([ 'NFC', 'NFD', 'NFKC', 'NFKD' ].map((normalization: string) => att.path.normalize(normalization) as string)))]
      : [att.path]

    for (const path of paths) {
      this.item.attachments.push({ ...att, path })
    }
  }

  // "files(Mendeley)/filename(Qiqqa)" will import the same as "file" but won't be treated as verbatim by the bibtex parser.
  // Needed because the people at Mendeley/Qiqqa can't be bothered to read the manual apparently.
  protected $pdf(value: string): boolean { return this.$file(value) }
  protected $files(value: string): boolean { return this.$file(value) }
  protected $filename(value: string): boolean { return this.$file(value) }
  protected $file(value: string): boolean {
    this.addAttachment({ path: value }) // fixes #2295

    const replace = {
      '\\;': '\u0011',
      '\u0011': ';',
      '\\:': '\u0012',
      '\u0012': ':',
      '\\\\': '\u0013',
      '\u0013': '\\',
    }

    // jabref garbage
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    for (const record of value.replace(/\\[\\;:]/g, escaped => replace[escaped]).split(';')) {
      const att = {
        mimeType: '',
        path: '',
        title: '',
      }

      // eslint-disable-next-line no-control-regex, @typescript-eslint/no-unsafe-return
      const parts = record.split(':').map(part => part.replace(/[\u0011\u0012\u0013]/g, escaped => replace[escaped]))
      switch (parts.length) {
        case 1:
          att.path = parts[0]
          break

        case 3:
          att.title = parts[0]
          att.path = parts[1]
          att.mimeType = parts[2]
          break

        default:
          log.error(`attachment import: Unexpected number of parts in file record '${ record }': ${ parts.length }`)
          // might be absolute windows path, just make Zotero try
          att.path = parts.join(':')
          break
      }

      this.addAttachment(att)
    }

    // calibre garbage #3338
    for (const att of value.split(/,\s+/)) {
      const m = att.match(/^:?(?<path>.+?)(?::(?<mimeType>[a-z]+))?$/i)
      if (m) {
        this.addAttachment(m.groups as { path: string })
      }
      else {
        this.addAttachment({ path: att })
      }
    }

    log.info('attempting import of', this.item.attachments)

    return true
  }

  protected $license(value: string): boolean {
    if (this.validFields.rights) {
      this.set('rights', value)
      return true
    }
    else {
      return this.fallback(['rights'], value)
    }
  }

  protected $version(value: string): boolean {
    if (this.validFields.versionNumber) {
      this.set('versionNumber', value)
      return true
    }
    else {
      return this.fallback(['versionNumber'], value)
    }
  }

  /* TODO: Zotero ignores these on import
  protected '$date-modified'(value: string): boolean { return this.item.dateAdded = this.unparse(value) }
  protected '$date-added'(value: string): boolean { return this.item.dateAdded = this.unparse(value) }
  protected '$added-at'(value: string): boolean { return this.item.dateAdded = this.unparse(value) }
  protected $timestamp(value: string): boolean { return this.item.dateAdded = this.unparse(value) }
  */

  protected $urldate(value: string): boolean {
    if (typeof value !== 'string') return false
    const date = value.replace(/^accessed\s*:?\s*/i, '')
    const parsed = parseDate(date)
    if (parsed.type !== 'date' || !parsed.day) return false

    return this.set('accessDate', strToISODate(date))
  }

  protected $lastchecked(value: string): boolean { return this.$urldate(value) }

  protected $number(value: string): boolean {
    if (this.item.itemType === 'patent' && this.patentNumberPrefix) {
      const pnp = this.patentNumberPrefix.toLowerCase()
      value = value.toLowerCase().startsWith(pnp) ? value : `${ this.patentNumberPrefix }${ value }`
    }

    return this.set(this.item.itemType === 'journalArticle' ? 'issue' : 'number', value)
  }

  protected $issue(value: string): boolean {
    if (this.validFields.number && this.bibtex.fields.number && this.validFields.seriesTitle) return this.set('seriesTitle', value)
    const field = [ 'issue', 'number' ].find(f => this.validFields[f])
    return field && this.set(field, value)
  }

  protected $eid(value: string): boolean {
    return this.validFields.number ? this.set('number', value) : this.fallback(['number'], value)
  }

  protected '$article-number'(value: string): boolean { return this.$eid(value) }

  protected $issn(value: string): boolean {
    return this.validFields.ISSN ? this.set('ISSN', value) : this.fallback(['ISSN'], value)
  }

  protected $url(value: string, field: string, urls: Set<string>): boolean {
    // no escapes needed in an verbatim field but people do it anyway
    let url = value.replace(/\\/g, '')

    // pluck out the URL if it is wrapped in an HREF
    let m, title = ''
    if (m = url.match(/<a href="([^"]+)"[^>]*>([^<]*)/i)) {
      url = m[1]
      title = m[2] || title
    }
    title = title || field

    if (urls.has(url)) return true
    urls.add(url)

    if (field !== 'url' && !this.isURL(url)) return false

    if (this.validFields.url && !this.item.url) {
      this.item.url = url
      return true
    }

    if (this.translation.collected.preferences.importDetectURLs) {
      this.item.attachments.push({ itemType: 'attachment', url, title, linkMode: 'linked_url' })
      return true
    }

    return this.fallback(['url'], url)
  }

  protected $type(value: string): boolean {
    if (this.item.itemType === 'patent') return !!this.patentNumberPrefix

    if (!this.validFields.type) return this.fallback(['type'], value)
    this.set('type', value)
    return true
  }

  protected $lista(value: string): boolean {
    return this.validFields.publicationTitle && this.set('title', value)
  }

  protected $annotation(value: string, field: string): boolean {
    if (this.translation.importToExtra[field]) {
      let plaintext = value.replace(/<p>/g, '').replace(/<\/p>/g, '\n\n').trim()
      if (this.translation.importToExtra[field] === 'force') plaintext = plaintext.replace(/<[^>]+>/g, '')
      if (!plaintext.includes('<')) {
        this.addToExtra(plaintext)
        return true
      }
    }

    this.item.notes.push(value)
    return true
  }

  protected $comment(value: string, field: string): boolean { return this.$annotation(value, field) }
  protected $annote(value: string, field: string): boolean { return this.$annotation(value, field) }
  protected $review(value: string, field: string): boolean { return this.$annotation(value, field) }
  protected $notes(value: string, field: string): boolean { return this.$annotation(value, field) }
  protected $note(value: string, field: string): boolean { return this.$annotation(value, field) }

  protected $series(value: string): boolean { return this.set('series', value) }
  protected $collection(value: string): boolean {
    return this.bibtex.fields.series ? (this.bibtex.fields.series.toLowerCase() === value.toLowerCase()) : this.$series(value)
  }

  // horrid jabref 3.8+ groups format
  protected $groups(value: string): boolean {
    for (const group of value.split(/\s*,\s*/)) {
      if (this.jabref.groups[group] && !this.jabref.groups[group].entries.includes(this.bibtex.key)) this.jabref.groups[group].entries.push(this.bibtex.key)
    }
    return true
  }

  protected $language(value: string): boolean {
    if (this.bibtex.fields.langid) {
      this.extra.push(`tex.language: ${ value }`) // using this.set would match the label `language`
      return true
    }
    else {
      return this.set('language', value)
    }
  }

  protected $langid(value: string): boolean {
    return this.set('language', value)
  }

  protected $shorttitle(value: string): boolean { return this.set('shortTitle', value) }

  protected $eprinttype(value: string, field: string): boolean {
    this.eprint[field] = value.trim()

    this.eprint.eprintType = {
      arxiv: 'arXiv',
      jstor: 'JSTOR',
      pubmed: 'PMID',
      hdl: 'HDL',
      googlebooks: 'GoogleBooksID',
    }[this.eprint[field].toLowerCase()] || ''

    return true
  }

  protected $archiveprefix(value: string, field: string): boolean { return this.$eprinttype(value, field) }

  protected $eprint(value: string, field: string): boolean {
    this.eprint[field] = value
    return true
  }

  protected $eprintclass(value: string, field: string): boolean { return this.$eprint(value, field) }
  protected $primaryclass(value: string): boolean { return this.$eprint(value, 'eprintclass') }
  protected $slaccitation(value: string, field: string): boolean { return this.$eprint(value, field) }

  protected $nationality(value: string): boolean { return this.set('country', value) }

  protected $chapter(value: string): boolean {
    const candidates = [ 'section', 'bookSection' ]
    const field = candidates.find(f => this.validFields[f])
    if (!field) return this.fallback(candidates, value)

    return this.set(field, value)
  }

  protected $origdate(value: string): boolean {
    if (!this.fallback(['originaldate'], value)) this.extra.push(`Original Date: ${ value }`)
    return true
  }

  private error(err) {
    log.error(err)
    throw new Error(err)
  }

  public import(errors: ParseError[]): boolean {
    if (!Object.keys(this.bibtex.fields).length) {
      errors.push({ error: `No fields in ${ this.bibtex.key ? `@${ this.bibtex.key }` : 'unnamed item' }`, input: this.bibtex.input })
      return false
    }

    this.bibtex.type = this.bibtex.type.toLowerCase()
    this.item.itemType = this.typeMap[this.bibtex.type] || '$'
    if (this.item.itemType[0] === '$') {
      const unknown = this.item.itemType === '$'
      this.item.itemType = this.item.itemType.substr(1) || 'document'

      if (unknown) {
        const msg = `Don't know what Zotero type to make of '${ this.bibtex.type }' for ${ this.bibtex.key ? `@${ this.bibtex.key }` : 'unnamed item' }, importing as ${ this.item.itemType }`
        log.info(msg)
        if (this.translation.collected.preferences.testing) throw new Error(msg)
        errors.push({ error: msg, input: this.bibtex.input })
      }

      if (this.bibtex.type) this.extra.push(`tex.entrytype: ${ this.bibtex.type }`)
    }

    if (
      this.item.itemType === 'book'
      && this.bibtex.fields.title
      && this.bibtex.fields.booktitle
      && this.bibtex.fields.title !== this.bibtex.fields.booktitle
      && !this.bibtex.crossref?.donated.includes('booktitle')) this.item.itemType = 'bookSection'

    if (
      this.item.itemType === 'journalArticle'
      && this.bibtex.fields.booktitle?.length
      && this.bibtex.fields.booktitle.match(/proceeding/i)) this.item.itemType = 'conferencePaper'

    if (!ItemType.types.includes(this.item.itemType)) this.error(`import error: unexpected item ${ this.bibtex.key } of type ${ this.item.itemType }`)
    this.validFields = ItemType.validFields(this.item.itemType)

    if (!this.bibtex.fields.type) {
      switch (this.bibtex.type) {
        case 'legal':
          this.$type('treaty')
          break
        case 'legmaterial':
          this.$type('regulation')
          break
        case 'periodical':
          this.$type('periodical')
          break
        case 'manual':
          if (this.item.itemType === 'report') this.$type('manual')
          break
        case 'phdthesis':
          this.$type('phd')
          break
        case 'mastersthesis':
          this.$type('master')
          break
        case 'bathesis':
          this.$type('bachelor')
          break
        case 'candthesis':
          this.$type('candidate')
          break
      }
    }

    for (const subtitle of [ 'titleaddon', 'subtitle' ]) {
      if (!this.bibtex.fields.title && this.bibtex.fields[subtitle]) {
        this.bibtex.fields.title = this.bibtex.fields[subtitle]
        delete this.bibtex.fields[subtitle]
      }
    }

    // import order
    const creatorTypes = [
      'author',
      'editor',
      'translator',

      'bookauthor',
      'collaborator',
      'commentator',
      'director',
      'editora',
      'editorb',
      'editors',
      'holder',
      'scriptwriter',
    ]
    const creatorTypeMap = {
      author: 'author',
      'film.author': 'director',
      editor: 'editor',
      'film.editor': 'scriptwriter',
      translator: 'translator',
      bookauthor: 'bookAuthor',
      collaborator: 'contributor',
      commentator: 'commenter',
      director: 'director',
      editora: 'editor',
      editorb: 'editor',
      editors: 'editor',
      scriptwriter: 'scriptwriter',
    }
    const creatorTypeRemap: Record<string, string> = {}
    for (const creator of creatorTypes) {
      const creatortype = `${ creator }type`
      const remapped = creatorTypeMap[this.bibtex.fields[creatortype]]
      if (typeof remapped === 'string') {
        creatorTypeRemap[creator] = remapped
        delete this.bibtex.fields[creatortype]
      }
    }
    Object.assign(creatorTypeMap, creatorTypeRemap)

    const creatorsForType = Zotero.Utilities.getCreatorsForType(this.item.itemType)
    for (const type of creatorTypes.filter(t => this.bibtex.fields[t])) {
      // 'assignee' is not a creator field for Zotero
      if (type === 'holder' && this.item.itemType === 'patent') continue

      const creators: Creator[] = this.bibtex.fields[type] as unknown as Creator[]

      let creatorType = creatorTypeMap[`${ this.item.itemType }.${ type }`] || creatorTypeMap[type]
      if (creatorType === 'author') creatorType = [ 'director', 'inventor', 'programmer', 'author' ].find(t => creatorsForType.includes(t))
      if (!creatorsForType.includes(creatorType)) creatorType = null
      if (!creatorType && type === 'bookauthor' && creatorsForType.includes('author')) creatorType = 'author'
      if (!creatorType) creatorType = 'contributor'

      for (const creator of creators) {
        const name: { lastName?: string; firstName?: string; fieldMode?: number; creatorType: string } = { creatorType }

        if (creator.name) {
          name.lastName = creator.name
          name.fieldMode = 1
        }
        else {
          name.firstName = creator.firstName || ''
          name.lastName = creator.lastName || ''
          if (creator.prefix) name.lastName = `${ creator.prefix } ${ name.lastName }`.trim()
          if (creator.suffix) name.firstName = name.firstName ? `${ name.firstName }, ${ creator.suffix }` : creator.suffix
          if (name.lastName && !name.firstName) name.fieldMode = 1
        }

        this.item.creators.push(name)
      }

      delete this.bibtex.fields[type]
    }

    if (this.item.itemType === 'patent' && this.bibtex.fields.type) {
      this.patentNumberPrefix = {
        patent: '',
        patentus: 'US',
        patenteu: 'EP',
        patentuk: 'GB',
        patentdede: 'DE',
        patentde: 'DE',
        patentfr: 'FR',
      }[this.bibtex.fields.type.toLowerCase()] || ''
    }

    const urls: Set<string> = new Set
    for (let [ field, values ] of Object.entries(this.bibtex.fields)) {
      if (Array.isArray(values) && this.bibtex.mode[field] === 'literallist') values = (values as string[]).join(' and ')
      if (typeof values === 'string') values = [values]

      for (const value of (values as string[])) {
        if (this.bibtex.mode[field] === 'creatorlist' && this[`$${ field }`]?.(value, field)) continue

        if (typeof value !== 'string') {
          errors.push({ error: `unexpected value ${ JSON.stringify(value) } for ${ field }`, input: JSON.stringify(value) })
          continue
        }

        if (field.match(/^(local-zo-url-[0-9]+|file-[0-9]+)$/) || field.match(/^file[+]duplicate-\d+$/)) {
          if (this.$file(value)) continue
        }
        else if (field.match(/^(bdsk-url-[0-9]+|url|howpublished|remote-url)$/)) {
          if (this.$url(value, field, urls)) continue
        }
        else if (field.match(/^bdsk-file-[0-9]+$/)) {
          let imported = false
          try {
            for (const att of parsePList(new Buffer(value, 'base64'))) {
              if (att.relativePath && this.$file(att.relativePath)) imported = true
            }
          }
          catch (err) {
            if (err) this.error(`import error: ${ this.item.itemType } ${ this.bibtex.key }: ${ err }\n${ JSON.stringify(this.item, null, 2) }`)
          }
          if (imported) continue
        }
        else if (field.match(/^note_[0-9]+$/)) { // jabref, #1878
          if (this.$note(value, 'note')) continue
        }

        if (this[`$${ field }`]?.(value, field)) continue

        switch (field) {
          case 'pst':
            this.extra.push(`tex.howpublished: ${ value }`)
            break

          case 'doi':
            this.extra.push(`DOI: ${ value }`)
            break

          case 'issn':
            this.extra.push(`ISSN: ${ value }`)
            break

          case 'pmid':
            this.extra.push(`PMID: ${ value }`)
            break

          case 'subject': // otherwise it's picked up by the subject -> title mapper, and I don't think that's right
            this.extra.push(`tex.${ field }: ${ value }`)
            break

          case 'origtitle':
            this.extra.push(`Original title: ${ value }`)
            break

          case 'origlocation':
            this.extra.push(`Original publisher place: ${ value }`)
            break

          default:
            if (this.translation.collected.preferences.importDetectURLs && this.isURL(value)) {
              this.item.attachments.push({ itemType: 'attachment', url: value, title: field, linkMode: 'linked_url' })
            }
            else if (value.indexOf('\n') >= 0) {
              this.item.notes.push(`<p><b>${ Zotero.Utilities.text2html(field, false) }</b></p>${ Zotero.Utilities.text2html(value, false) }`)
            }
            else if (this.validFields[field] && !this.item[field]) {
              this.item[field] = value
            }
            else {
              const alternate = ItemType.field(field)
              if (alternate) {
                this.extra.push(`${alternate.extra}: ${value}`)
              }
              else {
                this.extra.push(`tex.${ field.match(/[:=]/) ? `"${ field }"` : field }: ${ value }`)
              }
            }
            break
        }
      }
    }

    if (this.translation.collected.preferences.rawImports && this.translation.collected.preferences.rawLaTag !== '*') {
      if (!this.item.tags) this.item.tags = []
      this.item.tags.push({ tag: this.translation.collected.preferences.rawLaTag, type: 1 })
    }

    // Endnote has no citation keys in their bibtex
    if (this.bibtex.key && this.translation.collected.preferences.importCitationKey) {
      // if (this.validFields.citationKey)
      this.item.citationKey = this.bibtex.key
      this.extra.push(`Citation Key: ${this.bibtex.key}`)
    }

    if (this.eprint.slaccitation && !this.eprint.eprint) {
      const m = this.eprint.slaccitation.match(/^%%CITATION = (.+);%%$/)
      const arxiv = arXiv(m && m[1].trim())

      if (arxiv.id) {
        this.eprint.eprintType = this.eprint.eprinttype = 'arXiv'
        if (!this.eprint.archiveprefix) this.eprint.archiveprefix = 'arXiv'
        this.eprint.eprint = arxiv.id
        if (!this.eprint.eprintclass && arxiv.category) this.eprint.eprintclass = arxiv.category
      }
    }
    delete this.eprint.slaccitation

    if (this.eprint.eprintType && this.eprint.eprint) {
      const eprintclass = this.eprint.eprintType === 'arXiv' && this.eprint.eprintclass ? ` [${ this.eprint.eprintclass }]` : ''
      this.extra.push(`${ this.eprint.eprintType }: ${ this.eprint.eprint }${ eprintclass }`)
    }
    else {
      delete this.eprint.eprintType
      for (const [ k, v ] of Object.entries(this.eprint)) {
        this.extra.push(`tex.${ k.toLowerCase() }: ${ v }`)
      }
    }

    this.extra = this.extra.filter(line => {
      if (line.startsWith('tex.')) return this.translation.collected.preferences.importExtra
      return true
    })
    if (this.extra.length > 0) {
      this.extra.sort((a, b) => {
        a = a.toLowerCase()
        b = b.toLowerCase()

        if (a === b) return 0

        if (a.startsWith('citation key:')) return -1
        if (b.startsWith('citation key:')) return 1

        const ta = a.startsWith('tex.')
        const tb = b.startsWith('tex.')
        if (ta === tb) return a.localeCompare(b, undefined, { sensitivity: 'base' })
        return ta ? 1 : -1
      })
      this.item.extra = this.extra.map(line => line.replace(/\n+/g, ' ')).concat(this.item.extra || '').join('\n').trim()
    }

    if (!this.item.publisher && this.item.backupPublisher) {
      this.item.publisher = this.item.backupPublisher
      delete this.item.backupPublisher
    }

    return true
  }

  private isURL(url: string): boolean {
    try {
      return (new URL(url)).protocol.match(/^https?:$/) as unknown as boolean
    }
    catch {
      return false
    }
  }

  private addToExtra(str) {
    if (this.item.extra && this.item.extra !== '') {
      this.item.extra += `\n${ str }`
    }
    else {
      this.item.extra = str
    }
  }

  private set(field, value, fallback = null) {
    if (!this.validFields[field]) return fallback && this.fallback(fallback, value)

    if (this.translation.collected.preferences.testing && (this.item[field] || typeof this.item[field] === 'number') && (value || typeof value === 'number') && this.item[field] !== value) {
      this.error(`import error: duplicate ${ field } on ${ this.item.itemType } ${ this.bibtex.key } (old: ${ this.item[field] }, new: ${ value })`)
    }

    this.item[field] = value
    return true
  }
}
