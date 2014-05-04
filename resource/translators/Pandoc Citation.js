{
	"translatorID": "4c52eb69-e778-4a78-8ca2-4edf024a5074",
	"label": "Pandoc Citation",
	"creator": "Erik Hetzner & Emiliano heyns",
	"target": "bib",
	"minVersion": "2.1.9",
	"maxVersion": "",
	"priority": 100,
  "configOptions": {
    "getCollections": "true"
  },
  "displayOptions": {},
	"inRepository": true,
	"translatorType": 2,
	"browserSupport": "gcsv",
	"lastUpdated": "/*= timestamp =*/"
}

/*= include BibTeX.js =*/

function doExport() {
  var citation = [];
  CiteKeys.initialize().forEach(function(item) {
    Config.fieldsWritten = Dict({});
    if (CiteKeys.items.has(item.itemID)) { citation.push('@' + CiteKeys.items.get(item.itemID).key); }
  });
  Zotero.write(citation.join(' '));
}

var exports = {
	"doExport": doExport
}
