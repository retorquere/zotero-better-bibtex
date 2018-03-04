{
	"translatorID": "455fe24a-f7e8-4546-81d2-ad4f9aa10487",
	"label": "The Intercept",
	"creator": "czar",
	"target": "^https?://(www\\.)?theintercept\\.com",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2017-07-10 20:57:50"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2017 czar
	http://en.wikipedia.org/wiki/User_talk:Czar

	This file is part of Zotero.

	Zotero is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	Zotero is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
	GNU Affero General Public License for more details.

	You should have received a copy of the GNU Affero General Public License
	along with Zotero. If not, see <http://www.gnu.org/licenses/>.

	***** END LICENSE BLOCK *****
*/

// attr()/text()
function attr(doc,selector,attr,index){if(index>0){var elem=doc.querySelectorAll(selector).item(index);return elem?elem.getAttribute(attr):null}var elem=doc.querySelector(selector);return elem?elem.getAttribute(attr):null}function text(doc,selector,index){if(index>0){var elem=doc.querySelectorAll(selector).item(index);return elem?elem.textContent:null}var elem=doc.querySelector(selector);return elem?elem.textContent:null}

function detectWeb(doc, url) {
	if (/theintercept\.com\/\d{4}\/\d{2}\/\d{2}\//.test(url)) {
		return "blogPost";
	} else if (url.indexOf("/document/") != -1) {
		return "document";
	} else if (/(theintercept\.com\/search\/\?s=)|(theintercept\.com\/?$)/.test(url) && getSearchResults(doc, true) ) {
		return "multiple";
	}
}

function scrape(doc, url) {
	var item = new Zotero.Item("blogPost");
	item.blogTitle = "The Intercept";
	item.language = "en-US";
	var ldjson = JSON.parse(text(doc,'script[type="application/ld+json"]'));
	item.url = ldjson.url;
	item.title = ldjson.headline;
	item.date = ldjson.dateCreated;
	item.abstractNote = text(doc,'meta[name="description"]');
	// no item.attachments: Snapshot doesn't work correctly with site

	// Authors
	if (ldjson.authors.length) {
		do {
			item.creators.push(ZU.cleanAuthor(ldjson.authors[0], "author"));
			ldjson.authors.shift();
		}
		while (ldjson.authors.length);
	}

	// Feature articles json omits the feature title
	var featureTitle = text(doc,'.Post-feature-title');
	if (featureTitle){
		item.title = featureTitle.concat(": ", item.title);
	}
	item.complete();
}

function scrapeDocument(doc, url) {
	var item = new Zotero.Item("document");
	item.publisher = "The Intercept";
	item.language = "en-US";
	item.url = url;
	item.title = text(doc,'.BasicDocumentDetail-title');
	item.date = text(doc,'.BasicDocumentDetail-date');
	if (item.date) { // don't perform on empty string
		item.date = ZU.strToISO(item.date);
	}	
	// no item.abstractNote: no description given
	item.attachments.push({
		title: item.title,
		mimeType: "application/pdf",
		url: attr(doc,'a[class$="-navigation-download"]','href')
	});

	item.complete();
}

function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = doc.querySelectorAll('.Promo-title, h1.HomeFeature-title');
	var links = doc.querySelectorAll('.Promo-link, a.HomeFeature-link');
	for (var i=0; i<rows.length; i++) {
		var href = links[i].href;
		var title = ZU.trimInternal(rows[i].textContent);
		if (!href || !title) continue;
		if (checkOnly) return true;
		found = true;
		items[href] = title;
	}
	return found ? items : false;
}

function doWeb(doc, url) {
	if (detectWeb(doc, url) == "multiple") {
		Zotero.selectItems(getSearchResults(doc, false), function (items) {
			if (!items) {
				return true;
			}
			var articles = [];
			for (var i in items) {
				articles.push(i);
			}
			ZU.processDocuments(articles, scrape);
		});
	} else if (detectWeb(doc, url) == "document") {
		scrapeDocument(doc, url);
	} else if (detectWeb(doc, url) == "blogPost") {
		// if this if statement is removed, the multi page attempts to feed itself into the scrape function
		scrape(doc, url);
	}
}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://theintercept.com/2017/06/05/top-secret-nsa-report-details-russian-hacking-effort-days-before-2016-election/",
		"items": [
			{
				"itemType": "blogPost",
				"title": "Top-Secret NSA Report Details Russian Hacking Effort Days Before 2016 Election",
				"creators": [
					{
						"firstName": "Matthew",
						"lastName": "Cole",
						"creatorType": "author"
					},
					{
						"firstName": "Richard",
						"lastName": "Esposito",
						"creatorType": "author"
					},
					{
						"firstName": "Sam",
						"lastName": "Biddle",
						"creatorType": "author"
					},
					{
						"firstName": "Ryan",
						"lastName": "Grim",
						"creatorType": "author"
					}
				],
				"date": "2017-06-05T19:44:23+00:00",
				"blogTitle": "The Intercept",
				"language": "en-US",
				"url": "https://theintercept.com/2017/06/05/top-secret-nsa-report-details-russian-hacking-effort-days-before-2016-election/",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://theintercept.com/2015/11/19/an-fbi-informant-seduced-eric-mcdavid-into-a-bomb-plot-then-the-government-lied-about-it/",
		"items": [
			{
				"itemType": "blogPost",
				"title": "Manufacturing Terror: An FBI Informant Seduced Eric McDavid Into a Bomb Plot. Then the Government Lied About It.",
				"creators": [
					{
						"firstName": "Trevor",
						"lastName": "Aaronson",
						"creatorType": "author"
					},
					{
						"firstName": "Katie",
						"lastName": "Galloway",
						"creatorType": "author"
					}
				],
				"date": "2015-11-19T18:04:35+00:00",
				"blogTitle": "The Intercept",
				"language": "en-US",
				"shortTitle": "Manufacturing Terror",
				"url": "https://theintercept.com/2015/11/19/an-fbi-informant-seduced-eric-mcdavid-into-a-bomb-plot-then-the-government-lied-about-it/",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://theintercept.com/search/?s=bernie",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://theintercept.com/document/2017/02/22/mastering-the-internet/",
		"items": [
			{
				"itemType": "document",
				"title": "Mastering the Internet",
				"creators": [],
				"date": "2017-02-22",
				"language": "en-US",
				"libraryCatalog": "The Intercept",
				"publisher": "The Intercept",
				"url": "https://theintercept.com/document/2017/02/22/mastering-the-internet/",
				"attachments": [
					{
						"title": "Mastering the Internet",
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
		"url": "https://theintercept.com/",
		"items": "multiple"
	}
]
/** END TEST CASES **/
