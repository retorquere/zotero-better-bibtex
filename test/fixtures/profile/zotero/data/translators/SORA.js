{
	"translatorID": "83d2ed27-40a5-4dc7-bd87-baddc8fb35da",
	"label": "SORA",
	"creator": "Philipp Zumstein",
	"target": "^https?://sora\\.unm\\.edu/(node/|search/node/|advancedsearch\\?)",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsbv",
	"lastUpdated": "2017-06-24 15:08:40"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2014 Philipp Zumstein

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

var mapping = {
	"journal" : "publicationTitle",
	"volume" : "volume",
	"issue" : "issue",
	"year" : "date",
	"pages" : "pages",
	"section" : "extra"
}


function detectWeb(doc, url) {
	if ( ZU.xpath(doc, '//div[contains(@class, "content")]/fieldset/legend').length ) { // Publication Information
		if (getSearchResults(doc, true)) {
			return "multiple";
		} else {
			return "journalArticle";
		}
	}
	if (url.indexOf('search')>-1 && getSearchResults(doc, true)) {
		return "multiple";
	}
}

function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = ZU.xpath(doc, '//div[contains(@class, "content")]//dt//a|//div[contains(@class, "content")]//h3[contains(@class, "title")]/a|//span[contains(@class, "field-content")]/a');
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
			var articles = new Array();
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
	var item = new Zotero.Item(detectWeb(doc, url));
	
	//title
	var title = ZU.xpathText(doc, '//h1[contains(@class, "title")]');
	item.title = title;
	
	//authors
	//Examples:
	//Edward H. Burtt, Jr. 
	//James Hengeveld, Keith A. Mcmullen, Geoffrey A. Williamson
	//==> The author string is splitted by ',' into the individual
	//authors, but for suffixes this will be corrected again by
	//some heuristic. This heuristic seperates another autor
	//from a suffix by checking if the string consists any space
	//and its length is less than 5.
	var authors = ZU.xpathText(doc, '//div[contains(@class, "content")]/div[contains(@class, "field-name-field-authors")]/div/div/text()');
	if (authors) {
		var authorsSplit = authors.split(',');
		var index = 0;
		for (var m=0; m<authorsSplit.length; m++) {
			var value = ZU.trim(authorsSplit[m]);
			if (value != '') {
				if (value.indexOf(' ') == -1 && value.length<5 && index>0) {
					item.creators[index-1].firstName += ', ' + value;//Jr. or III.
				} else {
					item.creators.push( ZU.cleanAuthor( value, "author") );
					index++;
				}
			
			}
		}
	}
	
	//other fields
	var fields = ZU.xpath(doc, '//div[contains(@class, "content")]/fieldset/div/div');
	for (var k=0; k<fields.length; k++) {
		var fieldName = ZU.xpathText(fields[k], './div[contains(@class, "field-label")]').replace(':','').toLowerCase().trim();
		var fieldValue = ZU.xpathText(fields[k], './div[contains(@class, "field-items")]').replace(',','').trim();
		if (mapping[fieldName]) {
			item[ mapping[fieldName] ] = fieldValue;
		} else {
			Z.debug('Unrecognized field: ' + fieldName);
		}
	}
	
	
	//PDF
	var pdfLink = ZU.xpath(doc, '//div[contains(@class, "field-name-upload")]//a[contains(@type, "application/pdf")]');
	if (pdfLink.length>0) {
		item.attachments.push({
			title : "Full Text PDF",
			url : pdfLink[0].href,
			mimeType : "application/pdf"
		});
	}
	//link to SORA entry
	item.attachments.push({
		title : "SORA Entry",
		url : url,
		mimeType : "text/html",
		snapshot : false
	});
	
	item.complete();
}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://sora.unm.edu/node/99151",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "The Passing of Coragyps Shastensis Miller",
				"creators": [
					{
						"firstName": "Loye",
						"lastName": "Miller",
						"creatorType": "author"
					}
				],
				"date": "1941",
				"issue": "3 (May-June)",
				"libraryCatalog": "SORA",
				"pages": "140-141",
				"publicationTitle": "Condor",
				"volume": "43",
				"attachments": [
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					},
					{
						"title": "SORA Entry",
						"mimeType": "text/html",
						"snapshot": false
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
		"url": "https://sora.unm.edu/node/2035",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://sora.unm.edu/node/116567",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Illinois and Indiana",
				"creators": [
					{
						"firstName": "James",
						"lastName": "Hengeveld",
						"creatorType": "author"
					},
					{
						"firstName": "Keith A.",
						"lastName": "Mcmullen",
						"creatorType": "author"
					},
					{
						"firstName": "Geoffrey A.",
						"lastName": "Williamson",
						"creatorType": "author"
					}
				],
				"date": "2006",
				"issue": "3",
				"libraryCatalog": "SORA",
				"pages": "376-378",
				"publicationTitle": "North American Birds",
				"volume": "60",
				"attachments": [
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					},
					{
						"title": "SORA Entry",
						"mimeType": "text/html",
						"snapshot": false
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
		"url": "https://sora.unm.edu/node/162",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "An Analysis of Physical, Physiological, and Optical Aspects of Avian Coloration with Emphasis on Wood-Warblers",
				"creators": [
					{
						"firstName": "Edward H., Jr.",
						"lastName": "Burtt",
						"creatorType": "author"
					}
				],
				"date": "1986",
				"issue": "38",
				"libraryCatalog": "SORA",
				"pages": "1-126",
				"publicationTitle": "Ornithological Monographs",
				"attachments": [
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					},
					{
						"title": "SORA Entry",
						"mimeType": "text/html",
						"snapshot": false
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
		"url": "https://sora.unm.edu/advancedsearch?field_authors_value=&title=condor&field_fulltext_value=&field_year_value=",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://sora.unm.edu/search/node/eagle%20type%3Aarticle",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://sora.unm.edu/node/53338",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "A Comparison of Home Range Estimates for a Bald Eagle Wintering in New Mexico",
				"creators": [
					{
						"firstName": "Dale W.",
						"lastName": "Stahlecker",
						"creatorType": "author"
					},
					{
						"firstName": "Timothy G.",
						"lastName": "Smith",
						"creatorType": "author"
					}
				],
				"date": "1993",
				"extra": "Short Communications",
				"issue": "1 (March)",
				"libraryCatalog": "SORA",
				"pages": "42-45",
				"publicationTitle": "Journal of Raptor Research",
				"volume": "27",
				"attachments": [
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					},
					{
						"title": "SORA Entry",
						"mimeType": "text/html",
						"snapshot": false
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