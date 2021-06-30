{
	"translatorID": "aede3fda-1894-4dfc-8bca-1c3463f11076",
	"translatorType": 4,
	"label": "Rechtspraak.nl",
	"creator": "Pieter van der Wees",
	"target": "^https?://uitspraken\\.rechtspraak\\.nl/",
	"minVersion": "3.0",
	"maxVersion": null,
	"priority": 100,
	"inRepository": true,
	"browserSupport": "gcsibv",
	"lastUpdated": "2021-06-18 22:00:00"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2021 Pieter van der Wees
	
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

var courtAbbrevs = {
	"hoge raad": "HR",
	"raad van state": "ABRvS",
	"centrale raad van beroep": "CRvB",
	"college van beroep voor het bedrijfsleven": "CBb",
	gerechtshof: "Hof",
	rechtbank: "Rb.",
	"raad van beroep": "RvB",
	"gerecht in eerste aanleg van": "GiEA",
	"gemeenschappelijk hof van justitie": "Gem. Hof",
	"van ": ""
};

// ReplaceAll solution from https://stackoverflow.com/questions/15604140/replace-multiple-strings-with-multiple-other-strings
// All keys should be lowercase.
function replaceAll(str, mapObj) {
	var re = new RegExp(Object.keys(mapObj).join("|"), "gi");

	return str.replace(re, function (matched) {
		return mapObj[matched.toLowerCase()];
	});
}

var esc = ZU.unescapeHTML;


// Custom cleaning function for scraping, adapted from utilities.js
function cleanTags(x) {
	if (x === null) { // account for cases without abstractNote
		return undefined;
	}
	else if (typeof (x) != "string") {
		throw new Error("cleanTags: argument must be a string");
	}
	x = x.replace(/<(\/para|br)[^>]*>/gi, "\n"); // account for dcterms:abstract newlines
	x = x.replace(/<[^>]+>/g, "");
	return esc(x);
}

function detectWeb(doc, url) {
	if (url.includes('inziendocument')) {
		return "case";
	}
	else if (getSearchResults(doc, true)) {
		return "multiple";
	}
	else if (url.includes('zoekverfijn')) {
		Z.monitorDOMChanges(doc.getElementById('content'));
	}
	return false;
}

function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = doc.querySelectorAll('h3>a.titel[href*="inziendocument"]');
	for (let row of rows) {
		let href = row.href;
		let title = ZU.trimInternal(row.textContent);
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
			if (items) ZU.processDocuments(Object.keys(items), scrape);
		});
	}
	else {
		scrape(doc, url);
	}
}

function scrape(doc, _url) {
	var newItem = new Zotero.Item("case");

	// First, scrape easy properties
	newItem.title = esc(attr(doc, 'meta[property="dcterms:title"]', 'content')); // no party names, unfortunately
	newItem.docketNumber = esc(attr(doc, 'meta[property="dcterms:identifier"]', 'content'));
	newItem.dateDecided = attr(doc, 'meta[property="dcterms:created"]', 'content');
	newItem.extra = "Soort: " + esc(attr(doc, 'link[rel="dcterms:type"]', 'title'));
	newItem.language = attr(doc, 'meta[property="dcterms:language"]', 'content');
	newItem.abstractNote = cleanTags(attr(doc, 'meta[property="dcterms:abstract"]', 'content'));
	newItem.url = "https://deeplink.rechtspraak.nl/uitspraak?id=" + newItem.docketNumber;
	newItem.shortTitle = '';

	// Pursuant to most citation styles (including Leidraad voor juridische auteurs), we abbreviate the court names
	var fullCourtName = cleanTags(attr(doc, 'meta[property="dcterms:creator"]', 'content'));
	newItem.court = replaceAll(fullCourtName, courtAbbrevs);

	// Because we do not know which reporter the user wants to cite, add them all to abstractNote
	newItem.abstractNote = newItem.abstractNote.concat("\nVindplaatsen:", cleanTags(ZU.xpathText(doc, "//dt[text()='Vindplaatsen']//following::dd[1]")));

	// References go in the History field
	var relationArray = [];
	for (let relation of doc.querySelectorAll('link[rel="dcterms:relation"]')) {
		relationArray.push(relation.getAttribute('title'));
	}
	newItem.history = relationArray.join('; ');

	// Add fields of law as tags
	var tags = attr(doc, 'link[rel="dcterms:subject"]', 'title');
	if (tags.length) {
		newItem.tags = tags.split('; ');
	}

	// Attachments
	var pdfurl = attr(doc, 'a.pdfUitspraak', 'href');
	newItem.attachments = [{
		url: pdfurl,
		title: "Rechtspraak.nl PDF",
		mimeType: "application/pdf",
	}];

	newItem.complete();
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://uitspraken.rechtspraak.nl/inziendocument?id=ECLI:NL:GHDHA:2018:2591",
		"items": [
			{
				"itemType": "case",
				"caseName": "ECLI:NL:GHDHA:2018:2591, Gerechtshof Den Haag, 200.178.245/01",
				"creators": [],
				"dateDecided": "2018-10-09",
				"abstractNote": "Klimaatzaak Urgenda. Onrechtmatige daad. Schending zorgplicht ex artikelen 2 en 8 EVRM. Staat moet broeikasgassen nu verder terugdringen. Vonnis bekrachtigd\n\nVindplaatsen:\nRechtspraak.nl \nJM 2018/128 met annotatie van W.Th. Douma \nAB 2018/417 met annotatie van G.A. van der Veen, Ch.W. Backes \nO&A 2018/66 \nO&A 2018/51 met annotatie van G.A. van der Veen, T.G. Oztürk \nSEW 2019, afl. 1, p. 35 \nJB 2019/10 met annotatie van Sanderink, D.G.J. \nOGR-Updates.nl 2018-0234 \nPS-Updates.nl 2018-0814 \nJOM 2018/1182 \nJOM 2018/1154 \nJA 2019/37 \nJIN 2019/78 met annotatie van Sanderink, D.G.J.",
				"court": "Hof Den Haag",
				"docketNumber": "ECLI:NL:GHDHA:2018:2591",
				"extra": "Soort: Uitspraak",
				"history": "Eerste aanleg: ECLI:NL:RBDHA:2015:7145, Bekrachtiging/bevestiging; Cassatie: ECLI:NL:HR:2019:2006, Bekrachtiging/bevestiging",
				"language": "nl",
				"url": "https://deeplink.rechtspraak.nl/uitspraak?id=ECLI:NL:GHDHA:2018:2591",
				"attachments": [
					{
						"title": "Rechtspraak.nl PDF",
						"mimeType": "application/pdf"
					}
				],
				"tags": [
					{
						"tag": "Civiel recht"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://uitspraken.rechtspraak.nl/inziendocument?id=ECLI:NL:PHR:2019:1016",
		"items": [
			{
				"itemType": "case",
				"caseName": "ECLI:NL:PHR:2019:1016, Parket bij de Hoge Raad, 18/01333",
				"creators": [],
				"dateDecided": "2019-10-08",
				"abstractNote": "Conclusie P-G: Bedreiging. Voldoende bepaald vreesobject. Conclusie strekt tot verwerping.\n\nVindplaatsen:\nRechtspraak.nl",
				"court": "Parket bij de HR",
				"docketNumber": "ECLI:NL:PHR:2019:1016",
				"extra": "Soort: Conclusie",
				"history": "Arrest Hoge Raad: ECLI:NL:HR:2020:44",
				"language": "nl",
				"url": "https://deeplink.rechtspraak.nl/uitspraak?id=ECLI:NL:PHR:2019:1016",
				"attachments": [
					{
						"title": "Rechtspraak.nl PDF",
						"mimeType": "application/pdf"
					}
				],
				"tags": [
					{
						"tag": "Strafrecht"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://uitspraken.rechtspraak.nl/inziendocument?id=ECLI:NL:ORBAACM:2020:30&showbutton=true",
		"items": [
			{
				"itemType": "case",
				"caseName": "ECLI:NL:ORBAACM:2020:30, Raad van Beroep in Ambtenarenzaken van Aruba, Curaçao, Sint Maarten en van Bonaire, Sint Eustatius en Saba, CUR2019H00160",
				"creators": [],
				"dateDecided": "2020-12-16",
				"abstractNote": "Ontslag wegens strafrechtelijke veroordeling. Geen procesbelang bij het opschuiven van de datum van ontslag. Bevestiging aangevallen uitspraak.\n\nVindplaatsen:\nRechtspraak.nl",
				"court": "RvB in Ambtenarenzaken Aruba, Curaçao, Sint Maarten en Bonaire, Sint Eustatius en Saba",
				"docketNumber": "ECLI:NL:ORBAACM:2020:30",
				"extra": "Soort: Uitspraak",
				"language": "nl",
				"url": "https://deeplink.rechtspraak.nl/uitspraak?id=ECLI:NL:ORBAACM:2020:30",
				"attachments": [
					{
						"title": "Rechtspraak.nl PDF",
						"mimeType": "application/pdf"
					}
				],
				"tags": [
					{
						"tag": "Ambtenarenrecht"
					},
					{
						"tag": "Bestuursrecht"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/
