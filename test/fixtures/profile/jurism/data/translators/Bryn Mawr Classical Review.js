{
	"translatorID": "635c1246-e0c8-40a0-8799-a73a0b013ad8",
	"label": "Bryn Mawr Classical Review",
	"creator": "Michael Berkowitz",
	"target": "^https?://bmcr\\.brynmawr\\.edu/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2016-08-23 05:51:18"
}

/*
	***** BEGIN LICENSE BLOCK *****
	Copyright © 2016 Michael Berkowitz and John Muccigrosso
	This file is part of Zotero.
	Zotero is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.
	Zotero is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
	GNU Affero General Public License for more details.
	You should have received a copy of the GNU Affero General Public License
	along with Zotero. If not, see <http://www.gnu.org/licenses/>.
	***** END LICENSE BLOCK *****
*/

function detectWeb(doc, url) {
	if (url.search(/by_reviewer|by_author|recent\.html|\/\d{4}\/(indexb?\.html)?$/) != -1) {
		return "multiple";
	} else if (url.search(/\d\.html$/)>-1 && ZU.xpathText(doc, '//h3/i')) {
		return "journalArticle";
	}
}


function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = ZU.xpath(doc, '//*[@id="indexcontent" or @id="twocol-mainContent"]//li//a');
	for (var i=0; i<rows.length; i++) {
		var href = rows[i].href;
		var title = ZU.trimInternal(rows[i].textContent);
		var title = ZU.xpathText(rows[i], '..');
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
	var item = new Zotero.Item("journalArticle");
	
	var title = ZU.xpathText(doc, '//h3/i');
	item.title = "Review of: " + Zotero.Utilities.trimInternal(title);
	
	var author = ZU.xpathText(doc, '//b[contains(text(), "Reviewed by")]');
	if (author) {
		author = author.match(/Reviewed by\s+([^,\(]+)/);
		if (author) {
			item.creators.push(ZU.cleanAuthor(author[1], "author"));
		}
	}

	//The authors of the reviewed book are also child nodes of h3
	//and before the book title which is set in italics.
	var dataChildrens = ZU.xpath(doc, '//h3[i]')[0].childNodes;
	var authorString = "";
	for (var i=0; i<dataChildrens.length; i++) {
		if (dataChildrens[i].tagName == "I") {
			break;
		}
		authorString += dataChildrens[i].textContent;
	}
	var authors = authorString.replace(/\([^)]+\)/, "").split(/(,|and)\s+/);
	//Zotero.debug(authors);
	for (var i=0; i<authors.length; i++) {
		var aut = authors[i];
		if (aut.match(/\w/) && (aut !== "and")) {
			item.creators.push(ZU.cleanAuthor(aut, "reviewedAuthor"));
		}
	}

	//The BMCR ID for 1998ff contains the 4-digit year, 2-digit month and an increasing number.
	//The BMCR ID for 1994-1998 contains the 2-digit year, 1- or 2-digit month and an increasing number.
	//The BMCR ID for 1990-1993 is different.
	var m = url.match(/(\d{4})\/(\d{2,4})[\-\.](\d{1,2})[\-\.](\d{2})/);
	if (m) {
		item.extra = "BMCR ID: " + m[2] + "." + m[3] + "." + m[4];
		if (m[1]>=1994) {
			if (m[2].length==2) {
				m[2] = "19" + m[2];
			}
			if (m[3].length==1) {
				m[3] = "0" + m[3];
			}
			item.date = m[2] + "-" + m[3];
		}
		if (m[1]<=1993) {
			item.date = m[1];
		}
	}
	
	item.publicationTitle = "Bryn Mawr Classical Review";
	item.journalAbbreviation = "BMCR";
	item.ISSN = "1055-7660";
	item.url = url;
	item.attachments.push({url:url, title:item.title, mimeType:"text/html"});
	
	item.complete();
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://bmcr.brynmawr.edu/2010/2010-01-02.html",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Review of: Sallust: The War Against Jugurtha. Aris and Phillips Classical Texts",
				"creators": [
					{
						"firstName": "Christina S.",
						"lastName": "Kraus",
						"creatorType": "author"
					},
					{
						"firstName": "Michael",
						"lastName": "Comber",
						"creatorType": "reviewedAuthor"
					},
					{
						"firstName": "Catalina",
						"lastName": "Balmaceda",
						"creatorType": "reviewedAuthor"
					}
				],
				"date": "2010-01",
				"ISSN": "1055-7660",
				"extra": "BMCR ID: 2010.01.02",
				"journalAbbreviation": "BMCR",
				"libraryCatalog": "Bryn Mawr Classical Review",
				"publicationTitle": "Bryn Mawr Classical Review",
				"shortTitle": "Review of",
				"url": "http://bmcr.brynmawr.edu/2010/2010-01-02.html",
				"attachments": [
					{
						"title": "Review of: Sallust: The War Against Jugurtha. Aris and Phillips Classical Texts",
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
		"url": "http://bmcr.brynmawr.edu/2013/2013-01-44.html",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Review of: The Classical Tradition",
				"creators": [
					{
						"firstName": "Christina S.",
						"lastName": "Kraus",
						"creatorType": "author"
					},
					{
						"firstName": "Anthony",
						"lastName": "Grafton",
						"creatorType": "reviewedAuthor"
					},
					{
						"firstName": "Glenn W.",
						"lastName": "Most",
						"creatorType": "reviewedAuthor"
					},
					{
						"firstName": "Salvatore",
						"lastName": "Settis",
						"creatorType": "reviewedAuthor"
					}
				],
				"date": "2013-01",
				"ISSN": "1055-7660",
				"extra": "BMCR ID: 2013.01.44",
				"journalAbbreviation": "BMCR",
				"libraryCatalog": "Bryn Mawr Classical Review",
				"publicationTitle": "Bryn Mawr Classical Review",
				"shortTitle": "Review of",
				"url": "http://bmcr.brynmawr.edu/2013/2013-01-44.html",
				"attachments": [
					{
						"title": "Review of: The Classical Tradition",
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
		"url": "http://bmcr.brynmawr.edu/recent.html",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://bmcr.brynmawr.edu/1999/1999-11-02.html",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Review of: Epic Traditions in the Contemporary World. The Poetics of Community",
				"creators": [
					{
						"firstName": "Margaret",
						"lastName": "Beissinger",
						"creatorType": "reviewedAuthor"
					},
					{
						"firstName": "Jane",
						"lastName": "Tylus",
						"creatorType": "reviewedAuthor"
					},
					{
						"firstName": "Susanne",
						"lastName": "Wofford",
						"creatorType": "reviewedAuthor"
					}
				],
				"date": "1999-11",
				"ISSN": "1055-7660",
				"extra": "BMCR ID: 1999.11.02",
				"journalAbbreviation": "BMCR",
				"libraryCatalog": "Bryn Mawr Classical Review",
				"publicationTitle": "Bryn Mawr Classical Review",
				"shortTitle": "Review of",
				"url": "http://bmcr.brynmawr.edu/1999/1999-11-02.html",
				"attachments": [
					{
						"title": "Review of: Epic Traditions in the Contemporary World. The Poetics of Community",
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
		"url": "http://bmcr.brynmawr.edu/1998/98.1.04.html",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Review of: Athens and Persians in the Fifth Century BC: A Study in Cultural Receptivity.",
				"creators": [
					{
						"firstName": "Margaret C.",
						"lastName": "Miller",
						"creatorType": "reviewedAuthor"
					}
				],
				"date": "1998-01",
				"ISSN": "1055-7660",
				"extra": "BMCR ID: 98.1.04",
				"journalAbbreviation": "BMCR",
				"libraryCatalog": "Bryn Mawr Classical Review",
				"publicationTitle": "Bryn Mawr Classical Review",
				"shortTitle": "Review of",
				"url": "http://bmcr.brynmawr.edu/1998/98.1.04.html",
				"attachments": [
					{
						"title": "Review of: Athens and Persians in the Fifth Century BC: A Study in Cultural Receptivity.",
						"mimeType": "text/html"
					}
				],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/