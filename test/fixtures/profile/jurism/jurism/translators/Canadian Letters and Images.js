{
	"translatorID": "a7c8b759-6f8a-4875-9d6e-cc0a99fe8f43",
	"label": "Canadian Letters and Images",
	"creator": "Philipp Zumstein",
	"target": "^https?://(www\\.)?canadianletters\\.ca/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2016-09-09 19:45:42"
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
	if (url.indexOf("/content/document")>-1) {
		var type = ZU.xpathText(doc, '//span[contains(@class, "lineage-item")]');
		switch (type) {
			case "Letter":
			case "Postcard":
				return "letter";
			case "Photo":
			case "Personal Item":
				return "artwork";
		}
	} else if (getSearchResults(doc, true)) {
		return "multiple";
	}
}


function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = ZU.xpath(doc, '//h3[contains(@class, "title")]//a');
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
	var newItem = new Zotero.Item(detectWeb(doc, url));
	newItem.title = ZU.xpathText(doc, '//div[contains(@class, "breadcrumbs")]//h1');
	newItem.type = ZU.xpathText(doc, '//span[contains(@class, "lineage-item")]');
	var date = ZU.xpathText(doc, '//div[span[contains(@class, "field-label") and contains(text(), "Date")]]/text()');
	if (date) {
		newItem.date = ZU.strToISO(date);
	}
	var author = ZU.xpathText(doc, '//div[div[contains(@class, "field-label") and contains(text(), "From")]]/div[contains(@class, "field-items")]');
	if (author) {
		newItem.creators.push(ZU.cleanAuthor(author, "author"));
	}
	var recipient = ZU.xpathText(doc, '//div[div[contains(@class, "field-label") and contains(text(), "To")]]/div[contains(@class, "field-items")]');
	if (recipient) {
		newItem.creators.push(ZU.cleanAuthor(recipient, "recipient"));
	}
	newItem.url = url;
	newItem.complete();
}
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://canadianletters.ca/search/site/Germany",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://canadianletters.ca/content/document-11014?position=47",
		"items": [
			{
				"itemType": "letter",
				"title": "Davey, John (Jack) Letter: 1915 December 12th",
				"creators": [
					{
						"firstName": "",
						"lastName": "Jack",
						"creatorType": "author"
					},
					{
						"firstName": "",
						"lastName": "Kate",
						"creatorType": "recipient"
					}
				],
				"date": "1915-12-12",
				"letterType": "Letter",
				"libraryCatalog": "Canadian Letters and Images",
				"shortTitle": "Davey, John (Jack) Letter",
				"url": "http://canadianletters.ca/content/document-11014?position=47",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/
