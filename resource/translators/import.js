// @include "Parser.js"

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
  Zotero.debug(JSON.stringify(group));
  var collection = new Zotero.Collection();
  collection.type = 'collection';
  collection.name = group.name;
  collection.children = group.items.map(function(key) { return {type: 'item', id: key}; });

  iterate (child over group.collections) {
    collection.children.push(JabRef.importGroup(child));
  }
  collection.complete();
  return collection;
};

function _doImport() {
  Translator.initialize();

  var data = '';
  var read;
  while(read = Zotero.read(1024)) { data += read; }

  var bib = BetterBibTeXParser.parse(data);

  iterate (ref over bib.references) {
    createZoteroReference(ref);
  }

  iterate (coll over bib.collections) {
    JabRef.importGroup(coll);
  }
}

