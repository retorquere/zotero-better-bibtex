{
	"translatorID": "f16931f0-372e-4197-8927-05d2ba7599d8",
	"label": "Talis Aspire",
	"creator": "Sebastian Karcher",
	"target": "^https?://lists\\.library[^/]+/(lists|items)",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 200,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcbv",
	"lastUpdated": "2014-01-02 17:59:02"
}

/*
	***** BEGIN LICENSE BLOCK *****
	
	Copyright © 2013 Sebastian Karcher 
	This file is part of Zotero.
	
	Zotero is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.
	
	Zotero is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU Affero General Public License for more details.
	
	You should have received a copy of the GNU Affero General Public License
	along with Zotero.  If not, see <http://www.gnu.org/licenses/>.
	
	***** END LICENSE BLOCK *****
*/

function detectWeb(doc, url) {
	if (url.match(/\/lists\//)) return "multiple";
	if (url.match(/\items\//)){
		var type = ZU.xpathText(doc, '//dd/span[@class="label"]');
		if (type == "Book")	return "book";
		else if (type =="Webpage" || type =="Website") return "webpage";
		else return "journalArticle";

	}
	}
	

function doWeb(doc, url){

	var articles = new Array();
	if(detectWeb(doc, url) == "multiple") { 
		var items = {};
		var titles = doc.evaluate('//p[@class="itemBibData"]/a', doc, null, XPathResult.ANY_TYPE, null);
		var title;
		while (title = titles.iterateNext()) {
			items[title.href] = title.textContent;
		}
		Zotero.selectItems(items, function (items) {
			if (!items) {
				return true;
			}
			for (var i in items) {
				articles.push(i);
			}
			scrape(articles)
			//Zotero.Utilities.HTTP.doGet(articles, processRIS);
		});
	} else {
		scrape([url]);
	}
}



function scrape(url){
	for (i in url){
		var risurl = url[i].replace(/\.html.*/, ".ris");
		Zotero.Utilities.HTTP.doGet(risurl, function(text){
		//Zotero.debug(text)
		var translator = Zotero.loadTranslator("import");
		translator.setTranslator("32d59d2d-b65a-4da4-b0a3-bdd3cfb979e7");
		translator.setString(text);
		translator.setHandler("itemDone", function(obj, item) {
		item.attachments = [{url:url[i], title: "Talis Aspire - Snapshot", mimeType: "text/html"}];
			item.complete();
		});	
		translator.translate();
		});
	}
}
	
	
	/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://lists.library.lincoln.ac.uk/items/FEB50B30-652C-55B2-08F8-F2D399BF308A.html",
		"items": [
			{
				"itemType": "book",
				"creators": [
					{
						"lastName": "Campbell",
						"firstName": "Neil",
						"creatorType": "author"
					},
					{
						"lastName": "Kean",
						"firstName": "Alasdair",
						"creatorType": "author"
					}
				],
				"notes": [
					{
						"note": "<p>Ebook version of first edition also available</p>"
					}
				],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Talis Aspire - Snapshot",
						"mimeType": "text/html"
					}
				],
				"publisher": "Routledge",
				"place": "London",
				"ISBN": "0415346665",
				"title": "American cultural studies: an introduction to American culture",
				"date": "2006",
				"libraryCatalog": "Talis Aspire",
				"shortTitle": "American cultural studies"
			}
		]
	},
	{
		"type": "web",
		"url": "http://lists.library.lincoln.ac.uk/lists/625177C4-A268-8971-E3C9-ACEA91A83585.html",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://lists.library.qmul.ac.uk/lists/34B2A243-2CDC-1F73-D096-997F10E49638.html",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://lists.library.qmul.ac.uk/items/10CFCD91-2171-A947-8436-2189D8DDE5BC.html",
		"items": [
			{
				"itemType": "webpage",
				"creators": [],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Talis Aspire - Snapshot",
						"mimeType": "text/html"
					}
				],
				"url": "http://www.marxists.org/reference/subject/ethics/kant/morals/ch01.htm",
				"title": "The Metaphysical Elements of Ethics by Immanuel Kant (1780)",
				"libraryCatalog": "Talis Aspire",
				"accessDate": "CURRENT_TIMESTAMP"
			}
		]
	},
	{
		"type": "web",
		"url": "http://lists.library.qmul.ac.uk/items/66C2A847-80C3-8259-46AB-0DB8C0779068.html",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"lastName": "Tara J. Radin and Martin Calkins",
						"creatorType": "author",
						"fieldMode": 1
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Talis Aspire - Snapshot",
						"mimeType": "text/html"
					}
				],
				"title": "The Struggle against Sweatshops: Moving toward Responsible Global Business",
				"publicationTitle": "Journal of Business Ethics",
				"url": "http://www.jstor.org/stable/25123831",
				"pages": "261-272",
				"ISSN": "01674544",
				"issue": "No. 2",
				"volume": "Vol. 66",
				"date": "Jul., 2006",
				"libraryCatalog": "Talis Aspire",
				"shortTitle": "The Struggle against Sweatshops"
			}
		]
	}
]
/** END TEST CASES **/