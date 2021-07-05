{
	"translatorID": "fa7c37b1-fda4-418a-a8b8-2491929411ab",
	"translatorType": 4,
	"label": "Polygon",
	"creator": "czar",
	"target": "^https?://(www\\.)?(polygon|heroesneverdie|riftherald|theflyingcourier)\\.com",
	"minVersion": "3.0",
	"maxVersion": null,
	"priority": 100,
	"inRepository": true,
	"browserSupport": "gcsibv",
	"lastUpdated": "2021-05-26 20:10:00"
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


function detectWeb(doc, url) {
	if (/\d{4}\/\d+\/\d+\/\d+\//.test(url) || /\/[^/]+\/\d+\//.test(url)) {
		return "blogPost";
	}
	else if (/search\?q=|polygon\.com\/?($|news|reviews|features|guides|videos|movies|tv|comics|podcasts)\/?/.test(url) || getSearchResults(doc, true)) {
		return "multiple";
	}
	return false;
}


function scrape(doc, url) {
	var translator = Zotero.loadTranslator('web');
	translator.setTranslator('951c027d-74ac-47d4-a107-9c3069ab7b48'); // embedded metadata
	translator.setDocument(doc);
	
	translator.setHandler('itemDone', function (obj, item) { // correct bad metadata in here
		item.itemType = "blogPost";
		if (!item.blogTitle) {
			item.blogTitle = item.publicationTitle;
		}
		item.language = "en-US";
		var authorMetadata = ZU.xpathText(doc, '//script[contains(text(), "dataLayer =")]');
		if (authorMetadata) { // EM doesn't handle multiple authors, so start from scratch
			authorMetadata = authorMetadata.match(/"Author"\s?:\s?"([^"]*)"/)[1].split(":");
			item.creators = [];
			do {
				item.creators.push(ZU.cleanAuthor(authorMetadata[0], "author"));
				authorMetadata.shift();
			}
			while (authorMetadata.length);
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
	var rows = doc.querySelectorAll('h2.c-entry-box--compact__title a');
	for (let i = 0; i < rows.length; i++) {
		let href = rows[i].href;
		let title = ZU.trimInternal(rows[i].textContent);
		if (!href || !title) continue;
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
		case "blogPost":
			scrape(doc, url);
			break;
	}
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://www.polygon.com/2015/6/14/8779193/earthbound-mother-famicom-wii-u-virtual-console-nintendo",
		"items": [
			{
				"itemType": "blogPost",
				"title": "Nintendo brings Mother to Virtual Console as Earthbound Beginnings — it's available today",
				"creators": [
					{
						"firstName": "Michael",
						"lastName": "McWhertor",
						"creatorType": "author"
					},
					{
						"firstName": "Arthur",
						"lastName": "Gies",
						"creatorType": "author"
					}
				],
				"date": "2015-06-14T18:11:30-04:00",
				"abstractNote": "At this year's Nintendo World Championships, Nintendo announced that Wii U owners would be able to get their hands on an EarthBound Beginnings, a Virtual Console re-release of the original game in...",
				"blogTitle": "Polygon",
				"language": "en-US",
				"url": "https://www.polygon.com/2015/6/14/8779193/earthbound-mother-famicom-wii-u-virtual-console-nintendo",
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
		"url": "https://www.polygon.com/2013/11/11/5090912/sega-genesis-retrospective-book-turns-to-kickstarter-for-funding",
		"items": [
			{
				"itemType": "blogPost",
				"title": "Sega Genesis retrospective book turns to Kickstarter for funding",
				"creators": [
					{
						"firstName": "Griffin",
						"lastName": "McElroy",
						"creatorType": "author"
					}
				],
				"date": "2013-11-11T11:30:02-05:00",
				"abstractNote": "Sega Mega Drive/Genesis: Collected Works, a \"documentary art book\" chronicling the creation and full history of Sega's classic home console and its iconic software, has turned to Kickstarter to...",
				"blogTitle": "Polygon",
				"language": "en-US",
				"url": "https://www.polygon.com/2013/11/11/5090912/sega-genesis-retrospective-book-turns-to-kickstarter-for-funding",
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
		"url": "https://www.polygon.com/news",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://www.polygon.com/search?q=earthbound",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://www.polygon.com/",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://www.heroesneverdie.com/",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://www.heroesneverdie.com/2018/7/2/17524654/overwatch-hammond-lore-controversy",
		"items": [
			{
				"itemType": "blogPost",
				"title": "Hammond brings a ton of joy back into Overwatch",
				"creators": [
					{
						"firstName": "Cass",
						"lastName": "Marshall",
						"creatorType": "author"
					}
				],
				"date": "2018-07-02T13:00:21-04:00",
				"abstractNote": "After a bunch of dark heroes, it’s time to get fun again",
				"blogTitle": "Heroes Never Die",
				"language": "en-US",
				"url": "https://www.heroesneverdie.com/2018/7/2/17524654/overwatch-hammond-lore-controversy",
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
		"url": "https://www.polygon.com/interviews/22454722/black-panther-comics-ending-ta-nehisi-coates-interview",
		"items": [
			{
				"itemType": "blogPost",
				"title": "‘The miracle is Wakanda’: Ta-Nehisi Coates on ending Black Panther",
				"creators": [
					{
						"firstName": "Evan",
						"lastName": "Narcisse",
						"creatorType": "author"
					}
				],
				"date": "2021-05-26T12:34:52-04:00",
				"abstractNote": "The writer reflects on his half-decade Marvel run",
				"blogTitle": "Polygon",
				"language": "en-US",
				"shortTitle": "‘The miracle is Wakanda’",
				"url": "https://www.polygon.com/interviews/22454722/black-panther-comics-ending-ta-nehisi-coates-interview",
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
	}
]
/** END TEST CASES **/
