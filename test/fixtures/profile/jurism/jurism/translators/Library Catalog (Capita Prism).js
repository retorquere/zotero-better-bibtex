{
	"translatorID": "dc024bfc-2252-4257-b10e-cb95a0f213aa",
	"label": "Library Catalog (Capita Prism)",
	"creator": "Sebastian Karcher",
	"target": "/items(/\\d+|\\?query=)",
	"minVersion": "2.1.9",
	"maxVersion": "",
	"priority": 260,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2016-07-02 21:37:30"
}

/*
	***** BEGIN LICENSE BLOCK *****
	
	Copyright © 2012 Sebastian Karcher 
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
	if (url.match(/\/items\?query=/) && ZU.xpathText(doc, '//div[@id="searchResults"]//h2[@class="title"]/a')!=null ) return "multiple";
	if (url.match(/\/items\/\d+/)) {
		var test = ZU.xpathText(doc, '//link/@type');
		if (test && test.indexOf("application/x-endnote-refer")!=-1)
			return "book";
	}
}
	

function doWeb(doc, url){

	var articles = new Array();
	if (detectWeb(doc, url) == "multiple") { 
		var items = {};
		var titles = doc.evaluate('//div[@id="searchResults"]//h2[@class="title"]/a', doc, null, XPathResult.ANY_TYPE, null);
		var title;
		while (title = titles.iterateNext()) {
			items[title.href] = title.textContent;
		}
		Zotero.selectItems(items, function (items) {
			if (!items) {
				return true;
			}
			for (var i in items) {
				articles.push(referURL(i));
			}
			scrape(articles);
		});
	} else {
		scrape(referURL(url));
	}
}

// help function
function scrape(url){
	Zotero.Utilities.HTTP.doGet(url, function (text) {
	//Z.debug(text)
	//the language text doesn't seem regular Refer, but it's used here
	var language = text.match(/%G.+/)[0];
	//load Refer/BibIX translator - until we can import their JSON or RDF format this looks best.
	var translator = Zotero.loadTranslator("import");
		translator.setTranslator("881f60f2-0802-411a-9228-ce5f47b64c7d");
		translator.setString(text);
		translator.setHandler("itemDone", function(obj, item) {
			if (language){
				item.language= language.replace(/%G\s*/, "");
			}
			item.complete();
		});	
		translator.translate();
	});
}

function referURL(url){
	return url.replace(/\?.+/, "") + ".enw";
}
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://capitadiscovery.co.uk/bcu/items/324179?query=mannheim&resultsUri=items%3Fquery%3Dmannheim",
		"items": [
			{
				"itemType": "book",
				"title": "Mannheim and Vienna",
				"creators": [
					{
						"firstName": "Wolfgang Amadeus",
						"lastName": "Mozart",
						"creatorType": "author"
					}
				],
				"language": "English",
				"libraryCatalog": "Library Catalog (Capita Prism)",
				"publisher": "Archiv",
				"url": "http://capitadiscovery.co.uk/bcu/items/324179",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://capitadiscovery.co.uk/bradford/items?query=shakespeare",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://capitadiscovery.co.uk/worcs/items/693096",
		"items": [
			{
				"itemType": "book",
				"title": "Not quite Nice",
				"creators": [
					{
						"firstName": "Celia",
						"lastName": "Imrie",
						"creatorType": "author"
					}
				],
				"date": "2016",
				"ISBN": "9781408846896",
				"language": "English",
				"libraryCatalog": "Library Catalog (Capita Prism)",
				"place": "London",
				"publisher": "Bloomsbury",
				"url": "http://capitadiscovery.co.uk/worcs/items/693096",
				"attachments": [],
				"tags": [
					"General.",
					"Riviera (France) Fiction."
				],
				"notes": [
					{
						"note": "Celia Imrie"
					}
				],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/