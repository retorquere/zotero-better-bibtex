{
	"translatorID": "cd669d1f-96b8-4040-aa36-48f843248399",
	"translatorType": 4,
	"label": "Primo 2018",
	"creator": "Philipp Zumstein",
	"target": "(/primo-explore/|/discovery/(search|fulldisplay|jsearch|dbsearch|npsearch|openurl|jfulldisplay|dbfulldisplay|npfulldisplay)\\?)",
	"minVersion": "3.0",
	"maxVersion": null,
	"priority": 100,
	"inRepository": true,
	"browserSupport": "gcsibv",
	"lastUpdated": "2021-06-14 17:05:00"
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
		"url": "http://virtuose.uqam.ca/primo-explore/fulldisplay?vid=UQAM&docid=UQAM_BIB000969205&context=L",
		"defer": true,
		"items": [
			{
				"itemType": "book",
				"title": "War",
				"creators": [
					{
						"lastName": "Baynes",
						"firstName": "Ken",
						"creatorType": "author"
					},
					{
						"firstName": "Ken",
						"lastName": "Baynes",
						"creatorType": "author"
					},
					{
						"lastName": "Welsh Arts Council",
						"creatorType": "contributor",
						"fieldMode": 1
					},
					{
						"lastName": "Glynn Vivian Art Gallery",
						"creatorType": "contributor",
						"fieldMode": 1
					}
				],
				"date": "1970",
				"callNumber": "NX650G8B38",
				"language": "eng",
				"libraryCatalog": "virtuose.uqam.ca",
				"place": "Boston",
				"publisher": "Book and Art Chop",
				"series": "Art and society 1",
				"attachments": [],
				"tags": [
					{
						"tag": "ART; GUERRE; WAR"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://bcujas-catalogue.univ-paris1.fr/primo-explore/fulldisplay?vid=CUJAS_V1&docid=33CUJAS_ALEPH000070200&context=L&search_scope=LSCOP_ALL",
		"defer": true,
		"items": [
			{
				"itemType": "book",
				"title": "Test pattern for living",
				"creators": [
					{
						"firstName": "Nicholas",
						"lastName": "Johnson",
						"creatorType": "author"
					}
				],
				"date": "1972",
				"callNumber": "203.206",
				"language": "eng",
				"libraryCatalog": "bcujas-catalogue.univ-paris1.fr",
				"numPages": "xx+154",
				"place": "Toronto New York",
				"publisher": "Bantam Books",
				"attachments": [],
				"tags": [
					{
						"tag": "Mass media"
					},
					{
						"tag": "Social aspects"
					},
					{
						"tag": "United States"
					},
					{
						"tag": "United States"
					},
					{
						"tag": "Social conditions"
					},
					{
						"tag": "1960-"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/
