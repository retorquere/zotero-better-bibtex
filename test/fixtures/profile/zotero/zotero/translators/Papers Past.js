{
	"translatorID": "1b052690-16dd-431d-9828-9dc675eb55f6",
	"label": "Papers Past",
	"creator": "Philipp Zumstein",
	"target": "^https?://(www\\.)?paperspast\\.natlib\\.govt\\.nz",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2017-01-22 00:46:33"
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
	if (url.indexOf('?query')>-1 && getSearchResults(doc, true)) {
		return "multiple";
	} else if (ZU.xpathText(doc, '//h3[@itemprop="headline"]')) {
		if (url.indexOf('/newspapers/')>-1) {
			return "newspaperArticle";
		}
		if (url.indexOf('/periodicals/')>-1) {
			return "journalArticle";
		}
		if (url.indexOf('/manuscripts/')>-1) {
			return "letter";
		}
		if (url.indexOf('/parliamentary/')>-1) {
			return "report";
		}
	}
}


function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = ZU.xpath(doc, '//table[contains(@class, "search-results")]//td/a');
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
	var type = detectWeb(doc, url);
	var item = new Zotero.Item(type);
	var title = ZU.xpathText(doc, '//h3[@itemprop="headline"]/text()[1]');
	item.title = ZU.capitalizeTitle(title.toLowerCase(), true);
	
	if (type == "journalArticle" || type == "newspaperArticle") {
		var nav = ZU.xpath(doc, '//table[@id="breadcrumbs"]//td[not(contains(@class, "separator"))]');
		if (nav.length>1) {
			item.publicationTitle = nav[1].textContent;
		}
		if (nav.length>2) {
			item.date = ZU.strToISO(nav[2].textContent);
		}
		if (nav.length>3) {
			item.pages = nav[3].textContent.match(/\d+/)[0];
		}
	}
	
	var container = ZU.xpathText(doc, '//h3[@itemprop="headline"]/small');
	if (container) {
		var volume = container.match(/Volume (\w+)\b/);
		if (volume) {
			item.volume = volume[1];
		}
		var issue = container.match(/Issue (\w+)\b/);
		if (issue) {
			item.issue = issue[1];
		}
	}
	
	if (type == "letter") {
		var author = ZU.xpathText(doc, '//div[@id="researcher-tools-tab"]//tr[td[.="author"]]/td[2]');
		//e.g. 42319/Mackay, James, 1831-1912
		if (author && author.indexOf("Unknown") == -1) {
			author = author.replace(/^[0-9\/]*/, '').replace(/[0-9\-]*$/, '').replace('(Sir)', '');
			item.creators.push(ZU.cleanAuthor(author, "author"));
		}
		var recipient = ZU.xpathText(doc, '//div[@id="researcher-tools-tab"]//tr[td[.="recipient"]]/td[2]');
		if (recipient && recipient.indexOf("Unknown") == -1) {
			recipient = recipient.replace(/^[0-9\/]*/, '').replace(/[0-9\-]*$/, '').replace('(Sir)', '');
			item.creators.push(ZU.cleanAuthor(recipient, "recipient"));
		}
		
		item.date = ZU.xpathText(doc, '//div[@id="researcher-tools-tab"]//tr[td[.="date"]]/td[2]');
		
		item.language = ZU.xpathText(doc, '//div[@id="researcher-tools-tab"]//tr[td[.="language"]]/td[2]');
		
	}

	item.url = ZU.xpathText(doc, '//div[@id="researcher-tools-tab"]/input/@value');
	
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
		"url": "http://paperspast.natlib.govt.nz/cgi-bin/paperspast?a=q&hs=1&r=1&results=1&dafdq=&dafmq=&dafyq=&datdq=&datmq=&datyq=&pbq=&sf=&ssnip=&tyq=&t=0&txq=argentina&x=11&y=3&e=-------10--1----0--",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://paperspast.natlib.govt.nz/newspapers/EP19440218.2.61",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Coup in Argentina",
				"creators": [],
				"date": "1944-02-18",
				"libraryCatalog": "Papers Past",
				"pages": "5",
				"publicationTitle": "Evening Post",
				"url": "http://paperspast.natlib.govt.nz/newspapers/EP19440218.2.61",
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
		"url": "https://paperspast.natlib.govt.nz/newspapers/NZH19360721.2.73.1?query=argentina",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "La Argentina",
				"creators": [],
				"date": "1936-07-21",
				"libraryCatalog": "Papers Past",
				"pages": "9",
				"publicationTitle": "New Zealand Herald",
				"url": "http://paperspast.natlib.govt.nz/newspapers/NZH19360721.2.73.1",
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
		"url": "https://paperspast.natlib.govt.nz/periodicals/FRERE18831101.2.2",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "\"The Law Within the Law.\"",
				"creators": [],
				"date": "1883-11-01",
				"issue": "2",
				"libraryCatalog": "Papers Past",
				"pages": "3",
				"publicationTitle": "Freethought Review",
				"url": "http://paperspast.natlib.govt.nz/periodicals/FRERE18831101.2.2",
				"volume": "I",
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
		"url": "https://paperspast.natlib.govt.nz/manuscripts/MCLEAN-1024774.2.1",
		"items": [
			{
				"itemType": "letter",
				"title": "1 Page Written 19 Jun 1873 by James Mackay in Hamilton City to Sir Donald Mclean in Wellington",
				"creators": [
					{
						"firstName": "Mackay",
						"lastName": "James",
						"creatorType": "author"
					},
					{
						"firstName": "McLean",
						"lastName": "Donald",
						"creatorType": "recipient"
					}
				],
				"date": "1873-06-19",
				"language": "English",
				"libraryCatalog": "Papers Past",
				"url": "http://paperspast.natlib.govt.nz/manuscripts/MCLEAN-1024774.2.1",
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