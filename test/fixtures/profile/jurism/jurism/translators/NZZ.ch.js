{
	"translatorID": "61ffe600-55e0-11df-bed9-0002a5d5c51b",
	"label": "NZZ.ch",
	"creator": "Philipp Zumstein",
	"target": "^https?://(www\\.)?nzz\\.ch/",
	"minVersion": "2.1.9",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2016-12-28 20:01:06"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2016 Philipp Zumstein

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
	var type = doc.getElementsByTagName('body')[0];
	if (type.classList.contains('page--article')) {
		return "newspaperArticle";
	}
	if (getSearchResults(doc, true)) {
		return "multiple";
	}
}


function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = ZU.xpath(doc, '//article/a|//div[contains(@class, "teaser")]/a');
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
			var articles = new Array();
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
	translator.setDocument(doc);
	
	translator.setHandler('itemDone', function (obj, item) {
		
		// Problem: also the place will be taken as part of the autor name
		// e.g. <meta name="author" content="Matthias Müller, Peking">
		// e.g. <meta name="author" content="Marco Metzler und Birgit Voigt" />
		var authorString = ZU.xpathText(doc, '//meta[@name="author"]/@content');
		if (authorString) {
			item.creators = [];
			var authors = authorString.split("und");
			for (var i=0; i<authors.length; i++) {
				if (i == authors.length-1) {
					authors[i] = authors[i].split(",")[0];
				}
				item.creators.push( ZU.cleanAuthor(authors[i] , "author") );
			}
		}
		
		item.ISSN = "0376-6829";
		item.language = "de-CH";
		item.libraryCatalog = "NZZ";
		
		item.section = ZU.xpathText(doc, '//meta[@itemprop="articleSection"]/@content');
		if (item.section == "NZZ am Sonntag") {
			item.publicationTitle = "NZZ am Sonntag";
			item.ISSN = "1660-0851";
			item.section = "";
		}
		if (!item.section || item.section == "") {
			item.section = ZU.xpathText(doc, '//li[@class="mainmenu__item"]/a[contains(@class, "mainmenu__link--active")]');
		}
		
		item.complete();
	});
	
	translator.getTranslatorObject(function(trans) {
		trans.itemType = "newspaperArticle";
		trans.addCustomFields({
			'date': 'date'
		});
		trans.doWeb(doc, url);
	});
}
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.nzz.ch/kuoni-gta-uebernahme-1.13276960",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Deutliches Umsatzplus in den ersten neun Monaten: Kuoni profitiert von der GTA-Übernahme",
				"creators": [],
				"date": "2011-11-10 07:55:41",
				"ISSN": "0376-6829",
				"abstractNote": "Der Reisekonzern Kuoni hat in den ersten neun Monaten von der Übernahme des Reisekonzerns Gullivers Travel Associates (GTA) profitiert.",
				"language": "de-CH",
				"libraryCatalog": "NZZ",
				"publicationTitle": "Neue Zürcher Zeitung",
				"section": "Wirtschaft",
				"shortTitle": "Deutliches Umsatzplus in den ersten neun Monaten",
				"url": "http://www.nzz.ch/kuoni-gta-uebernahme-1.13276960",
				"attachments": [
					{
						"title": "Snapshot"
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
		"url": "http://www.nzz.ch/wie-ein-mexikanisches-staedtchen-die-boesewichte-vertrieb-1.17091747",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Landsgemeinde als Mittel gegen das organisierte Verbrechen und korrupte Behörden: Wie ein mexikanisches Städtchen die Bösewichte vertrieb",
				"creators": [
					{
						"firstName": "Matthias",
						"lastName": "Knecht",
						"creatorType": "author"
					}
				],
				"date": "2012-05-30 11:00:00",
				"ISSN": "0376-6829",
				"abstractNote": "Mit einem Aufstand haben die Einwohner der mexikanischen Gemeinde Cherán die Holzfällermafia vertrieben.",
				"language": "de-CH",
				"libraryCatalog": "NZZ",
				"publicationTitle": "Neue Zürcher Zeitung",
				"shortTitle": "Landsgemeinde als Mittel gegen das organisierte Verbrechen und korrupte Behörden",
				"url": "http://www.nzz.ch/wie-ein-mexikanisches-staedtchen-die-boesewichte-vertrieb-1.17091747",
				"attachments": [
					{
						"title": "Snapshot"
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
		"url": "http://www.nzz.ch/search?form%5Bq%5D=arbeitsmarkt",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://www.nzz.ch/nzzas/nzz-am-sonntag/bildung-der-weg-ans-gymnasium-wird-steiniger-ld.85602?reduced=true",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Bildung: Der Weg ans Gymnasium wird steiniger",
				"creators": [
					{
						"firstName": "René",
						"lastName": "Donzé",
						"creatorType": "author"
					}
				],
				"date": "2016-05-31T07:45:25.872Z",
				"ISSN": "1660-0851",
				"abstractNote": "Im Kanton Zürich werden pro Jahr bis zu 400 Schüler weniger den Sprung ans Langgymnasium schaffen Aus Spargründen sollen künftig",
				"language": "de-CH",
				"libraryCatalog": "NZZ",
				"publicationTitle": "NZZ am Sonntag",
				"shortTitle": "Bildung",
				"url": "http://www.nzz.ch/nzzas/nzz-am-sonntag/bildung-der-weg-ans-gymnasium-wird-steiniger-ld.85602",
				"attachments": [
					{
						"title": "Snapshot"
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
		"url": "http://www.nzz.ch/nzzas/nzz-am-sonntag/manipulation-mit-risiken-wir-haben-zu-viel-desinformation-ld.85314",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Manipulation mit Risiken: «Wir haben zu viel Desinformation»",
				"creators": [
					{
						"firstName": "Marco",
						"lastName": "Metzler",
						"creatorType": "author"
					},
					{
						"firstName": "Birgit",
						"lastName": "Voigt",
						"creatorType": "author"
					}
				],
				"date": "2016-05-28T23:00:00.000Z",
				"ISSN": "1660-0851",
				"abstractNote": "Im Gesundheitswesen wird heftig über den Sinn von teuren Tests zur Krebs-Früherkennung gestritten.",
				"language": "de-CH",
				"libraryCatalog": "NZZ",
				"publicationTitle": "NZZ am Sonntag",
				"shortTitle": "Manipulation mit Risiken",
				"url": "http://www.nzz.ch/nzzas/nzz-am-sonntag/manipulation-mit-risiken-wir-haben-zu-viel-desinformation-ld.85314",
				"attachments": [
					{
						"title": "Snapshot"
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