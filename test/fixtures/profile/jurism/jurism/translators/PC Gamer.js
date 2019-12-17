{
	"translatorID": "274284a8-fc91-4f54-be77-bfcb7f9c3d6f",
	"label": "PC Gamer",
	"creator": "czar",
	"target": "^https?://(www\\.)?pcgamer\\.com",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2018-07-07 03:30:20"
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
	var isBlogPost = ZU.xpath(doc,'//*[@id="main"]/article');
	if (isBlogPost.length) {
		return "blogPost";
	} else if (getSearchResults(doc, true)) {
		return "multiple";
	}
}


function scrape(doc, url) {
	var translator = Zotero.loadTranslator('web');
	translator.setTranslator('951c027d-74ac-47d4-a107-9c3069ab7b48'); // embedded metadata
	translator.setDocument(doc);
	
	translator.setHandler('itemDone', function (obj, item) { // correct bad metadata in here
		item.itemType = "blogPost";
		item.publicationTitle = "PC Gamer";
		item.language = "en-US";
		item.creators = []; // reset bad author metadata
		var authorMetadata = doc.querySelectorAll('a[rel="author"]');
		for (let author of authorMetadata) {
			item.creators.push(ZU.cleanAuthor(author.text, "author"));
		}
		item.complete();
	});

	translator.getTranslatorObject(function(trans) {
		trans.addCustomFields({ // pull from meta tags in here
			'pub_date': 'date'
		});
		trans.doWeb(doc, url);
	});
}


function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = doc.querySelectorAll('div#content > div.mainCarousel span.article-name, div.listingResults h3');
	var links = doc.querySelectorAll('div#content > div.mainCarousel div.feature-block-item-wrapper > a:first-of-type, div.listingResults div.listingResult > a:first-of-type');
	for (let i=0; i<rows.length; i++) {
		let href = links[i].href;
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
					return true;
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
		"url": "https://www.pcgamer.com/the-voice-behind-symmetra-on-working-with-blizzard-overwatch-dream-couples-and-dd/",
		"items": [
			{
				"itemType": "blogPost",
				"title": "The voice behind Symmetra on working with Blizzard, Overwatch dream couples, and D&D",
				"creators": [
					{
						"firstName": "James",
						"lastName": "Davenport",
						"creatorType": "author"
					}
				],
				"date": "2017-02-09T22:22:41+00:00",
				"abstractNote": "Anjali Bhimani is a self-proclaimed Chaotic Good who thinks Soldier: 76 and Ana are secretly hooking up.",
				"blogTitle": "PC Gamer",
				"language": "en-US",
				"url": "https://www.pcgamer.com/the-voice-behind-symmetra-on-working-with-blizzard-overwatch-dream-couples-and-dd/",
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
		"url": "https://www.pcgamer.com/search/?searchTerm=symmetra",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://www.pcgamer.com/best-skyrim-mods/",
		"items": [
			{
				"itemType": "blogPost",
				"title": "The best Skyrim mods",
				"creators": [
					{
						"firstName": "Christopher",
						"lastName": "Livingston",
						"creatorType": "author"
					},
					{
						"firstName": "Tom",
						"lastName": "Hatfield",
						"creatorType": "author"
					},
					{
						"firstName": "Diana",
						"lastName": "Papiz",
						"creatorType": "author"
					}
				],
				"date": "2018-02-01T20:52:00+00:00",
				"abstractNote": "We've collected over 100 of our favorite mods for Bethesda's fantasy RPG.",
				"blogTitle": "PC Gamer",
				"language": "en-US",
				"url": "https://www.pcgamer.com/best-skyrim-mods/",
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
		"url": "https://www.pcgamer.com/",
		"items": "multiple"
	}
]
/** END TEST CASES **/
