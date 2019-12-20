{
	"translatorID": "94a8328a-ec87-4ba0-82b6-cf3000ea1dee",
	"label": "PyPI",
	"creator": "Philipp Zumstein",
	"target": "^https?://pypi\\.org/(project|search)",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2018-11-03 08:21:27"
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
	if (url.includes('/project')) {
		return "computerProgram";
	} else if (getSearchResults(doc, true)) {
		return "multiple";
	}
}


function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = ZU.xpath(doc, '//a[contains(@class, "package-snippet") and contains(@href, "/project/")]');
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
	var item = new Z.Item("computerProgram");

	// info from h1 and meta tag
	item.title = ZU.xpathText(doc, '//h1[contains(@class, "package-header__name")]');
	var found = item.title.match(/\sv?([\d.]+)\s*$/);
	if (found) {
		item.title = item.title.slice(0,found.index);
		item.version = found[1];
	}
	var subtitle = ZU.xpathText(doc, '//meta[@property="og:description"]/@content');
	if (subtitle) {
		item.title += ": " + subtitle;
	}
	
	var author = ZU.xpathText(doc, '//div[contains(@class, "vertical-tabs__tabs")]//p[strong[contains(., "Author")]]/a');
	if (author) {
		item.creators.push(ZU.cleanAuthor(author, "author"));
	}
	item.url = ZU.xpathText(doc, '//div[contains(@class, "vertical-tabs__tabs")]//a[contains(., "Homepage")]/@href');
	item.rights = ZU.xpathText(doc, '//div[contains(@class, "vertical-tabs__tabs")]//p[strong[contains(., "License")]]/text()');
	var keywords = ZU.xpath(doc, '//div[contains(@class, "vertical-tabs__tabs")]//span[contains(@class, "package-keyword")]');
	for (let keyword of keywords) {
		item.tags.push(keyword.textContent.trim());
	}
	
	// info from linked categories
	var programmingLanguage = ZU.xpath(doc, '//div[contains(@class, "vertical-tabs__tabs")]//a[contains(@href, "/search/?c=Programming+Language+")]');
	for (let i=0; i<programmingLanguage.length; i++) {
		let split = programmingLanguage[i].textContent.split("::");
		let value = split[0].trim();
		if (item.programmingLanguage) {
			if (!item.programmingLanguage.includes(value)) {
				item.programmingLanguage += ", " + value;
			}
		} else {
			item.programmingLanguage = value;
		}
	}
	var topics = ZU.xpath(doc, '//div[contains(@class, "vertical-tabs__tabs")]//a[contains(@href, "/search/?c=Topic+")]');
	for (let topic of topics) {
		let split = topic.textContent.trim().split(" :: ");
		item.tags.push(split.join(" - "));
	}
	var license = ZU.xpathText(doc, '//div[contains(@class, "vertical-tabs__tabs")]//a[contains(@href, "/search/?c=License+")]');
	if (license && !item.rights) {
		item.rights = license;
	}
	if (item.rights) {
		item.rights = item.rights.replace(/\s?\([^\)]+\)/g, '');
	}
	var osList = ZU.xpath(doc, '//div[contains(@class, "vertical-tabs__tabs")]//a[contains(@href, "/search/?c=Operating+System+")]');
	if (osList && !item.system) {
		osList = osList.map(os => os.textContent.trim());
		item.system = osList.join(', ');
	}

	item.attachments.push({
		title: "Snapshot",
		document: doc
	});
	
	item.complete();
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://pypi.org/search/?q=zotero",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://pypi.org/project/simplejson/3.10.0/",
		"items": [
			{
				"itemType": "computerProgram",
				"title": "simplejson: Simple, fast, extensible JSON encoder/decoder for Python",
				"creators": [
					{
						"firstName": "Bob",
						"lastName": "Ippolito",
						"creatorType": "author"
					}
				],
				"libraryCatalog": "PyPI",
				"programmingLanguage": "Python",
				"rights": "Academic Free License, MIT License",
				"shortTitle": "simplejson",
				"url": "http://github.com/simplejson/simplejson",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					{
						"tag": "Software Development - Libraries - Python Modules"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://pypi.org/search/?c=Topic+%3A%3A+Scientific%2FEngineering+%3A%3A+Image+Recognition",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://pypi.org/project/lxml/3.7.3/",
		"items": [
			{
				"itemType": "computerProgram",
				"title": "lxml: Powerful and Pythonic XML processing library combining libxml2/libxslt with the ElementTree API.",
				"creators": [
					{
						"firstName": "lxml dev",
						"lastName": "team",
						"creatorType": "author"
					}
				],
				"libraryCatalog": "PyPI",
				"programmingLanguage": "C, Cython, Python",
				"rights": "BSD License",
				"shortTitle": "lxml",
				"system": "OS Independent",
				"url": "http://lxml.de/",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					{
						"tag": "Software Development - Libraries - Python Modules"
					},
					{
						"tag": "Text Processing - Markup - HTML"
					},
					{
						"tag": "Text Processing - Markup - XML"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://pypi.org/project/papis-zotero/",
		"items": [
			{
				"itemType": "computerProgram",
				"title": "papis-zotero: Interact with zotero using papis",
				"creators": [
					{
						"firstName": "Alejandro",
						"lastName": "Gallo",
						"creatorType": "author"
					}
				],
				"libraryCatalog": "PyPI",
				"programmingLanguage": "Python",
				"rights": "GNU General Public License v3",
				"shortTitle": "papis-zotero",
				"system": "MacOS, POSIX, Unix",
				"url": "https://github.com/papis/papis-zotero",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					{
						"tag": "Utilities"
					},
					{
						"tag": "bibtex,"
					},
					{
						"tag": "biliography"
					},
					{
						"tag": "cli,"
					},
					{
						"tag": "management,"
					},
					{
						"tag": "papis,"
					},
					{
						"tag": "zotero,"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/
