{
	"translatorID": "6b0b11a6-9b77-4b49-b768-6b715792aa37",
	"label": "Toronto Star",
	"creator": "Philipp Zumstein",
	"target": "^https?://www\\.thestar\\.com",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2019-06-10 23:04:25"
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
	if (url.includes("search") && !url.includes("classifieds") && getSearchResults(doc, true)) {
		return "multiple";
	}
	else if (ZU.xpathText(doc, '//meta[@property="og:type"]/@content') == "article") {
		var urlFolder = url.split('/').slice(0, -1).join('/');
		if (urlFolder.includes('blog')) {
			return "blogPost";
		}
		else {
			return "newspaperArticle";
		}
	}
	return false;
}


function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = ZU.xpath(doc, '//a[span[contains(@class, "story__headline")]]');
	for (var i = 0; i < rows.length; i++) {
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
			if (!items) return;

			var articles = [];
			for (var i in items) {
				articles.push(i);
			}
			ZU.processDocuments(articles, scrape);
		});
	}
	else {
		scrape(doc, url);
	}
}


function scrape(doc, url) {
	var item = new Zotero.Item(detectWeb(doc, url));
	item.title = ZU.xpathText(doc, '//h1[@itemprop="headline"]');
	item.date = ZU.xpathText(doc, '//meta[@property="article:published"]/@content');
	item.section = ZU.xpathText(doc, '//meta[@property="article:section"]/@content');
	item.abstractNote = ZU.xpathText(doc, '//meta[@name="description"]/@content');
	var authors = ZU.xpath(doc, '//span[@itemprop="author"]//span[@itemprop="name"]');
	for (let i = 0; i < authors.length; i++) {
		item.creators.push(ZU.cleanAuthor(authors[i].textContent, "author"));
	}
	var tags = ZU.xpath(doc, '//div[contains(@class, "tags")]//a');
	for (let i = 0; i < tags.length; i++) {
		item.tags.push(tags[i].textContent);
	}
	if (item.itemType == "newspaperArticle") {
		item.publicationTitle = "The Toronto Star";
		item.ISSN = "0319-0781";
	}
	item.language = "en-CA";
	item.url = url;
	item.attachments.push({
		document: doc,
		title: 'Toronto Star Snapshot',
		mimeType: 'text/html'
	});
	item.complete();
}
	
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://www.thestar.com/news/world/2010/01/26/france_should_ban_muslim_veils_commission_says.html",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "France should ban Muslim veils, commission says",
				"creators": [],
				"date": "2010-01-26",
				"ISSN": "0319-0781",
				"abstractNote": "France's National Assembly should pass a resolution denouncing full Muslim face veils and then vote the strictest law possible to ban women from wearing them, a parliamentary commission proposed on Tuesday.",
				"language": "en-CA",
				"libraryCatalog": "Toronto Star",
				"publicationTitle": "The Toronto Star",
				"section": "World",
				"url": "https://www.thestar.com/news/world/2010/01/26/france_should_ban_muslim_veils_commission_says.html",
				"attachments": [
					{
						"title": "Toronto Star Snapshot",
						"mimeType": "text/html"
					}
				],
				"tags": [
					"France"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.thestar.com/business/tech_news/2011/07/29/hamilton_ontario_should_reconsider_offshore_wind.html",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Hamilton: Ontario should reconsider offshore wind",
				"creators": [
					{
						"firstName": "Tyler",
						"lastName": "Hamilton",
						"creatorType": "author"
					}
				],
				"date": "2011-07-29",
				"ISSN": "0319-0781",
				"abstractNote": "There&rsquo;s no reason why Ontario can&rsquo;t regain the momentum it once had.",
				"language": "en-CA",
				"libraryCatalog": "Toronto Star",
				"publicationTitle": "The Toronto Star",
				"section": "Tech News",
				"shortTitle": "Hamilton",
				"url": "https://www.thestar.com/business/tech_news/2011/07/29/hamilton_ontario_should_reconsider_offshore_wind.html",
				"attachments": [
					{
						"title": "Toronto Star Snapshot",
						"mimeType": "text/html"
					}
				],
				"tags": [
					"Great Lakes",
					"United States"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.thestar.com/news/canada/2012/07/03/bev_oda_resigns_as_international_cooperation_minister_conservative_mp_for_durham.html",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Bev Oda resigns as International Co-operation minister, Conservative MP for Durham",
				"creators": [
					{
						"firstName": "Joanna",
						"lastName": "Smith",
						"creatorType": "author"
					},
					{
						"firstName": "Allan",
						"lastName": "Woods",
						"creatorType": "author"
					}
				],
				"date": "2012-07-03",
				"ISSN": "0319-0781",
				"abstractNote": "Bev Oda will leave politics later this month following a series of scandals over her travel expenses and funding decisions.",
				"language": "en-CA",
				"libraryCatalog": "Toronto Star",
				"publicationTitle": "The Toronto Star",
				"section": "Canada",
				"url": "https://www.thestar.com/news/canada/2012/07/03/bev_oda_resigns_as_international_cooperation_minister_conservative_mp_for_durham.html",
				"attachments": [
					{
						"title": "Toronto Star Snapshot",
						"mimeType": "text/html"
					}
				],
				"tags": [
					"Stephen Harper"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.thestar.com/search.html?q=labor&contenttype=articles%2Cvideos%2Cslideshows",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://www.thestar.com/yourtoronto/education_blog/2014/03/toronto_tustee_misbehaviour_isn_t_anything_new.html",
		"items": [
			{
				"itemType": "blogPost",
				"title": "Toronto trustee misbehaviour isn't anything new",
				"creators": [
					{
						"firstName": "Kristin",
						"lastName": "Rushowy",
						"creatorType": "author"
					}
				],
				"date": "2014-03-18",
				"language": "en-CA",
				"url": "https://www.thestar.com/yourtoronto/education_blog/2014/03/toronto_tustee_misbehaviour_isn_t_anything_new.html",
				"attachments": [
					{
						"title": "Toronto Star Snapshot",
						"mimeType": "text/html"
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
