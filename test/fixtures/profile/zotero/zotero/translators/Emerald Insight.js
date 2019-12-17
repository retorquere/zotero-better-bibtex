{
	"translatorID": "a14301dc-be1c-4f34-bcaa-1b53b08ce80d",
	"label": "Emerald Insight",
	"creator": "Sebastian Karcher",
	"target": "^https?://www\\.emerald\\.com/insight/(publication/|content/|search\\?)",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2019-10-29 01:43:27"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2019 Sebastian Karcher
	
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
// eslint-disable-next-line
function attr(docOrElem,selector,attr,index){var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector);return elem?elem.getAttribute(attr):null;}function text(docOrElem,selector,index){var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector);return elem?elem.textContent:null;}


function detectWeb(doc, url) {
	// ensure that we only detect where scrape will (most likely) work
	if (url.includes('/content/doi/') && (url.search(/\/(10\.[^#?/]+\/[^#?/]+)\//) != -1 || url.includes("/full"))) {
		if (attr(doc, 'meta[name="dc.Type"]', 'content') == "book-part") {
			return "bookSection";
		}
		else return "journalArticle";
	}
	else if (getSearchResults(doc, url, true)) {
		return "multiple";
	}
	return false;
}


function getSearchResults(doc, url, checkOnly) {
	var items = {};
	var found = false;
	var rows;
	if (url.includes("insight/search?")) {
		// search results
		rows = doc.querySelectorAll('h2>a.intent_link');
	}
	else {
		// journal issue or books,
		rows = doc.querySelectorAll('.intent_issue_item h4>a, li.intent_book_chapter>a');
	}
	for (let i = 0; i < rows.length; i++) {
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
		Zotero.selectItems(getSearchResults(doc, url, false), function (items) {
			if (!items) {
				return;
			}
			var articles = [];
			for (var i in items) {
				articles.push(i);
			}
			ZU.processDocuments(articles, scrape);
		});
	}
	else {
		scrape(doc, url);
	}
}


function scrape(doc, url) {
	var DOI = url.match(/\/(10\.[^#?/]+\/[^#?/]+)\//);
	var risURL;
	if (DOI) {
		risURL = "/insight/content/doi/" + DOI[1] + "/full/ris";
	}
	else {
		Z.debug("can't find DOI, trying alternative approach for risURL");
		risURL = url.replace(/\/full.*/, "/full/ris");
	}
	// Z.debug(risURL);
	
	var pdfURL;
	// make this works on PDF pages
	if (url.includes("full/pdf?")) {
		pdfURL = url;
	}
	else {
		pdfURL = attr(doc, 'a.intent_pdf_link', 'href');
	}

	// Z.debug("pdfURL: " + pdfURL);
	ZU.doGet(risURL, function (text) {
		// they number authors in their RIS...
		text = text.replace(/A\d+\s+-/g, "AU  -");

		var abstract = doc.getElementById('abstract');
		var translator = Zotero.loadTranslator("import");
		var tags = doc.querySelectorAll('li .intent_text');
		translator.setTranslator("32d59d2d-b65a-4da4-b0a3-bdd3cfb979e7");
		translator.setString(text);
		translator.setHandler("itemDone", function (obj, item) {
			if (pdfURL) {
				item.attachments.push({
					url: pdfURL,
					title: "Full Text PDF",
					mimeType: "application/pdf"
				});
			}
			else {
				item.attachments.push({
					title: "Snapshot",
					document: doc
				});
			}
			
			for (let tag of tags) {
				item.tags.push(tag.textContent);
			}
			// authors are in RIS as lastname firstname(s), though not necessarily correctly so
			// trying to correct for this
			for (let i = 0; i < item.creators.length; i++) {
				if (!item.creators[i].firstName && item.creators[i].lastName.includes(" ")) {
					item.creators[i].firstName = item.creators[i].lastName.match(/^\w+\s+(.+)/)[1];
					item.creators[i].lastName = item.creators[i].lastName.replace(/\s.+/, "");
					delete item.creators[i].fieldMode;
				}
			}
			if (item.date) {
				item.date = ZU.strToISO(item.date);
			}
			if (abstract) {
				item.abstractNote = ZU.trimInternal(abstract.textContent).replace(/^Abstract\s*/, "");
			}
			item.complete();
		});
		translator.translate();
	});
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://www.emerald.com/insight/content/doi/10.1108/IJPH-07-2016-0028/full/html",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Universal opt-out screening for hepatitis C virus (HCV) within correctional facilities is an effective intervention to improve public health",
				"creators": [
					{
						"lastName": "Morris",
						"creatorType": "author",
						"firstName": "Meghan D."
					},
					{
						"lastName": "Brown",
						"creatorType": "author",
						"firstName": "Brandon"
					},
					{
						"lastName": "Allen",
						"creatorType": "author",
						"firstName": "Scott A."
					}
				],
				"date": "2017-01-01",
				"DOI": "10.1108/IJPH-07-2016-0028",
				"ISSN": "1744-9200",
				"abstractNote": "Purpose Worldwide efforts to identify individuals infected with the hepatitis C virus (HCV) focus almost exclusively on community healthcare systems, thereby failing to reach high-risk populations and those with poor access to primary care. In the USA, community-based HCV testing policies and guidelines overlook correctional facilities, where HCV rates are believed to be as high as 40 percent. This is a missed opportunity: more than ten million Americans move through correctional facilities each year. Herein, the purpose of this paper is to examine HCV testing practices in the US correctional system, California and describe how universal opt-out HCV testing could expand early HCV detection, improve public health in correctional facilities and communities, and prove cost-effective over time. Design/methodology/approach A commentary on the value of standardizing screening programs across facilities by mandating all facilities (universal) to implement opt-out testing policies for all prisoners upon entry to the correctional facilities. Findings Current variability in facility-level testing programs results in inconsistent testing levels across correctional facilities, and therefore makes estimating the actual number of HCV-infected adults in the USA difficult. The authors argue that universal opt-out testing policies ensure earlier diagnosis of HCV among a population most affected by the disease and is more cost-effective than selective testing policies. Originality/value The commentary explores the current limitations of selective testing policies in correctional systems and provides recommendations and implications for public health and correctional organizations.",
				"issue": "3/4",
				"libraryCatalog": "Emerald Insight",
				"pages": "192-199",
				"publicationTitle": "International Journal of Prisoner Health",
				"url": "https://doi.org/10.1108/IJPH-07-2016-0028",
				"volume": "13",
				"attachments": [
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					}
				],
				"tags": [
					{
						"tag": "California"
					},
					{
						"tag": "Criminal justice system"
					},
					{
						"tag": "Epidemiology"
					},
					{
						"tag": "HCV testing"
					},
					{
						"tag": "Hepatitis C virus (HCV)"
					},
					{
						"tag": "Public health"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.emerald.com/insight/search?q=testing&advanced=true&openAccess=true",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://www.emerald.com/insight/content/doi/10.1108/S1085-462220150000016007/full/html",
		"items": [
			{
				"itemType": "bookSection",
				"title": "Creating a Cheat-Proof Testing and Learning Environment: A Unique Testing Opportunity for Each Student",
				"creators": [
					{
						"lastName": "Menk",
						"creatorType": "author",
						"firstName": "K. Bryan"
					},
					{
						"lastName": "Malone",
						"creatorType": "author",
						"firstName": "Stephanie"
					}
				],
				"date": "2015-01-01",
				"ISBN": "9781784415877 9781784415884",
				"abstractNote": "Originality/value This technique creates opportunities for students to have unique assignments encouraging student to student teaching and can be applied to assignments in any accounting course (undergraduate and graduate). This testing method has been used in Intermediate I and II, Individual Taxation, and Corporate Taxation.",
				"bookTitle": "Advances in Accounting Education: Teaching and Curriculum Innovations",
				"extra": "DOI: 10.1108/S1085-462220150000016007",
				"libraryCatalog": "Emerald Insight",
				"pages": "133-161",
				"publisher": "Emerald Group Publishing Limited",
				"series": "Advances in Accounting Education",
				"shortTitle": "Creating a Cheat-Proof Testing and Learning Environment",
				"url": "https://doi.org/10.1108/S1085-462220150000016007",
				"volume": "16",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					{
						"tag": "Accounting education"
					},
					{
						"tag": "Tax"
					},
					{
						"tag": "Testing procedures"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.emerald.com/insight/publication/issn/0140-9174/vol/32/iss/12",
		"items": "multiple"
	}
]
/** END TEST CASES **/
