{
	"translatorID": "de0eef58-cb39-4410-ada0-6b39f43383f9",
	"label": "Gemeinsamer Bibliotheksverbund ISBN",
	"creator": "Philipp Zumstein",
	"target": "",
	"minVersion": "4.0",
	"maxVersion": "",
	"priority": 99,
	"inRepository": true,
	"translatorType": 8,
	"browserSupport": "gcsibv",
	"lastUpdated": "2017-03-28 03:56:11"
}

/*
***** BEGIN LICENSE BLOCK *****

Copyright © 2015 Philipp Zumstein

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

function detectSearch(item) {
	return !!item.ISBN;
}

function doSearch(item) {
	var queryISBN = ZU.cleanISBN(item.ISBN);
	//search the ISBN over the SRU of the GBV, and take the result it as MARCXML
	//documentation: https://www.gbv.de/wikis/cls/SRU
	var url = "http://sru.gbv.de/gvk?version=1.1&operation=searchRetrieve&query=pica.isb=" + queryISBN + " AND pica.mat%3DB&maximumRecords=1";
	//Z.debug(url);
	ZU.doGet(url, function (text) {
		//Z.debug(text);
		var translator = Zotero.loadTranslator("import");
		translator.setTranslator("edd87d07-9194-42f8-b2ad-997c4c7deefd");
		translator.setString(text);
		translator.setHandler("itemDone", function (obj, item) {
			// Table of Contents = Inhaltsverzeichnis
			/* e.g.
			<datafield tag="856" ind1="4" ind2="2">
			  <subfield code="u">http://d-nb.info/1054452857/04</subfield>
			  <subfield code="m">DE-101</subfield>
			  <subfield code="3">Inhaltsverzeichnis</subfield>
			</datafield>
			*/
			var parser = new DOMParser();
			var xml = parser.parseFromString(text, "application/xml");
			var ns = {
				"marc": "http://www.loc.gov/MARC21/slim"
			};
			var tocURL = ZU.xpath(xml, '//marc:datafield[@tag="856"][ marc:subfield[text()="Inhaltsverzeichnis"] ]/marc:subfield[@code="u"]', ns);
			if (tocURL.length) {
				//Z.debug(tocURL[0].textContent);
				item.attachments = [{
					url: tocURL[0].textContent,
					title: "Table of Contents PDF",
					mimeType: "application/pdf"
				}];
			}
			
			//delete [u.a.] from place
			if (item.place) {
				item.place = item.place.replace(/\[?u\.[\s\u00A0]?a\.\]?\s*$/, '');
			}
			//DDC is not the callNumber in Germany
			item.callNumber = "";
			//place the queried ISBN as the first ISBN in the list (dublicates will be removed later)
			item.ISBN = queryISBN + " " + item.ISBN;
			item.complete();
		});
		translator.translate();

	});
}

// Testing locally in
// chrome://zotero/content/tools/testTranslators/testTranslators.html

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "search",
		"input": {
			"ISBN": "9783830931492"
		},
		"items": [
			{
				"itemType": "book",
				"creators": [
					{
						"lastName": "Böttcher",
						"firstName": "Wolfgang",
						"creatorType": "editor"
					},
					{
						"lastName": "DeGEval - Gesellschaft für Evaluation",
						"creatorType": "editor",
						"fieldMode": true
					}
				],
				"notes": [ 
					{ 
						"note": "Literaturangaben" 
					}
				],
				"tags": [
					"Aufsatzsammlung",
					"Deutschland",
					"Evaluation",
					"Professionalisierung",
					"Qualität",
					"Österreich"
				],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Table of Contents PDF",
						"mimeType": "application/pdf"
						}
				],
				"libraryCatalog": "Gemeinsamer Bibliotheksverbund ISBN",
				"place": "Münster",
				"ISBN": "9783830931492",
				"title": "Evaluation in Deutschland und Österreich: Stand und Entwicklungsperspektiven in den Arbeitsfeldern der DeGEval - Gesellschaft für Evaluation",
				"publisher": "Waxmann",
				"date": "2014",
				"numPages": "219",
				"language": "ger",
				"shortTitle": "Evaluation in Deutschland und Österreich",
				"extra": "OCLC: 885612607"
			}
		]
	},
	{
		"type": "search",
		"input": {
			"ISBN": "3-86688-240-8"
		},
		"items": [
			{
				"itemType": "book",
				"creators": [
					{
						"firstName": "Katrin Bente",
						"lastName": "Karl",
						"creatorType": "author"
					}
				],
				"notes": [
					{
						"note": "Literaturverz. S. [373] - 387 Die CD-ROM enth. einen Anh. mit Dokumenten zur Sprachproduktion und Sprachbewertung"
					},
					{
						"note": "Teilw. zugl.: Hamburg, Univ., FB SLM, Diss., 2011 u.d.T.: Karl, Katrin Bente: Nicht materieller lexikalischer Transfer als Folge der aktuellen russisch-deutschen Zweisprachigkeit"
					}
				],
				"tags": [
					"CD-ROM",
					"Deutsch",
					"Deutsch",
					"Russisch",
					"Russisch",
					"Wortschatz",
					"Wortschatz",
					"Zweisprachigkeit",
					"Zweisprachigkeit"
				],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Table of Contents PDF",
						"mimeType": "application/pdf"
					}
				],
				"ISBN": "9783866882409 9783866882416",
				"language": "ger",
				"place": "München",
				"numPages": "387",
				"series": "Slavolinguistica",
				"seriesNumber": "15",
				"libraryCatalog": "Gemeinsamer Bibliotheksverbund ISBN",
				"shortTitle": "Bilinguale Lexik",
				"title": "Bilinguale Lexik: nicht materieller lexikalischer Transfer als Folge der aktuellen russisch-deutschen Zweisprachigkeit",
				"publisher": "Sagner",
				"date": "2012",
				"extra": "OCLC: 795769702"
			}
		]
	},
	{
		"type": "search",
		"input": {
			"ISBN": "978-1-4073-0412-0"
		},
		"items": [
			{
				"itemType": "book",
				"title": "The harbour of Sebastos (Caesarea Maritima) in its Roman Mediterranean context",
				"creators": [
					 {
						"firstName": "Avnēr",
						"lastName": "Rabbān",
						"creatorType": "author"
					},
					{
						"firstName": "Michal",
						"lastName": "Artzy",
						"creatorType": "author" 
					}
				],
				"notes": [],
				"tags": [
					"Ausgrabung",
					"Caesarea (Israel) Antiquities",
					"Caesarea Maritima",
					"Excavations (Archaeology)",
					"Excavations (Archaeology) Israel Caesarea",
					"Funde",
					"Hafen",
					"Harbors",
					"Harbors Israel Caesarea",
					"Israel Caesarea",
					"Underwater archaeology",
					"Underwater archaeology Israel Caesarea"
				],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Table of Contents PDF",
						"mimeType": "application/pdf"
					} 
				],
				"ISBN": "9781407304120",
				"language": "eng",
				"place": "Oxford",
				"numPages": "222",
				"series": "BAR International series",
				"seriesNumber": "1930",
				"libraryCatalog": "Gemeinsamer Bibliotheksverbund ISBN",
				"publisher": "Archaeopress" ,
				"date": "2009",
				"extra": "OCLC: 320755805"
			}
		]
	}
]
/** END TEST CASES **/