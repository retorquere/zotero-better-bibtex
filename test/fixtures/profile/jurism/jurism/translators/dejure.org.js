{
	"translatorID": "16c7d938-5f77-4fb5-99a1-bcec6fdafe84",
	"label": "dejure.org",
	"creator": "Philipp Zumstein",
	"target": "^https?://dejure\\.org/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2017-01-16 20:00:51"
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
	if (url.indexOf('/dienste/vernetzung/')>-1) {
		if (getSearchResults(doc, true)) {
			return "multiple";
		} else {
			return "case";
		}
	} else if (url.indexOf('/gesetze/')>-1 && url.indexOf('.html')>-1) {
		return "statute";
	}
}


//We only handle the cases that there are multiple cases on the
//same pages in multiples.
function getSearchResults(doc, checkOnly) {
	var items = {};
	var itemsDoc = [];
	var found = 0;
	var rows = ZU.xpath(doc, '//div[contains(@class, "rspr_inhalt")]');
	for (var i=0; i<rows.length; i++) {
		var title = ZU.xpathText(rows[i], './/td[contains(@class, "urteilszeile")]');
		if (!title) continue;
		found++;
		items[i] = title;
		itemsDoc[i] = rows[i];
	}
	if (checkOnly) {
		if (found>1) {
			return true;
		} else {
			return false;
		}
	}
	return found ? [items, itemsDoc] : false;
}


function doWeb(doc, url) {
	var type = detectWeb(doc, url);
	if (type == "multiple") {
		var results = getSearchResults(doc, false);
		Zotero.selectItems(results[0], function (items) {
			if (!items) {
				return true;
			}
			for (var i in items) {
				scrape(results[1][i], url, "case");
			}
		});
	} else {
		scrape(doc, url, type);
	}
}


function scrape(doc, url, type) {
	var item = new Zotero.Item(type);
	
	if (type == "case") {
		var headline = ZU.xpathText(doc, './/td[contains(@class, "urteilszeile")]');
		var posComma = headline.indexOf(",");
		var posDash = headline.indexOf("-");
		if (posComma>0) {
			item.court = headline.substr(0, posComma);
		}
		if (posDash > 0) {
			item.docketNumber = headline.substr(posDash+2);
		}
		item.dateDecided = ZU.strToISO(headline);
		item.title = headline;
		
		var previousDecisions = ZU.xpath(doc, './/div[h4[contains(., "Verfahrensgang")]]/ul/li');
		item.history = previousDecisions.map(function(li) { return li.textContent; } ).join("; ");
		
	}
	if (type == "statute") {
		var headings = ZU.xpath(doc, "//h1/text()");
		//e.g. <h1>§ 12 <br/> Abberufung von ... </h1>
		if (headings.length == 2) {
			item.codeNumber = headings[0].textContent;
			item.title = headings[1].textContent;
		}
		item.code = doc.getElementById("gesetzesname").textContent;
		item.section = ZU.xpathText(doc, '//table[contains(@class, "gesetzesgliederung")]');
		if (item.section) {
			item.section = ZU.trimInternal(item.section).replace(' ,', ',');
		}
		item.shortTitle = ZU.xpathText(doc, '//div[contains(@class, "funktion_beobachten")]/label');
		if (item.shortTitle) {
			item.shortTitle = item.shortTitle.replace("auf Ihre Merkliste setzen", "");
		}
		if (!item.title) {
			item.title = item.shortTitle;
		}
	}
	
	item.attachments.push({
		title: "Snapshot",
		document: doc
	});
	
	item.complete();
}
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://dejure.org/dienste/vernetzung/rechtsprechung?Gericht=BGH&Datum=17.07.2003&Aktenzeichen=I%20ZR%20259%2F00",
		"items": [
			{
				"itemType": "case",
				"caseName": "BGH, 17.07.2003 - I ZR 259/00",
				"creators": [],
				"dateDecided": "2003-07-17",
				"court": "BGH",
				"docketNumber": "I ZR 259/00",
				"history": "LG Köln, 12.01.2000 - 28 O 347/99; OLG Köln, 27.10.2000 - 6 U 71/00; BGH, 17.07.2003 - I ZR 259/00",
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
		"url": "https://dejure.org/dienste/vernetzung/rechtsprechung?Text=NJW%202003,%203406#Entscheidung2",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://dejure.org/gesetze/DrittelbG/12.html",
		"items": [
			{
				"itemType": "statute",
				"nameOfAct": "Abberufung von Aufsichtsratsmitgliedern der Arbeitnehmer",
				"creators": [],
				"code": "Drittelbeteiligungsgesetz",
				"codeNumber": "§  12",
				"section": "Teil 2 - Aufsichtsrat (§§ 4 - 12)",
				"shortTitle": "§ 12 DrittelbG",
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
		"url": "https://dejure.org/gesetze/GG/1.html",
		"items": [
			{
				"itemType": "statute",
				"nameOfAct": "Art.  1 GG",
				"creators": [],
				"code": "Grundgesetz",
				"section": "I. Die Grundrechte (Art. 1 - 19)",
				"shortTitle": "Art.  1 GG",
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
		"url": "https://dejure.org/gesetze/UrhG/53.html",
		"items": [
			{
				"itemType": "statute",
				"nameOfAct": "Vervielfältigungen zum privaten und sonstigen eigenen Gebrauch",
				"creators": [],
				"code": "Urheberrechtsgesetz",
				"codeNumber": "§  53",
				"section": "Teil 1 - Urheberrecht (§§ 1 - 69g), Abschnitt 6 - Schranken des Urheberrechts (§§ 44a - 63a)",
				"shortTitle": "§ 53 UrhG",
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