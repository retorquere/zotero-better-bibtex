{
	"translatorID": "31659710-d04e-45d0-84ba-8e3f5afc4a54",
	"label": "Twitter",
	"creator": "Avram Lyon, Philipp Zumstein",
	"target": "^https?://([^/]+\\.)?twitter\\.com/",
	"minVersion": "4.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2017-07-22 12:54:26"
}

/*
   Twitter Translator
   Copyright (C) 2011 Avram Lyon, ajlyon@gmail.com

   This program is free software: you can redistribute it and/or modify
   it under the terms of the GNU General Public License as published by
   the Free Software Foundation, either version 3 of the License, or
   (at your option) any later version.

   This program is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   GNU General Public License for more details.

   You should have received a copy of the GNU General Public License
   along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */


function detectWeb(doc, url) {
	if(doc.getElementById('page-container')) {
		Z.monitorDOMChanges(doc.getElementById('page-container'), {childList: true});
	}
	if (ZU.xpathText(doc, '//div[contains(@class,"permalink-tweet-container")]')) {
		return "blogPost";
	} else if (getSearchResults(doc, true)) {
		return "multiple";
	}
}


function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = ZU.xpath(doc, '//div[contains(@class, "content")]');
	for (var i=0; i<rows.length; i++) {
		var href = ZU.xpathText(rows[i], './/a[contains(@class, "js-permalink") and contains(@href, "/status/")]/@href');
		var title = ZU.xpathText(rows[i], './div[contains(@class, "js-tweet-text-container")]');
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
	var item = new Zotero.Item("blogPost");
	item.title = ZU.xpathText(doc, '//div[contains(@class,"permalink-tweet-container")]//p[contains(@class, "js-tweet-text")]');
	item.language = ZU.xpathText(doc, '//div[contains(@class,"permalink-tweet-container")]//p[contains(@class, "js-tweet-text")]/@lang');
	var author = ZU.xpathText(doc, '//div[contains(@class,"permalink-header")]//strong[contains(@class,"fullname")]');
	if (author) {
		item.creators.push(ZU.cleanAuthor(author, "author"));
	}
	var date = ZU.xpathText(doc, '//div[contains(@class,"permalink-tweet-container")]//span[@class="metadata"]/span[1]');
	if (date) {
		var m = date.match(/(\d\d:\d\d)\s*-\s*(.*)/);
		if (m) {
			item.date = ZU.strToISO(m[2]) + "T" + m[1];
		} else {
			item.date = date;
		}
	}
	var urlParts = url.split('/');
	item.blogTitle = '@' + urlParts[3];
	item.websiteType = "Tweet";
	item.url = url;
	item.attachments.push({
		document: doc,
		title: "Snapshot"
	});
	var urls = ZU.xpath(doc, '//div[contains(@class,"permalink-tweet-container")]//a[contains(@class, "twitter-timeline-link")]/@title');
	for (var i=0; i<urls.length; i++) {
		item.attachments.push({
			url: urls[i].textContent,
			title: urls[i].textContent,
			snapshot: false
		});
	}
	item.complete();
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://twitter.com/zotero/status/105608278976905216",
		"items": [
			{
				"itemType": "blogPost",
				"title": "Zotero 3.0 beta is now available with duplicate detection and tons more. Runs outside Firefox with Chrome or Safari!  http://www.zotero.org/blog/announcing-zotero-3-0-beta-release/ …",
				"creators": [
					{
						"firstName": "",
						"lastName": "Zotero",
						"creatorType": "author"
					}
				],
				"date": "2011-08-22T04:52",
				"blogTitle": "@zotero",
				"language": "en",
				"shortTitle": "Zotero 3.0 beta is now available with duplicate detection and tons more. Runs outside Firefox with Chrome or Safari!  http",
				"url": "https://twitter.com/zotero/status/105608278976905216",
				"websiteType": "Tweet",
				"attachments": [
					{
						"title": "Snapshot"
					},
					{
						"title": "http://www.zotero.org/blog/announcing-zotero-3-0-beta-release/",
						"snapshot": false
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