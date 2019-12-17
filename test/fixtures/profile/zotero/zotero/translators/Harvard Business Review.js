{
	"translatorID": "afcd2650-9bdb-4489-b279-ec2274a24962",
	"label": "Harvard Business Review",
	"creator": "Philipp Zumstein",
	"target": "^https?://(www\\.)?hbr\\.org/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2018-10-11 17:02:23"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2018 Philipp Zumstein
	
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


// attr()/text() v2
function attr(docOrElem,selector,attr,index){var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector);return elem?elem.getAttribute(attr):null;}function text(docOrElem,selector,index){var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector);return elem?elem.textContent:null;}


function detectWeb(doc, url) {
	if (url.includes('/the-latest') || url.includes('/archive-toc/')) {
		if (getSearchResults(doc, true)) {
			return "multiple";
		}
	} else if (attr(doc, 'meta[property="og:type"]', 'content')=="article") {
		if (getSearchResultsSamePage(doc, true)) {
			return "multiple";
		} else {
			return "magazineArticle";
		}
	}
}


function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = doc.querySelectorAll('.hed a');
	for (let i=0; i<rows.length; i++) {
		let href = rows[i].href;
		let title = ZU.trimInternal(rows[i].textContent);
		if (!href || !title) continue;
		if (checkOnly) return true;
		found = true;
		items[href] = title;
	}
	return found ? items : false;
}


function getSearchResultsSamePage(doc, checkOnly) {
	var items = {};
	var found = false;
	var numberOfResults = 0;
	var rows = doc.querySelectorAll('.article-hed');
	let authors = doc.querySelectorAll('.article-hed+div.byline');
	for (let i=0; i<rows.length; i++) {
		let title = ZU.trimInternal(rows[i].textContent);
		if (i>authors.length) continue;
		let currentAuthors = authors[i];
		if (!currentAuthors || !title) continue;
		numberOfResults++;
		if (checkOnly && numberOfResults>1) return true;
		items[i] = {"title": title, "authors": currentAuthors};
	}
	return numberOfResults>1 ? items : false;
}


function doWeb(doc, url) {
	if (detectWeb(doc, url) == "multiple") {
		if (url.includes('/the-latest') || url.includes('/archive-toc/')) {
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
		} else { // multiples on the same page
			let titles = getSearchResultsSamePage(doc, false);
			let selects = {};
			for (let i in titles) selects[i] = titles[i].title;
			Zotero.selectItems(selects, function (items) {
				if (!items) {
					return true;
				}
				var articles = [];
				for (var i in items) {
					articles.push(titles[i]);
				}
				// call usual scrape function but with additional third parameter
				scrape(doc, url, articles);
			});
			
		}
	} else {
		scrape(doc, url);
	}
}


function scrape(doc, url, titles) {
	var translator = Zotero.loadTranslator('web');
	// Embedded Metadata
	translator.setTranslator('951c027d-74ac-47d4-a107-9c3069ab7b48');
	// translator.setDocument(doc);
	
	translator.setHandler('itemDone', function (obj, item) {
		var issueStatement = text(doc, '.publication-date');
		if (!item.issue && issueStatement) {
			// e.g. From the March 2014 Issue
			var match = issueStatement.match(/From the ([\w–\-]+\s\d+) Issue/);
			if (match) {
				item.issue = match[1];
			}
		}
		item.publicationTitle = "Harvard Business Review";
		item.ISSN = "0017-8012";
		
		if (!titles) { // i.e. only one article on that page
			// sometimes the section is also falsly part of the title from EM
			item.title = text(doc, 'h1.article-hed') || text(doc, 'h2.article-hed') || item.title;
			// sometimes the creators are not yet extracted by EM
			if (item.creators.length===0) {
				let authors = doc.querySelectorAll('h1.article-hed+div.byline li');
				if (authors.length===0) authors = doc.querySelectorAll('h2.article-hed+div.byline li');
				for (let author of authors) {
					item.creators.push(ZU.cleanAuthor(author.textContent, "author"));
				}
			}
			item.complete();
		} else { // i.e. several articles on the same page
			for (let title of titles) {
				let itemCopy = item;
				itemCopy.title = title.title;
				itemCopy.creators = [];
				let authors = title.authors.querySelectorAll('li');
				for (let author of authors) {
					itemCopy.creators.push(ZU.cleanAuthor(author.textContent, "author"));
				}
				itemCopy.complete();
			}
		}
	});

	translator.getTranslatorObject(function(trans) {
		trans.itemType = "magazineArticle";
		trans.doWeb(doc, url);
	});
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://hbr.org/2018/05/why-marketing-analytics-hasnt-lived-up-to-its-promise",
		"items": [
			{
				"itemType": "magazineArticle",
				"title": "Why Marketing Analytics Hasn’t Lived Up to Its Promise",
				"creators": [
					{
						"firstName": "Carl F.",
						"lastName": "Mela",
						"creatorType": "author"
					},
					{
						"firstName": "Christine",
						"lastName": "Moorman",
						"creatorType": "author"
					}
				],
				"date": "2018-05-30T14:00:33Z",
				"ISSN": "0017-8012",
				"abstractNote": "Companies need to invest in the right mix of data, systems, and people.",
				"libraryCatalog": "hbr.org",
				"publicationTitle": "Harvard Business Review",
				"url": "https://hbr.org/2018/05/why-marketing-analytics-hasnt-lived-up-to-its-promise",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					{
						"tag": "Data"
					},
					{
						"tag": "Marketing"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://hbr.org/2018/05/drunk-people-are-better-at-creative-problem-solving",
		"items": [
			{
				"itemType": "magazineArticle",
				"title": "Drunk People Are Better at Creative Problem Solving",
				"creators": [
					{
						"firstName": "Alison",
						"lastName": "Beard",
						"creatorType": "author"
					}
				],
				"date": "2018-05-01T04:00:00Z",
				"ISSN": "0017-8012",
				"abstractNote": "Does alcohol help unleash insights?",
				"issue": "May–June 2018",
				"libraryCatalog": "hbr.org",
				"publicationTitle": "Harvard Business Review",
				"url": "https://hbr.org/2018/05/drunk-people-are-better-at-creative-problem-solving",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					{
						"tag": "Creativity"
					},
					{
						"tag": "Innovation"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://hbr.org/2014/03/make-your-best-customers-even-better",
		"items": [
			{
				"itemType": "magazineArticle",
				"title": "Make Your Best Customers Even Better",
				"creators": [
					{
						"firstName": "Eddie",
						"lastName": "Yoon",
						"creatorType": "author"
					},
					{
						"firstName": "Steve",
						"lastName": "Carlotti",
						"creatorType": "author"
					},
					{
						"firstName": "Dennis",
						"lastName": "Moore",
						"creatorType": "author"
					}
				],
				"date": "2014-03-01T05:00:00Z",
				"ISSN": "0017-8012",
				"abstractNote": "Many companies could persuade big spenders to buy even more.",
				"issue": "March 2014",
				"libraryCatalog": "hbr.org",
				"publicationTitle": "Harvard Business Review",
				"url": "https://hbr.org/2014/03/make-your-best-customers-even-better",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					{
						"tag": "Customers"
					},
					{
						"tag": "Marketing"
					},
					{
						"tag": "Strategy"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://hbr.org/2018/05/do-entrepreneurs-need-a-strategy#strategy-for-start-ups",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://hbr.org/archive-toc/BR0205",
		"items": "multiple"
	}
]
/** END TEST CASES **/
