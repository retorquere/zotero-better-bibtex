{
	"translatorID": "c4008cc5-9243-4d13-8b35-562cdd184558",
	"label": "Delpher",
	"creator": "Philipp Zumstein",
	"target": "^https?://[^\\/]+\\.delpher\\.nl",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2017-05-21 03:21:00"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2016 Philipp Zumstein

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
	if (url.indexOf('view')>-1) {
		if (url.indexOf('boeken')>-1) {
			return "book";
		}
		if (url.indexOf('tijdschriften')>-1) {
			return "journalArticle";
		}
		if (url.indexOf('kranten')>-1) {
			return "newspaperArticle";
		}
		if (url.indexOf('radiobulletins')>-1) {
			return "radioBroadcast";
		}
	} else if (getSearchResults(doc, true)) {
		return "multiple";
	}
}

function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = ZU.xpath(doc, '//main[contains(@class, "searchresults")]/article//a[h2[contains(@class, "title")] and starts-with(@href, "/")]');
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
	var item = new Zotero.Item(detectWeb(doc, url));
	var details = ZU.xpath(doc, '//div[contains(@class, "bkt-mvc-detailsAction") and contains(@class, "side-bar-block")]');

	item.title = ZU.xpathText(details, './/dd[@data-testing-id="search-result__title"]');
	item.numPages = ZU.xpathText(details, './/dd[@data-testing-id="search-result__extent"]');

	var date = ZU.xpathText(details, './/dd[@data-testing-id="search-result__date"]');

	if (date && date.length > 4) {
		item.date = date.replace(/(\d{2})\-(\d{2})-(\d{4})/, "$3-$2-$1");
	}
	else item.date = date;


	item.publicationTitle = 	item.issue = ZU.xpathText(details, './/dd[@data-testing-id="search-result__papertitle"]');
	item.libraryCatalog = ZU.xpathText(details, './/dd[@data-testing-id="search-result__source"]');
	if (!item.libraryCatalog) item.libraryCatalog = "Delpher";
	item.publisher = ZU.xpathText(details, './/dd[@data-testing-id="search-result__publisher"]/a');
	item.callNumber = ZU.xpathText(details, './/dd[@data-testing-id="search-result__signature"]');
	var language = ZU.xpathText(details, './/dd[@data-testing-id="search-result__language"]');
	if (language) item.language = ZU.trimInternal(language);
	item.volume = ZU.xpathText(details, './/dd[@data-testing-id="search-result__volume"]');
	item.issue = ZU.xpathText(details, './/dd[@data-testing-id="search-result__issuenumber"]');
	item.edition = ZU.xpathText(details, './/dd[@data-testing-id="search-result__edition"]');
	item.place = ZU.xpathText(details, './/dd[@data-testing-id="search-result__spatialCreation"]');


	var tags = ZU.xpath(details, './/dd[@data-testing-id="search-result__subject"]/a');

	for (var i = 0; i<tags.length; i++) {
		item.tags.push(tags[i].textContent);
	}

	var authors = ZU.xpath(details, './/dd[@data-testing-id="search-result__creator"]/a');
	for (var i = 0; i<authors.length; i++) {
		item.creators.push(ZU.cleanAuthor(authors[i].textContent, "author", true));
	}

	item.url = ZU.xpathText(doc, '(//input[contains(@class, "persistent-id")])[1]/@value');
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
		"url": "http://boeken.delpher.nl/nl/results/index?query=buurman&coll=boeken&maxperpage=10&identifier=ddd%3A010565868%3Ampeg21%3Aa0181&",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://www.delpher.nl/nl/boeken/view/index?query=buurman&coll=boeken&identifier=dpo%3A2390%3Ampeg21%3A0012&page=1&maxperpage=10",
		"items": [
			{
				"itemType": "book",
				"title": "Philippe en Georgette, zangspel.",
				"creators": [
					{
						"firstName": "Jacques Marie",
						"lastName": "Boutet de Monvel",
						"creatorType": "author"
					},
					{
						"firstName": "N. C. (wed C. van Streek)",
						"lastName": "Brinkman",
						"creatorType": "author"
					}
				],
				"date": "1796",
				"callNumber": "1089 C 52:1",
				"language": "Nederlands , Vlaams , néerlandais",
				"libraryCatalog": "Leiden, Universiteitsbibliotheek",
				"numPages": "72",
				"publisher": "Helders, Jan Amsterdam, 1779-1798, Mars, Abraham Amsterdam, 1783-1802",
				"url": "http://resolver.kb.nl/resolve?urn=dpo:2390:mpeg21",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					"Drama",
					"French language and literature"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://tijdschriften.delpher.nl/nl/results/index?query=buurman&coll=dts&page=1&maxperpage=10",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://kranten.delpher.nl/nl/results/index?coll=ddd&query=buurman",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://www.delpher.nl/nl/kranten/view/index?query=buurman&coll=ddd&identifier=ddd%3A110578678%3Ampeg21%3Aa0106&page=1&maxperpage=10",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Spaansche buurman.",
				"creators": [],
				"date": "1941-02-01",
				"edition": "Avond",
				"libraryCatalog": "KB C 98",
				"place": "Amsterdam",
				"publicationTitle": "De Telegraaf",
				"url": "http://resolver.kb.nl/resolve?urn=ddd:110578678",
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
		"url": "http://radiobulletins.delpher.nl/nl/results/index?query=buurman&coll=anp&maxperpage=10&identifier=dts%3A2978028%3Ampeg21%3A0001&",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://www.delpher.nl/nl/radiobulletins/view/index?query=buurman&coll=anp&identifier=anp%3A1950%3A02%3A20%3A19%3Ampeg21&page=1&maxperpage=10",
		"items": [
			{
				"itemType": "radioBroadcast",
				"title": "ANP Nieuwsbericht - 20-02-1950 - 19",
				"creators": [],
				"date": "1950-02-20",
				"language": "Nederlands",
				"libraryCatalog": "Delpher",
				"url": "http://resolver.kb.nl/resolve?urn=anp:1950:02:20:19",
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
		"url": "http://www.delpher.nl/nl/tijdschriften/view/index?query=buurman&coll=dts&identifier=dts%3A2738036%3Ampeg21%3A0012&page=1&maxperpage=10#info",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Nieuwsblad voor den boekhandel jrg 91, 1924, no 35, 02-05-1924",
				"creators": [],
				"date": "1924-05-02",
				"issue": "35",
				"language": "Nederlands",
				"libraryCatalog": "Koninklijke Bibliotheek: LHO AW.A 06b NIE",
				"url": "http://resolver.kb.nl/resolve?urn=dts:2738036:mpeg21",
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
		"url": "http://www.delpher.nl/nl/boeken/view?coll=boeken&identifier=MMKB02:100006852",
		"items": [
			{
				"itemType": "book",
				"title": "Neêrland weer vrij!",
				"creators": [
					{
						"firstName": "J.",
						"lastName": "Stamperius",
						"creatorType": "author"
					},
					{
						"firstName": "W. K. de",
						"lastName": "Bruin",
						"creatorType": "author"
					}
				],
				"date": "[192-?]",
				"callNumber": "BJ 50012 [1]",
				"language": "Nederlands",
				"libraryCatalog": "Koninklijke Bibliotheek",
				"numPages": "95 p., [6] bl. pl",
				"publisher": "Alkmaar : Gebr. Kluitman",
				"url": "http://resolver.kb.nl/resolve?urn=MMKB02:100006852",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					"1505",
					"1505 bed",
					"Achttiende eeuw",
					"Digitale versies",
					"Historische verhalen",
					"Napoleontische oorlogen",
					"Negentiende eeuw",
					"Oorlogsverhalen"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/
