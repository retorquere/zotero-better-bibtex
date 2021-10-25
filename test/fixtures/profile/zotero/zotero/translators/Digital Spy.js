{
	"translatorID": "d45c50cb-6dee-4cfb-974d-797991f8385b",
	"translatorType": 4,
	"label": "Digital Spy",
	"creator": "czar",
	"target": "^https?://(www\\.)?digitalspy\\.com",
	"minVersion": "3.0",
	"maxVersion": null,
	"priority": 100,
	"inRepository": true,
	"browserSupport": "gcsibv",
	"lastUpdated": "2021-05-26 19:50:00"
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


function detectWeb(doc, _url) {
	if (doc.querySelector('.content-hed')) {
		return "blogPost";
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
		item.itemType = "blogPost";
		item.language = "en-GB";
		item.creators = []; // reset bad author metadata
		var authorMetadata = doc.querySelectorAll('a[rel="author"]');
		for (let author of authorMetadata) {
			item.creators.push(ZU.cleanAuthor(author.text, "author"));
		}
		item.tags = []; // tags are pretty SEO-y now
		item.complete();
	});

	translator.getTranslatorObject(function (trans) {
		trans.addCustomFields({ // pull from meta tags in here
			title: 'title'
		});
		trans.doWeb(doc, url);
	});
}


function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = doc.querySelectorAll('.simple-item > a');
	for (let i = 0; i < rows.length; i++) {
		let href = rows[i].href;
		let title = ZU.trimInternal(text(rows[i], '.item-title'));
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
		"url": "https://www.digitalspy.com/videogames/xbox-one/a661615/rare-replay-review-roundup-one-of-the-best-collections-in-gaming-history/",
		"items": [
			{
				"itemType": "blogPost",
				"title": "Is Rare Replay good? First reviews go live",
				"creators": [
					{
						"firstName": "Albaraa",
						"lastName": "Fahmy",
						"creatorType": "author"
					}
				],
				"date": "2015-08-04 12:47:00",
				"abstractNote": "Early reviews applaud the compilation for comprising countless hours of content.",
				"blogTitle": "Digital Spy",
				"language": "en-GB",
				"shortTitle": "Is Rare Replay good?",
				"url": "http://www.digitalspy.com/videogames/xbox-one/a661615/rare-replay-review-roundup-one-of-the-best-collections-in-gaming-history/",
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
		"url": "https://www.digitalspy.com/videogames/mass-effect/a786594/mass-effect-andromeda-trailer-news-release-date-uk-story-characters-gameplay/",
		"items": [
			{
				"itemType": "blogPost",
				"title": "Mass Effect Andromeda trailers, news, release date and everything you need to know",
				"creators": [
					{
						"firstName": "Sam",
						"lastName": "Loveridge",
						"creatorType": "author"
					}
				],
				"date": "2017-03-13 01:00:00",
				"abstractNote": "Including story, characters and more.",
				"blogTitle": "Digital Spy",
				"language": "en-GB",
				"url": "http://www.digitalspy.com/videogames/mass-effect/a786594/mass-effect-andromeda-trailer-news-release-date-uk-story-characters-gameplay/",
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
		"url": "https://www.digitalspy.com/soaps/coronation-street/a36407166/coronation-street-sharon-bentley-tricks-dev-alahan-leanne-search/",
		"items": [
			{
				"itemType": "blogPost",
				"title": "Coronation Street's Sharon tricks Dev in her search for Leanne",
				"creators": [
					{
						"firstName": "Amy",
						"lastName": "West",
						"creatorType": "author"
					}
				],
				"date": "2021-05-12 03:14:00",
				"abstractNote": "She won't stop until she's got what she wants.",
				"blogTitle": "Digital Spy",
				"language": "en-GB",
				"url": "https://www.digitalspy.com/soaps/coronation-street/a36407166/coronation-street-sharon-bentley-tricks-dev-alahan-leanne-search/",
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
		"url": "https://www.digitalspy.com/search/?q=xbox",
		"items": "multiple"
	}
]
/** END TEST CASES **/
