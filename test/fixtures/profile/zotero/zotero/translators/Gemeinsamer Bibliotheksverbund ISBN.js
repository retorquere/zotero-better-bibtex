{
	"translatorID": "b7259652-640b-43f1-94e5-18e2f2268463",
	"translatorType": 8,
	"label": "Gemeinsamer Bibliotheksverbund ISBN",
	"creator": "Philipp Zumstein",
	"target": null,
	"minVersion": "4.0",
	"maxVersion": null,
	"priority": 99,
	"inRepository": true,
	"browserSupport": "gcsibv",
	"lastUpdated": "2021-06-30 03:25:00"
}

// This is a temporary placeholder translator to fix the broken-identifier-lookup-until-restart-after-
// a-translator-rename problem that was fixed in https://github.com/zotero/zotero/commit/bde9a74f9db
// and https://github.com/zotero/zotero/commit/b8ad18e96d53.

function detectSearch(item) {
	return false;
}

function doSearch(item) {}
