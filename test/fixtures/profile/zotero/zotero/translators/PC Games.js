{
	"translatorID": "e3e57ecd-b278-4b27-b49e-5aa2c76b25fd",
	"label": "PC Games",
	"creator": "Matthias Mailänder",
	"target": "^https?://(www\\.)?pcgames\\.de",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2021-04-06 11:16:12"
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
	if (url.includes('/Tests/')) {
		return "magazineArticle";
	}
	return false;
}

function doWeb(doc, url) {
	if (detectWeb(doc, url) == "magazineArticle") {
		scrape(doc, url);
	}
}

function scrape(doc, url) {
	var translator = Zotero.loadTranslator('web');
	translator.setTranslator('951c027d-74ac-47d4-a107-9c3069ab7b48'); // embedded metadata
	translator.setDocument(doc);

	translator.setHandler('itemDone', function (obj, item) { // correct bad metadata in here
		if (url.includes('/Tests/')) {
			item.itemType = "magazineArticle";
		}
		item.publicationTitle = "PC Games";
		item.language = "de-DE";
		item.creators = []; // reset bad author metadata
		var authorMetadata = doc.querySelectorAll('a[class="editorNameLink "]');
		for (let author of authorMetadata) {
			item.creators.push(ZU.cleanAuthor(author.text, "author"));
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
		"url": "https://www.pcgames.de/Thimbleweed-Park-Spiel-55045/Tests/Review-Adventure-Ron-Gilbert-1224475/",
		"items": [
			{
				"itemType": "magazineArticle",
				"title": "Thimbleweed Park im Test: Adventure-Comeback von Ron Gilbert",
				"shortTitle": "Thimbleweed Park im Test",
				"creators": [
					{
						"firstName": "Felix",
						"lastName": "Schütz",
						"creatorType": "author"
					}
				],
				"date": "2017-03-30T18:01:00+02:00",
				"abstractNote": "Pixeloptik, Verben-Interface und knackige Rätsel: Ron Gilbert kehrt zu seinen Wurzeln zurück. Aber macht sein Retro-Adventure auch Spaß? Das klären wir im Test.",
				"publicationTitle": "PC Games",
				"libraryCatalog": "www.pcgames.de",
				"language": "de-DE",
				"url": "https://www.pcgames.de/Thimbleweed-Park-Spiel-55045/Tests/Review-Adventure-Ron-Gilbert-1224475/",
				"attachments": [
					{
						"title": "Snapshot",
						"mimeType": "text/html"
					}
				],
				"notes": [],
				"tags": [
					{
						"tag": "adventure"
					},
					{
						"tag": "kickstarter"
					},
					{
						"tag": "lucas arts"
					},
					{
						"tag": "monkey island"
					},
					{
						"tag": "retro"
					}
				],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/
