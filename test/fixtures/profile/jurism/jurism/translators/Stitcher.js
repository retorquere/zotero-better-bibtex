{
	"translatorID": "406d8800-17b2-498c-8e79-49311caedc5f",
	"label": "Stitcher",
	"creator": "Sebastian Karcher",
	"target": "^https?://(www\\.)?stitcher\\.com/(search\\?|podcast/)",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2020-10-11 15:20:22"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2020 Sebastian Karcher

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

// attr()/text() v2
// eslint-disable-next-line
function attr(docOrElem,selector,attr,index){var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector);return elem?elem.getAttribute(attr):null}function text(docOrElem,selector,index){var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector);return elem?elem.textContent:null}


function detectWeb(doc, url) {
	if (url.includes('/e/')) {
		return "podcast";
	}
	else if (getSearchResults(doc, true)) {
		return "multiple";
	}
	return false;
}

function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;

	// Podcast pages
	var rows = doc.querySelectorAll('li>div#episodeContainer a.title[href*="/e/"]');
	if (rows.length) {
		for (let row of rows) {
			let href = row.href;
			let title = ZU.trimInternal(row.textContent);
			if (!href || !title) continue;
			if (checkOnly) return true;
			found = true;
			items[href] = title;
		}
		return found ? items : false;
	}
	else {
		// Search results (episodes only)
		rows = doc.querySelectorAll('ul#episodeResultsList>li');
		for (let row of rows) {
			let href = attr(row, 'a', 'data-eid');
			let title = ZU.trimInternal(text(row, 'h4'));
			if (!href || !title) continue;
			if (checkOnly) return true;
			found = true;
			items["https://www.stitcher.com/s?eid=" + href] = title;
		}
		return found ? items : false;
	}
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

function scrape(doc, url) {
	let configJSON = ZU.xpathText(doc, '//script[contains(text(), "stitcherConfig")]');
	// Z.debug(configJSON)
	let title = configJSON.match(/title[\t\s]*:[\t\s]*"([^"]+)/);
	let date = configJSON.match(/pubDate[\t\s]*:[\t\s]*'([^']+)/);
	let podcast = configJSON.match(/showTitle"[\t\s]*:[\t\s]*"([^"]+)/);
	let duration = configJSON.match(/simpleDuration[\t\s]*:[\t\s]*"([^"]+)/);
	let abstract = text(doc, '#description-full p');
	var translator = Zotero.loadTranslator('web');
	// Embedded Metadata
	translator.setTranslator('951c027d-74ac-47d4-a107-9c3069ab7b48');
	// translator.setDocument(doc);

	translator.setHandler('itemDone', function (obj, item) {
		if (title) {
			item.title = title[1];
		}
		if (abstract) {
			item.abstractNote = abstract;
		}
		// Zotero will automatically move this to Extra
		if (date) {
			item.issued = date[1];
		}
		if (podcast) {
			item.seriesTitle = podcast[1];
		}
		if (duration) {
			item.runningTime = duration[1];
		}

		// tags are useless
		item.tags = [];
		item.complete();
	});

	translator.getTranslatorObject(function (trans) {
		trans.itemType = "podcast";
		trans.doWeb(doc, url);
	});
}


/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://www.stitcher.com/podcast/aera-qualitative-research-sig/qualitative-conversations/e/52527940",
		"items": [
			{
				"itemType": "podcast",
				"title": "Episode 3: The Qualitative Data Repository & Dr. Sebastian Karcher",
				"creators": [],
				"abstractNote": "Learn about resources available through Syracuse University's Qualitative Data Repository (QDR), as your host, Dr. Jessica Lester, joins in conversation with QDR Associate Director, Dr. Sebastian Karcher.",
				"language": "en",
				"runningTime": "23 minutes",
				"seriesTitle": "Qualitative Conversations",
				"shortTitle": "Episode 3",
				"url": "https://www.stitcher.com/s?eid=52527940",
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
		"url": "https://www.stitcher.com/podcast/qualitative-conversations",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://www.stitcher.com/search?q=zotero",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://www.stitcher.com/podcast/this-american-life/e/77684711",
		"items": [
			{
				"itemType": "podcast",
				"title": "717: Audience of One",
				"creators": [],
				"abstractNote": "At a time when going to the movies is mostly out of the question, we bring the movies to you.",
				"language": "en",
				"runningTime": "71 minutes",
				"seriesTitle": "This American Life",
				"shortTitle": "717",
				"url": "https://www.stitcher.com/s?eid=77684711",
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
