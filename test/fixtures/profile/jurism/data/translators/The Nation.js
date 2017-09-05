{
	"translatorID": "0d6f8450-72e8-4d8f-bdc2-b7fa03e6f2c5",
	"label": "The Nation",
	"creator": "odie5533",
	"target": "^https?://www\\.thenation\\.com/",
	"minVersion": "1.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2015-06-02 21:32:54"
}

/*
	The Nation - translator for Zotero
	Copyright (C) 2010 odie5533

	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU General Public License for more details.

	You should have received a copy of the GNU General Public License
	along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/


PUB_TITLE = "The Nation";
PUB_ISSN = "0027-8378";
XPATH_TITLE = "substring-before(string(//title[contains(.,'Nation')]), ' | The \
Nation')";
XPATH_PAGES = null;
XPATH_DATE = "//span[@class='article-date']";
RE_DATE = /(.*)/;
XPATH_AUTHORS = "//span[@property='dc:creator']";
RE_AUTHORS = /(.*)/;
RE_ARTICLE_URL = '^https?://www\\.thenation\\.com/(?:article|blog|video)/(?!.*com\
ment$)';
RE_PRETTY_URL = /com\//;
RE_PRETTY_URL_REPLACE = "com/print/";
RE_SKIP_AUTHOR_PARSING = /(?:Nation in the News)/;

function detectWeb(doc, url) {
	if (!xpath_string(doc, doc, XPATH_TITLE))
		return;
	if (url.match(RE_ARTICLE_URL))
		return "magazineArticle";
	else
		return "multiple";
}

function xpath_string(doc, node, xpath) {
	var res = doc.evaluate(xpath, node, null, XPathResult.STRING_TYPE, null);
	if (!res || !res.stringValue)
		return null;
	return Zotero.Utilities.trim(res.stringValue);
}

function xpre(doc, node, xpath, reg) {
	var xpmatch = xpath_string(doc, node, xpath);
	return reg ? reg.exec(xpmatch)[1] : xpmatch;
}

function scrapeSingle(doc, url) {
	var newItem = new Zotero.Item("magazineArticle");
	if (PUB_TITLE) newItem.publicationTitle = PUB_TITLE;
	if (PUB_ISSN) newItem.ISSN = PUB_ISSN;
	//clean up the clutter at the end of the URL
	newItem.url = url.replace(/#.+/, "");
	
	newItem.title = xpath_string(doc, doc, XPATH_TITLE);
	
	if (XPATH_DATE) {
		var date = xpre(doc, doc, XPATH_DATE, RE_DATE);
		if (date != 'null')
			newItem.date = date;
	}
	if (XPATH_PAGES)
		newItem.pages = xpath_string(doc, doc, XPATH_PAGES);
	
	//authors
	var author_text = xpre(doc, doc, XPATH_AUTHORS, RE_AUTHORS);
	var authors = [];
	if (author_text) {
		if (author_text.indexOf(" and ") != -1)
			authors = author_text.split(" and ");
		else if (author_text.indexOf(";") != -1)
			authors = author_text.split(";");
		else
			authors.push(author_text);
	}
	for (var i=0; i<authors.length; i++) {
		var a = authors[i];
		if (a == 'null')
			continue;
		if (a.match(RE_SKIP_AUTHOR_PARSING))
			newItem.creators.push({firstName:a, creatorType:"author"});
		else
			newItem.creators.push(Zotero.Utilities.cleanAuthor(a, "author"));
	}
	
	var snapUrl = url;
	if (RE_PRETTY_URL) snapUrl = snapUrl.replace(RE_PRETTY_URL,
												 RE_PRETTY_URL_REPLACE);    
	// attach html
	newItem.attachments.push({title:PUB_TITLE+" Snapshot", mimeType:"text/html",
							  url:snapUrl, snapshot:true});

	return newItem;
}

function doWeb(doc, url) {
	if (detectWeb(doc, url) != 'multiple')
		scrapeSingle(doc, url).complete();
	else {
		var items = Zotero.Utilities.getItemArray(doc, doc, RE_ARTICLE_URL);
		Zotero.selectItems(items, function(items){
			if(!items)
				return true;
			
			var urls = new Array();
			for(var i in items)
				urls.push(i);
			
			Zotero.Utilities.processDocuments(urls, function(d,u) {
					scrapeSingle(d,d.location.href).complete();
				});
		});
	}
}
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.thenation.com/article/164662/who-will-be-un-bloomberg-what-mayors-should-say-about-wall-street",
		"items": [
			{
				"itemType": "magazineArticle",
				"creators": [
					{
						"firstName": "Tom",
						"lastName": "Hayden",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "The Nation Snapshot",
						"mimeType": "text/html",
						"url": "http://www.thenation.com/print/article/164662/who-will-be-un-bloomberg-what-mayors-should-say-about-wall-street",
						"snapshot": true
					}
				],
				"publicationTitle": "The Nation",
				"ISSN": "0027-8378",
				"url": "http://www.thenation.com/article/164662/who-will-be-un-bloomberg-what-mayors-should-say-about-wall-street",
				"title": "Who Will Be the Un-Bloomberg? What Mayors Should Say About Wall Street",
				"date": "November 16, 2011",
				"libraryCatalog": "The Nation",
				"accessDate": "CURRENT_TIMESTAMP",
				"shortTitle": "Who Will Be the Un-Bloomberg?"
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.thenation.com/search/apachesolr_search/labor%20union",
		"items": "multiple"
	}
]
/** END TEST CASES **/