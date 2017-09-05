{
	"translatorID": "f46cc903-c447-47d6-a2cf-c75ed22dc96b",
	"label": "Cairn.info",
	"creator": "Sebastian Karcher, Sylvain Machefert and Nicolas Chachereau",
	"target": "^https?://www\\.cairn\\.info/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2016-09-07 21:03:55"
}

/*
	Translator
   Copyright (C) 2013 Sebastian Karcher

   This program is free software: you can redistribute it and/or modify
   it under the terms of the GNU Affero General Public License as published by
   the Free Software Foundation, either version 3 of the License, or
   (at your option) any later version.

   This program is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   GNU Affero General Public License for more details.

   You should have received a copy of the GNU Affero General Public License
   along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

function detectWeb(doc,url) {
	var xpath='//meta[@name="citation_journal_title"]';

	if (ZU.xpath(doc, xpath).length > 0) {
		return "journalArticle";
	}

	if (ZU.xpathText(doc, '//div[contains(@class, "list_articles")]//div[contains(@class, "article") or contains(@class, "articleBookList")]')) {
		return "multiple";
	}

	return false;
}


function doWeb(doc,url) {
	if (detectWeb(doc, url) == "multiple") {
		var hits = {};
		var urls = [];
		var title;
		var link;
		var resultsrow = ZU.xpath(doc, '//div[contains(@class, "list_articles")]/div[contains(@class, "article")]');
		for (var i=0; i<resultsrow.length; i++) {
			title = ZU.xpathText(resultsrow[i], './/div[@class="meta"]//div[@class="title"]');
			if (!title) {
				title = ZU.xpathText(resultsrow[i], './/div[@class="wrapper_title"]/h2/text()');
			}
			link = ZU.xpathText(resultsrow[i], './/div[@class="state"]/a[1]/@href');
			//Z.debug(title + ": " + link)
			hits[link] = title.replace(/^[\s\,]+/, "").trim();
		}
		Z.selectItems(hits, function(items) {
			if (items == null) return true;
			for (var j in items) {
				urls.push(j);
			}
			ZU.processDocuments(urls, scrape);
		});
	} else {
		scrape(doc);
	}
}


function scrape(doc) {
	// We call the Embedded Metadata translator to do the actual work
	var translator = Zotero.loadTranslator("web");
	translator.setTranslator("951c027d-74ac-47d4-a107-9c3069ab7b48");
	translator.setDocument(doc);
	translator.setHandler("itemDone", function(obj, item) {
		// Cairn.info uses non-standard keywords:
		// we import them here, as the Embedded Metadata translator
		// cannot catch them.
		item.tags = [];
		var keywords = ZU.xpathText(doc, '//meta[@name="article-mot_cle"]/@content');
		if (keywords) {
			keywords = keywords.split(/\s*[,;]\s*/);
			for (var i=0; i<keywords.length; i++) {
				if (keywords[i].trim()) {
					item.tags.push(keywords[i])
				}
			}
		}

		// The default value for PDF download is on an HTML page that
		// calls the actual download. We need to correct the attachment
		// URL after the import translator has run.
		for (var i=0; i<item.attachments.length; i++) {
			if (item.attachments[i].mimeType == 'application/pdf') {
				item.attachments[i].url += "&download=1";
			}
		}

		// Correct volume and issue information
		if (item.volume) {
			if (item.volume.search(/^n°/i) != -1) {
				item.issue = item.volume.split(/n°/i)[1].trim();
				item.volume = '';
			} else if (item.volume.search(/^Vol./i) != -1) {
				item.volume = item.volume.split(/Vol./i)[1].trim();
			}
			if (item.volume.search(/^\d+-\d+$/) != -1) {
				var volume = item.volume.split('-')
				item.volume = volume[0];
				item.issue = volume[1];
			}
		}

		// Other fixes
		delete item.libraryCatalog;

		item.complete();
	});
	translator.translate();
}


/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.cairn.info/revue-d-economie-du-developpement-2012-4.htm",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://www.cairn.info/resultats_recherche.php?searchTerm=artiste",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://www.cairn.info/publications-de-Topalov-Christian--1020.htm",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://www.cairn.info/resume.php?ID_ARTICLE=RESS_521_0065",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Les enjeux normatifs et politiques de la diffusion de la recherche",
				"creators": [
					{
						"firstName": "Xavier",
						"lastName": "Landes",
						"creatorType": "author"
					}
				],
				"date": "2014-05-13",
				"ISSN": "0048-8046",
				"issue": "1",
				"language": "fr",
				"libraryCatalog": "Cairn.info",
				"pages": "65-92",
				"publicationTitle": "Revue européenne des sciences sociales",
				"url": "http://www.cairn.info/resume.php?ID_ARTICLE=RESS_521_0065",
				"volume": "52",
				"attachments": [
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					},
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					"bénéfices sociaux",
					"libre accès",
					"publications académiques",
					"recherche",
					"État"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.cairn.info/resume.php?ID_ARTICLE=RHIS_121_0049",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Le mouvement pétitionnaire pour la restauration d'Henri V (automne 1873-hiver 1874). Tactique politique et expression d'un légitimisme populaire",
				"creators": [
					{
						"firstName": "Éric",
						"lastName": "Derennes",
						"creatorType": "author"
					}
				],
				"date": "2012-04-17",
				"ISSN": "0035-3264",
				"issue": "661",
				"language": "fr",
				"libraryCatalog": "Cairn.info",
				"pages": "49-99",
				"publicationTitle": "Revue historique",
				"url": "http://www.cairn.info/resume.php?ID_ARTICLE=RHIS_121_0049",
				"attachments": [
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					},
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					"assemblée nationale",
					"député",
					"légitimisme",
					"pétition",
					"restauration",
					"royaliste"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.cairn.info/resume.php?ID_ARTICLE=RFS_523_0537",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Transformation de l'État ou changement de régime ? De quelques confusions en théorie et sociologie de l'État",
				"creators": [
					{
						"firstName": "Paul Du",
						"lastName": "Gay",
						"creatorType": "author"
					},
					{
						"firstName": "Alan",
						"lastName": "Scott",
						"creatorType": "author"
					}
				],
				"date": "2011-10-26",
				"ISSN": "0035-2969",
				"issue": "3",
				"language": "fr",
				"libraryCatalog": "Cairn.info",
				"pages": "537-557",
				"publicationTitle": "Revue française de sociologie",
				"shortTitle": "Transformation de l'État ou changement de régime ?",
				"url": "http://www.cairn.info/resume.php?ID_ARTICLE=RFS_523_0537",
				"volume": "52",
				"attachments": [
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					},
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