{
	"translatorID": "0fba73bf-f113-4d36-810f-2c654fa985fb",
	"label": "The New Yorker",
	"creator": "Philipp Zumstein",
	"target": "^https?://www\\.newyorker\\.com/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2017-11-12 22:00:35"
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
	var bodyClass = ZU.xpathText(doc, '//body/@class');
	if (bodyClass && bodyClass.indexOf('article')>-1) {
		return "magazineArticle";
	} else if (url.indexOf('/search/')>-1 && getSearchResults(doc, true)) {
		return "multiple";
	}
}

function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = ZU.xpath(doc, '//li//a[h4]');
	for (var i=0; i<rows.length; i++) {
		var href = rows[i].href;
		var title = ZU.trimInternal(rows[i].textContent);
		if (!href || !title) continue;
		if (checkOnly) return true;
		found = true;
		items[href] = title;
	}
	Z.debug(items);
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
	var data = ZU.xpathText(doc, '//script[@type="application/ld+json"]');
	var json = JSON.parse(data);
	//Z.debug(json);
	var translator = Zotero.loadTranslator('web');
	// Embedded Metadata
	translator.setTranslator('951c027d-74ac-47d4-a107-9c3069ab7b48');
	//translator.setDocument(doc);
	
	translator.setHandler('itemDone', function (obj, item) {
		if (item.creators.length==0 && json.author) {
			//json.author can either be an array, or a object containing an array
			if (Array.isArray(json.author)) {
				for (var i=0; i<json.author.length; i++) {
					item.creators.push(ZU.cleanAuthor(json.author[i].name, "author"));
				}
			} else if (json.author.name) {
				for (var i=0; i<json.author.name.length; i++) {
					item.creators.push(ZU.cleanAuthor(json.author.name[i], "author"));
				}
			}
		}
		item.date = json.datePublished;
		item.section = json.articleSection;
		item.ISSN = "0028-792X";
		item.complete();
	});

	translator.getTranslatorObject(function(trans) {
		trans.itemType = "magazineArticle";
		trans.doWeb(doc, url);
	});
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://www.newyorker.com/magazine/2011/10/31/foreign-campaigns",
		"items": [
			{
				"itemType": "magazineArticle",
				"title": "Foreign Campaigns",
				"creators": [
					{
						"firstName": "David",
						"lastName": "Remnick",
						"creatorType": "author"
					}
				],
				"date": "2011-10-20T04:00:00.000Z",
				"ISSN": "0028-792X",
				"abstractNote": "The Republican professionals know it. The numbers show that more than half the country identifies the economy as the most pressing issue of the campaign; …",
				"libraryCatalog": "www.newyorker.com",
				"publicationTitle": "The New Yorker",
				"url": "https://www.newyorker.com/magazine/2011/10/31/foreign-campaigns",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					"2012 election",
					"arab league",
					"arab spring",
					"barack obama",
					"death",
					"dictators"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.newyorker.com/news/hendrik-hertzberg/is-that-rick-santorum-on-the-cafeteria-line",
		"items": [
			{
				"itemType": "magazineArticle",
				"title": "Is That Rick Santorum on the Cafeteria Line?",
				"creators": [
					{
						"firstName": "Hendrik",
						"lastName": "Hertzberg",
						"creatorType": "author"
					}
				],
				"date": "2012-02-24T23:12:35.000Z",
				"ISSN": "0028-792X",
				"abstractNote": "I’m a week late with this, but Chris Matthews had a pretty devastating take on Santorum’s “phony theology” attack on Obama’s concern about what …",
				"libraryCatalog": "www.newyorker.com",
				"publicationTitle": "The New Yorker",
				"url": "https://www.newyorker.com/news/hendrik-hertzberg/is-that-rick-santorum-on-the-cafeteria-line",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					"catholics",
					"rick santorum"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.newyorker.com/search/q/labor",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://www.newyorker.com/magazine/2017/06/19/remembering-the-murder-you-didnt-commit",
		"items": [
			{
				"itemType": "magazineArticle",
				"title": "Remembering the Murder You Didn’t Commit",
				"creators": [
					{
						"firstName": "Rachel",
						"lastName": "Aviv",
						"creatorType": "author"
					}
				],
				"date": "2017-06-12T04:00:00Z",
				"ISSN": "0028-792X",
				"abstractNote": "DNA evidence exonerated six convicted killers. So why do some of them recall the crime so clearly?",
				"libraryCatalog": "www.newyorker.com",
				"publicationTitle": "The New Yorker",
				"url": "https://www.newyorker.com/magazine/2017/06/19/remembering-the-murder-you-didnt-commit",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					"Crime",
					"FalseMemories",
					"Memory",
					"Murder",
					"Nebraska",
					"Psychology"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/
