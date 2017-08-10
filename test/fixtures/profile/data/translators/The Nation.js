{
	"translatorID": "0d6f8450-72e8-4d8f-bdc2-b7fa03e6f2c5",
	"label": "The Nation",
	"creator": "Philipp Zumstein",
	"target": "^https?://www\\.thenation\\.com/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2017-07-01 20:37:00"
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
	if (url.indexOf('/article/')>-1) {
		return "magazineArticle";
	} else if (url.indexOf('/?ssearch=')>-1 && getSearchResults(doc, true)) {
		return "multiple";
	}
}


function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = ZU.xpath(doc, '//h3/a');
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
		item.ISSN = "0027-8378";
		//fix authors
		var authorString = ZU.xpathText(doc, '//meta[@name="sailthru.author"]/@content');
		if (authorString) {
			var authors = authorString.split(',');
			item.creators = [];
			for (var i=0; i<authors.length; i++) {
				item.creators.push(ZU.cleanAuthor(authors[i], "author"));
			}
		}
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
		"url": "https://www.thenation.com/article/who-will-be-un-bloomberg-what-mayors-should-say-about-wall-street/",
		"items": [
			{
				"itemType": "magazineArticle",
				"title": "Who Will Be the Un-Bloomberg? What Mayors Should Say About Wall Street",
				"creators": [
					{
						"firstName": "Tom",
						"lastName": "Hayden",
						"creatorType": "author"
					}
				],
				"date": "2011-11-16T23:16:53-04:00",
				"ISSN": "0027-8378",
				"abstractNote": "If big-city mayors like Mike Bloomberg can get on the phone to talk about the alleged problems of Occupy protesters, why can’t they get together to re-regulate and reform Wall Street?",
				"libraryCatalog": "www.thenation.com",
				"publicationTitle": "The Nation",
				"shortTitle": "Who Will Be the Un-Bloomberg?",
				"url": "https://www.thenation.com/article/who-will-be-un-bloomberg-what-mayors-should-say-about-wall-street/",
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
		"url": "https://www.thenation.com/?ssearch=labour+union",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://www.thenation.com/article/these-photos-show-the-people-who-turn-a-cotton-plant-into-your-jeans/",
		"items": [
			{
				"itemType": "magazineArticle",
				"title": "These Photos Show the People Who Turn a Cotton Plant Into Your Jeans",
				"creators": [
					{
						"firstName": "Meta",
						"lastName": "Krese",
						"creatorType": "author"
					},
					{
						"firstName": "Jošt",
						"lastName": "Franko",
						"creatorType": "author"
					}
				],
				"date": "2016-12-12T10:00:44-04:00",
				"ISSN": "0027-8378",
				"abstractNote": "Following the path of cotton from Burkina Faso to Bangladesh to your local mall.",
				"libraryCatalog": "www.thenation.com",
				"publicationTitle": "The Nation",
				"url": "https://www.thenation.com/article/these-photos-show-the-people-who-turn-a-cotton-plant-into-your-jeans/",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					"Child labor",
					"Dhaka factory fire",
					"Low-wage workers"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/