{
	"translatorID": "8b73dd9c-b873-4d13-b36a-45922b9f04a1",
	"label": "WikiLeaks PlusD",
	"creator": "Sebastian Karcher",
	"target": "^https?://(search\\.|www\\.)?wikileaks\\.org/plusd/",
	"minVersion": "2.1.9",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2017-06-17 20:49:34"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2017-2019 Sebastian Karcher

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
	if (url.includes("/plusd/?") && getSearchResults(doc, url, true)) {
		return "multiple";
	}
	else if (url.includes("/plusd/cables/")) {
		return "report";
	}
}


function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var toc = doc.getElementById("doc_list");
	var rows = ZU.xpath(toc, '//tr[@class="sclick"]/td[3]/a[contains(@href, "/cables/")]');
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
			var articles = new Array();
			for (var i in items) {
				articles.push(i);
			}
			//Z.debug(articles)
			ZU.processDocuments(articles, scrape);
		});
	} else {
		scrape(doc, url);
	}
}
var fieldMap = {
	"canonical id": "reportNumber",
	"from": "publisher", //not sure -- could also be place
	"date": "date"
};
function scrape(doc, url) {
	var item = new Zotero.Item('report');
	item.url = url;
	item.title = ZU.capitalizeTitle(ZU.xpathText(doc, '//table[@id="synopsis"]/tbody/tr[1]').trim().toLowerCase(), true);
	var nodes = ZU.xpath(doc, '//table[@id="synopsis"]/tbody/tr/td');
	for (var i = 0; i<nodes.length; i++) {
		var key = ZU.xpathText(nodes[i], './div[@class="s_key"]');
		var value = ZU.xpathText(nodes[i], './div[@class="s_val"]');
		if (key) {
			key = key.replace(/:/g, "").toLowerCase();
		}
		//Z.debug(key + ": " + value)
		if (fieldMap[key] && value){
			item[fieldMap[key]] = value;
		}
		else if (key == "tags") {
			var tags = value.split(/\s*\|\s*/);
			for (var j = 0; j<tags.length; j++){
				item.tags.push(tags[j]);
			}
		}
	}
	//not sure here about mapping
	item.reportType = "Wikileaks Public Library of US Diplomacy";
	item.attachments.push({document: doc, title: "WikiLeaks PLUSD Snapshot"});
	item.complete();
}
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://search.wikileaks.org/plusd/cables/10SHANGHAI60_a.html",
		"items": [
			{
				"itemType": "report",
				"title": "Deflating Zhejiang's Property Bubble",
				"creators": [],
				"date": "2010 February 26, 11:30 (Friday)",
				"institution": "China Shanghai",
				"libraryCatalog": "WikiLeaks PlusD",
				"reportNumber": "10SHANGHAI60_a",
				"reportType": "Wikileaks Public Library of US Diplomacy",
				"url": "https://search.wikileaks.org/plusd/cables/10SHANGHAI60_a.html",
				"attachments": [
					{
						"title": "WikiLeaks PLUSD Snapshot"
					}
				],
				"tags": [
					"AE - United Arab Emirates",
					"CH - China (Mainland)",
					"ECON - Economic Affairs--Economic Conditions, Trends and Potential",
					"EFIN - Economic Affairs--Financial and Monetary Affairs",
					"EINV - Economic Affairs--Investments; Foreign Investments",
					"PGOV - Political Affairs--Government; Internal Governmental Affairs"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://search.wikileaks.org/plusd/cables/1975DACCA00292_b.html",
		"items": [
			{
				"itemType": "report",
				"title": "Ecfmg Examination",
				"creators": [],
				"date": "1975 January 1, 00:00 (Wednesday)",
				"institution": "Bangladesh Dhaka",
				"libraryCatalog": "WikiLeaks PlusD",
				"reportNumber": "1975DACCA00292_b",
				"reportType": "Wikileaks Public Library of US Diplomacy",
				"url": "https://search.wikileaks.org/plusd/cables/1975DACCA00292_b.html",
				"attachments": [
					{
						"title": "WikiLeaks PLUSD Snapshot"
					}
				],
				"tags": [
					"AFSP - Administration--Post Administration",
					"BG - Bangladesh"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://search.wikileaks.org/plusd/?qproject[]=ps&qproject[]=cc&qproject[]=fp&qproject[]=cg&q=&qtfrom=1975-01-01#result",
		"items": "multiple"
	}
];
/** END TEST CASES **/
