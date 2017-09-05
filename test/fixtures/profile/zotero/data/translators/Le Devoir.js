{
	"translatorID": "d1605270-d7dc-459f-9875-74ad8dde1f7d",
	"label": "Le Devoir",
	"creator": "Philipp Zumstein",
	"target": "^https?://www\\.ledevoir\\.com",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2017-01-01 15:26:06"
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
	if (url.indexOf("/recherche")>-1) {
		return "multiple";
	} else if (ZU.xpathText(doc, '//article[@id="article"]')) {
		return "newspaperArticle";
	}
}


function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = ZU.xpath(doc, '//article/h2/a');
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
	
	var newItem = new Zotero.Item("newspaperArticle");
	newItem.title = ZU.xpathText(doc, '//h1');
	
	var specs = ZU.xpath(doc, '//span[@class="specs_content"]');
	var date = ZU.xpathText(specs, './text()[1]');
	newItem.date = ZU.strToISO(date);
	
	var authors = ZU.xpath(specs, './a[contains(@href, "/auteur")]');
	for (var i=0; i<authors.length; i++) {
		newItem.creators.push(ZU.cleanAuthor(authors[i].textContent, "author"));
	}
	
	newItem.section = ZU.xpathText(specs, './a[@class="section"]');
	
	newItem.abstractNote = ZU.xpathText(doc, '//meta[@property="og:description"]/@content');
	
	newItem.language = ZU.xpathText(doc, '//meta[@name="language"]/@content');

	newItem.url = url;
	newItem.publicationTitle = "Le Devoir";
	newItem.ISSN = "0319-0722";

	newItem.complete();
}
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.ledevoir.com/politique/quebec/483793/journalistes-surveilles-le-comite-d-experts-sur-travail-des-policiers-aura-les-pouvoirs-d-une-commission-d-enquete",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Des dérives policières alarmantes",
				"creators": [
					{
						"firstName": "Marco",
						"lastName": "Bélair-Cirino",
						"creatorType": "author"
					}
				],
				"date": "2016-11-04",
				"ISSN": "0319-0722",
				"abstractNote": "Après avoir appris la mise sur pied d’une commission d’enquête sur la liberté de la presse, la salle des nouvelles de Radio-Canada a été frappée de consternation. La Sûreté du Québec a réussi à mettre la main sur des liasses de relevés téléphoniques, s’échelonnant de 2008 à 2013, des journalistes d’enquête Alain Gravel, Marie-Maude Denis et Isabelle Richer.",
				"language": "fr",
				"libraryCatalog": "Le Devoir",
				"publicationTitle": "Le Devoir",
				"section": "Québec",
				"url": "http://www.ledevoir.com/politique/quebec/483793/journalistes-surveilles-le-comite-d-experts-sur-travail-des-policiers-aura-les-pouvoirs-d-une-commission-d-enquete",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.ledevoir.com/societe/medias/110295/medias-l-ipi-appelle-a-la-liberte-de-presse",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Médias - L'IPI appelle à la liberté de presse",
				"creators": [],
				"date": "2006",
				"ISSN": "0319-0722",
				"abstractNote": "Édimbourg — Le directeur de l'Institut international de la presse (IPI), Johann Fritz, a appelé hier à Édimbourg les gouvernements du monde entier à défendre et renforcer la liberté de la presse menacée de toutes parts.",
				"language": "fr",
				"libraryCatalog": "Le Devoir",
				"publicationTitle": "Le Devoir",
				"url": "http://www.ledevoir.com/societe/medias/110295/medias-l-ipi-appelle-a-la-liberte-de-presse",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.ledevoir.com/recherche?expression=libert%C3%A9",
		"items": "multiple"
	}
]
/** END TEST CASES **/