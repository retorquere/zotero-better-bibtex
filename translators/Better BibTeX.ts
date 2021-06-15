declare const Zotero: any

import { log } from '../content/logger'

const toWordsOrdinal = require('number-to-words/src/toWordsOrdinal')
function edition(n: string | number): string {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  if (typeof n === 'number' || (typeof n === 'string' && n.match(/^[0-9]+$/))) return toWordsOrdinal(n).replace(/^\w/, (c: string) => c.toUpperCase())
  return n
}
import wordsToNumbers from 'words-to-numbers'

import { Translator } from './lib/translator'
export { Translator }

import { Reference } from './bibtex/reference'
import { Exporter } from './bibtex/exporter'
import * as escape from '../content/escape'

import * as bibtexParser from '@retorquere/bibtex-parser'
import { valid, label } from '../gen/items/items'
import { arXiv } from '../content/arXiv'

Reference.prototype.caseConversion = {
  title: true,
  series: true,
  shorttitle: true,
  booktitle: true,
  type: true,

  // only for imports
  origtitle: true,
  maintitle: true,
  eventtitle: true,
}

Reference.prototype.fieldEncoding = {
  groups: 'verbatim', // blegh jabref field
  url: 'verbatim',
  doi: 'verbatim',
  // school: 'literal'
  institution: 'literal',
  publisher: 'literal',
  organization: 'literal',
  address: 'literal',
}

const lint: Record<string, {required: string[], optional: string[]}> = {
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
lint.conference = lint.inproceedings

Reference.prototype.lint = function(_explanation) {
  const type = lint[this.referencetype.toLowerCase()]
  if (!type) return

  log.debug('lint:', type)

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
  log.debug('lint:', warnings)

  return warnings
}

Reference.prototype.addCreators = function() {
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

Reference.prototype.typeMap = {
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
    presentation    : 'misc',
    radioBroadcast  : 'misc',
    report          : 'techreport',
    statute         : 'misc',
    thesis          : 'phdthesis',
    tvBroadcast     : 'misc',
    videoRecording  : 'misc',
    webpage         : 'misc',
  },
}

const months = [ 'jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec' ]

export function doExport(): void {
  Translator.init('export')
  Reference.installPostscript()
  Exporter.prepare_strings()

  // Zotero.write(`\n% ${Translator.header.label}\n`)
  Zotero.write('\n')

  for (const item of Exporter.items) {
    const ref = new Reference(item)
    if (item.itemType === 'report' && item.type?.toLowerCase().includes('manual')) ref.referencetype = 'manual'
    if (['zotero.bookSection', 'csl.chapter', 'tex.chapter'].includes(ref.referencetype_source) && ref.hasCreator('bookAuthor')) ref.referencetype = 'inbook'

    ref.add({name: 'address', value: item.place})
    ref.add({name: 'chapter', value: item.section})
    ref.add({name: 'edition', value: edition(item.edition)})
    ref.add({name: 'type', value: item.type})
    ref.add({name: 'series', value: item.series, bibtexStrings: true})
    ref.add({name: 'title', value: item.title})
    ref.add({name: 'volume', value: item.volume})
    ref.add({name: 'copyright', value: item.rights})
    ref.add({name: 'isbn', value: item.ISBN})
    ref.add({name: 'issn', value: item.ISSN})
    ref.add({name: 'lccn', value: item.callNumber})
    ref.add({name: 'shorttitle', value: item.shortTitle})
    ref.add({name: 'abstract', value: item.abstractNote?.replace(/\n+/g, ' ')})
    ref.add({name: 'nationality', value: item.country})
    ref.add({name: 'language', value: item.language})
    ref.add({name: 'assignee', value: item.assignee})

    if (!['book', 'inbook', 'incollection', 'proceedings', 'inproceedings'].includes(ref.referencetype) || !ref.has.volume) ref.add({ name: 'number', value: item.number || item.issue || item.seriesNumber })
    ref.add({ name: 'urldate', value: item.accessDate && item.accessDate.replace(/\s*T?\d+:\d+:\d+.*/, '') })

    if (['zotero.bookSection', 'zotero.conferencePaper', 'tex.chapter', 'csl.chapter'].includes(ref.referencetype_source)) {
      ref.add({ name: 'booktitle', value: item.publicationTitle || item.conferenceName, bibtexStrings: true })

    }
    else if (ref.getBibString(item.publicationTitle)) {
      ref.add({ name: 'journal', value: item.publicationTitle, bibtexStrings: true })

    }
    else {
      ref.add({ name: 'journal', value: (Translator.options.useJournalAbbreviation && item.journalAbbreviation) || item.publicationTitle, bibtexStrings: true })

    }

    switch (ref.referencetype_source.split('.')[1]) {
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
    let url = null
    if (Translator.preferences.DOIandURL === 'both' || !doi) {
      switch (Translator.preferences.bibtexURL) {
        case 'url':
          url = ref.add({ name: 'url', value: item.url || item.extraFields.kv.url, enc: 'url' })
          break

        case 'note':
          url = ref.add({ name: (['misc', 'booklet'].includes(ref.referencetype) && !ref.has.howpublished ? 'howpublished' : 'note'), value: item.url || item.extraFields.kv.url, enc: 'url' })
          break

        default:
          if (['csl.webpage', 'zotero.webpage', 'csl.post', 'csl.post-weblog'].includes(ref.referencetype_source)) url = ref.add({ name: 'howpublished', value: item.url || item.extraFields.kv.url })
          break
      }
    }
    if (Translator.preferences.DOIandURL === 'both' || !url) ref.add({ name: 'doi', value: (doi || '').replace(/^https?:\/\/doi.org\//i, '') })

    if (ref.referencetype_source.split('.')[1] === 'thesis') {
      const thesistype = {
        phdthesis: 'phdthesis',
        phd: 'phdthesis',
        mastersthesis: 'mastersthesis',
        masterthesis: 'mastersthesis',
        master: 'mastersthesis',
        ma: 'mastersthesis',
      }[item.type?.toLowerCase()]
      if (thesistype) {
        ref.referencetype = thesistype
        ref.remove('type')
      }
    }

    // #1471 and http://ctan.cs.uu.nl/biblio/bibtex/base/btxdoc.pdf: organization The organization that sponsors a conference or that publishes a manual.
    if (ref.referencetype === 'inproceedings') {
      const sponsors = []
      item.creators = item.creators.filter(creator => {
        if (creator.creatorType !== 'sponsor') return true

        sponsors.push(creator.source)
        return false
      })
      ref.add({ name: 'organization', value: sponsors.join(' and ') })
    }
    ref.addCreators()
    // #1541
    if (ref.referencetype === 'inbook' && ref.has.author && ref.has.editor) delete ref.has.editor

    switch (ref.date.type) {
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
        log.debug('Unexpected date type', { date: item.date, parsed: ref.date })
    }

    ref.add({ name: 'keywords', value: item.tags, enc: 'tags' })

    ref.add({ name: 'pages', value: ref.normalizeDashes(item.pages) })

    ref.add({ name: 'file', value: item.attachments, enc: 'attachments' })

    ref.complete()
  }

  Exporter.complete()
  Zotero.write('\n')
}

export function detectImport(): boolean {
  let detected = (Zotero.getHiddenPref('better-bibtex.import') as boolean)
  if (detected) {
    const input = Zotero.read(102400) // eslint-disable-line no-magic-numbers
    const bib = bibtexParser.chunker(input, { max_entries: 1 })
    detected = !!bib.find(chunk => chunk.entry)
  }
  return detected
}

function importGroup(group, itemIDs, root = null) {
  const collection = new Zotero.Collection()
  collection.type = 'collection'
  collection.name = group.name
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  collection.children = group.entries.filter(citekey => itemIDs[citekey]).map(citekey => ({type: 'item', id: itemIDs[citekey]}))

  for (const subgroup of group.groups || []) {
    collection.children.push(importGroup(subgroup, itemIDs))
  }

  if (root) collection.complete()
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return collection
}

class ZoteroItem {
  protected item: any

  private typeMap = {
    article:            'journalArticle',
    book:               'book',
    book_section:       'bookSection', // mendeley made-up entry type
    booklet:            'book',
    codefragment:       'computerProgram',
    collection:         'book',
    conference:         'conferencePaper',
    film:               'film', // mendeley made-up entry type
    generic:            'journalArticle', // mendeley made-up entry type
    inbook:             'bookSection',
    incollection:       'bookSection',
    inproceedings:      'conferencePaper',
    inreference:        'encyclopediaArticle',
    magazine_article:   'magazineArticle', // mendeley made-up entry type
    manual:             'report',
    mastersthesis:      'thesis',
    movie:              'film',
    misc:               'document',
    newspaper_article:  'newspaperArticle', // mendeley made-up entry type
    online:             'webpage',
    patent:             'patent',
    phdthesis:          'thesis',
    proceedings:        'book',
    report:             'report',
    software:           'computerProgram',
    softwaremodule:     'computerProgram',
    softwareversion:    'computerProgram',
    talk:               'presentation',
    techreport:         'report',
    thesis:             'thesis',
    unpublished:        'manuscript',
    video:              'film',
    web_page:           'webpage', // mendeley made-up entry type
    webpage:            'webpage', // papers3 made-up entry type
  }

  private type: string
  private hackyFields: string[] = []
  private eprint: { [key: string]: string } = {}
  private validFields: Record<string, boolean>
  private numberPrefix: string
  private english = 'English'

  constructor(private id: number, private bibtex: any, private jabref, private errors: bibtexParser.ParseError[]) {
    this.bibtex.type = this.bibtex.type.toLowerCase()
    this.type = this.typeMap[this.bibtex.type]
    if (!this.type) {
      this.errors.push({ message: `Don't know what Zotero type to make of '${this.bibtex.type}' for ${this.bibtex.key ? `@${this.bibtex.key}` : 'unnamed item'}, importing as ${this.type = 'document'}` })
      this.hackyFields.push(`tex.referencetype: ${this.bibtex.type}`)
    }
    if (this.type === 'book' && (this.bibtex.fields.title || []).length && (this.bibtex.fields.booktitle || []).length) this.type = 'bookSection'
    if (this.type === 'journalArticle' && (this.bibtex.fields.booktitle || []).length && this.bibtex.fields.booktitle[0].match(/proceeding/i)) this.type = 'conferencePaper'

    if (!valid.type[this.type]) this.error(`import error: unexpected item ${this.bibtex.key} of type ${this.type}`)
    this.validFields = valid.field[this.type]

    if (!Object.keys(this.bibtex.fields).length) {
      this.errors.push({ message: `No fields in ${this.bibtex.key ? `@${this.bibtex.key}` : 'unnamed item'}` })
      this.item = null

    }
    else {
      this.item = new Zotero.Item(this.type)
      this.item.itemID = this.id
      if (this.type === 'report' && this.bibtex.type === 'manual') this.$type('manual')

      this.import()

      if (Translator.preferences.testing) {
        const err = Object.keys(this.item).filter(name => !this.validFields[name]).join(', ')
        if (err) this.error(`import error: unexpected fields on ${this.type} ${this.bibtex.key}: ${err}`)
      }
    }
  }

  public async complete() {
    if (this.item) await this.item.complete()
  }

  private fallback(fields, value) {
    const field = fields.find(f => label[f])
    if (field) {
      this.hackyFields.push(`${label[field]}: ${value.replace(/\n+/g, '')}`)
      return true
    }
    return false
  }

  protected $title(_value) {
    let title = []
    if (this.bibtex.fields.title) title = title.concat(this.bibtex.fields.title)
    if (this.bibtex.fields.titleaddon) title = title.concat(this.bibtex.fields.titleaddon)
    if (this.bibtex.fields.subtitle) title = title.concat(this.bibtex.fields.subtitle)

    if (this.type === 'encyclopediaArticle') {
      this.item.publicationTitle = title.join('. ')
    }
    else {
      this.item.title = title.join('. ')
    }
    return true
  }
  protected $titleaddon(value) { return this.$title(value) }
  protected $subtitle(value) { return this.$title(value) }

  protected $holder(_value, _field) {
    if (this.item.itemType === 'patent') {
      this.item.assignee = this.bibtex.fields.holder.map((name: string) => name.replace(/"/g, '')).join('; ')
    }
    return true
  }

  protected $publisher(value, field) {
    // difference between jurism and zotero. Prepending 'field' makes the import prefer exact matches to the input
    const candidates = [field].concat(['institution', 'publisher'])
    field = candidates.find(f => this.validFields[f])
    if (!field) return this.fallback(candidates, value)

    this.item[field] = [
      (this.bibtex.fields.publisher || []).join(' and '),
      (this.bibtex.fields.institution || []).join(' and '),
      (this.bibtex.fields.school || []).join(' and '),
    ].filter(v => v.replace(/[ \t\r\n]+/g, ' ').trim()).join(' / ')

    return true
  }
  protected $institution(value, field) { return this.$publisher(value, field) }
  protected $school(value, field) { return this.$publisher(value, field) }

  protected $address(value) {
    return this.set('place', value, ['place'])
  }
  protected $location(value) {
    if (this.type === 'conferencePaper') {
      this.hackyFields.push(`Place: ${value.replace(/\n+/g, '')}`)
      return true
    }

    return this.$address(value)
  }

  protected $edition(value) {
    value = value.replace(/^([0-9]+)(nd|th)$/, '$1')
    const numbers = wordsToNumbers(value)
    if (typeof numbers === 'number' || (typeof numbers === 'string' && numbers && !numbers.match(/\w/))) value = numbers
    return this.set('edition', value)
  }

  protected $isbn(value) { return this.set('ISBN', value) }

  protected $booktitle(value) {
    switch (this.type) {
      case 'conferencePaper':
      case 'bookSection':
        return this.set('publicationTitle', value)

      case 'book':
        if ((this.bibtex.fields.title || []).includes(value)) return true
        if (!this.item.title) return this.set('title', value)
        break
    }

    return this.fallback(['booktitle'], value)
  }

  protected $journaltitle() {
    let journal, abbr = null

    if (this.bibtex.fields['journal-full']) { // bibdesk
      journal = this.bibtex.fields['journal-full'][0]

      if (this.bibtex.fields.journal) {
        abbr = this.bibtex.fields.journal[0]
      }
      else if (this.bibtex.fields.journaltitle) {
        abbr = this.bibtex.fields.journaltitle[0]
      }

      if (abbr === journal) abbr = null

    }
    else if (this.bibtex.fields.journal) {
      journal = this.bibtex.fields.journal[0]

    }
    else if (this.bibtex.fields.journaltitle) {
      journal = this.bibtex.fields.journaltitle[0]

    }

    if (!abbr && this.bibtex.fields.shortjournal) abbr = this.bibtex.fields.shortjournal[0]

    if (abbr) {
      if (this.validFields.journalAbbreviation) {
        this.item.journalAbbreviation = abbr
      }
      else if (!this.hackyFields.find(line => line.startsWith('Journal abbreviation:'))) {
        this.hackyFields.push(`Journal abbreviation: ${abbr}`)
      }
    }

    switch (this.type) {
      case 'conferencePaper':
        this.set('series', journal)
        break

      default:
        this.set('publicationTitle', journal)
        break
    }

    log.debug('$journal:', this.item)

    return true
  }
  protected $journal() { return this.$journaltitle() }
  protected $shortjournal() { return this.$journaltitle() }
  protected '$journal-full'() { return this.$journaltitle() }

  protected $pages(value) {
    if (!this.validFields.pages) return this.fallback(['pages'], value)
    this.set('pages', value)
    return true
  }
  protected $pagetotal(value) {
    if (!this.validFields.numPages) return this.fallback(['numPages'], value)
    this.set('numPages', value)
    return true
  }
  protected $numpages(value, _field) { return this.$pagetotal(value) }

  protected $volume(value) { return this.set('volume', value) }

  protected $doi(value) { return this.set('DOI', value) }

  protected $abstract(value) { return this.set('abstractNote', value) }

  protected $keywords(_value) {
    let tags = this.bibtex.fields.keywords || []
    tags = tags.concat(this.bibtex.fields.keyword || [])
    for (const mesh of this.bibtex.fields.mesh || []) {
      tags = tags.concat((mesh || '').trim().split(/\s*;\s*/).filter(tag => tag)) // eslint-disable-line @typescript-eslint/no-unsafe-return
    }
    tags = tags.sort()
    tags = tags.filter((item, pos, ary) => !pos || (item !== ary[pos - 1]))

    this.item.tags = tags
    return true
  }
  protected $keyword(value) { return this.$keywords(value) }
  protected $mesh(value) { return this.$keywords(value) } // bibdesk

  protected $date(_value) {
    if (this.item.date) return true

    const dates = (this.bibtex.fields.date || []).slice()

    const year = (this.bibtex.fields.year && this.bibtex.fields.year[0]) || ''

    let month = (this.bibtex.fields.month && this.bibtex.fields.month[0]) || ''
    const monthno = months.indexOf(month.toLowerCase())
    if (monthno >= 0) month = `0${monthno + 1}`.slice(-2) // eslint-disable-line no-magic-numbers

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
  protected $year(value) { return this.$date(value) }
  protected $month(value) { return this.$date(value) }
  protected $day(value) { return this.$date(value) }

  // "files" will import the same as "file" but won't be treated as verbatim by the bibtex parser. Needed because the people at Mendeley can't be bothered
  // to read the manual apparently.
  protected $files(value) { return this.$file(value) }
  protected $file(value) {
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

        case 3: // eslint-disable-line no-magic-numbers
          att.title = parts[0]
          att.path = parts[1]
          att.mimeType = parts[2] // eslint-disable-line no-magic-numbers
          break

        default:
          log.error(`attachment import: Unexpected number of parts in file record '${record}': ${parts.length}`)
          // might be absolute windows path, just make Zotero try
          att.path = parts.join(':')
          break
      }

      if (!att.path) {
        log.debug(`attachment import: file record '${record}' has no file path`)
        continue
      }

      if (this.jabref.fileDirectory) att.path = `${this.jabref.fileDirectory}${Translator.paths.sep}${att.path}`

      if (att.mimeType.toLowerCase() === 'pdf' || (!att.mimeType && att.path.toLowerCase().endsWith('.pdf'))) {
        att.mimeType = 'application/pdf'
      }
      if (!att.mimeType) delete att.mimeType

      att.title = att.title || att.path.split(/[\\/]/).pop().replace(/\.[^.]+$/, '')
      if (!att.title) delete att.title

      this.item.attachments.push(att)
    }

    return true
  }

  protected $license(value) {
    if (this.validFields.rights) {
      this.set('rights', value)
      return true
    }
    else {
      return this.fallback(['rights'], value)
    }
  }

  protected $version(value) {
    if (this.validFields.versionNumber) {
      this.set('versionNumber', value)
      return true
    }
    else {
      return this.fallback(['versionNumber'], value)
    }
  }

  /* TODO: Zotero ignores these on import
  protected '$date-modified'(value) { return this.item.dateAdded = this.unparse(value) }
  protected '$date-added'(value) { return this.item.dateAdded = this.unparse(value) }
  protected '$added-at'(value) { return this.item.dateAdded = this.unparse(value) }
  protected $timestamp(value) { return this.item.dateAdded = this.unparse(value) }
  */

  protected $urldate(value) { return this.set('accessDate', value) }
  protected $lastchecked(value) { return this.$urldate(value) }

  protected $number(value, field) {
    if (this.bibtex.fields.number && this.validFields.number && this.bibtex.fields.issue && this.validFields.issue) {
      this.set('issue', this.bibtex.fields.issue)
      this.set('number', this.bibtex.fields.number)
      return true
    }

    const candidates = [field].concat(['seriesNumber', 'number', 'issue'])
    field = candidates.find(f => this.validFields[f])
    if (!field) return this.fallback(candidates, value)
    this.set(field, value)
    return true
  }
  protected $issue(value, field) { return this.$number(value, field) }

  protected $issn(value) {
    if (!this.validFields.ISSN) return this.fallback(['ISSN'], value)

    return this.set('ISSN', value)
  }

  protected $url(value, field) {
    let m, url

    // no escapes needed in an verbatim field but people do it anyway
    value = value.replace(/\\/g, '')

    if (m = value.match(/^(\\url{)(https?:\/\/|mailto:)}$/i)) {
      url = m[2]
    }
    else if (field === 'url' || /^(https?:\/\/|mailto:)/i.test(value)) {
      url = value
    }
    else {
      url = null
    }

    if (!url) return false

    if (this.item.url) return (this.item.url === url)

    this.item.url = url
    return true
  }
  protected $howpublished(value, field) { return this.$url(value, field) }
  protected '$remote-url'(value, field) { return this.$url(value, field) }

  protected $type(value) {
    if (this.type === 'patent') {
      this.numberPrefix = {patent: '', patentus: 'US', patenteu: 'EP', patentuk: 'GB', patentdede: 'DE', patentfr: 'FR' }[value.toLowerCase()]
      return typeof this.numberPrefix !== 'undefined'
    }

    if (!this.validFields.type) return this.fallback(['type'], value)
    this.set('type', value)
    return true
  }

  protected $lista(value) {
    if (this.type !== 'encyclopediaArticle' || !!this.item.title) return false

    this.set('title', value)
    return true
  }

  protected $annotation(value) {
    this.item.notes.push(value)
    return true
  }
  protected $comment(value) { return this.$annotation(value) }
  protected $annote(value) { return this.$annotation(value) }
  protected $review(value) { return this.$annotation(value) }
  protected $notes(value) { return this.$annotation(value) }
  protected $note(value) { return this.$annotation(value) }

  protected $series(value) { return this.set('series', value) }

  // horrid jabref 3.8+ groups format
  protected $groups(value) {
    for (const group of value.split(/\s*,\s*/)) {
      if (this.jabref.groups[group] && !this.jabref.groups[group].entries.includes(this.bibtex.key)) this.jabref.groups[group].entries.push(this.bibtex.key)
      log.debug('$groups: adding', this.bibtex.key, 'to', group, ':', this.jabref.groups)
    }
    return true
  }

  protected $language(_value, _field) {
    const language = (this.bibtex.fields.language || []).concat(this.bibtex.fields.langid || [])
      .map(lang => ['en', 'eng', 'usenglish', 'english'].includes(lang.toLowerCase()) ? this.english : lang) // eslint-disable-line @typescript-eslint/no-unsafe-return
      .join(' and ')

    return this.set('language', language)
  }
  protected $langid(value, field) { return this.$language(value, field) }

  protected $shorttitle(value) { return this.set('shortTitle', value) }

  protected $eprinttype(value, field) {
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
  protected $archiveprefix(value, field) { return this.$eprinttype(value, field) }

  protected $eprint(value, field) {
    this.eprint[field] = value
    return true
  }
  protected $eprintclass(value, field) { return this.$eprint(value, field) }
  protected $primaryclass(value, _field) { return this.$eprint(value, 'eprintclass') }
  protected $slaccitation(value, field) { return this.$eprint(value, field) }

  protected $nationality(value) { return this.set('country', value) }

  protected $chapter(value) {
    const candidates = ['section', 'bookSection']
    const field = candidates.find(f => this.validFields[f])
    if (!field) return this.fallback(candidates, value)

    return this.set(field, value)
  }

  protected $origdate(value) {
    if (!this.fallback(['originaldate'], value)) this.hackyFields.push(`Original Date: ${value}`)
    return true
  }

  private error(err) {
    log.error(err)
    throw new Error(err)
  }

  private import() {
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
    const creatorsForType = Zotero.Utilities.getCreatorsForType(this.item.itemType)
    for (const type of creatorTypes.concat(Object.keys(this.bibtex.creators).filter(other => !creatorTypes.includes(other)))) {
      // 'assignee' is not a creator field for Zotero
      if (type === 'holder' && this.type === 'patent') continue
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
          if (creator.suffix) name.lastName = name.lastName ? `${name.lastName}, ${creator.suffix}` : creator.suffix
          name.firstName = name.firstName.replace(/\u00A0/g, ' ').trim()
          name.lastName = name.lastName.replace(/\u00A0/g, ' ').trim()
          if (name.lastName && !name.firstName) name.fieldMode = 1
        }

        this.item.creators.push(name)
      }
    }

    // do this before because some handlers directly access this.bibtex.fields
    for (const [field, values] of Object.entries(this.bibtex.fields)) {
      this.bibtex.fields[field] = (values as string[]).map(value => typeof value === 'string' ? value.replace(/\u00A0/g, ' ').trim() : `${value}`)
    }

    const zoteroField = {
      conference: 'conferenceName',
    }
    for (const [field, values] of Object.entries(this.bibtex.fields)) {
      for (const value of (values as string[])) {
        if (field.match(/^(local-zo-url-[0-9]+)|(file-[0-9]+)$/)) {
          if (this.$file(value)) continue

        }
        else if (field.match(/^bdsk-url-[0-9]+$/)) {
          if (this.$url(value, field)) continue

        }

        if (this[`$${field}`] && this[`$${field}`](value, field)) continue

        switch (field) {
          case 'pst':
            this.hackyFields.push(`tex.howpublished: ${value}`)
            break

          case 'doi':
            this.hackyFields.push(`DOI: ${value}`)
            break

          case 'issn':
            this.hackyFields.push(`ISSN: ${value}`)
            break

          case 'pmid':
            this.hackyFields.push(`PMID: ${value}`)
            break

          case 'subject': // otherwise it's picked up by the sibject -> title mapper, and I don't think that's right
            this.hackyFields.push(`tex.${field}: ${value}`)
            break

          case 'origtitle':
            this.hackyFields.push(`Original title: ${value}`)
            break

          case 'origlocation':
            this.hackyFields.push(`Original publisher place: ${value}`)
            break

          default:
            if (value.indexOf('\n') >= 0) {
              this.item.notes.push(`<p><b>${Zotero.Utilities.text2html(field, false)}</b></p>${Zotero.Utilities.text2html(value, false)}`)
            }
            else {
              const candidates = [field, zoteroField[field]]
              let name
              if ((name = candidates.find(f => this.validFields[f])) && !this.item[field]) {
                this.item[name] = value
              }
              else if (name = candidates.find(f => label[f])) {
                this.hackyFields.push(`${label[name]}: ${value}`)
              }
              else {
                this.hackyFields.push(`tex.${field}: ${value}`)
              }
            }
            break
        }
      }
    }

    if (Translator.preferences.rawImports && Translator.preferences.rawLaTag !== '*') {
      if (!this.item.tags) this.item.tags = []
      this.item.tags.push({ tag: Translator.preferences.rawLaTag, type: 1 })
    }

    // eslint-disable-next-line id-blacklist
    if (this.numberPrefix && this.item.number && !this.item.number.toLowerCase().startsWith(this.numberPrefix.toLowerCase())) this.item.number = `${this.numberPrefix}${this.item.number}`

    if (this.bibtex.key) this.hackyFields.push(`Citation Key: ${this.bibtex.key}`) // Endnote has no citation keys in their bibtex

    if (this.eprint.slaccitation && !this.eprint.eprint) {
      const m = this.eprint.slaccitation.match(/^%%CITATION = (.+);%%$/)
      const arxiv = arXiv.parse(m && m[1].trim())

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
      this.hackyFields.push(`${this.eprint.eprintType}: ${this.eprint.eprint}${eprintclass}`)

    }
    else {

      delete this.eprint.eprintType
      for (const [k, v] of Object.entries(this.eprint)) {
        this.hackyFields.push(`tex.${k.toLowerCase()}: ${v}`)
      }
    }

    this.hackyFields = this.hackyFields.filter(line => {
      if (line.startsWith('Citation Key:')) return Translator.preferences.importCitationKey
      if (line.startsWith('tex.')) return Translator.preferences.importExtra
      return true
    })
    if (this.hackyFields.length > 0) {
      this.hackyFields.sort((a, b) => {
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
      this.item.extra = this.hackyFields.map(line => line.replace(/\n+/g, ' ')).concat(this.item.extra || '').join('\n').trim()
    }

    if (!this.item.publisher && this.item.backupPublisher) {
      this.item.publisher = this.item.backupPublisher
      delete this.item.backupPublisher
    }
  }

  /*
  private addToExtra(str) {
    if (this.item.extra && this.item.extra !== '') {
      this.item.extra += `\n${str}`
    }
    else {
      this.item.extra = str
    }
  }
  */

  private set(field, value, fallback = null) {
    if (!this.validFields[field]) return fallback && this.fallback(fallback, value)

    if (Translator.preferences.testing && (this.item[field] || typeof this.item[field] === 'number') && (value || typeof value === 'number') && this.item[field] !== value) {
      this.error(`import error: duplicate ${field} on ${this.type} ${this.bibtex.key} (old: ${this.item[field]}, new: ${value})`)
    }

    this.item[field] = value
    return true
  }
}

// ZoteroItem::$__note__ = ZoteroItem::$__key__ = -> true

//
// ZoteroItem::$referenceType = (value) ->
//   @item.thesisType = value if value in [ 'phdthesis', 'mastersthesis' ]
//   return true
//
// ### these return the value which will be interpreted as 'true' ###
//
// ZoteroItem::$copyright    = (value) -> @item.rights = value
// ZoteroItem::$assignee     = (value) -> @item.assignee = value
// ZoteroItem::$issue        = (value) -> @item.issue = value
//
// ### ZoteroItem::$lccn = (value) -> @item.callNumber = value ###
// ZoteroItem::$lccn = (value) -> @hackyFields.push("LCCB: #{value}")
// ZoteroItem::$pmid = ZoteroItem::$pmcid = (value, field) -> @hackyFields.push("#{field.toUpperCase()}: #{value}")
// ZoteroItem::$mrnumber = (value) -> @hackyFields.push("MR: #{value}")
// ZoteroItem::$zmnumber = (value) -> @hackyFields.push("Zbl: #{value}")
//
// ZoteroItem::$subtitle = (value) ->
//   @item.title = '' unless @item.title
//   @item.title = @item.title.trim()
//   value = value.trim()
//   if not /[-–—:!?.;]$/.test(@item.title) and not /^[-–—:.;¡¿]/.test(value)
//     @item.title += ': '
//   else
//   @item.title += ' ' if @item.title.length
//   @item.title += value
//   return true
//
// ZoteroItem::$fjournal = (value) ->
//   @item.journalAbbreviation = @item.publicationTitle if @item.publicationTitle
//   @item.publicationTitle = value
//   return true

async function fetch_polyfill(url): Promise<{ json: () => Promise<any> }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('GET', url)

    xhr.onload = function() {
      if (this.status >= 200 && this.status < 300) { // eslint-disable-line no-magic-numbers
        resolve({ json: () => JSON.parse(xhr.response) }) // eslint-disable-line @typescript-eslint/no-unsafe-return
      }
      else {
        reject({
          status: this.status,
          statusText: xhr.statusText,
        })
      }
    }

    xhr.onerror = function() {
      reject({
        status: this.status,
        statusText: xhr.statusText,
      })
    }

    xhr.send()
  })
}

export async function doImport(): Promise<void> {
  Translator.init('import')

  const unabbreviate = Translator.preferences.importJabRefAbbreviations ? await (await fetch_polyfill('resource://zotero-better-bibtex/unabbrev/unabbrev.json')).json() : null
  const strings = Translator.preferences.importJabRefStrings ? await (await fetch_polyfill('resource://zotero-better-bibtex/unabbrev/strings.json')).json() : null

  let read
  let input = ''
  while ((read = Zotero.read(0x100000)) !== false) { // eslint-disable-line no-magic-numbers
    input += read
  }

  if (Translator.preferences.strings && Translator.preferences.importBibTeXStrings) input = `${Translator.preferences.strings}\n${input}`

  const bib = await bibtexParser.parse(input, {
    async: true,
    caseProtection: (Translator.preferences.importCaseProtection as 'as-needed'), // we are actually sure it's a valid enum value; stupid workaround for TS2322: Type 'string' is not assignable to type 'boolean | "as-needed" | "strict"'.
    errorHandler: (Translator.preferences.testing ? undefined : function(err) { log.error(err) }), // eslint-disable-line prefer-arrow/prefer-arrow-functions
    unknownCommandHandler: function(node) { // eslint-disable-line object-shorthand
      switch (Translator.preferences.importUnknownTexCommand) {
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
          throw new Error(`Unexpected unknownCommandHandler ${JSON.stringify(Translator.preferences.importUnknownTexCommand)}`)
      }
    },
    markup: (Translator.csquotes ? { enquote: Translator.csquotes } : {}),
    sentenceCase: Translator.preferences.importSentenceCase !== 'off',
    guessAlreadySentenceCased: Translator.preferences.importSentenceCase === 'on+guess',
    verbatimFields: Translator.verbatimFields,
    raw: Translator.preferences.rawImports,
    unabbreviate,
    strings,
  })
  const errors = bib.errors

  const whitelist = bib.comments
    .filter(comment => comment.startsWith('zotero-better-bibtex:whitelist:'))
    .map(comment => comment.toLowerCase().replace(/\s/g, '').split(':').pop().split(',').filter(key => key))[0]

  const jabref = bibtexParser.jabref(bib.comments)

  const itemIDS = {}
  let imported = 0
  let id = 0
  for (const bibtex of bib.entries) {
    if (bibtex.key && whitelist && !whitelist.includes(bibtex.key.toLowerCase())) continue
    id++

    if (bibtex.key) itemIDS[bibtex.key] = id // Endnote has no citation keys

    try {
      await (new ZoteroItem(id, bibtex, jabref, errors)).complete()
    }
    catch (err) {
      log.error('bbt import error:', err)
      errors.push({ message: err.message })
    }

    imported += 1
    Zotero.setProgress(imported / bib.entries.length * 100) // eslint-disable-line no-magic-numbers
  }

  for (const group of jabref.root || []) {
    importGroup(group, itemIDS, true)
  }

  if (errors.length) {
    const item = new Zotero.Item('note')
    item.note = 'Import errors found: <ul>'
    for (const err of errors) {
      item.note += '<li>'
      if (err.line) {
        item.note += `line ${err.line}`
        if (err.column) item.note += `, column ${err.column}`
        item.note += ': '
      }
      item.note += escape.html(err.message)
      if (err.source) item.note += `<pre>${escape.html(err.source)}</pre>`
      item.note += '</li>'
    }
    item.note += '</ul>'
    item.tags = [{ tag: '#Better BibTeX import error', type: 1 }]
    await item.complete()
  }

  Zotero.setProgress(100) // eslint-disable-line no-magic-numbers
}
