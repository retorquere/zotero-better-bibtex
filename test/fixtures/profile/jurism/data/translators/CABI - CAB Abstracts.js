{
	"translatorID": "a29d22b3-c2e4-4cc0-ace4-6c2326144332",
	"label": "CABI - CAB Abstracts",
	"creator": "Sebastian Karcher",
	"target": "^https?://www\\.cabi?direct\\.org/",
	"minVersion": "3.0.4",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsib",
	"lastUpdated": "2012-12-13 16:39:11"
}

/*
	Translator for CABI/CABIDIRECT
   Copyright (C) 2012 Sebastian Karcher

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
/* exampleURL: http://www.cabdirect.org/abstracts/20123011177.html 
*/

function detectWeb(doc, url) {
	var shortTag = ZU.xpath(doc, '//meta/@name')
	var hwType;
	for (i in shortTag) {
		switch (shortTag[i].textContent) {
		case "citation_journal_title":
			hwType = "journalArticle";
			break;
		case "citation_technical_report_institution":
			hwType = "report";
			break;
		case "citation_conference_title":
		case "citation_conference":
			hwType = "conferencePaper";
			break;
		case "citation_book_title":
			hwType = "bookSection";
			break;
		case "citation_dissertation_institution":
		case "citation_dissertation_name":
			hwType = "thesis";
			break;
		case "citation_title":
			//fall back to journalArticle, since this is quite common
		case "citation_series_title":
			//possibly journal article, though it could be book
			hwType = "journalArticle";
			break;
		}
	};
	if (hwType) return hwType;
	else if (url.match(/\/search\.html/)) {
		return "multiple";
	}
	return false;
}


function doWeb(doc, url) {
	if (detectWeb(doc, url) == "multiple") {
		var hits = {};
		var urls = [];
		var results = ZU.xpath(doc, "//dt/a[@class='resultLink'][1]");

		for (var i in results) {
			hits[results[i].href] = results[i].textContent;
		}
		Z.selectItems(hits, function (items) {
			if (items == null) return true;
			for (var j in items) {
				urls.push(j);
			}
			Zotero.Utilities.processDocuments(urls, scrape, function () {
				Zotero.done();
			});
			Zotero.wait();
		});
	} else {
		scrape(doc, url)
	}
}

function scrape(doc, url) {
	var type = detectWeb(doc, url);
	var pdfurl = ZU.xpathText(doc, '//a[@class="viewFullText"]/@href');
	var id = url.match(/\/[^\/]+\.html/)[0].replace(/[\/(\.html)]/g, "");
	Z.debug(id);
	var get = url.replace(/\/abstract.+/, "/citation.ris?pa") + id;
	var post = 'pa=' + id + '&full=citation_abstract&ris=Export+Endnote+%28RIS%29+format';
	Zotero.Utilities.HTTP.doPost(get, post, function (text) {
		var translator = Zotero.loadTranslator("import");
		// Calling the RIS translator
		translator.setTranslator("32d59d2d-b65a-4da4-b0a3-bdd3cfb979e7");
		translator.setString(text);
		translator.setHandler("itemDone", function (obj, item) {
			//their RIS uses some whacky item types - if the RIS translators falls back to docuemnt
			//use the detected type (if any) instead.
			if (item.itemType == "document" && type) item.itemType = type;
			item.attachments = [{
				url: url,
				title: "Cabidirect Snapshot",
				mimeType: "text/html"
			},
			//I don't have access to those PDFs, so no idea if this will work, but trying can't hurt;
			{
				url: pdfurl,
				title: "Cabidirect Full Text PDF",
				mimeType: "application/pdf"
			}];
			item.complete();
		});
		translator.getTranslatorObject(function(trans) {
			trans.options.itemType = type;
			trans.doImport();
		});
	});
}
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.cabdirect.org/search.html?q=test",
		"items": "multiple"
	}
]
/** END TEST CASES **/