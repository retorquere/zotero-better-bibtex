{
	"translatorID": "44017484-f65e-4575-9a6e-d9050c27d18e",
	"translatorType": 4,
	"label": "La Nación (Argentina)",
	"creator": "Sebastian Karcher and Abe Jellinek",
	"target": "^https://www\\.lanacion\\.com\\.ar/",
	"minVersion": "3.0",
	"maxVersion": null,
	"priority": 100,
	"inRepository": true,
	"browserSupport": "gcsibv",
	"lastUpdated": "2021-06-15 16:25:00"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2020-2021 Sebastian Karcher and Abe Jellinek
	
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


function detectWeb(doc, url) { // eslint-disable-line no-unused-vars
	if (doc.querySelector('#queryly_resultscontainer') && getSearchResults(doc, true)) {
		return "multiple";
	}
	if (doc.querySelector('script#Schema_NewsArticle')) {
		return "newspaperArticle";
	}
	return false;
}

function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = doc.querySelector('#queryly_resultscontainer')
		? doc.querySelectorAll('#queryly_resultscontainer .resultlink')
		: doc.querySelectorAll('article h2 a');
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
	let json = JSON.parse(text(doc, 'script#Schema_NewsArticle'));
	
	var item = new Zotero.Item("newspaperArticle");
	item.ISSN = "0325-0946";
	let canonical = attr(doc, 'link[rel="canonical"]', 'href');
	if (canonical) {
		item.url = canonical;
	}
	else {
		item.url = url;
	}
	item.publicationTitle = "La Nación";
	item.language = "es-AR";
	item.place = "Buenos Aires";
	
	item.date = ZU.strToISO(json.dateModified || json.datePublished);
	item.title = attr(doc, 'meta[property="og:title"]', 'content');
	
	for (let author of json.author || json.creator) {
		author = author.replace(/LA NACION/, "").trim();
		// Z.debug(author);
		// Most Argentine names have two last names, one first name;
		let authorName = author.match(/^(.+?)\s(.+)$/);
		if (!authorName || author == 'Redacción LA NACION') {
			item.creators.push({ lastName: authorName, creatorType: "author", fieldMode: 1 });
		}
		else {
			let firstName = authorName[1];
			let lastName = authorName[2];
			item.creators.push({ firstName: firstName, lastName: lastName, creatorType: "author" });
		}
	}
	item.section = json.articleSection;
	
	item.attachments.push({ document: doc, title: "Snapshot" });
	item.complete();
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://www.lanacion.com.ar/economia/polemica-mensajes-gobierno-bordo-vuelos-aerolineas-argentinas-nid2270357/",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Aerolíneas Argentinas: sancionarán a los pilotos que usan los vuelos para criticar al Gobierno",
				"creators": [
					{
						"firstName": "Alan",
						"lastName": "Soria Guadalupe",
						"creatorType": "author"
					},
					{
						"firstName": "María",
						"lastName": "Julieta Rumi",
						"creatorType": "author"
					}
				],
				"date": "2019-07-23",
				"ISSN": "0325-0946",
				"language": "es-AR",
				"libraryCatalog": "La Nación (Argentina)",
				"place": "Buenos Aires",
				"publicationTitle": "La Nación",
				"section": "Economía",
				"shortTitle": "Aerolíneas Argentinas",
				"url": "https://www.lanacion.com.ar/economia/polemica-mensajes-gobierno-bordo-vuelos-aerolineas-argentinas-nid2270357/",
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
		"url": "https://www.lanacion.com.ar/cultura/perla-suez-el-presente-nos-atraviesa-por-mas-que-escribamos-sobre-el-pasado-nid2513592/",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Perla Suez. “El presente nos atraviesa por más que escribamos sobre el pasado”",
				"creators": [
					{
						"firstName": "Natalia",
						"lastName": "Páez",
						"creatorType": "author"
					}
				],
				"date": "2020-11-22",
				"ISSN": "0325-0946",
				"language": "es-AR",
				"libraryCatalog": "La Nación (Argentina)",
				"place": "Buenos Aires",
				"publicationTitle": "La Nación",
				"section": "Cultura",
				"url": "https://www.lanacion.com.ar/cultura/perla-suez-el-presente-nos-atraviesa-por-mas-que-escribamos-sobre-el-pasado-nid2513592/",
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
		"url": "https://www.lanacion.com.ar/politica/alberto-fernandez-nid2517783/",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Alberto Fernández: \"Cristina es una gran dirigente, pero no fue Perón\"",
				"creators": [],
				"date": "2020-11-23",
				"ISSN": "0325-0946",
				"language": "es-AR",
				"libraryCatalog": "La Nación (Argentina)",
				"place": "Buenos Aires",
				"publicationTitle": "La Nación",
				"section": "Política",
				"shortTitle": "Alberto Fernández",
				"url": "https://www.lanacion.com.ar/politica/alberto-fernandez-nid2517783/",
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
		"url": "https://www.lanacion.com.ar/politica/",
		"items": "multiple"
	}
]
/** END TEST CASES **/
