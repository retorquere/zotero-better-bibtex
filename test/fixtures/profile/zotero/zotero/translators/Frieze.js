{
	"translatorID": "7feb4b6c-05d6-4d61-bf0d-5e7f70c1ef0b",
	"translatorType": 4,
	"label": "Frieze",
	"creator": "czar",
	"target": "^https?://(www\\.)?frieze\\.com/",
	"minVersion": "3.0",
	"maxVersion": null,
	"priority": 100,
	"inRepository": true,
	"browserSupport": "gcsibv",
	"lastUpdated": "2021-06-15 16:25:00"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2018-2021 czar (http://en.wikipedia.org/wiki/User_talk:Czar)
	                      and Abe Jellinek

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
	if (url.includes("/article/")) {		// does not handle /event/ or /media/ pages, which EM alone can handle
		if (text(doc, '.article-belongs-to-issue')) {
			return "magazineArticle";
		}
		else {
			return "blogPost";
		}
	}
	else if (getSearchResults(doc, true)) {
		return "multiple";
	}
	return false;
}


function scrape(doc, url) {
	var translator = Zotero.loadTranslator('web');
	translator.setTranslator('951c027d-74ac-47d4-a107-9c3069ab7b48'); // embedded metadata (EM)
	translator.setDocument(doc);
	
	translator.setHandler('itemDone', function (obj, item) { // corrections to EM
		item.title = attr(doc, 'meta[property="og:title"]', 'content') || item.title; // EM is putting " | Frieze" at the end
		item.publicationTitle = "Frieze";
		item.issue = text(doc, '.article-belongs-to-issue');
		if (item.issue) {
			item.itemType = "magazineArticle";
			item.ISSN = "0962-0672";
			item.issue = item.issue.replace('Issue ', '');
		}
		else {
			item.itemType = "blogPost";
		}
		item.date = text(doc, '.article-header-author-info').split('|')[1].trim();
		if (item.date) {
			// 21 -> 2021
			item.date = item.date.replace(/([0-9]{2})$/, '20$1');
			item.date = ZU.strToISO(item.date);
		}
		var authorMetadata = doc.querySelectorAll('.article-header-author-responsive a[href*="/contributor/"]');
		for (let author of authorMetadata) {
			item.creators.push(ZU.cleanAuthor(author.text, "author"));
		}
		item.tags = []; // the only tag is "premium"
		if (item.abstractNote) {
			item.abstractNote = item.abstractNote.replace(/, Frieze$/, '');
		}
		item.complete();
	});

	translator.getTranslatorObject(function (trans) {
		trans.doWeb(doc, url);
	});
}


function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = doc.querySelectorAll('.teaser-title a[href*="/article/"]');
	for (let i = 0; i < rows.length; i++) {
		let href = rows[i].href;
		let title = ZU.trimInternal(rows[i].textContent);
		if (!href || !title) continue;
		if (/\/(event|media)\//.test(href)) continue; // scrap items that link to /event/ or /media/ pages
		if (checkOnly) return true;
		found = true;
		items[href] = title;
	}
	return found ? items : false;
}


function doWeb(doc, url) {
	switch (detectWeb(doc, url)) {
		case "multiple":
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
			break;
		case "magazineArticle":
		case "blogPost":
			scrape(doc, url);
			break;
	}
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://www.frieze.com/article/africa-venice",
		"items": [
			{
				"itemType": "magazineArticle",
				"title": "Africa in Venice",
				"creators": [
					{
						"firstName": "Sean",
						"lastName": "O'Toole",
						"creatorType": "author"
					}
				],
				"date": "2013-09-14",
				"ISSN": "0962-0672",
				"abstractNote": "The 55th Venice Biennale",
				"issue": "157",
				"language": "en",
				"libraryCatalog": "www.frieze.com",
				"publicationTitle": "Frieze",
				"url": "https://www.frieze.com/article/africa-venice",
				"attachments": [
					{
						"title": "Snapshot",
						"mimeType": "text/html"
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
		"url": "https://www.frieze.com/search?search=%22venice%20biennale%22",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://www.frieze.com/article/weekend-reading-list-54",
		"items": [
			{
				"itemType": "blogPost",
				"title": "Weekend Reading List",
				"creators": [
					{
						"firstName": "Paul",
						"lastName": "Clinton",
						"creatorType": "author"
					}
				],
				"date": "2017-03-10",
				"abstractNote": "From the Women's Strike to a march that cancels itself out: what to read this weekend",
				"blogTitle": "Frieze",
				"language": "en",
				"url": "https://www.frieze.com/article/weekend-reading-list-54",
				"attachments": [
					{
						"title": "Snapshot",
						"mimeType": "text/html"
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
		"url": "https://www.frieze.com/article/art-world-overwhelmingly-liberal-still-overwhelmingly-middle-class-and-white-why",
		"items": [
			{
				"itemType": "blogPost",
				"title": "The Art World is Overwhelmingly Liberal But Still Overwhelmingly Middle Class and White – Why?",
				"creators": [
					{
						"firstName": "Hettie",
						"lastName": "Judah",
						"creatorType": "author"
					}
				],
				"date": "2018-07-06",
				"abstractNote": "Is the lack of social mobility in the arts due to a self-congratulatory conviction that the sector represents the solution rather than the problem?",
				"blogTitle": "Frieze",
				"language": "en",
				"url": "https://www.frieze.com/article/art-world-overwhelmingly-liberal-still-overwhelmingly-middle-class-and-white-why",
				"attachments": [
					{
						"title": "Snapshot",
						"mimeType": "text/html"
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
		"url": "https://www.frieze.com/",
		"items": "multiple"
	}
]
/** END TEST CASES **/
