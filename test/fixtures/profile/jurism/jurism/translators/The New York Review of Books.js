{
	"translatorID": "4c164cc8-be7b-4d02-bfbf-37a5622dfd56",
	"label": "The New York Review of Books",
	"creator": "Philipp Zumstein",
	"target": "^https?://www\\.nybooks\\.com/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2017-07-02 14:40:20"
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
	if (url.indexOf('/articles/')>-1) {
		return "magazineArticle";
	} else if (url.indexOf('/daily/')>-1)  {
		return "blogPost";
	} else if (getSearchResults(doc, true)) {
		return "multiple";
	}
}

function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = ZU.xpath(doc, '//h2/a|//h3/a');
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
	var type = (url.indexOf('/articles/')>-1) ? "magazineArticle" : "blogPost";
	var translator = Zotero.loadTranslator('web');
	// Embedded Metadata
	translator.setTranslator('951c027d-74ac-47d4-a107-9c3069ab7b48');
	//translator.setDocument(doc);
	
	translator.setHandler('itemDone', function (obj, item) {
		if (type=="magazineArticle") {
			item.ISSN = "0028-7504";
		}
		if (!item.date) {
			var date = ZU.xpathText(doc, '//article//time');
			if (date) {
				item.date = ZU.strToISO(date.replace('Issue', ''));
			}
		}
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
		"url": "http://www.nybooks.com/articles/2011/12/08/zuccotti-park-what-future/",
		"items": [
			{
				"itemType": "magazineArticle",
				"title": "Zuccotti Park: What Future?",
				"creators": [
					{
						"firstName": "Michael",
						"lastName": "Greenberg",
						"creatorType": "author"
					}
				],
				"date": "2011-12-08",
				"ISSN": "0028-7504",
				"abstractNote": "For weeks, organizers had demonstrated enormous skill in keeping the occupation going, steadily expanding while outfoxing Mayor Bloomberg in his attempts to evict them. But what end did it serve if their status as ethical defenders of the 99 percent was being damaged? It was, after all, their major asset. The complicated logistics of holding the park (and providing food, clothing, and warmth for a floating army of hundreds) was draining resources and forcing the most talented activists to narrow their focus to matters of mere physical survival.",
				"libraryCatalog": "www.nybooks.com",
				"publicationTitle": "The New York Review of Books",
				"shortTitle": "Zuccotti Park",
				"url": "http://www.nybooks.com/articles/2011/12/08/zuccotti-park-what-future/",
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
		"url": "http://www.nybooks.com/search/?s=labor+union",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://www.nybooks.com/daily/2011/11/16/americas-new-robber-barons/",
		"items": [
			{
				"itemType": "blogPost",
				"title": "America’s New Robber Barons",
				"creators": [
					{
						"firstName": "Jeff",
						"lastName": "Madrick",
						"creatorType": "author"
					}
				],
				"date": "2011-11-16",
				"abstractNote": "With early Tuesday’s abrupt evacuation of Zuccotti Park, the City of New York has managed—for the moment—to dislodge protesters from Wall Street.  But it will be much harder to turn attention away from the financial excesses of the very rich—the problems that have given Occupy Wall Street such traction. Data on who is in the top 1 percent of earners further reinforces their point.  Here's why.\n\nThough the situation is often described as a problem of inequality, this is not quite the real concern.  The issue is runaway incomes at the very top—people earning a million and a half dollars or more according to the most recent data. And much of that runaway income comes from financial investments, stock options, and other special financial benefits available to the exceptionally rich—much of which is taxed at very low capital gains rates. Meanwhile, there has been something closer to stagnation for almost everyone else—including even for many people in the top 20 percent of earners.",
				"blogTitle": "The New York Review of Books",
				"url": "http://www.nybooks.com/daily/2011/11/16/americas-new-robber-barons/",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					"Occupy Wall Street",
					"economics",
					"inequality"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.nybooks.com/issues/2012/03/22/",
		"items": "multiple"
	}
]
/** END TEST CASES **/