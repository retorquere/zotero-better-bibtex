{
	"translatorID": "530cf18c-e80a-4e67-ae9c-9b8c08591610",
	"label": "Le monde diplomatique",
	"creator": "Martin Meyerhoff",
	"target": "^https?://(www\\.)?monde-diplomatique\\.de",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2016-11-04 22:01:09"
}

/*
Le Monde Diplomatique (de) Translator
Copyright (C) 2011 Martin Meyerhoff

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program. If not, see <http://www.gnu.org/licenses/>.
*/


function detectWeb(doc, url) {
	if (ZU.xpathText(doc, "//p[@class='Titel']")) { 
		return "newspaperArticle";
	}  else if (url.indexOf("/archiv-text?")>-1) {
		return "multiple";
	} 
}


function scrape(doc, url) {
	var newItem = new Zotero.Item("newspaperArticle");

	newItem.title = ZU.xpathText(doc, "//p[@class='Titel']");
	
	var unterzeile = ZU.xpathText(doc, "//p[@class='Unterzeile'][1]");
	var korrespondent = ZU.xpathText(doc, "//p[@class='Korrespondent']");
	
	//newer article seems to have always a unterzeile and korrespondent
	//but some older articles have these information in one line, the unterzeile
	if (!korrespondent && unterzeile) {
		var parts = unterzeile.split(" von ");
		if (parts.length>1) {
			korrespondent = parts[1];
			unterzeile = parts[0];
		}
	}
	if (korrespondent) {
		korrespondent = korrespondent.replace(/^\s*von\s+/, '');
		var authors = korrespondent.split(" und ");
		for (var i=0; i<authors.length; i++) {
			newItem.creators.push(ZU.cleanAuthor(authors[i], "author"));
		}
	}
	newItem.abstractNote = unterzeile;
	
	var lastline = ZU.xpathText(doc, "//h3");
	if (lastline) {
		var lastlineParts = lastline.split(" vom ");
		if (lastlineParts.length>0) {
			newItem.date = ZU.strToISO(lastlineParts[1]); 
		}
	}

	newItem.publicationTitle = "Le Monde Diplomatique (Deutsch)";
	newItem.url = url; 
	newItem.language = "de";
	
	newItem.attachments.push({
		url: url,
		title: "Snapshot",
		mimeType: "text/html"
	});
	
	newItem.complete();
} 


function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = ZU.xpath(doc, '//ul[@class="hits"]/li/a');
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
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.monde-diplomatique.de/pm/2011/10/14.mondeText1.artikel,a0010.idx,1",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Wir sind der Markt",
				"creators": [
					{
						"firstName": "Heiner",
						"lastName": "Ganßmann",
						"creatorType": "author"
					}
				],
				"date": "2011-10-14",
				"abstractNote": "Spekulation und Alltag",
				"language": "de",
				"libraryCatalog": "Le monde diplomatique",
				"publicationTitle": "Le Monde Diplomatique (Deutsch)",
				"url": "http://www.monde-diplomatique.de/pm/2011/10/14.mondeText1.artikel,a0010.idx,1",
				"attachments": [
					{
						"title": "Snapshot",
						"mimeType": "text/html"
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
		"url": "http://monde-diplomatique.de/artikel/!5337730",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Dreckiger Zement",
				"creators": [
					{
						"firstName": "Anett",
						"lastName": "Keller",
						"creatorType": "author"
					},
					{
						"firstName": "Marianne",
						"lastName": "Klute",
						"creatorType": "author"
					}
				],
				"date": "2016-10-13",
				"abstractNote": "Der Fall Indonesien",
				"language": "de",
				"libraryCatalog": "Le monde diplomatique",
				"publicationTitle": "Le Monde Diplomatique (Deutsch)",
				"url": "http://monde-diplomatique.de/artikel/!5337730",
				"attachments": [
					{
						"title": "Snapshot",
						"mimeType": "text/html"
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
		"url": "http://monde-diplomatique.de/archiv-text?text=globalisierung",
		"items": "multiple"
	}
]
/** END TEST CASES **/