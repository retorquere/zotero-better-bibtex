{
	"translatorID": "eef50507-c756-4081-86fd-700ae4ebf22e",
	"label": "Spiegel Online",
	"creator": "Martin Meyerhoff",
	"target": "^https?://www\\.spiegel\\.de/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2014-04-04 10:16:45"
}

/*
Spiegel Online Translator
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
Test with the following URLs:
http://www.spiegel.de/suche/index.html?suchbegriff=AKW
http://www.spiegel.de/international/search/index.html?suchbegriff=Crisis
http://www.spiegel.de/international/topic/german_french_relations/
http://www.spiegel.de/international/europe/0,1518,700530,00.html
*/

function detectWeb(doc, url) {

	var spiegel_article_XPath = './/div[@class="column-both"]/h2[@class="article-title"]|.//div[@class="column-wide"]/h2[contains(@class, "headline")]';
	//the print edition is a magazine. Since the online edition is updated constantly it
	//makes sense to treat it like a newspaper.
	if (url.match(/\/print\//) && ZU.xpathText(doc, spiegel_article_XPath)){
		return "magazineArticle";
	}
	else if (doc.evaluate(spiegel_article_XPath, doc, null, XPathResult.ANY_TYPE, null).iterateNext() ){ 
		//Zotero.debug("newspaperArticle");
		return "newspaperArticle";
	} else if (doc.location.href.match(/^https?\:\/\/www\.spiegel\.de\/thema/)){ 
		//Zotero.debug("multiple");
		return "multiple";
	}  else if (doc.location.href.match(/^https?\:\/\/www\.spiegel\.de\/suche/)){ 
		//Zotero.debug("multiple");
		return "multiple";
	}  else if (doc.location.href.match(/^https?\:\/\/www\.spiegel\.de\/international\/search/)){ 
		//Zotero.debug("multiple");
		return "multiple";
	} else if (doc.location.href.match(/^https?\:\/\/www\.spiegel\.de\/international\/topic/)){ 
		//Zotero.debug("multiple");
		return "multiple";
	} 
}

function scrape(doc, url) {
	
 	if (detectWeb(doc, url)=="magazineArticle") {
 			var newItem = new Zotero.Item("magazineArticle");
 	}
 	else{
		var newItem = new Zotero.Item("newspaperArticle");
 	}
	newItem.url = doc.location.href; 

	// This is for the title 
	
	var title_xPath = '//div[@class="column-wide"]/h2[contains(@class, "headline")]';
	if (doc.evaluate(title_xPath, doc, null, XPathResult.ANY_TYPE, null).iterateNext() ){ 
		var title = doc.evaluate(title_xPath, doc, null, XPathResult.ANY_TYPE, null).iterateNext().textContent;
		newItem.title = title;
	} else if (ZU.xpathText(doc, '//div[@id="spArticleColumn"]/h2')) {
		newItem.title = ZU.xpathText(doc, '//div[@id="spArticleColumn"]/h2');
	} else {
		var title = doc.evaluate('//title', doc, null, XPathResult.ANY_TYPE, null).iterateNext().textContent;
		title = title.split(" - ")[0];
		newItem.title = title;
	}

	// Tags
	var tags_xPath = '//meta[contains(@name, "keywords")]';
	var tags= doc.evaluate(tags_xPath, doc, null, XPathResult.ANY_TYPE, null).iterateNext().content;
	tags = tags.split(/,/);
	tags = tags.slice(5); // The first six 5 Tags are generic or section info.
	if (tags[0] != "" ) {
		for (var i in tags) {
			tags[i] = tags[i].replace(/^\s*|\s*$/g, '');
			newItem.tags.push(tags[i]);
		}
	}
	
	// Author
	var author_XPath1 = ".//p[contains(@class, 'author')]"; // Most of the time, the author has its own tag. Easy Case, really.
	var author_XPath2 =  ".//*[@id='spIntroTeaser']/strong/i"; // Sometimes, though, the author is in italics in the teaser.
	if (doc.evaluate(author_XPath1, doc, null, XPathResult.ANY_TYPE, null).iterateNext()) {
		var author = doc.evaluate(author_XPath1, doc, null, XPathResult.ANY_TYPE, null).iterateNext().textContent;
		//Zotero.debug(author);	 
	} else if  (doc.evaluate(author_XPath2, doc, null, XPathResult.ANY_TYPE, null).iterateNext()) {
		var author = doc.evaluate(author_XPath2, doc, null, XPathResult.ANY_TYPE, null).iterateNext().textContent;
		//Zotero.debug(author);	 
	} else {
		author = "";
	}
	author = author.replace(/^\s*By\s|^\s*(Ein.+?)?[Vv]on\s|\s*$/g, ''); // remove whitespace around the author and the "Von "at the beginning
	if (doc.location.href.match(/^http\:\/\/www\.spiegel\.de\/spiegel/)){ // Spiegel Online and the Spiegel Archive have different formatting for the author line
		author = author.split(/\sund\s|\su\.\s|\;\s|\sand\s/); 
		for (var i in author) {
			author[i] = author[i].replace(/(.*),\s(.*)/, '$2 $1');
		}
	} else {
	
		author = author.replace(/(,\s|in\s)\S*$|^\s*Aus.+?berichtet\s*/g, ""); //remove ", location" or "in location"
		author = author.split(/\sund\s|\su\.\s|\,\s|\sand\s/); 
	}
	for (var i in author) {
		if (author[i].match(/\s/)) { // only names that contain a space!
			newItem.creators.push(Zotero.Utilities.cleanAuthor(author[i], "author"));
		}
	}
	
	// Section
	var section_xPath = ".//ul[contains(@id, 'spChannel')]/li/ul/li/a[contains(@class, 'spActive')]";
	 if (doc.evaluate(section_xPath, doc, null, XPathResult.ANY_TYPE, null).iterateNext() ){ 
		var section = doc.evaluate(section_xPath, doc, null, XPathResult.ANY_TYPE, null).iterateNext().textContent;
		newItem.section = section;
	} 

	if (doc.location.href.match(/^http\:\/\/www\.spiegel\.de\/spiegel/)){
		var printurl_xPath = ".//div[contains(@class, 'article-function-box')]/ul/li[1]/a/@href";
		var printurl = ZU.xpathText(doc, printurl_xPath);
		//Zotero.debug(printurl);
		newItem.attachments.push({url:printurl, title:doc.title, mimeType:"application/pdf"});
	} else { 
		// Attachment. Difficult. They want something inserted into the URL.
		var printurl = doc.location.href;
		printurl = printurl.replace(/(\d+\,\d+\.html.*$)/, 'druck-$1'); //done!
		newItem.attachments.push({url:printurl, title:doc.title, mimeType:"text/html"});
	}
	
	//Ausgabe/Volume für Print
	if (ZU.xpathText(doc, '//div[@class="spiegel-magazin-title asset-title"]') && newItem.itemType == "magazineArticle"){
		newItem.volume = ZU.xpathText(doc, '//div[@class="spiegel-magazin-title asset-title"]').match(/(\d+)\/\d{4}/)[1];
	}
	
	// Summary
	var summary_xPath = ".//p[@class='article-intro']";
	if (doc.evaluate(summary_xPath, doc, null, XPathResult.ANY_TYPE, null).iterateNext() ){ 
		var summary= doc.evaluate(summary_xPath, doc, null, XPathResult.ANY_TYPE, null).iterateNext().textContent;
		newItem.abstractNote = Zotero.Utilities.trim(summary);
	}
	
	// Date - sometimes xpath1 doesn't yield anything. Fortunately, there's another possibility...
	var date1_xPath = ".//h5[contains(@id, 'ShortDate')]"; 
	var date2_xPath = "//meta[@name='date']";
	var date3_xPath = "//div[@id='spShortDate']"
	if (doc.evaluate(date1_xPath, doc, null, XPathResult.ANY_TYPE, null).iterateNext() ){ 
		var date= doc.evaluate(date1_xPath, doc, null, XPathResult.ANY_TYPE, null).iterateNext().textContent;
		if (date.match('/')) {
			date = date.replace(/(\d\d)\/(\d\d)\/(\d\d\d\d)/, "$2.$1.$3").replace(/T.+/,"");
		}
	} else if (doc.evaluate(date2_xPath, doc, null, XPathResult.ANY_TYPE, null).iterateNext() ){ 
		var date= doc.evaluate(date2_xPath, doc, null, XPathResult.ANY_TYPE, null).iterateNext().content;
		date=date.replace(/(\d\d\d\d)-(\d\d)-(\d\d)/, '$3.$2.$1').replace(/T.+/,"");
	} else	if (doc.evaluate(date3_xPath, doc, null, XPathResult.ANY_TYPE, null).iterateNext() ){ 
		var date= doc.evaluate(date3_xPath, doc, null, XPathResult.ANY_TYPE, null).iterateNext().textContent;
	}
	
	newItem.date = Zotero.Utilities.trim(date);
	
	if (doc.location.href.match(/^http\:\/\/www\.spiegel\.de\/spiegel/)){
		newItem.publicationTitle = "Der Spiegel";
	}else { 
		newItem.publicationTitle = "Spiegel Online";
	}
	

	newItem.complete()
}

function doWeb(doc, url) {

	if (detectWeb(doc, url) == "multiple") {
		var items = new Object();
		
		 if (doc.location.href.match(/^https?\:\/\/www\.spiegel\.de\/(suche|international\/search)/)){ 
			var titles = doc.evaluate(".//div[@class='search-teaser']/a", doc, null, XPathResult.ANY_TYPE, null);
		} else  if (doc.location.href.match(/^https?\:\/\/www\.spiegel\.de\/(thema\/|international\/topic)/)){ 
			var titles = doc.evaluate(".//div[contains(@class, 'teaser')]/h2/a", doc, null, XPathResult.ANY_TYPE, null);
		} 
	
		var next_title;
		while (next_title = titles.iterateNext()) {
			//The search searches also manager-magazin.de, which won't work
			if (next_title.textContent != "mehr..."  && next_title.href.match(/^https?:\/\/www\.spiegel\.de\//) ) { 
				items[next_title.href] = Zotero.Utilities.trim(next_title.textContent);
			}
		}

		Zotero.selectItems(items, function(items) {
			if(!items) return true;

			var articles = new Array();
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
		"url": "http://www.spiegel.de/politik/deutschland/cdu-parteitag-partei-im-koma-a-797954.html",
		"items": [
			{
				"itemType": "newspaperArticle",
				"creators": [
					{
						"firstName": "Peter",
						"lastName": "Müller",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [
					"Mindestlohn",
					"Euro-Krise",
					"Betreuungsgeld"
				],
				"seeAlso": [],
				"attachments": [
					{
						"title": "CDU-Parteitag: Partei im Koma - SPIEGEL ONLINE",
						"mimeType": "text/html"
					}
				],
				"url": "http://www.spiegel.de/politik/deutschland/cdu-parteitag-partei-im-koma-a-797954.html",
				"title": "CDU-Parteitag: Partei im Koma",
				"abstractNote": "Die CDU feiert sich in Leipzig selbst, doch in Wahrheit befindet sie sich in einem traurigen Zustand: Die Partei ist in ein kollektives Koma gefallen, politische Debatten finden kaum noch statt. Hauptverantwortlich dafür ist Angela Merkel.",
				"date": "15.11.2011",
				"publicationTitle": "Spiegel Online",
				"libraryCatalog": "Spiegel Online",
				"accessDate": "CURRENT_TIMESTAMP",
				"shortTitle": "CDU-Parteitag"
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.spiegel.de/international/topic/german_french_relations/",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://www.spiegel.de/suche/index.html?suchbegriff=AKW",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://www.spiegel.de/international/search/index.html?suchbegriff=Crisis",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://www.spiegel.de/spiegel/print/d-84789653.html",
		"items": [
			{
				"itemType": "magazineArticle",
				"creators": [
					{
						"firstName": "Alexander",
						"lastName": "Neubacher",
						"creatorType": "author"
					},
					{
						"firstName": "Conny",
						"lastName": "Neumann",
						"creatorType": "author"
					},
					{
						"firstName": "Steffen",
						"lastName": "Winter",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "DER SPIEGEL 15/2012 - VEB Energiewende",
						"mimeType": "application/pdf"
					}
				],
				"url": "http://www.spiegel.de/spiegel/print/d-84789653.html",
				"title": "VEB Energiewende",
				"volume": "15",
				"date": "07.04.2012",
				"publicationTitle": "Der Spiegel",
				"libraryCatalog": "Spiegel Online"
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.spiegel.de/thema/atomkraftwerke/",
		"items": "multiple"
	}
]
/** END TEST CASES **/