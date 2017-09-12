{
	"translatorID": "0cdc6a07-38cf-4ec1-b9d5-7a3c0cc89b15",
	"label": "OSTI Energy Citations",
	"creator": "Michael Berkowitz",
	"target": "^https?://www\\.osti\\.gov/(energycitations|scitech)",
	"minVersion": "1.0.0b4.r5",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2017-07-27 10:41:29"
}

/*
	Translator
   Copyright (C) 2012 Sebastian Karcher an Avram Lyon

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
	var xpathreport='//meta[@name="citation_technical_report_number"]';
	var xpath='//meta[@name="citation_journal_title"]'; 
	if (ZU.xpath(doc, xpath).length > 0) {
		return "journalArticle";
	}
	if (ZU.xpath(doc, xpathreport).length > 0) {
		return "report";
	}
			
	if (url.indexOf("search.jsp")!=-1){
		return "multiple";
	}

	return false;
}


function doWeb(doc,url)
{
	if (detectWeb(doc, url) == "multiple") {
		var hits = {};
		var urls = [];
		var results = ZU.xpath(doc,"//div[@class='title']//a[@itemprop='url']");
	
		for (var i in results) {
			hits[results[i].href] = results[i].textContent;
		}
		Z.selectItems(hits, function(items) {
			if (items == null) return true;
			for (var j in items) {
				urls.push(j);
			}
			ZU.processDocuments(urls, function (myDoc) { 
				doWeb(myDoc, myDoc.location.href) } );

		});
	} else {
		var pageno = ZU.xpathText(doc, '//div[@id="citation-details"]//tr/td[contains(text(), "Format")]/following-sibling::td')
		if (pageno && pageno.indexOf("Pages")!=-1) pageno = pageno.match(/Pages:\s*(\d+)/)
		var type = ZU.xpathText(doc, '//div[@id="citation-details"]//tr/td[contains(text(), "Resource Type")]/following-sibling::td');
		var itemtype;
		//Currently journal articles and reports work through metadata, thesis was an easy call
		//It's be easy to add other item types.
		if (type && type.indexOf("Thesis")!=-1) itemtype = "thesis";
		
		// We call the Embedded Metadata translator to do the actual work
		var translator = Zotero.loadTranslator("web");
		translator.setTranslator("951c027d-74ac-47d4-a107-9c3069ab7b48");
		translator.setHandler("itemDone", function(obj, item) {
				if (item.institution){
					var place = item.institution.match(/[A-Za-z]+,\s*[A-Z]{2}$/)
					if (place){
						item.place = place[0]
						item.institution = item.institution.replace(/[A-Za-z]+,\s*[A-Z]{2}$/, "")
					}
				}
				if (item.title = item.title.toUpperCase()) {
					item.title = ZU.capitalizeTitle(item.title.toLowerCase(), true)
				}
				if (pageno) item.numPages = pageno[1];
				
				if (itemtype) item.itemType = itemtype;
				item.complete();
				});
				
		translator.getTranslatorObject(function (obj) {
				obj.doWeb(doc, url);
				});
	}
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.osti.gov/scitech/biblio/893699",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Phase Transition from Hadronic Matter to Quark Matter",
				"creators": [
					{
						"firstName": "P.",
						"lastName": "Wang",
						"creatorType": "author"
					},
					{
						"firstName": "A. W.",
						"lastName": "Thomas",
						"creatorType": "author"
					},
					{
						"firstName": "A. G.",
						"lastName": "Williams",
						"creatorType": "author"
					}
				],
				"date": "2007/04/01",
				"DOI": "10.1103/PhysRevC.75.045202",
				"accessDate": "CURRENT_TIMESTAMP",
				"institution": "Thomas Jefferson National Accelerator Facility, Newport",
				"language": "English",
				"libraryCatalog": "www.osti.gov",
				"number": "JLAB-THY-06-545; DOE/ER/40150-4072",
				"place": "News, VA",
				"publicationTitle": "Phys.Rev.C",
				"url": "http://www.osti.gov/scitech/biblio/893699",
				"volume": "75",
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
					"nuclear matter",
					"physics of elementary particles and fields",
					"quark matter",
					"quarks",
					"superconductivity"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.osti.gov/scitech/biblio/1084504",
		"items": [
			{
				"itemType": "report",
				"title": "Superconductivity",
				"creators": [
					{
						"firstName": "Boris A.",
						"lastName": "Maiorov",
						"creatorType": "author"
					}
				],
				"date": "2013/06/19",
				"institution": "Los Alamos National Laboratory (LANL)",
				"language": "English",
				"libraryCatalog": "www.osti.gov",
				"reportNumber": "LA-UR-13-24526",
				"url": "https://www.osti.gov/scitech/biblio/1084504",
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
					"condensed matter physics",
					"superconductivity & superfluidity(75)"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/