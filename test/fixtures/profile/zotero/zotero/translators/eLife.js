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
	"lastUpdated": "2021-01-28 15:20:33"
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
	var risURL = url.replace(/[#?].+/, "") + ".ris";
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
		"url": "https://elifesciences.org/articles/54967?utm_source=content_alert&utm_medium=email&utm_content=fulltext&utm_campaign=24-August-20-elife-alert",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "A community-maintained standard library of population genetic models",
				"creators": [
					{
						"lastName": "Adrion",
						"firstName": "Jeffrey R",
						"creatorType": "author"
					},
					{
						"lastName": "Cole",
						"firstName": "Christopher B",
						"creatorType": "author"
					},
					{
						"lastName": "Dukler",
						"firstName": "Noah",
						"creatorType": "author"
					},
					{
						"lastName": "Galloway",
						"firstName": "Jared G",
						"creatorType": "author"
					},
					{
						"lastName": "Gladstein",
						"firstName": "Ariella L",
						"creatorType": "author"
					},
					{
						"lastName": "Gower",
						"firstName": "Graham",
						"creatorType": "author"
					},
					{
						"lastName": "Kyriazis",
						"firstName": "Christopher C",
						"creatorType": "author"
					},
					{
						"lastName": "Ragsdale",
						"firstName": "Aaron P",
						"creatorType": "author"
					},
					{
						"lastName": "Tsambos",
						"firstName": "Georgia",
						"creatorType": "author"
					},
					{
						"lastName": "Baumdicker",
						"firstName": "Franz",
						"creatorType": "author"
					},
					{
						"lastName": "Carlson",
						"firstName": "Jedidiah",
						"creatorType": "author"
					},
					{
						"lastName": "Cartwright",
						"firstName": "Reed A",
						"creatorType": "author"
					},
					{
						"lastName": "Durvasula",
						"firstName": "Arun",
						"creatorType": "author"
					},
					{
						"lastName": "Gronau",
						"firstName": "Ilan",
						"creatorType": "author"
					},
					{
						"lastName": "Kim",
						"firstName": "Bernard Y",
						"creatorType": "author"
					},
					{
						"lastName": "McKenzie",
						"firstName": "Patrick",
						"creatorType": "author"
					},
					{
						"lastName": "Messer",
						"firstName": "Philipp W",
						"creatorType": "author"
					},
					{
						"lastName": "Noskova",
						"firstName": "Ekaterina",
						"creatorType": "author"
					},
					{
						"lastName": "Ortega-Del Vecchyo",
						"firstName": "Diego",
						"creatorType": "author"
					},
					{
						"lastName": "Racimo",
						"firstName": "Fernando",
						"creatorType": "author"
					},
					{
						"lastName": "Struck",
						"firstName": "Travis J",
						"creatorType": "author"
					},
					{
						"lastName": "Gravel",
						"firstName": "Simon",
						"creatorType": "author"
					},
					{
						"lastName": "Gutenkunst",
						"firstName": "Ryan N",
						"creatorType": "author"
					},
					{
						"lastName": "Lohmueller",
						"firstName": "Kirk E",
						"creatorType": "author"
					},
					{
						"lastName": "Ralph",
						"firstName": "Peter L",
						"creatorType": "author"
					},
					{
						"lastName": "Schrider",
						"firstName": "Daniel R",
						"creatorType": "author"
					},
					{
						"lastName": "Siepel",
						"firstName": "Adam",
						"creatorType": "author"
					},
					{
						"lastName": "Kelleher",
						"firstName": "Jerome",
						"creatorType": "author"
					},
					{
						"lastName": "Kern",
						"firstName": "Andrew D",
						"creatorType": "author"
					},
					{
						"lastName": "Coop",
						"firstName": "Graham",
						"creatorType": "editor"
					},
					{
						"lastName": "Wittkopp",
						"firstName": "Patricia J",
						"creatorType": "editor"
					},
					{
						"lastName": "Novembre",
						"firstName": "John",
						"creatorType": "editor"
					},
					{
						"lastName": "Sethuraman",
						"firstName": "Arun",
						"creatorType": "editor"
					},
					{
						"lastName": "Mathieson",
						"firstName": "Sara",
						"creatorType": "editor"
					}
				],
				"date": "June 23, 2020",
				"DOI": "10.7554/eLife.54967",
				"ISSN": "2050-084X",
				"abstractNote": "The explosion in population genomic data demands ever more complex modes of analysis, and increasingly, these analyses depend on sophisticated simulations. Recent advances in population genetic simulation have made it possible to simulate large and complex models, but specifying such models for a particular simulation engine remains a difficult and error-prone task. Computational genetics researchers currently re-implement simulation models independently, leading to inconsistency and duplication of effort. This situation presents a major barrier to empirical researchers seeking to use simulations for power analyses of upcoming studies or sanity checks on existing genomic data. Population genetics, as a field, also lacks standard benchmarks by which new tools for inference might be measured. Here, we describe a new resource, stdpopsim, that attempts to rectify this situation. Stdpopsim is a community-driven open source project, which provides easy access to a growing catalog of published simulation models from a range of organisms and supports multiple simulation engine backends. This resource is available as a well-documented python library with a simple command-line interface. We share some examples demonstrating how stdpopsim can be used to systematically compare demographic inference methods, and we encourage a broader community of developers to contribute to this growing resource.",
				"libraryCatalog": "eLife",
				"pages": "e54967",
				"publicationTitle": "eLife",
				"url": "https://doi.org/10.7554/eLife.54967",
				"volume": "9",
				"attachments": [
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					}
				],
				"tags": [
					{
						"tag": "open source"
					},
					{
						"tag": "reproducibility"
					},
					{
						"tag": "simulation"
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
