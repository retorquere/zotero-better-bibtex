{
	"translatorID": "a9f7b277-e134-4d1d-ada6-8f7942be71a6",
	"label": "newshub.co.nz",
	"creator": "Philipp Zumstein",
	"target": "^https?://www\\.newshub\\.co\\.nz/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2016-12-28 20:22:36"
}

/*
	***** BEGIN LICENSE BLOCK *****
	
	Copyright © 2016 Philipp Zumstein
	
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
	if (ZU.xpathText(doc, '//article[@itemtype="http://schema.org/NewsArticle"]')) {
		return "newspaperArticle";
	} else if (getSearchResults(doc, true)) {
		return "multiple";
	}
}


function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = ZU.xpath(doc, '//section[contains(@class, "Story")]//a[contains(@class, "Story-link")]');
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
	var translator = Zotero.loadTranslator('web');
	// Embedded Metadata
	translator.setTranslator('951c027d-74ac-47d4-a107-9c3069ab7b48');
	//translator.setDocument(doc);

	translator.setHandler('itemDone', function (obj, item) {
		
		var author = ZU.xpathText(doc, '//p/strong[starts-with(text(), "By")]') || ZU.xpathText(doc, '//li[contains(@class, "c-ArticleHeader-author") and starts-with(text(), "By")]');
		if (author) {
			author = author.replace("By", '');
			item.creators.push(ZU.cleanAuthor(author, "author"));
		}
		
		item.date = ZU.strToISO(ZU.xpathText(doc, '//li[contains(@class, "c-ArticleHeader-timestamp")]'));
		
		item.publicationTitle = "Newshub";
		
		item.complete();
	});

	translator.getTranslatorObject(function(trans) {
		trans.itemType = "newspaperArticle";
		trans.doWeb(doc, url);
	});
}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.newshub.co.nz/opinion/duncan-garner/unemployed-youth-would-fill-eden-park--blog-2011081612",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Unemployed youth would fill Eden Park - blog",
				"creators": [
					{
						"firstName": "Duncan",
						"lastName": "Garner",
						"creatorType": "author"
					}
				],
				"date": "2011-08-15",
				"abstractNote": "58,000 young people between the ages of 15-24 are not in education, training or work - this is National's biggest first term failure.",
				"libraryCatalog": "www.newshub.co.nz",
				"publicationTitle": "Newshub",
				"url": "http://www.newshub.co.nz/opinion/duncan-garner/unemployed-youth-would-fill-eden-park--blog-2011081612",
				"attachments": [
					{
						"title": "Snapshot"
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
		"url": "http://www.newshub.co.nz/world/obama-bus-tour-barbecue-to-bieber-2011101914",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Obama bus tour: Barbecue to Bieber",
				"creators": [
					{
						"firstName": "Julie",
						"lastName": "Pace",
						"creatorType": "author"
					}
				],
				"date": "2011-10-19",
				"abstractNote": "President Barack Obama said he wanted to use his bus trip through rural North Carolina and Virginia to hear directly from the American people.",
				"libraryCatalog": "www.newshub.co.nz",
				"publicationTitle": "Newshub",
				"shortTitle": "Obama bus tour",
				"url": "http://www.newshub.co.nz/world/obama-bus-tour-barbecue-to-bieber-2011101914",
				"attachments": [
					{
						"title": "Snapshot"
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
		"url": "http://www.newshub.co.nz/home/new-zealand/2016/08/council-puts-stop-to-confusing-cuba-st-intersection.html",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Council puts stop to confusing Cuba St intersection",
				"creators": [
					{
						"firstName": "Emma",
						"lastName": "Jolliff",
						"creatorType": "author"
					}
				],
				"date": "2016-08-26",
				"abstractNote": "A Wellington intersection that's confounded drivers for years is to have a $200,000 set of traffic lights installed.",
				"libraryCatalog": "www.newshub.co.nz",
				"publicationTitle": "Newshub",
				"url": "http://www.newshub.co.nz/home/new-zealand/2016/08/council-puts-stop-to-confusing-cuba-st-intersection.html",
				"attachments": [
					{
						"title": "Snapshot"
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
		"url": "http://www.newshub.co.nz/home/new-zealand/marlborough.html",
		"items": "multiple"
	}
]
/** END TEST CASES **/