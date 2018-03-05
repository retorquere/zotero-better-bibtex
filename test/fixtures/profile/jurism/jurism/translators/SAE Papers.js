{
	"translatorID": "2c98b8e6-6138-4b60-a999-15e3a7c8cb4b",
	"label": "SAE Papers",
	"creator": "Sebastian Karcher",
	"target": "^https?://(www|papers)\\.sae\\.org/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2017-07-07 05:40:25"
}

/*
	SAE Technical Papers Translator
	Copyright (C) 2012-2015 Sebastian Karcher

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
*/

function detectWeb(doc, url) {
	// Dryad search page
	if (ZU.xpathText(doc, '//meta[@name="citation_journal_title"]/@content')){
		return "journalArticle";
	}
	else if (ZU.xpathText(doc, '//meta[@name="citation_title"]/@content')){
		return "report";
	}
	else if (getSearchResults(doc, true)){
		return "multiple"
	}
	return false;
}

function doWeb(doc, url) {
	var itemType = detectWeb(doc, url);
	 if (itemType === 'multiple') {
		Zotero.selectItems(getSearchResults(doc), function(items) {
			if (!items) return true;
			var urls = [];
			for (var i in items) {
				urls.push(i);
			}
			ZU.processDocuments(urls, scrape);
		})
	}
	else {
		scrape(doc, url);
	}
}

function getSearchResults(doc, checkOnly) {
	var results = ZU.xpath(doc, '//div[@class="brw-i"]//div[@class="ct-b"]/a'),
	items = {},
	found = false;
	for (var i=0; i<results.length; i++) {
		var title = results[i].textContent;
		if (!title) continue;
		if (checkOnly) return true;
		found = true;
		title = title.trim();
		items[results[i].href] = title;
	}
	return found ? items : false;
}

function scrape(doc, url) {
	var abstract = ZU.xpathText(doc, '//div[@class="dt-scope" and div/div[contains(text(), "Abstract")]]//div[@class="dt-scope-c-content"]');
	var translator = Zotero.loadTranslator('web');
	// use the Embedded Metadata translator
	translator.setTranslator('951c027d-74ac-47d4-a107-9c3069ab7b48');
	translator.setDocument(doc);
	translator.setHandler('itemDone', function(obj, item) {
		if (item.itemType=="report"){
			item.reportType = "SAE Technical Paper";
			item.place = "Warrendale, PA";
			item.publisher = "SAE International"
		}
		//prevent all caps titles for some older titles
		if (item.title == item.title.toUpperCase()){
			item.title = ZU.capitalizeTitle(item.title, true)
		}
		if (abstract) item.abstractNote = abstract.trim();
		item.complete();
	});
	translator.getTranslatorObject(function(trans) {
		trans.doWeb(doc, url);
	});
}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://papers.sae.org/660289/",
		"items": [
			{
				"itemType": "report",
				"title": "Profile Milling of Titanium",
				"creators": [
					{
						"firstName": "A. Larry",
						"lastName": "Pickrell",
						"creatorType": "author"
					}
				],
				"date": "1966-02-01",
				"abstractNote": "Profile milling of titanium combines the problems of a relatively new manufacturing process with those of machining a new material. Titanium is not difficult to machine as compared to steel of equivalent strength; however, it must be properly processed or higher cutter costs and low production output will result. The process of profile milling can be greatly improved through the use of adaptive control. Two elements of the numerical control machining process, the part programmer and the machine operator, are sources of considerable process variability. Consequently, in the foreseeable future adaptive control concepts will be applied to the process to improve efficiency by reducing this “people” influence on machine output.",
				"extra": "DOI: 10.4271/660289",
				"institution": "SAE International",
				"language": "English",
				"libraryCatalog": "papers.sae.org",
				"place": "Warrendale, PA",
				"reportNumber": "660289",
				"reportType": "SAE Technical Paper",
				"url": "http://papers.sae.org/660289/",
				"attachments": [
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					},
					{
						"title": "Snapshot"
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
		"url": "http://papers.sae.org/materials/ceramics/papers/",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://papers.sae.org/2013-01-9096/",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Full Field Non-Contact Investigation of Deformation Fields in Fillet and Plug Welds",
				"creators": [
					{
						"firstName": "Kil Won",
						"lastName": "Song",
						"creatorType": "author"
					},
					{
						"firstName": "David",
						"lastName": "Roehrich",
						"creatorType": "author"
					},
					{
						"firstName": "Rani",
						"lastName": "El-Hajjar",
						"creatorType": "author"
					}
				],
				"date": "2014-01-15",
				"DOI": "10.4271/2013-01-9096",
				"ISSN": "1946-3987",
				"abstractNote": "Fillet and plug weld are commonly used in structural applications in commercial heavy vehicles. This paper is primarily concerned with an investigation of the full field deformations fields in fillet and plug welds using three dimensional digital image correlation (3D-DIC). Two identical vehicle parts are constructed using a fillet weld for one specimen, and a plug weld for the other. The specimens are loaded under quasi-static conditions with simultaneous measurement of load, displacements and strain gage measurements. Strain gage locations are selected based on the results of a finite element analysis model. 3D-DIC measurements are constructed using a two camera setup. Thus, 3D-DIC measurements are compared to strain gage measurements and finite element predictions. The effectiveness of the non-contact full field method is evaluated for application to studying the weld details considered and potential for fatigue damage and durability.",
				"issue": "1",
				"journalAbbreviation": "SAE Int. J. Mater. Manf.",
				"language": "English",
				"libraryCatalog": "papers.sae.org",
				"pages": "157-161",
				"publicationTitle": "SAE International Journal of Materials and Manufacturing",
				"url": "http://papers.sae.org/2013-01-9096/",
				"volume": "7",
				"attachments": [
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					},
					{
						"title": "Snapshot"
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
		"url": "http://papers.sae.org/540090/",
		"items": [
			{
				"itemType": "report",
				"title": "Combustion Effects",
				"creators": [
					{
						"firstName": "J. C.",
						"lastName": "Porter",
						"creatorType": "author"
					}
				],
				"date": "1954-01-01",
				"abstractNote": "The air standard cycle, the ideal fuel-air cycle and the fundamental concepts of combustion in a spark ignition engine are briefly described.The effect of combustion processes at various air fuel ratios on power, efficiency and composition of exhaust products are reviewed.It is recognized some degree of incomplete combustion is always present, and the effects of “poor” combustion on engine operations are discussed.",
				"extra": "DOI: 10.4271/540090",
				"institution": "SAE International",
				"language": "English",
				"libraryCatalog": "papers.sae.org",
				"place": "Warrendale, PA",
				"reportNumber": "540090",
				"reportType": "SAE Technical Paper",
				"url": "http://papers.sae.org/540090/",
				"attachments": [
					{
						"title": "Snapshot"
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
		"url": "http://www.sae.org/search/?content-type=%28%22PAPER%22%29&qt=effects&x=0&y=0",
		"items": "multiple"
	}
]
/** END TEST CASES **/