import { ITranslator } from '../gen/translator'
declare const Translator: ITranslator

declare const Zotero: any

import Reference = require('./bibtex/reference.ts')
import Exporter = require('./lib/exporter.ts')
import debug = require('./lib/debug.ts')

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
  location: 'literal',
}
Reference.prototype.caseConversion = {
  title: true,
  shorttitle: true,
  origtitle: true,
  booktitle: true,
  maintitle: true,
  type: true,
  eventtitle: true,
}

Reference.prototype.lint = require('./bibtex/biblatex.qr.bcf')

function addCreators(ref) {
  if (!ref.item.creators || !ref.item.creators.length) return

  const creators = {
    author: [],
    bookauthor: [],
    commentator: [],
    editor: [],
    editora: [],
    editorb: [],
    holder: [],
    translator: [],
    scriptwriter: [],
    director: [],
  }
  for (const creator of ref.item.creators) {
    let kind
    switch (creator.creatorType) {
      case 'director':
        // 365.something
        if (['video', 'movie'].includes(ref.referencetype)) {
          kind = 'director'
        } else {
          kind = 'author'
        }
        break
      case 'author': case 'interviewer': case 'programmer': case 'artist': case 'podcaster': case 'presenter':
        kind = 'author'
        break
      case 'bookAuthor':
        kind = 'bookauthor'
        break
      case 'commenter':
        kind = 'commentator'
        break
      case 'editor':
        kind = 'editor'
        break
      case 'inventor':
        kind = 'holder'
        break
      case 'translator':
        kind = 'translator'
        break
      case 'seriesEditor':
        kind = 'editorb'
        break
      case 'scriptwriter':
        // 365.something
        if (['video', 'movie'].includes(ref.referencetype)) {
          kind = 'scriptwriter'
        } else {
          kind = 'editora'
        }
        break

      default:
        kind = 'editora'
    }

    creators[kind].push(creator)
  }

  for (const [field, value] of Object.entries(creators)) {
    ref.remove(field)
    ref.add({ name: field, value, enc: 'creators' })
  }

  if (creators.editora.length > 0) ref.add({ editoratype: 'collaborator' })
  if (creators.editorb.length > 0) ref.add({ editorbtype: 'redactor' })
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

Translator.doExport = () => {
  // Zotero.write(`\n% ${Translator.header.label}\n`)
  Zotero.write('\n')

  let item
  while (item = Exporter.nextItem()) {
    const ref = new Reference(item)

    if (['bookSection', 'chapter'].includes(item.__type__) && ref.hasCreator('bookAuthor')) ref.referencetype = 'inbook'
    if (item.__type__ === 'book' && !ref.hasCreator('author') && ref.hasCreator('editor')) ref.referencetype = 'collection'
    if (ref.referencetype === 'book' && item.numberOfVolumes) ref.referencetype = 'mvbook'

    let m
    if (item.url && (m = item.url.match(/^http:\/\/www.jstor.org\/stable\/([\S]+)$/i))) {
      ref.add({ name: 'eprinttype', value: 'jstor'})
      ref.add({ name: 'eprint', value: m[1] })
      delete item.url
      ref.remove('url')
    }

    if (item.url && (m = item.url.match(/^http:\/\/books.google.com\/books?id=([\S]+)$/i))) {
      ref.add({ name: 'eprinttype', value: 'googlebooks'})
      ref.add({ name: 'eprint', value: m[1] })
      delete item.url
      ref.remove('url')
    }

    if (item.url && (m = item.url.match(/^http:\/\/www.ncbi.nlm.nih.gov\/pubmed\/([\S]+)$/i))) {
      ref.add({ name: 'eprinttype', value: 'pubmed'})
      ref.add({ name: 'eprint', value: m[1] })
      delete item.url
      ref.remove('url')
    }

    ref.add({ name: 'langid', value: ref.language })
    ref.add({ name: 'location', value: item.place })
    ref.add({ name: 'chapter', value: item.chapter })
    ref.add({ name: 'edition', value: item.edition })
    ref.add({ name: 'title', value: item.title })
    ref.add({ name: 'volume', value: item.volume })
    ref.add({ name: 'rights', value: item.rights })
    ref.add({ name: 'isbn', value: item.ISBN })
    ref.add({ name: 'issn', value: item.ISSN })
    ref.add({ name: 'url', value: item.url })
    ref.add({ name: 'doi', value: item.DOI })
    ref.add({ name: 'shorttitle', value: item.shortTitle })
    ref.add({ name: 'abstract', value: item.abstractNote })
    ref.add({ name: 'volumes', value: item.numberOfVolumes })
    ref.add({ name: 'version', value: item.versionNumber })
    ref.add({ name: 'eventtitle', value: item.conferenceName })
    ref.add({ name: 'pagetotal', value: item.numPages })
    ref.add({ name: 'type', value: item.type })

    ref.add({ name: 'number', value: item.seriesNumber || item.number || item.docketNumber })
    ref.add({ name: (isNaN(parseInt(item.issue)) || (`${parseInt(item.issue)}` !== `${item.issue}`)  ? 'issue' : 'number'), value: item.issue })

    switch (item.__type__) {
      case 'case': case 'gazette': case 'legal_case':
        ref.add({ name: 'journaltitle', value: item.reporter, preserveBibTeXVariables: true })
        break
      case 'statute': case 'bill': case 'legislation':
        ref.add({ name: 'journaltitle', value: item.code, preserveBibTeXVariables: true })
        break
    }

    if (item.publicationTitle) {
      switch (item.__type__) {
        case 'bookSection': case 'conferencePaper': case 'dictionaryEntry': case 'encyclopediaArticle': case 'chapter':
          ref.add({ name: 'booktitle', value: item.bookTitle || item.publicationTitle, preserveBibTeXVariables: true })
          break

        case 'magazineArticle': case 'newspaperArticle': case 'article-magazine': case 'article-newspaper':
          ref.add({ name: 'journaltitle', value: item.publicationTitle, preserveBibTeXVariables: true})
          if (['newspaperArticle', 'article-newspaper'].includes(item.__type__)) ref.add({ name: 'journalsubtitle', value: item.section })
          break

        case 'journalArticle': case 'article': case 'article-journal':
          if (ref.isBibVar(item.publicationTitle)) {
            ref.add({ name: 'journaltitle', value: item.publicationTitle, preserveBibTeXVariables: true })
          } else {
            if (Translator.options.useJournalAbbreviation && item.journalAbbreviation) {
              ref.add({ name: 'journaltitle', value: item.journalAbbreviation, preserveBibTeXVariables: true })
            } else {
              ref.add({ name: 'journaltitle', value: item.publicationTitle, preserveBibTeXVariables: true })
              ref.add({ name: 'shortjournal', value: item.journalAbbreviation, preserveBibTeXVariables: true })
            }
          }
          break

        default:
          if (!ref.has.journaltitle && (item.publicationTitle !== item.title)) ref.add({ name: 'journaltitle', value: item.publicationTitle })
      }
    }

    if (!ref.has.booktitle) ref.add({ name: 'booktitle', value: item.bookTitle || item.encyclopediaTitle || item.dictionaryTitle || item.proceedingsTitle })
    if (['movie', 'video'].includes(ref.referencetype) && !ref.has.booktitle) ref.add({ name: 'booktitle', value: item.websiteTitle || item.forumTitle || item.blogTitle || item.programTitle })

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

    ref.add({ name: 'series', value: item.seriesTitle || item.series })

    switch (item.__type__) {
      case 'report': case 'thesis':
        ref.add({ name: 'institution', value: item.institution || item.publisher || item.university })
        break

      case 'case': case 'hearing': case 'legal_case':
        ref.add({ name: 'institution', value: item.court })
        break

      default:
        ref.add({ name: 'publisher', value: item.publisher })
    }

    switch (item.__type__) {
      case 'letter': case 'personal_communication':
        ref.add({ name: 'type', value: item.letterType || 'Letter', replace: true })
        break

      case 'email':
        ref.add({ name: 'type', value: 'E-mail', replace: true })
        break

      case 'thesis':
        const thesistype = item.thesisType ? item.thesisType.toLowerCase() : null
        if (['phdthesis', 'mastersthesis'].includes(thesistype)) {
          ref.referencetype = thesistype
          ref.remove('type')
        } else {
          ref.add({ name: 'type', value: item.thesisType, replace: true })
        }
        break

      case 'report':
        if ((item.type || '').toLowerCase().trim() === 'techreport') {
          ref.referencetype = 'techreport'
        } else {
          ref.add({ name: 'type', value: item.type, replace: true })
        }
        break

      default:
        ref.add({ name: 'type', value: item.type || item.websiteType || item.manuscriptType, replace: true })
    }

    ref.add({ name: 'howpublished', value: item.presentationType || item.manuscriptType })

    ref.add({ name: 'eventtitle', value: item.meetingName })

    addCreators(ref)

    if (item.accessDate && item.url) ref.add({ name: 'urldate', value: Zotero.Utilities.strToISO(item.accessDate), enc: 'date' })

    ref.add({ name: 'date', verbatim: 'year', orig: { name: 'origdate', verbatim: 'origdate' }, value: item.date, enc: 'date' })

    if (item.pages) {
      ref.add({ name: 'pages', value: item.pages.replace(/[-\u2012-\u2015\u2053]+/g, '--' )})
    } else if (item.firstPage && item.lastPage) {
      ref.add({ name: 'pages', value: `${item.firstPage}--${item.lastPage}` })
    } else if (item.firstPage) {
      ref.add({ name: 'pages', value: `${item.firstPage}` })
    }

    ref.add({ name: 'keywords', value: item.tags, enc: 'tags' })

    /*
     * 'juniorcomma' needs more thought, it isn't for *all* suffixes you want this. Or even at all.
     *ref.add({ name: 'options', value: (option for option in ['useprefix', 'juniorcomma'] when ref[option]).join(',') })
     */
    if (ref.useprefix) ref.add({ name: 'options', value: 'useprefix=true' })

    ref.add({ name: 'file', value: item.attachments, enc: 'attachments' })

    if (item.volumeTitle) { // #381
      debug('volumeTitle: true, type:', item._type__, 'has:', Object.keys(ref.has))
      if (item.__type__ === 'book' && ref.has.title) {
        debug('volumeTitle: for book, type:', item.__type__, 'has:', Object.keys(ref.has))
        ref.add({name: 'maintitle', value: item.volumeTitle }); // ; to prevent chaining
        [ref.has.title.bibtex, ref.has.maintitle.bibtex] = [ref.has.maintitle.bibtex, ref.has.title.bibtex]; // ; to prevent chaining
        [ref.has.title.value, ref.has.maintitle.value] = [ref.has.maintitle.value, ref.has.title.value]
      }

      if (['bookSection', 'chapter'].includes(item.__type__) && ref.has.booktitle) {
        debug('volumeTitle: for bookSection, type:', item.__type__, 'has:', Object.keys(ref.has))
        ref.add({name: 'maintitle', value: item.volumeTitle }); // ; to prevent chaining
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

        case 'googlebooks': case 'google books':
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
