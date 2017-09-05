{
	"translatorID": "d1ac3b4f-1aa7-4a76-a97e-cf3580a41c37",
	"label": "REDALYC",
	"creator": "Sebastian Karcher",
	"target": "^https?://(www.)?redalyc\\.(uaemex\\.mx|org)",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2017-06-04 09:52:26"
}

/*
	Translator
   Copyright (C) 2013 Sebastian Karcher

   This program is free software: you can redistribute it and/or modify
   it under the terms of the GNU Affero General Public License as published by
   the Free Software Foundation, either version 3 of the License, or
   (at your option) any later version.

   This program is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   GNU Affero General Public License for more details.

   You should have received a copy of the GNU Affero General Public License
   along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

function detectWeb(doc,url) {
	if (url.indexOf('articulo.oa?id=')>-1) {
		return "journalArticle";
	} else if (getSearchResults(doc, true)) {
		return "multiple";
	}
}


function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = ZU.xpath(doc, '//a[contains(@href, "articulo.oa?id=") and span]');
	for (var i=0; i<rows.length; i++) {
		var href = rows[i].href;
		var title = ZU.trimInternal(rows[i].textContent);
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
	//use Embedded Metadata
	translator.setTranslator("951c027d-74ac-47d4-a107-9c3069ab7b48");
	translator.setDocument(doc);
	translator.setHandler('itemDone', function(obj, item) {
		if (item.title == item.title.toUpperCase()){
			item.title = ZU.capitalizeTitle(item.title.toLowerCase(), true)
		}
		item.complete();
	});
	translator.getTranslatorObject(function(trans) {
		trans.itemType = "journalArticle";
		trans.doWeb(doc, url);
	});
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.redalyc.org/articulo.oa?id=32921102001",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Os partidos políticos brasileiros realmente não importam?",
				"creators": [
					{
						"firstName": "Maria do Socorro Sousa",
						"lastName": "Braga",
						"creatorType": "author"
					},
					{
						"firstName": "Jairo Pimentel",
						"lastName": "Jr",
						"creatorType": "author"
					}
				],
				"date": "2011",
				"ISSN": "1807-0191",
				"abstractNote": "Há décadas a constatação corrente no Brasil é de que os partidos pouco importam para explicar o comportamento dos eleitores brasileiros. Entretanto, esse cen...",
				"issue": "2",
				"language": "pt",
				"libraryCatalog": "www.redalyc.org",
				"pages": "271-303",
				"publicationTitle": "Opinião Pública",
				"url": "http://www.redalyc.org/articulo.oa?id=32921102001",
				"volume": "17",
				"attachments": [
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					},
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					"ESEB2010.>>>Political parties",
					"Partidos políticos",
					"comportamento eleitoral",
					"electoral behavior",
					"eleições presidenciais",
					"presidential ele...",
					"simpatia partidária"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.redalyc.org/BusquedaAutorPorNombre.oa?q=%22Maria%20do%20Socorro%20%20Sousa%20Braga%22",
		"items": "multiple"
	}
]
/** END TEST CASES **/