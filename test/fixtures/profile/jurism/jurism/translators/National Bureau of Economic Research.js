{
	"translatorID": "99f958ab-0732-483d-833f-6bd8e42f6277",
	"label": "National Bureau of Economic Research",
	"creator": "Michael Berkowitz, Philipp Zumstein",
	"target": "^https?://(papers\\.|www\\.)?nber\\.org/(papers|s|new|custom)",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2018-02-11 13:50:53"
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
	if (ZU.xpathText(doc, '//a[contains(text(), "RIS")]')) {
		return "report";
	} else if (getSearchResults(doc, true)) {
		return "multiple";
	}
}


function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = doc.querySelectorAll('a.resultTitle, li>a[href*="papers/w"], td>a[href*="papers/w"]');
	for (let i=0; i<rows.length; i++) {
		let href = rows[i].href;
		let title = ZU.trimInternal(rows[i].textContent);
		if (!href || !title) continue;
		if (href.match(/\.pdf$/)) continue;
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
				articles.push(bibURL(i));
			}
			scrape(doc, articles);
		});
	} else {
		scrape(doc, bibURL(url));
	}
}


function scrape(doc, url){
	// url is either a single url or an array of urls
	Zotero.Utilities.HTTP.doGet(url, function(text) {
		var translator = Zotero.loadTranslator("import");
		translator.setTranslator("9cb70025-a888-4a29-a210-93ec52da40d4");
		translator.setString(text);
		translator.setHandler("itemDone", function(obj, item) {
			var pdfurl = item.url + ".pdf";
			item.attachments = [];
			item.attachments.push({
				url:pdfurl,
				title: "Full Text PDF",
				mimeType:"application/pdf"
			});
			item.complete();	
		});
		translator.translate();
	});
}


function bibURL(url){
	url = url.replace(/[\?\#].+/, "");
	url = url + ".bib";
	return url;
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.nber.org/papers/w17577",
		"items": [
			{
				"itemType": "report",
				"title": "The Dynamics of Firm Lobbying",
				"creators": [
					{
						"firstName": "William R.",
						"lastName": "Kerr",
						"creatorType": "author"
					},
					{
						"firstName": "William F.",
						"lastName": "Lincoln",
						"creatorType": "author"
					},
					{
						"firstName": "Prachi",
						"lastName": "Mishra",
						"creatorType": "author"
					}
				],
				"date": "November 2011",
				"abstractNote": "We study the determinants of the dynamics of firm lobbying behavior using a panel data set covering 1998-2006. Our data exhibit three striking facts: (i) few firms lobby, (ii) lobbying status is strongly associated with firm size, and (iii) lobbying status is highly persistent over time. Estimating a model of a firm's decision to engage in lobbying, we find significant evidence that up-front costs associated with entering the political process help explain all three facts. We then exploit a natural experiment in the expiration in legislation surrounding the H-1B visa cap for high-skilled immigrant workers to study how these costs affect firms' responses to policy changes. We find that companies primarily adjusted on the intensive margin: the firms that began to lobby for immigration were those who were sensitive to H-1B policy changes and who were already advocating for other issues, rather than firms that became involved in lobbying anew. For a firm already lobbying, the response is determined by the importance of the issue to the firm's business rather than the scale of the firm's prior lobbying efforts. These results support the existence of significant barriers to entry in the lobbying process.",
				"extra": "DOI: 10.3386/w17577",
				"institution": "National Bureau of Economic Research",
				"itemID": "NBERw17577",
				"libraryCatalog": "National Bureau of Economic Research",
				"reportNumber": "17577",
				"reportType": "Working Paper",
				"url": "http://www.nber.org/papers/w17577",
				"attachments": [
					{
						"title": "NBER Full Text PDF",
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
		"url": "http://papers.nber.org/s/search?restrict_papers=yes&whichsearch=db&client=test3_fe&proxystylesheet=test3_fe&site=default_collection&entqr=0&ud=1&output=xml_no_dtd&oe=UTF-8&ie=UTF-8&sort=date%253AD%253AL%253Ad1&q=labor",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://papers.nber.org/new.html",
		"items": "multiple"
	}
]
/** END TEST CASES **/
