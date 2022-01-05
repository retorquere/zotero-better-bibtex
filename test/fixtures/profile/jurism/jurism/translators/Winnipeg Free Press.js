{
	"translatorID": "1d82cbdf-703d-4f96-9ae2-246af21bb96e",
	"label": "Winnipeg Free Press",
	"creator": "Philipp Zumstein",
	"target": "^https?://www\\.winnipegfreepress\\.com",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2017-06-17 17:27:13"
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
	if (url.includes('.html')) {
		return "newspaperArticle";
	} else if (getSearchResults(doc, true)) {
		return "multiple";
	}
}


function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = ZU.xpath(doc, '//ul[contains(@class, "search-results")]/li/h2/a');
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
		//the creators need some special treatment
		var authors = ZU.xpathText(doc, '//meta[@property="og:article:author"]/@content');
		if (authors) {
			authors = authors.replace(', The Associated Press', '');
			item.creators = [];
			var authorsList = authors.split('And');
			for (var i=0; i<authorsList.length; i++) {
				item.creators.push(ZU.cleanAuthor(authorsList[i], "author"));
			}
			
		}
		item.publicationTitle = "Winnipeg Free Press";
		item.complete();
	});

	translator.getTranslatorObject(function(trans) {
		trans.itemType = "newspaperArticle";
		trans.addCustomFields({
			'publish-date': 'date',
			'cXenseParse:recs:custom2': 'section'
		});
		trans.doWeb(doc, url);
	});
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.winnipegfreepress.com/local/driven-to-great-heights-427718613.html",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Driven to great heights",
				"creators": [
					{
						"firstName": "Christian",
						"lastName": "Cassidy",
						"creatorType": "author"
					}
				],
				"date": "2017-06-11 03:00:00 CDT",
				"abstractNote": "Like most North American cities, Winnipeg faced a downtown parking crisis in the decade following the Second World War. It caused architects and developers to look upward for solutions.",
				"libraryCatalog": "www.winnipegfreepress.com",
				"publicationTitle": "Winnipeg Free Press",
				"section": "Local",
				"url": "http://www.winnipegfreepress.com/local/driven-to-great-heights-427718613.html",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					"Christian Cassidy",
					"latest news",
					"local",
					"news"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.winnipegfreepress.com/arts-and-life/entertainment/TV/cosby-tweets-thanks-defence-demands-mistrial-over-impasse-428918963.html",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Judge in Cosby sex assault case declares mistrial as jury deadlocks again",
				"creators": [
					{
						"firstName": "Maryclaire",
						"lastName": "Dale",
						"creatorType": "author"
					},
					{
						"firstName": "Michael R.",
						"lastName": "Sisak",
						"creatorType": "author"
					}
				],
				"date": "2017-06-17 11:49:01 CDT",
				"abstractNote": "NORRISTOWN, Pa. - Bill Cosby's trial on sexual assault charges ended in a mistrial Saturday after jurors failed to reach a unanimous decision in a case that nevertheless helped destroy the 79-year-old comedian's image as \"America's Dad.\"Prosecutors vowed to try again, declaring the woman who accuses Cosby of drugging and molesting her at his Philadelphia-area home in 2004 is \"entitled to a verdict.",
				"libraryCatalog": "www.winnipegfreepress.com",
				"publicationTitle": "Winnipeg Free Press",
				"section": "TV",
				"url": "http://www.winnipegfreepress.com/arts-and-life/entertainment/TV/cosby-tweets-thanks-defence-demands-mistrial-over-impasse-428918963.html",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					"Maryclaire Dale And Michael R. Sisak",
					"The Associated Press",
					"arts & entertainment",
					"arts & life",
					"canada",
					"latest news",
					"news",
					"tv",
					"world"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.winnipegfreepress.com/search/?keywords=chocolate&searchSubmitted=y&sortBy=-startDate",
		"items": "multiple"
	}
];
/** END TEST CASES **/
