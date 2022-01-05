{
	"translatorID": "36e34937-2ec3-418b-8199-2c8cc3488875",
	"label": "Huff Post",
	"creator": "Philipp Zumstein",
	"target": "^https?://www\\.huffingtonpost\\.com",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2016-10-31 21:35:41"
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
	var type = ZU.xpathText(doc, '//meta[@property="og:type"]/@content');
	if (type=="article") {
		return "newspaperArticle";
	} else if (type=="blog") {
		return "blogPost";
	} else if (getSearchResults(doc, true)) {
		return "multiple";
	}
}

function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = ZU.xpath(doc, '//h2[contains(@class, "card__headline")]/a[contains(@class, "card__link") and contains(@href, "/entry/")]');
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
	var json = ZU.xpathText(doc, '//script[@type="application/ld+json"]');
	var object = JSON.parse(json);
	//Z.debug(object);
	var itemType = detectWeb(doc, url);
	var item = new Zotero.Item(itemType);
	item.title = object.headline;
	item.date = object.datePublished;
	if (object.author) {
		if (!Array.isArray(object.author)) {
			object.author = [object.author];
		}
		for (var i=0; i<object.author.length; i++) {
			if (object.author[i].name) {
				item.creators.push(ZU.cleanAuthor(object.author[i].name, "author"));
			}
		}
	}
	item.section = object.articleSection;
	item.publicationTitle = "Huffington Post";
	item.abstractNote = object.description;
	item.language = object.inLanguage;
	item.url = object.mainEntityOfPage["@id"];
	item.attachments.push({
		title:"Snapshot",
		document:doc
	});
	item.complete();
}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.huffingtonpost.com/business/",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://www.huffingtonpost.com/dan-solin/their-confidence-is-killi_b_1112953.html?ref=business",
		"items": [
			{
				"itemType": "blogPost",
				"title": "Their Confidence Is Killing Your Returns",
				"creators": [
					{
						"firstName": "Dan",
						"lastName": "Solin",
						"creatorType": "author"
					}
				],
				"date": "2011-11-30T00:53:25Z",
				"abstractNote": "What do these well known financial celebrities have in common:  Jim Cramer, Larry Kudlow, Jeff Macke, Joe Kernan and Dylan Ratigan?\r\n\r\nThey are all extre...",
				"blogTitle": "Huffington Post",
				"language": "en_US",
				"url": "http://www.huffingtonpost.com/dan-solin/their-confidence-is-killi_b_1112953.html",
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
		"url": "http://www.huffingtonpost.com/2011/11/28/prepaid-cards_n_1117226.html?ref=business",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Fee-Dependent Prepaid Card Maker Moves Into Banking",
				"creators": [
					{
						"firstName": "Catherine",
						"lastName": "New",
						"creatorType": "author"
					}
				],
				"date": "2011-11-29T21:53:11Z",
				"abstractNote": "In the latest signal that the economic crisis has fundamentally changed the way Americans handle their money, the largest provider of prepaid debit cards...",
				"language": "en_US",
				"libraryCatalog": "Huff Post",
				"publicationTitle": "Huffington Post",
				"section": "Business",
				"url": "http://www.huffingtonpost.com/2011/11/28/prepaid-cards_n_1117226.html",
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
		"url": "http://www.huffingtonpost.com/search?keywords=labor+market&sortBy=recency&sortOrder=desc",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://www.huffingtonpost.com/entry/james-comey-administration-response_us_581787aae4b0990edc32ba17?section=us_politics",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "White House Won't Defend James Comey: 'He's In A Tough Spot'",
				"creators": [
					{
						"firstName": "Ryan",
						"lastName": "Grim",
						"creatorType": "author"
					},
					{
						"firstName": "Sam",
						"lastName": "Stein",
						"creatorType": "author"
					}
				],
				"date": "2016-10-31T18:48:44Z",
				"abstractNote": "But they imply that he created a mess.",
				"language": "en_US",
				"libraryCatalog": "Huff Post",
				"publicationTitle": "Huffington Post",
				"section": "Politics",
				"shortTitle": "White House Won't Defend James Comey",
				"url": "http://www.huffingtonpost.com/entry/james-comey-administration-response_us_581787aae4b0990edc32ba17",
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