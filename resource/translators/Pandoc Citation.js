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
  CiteKeys.initialize();
  Zotero.write("\\" + Zotero.getHiddenPref('better-bibtex.citeCommand') + CiteKeys.db.map(function(rec) { return ('@' + rec.key); }).join(' '));
}

var exports = {
	"doExport": doExport
}
