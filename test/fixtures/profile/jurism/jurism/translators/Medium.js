{
	"translatorID": "6c957d6b-a554-474f-81a9-91c178fef65d",
	"label": "Medium",
	"creator": "Philipp Zumstein",
	"target": "^https?://medium\\.com",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2016-12-27 14:13:31"
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
	if (ZU.xpathText(doc, '//article[contains(@class, "postArticle")]')) {
		return "blogPost";
	} else if (getSearchResults(doc, true)) {
		return "multiple";
	}
}

function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = ZU.xpath(doc, '//a[@data-post-id and h3]|//div[contains(@class, "postArticle-content")]/a[section][1]|//a[div[contains(@class, "postArticle-content")]]');
	for (var i=0; i<rows.length; i++) {
		var href = rows[i].href;
		var title = ZU.xpathText(rows[i], './/h2|.//h3');
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
	var translator = Zotero.loadTranslator('web');
	// Embedded Metadata
	translator.setTranslator('951c027d-74ac-47d4-a107-9c3069ab7b48');
	//translator.setDocument(doc);

	translator.setHandler('itemDone', function (obj, item) {

		var parts = item.title.split('–');
		if (parts.length == 2) {
			item.title = parts[0];
			item.blogTitle = parts[1];
			delete item.publicationTitle;
		}

		item.complete();
	});

	translator.getTranslatorObject(function(trans) {
		trans.itemType = "blogPost";
		trans.doWeb(doc, url);
	});
}
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://medium.com/technology-and-society",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://medium.com/search?q=labor",
		"defer": true,
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://medium.com/@zeynep",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://medium.com/message/what-if-the-feature-is-the-bug-7957d8e685c4",
		"items": [
			{
				"itemType": "blogPost",
				"title": "What If the Feature Is the Bug?",
				"creators": [
					{
						"firstName": "Zeynep",
						"lastName": "Tufekci",
						"creatorType": "author"
					}
				],
				"date": "2014-04-22T16:02:32.005Z",
				"abstractNote": "Election monitoring, new power of social media and old power of structural power",
				"blogTitle": "The Message",
				"shortTitle": "What If the Feature Is the Bug?",
				"url": "https://medium.com/message/what-if-the-feature-is-the-bug-7957d8e685c4",
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