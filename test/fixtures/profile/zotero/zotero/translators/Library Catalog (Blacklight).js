{
	"translatorID": "fc54af5d-736c-4dfc-96ab-182df76b5fa3",
	"label": "Library Catalog (Blacklight)",
	"creator": "Sebastian Karcher",
	"target": "^https?://(catalog\\.libraries\\.psu|clio\\.columbia|searchworks\\.stanford|search\\.library\\.brown)\\.edu/(view|catalog|\\?search)",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2020-11-03 01:34:52"
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


// attr()/text() v2
// eslint-disable-next-line
function attr(docOrElem,selector,attr,index){var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector);return elem?elem.getAttribute(attr):null}function text(docOrElem,selector,index){var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector);return elem?elem.textContent:null}

function detectWeb(doc, url) {
	if (/\/(view|catalog)\/[a-z\d]+/.test(url) && (attr(doc, 'link[title="marcxml"]', 'href') || attr(doc, 'link[title="mods"]', 'href'))) {
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
	var rows = doc.querySelectorAll('div#documents a[data-context-href*="/"]');
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
			if (items) ZU.processDocuments(Object.keys(items), scrape);
		});
	}
	else {
		scrape(doc, url);
	}
}

function scrape(doc, url) {
	var marcXML = attr(doc, 'link[title="marcxml"]', 'href');
	var mods = attr(doc, 'link[title="mods"]', 'href');
	// Z.debug(marcXML);
	if (marcXML) {
		ZU.doGet(marcXML, function (text) {
			var translator = Zotero.loadTranslator("import");
			translator.setTranslator("edd87d07-9194-42f8-b2ad-997c4c7deefd");
			translator.setString(text);
			translator.setHandler("itemDone", function (obj, item) {
				item.attachments.push({
					title: "Library Catalog Link",
					url: url,
					snapshot: false
				});
				item.complete();
			});
			translator.translate();
		});
	}
	else if (mods) {
		ZU.doGet(mods, function (text) {
			var translator = Zotero.loadTranslator("import");
			translator.setTranslator("0e2235e7-babf-413c-9acf-f27cce5f059c");
			translator.setString(text);
			translator.setHandler("itemDone", function (obj, item) {
				item.attachments.push({
					title: "Library Catalog Link",
					url: url,
					snapshot: false
				});
				item.complete();
			});
			translator.translate();
		});
	}
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://searchworks.stanford.edu/view/9968493",
		"items": [
			{
				"itemType": "book",
				"title": "Test marketing",
				"creators": [
					{
						"firstName": "Hans",
						"lastName": "Sittenfeld",
						"creatorType": "author"
					}
				],
				"date": "1967",
				"callNumber": "HF5415.2 .S513",
				"language": "eng",
				"libraryCatalog": "Library Catalog (Blacklight)",
				"numPages": "3",
				"place": "London",
				"publisher": "Business Publications",
				"series": "An Advertiser's weekly marketing book",
				"attachments": [
					{
						"title": "Library Catalog Link",
						"snapshot": false
					}
				],
				"tags": [
					{
						"tag": "Test marketing"
					}
				],
				"notes": [
					{
						"note": "Translation of Der Testmarkt; Instrument des Marketing"
					}
				],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://clio.columbia.edu/catalog/499302",
		"items": [
			{
				"itemType": "book",
				"title": "Palladio: essai critique, avec douze dessins de l'auteur",
				"creators": [
					{
						"firstName": "G. M.",
						"lastName": "Cantacuzino",
						"creatorType": "author"
					}
				],
				"date": "1928",
				"callNumber": "AA521 P1 C16",
				"extra": "OCLC: 77791934",
				"libraryCatalog": "Library Catalog (Blacklight)",
				"numPages": "91",
				"place": "Bucarest",
				"publisher": "Cartae românească",
				"shortTitle": "Palladio",
				"attachments": [
					{
						"title": "Library Catalog Link",
						"snapshot": false
					}
				],
				"tags": [
					{
						"tag": "Palladio, Andrea"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://catalog.libraries.psu.edu/catalog/6849525",
		"items": [
			{
				"itemType": "book",
				"title": "Test No. 227: Terrestrial Plant Test: Vegetative Vigour Test",
				"creators": [
					{
						"lastName": "Organisation for Economic Co-operation and Development",
						"creatorType": "editor",
						"fieldMode": true
					}
				],
				"date": "2006",
				"ISBN": "9789264067295",
				"abstractNote": "This Test Guideline is designed to assess effects on vegetative vigour of terrestrial plants following above-ground exposure by general chemicals, biocides and crop protection products. The test can be conducted in order to determine the dose-response curve, or at a single concentration/rate as a limit test (range finding test is carried out depending on the results) according to the aim of the study. Plants are grown from seed usually to the 2- to 4- true leaf stage. Test substance is then sprayed on the plant and leaf surfaces at appropriate rate(s). After the application, the plants are evaluated against untreated control plants for effects on vigour and growth at various time intervals through 21 - 28 days from treatment. This study includes measurement of biomass of surviving plants (dry or fresh shoot weight, shoot height), visible detrimental effects on different parts of the plant, visual phytotoxicity and mortality (daily during the study) Appropriate statistical analysis are used to obtain an effective concentration ECx or an effective application rate ERx for the most sensitive parameter(s) of interest. Also, the no observed effect concentration (NOEC) and lowest observed effect concentration (LOEC) can be calculated in this test",
				"libraryCatalog": "Library Catalog (Blacklight)",
				"place": "Place of publication not identified",
				"publisher": "OECD Publishing",
				"series": "OECD Guidelines for the Testing of Chemicals, Section 2: Effects on Biotic Systems",
				"shortTitle": "Test No. 227",
				"url": "http://ezaccess.libraries.psu.edu/login?url=http://dx.doi.org/10.1787/9789264067295-en",
				"attachments": [
					{
						"title": "Library Catalog Link",
						"snapshot": false
					}
				],
				"tags": [
					{
						"tag": "Environment"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://catalog.libraries.psu.edu/?search_field=all_fields&q=test",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://clio.columbia.edu/catalog?q=testing&search_field=all_fields&commit=Search",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://searchworks.stanford.edu/catalog?utf8=%E2%9C%93&search_field=search&q=data",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://search.library.brown.edu/catalog/b1629621",
		"items": [
			{
				"itemType": "book",
				"title": "Qualitative analysis",
				"creators": [
					{
						"firstName": "William",
						"lastName": "Wardlaw",
						"creatorType": "author"
					},
					{
						"firstName": "Frederick William",
						"lastName": "Pinkard",
						"creatorType": "author"
					}
				],
				"date": "1928",
				"callNumber": "QD81 .W27",
				"libraryCatalog": "Library Catalog (Blacklight)",
				"numPages": "166",
				"place": "London, New York [etc.]",
				"publisher": "Longmans, Green and Co. Ltd",
				"attachments": [
					{
						"title": "Library Catalog Link",
						"snapshot": false
					}
				],
				"tags": [
					{
						"tag": "Chemistry, Analytic"
					},
					{
						"tag": "Qualitative"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://search.library.brown.edu/catalog?utf8=%E2%9C%93&search_field=all_fields&q=qualitative",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://searchworks.stanford.edu/view/wg761wk9746",
		"items": [
			{
				"itemType": "artwork",
				"title": "Joan Baez, David Harris and son Gabriel leave La Tuna Federal Prison",
				"creators": [
					{
						"firstName": "Bob",
						"lastName": "Fitch",
						"creatorType": "author"
					}
				],
				"date": "1971-03-15",
				"archiveLocation": "Stanford University. Libraries. Department of Special Collections and University Archives; M1994",
				"libraryCatalog": "Library Catalog (Blacklight)",
				"rights": "There is no fee for non-commercial image downloading and use. Commercial use requires permission from the Department of Special Collections and University Archives prior to publishing or rebroadcasting any item or work, in whole or in part, held by the Department. More information can be found on our permissions page [http://library.stanford.edu/spc/using-collections/permission-publish].",
				"attachments": [
					{
						"title": "Library Catalog Link",
						"snapshot": false
					}
				],
				"tags": [
					{
						"tag": "Vietnam War, 1961-1975--Protest movements--United States"
					}
				],
				"notes": [
					{
						"note": "Digitized by Bob Fitch."
					}
				],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/
