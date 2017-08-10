{
	"translatorID": "f6279abd-ab60-4aad-bdb0-20137279cd19",
	"label": "La Croix",
	"creator": "Philipp Zumstein",
	"target": "^https?://www\\.la-croix\\.com",
	"minVersion": "3.0.4",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2016-11-03 20:18:42"
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
	if (ZU.xpath(doc, '//div[@data-article-id]').length>0) {
		return "newspaperArticle";
	} else if (getSearchResults(doc, true)) {
		return "multiple";
	}
}

function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = ZU.xpath(doc, '//div[contains(@class, "item")]/a[h2|h3|h4]');
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
			var articles = new Array();
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
	translator.setDocument(doc);
	
	translator.setHandler('itemDone', function (obj, item) {
		var bylineNodes = ZU.xpath(doc, '//div[contains(@class, "visible-xs")]//div[contains(@class, "meta-author")]/a');
		item.creators = [];
		if (bylineNodes.length>0) {
			var authorPart = bylineNodes[0].textContent.split(",")[0];
			//e.g. Séverin Husson et Emmanuelle Réju, le 19/01/2016 à 10h08
			//e.g. François d’Alançon (envoyé spécial à Damas)
			var authorPart = authorPart.replace(/\([^\)]*\)/, "").trim();
			//Z.debug(authorPart);
			var authors = authorPart.split(/, | et /);
			for (var i=0; i<authors.length; i++) {
				item.creators.push(ZU.cleanAuthor(authors[i], "author"));
			}
		}
		item.section = ZU.xpathText(doc, '//nav[contains(@class, "category-menu")]/div[contains(@class, "active-category")]/a[2]');
		item.language = "fr-FR";
		item.ISSN = "0242-6056";
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
		"url": "http://www.la-croix.com/Monde/Europe/Villes-jumelees-piliers-de-l-amitie-franco-allemande-2016-05-27-1200763414",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Villes jumelées, piliers de l’amitié franco-allemande",
				"creators": [
					{
						"firstName": "Malo",
						"lastName": "Tresca",
						"creatorType": "author"
					}
				],
				"date": "2016-05-27T17:31:45+02:00",
				"ISSN": "0242-6056",
				"abstractNote": "Dimanche 29 mai, François Hollande et Angela Merkel célèbrent le rapprochement entre leurs peuples à l’occasion de la commémoration du centenaire de la bataille de Verdun, « La Croix » revient sur les amitiés entre citoyens qui naissent des jumelages franco-allemands.",
				"language": "fr-FR",
				"libraryCatalog": "www.la-croix.com",
				"publicationTitle": "La Croix",
				"section": "Monde",
				"url": "http://www.la-croix.com/Monde/Europe/Villes-jumelees-piliers-amitie-franco-allemande-2016-05-27-1200763414",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					"Allemagne",
					"Angela Merkel",
					"France-Allemagne",
					"François Hollande"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.la-croix.com/Monde",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://www.la-croix.com/Sciences-et-ethique/Environnement/Abeilles-contre-pesticides-la-bataille-reprend-2016-01-19-1200732216?source=standard",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Abeilles contre pesticides, la bataille reprend",
				"creators": [
					{
						"firstName": "Séverin",
						"lastName": "Husson",
						"creatorType": "author"
					},
					{
						"firstName": "Emmanuelle",
						"lastName": "Réju",
						"creatorType": "author"
					}
				],
				"date": "2016-01-19T10:08:37+01:00",
				"ISSN": "0242-6056",
				"abstractNote": "Mardi 19 janvier, le Sénat examine en première lecture le projet de loi sur la « reconquête de la biodiversité ».Les sénateurs écologistes entendent à cette occasion demander à nouveau l’interdiction totale des insecticides appartenant à la famille des néonicotinoïdes.",
				"language": "fr-FR",
				"libraryCatalog": "www.la-croix.com",
				"publicationTitle": "La Croix",
				"section": "Sciences & éthique",
				"url": "http://www.la-croix.com/Sciences/Environnement/Abeilles-contre-pesticides-bataille-reprend-2016-01-19-1200732216",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					"Sénat",
					"abeilles",
					"agriculture",
					"industrie",
					"pesticides"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.la-croix.com/Monde/Moyen-Orient/A-Damas-une-vie-corrompue-par-la-guerre-2016-05-29-1200763663",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "A Damas, une vie corrompue par la guerre",
				"creators": [
					{
						"firstName": "François",
						"lastName": "d’Alançon",
						"creatorType": "author"
					}
				],
				"date": "2016-05-29T17:32:54+02:00",
				"ISSN": "0242-6056",
				"abstractNote": "À Damas, une minorité prospère dans l’économie de guerre, le marché noir, la contrebande et les trafics. La grande majorité s’épuise chaque jour dans les petites batailles de la survie. Le récit de notre envoyé spécial.",
				"language": "fr-FR",
				"libraryCatalog": "www.la-croix.com",
				"publicationTitle": "La Croix",
				"section": "Monde",
				"url": "http://www.la-croix.com/Monde/Moyen-Orient/A-Damas-corrompue-guerre-2016-05-29-1200763663",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					"Syrie"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/