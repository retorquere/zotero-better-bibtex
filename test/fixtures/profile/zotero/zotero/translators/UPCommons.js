{
	"translatorID": "0abd577b-ec45-4e9f-9081-448737e2fd34",
	"label": "UPCommons",
	"creator": "Sebastian Karcher, Philipp Zumstein",
	"target": "^https?://upcommons\\.upc\\.edu",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2019-06-11 13:35:57"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2017 Sebastian Karcher, Philipp Zumstein
	
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


var itemTypes = {
	Article: "journalArticle",
	Audiovisual: "film",
	Book: "book",
	Thesis: "thesis",
	"Working Paper": "report",
	"Technical Report": "report"
};


function detectWeb(doc, url) {
	var type = ZU.xpathText(doc, '//meta[@name="DC.type"]/@content');
	if (url.includes('/handle/') && type) {
		return itemTypes[type] || "document";
	}
	else if (getSearchResults(doc, true)) {
		return "multiple";
	}
	return false;
}


function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = ZU.xpath(doc, '//div[contains(@class, "row")]//h4[contains(@class, "artifact-title")]/a[contains(@href, "/handle/")]');
	for (var i = 0; i < rows.length; i++) {
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
			if (!items) return;

			var articles = [];
			for (var i in items) {
				articles.push(i);
			}
			ZU.processDocuments(articles, scrape);
		});
	}
	else {
		scrape(doc, url);
	}
}


function scrape(doc, url) {
	// We call the Embedded Metadata translator to do the actual work
	var translator = Zotero.loadTranslator("web");
	translator.setTranslator("951c027d-74ac-47d4-a107-9c3069ab7b48");
	translator.setHandler("itemDone", function (obj, item) {
		var type = ZU.xpathText(doc, '//meta[@name="DC.type"]/@content');
		if (itemTypes[type]) item.itemType = itemTypes[type];
		item.abstractNote = item.extra;
		item.extra = "";
		item.complete();
	});
	translator.getTranslatorObject(function (obj) {
		obj.doWeb(doc, url);
	});
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://upcommons.upc.edu/handle/2117/14979;jsessionid=AC2F8E675DC24715BCDE63BA8844A489?",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "The new pelagic operational observatory of the catalan sea (OOCS) for the multisensor coordinated measurement of atmospheric and oceanographic conditions",
				"creators": [
					{
						"firstName": "Antonio",
						"lastName": "Cruzado",
						"creatorType": "author"
					},
					{
						"firstName": "Nixon",
						"lastName": "Bahamón Rivera",
						"creatorType": "author"
					},
					{
						"firstName": "Jacopo",
						"lastName": "Aguzzi",
						"creatorType": "author"
					},
					{
						"firstName": "Raffaele",
						"lastName": "Bernardello",
						"creatorType": "author"
					},
					{
						"firstName": "Ahumada",
						"lastName": "Sempoal",
						"creatorType": "author"
					},
					{
						"firstName": "Miguel",
						"lastName": "Angel",
						"creatorType": "author"
					},
					{
						"firstName": "Joan",
						"lastName": "Puigdefàbregas Sagristà",
						"creatorType": "author"
					},
					{
						"firstName": "Jordi",
						"lastName": "Cateura Sabrí",
						"creatorType": "author"
					},
					{
						"firstName": "Eduardo",
						"lastName": "Muñoz",
						"creatorType": "author"
					},
					{
						"firstName": "Zoila",
						"lastName": "Velasquez Forero",
						"creatorType": "author"
					}
				],
				"date": "2011-12",
				"DOI": "10.3390/s111211251",
				"ISSN": "1424-8220",
				"issue": "12",
				"language": "eng",
				"libraryCatalog": "upcommons.upc.edu",
				"pages": "11251-11272",
				"publicationTitle": "Sensors",
				"rights": "Open Access",
				"url": "http://upcommons.upc.edu/handle/2117/14979",
				"volume": "11",
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
					"Catalunya -- Oceanografia",
					"Climatologia -- Mesurament",
					"Climatology",
					"Multisensor coordinated monitoring",
					"Numerical multiparametric modelling",
					"Ocean forecast",
					"Oceanografia -- Mesurament",
					"Oceanographic buoy",
					"Operational oceanography",
					"PAR",
					"Pelagic observatory",
					"Sensors",
					"Submarine canyons",
					"Western Mediterranean Sea",
					"Àrees temàtiques de la UPC::Enginyeria agroalimentària::Ciències de la terra i de la vida::Climatologia i meteorologia",
					"Àrees temàtiques de la UPC::Enginyeria civil::Geologia::Oceanografia",
					"Àrees temàtiques de la UPC::Enginyeria electrònica::Instrumentació i mesura::Sensors i actuadors"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://upcommons.upc.edu/handle/2117/5301?",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://upcommons.upc.edu/discover?scope=/&query=zotero&submit=",
		"items": "multiple"
	}
]
/** END TEST CASES **/
