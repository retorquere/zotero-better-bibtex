{
	"translatorID": "1c5b122c-7e58-4cd5-932b-93f5ca0b7e1a",
	"translatorType": 4,
	"label": "National Post",
	"creator": "Adam Crymble and Abe Jellinek",
	"target": "^https://(www\\.)?(national|financial)post\\.com/",
	"minVersion": "1.0.0b4.r5",
	"maxVersion": null,
	"priority": 100,
	"inRepository": true,
	"browserSupport": "gcsibv",
	"lastUpdated": "2021-06-15 16:25:00"
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


function detectWeb(doc, _url) {
	let jsonText = text(doc, 'script[type="application/ld+json"]');
	if (jsonText && JSON.parse(jsonText)['@type'] == 'NewsArticle') {
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
	var rows = doc.querySelectorAll('a.article-card__link');
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

function scrape(doc, _url) {
	let item = new Zotero.Item('newspaperArticle');
	let json = JSON.parse(text(doc, 'script[type="application/ld+json"]'));
	item.title = json.headline;
	item.url = json.url;
	item.date = ZU.strToISO(json.dateModified || json.datePublished);
	item.abstractNote = json.description;
	item.publicationTitle = json.publisher.name;
	item.language = 'en';
	item.creators.push(ZU.cleanAuthor(json.author.name, 'author'));
	
	if (doc.querySelector('.wire-published-by__authors')) {
		item.creators = [];
		for (let author of text(doc, '.wire-published-by__authors').split(/, | and /)) {
			item.creators.push(ZU.cleanAuthor(author, 'author'));
		}
	}
	
	item.attachments.push({ title: 'Snapshot', document: doc });
	item.libraryCatalog = '';
	
	item.complete();
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://financialpost.com/news/economy/a-really-tough-sell-multinationals-shrug-off-g7-tax-assault",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "'A really tough sell': Multinationals shrug off G7 tax assault",
				"creators": [
					{
						"firstName": "Richard",
						"lastName": "Waters",
						"creatorType": "author"
					},
					{
						"firstName": "Emma",
						"lastName": "Agyemang",
						"creatorType": "author"
					},
					{
						"firstName": "Aziza",
						"lastName": "Kasumov",
						"creatorType": "author"
					},
					{
						"firstName": "Tim",
						"lastName": "Bradshaw",
						"creatorType": "author"
					}
				],
				"date": "2021-06-11",
				"abstractNote": "The stock market's response has been a collective yawn, while big tech gave a muted welcome to the plans",
				"language": "en",
				"publicationTitle": "Financial Post",
				"shortTitle": "'A really tough sell'",
				"url": "https://financialpost.com/news/economy/a-really-tough-sell-multinationals-shrug-off-g7-tax-assault",
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
		"url": "https://nationalpost.com/entertainment/weekend-post/massive-genre-nerd-kate-herron-calls-loki-a-love-letter-to-sci-fi",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "'Massive genre nerd' Kate Herron calls Loki a love letter to sci-fi",
				"creators": [
					{
						"firstName": "Chris",
						"lastName": "Knight",
						"creatorType": "author"
					}
				],
				"date": "2021-06-11",
				"abstractNote": "Riffs and references include Brazil, Dune, Blade Runner, The Hitchhiker's Guide to the Galaxy and (almost) Sesame Street",
				"language": "en",
				"publicationTitle": "National Post",
				"url": "https://nationalpost.com/entertainment/weekend-post/massive-genre-nerd-kate-herron-calls-loki-a-love-letter-to-sci-fi",
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
		"url": "https://nationalpost.com/search/?search_text=uefa&date_range=-30d&sort=score",
		"items": "multiple"
	}
]
/** END TEST CASES **/
