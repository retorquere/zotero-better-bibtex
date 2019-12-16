{
	"translatorID": "192a29de-3d6e-4850-984f-943764126429",
	"label": "Dagens Nyheter",
	"creator": "Sebastian Berlin",
	"target": "^https?://www\\.dn\\.se/(nyheter|ekonomi|kultur-noje|sport|sok)/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2018-07-19 12:35:38"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2018 Sebastian Berlin
	
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


// attr()/text() v2
function attr(docOrElem,selector,attr,index){var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector);return elem?elem.getAttribute(attr):null;}function text(docOrElem,selector,index){var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector);return elem?elem.textContent:null;}


function detectWeb(doc, url) {
	if (url.includes('/sok/')) {
		if (getSearchResults(doc, true)) {
			return "multiple";
		}
	} else {
		return "newspaperArticle";
	}
}


function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = doc.querySelectorAll('.search-item > a');
	for (let i=0; i<rows.length; i++) {
		let href = rows[i].href;
		if (href.includes("/recept/")) {
			// Exclude recepies.
			continue;
		}
		let title = ZU.trimInternal(rows[i].textContent);
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
			for (let i in items) {
				articles.push(i);
			}
			ZU.processDocuments(articles, scrape);
		});
	} else {
		scrape(doc, url);
	}
}


function scrape(doc, url) {
	var translator = Zotero.loadTranslator('web');
	// Embedded Metadata
	translator.setTranslator('951c027d-74ac-47d4-a107-9c3069ab7b48');

	translator.setHandler('itemDone', function (obj, item) {
		item.publicationTitle = "Dagens Nyheter";

		var nameNodes =
			ZU.xpath(doc, '//h6[@class="byline__author" and @itemprop="name"]');
		var names = [];
		for (let node of nameNodes) {
			names.push(node.textContent);
		}
		if (names.length === 0) {
			var name = attr(doc, 'div[class="js-article"]', "data-authors");
			names.push(name);
		}
		item.creators = [];
		for (let name of names) {
			let author = ZU.cleanAuthor(name, "author");
			if (author.firstName === "") {
				// If there's only one name, the author is not a person,
				// e.g. "TT".
				author.firstName = undefined;
				author.fieldMode = true;
			}
			if (author.firstName && author.firstName.includes(" ")) {
				// Multiple names are most likely last names.
				let multiNames = author.firstName.split(" ");
				author.firstName = multiNames.shift();
				author.lastName = multiNames.join(" ") + " " + author.lastName;
			}
			item.creators.push(author);
		}

		var abstractString =
			attr(doc, 'div[class="js-article"]', "data-article-description");
		if (abstractString) {
			item.abstractNote = abstractString.replace(/&nbsp;/g, " ");
		}

		item.section = attr(doc, 'meta[property="article:section"]', "content");

		var timeString =
			attr(doc, 'meta[property="article:published_time"]', "content");
		if (timeString) {
			item.date = timeString.split("T")[0];
		}
		
		item.ISSN = "1101-2447";

		item.complete();
	});

	translator.getTranslatorObject(function(trans) {
		trans.itemType = "newspaperArticle";
		trans.doWeb(doc, url);
	});
}
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://www.dn.se/nyheter/sverige/google-har-vidtagit-atgarder-mot-nordfront/",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Google har vidtagit åtgärder mot Nordfront",
				"creators": [
					{
						"firstName": "Ossi",
						"lastName": "Carp",
						"creatorType": "author"
					}
				],
				"date": "2018-03-12",
				"abstractNote": "Google har vidtagit åtgärder mot Nordfront. Inom kort kommer tekniska justeringar ha gjort att nazistsajtens innehåll inte blir länkat till som om det vore en normal nyhetsplats.",
				"language": "sv",
				"libraryCatalog": "www.dn.se",
				"publicationTitle": "Dagens Nyheter",
				"section": "Sverige",
				"url": "https://www.dn.se/nyheter/sverige/google-har-vidtagit-atgarder-mot-nordfront/",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [],
				"notes": [],
				"seeAlso": [],
				"ISSN": "1101-2447"
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.dn.se/nyheter/varlden/finland-och-norge-planerar-arktisk-jarnvag/",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Finland och Norge planerar arktisk järnväg",
				"creators": [
					{
						"lastName": "TT",
						"creatorType": "author",
						"fieldMode": true
					}
				],
				"date": "2018-03-10",
				"abstractNote": "Finland och Norge planerar att gemensamt bygga en järnväg från finska Rovaniemi till norska Kirkenes.",
				"language": "sv",
				"libraryCatalog": "www.dn.se",
				"publicationTitle": "Dagens Nyheter",
				"section": "Världen",
				"url": "https://www.dn.se/nyheter/varlden/finland-och-norge-planerar-arktisk-jarnvag/",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [],
				"notes": [],
				"seeAlso": [],
				"ISSN": "1101-2447"
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.dn.se/nyheter/varlden/han-gor-karikatyrer-av-kriget/",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Gatukonstnär vill ge hopp i krigskaoset",
				"creators": [
					{
						"firstName": "Terese",
						"lastName": "Cristiansson",
						"creatorType": "author"
					}
				],
				"date": "2018-03-09",
				"abstractNote": "Istanbul. Bilderna från kriget i Syrien är mardrömslika. Men konstnären Bilal Musa som bor i drabbade Idlib försöker att skapa nytt hopp genom konst på krigsbilder, bombade skolor och väggar. – Jag vet att mina målningar påverkar, inte minst barnen, säger han.",
				"language": "sv",
				"libraryCatalog": "www.dn.se",
				"publicationTitle": "Dagens Nyheter",
				"section": "Världen",
				"url": "https://www.dn.se/nyheter/varlden/han-gor-karikatyrer-av-kriget/",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [],
				"notes": [],
				"seeAlso": [],
				"ISSN": "1101-2447"
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.dn.se/sok/?q=choklad&page=1&sort=relevance&date=",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://www.dn.se/ekonomi/brexitminister-davis-har-sagt-upp-sig/",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Brexitminister Davis har sagt upp sig",
				"creators": [
					{
						"lastName": "TT",
						"creatorType": "author",
						"fieldMode": true
					},
					{
						"lastName": "DN",
						"creatorType": "author",
						"fieldMode": true
					},
					{
						"firstName": "Amanda",
						"lastName": "Lindström",
						"creatorType": "author"
					}
				],
				"date": "2018-07-09",
				"abstractNote": "Storbritanniens minister med ansvar för Brexitfrågor David Davis har sagt upp sig med omedelbar verkan. Han ersätts av Dominic Raab. \nDavis avskedsansökan lämnades mitt i natten mot måndagen, bara dagar efter att brittiska regeringen stakat ut en plan för hur Brexit ska fortskrida.\nOrsaken är att han anser att premiärminister Theresa Mays politik undergräver landets förhandlingar med EU.",
				"language": "sv",
				"libraryCatalog": "www.dn.se",
				"publicationTitle": "Dagens Nyheter",
				"section": "Ekonomi",
				"url": "https://www.dn.se/ekonomi/brexitminister-davis-har-sagt-upp-sig/",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [],
				"notes": [],
				"seeAlso": [],
				"ISSN": "1101-2447"
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.dn.se/kultur-noje/kulturdebatt/valdet-gror-i-utsatthet-och-fattigdom/",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Kriminolog: ”Våldet gror i utsatthet och fattigdom”",
				"creators": [
					{
						"firstName": "Leandro",
						"lastName": "Schclarek Mulinari",
						"creatorType": "author"
					}
				],
				"date": "2018-07-08",
				"abstractNote": "I stället för att ge mer plats för auktoritär populism och hårdare straff måste vi börja betrakta dödsskjutningarna som ett misslyckande för hela samhället, skriver kriminologen Leandro Schclarek Mulinari.",
				"language": "sv",
				"libraryCatalog": "www.dn.se",
				"publicationTitle": "Dagens Nyheter",
				"section": "Kulturdebatt",
				"shortTitle": "Kriminolog",
				"url": "https://www.dn.se/kultur-noje/kulturdebatt/valdet-gror-i-utsatthet-och-fattigdom/",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [],
				"notes": [],
				"seeAlso": [],
				"ISSN": "1101-2447"
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.dn.se/sport/fotboll/tyska-storstjarnan-drabbad-av-lungemboli/",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Tyska storstjärnan drabbad av lungemboli",
				"creators": [
					{
						"lastName": "TT",
						"creatorType": "author",
						"fieldMode": true
					}
				],
				"date": "2018-07-18",
				"abstractNote": "Lyon och tyska landslagets stjärnspelare Dzsenifer Marozsan har drabbats av blodpropp i lungan.",
				"language": "sv",
				"libraryCatalog": "www.dn.se",
				"publicationTitle": "Dagens Nyheter",
				"section": "Fotboll",
				"url": "https://www.dn.se/sport/fotboll/tyska-storstjarnan-drabbad-av-lungemboli/",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [],
				"notes": [],
				"seeAlso": [],
				"ISSN": "1101-2447"
			}
		]
	}
]
/** END TEST CASES **/
