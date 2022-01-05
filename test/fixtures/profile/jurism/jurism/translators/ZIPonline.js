{
	"translatorID": "5ccc4cf7-8863-4ee2-9772-c9d0b422f028",
	"label": "ZIPonline",
	"creator": "Philipp Zumstein",
	"target": "^https?://(www)?\\.zip-online\\.de/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2017-01-27 16:22:25"
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
	if (url.includes('/heft') && url.includes('/zip')) {
		//Z.debug(ZU.xpathText(doc, '//meta[@property="article:section"]/@content'));
		var articleSection = ZU.xpathText(doc, '//meta[@property="article:section"]/@content');
		if (articleSection.includes('Rechtsprechung')) {
			return "case";
		}
		return "journalArticle";
		
	} else if (url.includes('/archivsuche/') || url.includes('/aktuelles-heft/') || url.includes('/heft-')) {
		if (getSearchResults(doc, true)) {
			return "multiple";
		}
	}
	//search in fulltexts will only return a list with direct links to pdfs
	//and are therefore not handled here
	//https://www.zip-online.de/volltexte/
}


function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = ZU.xpath(doc, '//ul/li[contains(@class, "aufsatz") or contains(@class, "rechtsprechung")]/a[not(contains(@href, "//www."))]');
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
	
	var translator = Zotero.loadTranslator('web');
	// Embedded Metadata
	translator.setTranslator('951c027d-74ac-47d4-a107-9c3069ab7b48');
	//translator.setDocument(doc);

	translator.setHandler('itemDone', function (obj, item) {
		var authors = ZU.xpath(doc, '//span[@class="beitrag-autor"]');
		if (authors) {
			item.creators = [];
			var firstName, lastName;
			for (var i=0; i<authors.length; i++) {
				firstName = ZU.xpathText(authors[i], './/span[contains(@class, "beitrag-autorvorname")]');
				lastName = ZU.xpathText(authors[i], './/span[contains(@class, "beitrag-autornachname")]');
				if (firstName && lastName) {
					item.creators.push({'firstName': firstName, 'lastName': lastName, 'creatorType': "author"});
				} else if (lastName && lastName.trim() !== "") {
					item.creators.push({'lastName': lastName, 'fieldMode': 1, 'creatorType': "author"});
				}
			}
		}
		
		var firstPage = ZU.xpathText(doc, '//span[@data-dokid]/@data-spage');
		var lastPage = ZU.xpathText(doc, '(//ins[contains(@class, "beitrag-seite")]/@data-nummer)[last()]');
		if (firstPage) {
			item.pages = firstPage.replace(/^0*/, '');
			if (lastPage) {
				item.pages += "–" + lastPage.replace(/^0*/, '');
			}
		}
		
		var m = url.match(/\/heft-([\d\-]*)-\d\d\d\d\/zip/);
		if (m) {
			item.issue = m[1];
		}
		
		item.publicationTitle = "Zeitschrift für Wirtschaftsrecht";
		item.journalAbbreviation = "ZIP";
		item.ISSN = "0723-9416";
		
		var caseInfo = ZU.xpath(doc, '//span[contains(@class, "beitrag-entscheidung")]/span[contains(@class, "beitrag-instanz")]');
		if (type == "case" && caseInfo) {
			if (item.date) {
				item.reporterVolume = ZU.strToDate(item.date).year;
				delete item.date;
			}
			item.court = ZU.xpathText(caseInfo, './span[contains(@class, "beitrag-gericht")]');
			item.extra  = ZU.xpathText(caseInfo, './span[contains(@class, "beitrag-typ")]');
			item.dateDecided  = ZU.xpathText(caseInfo, './span[contains(@class, "beitrag-datum")]');
			item.docketNumber  = ZU.xpathText(caseInfo, './span[contains(@class, "beitrag-az")]');
			item.reporter = "ZIP";
		}
		
		item.complete();
	});

	translator.getTranslatorObject(function(trans) {
		trans.itemType = type;
		trans.addCustomFields({
			'publisher': 'publisher',
			'language': 'language'
		});
		trans.doWeb(doc, url);
	});
}
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://www.zip-online.de/heft-3-2017/zip-2017-112-die-wohnimmobilienkreditrichtlinie-und-ihre-umsetzung-in-deutschland/",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Die Wohnimmobilienkreditrichtlinie und ihre Umsetzung in Deutschland",
				"creators": [
					{
						"firstName": "Sebastian",
						"lastName": "Omlor",
						"creatorType": "author"
					}
				],
				"date": "2017-01-20",
				"ISSN": "0723-9416",
				"abstractNote": "Die RL 2014/17/EU über Wohnimmobilienkreditverträge für Verbraucher und ihre Umsetzung in Deutschland (Gesetz zur Umsetzung der Wohnimmobilienkreditrichtlinie und zur Änderung handelsrechtlicher …",
				"issue": "3",
				"journalAbbreviation": "ZIP",
				"language": "de",
				"libraryCatalog": "www.zip-online.de",
				"pages": "112",
				"publicationTitle": "Zeitschrift für Wirtschaftsrecht",
				"url": "https://www.zip-online.de/heft-3-2017/zip-2017-112-die-wohnimmobilienkreditrichtlinie-und-ihre-umsetzung-in-deutschland/",
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
		"url": "https://www.zip-online.de/heft-23-24-1987/zip-1987-1512-massenentlassung-und-einhaltung-von-kuendigungsterminen/",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Massenentlassung und Einhaltung von Kündigungsterminen",
				"creators": [
					{
						"firstName": "Ernst-Dieter",
						"lastName": "Berscheid",
						"creatorType": "author"
					}
				],
				"date": "1987-12-11",
				"ISSN": "0723-9416",
				"abstractNote": "Der Dritte Abschnitt des Kündigungsschutzgesetzes regelt die sogenannten „anzeigepflichtigen Entlassungen“ oder – wie es in der bis zur Neufassung durch das Erste …",
				"issue": "23-24",
				"journalAbbreviation": "ZIP",
				"language": "de",
				"libraryCatalog": "www.zip-online.de",
				"pages": "1512",
				"publicationTitle": "Zeitschrift für Wirtschaftsrecht",
				"url": "https://www.zip-online.de/heft-23-24-1987/zip-1987-1512-massenentlassung-und-einhaltung-von-kuendigungsterminen/",
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
		"url": "https://www.zip-online.de/heft-1-2017/zip-2017-19-zur-regelung-der-pflicht-der-kommanditisten-zur-rueckzahlung-von-als-darlehen-gewaehrten-ausschuettungen/",
		"items": [
			{
				"itemType": "case",
				"caseName": "Zur Regelung der Pflicht der Kommanditisten zur Rückzahlung von als Darlehen gewährten Ausschüttungen im Gesellschaftsvertrag einer Publikumspersonengesellschaft (OLG Nürnberg, Urt. v. 01.08.2016 – 8 U 2259/15)",
				"creators": [],
				"dateDecided": "1.8.2016",
				"abstractNote": "Die Bestimmung im Gesellschaftsvertrag einer Publikumspersonengesellschaft, dass Ausschüttungen von Liquiditätsüberschüssen an die Kommanditisten unverzinsliche Darlehen darstellen sollen, …",
				"court": "OLG Nürnberg",
				"docketNumber": "8 U 2259/15",
				"extra": "Urt.",
				"firstPage": "19",
				"language": "de",
				"reporter": "ZIP",
				"reporterVolume": "2017",
				"url": "https://www.zip-online.de/heft-1-2017/zip-2017-19-zur-regelung-der-pflicht-der-kommanditisten-zur-rueckzahlung-von-als-darlehen-gewaehrten-ausschuettungen/",
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
		"url": "https://www.zip-online.de/heft-23-24-1987/",
		"items": "multiple"
	}
];
/** END TEST CASES **/
