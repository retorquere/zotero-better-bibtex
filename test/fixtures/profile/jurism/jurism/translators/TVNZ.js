{
	"translatorID": "649c2836-a94d-4bbe-8e28-6771f283702f",
	"label": "TVNZ",
	"creator": "Philipp Zumstein",
	"target": "^https?://(www\\.)?tvnz\\.co\\.nz/one-news/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2019-04-07 18:10:37"
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
	if (url.includes("/search?") && getSearchResults(doc, true)) {
		return "multiple";
	}
	if (ZU.xpathText(doc, '//meta[@property="og:type"]/@content')) {
		return "newspaperArticle";
	}
	return false;
}


function scrape(doc, url) {
	var item = new Zotero.Item("newspaperArticle");
	item.title = ZU.xpathText(doc, '//meta[@property="og:title"]/@content');
	item.date = ZU.xpathText(doc, '(//div[contains(@class, "storyPage") and h1]//time)[1]');
	if (item.date) {
		if (item.date.match(/\d\d?:\d\d[pa]m/)) {
			item.date = "Today";
		}
		else if (!item.date.match(/\d\d\d\d/)) {
			item.date += " 2017";
		}
		item.date = ZU.strToISO(item.date);
	}
	item.abstractNote = ZU.xpathText(doc, '//meta[@property="og:description"]/@content');
	var tagString = ZU.xpathText(doc, '//meta[@name="news_keywords"]/@content');
	if (tagString) {
		item.tags = tagString.split(', ');
	}
	item.section = ZU.xpathText(doc, '//div[@class="colStorySectionHeader"]/div[@class="tagItem"]/h2');
	item.url = ZU.xpathText(doc, '//link[@rel="canonical"]/@href') || url;
	item.publicationTitle = "TVNZ";
	item.language = "en-NZ";
	item.complete();
}


function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = ZU.xpath(doc, '//div[@class="tileContent"]/a[h3]');
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
			if (items) ZU.processDocuments(Object.keys(items), scrape);
		});
	}
	else {
		scrape(doc, url);
	}
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://www.tvnz.co.nz/one-news/new-zealand/below-average-temperatures-forecast-across-nz-first-half-july",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Below average temperatures forecast across NZ for first half of July",
				"creators": [],
				"date": "2017-07-05",
				"abstractNote": "MetService's long-range forecast for this month has colder temperatures than usual.",
				"language": "en-NZ",
				"libraryCatalog": "TVNZ",
				"publicationTitle": "TVNZ",
				"section": "New Zealand",
				"url": "https://www.tvnz.co.nz/one-news/new-zealand/below-average-temperatures-forecast-across-nz-first-half-july",
				"attachments": [],
				"tags": [
					"new-zealand",
					"nzn",
					"one-news",
					"weather-news"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.tvnz.co.nz/one-news/new-zealand/watch-stunning-aurora-australis-storm-lights-up-southern-skies",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Watch: Stunning Aurora Australis storm lights up southern skies",
				"creators": [],
				"date": "2017-05-28",
				"abstractNote": "A geomagnetic storm made for some incredible photos in the South Island overnight.",
				"language": "en-NZ",
				"libraryCatalog": "TVNZ",
				"publicationTitle": "TVNZ",
				"section": "New Zealand",
				"shortTitle": "Watch",
				"url": "https://www.tvnz.co.nz/one-news/new-zealand/watch-stunning-aurora-australis-storm-lights-up-southern-skies",
				"attachments": [],
				"tags": [
					"breakfast",
					"new-zealand",
					"space"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.tvnz.co.nz/one-news/search?q=storm",
		"items": "multiple"
	}
]
/** END TEST CASES **/
