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

/* Remove this for next Zotero release */

var strToISO = function(str) {
  var date = Zotero.Utilities.strToDate(str);

  if (date.year) {
    var dateString = Zotero.Utilities.lpad(date.year, "0", 4);
    if (parseInt(date.month) == date.month) {
      dateString += "-"+Zotero.Utilities.lpad(date.month+1, "0", 2);
      if(date.day) {
        dateString += "-"+Zotero.Utilities.lpad(date.day, "0", 2);
      }
    }

    return dateString;
  }
  return false;
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
  am:         'amharic',
  ar:         'arabic',
  ast:        'asturian',
  bg:         'bulgarian',
  bn:         'bengali',
  bo:         'tibetan',
  br:         'breton',
  ca:         'catalan',
  cop:        'coptic',
  cy:         'welsh',
  cz:         'czech',
  da:         'danish',
  de_1996:    'ngerman',
  de_at_1996: 'naustrian',
  de_at:      'austrian',
  de_de_1996: 'ngerman',
  de:         ['german', 'germanb'],
  dsb:        ['lsorbian', 'lowersorbian'],
  dv:         'divehi',
  el:         'greek',
  el_polyton: 'polutonikogreek',
  en_au:      'australian',
  en_ca:      'canadian',
  en:         'english',
  en_gb:      ['british', 'ukenglish'],
  en_nz:      'newzealand',
  en_us:      ['american', 'usenglish'],
  eo:         'esperanto',
  es:         'spanish',
  et:         'estonian',
  eu:         'basque',
  fa:         'farsi',
  fi:         'finnish',
  fr_ca:      ['acadian', 'canadian', 'canadien'],
  fr:         ['french', 'francais'],
  fur:        'friulan',
  ga:         'irish',
  gd:         ['scottish', 'gaelic'],
  gl:         'galician',
  he:         'hebrew',
  hi:         'hindi',
  hr:         'croatian',
  hsb:        ['usorbian', 'uppersorbian'],
  hu:         'magyar',
  hy:         'armenian',
  ia:         'interlingua',
  id:         ['indonesian', 'bahasa', 'bahasai', 'indon', 'meyalu'],
  is:         'icelandic',
  it:         'italian',
  ja:         'japanese',
  kn:         'kannada',
  la:         'latin',
  lo:         'lao',
  lt:         'lithuanian',
  lv:         'latvian',
  ml:         'malayalam',
  mn:         'mongolian',
  mr:         'marathi',
  nb:         ['norsk', 'bokmal'],
  // nko
  nl:         'dutch',
  nn:         'nynorsk',
  no:         ['norwegian', 'norsk'],
  oc:         'occitan',
  pl:         'polish',
  pms:        'piedmontese',
  pt_br:      ['brazil', 'brazilian'],
  pt:         ['portuguese', 'portuges'],
  pt_pt:      'portuguese',
  rm:         'romansh',
  ro:         'romanian',
  ru:         'russian',
  sa:         'sanskrit',
  se:         'samin',
  sk:         'slovak',
  sl:         ['slovenian', 'slovene'],
  sq_al:      'albanian',
  sr_cyrl:    'serbianc',
  sr_latn:    'serbian',
  sr:         'serbian', //latin script as default?
  sv:         'swedish',
  syr:        'syriac',
  ta:         'tamil',
  te:         'telugu',
  th:         ['thai', 'thaicjk'],
  tk:         'turkmen',
  tr:         'turkish',
  uk:         'ukrainian',
  ur:         'urdu',
  vi:         'vietnamese',
  zh_latn:    'pinyin',
  zh:         'pinyin', //only supported chinese in babel is the romanization pinyin?
  zlm:        ['malay', 'bahasam', 'melayu'],
});
Dict.forEach(babelLanguageMap, function(key, value) {
  if (typeof value === 'string' ) {
    babelLanguageMap[key] = [value];
  }
});
var babelLanguageList = [].concat.apply([], Dict.values(babelLanguageMap)).filter(function(value, index, self) { return self.indexOf(value) === index; });
var polyglossia = [ 'albanian', 'amharic', 'arabic', 'armenian', 'asturian', 'bahasai', 'bahasam', 'basque', 'bengali', 'brazilian', 'brazil',
                    'breton', 'bulgarian', 'catalan', 'coptic', 'croatian', 'czech', 'danish', 'divehi', 'dutch', 'english', 'british', 'ukenglish',
                    'esperanto', 'estonian', 'farsi', 'finnish', 'french', 'friulan', 'galician', 'german', 'austrian', 'naustrian', 'greek', 'hebrew',
                    'hindi', 'icelandic', 'interlingua', 'irish', 'italian', 'kannada', 'lao', 'latin', 'latvian', 'lithuanian', 'lsorbian', 'magyar',
                    'malayalam', 'marathi', 'nko', 'norsk', 'nynorsk', 'occitan', 'piedmontese', 'polish', 'portuges', 'romanian', 'romansh', 'russian',
                    'samin', 'sanskrit', 'scottish', 'serbian', 'slovak', 'slovenian', 'spanish', 'swedish', 'syriac', 'tamil', 'telugu', 'thai',
                    'tibetan', 'turkish', 'turkmen', 'ukrainian', 'urdu', 'usorbian', 'vietnamese', 'welsh'];

/* get_bigrams and string_similarity together implement http://www.catalysoft.com/articles/strikeamatch.html */
function get_bigrams(string) {
    // Takes a string and returns a list of bigrams
    var s = string.toLowerCase();
    var v = new Array(s.length-1);
    for (i = 0; i< v.length; i++){
        v[i] =s.slice(i,i+2);
    }
    return v;
}
function string_similarity(str1, str2){
    /*
    Perform bigram comparison between two strings
    and return a percentage match in decimal form
    */
    var pairs1 = get_bigrams(str1);
    var pairs2 = get_bigrams(str2);
    var union = pairs1.length + pairs2.length;
    var hit_count = 0;
    for (x in pairs1){
        for (y in pairs2){
            if (pairs1[x] == pairs2[y]){
                hit_count++;
            }
        }
    }
    return ((2.0 * hit_count) / union);
}

//POTENTIAL ISSUES
//"programTitle", "bookTitle" //TODO, check!!
//
//  accessDate:"accessDate", //only written on attached webpage snapshots by zo
//  journalAbbreviation:"journalAbbreviation", //not supported by bl

//  country:"country", //TODO if patent, should be put into 'location'

Translator.typeMap.toBibTeX = Dict({
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

function hasCreator(item, type) {
  return (item.creators || []).some(function(creator) { return (creator.creatorType == type); });
}

function doExport() {
  try {
    bibtexExport();
  } catch (e) {
    Zotero.debug('better-bibtex: export failed: ' + e + "\n" + e.stack);
    throw(e);
  }
}

function bibtexExport() {
  //Zotero.write('% biblatex export generated by Zotero '+Zotero.Utilities.getVersion());
  // to make sure the BOM gets ignored
  Zotero.write("\n");

  while (item = Translator.nextItem()) {
    // determine type
    var type = getBibTeXType(item);

    // inbook is reasonable at times, using a bookauthor should indicate this
    if (item.itemType == 'bookSection' && hasCreator(item, 'bookAuthor')) { type = 'inbook'; }

    //a book without author but with editors is a collection
    if (item.itemType == 'book' && !hasCreator(item,'author') && hasCreator(item, 'editor')) { type = 'collection'; }

    //biblatex recommends us to use mvbook for multi-volume books
    if (type == 'book' && item.volume) { type = 'mvbook'; }

    Zotero.write("\n\n");
    Zotero.write('@'+type+'{'+item.__citekey__);

    writeFieldMap(item, fieldMap);

    if (Translator.usePrefix) {
      writeField('options', latex_escape('useprefix'));
    }

    //all kinds of numbers (biblatex has additional support for journal number != issue, but zotero has not)
    writeField('number', latex_escape(item.reportNumber || item.seriesNumber || item.patentNumber || item.billNumber || item.episodeNumber || item.number));

    //split numeric and nonnumeric issue specifications (for journals) into "number" and "issue"
    writeField((isNaN(parseInt(item.issue)) ? 'issue' : 'number'), latex_escape(item.issue));

    if (item.publicationTitle) {
      switch (item.itemType) {
        case 'bookSection':
        case 'conferencePaper':
        case 'dictionaryEntry':
        case 'encyclopediaArticle':
          writeField('booktitle', latex_escape(item.publicationTitle, {brace: true}));
          break;

        case 'magazineArticle':
        case 'newspaperArticle':
          writeField('journaltitle', latex_escape(item.publicationTitle, {brace: true}));
          break;

        case 'journalArticle':
          var abbr = Zotero.BetterBibTeX.KeyManager.journalAbbrev(item);
          if (Translator.useJournalAbbreviation && abbr) {
            writeField('journal', latex_escape(abbr, {brace: true}));
          } else {
            writeField('journaltitle', latex_escape(item.publicationTitle, {brace: true}));
            writeField('shortjournal', latex_escape(abbr, {brace: true}));
          }
          break;
      }
    }

    if (!Translator.fieldsWritten['booktitle']) { writeField('booktitle', latex_escape(item.encyclopediaTitle || item.dictionaryTitle || item.proceedingsTitle, {brace: true})); }

    writeField('titleaddon', latex_escape(item.websiteTitle || item.forumTitle || item.blogTitle || item.programTitle, {brace: true}));

    writeField('series', latex_escape(item.seriesTitle || item.series, {brace: true})); 
    switch (item.itemType) {
      case 'report':
      case 'thesis':
        writeField('institution', latex_escape(item.publisher, {brace: true}));
        break;

      default:
        writeField('publisher', latex_escape(item.publisher, {brace: true}));
        break;
    }

    switch (item.itemType) {
      case 'letter':
        writeField('type', latex_escape(item.letterType || 'Letter'));
        break;

      case 'email':
        writeField('type', 'E-mail');
        break;

      default:
        if (item.itemType == 'thesis' && (item.thesisType || 'phd').match(/ph\.?d/i)) {
          writeField("type", "phdthesis");
        } else {
          writeField('type', latex_escape(item.manuscriptType || item.thesisType || item.websiteType || item.presentationType || item.reportType || item.mapType));
        }
        break;
    }

    writeField('howpublished', latex_escape(item.presentationType || item.manuscriptType));

    //case of specific eprint-archives in archive-fields
    if (item.archive && item.archiveLocation) {
      var archive = true;
      switch (item.archive.toLowerCase()) {
        case 'arxiv':
          writeField('eprinttype', 'arxiv');
          writeField('eprintclass', latex_escape(item.callNumber));
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

      if (archive) { writeField('eprint', latex_escape(item.archiveLocation)); }
    }

    writeField('note', latex_escape(item.meetingName));

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

          case 'seriesEditor': //let's call them redactors
            editorbs.push(creatorString);
            break;

          default: // the rest into editora with editoratype = collaborator
            editoras.push(creatorString);
        }
      });

      writeField('author', latex_escape(authors, {sep: ' and '}));
      writeField('bookauthor', latex_escape(bookauthors, {sep: ' and '}));
      writeField('commentator', latex_escape(commentators, {sep: ' and '}));
      writeField('editor', latex_escape(editors, {sep: ' and '}));

      writeField('editora', latex_escape(editoras, {sep: ' and '}));
      if (editoras.length > 0) { writeField('editoratype', 'collaborator'); }

      writeField('editorb', latex_escape(editorbs, {sep: ' and '}));
      if (editorbs.length > 0) { writeField('editorbtype', 'redactor'); }

      writeField('holder', latex_escape(holders, {sep: ' and '}));
      writeField('translator', latex_escape(translators, {sep: ' and '}));
    }

    if (item.accessDate) {
      writeField('urldate', latex_escape(strToISO(item.accessDate)));
    }

    if (item.date) {
      var date = strToISO(item.date);
      if (date) {
        writeField('date', latex_escape(date));
      } else {
        writeField('date', latex_escape({literal:item.date}));
      }

      date = Zotero.Utilities.strToDate(item.date);
      if (date) {
        writeField('year', latex_escape(date.year))
      }
    }

    if (item.language) {
      var langlc = item.language.toLowerCase();
      var language = babelLanguageMap[langlc.replace(/[^a-z0-9]/, '_')];
      if (language) { // if the language map has the exact language code, use that language
        language = language[0];
      } else {
        // if not, it's time to get crafty.
        var sim = babelLanguageList.map(function(id) {
          // for each possible language id, calculate its similarity to what was entered into zotero
          return {lang: id, sim: string_similarity(langlc, id)};
        }).sort(function(a, b) {
          // sort the results so the most similar entries go to the front
          return b.sim - a.sim
        });

        if (sim[0].sim >= 0.90) { // only pick up a match if it's at least 90% similar
          language = sim[0].lang;
        } else {
          language = null;
        }
      }

      writeField('langid', latex_escape(language));
    }

    writeExtra(item, (Translator.fieldsWritten['note'] ? 'annotation' : 'note'));

    writeTags('keywords', item);

    if (item.notes && Translator.exportNotes) {
      item.notes.forEach(function(note) {
        writeField('annotation', latex_escape(Zotero.Utilities.unescapeHTML(note.note)));
      });
    }

    writeAttachments(item);

    flushEntry(item);

    Zotero.write("\n}");
  }

  exportJabRefGroups();

  Zotero.write("\n");
}
