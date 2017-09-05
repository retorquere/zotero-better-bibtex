{
	"translatorID": "0db1c2d0-eaae-4f3d-94ef-d4b3aa61de16",
	"label": "magazines.russ.ru",
	"creator": "Avram Lyon",
	"target": "^https?://magazines\\.russ\\.ru/[a-zA-Z -_]+/[0-9]+/[0-9]+/",
	"minVersion": "2.1.9",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2016-12-31 10:22:19"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Журнальный зал Translator
	Copyright © 2010 Avram Lyon, ajlyon@gmail.com

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
	var results = ZU.xpathText(doc, '//p[@class="update"]');
	if (results) {
		return "journalArticle";
	}
}

function doWeb(doc, url) {
	var item = new Zotero.Item("journalArticle");

	var publication = ZU.xpathText(doc, '//p[@class="update"]/a');
	//e.g. Дети Ра, 2012, 3(89)
	if (publication) {
		Z.debug(publication);
		var pieces = publication.split(',');
		//var pieces = publication.match(/«(.*)»[\n\t ]*([0-9]+), №([0-9]+)/);
		item.publicationTitle = pieces[0].trim();
		item.date = pieces[1].trim();
		var complex = pieces[2];
		var posParenthesis = complex.indexOf('(');
		if (posParenthesis>-1) {
			item.volume = complex.substr(0, posParenthesis);
			item.issue = complex.substr(posParenthesis+1, complex.length-posParenthesis-2);
		}
		
	}

	item.title = ZU.xpathText(doc, '//div[contains(@class, "article")]//h1');

	var authors = ZU.xpath(doc, '//div[@class="authors"]');
	for (var i=0; i<authors.length; i++) {
		item.creators.push(ZU.cleanAuthor(authors[i].textContent, "author"));
	}
	
	item.libraryCatalog = "Журнальный зал";

	item.url = url;
	item.attachments.push({
		url:url,
		title: "Snapshot", 
		mimeType:"text/html"
	});

	item.complete();
}
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://magazines.russ.ru/ra/2012/3/s11.html",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "В сторону СМОГа, или Параллели и меридианы СМОГа",
				"creators": [
					{
						"firstName": "Вячеслав",
						"lastName": "Самошкин",
						"creatorType": "author"
					}
				],
				"date": "2012",
				"issue": "89",
				"libraryCatalog": "Журнальный зал",
				"publicationTitle": "Дети Ра",
				"url": "http://magazines.russ.ru/ra/2012/3/s11.html",
				"volume": "3",
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
	}
]
/** END TEST CASES **/