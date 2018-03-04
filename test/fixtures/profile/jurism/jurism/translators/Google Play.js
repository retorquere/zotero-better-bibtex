{
	"translatorID": "abc89357-6185-4ddd-8583-80034b754832",
	"label": "Google Play",
	"creator": "Avram Lyon",
	"target": "^https?://play\\.google\\.com/",
	"minVersion": "4.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2017-06-07 18:01:47"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Google Play Translator
	Copyright © 2014 Avram Lyon, ajlyon@gmail.com

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
	var bodyContent = doc.getElementById('body-content');
	if (bodyContent) {
		Z.monitorDOMChanges(bodyContent, {childList: true});
	}

	if (url.indexOf('/apps/details?id=') !== -1) {
		return "computerProgram";
	}

	if (url.indexOf('/store/apps') !== -1
			|| url.indexOf('&c=apps') !== -1) {
		return cardListFindCards(doc).length ? "multiple" : false;
	}
}

function doWeb(doc, url) {
	if (detectWeb(doc, url) !== "multiple") {
		saveIndividual(doc, url);
		return;
	}

	var cells = cardListFindCards(doc);
	var items = new Object();
	for (var index = 0; index < cells.length; index++) {
		items[cells[index].href] = ZU.trimInternal(cells[index].textContent);
	}

	Z.selectItems(items, function(items) {
		if (!items) return true;
		
		var articles = new Array();
		for (var i in items) {
			articles.push(i);
		}

		ZU.processDocuments(articles, saveIndividual);
	});
}

function cardList(doc) {
	return ZU.xpath(doc, '//div[@class="card-list"]');
}

function cardListFindCards(doc) {
	return ZU.xpath(doc, '//div[contains(@class,"card-list")]//div[contains(@class, "card-content")]//a[@class="title"]');
}

function findProperty(doc, propertyKey) {
	return ZU.xpathText(doc, '//div[contains(@itemprop, "' + propertyKey + '")]');
}

function saveIndividual(doc, url) {
	var item = new Zotero.Item("computerProgram");
	
	item.title = ZU.xpathText(doc, '//h1[contains(@class, "document-title")]');
	
	var author = ZU.xpathText(doc, '//div[contains(@itemprop, "author")]//span[contains(@itemprop, "name")]');
	if (author) {
		item.creators.push(ZU.cleanAuthor(author, "author"));
	}

	item.url = url;
	
	var date = ZU.xpathText(doc, '//div[contains(@itemprop, "datePublished")]');
	if (date) {
		item.date = date.replace(/\s*-\s*/, '');
	}
	item.abstractNote = findProperty(doc, "description");
	
	var screenshots = ZU.xpath(doc, '//img[contains(@itemprop, "screenshot")]');
	for (var index = 0; index < screenshots.length; index++) {
		item.attachments.push({
			url: screenshots[index].src,
			title: "App Screenshot"
		})
	}

	// We exclude "Varies with device"
	var os = findProperty(doc, "operatingSystems").trim();
	item.system = /\d/.test(os) ? "Android " + os : "Android";
	
	var version = findProperty(doc, "softwareVersion");
	// We exlide "Varies with device"
	if (/\d/.test(version)) {
		item.version = version;
	}
	
	item.company = ZU.xpathText(doc, '//div[contains(@itemtype, "http://schema.org/Organization")]//span[contains(@itemprop, "name")]');
	
	item.complete();
}


/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://play.google.com/store/apps/details?id=com.gimranov.zandy.app",
		"items": [
			{
				"itemType": "computerProgram",
				"title": "Zandy",
				"creators": [
					{
						"firstName": "Avram",
						"lastName": "Lyon",
						"creatorType": "author"
					}
				],
				"date": "October 1, 2014",
				"abstractNote": "Access your Zotero library from your mobile device! Edit and view your library, sync, and work offline. Zandy provides a simple interface to all your research. Browse and modify the items in your library, add new items, view attachments, take and edit item notes, search your library, and add webpages from the Android browser, with more features coming soon!See http://www.gimranov.com/avram/w/zandy-user-guide for a complete guide to using Zandy. If you have Zandy 1.0 already, see the update note, http://wp.me/p1i2jM-2UFor more information on the Zotero project, the premier system for managing research and bibliographic data, see the project site at http://www.zotero.org/. Zandy is a free software project, licensed under the Affero GPL v3. By buying the paid application on Google Play, you support the future development of this app and ensure its further improvement. All future releases of the software will be free updates bringing new capabilities and bugfixes.To file bug reports or feature requests, please see the project repository at https://github.com/ajlyon/zandy/. The full source code is also available at that address.If you find that Zandy doesn't fit your needs, satisfaction is guaranteed: just send me an email at zandy@gimranov.com, and I'll refund the purchase price.Please note that Zandy has no official connection to the Zotero project and its home institution at the Center for History and New Media at George Mason University.",
				"company": "Avram Lyon",
				"libraryCatalog": "Google Play",
				"system": "Android 2.1 and up",
				"url": "https://play.google.com/store/apps/details?id=com.gimranov.zandy.app",
				"version": "1.4.4",
				"attachments": [
					{
						"title": "App Screenshot"
					},
					{
						"title": "App Screenshot"
					},
					{
						"title": "App Screenshot"
					},
					{
						"title": "App Screenshot"
					},
					{
						"title": "App Screenshot"
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
		"url": "https://play.google.com/store/search?q=research&c=apps",
		"defer": true,
		"items": "multiple"
	}
]
/** END TEST CASES **/