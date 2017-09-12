{
	"translatorID": "fa7c37b1-fda4-418a-a8b8-2491929411ab",
	"label": "Polygon",
	"creator": "czar",
	"target": "^https?://(www\\.)?polygon\\.com",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2015-12-06 18:45:12"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2015 czar
	http://en.wikipedia.org/wiki/User_talk:Czar

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

function pageType(doc, url) { // pulls from <script> metadata set by Vox (Article, HubPage, Other)
	var temp = ZU.xpathText(doc, '//script[contains(text(), "page_type :")]');
	if (temp) {
		return temp.match(/page_type\s?:\s?"([^"]*)"/)[1];
	} else return null;
}

function detectWeb(doc, url) {
	switch (pageType(doc, url)) {
		case "Article":
			return "webpage";
		case "HubPage":
			return "multiple";
	}
	if (url.indexOf("/search?q=") != -1) {
		return "multiple"
	} else return null;
}

function scrape(doc, url) {
	var newItem = new Zotero.Item("webpage");
	newItem.websiteTitle = "Polygon";
	newItem.language = "en-US";

	newItem.url = url;
	newItem.title = ZU.xpathText(doc, '//h2[@class="m-entry__title"]');
	newItem.date = ZU.xpathText(doc, '//meta[@property="article:published_time"]/@content').split("T")[0];

	newItem.abstractNote = ZU.xpathText(doc, '//meta[@name="description"]/@content');
	newItem.attachments.push({
		document: doc,
		title: "Polygon snapshot",
		mimeType: "text/html"
	});

	// Authors
	var authorMetadata = ZU.xpathText(doc, '//script[contains(text(), "dataLayer =")]');
	if (authorMetadata) {
		authorMetadata = authorMetadata.match(/"Author"\s?:\s?"([^"]*)"/)[1].split(":");
		do {
			newItem.creators.push(ZU.cleanAuthor(authorMetadata[0], "author"));
			authorMetadata.shift();
		}
		while (authorMetadata.length);
	}

	newItem.complete();
}

function doWeb(doc, url) { // news & search pages supported, Feature support to come
	if (detectWeb(doc, url) == "multiple") {
		var items = {};
		articles = [];
		var titles = ZU.xpath(doc, '//*[contains(concat(" ", normalize-space(@class), " "), "m-block__meta")]/h2/a') //this is needed to catch the class attribute when among others, e.g., "m-block__meta meta" on search pages
		for (var i = 0; i < titles.length; i++) {
			items[titles[i].href] = titles[i].textContent;
		}
		Zotero.selectItems(items, function(items) {
			if (!items) {
				return true;
			}
			for (var i in items) {
				articles.push(i);
			}
			Zotero.Utilities.processDocuments(articles, scrape);
		})
	} else scrape(doc, url);
}
/** BEGIN TEST CASES **/
var testCases = [{
		"type": "web",
		"url": "http://www.polygon.com/2015/6/14/8779193/earthbound-mother-famicom-wii-u-virtual-console-nintendo",
		"items": [{
			"itemType": "webpage",
			"title": "Nintendo brings Mother to Virtual Console as Earthbound Beginnings — it's available today",
			"creators": [{
				"firstName": "Michael",
				"lastName": "McWhertor",
				"creatorType": "author"
			}, {
				"firstName": "Arthur",
				"lastName": "Gies",
				"creatorType": "author"
			}],
			"date": "2015-06-14",
			"abstractNote": "At this year's Nintendo World Championships, Nintendo announced that Wii U owners would be able to get their hands on an EarthBound Beginnings, a Virtual Console re-release of the original game in...",
			"language": "en-US",
			"url": "http://www.polygon.com/2015/6/14/8779193/earthbound-mother-famicom-wii-u-virtual-console-nintendo",
			"websiteTitle": "Polygon",
			"attachments": [{
				"title": "Polygon snapshot",
				"mimeType": "text/html"
			}],
			"tags": [],
			"notes": [],
			"seeAlso": []
		}]
	}, {
		"type": "web",
		"url": "http://www.polygon.com/2013/11/11/5090912/sega-genesis-retrospective-book-turns-to-kickstarter-for-funding",
		"items": [{
			"itemType": "webpage",
			"title": "Sega Genesis retrospective book turns to Kickstarter for funding",
			"creators": [{
				"firstName": "Griffin",
				"lastName": "McElroy",
				"creatorType": "author"
			}],
			"date": "2013-11-11",
			"abstractNote": "Sega Mega Drive/Genesis: Collected Works, a \"documentary art book\" chronicling the creation and full history of Sega's classic home console and its iconic software, has turned to Kickstarter to seek...",
			"language": "en-US",
			"url": "http://www.polygon.com/2013/11/11/5090912/sega-genesis-retrospective-book-turns-to-kickstarter-for-funding",
			"websiteTitle": "Polygon",
			"attachments": [{
				"title": "Polygon snapshot",
				"mimeType": "text/html"
			}],
			"tags": [],
			"notes": [],
			"seeAlso": []
		}]
	}, {
		"type": "web",
		"url": "http://www.polygon.com/news",
		"items": "multiple"
	}, {
		"type": "web",
		"url": "http://www.polygon.com/search?q=earthbound",
		"items": "multiple"
	}]
/** END TEST CASES **/
