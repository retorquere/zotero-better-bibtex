{
	"translatorID": "095239e7-c18c-4f45-a932-bcf4a9e48c08",
	"label": "Probing the Past",
	"creator": "Philipp Zumstein",
	"target": "^https?://chnm\\.gmu\\.edu/probateinventory/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2018-01-28 20:46:55"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2018 Philipp Zumstein
	
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
function attr(docOrElem,selector,attr,index){var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector);return elem?elem.getAttribute(attr):null;}function text(docOrElem,selector,index){var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector);return elem?elem.textContent:null;}


function detectWeb(doc, url) {
	if (url.includes('/document')) {
		return "book";
	} else if (getSearchResults(doc, true)) {
		return "multiple";
	}
}


function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = doc.querySelectorAll('#content tr');
	for (let i=0; i<rows.length; i++) {
		let href = attr(rows[i], 'td a', 'href');
		let title = ZU.trimInternal(rows[i].textContent);
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
				return true;
			}
			var articles = [];
			for (var i in items) {
				articles.push(i);
			}
			ZU.processDocuments(articles, scrape);
		});
	} else {
		scrape(doc, url);
	}
}


function scrape(doc, url) {
	var item = new Zotero.Item("book");

	var title = text(doc, 'h2');
	// e.g. Cumming, William
	var authorSplit = title.split(", ");
	var author = authorSplit[1] + " " + authorSplit[0];
	item.creators.push(ZU.cleanAuthor(author, "author"));
	item.title = "Probate of " + author;
	
	var info = doc.querySelectorAll('#browseinfo tr');
	for (let i=0; i<info.length; i++) {
		let label = text(info[i], 'td', 0);
		let value = text(info[i], 'td', 1);
		if (label=="Date:") item.date = ZU.strToISO(value);
		if (label=="County/City:") item.place = value.trim();
		if (label=="State:") item.place += ', ' + value.trim();
	}

	item.url = url;
	
	var pdfUrl = attr(doc, '#docControlPanel a', 'href');
	if (pdfUrl) {
		item.attachments.push({
			url: pdfUrl,
			title: 'Transcribed Record (PDF)'
		});
	}

	item.complete();
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://chnm.gmu.edu/probateinventory/document.php?estateID=76",
		"items": [
			{
				"itemType": "book",
				"title": "Probate of William Cumming",
				"creators": [
					{
						"firstName": "William",
						"lastName": "Cumming",
						"creatorType": "author"
					}
				],
				"date": "1752-07-02",
				"libraryCatalog": "Probing the Past",
				"place": "Annapolis, MD",
				"url": "http://chnm.gmu.edu/probateinventory/document.php?estateID=76",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://chnm.gmu.edu/probateinventory/browse.php?type=time&years=1740",
		"items": "multiple"
	}
]
/** END TEST CASES **/
