{
	"translatorID": "dc024bfc-2252-4257-b10e-cb95a0f213aa",
	"label": "Library Catalog (Talis Prism 2)",
	"creator": "Sebastian Karcher",
	"target": "/items(/\\d+|\\?query=)",
	"minVersion": "2.1.9",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2013-11-18 23:02:45"
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
		if(test && test.indexOf("application/x-endnote-refer")!=-1)
			return "book";
	}
}
	

function doWeb(doc, url){

	var articles = new Array();
	if(detectWeb(doc, url) == "multiple") { 
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
		"url": "http://capitadiscovery.co.uk/cityoflondon/items/169754?outdated=true&query=mahoney&resultsUri=items%3Fquery%3Dmahoney",
		"items": [
			{
				"itemType": "book",
				"creators": [
					{
						"firstName": "John William",
						"lastName": "Mahoney",
						"creatorType": "author"
					}
				],
				"notes": [
					{
						"note": "by Luke Bayard (pseud. i.e. John Mahoney)"
					}
				],
				"tags": [],
				"seeAlso": [],
				"attachments": [],
				"title": "The compact wine guide",
				"place": "(London",
				"publisher": "Wine and Spirit Publications",
				"date": "1969",
				"url": "http://capitadiscovery.co.uk/cityoflondon/items/169754",
				"language": "English",
				"libraryCatalog": "Library Catalog (Talis Prism 2)",
				"accessDate": "CURRENT_TIMESTAMP"
			}
		]
	},
	{
		"type": "web",
		"url": "http://capitadiscovery.co.uk/surrey-ac/items/199580?outdated=true&query=borges&resultsUri=items%3Fquery%3Dborges",
		"items": [
			{
				"itemType": "book",
				"creators": [
					{
						"firstName": "Jorge Luis",
						"lastName": "Borges",
						"creatorType": "author"
					},
					{
						"firstName": "Anthony",
						"lastName": "Kerrigan",
						"creatorType": "author"
					}
				],
				"notes": [
					{
						"note": "Jorge Luis Borges ; edited and with an introduction by Anthony Kerrigan"
					}
				],
				"tags": [
					"Short stories in Spanish Argentinian writers 1910-1945 English texts"
				],
				"seeAlso": [],
				"attachments": [],
				"title": "Fictions",
				"place": "London",
				"publisher": "Calder",
				"date": "1965 1985",
				"ISBN": "9780714540832",
				"url": "http://capitadiscovery.co.uk/surrey-ac/items/199580",
				"language": "English",
				"libraryCatalog": "Library Catalog (Talis Prism 2)"
			}
		]
	},
	{
		"type": "web",
		"url": "http://capitadiscovery.co.uk/surrey-ac/items?query=borges",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://capitadiscovery.co.uk/cityoflondon/items?query=argentina",
		"items": "multiple"
	}
]
/** END TEST CASES **/