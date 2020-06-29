{
	"translatorID": "1a9a7ecf-01e9-4d5d-aa19-a7aa4010da83",
	"label": "The Economic Times",
	"creator": "Sonali Gupta",
	"target": "^https?://economictimes\\.indiatimes\\.com",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2017-03-19 15:14:59"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2017 Sonali Gupta
	
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
	if (url.indexOf("/topic/") != -1 && getSearchResults(doc, true)) {
		return "multiple";
	}
	else if (ZU.xpathText(doc, '//article')) {
		return "newspaperArticle";
	}
}

function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = ZU.xpath(doc, '//main//a[(h2 or h3) and contains(@href, "/articleshow")]');
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
	
	newItem = new Zotero.Item("newspaperArticle");
	newItem.url = url;
	newItem.publicationTitle = "The Economic Times";

	//get headline
	var title = ZU.xpathText(doc, '//article/h1');
	if (!title) title = ZU.xpathText(doc, '//meta[@property="og:title"]/@content');
	newItem.title = title;

	//get abstract
	newItem.abstractNote = ZU.xpathText(doc, '//meta[@property="og:description"]/@content');
	
	//get date
	var xpathdate_author = '//article/div/div[contains(@class, "publish_on") or contains(@class, "byline")]';
	var date = ZU.xpathText(doc, xpathdate_author);
	if (date) {
		newItem.date = ZU.strToISO(date);
	}

	//get author or organization
	var authors = ZU.xpath(doc, '//a[@rel="author"]');
	for (var i in authors){
		newItem.creators.push(ZU.cleanAuthor(authors[i].textContent, "author"));
	}
	if (!authors.length){
		authors = ZU.xpathText(doc, xpathdate_author);
		if (authors){
			authors_org=authors.substring(0,authors.lastIndexOf("|")-1);
			var regex = /(.*By\s+)(.*)/;
			authors = authors_org.replace(regex, "$2");
			newItem.creators.push({lastName:authors, creatorType: "author", fieldMode: 1})
		}
	}
	
	newItem.attachments = ({
		url: url,
		title: "The Economic Times Snapshot",
		mimeType: "text/html"
	});
	newItem.complete();
}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://economictimes.indiatimes.com/news/economy/policy/cabinet-may-tomorrow-consider-gst-supplementary-legislations/articleshow/57716927.cms",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Cabinet may tomorrow consider GST supplementary legislations",
				"creators": [
					{
						"lastName": "PTI",
						"creatorType": "author",
						"fieldMode": 1
					}
				],
				"date": "2017-03-19",
				"abstractNote": "Sources said the Cabinet meeting has been called for Monday morning and the agenda list may not be very long.",
				"libraryCatalog": "The Economic Times",
				"publicationTitle": "The Economic Times",
				"url": "http://economictimes.indiatimes.com/news/economy/policy/cabinet-may-tomorrow-consider-gst-supplementary-legislations/articleshow/57716927.cms",
				"attachments": {
					"url": "http://economictimes.indiatimes.com/news/economy/policy/cabinet-may-tomorrow-consider-gst-supplementary-legislations/articleshow/57716927.cms",
					"title": "The Economic Times Snapshot",
					"mimeType": "text/html"
				},
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://economictimes.indiatimes.com/news/economy/foreign-trade/vat-in-uae-will-not-affect-trade-dubai-chamber-chairman/articleshow/57671214.cms",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "VAT in UAE will not affect trade: Dubai Chamber chairman",
				"creators": [
					{
						"firstName": "Kirtika",
						"lastName": "Suneja",
						"creatorType": "author"
					}
				],
				"date": "2017-03-16",
				"abstractNote": "\"The discussion is to have VAT between 4-5%. It is an excellent step to collect information, businesses' capacity and gauge their condition,\" said Al Ghurair.",
				"libraryCatalog": "The Economic Times",
				"publicationTitle": "The Economic Times",
				"shortTitle": "VAT in UAE will not affect trade",
				"url": "http://economictimes.indiatimes.com/news/economy/foreign-trade/vat-in-uae-will-not-affect-trade-dubai-chamber-chairman/articleshow/57671214.cms",
				"attachments": {
					"url": "http://economictimes.indiatimes.com/news/economy/foreign-trade/vat-in-uae-will-not-affect-trade-dubai-chamber-chairman/articleshow/57671214.cms",
					"title": "The Economic Times Snapshot",
					"mimeType": "text/html"
				},
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://economictimes.indiatimes.com/topic/nuclear",
		"items": "multiple"
	}
]
/** END TEST CASES **/