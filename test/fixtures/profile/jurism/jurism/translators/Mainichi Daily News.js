{
	"translatorID": "b56f856e-934e-4b46-bc58-d61dccc9f32f",
	"label": "Mainichi Daily News",
	"creator": "Philipp Zumstein",
	"target": "^https?://mainichi\\.jp/(?:english/)?(articles/|search\\?)",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2016-12-27 12:01:25"
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
	if (url.indexOf('/articles/')>-1) {
		return "newspaperArticle";
	} else if (getSearchResults(doc, true)) {
		return "multiple";
	}
}

function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = ZU.xpath(doc, '//li/a[contains(@href, "/articles/")]');
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
	var item = new Zotero.Item("newspaperArticle");

	item.title = ZU.xpathText(doc, '//header/h1');
	
	item.publicationTitle = "Mainichi Daily News";
	
	var start = url.indexOf("/articles/") + "/articles/".length;
	var stop = url.indexOf("/", start);
	var datestring = url.substring(start, stop);
	if (datestring.length == 8) {
		item.date = datestring.substring(0,4)+"-"+datestring.substring(4,6)+"-"+datestring.substring(6,8);
	} else {
		item.date = ZU.xpathText(doc, '//div[contains(@class, "article-info")]//time');
	}
	
	if (url.indexOf("/english/")>-1) {
		item.language = "en";
	} else {
		item.language = "jp";
	}
	
	item.section = ZU.xpathText(doc, '//div[contains(@class, "container")]/ul/li[@class="active"]')
	
	item.url = url;
	item.attachments.push({
		title: "Snapshot",
		document: doc
	});
	
	item.complete();
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://mainichi.jp/articles/20160409/ddn/041/040/012000c",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "北野天満宮の桜、新品種？　住友林業・苗木増殖に成功",
				"creators": [],
				"date": "2016-04-09",
				"language": "jp",
				"libraryCatalog": "Mainichi Daily News",
				"publicationTitle": "Mainichi Daily News",
				"section": "地域, めっちゃ関西",
				"url": "http://mainichi.jp/articles/20160409/ddn/041/040/012000c",
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
		"url": "http://mainichi.jp/english/articles/20160608/p2a/00m/0na/005000c",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Obama's origami cranes to go on display at Hiroshima Peace Memorial Museum",
				"creators": [],
				"date": "2016-06-08",
				"language": "en",
				"libraryCatalog": "Mainichi Daily News",
				"publicationTitle": "Mainichi Daily News",
				"section": "Japan",
				"url": "http://mainichi.jp/english/articles/20160608/p2a/00m/0na/005000c",
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
		"url": "http://mainichi.jp/search?q=%E5%AE%AE%E5%B4%8E+%E9%A7%BF&p=1",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://mainichi.jp/english/search?q=tokyo",
		"items": "multiple"
	}
]
/** END TEST CASES **/