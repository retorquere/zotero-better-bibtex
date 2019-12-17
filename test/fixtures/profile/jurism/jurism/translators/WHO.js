{
	"translatorID": "cd587058-6125-4b33-a876-8c6aae48b5e8",
	"label": "WHO",
	"creator": "Mario Trojan, Philipp Zumstein",
	"target": "^http://apps\\.who\\.int/iris/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2018-09-02 14:34:27"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2018 Mario Trojan

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
function attr(docOrElem,selector,attr,index){var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector);return elem?elem.getAttribute(attr):null;}
function text(docOrElem,selector,index){var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector);return elem?elem.textContent:null;}


function detectWeb(doc, url) {
	if (url.includes("/handle/") && text(doc, 'div.item-summary-view-metadata')) {
		var type = attr(doc, 'meta[name="DC.type"]', 'content');
		//Z.debug(type);
		if (type && type.includes("articles")) {
			return "journalArticle";
		}
		if (type && (type.includes("Book") || type.includes("Publications"))) {
			return "book";
		}
		return "report";
	} else if (getSearchResults(doc, true)) {
		return "multiple";
	}
}


function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;

	var rows = doc.querySelectorAll('h4.artifact-title>a');
	for (let i=0; i<rows.length; i++) {
		let href = rows[i].href;
		var title = rows[i].textContent;
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
	// copy meta tags in body to head
	var head = doc.getElementsByTagName('head');
	var metasInBody = ZU.xpath(doc, '//body/meta');
	for (let meta of metasInBody) {
		head[0].append(meta);
	}
	
	var type = detectWeb(doc, url);
	
	var translator = Zotero.loadTranslator('web');
	// Embedded Metadata
	translator.setTranslator('951c027d-74ac-47d4-a107-9c3069ab7b48');

	translator.setHandler('itemDone', function (obj, item) {
		if (item.publisher && !item.place && item.publisher.includes(' : ')) {
			let placePublisher = item.publisher.split(' : ');
			item.place = placePublisher[0];
			item.publisher = placePublisher[1];
		}
		
		var firstAuthor = attr(doc, 'meta[name="DC.creator"]', 'content');
		if (firstAuthor && !firstAuthor.includes(',')) {
			item.creators[0] = {
				"lastName": firstAuthor,
				"creatorType": "author",
				"fieldMode": true
			};
		}
		
		var descriptions = doc.querySelectorAll('meta[name="DC.description"]');
		// DC.description doesn't actually contain other useful content,
		// except possibly the number of pages
		for (let description of descriptions) {
			var numPages = description.content.match(/(([lxiv]+,\s*)?\d+)\s*p/);
			if (numPages) {
				if (ZU.fieldIsValidForType("numPages", item.itemType)) {
					item.numPages = numPages[1];

				}
				else if (!item.extra) {
					item.extra = "number-of-pages: " + numPages[1];
				}
				else {
					item.extra += "\nnumber-of-pages: " + numPages[1];
				}
				delete item.abstractNote;
			}
		}
	
		
		item.complete();
	});

	translator.getTranslatorObject(function(trans) {
		trans.itemType = type;
		trans.doWeb(doc, url);
	});
}


/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://apps.who.int/iris/handle/10665/70863?locale=ar",
		"items": [
			{
				"itemType": "report",
				"title": "Consensus document on the epidemiology of severe acute respiratory syndrome (SARS)",
				"creators": [
					{
						"lastName": "World Health Organization",
						"creatorType": "author",
						"fieldMode": true
					}
				],
				"date": "2003",
				"extra": "number-of-pages: 46",
				"institution": "World Health Organization",
				"language": "en",
				"libraryCatalog": "apps.who.int",
				"place": "Geneva",
				"reportNumber": "WHO/CDS/CSR/GAR/2003.11",
				"url": "http://apps.who.int/iris/handle/10665/70863",
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
					{
						"tag": "Communicable Diseases and their Control"
					},
					{
						"tag": "Disease outbreaks"
					},
					{
						"tag": "Epidemiologic surveillance"
					},
					{
						"tag": "Severe acute respiratory syndrome"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://apps.who.int/iris/handle/10665/272081",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Providing oxygen to children in hospitals: a realist review",
				"creators": [
					{
						"firstName": "Hamish",
						"lastName": "Graham",
						"creatorType": "author"
					},
					{
						"firstName": "Shidan",
						"lastName": "Tosif",
						"creatorType": "author"
					},
					{
						"firstName": "Amy",
						"lastName": "Gray",
						"creatorType": "author"
					},
					{
						"firstName": "Shamim",
						"lastName": "Qazi",
						"creatorType": "author"
					},
					{
						"firstName": "Harry",
						"lastName": "Campbell",
						"creatorType": "author"
					},
					{
						"firstName": "David",
						"lastName": "Peel",
						"creatorType": "author"
					},
					{
						"firstName": "Barbara",
						"lastName": "McPake",
						"creatorType": "author"
					},
					{
						"firstName": "Trevor",
						"lastName": "Duke",
						"creatorType": "author"
					}
				],
				"date": "2017-4-01",
				"DOI": "10.2471/BLT.16.186676",
				"ISSN": "0042-9686",
				"abstractNote": "288",
				"extra": "PMID: 28479624",
				"issue": "4",
				"language": "en",
				"libraryCatalog": "apps.who.int",
				"pages": "288-302",
				"publicationTitle": "Bulletin of the World Health Organization",
				"rights": "http://creativecommons.org/licenses/by/3.0/igo/legalcode",
				"shortTitle": "Providing oxygen to children in hospitals",
				"url": "http://apps.who.int/iris/handle/10665/272081",
				"volume": "95",
				"attachments": [
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					},
					{
						"title": "Snapshot"
					},
					{
						"title": "PubMed entry",
						"mimeType": "text/html",
						"snapshot": false
					}
				],
				"tags": [
					{
						"tag": "Systematic Reviews"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://apps.who.int/iris/handle/10665/273678",
		"items": [
			{
				"itemType": "book",
				"title": "Сборник руководящих принципов и стандартов ВОЗ: обеспечение оптимального оказания медицинских услуг пациентам с туберкулезом",
				"creators": [
					{
						"lastName": "Всемирная организация здравоохранения",
						"creatorType": "author",
						"fieldMode": true
					}
				],
				"date": "2018",
				"ISBN": "9789244514108",
				"language": "ru",
				"libraryCatalog": "apps.who.int",
				"numPages": "47",
				"publisher": "Всемирная организация здравоохранения",
				"rights": "CC BY-NC-SA 3.0 IGO",
				"shortTitle": "Сборник руководящих принципов и стандартов ВОЗ",
				"url": "http://apps.who.int/iris/handle/10665/273678",
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
					{
						"tag": "Delivery of Health Care"
					},
					{
						"tag": "Disease Management"
					},
					{
						"tag": "Guideline"
					},
					{
						"tag": "Infection Control"
					},
					{
						"tag": "Multidrug-Resistant"
					},
					{
						"tag": "Patient Care"
					},
					{
						"tag": "Reference Standards"
					},
					{
						"tag": "Tuberculosis"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://apps.who.int/iris/handle/10665/165097",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://apps.who.int/iris/discover?query=acupuncture",
		"items": "multiple"
	}
];
/** END TEST CASES **/
