{
	"translatorID": "fe85e97b-5e2a-4d9e-976e-c336c5350ce9",
	"label": "semantics Visual Library",
	"creator": "Philipp Zumstein",
	"target": "^https?://www\\.(blldb-online\\.de/blldb|bdsl-online\\.de/BDSL-DB)/suche/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 150,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsv",
	"lastUpdated": "2014-12-29 11:56:09"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2014 Philipp Zumstein

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

var mappingTypes = {
	'Aufsatz in Zeitschrift' : 'journalArticle',
	'Journal article' : 'journalArticle',
	'Aufsatz in Sammelband' : 'bookSection',
	'Book article' : 'bookSection',
	'Monographie' : 'book',
	'Monograph' : 'book',
	'Sammelband' : 'book',
	'Anthology' : 'book',
	//'Serie' : '',
	//'Series' : '',
	//'Zeitschrift' : '',
	//'Journal' : '',
};

var mapping = {
	'Verfasser' : 'author',
	'Author' : 'author',
	'Beteiligte Pers.' : 'editor',
	'Involved pers.' : 'editor',
	'Körperschaften' : 'organization',
	'Corporation' : 'organization',
	'Titel' : 'title',
	'Title' : 'title',
	//'Original-Titel' : '',
	//'Original title' : '',
	'Sprache' : 'language',
	'Written in' : 'language',
	'Language' : 'language',
	'Erschienen in' : 'publicationTitle',
	'Source' : 'publicationTitle',
	'Jahrgang' : 'volume',
	'Volume' : 'volume', //but only for journalArticle
	'Jahr' : 'date',
	'Year' : 'date',
	'Heft' : 'issue',
	'Issue' : 'issue',
	'Seitenangabe' : 'pages',
	'Page' : 'pages',
	'Serie' : 'series',
	'Series' : 'series',
	'ISBN' : 'ISBN',
	'ISSN' : 'ISSN',
	'Auflage' : 'edition',
	'Edition' : 'edition',
	'Umfang' : 'numPages',
	'Extent' : 'numPages',
	'Ort : Verlag' : 'publisher',
	'Place : Publ.' : 'publisher',
	'Hochschulschrift' : 'note',
	'Academic paper' : 'note',
	'Anmerkung' : 'note',
	'Notes' : 'note',
	'Zusatztitel' : 'subtitle',
	'subtitle' : 'subtitle',
	'Teilband' : 'title',
	//'Volume' : 'title', //but only for books (will be corrected in the cleanup section if necessary)
	'Gesamtwerk' : 'note',
	'Part of' : 'note',
};

function detectWeb(doc, url) {
	if (url.toLowerCase().indexOf('/titelaufnahme.xml?') != -1 ) {//single item
		var type = doc.getElementsByClassName('karteilegende')[0];
		if (type && mappingTypes[type.textContent]) {
			return mappingTypes[type.textContent];
		} else {
			Z.debug('not recognized: ' + type);
		}
	} else if (getSearchResults(doc, true)) {
		return "multiple";
	}
}

//for testing in detectWeb use true for checkOnly
//for the items in doWeb use false for checkOnly
//then the items will be an object containing the href/title pairs
function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = ZU.xpath(doc, '//table[@class="fliesstext"]//td/a[@class="noDeco"]');
	for (var i=0; i<rows.length; i++) {
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
			if (!items) {
				return true;
			}
			var articles = new Array();
			for (var i in items) {
				articles.push(i);
			}
			ZU.processDocuments(articles, scrape);
		});
	} else {
		scrape(doc, url);
	}
}

//extracts the first number of a string
//e.g. string = "387 S., 1 CD-ROM (12 cm)"
// --> return "387"
function extractFirstNumber(string) {
	return string.replace(/^\D*(\d+).*$/,'$1');
}

function scrape(doc, url) {
	var item = new Zotero.Item(detectWeb(doc, url));
	
	var key;
	var keyValuePairs = [];
	var karteilegende = doc.getElementsByClassName('karteilegende');
	for (var j=1; j<karteilegende.length; j++) {
		if (!karteilegende[j].textContent && (key == 'Titel' || key == 'Title') ) {
			key = "Zusatztitel";
		} else {
			key = karteilegende[j].textContent;
		}
		var sibling = karteilegende[j].parentNode.getElementsByTagName('td');
		
		if (sibling.length > 2) {//filter out the empty values
			var value = sibling[2].textContent;
			if (value == 'Hinweise zum Inhalt' || value == 'Selections from contents') {
				var link = sibling[2].getElementsByTagName('a')[0];
				if (link) {
					item.attachments.push({
						title : value,
						url : link.href,
						snapshot : false
					});
				}
			} else {
				if (keyValuePairs[key]) {
					keyValuePairs[key] += ' : ' + value;
				} else {
					keyValuePairs[key] = value;
				}
			}

		}
	}
	
	//creators
	var creatorTypes = ['Verfasser', 'Beteiligte Pers.', 'Author', 'Involved pers.'];
	for (var k=0; k<creatorTypes.length; k++) {
		if (keyValuePairs[creatorTypes[k]]) {
			var creatorsList = keyValuePairs[creatorTypes[k]].split(';');
			for (var j=0; j<creatorsList.length; j++) {
				item.creators.push ( ZU.cleanAuthor(creatorsList[j], mapping[creatorTypes[k]], true) );
			}
			delete keyValuePairs[creatorTypes[k]];
		}
	}
	//corporations (Körperschaften)
	if (keyValuePairs['Körperschaften']) {//
		var creatorsList = keyValuePairs['Körperschaften'].split(';');
		for (var j=0; j<creatorsList.length; j++) {
			item.creators.push ( { lastName : creatorsList[j], creatorType : 'contributor', fieldMode : 1 } );
		}
		delete keyValuePairs['Körperschaften'];
	}
	if (keyValuePairs['Corporation']) {//
		var creatorsList = keyValuePairs['Corporation'].split(';');
		for (var j=0; j<creatorsList.length; j++) {
			item.creators.push ( { lastName : creatorsList[j], creatorType : 'contributor', fieldMode : 1 } );
		}
		delete keyValuePairs['Corporation'];
	}
	//notes
	var note = '';
	for (key in mapping) {
		if (mapping[key] == 'note' && keyValuePairs[key]) {
			note += key + ' = ' + keyValuePairs[key] + '\n';
			delete keyValuePairs[key];
		}
	}
	if (note) {
		item.notes.push( {note: note});
	}
	//standard mapping for single fields
	for (key in keyValuePairs) {
		item[mapping[key]] = keyValuePairs[key];
	}
	
	//cleanup
	if (item.volume && !item.title) {//for individual books with different volumes
		item.title = item.volume;
		delete item.volume;
	}
	if (item.subtitle) {
		item.title += ': ' + item.subtitle;
		delete item.subtitle;
	}
	if (item.date && item.date.indexOf('/') != -1) {//e.g. item.date = "1/10/1992" dd?/mm?/yyyy
		var dateParts = item.date.split('/');
		if (dateParts.length == 3) {
			dateParts[1] = ZU.lpad(dateParts[1], '0', 2);
			dateParts[0] = ZU.lpad(dateParts[0], '0', 2);
			item.date = dateParts[2] + '-' + dateParts[1] + '-' + dateParts[0];
		}
	}
	if (item.numPages) {//e.g. item.numPages = "300 S." or " XXXVII, 551 S."
		item.numPages = extractFirstNumber(item.numPages);
	}
	if (item.issue) {//e.g. item.numPages = "Nr.229"
		item.issue = extractFirstNumber(item.issue);
	}
	if (item.publisher && item.publisher.indexOf(':') != -1) {//e.g item.publisher = "Tübingen: Narr"
		var splitPosition = item.publisher.indexOf(':');
		item.place = item.publisher.substr(0,splitPosition);
		item.publisher = item.publisher.substr(splitPosition+1);
	}
	if (item.series && item.series.indexOf(';') != -1) {
		var splitPosition = item.series.indexOf(';');
		item.seriesNumber = item.series.substr(splitPosition+1);
		item.series = item.series.substr(0,splitPosition);
	}
	if (url.indexOf('blldb-online') != -1) {
		item.libraryCatalog = 'BLLDB (semantics Visual Library)';
	}
	if (url.indexOf('bdsl-online') != -1) {
		item.libraryCatalog = 'BDSL (semantics Visual Library)';
	}
	
	item.attachments.push({
		title : 'Snapshot',
		document : doc
	});
	
	item.complete();
}

//The tests cannot be automated, because the vid is only working for the current session
//and there seems to be no permanent link to the entries.
//Manual update with Scafold is possible:
//1. Open the webpage in your web browser and follow the redirect
//2. Copy the new vid value
//3. Replace the vid value in the url in the test case(s)
//4. Save, close Scaffold and open it again
//5. Run test case
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.blldb-online.de/blldb/suche/titelaufnahme.xml?vid={C908B3C3-153E-4DED-AEAF-717FE482FA96}&contenttype=text/html&Skript=titelaufnahme&Publikation_ID=300346700&lang=en",
		"defer": true,
		"items": [
			{
				"itemType": "book",
				"title": "Bilinguale Lexik.: nicht materieller lexikalischer Transfer als Folge der aktuellen russisch-deutschen Zweisprachigkeit",
				"creators": [
					{
						"firstName": "Katrin Bente",
						"lastName": "Karl",
						"creatorType": "author"
					}
				],
				"date": "2012",
				"ISBN": "3-86688-240-8; 978-3-86688-240-9",
				"language": "German",
				"libraryCatalog": "BLLDB (semantics Visual Library)",
				"numPages": "387",
				"place": "München [u.a.]",
				"publisher": "Sagner",
				"series": "Slavolinguistica",
				"seriesNumber": "15",
				"shortTitle": "Bilinguale Lexik.",
				"attachments": [
					{
						"title": "Selections from contents",
						"snapshot": false
					},
					{
						"title": "Snapshot"
					}
				],
				"tags": [],
				"notes": [
					{
						"note": "Academic paper = Zugl.: : Hamburg: Univ., Diss., 2011\nNotes = Literaturverz. S. [373] - 387 \n"
					}
				],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.blldb-online.de/blldb/suche/titelaufnahme.xml?vid={92AB2423-4F7D-4124-9144-47304435127B}&contenttype=text/html&Skript=titelaufnahme&Publikation_ID=055075487&lang=en",
		"defer": true,
		"items": [
			{
				"itemType": "book",
				"title": "Abstrakte Nomina: Vorarbeiten zu ihrer Erfassung in einem zweisprachigen syntagmatischen Wörterbuch",
				"creators": [
					{
						"firstName": "Daniel",
						"lastName": "Bresson",
						"creatorType": "editor"
					},
					{
						"firstName": "Jacqueline",
						"lastName": "Kubczak",
						"creatorType": "editor"
					},
					{
						"firstName": "Sylvie",
						"lastName": "Costantino",
						"creatorType": "editor"
					},
					{
						"firstName": "Péter",
						"lastName": "Bassola",
						"creatorType": "editor"
					},
					{
						"firstName": "Stéphanie",
						"lastName": "Bensa",
						"creatorType": "editor"
					},
					{
						"firstName": "Dmitrij O.",
						"lastName": "Dobrovolʹskij",
						"creatorType": "editor"
					},
					{
						"firstName": "Dominique",
						"lastName": "Batoux",
						"creatorType": "editor"
					},
					{
						"firstName": "Achim",
						"lastName": "Stein",
						"creatorType": "editor"
					},
					{
						"firstName": "Andrea",
						"lastName": "Pons",
						"creatorType": "editor"
					},
					{
						"firstName": "Gaston",
						"lastName": "Gross",
						"creatorType": "editor"
					},
					{
						"firstName": "Helmut",
						"lastName": "Schumacher",
						"creatorType": "editor"
					},
					{
						"firstName": "Joanna",
						"lastName": "Golonka",
						"creatorType": "editor"
					}
				],
				"date": "1998",
				"ISBN": "3-8233-5140-0",
				"language": "German",
				"libraryCatalog": "BLLDB (semantics Visual Library)",
				"numPages": "300",
				"place": "Tübingen",
				"publisher": "Narr",
				"series": "Studien zur deutschen Sprache",
				"seriesNumber": "10",
				"shortTitle": "Abstrakte Nomina",
				"attachments": [
					{
						"title": "Selections from contents",
						"snapshot": false
					},
					{
						"title": "Snapshot"
					}
				],
				"tags": [],
				"notes": [
					{
						"note": "Notes = Literaturangaben \n"
					}
				],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.blldb-online.de/blldb/suche/titelaufnahme.xml?vid={9C1F3309-CEC6-4EF7-AE2A-C70FBBD9C9DD}&contenttype=text/html&Skript=titelaufnahme&Publikation_ID=05901346X&lang=en",
		"defer": true,
		"items": [
			{
				"itemType": "book",
				"title": "Probleme der Textauswahl für einen elektronischen Thesaurus: Beiträge zum Ersten Göttinger Arbeitsgespräch zur Historischen Deutschen Wortforschung, 1. und 2. November 1996",
				"creators": [
					{
						"firstName": "Rolf",
						"lastName": "Bergmann",
						"creatorType": "editor"
					},
					{
						"firstName": "Michael",
						"lastName": "Schlaefer",
						"creatorType": "editor"
					},
					{
						"firstName": "Hans-Joachim",
						"lastName": "Solms",
						"creatorType": "editor"
					},
					{
						"firstName": "Klaus-Peter",
						"lastName": "Wegera",
						"creatorType": "editor"
					},
					{
						"firstName": "Matthias",
						"lastName": "Wermke",
						"creatorType": "editor"
					},
					{
						"firstName": "Heidrun",
						"lastName": "Kämper",
						"creatorType": "editor"
					},
					{
						"firstName": "Ulrike",
						"lastName": "Haß",
						"creatorType": "editor"
					},
					{
						"firstName": "Roland",
						"lastName": "Ris",
						"creatorType": "editor"
					},
					{
						"firstName": "Karlheinz",
						"lastName": "Jakob",
						"creatorType": "editor"
					},
					{
						"firstName": "Gerhard",
						"lastName": "Wagenitz",
						"creatorType": "editor"
					},
					{
						"firstName": "Helmut",
						"lastName": "Henne",
						"creatorType": "editor"
					},
					{
						"firstName": "Peter O.",
						"lastName": "Müller",
						"creatorType": "editor"
					},
					{
						"lastName": "Göttinger Arbeitsgespräch zur Historischen Deutschen Wortforschung <1, 1996, Göttingen>",
						"creatorType": "contributor",
						"fieldMode": 1
					}
				],
				"date": "1998",
				"ISBN": "3-7776-0882-3",
				"language": "German",
				"libraryCatalog": "BLLDB (semantics Visual Library)",
				"numPages": "174",
				"place": "Stuttgart [u.a.]",
				"publisher": "Hirzel",
				"shortTitle": "Probleme der Textauswahl für einen elektronischen Thesaurus",
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
		"url": "http://www.bdsl-online.de/BDSL-DB/suche/titelaufnahme.xml?vid={AA8DC9D5-D10C-4C4F-B98D-FB1A5090B582}&contenttype=text/html&Skript=titelaufnahme&Publikation_ID=130721638&lang=de",
		"defer": true,
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Literatur aus Literatur: zum Tode des Übersetzers Ralph Manheim",
				"creators": [
					{
						"firstName": "Alexander",
						"lastName": "Weber",
						"creatorType": "author"
					}
				],
				"date": "1992-10-01",
				"issue": "229",
				"libraryCatalog": "BDSL (semantics Visual Library)",
				"pages": "30",
				"publicationTitle": "[Frankfurter Allgemeine / D]: Frankfurter Allgemeine",
				"shortTitle": "Literatur aus Literatur",
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
		"url": "http://www.bdsl-online.de/BDSL-DB/suche/titelaufnahme.xml?vid={F1F0B146-4489-4299-96EF-4784977E61A4}&contenttype=text/html&Skript=titelaufnahme&Publikation_ID=13389942X&lang=de",
		"defer": true,
		"items": [
			{
				"itemType": "book",
				"title": "Studienausgabe in Einzelbänden; Madame Legros; sämtliche Schauspiele2",
				"creators": [
					{
						"firstName": "Heinrich",
						"lastName": "Mann",
						"creatorType": "author"
					},
					{
						"firstName": "Peter-Paul",
						"lastName": "Schneider",
						"creatorType": "editor"
					}
				],
				"date": "2005",
				"ISBN": "3-596-16713-2; 978-3-596-16713-5",
				"language": "Deutsch",
				"libraryCatalog": "BDSL (semantics Visual Library)",
				"numPages": "829",
				"place": "Frankfurt am Main",
				"publisher": "Fischer-Taschenbuch-Verl.",
				"series": "Fischer",
				"seriesNumber": "16713 / Heinrich Mann. Hrsg. von Peter-Paul Schneider",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [],
				"notes": [
					{
						"note": "Anmerkung = Literaturangaben\nGesamtwerk =  Studienausgabe in Einzelbänden / Mann, Heinrich      / Heinrich Mann. Hrsg. von Peter-Paul Schneider\n"
					}
				],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.bdsl-online.de/BDSL-DB/suche/titelaufnahme.xml?vid={1A778DD2-F52E-4A3A-944F-E06B5E8A5F0A}&contenttype=text/html&Skript=titelaufnahme&Publikation_ID=028514998&lang=de",
		"defer": true,
		"items": [
			{
				"itemType": "book",
				"title": "The tin drum",
				"creators": [
					{
						"firstName": "Günter",
						"lastName": "Grass",
						"creatorType": "author"
					},
					{
						"firstName": "Ralph",
						"lastName": "Manheim",
						"creatorType": "editor"
					}
				],
				"date": "1993",
				"ISBN": "1-85715-147-X",
				"language": "Englisch",
				"libraryCatalog": "BDSL (semantics Visual Library)",
				"numPages": "551",
				"publisher": "London",
				"series": "Everyman's library",
				"seriesNumber": "147",
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
	}
]
/** END TEST CASES **/