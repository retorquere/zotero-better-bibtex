{
	"translatorID": "ab5983ab-6ad9-4060-aff1-4b455c89a3b3",
	"label": "Figshare",
	"creator": "Sebatian Karcher",
	"target": "^https?://figshare\\.com/",
	"minVersion": "1.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsb",
	"lastUpdated": "2017-06-20 03:57:47"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Figshare translator Copyright © 2013-2016 Sebastian Karcher
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
	if ((url.indexOf("search?q") != -1 || url.indexOf("/browse") != -1 || url.indexOf("/categories/") != -1) && getSearchResults(doc, true)) {
		return "multiple";
	} else if (url.indexOf("/article") != -1) {
		//no great item type here - switch once we have dataset.
		return "document";
	}
}

function getSearchResults(doc, checkOnly) {
		var items = new Object();
		var found = false;
		//skip collections here
		var titles = ZU.xpath(doc, '//div[@class="item-title" and not(contains(@href, "/collections/"))]');
		//Z.debug(titles.length)
		for (var i = 0; i<titles.length; i++) {
			//.href does not work -- can't quite follow why but appears related to path depths
			var href = ZU.xpathText(titles[i], './@href');
			var title = titles[i].textContent;
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
			var arts = new Array();
			for (var i in items) {
				arts.push(i);
			}
			ZU.processDocuments(arts, scrape);
		});
	} else {
		scrape(doc, url);
	}
}

function scrape(doc, url) {
	var risURL = ZU.xpathText(doc, '//div[@class="exports-wrap section"]/div/a[contains(text(), "Ref. manager")]/@href');
	//Z.debug(risURL)
	ZU.HTTP.doGet(risURL, function (text) {
		//Z.debug(text)
		text = text.trim()
		text = text.replace(/L4 - .+/g, "");
		var translator = Zotero.loadTranslator("import");
		translator.setTranslator("32d59d2d-b65a-4da4-b0a3-bdd3cfb979e7");
		translator.setString(text);
		translator.setHandler("itemDone", function (obj, item) {
			//Authors are firstName LastName - fix
			for (i = 0; i<item.creators.length; i++) {
				//sometimes there _is_ a comma delimiter
				if (!item.creators[i].firstName) {
					item.creators[i] = ZU.cleanAuthor(item.creators[i].lastName, "author");
				}
			}
			//Remove period at end of title
			item.title = item.title.replace(/\.\s*$/, "");
			item.attachments.push({
				document: doc,
				title: "Figshare Snapshot",
				mimeType: "text/html"
			});
			
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
		"defer": true,
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://figshare.com/articles/_Number_of_reported_pertussis_cases_per_week_in_Japan_from_2002_to_2012_/815480",
		"items": [
			{
				"itemType": "document",
				"title": "Number of reported pertussis cases per week in Japan from 2002 to 2012",
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
				"date": "October 4, 2013",
				"abstractNote": "Pertussis cases are shown by the black line, with each value representing a week of the year. The percentage of adolescent and adult cases (≥15 years old) per year is shown in red circles. The data were obtained from the Ministry of Health, Labor and Welfare of Japan Infectious Disease Surveillance data. Data regarding the number of adolescent and adult cases in 2012 were not available.",
				"extra": "DOI: 10.1371/journal.pone.0077165.g001",
				"libraryCatalog": "Figshare",
				"url": "https://figshare.com/articles/_Number_of_reported_pertussis_cases_per_week_in_Japan_from_2002_to_2012_/815480",
				"attachments": [
					{
						"title": "Figshare Snapshot",
						"mimeType": "text/html"
					}
				],
				"tags": [
					"2002",
					"cases",
					"japan",
					"pertussis"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://figshare.com/search?q=labor&quick=1&x=0&y=0",
		"defer": true,
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://figshare.com/categories/Biological_Sciences/48",
		"defer": true,
		"items": "multiple"
	}
]
/** END TEST CASES **/