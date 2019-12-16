{
	"translatorID": "a7747ba7-42c6-4a22-9415-1dafae6262a9",
	"label": "GitHub",
	"creator": "Martin Fenner, Philipp Zumstein",
	"target": "^https?://(www\\.)?github\\.com/[^/]+/[^/]+/?$",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2019-08-29 10:16:28"
}

/**
	Copyright (c) 2017 Martin Fenner, Philipp Zumstein

	This program is free software: you can redistribute it and/or
	modify it under the terms of the GNU Affero General Public License
	as published by the Free Software Foundation, either version 3 of
	the License, or (at your option) any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
	Affero General Public License for more details.

	You should have received a copy of the GNU Affero General Public
	License along with this program. If not, see
	<http://www.gnu.org/licenses/>.
*/


function detectWeb(doc, url) {
	if (url.includes("/search?")) {
		if (getSearchResults(doc, true)) {
			return "multiple";
		}
	}
	else if (ZU.xpathText(doc, '/html/head/meta[@property="og:type" and @content="object"]/@content')) {
		return "computerProgram";
	}
	return false;
}


function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = ZU.xpath(doc, '//*[contains(@class, "repo-list-item")]//h3/a');
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
				return;
			}
			var articles = [];
			for (var i in items) {
				articles.push(i);
			}
			ZU.processDocuments(articles, scrape);
		});
	}
	else {
		scrape(doc, url);
	}
}


function scrape(doc, _url) {
	var item = new Z.Item("computerProgram");
	
	var repo = ZU.xpathText(doc, '//meta[@property="og:title"]/@content');
	
	// basic metadata from the meta tags in the head
	item.url = ZU.xpathText(doc, '//meta[@property="og:url"]/@content');
	item.title = ZU.xpathText(doc, '//meta[@property="og:title"]/@content');
	item.abstractNote = ZU.xpathText(doc, '//meta[@property="og:description"]/@content').split(' - ')[0];
	item.libraryCatalog = "GitHub";
	var topics = doc.getElementsByClassName('topic-tag');
	for (var i = 0; i < topics.length; i++) {
		item.tags.push(topics[i].textContent.trim());
	}

	item.rights = ZU.xpathText(doc, '//a[*[contains(@class, "octicon-law")]]');
	if (item.rights && item.rights.trim() == "View license") {
		delete item.rights;
	}
	
	// api calls for more information (owner, date, programming language)
	var apiUrl = "https://api.github.com/";
	ZU.doGet(apiUrl + "repos/" + repo, function (result) {
		var json = JSON.parse(result);
		// Z.debug(json);
		if (json.message && json.message.includes("API rate limit exceeded")) {
			// finish and stop in this case
			item.complete();
			return;
		}
		var owner = json.owner.login;
		
		item.programmingLanguage = json.language;
		item.extra = "original-date: " + json.created_at;
		item.date = json.updated_at;
		
		ZU.doGet(apiUrl + "users/" + owner, function (user) {
			var jsonUser = JSON.parse(user);
			var ownerName = jsonUser.name || jsonUser.login;
			if (jsonUser.type == "User") {
				item.creators.push(ZU.cleanAuthor(ownerName, "programmer"));
			}
			else {
				item.company = ownerName;
			}
			
			item.complete();
		});
	});
}


/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://github.com/zotero/zotero/",
		"items": [
			{
				"itemType": "computerProgram",
				"title": "zotero/zotero",
				"creators": [],
				"date": "2019-08-29T02:15:36Z",
				"abstractNote": "Zotero is a free, easy-to-use tool to help you collect, organize, cite, and share your research sources.",
				"company": "zotero",
				"extra": "original-date: 2011-10-27T07:46:48Z",
				"libraryCatalog": "GitHub",
				"programmingLanguage": "JavaScript",
				"url": "https://github.com/zotero/zotero",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://github.com/search?utf8=%E2%9C%93&q=topic%3Ahocr&type=",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://github.com/datacite/schema",
		"items": [
			{
				"itemType": "computerProgram",
				"title": "datacite/schema",
				"creators": [],
				"date": "2019-08-16T13:21:08Z",
				"abstractNote": "DataCite Metadata Schema Repository. Contribute to datacite/schema development by creating an account on GitHub.",
				"company": "DataCite",
				"extra": "original-date: 2011-04-13T07:08:41Z",
				"libraryCatalog": "GitHub",
				"programmingLanguage": "Ruby",
				"url": "https://github.com/datacite/schema",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://github.com/mittagessen/kraken",
		"items": [
			{
				"itemType": "computerProgram",
				"title": "mittagessen/kraken",
				"creators": [
					{
						"firstName": "",
						"lastName": "mittagessen",
						"creatorType": "programmer"
					}
				],
				"date": "2019-08-23T12:32:51Z",
				"abstractNote": "OCR engine for all the languages. Contribute to mittagessen/kraken development by creating an account on GitHub.",
				"extra": "original-date: 2015-05-19T09:24:38Z",
				"libraryCatalog": "GitHub",
				"programmingLanguage": "Python",
				"rights": "Apache-2.0",
				"url": "https://github.com/mittagessen/kraken",
				"attachments": [],
				"tags": [
					{
						"tag": "alto-xml"
					},
					{
						"tag": "hocr"
					},
					{
						"tag": "lstm"
					},
					{
						"tag": "neural-networks"
					},
					{
						"tag": "ocr"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://github.com/aurimasv/z2csl",
		"items": [
			{
				"itemType": "computerProgram",
				"title": "aurimasv/z2csl",
				"creators": [
					{
						"firstName": "Aurimas",
						"lastName": "Vinckevicius",
						"creatorType": "programmer"
					}
				],
				"date": "2019-07-12T17:57:05Z",
				"abstractNote": "Zotero extension for creating Zotero to CSL item type and field mappings.",
				"extra": "original-date: 2012-05-20T07:53:58Z",
				"libraryCatalog": "GitHub",
				"programmingLanguage": "JavaScript",
				"url": "https://github.com/aurimasv/z2csl",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/
