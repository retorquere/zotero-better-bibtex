{
	"translatorID": "e3748cf3-36dc-4816-bf86-95a0b63feb03",
	"label": "Gale Databases",
	"creator": "Sebastian Karcher",
	"target": "^https?://go\\.galegroup\\.com/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2018-10-07 15:50:14"
}

/*
	***** BEGIN LICENSE BLOCK *****
	
	Galegroup Translator - Copyright © 2018 Sebastian Karcher 
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
function attr(docOrElem,selector,attr,index){var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector);return elem?elem.getAttribute(attr):null}function text(docOrElem,selector,index){var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector);return elem?elem.textContent:null}


function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;

	var rows = doc.querySelectorAll('ul.SearchResultsList span.title a.documentLink');
	if (!rows.length) {
		rows = doc.querySelectorAll('ul.SearchResultsList p.subTitle a.title');
	}
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
function detectWeb(doc, url) {
	if ((url.includes('/retrieve.do') || url.includes('/i.do?')) && text(doc, 'li#docTools-citation, li.docTools-citation')) {
		return "journalArticle";
	}
	
	else if (getSearchResults(doc, true)) return "multiple";
}


function scrape(doc, url) {
	var postURL = "/ps/citationtools/rest/cite/download";
	
	var docId = attr(doc, 'input.citationToolsData', 'data-docid');
	var documentUrl = attr(doc, 'input.citationToolsData', 'data-url');
	var productName = attr(doc, 'input.citationToolsData', 'data-productname');
 
	var documentData = '{"docId":"' + docId +'","documentUrl":"' + documentUrl + '","productName":"' + productName + '"}';
	var post = "citationFormat=RIS&documentData=" + encodeURIComponent(documentData).replace(/%20/g, "+");
	var pdfurl = attr(doc, '#docTools-pdf a', 'href');

	// Z.debug(post)
	ZU.doPost(postURL, post, function(text){

		text = text.trim();
		// gale puts issue numbers in M1
		text = text.replace(/M1\s*\-/g, "IS  -");
		// L2 is probably meant to be UR, but we can ignore it altogether
		text = text.replace(/^L2\s+-.+\n/gm, '');
		// we can map copyright notes via CR
		text = text.replace(/^N1(?=\s+-\s+copyright)/igm, 'CR');
		// Z.debug(text);
		
		var translator = Zotero.loadTranslator("import");
		translator.setTranslator("32d59d2d-b65a-4da4-b0a3-bdd3cfb979e7");
		translator.setString(text);
		translator.setHandler("itemDone", function (obj, item) {
			if (item.ISSN) {
				item.ISSN = ZU.cleanISSN(item.ISSN);
			}
			if (item.pages && item.pages.endsWith("+")) {
				item.pages = item.pages.replace(/\+/, "-");
			}
			if (pdfurl) {
				item.attachments.push({
					url: pdfurl,
					title: "Full Text PDF",
					mimeType:'application/pdf'
				});
			} else {
				item.attachments.push({document: doc, title: "Snapshot"});
			}
			item.complete();
		});
		translator.translate();
	});
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
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://go.galegroup.com/ps/i.do?p=PROF&u=nysl_ce_syr&id=GALE|A213083272&v=2.1&it=r&sid=PROF&asid=a8973dd8",
		"items": [
			{
				"itemType": "magazineArticle",
				"title": "Improving a counselor education Web site through usability testing: the bibliotherapy education project",
				"creators": [
					{
						"lastName": "McMillen",
						"firstName": "Paula S.",
						"creatorType": "author"
					},
					{
						"lastName": "Pehrsson",
						"firstName": "Dale-Elizabeth",
						"creatorType": "author"
					}
				],
				"date": "December 2009",
				"ISSN": "0011-0035",
				"archive": "Educators Reference Complete",
				"issue": "2",
				"language": "English",
				"libraryCatalog": "Gale",
				"pages": "122-",
				"publicationTitle": "Counselor Education and Supervision",
				"shortTitle": "Improving a counselor education Web site through usability testing",
				"url": "http://link.galegroup.com/apps/doc/A213083272/PROF?u=nysl_ce_syr&sid=PROF&xid=a8973dd8",
				"volume": "49",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					{
						"tag": "Bibliotherapy"
					},
					{
						"tag": "Counseling"
					},
					{
						"tag": "Counselling"
					},
					{
						"tag": "Usability testing"
					},
					{
						"tag": "Web sites (World Wide Web)"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/
