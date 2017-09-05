{
	"translatorID": "9405db4b-be7f-42ab-86ca-430226be9b35",
	"label": "Potsdamer Neueste Nachrichten",
	"creator": "Martin Meyerhoff",
	"target": "^https?://www\\.pnn\\.de",
	"minVersion": "1.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2014-04-06 16:15:15"
}

/*
Potsdamer Neueste Nachrichten Translator 1.1
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

/* 

Test it with:
http://www.pnn.de/
http://www.pnn.de/zeitung/
http://www.pnn.de/zeitung/12.01.2011/
http://www.pnn.de/titelseite/364860/
*/

function detectWeb(doc, url) {	
	var PNN_Article_XPath = ".//div[contains (@class, 'um-article')]/h1"; //only articles have a print button.
	var PNN_Multiple_XPath = "//div[contains(@class, 'um-teaser')]/h2/a"
	
	if (doc.evaluate(PNN_Article_XPath, doc, null, XPathResult.ANY_TYPE, null).iterateNext()  ){ 
		Zotero.debug("newspaperArticle");
		return "newspaperArticle";
	} else if (doc.evaluate(PNN_Multiple_XPath, doc, null, XPathResult.ANY_TYPE, null).iterateNext()  ){ 
		Zotero.debug("multiple");
		return "multiple";
	} 
}

function scrape(doc, url) {
	var newItem = new Zotero.Item("newspaperArticle");
	newItem.url = doc.location.href; 
	
	// Title
	var title_XPath = "//div[contains (@class, 'um-article')]/h1"
	var title = doc.evaluate(title_XPath, doc, null, XPathResult.ANY_TYPE, null).iterateNext().textContent;
	title = title.replace(/\s+|\n/g, ' ');
	newItem.title = title;
	
	// Summary
	var summary_XPath = "//div[contains (@class, 'um-article')]/p[@class='um-first']";
	if (doc.evaluate(summary_XPath, doc, null, XPathResult.ANY_TYPE, null).iterateNext()  ){ 
		var summary = doc.evaluate(summary_XPath, doc, null, XPathResult.ANY_TYPE, null).iterateNext().textContent;
		newItem.abstractNote = summary;
	}
	
	// Date 
	var date_XPath = "//div[contains (@class, 'um-article')]/div[@class='um-metabar']/ul/li[contains(@class, 'um-first')]";
	var date = doc.evaluate(date_XPath, doc, null, XPathResult.ANY_TYPE, null).iterateNext().textContent;
	newItem.date = date.replace(/(\d+)\.(\d+).(\d+)/, '$3-$2-$1');;
	

	// Authors 
	var author_XPath = "//div[contains (@class, 'um-article')]/span[@class='um-author']"; 
	if (doc.evaluate(author_XPath, doc, null, XPathResult.ANY_TYPE, null).iterateNext()  ){ 
		var author = doc.evaluate(author_XPath, doc, null, XPathResult.ANY_TYPE, null).iterateNext().textContent;
		author =author.replace(/^von\s|^\s*|\s*$/g, '');
		author =author.split(/\sund\s|\su\.\s|\,\s/); 
	 	for (var i in author) {
			if (author[i].match(/\s/)) { // only names that contain a space!
				newItem.creators.push(Zotero.Utilities.cleanAuthor(author[i], "author"));
			}
		}
	}
	
	newItem.attachments.push({url:doc.location.href, title:doc.title, mimeType:"text/html"});
	newItem.publicationTitle = "Potsdamer Neueste Nachrichten"

	// section
	var section_XPath = "//div[@class='um-mainnav']/ul/li[@class='um-selected']/a";
	if (doc.evaluate(section_XPath, doc, null, XPathResult.ANY_TYPE, null).iterateNext()  ){ 
		var section = doc.evaluate(section_XPath, doc, null, XPathResult.ANY_TYPE, null).iterateNext().textContent;
		newItem.section = section.replace(/^\s*|\s*$/g, '');
	}
	
	newItem.complete();
}



function doWeb(doc, url) {
	var articles = new Array();
	
	if (detectWeb(doc, url) == "multiple") {
		var items = new Object();
		
		var titles = doc.evaluate("//div[contains(@class, 'um-teaser')]/h2/a", doc, null, XPathResult.ANY_TYPE, null);
		
		var next_title;
		while (next_title = titles.iterateNext()) {
			items[next_title.href] = next_title.textContent.replace(/\s+/g, ' ');
		}
		Zotero.selectItems(items, function (items) {
			if (!items) {
				return true;
			}
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
		"url": "http://www.pnn.de/zeitung/12.01.2011/",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://www.pnn.de/titelseite/364752/",
		"items": [
			{
				"itemType": "newspaperArticle",
				"creators": [
					{
						"firstName": "Von K.",
						"lastName": "Christmann",
						"creatorType": "author"
					},
					{
						"firstName": "C.",
						"lastName": "Wermke",
						"creatorType": "author"
					},
					{
						"firstName": "K.",
						"lastName": "Schulze",
						"creatorType": "author"
					},
					{
						"firstName": "M.",
						"lastName": "Matern",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"url": "http://www.pnn.de/titelseite/364752/",
						"title": "Von K. Christmann, C. Wermke, K. Schulze und M. Matern: Dioxin nun auch im Schweinefleisch - Schlagzeilen - pnn.de",
						"mimeType": "text/html"
					}
				],
				"url": "http://www.pnn.de/titelseite/364752/",
				"title": "Von K. Christmann, C. Wermke, K. Schulze und M. Matern: Dioxin nun auch im Schweinefleisch",
				"abstractNote": "Mastbetrieb in Niedersachsen muss notschlachten / Kritik am Krisenmanagement von Ministerin Aigner",
				"date": "2011-01-12",
				"publicationTitle": "Potsdamer Neueste Nachrichten",
				"libraryCatalog": "Potsdamer Neueste Nachrichten",
				"accessDate": "CURRENT_TIMESTAMP",
				"shortTitle": "Von K. Christmann, C. Wermke, K. Schulze und M. Matern"
			}
		]
	}
]
/** END TEST CASES **/