{
	"translatorID": "dedcae51-073c-48fb-85ce-2425e97f128d",
	"label": "Archive Ouverte en Sciences de l'Information et de la Communication  (AOSIC)",
	"creator": "Michael Berkowitz",
	"target": "^https?://archivesic\\.ccsd\\.cnrs\\.fr/",
	"minVersion": "1.0.0b4.r5",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2020-03-09 12:23:02"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2018 Sylvain Machefert
	
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
	if (doc.title.toLowerCase().match(/:: search|:: recherche/)) {
		return "multiple";
	}
	else if (url.match(/sic_\d+|tel-\d+/)) {
		return "journalArticle";
	}
	return false;
}

var metaTags = {
	"DC.relation": "url",
	"DC.date": "date",
	"DC.description": "abstractNote",
	"DC.creator": "creators",
	"DC.title": "title",
};

function doWeb(doc, url) {
	var articles = [];
	if (detectWeb(doc, url) == "multiple") {
		var items = Zotero.Utilities.getItemArray(doc, doc, /sic_\d+|tel-\d+/);
		items = Zotero.selectItems(items);
		for (var i in items) {
			articles.push(i);
		}
	}
	else {
		articles = [url];
	}
	Zotero.Utilities.processDocuments(articles, function (doc) {
		var xpath = '//meta[@name]';
		var data = {};
		var metas = doc.evaluate(xpath, doc, null, XPathResult.ANY_TYPE, null);
		var meta;

		meta = metas.iterateNext();
		while (meta) {
			if (data[meta.name]) {
				data[meta.name] = data[meta.name] + ";" + meta.content;
			}
			else {
				data[meta.name] = meta.content;
			}
			meta = metas.iterateNext();
		}

		var item = new Zotero.Item("journalArticle");
		for (var tag in metaTags) {
			if (tag == "DC.creator") {
				var authors = data['DC.creator'].split(";");
				for (var i = 0; i < authors.length; i++) {
					var aut = authors[i];
					aut = aut.replace(/^([^,]+),\s+(.*)$/, "$2 $1");
					item.creators.push(Zotero.Utilities.cleanAuthor(aut, "author"));
				}
			}
			else {
				item[metaTags[tag]] = data[tag];
			}
		}
		
		var pdfurl = data.citation_pdf_url;
		
		if (pdfurl) {
			item.attachments = [
				{ url: item.url, title: "AOSIC Snapshot", mimeType: "text/html" },
				{ url: pdfurl, title: "AOSIC Full Text PDF", mimeType: "application/pdf" }
			];
		}
		item.complete();
	}, function () {
		Zotero.done();
	});
	Zotero.wait();
}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://archivesic.ccsd.cnrs.fr/sic_00665224/fr/",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "comprendre une organisation par l'analyse de ses documents",
				"creators": [
					{
						"firstName": "Brigitte",
						"lastName": "Guyot",
						"creatorType": "author"
					}
				],
				"date": "2011",
				"abstractNote": "s'appuyer sur des observables que sont les documents d'entreprise donne à voir à la fois une dynamique de formalisation des écrits professionnels, une activité particulière, celle d'éditorialisation, ainsi que des traces d'intervention institutionnelle ; tout cela fait du document un miroir et un porteur d'ordre.",
				"libraryCatalog": "Archive Ouverte en Sciences de l'Information et de la Communication  (AOSIC)",
				"attachments": [
					{
						"title": "AOSIC Snapshot",
						"mimeType": "text/html"
					},
					{
						"title": "AOSIC Full Text PDF",
						"mimeType": "application/pdf"
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
		"url": "https://tel.archives-ouvertes.fr/tel-00483442/fr/",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Valorisation d'un patrimoine documentaire industriel et évolution vers un système de gestion des connaissances orienté métiers",
				"creators": [
					{
						"firstName": "Caroline",
						"lastName": "Djambian",
						"creatorType": "author"
					}
				],
				"date": "2010/04/14",
				"abstractNote": "Le patrimoine documentaire des entreprises s'est souvent accumulé sans que ces dernières puissent s'adapter au rythme des évolutions des technologies de l'information. La mémoire collective qui ne cesse d'être produite voit sa masse croître et est devenue éparse et hétérogène. Comme nombre d'entreprises, des problématiques transverses imposent aujourd'hui à la Division Ingénierie Nucléaire (DIN) d'EDF d'être capable de mobiliser ses connaissances de façon opérationnelle. Mais la valorisation de son patrimoine informationnel dépasse largement les aspects techniques pour prendre en compte l'organisation dans sa globalité. Ce sont en effet les métiers cœurs de l'entreprise qui sont le point de départ de notre réflexion. Dans ce contexte d'ingénierie c'est par la documentation que les connaissances techniques transitent et sont exprimées par des concepts propres aux métiers. La terminologie métiers est la clé permettant de valoriser les connaissances et de mieux gérer le patrimoine de la DIN. Elle nous permet d'aller vers une représentation explicite, au sein d'une base de connaissances centrée sur le \" sens métier \" de l'organisation. Notre approche résolument empirique et qualitative aboutit à une méthode de construction d'une base de connaissances métiers appliquée à un domaine délimité de la Division Ingénierie Nucléaire d'EDF.",
				"libraryCatalog": "Archive Ouverte en Sciences de l'Information et de la Communication  (AOSIC)",
				"attachments": [
					{
						"title": "AOSIC Snapshot",
						"mimeType": "text/html"
					},
					{
						"title": "AOSIC Full Text PDF",
						"mimeType": "application/pdf"
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
