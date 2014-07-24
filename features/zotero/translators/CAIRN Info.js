{
	"translatorID": "f46cc903-c447-47d6-a2cf-c75ed22dc96b",
	"label": "CAIRN Info",
	"creator": "Sebastian Karcher",
	"target": "^https?://www\\.cairn\\.info/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2014-03-11 22:36:38"
}

/*
	Translator
   Copyright (C) 2013 Sebastian Karcher

   This program is free software: you can redistribute it and/or modify
   it under the terms of the GNU Affero General Public License as published by
   the Free Software Foundation, either version 3 of the License, or
   (at your option) any later version.

   This program is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   GNU Affero General Public License for more details.

   You should have received a copy of the GNU Affero General Public License
   along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

function detectWeb(doc,url) {
	var xpath='//meta[@name="citation_journal_title"]';
		
	if (ZU.xpath(doc, xpath).length > 0) {
		return "journalArticle";
	}
			
	if (ZU.xpathText(doc, '//div[contains(@class, "list_articles")]//div[contains(@class, "article") or contains(@class, "articleBookList")]')) {
		return "multiple";
	}

	return false;
}


function doWeb(doc,url)
{
	if (detectWeb(doc, url) == "multiple") {
		var hits = {};
		var urls = [];
		var title;
		var link;
		var resultsrow = ZU.xpath(doc, '//div[contains(@class, "list_articles")]/div[contains(@class, "article")]');
		for (var i in resultsrow) {
			title = ZU.xpathText(resultsrow[i], './div[@class="wrapper_meta"]//div[@class="title"]');
			if (!title){
				title = ZU.xpathText(resultsrow[i], './/div[@class="wrapper_title"]/h2/text()');
			}
			link = ZU.xpathText(resultsrow[i], './/div[@class="state"]/a[1]/@href');
			//Z.debug(title + ": " + link)
			hits[link] = title.replace(/^[\s\,]+/, "").trim();
		}
		Z.selectItems(hits, function(items) {
			if (items == null) return true;
			for (var j in items) {
				urls.push(j);
			}
			ZU.processDocuments(urls, function (myDoc) { 
				doWeb(myDoc, myDoc.location.href) });

		});
	} else {
		// We call the Embedded Metadata translator to do the actual work
		var translator = Zotero.loadTranslator("import");
		translator.setTranslator("951c027d-74ac-47d4-a107-9c3069ab7b48");
		translator.setHandler("itemDone", function(obj, item) {
				item.tags= [];
				var keywords = ZU.xpathText(doc, '//meta[@name="citation_keyword"]/@content');
				if (keywords) keywords = keywords.split(/\s*[,;]\s*/);
				for (i in keywords){
					if (keywords[i].search(/[^\s]/) != -1){
						tags.push(keywords[i])
					}
				}
				item.complete();
				});
		translator.getTranslatorObject(function (obj) {
				obj.doWeb(doc, url);
				});
	}
}
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.cairn.info/revue-d-economie-du-developpement-2012-4.htm",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://www.cairn.info/resultats_recherche.php?searchTerm=artiste",
		"items": "multiple"
	}
]
/** END TEST CASES **/