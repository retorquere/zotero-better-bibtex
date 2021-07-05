{
	"translatorID": "fc9b7700-b3cc-4150-ba89-c7e4443bd96d",
	"translatorType": 4,
	"label": "Financial Times",
	"creator": "Sebastian Karcher and Abe Jellinek",
	"target": "^https?://www\\.ft\\.com",
	"minVersion": "2.1.9",
	"maxVersion": null,
	"priority": 100,
	"inRepository": true,
	"browserSupport": "gcsibv",
	"lastUpdated": "2021-05-28 18:20:00"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2021 Abe Jellinek
	
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
	if (url.includes('/content/')) {
		return "newspaperArticle";
	}
	else if (getSearchResults(doc, true)) {
		return "multiple";
	}
	return false;
}

function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = doc.querySelectorAll('a.js-teaser-heading-link');
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

function scrape(_doc, url) {
	ZU.processDocuments(url.replace('www.ft.com/', 'amp.ft.com/'), scrapeAmp);
}

function scrapeAmp(doc, url) {
	let item = new Zotero.Item('newspaperArticle');
	
	let meta = [...doc.querySelectorAll('script[type="application/ld+json"]')]
		.map(elem => JSON.parse(elem.textContent))
		.find(json => json['@type'] != 'WebSite');
	if (!meta) {
		throw new Error("No article metadata (probably hit paywall)");
	}
	
	item.title = meta.headline;
	item.date = ZU.strToISO(meta.datePublished);
	item.abstractNote = meta.description
		|| text('.article-standfirst');
	// something funky is going on with the JSON-LD authors, so we'll just
	// parse from the HTML
	item.creators = [...doc.querySelectorAll('a.article-author-byline__author')]
		.map(link => ZU.cleanAuthor(link.innerText, 'author', false));
	item.publicationTitle = 'Financial Times';
	item.section = text('h2.primary-brand a')
		|| text('h2.primary-theme a');
	item.url = meta.mainEntityofPage;
	item.libraryCatalog = '';
	item.attachments.push({
		title: "Snapshot",
		url: item.url,
		mimeType: 'text/html',
		snapshot: true
	});
	item.complete();
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://www.ft.com/content/e57c04ba-c88a-4694-86b8-373c6393bf88",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Vonovia and Deutsche Wohnen to combine in €18bn real estate deal",
				"creators": [
					{
						"firstName": "Olaf",
						"lastName": "Storbeck",
						"creatorType": "author"
					},
					{
						"firstName": "Erika",
						"lastName": "Solomon",
						"creatorType": "author"
					}
				],
				"date": "2021-05-25",
				"abstractNote": "Group will own more than 500,000 flats in Germany as well as property in Sweden and Austria",
				"publicationTitle": "Financial Times",
				"url": "https://www.ft.com/content/e57c04ba-c88a-4694-86b8-373c6393bf88",
				"attachments": [
					{
						"title": "Snapshot",
						"mimeType": "text/html",
						"snapshot": true
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
		"url": "https://www.ft.com/content/08b9f78f-9436-3d59-8c4a-05b67cc3b706",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Coinbase wants to be “too big to fail”, lol",
				"creators": [
					{
						"firstName": "Jemima",
						"lastName": "Kelly",
						"creatorType": "author"
					}
				],
				"date": "2018-10-03",
				"publicationTitle": "Financial Times",
				"url": "https://www.ft.com/content/08b9f78f-9436-3d59-8c4a-05b67cc3b706",
				"attachments": [
					{
						"title": "Snapshot",
						"mimeType": "text/html",
						"snapshot": true
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
		"url": "https://www.ft.com/search?q=apple",
		"items": "multiple"
	}
]
/** END TEST CASES **/
