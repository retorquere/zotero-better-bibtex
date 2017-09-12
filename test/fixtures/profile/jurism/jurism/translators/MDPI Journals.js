{
	"translatorID": "acf93a17-a83b-482b-a45e-0c64cfd49bee",
	"label": "MDPI Journals",
	"creator": "Sebastian Karcher",
	"target": "^https?://www\\.mdpi\\.com",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2016-12-27 12:49:31"
}


/*
	MDPI Translator
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


function detectWeb(doc, url) {
	var xpath='//meta[@name="citation_journal_title"]';
	if (ZU.xpath(doc, xpath).length > 0) {
		return "journalArticle";
	} else if (getSearchResults(doc, true)) {
		return "multiple";
	}
}


function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = ZU.xpath(doc, '//div[contains(@class, "article-content")]/a[contains(@class, "title-link")]');
	for (var i=0; i<rows.length; i++) {
		var href = rows[i].href;
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
	} else {
		scrape(doc, url);
	}
}

function scrape(doc, url) {
	var translator = Zotero.loadTranslator('web');
	//use Embedded Metadata
	translator.setTranslator("951c027d-74ac-47d4-a107-9c3069ab7b48");
	translator.setDocument(doc);
	translator.setHandler('itemDone', function(obj, item) {
		if (!item.abstractNote) item.abstractNote = item.extra;
		delete item.extra;
		item.complete();
	});
	translator.translate();
}
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.mdpi.com/2075-4418/2/4",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://www.mdpi.com/2076-3387/3/3/32",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"firstName": "Nobuyuki",
						"lastName": "Hanaki",
						"creatorType": "author"
					},
					{
						"firstName": "Hideo",
						"lastName": "Owan",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [
					"organizational learning",
					"exploration",
					"exploitation",
					"complexity",
					"turbulence",
					"NK landscape",
					"ambidexterity"
				],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					},
					{
						"title": "Snapshot"
					}
				],
				"title": "Autonomy, Conformity and Organizational Learning",
				"publicationTitle": "Administrative Sciences",
				"rights": "http://creativecommons.org/licenses/by/3.0/",
				"volume": "3",
				"issue": "3",
				"number": "3",
				"patentNumber": "3",
				"pages": "32-52",
				"publisher": "Multidisciplinary Digital Publishing Institute",
				"institution": "Multidisciplinary Digital Publishing Institute",
				"company": "Multidisciplinary Digital Publishing Institute",
				"label": "Multidisciplinary Digital Publishing Institute",
				"distributor": "Multidisciplinary Digital Publishing Institute",
				"date": "2013-07-05",
				"DOI": "10.3390/admsci3030032",
				"reportType": "Article",
				"letterType": "Article",
				"manuscriptType": "Article",
				"mapType": "Article",
				"thesisType": "Article",
				"websiteType": "Article",
				"presentationType": "Article",
				"postType": "Article",
				"audioFileType": "Article",
				"language": "en",
				"url": "http://www.mdpi.com/2076-3387/3/3/32",
				"abstractNote": "There is often said to be a tension between the two types of organizational learning activities, exploration and exploitation. The argument goes that the two activities are substitutes, competing for scarce resources when firms need different capabilities and management policies. We present another explanation, attributing the tension to the dynamic interactions among search, knowledge sharing, evaluation and alignment within organizations. Our results show that successful organizations tend to bifurcate into two types: those that always promote individual initiatives and build organizational strengths on individual learning and those good at assimilating the individual knowledge base and exploiting shared knowledge. Straddling the two types often fails. The intuition is that an equal mixture of individual search and assimilation slows down individual learning, while at the same time making it difficult to update organizational knowledge because individuals’ knowledge base is not sufficiently homogenized. Straddling is especially inefficient when the operation is sufficiently complex or when the business environment is sufficiently turbulent.",
				"libraryCatalog": "www.mdpi.com",
				"accessDate": "CURRENT_TIMESTAMP"
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.mdpi.com/search?q=preference&journal=algorithms&volume=&authors=&section=&issue=&article_type=&special_issue=&page=&search=Search",
		"items": "multiple"
	}
]
/** END TEST CASES **/