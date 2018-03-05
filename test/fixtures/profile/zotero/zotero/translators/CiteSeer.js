{
	"translatorID": "fa396dd4-7d04-4f99-95e1-93d6f355441d",
	"label": "CiteSeer",
	"creator": "Sebastian Karcher, Guy Aglionby",
	"target": "^https?://citeseerx?\\.ist\\.psu\\.edu",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2018-01-28 16:31:16"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2018 Sebastian Karcher, Guy Aglionby
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
	if ((url.includes('/search') || url.includes('/showciting')) && getSearchResults(doc).length) {
		return "multiple";
	}
	//for running the tests with book example
	if (url == "http://citeseerx.ist.psu.edu/viewdoc/summary?doi=10.1.1.332.356&rank=1") return "book";
	if ((url.includes('/viewdoc/') && doc.getElementById('bibtex'))
		|| url.includes('/download?doi=')) {
		return "journalArticle";
	}
}

function getSearchResults(doc) {
	return ZU.xpath(doc, '//div[@class="result"]/h3/a');
}

function doWeb(doc, url) {
	var articles = [];
	if (detectWeb(doc, url) == "multiple") {
		var items = {};
		var titles = getSearchResults(doc);
		for (var i=0; i<titles.length; i++) {
			items[titles[i].href] = titles[i].textContent.trim();
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
	} else if (url.includes('/download?doi=')) {
		// PDF paper view
		// e.g. http://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.415.9750&rep=rep1&type=pdf
		let doi = url.match(/\/download\?doi=([^&]*)/);
		let paperUrl = 'http://citeseerx.ist.psu.edu/viewdoc/summary?doi=' + doi[1];
		ZU.processDocuments(paperUrl, scrape);
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
		if (item.publicationTitle && (item.publicationTitle == item.publicationTitle.toUpperCase())) {
			item.publicationTitle = ZU.capitalizeTitle(item.publicationTitle.toLowerCase(), true);
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
				"title": "Computing Discrete Minimal Surfaces and Their Conjugates",
				"creators": [
					{
						"firstName": "Ulrich",
						"lastName": "Pinkall",
						"creatorType": "author"
					},
					{
						"firstName": "Konrad",
						"lastName": "Polthier",
						"creatorType": "author"
					}
				],
				"date": "1993",
				"abstractNote": "We present a new algorithm to compute stable discrete minimal surfaces bounded by a number of fixed or free boundary curves in R³, S³ and H³. The algorithm makes no restriction on the genus and can handle singular triangulations. For a discrete harmonic map a conjugation process is presented leading in case of minimal surfaces additionally to instable solutions of the free boundary value problem for minimal surfaces. Symmetry properties of boundary curves are respected during conjugation.",
				"itemID": "Pinkall93",
				"libraryCatalog": "CiteSeer",
				"pages": "15–36",
				"publicationTitle": "Experimental Mathematics",
				"volume": "2",
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
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://citeseerx.ist.psu.edu/viewdoc/summary?doi=10.1.1.332.356&rank=1",
		"items": [
			{
				"itemType": "book",
				"title": "The Nature of Statistical Learning Theory",
				"creators": [
					{
						"firstName": "Vladimir N.",
						"lastName": "Vapnik",
						"creatorType": "author"
					}
				],
				"date": "1999",
				"abstractNote": "Statistical learning theory was introduced in the late 1960’s. Until the 1990’s it was a purely theoretical analysis of the problem of function estimation from a given collection of data. In the middle of the 1990’s new types of learning algorithms (called support vector machines) based on the developed theory were proposed. This made statistical learning theory not only a tool for the theoretical analysis but also a tool for creating practical algorithms for estimating multidimensional functions. This article presents a very general overview of statistical learning theory including both theoretical and algorithmic aspects of the theory. The goal of this overview is to demonstrate how the abstract learning theory established conditions for generalization which are more general than those discussed in classical statistical paradigms and how the understanding of these conditions inspired new algorithmic approaches to function estimation problems. A more",
				"itemID": "Vapnik99thenature",
				"libraryCatalog": "CiteSeer",
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
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/
