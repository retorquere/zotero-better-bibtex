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
  var keys = [];
  while (item = Translator.nextItem()) {
    keys.push(item.__citekey__);
  }
  Zotero.write("\\" + Zotero.getHiddenPref('better-bibtex.citeCommand') + "{" + keys.join(',') + '}');
}

var exports = {
	"doExport": doExport
}
