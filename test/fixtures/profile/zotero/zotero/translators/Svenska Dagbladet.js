{
	"translatorID": "7adba17c-7e98-4a13-8325-e19383b09eab",
	"label": "Svenska Dagbladet",
	"creator": "Sebastian Berlin",
	"target": "^https://www\\.svd\\.se/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2018-08-31 11:59:13"
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
	if (url.includes('/sok?')) {
		if(getSearchResults(doc, true)) {
			return "multiple";
		}
	} else {
		return "newspaperArticle";
	}
}


function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = doc.querySelectorAll('a.Teaser-link');
	for (let row of rows) {
		if (row.pathname.search(/\/.*\//) === 0) {
			// Non-article links have more than one slash in the path, e.g.
			// /om/choklad (link to a subject page).
			continue;
		}
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
		item.creators = [];
		// The author string is in the format:
		// FirstName LastName | Email
		var authorString = attr(doc, 'meta[name="author"]', "content");
		if(authorString) {
			var nameString = authorString.split("|")[0];
			var author = ZU.cleanAuthor(nameString, "author");
			if(author.firstName === "") {
				// If there's only one name, the author is not a person,
				// e.g. "TT".
				author.firstName = undefined;
				author.fieldMode = true;
			}
			item.creators.push(author);
		}

		// Dates are in the format:
		// Thu, 1 Mar 2018 12:05:53 +01:00
		var dateString = attr(doc, 'meta[name="publishdate"]', "content");
		if(dateString) {
			item.date = new Date(dateString).toISOString().split("T")[0];
		}

		item.shortTitle = "";

		// Remove suffix not part of the title.
		item.title = item.title.replace(/( \(SvD Premium\))? \| SvD$/, "");
		
 		item.ISSN = "1101-2412";
 		
 		item.publicationTitle = "Svenska Dagbladet";
 		
 		var articleTags = doc.querySelectorAll(".ArticleTags-tag-link");
 		for(let i = 0; i < articleTags.length; i++) {
 			let tag = articleTags[i].textContent;
 			item.tags.push(tag);
 		}

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
		"url": "https://www.svd.se/tung-s-minister-nks-skandalen-skadar-sveriges-rykte",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Damberg: ”NKS-skandalen skadar Sveriges rykte”",
				"creators": [
					{
						"firstName": "Henrik",
						"lastName": "Ennart",
						"creatorType": "author"
					}
				],
				"date": "2018-03-01",
				"ISSN": "1101-2412",
				"abstractNote": "Nya Karolinska-skandalen har blivit en nationell fråga som riskerar att skada Sveriges rykte som innovationsland. Det säger närings- och innovationsminister Mikael Damberg (S) till SvD.",
				"language": "sv",
				"libraryCatalog": "www.svd.se",
				"publicationTitle": "Svenska Dagbladet",
				"section": "Sverige",
				"url": "https://www.svd.se/tung-s-minister-nks-skandalen-skadar-sveriges-rykte",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					"Irene Svenonius",
					"Mikael Damberg",
					"Politik"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.svd.se/andersson-avrader-fran-att-ge-till-tiggare",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "MP-toppar slår tillbaka mot Anderssons tiggeriutspel",
				"creators": [
					{
						"lastName": "Omni",
						"creatorType": "author",
						"fieldMode": true
					}
				],
				"date": "2018-03-01",
				"ISSN": "1101-2412",
				"abstractNote": "Alla som ger till tiggare riskerar att bidra till människohandel, enligt finansminister Magdalena Andersson (S). Miljöpartiets Maria Ferm slår nu tillbaka mot Andersson. ”Iskylan har trängt in långt in i den politiska debatten”, skriver Ferm på Facebook.",
				"language": "sv",
				"libraryCatalog": "www.svd.se",
				"publicationTitle": "Svenska Dagbladet",
				"section": "Sverige",
				"url": "https://www.svd.se/andersson-avrader-fran-att-ge-till-tiggare",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					"Magdalena Andersson",
					"Människohandel",
					"Politik",
					"Tiggeri"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.svd.se/sok?q=choklad",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://www.svd.se/familjeforetaget-utloste-epidemi--tjanade-multum",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Hundratusentals döda – familjen tjänar miljarder",
				"creators": [
					{
						"firstName": "Marcus",
						"lastName": "Joons",
						"creatorType": "author"
					}
				],
				"date": "2018-03-13",
				"ISSN": "1101-2412",
				"abstractNote": "Fentanyl betydde slutet för Prince, Tom Petty, Lil Peep – och svenska ungdomar som köpt sprayflaskor på nätet. Det här är berättelsen om hur en smärtstillande medicin ledde hundratusentals människor in i döden.",
				"language": "sv",
				"libraryCatalog": "www.svd.se",
				"publicationTitle": "Svenska Dagbladet",
				"section": "Kultur",
				"url": "https://www.svd.se/familjeforetaget-utloste-epidemi--tjanade-multum",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					"Cancer",
					"Missbruk",
					"Narkotika",
					"Prince",
					"Rättsmedicinalverket",
					"SvD Premium",
					"Tom Petty",
					"USA",
					"Östberga",
				],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/
