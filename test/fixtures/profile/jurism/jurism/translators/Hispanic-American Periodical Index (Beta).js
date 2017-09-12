{
	"translatorID": "cc4b1ea4-3349-4bb4-af55-cce5e06e4669",
	"label": "Hispanic-American Periodical Index (Beta)",
	"creator": "Sebastian Karcher",
	"target": "^https?://hapi\\.ucla\\.edu",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsb",
	"lastUpdated": "2014-09-07 10:21:42"
}

/*
	***** BEGIN LICENSE BLOCK *****
	
	Copyright © 2014 Sebastian Karcher
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
    if (url.indexOf("article/citation") != -1) return "journalArticle";
    else if (url.indexOf("/search") != -1 || url.indexOf("/name/") != -1) return "multiple";
}

function scrape(doc, url) {
    var id = url.match(/citation\/(\d+)/)[1];
    var token = ZU.xpathText(doc, '(//input[@name="csrf_token"])[1]/@value');
    //Z.debug(id);
    //Z.debug(token);
    var post = "csrf_token=" + token + "&articles=" + id;
    var get = "/article/export_for_endnote/";
    Zotero.Utilities.HTTP.doPost(get, post, function(text) {
        //Z.debug(text);
        var translator = Zotero.loadTranslator("import");
        // Calling the RIS translator
        translator.setTranslator("32d59d2d-b65a-4da4-b0a3-bdd3cfb979e7");
        translator.setString(text);
        translator.setHandler("itemDone", function(obj, item) {
            item.notes = [];
            item.attachments = [{
                document: doc,
                title: "HAPI Snapshot"
            }];
            item.complete();
        });
        translator.translate();
    });

}

function doWeb(doc, url) {
    var articles = new Array();
    var items = {};
    if (detectWeb(doc, url) == "multiple") {
        var titles = ZU.xpath(doc, '//span[@class="title-link"]');
        for (var i = 0; i < titles.length; i++) {
            items[ZU.xpathText(titles[i], './@data-title')] = titles[i].textContent;
        }
        Zotero.selectItems(items, function(items) {
            if (!items) {
                return true;
            }
            for (var i in items) {
                articles.push("article/citation/" + i);
            }
            Zotero.Utilities.processDocuments(articles, scrape);
        });
    } else {
        scrape(doc, url);
    }
}
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://newstaging.hapi.imagistic.com/article/citation/308849",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"lastName": "Seveso",
						"firstName": "César",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [
					"Peronism",
					"Social conflict--Argentina",
					"Labor and laboring classes--Argentina--Political activity",
					"culture",
					"gender",
					"memory",
					"violence"
				],
				"seeAlso": [],
				"attachments": [
					{
						"title": "HAPI Snapshot"
					}
				],
				"title": "Millions of Small Battles: The Peronist Resistance in Argentina",
				"publicationTitle": "Bulletin of Latin American Research",
				"volume": "30",
				"issue": "3",
				"pages": "313–327",
				"url": "http://onlinelibrary.wiley.com/journal/10.1111/%28ISSN%291470-9856/issues",
				"date": "2011",
				"libraryCatalog": "Hispanic-American Periodical Index (Beta)",
				"accessDate": "CURRENT_TIMESTAMP",
				"shortTitle": "Millions of Small Battles"
			}
		]
	}
]
/** END TEST CASES **/
