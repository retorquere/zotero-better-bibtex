{
	"translatorID": "5f1c4a3b-b7cf-4170-a896-e4d82c0621c9",
	"label": "Google AI",
	"creator": "Guy Aglionby",
	"target": "^https://ai\\.google/research/(pubs|people)",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2018-09-28 12:10:45"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2018 Guy Aglionby
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

// See BibTeX.js
var bibtex2zoteroTypeMap = {
	"book":"book", // or booklet, proceedings
	"inbook":"bookSection",
	"incollection":"bookSection",
	"article":"journalArticle", // or magazineArticle or newspaperArticle
	"patent" :"patent",
	"phdthesis":"thesis",
	"unpublished":"manuscript",
	"inproceedings":"conferencePaper", // check for conference also
	"conference":"conferencePaper",
	"techreport":"report",
	"booklet":"book",
	"manual":"book",
	"mastersthesis":"thesis",
	"misc":"book",
	"proceedings":"book",
	"online":"webpage",
	// from BibLaTeX translator:
	"thesis":"thesis",
	"letter":"letter",
	"movie":"film",
	"artwork":"artwork",
	"report":"report",
	"legislation":"bill",
	"jurisdiction":"case",
	"audio":"audioRecording",
	"video":"videoRecording",
	"software":"computerProgram",
	"inreference":"encyclopediaArticle",
	"collection":"book",
	"mvbook":"book"
};

function detectWeb(doc, url) {
	if (url.includes('/pubs/pub')) {
		let bibtex = extractBibtex(doc);
		let doctype = bibtex.split('{')[0].replace('@', '');
		return bibtex2zoteroTypeMap[doctype] || 'journalArticle';
	} else if (getSearchResults(doc, true)) {
		return 'multiple';
	}
}

function doWeb(doc, url) {
	if (detectWeb(doc, url) === 'multiple') {
		// Test cases: (defer: true is broken so cannot currently use automated tests)
		// https://ai.google/research/people/105197
		// https://ai.google/research/pubs/
		Zotero.selectItems(getSearchResults(doc), function (selected) {
			if (!selected) {
				return true;
			}
			ZU.processDocuments(Object.keys(selected), scrape);
		});
	} else {
		scrape(doc, url);
	}
}

function scrape(doc, url) { 
	let bibtex = extractBibtex(doc);
	let translator = Zotero.loadTranslator("import");
	translator.setTranslator("9cb70025-a888-4a29-a210-93ec52da40d4");
	translator.setString(bibtex);
	translator.setHandler("itemDone", function (obj, item) {
		let downloadUrl = ZU.xpathText(doc, '//a[span[contains(@class, "icon--download")]]/@href');
		if (downloadUrl.endsWith('.pdf')) {
			item.attachments.push({
				url: downloadUrl,
				title: 'Full Text PDF',
				mimeType: 'application/pdf'
			});
		}
		delete item.itemID;
		item.complete();
	});
	translator.translate();	
}

function extractBibtex(doc) { 
	let escapedBibtex = ZU.xpathText(doc, '//a[span[contains(@class, "icon--copy")]]/@ng-click')
							.replace("CopyCtrl.onClick($event, '", '')
							.replace("', true)", '');
	return decodeURIComponent(escapedBibtex);
}

function getSearchResults(doc, checkOnly) {
	let items = {};
	let found = false;
	let rows = ZU.xpath(doc, '//a[contains(@class, "card__title")]');
	for (let i=0; i<rows.length; i++) {
		let href = rows[i].href;
		let title = ZU.trimInternal(rows[i].textContent);
		if (!href || !title) continue;
		if (checkOnly) return true;
		found = true;
		items[href] = title;
	}
	return found ? items : false;
}
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://ai.google/research/pubs/pub47251",
		"items": [
			{
				"itemType": "conferencePaper",
				"title": "\"If I press delete, it's gone\" - User Understanding of Online Data Deletion and Expiration",
				"creators": [
					{
						"firstName": "Ambar",
						"lastName": "Murillo",
						"creatorType": "author"
					},
					{
						"firstName": "Andreas",
						"lastName": "Kramm",
						"creatorType": "author"
					},
					{
						"firstName": "Sebastian",
						"lastName": "Schnorf",
						"creatorType": "author"
					},
					{
						"firstName": "Alexander De",
						"lastName": "Luca",
						"creatorType": "author"
					}
				],
				"date": "2018",
				"libraryCatalog": "Google AI",
				"proceedingsTitle": "Proceedings of the Symposium on Usable Privacy and Security 2018",
				"attachments": [
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
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
		"url": "https://ai.google/research/pubs/pub46616",
		"items": [
			{
				"itemType": "report",
				"title": "Designing A/B tests in a collaboration network",
				"creators": [
					{
						"firstName": "Sangho",
						"lastName": "Yoon",
						"creatorType": "author"
					}
				],
				"date": "2018",
				"libraryCatalog": "Google AI",
				"url": "http://www.unofficialgoogledatascience.com/2018/01/designing-ab-tests-in-collaboration.html",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/
