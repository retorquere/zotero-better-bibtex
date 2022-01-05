{
	"translatorID": "e3748cf3-36dc-4816-bf86-95a0b63feb03",
	"translatorType": 4,
	"label": "Gale Databases",
	"creator": "Abe Jellinek and Jim Miazek",
	"target": "^https?://[^?&]*(?:gale|galegroup|galetesting|ggtest)\\.com(?:\\:\\d+)?/ps/",
	"minVersion": "3.0",
	"maxVersion": null,
	"priority": 100,
	"inRepository": true,
	"browserSupport": "gcsibv",
	"lastUpdated": "2021-05-25 18:20:00"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2021 Abe Jellinek and Jim Miazek
	
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
	if (url.includes('/ps/eToc.do')
		|| text(doc, 'h1.page-header').includes("Table of Contents")) {
		return "book";
	}
	if (url.includes('Search.do') && getSearchResults(doc, true)) {
		return "multiple";
	}
	if (doc.querySelector('a[data-gtm-feature="bookView"]')) {
		return "bookSection";
	}
	return "magazineArticle";
}

function getSearchResults(doc, checkOnly) {
	let items = {};
	let found = false;
	let rows = doc.querySelectorAll('h3.title > a.documentLink');
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
	let citeData = doc.querySelector('input.citationToolsData');
	let documentUrl = decodeURIComponent(citeData.dataset.url);
	let mcode = citeData.dataset.mcode; // undefined for bookSections
	let productName = citeData.dataset.productname;
	let docId = mcode ? undefined : decodeURIComponent(url.match(/(?:docId|id)=([^&]+)/)[1]);
	let risPostBody = JSON.stringify([{
		documentUrl: `<span class="docUrl">${documentUrl}</span>`,
		mcode,
		docId,
		productName
	}]);
	let pdfURL = attr(doc, 'button[data-gtm-feature="download"]', 'data-url');

	ZU.doPost('https://go.gale.com/ps/citationtools/rest/cite/getcitations/', risPostBody, function (text) {
		let citations = JSON.parse(text);
		let translator = Zotero.loadTranslator("import");
		translator.setTranslator("32d59d2d-b65a-4da4-b0a3-bdd3cfb979e7"); // RIS
		translator.setString(citations.RIS[0]);
		translator.setHandler("itemDone", function (obj, item) {
			if (pdfURL) {
				item.attachments.push({
					url: pdfURL,
					title: "Full Text PDF",
					mimeType: "application/pdf"
				});
			}
			item.attachments.push({
				title: "Snapshot",
				document: doc
			});
			item.notes = [];
			item.url = item.url.replace(/u=[^&]+&?/, '');
			item.complete();
		});
		translator.translate();
	}, {
		'Content-Type': 'application/json; charset=utf-8',
		Accept: 'application/json'
	});
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://link.gale.com/apps/pub/5BBU/GVRL?sid=GVRL",
		"items": [
			{
				"itemType": "book",
				"title": "Arts and Humanities Through the Eras",
				"creators": [
					{
						"lastName": "Bleiberg",
						"firstName": "Edward I.",
						"creatorType": "editor"
					},
					{
						"lastName": "Evans",
						"firstName": "James Allan",
						"creatorType": "editor"
					},
					{
						"lastName": "Figg",
						"firstName": "Kristen Mossler",
						"creatorType": "editor"
					},
					{
						"lastName": "Soergel",
						"firstName": "Philip M.",
						"creatorType": "editor"
					},
					{
						"lastName": "Friedman",
						"firstName": "John Block",
						"creatorType": "editor"
					}
				],
				"date": "2005",
				"archive": "Gale eBooks",
				"libraryCatalog": "Gale",
				"place": "Detroit, MI",
				"publisher": "Gale",
				"series": "Ancient Egypt 2675-332 B.C.E.",
				"url": "https://link.gale.com/apps/pub/5BBU/GVRL?sid=GVRL",
				"volume": "1",
				"attachments": [
					{
						"title": "Snapshot",
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
		"url": "https://link.gale.com/apps/doc/CX3427400755/GVRL?sid=GVRL&xid=77ea673e",
		"items": [
			{
				"itemType": "bookSection",
				"title": "Ariosto, Ludovico",
				"creators": [
					{
						"lastName": "Bleiberg",
						"firstName": "Edward I.",
						"creatorType": "editor"
					},
					{
						"lastName": "Evans",
						"firstName": "James Allan",
						"creatorType": "editor"
					},
					{
						"lastName": "Figg",
						"firstName": "Kristen Mossler",
						"creatorType": "editor"
					},
					{
						"lastName": "Soergel",
						"firstName": "Philip M.",
						"creatorType": "editor"
					},
					{
						"lastName": "Friedman",
						"firstName": "John Block",
						"creatorType": "editor"
					}
				],
				"date": "2005",
				"archive": "Gale eBooks",
				"bookTitle": "Arts and Humanities Through the Eras",
				"language": "English",
				"libraryCatalog": "Gale",
				"pages": "350-351",
				"place": "Detroit, MI",
				"publisher": "Gale",
				"series": "Renaissance Europe 1300-1600",
				"url": "https://link.gale.com/apps/doc/CX3427400755/GVRL?sid=GVRL&xid=77ea673e",
				"volume": "4",
				"attachments": [
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					},
					{
						"title": "Snapshot",
						"mimeType": "text/html"
					}
				],
				"tags": [
					{
						"tag": "Ariosto, Ludovico"
					},
					{
						"tag": "Playwrights"
					},
					{
						"tag": "Poets"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/
