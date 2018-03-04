{
	"translatorID": "3d180fcf-8005-4a2b-a0cd-1fe31ba1f996",
	"label": "Open Conf",
	"creator": "Sebastian Karcher",
	"target": "^https?://(www\\.)?openconf\\.(com|org)/.+/request\\.php",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2017-05-26 15:41:56"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2017 Sebastian Karcher
	
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
	if (ZU.xpathText(doc, '//div[@id="oc_program_summary_main"]')) {
		return "presentation";
	} 
	
	else if (url.indexOf('action=program.php')>-1 && getSearchResults(doc, true)) {
		return "multiple";
	} 
}


function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = ZU.xpath(doc, '//span[@class="oc_program_concurrentSessionPaperTitle"]/a');
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
	var item = new Z.Item("presentation");
	var data = ZU.xpath(doc, '//div[@id="oc_program_summary_main"]');
	//info from h1 and following line
	item.title = ZU.xpathText(data, '//h1');
	if (!item.title) item.title = ZU.xpathText(doc, '//h1');
		
	//info from top level li
	var authors = ZU.xpath(data, '//div[@id="oc_program_summary_authors"]/p/strong');
	for (var i = 0; i<authors.length; i++) {
		item.creators.push(ZU.cleanAuthor(authors[i].textContent, "author"));
	}
	item.abstractNote = ZU.xpathText(data, '//div[@id="oc_program_summary_main"]/p[1]');
	item.meetingName = ZU.xpathText(doc, '//div/a[@class="confName"]');
	
	var files = ZU.xpath(data, '//div[@id="oc_program_summary_files"]//a[img[contains(@alt, "View File")]]');
	
	for (var i = 0; i<files.length; i++) {
		item.attachments.push({
			title: "OpenConf Presentation",
			url: "files[i].href"
		})
	}
	
	item.attachments.push({
		title: "Snapshot",
		document: doc
	});
	var fullprogramURL = ZU.xpathText(doc, '//div[@id="mainbody"]/a[contains(@href, "action=program.php")]/@href');
	ZU.processDocuments(fullprogramURL, function (full){
			var dates = ZU.xpath(full, '//div[@class="oc_program_Date"]');
			if (dates.length) {
				var firstdate = dates[0].id;
				var lastdate;
				if (dates.length>1) {
					lastdate = dates[dates.length-1].id;
					item.date = firstdate + " to " + lastdate;
				}
	
				else {
					item.date = firstdate;
				}
			}
			item.complete();		
	});
}
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://www.openconf.com/demo/openconf6/modules/request.php?module=oc_program&action=program.php",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://www.openconf.com/demo/openconf6/modules/request.php?module=oc_program&action=summary.php&id=27",
		"items": [
			{
				"itemType": "presentation",
				"title": "The Infinite Monkey Protocol Suite (IMPS)",
				"creators": [
					{
						"firstName": "S.",
						"lastName": "Christey",
						"creatorType": "author"
					}
				],
				"date": "2015-12-01 to 2015-12-02",
				"abstractNote": "This memo describes a protocol suite which supports an infinite number of monkeys that sit at an infinite number of typewriters in order to determine when they have either produced the entire works of William Shakespeare or a good television show.  The suite includes communications and control protocols for monkeys and the organizations that interact with them.",
				"meetingName": "OpenConf Conference 2020",
				"attachments": [
					{
						"title": "OpenConf Presentation"
					},
					{
						"title": "OpenConf Presentation"
					},
					{
						"title": "Snapshot"
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