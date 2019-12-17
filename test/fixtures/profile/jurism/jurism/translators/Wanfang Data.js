{
	"translatorID": "eb876bd2-644c-458e-8d05-bf54b10176f3",
	"label": "Wanfang Data",
	"creator": "Ace Strong <acestrong@gmail.com>",
	"target": "^https?://[ds]\\.(g\\.)?wanfangdata\\.com\\.cn",
	"minVersion": "2.0rc1",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcs",
	"lastUpdated": "2019-06-10 22:46:01"
}

/*
   Wanfang Data Translator
   Copyright (C) 2010 TAO Cheng, acestrong@gmail.com

   This program is free software: you can redistribute it and/or modify
   it under the terms of the GNU General Public License as published by
   the Free Software Foundation, either version 3 of the License, or
   (at your option) any later version.

   This program is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   GNU General Public License for more details.

   You should have received a copy of the GNU General Public License
   along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

// #######################
// ##### Sample URLs #####
// #######################

/*
 * The starting point for an search is the URL below.
 * In testing, I tried the following:
 *
 *   - A search listing of journals
 *   - A search listing of thesis
 *   - A search listing of conference papers
 *   - A search listing of foreign literatures(for chinese)
 *   - A journal paper page
 *   - A thesis page
 *   - A conference paper page
 *   - A foreign literature page
 */
// http://g.wanfangdata.com.cn/Default.aspx


// #################################
// #### Local utility functions ####
// #################################

// sets the rs cookie value to the provided ID and returns the old value
function setCookie(doc, rsId) {
	if (!rsId) return null;

	var matches = doc.cookie.match(/(?:$|; )rs=([^;]*)/);
	var oldCookie = matches ? unescape(matches[1]) : null;

	var domain = escape('wanfangdata.com.cn');
	var id = escape(rsId);

	doc.cookie = 'rs=' + id + ';domain=' + domain;

	return oldCookie;
}

function detectCode(url) {
	var pattern = /[ds]\.(?:g\.)?wanfangdata\.com\.cn\/([A-Za-z]*?)_/;
	if (pattern.test(url)) {
		var code = pattern.exec(url)[1];
		return code;
	}
	return null;
}

function detectType(code) {
	if (code == "Periodical"
		|| code == "OAPaper") {
		return "journalArticle";
	}
	else if (code == "Thesis") {
		return "thesis";
	}
	else if (code == "Conference") {
		return "conferencePaper";
	}
	else if (code == "NSTLHY") {
		return "conferencePaper";
	}
	else if (code == "NSTLQK") {
		return "journalArticle";
	}
	else {
		return false;
	}
}

function getSearchResults(doc, checkOnly) {
	var items = [], found = false,
		lis = ZU.xpath(doc, '//li[contains(@class,"title_li")]');
	for (var i = 0, n = lis.length; i < n; i++) {
		var a = lis[i].getElementsByTagName("a")[1];
		var title = ZU.trimInternal(ZU.cleanTags(a.textContent));
		var link = a.getAttribute("href").match(/\/([^/]+)\.aspx/)[1];
		if (!link) continue;
		
		if (checkOnly) return true;
		
		items[link] = title;
		found = true;
	}
	
	return found ? items : false;
}

function getItemId(doc) {
	var action = ZU.xpathText(doc, '//form[@id="aspnetForm"]/@action');
	if (!action) return null;
	
	var id = action.match(/(?:\?|&)ID=([^&]+)/);
	if (!id) return null;
	
	return id[1];
}

// #############################
// ##### Scraper functions #####
// #############################

function scrape(doc, id) {
	id = '|' + id + '|';
	var oldCookie = setCookie(doc, id);

	var exportUrl = 'http://s.wanfangdata.com.cn/Export/Export.aspx?scheme=EndNote';

	ZU.doGet(exportUrl, function (text) {
		var matches = text.match(/<div\s+id=["']export_container["']>((?:.|[\r\n])+?)<\/div>/i);
		if (!matches) return;

		text = ZU.cleanTags(matches[1].replace(/[\r\n]/g, ''));

		var translator = Zotero.loadTranslator('import');
		translator.setTranslator('881f60f2-0802-411a-9228-ce5f47b64c7d');
		translator.setString(text);
		translator.setHandler('itemDone', function (obj, item) {
			// author first and last names are mixed up
			for (var i = 0, n = item.creators.length; i < n; i++) {
				if (!item.creators[i].firstName) continue;
				var first = item.creators[i].lastName;
				item.creators[i].lastName = item.creators[i].firstName;
				item.creators[i].firstName = first;
			}

			// type is actually DOI
			if (item.type) {
				item.DOI = item.type;
				delete item.type;
			}

			// tags are messed up
			item.tags = [];

			item.complete();
		});

		translator.setHandler('done', function () {
			setCookie(doc, oldCookie);
		});

		translator.translate();
	});
}

// #########################
// ##### API functions #####
// #########################

function detectWeb(doc, url) {
	if (url.toLowerCase().includes('paper.aspx')
		&& getSearchResults(doc, true)
	) {
		return "multiple";
	}
	
	let pattern = /[ds]\.(?:g\.)?wanfangdata\.com\.cn/;
	if (pattern.test(url) && getItemId(doc)) {
		var code = detectCode(url);
		return detectType(code);
	}

	return false;
}

function doWeb(doc, url) {
	if (detectWeb(doc, url) == "multiple") {
		// search page
		var items = getSearchResults(doc);

		Zotero.selectItems(items, function (selectedItems) {
			if (!selectedItems) return;
		
			var urls = [];
			for (var i in selectedItems) {
				urls.push(i);
			}

			var ids = '|' + urls.join('|') + '|';
			scrape(doc, ids);
		});
	}
	else {
		var id = getItemId(doc);
		scrape(doc, id);
	}
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://d.wanfangdata.com.cn/Periodical_xdqb200902027.aspx",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "参考文献管理工具研究",
				"creators": [
					{
						"firstName": "",
						"lastName": "余敏",
						"creatorType": "author"
					},
					{
						"firstName": "",
						"lastName": "朱江",
						"creatorType": "author"
					},
					{
						"firstName": "",
						"lastName": "丁照蕾",
						"creatorType": "author"
					}
				],
				"date": "2009",
				"DOI": "10.3969/j.issn.1008-0821.2009.02.027",
				"abstractNote": "介绍了参考文献管理的基本方法,对参考文献管理工具的主要功能进行了对比,最后分析了参考文献管理的趋势.",
				"archiveLocation": "北京万方数据股份有限公司",
				"extra": "Yu Min\nZhu Jiang\nDing Zhaolei",
				"issue": "2",
				"libraryCatalog": "Wanfang Data",
				"pages": "94-98,93",
				"publicationTitle": "JOURNAL OF MODERN INFORMATION",
				"url": "http://d.wanfangdata.com.cn/Periodical_xdqb200902027.aspx",
				"volume": "29",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://d.wanfangdata.com.cn/NSTLQK_NSTL_QKJJ0216348353.aspx",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Zotero: harnessing the power of a personal bibliographic manager.",
				"creators": [
					{
						"firstName": "JT",
						"lastName": "Coar",
						"creatorType": "author"
					},
					{
						"firstName": "JP",
						"lastName": "Sewell",
						"creatorType": "author"
					}
				],
				"date": "2010",
				"ISBN": "0363-3624",
				"abstractNote": "Zotero is a powerful free personal bibliographic manager (PBM) for writers. Use of a PBM allows the writer to focus on content, rather than the tedious details of formatting citations and references. Zotero 2.0 (http://www.zotero.org) has new features including the ability to synchronize citations with the off-site Zotero server and the ability to collaborate and share with others. An overview on how to use the software and discussion about the strengths and limitations are included.",
				"accessDate": "CURRENT_TIMESTAMP",
				"archiveLocation": "北京万方数据股份有限公司",
				"issue": "5",
				"libraryCatalog": "Wanfang Data",
				"pages": "205-207",
				"publicationTitle": "Nurse educator",
				"shortTitle": "Zotero",
				"url": "http://d.wanfangdata.com.cn/NSTLQK_NSTL_QKJJ0216348353.aspx",
				"volume": "35",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://s.wanfangdata.com.cn/Paper.aspx?q=zotero+DBID%3A%28NSTL_QK+OR+NSTL_HY%29&f=d.top",
		"items": "multiple"
	}
]
/** END TEST CASES **/
