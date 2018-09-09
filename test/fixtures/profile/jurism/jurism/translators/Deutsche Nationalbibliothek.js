{
	"translatorID": "d8341c22-8cf4-428f-be3b-ada9fa8933eb",
	"label": "Deutsche Nationalbibliothek",
	"creator": "Philipp Zumstein",
	"target": "^https?://portal\\.dnb\\.de/opac\\.htm\\?",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2018-05-14 19:08:02"
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

var typeMapping = {
	//"Blindendrucke" 
	"Bücher" : "book",
	//"Elektronische Datenträger" 
	"Filme/Hörbücher" : "videoRecording",
	"Karten" : "map",
	//"Medienkombinationen"
	//"Mikroformen"
	"Musiktonträger" : "audioRecording",
	//"Musiknoten" 
	"Artikel" : "journalArticle",
	//"Online Ressourcen"
	//"Zeitschriften/Serien"
	//"Ausgaben/Hefte"
	"archivierte Webseiten" : "webpage",
	//"Gesamttitel Sammlung/Nachlass"
	"Manuskripte" : "manuscript",
	"Briefe" : "letter",
	//"Lebensdokumente"
	//"Sammlungen"
	//"Trägermaterialien (Papiere und Einbände)"
	"Bilder/Grafiken" : "artwork"
	//"Flugblätter"
};

function detectWeb(doc, url) {
	if (
		url.indexOf('method=showFullRecord')>-1 ||
		(url.indexOf('method=simpleSearch')>-1 && doc.getElementById('fullRecordTable'))
	) {
		var type=ZU.xpathText(doc, '//table[@id="fullRecordTable"]/tbody/tr/td/img/@alt');
		if (typeMapping[type]) {
			return typeMapping[type];
		} else {
			return "book";
		}
	} else if (getSearchResults(doc, true)) {
		return "multiple";
	}
}

function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = ZU.xpath(doc, '//table[@id="searchresult"]//a[contains(@id, "recordLink")]');
	for (var i=0; i<rows.length; i++) {
		var href = rows[i].href;
		var title = ZU.trimInternal(rows[i].firstChild.textContent);
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
	var marc = ZU.xpath(doc, '//div[@class="link"]//a[contains(@href, "/about/marcxml")]');
	if (marc.length) {
		var marcUrl = marc[0].href;
		
		ZU.doGet(marcUrl, function(result) {
			
			//call MARCXML translator
			var translator = Zotero.loadTranslator("import");
			translator.setTranslator("edd87d07-9194-42f8-b2ad-997c4c7deefd");
			translator.setString(result);
			translator.setHandler("itemDone", function (obj, item) {
				finalize(doc, item);
				item.complete();
			});
			translator.translate();
		});
		
	} else {
		Z.debug("No MARC link found --> Use COinS translator");
		
		//call COinS translator
		var translator = Zotero.loadTranslator("web");
		translator.setTranslator("05d07af9-105a-4572-99f6-a8e231c0daef");
		translator.setDocument(doc);
		translator.setHandler("itemDone", function (obj, item) {
			finalize(doc, item);
			item.complete();
		});
		translator.translate();

	}
}	


function finalize(doc, item) {
	var toc = ZU.xpath(doc, '//a[contains(@title, "Inhaltsverzeichnis")]');
	if (toc.length) {
		item.attachments.push( {
			url : toc[0].href,
			title: "Table of Contents PDF",
			mimeType: "application/pdf"
		});
	}
	
	var abstract = ZU.xpath(doc, '//a[contains(@title, "Inhaltstext")]');
	if (abstract.length) {
		item.attachments.push( {
			url : abstract[0].href,
			title: "Abstract",
			mimeType: "text/html"
		});
	}
	
	item.callNumber = "";
}


/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://portal.dnb.de/opac.htm?method=simpleSearch&cqlMode=true&query=idn%3D1029203784",
		"items": [
			{
				"itemType": "book",
				"title": "Ausgeplündert, zurückerstattet und entschädigt: Arisierung und Wiedergutmachung in Mannheim",
				"creators": [
					{
						"firstName": "Christiane",
						"lastName": "Fritsche",
						"creatorType": "author"
					},
					{
						"firstName": "Ulrich",
						"lastName": "Nieß",
						"creatorType": "author"
					},
					{
						"firstName": "Stadt",
						"lastName": "Stadt Mannheim",
						"creatorType": "editor"
					},
					{
						"firstName": "Johannes",
						"lastName": "Paulmann",
						"creatorType": "author"
					},
					{
						"firstName": "Susanne",
						"lastName": "Schlösser",
						"creatorType": "editor"
					}
				],
				"date": "2013",
				"ISBN": "9783897357723",
				"edition": "2. Aufl",
				"language": "ger",
				"libraryCatalog": "Deutsche Nationalbibliothek",
				"numPages": "960",
				"place": "Ubstadt-Weiher Heidelberg Neustadt a.d.W. Basel",
				"publisher": "Verl. Regionalkultur",
				"series": "Sonderveröffentlichung des Stadtarchivs Mannheim - Institut für Stadtgeschichte",
				"seriesNumber": "Bd. 39",
				"shortTitle": "Ausgeplündert, zurückerstattet und entschädigt",
				"attachments": [
					{
						"title": "Table of Contents PDF",
						"mimeType": "application/pdf"
					},
					{
						"title": "Abstract",
						"mimeType": "text/html"
					}
				],
				"tags": [
					{
						"tag": "(Produktform)Hardback"
					},
					{
						"tag": "(VLB-WN)1558: Hardcover, Softcover / Geschichte/Regionalgeschichte, Ländergeschichte"
					},
					{
						"tag": "Arisierung"
					},
					{
						"tag": "Baden"
					},
					{
						"tag": "Geschichte 1933-1969"
					},
					{
						"tag": "Heimatgeschichte"
					},
					{
						"tag": "Mannheim"
					},
					{
						"tag": "Nachkriegszeit"
					},
					{
						"tag": "Wiedergutmachung"
					},
					{
						"tag": "Zweiter Weltkrieg"
					}
				],
				"notes": [
					{
						"note": "Literaturangaben"
					}
				],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://portal.dnb.de/opac.htm?method=simpleSearch&cqlMode=true&query=idn%3D1048581292",
		"items": [
			{
				"itemType": "book",
				"title": "Effiziente Entwurfsverfahren zur hardwarebasierten Signalverarbeitung elementarer Funktionen für die drahtlose Kommunikation",
				"creators": [
					{
						"firstName": "Jochen",
						"lastName": "Rust",
						"creatorType": "author"
					}
				],
				"date": "2014",
				"ISBN": "9783844027068",
				"language": "ger",
				"libraryCatalog": "Deutsche Nationalbibliothek",
				"numPages": "151",
				"place": "Aachen",
				"publisher": "Shaker",
				"series": "Forschungsberichte aus dem Institut für Theoretische Elektrotechnik und Mikroelektronik, Arbeitsbereich Kommunikationselektronik, Universität Bremen",
				"seriesNumber": "Bd. 2",
				"attachments": [
					{
						"title": "Table of Contents PDF",
						"mimeType": "application/pdf"
					}
				],
				"tags": [
					{
						"tag": "(Produktform (spezifisch))Unsewn / adhesive bound"
					},
					{
						"tag": "(Produktform)Paperback / softback"
					},
					{
						"tag": "(VLB-WN)1684: Hardcover, Softcover / Technik/Elektronik, Elektrotechnik, Nachrichtentechnik"
					},
					{
						"tag": "(Zielgruppe)Fachpublikum/ Wissenschaft"
					},
					{
						"tag": "Approximationsalgorithmus"
					},
					{
						"tag": "Digitale Signalverarbeitung"
					},
					{
						"tag": "Digitale Signalverarbeitung"
					},
					{
						"tag": "Drahtloses Sensorsystem"
					},
					{
						"tag": "Elementare Funktion"
					},
					{
						"tag": "Hardwareentwurf"
					},
					{
						"tag": "Hochschulschrift"
					},
					{
						"tag": "Kundenspezifische Schaltung"
					},
					{
						"tag": "Mikroelektronik"
					},
					{
						"tag": "Mobilfunk"
					}
				],
				"notes": [
					{
						"note": "Zugl.: Bremen, Univ., Diss., 2014"
					}
				],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://portal.dnb.de/opac.htm?query=smith&method=simpleSearch&cqlMode=true",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://portal.dnb.de/opac.htm?method=simpleSearch&cqlMode=true&query=idn%3D1064805604",
		"items": [
			{
				"itemType": "book",
				"title": "Das Adam-Smith-Projekt: Zur Genealogie der liberalen Gouvernementalität",
				"creators": [
					{
						"firstName": "Bastian",
						"lastName": "Ronge",
						"creatorType": "author"
					}
				],
				"date": "2015",
				"ISBN": "9783658060275",
				"edition": "Aufl. 2015",
				"language": "ger",
				"libraryCatalog": "Deutsche Nationalbibliothek",
				"place": "Wiesbaden",
				"publisher": "Springer Fachmedien Wiesbaden",
				"shortTitle": "Das Adam-Smith-Projekt",
				"attachments": [],
				"tags": [
					{
						"tag": "(BIC Subject Heading)JPA"
					},
					{
						"tag": "(Produktform)Electronic book text"
					},
					{
						"tag": "(Zielgruppe)Fachpublikum/ Wissenschaft"
					},
					{
						"tag": "(Zielgruppe)Professional/practitioner"
					},
					{
						"tag": "Adam Smith"
					},
					{
						"tag": "Foucault, Michel"
					},
					{
						"tag": "Gouvernementalität"
					},
					{
						"tag": "Liberalismus"
					},
					{
						"tag": "Liberalismus"
					},
					{
						"tag": "Macht"
					},
					{
						"tag": "Michel Foucault"
					},
					{
						"tag": "Politische Philosophie"
					},
					{
						"tag": "Rechtsordnung"
					},
					{
						"tag": "Smith, Adam"
					},
					{
						"tag": "Theorie der Moralität"
					},
					{
						"tag": "Wirtschaftsethik"
					}
				],
				"notes": [
					{
						"note": "Lizenzpflichtig"
					}
				],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://portal.dnb.de/opac.htm?method=simpleSearch&cqlMode=true&query=idn%3D950884529",
		"items": [
			{
				"itemType": "book",
				"title": "Der stimmrechtslose GmbH-Geschäftsanteil",
				"creators": [
					{
						"firstName": "Carsten",
						"lastName": "Schäfer",
						"creatorType": "author"
					}
				],
				"date": "1997",
				"ISBN": "9783504646431",
				"language": "ger",
				"libraryCatalog": "Deutsche Nationalbibliothek",
				"numPages": "402",
				"place": "Köln",
				"publisher": "O. Schmidt",
				"series": "Rechtsfragen der Handelsgesellschaften",
				"seriesNumber": "Bd. 91",
				"attachments": [
					{
						"title": "Table of Contents PDF",
						"mimeType": "application/pdf"
					}
				],
				"tags": [
					{
						"tag": "Ausschluss"
					},
					{
						"tag": "Geschäftsanteil"
					},
					{
						"tag": "Gesellschafter"
					},
					{
						"tag": "GmbH"
					},
					{
						"tag": "Hochschulschrift"
					},
					{
						"tag": "Stimmrecht"
					}
				],
				"notes": [
					{
						"note": "Zugl.: Heidelberg, Univ., Diss., 1997"
					}
				],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/
