{
	"translatorID": "ab5983ab-6ad9-4060-aff1-4b455c89a3b3",
	"label": "Figshare",
	"creator": "Sebatian Karcher",
	"target": "^https?://figshare\\.com",
	"minVersion": "1.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsb",
	"lastUpdated": "2013-12-10 16:57:47"
}

/*
	***** BEGIN LICENSE BLOCK *****
	
	Figshare translator Copyright © 2013 Sebastian Karcher 
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


function detectWeb(doc, url) {
	if (url.indexOf("search?q") != -1 || url.indexOf("/browse") != -1) {
		return "multiple";
	} else if (url.indexOf("/article") != -1) {
		//no great item type here - switch once we have dataset.
		return "document";
	}
}

function doWeb(doc, url) {
	var arts = new Array();
	if (detectWeb(doc, url) == "multiple") {
		var items = new Object();
		var title;

		var titles = doc.evaluate('//div[@class="list_elem"]//a[contains(@href, "article")]', doc, null, XPathResult.ANY_TYPE, null);
		if (titles.iterateNext()) {
			while (title = titles.iterateNext()) {
				items[title.href] = title.textContent;
			}
		} else {
			var titles = doc.evaluate('//div[@class="textthumb"]/p', doc, null, XPathResult.ANY_TYPE, null);
			var links = doc.evaluate('//div[@class="imgthumb"]//a[contains(@href, "article")]', doc, null, XPathResult.ANY_TYPE, null);
			var link;
			while ((title = titles.iterateNext()) && (link = links.iterateNext())) {
				items[link.href] = title.textContent;
			}
		}
		Zotero.selectItems(items, function (items) {
			if (!items) {
				return true;
			}
			for (var i in items) {
				arts.push(i);
			}
			Zotero.Utilities.processDocuments(arts, scrape);
		});
	} else {
		scrape(doc, url);
	}
}

function scrape(doc, url) {
	var id = url.match(/\/(\d+)/);
	if (id) id = id[1];
	var get = 'http://figshare.com/articles/exportref?id=' + id;
	var downloadlink = ZU.xpathText(doc, '//div[@id="download_all"]/a/@href');
	if (downloadlink.indexOf("javascript:void") != -1) downloadlink = "";
	var DOI = ZU.xpathText(doc, '//meta[@name="citation_doi"]/@content')
	ZU.HTTP.doGet(get, function (text) {
		//Z.debug(text)
		text = text.trim()
		var translator = Zotero.loadTranslator("import");
		translator.setTranslator("32d59d2d-b65a-4da4-b0a3-bdd3cfb979e7");
		translator.setString(text);
		translator.setHandler("itemDone", function (obj, item) {
			//Authors are firstName LastName - fix
			for (i in item.creators) {
				//sometimes there _is_ a comma delimiter
				if (!item.creators[i].firstName) {
					item.creators[i] = ZU.cleanAuthor(item.creators[i].lastName, "author")
				}
			}
			//Remove period at end of title
			item.title = item.title.replace(/\.\s*$/, "");
			item.attachments.push({
				document: doc,
				title: "Figshare Snapshot",
				mimeType: "text/html"
			});
			item.DOI = DOI;
			if (downloadlink) {
				item.attachments.push({
					url: downloadlink,
					title: "Figshare Download"
				})
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
		"url": "http://figshare.com/articles/browse#thumb",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://figshare.com/articles/_Number_of_reported_pertussis_cases_per_week_in_Japan_from_2002_to_2012_/815480",
		"items": [
			{
				"itemType": "document",
				"creators": [
					{
						"firstName": "Yusuke",
						"lastName": "Miyaji",
						"creatorType": "author"
					},
					{
						"firstName": "Nao",
						"lastName": "Otsuka",
						"creatorType": "author"
					},
					{
						"firstName": "Hiromi",
						"lastName": "Toyoizumi-Ajisaka",
						"creatorType": "author"
					},
					{
						"firstName": "Keigo",
						"lastName": "Shibayama",
						"creatorType": "author"
					},
					{
						"firstName": "Kazunari",
						"lastName": "Kamachi",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [
					"japan",
					"cases",
					"2002",
					"pertussis"
				],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Full Text (HTML)",
						"mimeType": "text/html",
						"downloadable": true
					},
					{
						"title": "Figure_1",
						"downloadable": true
					},
					{
						"title": "Figshare Snapshot",
						"mimeType": "text/html"
					},
					{
						"title": "Figshare Download"
					}
				],
				"title": "Number of reported pertussis cases per week in Japan from 2002 to 2012",
				"url": "http://figshare.com/articles/_Number_of_reported_pertussis_cases_per_week_in_Japan_from_2002_to_2012_/815480",
				"abstractNote": "Pertussis cases are shown by the black line, with each value representing a week of the year. The percentage of adolescent and adult cases (≥15 years old) per year is shown in red circles. The data were obtained from the Ministry of Health, Labor and Welfare of Japan Infectious Disease Surveillance data. Data regarding the number of adolescent and adult cases in 2012 were not available.",
				"date": "October 5, 2013",
				"DOI": "doi:10.6084/m9.figshare.815480",
				"libraryCatalog": "Figshare",
				"accessDate": "CURRENT_TIMESTAMP"
			}
		]
	},
	{
		"type": "web",
		"defer": true,
		"url": "http://figshare.com/articles/search?q=labor&quick=1&x=0&y=0",
		"items": "multiple"
	}
]
/** END TEST CASES **/