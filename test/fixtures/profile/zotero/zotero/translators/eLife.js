{
	"translatorID": "98ad3ad1-9d43-4b2e-bc36-172cbf00ba1d",
	"label": "eLife",
	"creator": "Aurimas Vinckevicius, Sebastian Karcher",
	"target": "^https?://(elife\\.)?elifesciences\\.org/(articles|search|subjects|archive)",
	"minVersion": "4.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsbv",
	"lastUpdated": "2018-09-27 13:36:20"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2018 Sebastian Karcher
	
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
	if (url.includes('/articles/')) {
		return "journalArticle";
	} else if (getSearchResults(doc, true)) {
		return "multiple";
	}
}


function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = doc.querySelectorAll('li.listing-list__item h4.teaser__header_text a');
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

	var risURL = url.replace(/#.+/, "") + ".ris";
	var pdfURL = attr(doc, 'a[data-download-type=pdf-article', 'href');
	// Z.debug("pdfURL: " + pdfURL);
	ZU.doGet(risURL, function(text) {
		var translator = Zotero.loadTranslator("import");
		translator.setTranslator("32d59d2d-b65a-4da4-b0a3-bdd3cfb979e7");
		translator.setString(text);
		translator.setHandler("itemDone", function(obj, item) {
			if (pdfURL) {
				item.attachments.push({
					url: pdfURL,
					title: "Full Text PDF",
					mimeType: "application/pdf"
				});
			}
			item.complete();
		});
		translator.translate();
	});
}
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://elifesciences.org/archive/2016/02",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://elifesciences.org/articles/16800",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "How open science helps researchers succeed",
				"creators": [
					{
						"lastName": "McKiernan",
						"firstName": "Erin C",
						"creatorType": "author"
					},
					{
						"lastName": "Bourne",
						"firstName": "Philip E",
						"creatorType": "author"
					},
					{
						"lastName": "Brown",
						"firstName": "C Titus",
						"creatorType": "author"
					},
					{
						"lastName": "Buck",
						"firstName": "Stuart",
						"creatorType": "author"
					},
					{
						"lastName": "Kenall",
						"firstName": "Amye",
						"creatorType": "author"
					},
					{
						"lastName": "Lin",
						"firstName": "Jennifer",
						"creatorType": "author"
					},
					{
						"lastName": "McDougall",
						"firstName": "Damon",
						"creatorType": "author"
					},
					{
						"lastName": "Nosek",
						"firstName": "Brian A",
						"creatorType": "author"
					},
					{
						"lastName": "Ram",
						"firstName": "Karthik",
						"creatorType": "author"
					},
					{
						"lastName": "Soderberg",
						"firstName": "Courtney K",
						"creatorType": "author"
					},
					{
						"lastName": "Spies",
						"firstName": "Jeffrey R",
						"creatorType": "author"
					},
					{
						"lastName": "Thaney",
						"firstName": "Kaitlin",
						"creatorType": "author"
					},
					{
						"lastName": "Updegrove",
						"firstName": "Andrew",
						"creatorType": "author"
					},
					{
						"lastName": "Woo",
						"firstName": "Kara H",
						"creatorType": "author"
					},
					{
						"lastName": "Yarkoni",
						"firstName": "Tal",
						"creatorType": "author"
					},
					{
						"lastName": "Rodgers",
						"firstName": "Peter",
						"creatorType": "editor"
					}
				],
				"date": "July 7, 2016",
				"DOI": "10.7554/eLife.16800",
				"ISSN": "2050-084X",
				"abstractNote": "Open access, open data, open source and other open scholarship practices are growing in popularity and necessity. However, widespread adoption of these practices has not yet been achieved. One reason is that researchers are uncertain about how sharing their work will affect their careers. We review literature demonstrating that open research is associated with increases in citations, media attention, potential collaborators, job opportunities and funding opportunities. These findings are evidence that open research practices bring significant benefits to researchers relative to more traditional closed practices.",
				"libraryCatalog": "eLife",
				"pages": "e16800",
				"publicationTitle": "eLife",
				"url": "https://doi.org/10.7554/eLife.16800",
				"volume": "5",
				"attachments": [
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					}
				],
				"tags": [
					{
						"tag": "open access"
					},
					{
						"tag": "open data"
					},
					{
						"tag": "open science"
					},
					{
						"tag": "open source"
					},
					{
						"tag": "research"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://elifesciences.org/search?for=open",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://elifesciences.org/subjects/biochemistry-chemical-biology",
		"items": "multiple"
	}
]
/** END TEST CASES **/
