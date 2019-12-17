{
	"translatorID": "d1bf1c29-4432-4ada-8893-2e29fc88fd9e",
	"label": "washingtonpost.com",
	"creator": "Philipp Zumstein",
	"target": "^https?://www\\.washingtonpost\\.com/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2019-05-16 16:24:39"
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
	if (ZU.xpathText(doc, '//div[@id="topper-headline-wrapper"]//h1')) {
		if (url.includes('/blogs/')) {
			return "blogPost";
		}
		else {
			return "newspaperArticle";
		}
	}
	if (url.includes('/archive/') || url.includes('/wp-dyn/content/')) {
		return "newspaperArticle";
	}
	if (getSearchResults(doc, true)) {
		return "multiple";
	}
	return false;
}


function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = ZU.xpath(doc, '//div[contains(@class, "pb-feed-headline")]//a[not(contains(@href, "/video/"))]');
	for (var i = 0; i < rows.length; i++) {
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
			return true;
		});
	}
	else {
		scrape(doc, url);
	}
}

function scrape(doc, url) {
	var type = url.includes('/blogs/') ? 'blogPost' : 'newspaperArticle';
	var translator = Zotero.loadTranslator('web');
	// Embedded Metadata
	translator.setTranslator('951c027d-74ac-47d4-a107-9c3069ab7b48');
	// translator.setDocument(doc);
	
	translator.setHandler('itemDone', function (obj, item) {
		item.itemType = type;
		
		// in the metadata there are only some facebook urls for the authors
		item.creators = [];
		var authors = doc.querySelectorAll('div.author-wrapper');
		for (var i = 0; i < authors.length; i++) {
			item.creators.push(ZU.cleanAuthor(authors[i].getAttribute('data-authorname'), "author"));
		}
		if (url.includes('/wp-dyn/content/')) {
			authors = ZU.xpathText(doc, '//div[@id="byline"]');
			if (authors) {
				item.creators.push(ZU.cleanAuthor(authors.replace(/^By /, ''), "author"));
			}
		}
		item.date = ZU.xpathText(doc, '//span[@itemprop="datePublished"]/@content') || ZU.xpathText(doc, '//meta[@name="DC.date.issued"]/@content');

		// the automatic added tags here are usually not really helpful
		item.tags = [];
		item.language = "en-US";
		if (type == 'newspaperArticle') {
			item.ISSN = "0190-8286";
		}
		item.section = ZU.xpathText(doc, '(//div[contains(@class, "headline-kicker")])[1]');
		
		item.complete();
	});

	translator.getTranslatorObject(function (trans) {
		trans.doWeb(doc, url);
	});
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.washingtonpost.com/wp-dyn/content/article/2008/11/07/AR2008110703296.html",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Split Over Russia Grows in Europe",
				"creators": [
					{
						"firstName": "Craig",
						"lastName": "Whitlock",
						"creatorType": "author"
					}
				],
				"date": "2008-11-08",
				"ISSN": "0190-8286",
				"abstractNote": "BERLIN, Nov. 7 -- Russia sent President-elect Barack Obama a message this week when it threatened to \"neutralize\" the proposed U.S. missile defense shield in Eastern Europe. But analysts said the tough talk from Moscow had another aim as well: to exploit a festering divide within Europe.",
				"language": "en-US",
				"libraryCatalog": "www.washingtonpost.com",
				"url": "http://www.washingtonpost.com/wp-dyn/content/article/2008/11/07/AR2008110703296.html",
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
		"url": "https://www.washingtonpost.com/world/national-security/aulaqi-killing-reignites-debate-on-limits-of-executive-power/2011/09/30/gIQAx1bUAL_story.html?hpid=z1",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Secret U.S. memo sanctioned killing of Aulaqi",
				"creators": [
					{
						"firstName": "Peter",
						"lastName": "Finn",
						"creatorType": "author"
					}
				],
				"date": "2011-09-30T08:06-500",
				"ISSN": "0190-8286",
				"abstractNote": "The Obama administration has refused to reveal the details of its legal rationale for targeting radical cleric Anwar al-Aulaqi.",
				"language": "en-US",
				"libraryCatalog": "www.washingtonpost.com",
				"publicationTitle": "Washington Post",
				"section": "National Security",
				"url": "https://www.washingtonpost.com/world/national-security/aulaqi-killing-reignites-debate-on-limits-of-executive-power/2011/09/30/gIQAx1bUAL_story.html",
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
		"url": "https://www.washingtonpost.com/blogs/ezra-klein/post/jack-abramoffs-guide-to-buying-congressmen/2011/08/25/gIQAoXKLvM_blog.html",
		"items": [
			{
				"itemType": "blogPost",
				"title": "Jack Abramoff’s guide to buying congressmen",
				"creators": [
					{
						"firstName": "Ezra",
						"lastName": "Klein",
						"creatorType": "author"
					}
				],
				"date": "2011-11-07T09:49-500",
				"abstractNote": "It’s easy if you know what to do.",
				"blogTitle": "Washington Post",
				"language": "en-US",
				"url": "https://www.washingtonpost.com/blogs/ezra-klein/post/jack-abramoffs-guide-to-buying-congressmen/2011/08/25/gIQAoXKLvM_blog.html",
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
		"url": "https://www.washingtonpost.com/archive/entertainment/books/1991/04/07/bombs-in-the-cause-of-brotherhood/fe590e29-8052-4086-b9a9-6fcabdbae4ba/",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "BOMBS IN THE CAUSE OF BROTHERHOOD",
				"creators": [
					{
						"firstName": "Claudio",
						"lastName": "Segre",
						"creatorType": "author"
					}
				],
				"date": "1991-04-07T12:00-500",
				"ISSN": "0190-8286",
				"language": "en-US",
				"libraryCatalog": "www.washingtonpost.com",
				"publicationTitle": "Washington Post",
				"url": "https://www.washingtonpost.com/archive/entertainment/books/1991/04/07/bombs-in-the-cause-of-brotherhood/fe590e29-8052-4086-b9a9-6fcabdbae4ba/",
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
