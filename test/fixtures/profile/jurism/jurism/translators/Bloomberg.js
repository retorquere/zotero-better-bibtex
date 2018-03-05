{
	"translatorID": "a509f675-cf80-4b70-8cbc-2ea8664dd38f",
	"label": "Bloomberg",
	"creator": "Philipp Zumstein",
	"target": "^https?://(www)?\\.bloomberg\\.com",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2016-09-08 20:56:54"
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
	if (url.indexOf('/articles/')>-1 || ZU.xpathText(doc, '//meta[@property="og:type"]/@content')=="article") {
		return "newspaperArticle";
	} else if (url.indexOf('/videos/')>-1) {
		return "tvBroadcast";
	} else if (getSearchResults(doc, true)) {
		return "multiple";
	}
}

function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = ZU.xpath(doc, '//a[@data-resource-id or @data-tracker-label="headline"]');
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
	var type = detectWeb(doc, url);
	// Embedded Metadata
	translator.setTranslator('951c027d-74ac-47d4-a107-9c3069ab7b48');
	translator.setHandler('itemDone', function (obj, item) {
		//add date from microdata if not in header	
			if (!item.date) item.date = ZU.xpathText(doc, '//main//time[@itemprop="datePublished"]/@datetime');
			item.complete();
	});
	translator.getTranslatorObject(function(trans) {
		trans.itemType = type;
		trans.doWeb(doc, url);
	});
}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.bloomberg.com/search?query=argentina",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://www.bloomberg.com/news/articles/2012-01-04/bank-earnings-increase-57-in-analyst-forecasts-which-proved-wrong-in-2011",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Bank Earnings Jump 57% in Analyst Forecasts Proved Wrong in 2011",
				"creators": [
					{
						"firstName": "Michael J.",
						"lastName": "Moore",
						"creatorType": "author"
					},
					{
						"firstName": "Dawn",
						"lastName": "Kopecki",
						"creatorType": "author"
					}
				],
				"date": "2012-01-04T00:00:00.001Z",
				"abstractNote": "Analysts’ failure to foresee declining earnings per share for the biggest U.S. banks last year hasn’t stopped them from predicting an even bigger profit surge for 2012.",
				"libraryCatalog": "www.bloomberg.com",
				"publicationTitle": "Bloomberg.com",
				"url": "http://www.bloomberg.com/news/articles/2012-01-04/bank-earnings-increase-57-in-analyst-forecasts-which-proved-wrong-in-2011",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					"Bank of America Corp",
					"Earnings",
					"Goldman Sachs Group Inc/The",
					"JPMorgan Chase & Co",
					"Markets",
					"Morgan Stanley",
					"New York"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.bloomberg.com/view/articles/2012-01-05/four-economists-come-together-to-say-we-agree-business-class",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Four Economists Come Together to Say ‘We Agree’: Business Class",
				"creators": [],
				"date": "2012-01-05T00:01:34.000Z",
				"abstractNote": "Jan. 5 (Bloomberg) -- “If you laid all the economists in",
				"libraryCatalog": "www.bloomberg.com",
				"publicationTitle": "Bloomberg.com",
				"shortTitle": "Four Economists Come Together to Say ‘We Agree’",
				"url": "https://www.bloomberg.com/view/articles/2012-01-05/four-economists-come-together-to-say-we-agree-business-class",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					"world"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.bloomberg.com/news/videos/2016-09-08/how-to-capitalize-on-the-rotation-in-u-s-stocks",
		"items": [
			{
				"itemType": "tvBroadcast",
				"title": "How to Capitalize on the Rotation in U.S. Stocks",
				"creators": [],
				"abstractNote": "Tobias Levkovich, Citigroup's chief U.S. equity strategist, discusses the investment opportunities in U.S. stocks with Bloomberg's Vonnie Quinn and David Gura on \"Bloomberg Markets.\" (Source: Bloomberg)",
				"libraryCatalog": "www.bloomberg.com",
				"programTitle": "Bloomberg.com",
				"url": "https://www.bloomberg.com/news/videos/2016-09-08/how-to-capitalize-on-the-rotation-in-u-s-stocks",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					"Markets",
					"Money",
					"Stocks"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.bloomberg.com/businessweek",
		"items": "multiple"
	}
]
/** END TEST CASES **/