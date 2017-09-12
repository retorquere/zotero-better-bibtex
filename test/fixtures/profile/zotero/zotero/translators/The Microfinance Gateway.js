{
	"translatorID": "2cd7d362-5fba-423a-887f-579ed343e751",
	"label": "The Microfinance Gateway",
	"creator": "Philipp Zumstein",
	"target": "^https?://(www\\.)?microfinancegateway\\.org/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2017-07-10 15:27:10"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2017 Philipp Zumstein
	
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


function detectWeb(doc, url) {
	if (url.indexOf('/library/')>-1) {
		return "report";
		//other types as events or press releases are ignored
	} else if (url.indexOf('/site-search?')>-1 && getSearchResults(doc, true)) {
		return "multiple";
	}
}

function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = ZU.xpath(doc, '//div[contains(@class, "views-row")]/div[contains(@class, "field-name-title-field")]/a[contains(@href, "/library/")]');
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
	var item = new Zotero.Item("report");
	item.title = ZU.xpathText(doc, '//main//h1');
	item.date = ZU.xpathText(doc, '//span[contains(@class, "date-display-single")]');
	var authorString = ZU.xpathText(doc, '//div[contains(@class, "field-name-field-publication-author")]/text()');
	//e.g. Hirschland, M., Jazayeri, A. & Lee, N.
	if (authorString) {
		var authors = authorString.split(/\.,|&/);
		for (var i=0; i<authors.length; i++) {
			item.creators.push(ZU.cleanAuthor(authors[i], "author", true));
		}
	}
	
	item.publisher = ZU.xpathText(doc, '(//div[contains(@class, "field-name-field-publication-publisher")])[1]');
	item.pages = ZU.xpathText(doc, '//div[contains(@class, "field-name-field-publication-links-pages")]');
	item.abstractNote = ZU.xpathText(doc, '//div[contains(@class, "field-name-body")]');
	if (item.abstractNote) {
		ZU.trimInternal(item.abstractNote);
	}
	item.reportType = ZU.xpathText(doc, '//div[contains(@class, "field-name-field-publication-type")]/a');
	var tags = ZU.xpath(doc, '//div[contains(@class, "field field-name-field-publication-topics")]/a');
	for (var i=0; i<tags.length; i++) {
		item.tags.push(tags[i].textContent);
	}
	item.url = ZU.xpathText(doc, '//link[@rel="canonical"]/@href') || url;
	var pdfurl = ZU.xpathText(doc, '//div[contains(@class, "field-name-field-publication-links")]/a/@href');
	if (pdfurl) {
		item.attachments.push({
			url: pdfurl,
			title: "Fulltext",
			mimeType: "application/pdf"
		});
	}
	item.complete();
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.microfinancegateway.org/library/reaching-hard-reach-literature-review",
		"items": [
			{
				"itemType": "report",
				"title": "Reaching the Hard to Reach: Literature Review",
				"creators": [
					{
						"firstName": "M.",
						"lastName": "Hirschland",
						"creatorType": "author"
					},
					{
						"firstName": "A.",
						"lastName": "Jazayeri",
						"creatorType": "author"
					},
					{
						"firstName": "N.",
						"lastName": "Lee",
						"creatorType": "author"
					}
				],
				"date": "Jun 2008",
				"abstractNote": "This paper summarizes findings of a study to assess the outreach that can be expected by different types of member-owned institutions (MOIs), and the key controllable factors that affect it. It seeks to find ways to support MOIs so that they continue to provide affordable financial services to remote rural populations.\nMOIs can achieve impressive outreach through growth and replication. They typically recover their costs and meet client’s demand at a lower cost than that incurred on alternatives. The study focuses on key drivers of outreach, namely, internal governance, networks and linkages, and regulation and supervision. The analysis is based on literature review and focuses on MOIs providing credit and savings services in Africa, Asia and Latin America.\nThe paper concludes with donor strategies and guidelines for supporting and strengthening MOI outreach and governance. Finally it poses a series of questions that need to be answered to further improve MOI outreach and governance.",
				"institution": "Coady International Institute",
				"libraryCatalog": "The Microfinance Gateway",
				"pages": "74",
				"reportType": "Paper",
				"shortTitle": "Reaching the Hard to Reach",
				"url": "http://www.microfinancegateway.org/library/reaching-hard-reach-literature-review",
				"attachments": [
					{
						"title": "Fulltext",
						"mimeType": "application/pdf"
					}
				],
				"tags": [
					"Donors",
					"Financial Inclusion",
					"Rural and Agricultural Finance"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.microfinancegateway.org/site-search?search_api_views_fulltext=germany&type=SearchPortlet&F1=%24all&O1=nea&P6=CTD_MFG_LibraryDocuments&F6=ITS_instance_of&O5=any&hForm=Library&O7=any&F7=Topic&P7=&O18=any&F18=Subtopic&P18=&O14=all&F14=Document+Title&O15=all&F15=Author&O16=all&F16=Abstract&O17=all&F17=Publisher&O8=all&F8=Country&O11=gte&F11=ISCUSTNUM1&O9=all&F9=Region&sortBy=&O13=any&F13=Avg+Rating&O12=all&F12=Document+Type&dateHelper=20130000000000%3AThis+Year%2C20110208000000%3ALast+2+Years%2C20080208000000%3ALast+5+Years%2C%3AAll+Dates%3B3&P1=informal&P11=&P8=&P9=&topicSelecter=&P12=&P13=&SO=rel&Submit_x=0&Submit_y=0&destination=p%2Fsite%2Fm%2Flibrary%2Ftemplate.rc",
		"items": "multiple"
	}
]
/** END TEST CASES **/