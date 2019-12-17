{
	"translatorID": "cdf8269c-86b9-4039-9bc4-9d998c67740e",
	"label": "Verniana-Jules Verne Studies",
	"creator": "Aurimas Vinckevicius, Emiliano Heyns",
	"target": "^https?://[^/]*verniana\\.org(:\\d+)?/volumes/\\d+/",
	"minVersion": "2.1.9",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2019-06-17 13:39:01"
}

/**
	Copyright (c) 2012-2019 Aurimas Vinckevicius, Emiliano Heyns
	
	This program is free software: you can redistribute it and/or
	modify it under the terms of the GNU Affero General Public License
	as published by the Free Software Foundation, either version 3 of
	the License, or (at your option) any later version.
	
	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
	Affero General Public License for more details.
	
	You should have received a copy of the GNU Affero General Public
	License along with this program. If not, see
	<http://www.gnu.org/licenses/>.
*/

// eslint-disable-next-line
function attr(docOrElem,selector,attr,index){var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector);return elem?elem.getAttribute(attr):null;}function text(docOrElem,selector,index){var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector);return elem?elem.textContent:null;}

function detectWeb(doc, _url) {
	if (doc.querySelector('ul.volume_toc li')) return 'multiple';
	if (doc.querySelector('.ref_on_top')) return 'journalArticle';
	return false;
}

function returnMatch(t, r) {
	let m = t.match(r);
	return m ? m[1] : '';
}

function scrape(doc, url) {
	let item = new Zotero.Item('journalArticle');
	item.url = url;
	item.title = ZU.capitalizeTitle(ZU.trimInternal(text(doc, '#content h1') || ''));

	item.creators = (text(doc, 'div#content p.author a') || text(doc, 'div#content p.author')).split(' et ').map(author => ZU.cleanAuthor(author.trim(), 'author'));
	item.abstractNote = text(doc, 'p.abstract');

	let refOnTop = (text(doc, 'div.ref_on_top') || '').trim();
	item.volume = returnMatch(refOnTop, /volume (\d+)/i);
	item.pages = returnMatch(refOnTop, /(\d+(?:–\d+)?)$/);

	item.ISSN = '1565-8872';

	item.attachments = [];
	let m = url.match(/^(https?:\/\/www\.verniana\.org\/volumes\/[0-9]+\/)[^/]+(\/[^.]+)\.html$/);
	if (m) {
		item.attachments = [
			{
				url: m[1] + 'A4' + m[2] + '.pdf',
				title: 'Full text PDF',
				mimeType: 'application/pdf'
			},
			{
				url: m[1] + 'HTML' + m[2] + '.html',
				title: 'Snapshot',
				mimeType: 'text/html'
			},
		];
	}

	item.complete();
}

function doWeb(doc, url) {
	if (detectWeb(doc, url) === 'multiple') {
		let items = {};
		for (let item of doc.querySelectorAll('ul.volume_toc li')) {
			let title = text(item, '.title');
			if (!title) continue;

			let a = Array.from(item.querySelectorAll('a')).find(a => a.textContent === 'HTML');
			if (!a) continue;

			let href = a.getAttribute('href');
			if (href) items[href] = title;
		}

		Zotero.selectItems(items, function (items) {
			ZU.processDocuments(Object.keys(items), scrape);
		});
	}
	else {
		scrape(doc, url);
	}
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.verniana.org/volumes/04/index.en.html",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://www.verniana.org/volumes/07/Resumes/AlcideMorgaz.html",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Alcide Poitrineux et Simon Morgaz: deux mises au point sur Jules Verne et le théâtre",
				"creators": [
					{
						"firstName": "Stefan",
						"lastName": "Schmidt",
						"creatorType": "author"
					},
					{
						"firstName": "Volker",
						"lastName": "Dehs",
						"creatorType": "author"
					}
				],
				"ISSN": "1565-8872",
				"abstractNote": "Jules Verne a collaboré en 1883 à une pièce qui ne fut jamais jouée, Les Erreurs d'Alcide. De récentes découvertes apportent plus de\nprécisions sur cette collaboration. Dans Famille-sans-nom, le nom de famille des héros est Morgaz. Quelques années après la parution du roman, une pièce\nintitulée Simon Morgaz fut jouée en 1896.",
				"libraryCatalog": "Verniana-Jules Verne Studies",
				"pages": "97–104",
				"url": "http://www.verniana.org/volumes/07/Resumes/AlcideMorgaz.html",
				"volume": "7",
				"shortTitle": "Alcide Poitrineux et Simon Morgaz",
				"attachments": [
					{
						"title": "Full text PDF",
						"mimeType": "application/pdf"
					},
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
		"url": "http://www.verniana.org/volumes/03/Abstracts/Garmt.html",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Sur la trace des “kritiskshalhen” du professeur Friedrich",
				"creators": [
					{
						"firstName": "Garmt de",
						"lastName": "Vries-Uiterweerd",
						"creatorType": "author"
					}
				],
				"ISSN": "1565-8872",
				"abstractNote": "The \"ultra X rays of professor Friedrich of Elbing\" that Jules Verne mentions in Le Testament d’un excentrique do not come from the\nauthor's imagination. The trace of their discovery can be followed from a meeting of the Vienna Academy of Science to an article in the Revue scientifique, which Jules\nVerne used to read.",
				"libraryCatalog": "Verniana-Jules Verne Studies",
				"pages": "125–130",
				"url": "http://www.verniana.org/volumes/03/Abstracts/Garmt.html",
				"volume": "3",
				"attachments": [
					{
						"title": "Full text PDF",
						"mimeType": "application/pdf"
					},
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
