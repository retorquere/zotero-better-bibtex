{
	"translatorID": "180a62bf-efdd-4d38-8d85-8971af04dd85",
	"label": "TV by the Numbers",
	"creator": "Sonali Gupta",
	"target": "^https?://tvbythenumbers\\.zap2it\\.com/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2019-04-07 20:02:00"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2017 Sonali Gupta
	
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
	if (url.includes('/?s=') && getSearchResults(doc, true)) return "multiple";
	else if (doc.body.className.includes("single-post")) return "blogPost";
	return false;
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

function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = ZU.xpath(doc, '//div[@class="container container-small"]/article/h2/a');
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

function scrape(doc, url) {
	var translator = Zotero.loadTranslator('web');
	// Embedded Metadata
	translator.setTranslator('951c027d-74ac-47d4-a107-9c3069ab7b48');
	translator.setDocument(doc);

	translator.setHandler('itemDone', function (obj, item) {
		if (item.date) item.date = ZU.strToISO(item.date);
		var authors = ZU.xpath(doc, '//a[@rel="author"]');
		for (let i = 0; i < authors.length; i++) {
			if (authors[i].textContent != 'TV By The Numbers') {
				item.creators.push(ZU.cleanAuthor(authors[i].textContent, "author"));
			}
		}
		item.publicationTitle = "TV By The Numbers";
		var tags = ZU.xpath(doc, '//a[@rel="tag"]');
		item.tags = [];
		for (let i = 0; i < tags.length; i++) {
			item.tags.push(tags[i].textContent);
		}
		item.complete();
	});

	translator.getTranslatorObject(function (trans) {
		trans.itemType = "blogPost";
		trans.doWeb(doc, url);
	});
} /** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://tvbythenumbers.zap2it.com/page/20/?s=harry+potter",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://tvbythenumbers.zap2it.com/daily-ratings/monday-final-ratings-july-3-2017/",
		"items": [
			{
				"itemType": "blogPost",
				"title": "‘American Ninja Warrior’ adjusts up: Monday final ratings",
				"creators": [
					{
						"firstName": "Rick",
						"lastName": "Porter",
						"creatorType": "author"
					}
				],
				"date": "2017-07-06",
				"abstractNote": "Final broadcast primetime live + same-day ratings for Monday, July 3, 2017 The top show on a rerun-filled Monday night saw its adults 18-49 rating grow from the preliminary numbers to the finals. &…",
				"blogTitle": "TV By The Numbers",
				"shortTitle": "‘American Ninja Warrior’ adjusts up",
				"url": "http://tvbythenumbers.zap2it.com/daily-ratings/monday-final-ratings-july-3-2017/",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					"American Ninja Warrior Ratings",
					"Battle of the Network Stars Ratings",
					"Kevin Can Wait Ratings",
					"Life in Pieces Ratings",
					"Man With a Plan Ratings",
					"Mom Ratings",
					"Scorpion Ratings",
					"So You Think You Can Dance Ratings",
					"Spartan: Ultimate Team Challenge Ratings",
					"Supergirl Ratings",
					"Superhuman Ratings",
					"The Bachelorette Ratings",
					"Whose Line is it Anyway Ratings"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://tvbythenumbers.zap2it.com/sdsdskdh279882992z1/tv-ratings-friday-grimm-constantine-fall-shark-tank-the-amazing-race-last-man-standing-up-cristela-hawaii-five-0-steady/322517/",
		"items": [
			{
				"itemType": "blogPost",
				"title": "TV Ratings Friday: ‘Grimm’ & ‘Constantine’ Fall, ‘Shark Tank’, ‘The Amazing Race’ & ‘Last Man Standing’ Up, ‘Cristela’ & ‘Hawaii FIve-0’ Steady",
				"creators": [],
				"date": "2014-11-01",
				"abstractNote": "ABC was number one in adults 18-49 while CBS won with total viewers.",
				"blogTitle": "TV By The Numbers",
				"shortTitle": "TV Ratings Friday",
				"url": "http://tvbythenumbers.zap2it.com/sdsdskdh279882992z1/tv-ratings-friday-grimm-constantine-fall-shark-tank-the-amazing-race-last-man-standing-up-cristela-hawaii-five-0-steady/",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					"20/20 Ratings",
					"America's Next Top Model Ratings",
					"Blue Bloods Ratings",
					"Constantine Ratings",
					"Cristela Ratings",
					"Dateline Ratings",
					"Gotham Ratings",
					"Hawaii Five-0 Ratings",
					"Last Man Standing Ratings",
					"Shark Tank Ratings",
					"The Amazing Race Ratings",
					"Utopia Ratings",
					"Whose Line is it Anyway Ratings",
					"World Series Ratings"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/
