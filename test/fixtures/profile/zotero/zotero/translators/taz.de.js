{
	"translatorID": "d84574f1-e4d6-4337-934f-bf9d01173bf0",
	"label": "taz.de",
	"creator": "Philipp Zumstein",
	"target": "^https?://(www\\.)?taz\\.de",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2017-07-10 16:55:04"
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


function detectWeb(doc, url) {
	if (ZU.xpathText(doc, '//meta[@property="og:type"]/@content')=="article" ){ 
		return "newspaperArticle";
	} else if (getSearchResults(doc, true)) {
		return "multiple";
	}
}


function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;

	var rows = ZU.xpath(doc, '//div[contains(@class, "first_page") or contains(@class, "searchresults")]//a[h3 or h4]');
	for (var i=0; i<rows.length; i++) {
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
	var translator = Zotero.loadTranslator('web');
	// Embedded Metadata
	translator.setTranslator('951c027d-74ac-47d4-a107-9c3069ab7b48');
	//translator.setDocument(doc);
	
	translator.setHandler('itemDone', function (obj, item) {
		item.publicationTitle = "Die Tageszeitung: taz";
		item.ISSN = "0931-9085";
		item.section = ZU.xpathText(doc, '//ul[contains(@class, "navbar")]/li[contains(@class, "selected")]');
		//sometimes taz puts itself as author
		for (var i=0; i<item.creators.length; i++) {
			if (item.creators[i].firstName && item.creators[i].lastName && item.creators[i].firstName == "taz die" && item.creators[i].lastName == "tageszeitung") {
				item.creators.splice(i, 1);
			}
		}
		
		item.pages = ZU.xpathText(doc, '//div[contains(@class, "print-page")]//ul[contains(@class, "right")]/li[contains(@class, "page")]');
		if (item.pages) {
			item.pages = item.pages.replace('S.', '');
		}
		item.complete();
	});

	translator.getTranslatorObject(function(trans) {
		trans.itemType = "newspaperArticle";
		trans.doWeb(doc, url);
	});
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.taz.de/!5124174/",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Kolumne Wortklauberei: Hängt sie höher!",
				"creators": [
					{
						"firstName": "Josef",
						"lastName": "Winkler",
						"creatorType": "author"
					}
				],
				"date": "2011-03-23T18:22:00+02:00",
				"ISSN": "0931-9085",
				"abstractNote": "Der deutsche Wald als Leistungsträger. Oder: zynisch Kranke auf freiem Fuß! Was ist mit der öffentlichen Sicherheit?",
				"libraryCatalog": "www.taz.de",
				"publicationTitle": "Die Tageszeitung: taz",
				"section": "Gesellschaft",
				"shortTitle": "Kolumne Wortklauberei",
				"url": "http://www.taz.de/!5124174/",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					"Gesellschaft",
					"Kolumnen",
					"Nachrichten",
					"News",
					"tageszeitung",
					"taz"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://taz.de/",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://www.taz.de/!s=bleibt/",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://www.taz.de/Archiv-Suche/!5421550&s=bleibt&SuchRahmen=Print/",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Briten machen dicht:Hering muss gesamteuropäisch bleiben",
				"creators": [],
				"date": "2017-06-28T00:00:00+01:00",
				"ISSN": "0931-9085",
				"abstractNote": "Das große linke Nachrichten-Portal der \"tageszeitung\" aus Berlin: Unabhängig dank mehr als 14.000 GenossInnen.",
				"libraryCatalog": "www.taz.de",
				"pages": "20",
				"publicationTitle": "Die Tageszeitung: taz",
				"section": "Archiv",
				"shortTitle": "Briten machen dicht",
				"url": "http://www.taz.de/!5421550/",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					"Archiv",
					"Nachrichten",
					"News",
					"tageszeitung",
					"taz"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/