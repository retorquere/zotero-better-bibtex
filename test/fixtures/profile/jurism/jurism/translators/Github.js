{
	"translatorID": "a7747ba7-42c6-4a22-9415-1dafae6262a9",
	"label": "GitHub",
	"creator": "Martin Fenner, Philipp Zumstein",
	"target": "^https?://(www\\.)?github\\.com/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2018-04-14 12:00:32"
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
	} else if (ZU.xpathText(doc, '/html/head/meta[@property="og:type" and @content="object"]/@content')) {
		return "computerProgram";
	}
}


function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = ZU.xpath(doc, '//*[contains(@class, "repo-list-item")]//h3/a');
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
	var item = new Z.Item("computerProgram");
	
	var repo = ZU.xpathText(doc, '//meta[@property="og:title"]/@content');
	
	//basic metadata from the meta tags in the head
	item.url = ZU.xpathText(doc, '//meta[@property="og:url"]/@content');
	item.title = ZU.xpathText(doc, '//meta[@property="og:description"]/@content');
	item.title = item.title.replace(' - ', ': ').replace(/\.$/, '');
	item.libraryCatalog = "GitHub";
	var topics = ZU.xpath(doc, '//div[@id="topics-list-container"]//a');
	for (var i=0; i<topics.length; i++) {
		item.tags.push(topics[i].textContent.trim());
	}

	item.rights = ZU.xpathText(doc, '//a[*[contains(@class, "octicon-law")]]');
	
	//api calls for more information (owner, date, programming language)
	var apiUrl = "https://api.github.com/";
	ZU.doGet(apiUrl+"repos/"+repo, function(result) {
		var json = JSON.parse(result);
		//Z.debug(json);
		if (json.message && json.message.includes("API rate limit exceeded")) {
			//finish and stop in this case
			item.complete();
			return;
		}
		var name = json.name;
		var owner = json.owner.login;
		
		item.programmingLanguage = json.language;
		item.extra = "original-date: " + json.created_at;
		item.date = json.updated_at;
		
		ZU.doGet(apiUrl+"users/"+owner, function(user) {
			var jsonUser = JSON.parse(user);
			var ownerName = jsonUser.name || jsonUser.login;
			if (jsonUser.type == "User") {
				item.creators.push(ZU.cleanAuthor(ownerName, "programmer"));
			} else {
				item.company = ownerName;
			}
			
			item.complete();
		});

	});
	

}


// get the full name from the author profile page
function getAuthor(username) {
	var url = "https://github.com/" + encodeURIComponent(username);	
	ZU.processDocuments(url, function(text) {
		var author = ZU.xpathText(text, '//span[contains(@class, "vcard-fullname")]');
		if (!author) { author = ZU.xpathText(text, '//span[contains(@class, "vcard-username")]'); }
		if (!author) { author = ZU.xpathText(text, '/html/head/meta[@property="profile:username"]/@content'); }
		Z.debug(author);
		author = ZU.cleanAuthor(author, "author");
	});
	// temporary, until we get the author string out of the closure
	return ZU.cleanAuthor(username, "author");
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://github.com/zotero/zotero/",
		"items": [
			{
				"itemType": "computerProgram",
				"title": "zotero: Zotero is a free, easy-to-use tool to help you collect, organize, cite, and share your research sources",
				"creators": [],
				"date": "2018-04-14T04:06:44Z",
				"company": "zotero",
				"extra": "original-date: 2011-10-27T07:46:48Z",
				"libraryCatalog": "GitHub",
				"programmingLanguage": "JavaScript",
				"shortTitle": "zotero",
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
				"title": "schema: DataCite Metadata Schema Repository",
				"creators": [],
				"date": "2018-03-22T14:50:46Z",
				"company": "DataCite",
				"extra": "original-date: 2011-04-13T07:08:41Z",
				"libraryCatalog": "GitHub",
				"programmingLanguage": "Ruby",
				"shortTitle": "schema",
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
				"title": "kraken: Ocropus fork with sane defaults",
				"creators": [
					{
						"firstName": "",
						"lastName": "mittagessen",
						"creatorType": "programmer"
					}
				],
				"date": "2018-04-10T01:48:27Z",
				"extra": "original-date: 2015-05-19T09:24:38Z",
				"libraryCatalog": "GitHub",
				"programmingLanguage": "Python",
				"rights": "Apache-2.0",
				"shortTitle": "kraken",
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
				"title": "z2csl: Zotero extension for creating Zotero to CSL item type and field mappings",
				"creators": [
					{
						"firstName": "Aurimas",
						"lastName": "Vinckevicius",
						"creatorType": "programmer"
					}
				],
				"date": "2018-04-02T21:32:18Z",
				"extra": "original-date: 2012-05-20T07:53:58Z",
				"libraryCatalog": "GitHub",
				"programmingLanguage": "JavaScript",
				"shortTitle": "z2csl",
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
