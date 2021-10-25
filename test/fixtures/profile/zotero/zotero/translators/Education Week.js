{
	"translatorID": "7e51d3fb-082e-4063-8601-cda08f6004a3",
	"label": "Education Week",
	"creator": "Ben Parr",
	"target": "^https?://(www2?\\.|blogs\\.)?edweek\\.org/",
	"minVersion": "1.0.0b4.r1",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2021-01-29 15:47:14"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2021 Sebastian Karcher
	
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

// eslint-disable-next-line no-unused-vars
function detectWeb(doc, url) {
	if (doc.getElementsByClassName('m-article-title').length) {
		return "newspaperArticle";
	}
	else if (getSearchResults(doc, true)) {
		return "multiple";
	}
	return false;
}

function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = doc.querySelectorAll('a.m-promo__title');
	for (let row of rows) {
		let href = row.href;
		let title = ZU.trimInternal(row.textContent);
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
			if (items) ZU.processDocuments(Object.keys(items), scrape);
		});
	}
	else {
		scrape(doc, url);
	}
}
function scrape(doc, url) {
	var translator = Zotero.loadTranslator('web');
	// Embedded Metadata
	translator.setTranslator('951c027d-74ac-47d4-a107-9c3069ab7b48');
	// translator.setDocument(doc);
	
	translator.setHandler('itemDone', function (obj, item) {
		// some garbage makes it into item tags
		for (let i = item.tags.length - 1; i > -1; i--) {
			if (item.tags[i].search(/premium\d|^lytics/) != -1) {
				item.tags.splice(i, 1);
			}
		}
		item.title = item.title.replace(/\(.+?\)$/, "");
		item.ISSN = "0277-4232";
		item.publicationTitle = "Education Week";
		item.complete();
	});

	translator.getTranslatorObject(function (trans) {
		trans.itemType = "newspaperArticle";
		trans.doWeb(doc, url);
	});
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://www.edweek.org/policy-politics/obama-using-education-issue-as-political-sword/2011/10?tkn=PUOFjigAbQPNufjjHPxYeafVz7T5Tf16qNb4&cmp=clp-edweek",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Obama Using Education Issue as Political Sword",
				"creators": [
					{
						"firstName": "Michele",
						"lastName": "McNeil",
						"creatorType": "author"
					}
				],
				"date": "2011-10-28T00:01:02",
				"ISSN": "0277-4232",
				"abstractNote": "The Obama administration highlights its education record, while drawing a sharp contrast with the GOP in Congress.",
				"language": "en",
				"libraryCatalog": "www.edweek.org",
				"publicationTitle": "Education Week",
				"section": "Education Funding",
				"url": "https://www.edweek.org/policy-politics/obama-using-education-issue-as-political-sword/2011/10",
				"attachments": [
					{
						"title": "Snapshot",
						"mimeType": "text/html"
					}
				],
				"tags": [
					{
						"tag": "Barack Obama"
					},
					{
						"tag": "Elections"
					},
					{
						"tag": "Federal Policy"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.edweek.org/leadership/opinion-a-better-turnaround-strategy/2011/10?qs=%22character%20education%22%20inmeta%3ACover_year%3D2011%20inmeta%3Agsaentity_Source%2520U%E2%80%A6",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "A Better Turnaround Strategy",
				"creators": [
					{
						"firstName": "Sheldon H.",
						"lastName": "Berman",
						"creatorType": "author"
					},
					{
						"firstName": "Arthur",
						"lastName": "Camins",
						"creatorType": "author"
					}
				],
				"date": "2011-10-31T17:22:41",
				"ISSN": "0277-4232",
				"abstractNote": "Sheldon H. Berman and Arthur Camins describe a successful turnaround model which promotes a  professionalized and collaborative teaching culture that is also student centered.",
				"language": "en",
				"libraryCatalog": "www.edweek.org",
				"publicationTitle": "Education Week",
				"section": "Equity & Diversity",
				"url": "https://www.edweek.org/leadership/opinion-a-better-turnaround-strategy/2011/10",
				"attachments": [
					{
						"title": "Snapshot",
						"mimeType": "text/html"
					}
				],
				"tags": [
					{
						"tag": "Innovation"
					},
					{
						"tag": "Underserved Students"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.edweek.org/search?q=testing#nt=navsearch",
		"items": "multiple"
	}
]
/** END TEST CASES **/
