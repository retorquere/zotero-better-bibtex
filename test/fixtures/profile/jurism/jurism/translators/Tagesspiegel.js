{
	"translatorID": "374ac2a5-dd45-461e-bf1f-bf90c2eb7085",
	"label": "Tagesspiegel",
	"creator": "Martin Meyerhoff, Sebastian Karcher",
	"target": "^https?://www\\.tagesspiegel\\.de",
	"minVersion": "2.1.9",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsib",
	"lastUpdated": "2012-10-06 13:16:15"
}

/*
Tagesspiegel Translator
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
	var tspiegel_ArticleTools_XPath = ".//div[@class='hcf-article']";
	var tspiegel_Multiple_XPath = "//*[@id='hcf-wrapper']/div[2]/div[contains(@class, 'hcf-main-col')]/div/ul/li/h2/a|//*[@id='hcf-wrapper']/div[@class='hcf-lower-hp']/div/ul/li/ul/li/a|//ul/li[contains(@class, 'hcf-teaser')]/h2/a";
	
	if (doc.evaluate(tspiegel_ArticleTools_XPath, doc, null, XPathResult.ANY_TYPE, null).iterateNext() ){ 
		Zotero.debug("newspaperArticle");
		return "newspaperArticle";
	} else if (doc.location.href.match(/http\:\/\/www\.tagesspiegel\.de\/suchergebnis\//)){ 
		Zotero.debug("multiple");
		return "multiple";
	} else if (doc.evaluate(tspiegel_Multiple_XPath, doc, null, XPathResult.ANY_TYPE, null).iterateNext() ) {
		Zotero.debug("multiple");
		return "multiple";
	}
}

function scrape(doc, url) {

	var newItem = new Zotero.Item("newspaperArticle");
	newItem.url = doc.location.href; 

	
	// This is for the title!
	
	var title_XPath = "//h1/span[@class='hcf-headline']";
	var title = ZU.xpathText(doc, title_XPath);
	newItem.title = title;
	
	// Date
	var date_XPath = "//span[contains(@class, 'date hcf')]";
	var date= ZU.xpathText(doc, date_XPath);
	//Today's articles just have a time. For these, we set the date to "today", which Zotero will interpret correctly
	if (date.search(/\d{2}\.\d{4}/)==-1) date = "today";
	newItem.date= date.replace(/(.{10,10}).*/, '$1');
	
	// Summary 
	
	var summary_XPath = ".//p[@class='hcf-teaser']"
		var summary = ZU.xpathText(doc,summary_XPath);	
		newItem.abstractNote = Zotero.Utilities.trim(summary); 
	
	// Publication Title
	newItem.publicationTitle = "Der Tagesspiegel Online";
	
	// Authors 
	var author_XPath = "//span[contains(@class, 'hcf-author')]";
		var author  = ZU.xpathText(doc, author_XPath);
		Zotero.debug(author);
		if (author != null){
		author = author.replace(/^[Vv]on\s|Kommentar\svon\s/g, '');
		author = author.split(/,\s|\sund\s/);
		for (var i in author) {
			newItem.creators.push(Zotero.Utilities.cleanAuthor(author[i], "author"));
		}
		}
	// Printurl (add "v_print," before the article ID and "?p=" at the end) 
	var printurl = doc.location.href.replace(/^(.*\/)(\d+.html$)/, '$1v_print,$2?p=');
	newItem.attachments.push({url:printurl, title:doc.title, mimeType:"text/html"}); 
	
	// Tags
	var tags_XPath = "//meta[@name='keywords']";
	var tags = ZU.xpathText(doc, tags_XPath);
	if (tags) var tags= tags.split(","); // this seems to work even if there's no |
	for (var i in tags) {
		tags[i] = tags[i].replace(/^\s*|\s*$/g, '') // remove whitespace around the tags
		newItem.tags.push(tags[i]);
	} 
	newItem.language = "de-DE";
	newItem.ISSN = "1865-2263";
	newItem.complete();
	
}
	

function doWeb(doc, url) {
	var articles = new Array();
	if (detectWeb(doc, url) == "multiple") {
		var items = new Object();
		
		var titles = doc.evaluate("//*[@id='hcf-wrapper']/div[2]/div[contains(@class, 'hcf-main-col')]/div/ul/li/h2/a|//*[@id='hcf-wrapper']/div[@class='hcf-lower-hp']/div/ul/li/ul/li/a|//ul/li[contains(@class, 'hcf-teaser')]/h2/a", doc, null, XPathResult.ANY_TYPE, null);
		
		var next_title;
		while (next_title = titles.iterateNext()) {
			// The following conditions excludes the image galleries and videos.
			if (next_title.href.match(/http\:\/\/www\.tagesspiegel\.de\/(?!mediacenter)/)) { 
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
			Zotero.Utilities.processDocuments(articles, scrape, function () {
				Zotero.done();
			});
			Zotero.wait();	
		});
	}
	else {
		scrape(doc, url);
	}
}	
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.tagesspiegel.de/",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://www.tagesspiegel.de/meinung/ddr-drama-der-turm-ich-leb-mein-leben/7216226.html",
		"items": [
			{
				"itemType": "newspaperArticle",
				"creators": [
					{
						"firstName": "Robert",
						"lastName": "Ide",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "DDR-Drama \"Der Turm\": Ich leb’ mein Leben - Meinung - Tagesspiegel",
						"mimeType": "text/html"
					}
				],
				"url": "http://www.tagesspiegel.de/meinung/ddr-drama-der-turm-ich-leb-mein-leben/7216226.html",
				"title": "Ich leb’ mein Leben",
				"date": "05.10.2012",
				"abstractNote": "Das DDR-Familiendrama \"Der Turm\" hat zwei Abende lang Deutschlands Fernsehzuschauer bewegt, die Gedanken flogen zurück in die gemeinsam geteilte Vergangenheit. 17 Millionen Menschen sind irgendwann einmal mit der Frage konfrontiert worden: Dafür oder dagegen? Verrat an Freunden oder der eigenen Karriere?",
				"publicationTitle": "Der Tagesspiegel Online",
				"language": "de-DE",
				"ISSN": "1865-2263",
				"libraryCatalog": "Tagesspiegel",
				"accessDate": "CURRENT_TIMESTAMP"
			}
		]
	}
]
/** END TEST CASES **/