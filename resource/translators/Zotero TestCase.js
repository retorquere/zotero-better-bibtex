{
  "translatorID": "82512813-9edb-471c-aebc-eeaaf40c6cf9",
  "label": "Zotero TestCase",
  "creator": "Emiliano Heyns",
  "target": "json",
  "minVersion": "3.0b3",
  "maxVersion": "",
  "priority": 100,
  "configOptions": {
    "getCollections": true
  },
  "displayOptions": {
    "exportNotes": true,
    "exportFileData": false
  },
  "inRepository": true,
  "translatorType": 3,
  "browserSupport": "gcsv",
  "lastUpdated": "/*= timestamp =*/"
}

function scrub(item) {
  delete item.__citekey__;
  delete item.libraryID;
  delete item.key;
  delete item.uniqueFields;
  delete item.dateAdded;
  delete item.dateModified;
  delete item.uri;
  delete item.multi;

  (item.creators || []).forEach(function(creator) {
    delete creator.creatorID;
    delete creator.multi;
  });

  item.attachments = (item.attachments || []).map(function(attachment) {
    return {
      path: attachment.localPath,
      title: attachment.title,
      mimeType: attachment.mimeType
    };
  });

  item.notes = (item.notes || []).map(function(note) { return (note.note || '').trim(); }).filter(function(note) { return note; });

  /*
  (item.notes || []).forEach(function(note) {
    delete note.itemID;
    delete note.itemType;
    delete note.dateAdded;
    delete note.dateModified;
    delete note.libraryID;
    delete note.key;
    delete note.sourceItemKey;
    delete note.tags;
    delete note.related;
    // note.note = (note.note || '').replace(/<[^>]*>/gm, '').replace(/[ \n\r\t]+/gm, ' ').trim();
  });
  */

  item.tags = (item.tags || []).map(function(tag) { return tag.tag; });
  item.tags.sort();

  ['attachments', 'seeAlso', 'notes', 'tags', 'creators'].forEach(function(prop) {
    if (item[prop] && item[prop].length == 0) {
      delete item[prop];
    }
  });

  return item;
}

/*= include common.js =*/

function detectImport() {
  var str, json = '';
  while((str = Z.read(1048576)) !== false) { json += str; }

  var data;
  try {
    data = JSON.parse(json);
  } catch (e) {
    Zotero.debug(e);
    return false;
  }

  return (data && data.config && (data.config.id == Translator.id) && data.items);
}

function doImport() {
  Translator.initialize();
  var str, json = '';
  while((str = Z.read(1048576)) !== false) { json += str; }
  var data = JSON.parse(json);
  var prop;
  data.items.forEach(function(i) {
    var item = new Z.Item();
    for (prop in i) { item[prop] = i[prop]; }
    item.complete();
  });
}

function doExport() {
  Translator.initialize();

  var data = {
    config: {
      id:                     Translator.id,
      label:                  Translator.label,
      unicode:                Translator.unicode,
      pattern:                Translator.pattern,
      skipFields:             Translator.skipFields,
      usePrefix:              Translator.usePrefix,
      braceAll:               Translator.braceAll,
      fancyURLs:              Translator.fancyURLs,
      langid:                 Translator.langid,
      useJournalAbbreviation: Translator.useJournalAbbreviation,
      exportCharset:          Translator.exportCharset,
      exportFileData:         Translator.exportFileData,
      exportNotes:            Translator.exportNotes
    },
    collections:              Translator.collections,
    items: []
  };

  while (item = Zotero.nextItem()) {
    if (item.itemType == 'note' || item.itemType == 'attachment') { continue; }
    data.items.push(scrub(item));
  }

  Zotero.write(JSON.stringify(data, null, '  '));
}
