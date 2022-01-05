{
	"translatorID": "d2959995-d0a2-4fb7-990f-16b671690e99",
	"label": "SSOAR",
	"creator": "Philipp Zumstein",
	"target": "^https?://www\\.ssoar\\.info/",
	"minVersion": "3",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsv",
	"lastUpdated": "2016-06-15 21:48:00"
}

/*
	***** BEGIN LICENSE BLOCK *****

	SSOAR Translator, Copyright © 2014 Philipp Zumstein
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

function detectWeb(doc, url) {
	var type = ZU.xpath(doc, '//meta[contains(@name, "DC.type")]/@content');
	if (type.length>0) {
		//Z.debug(type[0].textContent);
		if (mappingTable[type[0].textContent]) {
			return mappingTable[type[0].textContent];
		} else {//generic fallback
			return "journalArticle";
		}
	}
	
	if ( getSearchResults(doc).length>0 ) {
		return "multiple";
	}
}

var mappingTable = {
	"monograph" : "book",
	"article" : "journalArticle",
	"collection" : "book",
	"incollection" : "bookSection",
	"recension" : "journalArticle",
	"techreport" : "report",//not yet used
	"inproceeding" : "conferencePaper",//not yet used
}

function getSearchResults(doc) {
	return ZU.xpath(doc, '//div[contains(@class, "resultTableHeader")]/a[contains(@class, "resultTableHeader")]');
}

function doWeb(doc, url) {
	var articles = new Array();
	if (detectWeb(doc, url) == "multiple") {
		var items = {};
		var titles = getSearchResults(doc);
		for (var i=0; i<titles.length; i++) {
			items[titles[i].href] = titles[i].textContent;
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
	var bibUrl = url+"?style=bibtex";

	ZU.doGet(bibUrl, function(text) {
		bibTexContent = ZU.cleanTags(text);
		bibTexContent = bibTexContent.replace(/&#13;/g, "\n");
		
		var trans = Zotero.loadTranslator('import');
		trans.setTranslator('9cb70025-a888-4a29-a210-93ec52da40d4');//https://github.com/zotero/translators/blob/master/BibTeX.js
		trans.setString(bibTexContent);
	
		trans.setHandler('itemDone', function (obj, item) {
			//for debugging
			//item.notes.push({note:bibTexContent});
			
			//add doi
			var identfiers = ZU.xpath(doc, '//meta[contains(@name, "DC.identifier")]');
			if (!item.DOI) {
				for (var i=0; i<identfiers.length; i++) {
					var extractedId = identfiers[i].getAttribute("content");
					var start = extractedId.indexOf("10.");
					if (start > -1) {
						item.DOI = extractedId.substring(start);
					}
				}
			}
			
			//clean ISSN
			if (item.ISSN) {
				item.ISSN = ZU.cleanISSN(item.ISSN);
			}
			
			//add language
			item.language = ZU.xpathText(doc, '//meta[contains(@name, "DC.language")]/@content');
			
			//add place of publication
			var place = ZU.xpath(doc, '//td[contains(@class, "resourceDetailTableCellLabel") and text()="Erscheinungsort"] | //td[contains(@class, "resourceDetailTableCellLabel") and text()="City"]');
			if (place.length>0) {
				item.place = place[0].nextElementSibling.textContent;
			}
			
			//books in book series with numbers are handled wrong
			//add in this case series name, correct volume to number
			var series = ZU.xpath(doc, '//td[contains(@class, "resourceDetailTableCellLabel") and text()="Schriftenreihe"] | //td[contains(@class, "resourceDetailTableCellLabel") and text()="Series"]');
			if (series.length>0) {
				var seriesLine = series[0].nextElementSibling.textContent;
				var seriesLineParts = seriesLine.split(",");
				item.series = ZU.trimInternal(seriesLineParts[0]);
				if (seriesLineParts.length>1) {
					item.seriesNumber = ZU.trimInternal(seriesLineParts[1]);
					if (item.volume = item.seriesNumber) {
						delete item.volume;
					}
				}
			}
			
			//add pdf or snapshot
			var pdfUrl = ZU.xpath(doc, '//a[img[@alt="fulltextDownload"]]');
			if (pdfUrl.length>0) {
				item.attachments.push({url:pdfUrl[0].href, title:"SSOAR Full Text PDF", mimeType:"application/pdf"});
			} else {
				item.attachments.push( {title: "Snapshot", document:doc} );
			}
			
			//add rights information
			var linkedFields = ZU.xpath(doc, '//td[@class="resourceDetailTableCellValue"]/a[@href]');
			if (linkedFields.length>0) {
				var rights = linkedFields[linkedFields.length-1];
				item.rights = ZU.trimInternal(rights.textContent) + " cf. " + rights.href;
			}

			item.complete();
		});
		
		trans.translate();
	});
	
}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.ssoar.info/ssoar/handle/document/1919",
		"items": [
			{
				"itemType": "bookSection",
				"title": "Verstehen: Alltagspraxis und wissenschaftliches Programm",
				"creators": [
					{
						"firstName": "Ronald",
						"lastName": "Hitzler",
						"creatorType": "author"
					},
					{
						"firstName": "Thomas",
						"lastName": "Jung",
						"creatorType": "editor"
					},
					{
						"firstName": "Stefan",
						"lastName": "Müller-Doohm",
						"creatorType": "editor"
					}
				],
				"date": "1993",
				"ISBN": "9783518286487",
				"abstractNote": "Der Autor skizziert das Problem \"verstehender Soziologen\" zu \"erklären\", was ihr \"Tun zu einem wissenschaftlichen Unternehmen\" mache und es vom alltäglichen Verstehen unterscheidet. Er versucht den Nachweis der Relevanz zu führen und das Verhältnis von soziologischen und alltäglichen Verstehen zu analysieren, wie es in der phänomenologisch orientierten Tradition der Soziologie in Deutschland diskutiert werde. Die Soziologie sei dabei eine Form theoretischer Einstellung zur Wirklichkeit, die zwar auf alltäglicher Erfahrung aufbaue, aber eine andere Perspektive habe. Sozialwissenschaftliches Verstehen ist eine \"Kunstlehre\", so der Autor, gesellschaftliche Realität zuverlässig und überprüfbar zu rekonstruieren. Überlegungen zum \"Verstehen als Sinn-Rekonstruktion\" in der Soziologie schließen den Beitrag ab. (rk)",
				"itemID": "Hitzler1993",
				"language": "de",
				"libraryCatalog": "SSOAR",
				"pages": "223-240",
				"place": "Frankfurt am Main",
				"publisher": "Suhrkamp",
				"rights": "Creative Commons - Attribution-Noncommercial-No Derivative Works cf. http://creativecommons.org/licenses/by-nc-nd/3.0/",
				"series": "Suhrkamp-Taschenbuch Wissenschaft",
				"seriesNumber": "1048",
				"shortTitle": "Verstehen",
				"url": "http://nbn-resolving.de/urn:nbn:de:0168-ssoar-19196",
				"attachments": [
					{
						"title": "SSOAR Full Text PDF",
						"mimeType": "application/pdf"
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
		"url": "http://www.ssoar.info/ssoar/handle/document/35621",
		"items": [
			{
				"itemType": "bookSection",
				"title": "Neue Regionalisierungsansätze und Raumkategorien in Nordrhein-Westfalen: der kulturlandschaftliche Fachbeitrag der Landschaftsverbände Rheinland und Westfalen-Lippe zum Landesentwicklungsplan",
				"creators": [
					{
						"firstName": "Peter",
						"lastName": "Burggraaff",
						"creatorType": "author"
					},
					{
						"firstName": "Klaus-Dieter",
						"lastName": "Kleefeld",
						"creatorType": "author"
					},
					{
						"firstName": "Elmar",
						"lastName": "Knieps",
						"creatorType": "author"
					},
					{
						"firstName": "Bernd",
						"lastName": "Mielke",
						"creatorType": "editor"
					},
					{
						"firstName": "Angelika",
						"lastName": "Münter",
						"creatorType": "editor"
					}
				],
				"date": "2010",
				"ISBN": "9783888383526",
				"abstractNote": "Für die Neuaufstellung des Landesentwicklungsplanes in Nordrhein-Westfalen haben die Landschaftsverbände Westfalen-Lippe und Rheinland vorbereitend einen eigenständigen kulturlandschaftlichen Fachbeitrag erstellt. Neben der flächendeckenden Markierung von Kulturlandschaften wurden darin bedeutsame und landesbedeutsame Kulturlandschaftsbereiche hervorgehoben. Der Beitrag beschreibt das Vorgehen und die daraus abgeleiteten Leitlinien und Leitbilder sowie die konzeptionellen Konsequenzen für die Landes- und Regionalplanung in NRW. Letztlich soll ein zukünftig verantwortungsvoller Umgang mit der Kulturlandschaft und ihrem kulturellen Erbe erreicht werden. Hervorzuheben ist die interdisziplinäre Herangehensweise durch die Kulturdienststellen der beiden Landschaftsverbände mit einem gemeinsam abgestimmten Ergebnis, das für die Aufstellung des LEP eine Arbeitsgrundlage bildet.As a preparatory contribution to the framing of a new state development plan for North Rhine-Westphalia, the regional councils for the Rhineland and Westfalen-Lippe have produced an independent technical report on cultural landscapes. In addition to identifying all cultural landscapes throughout the plan area, the report also highlights examples of cultural landscapes which are of significance for the entire state. This paper provides a description of the approach adopted and describes the guidelines and visions which have been derived; it also outlines the conceptual consequences which ensue for state-level and regional planning in North Rhine-Westphalia. Ultimately the objective is to ensure that both cultural landscapes and the cultural heritage will in future be treated in a more responsible manner. One particularly noteworthy feature is the interdisciplinary approach adopted by the cultural services sections of both regional councils, resulting in one joint conclusion which forms the basis for further work to frame the new LEP, or state development plan.",
				"itemID": "Burggraaff2010",
				"language": "de",
				"libraryCatalog": "SSOAR",
				"pages": "184-202",
				"place": "Hannover",
				"publisher": "Verl. d. ARL",
				"rights": "Deposit Licence - No Redistribution, No Modifications cf. http://www.ssoar.info/en/home/informationen/vergabe-von-nutzungslizenzen.html#deposit",
				"series": "Arbeitsmaterial",
				"seriesNumber": "352",
				"shortTitle": "Neue Regionalisierungsansätze und Raumkategorien in Nordrhein-Westfalen",
				"url": "http://nbn-resolving.de/urn:nbn:de:0168-ssoar-356214",
				"attachments": [
					{
						"title": "SSOAR Full Text PDF",
						"mimeType": "application/pdf"
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
		"url": "http://www.ssoar.info/ssoar/handle/document/34188",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Book review of \"Transatlantic Feminisms in the Age of Revolutions\" by Lisa L. Moore, Joanna Brooks and Caroline Wigginton (Eds.)",
				"creators": [
					{
						"firstName": "Alexandra",
						"lastName": "Petrescu",
						"creatorType": "author"
					}
				],
				"date": "2013",
				"ISSN": "2285-4916",
				"issue": "2",
				"itemID": "Petrescu2013",
				"language": "en",
				"libraryCatalog": "SSOAR",
				"pages": "77-78",
				"publicationTitle": "European Quarterly of Political Attitudes and Mentalities",
				"rights": "Creative Commons - Attribution-Noncommercial-No Derivative Works cf. http://creativecommons.org/licenses/by-nc-nd/3.0/",
				"url": "http://nbn-resolving.de/urn:nbn:de:0168-ssoar-341882",
				"volume": "2",
				"attachments": [
					{
						"title": "SSOAR Full Text PDF",
						"mimeType": "application/pdf"
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
		"url": "http://www.ssoar.info/ssoar/handle/document/35463",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Die Ordnung des Diskurses in der Flüchtlingskonstruktion : eine postkoloniale Re-Lektüre",
				"creators": [
					{
						"firstName": "Heike",
						"lastName": "Niedrig",
						"creatorType": "author"
					},
					{
						"firstName": "Henri",
						"lastName": "Seukwa",
						"creatorType": "author"
					}
				],
				"date": "2010",
				"ISSN": "1862-5002",
				"abstractNote": "\"Ziel dieses Beitrages ist eine postkoloniale Dekonstruktion der essentialisierenden Kategorie 'Flüchtling'. Die Analyse geht davon aus, dass der 'Flüchtling' ein politisch-rechtliches und soziales Konstrukt ist, das bestimmte Funktionen für die national kodierte Selbstdeutung der Mehrheitsgesellschaft hat. Die Positionen in der Dreiecksstruktur Täter-Opfer-Retter werden in den dominanten diskursiven Formationen in einer Weise zugeordnet, die eine kollektive weiße europäische Identität konstruiert: Die Abwehr der 'falschen Flüchtlinge' (Täter) stabilisiert das imaginierte Zentrum durch Ausgrenzung der Nicht-Dazugehörigen; als 'Retter' der 'echten Flüchtlinge' (Opfer) wird das Bild von 'Europa' als Hort der Menschenrechte und der politischen wie moralischen Überlegenheit aufrecht erhalten, was allerdings die Ausblendung (post-)kolonialer Täterschaft und Verantwortlichkeit voraussetzt. Anhand der biographischen Narration eines 'Flüchtlingsjungen' werden Einblicke in (diskursive) Strategien der Selbstpositionierung im Rahmen dieses narrativen Machtraums gegeben. Den Abschluss bildet das Plädoyer für eine 'Entmoralisierung' des Flüchtlingsdiskurses in wissenschaftlichen und pädagogischen Kontexten.\" (Autorenreferat)\"This contribution endeavors to deconstruct the essentializing category 'refugee' from a postcolonial perspective. The starting point of the discourse analysis is the assumption that the 'refugee' is a political-legal and social construct, which has specific functions for the nationally coded self-definition of the social majority: The positions in the triangular structure aggressor-victim-rescuer are applied in such a manner within the dominant discursive formation as to construct a collective White European identity: Repulsing the 'false refugees' (aggressors) serves to stabilize the imagined centre by exclusion of those who do not belong; in the role of 'rescuer' of the 'true refugees' (victims) 'Europe' maintains its self-image as a stronghold of human rights and its position of political and moral superiority, a strategy which requires, however, collective amnesia with respect to (post-)colonial aggression and responsibilities. The biographic narration of a 'refugee boy' allows us to provide a glimpse into (discursive) strategies of self-positioning within this framework of narrative power. In the conclusion the authors plead for a 'demoralization' of the refugee discourse in scientific and educational contexts.\" (author's abstract)",
				"issue": "2",
				"itemID": "Niedrig2010",
				"language": "de",
				"libraryCatalog": "SSOAR",
				"pages": "181-193",
				"publicationTitle": "Diskurs Kindheits- und Jugendforschung",
				"rights": "Deposit Licence - No Redistribution, No Modifications cf. http://www.ssoar.info/en/home/informationen/vergabe-von-nutzungslizenzen.html#deposit",
				"shortTitle": "Die Ordnung des Diskurses in der Flüchtlingskonstruktion",
				"url": "http://nbn-resolving.de/urn:nbn:de:0168-ssoar-354632",
				"volume": "5",
				"attachments": [
					{
						"title": "SSOAR Full Text PDF",
						"mimeType": "application/pdf"
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
		"url": "http://www.ssoar.info/ssoar/handle/document/46968",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Convention Theory, classification and quantification",
				"creators": [
					{
						"firstName": "Rainer",
						"lastName": "Diaz-Bone",
						"creatorType": "author"
					}
				],
				"date": "2016",
				"DOI": "10.12759/hsr.41.2016.2.48-71",
				"ISSN": "0172-6404",
				"abstractNote": "The article presents the main contributions of the French approach of economics of convention (EC) to the analysis of classifications and quantifications. Here, Alain Desrosières has delivered many outstanding contributions. The article shortly presents the approach of EC. Conventions are socio-cognitive resources actors rely on to achieve shared interpretations, evaluations and valuations of situations and the value of objects, persons and actions. Also, the interpretation of institutions has to apply conventions. Conventions with semantic content and without semantic content are compared, and the different scopes of convention-based coordination (in time and space) are discussed. Also the conception of a political economy of classification and quantification is presented. At the end of the article, a typology of situations of classifications and quantifications is introduced.",
				"issue": "2",
				"itemID": "Diaz-Bone2016",
				"language": "en",
				"libraryCatalog": "SSOAR",
				"pages": "48-71",
				"publicationTitle": "Historical Social Research",
				"rights": "Creative Commons - Attribution-NonCommercial cf. http://creativecommons.org/licenses/by-nc/3.0/",
				"url": "http://nbn-resolving.de/urn:nbn:de:0168-ssoar-46968-6",
				"volume": "41",
				"attachments": [
					{
						"title": "SSOAR Full Text PDF",
						"mimeType": "application/pdf"
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