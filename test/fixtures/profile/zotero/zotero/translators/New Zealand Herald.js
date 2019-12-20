{
	"translatorID": "c7830593-807e-48cb-99f2-c3bed2b148c2",
	"label": "New Zealand Herald",
	"creator": "Philipp Zumstein",
	"target": "^https?://www\\.nzherald\\.co\\.nz",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2019-06-13 22:55:12"
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
	if (url.includes("/search") && getSearchResults(doc, true)) {
		return "multiple";
	}
	else if (url.includes("/news/article.cfm")) {
		return "newspaperArticle";
	}
	return false;
}


function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = doc.querySelectorAll('article.result-item a[href*="/news/article.cfm"]');
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
	var translator = Zotero.loadTranslator('web');
	// Embedded Metadata
	translator.setTranslator('951c027d-74ac-47d4-a107-9c3069ab7b48');
	// translator.setDocument(doc);
	
	translator.setHandler('itemDone', function (obj, item) {
		item.ISSN = "1170-0777";
		// EM looks at byline for author which does not work well here;
		// thus we delete this and do it here again properly
		item.creators = [];
		var author = text(doc, '.byline.has-author .author');
		if (!author) {
			var firstElement = text(doc, '#article-content p.element');
			if (firstElement && firstElement.includes('By')) {
				author = firstElement;
			}
		}
		if (author) {
			item.creators.push(ZU.cleanAuthor(author.replace('By', ''), "author"));
		}
		item.url = attr(doc, 'link[rel=canonical]', 'href');
		if (item.language) {
			item.language = item.language.replace('_', '-');
		}
		item.complete();
	});

	translator.getTranslatorObject(function (trans) {
		trans.itemType = "newspaperArticle";
		trans.addCustomFields({
			language: 'language',
			'article:section': 'section'
		});
		trans.doWeb(doc, url);
	});
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.nzherald.co.nz/world/news/article.cfm?c_id=2&objectid=11892211",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "China unveils its answer to US Reaper drone - how does it compare?",
				"creators": [
					{
						"firstName": "Stephen",
						"lastName": "Chen",
						"creatorType": "author"
					}
				],
				"date": "2017-07-18T02:45:22Z",
				"ISSN": "1170-0777",
				"abstractNote": "A production model of China's heavy military drone has made a successful flight.",
				"language": "en-NZ",
				"libraryCatalog": "www.nzherald.co.nz",
				"publicationTitle": "NZ Herald",
				"section": "World",
				"url": "http://www.nzherald.co.nz/world/news/article.cfm?c_id=2&objectid=11892211",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					"Asia",
					"China",
					"Front Page - Top Stories"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.nzherald.co.nz/technology/news/article.cfm?c_id=5&objectid=11891847",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Data drones a sign of the times",
				"creators": [
					{
						"firstName": "James",
						"lastName": "Penn",
						"creatorType": "author"
					}
				],
				"date": "2017-07-19T18:00:00Z",
				"ISSN": "1170-0777",
				"abstractNote": "New tech could have farmers checking the state of their farm before getting out of bed.",
				"language": "en-NZ",
				"libraryCatalog": "www.nzherald.co.nz",
				"publicationTitle": "NZ Herald",
				"section": "Business, Technology",
				"url": "http://www.nzherald.co.nz/business/news/article.cfm?c_id=3&objectid=11891847",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					"Agribusiness Report",
					"Agricultural Services",
					"The Country"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.nzherald.co.nz/technology/news/article.cfm?c_id=5&objectid=11892937",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Nanogirl Michelle Dickinson: Getaway without the long-haul flight",
				"creators": [
					{
						"firstName": "Michelle",
						"lastName": "Dickinson",
						"creatorType": "author"
					}
				],
				"date": "2017-07-21T17:00:00Z",
				"ISSN": "1170-0777",
				"abstractNote": "COMMENT: The future of air travel is faster and quieter.",
				"language": "en-NZ",
				"libraryCatalog": "www.nzherald.co.nz",
				"publicationTitle": "NZ Herald",
				"section": "Technology",
				"shortTitle": "Nanogirl Michelle Dickinson",
				"url": "http://www.nzherald.co.nz/technology/news/article.cfm?c_id=5&objectid=11892937",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					"Opinion",
					"Science"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.nzherald.co.nz/nz/news/article.cfm?c_id=1&objectid=11893407",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Steve Braunias: The Secret Diary of Todd Barclay",
				"creators": [
					{
						"firstName": "Steve",
						"lastName": "Braunias",
						"creatorType": "author"
					}
				],
				"date": "2017-07-21T17:00:00Z",
				"ISSN": "1170-0777",
				"abstractNote": "Steve Braunias takes a look at Todd Barclay's secret diary",
				"language": "en-NZ",
				"libraryCatalog": "www.nzherald.co.nz",
				"publicationTitle": "NZ Herald",
				"section": "New Zealand",
				"shortTitle": "Steve Braunias",
				"url": "http://www.nzherald.co.nz/nz/news/article.cfm?c_id=1&objectid=11893407",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					"Australasia",
					"Front Page - Top Stories",
					"New Zealand",
					"Opinion",
					"Politics",
					"WC - Opinion"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.nzherald.co.nz/search/hobbits/?type=article,image.gallery,video.other&c_id=2",
		"items": "multiple"
	}
]
/** END TEST CASES **/
