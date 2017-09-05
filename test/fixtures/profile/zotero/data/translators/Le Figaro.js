{
	"translatorID": "80a58db6-7353-4bfa-9f3a-4a44fc903f01",
	"label": "Le Figaro",
	"creator": "Philipp Zumstein",
	"target": "^https?://www\\.lefigaro\\.fr/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2016-05-29 22:56:59"
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
	if (url.indexOf('ARTFIG')>-1) {
		return "newspaperArticle";
	} else if (getSearchResults(doc, true)) {
		return "multiple";
	}
}

function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = ZU.xpath(doc, '//section[contains(@class, "fig-profil")]//h2[contains(@class, "fig-profil-headline")]/a');
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
	var item = new Zotero.Item('newspaperArticle');
	item.title = ZU.xpathText(doc, '//h1[@itemprop="headline"]');
	var author = ZU.xpath(doc, '//span[@itemprop="author"]/a|//span[@itemprop="author"]/span');
	for (var i=0; i<author.length; i++) {
		item.creators.push(Zotero.Utilities.cleanAuthor(author[i].textContent, "author"));
	}
	item.date = ZU.xpathText(doc, '//time[@itemprop="datePublished"]/@datetime');
	item.publicationTitle = "Le Figaro";
	item.ISSN = "0182-5852";
	item.language = "fr-FR";
	item.section = ZU.xpathText(doc, '//a[contains(@class, "fig-breadcrumb-rubrique")]');
	var tags = ZU.xpath(doc, '//span[@itemprop="keywords"]');
	for (var i=0; i<tags.length; i++) {
		item.tags.push(tags[i].textContent);
	}
	item.abstractNote = ZU.xpathText(doc, '//p[@itemprop="about"]');
	item.attachments.push({
		title: "Snapshot",
		mimeType: "text/html",
		document: doc
	});
	item.complete();
}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.lefigaro.fr/voyages/2016/05/27/30003-20160527ARTFIG00198-le-charme-discret-du-pays-de-galles.php",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Le charme discret du pays de Galles",
				"creators": [
					{
						"firstName": "Guillaume de",
						"lastName": "Dieuleveult",
						"creatorType": "author"
					}
				],
				"date": "2016-05-27T16:12:21+02:00",
				"ISSN": "0182-5852",
				"abstractNote": "EN IMAGES - Vieille terre celte nichée entre la mer et les montagnes, le pays de Galles a su garder son âme intacte. Découverte d'une contrée qui a la mémoire longue.",
				"language": "fr-FR",
				"libraryCatalog": "Le Figaro",
				"publicationTitle": "Le Figaro",
				"section": "Voyages",
				"attachments": [
					{
						"title": "Snapshot",
						"mimeType": "text/html"
					}
				],
				"tags": [
					"Celtes",
					"Culture",
					"Diaporama",
					"Pays de Galles"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.lefigaro.fr/culture/2016/02/19/03004-20160219ARTFIG00236-gerd-krumeich-un-carnage-inutile.php",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Vu d'Allemagne : «Verdun, un carnage inutile»",
				"creators": [
					{
						"firstName": "Nicolas",
						"lastName": "Barotte",
						"creatorType": "author"
					}
				],
				"date": "2016-02-19T15:52:31+01:00",
				"ISSN": "0182-5852",
				"abstractNote": "INTERVIEW - Dimanche 29 mai, les Français commémoreront le centenaire de la bataille de Verdun. Gerd Krumeich, spécialiste de la Première Guerre mondiale, a publié en novembre dernier Verdun 1916 (Tallandier), avec l'historien français Antoine Prost.",
				"language": "fr-FR",
				"libraryCatalog": "Le Figaro",
				"publicationTitle": "Le Figaro",
				"section": "Culture",
				"shortTitle": "Vu d'Allemagne",
				"attachments": [
					{
						"title": "Snapshot",
						"mimeType": "text/html"
					}
				],
				"tags": [
					"Allemagne",
					"Bataille de Verdun",
					"Première Guerre mondiale",
					"Verdun"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.lefigaro.fr/actualite-france/2016/05/28/01016-20160528ARTFIG00142-parc-monceau-le-temoignage-du-pompier-de-repos-qui-a-prodigue-les-premiers-soins-aux-victimes.php",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Parc Monceau : «J'ai vu tout de suite qu'un des enfants était en arrêt cardiaque»",
				"creators": [
					{
						"firstName": "Aude",
						"lastName": "Bariéty",
						"creatorType": "author"
					}
				],
				"date": "2016-05-28T19:08:03+02:00",
				"ISSN": "0182-5852",
				"abstractNote": "REPORTAGE- Pascal Gremillot, commandant à la brigade des sapeurs de pompiers de Paris, qui se trouvait par hasard à proximité des lieux lorsque la foudre est tombée, a porté les premiers soins aux victimes. Son action a été déterminante.",
				"language": "fr-FR",
				"libraryCatalog": "Le Figaro",
				"publicationTitle": "Le Figaro",
				"section": "Société",
				"shortTitle": "Parc Monceau",
				"attachments": [
					{
						"title": "Snapshot",
						"mimeType": "text/html"
					}
				],
				"tags": [
					"Foudre",
					"Parc MOnceau"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.lefigaro.fr/",
		"items": "multiple"
	}
]
/** END TEST CASES **/