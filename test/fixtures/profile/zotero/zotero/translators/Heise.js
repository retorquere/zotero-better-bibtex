{
	"translatorID": "54c3bec7-c1bc-4ffa-b103-53759845b6c4",
	"translatorType": 4,
	"label": "Heise",
	"creator": "optiprime, ApoB-100",
	"target": "^https?://www\\.heise\\.de/(suche|select)/",
	"minVersion": "3.0",
	"maxVersion": null,
	"priority": 100,
	"inRepository": true,
	"browserSupport": "gcsv",
	"lastUpdated": "2021-05-28 00:25:00"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Heise Translator
	Copyright © 2021 optiprime, ApoB-100

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

const magazines = {
	"c't": { ISSN: '0724-8679' },
	iX: { ISSN: '0935-9680' },
	"Technology Review": { ISSN: '1613-0138' },
	"Make Magazin": { ISSN: '2364-2548' },
	"Mac & i": { ISSN: '2193-8938' },
	"c't Fotografie": { ISSN: '2196-3878' },
	"Heise Magazine": { ISSN: '2196-3878' }
};
	
function detectWeb(doc, url) {
	if (url.includes('/select')) {
		return 'magazineArticle';
	}
	else if (url.includes('/suche')) {
		if (getSearchResults(doc, true)) {
			return 'multiple';
		}
	}
	return false;
}

function doWeb(doc, url) {
	if (detectWeb(doc, url) == 'multiple') {
		Zotero.selectItems(getSearchResults(doc, false), function (selected) {
			if (selected) {
				ZU.processDocuments(Object.keys(selected), scrape);
			}
		});
	}
	else {
		scrape(doc);
	}
}

function getSearchResults(doc, checkOnly) {
	let items = {};

	let articles = ZU.xpath(doc, '//article[contains(@class, "search-result__teaser")]');
	for (let i = 0; i < articles.length; ++i) {
		let link = ZU.xpath(articles[i], './/a[contains(@class, "a-article-teaser__link")]')[0];
		let title = ZU.xpath(articles[i], './/h1[contains(@class, "a-article-teaser__title")]')[0];
		if (!link || !title) {
			continue;
		}
		let href = link.href;
		let text = ZU.trimInternal(title.textContent);
		if (!href || !text) {
			continue;
		}
		if (checkOnly) {
			return true;
		}
		items[href] = text;
	}
	
	return (Object.keys(items).length != 0) ? items : false;
}

function scrape(doc) {
	let elements = ZU.xpath(doc, '//script[@type="application/ld+json"]');
	if (Array.isArray(elements)) {
		let data = JSON.parse(elements[0].textContent)[0];

		let item = new Zotero.Item('magazineArticle');
		item.publisher = data.publisher.name;
		item.publicationTitle = data.isPartOf.isPartOf.isPartOf.name;
		item.ISSN = magazines[item.publicationTitle].ISSN;
		item.volume = data.isPartOf.isPartOf.volumeNumber;
		item.issue = data.isPartOf.issueNumber;
		item.title = data.headline;
		if (item.title) {
			if (data.alternativeHeadline) {
				item.title += ': ' + data.alternativeHeadline;
			}
		}
		else {
			item.title = data.alternativeHeadline;
			if (!item.title) {
				item.title = '[Untitled]';
			}
		}
		item.shortTitle = data.headline;
		item.attachments = [{
			url: data.mainEntityOfPage,
			title: 'Snapshot',
			mimeType: 'text/html',
			snapshot: true
		}];
		item.creators = [];
		if (data.author.name) {
			item.creators.push(ZU.cleanAuthor(data.author.name, 'author'));
		}
		item.abstractNote = data.description;
		if (data.pageStart) {
			item.pages = data.pageStart;
			if (data.pageEnd) {
				item.pages += '-' + data.pageEnd;
			}
		}
		if (data.datePublished) {
			item.date = data.datePublished.split('T')[0];
		}
		item.language = data.inLanguage;
		if (data.keywords) {
			item.tags = data.keywords.split(',');
		}
		item.url = data.mainEntityOfPage;
		
		item.complete();
	}
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://www.heise.de/suche/?q=raspberry&sort_by=date&make=ct&provider=magazine",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://www.heise.de/select/ct/2021/7/2031014484690149069",
		"items": [
			{
				"itemType": "magazineArticle",
				"title": "Impressum",
				"creators": [
					{
						"firstName": "",
						"lastName": "c't",
						"creatorType": "author"
					}
				],
				"date": "2021-03-12",
				"ISSN": "0724-8679",
				"issue": 7,
				"language": "de",
				"libraryCatalog": "Heise",
				"pages": 193,
				"publicationTitle": "c't",
				"url": "https://www.heise.de/select/ct/2021/7/2031014484690149069",
				"volume": 2021,
				"attachments": [
					{
						"title": "Snapshot",
						"mimeType": "text/html",
						"snapshot": true
					}
				],
				"tags": [
					{
						"tag": "Impressum"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/
