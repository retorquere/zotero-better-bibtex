{
	"translatorID": "e623eec7-ad54-4201-b709-654bf3fd7f70",
	"label": "Washington Monthly",
	"creator": "Philipp Zumstein",
	"target": "^https?://(www\\.)?washingtonmonthly\\.com",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2019-06-10 22:51:06"
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
	var header = ZU.xpath(doc, '//header[contains(@class, "entry-header")]');
	if (header && header.length == 1) {
		if (url.includes('/magazine/')) {
			return 'magazineArticle';
		}
		else {
			return 'blogPost';
		}
	}
	if (getSearchResults(doc, true)) {
		return "multiple";
	}
	return false;
}


function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = ZU.xpath(doc, '//h3[contains(@class, "entry-title")]/a');
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
			if (!items) return;

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


function scrape(doc, url) {
	var type = url.includes('/magazine/') ? 'magazineArticle' : 'blogPost';
	
	var translator = Zotero.loadTranslator('web');
	// Embedded Metadata
	translator.setTranslator('951c027d-74ac-47d4-a107-9c3069ab7b48');
	translator.setDocument(doc);
	translator.setHandler('itemDone', function (obj, item) {
		item.itemType = type;
		var header = ZU.xpath(doc, '//header[contains(@class, "entry-header")]');
		var authors = ZU.xpathText(header, './/div[contains(@class, "author-info")]/a[contains(@class, "author-name")]');
		if (authors) {
			var authorsList = authors.split(' and ');
			for (var i = 0; i < authorsList.length; i++) {
				item.creators.push(ZU.cleanAuthor(authorsList[i], "author"));
			}
		}
		item.volume = ZU.xpathText(header, './div[contains(@class, "issue-header")]');
		var category = ZU.xpathText(header, './div[contains(@class, "header-tag")]');
		if (type == "blogPost" && category) {
			delete item.publicationTitle;
			item.blogTitle = "Washington Monthly - " + category.trim();
		}
		if (type == "magazineArticle") {
			item.ISSN = "0043-0633";
		}
		item.complete();
	});
	translator.translate();
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://washingtonmonthly.com/magazine/mayjune-2011/the-information-sage/",
		"items": [
			{
				"itemType": "magazineArticle",
				"title": "The Information Sage",
				"creators": [
					{
						"firstName": "Joshua",
						"lastName": "Yaffa",
						"creatorType": "author"
					}
				],
				"date": "2011-04-26T16:49:38+00:00",
				"ISSN": "0043-0633",
				"abstractNote": "Meet Edward Tufte, the graphics guru to the power elite who is revolutionizing how we see data.",
				"libraryCatalog": "washingtonmonthly.com",
				"publicationTitle": "Washington Monthly",
				"url": "http://washingtonmonthly.com/magazine/mayjune-2011/the-information-sage/",
				"volume": "May/June 2011",
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
		"url": "http://washingtonmonthly.com/2011/11/19/note-to-presenters-at-academic-conferences/",
		"items": [
			{
				"itemType": "blogPost",
				"title": "Note to Presenters at Academic Conferences",
				"creators": [
					{
						"firstName": "Mark",
						"lastName": "Kleiman",
						"creatorType": "author"
					}
				],
				"date": "2011-11-19T12:55:31+00:00",
				"abstractNote": "1. Most of the audience either has a Ph.D. or is about to get one. 2. It is extremely hard to get a doctorate without finishing college. 3. Colleges rarely accept students without high school diplomas. 4. Before graduating from high school it is necessary to pass the third grade. 5. Passing the third grade",
				"blogTitle": "Washington Monthly - Politics",
				"url": "http://washingtonmonthly.com/2011/11/19/note-to-presenters-at-academic-conferences/",
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
		"url": "http://washingtonmonthly.com/?s=europe",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://washingtonmonthly.com/political-animal/",
		"items": "multiple"
	}
]
/** END TEST CASES **/
