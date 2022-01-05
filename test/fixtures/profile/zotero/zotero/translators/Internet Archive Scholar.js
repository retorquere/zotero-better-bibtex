{
	"translatorID": "41c2be3b-eb2f-441e-b987-c98f9318e841",
	"translatorType": 4,
	"label": "Internet Archive Scholar",
	"creator": "Abe Jellinek",
	"target": "^https://scholar\\.archive\\.org/",
	"minVersion": "3.0",
	"maxVersion": null,
	"priority": 100,
	"inRepository": true,
	"browserSupport": "gcsibv",
	"lastUpdated": "2021-06-28 19:45:00"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2021 Abe Jellinek
	
	This file is part of Zotero.

	Zotero is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	Zotero is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
	GNU Affero General Public License for more details.

	You should have received a copy of the GNU Affero General Public License
	along with Zotero. If not, see <http://www.gnu.org/licenses/>.

	***** END LICENSE BLOCK *****
*/


function detectWeb(doc, url) {
	if (url.includes('/search?') && getSearchResults(doc, true)) {
		return "multiple";
	}
	return false;
}

function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = doc.querySelectorAll('.biblio-record');
	for (let row of rows) {
		let href = attr(row, '.external-identifiers a[href*="fatcat.wiki/"]', 'href');
		if (!href) href = attr(row, '.dropdown-menu a[title*="fulltext"]', 'href');
		let title = ZU.trimInternal(text(row, '.biblio-title'));
		if (!href || !title) continue;
		if (checkOnly) return true;
		found = true;
		items[href] = title;
	}
	return found ? items : false;
}

function doWeb(doc, url) {
	if (detectWeb(doc, url) == "multiple") {
		Zotero.selectItems(getSearchResults(doc, false), function (items) {
			if (items) ZU.processDocuments(Object.keys(items), scrape);
		});
	}
}

function scrape(doc, url) {
	var translator = Zotero.loadTranslator('web');
	
	if (url.includes('fatcat.wiki/')) {
		// Fatcat
		translator.setTranslator('afef9c9d-53a1-49da-9155-1fdf683798c3');
	}
	else if (url.includes('archive.org/')) {
		// Internet Archive
		translator.setTranslator('db0f4858-10fa-4f76-976c-2592c95f029c');
	}
	else {
		Z.debug('Unknown item fulltext source; trying Embedded Metadata');
		// Embedded Metadata
		translator.setTranslator('951c027d-74ac-47d4-a107-9c3069ab7b48');
	}
	
	translator.setDocument(doc);
	
	translator.setHandler('itemDone', function (obj, item) {
		item.complete();
	});

	translator.getTranslatorObject(function (trans) {
		trans.doWeb(doc, url);
	});
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://scholar.archive.org/search?q=interlisp",
		"items": "multiple"
	}
]
/** END TEST CASES **/
