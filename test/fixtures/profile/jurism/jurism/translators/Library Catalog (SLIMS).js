{
	"translatorID": "fc3ac6f7-b461-49fe-879c-dd234f9c101c",
	"label": "Library Catalog (SLIMS)",
	"creator": "Sebastian Karcher",
	"target": "(^https?://makassarlib\\.net|^https?://kit\\.ft\\.ugm\\.ac\\.id/ucs|/libsenayan)/index\\.php",
	"minVersion": "2.1",
	"maxVersion": "",
	"priority": 250,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcv",
	"lastUpdated": "2014-08-26 04:10:09"
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
	
	if (url.match(/show_detail&id=/)) return "book";
	else if (ZU.xpathText(doc, '//div[contains(@class, "item alterList")]/a')) return "multiple"
	
}
	

function doWeb(doc, url){

	var articles = new Array();
	if (detectWeb(doc, url) == "multiple") { 
		var items = {};
		var titles = doc.evaluate('//div[contains(@class, "item alterList")]/a', doc, null, XPathResult.ANY_TYPE, null);
		var title;
		while (title = titles.iterateNext()) {
			items[title.href] = title.textContent;
		}
		Zotero.selectItems(items, function (items) {
			if (!items) {
				return true;
			}
			for (var i in items) {
				articles.push(i.replace(/(&id=[^&^\?]+)/, "&inXML=true$1"));
			}
			scrape(articles);	
		});
	} else {
		var modsurl = url.replace(/(&id=[^&^\?]+)/, "&inXML=true$1");
		scrape([modsurl]);
	}
}

// help function
function scrape(articles){
	for (i in articles){
	var modsurl = articles[i];
	//Z.debug(modsurl)
	Zotero.Utilities.HTTP.doGet(modsurl, function (text) {	
		//they seem to be handling marctype bibliography as the main genre for books we handle this hear to not lose info in MODS import
		text = text.replace(/bibliography\<\/genre\>/, "book</genre>")
		var translator = Zotero.loadTranslator("import");
		translator.setTranslator("0e2235e7-babf-413c-9acf-f27cce5f059c");
		translator.setString(text);
		translator.setHandler("itemDone", function(obj, item) {
			//creators are entered poorly
			for (j in item.creators){
				if (item.creators[j].lastName && item.creators[j].lastName.indexOf(",")!=-1){
					item.creators[j] = ZU.cleanAuthor(item.creators[j].lastName, item.creators[j].creatorType, true)
				}
			}
			//add catalog entry as permalink
			item.attachments.push({url: modsurl.replace(/&inXML=true/, ""), title: "SLIMS Library Catalog Permalink", mimeType: "text/html", snapshot: false})
			item.complete();
		});	
		translator.translate();
	});
	}
}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://perpustakaan.kemdikbud.go.id/libsenayan/index.php?p=show_detail&id=28002",
		"items": [
			{
				"itemType": "book",
				"creators": [
					{
						"firstName": "John W.",
						"lastName": "Budd",
						"creatorType": "author"
					}
				],
				"notes": [
					{
						"note": "Includes bibliographical references and indexes.;"
					}
				],
				"tags": [
					"Industrial relations"
				],
				"seeAlso": [],
				"attachments": [
					{
						"title": "SLIMS Library Catalog Permalink",
						"mimeType": "text/html",
						"snapshot": false
					}
				],
				"title": "Labor relations : striking a balance",
				"numPages": "553",
				"ISBN": "9780072842",
				"place": "Boston, Mass. :",
				"publisher": "McGraw-Hill,",
				"date": "2005",
				"callNumber": "331.880973",
				"archiveLocation": "Perpustakaan Kemendikbud Pusat Informasi dan Humas, Kemendikbud",
				"language": "English",
				"libraryCatalog": "Library Catalog (SLIMS)",
				"shortTitle": "Labor relations"
			}
		]
	},
	{
		"type": "web",
		"url": "http://perpustakaan.kemdikbud.go.id/libsenayan/index.php?keywords=labor&search=Search",
		"items": "multiple"
	}
]
/** END TEST CASES **/
