{
	"translatorID": "d2c0d2f4-42c0-41e0-8021-3b87b52b27d2",
	"label": "Landesbibliographie Baden-Württemberg",
	"creator": "Philipp Zumstein",
	"target": "^https?://(www\\.)?statistik\\.baden-wuerttemberg\\.de/LABI",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2018-11-01 18:12:21"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2018 Philipp Zumstein
	
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
	if (url.includes('/LABI.asp?')) {
		if (getSearchResults(doc, true)) {
			return "multiple";
		} else {
			var labels = doc.querySelectorAll('td>b');
			for (let label of labels) {
				if (label.textContent == 'ISBN:') {
					return "book";
				}
				if (label.textContent.includes('Enthalten')) {
					return "journalArticle";
				}
			}
			return "report";
		}
	}
}


function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = doc.querySelectorAll('td.right + td>a');
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
	var type = detectWeb(doc, url);
	var risURL = attr(doc, 'a.export', 'href');
	ZU.doGet(risURL, function(text) {
		// for coorperate bodies the place is in brackets sometimes
		// e.g. AU  - Universität <Mannheim>
		text = text.replace(/AU\s+-\s+(.*)\s+<(.*)>/g, "AU  - $1 $2");
		// Z.debug(text)
		var translator = Zotero.loadTranslator("import");
		translator.setTranslator("32d59d2d-b65a-4da4-b0a3-bdd3cfb979e7");
		translator.setString(text);
		translator.setHandler("itemDone", function(obj, item) {
			item.itemType = type;
			// fixes the added author information in the title,
			// which might be fixed by them in the future
			item.title = item.title.replace(/\/[^\/]*$/, '').replace(/ : /g, ': ');
			// number of pages land in pages for a book
			if (type == "book" && item.pages) {
				let m = item.pages.match(/(\d+) Seiten/);
				if (m) {
					item.numPages = m[1];
					delete item.pages;
				}
			}
			// for series time spans are tried to save as a date
			// e.g. 1972/73 - 1999/2000(2001); 2001/02(2003) -
			if (item.date && (item.date.includes(';') || item.date.includes('-'))) {
				item.notes.push({
					note: "Erscheinungsverlauf: " + item.date
				});
				let m = item.date.match(/(\d+)/);
				if (m) {
					item.date = m[1];
				} else {
					delete item.date;
				}
			}
			item.attachments.push({
				title: "Titel in der Landesbibliographie Baden-Württemberg",
				url: url,
				snapshot: false
			});
			item.complete();
		});

		translator.translate();
	});
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.statistik.baden-wuerttemberg.de/LABI/LABI.asp?HC=63amFSWsgYL&K1=10&T1=mannheim&TA=5",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Überfordert: Mozart: Don Giovanni: Mannheim, Nationaltheater",
				"creators": [
					{
						"lastName": "Schweikert",
						"firstName": "Uwe",
						"creatorType": "author"
					}
				],
				"date": "2018",
				"issue": "9/10",
				"libraryCatalog": "Landesbibliographie Baden-Württemberg",
				"pages": "56-57",
				"publicationTitle": "Opernwelt",
				"shortTitle": "Überfordert",
				"volume": "59",
				"attachments": [
					{
						"title": "Titel in der Landesbibliographie Baden-Württemberg",
						"snapshot": false
					}
				],
				"tags": [
					{
						"tag": "Mannheim"
					},
					{
						"tag": "Musik"
					},
					{
						"tag": "Nationaltheater Mannheim"
					},
					{
						"tag": "Oper"
					},
					{
						"tag": "Schauspiel, Oper, Operette und Ballett"
					}
				],
				"notes": [
					{
						"note": "<p>\"Premiere am 14. Juli 2018\" (Textende)</p>"
					}
				],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.statistik.baden-wuerttemberg.de/LABI/LABI.asp?HC=53amwU0Dwj6&K1=10&T1=mannheim&TA=12",
		"items": [
			{
				"itemType": "book",
				"title": "Hafen Mannheim 2018: 150 Jahre Mannheimer Akte",
				"creators": [
					{
						"lastName": "Mardo",
						"firstName": "Thommy",
						"creatorType": "author"
					}
				],
				"date": "2018",
				"ISBN": "9783864760938",
				"libraryCatalog": "Landesbibliographie Baden-Württemberg",
				"numPages": "208",
				"place": "Mannheim",
				"publisher": "Verlag Waldkirch",
				"shortTitle": "Hafen Mannheim 2018",
				"attachments": [
					{
						"title": "Titel in der Landesbibliographie Baden-Württemberg",
						"snapshot": false
					}
				],
				"tags": [
					{
						"tag": "Bildband"
					},
					{
						"tag": "Hafen"
					},
					{
						"tag": "Mannheim"
					},
					{
						"tag": "Mannheimer Rheinschiffahrtsakte"
					},
					{
						"tag": "Oberrheingebiet"
					},
					{
						"tag": "Rhein-Neckar-Hafen Mannheim"
					},
					{
						"tag": "Rheinschifffahrt"
					},
					{
						"tag": "Schifffahrt"
					},
					{
						"tag": "Wasserstraßen"
					}
				],
				"notes": [
					{
						"note": "<p>Text in deutsch, englisch und französisch</p>"
					}
				],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.statistik.baden-wuerttemberg.de/LABI/LABI.asp?HC=53anjtk4Avy&K1=10&T1=mannheim&EF=Z&TA=87",
		"items": [
			{
				"itemType": "report",
				"title": "Rechenschaftsbericht ... des Rektors",
				"creators": [
					{
						"lastName": "Universität Mannheim",
						"creatorType": "author",
						"fieldMode": 1
					}
				],
				"date": "2000",
				"libraryCatalog": "Landesbibliographie Baden-Württemberg",
				"place": "Mannheim",
				"attachments": [
					{
						"title": "Titel in der Landesbibliographie Baden-Württemberg",
						"snapshot": false
					}
				],
				"tags": [
					{
						"tag": "Mannheim"
					},
					{
						"tag": "Universität"
					},
					{
						"tag": "Universität Mannheim"
					},
					{
						"tag": "Universitäten"
					},
					{
						"tag": "Zeitschrift"
					}
				],
				"notes": [
					{
						"note": "Internetausg.: Universität <Mannheim>: Rechenschaftsbericht ... des Rektors"
					},
					{
						"note": "2000/01 u.d.T.: Universität <Mannheim>: Rechenschaftsbericht ... des geschäftsführenden Prorektors"
					},
					{
						"note": "Erscheinungsverlauf: 2000///(2001); 2001/02(2003) -"
					}
				],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/
