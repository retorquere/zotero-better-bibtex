{
	"translatorID": "d3ee2368-04d7-4b4d-a8f3-c20c3f5234a9",
	"translatorType": 4,
	"label": "Oxford English Dictionary",
	"creator": "Sebastian Karcher and Emiliano Heyns",
	"target": "^https?://(www\\.)?oed\\.com/",
	"minVersion": "3.0",
	"maxVersion": null,
	"priority": 100,
	"inRepository": true,
	"browserSupport": "gcsibv",
	"lastUpdated": "2021-06-14 21:30:00"
}

/*
	***** BEGIN LICENSE BLOCK *****
	
	Copyright © 2013-2021 Sebastian Karcher and Emiliano Heyns
	This file is part of Zotero.
	
	Zotero is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.
	
	Zotero is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU Affero General Public License for more details.
	
	You should have received a copy of the GNU Affero General Public License
	along with Zotero.  If not, see <http://www.gnu.org/licenses/>.
	
	***** END LICENSE BLOCK *****
*/

function detectWeb(doc, url) {
	if (url.match(/\/search\?/) && getSearchResults(doc, true)) return 'multiple';
	if (url.match(/\/view\/Entry\//)) return 'dictionaryEntry';
	return false;
}

function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = doc.querySelectorAll('#results .word a');
	for (let row of rows) {
		let href = row.href;
		let title = ZU.trimInternal(row.textContent);
		if (!href || !title) continue;
		if (checkOnly) return true;
		found = true;
		items[href] = title;
	}
	return found ? items : false;
}

function doWeb(doc, url) {
	if (detectWeb(doc, url) === 'multiple') {
		Zotero.selectItems(getSearchResults(doc, false), function (items) {
			if (items) ZU.processDocuments(Object.keys(items), scrape);
		});
	}
	else {
		scrape(doc, url);
	}
}

function scrape(doc, url) {
	let item = new Zotero.Item('dictionaryEntry');
	item.url = url.replace(/\?.+/, '');
	item.title = ZU.trimInternal(text(doc, 'h1 .hwSect') || '');

	item.attachments = [
		{
			url: url,
			title: "OED snapshot",
			mimeType: "text/html"
		}
	];

	item.language = 'en-GB';
	item.publisher = 'Oxford University Press';
	item.publicationTitle = 'OED Online';

	item.complete();
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://www.oed.com/view/Entry/104732",
		"items": [
			{
				"itemType": "dictionaryEntry",
				"title": "labour | labor, n.",
				"creators": [],
				"dictionaryTitle": "OED Online",
				"language": "en-GB",
				"libraryCatalog": "Oxford English Dictionary",
				"publisher": "Oxford University Press",
				"url": "https://www.oed.com/view/Entry/104732",
				"attachments": [
					{
						"title": "OED snapshot",
						"mimeType": "text/html"
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
		"url": "http://www.oed.com/search?searchType=dictionary&q=labor&_searchBtn=Search",
		"items": "multiple"
	}
]
/** END TEST CASES **/
