/*= bibtex_parser =*/

function detectImport() {
  try {
    var input = Zotero.read(102400);
    Zotero.debug('BBT detect against ' + input);
    var bib = BetterBibTeXParser.parse(input);
    if (bib.references.length > 0) { trLog('Yes, BibTeX'); return true; }
    trLog('Not BibTeX, passing on');
    return false;
  } catch (e) {
    Zotero.debug('better-bibtex: detect failed: ' + e + "\n" + e.stack);
    return false;
  }
}


function doImport() {
  try {
      _doImport();
  } catch (e) {
    Zotero.debug('better-bibtex: import failed: ' + e + "\n" + e.stack);
    throw(e);
  }
}


if (!JabRef) {
  var JabRef = {};
}

JabRef.importGroup = function(group) {
  var collection = new Zotero.Collection();
  collection.type = 'collection';
  collection.name = group.name;
  collection.children = group.children.map(function(key) { return JabRef.items[key]; });

  group.collections.forEach(function(child) {
    collection.children.push(JabRef.importGroup(child));
  });
  JabRef.collections.push(collection);
  return collection;
};

function _doImport() {
  Translator.initialize();

  var data = '';
  var read;
  while(read = Zotero.read(1024)) { data += read; }

  var bib = BetterBibTeXParser.parse(data);

  JabRef.items = Dict();
  bib.references = bib.references.forEach(function(ref) {
    JabRef.items[ref.__key__] = createZoteroReference(ref);
  });

  JabRef.collections = [];
  bib.collections.forEach(function(coll) {
    JabRef.importGroup(coll);
  });
  JabRef.collections.forEach(function(coll) {
    coll.complete();
  });
}

