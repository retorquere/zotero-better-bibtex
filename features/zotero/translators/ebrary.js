{
	"translatorID": "2abe2519-2f0a-48c0-ad3a-b87b9c059459",
	"label": "ebrary",
	"creator": "Sebastian Karcher",
	"target": "^https?://site\\.ebrary\\.com/.+(?:docDetail|search)\\.action\\?",
	"minVersion": "4.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcv",
	"lastUpdated": "2014-03-17 19:59:24"
}

/*
ebrary Translator
Copyright (C) 2014 Sebastian Karcher 

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program. If not, see <http://www.gnu.org/licenses/>.
*/



function detectWeb(doc, url) {
	if (url.indexOf("docDetail.action?") != -1) return "book";
	else if (url.indexOf("search.action?") != -1) {
		if (ZU.xpathText(doc, '//div[@class="book_info_titlelist"]')) return "multiple";
	}
}

function doWeb(doc, url) {
	if (detectWeb(doc, url) == "multiple") {
		items = {};
		articles = [];
		var titles = ZU.xpath(doc, '//div[@class="book_info_titlelist"]/a[@class="title"]');
		for (var i = 0; i < titles.length; i++) {
			items[titles[i].href] = titles[i].textContent;
		}
		Zotero.selectItems(items, function (items) {
			if (!items) {
				return true;
			}
			for (var i in items) {
				articles.push(genRisUrl(i));
			}
			ZU.doGet(articles, scrape);
		});
	} else {
		ZU.doGet(genRisUrl(url), scrape)
	}
}

function genRisUrl(url) {
	var id = url.match(/docID=[^&#]+/)[0];
	var risurl = '/lib/alltitles/biblioExport.action?' + id;
	return risurl
}

function scrape(text) {
	//Z.debug(text)
	var translator = Zotero.loadTranslator("import");
	translator.setTranslator("32d59d2d-b65a-4da4-b0a3-bdd3cfb979e7");
	translator.setString(text);
	translator.setHandler("itemDone", function (obj, item) {
		if (item.url) {
			item.attachments.push({
				url: item.url,
				title: "ebrary Snapshot",
				mimeType: "text/html"
			});
		}
		item.complete();
	});
	translator.translate();
}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://site.ebrary.com/lib/alltitles/docDetail.action?docID=10071244&p00=political+science",
		"items": [
			{
				"itemType": "book",
				"creators": [
					{
						"lastName": "Blank",
						"firstName": "Robert H.",
						"creatorType": "author"
					},
					{
						"lastName": "Hines",
						"firstName": "Samuel M.",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [
					"Biopolitics.",
					"Political science.",
					"Sociobiology."
				],
				"seeAlso": [],
				"attachments": [
					{
						"title": "ebrary Snapshot",
						"mimeType": "text/html"
					}
				],
				"title": "Biology and Political Science",
				"place": "London, GBR",
				"publisher": "Routledge",
				"ISBN": "9780203201329",
				"url": "http://site.ebrary.com/lib/alltitles/docDetail.action?docID=10071244",
				"date": "2001",
				"libraryCatalog": "ebrary",
				"accessDate": "CURRENT_TIMESTAMP"
			}
		]
	},
	{
		"type": "web",
		"url": "http://site.ebrary.com/lib/alltitles/search.action?p00=political+science&fromSearch=fromSearch&search=Search",
		"items": "multiple"
	}
]
/** END TEST CASES **/