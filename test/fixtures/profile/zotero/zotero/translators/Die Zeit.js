{
	"translatorID": "312bbb0e-bfb6-4563-a33c-085445d391ed",
	"label": "Die Zeit",
	"creator": "Philipp Zumstein",
	"target": "^https?://www\\.zeit\\.de/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2017-05-23 21:14:22"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2015 Philipp Zumstein

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

/*
This translator works only partially, because zeit.de uses some strange javascript that makes 
processDocuments return an error. If I just call scrape(doc, url) on a single document, it works.
The way the translator is programmed now, it only works for multiples if JavaScript is turned off in the browser.
For example at 
   http://www.zeit.de/suche/index?q=Krise
only the first reference can be scraped.
*/

function detectWeb(doc, url) {
	var schemaArticle = ZU.xpath(doc, '//*[@itemtype="http://schema.org/Article"]');
	if (schemaArticle.length>0) {
		return "newspaperArticle";
	} else if (getSearchResults(doc, true)){ //ZU.xpath(doc, '//h4/a|//h2/a').length>0
		return "multiple";
	}
}

function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = doc.getElementsByClassName('archiveteaser');
	if (rows.length == 0) {
		rows = doc.getElementsByClassName('teaser-small__container');
	}
	for (var i=0; i<rows.length; i++) {
		var href = ZU.xpathText(rows[i], '(.//a/@href)[1]');
		var title = ZU.trimInternal( ZU.xpathText(rows[i], './/a/h4|.//a[span]') );
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

function scrape(doc, url){
	//Z.monitorDOMChanges(doc, {childList: true})
	var articleNode = ZU.xpath(doc, '//*[@itemtype="http://schema.org/Article"]')[0];
	var newItem = new Zotero.Item("newspaperArticle");
	newItem.url = url;
	newItem.title = ZU.xpathText(doc, './/title').replace(/\s\|\sZEIT\sONLINE$/, '');
	newItem.abstractNote = ZU.xpathText(articleNode, './/*[@itemprop="description"]');
	var date = ZU.xpathText(doc, '//meta[@name="date"]/@content');
	if (date) {
		newItem.date = date.replace(/T.+/, "");
	}
	var authorNode = ZU.xpath(articleNode, './/*[@itemprop="author"]//*[@itemprop="name"]');
	if (authorNode.length == 0) {
		authorNode = ZU.xpath(articleNode, './/*[@itemprop="author"]');
	}
	if (authorNode.length == 0) {
		authorNode = ZU.xpath(articleNode, './/div[@class="byline"]');
	}
	for (var i=0; i<authorNode.length; i++) {
		var authorName = authorNode[i].textContent;
		if (authorName){
			authorName = authorName.replace(/^\s*Von/, '');
			var author = ZU.cleanAuthor(authorName, "author");
			if (author.firstName == "") {
				author.fieldMode = 1;
				delete author.firstName;
			}
			newItem.creators.push(author);
		}
	}
	
	var section = doc.getElementsByClassName("nav__ressorts-link--current");
	if (section.length > 0) {
		newItem.section = section[0].textContent;
	}
	
	newItem.publicationTitle = "Die Zeit";
	newItem.ISSN = "0044-2070";
	newItem.language = "de-DE";
	newItem.place = "Hamburg";
	
	var keywordsString = ZU.xpathText(doc, '//meta[@name="keywords"]/@content');
	var keywords = keywordsString.split(',');
	for (var i=0; i<keywords.length; i++) {
		newItem.tags.push(
			keywords[i].trim()
		)
	}

	// if present, use the link to show the whole content on a single page
	var snapshotNode = ZU.xpath(doc, '//li[@class="article-pager__all"]/a');
	var snapshotUrl = (snapshotNode.length > 0) ? snapshotNode[0].href : url;
	newItem.attachments.push({
		url : snapshotUrl,
		title : "Snapshot", 
		mimeType : "text/html"
	}); 
	newItem.complete();
}
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.zeit.de/politik/ausland/2011-09/libyen-bani-walid",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Libyen: Rebellen bereiten Angriff auf Bani Walid vor",
				"creators": [
					{
						"lastName": "AFP",
						"creatorType": "author",
						"fieldMode": 1
					},
					{
						"lastName": "dpa",
						"creatorType": "author",
						"fieldMode": 1
					}
				],
				"date": "2011-09-04",
				"ISSN": "0044-2070",
				"abstractNote": "Die von Gadhafi-Anhängern geführte Stadt ist von Rebellentruppen eingekreist. Gespräche über eine friedliche Übergabe sind gescheitert, ein Angriff steht offenbar bevor.",
				"language": "de-DE",
				"libraryCatalog": "Die Zeit",
				"place": "Hamburg",
				"publicationTitle": "Die Zeit",
				"section": "Politik",
				"shortTitle": "Libyen",
				"url": "http://www.zeit.de/politik/ausland/2011-09/libyen-bani-walid",
				"attachments": [
					{
						"title": "Snapshot",
						"mimeType": "text/html"
					}
				],
				"tags": [
					"Ausland",
					"Libyen",
					"Politik"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.zeit.de/2011/36/Interview-Lahm-Rinke",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Philipp Lahm: \"Hast du elf Freunde?\"",
				"creators": [
					{
						"firstName": "Moritz",
						"lastName": "Müller-Wirth",
						"creatorType": "author"
					}
				],
				"date": "2011-09-01",
				"ISSN": "0044-2070",
				"abstractNote": "Tschechow und Robben, Drama im Flutlicht und Wahrhaftigkeit bei der Arbeit. Der Fußballprofi und Autor Philipp Lahm im Gespräch mit dem Schriftsteller und Fußballer Moritz Rinke",
				"language": "de-DE",
				"libraryCatalog": "Die Zeit",
				"place": "Hamburg",
				"publicationTitle": "Die Zeit",
				"section": "Sport",
				"shortTitle": "Philipp Lahm",
				"url": "http://www.zeit.de/2011/36/Interview-Lahm-Rinke",
				"attachments": [
					{
						"title": "Snapshot",
						"mimeType": "text/html"
					}
				],
				"tags": [
					"Andreas Ottl",
					"Angela Merkel",
					"Berlin",
					"Bielefeld",
					"Bremen",
					"Bundesliga",
					"Dortmund",
					"FC Bayern München",
					"Fifa",
					"Fußball",
					"Jogi Löw",
					"Kanzleramt",
					"Mailand",
					"Maxim Gorki",
					"Mesut Özil",
					"Oskar Lafontaine",
					"Philipp Lahm",
					"Robbe",
					"Robert Enke",
					"SV Werder Bremen",
					"Schriftsteller",
					"Sport",
					"Stadion",
					"Trainer",
					"Türkei"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.zeit.de/suche/index?q=Krise",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://www.zeit.de/2009/11/A-Drinnen",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "DRINNEN: Mixen aus  Prinzip",
				"creators": [
					{
						"firstName": "Ernst",
						"lastName": "Schmiederer",
						"creatorType": "author"
					}
				],
				"date": "2009-03-05",
				"ISSN": "0044-2070",
				"abstractNote": "Ein Iraner in Wien. Der Fotograf  Daniel Shaked, 31, gibt Österreichs einziges Hip-Hop-Magazin heraus",
				"language": "de-DE",
				"libraryCatalog": "Die Zeit",
				"place": "Hamburg",
				"publicationTitle": "Die Zeit",
				"section": "Politik",
				"shortTitle": "DRINNEN",
				"url": "http://www.zeit.de/2009/11/A-Drinnen",
				"attachments": [
					{
						"title": "Snapshot",
						"mimeType": "text/html"
					}
				],
				"tags": [
					"Band",
					"DRINNEN",
					"Eltern",
					"Familie",
					"Geschwister",
					"Hans Krankl",
					"Hip-Hop",
					"Iran",
					"Israel",
					"Musik",
					"Offenheit",
					"Politik",
					"Reise",
					"Revolution",
					"Salzburg",
					"Teheran",
					"Wien",
					"Österreich"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.zeit.de/2009/11/index",
		"items": "multiple"
	}
]
/** END TEST CASES **/