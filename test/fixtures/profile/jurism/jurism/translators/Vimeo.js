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
	"lastUpdated": "2019-06-11 13:37:31"
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
	// the meta properties are missing once you're logged in
	var xpath = '//meta[@property="og:video:type"]|//div[@class="video_meta"]';
	if (ZU.xpath(doc, xpath).length > 0) {
		return "videoRecording";
	}

	if (url.includes('vimeo.com/search?q=') && getSearchResults(doc, true)) {
		return "multiple";
	}

	return false;
}


function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = ZU.xpath(doc, '//div[contains(@class, "iris_p_infinite__item")]//a[div/h5 and contains(@href, "//vimeo.com/")]');
	for (var i = 0; i < rows.length; i++) {
		var href = rows[i].href;
		var title = ZU.xpathText(rows[i], './/h5');
		if (!href || !title) continue;
		if (checkOnly) return true;
		found = true;
		items[href] = title;
	}
	// Due to some dynamic loading the DOM might not be ready for the method above
	// but the data is also saved in some JSON object in a script tag of the website.
	if (!found) {
		var script = ZU.xpathText(doc, '//body/script[contains(., "vimeo.config")]');
		if (script) {
			var start = script.indexOf('vimeo.config');
			var stop = script.indexOf('\n', start);
			var data = script.substring(start + 45, stop - 2);
			var json = JSON.parse(data);
			if (json && json.api && json.api.initial_json && json.api.initial_json.data) {
				var results = json.api.initial_json.data;
				for (var entry of results) {
					if (entry.clip && entry.clip.link && entry.clip.name) {
						items[entry.clip.link] = entry.clip.name;
						found = true;
					}
				}
			}
		}
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


function scrape(doc, _url) {
	var json = ZU.xpathText(doc, '//script[@type="application/ld+json"]');
	var objects = JSON.parse(json);
	var videoObject;
	for (var i = 0; i < objects.length; i++) {
		if (objects[i]["@type"] == "VideoObject") {
			videoObject = objects[i];
		}
	}
	var item = new Zotero.Item("videoRecording");
	item.title = videoObject.name;
	item.url = videoObject.url;
	item.abstractNote = videoObject.description;
	item.runningTime = videoObject.duration;
	item.date = videoObject.uploadDate;
	var author = videoObject.author;
	if (author) {
		item.creators.push(ZU.cleanAuthor(author.name, "author"));
	}
	var keywords = videoObject.keywords;
	if (keywords) {
		var tags = keywords.replace('[', '').replace(']', '').split(',');
		for (var j = 0; j < tags.length; j++) {
			item.tags.push(tags[j]);
		}
	}
	item.attachments.push({
		title: "Snapshot",
		document: doc
	});
	
	item.complete();
}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://vimeo.com/search?q=cello",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://vimeo.com/31179423",
		"items": [
			{
				"itemType": "videoRecording",
				"title": "Strings: J.S. Bach - Cello Suite No. 1 - Prelude",
				"creators": [
					{
						"firstName": "Alexander",
						"lastName": "Chen",
						"creatorType": "author"
					}
				],
				"date": "2011-10-26T22:29:03-04:00",
				"abstractNote": "Strings (2011) by Alexander Chen visualizes the first Prelude from Bach&#039;s Cello Suites. Using the math behind string length and pitch, it came from a simple&hellip;",
				"libraryCatalog": "Vimeo",
				"runningTime": "PT00H02M57S",
				"shortTitle": "Strings",
				"url": "https://vimeo.com/31179423",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					"art",
					"audio",
					"classical",
					"experimental",
					"html5",
					"interactive",
					"music",
					"sound",
					"visualization"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://vimeo.com/search?q=zotero",
		"items": "multiple"
	}
]
/** END TEST CASES **/
