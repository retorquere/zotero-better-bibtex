{
	"translatorID": "915e3ae2-afa9-4b1d-9780-28ed3defe0ab",
	"label": "dLibra",
	"creator": "Pawel Kolodziej <p.kolodziej@gmail.com>",
	"target": "/.*dlibra/(doccontent|docmetadata|collectiondescription|results)|/dlibra/?",
	"minVersion": "2.1.9",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2016-09-12 06:02:53"
}

/*
   dLibra Translator
   Copyright (C) 2010 Pawel Kolodziej, p.kolodziej@gmail.com
   
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

//multiple test URL: http://bcul.lib.uni.lodz.pl/dlibra/results?action=SearchAction&skipSearch=true&mdirids=&server%3Atype=both&tempQueryType=-3&encode=false&isExpandable=on&isRemote=off&roleId=-3&queryType=-3&dirids=1&rootid=&query=Karte&localQueryType=-3&remoteQueryType=-2


function detectWeb(doc, url) {
	
	var singleRe = /.*dlibra\/(doccontent|docmetadata|publication).*/;
	var multipleRe = /.*dlibra\/(collectiondescription|results).*|.*\/dlibra\/?/;
	if (singleRe.test(url)) 
		return "book"; 
	if (multipleRe.test(url)) 
		return "multiple";
}


 

function doWeb(doc, url) {
	if (detectWeb(doc,url)=="multiple"){

var articles = new Array();
		var itemsXPath = '//ol[@class="itemlist"]/li/a | //td[@class="searchhit"]/b/a | //p[@class="resultTitle"]/b/a[@class="dLSearchResultTitle"]';
		var titles = doc.evaluate(itemsXPath, doc, null, XPathResult.ANY_TYPE, null); 
		var title;
		var items= {};
		while (title = titles.iterateNext()){
			items[title.href] = title.textContent;}
		
	Zotero.selectItems(items, function (items) {
			if (!items) {
				return true;
			}
			for (var i in items) {
			
				articles.push(i);
			}
			Zotero.Utilities.processDocuments(articles, scrape);	
		});
	} else
		scrape(doc, url);
	
}

function scrape(doc, url)
{
	var reSingle= new RegExp("(.*/dlibra)/(?:doccontent|docmetadata|publication).*[?&]id=([0-9]*).*");	
	var m = reSingle.exec(url);
	if (!m)
		return "";
	var baseUrl = m[1];
	var id = m[2];
	var isPIA = baseUrl.match("lib.pia.org.pl|cyfrowaetnografia.pl");
	Zotero.Utilities.HTTP.doGet( baseUrl + "/rdf.xml?type=e&id="+id, function(rdf){
		
		rdf = rdf.replace(/<\?xml[^>]*\?>/, "");
		//Z.debug(rdf)
		var translator = Zotero.loadTranslator("import");
			translator.setTranslator("5e3ad958-ac79-463d-812b-a86a9235c28f");
			translator.setString(rdf);
			translator.setHandler("itemDone", function (obj, item) {
				if (item.extra) item.notes.push(item.extra);
				item.extra = "";
				item.itemID = "";
				item.complete();
			});
			translator.getTranslatorObject(function(trans) {
				trans.defaultUnknownType = 'book';
				trans.doImport();
		});
		
	})
}
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://bcul.lib.uni.lodz.pl/dlibra/docmetadata?id=1247&from=&dirids=1&ver_id=&lp=2&QI=",
		"items": [
			{
				"itemType": "book",
				"title": "D2. Special Karte von Südpreussen : mit Allergrösster Erlaubniss aus der Königlichen grossen topographischen Vermessungs-Karte, unter Mitwürkung des Directors Langner",
				"creators": [
					{
						"firstName": "David",
						"lastName": "Gilly",
						"creatorType": "author"
					}
				],
				"date": "1802-1803",
				"abstractNote": "Mapy topograficzne Prus Południowych.13 arkuszy o wymiarach 62 x 82 cm. Skala [ca 1:150000]. Miedzioryt, ręcznie kolorowany",
				"language": "ger",
				"libraryCatalog": "dLibra",
				"publisher": "Simon Schropp u. Comp.",
				"rights": "Biblioteka Uniwersytetu Łódzkiego",
				"shortTitle": "D2. Special Karte von Südpreussen",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/