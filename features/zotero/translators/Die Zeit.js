{
	"translatorID": "312bbb0e-bfb6-4563-a33c-085445d391ed",
	"label": "Die Zeit",
	"creator": "Martin Meyerhoff",
	"target": "^https?://www\\.zeit\\.de/",
	"minVersion": "1.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2014-04-03 16:49:40"
}

/*
Die Zeit Translator
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
This translator works only partially, because zeit.de uses some strange javascript that makes 
processDocuments return an error. If I just call scrape(doc, url) on a single document, it works. 
The way the translator is programmed now, it only works if JavaScript is turned off in the browser.

Try it out here:
http://www.zeit.de/wirtschaft/2011-03/schnappauf-ruecktritt-stuttgart
http://www.zeit.de/online/2009/12/arbeitsrecht-urlaub
http://www.zeit.de/suche/index?q=Krise
http://www.zeit.de/2009/11/
*/

function detectWeb(doc, url) {

	var Zeit_ArticleTools_XPath = ".//*[@id='informatives']/ul[@class='tools']/li";
	var Zeit_Archive_XPath = "//h4/a|//h2/a";
	
	if (doc.evaluate(Zeit_ArticleTools_XPath, doc, null, XPathResult.ANY_TYPE, null).iterateNext() ){ 
		Zotero.debug("newspaperArticle");
		return "newspaperArticle";
	} else if (doc.evaluate(Zeit_Archive_XPath, doc, null, XPathResult.ANY_TYPE, null).iterateNext() ){ 
		Zotero.debug("multiple");
		return "multiple";
	}
}
function scrape(doc, url) {

	var newItem = new Zotero.Item("newspaperArticle");
	newItem.url = doc.location.href; 

	
	// This is for the title!
	
	var title_XPath = '//title'
	var title = ZU.xpathText(doc, title_XPath);
	newItem.title = Zotero.Utilities.trim(title.split("|")[0]);
	
	
	// Now for the Author

	var author_XPath = '//li[contains(@class, "author first")]'; // I can't get the span selection to work. Help is appreciated.
		var author  = ZU.xpathText(doc, author_XPath);
		if (author !=null){
	author = author.replace(/^\s*Von\s|\s*$/g, ''); // remove whitespace around the author and the "Von "at the beginning
	var author = author.split(" | "); // this seems to work even if there's no |
	for (var i in author) {
				newItem.creators.push(Zotero.Utilities.cleanAuthor(author[i], "author"));
	}}
	
	// Now for the Tags

	var tags_XPath = '//li[contains(@class, "tags")]'; // I can't get the span selection to work. Help is appreciated.
	var tags = ZU.xpathText(doc, tags_XPath);
	if (tags!=null){
		tags = tags.replace(/^\s*Schlagworte\s|\s*$/g, ''); // remove whitespace around the author and the "Von "at the beginning
		var tags= tags.split("|"); // this seems to work even if there's no |
		for (var i in tags) {
			tags[i] = tags[i].replace(/^\s*|\s*$/g, '') // remove whitespace around the tags
			newItem.tags.push(tags[i]);
		} 	
	}

	// Date
	var date_XPath = '//meta[contains(@name, "dats")]';
	var date2_XPath = '//span[@class="articlemeta-datetime"]';	
	if (doc.evaluate(date_XPath, doc, null, XPathResult.ANY_TYPE, null).iterateNext() ){ 
		var date = doc.evaluate(date_XPath, doc, null, XPathResult.ANY_TYPE, null).iterateNext().content;
		date = date.split("T")[0];
		newItem.date = date;
	} else if (doc.evaluate(date2_XPath, doc, null, XPathResult.ANY_TYPE, null).iterateNext() ){ 
		var date = ZU.xpathText(doc, date2_XPath)
		if (date) newItem.date = date.replace(/\d{1,2}:\d{2}\sUhr/, "").trim();
	}

	
	// Summary
	
	var summary_XPath = ".//p[@class='excerpt']"
	if (doc.evaluate(summary_XPath, doc, null, XPathResult.ANY_TYPE, null).iterateNext() ){
		var summary = ZU.xpathText(doc, summary_XPath);	
		newItem.abstractNote = Zotero.Utilities.trim(summary); 
	}
	// Produkt (Zeit, Zeit online etc.)
	product_XPath = '//meta[contains(@name, "zeit::product-name")]'
	if (doc.evaluate(product_XPath, doc, null, XPathResult.ANY_TYPE, null).iterateNext()) {
		var product = ZU.xpath(doc, product_XPath).content();
		newItem.publicationTitle = product;
	} else {
		var product = "Die Zeit";
		newItem.publicationTitle = product;
	}

	
	// Section
	var section_XPath = '//div[@class="cap"]/a'
	var section = ZU.xpathText(doc, section_XPath);
	newItem.section= section; 

	newItem.attachments.push({url:doc.location.href+"?page=all&print=true", title:doc.title, mimeType:"text/html"}); 
	newItem.complete()
				

}

function doWeb(doc, url) {
	var articles = new Array();
	
	if (detectWeb(doc, url) == "multiple") {
		var items = new Object();
		
		var titles = doc.evaluate("//h4/a|//h2/a", doc, null, XPathResult.ANY_TYPE, null);
		
		var next_title;
		while (next_title = titles.iterateNext()) {
			if (next_title.textContent != '') {
			items[next_title.href] = next_title.textContent;
			}
		}
		Zotero.selectItems(items, function (items) {
			if (!items) {
				return true;
			}
			for (var i in items) {
				articles.push(i);
			}
			Zotero.Utilities.processDocuments(articles, scrape);
		});
	} 
	 else {
		scrape(doc, url);
	}
}	/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.zeit.de/politik/ausland/2011-09/libyen-bani-walid",
		"items": [
			{
				"itemType": "newspaperArticle",
				"creators": [],
				"notes": [],
				"tags": [
					"Muammar al-Gaddafi",
					"Muammar al-Gaddafi",
					"Mustafa Abdel Dschalil",
					"Stadt",
					"Bani Walid",
					"Berg"
				],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Libyen: Rebellen bereiten Angriff auf Bani Walid vor | ZEIT ONLINE",
						"mimeType": "text/html"
					}
				],
				"url": "http://www.zeit.de/politik/ausland/2011-09/libyen-bani-walid",
				"title": "Libyen: Rebellen bereiten Angriff auf Bani Walid vor",
				"date": "4. September 2011",
				"abstractNote": "Die von Gadhafi-Anhängern geführte Stadt ist von Rebellentruppen eingekreist. Gespräche über eine friedliche Übergabe sind gescheitert, ein Angriff steht offenbar bevor. von AFP und dpa",
				"publicationTitle": "Die Zeit",
				"section": "Ausland",
				"libraryCatalog": "Die Zeit",
				"accessDate": "CURRENT_TIMESTAMP",
				"shortTitle": "Libyen"
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.zeit.de/2011/36/Interview-Lahm-Rinke",
		"items": [
			{
				"itemType": "newspaperArticle",
				"creators": [],
				"notes": [],
				"tags": [
					"Andreas Ottl",
					"Angela Merkel",
					"Bundesliga",
					"Fußball",
					"Oskar Lafontaine",
					"Philipp Lahm"
				],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Philipp Lahm: \"Hast du elf Freunde?\" | ZEIT ONLINE",
						"mimeType": "text/html"
					}
				],
				"url": "http://www.zeit.de/2011/36/Interview-Lahm-Rinke",
				"title": "Philipp Lahm: \"Hast du elf Freunde?\"",
				"date": "4. September 2011",
				"abstractNote": "Tschechow und Robben, Drama im Flutlicht und Wahrhaftigkeit bei der Arbeit. Der Fußballprofi und Autor Philipp Lahm im Gespräch mit dem Schriftsteller und Fußballer Moritz Rinke von Moritz Müller-Wirth",
				"publicationTitle": "Die Zeit",
				"section": "sport",
				"libraryCatalog": "Die Zeit",
				"shortTitle": "Philipp Lahm"
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.zeit.de/suche/index?q=Krise",
		"items": "multiple"
	}
]
/** END TEST CASES **/