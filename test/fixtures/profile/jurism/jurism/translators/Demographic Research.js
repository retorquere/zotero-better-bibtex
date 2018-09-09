{
	"translatorID": "ed317bdd-0416-4762-856d-435004a9f05c",
	"label": "Demographic Research",
	"creator": "Sebatian Karcher",
	"target": "^https?://www\\.demographic-research\\.org",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2018-05-05 11:04:17"
}

/*
	***** BEGIN LICENSE BLOCK *****
	
	Demographic Research translator Copyright © 2014 Sebastian Karcher 
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
	if (url.search(/vol\d+\/default\.htm|search\/search\.aspx\?/)!=-1){
		return "multiple";	
	}
	else if (ZU.xpathText(doc, '//a[contains(@href, "/refman.plx?")]/@href')){
		return "journalArticle";	
	}
}

function doWeb(doc, url) {
	var arts = [];
	if (detectWeb(doc, url) == "multiple") {
		var items = {};
		var title;

		var titles = doc.evaluate('//p[@class="articles_title"]/a|//div[@class="result_title"]/a', doc, null, XPathResult.ANY_TYPE, null);
		var link;
		while (title = titles.iterateNext()) {
			//search results routinely go to PDFs instead of item pages. Fixing that here
			link = title.href.replace(/\d+\-\d+\.pdf.*/, "");
			items[link] = title.textContent;
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
	var get = ZU.xpathText(doc, '//a[contains(@href, "/refman.plx?")]/@href');
	//Z.debug(get)
	ZU.HTTP.doGet(get, function (text) {
		//The DOI is saved in N1 - fix that
		text = text.replace(/N1  - /, "DO  - ");
		//Z.debug(text);
		var translator = Zotero.loadTranslator("import");
		translator.setTranslator("32d59d2d-b65a-4da4-b0a3-bdd3cfb979e7");
		translator.setString(text);
		translator.setHandler("itemDone", function (obj, item) {
			item.ISSN = "1435-9871";
			var pdfurl = item.url + item.volume + "-" + item.issue + ".pdf";
			//Z.debug(pdfurl)
			item.attachments.push({
				url: pdfurl,
				title: "Demographic Research Full Text PDF",
				mimeType: "application/pdf"
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
		"url": "https://www.demographic-research.org/volumes/vol31/17/default.htm",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Age patterns of racial/ethnic/nativity differences in disability and physical functioning in the United States",
				"creators": [
					{
						"lastName": "Melvin",
						"firstName": "Jennifer",
						"creatorType": "author"
					},
					{
						"lastName": "Hummer",
						"firstName": "Robert",
						"creatorType": "author"
					},
					{
						"lastName": "Elo",
						"firstName": "Irma T.",
						"creatorType": "author"
					},
					{
						"lastName": "Mehta",
						"firstName": "Neil",
						"creatorType": "author"
					}
				],
				"date": "August 26, 2014",
				"DOI": "10.4054/DemRes.2014.31.17",
				"ISSN": "1435-9871",
				"abstractNote": "Background: Rapid population aging and increasing racial/ethnic and immigrant/native diversity make a broad documentation of U.S. health patterns during both mid- and late life particularly important.\n\nObjective: We aim to better understand age- and gender-specific racial/ethnic and nativity differences in physical functioning and disability among adults aged 50 and above.\n\nMethods: We aggregate 14 years of data from the National Health Interview Survey and calculate age- and gender-specific proportions of physical functioning and two types of disability for each population subgroup.\n\nResults: Middle-aged foreign-born individuals in nearly every subgroup exhibit lower proportions of functional limitations and disability than U.S.-born whites. This pattern of immigrant advantage is generally reversed in later life. Moreover, most U.S.-born minority groups have significantly higher levels of functional limitations and disability than U.S.-born whites in both mid- and late life.\n\nConclusions: Higher levels of functional limitations and disability among U.S.-born minority groups and immigrant populations in older adulthood pose serious challenges for health providers and policymakers in a rapidly diversifying and aging population.",
				"issue": "17",
				"journalAbbreviation": "Demographic Research",
				"libraryCatalog": "Demographic Research",
				"pages": "497-510",
				"publicationTitle": "Demographic Research",
				"url": "https://www.demographic-research.org/volumes/vol31/17/",
				"volume": "31",
				"attachments": [
					{
						"title": "Demographic Research Full Text PDF",
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
		"url": "https://www.demographic-research.org/volumes/vol31/default.htm",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://www.demographic-research.org/search/search.aspx?zoom_sort=0&zoom_xml=0&zoom_query=labor&zoom_per_page=10&zoom_and=0",
		"items": "multiple"
	}
]
/** END TEST CASES **/
