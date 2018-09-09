{
	"translatorID": "374ac2a5-dd45-461e-bf1f-bf90c2eb7085",
	"label": "Tagesspiegel",
	"creator": "Martin Meyerhoff, Sebastian Karcher",
	"target": "^https?://www\\.tagesspiegel\\.de",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2018-01-28 18:07:21"
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
	if (ZU.xpathText(doc, "//meta[@property='og:type']/@content")=="article" ){ 
		return "newspaperArticle";
	} else if (url.indexOf('/suchergebnis/')>-1){ 
		return "multiple";
	} else if (getSearchResults(doc, true)  ) {
		return "multiple";
	}
}


function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = ZU.xpath(doc, '//h2/a[span[contains(@class, "hcf-headline")]]');
	for (var i=0; i<rows.length; i++) {
		var href = rows[i].href;
		var title = ZU.xpathText(rows[i], './span[contains(@class, "hcf-headline")]');
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


function scrape(doc, url) {

	var newItem = new Zotero.Item("newspaperArticle");

	newItem.title = ZU.xpathText(doc, "//meta[@property='og:title']/@content");
	newItem.date = ZU.xpathText(doc, "//time[@itemprop='datePublished']/@datetime");
	newItem.abstractNote = ZU.xpathText(doc, ".//p[@class='hcf-teaser']");
	newItem.section = ZU.xpathText(doc, '//ul[contains(@class, "ts-main-nav-items")]/li[contains(@class, "ts-active-point")]/a');

	// Authors 
	var author  = ZU.xpathText(doc, "//header[contains(@class, 'ts-article-header')]//a[@rel='author']");
	//Zotero.debug(author);
	if (author) {
		author = author.replace(/^[Vv]on\s|Kommentar\svon\s/g, '');
		author = author.split(/,\s|\sund\s/);
		for (var i=0; i<author.length; i++) {
			newItem.creators.push(ZU.cleanAuthor(author[i], "author"));
		}
	}
	
	newItem.url = ZU.xpathText(doc, '//link[@rel="canonical"]/@href') || url;
	// Printurl (add "v_print," before the article ID and "?p=" at the end) 
	var printurl = newItem.url.replace(/^(.*\/)(\d+.html$)/, '$1v_print,$2?p=');
	newItem.attachments.push({
		url: printurl,
		title: "Snapshot",
		mimeType: "text/html"
	}); 
	
	// Tags
	var tags = ZU.xpathText(doc, "//meta[@name='news_keywords']/@content");
	if (tags) var tags= tags.split(","); // this seems to work even if there's no |
	for (let tag of tags) {
		newItem.tags.push(tag.trim());
	}
	newItem.publicationTitle = "Der Tagesspiegel Online";
	newItem.language = "de-DE";
	newItem.ISSN = "1865-2263";
	newItem.complete();
	
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
				"title": "Ich leb’ mein Leben",
				"creators": [
					{
						"firstName": "Robert",
						"lastName": "Ide",
						"creatorType": "author"
					}
				],
				"date": "2012-10-04T22:00:00Z",
				"ISSN": "1865-2263",
				"language": "de-DE",
				"libraryCatalog": "Tagesspiegel",
				"publicationTitle": "Der Tagesspiegel Online",
				"url": "http://www.tagesspiegel.de/meinung/ddr-drama-der-turm-ich-leb-mein-leben/7216226.html",
				"attachments": [
					{
						"title": "Snapshot",
						"mimeType": "text/html"
					}
				],
				"tags": [
					"ARD",
					"DDR",
					"Der Turm"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.tagesspiegel.de/berlin/queerspiegel/bundestagsabstimmung-ohne-fraktionszwang-ehe-fuer-alle-noch-diese-woche/19984104.html",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Ehe für alle – noch diese Woche",
				"creators": [
					{
						"firstName": "Andrea",
						"lastName": "Dernbach",
						"creatorType": "author"
					},
					{
						"firstName": "Maria",
						"lastName": "Fiedler",
						"creatorType": "author"
					},
					{
						"firstName": "Carsten",
						"lastName": "Werner",
						"creatorType": "author"
					}
				],
				"date": "2017-06-27T16:20:46Z",
				"ISSN": "1865-2263",
				"language": "de-DE",
				"libraryCatalog": "Tagesspiegel",
				"publicationTitle": "Der Tagesspiegel Online",
				"url": "http://www.tagesspiegel.de/berlin/queerspiegel/bundestagsabstimmung-ohne-fraktionszwang-ehe-fuer-alle-noch-diese-woche/19984104.html",
				"attachments": [
					{
						"title": "Snapshot",
						"mimeType": "text/html"
					}
				],
				"tags": [
					"#btw17",
					"Angela Merkel",
					"Bundestagswahl 2017",
					"CDU",
					"CSU",
					"Ehe für alle",
					"Grosse-Böhmer",
					"Queerspiegel",
					"Renate Künast",
					"SPD"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.tagesspiegel.de/suchergebnis/?sw=plagiarismus&search-ressort=all&search-period=empty&search-fromday=1&search-frommonth=1&search-fromyear=1996&search-today=27&search-tomonth=6&search-toyear=2017&submit-search=anzeigen",
		"items": "multiple"
	}
]
/** END TEST CASES **/
