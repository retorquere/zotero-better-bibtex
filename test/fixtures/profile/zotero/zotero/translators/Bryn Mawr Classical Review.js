{
	"translatorID": "635c1246-e0c8-40a0-8799-a73a0b013ad8",
	"translatorType": 4,
	"label": "Bryn Mawr Classical Review",
	"creator": "Michael Berkowitz, John Muccigrosso, and Abe Jellinek",
	"target": "^https?://bmcr\\.brynmawr\\.edu/",
	"minVersion": "3.0",
	"maxVersion": null,
	"priority": 100,
	"inRepository": true,
	"browserSupport": "gcsibv",
	"lastUpdated": "2021-06-28 18:50:00"
}

/*
	***** BEGIN LICENSE BLOCK *****
	Copyright © 2016-2021 Michael Berkowitz, John Muccigrosso, and Abe Jellinek
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
	if (url.match(/\d\/?$/) && doc.querySelector('.entry-title')) {
		return "journalArticle";
	}
	else if (getSearchResults(doc, true)) {
		return "multiple";
	}
	return false;
}


function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = doc.querySelectorAll('a.ref-wrapper');
	for (var i = 0; i < rows.length; i++) {
		var href = rows[i].href;
		var title = ZU.trimInternal(text(rows[i], '.ref-title'));
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
				return;
			}
			var articles = [];
			for (var i in items) {
				articles.push(i);
			}
			ZU.processDocuments(articles, scrape);
		});
	}
	else {
		scrape(doc, url);
	}
}

function scrape(doc, url) {
	let item = new Zotero.Item("journalArticle");
	
	let bmcrID = text(doc, '.ref-id').replace(/^BMCR /, '');
	
	let title = text(doc, '.entry-title');
	// trim BMCR ID off the beginning when present
	item.title = "Review of: "
		+ ZU.trimInternal(title).replace(/^\d{2,4}\.\d{1,2}\.\d{1,2}, /, '');
	item.shortTitle = '';
	
	let authors = doc.querySelectorAll('.meta-affiliation[itemprop="author"] [itemprop="name"]');
	for (let author of authors) {
		item.creators.push(ZU.cleanAuthor(author.textContent, "author"));
	}
	
	let reviewedAuthors = doc.querySelectorAll('.entry-citation [itemprop="author"]');
	for (let author of reviewedAuthors) {
		item.creators.push(ZU.cleanAuthor(author.textContent, "reviewedAuthor"));
	}

	item.date = ZU.strToISO(attr(doc, 'meta[itemprop="datePublished"]', 'content'));
	item.extra = "BMCR ID: " + bmcrID;
	
	item.publicationTitle = "Bryn Mawr Classical Review";
	item.journalAbbreviation = "Bryn Mawr Class. Rev.";
	item.ISSN = "1055-7660";
	item.url = url;
	item.attachments.push({
		document: doc,
		title: "Full Text Snapshot"
	});
	
	item.complete();
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://bmcr.brynmawr.edu/2010/2010.01.02",
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
				"date": "2010-01-02",
				"ISSN": "1055-7660",
				"extra": "BMCR ID: 2010.01.02",
				"journalAbbreviation": "Bryn Mawr Class. Rev.",
				"libraryCatalog": "Bryn Mawr Classical Review",
				"publicationTitle": "Bryn Mawr Classical Review",
				"url": "https://bmcr.brynmawr.edu/2010/2010.01.02",
				"attachments": [
					{
						"title": "Full Text Snapshot",
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
		"url": "https://bmcr.brynmawr.edu/2013/2013.01.44",
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
				"date": "2013-01-30",
				"ISSN": "1055-7660",
				"extra": "BMCR ID: 2013.01.44",
				"journalAbbreviation": "Bryn Mawr Class. Rev.",
				"libraryCatalog": "Bryn Mawr Classical Review",
				"publicationTitle": "Bryn Mawr Classical Review",
				"url": "https://bmcr.brynmawr.edu/2013/2013.01.44",
				"attachments": [
					{
						"title": "Full Text Snapshot",
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
		"url": "https://bmcr.brynmawr.edu/Archive/",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://bmcr.brynmawr.edu/1999/1999.11.02",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Review of: Epic traditions in the contemporary world : the poetics of community",
				"creators": [
					{
						"firstName": "James V.",
						"lastName": "Morrison",
						"creatorType": "author"
					},
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
				"date": "1999-11-02",
				"ISSN": "1055-7660",
				"extra": "BMCR ID: 1999.11.02",
				"journalAbbreviation": "Bryn Mawr Class. Rev.",
				"libraryCatalog": "Bryn Mawr Classical Review",
				"publicationTitle": "Bryn Mawr Classical Review",
				"url": "https://bmcr.brynmawr.edu/1999/1999.11.02",
				"attachments": [
					{
						"title": "Full Text Snapshot",
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
		"url": "https://bmcr.brynmawr.edu/1998/1998.01.04/",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Review of: Athens and Persians in the Fifth Century BC: A Study in Cultural Receptivity",
				"creators": [
					{
						"firstName": "Balbina",
						"lastName": "Baebler",
						"creatorType": "author"
					},
					{
						"firstName": "Margaret Christina",
						"lastName": "Miller",
						"creatorType": "reviewedAuthor"
					}
				],
				"date": "1998-01-04",
				"ISSN": "1055-7660",
				"extra": "BMCR ID: 1998.01.04",
				"journalAbbreviation": "Bryn Mawr Class. Rev.",
				"libraryCatalog": "Bryn Mawr Classical Review",
				"publicationTitle": "Bryn Mawr Classical Review",
				"url": "https://bmcr.brynmawr.edu/1998/1998.01.04/",
				"attachments": [
					{
						"title": "Full Text Snapshot",
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
		"url": "https://bmcr.brynmawr.edu/?s=cicero",
		"items": "multiple"
	}
]
/** END TEST CASES **/
