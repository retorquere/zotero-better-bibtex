{
	"translatorID": "f5c15662-1501-4336-8aa5-bd7dc3cc2a68",
	"translatorType": 4,
	"label": "Wiktionary",
	"creator": "Abe Jellinek",
	"target": "^https?://[^/]*\\.wiktionary\\.org/",
	"minVersion": "3.0",
	"maxVersion": null,
	"priority": 100,
	"inRepository": true,
	"browserSupport": "gcsibv",
	"lastUpdated": "2021-05-27 06:15:00"
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
	if (url.includes('/wiki/')) {
		return "dictionaryEntry";
	}
	return false;
	
	// like the Wikipedia translator, we're not going to handle search results
	// unless someone feels strongly about it and wants to add it
}

function doWeb(doc, url) {
	if (detectWeb(doc, url) == "multiple") {
		Zotero.selectItems(getSearchResults(doc, false), function (items) {
			if (items) ZU.processDocuments(Object.keys(items), scrape);
		});
	}
	else {
		scrape(doc, url);
	}
}

function scrape(doc, url) {
	var translator = Zotero.loadTranslator('web');
	// Wikipedia
	translator.setTranslator('e5dc9733-f8fc-4c00-8c40-e53e0bb14664');
	translator.setDocument(doc);
	
	translator.setHandler('itemDone', function (obj, item) {
		item.itemType = 'dictionaryEntry';
		item.dictionaryTitle = item.encyclopediaTitle;
		delete item.encyclopediaTitle;
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
		"url": "https://en.wiktionary.org/wiki/atom",
		"items": [
			{
				"itemType": "dictionaryEntry",
				"title": "atom",
				"creators": [],
				"date": "2021-05-11T20:37:51Z",
				"dictionaryTitle": "Wiktionary",
				"extra": "Page Version ID: 62511125",
				"language": "en",
				"libraryCatalog": "Wiktionary",
				"rights": "Creative Commons Attribution-ShareAlike License",
				"url": "https://en.wiktionary.org/w/index.php?title=atom&oldid=62511125",
				"attachments": [
					{
						"title": "Snapshot",
						"mimeType": "text/html",
						"snapshot": true
					}
				],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://en.wiktionary.org/wiki/%E0%A6%85%E0%A6%A3%E0%A7%81",
		"items": [
			{
				"itemType": "dictionaryEntry",
				"title": "অণু",
				"creators": [],
				"date": "2017-10-19T16:26:22Z",
				"dictionaryTitle": "Wiktionary",
				"extra": "Page Version ID: 47816857",
				"language": "en",
				"libraryCatalog": "Wiktionary",
				"rights": "Creative Commons Attribution-ShareAlike License",
				"url": "https://en.wiktionary.org/w/index.php?title=%E0%A6%85%E0%A6%A3%E0%A7%81&oldid=47816857",
				"attachments": [
					{
						"title": "Snapshot",
						"mimeType": "text/html",
						"snapshot": true
					}
				],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/
