{
	"translatorID": "c436f3c7-4246-4ed3-a227-a538c8113a0e",
	"label": "fishpond.co.nz",
	"creator": "Sopheak Hean, Sebastian Karcher",
	"target": "^https?://www\\.fishpond\\.co\\.nz/",
	"minVersion": "1.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2016-09-19 22:12:20"
}

/*
	Fishpond.co.nz Translator- Parses Fishpond.co.nz articles and creates Zotero-based metadata
   Copyright (C) 2011 Sopheak Hean, University of Waikato, Faculty of Education
   Contact:  maxximuscool@gmail.com
   
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
	var definePath = '//td[contains(@class, "product_info")]//h1';
	var XpathObject = doc.evaluate(definePath, doc, null, XPathResult.ANY_TYPE, null).iterateNext();
	if  (XpathObject) {
		return "book";
	} else {
		var definePath = '//td[@id="page_title"]/h1';
		var XpathObject = doc.evaluate(definePath, doc, null, XPathResult.ANY_TYPE, null).iterateNext();
		if  (XpathObject) {
			return "multiple";
		}
	}
}

function scrape(doc, url) {

	var newItem = new Zotero.Item("book");
	var title = '//span[@class="fn"]';
	var titleObject = doc.evaluate(title, doc, null, XPathResult.ANY_TYPE, null).iterateNext();
	if (titleObject){
		newItem.title = titleObject.textContent;
	}
	var author = '//p[@id="product_author"]';
	var authorObject = doc.evaluate(author, doc, null, XPathResult.ANY_TYPE, null).iterateNext();
	if (authorObject){
			authorObject = authorObject.textContent;
			if (( authorObject.match(/By\s/)) && (authorObject.match(/\([A-Za-z]+\W[a-zA-Z]+\)/)  )){
				authorObject = ZU.trimInternal(authorObject).replace(/By\s/, '').replace(/\([A-Za-z]+\W[a-zA-Z]+\)/, '').split(",");
				var i = 0;
				while (authorObject[i]){
					newItem.creators.push(Zotero.Utilities.cleanAuthor(authorObject[i], "author"));   
					i++;
				}
			}
			else if (authorObject.match(/By\W/)) {
				authorObject = authorObject.replace(/By\s/, '').split(",");
				var i = 0;
				while (authorObject[i]){
				newItem.creators.push(Zotero.Utilities.cleanAuthor(authorObject[i], "author"));   
				i++;
				}
			}
			
		}
	var date = '//table[@class="product_info_text"]/tbody/tr[3]';
	var dateObject = doc.evaluate(date, doc, null, XPathResult.ANY_TYPE, null).iterateNext();
	if (dateObject){
		dateObject = dateObject.textContent;
		if (dateObject.match(/Release Date:\s/)){
			newItem.date = dateObject.replace(/Release Date:\s/, '');
		} else {
			
			var d = new Date();
			date ='//span[@class="arrival_time"]';
			dateObject = doc.evaluate(date, doc, null, XPathResult.ANY_TYPE, null).iterateNext();
				if(dateObject){
					newItem.date = dateObject.textContent.replace(/Available\s/, '')+ " " +d.getFullYear()
					;
				}
		}
	}
	var abstract = '//div[@itemprop="description"]';
	var abstractObject = doc.evaluate(abstract, doc, null, XPathResult.ANY_TYPE, null).iterateNext();
	if (abstractObject){
		abstractObject = abstractObject.textContent;
		newItem.abstractNote = abstractObject;
	}
	
	var isbn = "//table/tbody/tr/td[2]/table[4]/tbody/tr[2]/td[2]";
	var isbnObject = doc.evaluate(isbn, doc, null, XPathResult.ANY_TYPE, null).iterateNext();
	if (isbnObject){
		newItem.ISBN = isbnObject.textContent;
	}
	var publisher = "//table/tbody/tr/td[2]/table[4]/tbody/tr[1]/td[2]/a";
	var publisherObject = doc.evaluate(publisher, doc, null, XPathResult.ANY_TYPE, null).iterateNext();
	if (publisherObject) {
	 	newItem.publisher= publisherObject.textContent;
	}

	newItem.attachments.push({title:"FishPond Record", mimeType:"text/html", url:doc.location.href});
	newItem.complete();
}


function doWeb(doc, url) {
	var articles = new Array();
	if (detectWeb(doc, url) == "multiple") {
		var items = new Object();
		
		var titles = '//td[contains(@class, "productSearch-data")]//a[contains(@class, "fn")]';
		var titleObject = doc.evaluate(titles, doc, null, XPathResult.ANY_TYPE, null);
		var next_title; 
		while ( next_title = titleObject.iterateNext()) {
			items[next_title.href] = next_title.textContent;
		}
		Zotero.selectItems(items, function (items) {
			if (!items) {
				return true;
			}
			for (var i in items) {
				articles.push(i);
			}
			Zotero.Utilities.processDocuments(articles, scrape, function () {
				Zotero.done();
			});	
		});
	} else {
		scrape(doc, url);
	}
}
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.fishpond.co.nz/Books/Pippi-Longstocking-Astrid-Lindgren/9780670014040?cf=3&rid=2103878406&i=3&keywords=lindgren",
		"items": [
			{
				"itemType": "book",
				"creators": [
					{
						"firstName": "Astrid",
						"lastName": "Lindgren",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "FishPond Record",
						"mimeType": "text/html",
						"url": "http://www.fishpond.co.nz/Books/Pippi-Longstocking-Astrid-Lindgren/9780670014040?cf=3&rid=2103878406&i=3&keywords=lindgren"
					}
				],
				"title": "Pippi Longstocking",
				"abstractNote": "The classic novel about the little girl with crazy red pigtails and a flair for the outrageous is available once again in this large-format gift edition. Full color.",
				"libraryCatalog": "fishpond.co.nz"
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.fishpond.co.nz/Books/Best-of-Pippi-Longstocking-Astrid-Lindgren-Tony-Ross-Illustrated-by/9780192753373",
		"items": [
			{
				"itemType": "book",
				"creators": [
					{
						"firstName": "Astrid",
						"lastName": "Lindgren",
						"creatorType": "author"
					},
					{
						"firstName": "Tony",
						"lastName": "Ross",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "FishPond Record",
						"mimeType": "text/html"
					}
				],
				"title": "The Best of Pippi Longstocking",
				"abstractNote": "Pippi Longstocking is as popular as ever, with dedicated fans all over the world. She's funny, feisty, and incredibly strong and has the most amazing adventures ever! Here's a chance to read three books about Pippi in one volume - Pippi Longstocking, Pippi Goes Aboard, and Pippi in the South Seas. * Pippi Longstocking has phenomenal sales and has been in print continuously for over forty years * Illustrated throughout by best-selling artist, Tony Ross, who has illustrated a new cover for this edition * Astrid Lindgren has won numerous awards including the Hans Christian Andersen Award and the International Book Award.",
				"libraryCatalog": "fishpond.co.nz"
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.fishpond.co.nz/c/Books/a/Astrid+Lindgren",
		"items": "multiple"
	}
]
/** END TEST CASES **/