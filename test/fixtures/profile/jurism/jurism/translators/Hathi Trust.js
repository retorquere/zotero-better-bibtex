{
	"translatorID": "31da33ad-b4d9-4e99-b9ea-3e1ddad284d8",
	"label": "Hathi Trust",
	"creator": "Sebastian Karcher",
	"target": "^https?://(catalog|babel)\\.hathitrust\\.org",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2017-11-11 20:05:29"
}

/*
	***** BEGIN LICENSE BLOCK *****
	
	Copyright © 2011 Sebastian Karcher and the Center for History and New Media
					 George Mason University, Fairfax, Virginia, USA
					 http://zotero.org
	
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
	if (url.match(/\/Record\/\d+/)) return "book";

	if ((url.indexOf("/Search/") != -1 || url.indexOf("a=listis;"))
		&& getSearchResults(doc).length) {
		return "multiple";
	}
}

function getSearchResults(doc) {
	//search results
	var res = ZU.xpath(doc, '//div[@class="resultitem"]\
					[.//a[@class="cataloglinkhref"][1]/@href]');
	//collections
	if (!res.length) res = ZU.xpath(doc, '//div[contains(@class,"row")]/div[.//div[contains(@class, "result")]//a[contains(@class, "cataloglinkhref")][1]/@href]');
	return res;
}

function doWeb(doc, url){
	if (detectWeb(doc, url) == "multiple") { 
		var items = {};
		var rows = getSearchResults(doc);
		var c=0;
		for (var i in rows) {
			var title = ZU.xpathText(rows[i], './/span[@class="title"]') || //search result
						ZU.xpathText(rows[i], './h4[@class="Title"]/text()[last()]');	//collection item
			var id = ZU.xpathText(rows[i], './/a[contains(@class, "cataloglinkhref")][1]/@href');
			//Z.debug(id + ": " + title)
			if (id) {
				id = (id.match(/\/(\d+)/) || [])[1];
				//lists can display the same record, but with different titles
				//(for different PDF versions), so we add a unique number to each
				//record so they don't override each other. We strip it off later
				if (id) id = c++ + '-' + id;
			}
			if (title && id) items[id] = title;
		}

		Zotero.selectItems(items, function (items) {
			if (!items) {
				return true;
			}
			var articles = [];
			for (var i in items) {
				articles.push(i.replace(/^\d+-/,''));
			}
			scrape(articles);	
		});
	} else {
		var itemid = url.match(/\/([0-9]+)/)[1];
		scrape([itemid]);
	}
}

// help function
function scrape(ids){
	//RIS Link
	var risurl = "http://catalog.hathitrust.org/Search/SearchExport?handpicked="
		+ ids.join(',') + "&method=ris";
	Zotero.Utilities.HTTP.doGet(risurl, function (text) {
		text = text.replace(/M1  - .+/, ""); //M1 has only garbage like repeated page number info
		var translator = Zotero.loadTranslator("import");
		translator.setTranslator("32d59d2d-b65a-4da4-b0a3-bdd3cfb979e7");
		translator.setString(text);
		translator.setHandler("itemDone", function(obj, item) {
			item.extra="";
			if (item.place)	item.place = item.place.replace(/[\[\]]/g, "");
			if (item.tags.length) item.tags = item.tags.join("/").split("/");
			if (item.url.substr(0,2)=="//") {
				item.url = "https:" + item.url;
			}
			item.attachments = [{url:item.url, title: "Hathi Trust Record", mimeType: "text/html"}];
			item.complete();
		});	
		translator.translate();
	});
}


/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://catalog.hathitrust.org/Search/Home?checkspelling=true&lookfor=Cervantes&type=all&sethtftonly=true&submit=Find",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://catalog.hathitrust.org/Record/001050654",
		"items": [
			{
				"itemType": "book",
				"title": "Cervantes",
				"creators": [
					{
						"lastName": "Entwistle",
						"firstName": "William J.",
						"creatorType": "author"
					}
				],
				"date": "1940",
				"libraryCatalog": "Hathi Trust",
				"numPages": "3 p.l., 192 p.",
				"place": "Oxford",
				"publisher": "The Clarendon press",
				"url": "https://catalog.hathitrust.org/Record/001050654",
				"attachments": [
					{
						"title": "Hathi Trust Record",
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
		"url": "http://babel.hathitrust.org/cgi/mb?a=listis;c=421846824",
		"items": "multiple"
	}
]
/** END TEST CASES **/
