{
	"translatorID": "c9338ed5-b512-4967-8ffe-ab9c973559ef",
	"label": "The Hamilton Spectator",
	"creator": "Philipp Zumstein",
	"target": "^https?://www\\.thespec\\.com",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2017-07-10 15:23:44"
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
	if (url.indexOf("/search/") != -1 && getSearchResults(doc, true)) {
		return "multiple";
	} else if (ZU.xpathText(doc, '//meta[@property="og:type"]/@content')) {
		return "newspaperArticle";
	}
}


function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = ZU.xpath(doc, '//a[h2]');
	for (var i=0; i<rows.length; i++) {
		var href = rows[i].href;
		var title = ZU.xpathText(rows[i], './h2');
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
		item.publicationTitle = "The Hamilton Spectator";
		item.ISSN = "1189-9417";
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
		"url": "https://www.thespec.com/news-story/2223303-expert-calls-occupy-demos-most-important-in-generations/",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Expert calls Occupy demos most important in generations",
				"creators": [],
				"date": "2011-11-16T21:54:00Z",
				"ISSN": "1189-9417",
				"abstractNote": "The Occupy protest is the most important democratic social movement of the last two generations and demonstrators who have taken over parks and other public spaces should be left alone, says an expert...",
				"libraryCatalog": "www.thespec.com",
				"publicationTitle": "The Hamilton Spectator",
				"section": "News-Ontario",
				"url": "https://www.thespec.com/news-story/2223303-expert-calls-occupy-demos-most-important-in-generations/",
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