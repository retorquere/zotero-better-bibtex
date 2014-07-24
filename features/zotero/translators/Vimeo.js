{
	"translatorID": "1b0ffe71-1c2f-4a79-b894-40b990b3e491",
	"label": "Vimeo",
	"creator": "Sebastian Karcher",
	"target": "^https?://(www\\.)?vimeo\\.com",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2013-07-25 23:57:48"
}

/*
   Vimeo Translator
   Copyright (C) 2012 Sebastian Karcher

   This program is free software: you can redistribute it and/or modify
   it under the terms of the GNU Affero General Public License as published by
   the Free Software Foundation, either version 3 of the License, or
   (at your option) any later version.

   This program is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   GNU Affero General Public License for more details.

   You should have received a copy of the GNU Affero General Public License
   along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

function detectWeb(doc, url) {
	//the meta properties are missing once you're logged in
	var xpath = '//meta[@property="og:video:type"]|//div[@class="video_meta"]';
	if (ZU.xpath(doc, xpath).length > 0) {
		return "videoRecording";
	}

	if (url.match(/vimeo\.com\/search\?q=/)) {
		return "multiple";
	}
	return false;
}


function doWeb(doc, url) {
	if (detectWeb(doc, url) == "multiple") {
		var hits = {};
		var urls = [];
		var results = ZU.xpath(doc, "//li[contains(@id, 'clip_')]/a");

		for (var i in results) {
			hits[results[i].href] = results[i].title;
		}
		Z.selectItems(hits, function (items) {
			if (items == null) return true;
			for (var j in items) {
				urls.push(j);
			}
			ZU.processDocuments(urls, doWeb);
		});
	} else {
		// We call the Embedded Metadata translator to do the actual work
		var creator = ZU.xpathText(doc, '//div[@class="byline"]/a[1]');
		var date = ZU.xpathText(doc, '//meta[@itemprop="dateCreated"]/@content');
		var duration = ZU.xpathText(doc, '//meta[@itemprop="duration"]/@content');
		var translator = Zotero.loadTranslator("web");
		translator.setTranslator("951c027d-74ac-47d4-a107-9c3069ab7b48");
		translator.setDocument(doc);
		translator.setHandler("itemDone", function (obj, item) {
			item.itemType= "videoRecording";
			item.title = item.title.replace(/\s*on Vimeo$/, "");
			item.creators = ZU.cleanAuthor(creator, "author");
			if (date) item.date = date.replace(/T.+/, "");
			if (duration) item.runningTime = duration;
			item.extra = '';
			item.complete();
		});
		translator.translate();
	}
}
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://vimeo.com/search?q=cello",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://vimeo.com/31179423",
		"items": [
			{
				"itemType": "videoRecording",
				"creators": {
					"firstName": "Alexander",
					"lastName": "Chen",
					"creatorType": "author"
				},
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"title": "Strings: J.S. Bach - Cello Suite No. 1 - Prelude",
				"url": "http://vimeo.com/31179423",
				"abstractNote": "Strings (2011) by Alexander Chen visualizes the first Prelude from Bach's Cello Suites. Using the math behind string length and pitch, it came from a simple idea:…",
				"libraryCatalog": "vimeo.com",
				"date": "2011-10-26",
				"runningTime": "PT00H02M57S",
				"shortTitle": "Strings"
			}
		]
	}
]
/** END TEST CASES **/