{
	"translatorID": "82512813-9edb-471c-aebc-eeaaf40c6cf9",
	"label": "Zotero TestCase",
	"creator": "Emiliano Heyns",
	"target": "json",
	"minVersion": "3.0b3",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 2,
	"browserSupport": "gcsv",
	"lastUpdated": "/*= timestamp =*/"
}

function scrub(item) {
  var itemID = CiteKeys.db.where('(rec, i, res, item) => rec.item.itemID == item.itemID', item);

  if (itemID && itemID.length == 1) {
    item.itemID = itemID[0].key;
  } else {
    trLog('no key found for ' + item.itemID);
    delete item.itemID;
  }

  delete item.libraryID;
  delete item.key;
  delete item.uniqueFields;
  delete item.dateAdded;
  delete item.dateModified;
  delete item.uri;

  (item.creators || []).forEach(function(creator) {
    delete creator.creatorID;
    delete creator.fieldMode;
  });

  (item.attachments || []).forEach(function(attachment) {
    attachment.path = attachment.localPath;
    delete attachment.localPath;

    delete attachment.itemID;
    delete attachment.itemType;
    delete attachment.dateAdded;
    delete attachment.dateModified;
    delete attachment.libraryID;
    delete attachment.key;
    delete attachment.url;
    delete attachment.accessDate;
    delete attachment.note;
    delete attachment.sourceItemKey;
    delete attachment.tags;
    delete attachment.related;
    delete attachment.creators;
    delete attachment.notes;
    delete attachment.seeAlso;
    delete attachment.attachments;
    delete attachment.uri;
    delete attachment.charset;
    delete attachment.uniqueFields;
  });

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
    note.note = (note.note || '').replace(/<[^>]*>/gm, '').replace(/[ \n\r\t]+/gm, ' ').trim();
  });

  item.tags = (item.tags || []).map(function(tag) { return tag.tag; });

  return item;
}

/*= include BibTeX.js =*/

function doExport() {
	var data = [];
  CiteKeys.initialize().forEach(function(item) {
    trLog('.');
    data.push(scrub(item));
  });
	Zotero.write(JSON.stringify(data, null, "\t"));
}

var exports = {
  "doExport": doExport
}
