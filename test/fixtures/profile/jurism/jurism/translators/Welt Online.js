{
	"translatorID": "f61beec2-1431-4218-a9d3-68063ede6ecd",
	"label": "Welt Online",
	"creator": "Martin Meyerhoff, Philipp Zumstein",
	"target": "^https?://www\\.welt\\.de",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2019-06-11 13:27:17"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2011-2019 Martin Meyerhoff, Philipp Zumstein

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

/*
  "Multiple" doesn't work on the search pages, because that's another host. However, every other page does it:
  http://www.welt.de/themen/Fukushima/
  http://www.welt.de/wirtschaft/
  http://www.welt.de/wirtschaft/article12962920/Krankenkassen-werfen-Aerzten-Gewinnstreben-vor.html
*/

function detectWeb(doc, _url) {
	if (ZU.xpathText(doc, '//meta[@property="og:type"]/@content') == "article") {
		Zotero.debug("newspaperArticle");
		return "newspaperArticle";
	}
	else if (getSearchResults(doc, true)) {
		return "multiple";
	}
	return false;
}

function scrape(doc, url) {
	var data = ZU.xpathText(doc, '//script[@type="application/ld+json"]');
	var json = JSON.parse(data);
	// Z.debug(json);
	var translator = Zotero.loadTranslator('web');
	// Embedded Metadata
	translator.setTranslator('951c027d-74ac-47d4-a107-9c3069ab7b48');
	// translator.setDocument(doc);
	
	translator.setHandler('itemDone', function (obj, item) {
		item.date = json.datePublished;
		if (item.creators.length == 0) {
			item.creators.push(ZU.cleanAuthor(json.author.name, "author"));
		}
		if (json.headline) {
			item.title = json.headline;
			Z.debug(json.headline);
		}
		item.complete();
	});

	translator.getTranslatorObject(function (trans) {
		trans.itemType = "newspaperArticle";
		trans.doWeb(doc, url);
	});
}


function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = ZU.xpath(doc, '//h4/a[@data-qa="Teaser.Link"]');
	for (var i = 0; i < rows.length; i++) {
		var href = rows[i].href;
		var title = ZU.trimInternal(rows[i].textContent);
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
			if (!items) return;

			var articles = [];
			for (var i in items) {
				articles.push(i);
			}
			ZU.processDocuments(articles, scrape);
		});
	}
	else {
		scrape(doc, url);
	}
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://www.welt.de/wirtschaft/article12962920/Krankenkassen-werfen-Aerzten-Gewinnstreben-vor.html",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Gesundheit: Krankenkassen werfen Ärzten Gewinnstreben vor",
				"creators": [
					{
						"firstName": "Philipp",
						"lastName": "Neumann",
						"creatorType": "author"
					}
				],
				"date": "2011-03-26T06:50:04Z",
				"abstractNote": "Die Chefin des Krankenkassenverbands Doris Pfeiffer fordert den Gesundheitsminister auf, überschüssiges Geld im Gesundheitsfonds zurückzugegeben.",
				"libraryCatalog": "www.welt.de",
				"publicationTitle": "DIE WELT",
				"shortTitle": "Gesundheit",
				"url": "https://www.welt.de/wirtschaft/article12962920/Krankenkassen-werfen-Aerzten-Gewinnstreben-vor.html",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					"Doris",
					"Kliniken",
					"Krankenkassen",
					"Pfeiffer"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.welt.de/wirtschaft/",
		"items": "multiple"
	}
]
/** END TEST CASES **/
