{
	"translatorID": "dc78e210-31da-4fe5-99d6-1ea1a61874ca",
	"label": "jurion",
	"creator": "Philipp Zumstein",
	"target": "^https?://www\\.recht\\.jurion\\.de/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2017-01-30 20:15:34"
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
	url = decodeURI(url);
	if (url.indexOf('/?user_nvurlapi_pi1[did]=')>-1) {
		var type = ZU.xpathText(doc, '//div[contains(@class, "persist-area")]/div[contains(@class, "doc_header")]/@class');
		if (type.indexOf('artikel_header')>-1) {
			return "journalArticle";
		}
		if (type.indexOf('aktuelles_header')>-1) {
			return "newspaperArticle";
		}
		if (type.indexOf('gesetz_header')>-1) {
			return "statute";
		}
		if (type.indexOf('urteil_header')>-1) {
			return "case";
		}
		if (type.indexOf('stw_header')>-1) {//lexika
			return "encyclopediaArticle";
		}
		if (type.indexOf('hb_header')>-1) {
			return "bookSection";
		}
		if (type.indexOf('jk_header')>-1) {//kommentar
			return "bookSection";
		}
		Z.debug(type);
	} else if (url.indexOf('/suche/?query=')>-1 && getSearchResults(doc, true)) {
		return "multiple";
	}
}


function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = ZU.xpath(doc, '//ul[contains(@class, "nvurlapi-result-list")]//h2/strong/a');
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
	var item = new Zotero.Item(type);
	
	item.title = ZU.xpathText(doc, '//div[@id="middle-column"]//h1[div[contains(@class, "addToList")]]');
	var subtitle = ZU.xpathText(doc, '//div[contains(@class, "artikel_untertitel_thema")]');
	if (subtitle) {
		item.title += ' ' + subtitle;
	}
	
	var author = getValueToLabel(doc, "Autor") || getValueToLabel(doc, "Verfasst von");
	if (author) {
		author = author.replace(/(Dr|Prof|RA)\.?\s/g, '');
		item.creators.push(ZU.cleanAuthor(author, "author"));
	}
	
	var journal = getValueToLabel(doc, "Zeitschrift");
	if (journal) {
		var pos = journal.indexOf('-');
		if (pos>-1) {
			item.publicationTitle = journal.substring(pos+1);
			item.journalAbbreviation = journal.substring(0, pos);
		} else {
			item.publicationTitle = journal;
		}
	}
	
	var ref = getValueToLabel(doc, "Referenz");
	if (ref) {
		var m = ref.match(/(\d{4}),\s+([\d\s\-IVX]*)\((.*)\)/);
		if (m) {
			//e.g. ZInsO 2010, 1959 - 1961 (Ausgabe 44 v. 28.10.2010)
			// ZJJ 2010, 403 - 405 (Heft 4)
			item.date = m[1];
			item.pages = m[2].replace(/\s/g, '');
			var parenthesis = m[3];
			var d = parenthesis.match(/(\d\d?\.\d\d?\.\d{4})/);
			if (d) {
				item.date = ZU.strToISO(d[1]);
				parenthesis = parenthesis.substring(0, d.index);
			}
			if (parenthesis.indexOf('Heft')>-1 || parenthesis.indexOf('Ausgabe')>-1) {
				item.issue = parenthesis.replace(/\D/g, '');
			}
		} else {
			//e.g. JurionRS 2012, 28843
			var parts = ref.split(',');
			if (parts.length == 2) {
				item.pages = parts[1];
				var space = parts[0].lastIndexOf(" ");
				if (space>-1) {
					if (type == "case") {
						item.reporter = parts[0].substr(0, space);
						item.reporterVolume = parts[0].substr(space+1);
					} else if (type == "newspaperArticle") {
						item.publicationTitle = parts[0].substr(0, space);
					}
				}
			}
		}
	}
	
	//case
	var date = getValueToLabel(doc, "Datum");
	if (date) {
		item.date = ZU.strToISO(date);
	}
	item.court = getValueToLabel(doc, "Gericht");;
	item.docketNumber = getValueToLabel(doc, "Aktenzeichen");;
	var form = getValueToLabel(doc, "Entscheidungsform");
	if (form) {
		item.extra = "genre: " + form;
	}
	var caseName = ZU.xpathText(doc, '//div[contains(@class, "urteil_schlagworte")]');
	if (caseName && type == "case") {
		item.title = caseName;
	}
	
	//bookSection
	var booktitle = getValueToLabel(doc, "Titel");
	if (booktitle && type == "bookSection") {
		item.bookTitle = booktitle;
	}
	var edition = getValueToLabel(doc, "Auflage");
	if (edition) {
		var m = edition.match(/(\d+)\. Auflage (\d\d\d\d)/);
		if (m) {
			item.edition = m[1];
			item.date = m[2];
		} else {
			item.edition = edition;
		}
	}
	var editors = getValueToLabel(doc, "Herausgeber");
	if (editors) {
		editors = editors.split(';');
		for (var i=0; i<editors.length; i++) {
			item.creators.push(ZU.cleanAuthor(editors[i], "editor"));
		}
	}
	
	//statue
	var section = getValueToLabel(doc, "Abschnitt");
	if (section) {
		item.section = section;
	}
	var code = ZU.xpathText(doc, '(//span[contains(@class, "ev_zaehlung")])[1]');
	if (code) {
		code = code.replace('§', '').trim();
		var parts = code.split(/\s/);
		if (parts.length == 2) {
			item.codeNumber = parts[0];
			item.code = parts[1];
		} else {
			item.code = code;
		}
	}
	
	item.attachments.push({
		title: "Snapshot",
		document: doc
	});
	
	
	item.complete();
}


function getValueToLabel(doc, label) {
	return ZU.xpathText(doc, '//div[span[contains(@class, "meta_label") and contains(., "' +
		label + ':")]]/span[contains(@class, "meta_value")]');
}
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.recht.jurion.de/dokument/?user_nvurlapi_pi1%5Bdid%5D=4148667&src=search&cHash=fa910785ce",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Insolvenzrecht im Umbruch - Wilhelm Uhlenbruck und die Insolvenzordnung -",
				"creators": [
					{
						"firstName": "Georg",
						"lastName": "Bitter",
						"creatorType": "author"
					}
				],
				"date": "2010-10-28",
				"issue": "44",
				"journalAbbreviation": "ZInsO",
				"libraryCatalog": "jurion",
				"pages": "1959-1961",
				"publicationTitle": "Zeitschrift für das gesamte Insolvenzrecht",
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
		"url": "http://www.recht.jurion.de/dokument/?user_nvurlapi_pi1[did]=4221028",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Zur örtlichen Zuständigkeit der Jugendgerichtshilfe bei im Ausland geborenen und dort ihren Aufenthalt habenden Jugendlichen und Heranwachsenden",
				"creators": [
					{
						"firstName": "Michael",
						"lastName": "Sommerfeld",
						"creatorType": "author"
					}
				],
				"date": "2010",
				"issue": "4",
				"journalAbbreviation": "ZJJ",
				"libraryCatalog": "jurion",
				"pages": "403-405",
				"publicationTitle": "Zeitschrift für Jugendkriminalrecht und Jugendhilfe",
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
		"url": "http://www.recht.jurion.de/dokument/?user_nvurlapi_pi1[did]=5420105",
		"items": [
			{
				"itemType": "case",
				"caseName": "Vereinbarkeit eines öffentlichen Auftrags über Sprachberatung als Dienstleistung i.S.d. VOL/A-EG mit dem Vergaberecht aufgrund ungeeigneter Profilbögen",
				"creators": [],
				"dateDecided": "2012-11-21",
				"court": "BKartA",
				"docketNumber": "VK 3 - 126/12",
				"extra": "genre: Beschluss",
				"firstPage": "28843",
				"reporter": "JurionRS",
				"reporterVolume": "2012",
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
		"url": "http://www.recht.jurion.de/dokument/?user_nvurlapi_pi1[did]=7451083",
		"items": [
			{
				"itemType": "bookSection",
				"title": "III. Sprecherausschussgesetz",
				"creators": [
					{
						"firstName": "",
						"lastName": "Langohr-Plato",
						"creatorType": "author"
					},
					{
						"firstName": "",
						"lastName": "Berscheid",
						"creatorType": "editor"
					},
					{
						"firstName": "",
						"lastName": "Kunz",
						"creatorType": "editor"
					},
					{
						"firstName": "",
						"lastName": "Brand",
						"creatorType": "editor"
					},
					{
						"firstName": "",
						"lastName": "Nebeling",
						"creatorType": "editor"
					}
				],
				"date": "2016",
				"bookTitle": "Praxis des Arbeitsrechts",
				"edition": "5",
				"libraryCatalog": "jurion",
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