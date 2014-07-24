{
	"translatorID": "fa396dd4-7d04-4f99-95e1-93d6f355441d",
	"label": "CiteSeer",
	"creator": "Sebastian Karcher",
	"target": "^https?://citeseerx?\\.ist\\.psu\\.edu",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2014-04-24 02:37:16"
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
	if (url.indexOf('/search?q') != -1 && getSearchResults(doc).length) {
		return "multiple";
	}
	if (url.indexOf('/viewdoc/') != -1 && doc.getElementById('bibtex')) {
		return "journalArticle";
	}
}

function getSearchResults(doc) {
	return ZU.xpath(doc, '//div[@class="result"]/h3/a');
}

function doWeb(doc, url) {
	var articles = new Array();
	if (detectWeb(doc, url) == "multiple") {
		var items = {};
		var titles = getSearchResults(doc);
		for (var i=0; i<titles.length; i++) {
			items[titles[i].href] = titles[i].textContent;
		}
		Zotero.selectItems(items, function (items) {
			if (!items) {
				return true;
			}
			for (var i in items) {
				articles.push(i);
			}
			ZU.processDocuments(articles, scrape);
		});
	} else {
		scrape(doc, url);
	}
}

function scrape(doc, url) {
	//get abstract and pdf from article plage
	var abs = ZU.xpathText(doc, '//meta[@name="description"]/@content');
	var pdfurl = "http://citeseerx.ist.psu.edu" + ZU.xpathText(doc, '//div[@id="downloads"]//a[contains(@title, "document as PDF")]/@href');
	var bibtex = ZU.trimInternal(ZU.xpathText(doc, '//div[@id="bibtex"]/p').replace(/computingdiscrete/g, ""));
	var translator = Zotero.loadTranslator("import");
	translator.setTranslator("9cb70025-a888-4a29-a210-93ec52da40d4");
	//Z.debug(bibtex);
	translator.setString(bibtex);
	translator.setHandler("itemDone", function (obj, item) {
		if (abs) item.abstractNote = abs.replace(/.+?:/, "");
		if (item.title == item.title.toUpperCase()) {
			item.title = ZU.capitalizeTitle(item.title.toLowerCase(), true);
		}
		item.attachments = [{
			document: doc,
			title: "Citeseer - Snapshot",
			mimeType: "text/html"
		}, {
			url: pdfurl,
			title: "Citeseer - Full Text PDF",
			mimeType: "application/pdf"
		}];
		item.complete();

	});
	translator.translate();
}
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://citeseerx.ist.psu.edu/search?q=karcher&submit=Search&sort=rlv&t=doc",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://citeseerx.ist.psu.edu/viewdoc/summary?doi=10.1.1.17.6708",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"firstName": "Ulrich",
						"lastName": "Pinkall",
						"creatorType": "author"
					},
					{
						"firstName": "Strasse Des",
						"lastName": "Juni",
						"creatorType": "author"
					},
					{
						"firstName": "Konrad",
						"lastName": "Polthier",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Citeseer - Snapshot",
						"mimeType": "text/html"
					},
					{
						"title": "Citeseer - Full Text PDF",
						"mimeType": "application/pdf"
					}
				],
				"itemID": "Pinkall93",
				"title": "Computing Discrete Minimal Surfaces and Their Conjugates",
				"publicationTitle": "Experimental Mathematics",
				"date": "1993",
				"volume": "2",
				"pages": "15–36",
				"abstractNote": "We present a new algorithm to compute stable discrete  minimal surfaces bounded by a number of fixed or free boundary curves in R 3,  S 3 and H 3. The algorithm makes no restriction on the genus and can handle  singular triangulations. For a discrete harmonic map a conjugation process is  presented leading in case of minimal surfaces additionally to instable solutions  of the free boundary value problem for minimal surfaces. Symmetry properties  of boundary curves are respected during conjugation.",
				"libraryCatalog": "CiteSeer"
			}
		]
	}
]
/** END TEST CASES **/