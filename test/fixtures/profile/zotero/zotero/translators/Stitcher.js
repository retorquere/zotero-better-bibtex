{
	"translatorID": "406d8800-17b2-498c-8e79-49311caedc5f",
	"translatorType": 4,
	"label": "Stitcher",
	"creator": "Sebastian Karcher",
	"target": "^https?://(www\\.)?stitcher\\.com/(search|show)/",
	"minVersion": "3.0",
	"maxVersion": null,
	"priority": 100,
	"inRepository": true,
	"browserSupport": "gcsibv",
	"lastUpdated": "2021-03-11 14:10:00"
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
	if (url.includes('/episode/')) {
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
	var rows = doc.querySelectorAll('a.episode-link');
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
	// Z.debug(configJSON)
	let title = text(doc, ".episodeTitle");
	let episodeInfo = text(doc, ".episodeInfo");
	if (episodeInfo) {
		var duration = episodeInfo.replace(/\|\n?.+/, "").trim();
		var date = episodeInfo.replace(/\.+\|/, "").trim();
	}
	let podcast = text(doc, ".showTitle");
	let abstract = text(doc, ".episodeDescription");
	var item = new Zotero.Item("podcast");
	item.title = title;
	item.seriesTitle = podcast;
	item.abstractNote = abstract;
	if (duration) item.runningTime = duration;
	if (date) item.date = ZU.strToISO(date);
	item.url = url;
	item.attachments.push({ document: doc, title: "Snapshot" });
	item.complete();
}


/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://www.stitcher.com/show/qualitative-conversations/episode/episode-3-the-qualitative-data-repository-dr-sebastian-karcher-52527940",
		"items": [
			{
				"itemType": "podcast",
				"title": "Episode 3: The Qualitative Data Repository & Dr. Sebastian Karcher",
				"creators": [],
				"abstractNote": "Learn about resources available through Syracuse University's Qualitative Data Repository (QDR), as your host, Dr. Jessica Lester, joins in conversation with QDR Associate Director, Dr. Sebastian Karcher.",
				"runningTime": "23 minutes",
				"seriesTitle": "Qualitative Conversations",
				"shortTitle": "Episode 3",
				"url": "https://www.stitcher.com/show/qualitative-conversations/episode/episode-3-the-qualitative-data-repository-dr-sebastian-karcher-52527940",
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
		"url": "https://www.stitcher.com/show/qualitative-conversations",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://www.stitcher.com/search/Zotero/episodes",
		"items": "multiple"
	}
]
/** END TEST CASES **/
