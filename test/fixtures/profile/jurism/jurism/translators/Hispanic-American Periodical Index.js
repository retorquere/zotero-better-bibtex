{
	"translatorID": "cc4b1ea4-3349-4bb4-af55-cce5e06e4669",
	"label": "Hispanic-American Periodical Index",
	"creator": "Sebastian Karcher",
	"target": "^https?://hapi\\.ucla\\.edu",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2018-09-22 17:06:48"
}

/*
	***** BEGIN LICENSE BLOCK *****
	
	Copyright © 2014 Sebastian Karcher
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
	if (url.includes("article/citation")) return "journalArticle";
	else if (url.includes("/search") || url.includes("/name/")) return "multiple";
}

function scrape(doc, url) {
	var id = url.match(/citation\/(\d+)/)[1];
	var token = ZU.xpathText(doc, '(//input[@name="csrf_token"])[1]/@value');
	//Z.debug(id);
	//Z.debug(token);
	var post = "csrf_token=" + token + "&articles=" + id;
	var get = "/article/export_for_endnote/";
	var abstract = ZU.xpathText(doc, '//div[@class="container full-citation"]//table//th[contains(text(), "Abstract")]/following-sibling::td');
	// Z.debug(abstract)
	Zotero.Utilities.HTTP.doPost(get, post, function(text) {
		// Z.debug(text);
		var translator = Zotero.loadTranslator("import");
		// Calling the RIS translator
		translator.setTranslator("32d59d2d-b65a-4da4-b0a3-bdd3cfb979e7");
		translator.setString(text);
		translator.setHandler("itemDone", function(obj, item) {
			item.notes = [];
			if (abstract) {
				item.abstractNote = abstract.replace(/\t+Abstract reproduced by permission of the journal\./, "").trim();
			}
			item.attachments = [{
				document: doc,
				title: "HAPI Snapshot"
			}];
			item.complete();
		});
		translator.translate();
	});

}

function doWeb(doc, url) {
	var articles = [];
	var items = {};
	if (detectWeb(doc, url) == "multiple") {
		var titles = ZU.xpath(doc, '//span[@class="title-link"]');
		for (var i = 0; i < titles.length; i++) {
			items[ZU.xpathText(titles[i], './@data-title')] = titles[i].textContent;
		}
		Zotero.selectItems(items, function(items) {
			if (!items) {
				return true;
			}
			for (var i in items) {
				articles.push("article/citation/" + i);
			}
			Zotero.Utilities.processDocuments(articles, scrape);
		});
	} else {
		scrape(doc, url);
	}
}
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://hapi.ucla.edu/article/citation/308849",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Millions of Small Battles: The Peronist Resistance in Argentina",
				"creators": [
					{
						"lastName": "Seveso",
						"firstName": "César",
						"creatorType": "author"
					}
				],
				"date": "2011",
				"accessDate": "CURRENT_TIMESTAMP",
				"issue": "3",
				"libraryCatalog": "Hispanic-American Periodical Index (Beta)",
				"pages": "313–327",
				"publicationTitle": "Bulletin of Latin American Research",
				"shortTitle": "Millions of Small Battles",
				"url": "http://onlinelibrary.wiley.com/journal/10.1111/%28ISSN%291470-9856/issues",
				"volume": "30",
				"attachments": [
					{
						"title": "HAPI Snapshot"
					}
				],
				"tags": [
					"Labor and laboring classes--Argentina--Political activity",
					"Peronism",
					"Social conflict--Argentina",
					"culture",
					"gender",
					"memory",
					"violence"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://hapi.ucla.edu/article/citation/344341",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Emilio Rabasa, narrador: la emergencia del pueblo en la representación narrativa del orden social de México",
				"creators": [
					{
						"lastName": "Martínez Carrizales",
						"firstName": "Leonardo",
						"creatorType": "author"
					}
				],
				"date": "2018",
				"abstractNote": "Este artículo estudia los parámetros de representación simbólica del orden social de México que el escritor y jurista Emilio Rabasa Estebanell construyó por medio de los códigos de la narrativa literaria. Esta preocupación desbordó por completo el dominio de las escrituras específicamente jurídicas, parlamentarias y periodísticas. En este sentido, en este trabajo se considera que la novela forma parte de una compleja atmósfera de escrituras, discursos, debates y representaciones simbólicas, fuera de la cual no puede interpretarse plenamente. En apoyo de la constitución legal (racional, universal, abstracta) del orden social de la nación mexicana, Emilio Rabasa acudió constantemente a los instrumentos y procedimientos intelectuales de la narratividad con el propósito de reducir al sentido propio de los instrumentos y recursos del orden letrado una realidad problemática, a veces caótica con respecto de las certezas y los ideales de la mentalidad liberal. En esa escritura se destaca el afán de describir, explicar y, en último término, comprender, desde el horizonte de enunciación del liberalismo, las poderosas tradiciones populares de México. En consecuencia, Rabasa llegó a plantear narrativamente la emergencia del pueblo como un actor social que cambiaría el orden simbólico de México establecido por los discursos de la modernidad política. Este proceso se estudia en La Guerra de Tres Años (1891).",
				"issue": "1",
				"libraryCatalog": "Hispanic-American Periodical Index (Beta)",
				"pages": "37-69",
				"publicationTitle": "Literatura Mexicana",
				"shortTitle": "Emilio Rabasa, narrador",
				"url": "https://revistas-filologicas.unam.mx/literatura-mexicana/index.php/lm/issue/archive",
				"volume": "29",
				"attachments": [
					{
						"title": "HAPI Snapshot"
					}
				],
				"tags": [
					{
						"tag": "19th century"
					},
					{
						"tag": "José Emilio Rabasa Estebanell--Criticism of specific works--La guerra de tres años"
					},
					{
						"tag": "La constitución y la dictadura"
					},
					{
						"tag": "Literature and society--Mexico"
					},
					{
						"tag": "Mexican fiction"
					},
					{
						"tag": "Politics in literature"
					},
					{
						"tag": "jurisprudence"
					},
					{
						"tag": "law"
					},
					{
						"tag": "liberalism"
					},
					{
						"tag": "narrative"
					},
					{
						"tag": "novels"
					},
					{
						"tag": "representations"
					},
					{
						"tag": "social order"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/
