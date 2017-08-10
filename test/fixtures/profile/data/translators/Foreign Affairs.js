{
	"translatorID": "4ab6d49c-d94e-4a9c-ae9a-3310c44ba612",
	"label": "Foreign Affairs",
	"creator": "Philipp Zumstein",
	"target": "^https?://www\\.foreignaffairs\\.com",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2017-06-07 17:30:06"
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
	if (url.indexOf('/articles/')>-1 || url.indexOf('/reviews/')>-1) {
		return "magazineArticle";
	} else if (getSearchResults(doc, true)) {
		return "multiple";
	}
}

function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = ZU.xpath(doc, '//article/div/a|//article/div/div/h2/a');
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

	translator.setHandler('itemDone', function (obj, item) {
		var issue = ZU.xpathText(doc, '//span[@class="article-header__metadata-date"]/a');
		if (!item.issue && issue) {
			item.issue = issue.replace('Issue', '');
		}
		item.ISSN = "0015-7120";
		item.language = "en-US";
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
		"url": "http://www.foreignaffairs.com/issues/2012/91/01",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://www.foreignaffairs.com/reviews/capsule-review/2003-05-01/history-argentina-twentieth-century",
		"items": [
			{
				"itemType": "magazineArticle",
				"title": "A History of Argentina in the Twentieth Century",
				"creators": [
					{
						"firstName": "Kenneth",
						"lastName": "Maxwell",
						"creatorType": "author"
					}
				],
				"date": "2009-01-28T19:05:53-05:00",
				"ISSN": "0015-7120",
				"abstractNote": "A fascinating and well-translated account of Argentina's misadventures over the last century by one of that country's brightest historians. Absorbing vast amounts of British capital and tens of thousands of European immigrants, Argentina began the century with great promise. In 1914, with half of its population still foreign, a dynamic society had emerged that was both open and mobile.",
				"issue": "May/June 2003",
				"language": "en-US",
				"libraryCatalog": "www.foreignaffairs.com",
				"publicationTitle": "Foreign Affairs",
				"url": "https://www.foreignaffairs.com/reviews/capsule-review/2003-05-01/history-argentina-twentieth-century",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					"Argentina"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.foreignaffairs.com/articles/middle-east/2012-01-01/time-attack-iran",
		"items": [
			{
				"itemType": "magazineArticle",
				"title": "Time to Attack Iran",
				"creators": [
					{
						"firstName": "Matthew",
						"lastName": "Kroenig",
						"creatorType": "author"
					}
				],
				"date": "2012/01/01",
				"ISSN": "0015-7120",
				"abstractNote": "Opponents of military action against Iran assume a U.S. strike would be far more dangerous than simply letting Tehran build a bomb. Not so, argues this former Pentagon defense planner. With a carefully designed attack, Washington could mitigate the costs and spare the region and the world from an unacceptable threat.",
				"issue": "January/February 2012",
				"language": "en-US",
				"libraryCatalog": "www.foreignaffairs.com",
				"publicationTitle": "Foreign Affairs",
				"url": "https://www.foreignaffairs.com/articles/middle-east/2012-01-01/time-attack-iran",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					"Arms Control & Disarmament",
					"Defense Policy",
					"Foreign Policy",
					"Iran",
					"Matthew Kroenig",
					"Middle East",
					"Military action",
					"Obama Administration",
					"Persian Gulf",
					"Security",
					"Strategy & Conflict",
					"U.S. Foreign Policy",
					"U.S.-Iran",
					"WMD & Proliferation",
					"War & Military Strategy"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.foreignaffairs.com/articles/united-states/2014-08-11/print-less-transfer-more",
		"items": [
			{
				"itemType": "magazineArticle",
				"title": "Print Less but Transfer More",
				"creators": [
					{
						"firstName": "Mark",
						"lastName": "Blyth",
						"creatorType": "author"
					},
					{
						"firstName": "Eric",
						"lastName": "Lonergan",
						"creatorType": "author"
					}
				],
				"date": "2014/08/11",
				"ISSN": "0015-7120",
				"abstractNote": "Most economists agree that the global economy is stagnating and that governments need to stimulate growth, but lowering interest rates still further could spur a damaging cycle of booms and busts. Instead, central banks should hand consumers cash directly.",
				"issue": "September/October 2014",
				"language": "en-US",
				"libraryCatalog": "www.foreignaffairs.com",
				"publicationTitle": "Foreign Affairs",
				"url": "https://www.foreignaffairs.com/articles/united-states/2014-08-11/print-less-transfer-more",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					"Asia",
					"Economic Development",
					"Europe",
					"United States"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.foreignaffairs.com/articles/india/2014-09-08/modi-misses-mark",
		"items": [
			{
				"itemType": "magazineArticle",
				"title": "Modi Misses the Mark",
				"creators": [
					{
						"firstName": "Derek",
						"lastName": "Scissors",
						"creatorType": "author"
					}
				],
				"date": "2014/09/08",
				"ISSN": "0015-7120",
				"abstractNote": "India needs fundamental change: its rural land rights system is a mess, its manufacturing sector has been strangled by labor market restrictions, and its states are poorly integrated. But, so far, Modi has squandered major opportunities to establish his economic vision.",
				"language": "en-US",
				"libraryCatalog": "www.foreignaffairs.com",
				"publicationTitle": "Foreign Affairs",
				"url": "https://www.foreignaffairs.com/articles/india/2014-09-08/modi-misses-mark",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					"Economics",
					"India"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/