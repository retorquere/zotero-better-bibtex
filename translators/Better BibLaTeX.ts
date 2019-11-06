declare const Translator: ITranslator

declare const Zotero: any

import { Reference } from './bibtex/reference'
import { Exporter } from './lib/exporter'

Reference.prototype.fieldEncoding = {
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
  institution: 'literal',
  publisher: 'literal',
  origpublisher: 'literal',
  organization: 'literal',
  location: 'literal',
  origlocation: 'literal',
}
Reference.prototype.caseConversion = {
  title: true,
  series: true,
  shorttitle: true,
  origtitle: true,
  booktitle: true,
  maintitle: true,
  eventtitle: true,
}

Reference.prototype.lint = require('./bibtex/biblatex.qr.bcf')

type CreatorArray = any[] & { type?: string }

Reference.prototype.addCreators = function() {
  if (!this.item.creators || !this.item.creators.length) return

  const creators: Record<string, CreatorArray> = {
    author: [],
    bookauthor: [],
    commentator: [],
    editor: [],
    editora: [],
    editorb: [],
    holder: [],
    translator: [],
    // scriptwriter: [],
    // director: [],
  }
  creators.editora.type = 'collaborator'
  creators.editorb.type = 'redactor'

  for (const creator of this.item.creators) {
    switch (creator.creatorType) {
      case 'director':
        // 365.something
        if (['video', 'movie'].includes(this.referencetype)) {
          creators.editor.push(creator)
          creators.editor.type = 'director'
        } else {
          creators.author.push(creator)
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
        creators.editorb.push(creator)
        break

      case 'scriptwriter':
        // 365.something
        creators.editora.push(creator)
        if (['video', 'movie'].includes(this.referencetype)) {
          creators.editora.type = 'scriptwriter'
        }
        break

      default:
        creators.editora.push(creator)
    }
  }

  for (const [field, value] of Object.entries(creators)) {
    this.remove(field)
    this.remove(field + 'type')

    if (!value.length) continue

    this.add({ name: field, value, enc: 'creators' })
    if (value.type) this.add({ name: `${field}type`, value: value.type })
  }
}

Reference.prototype.typeMap = {
  csl: {
    article               : 'article',
    'article-journal'     : 'article',
    'article-magazine'    : {type: 'article', subtype: 'magazine'},
    'article-newspaper'   : {type: 'article', subtype: 'newspaper'},
    bill                  : 'legislation',
    book                  : 'book',
    broadcast             : {type: 'misc', subtype: 'broadcast'},
    chapter               : 'incollection',
    dataset               : 'data',
    entry                 : 'inreference',
    'entry-dictionary'    : 'inreference',
    'entry-encyclopedia'  : 'inreference',
    figure                : 'image',
    graphic               : 'image',
    interview             : {type: 'misc', subtype: 'interview'},
    legal_case            : 'jurisdiction',
    legislation           : 'legislation',
    manuscript            : 'unpublished',
    map                   : {type: 'misc', subtype: 'map'},
    motion_picture        : 'movie',
    musical_score         : 'audio',
    pamphlet              : 'booklet',
    'paper-conference'    : 'inproceedings',
    patent                : 'patent',
    personal_communication: 'letter',
    post                  : 'online',
    'post-weblog'         : 'online',
    report                : 'report',
    review                : 'review',
    'review-book'         : 'review',
    song                  : 'music',
    speech                : {type: 'misc', subtype: 'speech'},
    thesis                : 'thesis',
    treaty                : 'legal',
    webpage               : 'online',
  },
  zotero: {
    artwork            : 'artwork',
    audioRecording     : 'audio',
    bill               : 'legislation',
    blogPost           : 'online',
    book               : 'book',
    bookSection        : 'incollection',
    case               : 'jurisdiction',
    computerProgram    : 'software',
    conferencePaper    : 'inproceedings',
    dictionaryEntry    : 'inreference',
    document           : 'misc',
    email              : 'letter',
    encyclopediaArticle: 'inreference',
    film               : 'movie',
    forumPost          : 'online',
    hearing            : 'jurisdiction',
    instantMessage     : 'misc',
    interview          : 'misc',
    journalArticle     : 'article',
    letter             : 'letter',
    magazineArticle    : {type: 'article', subtype: 'magazine'},
    manuscript         : 'unpublished',
    map                : 'misc',
    newspaperArticle   : {type: 'article', subtype: 'newspaper'},
    patent             : 'patent',
    podcast            : 'audio',
    presentation       : 'unpublished',
    radioBroadcast     : 'audio',
    report             : 'report',
    statute            : 'legislation',
    thesis             : 'thesis',
    tvBroadcast        : 'video',
    videoRecording     : 'video',
    webpage            : 'online',
  },
}

Translator.initialize = () => {
  Reference.installPostscript()
  Translator.unicode = !Translator.preferences.asciiBibLaTeX
}

function looks_like_number(n) {
  if (n.match(/^(?=[MDCLXVI])M*(C[MD]|D?C*)(X[CL]|L?X*)(I[XV]|V?I*)$/)) return 'roman'
  if (n.match(/^[A-Z]?[0-9]+(\.[0-9]+)?$/i)) return 'arabic'
  if (n.match(/^[A-Z]$/i)) return 'arabic'
  return false
}
function looks_like_number_field(n) {
  if (!n) return false

  n = n.split(/-+|–|,|\//).map(_n => _n.trim())
  switch (n.length) {
    case 1:
      return looks_like_number(n[0])

    case 2:
      return looks_like_number(n[0]) && (looks_like_number(n[0]) === looks_like_number(n[1]))

    default:
      return false
  }
}

const patent = new class {
  private countries = ['de', 'eu', 'fr', 'uk', 'us']
  private prefix = {us: 'us', ep: 'eu', gb: 'uk', de: 'de', fr: 'fr' }

  public region(item) {
    if (item.itemType !== 'patent') return ''

    if (item.country) {
      const country = item.country.toLowerCase()
      if (this.countries.includes(country)) return country
    }

    if (item.number) {
      const country = item.number.substr(0, 2).toLowerCase()
      if (this.prefix[country]) return this.prefix[country]
    }

    return ''
  }

  public number(item) {
    if (item.itemType !== 'patent' || !item.number) return ''

    const country = item.number.substr(0, 2).toLowerCase()
    if (this.prefix[country]) return item.number.substr(country.length)

    return item.number
  }
}

Translator.doExport = () => {
  Exporter.prepare_strings()

  // Zotero.write(`\n% ${Translator.header.label}\n`)
  Zotero.write('\n')

  let item: ISerializedItem
  while (item = Exporter.nextItem()) {
    const ref = new Reference(item)

    if (['bookSection', 'chapter'].includes(item.referenceType) && ref.hasCreator('bookAuthor')) ref.referencetype = 'inbook'
    if (item.referenceType === 'book' && !ref.hasCreator('author') && ref.hasCreator('editor')) ref.referencetype = 'collection'
    if (ref.referencetype === 'book' && item.numberOfVolumes) ref.referencetype = 'mvbook'

    let m
    if (item.url && (m = item.url.match(/^http:\/\/www.jstor.org\/stable\/([\S]+)$/i))) {
      ref.override({ name: 'eprinttype', value: 'jstor'})
      ref.override({ name: 'eprint', value: m[1] })
      ref.remove('archivePrefix')
      ref.remove('primaryClass')
      delete item.url
      ref.remove('url')
    }

    if (item.url && (m = item.url.match(/^http:\/\/books.google.com\/books?id=([\S]+)$/i))) {
      ref.override({ name: 'eprinttype', value: 'googlebooks'})
      ref.override({ name: 'eprint', value: m[1] })
      ref.remove('archivePrefix')
      ref.remove('primaryClass')
      delete item.url
      ref.remove('url')
    }

    if (item.url && (m = item.url.match(/^http:\/\/www.ncbi.nlm.nih.gov\/pubmed\/([\S]+)$/i))) {
      ref.override({ name: 'eprinttype', value: 'pubmed'})
      ref.override({ name: 'eprint', value: m[1] })
      ref.remove('archivePrefix')
      ref.remove('primaryClass')
      delete item.url
      ref.remove('url')
    }

    ref.add({ name: 'langid', value: ref.language })

    switch (item.referenceType) {
      case 'presentation':
        ref.add({ name: 'venue', value: item.place, enc: 'literal' })
        break

      case 'patent':
        if (item.country && !patent.region(item)) ref.add({ name: 'location', value: item.country })
        break

      default:
        ref.add({ name: 'location', value: item.place, enc: 'literal' })
        break
    }

    /*
    if (ref.referencetype === 'inbook') {
      ref.add({ name: 'chapter', value: item.title })
    } else {
      ref.add({ name: 'title', value: item.title })
    }
    */
    ref.add({ name: 'title', value: item.title })

    ref.add({ name: 'edition', value: item.edition })
    ref.add({ name: 'volume', value: item.volume })
    // ref.add({ name: 'rights', value: item.rights })
    ref.add({ name: 'isbn', value: item.ISBN })
    ref.add({ name: 'issn', value: item.ISSN })

    if (Translator.preferences.DOIandURL === 'both' || Translator.preferences.DOIandURL === 'url' || !item.DOI) ref.add({ name: 'url', value: item.url })
    if (Translator.preferences.DOIandURL === 'both' || Translator.preferences.DOIandURL === 'doi' || !item.url) ref.add({ name: 'doi', value: item.DOI })

    ref.add({ name: 'shorttitle', value: item.shortTitle })
    ref.add({ name: 'abstract', value: item.abstractNote })
    ref.add({ name: 'volumes', value: item.numberOfVolumes })
    ref.add({ name: 'version', value: item.versionNumber })
    ref.add({ name: 'eventtitle', value: item.conferenceName })
    ref.add({ name: 'pagetotal', value: item.numPages })

    ref.add({ name: 'number', value: patent.number(item) || item.number || item.seriesNumber })
    ref.add({ name: looks_like_number_field(item.issue) ? 'number' : 'issue', value: item.issue })

    switch (item.referenceType) {
      case 'case':
      case 'gazette':
      case 'legal_case':
        ref.add({ name: 'journaltitle', value: item.reporter, bibtexStrings: true })
        break

      case 'statute':
      case 'bill':
      case 'legislation':
        ref.add({ name: 'journaltitle', value: item.code, bibtexStrings: true })
        break
    }

    if (item.publicationTitle) {
      switch (item.referenceType) {
        case 'bookSection':
        case 'conferencePaper':
        case 'dictionaryEntry':
        case 'encyclopediaArticle':
        case 'chapter':
        case 'chapter':
          ref.add({ name: 'booktitle', value: item.publicationTitle, bibtexStrings: true })
          break

        case 'magazineArticle':
        case 'newspaperArticle':
        case 'article-magazine':
        case 'article-newspaper':
          ref.add({ name: 'journaltitle', value: item.publicationTitle, bibtexStrings: true})
          if (['newspaperArticle', 'article-newspaper'].includes(item.referenceType)) ref.add({ name: 'journalsubtitle', value: item.section })
          break

        case 'journalArticle':
        case 'article':
        case 'article-journal':
          if (ref.isBibString(item.publicationTitle)) {
            ref.add({ name: 'journaltitle', value: item.publicationTitle, bibtexStrings: true })
          } else {
            if (Translator.options.useJournalAbbreviation && item.journalAbbreviation) {
              ref.add({ name: 'journaltitle', value: item.journalAbbreviation, bibtexStrings: true })
            } else {
              ref.add({ name: 'journaltitle', value: item.publicationTitle, bibtexStrings: true })
              ref.add({ name: 'shortjournal', value: item.journalAbbreviation, bibtexStrings: true })
            }
          }
          break

        default:
          if (!ref.has.journaltitle && (item.publicationTitle !== item.title)) ref.add({ name: 'journaltitle', value: item.publicationTitle })
      }
    }

    switch (item.referenceType) {
      case 'bookSection':
      case 'encyclopediaArticle':
      case 'dictionaryEntry':
      case 'conferencePaper':
      case 'film':
      case 'videoRecording':
      case 'tvBroadcast':
        if (!ref.has.booktitle) ref.add({ name: 'booktitle', value: item.publicationTitle })
        break
    }

    let main
    if (((item.multi || {})._keys || {}).title && (main = (item.multi.main || {}).title || item.language)) {
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
        ref.add({
          name: i === 0 ? 'titleaddon' : `user${String.fromCharCode('d'.charCodeAt(0) + i)}`,
          value: item.multi._keys.title[languages[i]],
        })
      }
    }

    ref.add({ name: 'series', value: item.seriesTitle || item.series, bibtexStrings: true })

    switch (item.referenceType) {
      case 'report':
      case 'thesis':
        ref.add({ name: 'institution', value: item.publisher, bibtexStrings: true })
        break

      case 'case':
      case 'hearing':
      case 'legal_case':
        ref.add({ name: 'institution', value: item.court, bibtexStrings: true })
        break

      case 'computerProgram':
        ref.add({ name: 'organization', value: item.publisher, bibtexStrings: true })
        break

      default:
        ref.add({ name: 'publisher', value: item.publisher, bibtexStrings: true })
    }

    switch (item.referenceType) {
      case 'letter':
      case 'personal_communication':
        ref.add({ name: 'type', value: item.type || 'Letter' })
        break

      case 'email':
        ref.add({ name: 'type', value: 'E-mail' })
        break

      case 'thesis':
        const thesistype = item.type ? item.type.toLowerCase() : null
        if (['phdthesis', 'mastersthesis'].includes(thesistype)) {
          ref.referencetype = thesistype
        } else {
          ref.add({ name: 'type', value: item.type })
        }
        break

      case 'report':
        if ((item.type || '').toLowerCase().trim() === 'techreport') {
          ref.referencetype = 'techreport'
        } else {
          ref.add({ name: 'type', value: item.type })
        }
        break

      case 'patent':
        ref.add({ name: 'type', value: 'patent' + patent.region(item) })
        break

      default:
        ref.add({ name: 'type', value: item.type })
    }

    if (item.referenceType === 'manuscript') ref.add({ name: 'howpublished', value: item.type })

    ref.add({ name: 'eventtitle', value: item.meetingName })

    if (item.accessDate && item.url) ref.add({ name: 'urldate', value: Zotero.Utilities.strToISO(item.accessDate), enc: 'date' })

    ref.add({
      name: 'date',
      verbatim: 'year',
      orig: { name: 'origdate', verbatim: 'origdate' },
      value: item.date,
      enc: 'date',
    })

    ref.add({ name: 'pages', value: ref.normalizeDashes(item.pages)})

    ref.add({ name: 'keywords', value: item.tags, enc: 'tags' })

    if (!item.creators) item.creators = []
    // https://github.com/retorquere/zotero-better-bibtex/issues/1060
    if (item.itemType === 'patent' && item.assignee && !item.creators.find(cr => cr.name === item.assignee || (cr.lastName === item.assignee && (cr.fieldMode === 1)))) {
      item.creators.push({
        name: item.assignee,
        creatorType: 'assignee',
      })
    }
    ref.addCreators()

    // 'juniorcomma' needs more thought, it isn't for *all* suffixes you want this. Or even at all.
    // ref.add({ name: 'options', value: (option for option in ['useprefix', 'juniorcomma'] when ref[option]).join(',') })

    if (ref.useprefix) ref.add({ name: 'options', value: 'useprefix=true' })

    ref.add({ name: 'file', value: item.attachments, enc: 'attachments' })

    if (item.cslVolumeTitle) { // #381
      if (item.referenceType === 'book' && ref.has.title) {
        ref.add({name: 'maintitle', value: item.cslVolumeTitle }); // ; to prevent chaining
        [ref.has.title.bibtex, ref.has.maintitle.bibtex] = [ref.has.maintitle.bibtex, ref.has.title.bibtex]; // ; to prevent chaining
        [ref.has.title.value, ref.has.maintitle.value] = [ref.has.maintitle.value, ref.has.title.value]
      }

      if (['bookSection', 'chapter'].includes(item.referenceType) && ref.has.booktitle) {
        ref.add({name: 'maintitle', value: item.cslVolumeTitle }); // ; to prevent chaining
        [ref.has.booktitle.bibtex, ref.has.maintitle.bibtex] = [ref.has.maintitle.bibtex, ref.has.booktitle.bibtex]; // ; to preven chaining
        [ref.has.booktitle.value, ref.has.maintitle.value] = [ref.has.maintitle.value, ref.has.booktitle.value]
      }
    }

    for (const eprinttype of ['pmid', 'arxiv', 'jstor', 'hdl', 'googlebooks']) {
      if (ref.has[eprinttype]) {
        if (!ref.has.eprinttype) {
          ref.add({ name: 'eprinttype', value: eprinttype})
          ref.add({ name: 'eprint', value: ref.has[eprinttype].value })
        }
        ref.remove(eprinttype)
      }
    }

    if (item.archive && item.archiveLocation) {
      let archive = true
      switch (item.archive.toLowerCase()) {
        case 'arxiv':
          if (!ref.has.eprinttype) ref.add({ name: 'eprinttype', value: 'arxiv' })
          ref.add({ name: 'eprintclass', value: item.callNumber })
          break

        case 'jstor':
          if (!ref.has.eprinttype) ref.add({ name: 'eprinttype', value: 'jstor' })
          break

        case 'pubmed':
          if (!ref.has.eprinttype) ref.add({ name: 'eprinttype', value: 'pubmed' })
          break

        case 'hdl':
          if (!ref.has.eprinttype) ref.add({ name: 'eprinttype', value: 'hdl' })
          break

        case 'googlebooks':
        case 'google books':
          if (!ref.has.eprinttype) ref.add({ name: 'eprinttype', value: 'googlebooks' })
          break

        default:
          archive = false
      }

      if (archive) {
        if (!ref.has.eprint) ref.add({ name: 'eprint', value: item.archiveLocation })
      }
    }

    ref.complete()
  }

  Exporter.complete()
  Zotero.write('\n')
}
