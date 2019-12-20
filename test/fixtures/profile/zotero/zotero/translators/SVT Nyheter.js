{
	"translatorID": "4c6d887e-341d-4edb-b651-ea702a8918d7",
	"label": "SVT Nyheter",
	"creator": "Sebastian Berlin",
	"target": "^https?://www\\.svt\\.se/nyheter/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcisbv",
	"lastUpdated": "2018-08-13 09:15:36"
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
	return "newspaperArticle";
}


function doWeb(doc, url) {
	scrape(doc, url);
}


function scrape(doc, url) {
	var translator = Zotero.loadTranslator('web');
	// Embedded Metadata
	translator.setTranslator('951c027d-74ac-47d4-a107-9c3069ab7b48');

	translator.setHandler('itemDone', function (obj, item) {
		var nameNodes = ZU.xpath(doc, '//a[@class="nyh_article__author-email"]');

		for (let nameNode of nameNodes) {
			let nameString = nameNode.textContent;
			let author = ZU.cleanAuthor(nameString, "author");
			let firstNames = author.firstName.split(" ");
			if(firstNames.length > 1) {
				// Assume that there's only one first name and move any
				// "extra" name to lastName.
				author.firstName = firstNames[0];
				author.lastName = firstNames[1] + " " + author.lastName;
			}
			item.creators.push(author);
		}
		if (item.creators.length === 0) {
			// No author was found, look for non-person authors, e.g. TT.
			var authorString = ZU.xpathText(doc, '//span[@class="nyh_article__author-name"]');
			var author = ZU.cleanAuthor(authorString, "author");
			author.firstName = undefined;
			author.fieldMode = true;
			item.creators.push(author);
		}

		item.section =  ZU.xpathText(doc, '//a[@class="nyh_section-header__link"]');

		var dateString = attr(doc, 'meta[property="article:published_time"]', "content");
		if(dateString) {
			// The date strings have the format "2018-02-28T02:24:59+01:00".
			item.date = dateString.split("T")[0];
		}

		if(url.match(/\/nyheter\/uutiset\/(?!svenska\/)/)) {
			// Uutiset articles are in Finnish, except when in the Swedish
			// category.
			item.language = "fi";
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
		"url": "https://www.svt.se/nyheter/lokalt/ost/kronobranneriet",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Arkeologer gräver efter brännvin",
				"creators": [
					{
						"firstName": "Lena",
						"lastName": "Liljeborg",
						"creatorType": "author"
					}
				],
				"date": "2018-02-27",
				"abstractNote": "Nu blottläggs den första politiska stridsfrågan i brännvinsbränningens historia.",
				"language": "sv",
				"libraryCatalog": "www.svt.se",
				"publicationTitle": "SVT Nyheter",
				"section": "Öst",
				"url": "https://www.svt.se/nyheter/lokalt/ost/kronobranneriet",
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
		"url": "http://www.svt.se/nyheter/utrikes/varldens-morkaste-byggnad-finns-i-sydkorea",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Världens mörkaste byggnad finns i Sydkorea",
				"creators": [
					{
						"firstName": "Sophia",
						"lastName": "Garcia Hasselberg",
						"creatorType": "author"
					}
				],
				"date": "2018-02-21",
				"abstractNote": "Den här byggnaden skapades inför vinter-OS i Sydkorea och ligger i närheten av tävlingsanläggningarna. Byggnaden är målad med en speciell färg som absorberar nästan 99 procent av allt ljus, och den svarta färgen kan därför skapa illusionen av ett tomrum.",
				"language": "sv",
				"libraryCatalog": "www.svt.se",
				"publicationTitle": "SVT Nyheter",
				"section": "Utrikes",
				"url": "https://www.svt.se/nyheter/utrikes/varldens-morkaste-byggnad-finns-i-sydkorea",
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
		"url": "https://www.svt.se/nyheter/vetenskap/extremt-viktigt-vikingafynd-i-england",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "”Extremt viktigt” vikingafynd i England",
				"creators": [
					{
						"lastName": "TT",
						"creatorType": "author",
						"fieldMode": true
					}
				],
				"date": "2018-02-19",
				"abstractNote": "På 1970-talet upptäcktes en massgrav som troddes härröra från den stora vikingaarmé som invaderade England i slutet av 800-talet. Men på grund av en felmätning föll fynden i glömska. Nu, mer än 40 år senare, gör massgraven en storstilad återkomst som ett av de viktigaste vikingafynden någonsin.",
				"language": "sv",
				"libraryCatalog": "www.svt.se",
				"publicationTitle": "SVT Nyheter",
				"section": "Vetenskap",
				"url": "https://www.svt.se/nyheter/vetenskap/extremt-viktigt-vikingafynd-i-england",
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
		"url": "https://www.svt.se/nyheter/inrikes/trafikanter-varnas-vissa-vagar-hala-som-skridskobanor",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Trafikanter varnas: ”Vissa vägar hala som skridskobanor”",
				"creators": [
					{
						"firstName": "Erik",
						"lastName": "Grönlund",
						"creatorType": "author"
					},
					{
						"firstName": "Maria",
						"lastName": "Makar",
						"creatorType": "author"
					}
				],
				"date": "2018-02-28",
				"abstractNote": "Snön fortsatte pumpa in över Sverige under onsdagen. Framförallt de östra delarna av landet har drabbats hårt. Onsdagens kraftiga snöfall får en fortsättning även under torsdagen. Lokalt kan det komma stora mängder och Trafikverket ger rådet att inte ge sig ut på vägarna om det inte är absolut nödvändigt.",
				"language": "sv",
				"libraryCatalog": "www.svt.se",
				"publicationTitle": "SVT Nyheter",
				"section": "Inrikes",
				"shortTitle": "Trafikanter varnas",
				"url": "https://www.svt.se/nyheter/inrikes/trafikanter-varnas-vissa-vagar-hala-som-skridskobanor",
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
		"url": "https://www.svt.se/nyheter/uutiset/meankielen-paivaa-juhlitaan-pajalassa",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Meänkielen päivää juhlitaan Pajalassa",
				"creators": [
					{
						"firstName": "Anna",
						"lastName": "Starckman",
						"creatorType": "author"
					}
				],
				"date": "2018-02-27",
				"abstractNote": "Tiistaina Pajalassa juhlistetaan meänkielen päivää. Meänkieli julistettiin omaksi kieleksi 30 vuotta sitten.",
				"language": "fi",
				"libraryCatalog": "www.svt.se",
				"publicationTitle": "SVT Nyheter",
				"section": "Uutiset",
				"url": "https://www.svt.se/nyheter/uutiset/meankielen-paivaa-juhlitaan-pajalassa",
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
		"url": "https://www.svt.se/nyheter/uutiset/svenska/finska-gymnasieelever-flyttar-till-sverige-for-sport",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Finska gymnasieelever flyttar till Sverige – för sport",
				"creators": [
					{
						"firstName": "Jonathan",
						"lastName": "Sseruwagi",
						"creatorType": "author"
					}
				],
				"date": "2018-02-28",
				"abstractNote": "Genom åren har finländska ungdomar tagit steget över till Sverige, då det finns över 150 skolor som erbjuder ett program som kombinerar idrott och gymnasiestudier.",
				"language": "sv",
				"libraryCatalog": "www.svt.se",
				"publicationTitle": "SVT Nyheter",
				"section": "Uutiset",
				"url": "https://www.svt.se/nyheter/uutiset/svenska/finska-gymnasieelever-flyttar-till-sverige-for-sport",
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
		"url": "https://www.svt.se/nyheter/utrikes/tyska-bilindustrin-testar-avgaser-pa-apor-och-manniskor",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Tyska bilindustrin testade avgaser på apor och människor",
				"creators": [
					{
						"firstName": "Ingrid",
						"lastName": "Thörnqvist",
						"creatorType": "author"
					}
				],
				"date": "2018-01-29",
				"abstractNote": "De stora tyska bilkoncernerna VW, Daimler och BMW har varit inblandade i tester av avgaser på apor och människor. Det avslöjas av tyska och amerikanska medier. Bilföretagen tar avstånd från experimenten och politiker kräver att saken utreds och att de skyldiga straffas.",
				"language": "sv",
				"libraryCatalog": "www.svt.se",
				"publicationTitle": "SVT Nyheter",
				"section": "Utrikes",
				"url": "https://www.svt.se/nyheter/utrikes/tyska-bilindustrin-testar-avgaser-pa-apor-och-manniskor",
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
