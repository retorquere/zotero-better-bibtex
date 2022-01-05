{
	"translatorID": "c87a910d-70aa-4f33-9bec-f703d63ba84f",
	"translatorType": 4,
	"label": "GameStar/GamePro",
	"creator": "Matthias Mailänder",
	"target": "^https?://(www\\.)?game(star|pro)\\.de",
	"minVersion": "3.0",
	"maxVersion": null,
	"priority": 100,
	"inRepository": true,
	"browserSupport": "gcsibv",
	"lastUpdated": "2021-06-02 13:45:00"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2021 Matthias Mailänder

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
	if (url.includes('/artikel/')) {
		return "magazineArticle";
	}
	else if (getSearchResults(doc, true)) {
		return "multiple";
	}
	return false;
}

function doWeb(doc, url) {
	switch (detectWeb(doc, url)) {
		case "multiple":
			Zotero.selectItems(getSearchResults(doc, false), function (items) {
				if (!items) {
					return true;
				}
				var articles = [];
				for (var i in items) {
					articles.push(i);
				}
				ZU.processDocuments(articles, scrape);
				return true;
			});
			break;
		case "magazineArticle":
			scrape(doc, url);
			break;
	}
}

function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var links = doc.querySelectorAll('.media-heading a');
	for (let i = 0; i < links.length; i++) {
		let href = links[i].href;
		let title = ZU.trimInternal(links[i].textContent);
		if (!href || !title) continue;
		if (checkOnly) return true;
		found = true;
		items[href] = title;
	}
	return found ? items : false;
}

function scrape(doc, url) {
	var translator = Zotero.loadTranslator('web');
	translator.setTranslator('951c027d-74ac-47d4-a107-9c3069ab7b48'); // embedded metadata
	translator.setDocument(doc);

	translator.setHandler('itemDone', function (obj, item) { // correct bad metadata in here
		if (url.includes('/artikel/')) {
			item.itemType = "magazineArticle";
		}
		if (url.includes('gamestar.de')) {
			item.publicationTitle = "GameStar";
		}
		if (url.includes('gamepro.de')) {
			item.publicationTitle = "GamePro";
		}
		item.language = "de-DE";
		item.creators = []; // reset bad author metadata

		var authorMetadata = doc.querySelectorAll('p.info.m-b-2 b');
		if (authorMetadata != undefined) {
			for (let author of authorMetadata) {
				item.creators.push(ZU.cleanAuthor(author.innerText, "author"));
			}
		}

		authorMetadata = doc.querySelectorAll('a[class="btn btn-link btn-inline"]');
		if (authorMetadata != undefined) {
			for (let author of authorMetadata) {
				item.creators.push(ZU.cleanAuthor(author.text, "author"));
			}
		}

		item.complete();
	});

	translator.getTranslatorObject(function(trans) {
		trans.doWeb(doc, url);
	});
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://www.gamestar.de/artikel/black-white-peter-molyneux-laesst-sie-gott-spielen,1330147.html",
		"items": [
			{
				"itemType": "magazineArticle",
				"title": "Black & White im Test - Peter Molyneux lässt Sie Gott spielen",
				"creators": [
					{
						"firstName": " Mick",
						"lastName": "Schnelle",
						"creatorType": "author"
					}
				],
				"date": "2001-04-01T15:12:00+02:00",
				"abstractNote": "Genial oder Gurke? Mit der endgültigen Testversion muss Black & White endlich Farbe bekennen: Das lang und heiß erwartete Götterspiel gerät auf dem ...",
				"publicationTitle": "GameStar",
				"libraryCatalog": "www.gamestar.de",
				"language": "de-DE",
				"url": "https://www.gamestar.de/artikel/black-white-peter-molyneux-laesst-sie-gott-spielen,1330147.html",
				"attachments": [
					{
						"title": "Snapshot",
						"mimeType": "text/html"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.gamepro.de/artikel/uncharted-4-a-thiefs-end-wettlauf-zum-piratenschatz,3271959.html",
		"items": [
			{
				"itemType": "magazineArticle",
				"title": "Uncharted 4 für PS4 im Test: Wettlauf zum Piratenschatz",
				"shortTitle": "Uncharted 4 für PS4 im Test",
				"creators": [
					{
						"firstName": "Kai",
						"lastName": "Schmidt",
						"creatorType": "author"
					}
				],
				"date": "2020-04-02T07:42:00+02:00",
				"abstractNote": "Uncharted A Thief's End ist nun Teil des PS Plus-Lineups im April 2020. Lest im Review, warum das PlayStation 4-Exclusive, ein echtes Meisterwerk ist.",
				"publicationTitle": "GamePro",
				"libraryCatalog": "www.gamepro.de",
				"language": "de-DE",
				"url": "https://www.gamepro.de/artikel/uncharted-4-a-thiefs-end-wettlauf-zum-piratenschatz,3271959.html",
				"attachments": [
					{
						"title": "Snapshot",
						"mimeType": "text/html"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.gamestar.de/suche/?query=grand+theft+auto",
		"items": "multiple"
	}
]
/** END TEST CASES **/
