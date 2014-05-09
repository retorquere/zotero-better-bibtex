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
  CiteKeys.initialize();
  Zotero.write("\\" + Zotero.getHiddenPref('better-bibtex.citeCommand') + "{" + CiteKeys.db.map(function(rec) { return rec.key; }).join(',') + '}');
}

var exports = {
	"doExport": doExport
}
