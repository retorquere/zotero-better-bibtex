declare const Zotero: any

import { log } from '../../content/logger'
import { Exporter as BibTeXExporter } from './exporter'
import { parse as arXiv } from '../../content/arXiv'
import { validItem } from '../../content/ajv'
import { valid, label } from '../../gen/items/items'
import { wordsToNumbers } from 'words-to-numbers'

import { parse as parseDate, strToISO as strToISODate } from '../../content/dateparser'

import { parseBuffer as parsePList } from 'bplist-parser'

import { Translation } from '../lib/translator'

import { Entry as BaseEntry, Config } from './entry'

import * as bibtexParser from '@retorquere/bibtex-parser'

function unique(value, index, self) {
  return self.indexOf(value) === index
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
    institution: 'literal',
    publisher: 'literal',
    organization: 'literal',
    address: 'literal',
  },

  typeMap: {
    csl: {
      article               : 'article',
      'article-journal'     : 'article',
      'article-magazine'    : 'article',
      'article-newspaper'   : 'article',
      bill                  : 'misc',
      book                  : 'book',
      broadcast             : 'misc',
      chapter               : 'incollection',
      dataset               : 'misc',
      entry                 : 'incollection',
      'entry-dictionary'    : 'incollection',
      'entry-encyclopedia'  : 'incollection',
      figure                : 'misc',
      graphic               : 'misc',
      interview             : 'misc',
      legal_case            : 'misc',
      legislation           : 'misc',
      manuscript            : 'unpublished',
      map                   : 'misc',
      motion_picture        : 'misc',
      musical_score         : 'misc',
      pamphlet              : 'booklet',
      'paper-conference'    : 'inproceedings',
      patent                : 'misc',
      personal_communication: 'misc',
      post                  : 'misc',
      'post-weblog'         : 'misc',
      report                : 'techreport',
      review                : 'article',
      'review-book'         : 'article',
      song                  : 'misc',
      speech                : 'misc',
      thesis                : 'phdthesis',
      treaty                : 'misc',
      webpage               : 'misc',
    },
    zotero: {
      artwork         : 'misc',
      audioRecording  : 'misc',
      bill            : 'misc',
      blogPost        : 'misc',
      book            : 'book',
      bookSection     : 'incollection',
      case            : 'misc',
      computerProgram : 'misc',
      conferencePaper : 'inproceedings',
      dictionaryEntry : 'misc',
      document        : 'misc',
      email           : 'misc',
      encyclopediaArticle:  'article',
      film            : 'misc',
      forumPost       : 'misc',
      hearing         : 'misc',
      instantMessage  : 'misc',
      interview       : 'misc',
      journalArticle  : 'article',
      letter          : 'misc',
      magazineArticle : 'article',
      manuscript      : 'unpublished',
      map             : 'misc',
      newspaperArticle: 'article',
      patent          : 'patent',
      podcast         : 'misc',
      preprint        : 'misc',
      presentation    : 'misc',
      radioBroadcast  : 'misc',
      report          : 'techreport',
      statute         : 'misc',
      thesis          : 'phdthesis',
      tvBroadcast     : 'misc',
      videoRecording  : 'misc',
      webpage         : 'misc',
    },
  },
}

class Entry extends BaseEntry {
  private lintrules: Record<string, {required: string[], optional: string[]}> = {
    article: {
      required: [ 'author', 'title', 'journal', 'year' ],
      optional: [ 'volume', 'number', 'pages', 'month', 'note', 'key' ],
    },
    book: {
      required: ['author/editor', 'title', 'publisher', 'year' ],
      optional: [ 'volume/number', 'series', 'address', 'edition', 'month', 'note', 'key' ],
    },
    booklet: {
      required: [ 'title' ],
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
      optional:  [ 'editor', 'volume/number', 'series', 'type', 'chapter', 'pages', 'address', 'edition', 'month', 'note', 'key' ],
    },
    inproceedings: {
      required: [ 'author', 'title', 'booktitle', 'year' ],
      optional: [ 'editor', 'volume/number', 'series', 'pages', 'address', 'month', 'organization', 'publisher', 'note', 'key' ],
    },
    manual: {
      required: [ 'title' ],
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
      required: ['title', 'year' ],
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
        warnings.push(`Missing required field '${required}'`)
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

export function generateBibTeX(translation: Translation): void {
  translation.bibtex = new BibTeXExporter(translation)

  Entry.installPostscript(translation)
  translation.bibtex.prepare_strings()

  // translation.output += `\n% ${translation.header.label}\n`

  for (const item of translation.bibtex.items) {
    const ref = new Entry(item, config, translation)
    if (item.itemType === 'report' && item.type?.toLowerCase().includes('manual')) ref.entrytype = 'manual'
    if (['zotero.bookSection', 'csl.chapter', 'tex.chapter'].includes(ref.entrytype_source) && ref.hasCreator('bookAuthor')) ref.entrytype = 'inbook'

    ref.add({name: 'address', value: item.place})
    ref.add({name: 'chapter', value: item.section})
    ref.add({name: 'edition', value: ref.english && translation.preferences.bibtexEditionOrdinal ? ref.toEnglishOrdinal(item.edition) : item.edition })
    ref.add({name: 'type', value: item.type})
    ref.add({name: 'series', value: item.series, bibtexStrings: true})
    ref.add({name: 'title', value: item.title})
    ref.add({name: 'copyright', value: item.rights})
    ref.add({name: 'isbn', value: item.ISBN})
    ref.add({name: 'issn', value: item.ISSN})
    ref.add({name: 'lccn', value: item.callNumber})
    ref.add({name: 'shorttitle', value: item.shortTitle})
    ref.add({name: 'abstract', value: item.abstractNote?.replace(/\n+/g, ' ')})
    ref.add({name: 'nationality', value: item.country})
    ref.add({name: 'assignee', value: item.assignee})

    // this needs to be order volume - number for #1475
    ref.add({name: 'volume', value: ref.normalizeDashes(item.volume) })
    if (!['book', 'inbook', 'incollection', 'proceedings', 'inproceedings'].includes(ref.entrytype) || !ref.has.volume) ref.add({ name: 'number', value: item.number || item.issue || item.seriesNumber })
    ref.add({ name: 'urldate', value: item.accessDate && item.accessDate.replace(/\s*T?\d+:\d+:\d+.*/, '') })

    const journalAbbreviation = translation.options.useJournalAbbreviation && (item.journalAbbreviation || item.autoJournalAbbreviation)
    if (ref.entrytype_source === 'zotero.conferencePaper') {
      ref.add({ name: 'booktitle', value: journalAbbreviation || item.publicationTitle || item.conferenceName, bibtexStrings: true })
    }
    else if (['zotero.bookSection', 'tex.chapter', 'csl.chapter'].includes(ref.entrytype_source)) {
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
    if (translation.preferences.DOIandURL !== 'doi' || !doi) {
      switch (translation.preferences.bibtexURL) {
        case 'url':
        case 'url-ish':
          urlfield = ref.add({
            name: 'url',
            value: item.url || item.extraFields.kv.url,
            enc: translation.preferences.bibtexURL === 'url' && translation.isVerbatimField('url') ? 'url' : 'latex',
          })
          break

        case 'note':
        case 'note-url-ish':
          urlfield = ref.add({
            name: (['misc', 'booklet'].includes(ref.entrytype) && !ref.has.howpublished ? 'howpublished' : 'note'),
            value: item.url || item.extraFields.kv.url,
            enc: translation.preferences.bibtexURL === 'note' ? 'url': 'latex',
          })
          break

        default:
          if (['csl.webpage', 'zotero.webpage', 'csl.post', 'csl.post-weblog'].includes(ref.entrytype_source)) {
            urlfield = ref.add({ name: 'howpublished', value: item.url || item.extraFields.kv.url })
          }
          break
      }
    }
    if (translation.preferences.DOIandURL !== 'url' || !urlfield) {
      ref.add({ name: 'doi', value: (doi || '').replace(/^https?:\/\/doi.org\//i, ''), enc: translation.isVerbatimField('doi') ? 'verbatim' : 'latex' })
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
      ref.add({ name: 'organization', value: sponsors.join(translation.preferences.separatorList) })
    }
    ref.addCreators()
    // #1541
    if (ref.entrytype === 'inbook' && ref.has.author && ref.has.editor) delete ref.has.editor

    switch (ref.date.type) {
      case 'none':
        break

      case 'verbatim':
        ref.add({ name: 'year', value: ref.date.verbatim })
        break

      case 'interval':
        if (ref.date.from.month) ref.add({ name: 'month', value: months[ref.date.from.month - 1], bare: true })
        ref.add({ name: 'year', value: `${ref.date.from.year}` })
        break

      case 'date':
        if (ref.date.month) ref.add({ name: 'month', value: months[ref.date.month - 1], bare: true })
        if (ref.date.orig?.type === 'date') {
          ref.add({ name: 'year', value: `[${ref.date.orig.year}] ${ref.date.year}` })
        }
        else {
          ref.add({ name: 'year', value: `${ref.date.year}` })
        }
        break

      case 'season':
        ref.add({ name: 'year', value: ref.date.year })
        break

      default:
        log.error('Unexpected date type', { date: item.date, parsed: ref.date })
    }

    ref.add({ name: 'keywords', value: item.tags, enc: 'tags' })

    ref.add({ name: 'pages', value: ref.normalizeDashes(item.pages) })

    ref.add({ name: 'file', value: item.attachments, enc: 'attachments' })

    ref.complete()
  }

  translation.bibtex.complete()
}

const importJabRef = new class {
  public unabbrevations: Record<string, string> = {}
  public strings = ''

  private loaded = {
    unabbrevations: false,
    strings: false,
  }

  load(translation: Translation) {
    if (!this.loaded.unabbrevations && translation.preferences.importJabRefAbbreviations) {
      Object.assign(this.unabbrevations, JSON.parse(Zotero.File.getContentsFromURL('chrome://zotero-better-bibtex/content/resource/bibtex/unabbrev.json')))
      this.loaded.unabbrevations = true
    }

    if (!this.loaded.strings && translation.preferences.importJabRefStrings) {
      this.strings = Zotero.File.getContentsFromURL('chrome://zotero-better-bibtex/content/resource/bibtex/strings.bib')
      this.loaded.strings = true
    }
  }
}

export async function parseBibTeX(input: string, translation: Translation): Promise<bibtexParser.Bibliography> {
  translation.ZoteroItem = ZoteroItem

  importJabRef.load(translation)

  return bibtexParser.promises.parse(input, {
    // we are actually sure it's a valid enum value; stupid workaround for TS2322: Type 'string' is not assignable to type 'boolean | "as-needed" | "strict"'.
    caseProtection: (translation.preferences.importCaseProtection as 'as-needed'),
    errorHandler: (translation.preferences.testing ? undefined : function(err) { log.error(err) }), // eslint-disable-line prefer-arrow/prefer-arrow-functions
    unknownCommandHandler: function(node) { // eslint-disable-line object-shorthand
      switch (translation.preferences.importUnknownTexCommand) {
        case 'tex':
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          return this.text(`<script>${node.source}</script>`)
        case 'text':
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          return this.text(node.source)
        case 'ignore':
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          return this.text('')
        default:
          throw new Error(`Unexpected unknownCommandHandler ${JSON.stringify(translation.preferences.importUnknownTexCommand)}`)
      }
    },
    markup: (translation.csquotes ? { enquote: translation.csquotes } : {}),
    sentenceCase: translation.preferences.importSentenceCase !== 'off',
    guessAlreadySentenceCased: translation.preferences.importSentenceCase === 'on+guess',
    sentenceCasePreserveQuoted: !translation.preferences.importSentenceCaseQuoted,
    verbatimFields: translation.verbatimFields,
    raw: translation.preferences.rawImports,
    unabbreviate: importJabRef.unabbrevations,
    strings: importJabRef.strings,
  })
}

const months = [ 'jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec' ]
export class ZoteroItem {
  public typeMap = {
    article:            'journalArticle',
    audio:              'audioRecording',
    book:               'book',
    book_section:       'bookSection', // mendeley made-up entry type
    booklet:            'book',
    codefragment:       'computerProgram',
    collection:         'book',
    conference:         'conferencePaper',
    constitution:       'statute',
    dataset:            'dataset',
    film:               'film', // mendeley made-up entry type
    generic:            'journalArticle', // mendeley made-up entry type
    hardware:           'computerProgram',
    inbook:             'bookSection',
    image:              'artwork',
    incollection:       'bookSection',
    inproceedings:      'conferencePaper',
    inreference:        'encyclopediaArticle',
    jurisdiction:       'case',
    legadminmaterial:   'statute',
    legal:              'statute',
    legislation:        'statute',
    legmaterial:        'bill', // could also be 'hearing'
    magazine_article:   'magazineArticle', // mendeley made-up entry type
    manual:             'report',
    mastersthesis:      'thesis',
    movie:              'film',
    misc:               'document',
    newspaper_article:  'newspaperArticle', // mendeley made-up entry type
    online:             'webpage',
    patent:             'patent',
    periodical:         'document',
    phdthesis:          'thesis',
    presentation:       'presentation',
    proceedings:        'book',
    reference:          'book',
    report:             'report',
    software:           'computerProgram',
    softwaremodule:     'computerProgram',
    softwareversion:    'computerProgram',
    talk:               'presentation',
    techreport:         'report',
    thesis:             'thesis',
    unpublished:        'manuscript',
    video:              'videoRecording',
    web_page:           'webpage', // mendeley made-up entry type
    webpage:            'webpage', // papers3 made-up entry type

    // need better equivalents
    nameonly:          '$document',
  }

  private extra: string[] = []
  private eprint: { [key: string]: string } = {}
  private validFields: Record<string, boolean>
  private patentNumberPrefix = ''

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  constructor(private translation: Translation, private item: any, private bibtex: bibtexParser.Entry, private jabref: bibtexParser.jabref.JabRefMetadata) {
  }

  private fallback(fields: string[], value: string): boolean {
    const field = fields.find((f: string) => label[f])
    if (field) {
      if (typeof value === 'string') value = value.replace(/\n+/g, '')
      this.extra.push(`${label[field]}: ${value}`)
      return true
    }
    return false
  }

  protected $title(): boolean {
    let title: string[] = []
    let len: number
    for (const field of ['title', 'titleaddon', 'subtitle']) {
      if (len = this.bibtex.fields[field]?.length) title.push(this.bibtex.fields[field][len - 1])
    }
    title = title.filter(unique)

    if (this.item.itemType === 'encyclopediaArticle') {
      this.item.publicationTitle = title.join('. ')
    }
    else {
      this.item.title = title.join('. ')
    }
    return true
  }
  protected $titleaddon(): boolean { return this.$title() }
  protected $subtitle(): boolean { return this.$title() }

  protected $holder(): boolean {
    if (this.item.itemType === 'patent') {
      this.item.assignee = this.bibtex.fields.holder.map((name: string) => name.replace(/"/g, '')).join('; ')
    }
    return true
  }

  protected $publisher(value: string, field: string): boolean {
    // difference between jurism and zotero. Prepending 'field' makes the import prefer exact matches to the input
    const candidates = [field].concat(['institution', 'publisher'])
    field = candidates.find(f => this.validFields[f])
    if (!field) return this.fallback(candidates, value)

    this.item[field] = [
      (this.bibtex.fields.publisher || []).join(' and '),
      (this.bibtex.fields.institution || []).join(' and '),
      (this.bibtex.fields.school || []).join(' and '),
      (this.bibtex.fields.organization || []).join(' and '),
    ].filter(v => v.replace(/[ \t\r\n]+/g, ' ').trim()).join(' / ')

    return true
  }
  protected $institution(value: string, field: string): boolean { return this.$publisher(value, field) }
  protected $school(value: string, field: string): boolean { return this.$publisher(value, field) }
  protected $organization(value: string, field: string): boolean { return this.$publisher(value, field) }

  protected $address(value: string): boolean {
    return this.set('place', value, ['place'])
  }
  protected $location(value: string): boolean {
    if (this.item.itemType === 'conferencePaper') {
      if (typeof value === 'string') value = value.replace(/\n+/g, '')
      this.extra.push(`Place: ${value}`)
      return true
    }

    return this.$address(value)
  }

  protected '$call-number'(value: string): boolean {
    return this.set('callNumber', value)
  }

  protected $edition(value: string): boolean {
    if (typeof value === 'string') {
      value = value.replace(/^([0-9]+)(st|nd|th)$/, '$1')
      const int = wordsToNumbers(value)
      if (typeof int === 'number') {
        value = `${int}`
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
      case 'conferencePaper':
      case 'bookSection':
        return this.set('publicationTitle', value)

      case 'book':
        if ((this.bibtex.fields.title || []).includes(value)) return true
        if (this.bibtex.fields.title && this.bibtex.crossref.donated.includes('booktitle')) return true
        if (!this.item.title) return this.set('title', value)
        break
    }

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
            this.item.itemType = `${type}Article`
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
    let journal: { field: string, value: string}, abbr: { field: string, value: string} = null

    // journal-full is bibdesk
    const titles = [ 'journal-full', 'journal', 'journaltitle', 'shortjournal' ].map(field => {
      const value = this.bibtex.fields[field]?.[0] || ''
      delete this.bibtex.fields[field] // this makes sure we're not ran again
      return { field, value }
    })
      .filter(candidate => candidate.value) // skip empty
      .filter(candidate => {
        if (!abbr && candidate.field === 'shortjournal') { // shortjournal is assumed to be an abbrev
          abbr = candidate
          return false
        }
        return true
      })
      .filter(candidate => {
        // to be considered an abbrev, it must have at least two periods, and there can be no periods that are not followed by a space, and no spaced that are not preceded by a period
        const assumed_abbrev = candidate.value.match(/[.].+[.]/) && !candidate.value.match(/[.][^ ]/) && !candidate.value.match(/[^.] /)
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
        if (!abbr) {
          abbr = candidate
          return false
        }
        return true
      })

    for (const candidate of titles) {
      this.extra.push(`tex.${candidate.field}: ${candidate.value}`)
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
        this.extra.push(`Journal abbreviation: ${abbr.value}`)
      }
      else {
        this.extra.push(`tex.${abbr.field}: ${abbr.value}`)
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
    let tags = this.bibtex.fields.keywords || []

    const split = (data: string[]): string[] => {
      if (!Array.isArray(data)) return []
      let arr: string[] = []
      for (const line of data) {
        arr = [...arr, ...line.trim().split(/\s*[,;]\s*/).filter(t => t)]
      }
      return arr
    }

    tags = [...tags, ...split(this.bibtex.fields.keyword)]
    tags = [...tags, ...split(this.bibtex.fields.mesh)]
    tags = [...tags, ...split(this.bibtex.fields.tags)]
    tags = [...(new Set(tags))].sort()

    this.item.tags = tags
    return true
  }
  protected $keyword(): boolean { return this.$keywords() }
  protected $tags(): boolean { return this.$keywords() }
  protected $mesh(): boolean { return this.$keywords() } // bibdesk

  protected $date(): boolean {
    if (this.item.date) return true

    const dates = (this.bibtex.fields.date || []).slice()

    const year = (this.bibtex.fields.year && this.bibtex.fields.year[0]) || ''

    let month = (this.bibtex.fields.month && this.bibtex.fields.month[0]) || ''
    const monthno: number = months.indexOf(month.toLowerCase())
    if (monthno >= 0) month = `0${monthno + 1}`.slice(-2)

    const day = (this.bibtex.fields.day && this.bibtex.fields.day[0]) || ''

    if (year && month.match(/^[0-9]+$/) && day.match(/^[0-9]+$/)) {
      dates.push(`${year}-${month}-${day}`)
    }
    else if (year && month.match(/^[0-9]+$/)) {
      dates.push(`${year}-${month}`)
    }
    else if (year && month && day) {
      dates.push(`${day} ${month} ${year}`)
    }
    else if (year && month) {
      dates.push(`${month} ${year}`)
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

    if (this.jabref.fileDirectory) att.path = `${this.jabref.fileDirectory}${this.translation.paths.sep}${att.path}`

    att.title = att.title || att.path.split(/[\\/]/).pop().replace(/\.[^.]+$/, '')
    if (!att.title) delete att.title

    if (att.mimeType?.toLowerCase() === 'pdf' || (!att.mimeType && att.path.toLowerCase().endsWith('.pdf'))) att.mimeType = 'application/pdf'
    if (!att.mimeType) delete att.mimeType

    this.item.attachments = this.item.attachments.filter(a => a.path !== att.path)
    this.item.attachments.push(att)
  }

  // "files(Mendeley)/filename(Qiqqa)" will import the same as "file" but won't be treated as verbatim by the bibtex parser. Needed because the people at Mendeley/Qiqqa can't be bothered to read the manual apparently.
  protected $pdf(value: string): boolean { return this.$file(value) }
  protected $files(value: string): boolean { return this.$file(value) }
  protected $filename(value: string): boolean { return this.$file(value) }
  protected $file(value: string): boolean {
    this.addAttachment({ path: value }) // fixes #2295

    const replace = {
      '\\;':    '\u0011',
      '\u0011': ';',
      '\\:':    '\u0012',
      '\u0012': ':',
      '\\\\':   '\u0013',
      '\u0013': '\\',
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    for (const record of value.replace(/\\[\\;:]/g, escaped => replace[escaped]).split(';')) {
      const att = {
        mimeType: '',
        path: '',
        title: '',
      }

      // eslint-disable-next-line no-control-regex, @typescript-eslint/no-unsafe-return
      const parts = record.split(':').map(str => str.replace(/[\u0011\u0012\u0013]/g, escaped => replace[escaped]))
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
          Zotero.debug(`attachment import: Unexpected number of parts in file record '${record}': ${parts.length}`)
          // might be absolute windows path, just make Zotero try
          att.path = parts.join(':')
          break
      }

      this.addAttachment(att)
    }

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
      value = value.toLowerCase().startsWith(pnp) ? value : `${this.patentNumberPrefix}${value}`
    }

    return this.set(this.item.itemType === 'journalArticle' ? 'issue' : 'number', value)
  }

  protected $issue(value: string): boolean {
    if (this.validFields.number && this.bibtex.fields.number && this.validFields.seriesTitle) return this.set('seriesTitle', value)
    const field = ['issue', 'number'].find(f => this.validFields[f])
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

    if (this.translation.preferences.importDetectURLs) {
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
    if (this.item.itemType !== 'encyclopediaArticle' || !!this.item.title) return false

    this.set('title', value)
    return true
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
    return this.bibtex.fields.series ? (this.bibtex.fields.series[0].toLowerCase() === value.toLowerCase()) : this.$series(value)
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
      this.extra.push(`tex.language: ${value}`) // using this.set would match the label `language`
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
      arxiv:        'arXiv',
      jstor:        'JSTOR',
      pubmed:       'PMID',
      hdl:          'HDL',
      googlebooks:  'GoogleBooksID',
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
    const candidates = ['section', 'bookSection']
    const field = candidates.find(f => this.validFields[f])
    if (!field) return this.fallback(candidates, value)

    return this.set(field, value)
  }

  protected $origdate(value: string): boolean {
    if (!this.fallback(['originaldate'], value)) this.extra.push(`Original Date: ${value}`)
    return true
  }

  private error(err) {
    Zotero.debug(err)
    throw new Error(err)
  }

  public import(errors: bibtexParser.ParseError[]): boolean { // eslint-disable-line @typescript-eslint/explicit-module-boundary-types
    if (!Object.keys(this.bibtex.fields).length) {
      errors.push({ message: `No fields in ${this.bibtex.key ? `@${this.bibtex.key}` : 'unnamed item'}` })
      return false
    }

    this.bibtex.type = this.bibtex.type.toLowerCase()
    this.item.itemType = this.typeMap[this.bibtex.type] || '$'
    if (this.item.itemType[0] === '$') {
      const unknown = this.item.itemType === '$'
      this.item.itemType = this.item.itemType.substr(1) || 'document'

      const msg = `Don't know what Zotero type to make of '${this.bibtex.type}' for ${this.bibtex.key ? `@${this.bibtex.key}` : 'unnamed item'}, importing as ${this.item.itemType}`
      log.debug(msg)
      if (unknown) {
        if (this.translation.preferences.testing) throw new Error(msg)
        errors.push({ message: msg })
      }

      if (this.bibtex.type) this.extra.push(`tex.entrytype: ${this.bibtex.type}`)
    }

    if (
      this.item.itemType === 'book'
      && this.bibtex.fields.title?.length
      && this.bibtex.fields.booktitle?.length
      && !this.bibtex.crossref.donated.includes('booktitle')) this.item.itemType = 'bookSection'

    if (
      this.item.itemType === 'journalArticle'
      && this.bibtex.fields.booktitle?.length
      && this.bibtex.fields.booktitle.join('\n').match(/proceeding/i)) this.item.itemType = 'conferencePaper'

    if (!valid.type[this.item.itemType]) this.error(`import error: unexpected item ${this.bibtex.key} of type ${this.item.itemType}`)
    this.validFields = valid.field[this.item.itemType]

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

    for (const subtitle of ['titleaddon', 'subtitle']) {
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
      const creatortype = `${creator}type`
      const remapped = creatorTypeMap[this.bibtex.fields[creatortype]?.[0]]
      if (remapped) {
        creatorTypeRemap[creator] = remapped
        delete this.bibtex.fields[creatortype]
      }
    }
    Object.assign(creatorTypeMap, creatorTypeRemap)

    const creatorsForType = Zotero.Utilities.getCreatorsForType(this.item.itemType)
    for (const type of creatorTypes.concat(Object.keys(this.bibtex.creators).filter(other => !creatorTypes.includes(other)))) {
      // 'assignee' is not a creator field for Zotero
      if (type === 'holder' && this.item.itemType === 'patent') continue
      if (!this.bibtex.fields[type]) continue

      const creators = this.bibtex.fields[type].length ? this.bibtex.creators[type] : []
      delete this.bibtex.fields[type]

      let creatorType = creatorTypeMap[`${this.item.itemType}.${type}`] || creatorTypeMap[type]
      if (creatorType === 'author') creatorType = ['director', 'inventor', 'programmer', 'author'].find(t => creatorsForType.includes(t))
      if (!creatorsForType.includes(creatorType)) creatorType = null
      if (!creatorType && type === 'bookauthor' && creatorsForType.includes('author')) creatorType = 'author'
      if (!creatorType) creatorType = 'contributor'

      for (const creator of creators) {
        const name: {lastName?: string, firstName?: string, fieldMode?: number, creatorType: string } = { creatorType }

        if (creator.literal) {
          name.lastName = creator.literal.replace(/\u00A0/g, ' ')
          name.fieldMode = 1
        }
        else {
          name.firstName = creator.firstName || ''
          name.lastName = creator.lastName || ''
          if (creator.prefix) name.lastName = `${creator.prefix} ${name.lastName}`.trim()
          if (creator.suffix) name.firstName = name.firstName ? `${name.firstName}, ${creator.suffix}` : creator.suffix
          name.firstName = name.firstName.replace(/\u00A0/g, ' ').trim()
          name.lastName = name.lastName.replace(/\u00A0/g, ' ').trim()
          if (name.lastName && !name.firstName) name.fieldMode = 1
        }

        this.item.creators.push(name)
      }
    }

    // do this before because some handlers directly access this.bibtex.fields
    for (const [field, values] of Object.entries(this.bibtex.fields)) {
      this.bibtex.fields[field] = values.map(value => typeof value === 'string' ? value.replace(/\u00A0/g, ' ').trim() : `${value}`)
    }

    const zoteroField = {
      conference: 'conferenceName',
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
      }[this.bibtex.fields.type[0].toLowerCase()] || ''
    }

    const urls: Set<string> = new Set
    for (const field of ['url', 'howpublished', 'remote-url']) {
      if (this.bibtex.fields[field]) {
        this.bibtex.fields[field] = this.bibtex.fields[field].filter(url => !this.$url(url, field, urls))
      }
    }

    for (const [field, values] of Object.entries(this.bibtex.fields)) {
      for (const value of values) {
        if (field.match(/^(local-zo-url-[0-9]+|file-[0-9]+)$/)) {
          if (this.$file(value)) continue
        }
        else if (field.match(/^bdsk-url-[0-9]+$/)) {
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
            if (err) this.error(`import error: ${this.item.itemType} ${this.bibtex.key}: ${err}\n${JSON.stringify(this.item, null, 2)}`)
          }
          if (imported) continue
        }
        else if (field.match(/^note_[0-9]+$/)) { // jabref, #1878
          if (this.$note(value, 'note')) continue
        }

        if (this[`$${field}`]?.(value, field)) continue

        switch (field) {
          case 'pst':
            this.extra.push(`tex.howpublished: ${value}`)
            break

          case 'doi':
            this.extra.push(`DOI: ${value}`)
            break

          case 'issn':
            this.extra.push(`ISSN: ${value}`)
            break

          case 'pmid':
            this.extra.push(`PMID: ${value}`)
            break

          case 'subject': // otherwise it's picked up by the subject -> title mapper, and I don't think that's right
            this.extra.push(`tex.${field}: ${value}`)
            break

          case 'origtitle':
            this.extra.push(`Original title: ${value}`)
            break

          case 'origlocation':
            this.extra.push(`Original publisher place: ${value}`)
            break

          default:
            if (this.translation.preferences.importDetectURLs && this.isURL(value)) {
              this.item.attachments.push({ itemType: 'attachment', url: value, title: field, linkMode: 'linked_url' })
            }
            else if (value.indexOf('\n') >= 0) {
              this.item.notes.push(`<p><b>${Zotero.Utilities.text2html(field, false)}</b></p>${Zotero.Utilities.text2html(value, false)}`)
            }
            else {
              const candidates = [field, zoteroField[field]]
              let name
              if ((name = candidates.find(f => this.validFields[f])) && !this.item[field]) {
                this.item[name] = value
              }
              else if (name = candidates.find(f => label[f])) {
                this.extra.push(`${label[name]}: ${value}`)
              }
              else {
                this.extra.push(`tex.${field.match(/[:=]/) ? `"${field}"` : field}: ${value}`)
              }
            }
            break
        }
      }
    }

    if (this.translation.preferences.rawImports && this.translation.preferences.rawLaTag !== '*') {
      if (!this.item.tags) this.item.tags = []
      this.item.tags.push({ tag: this.translation.preferences.rawLaTag, type: 1 })
    }

    // Endnote has no citation keys in their bibtex
    if (this.bibtex.key && this.translation.preferences.importCitationKey) this.extra.push(`Citation Key: ${this.bibtex.key}`)

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
      const eprintclass = this.eprint.eprintType === 'arXiv' && this.eprint.eprintclass ? ` [${this.eprint.eprintclass}]` : ''
      this.extra.push(`${this.eprint.eprintType}: ${this.eprint.eprint}${eprintclass}`)
    }
    else {
      delete this.eprint.eprintType
      for (const [k, v] of Object.entries(this.eprint)) {
        this.extra.push(`tex.${k.toLowerCase()}: ${v}`)
      }
    }

    this.extra = this.extra.filter(line => {
      if (line.startsWith('tex.')) return this.translation.preferences.importExtra
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

    if (this.translation.preferences.testing) {
      const err = validItem(JSON.parse(JSON.stringify(this.item)), true) // stringify/parse is a fast way to get rid of methods
      if (err) this.error(`import error: ${this.item.itemType} ${this.bibtex.key}: ${err}\n${JSON.stringify(this.item, null, 2)}`)
    }

    return true
  }

  private isURL(url: string): boolean {
    try {
      return (new URL(url)).protocol.match(/^https?:$/) as unknown as boolean
    }
    catch (err) {
      return false
    }
  }

  private addToExtra(str) {
    if (this.item.extra && this.item.extra !== '') {
      this.item.extra += `\n${str}`
    }
    else {
      this.item.extra = str
    }
  }

  private set(field, value, fallback = null) {
    if (!this.validFields[field]) return fallback && this.fallback(fallback, value)

    if (this.translation.preferences.testing && (this.item[field] || typeof this.item[field] === 'number') && (value || typeof value === 'number') && this.item[field] !== value) {
      this.error(`import error: duplicate ${field} on ${this.item.itemType} ${this.bibtex.key} (old: ${this.item[field]}, new: ${value})`)
    }

    this.item[field] = value
    return true
  }
}
