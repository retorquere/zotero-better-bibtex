{
	"translatorID": "e8544423-1515-4daf-bb5d-3202bf422b58",
	"label": "beck-online",
	"creator": "Philipp Zumstein",
	"target": "^https?://beck-online\\.beck\\.de",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsv",
	"lastUpdated": "2014-04-14 11:50:31"
}

/*
	***** BEGIN LICENSE BLOCK *****

	beck-online Translator, Copyright © 2014 Philipp Zumstein
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

//Disclaimer:
//This is written mainly for articles/cases in the journals in beck-online
//Probably, it might work further on other material (e.g. ebooks) in beck-online.


var mappingClassNameToItemType = {
	'ZAUFSATZ' : 'journalArticle',
	'ZRSPR' : 'case',//Rechtssprechung
	'ZENTB' : 'journalArticle',//Entscheidungsbesprechung
	'ZBUCHB' : 'journalArticle',//Buchbesprechung
	'ZSONST' : 'journalArticle',//Sonstiges, z.B. Vorwort
	'ZINHALTVERZ' : 'multiple'//Inhaltsverzeichnis
}

function detectWeb(doc, url) {
	var documentClassName = doc.getElementById("dokument").className;
	//Z.debug(documentClassName);
	if (mappingClassNameToItemType[documentClassName.toUpperCase()]) {
		return mappingClassNameToItemType[documentClassName.toUpperCase()];
	}
}


function doWeb(doc, url) {
	if (detectWeb(doc, url) == "multiple") {
		
		var items = new Object();
		var articles = new Array();
		
		var rows = ZU.xpath(doc, '//div[@class="inh"]//span[@class="inhdok"]//a | //div[@class="autotoc"]//a');
		for(var i=0; i<rows.length; i++) {
			//rows[i] contains an invisible span with some text, which we have to exclude, e.g.
			//   <span class="unsichtbar">BKR Jahr 2014 Seite </span>
			//   Dr. iur. habil. Christian Hofmann: Haftung im Zahlungsverkehr
			var title = ZU.trimInternal( ZU.xpathText(rows[i], './text()[1]') );
			var link = rows[i].href;
			items[link] = title;
		}
		Zotero.selectItems(items, function (items) {
			if (!items) {
				return true;
			}
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
	var documentClassName = doc.getElementById("dokument").className;
	var item;
	if (mappingClassNameToItemType[documentClassName.toUpperCase()]) {
		item = new Zotero.Item(mappingClassNameToItemType[documentClassName.toUpperCase()]);
	}
	
	var titleNode = ZU.xpath(doc, '//div[@class="titel"]')[0] || ZU.xpath(doc, '//div[@class="dk2"]//span[@class="titel"]')[0];
	item.title = ZU.trimInternal(titleNode.textContent);
	
	var authorNode = ZU.xpath(doc, '//div[@class="autor"]');
	for (var i=0; i<authorNode.length; i++) {
		//normally several authors are under the same authorNode
		//and they occur in pairs with first and last names
		
		var authorFirstNames = ZU.xpath(authorNode[i], './/span[@class="vname"]');
		var authorLastNames = ZU.xpath(authorNode[i], './/span[@class="nname"]');
		for (var j=0; j<authorFirstNames.length; j++) {
			item.creators.push({
				lastName : authorLastNames[j].textContent , 
				firstName : authorFirstNames[j].textContent ,
				creatorType: "author"
			});
		}
	}
	
	if (item.creators.length == 0) {
		authorNode = ZU.xpath(doc, '//div[@class="autor"]/p | //p[@class="authorline"]/text() | //div[@class="authorline"]/p/text()');
		for (var j=0; j<authorNode.length; j++) {
			//first we delete some prefixes
			var authorString = authorNode[j].textContent.replace(/\/|Dr\. (h\. c\.)?|Professor|wiss\.? Mitarbeiter(in)?|RA,?|FAArbR|Fachanwalt für Insolvenzrecht|Rechtsanwalt|Rechtsanwältin|Rechtsanwälte|Richter am AG|Richter am BGH|zur Fussnote|\*|, LL.M.|^Von/g,"");
			//authors can be seperated by "und" and "," if there are 3 or more authors
			//a comma can also mark the beginning of suffixes, which we want to delete
			//therefore we have to distinguish these two cases in the following
			var posUnd = authorString.indexOf("und");
			var posComma = authorString.indexOf(",");
			if (posUnd > posComma) {
				var posComma = authorString.indexOf(",",posUnd);
			}
			if (posComma > 0) {
				authorString = authorString.substr(0,posComma);
			}
			//Z.debug(authorString);
			
			authorArray = authorString.split(/und|,/);
			for (var k=0; k<authorArray.length; k++) {
				item.creators.push(ZU.cleanAuthor(ZU.trimInternal(authorArray[k])));
			}
			
			
		}
		
	}
	
	
	item.publicationTitle = ZU.xpathText(doc, '//li[@class="breadcurmbelemenfirst"]');
	item.journalAbbreviation = ZU.xpathText(doc, '//div[@id="doktoc"]/ul/li/a[2]');
	
	item.date = ZU.xpathText(doc, '//div[@id="doktoc"]/ul/li/ul/li/a[2]');
	
	//e.g. Heft 6 (Seite 141-162)
	item.issue = ZU.xpathText(doc, '//div[@id="doktoc"]/ul/li/ul/li/ul/li/a[2]').replace(/\([^\)]*\)/,"").match(/\d+/)[0];
	
	//e.g. ArbrAktuell 2014, 150
	var shortCitation = ZU.xpathText(doc, '//div[@class="dk2"]//span[@class="citation"]');
	var pagesStart = ZU.trimInternal(shortCitation.substr(shortCitation.lastIndexOf(",")+1));
	var pagesEnd = ZU.xpathText(doc, '(//span[@class="pg"])[last()]');
	if (pagesEnd) {
		item.pages = pagesStart + "-" + pagesEnd;
	} else {
		item.pages = pagesStart
	}
	
	item.abstractNote = ZU.xpathText(doc, '//div[@class="abstract"]') || ZU.xpathText(doc, '//div[@class="leitsatz"]');
	if (item.abstractNote){
		item.abstractNote = item.abstractNote.replace(/\n\s*\n/g, "\n");
	}
	
	if (item.itemType == "case") {
		var courtLine = ZU.xpath(doc, '//div[contains(@class, "gerzeile")]/p');
		//Z.debug(courtLine);
		item.court = ZU.xpathText(courtLine, './span[@class="gericht"]');
		item.dateDecided = ZU.xpathText(courtLine, './span[@class="edat"] | ./span[@class="datum"]');
		if (item.dateDecided){//e.g. 24. 9. 2001
			item.dateDecided = item.dateDecided.replace(/(\d\d?)\.\s*(\d\d?)\.\s*(\d\d\d\d)/, "$3-$2-$1");
		}
		//item.dateDecided.replace(/(\d\d?)\.\s*(\d\d?)\.\s(\d\d\d\d)/, "\3-\2-\1");
		item.docketNumber = ZU.xpathText(courtLine, './span[@class="az"]');
		item.history = ZU.xpathText(courtLine, './span[@class="vorinst"]');
		
		item.shortTitle = ZU.trimInternal(courtLine[0].textContent);
		
		item.reporter = item.journalAbbreviation;
		item.reporterVolume = item.date;
		
		var otherCitations = ZU.xpath(doc, '//li[contains(@id, "Parallelfundstellen")]');
		item.extra = "Parallelfundstellen: " + ZU.xpathText(otherCitations[0], './ul/li',  null, " ; ");
		
		var basedOnRegulations = ZU.xpathText(doc, '//div[contains(@class,"normenk")]');
		if (basedOnRegulations) {
			item.notes.push( ZU.trimInternal(basedOnRegulations) );
		}
		
	}
	
	if (documentClassName == "ZBUCHB") {
		item.extra = ZU.xpathText(doc, '//div[@class="biblio"]');
	}
		
	item.attachments = [{
		title: "Snapshot",
		document:doc
	}];

	item.complete();
}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://beck-online.beck.de/?vpath=bibdata%2fzeits%2fDNOTZ-SONDERH%2f2012%2fcont%2fDNOTZ-SONDERH%2e2012%2e88%2e1%2ehtm",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"lastName": "Roth",
						"firstName": "Günter H.",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"title": "Best practice – Grundstrukturen des kontinentaleuropäischen Gesellschaftsrechts",
				"publicationTitle": "Sonderheft der Deutschen Notar-Zeitschrift",
				"journalAbbreviation": "DNotZ-Sonderheft",
				"date": "2012",
				"issue": "1",
				"pages": "88-95",
				"libraryCatalog": "beck-online"
			}
		]
	},
	{
		"type": "web",
		"url": "https://beck-online.beck.de/default.aspx?typ=reference&y=300&z=BKR&b=2001&s=99&n=1",
		"items": [
			{
				"itemType": "case",
				"creators": [],
				"notes": [
					"§ WPHG § 15 WpHG; § BOERSG § 88 BörsG; §§ BGB § 823, BGB § 826 BGB"
				],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"title": "Schadensersatz wegen fehlerhafter Ad-hoc-Mitteilungen („Infomatec”)",
				"publicationTitle": "Zeitschrift für Bank- und Kapitalmarktrecht",
				"journalAbbreviation": "BKR",
				"date": "2001",
				"issue": "2",
				"pages": "99-101",
				"abstractNote": "Leitsätze der Redaktion:\n    1. Ad-hoc-Mitteilungen richten sich nicht nur an ein bilanz- und fachkundiges Publikum, sondern an alle tatsächlichen oder potenziellen Anleger und Aktionäre.\n    2. \n    § BOERSG § 88 Abs. BOERSG § 88 Absatz 1 Nr. 1 BörsG dient neben dem Schutz der Allgemeinheit gerade auch dazu, das Vermögen des einzelnen Kapitalanlegers vor möglichen Schäden durch eine unredliche Beeinflussung der Preisbildung an Börsen und Märkten zu schützen.",
				"court": "LG Augsburg",
				"dateDecided": "2001-9-24",
				"docketNumber": "3 O 4995/00",
				"shortTitle": "LG Augsburg, Urteil vom 24. 9. 2001 - 3 O 4995/00 (nicht rechtskräftig)",
				"reporter": "BKR",
				"reporterVolume": "2001",
				"extra": "Parallelfundstellen: BB 2001 Heft 42, 2130 ; DB 2001, 2334 ; LSK 2001, 520032 ; NJOZ 2001, 1878 ; NJW-RR 2001, 1705 ; NZG 2002, 429 ; WPM 2001, 1944 ; ZIP 2001, 1881 ; FHZivR 47 Nr. 2816 (Ls.) ; FHZivR 47 Nr. 6449 (Ls.) ; FHZivR 48 Nr. 2514 (Ls.) ; FHZivR 48 Nr. 6053 (Ls.) ; NJW-RR 2003, 216 (Ls.)",
				"libraryCatalog": "beck-online"
			}
		]
	},
	{
		"type": "web",
		"url": "https://beck-online.beck.de/default.aspx?typ=reference&y=300&z=NJW&b=2014&s=898&n=1",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"firstName": "Boris",
						"lastName": "Scholtka"
					},
					{
						"firstName": "Antje",
						"lastName": "Baumbach"
					},
					{
						"firstName": "Marike",
						"lastName": "Pietrowicz"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"title": "Die Entwicklung des Energierechts im Jahr 2013",
				"publicationTitle": "Neue Juristische Wochenschrift",
				"journalAbbreviation": "NJW",
				"date": "2014",
				"issue": "13",
				"pages": "898-903",
				"abstractNote": "Der Bericht knüpft an die bisher in dieser Reihe erschienenen Beiträge zur Entwicklung des Energierechts (zuletzt NJW 2013, NJW Jahr 2013 Seite 2724) an und zeigt die Schwerpunkte energierechtlicher Entwicklungen in Gesetzgebung und Rechtsanwendung im Jahr 2013 auf.",
				"libraryCatalog": "beck-online"
			}
		]
	},
	{
		"type": "web",
		"url": "https://beck-online.beck.de/default.aspx?vpath=bibdata%2fzeits%2fNJW%2f2014%2fcont%2fNJW%2e2014%2e930%2e1%2ehtm",
		"items": [
			{
				"itemType": "case",
				"creators": [],
				"notes": [
					"BGB §§ BGB § 276, BGB § 278, BGB § 651 a BGB § 651A Absatz V 1; HGB § HGB § 87 a HGB § 87A Absatz III 2"
				],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"title": "BGH: Provisionsanspruch des Reisevermittlers bei Absage der Reise durch den Veranstalter",
				"publicationTitle": "Neue Juristische Wochenschrift",
				"journalAbbreviation": "NJW",
				"date": "2014",
				"issue": "13",
				"pages": "930-932",
				"court": "BGH",
				"dateDecided": "2014-1-23",
				"docketNumber": "VII ZR 168/13",
				"shortTitle": "BGH, Urteil vom 23.1.2014 – VII ZR 168/13",
				"reporter": "NJW",
				"reporterVolume": "2014",
				"extra": "Parallelfundstellen: BeckRS 2014, 03315 ; GWR 2014, 125 ; IBRRS 96371 ; LSK 2014, 110552 ; MDR 2014, 354 ; ZVertriebsR 2014, 98 ; ZVertriebsR 2014, 98 ; ADAJUR Dok.Nr. 103938 (Ls...",
				"libraryCatalog": "beck-online"
			}
		]
	},
	{
		"type": "web",
		"url": "https://beck-online.beck.de/?vpath=bibdata%2fzeits%2fGRUR%2f2003%2fcont%2fGRUR%2e2003%2eH09%2eNAMEINHALTSVERZEICHNIS%2ehtm",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://beck-online.beck.de/Default.aspx?words=ZUM+2013%2C+909&btsearch.x=42&btsearch.x=0&btsearch.y=0",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"firstName": "Günter",
						"lastName": "Krings"
					},
					{
						"firstName": "Christian-Henner",
						"lastName": "Hentsch"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"title": "Das neue Zweitverwertungsrecht",
				"publicationTitle": "ZUM",
				"journalAbbreviation": "ZUM",
				"date": "2013",
				"issue": "12",
				"pages": "909-913",
				"libraryCatalog": "beck-online"
			}
		]
	}
]
/** END TEST CASES **/