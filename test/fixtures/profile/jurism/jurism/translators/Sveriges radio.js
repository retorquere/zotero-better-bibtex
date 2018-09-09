{
	"translatorID": "caa8f42c-9dbf-446e-963b-6ee18e3133d2",
	"label": "Sveriges radio",
	"creator": "Sebastian Berlin",
	"target": "^https?://sverigesradio\\.se/sida/(artikel|sok).aspx",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2018-02-28 13:17:24"
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
	if (url.includes('/sida/artikel')) {
		return "newspaperArticle";
	} else if (url.includes('/sida/sok') && getSearchResults(doc, true)) {
		return "multiple";
	}
}


function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = doc.querySelectorAll('ul, a.heading[href*="/sida/artikel.aspx"]');
	for (let i=0; i<rows.length; i++) {
		let href = rows[i].href;
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
	var translator = Zotero.loadTranslator('web');
	// Embedded Metadata
	translator.setTranslator('951c027d-74ac-47d4-a107-9c3069ab7b48');

	translator.setHandler('itemDone', function (obj, item) {
		item.publicationTitle = "Sveriges Radio";

		item.creators = [];
		var nameNodes = ZU.xpath(doc, '//p[@class="byline"]/text()');
		for(let node of nameNodes) {
			// Take the first two strings of non-spaces as the names. The byline
			// can vary in format, including:
			// First Last
			// First Last SecondLast
			// First Last, City
			// First Last City, Country
			var nameString = node.wholeText.split(" ", 2).join(" ");
			var author = ZU.cleanAuthor(nameString, "author");
			item.creators.push(author);
		}
		if(item.creators.length === 1 && item.creators[0].lastName === "Ekot") {
			// Special case when only signed as "Ekot", i.e. no person
			// specified as author.
			item.creators[0].fieldMode = true;
			item.creators[0].firstName = undefined;
		}

		// The title from the meta is in the format:
		// Australierna säger ja till samkönade äktenskap - Nyheter (Ekot)
		var titleString = attr(doc, 'meta[name="twitter:title"]', "content");
		var titleParts = titleString.split(" - ");
		item.title = titleParts[0];
		item.section = titleParts[1];

		var dateString = attr(doc, 'meta[name="displaydate"]', "content");
		item.date = dateString.replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3");

		item.tags = [];

		item.complete();
	});

	translator.getTranslatorObject(function(trans) {
		trans.itemType = "newspaperArticle";
		trans.addCustomFields({
			'twitter:description': 'abstractNote'
		});
		trans.doWeb(doc, url);
	});
}
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://sverigesradio.se/sida/artikel.aspx?programid=83&artikel=6821850",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Australierna säger ja till samkönade äktenskap",
				"creators": [
					{
						"lastName": "Ekot",
						"creatorType": "author",
						"fieldMode": true
					}
				],
				"date": "2017-11-15",
				"abstractNote": "I en rådgivande postomröstning i Australien svarade 61,6 procent av medborgarna att de ville se en lag som godkänner samkönade äktenskap.",
				"language": "sv",
				"libraryCatalog": "sverigesradio.se",
				"publicationTitle": "Sveriges Radio",
				"section": "Nyheter (Ekot)",
				"url": "http://sverigesradio.se/sida/artikel.aspx?programid=83&artikel=6821850",
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
		"url": "https://sverigesradio.se/sida/artikel.aspx?programid=83&artikel=6865752",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Här duschas de äldre av en robot",
				"creators": [
					{
						"firstName": "Emil",
						"lastName": "Hellerud",
						"creatorType": "author"
					}
				],
				"date": "2018-02-20",
				"abstractNote": "I Karlstad har äldreomsorgen börjat använda en duschrobot.",
				"language": "sv",
				"libraryCatalog": "sverigesradio.se",
				"publicationTitle": "Sveriges Radio",
				"section": "Nyheter (Ekot)",
				"url": "http://sverigesradio.se/sida/artikel.aspx?programid=83&artikel=6865752",
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
		"url": "http://sverigesradio.se/sida/artikel.aspx?programid=478&artikel=6891473",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Stim skriver internationellt avtal med Facebook",
				"creators": [
					{
						"firstName": "Emil",
						"lastName": "Salmaso",
						"creatorType": "author"
					}
				],
				"date": "2018-02-21",
				"abstractNote": "Musikskaparnas representantorganisation Stim har skrivit ett internationellt avtal med Facebook.",
				"language": "sv",
				"libraryCatalog": "sverigesradio.se",
				"publicationTitle": "Sveriges Radio",
				"section": "Kulturnytt",
				"url": "http://sverigesradio.se/sida/artikel.aspx?programid=478&artikel=6891473",
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
		"url": "https://sverigesradio.se/sida/artikel.aspx?programid=83&artikel=6892065",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "HD: Nawaz Sharif får inte leda sitt parti i Pakistan",
				"creators": [
					{
						"firstName": "Margita",
						"lastName": "Boström",
						"creatorType": "author"
					}
				],
				"date": "2018-02-22",
				"abstractNote": "Högsta domstolen i Pakistan har slagit fast att landets avsatte premiärminister Nawaz Sharif inte längre får leda det parti han själv grundat.",
				"language": "sv",
				"libraryCatalog": "sverigesradio.se",
				"publicationTitle": "Sveriges Radio",
				"section": "Nyheter (Ekot)",
				"shortTitle": "HD",
				"url": "http://sverigesradio.se/sida/artikel.aspx?programid=83&artikel=6892065",
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
		"url": "https://sverigesradio.se/sida/artikel.aspx?programid=78&artikel=6891577",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Alarmerande självmordssiffror bland ensamkommande unga",
				"creators": [
					{
						"firstName": "Åsa",
						"lastName": "Swee",
						"creatorType": "author"
					}
				],
				"date": "2018-02-22",
				"abstractNote": "Förra året begick 12 ensamkommande barn och ungdomar självmord i Sverige. Ett av fallen skedde i Jämtland.",
				"language": "sv",
				"libraryCatalog": "sverigesradio.se",
				"publicationTitle": "Sveriges Radio",
				"section": "P4 Jämtland",
				"url": "http://sverigesradio.se/sida/artikel.aspx?programid=78&artikel=6891577",
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
		"url": "https://sverigesradio.se/sida/artikel.aspx?programid=128&artikel=6892091",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Facebook låg nere – #facebookdown trendar",
				"creators": [
					{
						"firstName": "Karin",
						"lastName": "Ingströmer",
						"creatorType": "author"
					},
					{
						"firstName": "Estrid",
						"lastName": "Wagersten",
						"creatorType": "author"
					}
				],
				"date": "2018-02-22",
				"abstractNote": "Facebook och Instagram fick problem strax före 12. Minuter senare fungerade allt som vanligt för de flesta användare. Under tiden hade #facebookdown använts ...",
				"language": "sv",
				"libraryCatalog": "sverigesradio.se",
				"publicationTitle": "Sveriges Radio",
				"section": "P4 Halland",
				"url": "http://sverigesradio.se/sida/artikel.aspx?programid=128&artikel=6892091",
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
		"url": "http://sverigesradio.se/sida/artikel.aspx?programid=2054&artikel=6894423",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Siberian 'Beast from the East' keeps Swedish kids inside",
				"creators": [
					{
						"firstName": "Richard",
						"lastName": "Orange",
						"creatorType": "author"
					}
				],
				"date": "2018-02-26",
				"abstractNote": "A Siberian cold front has brought Sweden unusually cold temperatures for late February. It was -42 degrees C when Kristina Lindqvist left home for her ...",
				"language": "en",
				"libraryCatalog": "sverigesradio.se",
				"publicationTitle": "Sveriges Radio",
				"section": "Radio Sweden",
				"url": "http://sverigesradio.se/sida/artikel.aspx?programid=2054&artikel=6894423",
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
		"url": "https://sverigesradio.se/sida/sok.aspx?q=choklad&programid=83&filter=false",
		"items": "multiple"
	}
]
/** END TEST CASES **/
