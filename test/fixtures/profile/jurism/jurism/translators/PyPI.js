{
	"translatorID": "94a8328a-ec87-4ba0-82b6-cf3000ea1dee",
	"label": "PyPI",
	"creator": "Philipp Zumstein",
	"target": "^https?://pypi\\.python\\.org/pypi",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2017-05-13 13:11:51"
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
	if (ZU.xpathText(doc, '//head/link[@rel="meta" and @title="DOAP"]/@href')) {
		return "computerProgram";
	} else if ((url.indexOf('action=search')>-1 || url.indexOf('action=browse')>-1) && getSearchResults(doc, true)) {
		return "multiple";
	}
}


function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = ZU.xpath(doc, '//tr/td/a[contains(@href, "/pypi/")]');
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

	//info from h1 and following line
	item.title = ZU.xpathText(doc, '//h1[not(@id="logoheader")]');
	var found = item.title.match(/\sv?([\d.]+)$/);
	if (found) {
		item.title = item.title.slice(0,found.index);
		item.version = found[1];
	}
	var subtitle = ZU.xpathText(doc, '//h1[not(@id="logoheader")]/following::p[1]');
	if (subtitle) {
		item.title += ": " + subtitle;
	}
	
	//info from top level li
	var author = ZU.xpathText(doc, '//div[contains(@class, "section")]/ul/li[strong[contains(., "Author")]]/span');
	if (author) {
		item.creators.push(ZU.cleanAuthor(author, "author"));
	}
	item.url = ZU.xpathText(doc, '//div[contains(@class, "section")]/ul/li[strong[contains(., "Home Page")]]/a');
	item.rights = ZU.xpathText(doc, '//div[contains(@class, "section")]/ul/li[strong[contains(., "License")]]/span');
	item.system = ZU.xpathText(doc, '//div[contains(@class, "section")]/ul/li[strong[contains(., "Platform")]]/span');
	
	//info from linked categories
	var programmingLanguage = ZU.xpath(doc, '//li/a[contains(., "Programming Language ::")]');
	for (var i=0; i<programmingLanguage.length; i++) {
		var split = programmingLanguage[i].textContent.split("::");
		if (item.programmingLanguage) {
			if (item.programmingLanguage.indexOf(split[1].trim())==-1) {
				item.programmingLanguage += ", " + split[1].trim();
			}
		} else {
			item.programmingLanguage = split[1].trim();
		}
	}
	var topics = ZU.xpath(doc, '//li/a[contains(., "Topic ::")]');
	for (var i=0; i<topics.length; i++) {
		var split = topics[i].textContent.split(" :: ");
		item.tags.push(split.slice(1).join(" - "));
	}
	var license = ZU.xpathText(doc, '//li/a[contains(., "License ::")]');
	if (license && !item.rights) {
		item.rights = license.split(" :: ")[2];
	}
	var os = ZU.xpathText(doc, '//li/a[contains(., "Operating System ::")]');
	if (os && !item.system) {
		item.system = os.split(" :: ")[1];
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
		"url": "https://pypi.python.org/pypi?%3Aaction=search&term=zotero&submit=search",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://pypi.python.org/pypi/simplejson/3.10.0",
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
				"rights": "MIT License",
				"shortTitle": "simplejson",
				"system": "any",
				"url": "http://github.com/simplejson/simplejson",
				"version": "3.10.0",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					"Software Development - Libraries - Python Modules"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://pypi.python.org/pypi?:action=browse&show=all&c=385&c=393",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://pypi.python.org/pypi/lxml/3.7.3",
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
				"version": "3.7.3",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					"Software Development - Libraries - Python Modules",
					"Text Processing - Markup - HTML",
					"Text Processing - Markup - XML"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/
