{
	"translatorID": "f61beec2-1431-4218-a9d3-68063ede6ecd",
	"label": "Welt Online",
	"creator": "Martin Meyerhoff",
	"target": "^https?://www\\.welt\\.de",
	"minVersion": "2.1.9",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2014-04-04 10:02:57"
}

/*
Welt Online Translator
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
"Multiple" doesn't work on the search pages, because that's another host. However, every other page does it:
http://www.welt.de/themen/Fukushima/
http://www.welt.de/wirtschaft/
http://www.welt.de/wirtschaft/article12962920/Krankenkassen-werfen-Aerzten-Gewinnstreben-vor.html
*/

function detectWeb(doc, url) {
	var welt_article_XPath = '//div[@id="main"]//h1';
	var welt_multiple_XPath = "//h4[contains(@class, 'headline')]/a";
	//Z.debug(ZU.xpathText(doc, welt_multiple_XPath))
	if (ZU.xpathText(doc, welt_article_XPath) ){ 
		Zotero.debug("newspaperArticle");
		return "newspaperArticle";
	} 	else if (ZU.xpathText(doc, welt_multiple_XPath)){ 
		Zotero.debug("multiple");
		return "multiple"; 
	} 
}

function scrape(doc, url) {
	var newItem = new Zotero.Item("newspaperArticle");
	newItem.url = doc.location.href; 

	
	// This is for the title! Welt's titles are ok without their "supertitles". They seem to convey - nothing. 
	
	var xPath = ".//meta[contains(@property, 'og:title')]";
	var title = doc.evaluate(xPath, doc, null, XPathResult.ANY_TYPE, null).iterateNext().content;
	newItem.title = title;

	// Authors
	
	var xPath = ".//meta[contains(@name, 'author')]/@content";
	var author= ZU.xpathText(doc, xPath);
	if (author == "WELT ONLINE") {
		author = "";
	}
	if (author){ 
		author = author.split(/\sund\s|\su\.\s|\,\s|\&|Und/)
		for (var i in author) {
			if (author[i].match(/\s/)) { // only names that contain a space!
				author[i] = author[i].replace(/^\s*|\s*$/g, '');
				newItem.creators.push(Zotero.Utilities.cleanAuthor(author[i], "author"));
			}
		}	
	}
	
	// Summary
	
	var xPath = '//meta[contains(@name, "description")]';
	var summary = doc.evaluate(xPath, doc, null, XPathResult.ANY_TYPE, null).iterateNext().content;
	newItem.abstractNote = summary;

	// Tags
	var xPath = '//meta[contains(@name, "keywords")]/@content';
	var tags= ZU.xpathText(doc, xPath);
	Z.debug(tags)
	if (tags){
	tags = tags.split(/,\s/);
		if (tags[0] != "" ) {
			for (var i in tags) {
				tags[i] = tags[i].replace(/^\s*|\s*$/g, '');
				newItem.tags.push(tags[i]);
			}
		}
	}
	// Date 
	var xPath = "//div[@id='main']/div/span[contains(@class, 'time')][last()]";
	var date= ZU.xpathText(doc, xPath);
	if(date && date.match(/\d{2}\.\d{2}\.\d{2}/)) newItem.date = date;
	else newItem.date = ZU.xpathText(doc, '//meta[@name="date"]/@content').replace(/T.+/, "");

	// Publikation (I can only distinguish some articles from Welt am Sonntag by their URL, otherwise its all mishmash)
	if (doc.location.href.match(/.*wams_print.*/)) {
		newItem.publicationTitle = "Welt am Sonntag";
	} else {
		newItem.publicationTitle = "Welt Online";
	}
	
	// Section
	var xPath = ".//*[@id='mainNavigationMenu']/ul/li[contains(@class, 'active')]/a";
	var section= ZU.xpathText(doc, xPath);
	newItem.section = section;

	// Attachment
	newItem.attachments.push({url:doc.location.href+"?print=true", title:doc.title, mimeType:"text/html"});

	newItem.complete()
}


function doWeb(doc, url) {
	var articles = new Array();
	
	if (detectWeb(doc, url) == "multiple") {
		var items = new Object();
		
		var titles = doc.evaluate("//h4[contains(@class, 'headline')]/a", doc, null, XPathResult.ANY_TYPE, null);
		
		var next_title;
		while (next_title = titles.iterateNext()) {
			items[next_title.href] = next_title.textContent;
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
	} else {
		scrape(doc, url);
	}
}	
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.welt.de/wirtschaft/article12962920/Krankenkassen-werfen-Aerzten-Gewinnstreben-vor.html",
		"items": [
			{
				"itemType": "newspaperArticle",
				"creators": [
					{
						"firstName": "Philipp",
						"lastName": "Neumann",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [
					"Doris;Kliniken [ks];Krankenkassen [ks]",
					"Pfeiffer"
				],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Gesundheit : Krankenkassen werfen Ärzten Gewinnstreben vor - Nachrichten Wirtschaft - DIE WELT",
						"mimeType": "text/html"
					}
				],
				"url": "http://www.welt.de/wirtschaft/article12962920/Krankenkassen-werfen-Aerzten-Gewinnstreben-vor.html",
				"title": "Krankenkassen werfen Ärzten Gewinnstreben vor",
				"abstractNote": "Die Chefin des Krankenkassenverbands Doris Pfeiffer fordert den Gesundheitsminister auf, überschüssiges Geld im Gesundheitsfonds zurückzugegeben.",
				"date": "2011-03-26",
				"publicationTitle": "Welt Online",
				"section": "Wirtschaft",
				"libraryCatalog": "Welt Online"
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.welt.de/wirtschaft/",
		"items": "multiple"
	}
]
/** END TEST CASES **/