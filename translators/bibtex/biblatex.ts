import { Exporter as BibTeXExporter } from './exporter'
import { Translation } from '../lib/translator'
import { strToISO } from '../../content/dateparser'
import { qualityReport } from '../../gen/biber-tool'
import type { Collected } from '../lib/collect'

import { Entry as BaseEntry, Config } from './entry'

const config: Config = {
  fieldEncoding: {
    groups: 'verbatim', // blegh jabref field
    url: 'url',
    doi: 'verbatim',
    eprint: 'verbatim',
    eprintclass: 'verbatim',
    crossref: 'raw',
    xdata: 'raw',
    xref: 'raw',
    entrykey: 'raw',
    childentrykey: 'raw',
    verba: 'verbatim',
    verbb: 'verbatim',
    verbc: 'verbatim',
    institution: 'literal_list',
    publisher: 'literal_list',
    origpublisher: 'literal_list',
    organization: 'literal',
    location: 'literal_list',
    origlocation: 'literal_list',
  },

  caseConversion: {
    title: true,
    subtitle: true,
    series: true,
    shorttitle: true,
    origtitle: true,
    origsubtitle: true,
    booktitle: true,
    booksubtitle: true,
    maintitle: true,
    mainsubtitle: true,
    eventtitle: true,
    eventsubtitle: true,
  },

  typeMap: {
    csl: {
      article: 'article',
      'article-journal': 'article',
      'article-magazine': { type: 'article', subtype: 'magazine' },
      'article-newspaper': { type: 'article', subtype: 'newspaper' },
      bill: 'legislation',
      book: 'book',
      broadcast: { type: 'misc', subtype: 'broadcast' },
      chapter: 'incollection',
      data: 'dataset',
      dataset: 'dataset',
      entry: 'inreference',
      'entry-dictionary': 'inreference',
      'entry-encyclopedia': 'inreference',
      figure: 'image',
      graphic: 'image',
      interview: { type: 'misc', subtype: 'interview' },
      legal_case: 'jurisdiction',
      legislation: 'legislation',
      manuscript: 'unpublished',
      map: { type: 'misc', subtype: 'map' },
      motion_picture: 'movie',
      musical_score: 'audio',
      pamphlet: 'booklet',
      'paper-conference': 'inproceedings',
      patent: 'patent',
      personal_communication: 'letter',
      post: 'online',
      'post-weblog': 'online',
      report: 'report',
      review: 'review',
      'review-book': 'review',
      song: 'music',
      speech: { type: 'misc', subtype: 'speech' },
      thesis: 'thesis',
      treaty: 'legal',
      webpage: 'online',
    },
    zotero: {
      artwork: 'artwork',
      audioRecording: 'audio',
      bill: 'legislation',
      blogPost: 'online',
      book: 'book',
      bookSection: 'incollection',
      case: 'jurisdiction',
      computerProgram: 'software',
      conferencePaper: 'inproceedings',
      dictionaryEntry: 'inreference',
      dataset: 'dataset',
      document: 'misc',
      email: 'letter',
      encyclopediaArticle: 'inreference',
      film: 'video',
      forumPost: 'online',
      gazette: 'jurisdiction',
      hearing: 'jurisdiction',
      instantMessage: 'misc',
      interview: 'misc',
      journalArticle: 'article',
      letter: 'letter',
      magazineArticle: { type: 'article', subtype: 'magazine' },
      manuscript: 'unpublished',
      map: 'misc',
      newspaperArticle: { type: 'article', subtype: 'newspaper' },
      patent: 'patent',
      podcast: 'audio',
      preprint: 'online',
      presentation: 'unpublished',
      radioBroadcast: 'audio',
      report: 'report',
      standard: 'standard',
      statute: 'legislation',
      thesis: 'thesis',
      tvBroadcast: 'video',
      videoRecording: 'video',
      webpage: 'online',
    },
  },
}

class CreatorTypeMap {
  public type: Record<string, string> = {}
  private registered: Record<string, string> = {}
  private static extension = {
    editor: [ '', 'a', 'b', 'c' ],
    name: [ 'a', 'b', 'c' ],
  }

  constructor(private hasEditor: boolean) {
  }

  register(base: 'editor' | 'name', type: string) {
    type = type.toLowerCase()
    if (!this.registered[type]) {
      for (const postfix of CreatorTypeMap.extension[base]) {
        const candidate = `${ base }${ postfix }`
        if (this.hasEditor && candidate === 'editor' && type !== 'editor') continue
        if (this.type[candidate] && postfix !== 'c') continue
        this.type[candidate] = type
        this.registered[type] = candidate
        break
      }
    }

    return this.registered[type]
  }
}

class Entry extends BaseEntry {
  public addCreators() {
    if (!this.item.creators || !this.item.creators.length) return

    const creators: Record<string, any[]> = {
      author: [],
      with: [],
      bookauthor: [],
      commentator: [],
      editor: [],
      editora: [],
      editorb: [],
      editorc: [],
      namea: [],
      nameb: [],
      namec: [],
      holder: [],
      translator: [],
      // scriptwriter: [],
      // director: [],
    }

    const creatorType = new CreatorTypeMap(!!this.item.creators.find(cr => cr.creatorType === 'editor'))
    const video = [ 'video', 'movie' ].includes(this.entrytype)
    if (video) creatorType.register('editor', 'director')

    for (const creator of this.item.creators) {
      switch (creator.creatorType) {
        case 'director':
          // 365.something
          creators[video ? 'editor' : 'author'].push(creator)
          break

        case 'contributor':
          if (this.translation.collected.displayOptions.biblatexAPA) {
            creators.with.push(creator)
          }
          else if (video && this.translation.collected.displayOptions.biblatexChicago) {
            creators[creatorType.register('editor', 'none')].push(creator)
          }
          else {
            creators[creatorType.register('name', 'collaborator')].push(creator)
          }
          break

        case 'author':
        case 'inventor':
        case 'interviewer':
        case 'programmer':
        case 'artist':
        case 'podcaster':
        case 'presenter':
          creators.author.push(creator)
          break

        case 'bookAuthor':
          creators.bookauthor.push(creator)
          break

        case 'commenter':
          creators.commentator.push(creator)
          break

        case 'editor':
          creators.editor.push(creator)
          break

        case 'assignee':
          creators.holder.push(creator)
          break

        case 'translator':
          creators.translator.push(creator)
          break

        case 'seriesEditor':
          if (!this.translation.collected.displayOptions.biblatexAPA) {
            creators[creatorType.register('editor', 'redactor')].push(creator)
          }
          break

        case 'scriptwriter':
          // 365.something
          if (video) {
            creators[creatorType.register('editor', 'scriptwriter')].push(creator)
          }
          else {
            creators[creatorType.register('name', 'collaborator')].push(creator)
          }
          break

        default:
          creators[creatorType.register('name', 'collaborator')].push(creator)
      }
    }

    for (const [ field, value ] of Object.entries(creators)) {
      this.remove(field)
      this.remove(`${ field }type`)

      if (!value.length) continue

      this.add({ name: field, value, enc: 'creators' })
      this.add({ name: `${ field }type`, value: creatorType.type[field] })
    }
  }
}
Entry.prototype.lint = qualityReport

function looks_like_number(n): string | boolean {
  if (n.match(/^(?=[MDCLXVI])M*(C[MD]|D?C*)(X[CL]|L?X*)(I[XV]|V?I*)$/)) return 'roman'
  if (n.match(/^[A-Z]?[0-9]+(\.[0-9]+)?$/i)) return 'arabic'
  if (n.match(/^[A-Z]$/i)) return 'arabic'
  return false
}
function looks_like_number_field(n: string): boolean {
  if (!n) return false

  const ns: string[] = n.trim().split(/\s*-+|–|,|\/\s*/)
  switch (ns.length) {
    case 1:
      return (looks_like_number(ns[0]) as boolean)

    case 2:
      return (looks_like_number(ns[0]) as boolean) && (looks_like_number(ns[0]) === looks_like_number(ns[1]))

    default:
      return false
  }
}

const patent = new class {
  private countries = [ 'de', 'eu', 'fr', 'uk', 'us' ]
  private prefix = { us: 'us', ep: 'eu', gb: 'uk', de: 'de', fr: 'fr' }

  public region(item): string {
    if (item.itemType !== 'patent') return ''

    if (item.country) {
      const country: string = item.country.toLowerCase()
      if (this.countries.includes(country)) return country
    }

    for (const patentNumber of [ item.number, item.applicationNumber ]) {
      if (patentNumber) {
        const prefix: string = this.prefix[patentNumber.substr(0, 2).toLowerCase()]
        if (prefix) return prefix
      }
    }

    return ''
  }

  // eslint-disable-next-line id-blacklist
  public number(item): string {
    if (item.itemType !== 'patent' || (!item.number && !item.applicationNumber)) return ''

    for (const patentNumber of ([ item.number, item.applicationNumber ] as string[])) {
      if (patentNumber) {
        const country = patentNumber.substr(0, 2).toLowerCase()
        if (this.prefix[country]) return patentNumber.substr(country.length)
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return item.number || item.applicationNumber
  }

  public type(item) {
    if (item.itemType !== 'patent') return ''

    const region = this.region(item)

    if (region && item.number) return `patent${ region }`
    if (region && item.applicationNumber) return `patreq${ region }`

    return 'patent'
  }
}

export function generateBibLaTeX(collected: Collected): Translation {
  const translation = Translation.Export(collected)
  translation.bibtex = new BibTeXExporter(translation)

  Entry.installPostscript(translation)
  translation.bibtex.prepare_strings()

  for (const item of translation.bibtex.items) {
    const entry = new Entry(item, config, translation)

    if (entry.entrytype === 'incollection' && entry.hasCreator('bookAuthor')) entry.entrytype = 'inbook'
    // if (entry.entytype_source === 'csl.book' && !entry.hasCreator('author') && entry.hasCreator('editor')) entry.entytype = 'collection'
    if (entry.entrytype === 'book' && item.numberOfVolumes) entry.entrytype = 'mvbook'
    if (entry.entrytype === 'report' && item.type?.toLowerCase().includes('manual')) entry.entrytype = 'manual'
    // if (item.itemType === 'preprint' && entry.entrytype === 'online' && item.ISSN && item.publicationTitle) entry.entrytype = 'article'

    entry.add({ name: 'pubstate', value: item.status || (item.itemType === 'preprint' && 'prepublished') })

    if (entry.entrytype === 'patent') {
      if (item.country && !patent.region(item)) entry.add({ name: 'location', value: item.country || item.extraFields.kv['publisher-place'] })
    }
    else if (entry.entrytype === 'unpublished' && item.itemType === 'presentation') {
      entry.add({ name: 'venue', value: item.place, enc: 'literal' })
    }
    else {
      entry.add({ name: 'location', value: item.place || item.extraFields.kv['publisher-place'], enc: 'literal' })
    }

    /*
    if (entry.entytype === 'inbook') {
      entry.add({ name: 'chapter', value: item.title })
    } else {
      entry.add({ name: 'title', value: item.title })
    }
    */
    entry.add({ name: 'title', value: item.title })

    // remove ordinal from edition
    entry.add({ name: 'edition', value: typeof item.edition === 'number' ? item.edition : (item.edition || '').replace(/^([0-9]+)(st|nd|th)$/, '$1') })
    // entry.add({ name: 'rights', value: item.rights })
    entry.add({ name: 'isbn', value: item.ISBN })
    entry.add({ name: 'issn', value: item.ISSN })

    entry.add({ name: 'url', value: item.url || item.extraFields.kv.url })
    entry.add({ name: 'doi', value: (item.DOI || item.extraFields.kv.DOI || '').replace(/^https?:\/\/doi.org\//i, '') })

    entry.add({ name: 'shorttitle', value: item.shortTitle })
    entry.add({ name: 'abstract', value: item.abstractNote?.replace(/\n+/g, ' ') })
    entry.add({ name: 'volumes', value: item.numberOfVolumes })
    entry.add({ name: 'version', value: item.versionNumber })

    entry.add({ name: 'eventtitle', value: item.conferenceName })
    entry.add({ name: 'eventtitle', value: item.meetingName, replace: true })

    entry.add({ name: 'pagetotal', value: item.numPages })

    let number_added = ''
    if (!item.number?.match(/arxiv/i) || !entry.has.eprint) {
      number_added = entry.add({ name: 'number', value: patent.number(item) || entry.normalizeDashes(item.number || item.seriesNumber) })
    }
    entry.add({ name: !number_added && looks_like_number_field(item.issue) ? 'number' : 'issue', value: entry.normalizeDashes(item.issue) })

    const journalAbbreviation = item.journalAbbreviation || item.autoJournalAbbreviation
    switch (entry.entrytype) {
      case 'jurisdiction':
        entry.add({ name: 'journaltitle', value: item.reporter || (item.publicationTitle !== item.title && item.publicationTitle), bibtexStrings: true })
        break

      case 'legislation':
        entry.add({ name: 'journaltitle', value: item.code || (item.publicationTitle !== item.title && item.publicationTitle), bibtexStrings: true })
        break

      case 'incollection':
      case 'chapter':
      case 'inproceedings':
      case 'inreference':
      case 'movie':
      case 'video':
      case 'inbook':
        if (!entry.has.booktitle) {
          if (entry.entrytype === 'inproceedings' && entry.getBibString(item.publicationTitle)) {
            entry.add({ name: 'booktitle', value: item.publicationTitle, bibtexStrings: true })
          }
          else if (entry.entrytype === 'inproceedings' && translation.collected.displayOptions.useJournalAbbreviation && item.publicationTitle && journalAbbreviation) {
            entry.add({ name: 'booktitle', value: journalAbbreviation, bibtexStrings: true })
          }
          else {
            entry.add({ name: 'booktitle', value: item.publicationTitle, bibtexStrings: true })
          }
        }
        break

      case 'online':
        entry.add({ name: 'organization', value: item.publicationTitle, bibtexStrings: true })
        break

      case 'article':
        if (entry.getBibString(item.publicationTitle)) {
          entry.add({ name: 'journaltitle', value: item.publicationTitle, bibtexStrings: true })
        }
        else if ((translation.collected.displayOptions.useJournalAbbreviation || !item.publicationTitle) && journalAbbreviation) {
          entry.add({ name: 'journaltitle', value: journalAbbreviation, bibtexStrings: true })
        }
        else {
          entry.add({ name: 'journaltitle', value: item.publicationTitle, bibtexStrings: true })

          if (entry.has.entrysubtype?.value === 'newspaper') {
            entry.add({ name: 'journalsubtitle', value: item.section })
          }
          else {
            entry.add({ name: 'shortjournal', value: journalAbbreviation, bibtexStrings: true })
          }
        }
        break

      default:
        if (!entry.has.journaltitle && (item.publicationTitle !== item.title)) entry.add({ name: 'journaltitle', value: item.publicationTitle })
    }

    let main
    // eslint-disable-next-line no-underscore-dangle
    if (item.multi?._keys?.title && (main = item.multi.main?.title || item.language)) {
      // eslint-disable-next-line no-underscore-dangle
      const languages = Object.keys(item.multi._keys.title).filter(lang => lang !== main)
      main += '-'
      languages.sort((a, b) => {
        if (a === b) return 0
        if (a.indexOf(main) === 0 && b.indexOf(main) !== 0) return -1
        if (a.indexOf(main) !== 0 && b.indexOf(main) === 0) return 1
        if (a < b) return -1
        return 1
      })
      for (let i = 0; i < languages.length; i++) {
        entry.add({
          name: i === 0 ? 'titleaddon' : `user${ String.fromCharCode('d'.charCodeAt(0) + i) }`,
          // eslint-disable-next-line no-underscore-dangle
          value: item.multi._keys.title[languages[i]],
        })
      }
    }

    entry.add({ name: 'series', value: item.series, bibtexStrings: true })

    switch (entry.entrytype) {
      case 'report':
      case 'thesis':
        entry.add({ name: 'institution', value: item.publisher, bibtexStrings: true })
        break

      case 'jurisdiction':
        entry.add({ name: 'institution', value: item.authority || item.court, bibtexStrings: true })
        break

      case 'software':
      case 'misc':
        entry.add({ name: 'organization', value: item.publisher, bibtexStrings: true })
        break

      default:
        // preprint uses eprint fields
        if (item.itemType !== 'preprint') entry.add({ name: 'publisher', value: item.publisher, bibtexStrings: true })
    }

    switch (entry.entrytype) {
      case 'letter':
        entry.add({ name: 'type', value: item.type || (item.itemType === 'email' ? 'E-mail' : 'Letter') })
        break

      case 'thesis':
        entry.add({ name: 'type', value: entry.thesistype(item.type, 'phdthesis', 'mathesis', 'bathesis', 'candthesis') || item.type })
        break

      case 'report':
        if (item.type?.toLowerCase().trim() === 'techreport') {
          entry.add({ name: 'type', value: 'techreport' })
        }
        else {
          entry.add({ name: 'type', value: item.type })
        }
        break

      case 'patent':
        entry.add({ name: 'type', value: patent.type(item) })
        break

      case 'dataset':
        // https://github.com/zotero/zotero-bits/issues/22#issuecomment-1208195158
        entry.add({ name: 'type', value: item.type || item.medium })
        break

      default:
        if (entry.entrytype === 'unpublished' && item.itemType !== 'presentation') {
          entry.add({ name: 'howpublished', value: item.type })
        }
        else {
          entry.add({ name: 'type', value: item.type })
        }
        break
    }

    if (item.accessDate && item.url) entry.add({ name: 'urldate', value: strToISO(item.accessDate), enc: 'date' })

    entry.add({ name: 'date', verbatim: 'year', orig: { name: 'origdate', verbatim: 'origdate' }, value: item.date, enc: 'date' })
    // #293 has both date="year [origyear]" and extra="original-date: origyear"
    entry.add({ name: 'origdate', value: item.originalDate, enc: 'date', replace: true })
    entry.add({ name: 'eventdate', value: item.conferenceDate, enc: 'date' })

    entry.add({ name: 'pages', value: entry.normalizeDashes(item.pages) })
    entry.add({ name: 'volume', value: entry.normalizeDashes(item.volume) })

    entry.add({ name: 'keywords', value: item.tags, enc: 'tags' })

    if (!item.creators) item.creators = []
    // https://github.com/retorquere/zotero-better-bibtex/issues/1060
    if (item.itemType === 'patent' && item.assignee && !item.creators.find(cr => cr.name === item.assignee || (cr.lastName === item.assignee && (cr.fieldMode === 1)))) {
      item.creators.push({
        name: item.assignee,
        creatorType: 'assignee',
      })
    }
    entry.addCreators()

    // 'juniorcomma' needs more thought, it isn't for *all* suffixes you want this. Or even at all.
    // entry.add({ name: 'options', value: (option for option in ['useprefix', 'juniorcomma'] when ref[option]).join(',') })

    if (entry.useprefix) entry.add({ name: 'options', value: 'useprefix=true' })

    entry.add({ name: 'file', value: item.attachments, enc: 'attachments' })

    if (item.volumeTitle) { // #381
      if (entry.entrytype === 'book' && entry.has.title) {
        entry.add({ name: 'maintitle', value: item.volumeTitle }); // ; to prevent chaining
        [ entry.has.title.bibtex, entry.has.maintitle.bibtex ] = [ entry.has.maintitle.bibtex, entry.has.title.bibtex ]; // ; to prevent chaining
        [ entry.has.title.value, entry.has.maintitle.value ] = [ entry.has.maintitle.value, entry.has.title.value ]
      }

      if ([ 'incollection', 'chapter' ].includes(entry.entrytype) && entry.has.booktitle) {
        entry.add({ name: 'maintitle', value: item.volumeTitle }); // ; to prevent chaining
        [ entry.has.booktitle.bibtex, entry.has.maintitle.bibtex ] = [ entry.has.maintitle.bibtex, entry.has.booktitle.bibtex ]; // ; to preven chaining
        [ entry.has.booktitle.value, entry.has.maintitle.value ] = [ entry.has.maintitle.value, entry.has.booktitle.value ]
      }
    }

    entry.add({ name: 'pmid', value: item.PMID })
    entry.add({ name: 'pmcid', value: item.PMCID })

    for (const eprinttype of [ 'pmid', 'arxiv', 'jstor', 'hdl', 'googlebooks' ]) {
      if (entry.has[eprinttype]) {
        if (!entry.has.eprinttype) {
          entry.add({ name: 'eprinttype', value: entry.eprintType[eprinttype] || eprinttype })
          entry.add({ name: 'eprint', value: entry.has[eprinttype].value })
        }
        entry.remove(eprinttype)
      }
    }

    if (item.archive && item.archiveLocation) {
      let archive = true
      switch (item.archive.toLowerCase()) {
        case 'arxiv':
          if (!entry.has.eprinttype) entry.add({ name: 'eprinttype', value: 'arXiv' })
          entry.add({ name: 'eprintclass', value: item.callNumber })
          break

        case 'jstor':
          if (!entry.has.eprinttype) entry.add({ name: 'eprinttype', value: 'jstor' })
          break

        case 'pubmed':
          if (!entry.has.eprinttype) entry.add({ name: 'eprinttype', value: 'pubmed' })
          break

        case 'hdl':
          if (!entry.has.eprinttype) entry.add({ name: 'eprinttype', value: 'hdl' })
          break

        case 'googlebooks':
        case 'google books':
          if (!entry.has.eprinttype) entry.add({ name: 'eprinttype', value: 'googlebooks' })
          break

        default:
          archive = false
      }

      if (archive && !entry.has.eprint) entry.add({ name: 'eprint', value: item.archiveLocation })
    }

    if (item.arXiv && !entry.has.journaltitle && entry.entrytype === 'article') entry.entrytype = 'unpublished'

    switch (item.itemType) {
      case 'film':
        entry.add({ name: 'entrysubtype', value: 'film' })
        break
      case 'tvBroadcast':
        entry.add({ name: 'entrysubtype', value: 'tvbroadcast' })
        break
      case 'videoRecording':
        entry.add({ name: 'entrysubtype', value: 'video' })
        break
    }

    entry.complete()
  }

  translation.bibtex.complete()
  return translation
}
