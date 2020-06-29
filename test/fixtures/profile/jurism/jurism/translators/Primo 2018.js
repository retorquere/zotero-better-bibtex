{
	"translatorID": "cd669d1f-96b8-4040-aa36-48f843248399",
	"label": "Primo 2018",
	"creator": "Philipp Zumstein",
	"target": "(/primo-explore/|/discovery/(search|fulldisplay|jsearch|dbsearch|npsearch|openurl|jfulldisplay|dbfulldisplay|npfulldisplay)\\?)",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2018-06-14 05:49:37"
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


function detectWeb(doc, _url) {
	var rows = doc.querySelectorAll('.urlToXmlPnx[data-url]');
	if (rows.length == 1) return "book";
	if (rows.length > 1) return "multiple";
	return false;
}


function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = doc.querySelectorAll('.urlToXmlPnx[data-url]');
	for (let i = 0; i < rows.length; i++) {
		let href = rows[i].dataset.url;
		let title = rows[i].parentNode.textContent;
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
		var urlpnx = attr(doc, '.urlToXmlPnx[data-url]', 'data-url');
		scrape(doc, urlpnx);
	}
}


function scrape(doc, pnxurl) {
	ZU.doGet(pnxurl, function (text) {
		var translator = Zotero.loadTranslator("import");
		translator.setTranslator("efd737c9-a227-4113-866e-d57fbc0684ca");
		translator.setString(text);
		translator.setHandler("itemDone", function (obj, item) {
			if (pnxurl) {
				item.libraryCatalog = pnxurl.match(/^https?:\/\/(.+?)\//)[1].replace(/\.hosted\.exlibrisgroup/, "");
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
		"url": "https://primo-qa.hosted.exlibrisgroup.com/primo-explore/search?query=any,contains,zotero&tab=everything&search_scope=TCCDALMA_EVERYTHING&vid=TCCDALMA&lang=en_US&offset=0",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://primo-qa.hosted.exlibrisgroup.com/primo-explore/fulldisplay?vid=TCCDALMA&search_scope=TCCDALMA_EVERYTHING&tab=everything&docid=TCCD_ALMA2136169630001641&lang=en_US&context=L&adaptor=Local%20Search%20Engine&isFrbr=true&query=any,contains,adam%20smith&sortby=rank&offset=0",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://primo-qa.hosted.exlibrisgroup.com/primo-explore/search?query=any,contains,mannheim&tab=everything&search_scope=TCCDALMA_EVERYTHING&vid=TCCDALMA&sortby=rank&lang=en_US",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://primo-demo.exlibrisgroup.com:1701/primo-explore/fulldisplay?docid=TN_gvrl_refCX4183000563&context=PC&vid=NORTH&search_scope=PC&tab=articles&lang=en_US",
		"items": [
			{
				"itemType": "encyclopediaArticle",
				"title": "Water",
				"creators": [],
				"date": "2012",
				"ISBN": "9781452218557",
				"language": "eng",
				"libraryCatalog": "primo-demo.exlibrisgroup.com:1701",
				"pages": "1775–1778",
				"attachments": [],
				"tags": [
					{
						"tag": "Drinking Water"
					},
					{
						"tag": "Fresh Water"
					},
					{
						"tag": "Residential Water Supply"
					},
					{
						"tag": "Water Distribution"
					},
					{
						"tag": "Water Treatment"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/
