{
  "translatorID": "f895aa0d-f28e-47fe-b247-2ea77c6ed583",
  "translatorType": 2,
  "label": "Better BibLaTeX",
  "creator": "Simon Kornblith, Richard Karnesky, Anders Johansson and Emiliano Heyns",
  "target": "bib",
  "minVersion": "2.1.9",
  "maxVersion": "null",
  "priority": 50,
  "inRepository": true,
  "configOptions": {
    "getCollections": "true"
  },
  "displayOptions": {
    "exportCharset": "UTF-8",
    "exportNotes": false,
    "exportFileData": false,
    "useJournalAbbreviation": false
  },
  "lastUpdated": "/*= timestamp =*/"
}

/*= include BibTeX.js =*/

var fieldMap = Dict({
  location:   {literal: 'place'},
  chapter:    {literal: 'chapter'},
  edition:    {literal: 'edition'},
  title:      {literal: 'title'},
  volume:     {literal: 'volume'},
  rights:     {literal: 'rights'},
  isbn:       'ISBN',
  issn:       'ISSN',
  url:        'url',
  doi:        'DOI',
  shorttitle: {literal: 'shortTitle'},
  abstract:   'abstractNote',
  volumes:    'numberOfVolumes',
  version:    'version',
  eventtitle: {literal: 'conferenceName'},
  pages:      'pages',
  pagetotal:  'numPages'
});

var babelLanguageMap = Dict({
  af:         'afrikaans',
  ar:         'arabic',
  eu:         'basque',
  br:         'breton',
  bg:         'bulgarian',
  ca:         'catalan',
  hr:         'croatian',
  cz:         'czech',
  da:         'danish',
  nl:         'dutch',
  en:         'english',
  en_us:      'american',
  en_gb:      'british',
  en_ca:      'canadian',
  en_au:      'australian',
  en_nz:      'newzealand',
  eo:         'esperanto',
  et:         'estonian',
  fa:         'farsi',
  fi:         'finnish',
  fr:         'french',
  fr_ca:      'canadien',
  fur:        'friulan',
  gl:         'galician',
  de:         'german',
  de_at:      'austrian',
  de_de_1996: 'ngerman',
  de_at_1996: 'naustrian',
  de_1996:    'ngerman',
  el:         'greek',
  el_polyton: 'polutonikogreek',
  he:         'hebrew',
  hi:         'hindi',
  is:         'icelandic',
  id:         'indonesian', //aliases: bahasai, indon
  ia:         'interlingua',
  ga:         'irish',
  it:         'italian',
  ja:         'japanese',
  la:         'latin',
  lv:         'latvian',
  lt:         'lithuanian',
  dsb:        'lowersorbian',
  hu:         'magyar',
  zlm:        'malay', //aliases: bahasam, melayu (currently, there's no //real difference between bahasam and bahasai in babel)
  mn:         'mongolian',
  se:         'samin',
  nn:         'nynorsk', //nynorsk
  nb:         'norsk', //bokmal
  no:         'norwegian', //'no' could be used, norwegian is an alias for 'norsk' in babel
  zh:         'pinyin', //only supported chinese in babel is the romanization pinyin?
  zh_latn:    'pinyin',
  pl:         'polish',
  pt:         'portuguese',
  pt_pt:      'portuguese',
  pt_br:      'brazilian',
  ro:         'romanian',
  rm:         'romansh',
  ru:         'russian',
  gd:         'scottish',
  sr:         'serbian', //latin script as default?
  sr_cyrl:    'serbianc',
  sr_Latn:    'serbian',
  sk:         'slovak',
  sl:         'slovene',
  //spanglish (pseudo language)
  es:         'spanish',
  sv:         'swedish',
  th:         'thaicjk', //thaicjk preferred?
  tr:         'turkish',
  tk:         'turkmen',
  uk:         'ukrainian',
  hsb:        'uppersorbian',
  vi:         'vietnamese',
  cy:         'welsh'
});


//POTENTIAL ISSUES
//"programTitle", "bookTitle" //TODO, check!!
//
//  accessDate:"accessDate", //only written on attached webpage snapshots by zo
//  journalAbbreviation:"journalAbbreviation", //not supported by bl

//  country:"country", //TODO if patent, should be put into 'location'

Config.typeMap.toBibTeX = Dict({
  book:                 'book',
  bookSection:          'inbook',
  journalArticle:       [':article', ':misc'],
  magazineArticle:      'article',
  newspaperArticle:     'article',
  thesis:               'thesis',
  letter:               ':letter',
  manuscript:           'unpublished',
  interview:            'misc',
  film:                 'movie',
  artwork:              'artwork',
  webpage:              ':online',
  conferencePaper:      'inproceedings',
  report:               'report',
  bill:                 'legislation',
  case:                 ':jurisdiction',
  hearing:              'jurisdiction',
  patent:               'patent',
  statute:              'legislation',
  email:                'letter',
  map:                  'misc',
  blogPost:             'online',
  instantMessage:       'misc',
  forumPost:            'online',
  audioRecording:       'audio',
  presentation:         'unpublished',
  videoRecording:       'video',
  tvBroadcast:          'misc',
  radioBroadcast:       'misc',
  podcast:              'audio',
  computerProgram:      'software',
  document:             'misc',
  encyclopediaArticle:  ':inreference',
  dictionaryEntry:      'inreference'
});

function doExport() {
  //Zotero.write('% biblatex export generated by Zotero '+Zotero.Utilities.getVersion());
  // to make sure the BOM gets ignored
  Zotero.write("\n");

  CiteKeys.initialize().forEach(function(item) {
    Config.fieldsWritten = Dict({});
    //don't export standalone notes and attachments
    if (item.itemType == 'note' || item.itemType == 'attachment') return;

    // determine type
    var type = getBibTexType(item);
    //biblatex recommends us to use mvbook for multi-volume books
    if (type == 'book' && item.volume) { type = 'mvbook'; }

    var bibtexData = CiteKeys.items.get(item.itemID);
    Zotero.write("\n\n");
    Zotero.write('% ' + Config.label + ': ' + (bibtexData.pinned ?  'pinned' : 'generated') + "\n");
    if (bibtexData.duplicates) {
      Zotero.write('% better-bibtex: ' + (bibtexData.pinned ?  'hard' : 'soft') + ' conflict');
      if (bibtexData.default && bibtexData.default != bibtexData.key) {
        Zotero.write(' with ' + bibtexData.default);
      }
      Zotero.write("\n");
    }

    Zotero.write('@'+type+'{'+bibtexData.key);

    writeFieldMap(item, fieldMap);

    if (Config.usePrefix) {
      writeField('options', escape('useprefix'));
    }

    if (item.language) {
      var language = babelLanguageMap.get(item.language.toLowerCase().replace(/[^a-z0-9]/, '_')) || item.language;
      writeField('language', escape(language));
    }

    // Fields needing special treatment and not easily translatable via fieldMap
    //e.g. where fieldname translation is dependent upon type, or special transformations
    //has to be made

    //all kinds of numbers (biblatex has additional support for journal number != issue, but zotero has not)
    writeField('number', escape(item.reportNumber || item.seriesNumber || item.patentNumber || item.billNumber || item.episodeNumber || item.number));

    //split numeric and nonnumeric issue specifications (for journals) into "number" and "issue"
    writeField((isNaN(parseInt(item.issue)) ? 'issue' : 'number'), escape(item.issue));

    if (item.publicationTitle) {
      switch (item.itemType) {
        case 'bookSection':
        case 'conferencePaper':
          writeField('booktitle', escape(item.publicationTitle, {brace: true}));
          break;

        case 'magazineArticle':
        case 'newspaperArticle':
          writeField('journaltitle', escape(item.publicationTitle, {brace: true}));
          break;

        case 'journalArticle':
          if (Config.useJournalAbbreviation) {
            writeField('journal', escape(item.journalAbbreviation, {brace: true}));
          } else {
            writeField('journaltitle', escape(item.publicationTitle, {brace: true}));
            writeField('shortjournal', escape(item.journalAbbreviation, {brace: true}));
          }
          break;

        /*  do nothing as websiteTitle, forumTitle, blogTitle, programTitle seems
            to be just aliases for publicationTitle and already are correctly mapped below
        case 'website':
        case 'forumPost':
        case 'blogPost':
        case 'tvBroadcast':
        case 'radioBroadcast':
          writeField('titleaddon', item.publicationTitle);
          break;

        */
        default:
          // writeField('journaltitle', item.publicationTitle);
          //TODO, did we miss something
      }
    }

    //TODO: check what happens to bookTitle, is that also an alias for publicationTitle?

    if (!Config.fieldsWritten.has('booktitle')) { writeField('booktitle', escape(item.encyclopediaTitle || item.dictionaryTitle || item.proceedingsTitle, {brace: true})); }

    writeField('titleaddon', escape(item.websiteTitle || item.forumTitle || item.blogTitle || item.programTitle, {brace: true}));

    //don't really know if this is the best way
    writeField('series', escape(item.seriesTitle || item.series, {brace: true})); 
    switch (item.itemType) {
      case 'report':
      case 'thesis':
        writeField('institution', escape(item.publisher, {brace: true}));
        break;

      default:
        writeField('publisher', escape(item.publisher, {brace: true}));
    }

    switch (item.itemType) {
      case 'letter':
        //this isn't optimal, perhaps later versions of biblatex will add some suitable localization key
        writeField('type', escape(item.letterType || 'Letter'));
        break;

      case 'email':
        writeField('type', 'E-mail');
        break;

      default:
        writeField('type', escape(item.manuscriptType || item.thesisType || item.websiteType || item.presentationType || item.reportType || item.mapType));
    }

    writeField('howpublished', escape(item.presentationType || item.manuscriptType));

    //case of specific eprint-archives in archive-fields
    if (item.archive && item.archiveLocation) {
      var archive = true;
      switch (item.archive.toLowerCase()) {
        case 'arxiv':
          writeField('eprinttype', 'arxiv');
          //assume call number is used for arxiv class
          if (item.callNumber) { writeField('eprintclass', escape(item.callNumber)); }
          break;

        case 'jstor':
          writeField('eprinttype', 'jstor');
          break;

        case 'pubmed':
          writeField('eprinttype', 'pubmed');
          break;

        case 'hdl':
          writeField('eprinttype', 'hdl');
          break;

        case 'googlebooks':
        case 'google books':
          writeField('eprinttype', 'googlebooks');
          break;

        default:
          archive = false;
      }

      if (archive) { writeField('eprint', escape(item.archiveLocation)); }
    }

    if (item.creators && item.creators.length) {
      // split creators into subcategories
      var authors = [];
      var bookauthors = [];
      var commentators = [];
      var editors = [];
      var editoras = [];
      var editorbs = [];
      var holders = [];
      var translators = [];
      var creator, creatorString;

      item.creators.forEach(function(creator) {
        if (('' + creator.firstName).trim() != '' && ('' + creator.lastName).trim() != '') {
          creatorString = creator.lastName + ', ' + creator.firstName;
        } else {
          creatorString = {literal: creator.lastName}
        }

        switch (creator.creatorType) {
          case 'author':
          case 'interviewer':
          case 'director':
          case 'programmer':
          case 'artist':
          case 'podcaster':
          case 'presenter':
            authors.push(creatorString);
            break;

          case 'bookAuthor':
            bookauthors.push(creatorString);
            break;

          case 'commenter':
            commentators.push(creatorString);
            break;

          case 'editor':
            editors.push(creatorString);
            break;

          case 'inventor':
            holders.push(creatorString);
            break;

          case 'translator':
            translators.push(creatorString);
            break;

          case 'seriesEditor': //let's call them redacors
            editorbs.push(creatorString);
            break;

          default: // the rest into editora with editoratype = collaborator
            editoras.push(creatorString);
        }
      });

      writeField('author', escape(authors, {sep: ' and '}));
      writeField('bookauthor', escape(bookauthors, {sep: ' and '}));
      writeField('commentator', escape(commentators, {sep: ' and '}));
      writeField('editor', escape(editors, {sep: ' and '}));

      writeField('editora', escape(editoras, {sep: ' and '}));
      if (editoras.length > 0) { writeField('editoratype', 'collaborator'); }

      writeField('editorb', escape(editorbs, {sep: ' and '}));
      if (editorbs.length > 0) { writeField('editorbtype', 'redactor'); }

      writeField('holder', escape(holders, {sep: ' and '}));
      writeField('translator', escape(translators, {sep: ' and '}));
    }

    if (item.accessDate) {
      writeField('urldate', escape(Zotero.Utilities.strToISO(item.accessDate)));
    }

    if (item.date) {
      var date = Zotero.Utilities.strToISO(item.date);
      if (date) {
        writeField('date', escape(date));
      } else {
        writeField('date', escape({literal:item.date}));
      }

      date = Zotero.Utilities.strToDate(item.date);
      if (date) {
        writeField('year', escape(date.year))
      }
    }

    writeExtra(item, 'note');

    writeField('annotation', escape(item.meetingName));

    writeField('keywords', escape(item.tags.map(function(tag) {return tag.tag;}), {sep: ', '}));

    if (item.notes && Config.exportNotes) {
      item.notes.forEach(function(note) {
        writeField('annotation', escape(Zotero.Utilities.unescapeHTML(note.note)));
      });
    }

    writeField('file', saveAttachments(item));

    flushEntry(item);

    Zotero.write("\n}");
  });

  exportJabRefGroups();
}

var exports = {
  'doExport': doExport
}
