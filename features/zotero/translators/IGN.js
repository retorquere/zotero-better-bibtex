{
	"translatorID": "d210c5a1-73e1-41ad-a3c9-331d5a3ead48",
	"label": "IGN",
	"creator": "odie5533",
	"target": "^https?://[^/]*\\.ign\\.com/",
	"minVersion": "1.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2014-04-03 17:39:52"
}

/*
	IGN Translator - Parses IGN articles and creates Zotero-based metadata
	Copyright (C) 2010-2011 odie5533

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

function detectWeb(doc, url) {
	if (url.match(/articles/)) {
		return "webpage";
	}
}

function scrape(doc, url) {
	var newItem = new Zotero.Item("webpage");
	newItem.publicationTitle = "IGN";
	newItem.url = doc.location.href;
	newItem.title = doc.title.replace(/ -[^-]+IGN/, "");
	
	// pages
	var pages = doc.evaluate('//div[@class="ui-page-list clear"]/ul/li[last()-1]', doc, null, XPathResult.ANY_TYPE, null);
	if (p = pages.iterateNext())
		newItem.pages = p.textContent;
	
	// date
	var dates = doc.evaluate('//div[@class="article_pub_date"]/text()', doc, null, XPathResult.ANY_TYPE, null);
	newItem.date = dates.iterateNext().textContent.replace(/^\s+|\s+$/g,'');
	
	//authors
	var byline = doc.evaluate('//div[@class="article_author"]', doc, null, XPathResult.ANY_TYPE, null);
	var authors = byline.iterateNext().textContent.replace(/^by\s*/, "").split(" and ");
	for each(var a in authors) {
		newItem.creators.push(Zotero.Utilities.cleanAuthor(a, "author"));
	}
	
	// attach html
	newItem.attachments.push({title:"IGN Article Snapshot", document:doc});
	
	newItem.complete();
}

function doWeb(doc, url) {
	scrape(doc, url);
}
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.ign.com/articles/2011/11/04/5-reasons-modern-warfare-3-wont-disappoint",
		"items": [
			{
				"itemType": "webpage",
				"creators": [
					{
						"firstName": "Stephen",
						"lastName": "Lambrechts",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "IGN Article Snapshot"
					}
				],
				"publicationTitle": "IGN",
				"url": "http://www.ign.com/articles/2011/11/04/5-reasons-modern-warfare-3-wont-disappoint",
				"title": "5 Reasons Modern Warfare 3 Won't Disappoint",
				"date": "November 3, 2011",
				"libraryCatalog": "IGN",
				"accessDate": "CURRENT_TIMESTAMP"
			}
		]
	}
]
/** END TEST CASES **/