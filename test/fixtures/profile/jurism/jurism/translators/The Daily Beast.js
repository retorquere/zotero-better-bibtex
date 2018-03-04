{
	"translatorID": "3bdaeab1-2200-4e18-a68a-430d1cd50d21",
	"label": "The Daily Beast",
	"creator": "Philipp Zumstein",
	"target": "^https?://(.*)thedailybeast\\.com",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2017-06-30 06:10:12"
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
	var bodyId = ZU.xpathText(doc, '//body/@id');
	if (bodyId=="article") {
		return "newspaperArticle";
	} else if (getSearchResults(doc, true)) {
		return "multiple";
	}
}

function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = ZU.xpath(doc, '//li/article/header/h2/a');
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
		var date = ZU.xpathText(doc, '//meta[@name="publicationDate"]/@content');
		if (date) {
			item.date = date.replace(/(\d\d\d\d)(\d\d)(\d\d).*/, "$1-$2-$3");
		}
		for (var i=0; i<item.tags.length; i++) {
			if (item.tags[i]=="typeArticle") {
				item.tags.splice(i,1);
			}
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
		"url": "http://www.thedailybeast.com/mikheil-saakashvili-interview-us-stopped-russian-bombs-in-georgia",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Mikheil Saakashvili Interview: U.S. Stopped Russian Bombs in Georgia",
				"creators": [
					{
						"firstName": "Eli",
						"lastName": "Lake",
						"creatorType": "author"
					}
				],
				"date": "2011-09-26",
				"abstractNote": "In an exclusive interview, Georgia’s president credits Clinton and the Obama team with quelling bombings.",
				"libraryCatalog": "www.thedailybeast.com",
				"publicationTitle": "The Daily Beast",
				"shortTitle": "Mikheil Saakashvili Interview",
				"url": "http://www.thedailybeast.com/articles/2011/09/26/mikheil-saakashvili-interview-hillary-clinton-saved-georgia",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					"Georgia",
					"Mikheil Saakashvili",
					"Russia"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.thedailybeast.com/gops-2012-presidential-primaries-purity-test",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "GOP’s 2012 Presidential Primaries Purity Test",
				"creators": [
					{
						"firstName": "Howard",
						"lastName": "Kurtz",
						"creatorType": "author"
					}
				],
				"date": "2011-09-26",
				"abstractNote": "The party now punishes any deviation from conservative orthodoxy in the presidential primaries.",
				"libraryCatalog": "www.thedailybeast.com",
				"publicationTitle": "The Daily Beast",
				"url": "http://www.thedailybeast.com/articles/2011/09/26/gop-s-2012-presidential-primaries-purity-test",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					"George W. Bush",
					"Republican Party",
					"Rick Perry"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.thedailybeast.com/search.html?q=egypt",
		"defer": true,
		"items": "multiple"
	}
]
/** END TEST CASES **/