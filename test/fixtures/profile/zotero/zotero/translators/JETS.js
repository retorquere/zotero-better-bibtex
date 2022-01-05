{
	"translatorID": "e7bb82b1-cebf-432c-96df-1c5211f59927",
	"translatorType": 4,
	"label": "JETS",
	"creator": "Luke van der Hoeven",
	"target": "^https?://(www\\.)?etsjets\\.org/",
	"minVersion": "3.0",
	"maxVersion": null,
	"priority": 100,
	"inRepository": true,
	"browserSupport": "gcsibv",
	"lastUpdated": "2021-06-18 00:10:00"
}

/*
  ***** BEGIN LICENSE BLOCK *****

  Copyright © 2019-2021 Luke van der Hoeven
  This file is part of Zotero.

  Zotero is free software: you can redistribute it and/or modify
  it under the terms of the GNU Affero General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  Zotero is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU Affero General Public License for more details.

  You should have received a copy of the GNU Affero General Public License
  along with Zotero.  If not, see <http://www.gnu.org/licenses/>.

  ***** END LICENSE BLOCK *****
*/

function detectWeb(doc, url) {
	if (url.includes("/JETS_current") || url.includes("/JETS/") || url.includes("/node/")) {
		return "multiple";
	}
	return false;
}

function doWeb(doc, _url) {
	let results = getSearchResults(doc, false);
	if (results) {
		Zotero.selectItems(results, function (selected) {
			if (!selected) {
				return;
			}
			for (let url in selected) scrape(selected[url], url);
		});
	}
}

function scrape(titleAuthor, url) {
	let [title, author] = titleAuthor.split(". . .");
	let pdfTitle = url.split('/').pop();
	let [, issue, pages] = pdfTitle.split('_');
	
	var item = new Zotero.Item('journalArticle');
	item.url = url;
	item.journalAbbreviation = "J. Evang. Theol. Soc."; // ISO 4 abbreviation
	item.publicationTitle = "Journal of the Evangelical Theological Society";
	item.title = ZU.trimInternal(title);
	
	if (author) {
		item.creators.push(ZU.cleanAuthor(author, 'author', false));
	}
	
	if (pages.match(/[0-9]+(-[0-9]+)?/)) {
		item.pages = pages;
	}
	[item.volume, item.issue] = issue.split('.');

	item.attachments.push({
		title: "Full Text PDF",
		mimeType: 'application/pdf',
		url: url
	});
	
	item.complete();
}

function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	let results = doc.querySelectorAll('div.content p a');

	for (var result of results) {
		let href = result.href;
		let title = ZU.capitalizeTitle(ZU.trimInternal(result.innerText).toLowerCase(), true);

		if (!href || !title || !href.endsWith(".pdf")) continue;
		if (checkOnly) return true;

		found = true;
		items[href] = title;
	}

	return found ? items : false;
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://www.etsjets.org/JETS_current",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://www.etsjets.org/node/9799",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://www.etsjets.org/JETS/45_2",
		"items": "multiple"
	}
]
/** END TEST CASES **/
