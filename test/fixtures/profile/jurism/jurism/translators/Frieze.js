{
	"translatorID": "7feb4b6c-05d6-4d61-bf0d-5e7f70c1ef0b",
	"label": "Frieze",
	"creator": "czar",
	"target": "^https?://(www\\.)?frieze\\.com",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2019-02-01 01:28:00"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2018 czar
	http://en.wikipedia.org/wiki/User_talk:Czar

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


// attr()/text() v2 per https://github.com/zotero/translators/issues/1277
function attr(docOrElem,selector,attr,index){var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector);return elem?elem.getAttribute(attr):null;}function text(docOrElem,selector,index){var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector);return elem?elem.textContent:null;}


function detectWeb(doc, url) {
	if (url.includes("/article/")) {		// does not handle /event/ or /media/ pages, which EM alone can handle
		if (text(doc,'.issue-name')) {
			return "magazineArticle";
		}
		else {
			return "blogPost";
		}
	} else if (getSearchResults(doc, true)) {
		return "multiple";
	}
}


function scrape(doc, url) {
	var translator = Zotero.loadTranslator('web');
	translator.setTranslator('951c027d-74ac-47d4-a107-9c3069ab7b48'); // embedded metadata (EM)
	translator.setDocument(doc);
	
	translator.setHandler('itemDone', function (obj, item) { // corrections to EM
		item.publicationTitle = "Frieze";
		item.issue = text(doc,'.issue-name');
		if (item.issue) {
			item.itemType = "magazineArticle";
			item.ISSN = "0962-0672";
			item.issue = item.issue.replace('Issue ','');
		} else {
			item.itemType = "blogPost";
		}
		item.date = text(doc,'.field-name-article-category-date');
		if (item.date) {
			item.date = Z.Utilities.strToISO(item.date.replace(/.*-\s(.*)/,"$1"));
		}
		var authorMetadata = doc.querySelectorAll('.field-name-article-contributor-name a');
		for (let author of authorMetadata) {
			item.creators.push(ZU.cleanAuthor(author.text, "author"));
		}
		item.complete();
	});

	translator.getTranslatorObject(function(trans) {
		trans.doWeb(doc, url);
	});
}


function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = doc.querySelectorAll('.field-name-title-field a');
	for (let i=0; i<rows.length; i++) {
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
					return true;
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
		"url": "https://frieze.com/article/africa-venice",
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
				"libraryCatalog": "frieze.com",
				"publicationTitle": "Frieze",
				"url": "https://frieze.com/article/africa-venice",
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
		"url": "https://frieze.com/search?text_search=%22venice%20biennale%22",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://frieze.com/article/weekend-reading-list-54",
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
				"url": "https://frieze.com/article/weekend-reading-list-54",
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
		"url": "https://frieze.com/article/art-world-overwhelmingly-liberal-still-overwhelmingly-middle-class-and-white-why",
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
				"url": "https://frieze.com/article/art-world-overwhelmingly-liberal-still-overwhelmingly-middle-class-and-white-why",
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
		"url": "https://frieze.com/",
		"items": "multiple"
	}
]
/** END TEST CASES **/
