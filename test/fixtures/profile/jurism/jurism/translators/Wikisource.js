{
	"translatorID": "076bd26a-1517-469d-85e9-31316a6f6cb0",
	"label": "Wikisource",
	"creator": "Philipp Zumstein",
	"target": "^https?://en\\.wikisource\\.org/w",
	"minVersion": "2.1.9",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2016-04-15 06:46:02"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2016 Philipp Zumstein

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
	if (doc.getElementById("header_title_text")) {
		var titleLink = ZU.xpath(doc, '//span[@id="header_title_text"]/a');
		if (titleLink.length && (titleLink[0].textContent.match(/Encyclop(æ|ae|e)dia|Dictionary/) )) {
			return "encyclopediaArticle";
		}
		if (doc.getElementById("ca-proofread-source")) {
			if (doc.getElementById("header_section_text")) {
				return "bookSection";
			} else {
				return "book";
			}
		} else {
			return "manuscript";
		}
	} else if (getSearchResults(doc, true)) {
		return "multiple";
	}
}

function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = ZU.xpath(doc, '//ul[contains(@class, "search-results")]//a');
	for (var i=0; i<rows.length; i++) {
		var href = rows[i].href;
		var title = ZU.trimInternal(rows[i].textContent);
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
			var articles = new Array();
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
	var item = new Zotero.Item(detectWeb(doc, url));
	if (item.itemType === "bookSection") {
		item.title = doc.getElementById("header_section_text").textContent;
		item.bookTitle = doc.getElementById("header_title_text").textContent;
	} else if (item.itemType === "encyclopediaArticle") {
		var header = doc.getElementById("header_title_text");
		item.encyclopediaTitle   = ZU.xpathText(header, './a[1]');
		if (ZU.xpath(header, './a[2]').length > 0) {
			item.volume   = ZU.xpathText(header, './a[2]');
		}
		if (doc.getElementById("header_section_text")) {
			item.title = doc.getElementById("header_section_text").textContent;
		} else {
			item.title = ZU.xpathText(doc, '//*[@id="header_title_text"]/text()').replace(/(,|\n)/g,'');
		}
	} else {
		item.title = doc.getElementById("header_title_text").textContent;
	}
	
	var creators = ZU.xpath(doc, '//span[@id="header_author_text"]');
	for (var i=0; i<creators.length; i++) {
		var author = creators[i].textContent.replace('by', '').replace(/\(.+/, '');
		item.creators.push(ZU.cleanAuthor(author, "author"));
	}
	var tags = ZU.xpath(doc, '//div[@id="mw-normal-catlinks"]/ul/li/a');
	for (var i=0; i<tags.length; i++) {
		item.tags.push(tags[i].text);
	}

	item.rights = ZU.xpathText(doc, '//li[@id="footer-info-copyright"]');
	item.archive = "Wikisource";
	var permalink = ZU.xpathText(doc, '//li[@id="t-permalink"]/a/@href');
	item.attachments.push({
		url : permalink,
		title : "Wikisource Snapshot",
		type : "text/html"
	});
	
	//Add more metadata from the "Source" page if it is present
	var sourcePage = ZU.xpathText(doc, '//li[@id="ca-proofread-source"]//a/@href');
	if (sourcePage) {
		ZU.processDocuments(sourcePage, function(sourceDoc) {
			scrapeSource(sourceDoc, item);
		});
	} else {
		item.complete();
	}
}


function scrapeSource(doc, item) {
	var indexedFields = {};
	var lines = ZU.xpath(doc, '//table[@id="prp-indexTable"]/tbody/tr');
	for (var i=0; i<lines.length; i++) {
		var label = ZU.xpathText(lines[i], './th').trim();
		var value = ZU.xpathText(lines[i], './td').trim();
		indexedFields[label] = value;
	}
	//Z.debug(indexedFields);
	if (indexedFields.Year) {
		item.date = indexedFields.Year;
	}
	if (indexedFields.Publisher) {
		item.publisher = indexedFields.Publisher;
	}
	if (indexedFields.Location) {
		item.place = indexedFields.Location;
	}
	if (indexedFields.Editor) {
		item.creators.push(ZU.cleanAuthor(indexedFields.Editor, "editor"));
	}
	if (indexedFields.Illustrator) {
		item.creators.push(ZU.cleanAuthor(indexedFields.Illustrator, "contributor"));
	}
	item.complete();
}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://en.wikisource.org/wiki/Amazing_Grace",
		"items": [
			{
				"itemType": "manuscript",
				"title": "Amazing Grace",
				"creators": [
					{
						"firstName": "John",
						"lastName": "Newton",
						"creatorType": "author"
					}
				],
				"archive": "Wikisource",
				"libraryCatalog": "Wikisource",
				"rights": "Text is available under the Creative Commons Attribution-ShareAlike License; additional terms may apply.  By using this site, you agree to the Terms of Use and Privacy Policy.",
				"attachments": [
					{
						"title": "Wikisource Snapshot",
						"type": "text/html"
					}
				],
				"tags": [
					"Individual Christian hymns",
					"Non-gospel Christian and Judaic hymns",
					"Spoken works"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://en.wikisource.org/wiki/Alice%27s_Adventures_in_Wonderland_(1866)/Chapter_2",
		"items": [
			{
				"itemType": "bookSection",
				"title": "Chapter 2: The Pool of Tears",
				"creators": [
					{
						"firstName": "Lewis",
						"lastName": "Carroll",
						"creatorType": "author"
					},
					{
						"firstName": "John",
						"lastName": "Tenniel",
						"creatorType": "contributor"
					}
				],
				"date": "1866",
				"archive": "Wikisource",
				"bookTitle": "Alice's Adventures in Wonderland (1866)",
				"libraryCatalog": "Wikisource",
				"place": "London",
				"publisher": "MacMillan & Co.",
				"rights": "Text is available under the Creative Commons Attribution-ShareAlike License; additional terms may apply.  By using this site, you agree to the Terms of Use and Privacy Policy.",
				"shortTitle": "Chapter 2",
				"attachments": [
					{
						"title": "Wikisource Snapshot",
						"type": "text/html"
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
		"url": "https://en.wikisource.org/wiki/Letters_of_Tagore_(1917)",
		"items": [
			{
				"itemType": "book",
				"title": "Letters of Tagore (1917)",
				"creators": [
					{
						"firstName": "Rabindranath",
						"lastName": "Tagore",
						"creatorType": "author"
					}
				],
				"date": "1917",
				"archive": "Wikisource",
				"libraryCatalog": "Wikisource",
				"place": "New York",
				"publisher": "The Macmillan Company",
				"rights": "Text is available under the Creative Commons Attribution-ShareAlike License; additional terms may apply.  By using this site, you agree to the Terms of Use and Privacy Policy.",
				"attachments": [
					{
						"title": "Wikisource Snapshot",
						"type": "text/html"
					}
				],
				"tags": [
					"1917 works",
					"PD-old-70-1923"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://en.wikisource.org/wiki/The_Descent_of_Man_(Darwin)/Chapter_IV",
		"items": [
			{
				"itemType": "bookSection",
				"title": "Chapter IV: Comparison of the Mental Powers of Man and the Lower Animals (Continued)",
				"creators": [
					{
						"firstName": "Charles",
						"lastName": "Darwin",
						"creatorType": "author"
					}
				],
				"date": "1875",
				"archive": "Wikisource",
				"bookTitle": "The Descent of Man",
				"libraryCatalog": "Wikisource",
				"place": "New York",
				"publisher": "D. Appleton",
				"rights": "Text is available under the Creative Commons Attribution-ShareAlike License; additional terms may apply.  By using this site, you agree to the Terms of Use and Privacy Policy.",
				"shortTitle": "Chapter IV",
				"attachments": [
					{
						"title": "Wikisource Snapshot",
						"type": "text/html"
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
		"url": "https://en.wikisource.org/w/index.php?search=mannheim&title=Special:Search&go=Go",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://en.wikisource.org/wiki/Gell,_John_%281593-1671%29_%28DNB00%29",
		"items": [
			{
				"itemType": "encyclopediaArticle",
				"title": "Gell John (1593-1671)",
				"creators": [
					{
						"firstName": "Charles Harding",
						"lastName": "Firth",
						"creatorType": "author"
					},
					{
						"firstName": "Leslie",
						"lastName": "Stephen",
						"creatorType": "editor"
					}
				],
				"date": "1890",
				"archive": "Wikisource",
				"encyclopediaTitle": "Dictionary of National Biography, 1885-1900",
				"libraryCatalog": "Wikisource",
				"place": "London",
				"publisher": "Elder Smith & Co.",
				"rights": "Text is available under the Creative Commons Attribution-ShareAlike License; additional terms may apply.  By using this site, you agree to the Terms of Use and Privacy Policy.",
				"volume": "Volume 21",
				"attachments": [
					{
						"title": "Wikisource Snapshot",
						"type": "text/html"
					}
				],
				"tags": [
					"1890 works",
					"DNB biographies"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://en.wikisource.org/wiki/A_Dictionary_of_Music_and_Musicians/Cannabich,_Christian",
		"items": [
			{
				"itemType": "encyclopediaArticle",
				"title": "Cannabich, Christian",
				"creators": [
					{
						"firstName": "George",
						"lastName": "Grove",
						"creatorType": "editor"
					}
				],
				"date": "1900",
				"archive": "Wikisource",
				"encyclopediaTitle": "A Dictionary of Music and Musicians",
				"libraryCatalog": "Wikisource",
				"place": "London",
				"publisher": "MacMillan & Co., Ltd.",
				"rights": "Text is available under the Creative Commons Attribution-ShareAlike License; additional terms may apply.  By using this site, you agree to the Terms of Use and Privacy Policy.",
				"attachments": [
					{
						"title": "Wikisource Snapshot",
						"type": "text/html"
					}
				],
				"tags": [
					"DMM composer biographies"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	}
];
/** END TEST CASES **/
