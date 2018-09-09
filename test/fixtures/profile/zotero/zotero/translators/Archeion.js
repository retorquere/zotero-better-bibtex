{
	"translatorID": "f6717cbb-2771-4043-bde9-dbae19129bb3",
	"label": "Archeion",
	"creator": "Sebastian Karcher",
	"target": "^https?://www\\.(archeion|memorybc|albertaonrecord)\\.ca",
	"minVersion": "2.1.9",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2018-03-05 07:08:54"
}

/*
	***** BEGIN LICENSE BLOCK *****
	
	Copyright © 2012 Sebastian Karcher 
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


// attr()/text() v2
function attr(docOrElem,selector,attr,index){var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector);return elem?elem.getAttribute(attr):null;}function text(docOrElem,selector,index){var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector);return elem?elem.textContent:null;}


function detectWeb(doc, url) {
	if (url.includes('/informationobject/browse?') && getSearchResults(doc, true)) {
		return "multiple";
	} else if (url.match(/;rad$/)|| ZU.xpathText(doc, '//section[@id="action-icons"]//a[contains(@href, ";dc?sf_format=xml")]/@href')) {
		return "book";
	}
}


function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = doc.querySelectorAll('.search-result-description .title a');
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
	var dcUrl = url.replace(/;rad$/, "") + ";dc?sf_format=xml";
	Zotero.Utilities.doGet(dcUrl, function (text) {
		//Z.debug(text)
		text = text.replace(/\&([^a])/, "&amp;$1");
		text = text.replace(/xsi:type=\"dcterms:ISO639-3\"/, "");
		var translator = Zotero.loadTranslator("import");
		translator.setTranslator("5e3ad958-ac79-463d-812b-a86a9235c28f");
		translator.setString(text);
		translator.setHandler("itemDone", function (obj, item) {
			//the DC doesn't distinguish between personal and institutional authors - get them from the page and parse
			var authors = ZU.xpath(doc, '//div[@id="archivalDescriptionArea"]//div[@class="field"]/h3[contains(text(), "Name of creator")]/following-sibling::div/a');
			for (let i=0; i<authors.length; i++) {
				//remove location (in parentheses) from creators, since it often contains a comma that messes with author parsing
				item.creators[i] = ZU.cleanAuthor(authors[i].textContent.replace(/\(.+\)\s*$/, ""), "author", true);
				if (!item.creators[i].firstName) item.creators[i].fieldMode = 1;
			}
			//The Archive gets mapped to the relations tag - we want its name, not the description in archeion
			for (let i=0; i<item.seeAlso.length; i++) {
				if (item.seeAlso[i].indexOf("http://") == -1) {
					item.archive = item.seeAlso[i];
				}
			}
			item.seeAlso = [];
			//the RDF translator doesn't get the full identifier - get it from the page
			var loc = ZU.xpathText(doc, '//section[@id="titleAndStatementOfResponsibilityArea"]//div[@class="field"]/h3[contains(text(), "Reference code")]/following-sibling::div');
			//Z.debug(loc)
			item.archiveLocation = loc;
			item.libraryCatalog = "Archeion - MemoryBC - Aberta on Record";
			if (item.extra) item.notes.push(item.extra);
			item.extra = "";
			item.itemID = "";
			item.complete();
		});
		translator.getTranslatorObject(function(trans) {
			trans.defaultUnknownType = 'book';
			trans.doImport();
		});
	});
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://www.archeion.ca/informationobject/browse?topLod=0&query=montreal&repos=",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://www.archeion.ca/kydd-memorial-presbyterian-church-montreal-quebec-fonds;rad",
		"items": [
			{
				"itemType": "book",
				"title": "Kydd Memorial Presbyterian Church (Montreal, Quebec) fonds",
				"creators": [
					{
						"firstName": "Quebec)",
						"lastName": "Kydd Memorial Presbyterian Church (Montreal",
						"creatorType": "author"
					},
					{
						"firstName": "Quebec)",
						"lastName": "Rosemount Presbyterian Church (Montreal",
						"creatorType": "author"
					},
					{
						"firstName": "Quebec)",
						"lastName": "Fairmount-Taylor Presbyterian Church (Montreal",
						"creatorType": "author"
					},
					{
						"firstName": "Quebec)",
						"lastName": "Fairmount Presbyterian Church (Montreal",
						"creatorType": "author"
					},
					{
						"firstName": "Quebec)",
						"lastName": "Taylor Presbyterian Church (Montreal",
						"creatorType": "author"
					},
					{
						"firstName": "Quebec)",
						"lastName": "Mount Royal Presbyterian Church (Montreal",
						"creatorType": "author"
					},
					{
						"firstName": "Quebec)",
						"lastName": "Outremont Presbyterian Church (Montreal",
						"creatorType": "author"
					},
					{
						"firstName": "Quebec)",
						"lastName": "Outremont-Mount Royal Presbyterian Church (Montreal",
						"creatorType": "author"
					}
				],
				"date": "1908-1990",
				"abstractNote": "Fonds consists of registers, minutes and other records of Kydd Memorial Presbyterian Church (Montreal, Quebec) and of the records of the amalgamated Fairmount-Taylor Presbyterian Church (Montreal, Quebec) and of Outremont-Mount Royal Presbyterian Church (Montreal, Quebec). Records of Kydd Presbyterian Church consist of: Registers including Baptisms, Marriages and Burials (1927-1982); Court Orders (1982-1990); Session minutes (1928-1982); Congregational meetings (1948-1975); Communion Rolls (1927-1942, 1946-1978); Orders of Service (1928-1982); Annual Reports (1963-1981); Board of Managers Meeting minutes (1944-1978); a history (1975) and other records. Records of Fairmount Presbyterian Church consist of: Registers of Baptisms, Marriages and Burials (1910-1925); Session minutes (1910-1925); Communion Rolls (1910-1923) and Board of Managers Meeting minutes (1908-1922). Records of Fairmount-Taylor Presbyterian Church consist of: Registers of Baptisms, Marriages and Burials (1925-1969); Session minutes (1934-1962); Session Reports (1965-1968); Session Correspondence (1948-1970); Communion Rolls (1923-1966); Membership Lists (1967); Orders of Service (1967); Congregational minutes (1909-1969); Annual reports (1939); Board of Managers Reports (1964-1969); Auditor&#039;s Reports and Financial Statements (1932, 1950, 1966, 1969) and other records.",
				"archive": "The Presbyterian Church in Canada",
				"archiveLocation": "CA ON00313 CONG-147",
				"libraryCatalog": "Archeion - MemoryBC - Aberta on Record",
				"rights": "Notes Session minutes are restricted for a period of 50 years from the date they were written.",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://albertaonrecord.ca/informationobject/browse?topLod=0&query=alphabet&repos=",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://www.albertaonrecord.ca/northwest-mennonite-conference-fonds;rad",
		"items": [
			{
				"itemType": "book",
				"title": "Northwest Mennonite Conference fonds",
				"creators": [
					{
						"firstName": "Northwest Mennonite",
						"lastName": "Conference",
						"creatorType": "author"
					},
					{
						"firstName": "Mennonite Church Northwest",
						"lastName": "Conference",
						"creatorType": "author"
					},
					{
						"firstName": "Alberta-Saskatchewan Mennonite",
						"lastName": "Conference",
						"creatorType": "author"
					}
				],
				"date": "1949-2003",
				"abstractNote": "The fonds consists of four series: A) Alphabet Files, B) Congregations, C) Conferences, and D) Northwest Mennonite Conference Centennial Anniversary",
				"archive": "Mennonite Historical Society of Alberta",
				"archiveLocation": "MENN menn-22",
				"language": "the material is in english.",
				"libraryCatalog": "Archeion - MemoryBC - Aberta on Record",
				"rights": "Access to personal information in financial or medical records is subject to relevant legislation and MHSA privacy policy",
				"attachments": [],
				"tags": [
					"Alberta-Saskatchewan Mennonite Conference",
					"Mennonite Church. Northwest Conference",
					"Northwest Mennonite Conference",
					"Religions"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.archeion.ca/informationobject/browse?topLod=0&names=73890",
		"items": "multiple"
	}
]
/** END TEST CASES **/
