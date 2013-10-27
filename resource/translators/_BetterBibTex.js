{
	"translatorID": "9cb70025-a888-4a29-a210-93ec52da40d4",
	"label": "BibTeX",
	"creator": "Simon Kornblith, Richard Karnesky and Emiliano heyns",
	"target": "bib",
	"minVersion": "2.1.9",
	"maxVersion": "",
	"priority": 100,
	"displayOptions": {
		"exportNotes": true,
		"exportFileData": false,
		"useJournalAbbreviation": false
	},
  "configOptions": {
    "getCollections": true
  },
	"inRepository": true,
	"translatorType": 3,
	"browserSupport": "gcsv",
	"lastUpdated": "2013-10-01 10:05:00"
}

var config = {};

config.citeKeyFormat = Zotero.getOption("keyFormat");

/*: include _BibTex.js :*/

function doExport() {
  doBibTexExport();
}

var exports = {
	"doExport": doExport,
	"doImport": doImport,
	"setKeywordDelimRe": setKeywordDelimRe,
	"setKeywordSplitOnSpace": setKeywordSplitOnSpace
}
