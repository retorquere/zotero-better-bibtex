{
	"translatorID": "d3b1d34c-f8a1-43bb-9dd6-27aa6403b217",
	"label": "YouTube",
	"creator": "Sean Takats, Michael Berkowitz, Matt Burton and Rintze Zelle",
	"target": "^https?://([^/]+\\.)?youtube\\.com/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsbv",
	"lastUpdated": "2019-08-11 18:43:54"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2015-2019 Sean Takats, Michael Berkowitz, Matt Burton and Rintze Zelle
	
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
function attr(docOrElem,selector,attr,index){var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector);return elem?elem.getAttribute(attr):null;}function text(docOrElem,selector,index){var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector);return elem?elem.textContent:null;}


function detectWeb(doc, url) {
	if (url.search(/\/watch\?(?:.*)\bv=[0-9a-zA-Z_-]+/) != -1) {
		return "videoRecording";
	}
	// Search results
	if ((url.includes("/results?") || url.includes("/playlist?") || url.includes("/user/"))
			&& getSearchResults(doc, true)) {
		return "multiple";
	}
	return false;
}

function getSearchResults(doc, checkOnly) {
	var links = doc.querySelectorAll('a.ytd-video-renderer, a.ytd-playlist-video-renderer');
	var items = {},
		found = false;
	for (var i = 0, n = links.length; i < n; i++) {
		var title = ZU.trimInternal(links[i].textContent);
		var link = links[i].href;
		if (!title || !link) continue;

		if (checkOnly) return true;

		found = true;
		items[link] = title;
	}
	return found ? items : false;
}

function doWeb(doc, url) {
	if (detectWeb(doc, url) != 'multiple') {
		scrape(doc, url);
	}
	else {
		Zotero.selectItems(getSearchResults(doc), function (items) {
			if (!items) return;

			var ids = [];
			for (var i in items) {
				ids.push(i);
			}
			ZU.processDocuments(ids, scrape);
		});
	}
}

function scrape(doc, url) {
	var item = new Zotero.Item("videoRecording");
	item.title = text(doc, '#info-contents h1.title');
	item.url = url;
	item.runningTime = text(doc, '#movie_player .ytp-time-duration');
	
	item.date = ZU.xpathText(doc, '//meta[@itemProp="datePublished"]/@content')
		|| ZU.xpathText(doc, '//span[contains(@class, "date")]');
	if (item.date) {
		item.date = ZU.strToISO(item.date);
	}
	var author = text(doc, '#meta-contents #owner-name');
	if (author) {
		item.creators.push({
			lastName: author,
			creatorType: "author",
			fieldMode: 1
		});
	}
	var description = doc.getElementById("description");
	if (description) {
		item.abstractNote = ZU.cleanTags(description.innerHTML);
	}
	
	item.complete();
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.youtube.com/results?search_query=zotero&oq=zotero&aq=f&aqi=g4&aql=&gs_sm=3&gs_upl=60204l61268l0l61445l6l5l0l0l0l0l247l617l1.2.1l4l0",
		"defer": true,
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://www.youtube.com/watch?v=pq94aBrc0pY",
		"defer": true,
		"items": [
			{
				"itemType": "videoRecording",
				"title": "Zotero Intro",
				"creators": [
					{
						"lastName": "Zoteron",
						"creatorType": "author",
						"fieldMode": 1
					}
				],
				"date": "2007-01-01",
				"abstractNote": "Zotero is a free, easy-to-use research tool that helps you gather and organize resources (whether bibliography or the full text of articles), and then lets you to annotate, organize, and share the results of your research. It includes the best parts of older reference manager software (like EndNote)—the ability to store full reference information in author, title, and publication fields and to export that as formatted references—and the best parts of modern software such as del.icio.us or iTunes, like the ability to sort, tag, and search in advanced ways. Using its unique ability to sense when you are viewing a book, article, or other resource on the web, Zotero will—on many major research sites—find and automatically save the full reference information for you in the correct fields.",
				"libraryCatalog": "YouTube",
				"runningTime": "2:52",
				"url": "https://www.youtube.com/watch?v=pq94aBrc0pY",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.youtube.com/playlist?list=PL793CABDF042A9514",
		"defer": true,
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://www.youtube.com/user/Zoteron",
		"defer": true,
		"items": "multiple"
	}
]
/** END TEST CASES **/
