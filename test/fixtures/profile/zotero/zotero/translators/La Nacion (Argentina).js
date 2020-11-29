{
	"translatorID": "44017484-f65e-4575-9a6e-d9050c27d18e",
	"translatorType": 4,
	"label": "La Nacion (Argentina)",
	"creator": "Sebastian Karcher",
	"target": "^https://(www|buscar)\\.lanacion\\.com\\.ar/",
	"minVersion": "3.0",
	"maxVersion": null,
	"priority": 100,
	"inRepository": true,
	"browserSupport": "gcsibv",
	"lastUpdated": "2020-11-24 04:10:00"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2020 Sebastian Karcher
	
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

function detectWeb(doc, url) { // eslint-disable-line no-unused-vars
	if (attr(doc, '[property="og:title"]', 'content')) {
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
	var rows = doc.querySelectorAll('#contenedor h2>a, .listado h2>a');
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
	
	item.date = attr(doc, 'meta[property="particle:published_time"]', 'content');
	item.title = attr(doc, 'meta[name="title"]', 'content');
	
	let authors = doc.querySelectorAll('section.autor');
	for (let author of authors) {
		author = author.textContent.replace(/LA NACION/, "").trim();
		// Z.debug(author);
		// Most Argentine names have two last names, one first name;
		let authorName = author.match(/^(.+?)\s(.+)$/);
		let firstName = authorName[1];
		let lastName = authorName[2];
		item.creators.push({ firstName: firstName, lastName: lastName, creatorType: "author" });
	}
	item.section = text(doc, '.categoria');
	
	item.attachments.push({ document: doc, title: "Snapshot" });
	item.complete();
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://www.lanacion.com.ar/economia/polemica-mensajes-gobierno-bordo-vuelos-aerolineas-argentinas-nid2270357",
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
				"ISSN": "0325-0946",
				"language": "es-AR",
				"libraryCatalog": "La Nacion (Argentina)",
				"place": "Buenos Aires",
				"publicationTitle": "La Nación",
				"section": "Economía",
				"shortTitle": "Aerolíneas Argentinas",
				"url": "https://www.lanacion.com.ar/economia/polemica-mensajes-gobierno-bordo-vuelos-aerolineas-argentinas-nid2270357",
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
		"url": "https://www.lanacion.com.ar/cultura/perla-suez-el-presente-nos-atraviesa-por-mas-que-escribamos-sobre-el-pasado-nid2513592",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Perla Suez.  \"El presente nos atraviesa por más que escribamos sobre el pasado \"",
				"creators": [
					{
						"firstName": "Natalia",
						"lastName": "Páez",
						"creatorType": "author"
					}
				],
				"ISSN": "0325-0946",
				"language": "es-AR",
				"libraryCatalog": "La Nacion (Argentina)",
				"place": "Buenos Aires",
				"publicationTitle": "La Nación",
				"section": "Cultura",
				"url": "https://www.lanacion.com.ar/cultura/perla-suez-el-presente-nos-atraviesa-por-mas-que-escribamos-sobre-el-pasado-nid2513592",
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
		"url": "https://www.lanacion.com.ar/politica/alberto-fernandez-nid2517783",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Alberto Fernández:  \"Cristina es una gran dirigente, pero no fue Perón \"",
				"creators": [],
				"ISSN": "0325-0946",
				"language": "es-AR",
				"libraryCatalog": "La Nacion (Argentina)",
				"place": "Buenos Aires",
				"publicationTitle": "La Nación",
				"section": "Política",
				"shortTitle": "Alberto Fernández",
				"url": "https://www.lanacion.com.ar/politica/alberto-fernandez-nid2517783",
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
		"url": "https://www.lanacion.com.ar/politica",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://buscar.lanacion.com.ar/kirchner",
		"items": "multiple"
	}
]
/** END TEST CASES **/
