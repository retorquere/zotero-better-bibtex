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
	"lastUpdated": "2017-06-24 17:08:45"
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
	var spiegel_article_XPath = '//h2[contains(@class, "article-title") or contains(@class, "dig-artikel")]';
	if ( url.indexOf('/thema/')>-1 || url.indexOf('/suche/')>-1 || url.indexOf('/international/search/')>-1 || url.indexOf('/international/topic/')>-1 ) { 
		return "multiple";
	} else if (ZU.xpathText(doc, spiegel_article_XPath)) {
		//the print edition is a magazine. Since the online edition is updated constantly it
		//makes sense to treat it like a newspaper.
		if (url.indexOf('/print/')>-1) {
			return "magazineArticle";
		} else { 
			return "newspaperArticle";
		}
	}
}

function scrape(doc, url) {
	var newItem = new Zotero.Item(detectWeb(doc, url));

	newItem.url = url; 

	// This is for the title 
	newItem.title = ZU.xpathText(doc, '//h2[contains(@class, "article-title") or contains(@class, "dig-artikel")]/span', null, ': ')
		|| ZU.xpathText(doc, '//meta[@property="og:title"]/@content') 
		|| ZU.xpathText(doc, '//title');
	newItem.title = ZU.trimInternal(newItem.title);


	// Tags
	var tags = ZU.xpath(doc, '//div[contains(@class, "article-topic-box")]//li/b/a');
	if (tags.length>0) {
		for (var i=0; i<tags.length; i++) {
			newItem.tags.push(tags[i].textContent);
		}
	}
	
	// Author
	var author = ZU.xpathText(doc, '//p[contains(@class, "author")]') // Most of the time, the author has its own tag. Easy Case, really.
		|| ZU.xpathText(doc, '//div[contains(@class, "dig-autoren")]')
		|| ZU.xpathText(doc, '//span[contains(@class, "author")]')
		|| ZU.xpathText(doc, '//*[@id="spIntroTeaser"]/strong/i'); // Sometimes, though, the author is in italics in the teaser.
	if (author) {
		author = author.replace(/^\s*By\s|^\s*Von\s/, '');
		author = author.replace(/^\s*Ein.+? von\s|\s*$/, '');//e.g "Ein Kommentar von Peter Müller, Leipzig"
		author = author.replace(/^\s*Aus.+?berichtet\s*/, "");
		author = author.replace(/^\s*Interview (Conducted )?by /, '');// e.g. Interview Conducted by Klaus Brinkbäumer
		author = author.replace(/,\s\S*$/, ''); //e.g "Ein Kommentar von Peter Müller, Leipzig"
		author = author.replace(/\sin\s\S*(,\s\S*)?$/g, ""); //e.g. "By Susanne Beyer in Kaliningrad, Russia"
		author = author.split(/\sund\s|\su\.\s|\,\s|\sand\s/); //e.g. By Jörg Diehl, Hubert Gude, Barbara Schmid and Fidelius Schmid
		for (var i in author) {
			newItem.creators.push(Zotero.Utilities.cleanAuthor(author[i], "author", author[i].indexOf(',')>-1));
		}
	}
	
	// Section
	newItem.section = ZU.xpathText(doc, '//a[@class="current-channel-name"]');
	
	// attachement
	if (url.match(/^http\:\/\/www\.spiegel\.de\/spiegel/)){
		var printurl_xPath = ".//div[contains(@class, 'article-function-box')]/ul/li[1]/a/@href";
		var printurl = ZU.xpathText(doc, printurl_xPath);
		//Zotero.debug(printurl);
		newItem.attachments.push({url:printurl, title:"Full Text PDF", mimeType:"application/pdf"});
	} else { 
		// Attachment. Difficult. They want something inserted into the URL.
		var printurl = url;
		printurl = printurl.replace(/(\d+\,\d+\.html.*$)/, 'druck-$1'); //done!
		newItem.attachments.push({url:printurl, title:"Snapshot", mimeType:"text/html"});
	}
	
	// Ausgabe/Volume für Print
	if (ZU.xpathText(doc, '//div[@class="spiegel-magazin-title asset-title"]') && newItem.itemType == "magazineArticle"){
		newItem.volume = ZU.xpathText(doc, '//div[@class="spiegel-magazin-title asset-title"]').match(/(\d+)\/\d{4}/)[1];
	}
	
	// Summary
	var summary = ZU.xpathText(doc, './/p[@class="article-intro"]')
	if (summary) { 
		newItem.abstractNote = summary.trim();
	}
	
	// Date
	var date = ZU.xpathText(doc, './/h5[contains(@id, "ShortDate")]')
		|| ZU.xpathText(doc, '//meta[@name="date"]/@content')
		|| ZU.xpathText(doc, '//div[@id="spShortDate"]');
	if (date) {
		date = date.replace(/(\d\d)\/(\d\d)\/(\d\d\d\d)/, "$3-$1-$2");
		date = date.replace(/(\d\d)\.(\d\d)\.(\d\d\d\d)/, "$3-$2-$1");
		date = date.replace(/T.+/,""); // e.g. date = "2014-10-20T12:10:00+0200"
		newItem.date = date.trim();
	}
	
	// publicationTitle
	if (url.indexOf('http://www.spiegel.de/spiegel')>-1) {
		newItem.publicationTitle = "Der Spiegel";
	} else { 
		newItem.publicationTitle = "Spiegel Online";
	}

	newItem.complete()
}

function doWeb(doc, url) {

	if (detectWeb(doc, url) == "multiple") {
		var items = new Object();
		
		 if (url.match(/^https?\:\/\/www\.spiegel\.de\/(suche|international\/search)/)){ 
			var titles = doc.evaluate(".//div[@class='search-teaser']/a", doc, null, XPathResult.ANY_TYPE, null);
		} else  if (url.match(/^https?\:\/\/www\.spiegel\.de\/(thema\/|international\/topic)/)){ 
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
			if (!items) return true;

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
				"title": "CDU-Parteitag: Partei im Koma",
				"creators": [
					{
						"firstName": "Peter",
						"lastName": "Müller",
						"creatorType": "author"
					}
				],
				"date": "2011-11-15",
				"abstractNote": "Die CDU feiert sich in Leipzig selbst, doch in Wahrheit befindet sie sich in einem traurigen Zustand: Die Partei ist in ein kollektives Koma gefallen, politische Debatten finden kaum noch statt. Hauptverantwortlich dafür ist Angela Merkel.",
				"libraryCatalog": "Spiegel Online",
				"publicationTitle": "Spiegel Online",
				"section": "Politik",
				"shortTitle": "CDU-Parteitag",
				"url": "http://www.spiegel.de/politik/deutschland/cdu-parteitag-partei-im-koma-a-797954.html",
				"attachments": [
					{
						"title": "Snapshot",
						"mimeType": "text/html"
					}
				],
				"tags": [
					"Betreuungsgeld",
					"CDU",
					"Eurokrise",
					"Merkels schwarz-gelbe Regierung 2009-2013",
					"Mindestlohn"
				],
				"notes": [],
				"seeAlso": []
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
				"title": "WIRTSCHAFTSPOLITIK: VEB Energiewende",
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
				"date": "2012-04-07",
				"libraryCatalog": "Spiegel Online",
				"publicationTitle": "Der Spiegel",
				"shortTitle": "WIRTSCHAFTSPOLITIK",
				"url": "http://www.spiegel.de/spiegel/print/d-84789653.html",
				"volume": "15",
				"attachments": [
					{
						"title": "Full Text PDF",
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
		"url": "http://www.spiegel.de/thema/atomkraftwerke/",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://www.spiegel.de/international/europe/madame-non-and-monsieur-duracell-german-french-relations-on-the-rocks-a-700530.html",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Madame Non and Monsieur Duracell: German-French Relations On the Rocks",
				"creators": [],
				"date": "2010-06-14",
				"abstractNote": "For decades, the German-French relationship has been the most important one in the European Union. These days, however, Chancellor Angela Merkel and President Nicolas Sarkozy can hardly stand each other. Why can't they just get along?",
				"libraryCatalog": "Spiegel Online",
				"publicationTitle": "Spiegel Online",
				"section": "International",
				"shortTitle": "Madame Non and Monsieur Duracell",
				"url": "http://www.spiegel.de/international/europe/madame-non-and-monsieur-duracell-german-french-relations-on-the-rocks-a-700530.html",
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
		"url": "http://www.spiegel.de/einestages/kinder-vom-kamper-see-grab-unter-wasser-a-1021273.html",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Kinder vom Kamper See: Das Grab im Wasser",
				"creators": [
					{
						"firstName": "Matthias",
						"lastName": "Kneip",
						"creatorType": "author"
					}
				],
				"date": "2015-03-03",
				"abstractNote": "Am 5. März 1945 stürzte ein Flugzeug in den Kamper See. An Bord: fast 80 deutsche Kinder auf der Flucht vor der Roten Armee. Eine Initiative will nun ihre Leichen vom Grund des Sees bergen.",
				"libraryCatalog": "Spiegel Online",
				"publicationTitle": "Spiegel Online",
				"section": "einestages",
				"shortTitle": "Kinder vom Kamper See",
				"url": "http://www.spiegel.de/einestages/kinder-vom-kamper-see-grab-unter-wasser-a-1021273.html",
				"attachments": [
					{
						"title": "Snapshot",
						"mimeType": "text/html"
					}
				],
				"tags": [
					"Flucht und Vertreibung",
					"Flugzeugunglücke",
					"Weltkriege",
					"Zweiter Weltkrieg"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/