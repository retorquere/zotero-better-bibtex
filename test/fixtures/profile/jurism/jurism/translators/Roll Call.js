{
	"translatorID": "d522149f-b776-413f-8aa4-ced13f59c759",
	"label": "Roll Call",
	"creator": "Philipp Zumstein",
	"target": "^https?://(www\\.|blogs\\.)?rollcall\\.com",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2017-06-04 17:53:19"
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
	var urlparts = url.split('/');
	//e.g. urlparts = [ "0": "http:", "1": "", "2": "www.rollcall.com", "3": "news", "4": "john_boehner_reiterates_that_ball_is_in_barack_obamas_court_on_fiscal_cliff-218917-1.html" ]
	if (urlparts[3]=="news") {
		return "newspaperArticle";
	} else if (urlparts[3].indexOf('blog')>-1) {
		return "blogPost";
	} else if (url.indexOf('/search')>-1 && getSearchResults(doc, true)) {
		return "multiple";
	}
}


function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = ZU.xpath(doc, '//div[contains(@class, "search-result-item")]//a[contains(@class, "story-title")]');
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
	var type = detectWeb(doc, url);
	var translator = Zotero.loadTranslator('web');
	// Embedded Metadata
	translator.setTranslator('951c027d-74ac-47d4-a107-9c3069ab7b48');
	//translator.setDocument(doc);
	translator.setHandler('itemDone', function (obj, item) {
		if (item.creators.length==0) {
			var authors = ZU.xpath(doc, '//div[@itemprop="author"]');
			for (var i=0; i<authors.length; i++) {
				item.creators.push(ZU.cleanAuthor(authors[i].textContent, "author"));
			}
		}
		item.complete();
	});
	translator.getTranslatorObject(function(trans) {
		trans.itemType = type;
		trans.doWeb(doc, url);
	});
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.rollcall.com/news/john_boehner_reiterates_that_ball_is_in_barack_obamas_court_on_fiscal_cliff-218917-1.html",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "John Boehner Reiterates That Ball Is in Barack Obama’s Court on ‘Fiscal Cliff’",
				"creators": [
					{
						"firstName": "Daniel",
						"lastName": "Newhauser",
						"creatorType": "author"
					}
				],
				"date": "2012-11-09T11:08:02Z",
				"abstractNote": "Speaker John Boehner today again called on President Barack Obama to lead the discussion about the “fiscal cliff,” saying that this is his time to work on a deal that can pass both chambers of Congress.",
				"libraryCatalog": "www.rollcall.com",
				"publicationTitle": "Roll Call",
				"url": "http://www.rollcall.com/news/john_boehner_reiterates_that_ball_is_in_barack_obamas_court_on_fiscal_cliff-218917-1.html",
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
		"url": "http://www.rollcall.com/page/search?keyword=obama&advanced=false&sort=relevance",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://www.rollcall.com/rothenblog/obama-administration-heading-for-a-tough-few-weeks/",
		"items": [
			{
				"itemType": "blogPost",
				"title": "Obama Administration Heading for a Tough Few Weeks",
				"creators": [
					{
						"firstName": "Stuart",
						"lastName": "Rothenberg",
						"creatorType": "author"
					}
				],
				"date": "2013-05-12T02:49:35Z",
				"abstractNote": "Maybe it’s because two-term presidents suffer from hubris, or merely that after an administration has been in office for years, it inevitably makes mistakes (and too often tries to cover them up). But recent news reports ought to make Democrats at least a little nervous about the next few months and even 2014.First, the administration started digging a hole for itself on Benghazi, with a high-level Foreign Service officer raising questions about the Obama administration’s handling of the September incident and subsequent behavior.",
				"blogTitle": "Roll Call",
				"url": "http://www.rollcall.com/news/rothenblog/obama-administration-heading-for-a-tough-few-weeks",
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
	}
]
/** END TEST CASES **/