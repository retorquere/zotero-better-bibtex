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
  delete item.itemID;
  delete item.libraryID;
  delete item.key;
  delete item.uniqueFields;

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

  return item;
}

function doExport() {
	var item, data = [];
	while(item = Z.nextItem()) data.push(scrub(item));
	Zotero.write(JSON.stringify(data, null, "\t"));
}

var exports = {
  "doExport": doExport
}
