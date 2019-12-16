{
	"translatorID": "8d5984e8-3ba9-4faa-8b84-a58adae56439",
	"label": "GMS German Medical Science",
	"creator": "Philipp Zumstein",
	"target": "^https?://www\\.egms\\.de/static/(de|en)/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2018-11-12 15:53:36"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2017 Philipp Zumstein
	
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
	if (url.indexOf('/journals/')>-1 && url.indexOf('.shtml')>-1) {
		return "journalArticle";
	} else if (url.indexOf('/meetings/')>-1 && url.indexOf('.shtml')>-1) {
		return "conferencePaper";
	} else if (getSearchResults(doc, true)) {
		return "multiple";
	}
}


function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = ZU.xpath(doc, '//div[contains(@class, "article-list-entry")]/h4/a[contains(@class, "hx_link")]');
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
	var type = detectWeb(doc, url);
	var xmlUrl = ZU.xpathText(doc, '//a[contains(@class, "format_xml")]/@href');
	ZU.doGet(xmlUrl, function(data) {
		var parser = new DOMParser();
		var xml = parser.parseFromString(data, "application/xml");
		var item = new Zotero.Item(type);
		//titles are sometimes given in multiple languages,
		//but we only take the first one
		item.title = ZU.xpathText(xml, '(//TitleGroup/Title)[1]');
		var creators = ZU.xpath(xml, '//CreatorList/Creator');
		for (var i=0; i<creators.length; i++) {
			item.creators.push({
				'lastName': ZU.xpathText(creators[i], './PersonNames/Lastname'),
				'firstName': ZU.xpathText(creators[i], './PersonNames/Firstname'),
				'creatorType': 'author'
			});
		}
		item.publisher = ZU.xpathText(xml, '//PublisherList/Publisher/Corporation');
		item.DOI = ZU.xpathText(xml, '//IdentifierDoi');
		item.language = ZU.xpathText(xml, '//Language');
		item.date = ZU.xpathText(xml, '//DatePublishedList/DatePublished');
		if (item.date) {
			item.date = item.date.replace(/(\d\d\d\d)(\d\d)(\d\d)/, "$1-$2-$3");
		}
		item.ISSN = ZU.xpathText(xml, '//SourceGroup/Journal/ISSN');
		item.volume = ZU.xpathText(xml, '//SourceGroup/Journal/Volume');
		item.issue = ZU.xpathText(xml, '//SourceGroup/Journal/Issue');
		item.publicationTitle = ZU.xpathText(xml, '//SourceGroup/Journal/JournalTitle');
		item.journalAbbreviation = ZU.xpathText(xml, '//SourceGroup/Journal/JournalTitleAbbr');
		var articleNo = ZU.xpathText(xml, '//ArticleNo');
		if (articleNo) {
			item.pages = 'Doc' + articleNo;
		}
		
		item.rights = ZU.xpathText(xml, '(//License/AltText)[1]');

		var tags_en = ZU.xpath(xml, '//SubjectGroup/Keyword[@language="en"]');
		var tags_de = ZU.xpath(xml, '//SubjectGroup/Keyword[@language="de"]');
		var tags = ZU.xpath(xml, '//SubjectGroup/Keyword');
		if (item.language.indexOf('en')>-1 && tags_en) {
			tags = tags_en;
		}
		if (item.language.indexOf('ger')>-1 && tags_de) {
			tags = tags_de;
		}
		for (var i=0; i<tags.length; i++) {
			item.tags.push(tags[i].textContent);
		}
		
		item.abstractNote = ZU.xpathText(xml, '//Abstract[1]');
		
		item.attachments.push({
			document: doc,
			title: "Snapshot"
		});
		
		item.complete();
	});
	
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://www.egms.de/static/de/journals/gms/2017-15/000242.shtml",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "The prevalence of chronic pain in orchestra musicians",
				"creators": [
					{
						"lastName": "Gasenzer",
						"firstName": "Elena R.",
						"creatorType": "author"
					},
					{
						"lastName": "Klumpp",
						"firstName": "Marie-Juliana",
						"creatorType": "author"
					},
					{
						"lastName": "Pieper",
						"firstName": "Dawid",
						"creatorType": "author"
					},
					{
						"lastName": "Neugebauer",
						"firstName": "Edmund A. M.",
						"creatorType": "author"
					}
				],
				"date": "2017-01-12",
				"DOI": "10.3205/000242",
				"ISSN": "1612-3174",
				"abstractNote": "Hintergrund: Die Studie beschäftigte sich mit dem Auftreten chronischer Schmerzen, ihren Ursachen und ihren Mechanismen bei (klassischen) Orchestermusikern. Ziele: Chronischer Schmerz ist ein weitreichendes Problem unter Orchestermusikern. Ursachen sind die sehr spezielle Haltung und Spieltechnik der verschiedenen klassischen Orchesterinstrumente, sowie lange Spiel- und Übezeiten. Der chronische Schmerz des Orchestermusikers hat weitreichende Auswirkungen auf seine künstlerische Tätigkeit wie auch auf alltagspraktische Aktivitäten.Methoden: Es wurden 8.645 professionelle Musiker deutscher, öffentlich geförderter Sinfonie-, Opern-, Konzert- und Rundfunkorchester kontaktiert und mittels eines Online-Fragebogens zu ihren akuten oder chronischen Schmerzen befragt. Die Kontrollgruppe bildeten Musiker aus denselben Orchestern, die angaben, keine Schmerzen zu haben.Ergebnisse: Die Rückantwortquote betrug 8,6% (n=740). 66,2% (n=490) der Befragten gaben an, unter Schmerzen zu leiden. Bezüglich der Lokalisation wurden Körperpartien genannt, die beim Spiel der verschiedenen Instrumente am stärksten belastet werden, wie Rücken (70%), Schultern (67,8%), Nacken (64,1%) sowie Hände/Handgelenke (39,8%). 27,4% der Teilnehmer gaben an unter Schmerzen zu leiden, die sie insgesamt sehr stark beeinträchtigen. Schlussfolgerung: Die Ergebnisse der Studie zeigen, dass chronische Schmerzen bei Orchestermusikern ein häufiges und sehr ernstes Problem sind, dessen Mechanismen und Ursachen umfassend erforscht werden sollten.",
				"journalAbbreviation": "GMS Ger Med Sci",
				"language": "engl",
				"libraryCatalog": "GMS German Medical Science",
				"pages": "Doc01",
				"publicationTitle": "GMS German Medical Science",
				"rights": "This is an Open Access article distributed under the terms of the Creative Commons Attribution 4.0 License.",
				"volume": "15",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					{
						"tag": "chronic pain"
					},
					{
						"tag": "music instruments"
					},
					{
						"tag": "musician"
					},
					{
						"tag": "orchestra"
					},
					{
						"tag": "prevalence"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.egms.de/static/de/journals/cpo/2017-13/cpo001859.shtml",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Schmerzdynamik nach Tonsillektomie – eine prospektive Studie",
				"creators": [
					{
						"lastName": "Bergmann",
						"firstName": "Marianne",
						"creatorType": "author"
					},
					{
						"lastName": "Laskawi",
						"firstName": "Rainer",
						"creatorType": "author"
					}
				],
				"date": "2017-04-26",
				"DOI": "10.3205/cpo001859",
				"ISSN": "1865-1038",
				"abstractNote": "Einleitung: Die Tonsillektomie (TE) gehört zu den häufigsten Eingriffen im HNO-Bereich. Neben dem Nachblutungsrisiko zählen postoperative Schmerzen zu den Risiken eines solchen Eingriffs. Da darüber hinaus  die Nahrungs- und Flüssigkeitszufuhr eingeschränkt sein kann, stellen postoperative Schmerzen ein relevantes Problem dar.Methoden: In der vorliegenden Studie wurde die postoperative Schmerzentwicklung und Schmerztherapie nach TE untersucht.\nEingeschlossen wurden 12 Patienten nach TE, die älter als 16 Jahre waren. Ausgewertet wurden die postoperative Schmerzentwicklung (Skala von 0-10; 0=keine Schmerzen, 10=stärkster vorstellbarer Schmerz) in einem Zeitraum von 35 Tagen und die angewandte Schmerztherapie.Ergebnisse: Das Schmerzmaximun bestand am 6. postoperativen Tag mit einem durchschnittlichen Wert von 6.4 von 10.  Über den 24. Tag hinaus gab keiner der Patienten mehr Schmerzen an. Im Durchschnitt lagen die Schmerzen, bezogen auf den gesamten Beobachtungszeitraum, bei 2.3 von 10. Nach dem 11. postoperativen Tag fiel die Schmerzintensität deutlich ab. An Tag 3,5 und 6 wurden am häufigsten Analgetika eingenommen. Dabei wurden verschiedene Präparate verwendet. Voltaren dispers® und Metamizoltropfen waren die beiden am häufigsten eingenommenen Analgetika.Schlussfolgerungen: Die vorliegenden Daten charakterisieren die postoperative Schmerzdynamik nach TE.\nZusammenfassend lässt sich feststellen, dass eine ausführliche Beratung der Patienten bezüglich der Schmerzdynamik erfolgen sollte. In der Regel sind zwei verschiedene Präparate, zeitweise in Kombination, zur effektiven Schmerztherapie ausreichend.\nDer Erstautor gibt keinen Interessenkonflikt an.",
				"journalAbbreviation": "GMS Curr Posters Otorhinolaryngol Head Neck Surg",
				"language": "germ",
				"libraryCatalog": "GMS German Medical Science",
				"pages": "Doc305",
				"publicationTitle": "GMS Current Posters in Otorhinolaryngology - Head and Neck Surgery",
				"rights": "This is an Open Access article distributed under the terms of the Creative Commons Attribution 4.0 License.",
				"volume": "13",
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
		"url": "https://www.egms.de/static/de/meetings/dgnc2017/17dgnc026.shtml",
		"items": [
			{
				"itemType": "conferencePaper",
				"title": "Encephaloduroateriosynangiosis (EDAS) in the management of Moyamoya syndrome in sickle cell disease",
				"creators": [
					{
						"lastName": "Alamri",
						"firstName": "Alexander",
						"creatorType": "author"
					},
					{
						"lastName": "Hever",
						"firstName": "Pennylouise",
						"creatorType": "author"
					},
					{
						"lastName": "Cheserem",
						"firstName": "Jebet",
						"creatorType": "author"
					},
					{
						"lastName": "Gradil",
						"firstName": "Catia",
						"creatorType": "author"
					},
					{
						"lastName": "Bassi",
						"firstName": "Sanj",
						"creatorType": "author"
					},
					{
						"lastName": "Tolias",
						"firstName": "Christos M.",
						"creatorType": "author"
					}
				],
				"date": "2017-06-09",
				"DOI": "10.3205/17dgnc026",
				"language": "engl",
				"libraryCatalog": "GMS German Medical Science",
				"pages": "DocMO.05.03",
				"publisher": "German Medical Science GMS Publishing House",
				"rights": "This is an Open Access article distributed under the terms of the Creative Commons Attribution 4.0 License.",
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
		"url": "https://www.egms.de/dynamic/de/journals/mbi/volume16.htm",
		"items": "multiple"
	}
]
/** END TEST CASES **/
