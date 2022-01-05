{
	"translatorID": "48105411-e76d-47a7-b538-07e9a59be234",
	"translatorType": 4,
	"label": "Desiring God",
	"creator": "Luke van der Hoeven",
	"target": "^https?://(www\\.)?desiringgod\\.org/",
	"minVersion": "3.0",
	"maxVersion": null,
	"priority": 100,
	"inRepository": true,
	"browserSupport": "gcsibv",
	"lastUpdated": "2021-06-11 17:25:00"
}

/*
  ***** BEGIN LICENSE BLOCK *****

  Copyright © 2019 Luke van der Hoeven
  This file is part of Zotero.

  Zotero is free software: you can redistribute it and/or modify
  it under the terms of the GNU Affero General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  Zotero is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU Affero General Public License for more details.

  You should have received a copy of the GNU Affero General Public License
  along with Zotero.  If not, see <http://www.gnu.org/licenses/>.

  ***** END LICENSE BLOCK *****
*/


var handlers = {
	blogPost: (_, __) => {},
	interview: fetchAudio
};

function detectWeb(doc, url) {
	if (url.includes("search/results")) {
		return "multiple";
	}
	else if (url.includes("articles")) {
		return "blogPost";
	}
	else if (url.includes("interviews")) {
		return "interview";
	}
	return false;
}

function doWeb(doc, url) {
	var type = detectWeb(doc, url);
	switch (type) {
		case "multiple": {
			let results = getSearchResults(doc, false);
			if (results) {
				Zotero.selectItems(results, function (selected) {
					if (!selected) return;
					var articles = [];

					for (let i in selected) {
						articles.push(i);
					}

					ZU.processDocuments(articles, doWeb);
				});
			}
			break;
		}
		case "interview":
		case "blogPost":
			scrape(doc, url, type);
			break;
	}
}

function scrape(doc, url, type) {
	var translator = Zotero.loadTranslator('web');
	translator.setTranslator('951c027d-74ac-47d4-a107-9c3069ab7b48'); // embedded metadata
	translator.setDocument(doc);

	translator.setHandler('itemDone', function (obj, item) {
		item.itemType = type;
		item.date = attr(doc, 'header time.resource__date', 'datetime');

		var authors = doc.querySelectorAll('.resource .resource__header #authors');

		for (let author of authors) {
			var name = ZU.cleanAuthor(text(author, ".resource__author span", 0), "author");
			item.creators.push(name);
		}

		handlers[type](doc, item);
		item.complete();
	});

	translator.getTranslatorObject(function (trans) {
		trans.doWeb(doc, url);
	});
}

function fetchAudio(doc, item) {
	let downloadLinks = doc.querySelectorAll('.resource .media-menu__item--download ul li');

	for (var link of downloadLinks) {
		let linkUrl = attr(link, 'a', 'href');
		if (linkUrl.endsWith('.mp3')) {
			item.attachments.push({
				url: linkUrl,
				title: "Recorded Audio",
				mimeType: "audio/mp3",
				snapshot: false
			});
		}
	}
}

function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	let results = doc.querySelectorAll('div.gsc-results div.gs-result a.gs-title');

	for (var result of results) {
		let href = result.dataset.ctorig;
		let title = ZU.trimInternal(result.innerText);

		if (!href || !title) continue;
		if (checkOnly) return true;

		found = true;
		items[href] = title;
	}

	return found ? items : false;
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://www.desiringgod.org/articles/too-depressed-to-believe-what-we-know",
		"items": [
			{
				"itemType": "blogPost",
				"title": "Too Depressed to Believe What We Know",
				"creators": [
					{
						"firstName": "Marshall",
						"lastName": "Segal",
						"creatorType": "author"
					}
				],
				"date": "2015-07-14",
				"abstractNote": "We’ve collected some of our best resources on depression, as well as a few others around the web. We pray they will bring God’s light into your darkness.",
				"blogTitle": "Desiring God",
				"language": "en",
				"url": "https://www.desiringgod.org/articles/too-depressed-to-believe-what-we-know",
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
		"url": "https://www.desiringgod.org/interviews/discussion-with-justin-holcomb",
		"items": [
			{
				"itemType": "interview",
				"title": "Discussion with Justin Holcomb",
				"creators": [
					{
						"firstName": "Justin",
						"lastName": "Holcomb",
						"creatorType": "author"
					}
				],
				"date": "2011-05-25",
				"language": "en",
				"libraryCatalog": "www.desiringgod.org",
				"url": "https://www.desiringgod.org/interviews/discussion-with-justin-holcomb",
				"attachments": [
					{
						"title": "Snapshot",
						"mimeType": "text/html"
					},
					{
						"title": "Recorded Audio",
						"mimeType": "audio/mp3",
						"snapshot": false
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
		"url": "https://www.desiringgod.org/search/results?q=depression",
		"items": "multiple"
	}
]
/** END TEST CASES **/
