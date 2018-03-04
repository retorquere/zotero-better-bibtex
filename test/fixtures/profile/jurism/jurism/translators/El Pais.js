{
	"translatorID": "c3b97a6e-4879-4f77-9dbb-18a3fa2b2b81",
	"label": "El Pais",
	"creator": "Sebastian Karcher",
	"target": "^https?://([^.]\\.)?elpais\\.com/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2018-01-07 16:59:34"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2018 Sebastian Karchger
	
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
	if (url.search(/\d+_\d+\.html/) !== -1) {
		return "newspaperArticle";
	} else if ((url.includes("/buscador") || url.includes("/tag/")) && getSearchResults(doc, true)) {
		return "multiple";
	}
}


function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = doc.querySelectorAll('h2>a[href*=".html"]');
	for (let i=0; i<rows.length; i++) {
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
	var translator = Zotero.loadTranslator('web');
	// Embedded Metadata
	translator.setTranslator('951c027d-74ac-47d4-a107-9c3069ab7b48');
	// translator.setDocument(doc);
	
	translator.setHandler('itemDone', function (obj, item) {
		//improve author parsing
		item.creators = [];
		var authors = attr(doc, 'meta[name=author]', 'content');
		authors = authors.split(/\s*,\s/);
		//Z.debug(authors)
		for (let author of authors) {
			if (author !== "Agencias") {
				item.creators.push(ZU.cleanAuthor(author, "author"));
			}
		}
		item.publicationTitle = "El País";
		item.ISSN = "1134-6582";
		item.place = "Madrid";
		if (item.section) {
			item.section = ZU.capitalizeTitle(item.section.replace(/_/, " "), true);
		}
		item.complete();
	});

	translator.getTranslatorObject(function(trans) {
		trans.itemType = "newspaperArticle";
		trans.addCustomFields({
			"article:section" : "section"
		});
		trans.doWeb(doc, url);
	});
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://elpais.com/tag/estados_unidos/a/",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://politica.elpais.com/politica/2018/01/05/actualidad/1515170264_027943.html",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Juan Carlos I celebra su 80º cumpleaños en La Zarzuela junto a 70 invitados",
				"creators": [
					{
						"firstName": "Francesco",
						"lastName": "Rodella",
						"creatorType": "author"
					},
					{
						"firstName": "Alejandro",
						"lastName": "Romero",
						"creatorType": "author"
					}
				],
				"date": "2018-01-05",
				"ISSN": "1134-6582",
				"abstractNote": "El rey emérito acudirá este sábado con Felipe VI a la conmemoración de la Pascua militar en el Palacio Real",
				"language": "es",
				"libraryCatalog": "politica.elpais.com",
				"place": "Madrid",
				"publicationTitle": "El País",
				"section": "Politica",
				"url": "https://politica.elpais.com/politica/2018/01/05/actualidad/1515170264_027943.html",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					{
						"tag": "Aniversarios"
					},
					{
						"tag": "Casa Real"
					},
					{
						"tag": "Celebraciones"
					},
					{
						"tag": "Cumpleaños"
					},
					{
						"tag": "Eventos"
					},
					{
						"tag": "Familia Real"
					},
					{
						"tag": "Felipe VI"
					},
					{
						"tag": "Jefe de Estado"
					},
					{
						"tag": "Juan Carlos I"
					},
					{
						"tag": "Política"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://elpais.com/internacional/2018/01/06/mundo_global/1515256305_575545.html",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Hallada vacía la botella de vodka valorada en 1,1 millones de euros robada en Copenhague",
				"creators": [],
				"date": "2018-01-06",
				"ISSN": "1134-6582",
				"abstractNote": "Un obrero encontró el recipiente, hecho de oro y plata, y está aparentemente intacto y en poder de la policía",
				"language": "es",
				"libraryCatalog": "elpais.com",
				"place": "Madrid",
				"publicationTitle": "El País",
				"section": "Mundo Global",
				"url": "https://elpais.com/internacional/2018/01/06/mundo_global/1515256305_575545.html",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					{
						"tag": "Aguardiente"
					},
					{
						"tag": "Bebidas"
					},
					{
						"tag": "Bebidas alcohólicas"
					},
					{
						"tag": "Copenhague"
					},
					{
						"tag": "Dinamarca"
					},
					{
						"tag": "Escandinavia"
					},
					{
						"tag": "Fuerzas seguridad"
					},
					{
						"tag": "Policía"
					},
					{
						"tag": "Robos"
					},
					{
						"tag": "Vodka"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://elpais.com/buscador/?qt=carlos",
		"items": "multiple"
	}
]
/** END TEST CASES **/
