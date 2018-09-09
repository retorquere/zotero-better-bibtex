{
	"translatorID": "8917b41c-8527-4ee7-b2dd-bcbc3fa5eabd",
	"label": "CiteULike",
	"creator": "Philipp Zumstein",
	"target": "^https?://(www\\.)?citeulike\\.org(.*/tag/[^/]*$|/search/|/journal/|/user/|/group/[0-9]+/library$|/\\?page=[0-9]+$|/.*article/[0-9]+$|/$)",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2018-01-28 22:54:12"
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
	if (url.includes('/article/')) {
		return "journalArticle";
	} else if (getSearchResults(doc, true)) {
		return "multiple";
	}
}


function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = doc.querySelectorAll('a.title');
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


function doWeb(doc, url) {
	if (detectWeb(doc, url) == "multiple") {
		Zotero.selectItems(getSearchResults(doc, false), function (items) {
			if (!items) {
				return true;
			}
			var articles = [];
			for (let i in items) {
				scrape(i.replace(/citeulike\.org\//, "citeulike.org/endnote/"));
			}
		});
	} else {
		var endnoteUrl = url.replace(/citeulike\.org\//, "citeulike.org/endnote/");
		scrape(endnoteUrl);
	}
}


function scrape(url) {
	ZU.doGet(url, function(text) {
		var translator = Zotero.loadTranslator("import");
		translator.setTranslator("32d59d2d-b65a-4da4-b0a3-bdd3cfb979e7");
		translator.setString(text);
		translator.translate();
	});
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.citeulike.org/user/kevin3stone/article/567475",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Automatic test generation: a use case driven approach",
				"creators": [
					{
						"lastName": "Nebut",
						"firstName": "C",
						"creatorType": "author"
					},
					{
						"lastName": "Fleurey",
						"firstName": "F",
						"creatorType": "author"
					},
					{
						"lastName": "Le Traon",
						"firstName": "Y",
						"creatorType": "author"
					},
					{
						"lastName": "Jezequel",
						"firstName": "JM",
						"creatorType": "author"
					}
				],
				"date": "March 2006",
				"DOI": "10.1109/tse.2006.22",
				"ISSN": "0098-5589",
				"abstractNote": "Use cases are believed to be a good basis for system testing. Yet, to automate the test generation process, there is a large gap to bridge between high-level use cases and concrete test cases. We propose a new approach for automating the generation of system test scenarios in the context of object-oriented embedded software, taking into account traceability problems between high-level views and concrete test case execution. Starting from a formalization of the requirements based on use cases extended with contracts, we automatically build a transition system from which we synthesize test cases. Our objective is to cover the system in terms of statement coverage with those generated tests: an empirical evaluation of our approach is given based on this objective and several case studies. We briefly discuss the experimental deployment of our approach in the field at Thales Airborne Systems.",
				"issue": "3",
				"libraryCatalog": "CiteULike",
				"pages": "140-155",
				"publicationTitle": "IEEE Transactions on Software Engineering",
				"shortTitle": "Automatic test generation",
				"url": "http://dx.doi.org/10.1109/tse.2006.22",
				"volume": "32",
				"attachments": [],
				"tags": [
					{
						"tag": "automation"
					},
					{
						"tag": "test"
					},
					{
						"tag": "test_case_generation"
					},
					{
						"tag": "testing"
					},
					{
						"tag": "use_case"
					}
				],
				"notes": [
					{
						"note": "<p>This paper introduces a new approach to automatically generating test cases from requirements which are described by use cases and contracts. With the aid of sequence diagrams, test scenarios can be generated from test objectives. The authors also provide a simulator to correct requirements by doing simulation and model checking. When applying the approach to real life cases, requirement formalization still poses great challenges to business analysts.</p>"
					}
				],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.citeulike.org/user/kevin3stone/tag/test",
		"items": "multiple"
	}
]
/** END TEST CASES **/
