{
	"translatorID": "513a53f5-b95e-4df6-a03e-3348d9ec9f44",
	"translatorType": 4,
	"label": "Internet Archive Wayback Machine",
	"creator": "Sean Takats, Philipp Zumstein",
	"target": "^https?://web\\.archive\\.org/web/",
	"minVersion": "1.0",
	"maxVersion": null,
	"priority": 100,
	"inRepository": true,
	"browserSupport": "gcsibv",
	"lastUpdated": "2021-06-12 13:40:00"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2008 Sean Takats

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
	if (url.match(/\/web\/\d{14}\/http/)) {
		return "webpage";
	}
	if (getSearchResults(doc, true)) {
		return "multiple";
	}
	else if (url.includes('/web/*/')) {
		Z.monitorDOMChanges(doc.querySelector('#react-wayback-search'));
	}
	return false;
}


function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = doc.querySelectorAll('.result-item-heading>a');
	for (let i = 0; i < rows.length; i++) {
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
			if (!items) {
				return;
			}
			var articles = [];
			for (let i in items) {
				articles.push(i);
			}
			ZU.processDocuments(articles, scrape);
		});
	}
	else {
		scrape(doc, url);
	}
}


function scrape(doc, url) {
	// create new webpage Item from page
	var newItem = new Zotero.Item("webpage");
	newItem.title = doc.title;
	newItem.url = url;
	// parse date and add
	var date = url.match(/\/web\/(\d{4})(\d{2})(\d{2})\d{6}\/http/);
	if (date) {
		newItem.date = [date[1], date[2], date[3]].join('-');
	}
	var pdfUrl = attr('#playback', 'src');
	// if snapshot is pdf, attach it
	// e.g. https://web.archive.org/web/20180316005456/https://www.foxtel.com.au/content/dam/foxtel/support/pdf/channel-packs.pdf
	if (url.endsWith(".pdf") && pdfUrl) {
		newItem.attachments = [{
			mimeType: "application/pdf",
			title: "PDF Snapshot",
			url: pdfUrl
		}];
	}
	else {
		// create snapshot
		newItem.attachments = [{
			url: doc.location.href,
			title: "Snapshot",
			mimeType: "text/html"
		}];
	}

	newItem.complete();
}


/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://web.archive.org/web/20110310073553/http://www.taz.de/",
		"items": [
			{
				"itemType": "webpage",
				"title": "taz.de",
				"creators": [],
				"date": "2011-03-10",
				"url": "http://web.archive.org/web/20110310073553/http://www.taz.de/",
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
		"url": "https://web.archive.org/web/*/zotero",
		"defer": true,
		"items": "multiple"
	}
]
/** END TEST CASES **/
