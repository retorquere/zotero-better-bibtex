{
	"translatorID": "4f0d0c90-5da0-11df-a08a-0800200c9a66",
	"label": "FAZ.NET",
	"creator": "Philipp Zumstein",
	"target": "^https?://((www\\.)?faz\\.net/.)",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2017-11-11 11:24:04"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2017 Philipp Zumstein
	
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


// attr()/text() v2
function attr(docOrElem,selector,attr,index){var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector);return elem?elem.getAttribute(attr):null;}function text(docOrElem,selector,index){var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector);return elem?elem.textContent:null;}


function detectWeb(doc, url) {
	if (doc.title == "Suche und Suchergebnisse - FAZ" && getSearchResults(doc, true)) {
		return "multiple";
	} else if (text(doc, 'div.Artikel')) {
		if (text(doc, 'div.Artikel div.VideoBox')) {
			return "videoRecording";
		} else {
			return "newspaperArticle";
		}
	}
}

function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = ZU.xpath(doc, '//div/a[@class="TeaserHeadLink"]');
	for (var i=0; i<rows.length; i++) {
		// skip paywalled content
		if (ZU.xpathText(rows[i], './span[contains(@class, "fazplusIcon")]')) {
			continue;
		}
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
			if (!items) {
				return true;
			}
			var articles = [];
			for (var i in items) {
				articles.push(i);
			}
			ZU.processDocuments(articles, scrape);
		});
	} else {
		scrape(doc, url);
	}
}


function scrape(doc, url) {
	var type = detectWeb(doc, url);
	
	var translator = Zotero.loadTranslator('web');
	// Embedded Metadata
	translator.setTranslator('951c027d-74ac-47d4-a107-9c3069ab7b48');
	// translator.setDocument(doc);
	
	translator.setHandler('itemDone', function (obj, item) {
		// fix authors
		item.creators = [];
		var authors = doc.querySelectorAll('.atc-Meta .atc-MetaAuthor');
		for (let i=0; i<authors.length; i++) {
			item.creators.push(ZU.cleanAuthor(authors[i].textContent, "author"));
		}
		
		var section = text(doc, '.gh-MainNav_SectionsLink-is-active');
		if (section) {
			item.section = Zotero.Utilities.trimInternal(section);
		}
		if (!item.language) {
			item.language = "de-DE";
		}
		item.ISSN = "0174-4909";
		item.runningTime = attr(doc, 'meta[itemprop="duration"]', 'content');
		item.complete();
	});

	translator.getTranslatorObject(function(trans) {
		trans.itemType = type;
		trans.doWeb(doc, url);
	});

}
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.faz.net/sonntagszeitung/wissenschaft/wissenschaftsphilosophie-krumme-wege-der-vernunft-1654864.html",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Wissenschaftsphilosophie: Krumme Wege der Vernunft",
				"creators": [
					{
						"firstName": "Fynn Ole",
						"lastName": "Engler",
						"creatorType": "author"
					},
					{
						"firstName": "Jürgen",
						"lastName": "Renn",
						"creatorType": "author"
					}
				],
				"date": "2011-06-13T06:00:00+0200",
				"ISSN": "0174-4909",
				"abstractNote": "Wissenschaft hat eine Geschichte, wie kann sie dann aber rational sein? Im Briefwechsel zwischen Ludwik Fleck und Moritz Schlick deuteten sich bereits Antworten an.",
				"language": "de-DE",
				"libraryCatalog": "www.faz.net",
				"publicationTitle": "FAZ.NET",
				"shortTitle": "Wissenschaftsphilosophie",
				"url": "http://www.faz.net/1.654864",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					{
						"tag": "Ludwik Fleck"
					},
					{
						"tag": "Moritz"
					},
					{
						"tag": "Moritz Schlick"
					},
					{
						"tag": "Paul Feyerabend"
					},
					{
						"tag": "Schlick"
					},
					{
						"tag": "Springer-Verlag"
					},
					{
						"tag": "Thomas S. Kuhn"
					},
					{
						"tag": "Wissenschaft"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.faz.net/suche/?query=argentinien&suchbegriffImage.x=0&suchbegriffImage.y=0&resultsPerPage=20",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://www.faz.net/aktuell/sport/tango-taenzer-kaempfen-in-buenos-aires-um-den-weltmeister-titel-15155586.html",
		"items": [
			{
				"itemType": "videoRecording",
				"title": "Argentinien: Tango-Tänzer kämpfen in Buenos Aires um den Weltmeister-Titel",
				"creators": [],
				"date": "2017-08-17T11:56:48+0200",
				"abstractNote": "Mehr als 1200 Tänzer aus 48 Ländern tanzen in Argentinien um den Weltmeister-Titel. Das Finale ist am 22. August.",
				"language": "de-DE",
				"libraryCatalog": "www.faz.net",
				"runningTime": "58",
				"shortTitle": "Argentinien",
				"url": "http://www.faz.net/aktuell/sport/tango-taenzer-kaempfen-in-buenos-aires-um-den-weltmeister-titel-15155586.html",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					{
						"tag": "Argentinien"
					},
					{
						"tag": "Buenos Aires"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/
