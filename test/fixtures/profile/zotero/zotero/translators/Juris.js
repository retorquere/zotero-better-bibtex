{
	"translatorID": "bc2ec385-e60a-4899-96ae-d4f0d6574ad7",
	"label": "Juris",
	"creator": "Reto Mantz",
	"target": "^https?://(www\\.|testsystem\\.)?juris\\.de/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2018-08-27 10:42:50"
}

/*
***** BEGIN LICENSE BLOCK *****

	Juris Translator, Copyright © 2014 Reto Mantz
	
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


// For testing one has to first open starting page with user name, e.g.
// https://www.juris.de/jportal/?action=JLoginUser&username=UNI_MANNHEIM


// Array with the different - recognized - types
var mappingItemTypes = {
	MONOGRAPHIE: 'book',
	SAMMELWERK: 'book',
	AUFSATZ: 'journalArticle',
	KONGRESSBERICHT: 'conferencePaper',
	'KONGRESSVORTRAG, AUFSATZ': 'conferencePaper',
	URTEIL: 'case',
	'URT.': 'case',
	BESCHLUSS: 'case',
	'BESCHL.': 'case',
	'ERLEDIGTES ANHÄNGIGES VERFAHREN': 'case',
	GESETZ: 'statute',
	SONSTIGES: 'journalArticle'
};

// most information in Juris is saved in tables where the description of the data is of class TD30 => gather this data
var scrapeData = {};

function initData(doc) {
	var nodes = doc.getElementsByClassName('TD30');
	for (var i = 0; i < nodes.length; i++) {
		var label = ZU.trimInternal(nodes[i].textContent);
		label = label.substr(0, label.length - 1); // chop off ':', but .replace(/:$/, '') may be more reliable
		var value = nodes[i].nextElementSibling;
		if (label && value) {
			scrapeData[label] = ZU.trimInternal(value.textContent);
		}
	}
	if (scrapeData.Norm) {
		scrapeData.Normen = scrapeData.Norm;
	}
}
	
function detectWeb(doc, _url) {
	initData(doc);		// gather data
	
	var type = scrapeData.Beitragstyp || scrapeData.Dokumenttyp;
	if (type) {
		type = type.toUpperCase();
		if (mappingItemTypes[type]) {
			return mappingItemTypes[type];
		}
		else {
			Z.debug(type + " not yet suppported");
		}
	}
	if (scrapeData.Werk && scrapeData.Zitiervorschlag) {
		if (scrapeData.Zitiervorschlag.includes('Handbuch')) {
			return 'bookSection';
		}
		else {
			return 'encyclopediaArticle'; // for articles in commentary
		}
	}
	var coins = ZU.xpathText(doc, '//span[@class="Z3988"]/@title');
	if (coins) {
		if (coins.includes("rft.genre=article")) {
			return 'journalArticle';
		}
	}
	// Z.debug(scrapeData)
	Z.monitorDOMChanges(ZU.xpath(doc, '//div[@id="container"]/div')[0]);
	return false;
}

function addNote(originalNote, newNote) {
	if (originalNote.length === 0) {
		originalNote = "<h2>Additional Metadata</h2>" + newNote;
	}
	else {
		originalNote += newNote;
	}
	return originalNote;
}

function scrape(doc, url, itemType) {
	var item = new Zotero.Item(itemType);
	
	// scrape authors
	var myAuthorsString = scrapeData.Autor;
	// example: "Michael Fricke, Martin Gerecke"
	if (myAuthorsString) {
		var myAuthors = ZU.trimInternal(myAuthorsString).split(",");
		for (var index = 0; index < myAuthors.length; ++index) {
			var author = ZU.trimInternal(myAuthors[index]);
			item.creators.push(ZU.cleanAuthor(author, 'author', false));
		}
	}
	
	var editorString = scrapeData.Herausgeber || scrapeData.Gesamtherausgeber;
	if (editorString) {
		var editors = ZU.trimInternal(editorString).split("/");
		for (let i = 0; i < editors.length; i++) {
			item.creators.push(ZU.cleanAuthor(editors[i], 'editor', false));
		}
	}
	
	// scrape title
	item.title = ZU.xpathText(doc, "//div[@class='docLayoutTitel']/h3")
		|| ZU.xpathText(doc, "//div[contains(@class, 'docLayoutTitel')]//strong")
		|| ZU.xpathText(doc, "//div[contains(@class, 'docLayoutTitel')]")
		|| ZU.xpathText(doc, "//div[contains(@class, 'docbar__title')]");
	
	item.date = scrapeData.Erscheinungsjahr || scrapeData.Stand;
	item.edition = scrapeData.Ausgabe || scrapeData.Auflage;
	var isbn = scrapeData.Bestellnummer;
	if (isbn) {
		item.ISBN = isbn.replace('ISBN', '').trim();
	}
	var pub = scrapeData.Verlag;
	if (pub) {
		// e.g. de Gruyter, Berlin
		var pubLoc = pub.split(',');
		if (pubLoc.length === 2) {
			item.publisher = pubLoc[0];
			item.place = pubLoc[1];
		}
		else {
			item.publisher = pub;
		}
	}
	
	item.conferenceName = scrapeData.Kongress;
	
	item.publicLawNumber = scrapeData.FNA; // Fundstellennachweis A (?)
	item.code = scrapeData['Amtliche Abkürzung'];
	if (itemType === "statute" && scrapeData.Zitiervorschlag) {
		// e.g. "Zitiervorschlag": "§ 154 VwGO in der Fassung vom 20.12.2001"
		var m = scrapeData.Zitiervorschlag.match(/in der Fassung vom ([\d.]+)/);
		if (m) {
			item.dateEnacted = ZU.strToISO(m[1]);
		}
		m = scrapeData.Zitiervorschlag.match(/§ (.+?) /);
		if (m) {
			item.codeNumber = m[1];
		}
	}
	
	item.publicationTitle = ZU.xpathText(doc, '(//table//img[contains(@alt,"Abkürzung Fundstelle")]/@title)[1]')
		|| scrapeData.Werk;
	// scrape src
	// example 1: "AfP 2014, 293-299"
	// example 2: "ZStW 125, 259-298 (2013)"
	var mySrcString = scrapeData.Fundstelle;

	if (mySrcString) {
		// match example 1
		var matchSrc = mySrcString.match(/^([^,]+)\s(\d{4})\s*,\s*(\d+(?:-\d+)?)\s*$/);
		if (matchSrc) {
			item.journalAbbreviation = ZU.trimInternal(matchSrc[1]);
			item.date = matchSrc[2];
			item.pages = matchSrc[3];
		}
		// match example 2
		else {
			matchSrc = mySrcString.match(/^([^,]+)\s(\d+)\s*,\s*(\d+(?:-\d+)?)\s*\((\d{4})\)\s*$/);
			if (matchSrc) {
				item.journalAbbreviation = ZU.trimInternal(matchSrc[1]);
				item.issue = matchSrc[2];
				item.pages = matchSrc[3];
				item.date = matchSrc[4];
			}
		}
	}
	
	finalize(doc, url, item);
}

function finalize(doc, url, item) {
	var note = "";
	
	// regulations cited in the database for the article
	var citedRegulations = scrapeData.Normen;
	if (citedRegulations) {
		note = addNote(note, "<h3>Normen</h3><p>" + ZU.trimInternal(citedRegulations) + "</p>");
	}
	var inofficialTitle = ZU.xpathText(doc, "//div[@class='docLayoutTitel']/div/dl/dd/p");
	if (inofficialTitle) 	{
		note = addNote(note, "<h3>Titel</h3><p>" + ZU.trimInternal(inofficialTitle) + "</p>");
	}
	// sources if available
	if (ZU.xpathText(doc, "//h3[.='Fundstellen']")) {
		var sources = ZU.xpathText(doc, "//td[@class='TableUnten']/div[2]/div[4]");
		if (sources) {
			note = addNote(note, "<h3>Fundstellen</h3><p>" + ZU.trimInternal(sources) + "</p>");
		}
	}
	
	if (note.length !== 0) {
		item.notes.push({ note: note });
	}
	
	// saving a snapshot is currently not working properly
	// item.attachments = [{
	//	title: "Snapshot",
	//	document: doc
	// }];
	
	var perma = ZU.xpathText(doc, '//span[contains(@class, "docLayoutPermalinkItemLink")]');
	if (perma) {
		item.attachments.push({
			title: "Juris Permalink",
			url: perma,
			snapshot: false
		});
	}
	
	var pdfLink = ZU.xpathText(doc, '//a[contains(@class, "button--pdf")]/@href');
	if (pdfLink) {
		item.attachments.push({
			title: "Fulltext PDF",
			url: pdfLink,
			mimeType: "application/pdf"
		});
	}

	item.complete();
}

function scrapeCase(doc, url) {
	var item = new Zotero.Item('case');
	
	// court
	item.court = scrapeData.Gericht;
	// if there is additional information about the body inside the court (starting with a number), disregard it
	// examples:	BGH 1. Zivilsenat, LG Köln 26. Zivilkammer
	var m = item.court.match(/^[A-Za-zÖöÄäÜüß ]+/);
	if (m) item.court = ZU.trimInternal(m[0]);

	// add jurisdiction to item.extra - in accordance with citeproc-js - for compatability with Zotero-MLZ
	item.extra = "";
	if (item.court.indexOf('EuG') === 0) {
		item.extra += "jurisdiction: europa.eu";
	}
	else {
		item.extra += "jurisdiction: de";
	}
	
	// date
	var myDateString = scrapeData.Entscheidungsdatum;
	if (myDateString) {
		item.dateDecided = myDateString.replace(/(\d\d?)\.\s*(\d\d?)\.\s*(\d\d\d\d)/, "$3-$2-$1");
	}
	
	// docketNumber
	item.docketNumber = scrapeData.Aktenzeichen;
	
	// type of decision. Save this in item.extra according to citeproc-js
	var decisionType = scrapeData.Dokumenttyp;
	if (/(Beschluss)|Beschl\./i.test(decisionType)) {
		item.extra += "\ngenre: Beschl.";
	}
	else if (/(Urteil)|(Urt\.)/i.test(decisionType)) {
		item.extra += "\ngenre: Urt.";
	}
	
	// name of decision (caseName) if availabe
	// since the CSL stylesheet does not have a "caseName" property, but uses only "title" we have to use other field => item.history (=CSL.references)
	// also, item.caseName and item.title are identical in Zotero. Therefore, we should not use item.caseName at all
	
	var caseName = scrapeData.Entscheidungsname;
	item.title = item.court + ", " + myDateString + " - " + item.docketNumber;
	if (caseName) {
		item.shortTitle = caseName;
		item.title += " - " + caseName;
	}
	
	finalize(doc, url, item);
}


function doWeb(doc, url) {
	var myType = detectWeb(doc, url);
	if (myType == 'case') {
		scrapeCase(doc, url);
	}
	else {
		scrape(doc, url, myType);
	}
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://www.juris.de/r3/search?query=DOKNR%3ASBLU000136614",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"firstName": "Nina",
						"lastName": "Nestler",
						"creatorType": "author"
					}
				],
				"notes": [
					{
						"note": "<h2>Additional Metadata</h2><h3>Normen</h3><p>KrWaffKontrG, AWG, StGB</p>"
					}
				],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Juris Permalink",
						"snapshot": false
					},
					{
						"title": "Fulltext PDF",
						"mimeType": "application/pdf"
					}
				],
				"title": "Der Schutz der äußeren Sicherheit Deutschlands durch das Strafrecht",
				"date": "2013",
				"publicationTitle": "Zeitschrift für die gesamte Strafrechtswissenschaft",
				"journalAbbreviation": "ZStW",
				"issue": "125",
				"pages": "259-298",
				"libraryCatalog": "Juris"
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.juris.de/r3/search?query=DOKNR%3ASILU000241514",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"firstName": "Michael",
						"lastName": "Fricke",
						"creatorType": "author"
					},
					{
						"firstName": "Martin",
						"lastName": "Gerecke",
						"creatorType": "author"
					}
				],
				"notes": [
					{
						"note": "<h2>Additional Metadata</h2><h3>Normen</h3><p>Art 5 GG, Art 10 MRK, § 53 Abs 1 Nr 5 StPO, § 97 Abs 5 StPO, § 383 Abs 1 Nr 5 ZPO ... mehr</p>"
					}
				],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Juris Permalink",
						"snapshot": false
					},
					{
						"title": "Fulltext PDF",
						"mimeType": "application/pdf"
					}
				],
				"title": "Informantenschutz und Informantenhaftung",
				"date": "2014",
				"publicationTitle": "Archiv für Presserecht",
				"journalAbbreviation": "AfP",
				"pages": "293-299",
				"libraryCatalog": "Juris"
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.juris.de/r3/search?query=DOKNR%3AKORE316642014",
		"items": [
			{
				"itemType": "case",
				"creators": [],
				"notes": [
					{
						"note": "<h2>Additional Metadata</h2><h3>Normen</h3><p>§ 101 Abs 2 S 1 Nr 3 UrhG, § 101 Abs 9 S 1 UrhG, § 91 Abs 1 S 1 ZPO</p><h3>Titel</h3><p>Urheberrechtsverletzung im Internet: Erstattungsfähigkeit der Kosten des Verfahrens gegen einen Internet-Provider auf Auskunft über die Inhaber bestimmter IP-Adressen - Deus Ex</p>"
					}
				],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Juris Permalink",
						"snapshot": false
					},
					{
						"title": "Fulltext PDF",
						"mimeType": "application/pdf"
					}
				],
				"court": "BGH",
				"extra": "jurisdiction: de\ngenre: Beschl.",
				"dateDecided": "2014-05-15",
				"docketNumber": "I ZB 71/13",
				"shortTitle": "Deus Ex",
				"caseName": "BGH, 15.05.2014 - I ZB 71/13 - Deus Ex"
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.juris.de/r3/search?query=DOKNR%3ASBLU000100614",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"firstName": "Michael",
						"lastName": "Halstenberg",
						"creatorType": "author"
					}
				],
				"notes": [
					{
						"note": "<h2>Additional Metadata</h2><h3>Normen</h3><p>§ 69 BauO NW, § 633 BGB, VOB B</p>"
					}
				],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Juris Permalink",
						"snapshot": false
					},
					{
						"title": "Fulltext PDF",
						"mimeType": "application/pdf"
					}
				],
				"title": "Die bauaufsichtliche Einführung der Eurocodes - ein Problem für das Vertragsrecht?",
				"date": "2014",
				"publicationTitle": "Baurecht",
				"journalAbbreviation": "BauR",
				"pages": "431-442",
				"libraryCatalog": "Juris"
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.juris.de/r3/search?query=DOKNR%3AMWRE140003062",
		"items": [
			{
				"itemType": "case",
				"creators": [],
				"notes": [
					{
						"note": "<h2>Additional Metadata</h2><h3>Normen</h3><p>§ 71a Abs 1 AsylVfG 1992</p><h3>Titel</h3><p>Behandlung eines Asylantrages als Folgeantrag, der nach Ablehnung eines in einem EU-Mitgliedstaat (hier: Ungarn) gestellten Asylantrages abgelehnt worden war</p>"
					}
				],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Juris Permalink",
						"snapshot": false
					},
					{
						"title": "Fulltext PDF",
						"mimeType": "application/pdf"
					}
				],
				"court": "VG Frankfurt",
				"extra": "jurisdiction: de\ngenre: Beschl.",
				"dateDecided": "2014-11-04",
				"docketNumber": "6 L 544/14.A, 6 L 544/14.A (PKH)",
				"caseName": "VG Frankfurt, 04.11.2014 - 6 L 544/14.A, 6 L 544/14.A (PKH)"
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.juris.de/r3/search?query=DOKNR%3Ajzs-B2-1422A-1283-1",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"firstName": "Georg",
						"lastName": "Lanfermann",
						"creatorType": "author"
					},
					{
						"firstName": "Silja",
						"lastName": "Maul",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Juris Permalink",
						"snapshot": false
					},
					{
						"title": "Fulltext PDF",
						"mimeType": "application/pdf"
					}
				],
				"title": "Maßnahmenpaket der Europäischen Kommission zum Gesellschaftsrecht und Corporate Governance",
				"date": "2014",
				"publicationTitle": "Betriebs-Berater",
				"journalAbbreviation": "BB",
				"pages": "1283-1294",
				"libraryCatalog": "Juris"
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.juris.de/r3/search?query=DOKNR%3AJURE140017979",
		"items": [
			{
				"itemType": "case",
				"creators": [],
				"notes": [
					{
						"note": "<h2>Additional Metadata</h2><h3>Normen</h3><p>§ 143 Abs 1 S 1 InsO, § 133 InsO</p><h3>Titel</h3><p>Anspruch des Insolvenzverwalters auf Rückgewähr der Leistungen nach Insolvenzanfechtung</p>"
					}
				],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Juris Permalink",
						"snapshot": false
					},
					{
						"title": "Fulltext PDF",
						"mimeType": "application/pdf"
					}
				],
				"court": "LG Köln",
				"extra": "jurisdiction: de\ngenre: Urt.",
				"dateDecided": "2014-10-22",
				"docketNumber": "26 O 142/13",
				"caseName": "LG Köln, 22.10.2014 - 26 O 142/13"
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.juris.de/r3/search?query=DOKNR%3Ajzs-B2-1401A-3-1",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"firstName": "Christoph",
						"lastName": "Thole",
						"creatorType": "author"
					},
					{
						"firstName": "Aljoscha",
						"lastName": "Schmidberger",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Juris Permalink",
						"snapshot": false
					},
					{
						"title": "Fulltext PDF",
						"mimeType": "application/pdf"
					}
				],
				"title": "Die Insolvenzanfechtung von (überhöhten) Gehältern und Vergütungen von Geschäftsleitern und Sanierungsberatern",
				"date": "2014",
				"publicationTitle": "Betriebs-Berater",
				"journalAbbreviation": "BB",
				"pages": "3-8",
				"libraryCatalog": "Juris"
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.juris.de/r3/search?query=DOKNR%3AKORE310852014",
		"items": [
			{
				"itemType": "case",
				"creators": [],
				"notes": [
					{
						"note": "<h2>Additional Metadata</h2><h3>Normen</h3><p>§ 97 Abs 1 S 1 UrhG</p><h3>Titel</h3><p>Urheberrechtsverletzung durch Teilnahme an einer Internet-Musiktauschbörse; Haftung des Internetanschlussinhabers für Rechtsverletzungen volljähriger Familienangehöriger; tatsächliche Vermutung für eine Täterschaft des Anschlussinhabers und Umfang dessen sekundärer Darlegungslast - BearShare</p>"
					}
				],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Juris Permalink",
						"snapshot": false
					},
					{
						"title": "Fulltext PDF",
						"mimeType": "application/pdf"
					}
				],
				"court": "BGH",
				"extra": "jurisdiction: de\ngenre: Urt.",
				"dateDecided": "2014-01-08",
				"docketNumber": "I ZR 169/12",
				"shortTitle": "BearShare",
				"caseName": "BGH, 08.01.2014 - I ZR 169/12 - BearShare"
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.juris.de/r3/search?query=DOKNR%3AKORE570922014",
		"items": [
			{
				"itemType": "case",
				"creators": [],
				"notes": [
					{
						"note": "<h2>Additional Metadata</h2><h3>Normen</h3><p>EGRL 29/2001 Art 3 Abs 2, EGRL 29/2001 Art 5 Abs 1, EGRL 29/2001 Art 5 Abs 2 Buchst b, EGRL 29/2001 Art 8 Abs 2, EGRL 29/2001 Art 8 Abs 3 ... mehr</p><h3>Titel</h3><p>Auslegung der Urheberrechtsrichtlinie auf Vorabentscheidungsersuchen eines österreichischen Gerichts: Gerichtliche Anordnung einer unbestimmten Website-Zugangssperrung gegenüber einem Anbieter von Internetzugangsdiensten wegen Urheberrechtsverletzungen</p>"
					}
				],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Juris Permalink",
						"snapshot": false
					},
					{
						"title": "Fulltext PDF",
						"mimeType": "application/pdf"
					}
				],
				"court": "EuGH",
				"extra": "jurisdiction: europa.eu\ngenre: Urt.",
				"dateDecided": "2014-03-27",
				"docketNumber": "C-314/12",
				"caseName": "EuGH, 27.03.2014 - C-314/12"
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.juris.de/r3/search?query=DOKNR%3AKORE307572013",
		"items": [
			{
				"itemType": "case",
				"creators": [],
				"notes": [
					{
						"note": "<h2>Additional Metadata</h2><h3>Normen</h3><p>§ 832 Abs 1 BGB, § 19a UrhG, § 78 Abs 1 Nr 1 UrhG, § 85 Abs 1 S 1 UrhG, § 97 UrhG</p><h3>Titel</h3><p>Urheberrechtsverletzung im Internet: Grenzen der Aufsichtspflicht von Eltern eines 13-jährigen Kindes hinsichtlich des Verbots der Teilnahme an Internet-Tauschbörsen - Morpheus</p>"
					}
				],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Juris Permalink",
						"snapshot": false
					},
					{
						"title": "Fulltext PDF",
						"mimeType": "application/pdf"
					}
				],
				"court": "BGH",
				"extra": "jurisdiction: de\ngenre: Urt.",
				"dateDecided": "2012-11-15",
				"docketNumber": "I ZR 74/12",
				"shortTitle": "Morpheus",
				"caseName": "BGH, 15.11.2012 - I ZR 74/12 - Morpheus"
			}
		]
	}
]
/** END TEST CASES **/
