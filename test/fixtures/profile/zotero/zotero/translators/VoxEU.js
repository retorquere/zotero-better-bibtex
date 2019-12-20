{
	"translatorID": "508e8fb9-8a33-4095-844f-133cba7e7b54",
	"label": "VoxEU",
	"creator": "Sebastian Karcher",
	"target": "^https?://(www\\.)?voxeu\\.org",
	"minVersion": "1.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2019-06-12 14:39:41"
}

/*
	***** BEGIN LICENSE BLOCK *****

	VoxEU Translator
	Copyright © 2011, 2012 Sebastian Karcher

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
	if (url.includes('/article/')) {
		return "blogPost";
	}
	else if (getSearchResults(doc, true)) {
		return "multiple";
	}
	return false;
}


function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = doc.querySelectorAll('ul.search-results>li>h2>a');
	for (let i = 0; i < rows.length; i++) {
		let href = rows[i].href;
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
				return;
			}
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


function scrape(doc, url) {
	var item = new Zotero.Item("blogPost");
	item.title = text("h1.article-title");
	item.abstractNote = text("div.article-teaser");
	item.publicationTitle = "VoxEU.org";
	item.url = url;
	item.date = text("span.date-display-single");
	if (item.date) {
		item.date = ZU.strToISO(item.date);
	}
	var creators = doc.querySelectorAll("div.author span.field-content");
	for (let creator of creators) {
		item.creators.push(ZU.cleanAuthor(creator.textContent, "author"));
	}
	item.attachments = [{
		document: doc,
		title: "Snapshot"
	}];
	item.complete();
}


/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://voxeu.org/article/green-growth-evidence-energy-taxes-europe",
		"items": [
			{
				"itemType": "blogPost",
				"title": "Green growth? Evidence from energy taxes in Europe",
				"creators": [
					{
						"firstName": "Richard",
						"lastName": "Tol",
						"creatorType": "author"
					},
					{
						"firstName": "Seán",
						"lastName": "Lyons",
						"creatorType": "author"
					}
				],
				"date": "2011-11-12",
				"abstractNote": "Politicians around the world like to argue that ‘green growth’ will create jobs and stimulate innovation. This column examines the impact of energy taxes on business, with a dataset of 11 million European firms between 1996 and 2007. The results are mixed – it seems that dirty, smoke-filled growth may well be better for the firm’s workers and their customers.",
				"blogTitle": "VoxEU.org",
				"shortTitle": "Green growth?",
				"url": "https://voxeu.org/article/green-growth-evidence-energy-taxes-europe",
				"attachments": [
					{
						"title": "Snapshot"
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
		"url": "http://www.voxeu.org/search/node/Are%20migrants%20paid%20more%3F",
		"items": "multiple"
	}
]
/** END TEST CASES **/
