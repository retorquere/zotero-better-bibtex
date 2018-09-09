{
	"translatorID": "bc2ec385-e60a-4899-96ae-d4f0d6574ad7",
	"label": "Juris",
	"creator": "Reto Mantz",
	"target": "^https?://(www\\.)?juris\\.de/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsv",
	"lastUpdated": "2018-05-11 09:59:19"
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
// and only the old interface is working in Scaffold, which can be switched to
// by visiting the website
// https://www.juris.de/jportal/portal/t/dfj/page/jurisw.psml?r3switch=set_portal


// Array with the different - recognized - types
var mappingClassNameToItemType = {
	'URTEIL' : 'case',
	'URT.' : 'case',
	'BESCHLUSS' : 'case',
	'BESCHL.' : 'case'
};

// most information in Juris is saved in tables where the description of the data is of class TD30 => gather this data
var scrapeData = {};

function initData(doc) {
	var nodes = doc.getElementsByClassName('TD30');
	for (var i=0; i<nodes.length; i++) {
		var label = ZU.trimInternal(nodes[i].textContent);
		label = label.substr(0, label.length-1);  // chop off ':', but .replace(/:$/, '') may be more reliable
		var value = nodes[i].nextElementSibling;
		if (label && value) {
			scrapeData[label] = ZU.trimInternal(value.textContent);
		}
	}
	if (scrapeData['Norm']) {
		scrapeData['Normen'] = scrapeData['Norm'];
	}
}
	
function detectWeb(doc, url) {
	initData(doc);		// gather data
	
	if ((scrapeData['Beitragstyp'] || scrapeData['Dokumenttyp']) && scrapeData['Autor']) {
		return 'journalArticle';
	}
	if (scrapeData['Dokumenttyp'] && mappingClassNameToItemType[scrapeData['Dokumenttyp'].toUpperCase()]=='case') {
		return 'case';
	}
	Z.monitorDOMChanges(ZU.xpath(doc, '//div[@id="container"]/div')[0]);
}

function addNote(originalNote, newNote) {
	if (originalNote.length === 0) {
		originalNote = "Additional Metadata: "+newNote;
	}
	else
	{
		originalNote += newNote;
	}
	return originalNote;
}

function scrapeArticle(doc, url) {
	var item = new Zotero.Item("journalArticle");
	var note = "";
	
	// scrape authors
	var myAuthorsString = scrapeData['Autor'];
	
	// example: "Michael Fricke, Martin Gerecke"
	myAuthorsString = Zotero.Utilities.trimInternal(myAuthorsString);
	var myAuthors = myAuthorsString.split(",");

	for (var index = 0; index < myAuthors.length; ++index) {
		var author = Zotero.Utilities.trimInternal(myAuthors[index]);
		item.creators.push ( Zotero.Utilities.cleanAuthor(author, 'author', false) );
	}
	
	//scrape title
	var myTitle = ZU.xpathText(doc, "//div[@class='docLayoutTitel']");
	item.title = ZU.trimInternal(myTitle);
	// sometimes the title contains the authors at the end after separate <br/> tags
	// in this case, the div is structured differently
	// example article: BB 2014, 3
	var temp = ZU.xpath(doc, "//div[@class='docLayoutTitel']/h3/following-sibling::br");
	if (temp.length>0) {	// yes, there is additional information, then grab from another source
		item.title = ZU.xpathText(doc, "//div[@class='docLayoutTitel']/h3/a");
	}
	
	item.publicationTitle = ZU.xpathText(doc, '(//table//img[contains(@alt,"Abkürzung Fundstelle")]/@title)[1]');
	//scrape src
	//example 1: "AfP 2014, 293-299"
	//example 2: "ZStW 125, 259-298 (2013)"
	var mySrcString = scrapeData['Fundstelle'];

	// match example 1
	var matchSrc = mySrcString.match(/^([^,]+)\s(\d{4})\s*,\s*(\d+(?:-\d+)?)\s*$/);
	if (matchSrc) {
		item.journalAbbreviation = ZU.trimInternal(matchSrc[1]);
		item.date = matchSrc[2];
		item.pages = matchSrc[3];
	}
	// match example 2
	else if (matchSrc = mySrcString.match(/^([^,]+)\s(\d+)\s*,\s*(\d+(?:-\d+)?)\s*\((\d{4})\)\s*$/)) {
			item.journalAbbreviation = ZU.trimInternal(matchSrc[1]);
			item.issue = matchSrc[2];
			item.pages = matchSrc[3];
			item.date = matchSrc[4];
	}
	
	// regulations cited in the database for the article
	var citedRegulations = scrapeData['Normen'];
	if (citedRegulations) {
		note = addNote(note, "<h3>Normen</h3><p>" + ZU.trimInternal(citedRegulations) + "</p>");
	}
	
	if (note.length !== 0) {
		item.notes.push( {note: note} );
	}	
	item.attachments = [{
		title: "Snapshot",
		document: doc
	}];
	
	item.complete();
}

function scrapeCase(doc, url) {
	var item = new Zotero.Item('case');
	var note = "";
	
	// court
	item.court = scrapeData['Gericht'];
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
	var myDateString = scrapeData['Entscheidungsdatum'];
	item.dateDecided = myDateString.replace(/(\d\d?)\.\s*(\d\d?)\.\s*(\d\d\d\d)/, "$3-$2-$1");
	
	// docketNumber
	item.docketNumber = scrapeData['Aktenzeichen'];
	
	// type of decision. Save this in item.extra according to citeproc-js
	var decisionType = scrapeData['Dokumenttyp'];
	if (/(Beschluss)|Beschl\./i.test(decisionType)) {
		item.extra += "\ngenre: Beschl.";
	}
	else {
		if (/(Urteil)|(Urt\.)/i.test(decisionType)) {
			item.extra += "\ngenre: Urt.";
		}
	}
	
	// name of decision (caseName) if availabe
	// since the CSL stylesheet does not have a "caseName" property, but uses only "title" we have to use other field => item.history (=CSL.references)
	// also, item.caseName and item.title are identical in Zotero. Therefore, we should not use item.caseName at all
	
	var caseName = scrapeData['Entscheidungsname'];
	item.title = item.court + ", " + myDateString + " - " + item.docketNumber;
	if (caseName) {
		item.shortTitle = caseName;
		item.title += " - " + caseName;
	}
	
	// regulations cited in the database for the case
	var basedOnRegulations = scrapeData['Normen'];
	if (basedOnRegulations) {
		note = addNote(note, "<h3>Normen</h3><p>" + ZU.trimInternal(basedOnRegulations) + "</p>");
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
	
	if (note.length != 0) {
		item.notes.push( {note: note} );
	}	
		
	
	item.attachments = [{
		title: "Snapshot",
		document:doc
	}];

	item.complete();		
}


function doWeb (doc, url) {
	var myType = detectWeb(doc, url);
	if (myType == 'journalArticle') {
		scrapeArticle(doc, url);
	}
	else if (myType == 'case') {
		scrapeCase(doc, url);
	}
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://www.juris.de/jportal/portal/t/e44/page/jurisw.psml?doc.hl=1&doc.id=SBLU000136614&documentnumber=1&numberofresults=1&showdoccase=1&doc.part=S&paramfromHL=true#focuspoint",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Der Schutz der äußeren Sicherheit Deutschlands durch das Strafrecht",
				"creators": [
					{
						"firstName": "Nina",
						"lastName": "Nestler",
						"creatorType": "author"
					}
				],
				"date": "2013",
				"issue": "125",
				"journalAbbreviation": "ZStW",
				"libraryCatalog": "Juris",
				"pages": "259-298",
				"publicationTitle": "Zeitschrift für die gesamte Strafrechtswissenschaft",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [],
				"notes": [
					{
						"note": "Additional Metadata: <h3>Normen</h3><p>KrWaffKontrG, AWG, StGB</p>"
					}
				],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.juris.de/jportal/portal/t/e4k/page/jurisw.psml?doc.hl=1&doc.id=SILU000241514&documentnumber=1&numberofresults=1&showdoccase=1&doc.part=S&paramfromHL=true#focuspoint",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Informantenschutz und Informantenhaftung",
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
				"date": "2014",
				"journalAbbreviation": "AfP",
				"libraryCatalog": "Juris",
				"pages": "293-299",
				"publicationTitle": "Archiv für Presserecht",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [],
				"notes": [
					{
						"note": "Additional Metadata: <h3>Normen</h3><p>Art 5 GG, Art 10 MRK, § 53 Abs 1 Nr 5 StPO, § 97 Abs 5 StPO, § 383 Abs 1 Nr 5 ZPO ... mehr</p>"
					}
				],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.juris.de/jportal/portal/t/c5v/page/jurisw.psml?pid=Dokumentanzeige&showdoccase=1&js_peid=Trefferliste&documentnumber=1&numberofresults=1&fromdoctodoc=yes&doc.id=KORE316642014&doc.part=K&doc.price=0.0&doc.hl=1&doc.fopen=wf-#wf",
		"items": [
			{
				"itemType": "case",
				"caseName": "BGH, 15.05.2014 - I ZB 71/13 - Deus Ex",
				"creators": [],
				"dateDecided": "2014-05-15",
				"court": "BGH",
				"docketNumber": "I ZB 71/13",
				"extra": "jurisdiction: de\ngenre: Beschl.",
				"shortTitle": "Deus Ex",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [],
				"notes": [
					{
						"note": "Additional Metadata: <h3>Normen</h3><p>§ 101 Abs 2 S 1 Nr 3 UrhG, § 101 Abs 9 S 1 UrhG, § 91 Abs 1 S 1 ZPO</p><h3>Titel</h3><p>Urheberrechtsverletzung im Internet: Erstattungsfähigkeit der Kosten des Verfahrens gegen einen Internet-Provider auf Auskunft über die Inhaber bestimmter IP-Adressen - Deus Ex</p><h3>Fundstellen</h3><p>NSW UrhG § 101 (BGH-intern) NSW ZPO § 91 (BGH-intern) EBE/BGH 2014, 359-360 (Leitsatz und Gründe) WRP 2014, 1468-1469 (Leitsatz und Gründe) Magazindienst 2014, 1101-1103 (Leitsatz und Gründe) GRUR 2014, 1239-1240 (Leitsatz und Gründe) K&R 2014, 798-799 (Leitsatz und Gründe) MMR 2014, 825-826 (Leitsatz und Gründe) CR 2014, 794-795 (Leitsatz und Gründe) ZUM 2014, 967-969 (Leitsatz und Gründe) NJW 2015, 70-71 (Leitsatz und Gründe) Rpfleger 2015, 116-118 (Leitsatz und Gründe)</p>"
					}
				],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.juris.de/jportal/portal/t/h7p/page/jurisw.psml?doc.hl=1&doc.id=SBLU000100614&documentnumber=3&numberofresults=15000&showdoccase=1&doc.part=S&paramfromHL=true#focuspoint",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Die bauaufsichtliche Einführung der Eurocodes - ein Problem für das Vertragsrecht?",
				"creators": [
					{
						"firstName": "Michael",
						"lastName": "Halstenberg",
						"creatorType": "author"
					}
				],
				"date": "2014",
				"journalAbbreviation": "BauR",
				"libraryCatalog": "Juris",
				"pages": "431-442",
				"publicationTitle": "Baurecht",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [],
				"notes": [
					{
						"note": "Additional Metadata: <h3>Normen</h3><p>§ 69 BauO NW, § 633 BGB, VOB B</p>"
					}
				],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.juris.de/jportal/portal/t/cgn/page/jurisw.psml?doc.hl=1&doc.id=MWRE140003062&documentnumber=49&numberofresults=15000&showdoccase=1&doc.part=L&paramfromHL=true#focuspoint",
		"items": [
			{
				"itemType": "case",
				"caseName": "VG Frankfurt, 04.11.2014 - 6 L 544/14.A, 6 L 544/14.A (PKH)",
				"creators": [],
				"dateDecided": "2014-11-04",
				"court": "VG Frankfurt",
				"docketNumber": "6 L 544/14.A, 6 L 544/14.A (PKH)",
				"extra": "jurisdiction: de\ngenre: Beschl.",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [],
				"notes": [
					{
						"note": "Additional Metadata: <h3>Normen</h3><p>§ 71a Abs 1 AsylVfG 1992</p><h3>Titel</h3><p>Behandlung eines Asylantrages als Folgeantrag, der nach Ablehnung eines in einem EU-Mitgliedstaat (hier: Ungarn) gestellten Asylantrages abgelehnt worden war</p><h3>Fundstellen</h3><p>AuAS 2015, 8-9 (red. Leitsatz und Gründe)</p>"
					}
				],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.juris.de/jportal/portal/t/h5z/page/jurisw.psml?pid=Dokumentanzeige&showdoccase=1&js_peid=Trefferliste&documentnumber=1&numberofresults=15000&fromdoctodoc=yes&doc.id=jzs-B2-1422A-1283-1&doc.part=B&doc.price=0.0#focuspoint",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Maßnahmenpaket der Europäischen Kommission zum Gesellschaftsrecht und Corporate Governance",
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
				"date": "2014",
				"journalAbbreviation": "BB",
				"libraryCatalog": "Juris",
				"pages": "1283-1294",
				"publicationTitle": "Betriebs-Berater",
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
		"url": "https://www.juris.de/jportal/portal/t/hdi/page/jurisw.psml?doc.hl=1&doc.id=JURE140017979&documentnumber=7&numberofresults=802&showdoccase=1&doc.part=L&paramfromHL=true#focuspoint",
		"items": [
			{
				"itemType": "case",
				"caseName": "LG Köln, 22.10.2014 - 26 O 142/13",
				"creators": [],
				"dateDecided": "2014-10-22",
				"court": "LG Köln",
				"docketNumber": "26 O 142/13",
				"extra": "jurisdiction: de\ngenre: Urt.",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [],
				"notes": [
					{
						"note": "Additional Metadata: <h3>Normen</h3><p>§ 143 Abs 1 S 1 InsO, § 133 InsO</p><h3>Titel</h3><p>Anspruch des Insolvenzverwalters auf Rückgewähr der Leistungen nach Insolvenzanfechtung</p>"
					}
				],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.juris.de/jportal/portal/t/1rys/page/jurisw.psml?doc.hl=1&doc.id=jzs-B2-1401A-3-1&documentnumber=2&numberofresults=742&showdoccase=1&doc.part=B&paramfromHL=true#focuspoint",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Die Insolvenzanfechtung von (überhöhten) Gehältern und Vergütungen von Geschäftsleitern und Sanierungsberatern",
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
				"date": "2014",
				"journalAbbreviation": "BB",
				"libraryCatalog": "Juris",
				"pages": "3-8",
				"publicationTitle": "Betriebs-Berater",
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
		"url": "https://www.juris.de/jportal/portal/t/5tw/page/jurisw.psml?doc.hl=1&doc.id=KORE310852014&documentnumber=1&numberofresults=2&showdoccase=1&doc.part=K&paramfromHL=true#focuspoint",
		"items": [
			{
				"itemType": "case",
				"caseName": "BGH, 08.01.2014 - I ZR 169/12 - BearShare",
				"creators": [],
				"dateDecided": "2014-01-08",
				"court": "BGH",
				"docketNumber": "I ZR 169/12",
				"extra": "jurisdiction: de\ngenre: Urt.",
				"shortTitle": "BearShare",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [],
				"notes": [
					{
						"note": "Additional Metadata: <h3>Normen</h3><p>§ 97 Abs 1 S 1 UrhG</p><h3>Titel</h3><p>Urheberrechtsverletzung durch Teilnahme an einer Internet-Musiktauschbörse; Haftung des Internetanschlussinhabers für Rechtsverletzungen volljähriger Familienangehöriger; tatsächliche Vermutung für eine Täterschaft des Anschlussinhabers und Umfang dessen sekundärer Darlegungslast - BearShare</p><h3>Fundstellen</h3><p>BGHZ 200, 76-86 (Leitsatz und Gründe) NSW UrhG § 97 (BGH-intern) WM 2014, 1143-1146 (Leitsatz und Gründe) WRP 2014, 851-854 (Leitsatz und Gründe) GRUR 2014, 657-660 (Leitsatz und Gründe) CR 2014, 472-475 (Leitsatz und Gründe) Magazindienst 2014, 642-647 (Leitsatz und Gründe) MDR 2014, 849-850 (Leitsatz und Gründe) K&R 2014, 513-516 (Leitsatz und Gründe) MMR 2014, 547-550 (Leitsatz und Gründe) NJW 2014, 2360-2362 (Leitsatz und Gründe) FamRZ 2014, 1291-1293 (Leitsatz und Gründe) VuR 2014, 316-318 (Leitsatz und Gründe) ZUM 2014, 707-710 (Leitsatz und Gründe) AfP 2014, 320-324 (Leitsatz und Gründe) VersR 2014, 1007-1009 (Leitsatz und Gründe) WuB IV A § 1004 BGB 1.14 (Leitsatz und Gründe)</p>"
					}
				],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.juris.de/jportal/portal/t/5tz/page/jurisw.psml?doc.hl=1&doc.id=KORE570922014&documentnumber=1&numberofresults=40&showdoccase=1&doc.part=K&paramfromHL=true#focuspoint",
		"items": [
			{
				"itemType": "case",
				"caseName": "EuGH, 27.03.2014 - C-314/12",
				"creators": [],
				"dateDecided": "2014-03-27",
				"court": "EuGH",
				"docketNumber": "C-314/12",
				"extra": "jurisdiction: europa.eu\ngenre: Urt.",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [],
				"notes": [
					{
						"note": "Additional Metadata: <h3>Normen</h3><p>EGRL 29/2001 Art 3 Abs 2, EGRL 29/2001 Art 5 Abs 1, EGRL 29/2001 Art 5 Abs 2 Buchst b, EGRL 29/2001 Art 8 Abs 2, EGRL 29/2001 Art 8 Abs 3 ... mehr</p><h3>Titel</h3><p>Auslegung der Urheberrechtsrichtlinie auf Vorabentscheidungsersuchen eines österreichischen Gerichts: Gerichtliche Anordnung einer unbestimmten Website-Zugangssperrung gegenüber einem Anbieter von Internetzugangsdiensten wegen Urheberrechtsverletzungen</p><h3>Fundstellen</h3><p>ABl EU 2014, Nr C 151, 2-3 (Leitsatz) GRUR 2014, 468-472 (Leitsatz und Gründe) GRUR Int 2014, 469-474 (Leitsatz und Gründe) K&R 2014, 329-333 (Leitsatz und Gründe) WRP 2014, 540-544 (Leitsatz und Gründe) EuZW 2014, 388-391 (Leitsatz und Gründe) Medien und Recht 2014, 82-87 (red. Leitsatz und Gründe) NJW 2014, 1577-1580 (Leitsatz und Gründe) RIW 2014, 373-377 (red. Leitsatz und Gründe) ZUM 2014, 494-498 (Leitsatz und Gründe) MMR 2014, 397-399 (Leitsatz und Gründe) EuGRZ 2014, 301-306 (red. Leitsatz und Gründe) CR 2014, 469-472 (Leitsatz und Gründe) EWS 2014, 225-230 (Leitsatz und Gründe)</p>"
					}
				],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.juris.de/jportal/portal/t/kli/page/jurisw.psml?doc.hl=1&doc.id=KORE307572013&documentnumber=2&numberofresults=12&showdoccase=1&doc.part=K&paramfromHL=true#focuspoint",
		"items": [
			{
				"itemType": "case",
				"caseName": "BGH, 15.11.2012 - I ZR 74/12 - Morpheus",
				"creators": [],
				"dateDecided": "2012-11-15",
				"court": "BGH",
				"docketNumber": "I ZR 74/12",
				"extra": "jurisdiction: de\ngenre: Urt.",
				"shortTitle": "Morpheus",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [],
				"notes": [
					{
						"note": "Additional Metadata: <h3>Normen</h3><p>§ 832 Abs 1 BGB, § 19a UrhG, § 78 Abs 1 Nr 1 UrhG, § 85 Abs 1 S 1 UrhG, § 97 UrhG</p><h3>Titel</h3><p>Urheberrechtsverletzung im Internet: Grenzen der Aufsichtspflicht von Eltern eines 13-jährigen Kindes hinsichtlich des Verbots der Teilnahme an Internet-Tauschbörsen - Morpheus</p><h3>Fundstellen</h3><p>Zitierungen: Entgegen OLG Köln, 23. Dezember 2009, 6 U 101/09, GRUR-RR 2010, 173; LG Hamburg, 25. Januar 2006, 308 O 58/06, MMR 2006, 700; LG Hamburg, 11. Mai 2006, 308 O 196/06; LG Hamburg, 2. August 2006, 308 O 509/09; LG München I, 19. Juni 2008, 7 O 16402/07, MMR 2008, 619 und LG Düsseldorf, 6. Juli 2011, 12 O 256/10, ZUM-RD 2011, 698; Bestätigung OLG Frankfurt, 20. Dezember 2007, 11 W 58/07, BB 2008, 229; LG Mannheim, 29. September 2006, 7 O 76/06, MMR 2007, 267; LG Mannheim, 29. September 2006, 7 O 62/06 und LG Mannheim, 30. Januar 2007, 2 O 71/06.(Rn.20)</p>"
					}
				],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/
