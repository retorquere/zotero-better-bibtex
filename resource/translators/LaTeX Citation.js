{
	"translatorID": "b4a5ab19-c3a2-42de-9961-07ae484b8cb0",
	"label": "LaTeX Citation",
	"creator": "Emiliano heyns",
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
    if (CiteKeys.items.has(item.itemID)) { citation.push(CiteKeys.items.get(item.itemID).key); }
  });
  Zotero.write("\\" + Zotero.getHiddenPref('better-bibtex.citeCommand') + "{" + citation.join(',') + '}');
}

var exports = {
	"doExport": doExport
}
