{
	"translatorID": "b383df35-15e7-43ee-acd9-88fd62669083",
	"label": "Biblioteca Nacional de Maestros",
	"creator": "Sebastian Karcher",
	"target": "^https?://www\\.bnm\\.me\\.gov\\.ar/catalogo",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2020-06-22 00:23:44"
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


function detectWeb(doc, url) {
	// We'll go with Book throughout for simplicity's sake
	if (/\/Record\/\d+/.test(url)) {
		return "book";
	}
	else if (getSearchResults(doc, true)) {
		return "multiple";
	}
	return false;
}

function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = doc.querySelectorAll('.result div[class*="resultItemLine"]>a.title[href*="/Record/"]');
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
			if (items) scrape(Object.keys(items));
		});
	}
	else {
		scrape([url]);
	}
}


function constructMARCurls(urls) {
	let MARCurls = [];
	for (let url of urls) {
		url = url.replace(/\/(Details|Holdings)([#?].*)?/, ""); // remove panels
		MARCurls.push(url + "/Export?style=MARCXML");
	}
	return MARCurls;
}


function scrape(urls) {
	let MARCurls = constructMARCurls(urls);
	// Z.debug(MARCurls);
	ZU.doGet(MARCurls, function(text) {
		var translator = Zotero.loadTranslator("import");
		// Z.debug(text);
		// MARC XML
		translator.setTranslator("edd87d07-9194-42f8-b2ad-997c4c7deefd");
		translator.setString(text);
		translator.translate();
	});
}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.bnm.me.gov.ar/catalogo/Record/000042859/Details",
		"items": [
			{
				"itemType": "book",
				"title": "Los tests: manual de pruebas psicométricas de inteligencia y de aptitudes",
				"creators": [
					{
						"firstName": "Béla",
						"lastName": "Szekely",
						"creatorType": "author"
					},
					{
						"firstName": "Alfredo D.",
						"lastName": "Calcagno",
						"creatorType": "author"
					}
				],
				"date": "1950",
				"callNumber": "37.048",
				"edition": "2ª ed., con corr. y ampl",
				"libraryCatalog": "Biblioteca Nacional de Maestros",
				"numPages": "2",
				"place": "Buenos Aires",
				"publisher": "Editorial Kapelusz",
				"series": "Biblioteca de Ciencias de la Educación",
				"seriesNumber": "v. 3",
				"shortTitle": "Los tests",
				"attachments": [],
				"tags": [
					{
						"tag": "EVALUACION DEL ALUMNO"
					},
					{
						"tag": "PSICOMETRIA"
					},
					{
						"tag": "PSICOMETRIA"
					},
					{
						"tag": "TESTS DE INTELIGENCIA"
					},
					{
						"tag": "TESTS DE INTELIGENCIA"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.bnm.me.gov.ar/catalogo/Search/Results?join=AND&bool0%5B%5D=AND&lookfor0%5B%5D=borges&type0%5B%5D=AllFields&lookfor0%5B%5D=&type0%5B%5D=AllFields&lookfor0%5B%5D=&type0%5B%5D=AllFields&limit%5B%5D=&illustration=-1&daterange%5B%5D=publishDate&publishDatefrom=&publishDateto=&submit=Buscar",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://www.bnm.me.gov.ar/catalogo/Record/000074329",
		"items": [
			{
				"itemType": "book",
				"title": "Borges: cuentos",
				"creators": [
					{
						"firstName": "Jorge Luis",
						"lastName": "Borges",
						"creatorType": "author"
					},
					{
						"firstName": "María Adela",
						"lastName": "Renard",
						"creatorType": "author"
					}
				],
				"date": "1998",
				"ISBN": "9789501323016",
				"callNumber": "860(82)-3",
				"libraryCatalog": "Biblioteca Nacional de Maestros",
				"numPages": "200",
				"place": "Buenos Aires",
				"publisher": "Kapelusz",
				"series": "Grandes obras de la literatura universal",
				"shortTitle": "Borges",
				"attachments": [],
				"tags": [
					{
						"tag": "ANTOLOGIAS"
					},
					{
						"tag": "CRIOLLISMO"
					},
					{
						"tag": "CUENTOS FANTASTICOS"
					},
					{
						"tag": "CUENTOS POLICIALES"
					},
					{
						"tag": "LITERATURA DE ARGENTINA"
					}
				],
				"notes": [
					{
						"note": "Contiene referencias bibliográficas en p. 195"
					}
				],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/
