{
	"translatorID": "f4130157-93f7-4493-8f24-a7c85549013d",
	"label": "BBC",
	"creator": "Philipp Zumstein",
	"target": "^https?://(www|news?)\\.bbc\\.(co\\.uk|com)",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2017-05-20 06:30:47"
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
	if (/\d{8}$/.test(url)) {
		var pageNode = doc.getElementById("page");;
		if (pageNode) {
			//Z.debug(pageNode.className);
			if (pageNode.className.indexOf("media-asset-page")>-1 || pageNode.className.indexOf("vxp-headlines")>-1) {
				return "videoRecording";
			}
		}
		return "newspaperArticle";
	}
	if(url.indexOf("/newsbeat/article") != -1){
		return "blogPost";
	}
	if (getSearchResults(doc, true)) {
		return "multiple";
	}
}

function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = ZU.xpath(doc, '//a[h3[@class="title-link__title"]]');
	//for NewsBeat
	if(!rows.length) {
		var rows = ZU.xpath(doc, '//article/div/h1[@itemprop="headline"]/a');
	}
	for (var i = 0; i<rows.length; i++) {
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
	
	var itemType = detectWeb(doc, url);
	
	var translator = Zotero.loadTranslator('web');
	// Embedded Metadata
	translator.setTranslator('951c027d-74ac-47d4-a107-9c3069ab7b48');
	translator.setDocument(doc);
	
	translator.setHandler('itemDone', function (obj, item) {
		
		//add date and time if missing by one of three attempts:
		// 1. look at the json-ld data
		// 2. calculate it from the data-seconds attribute
		// 3. extract it from a nonstandard meta field
		var jsonld = ZU.xpathText(doc, '//script[@type="application/ld+json"]');
		var data = JSON.parse(jsonld);
		//Z.debug(data);
		if (data && data.datePublished) {
			item.date = data.datePublished;
		} else {
			var seconds = ZU.xpathText(doc, '(//div[h1 or h2]//*[contains(@class, "date")]/@data-seconds)[1]');
			if (!item.date && seconds) {
				//Z.debug(seconds);
				var date = new Date(1000*seconds);
				item.date = date.toISOString();
			} else {
				item.date = ZU.xpathText(doc, '//meta[@property="rnews:datePublished"]/@content');
				if(!item.date) {
					item.date = ZU.xpathText(doc, '//p[@class="timestamp"]');
					if (item.date) {
						item.date = ZU.strToISO(item.date);
					}
				}
			}
		}
		
		//delete wrongly attached creators like
		//"firstName": "B. B. C.", "lastName": "News"
		item.creators = [];
		//add authors from byline__name but only if they
		//are real authors and not just part of the webpage title
		//like By BBC Trending, By News from Elsewhere... or By Who, What Why
		var authorString = ZU.xpathText(doc, '//span[@class="byline__name"]');
		var webpageTitle = ZU.xpathText(doc, '//h1');
		if (authorString) {
			authorString = authorString.replace('By', '').replace('...', '');
			var authors = authorString.split('&');
			for (var i=0; i<authors.length; i++) {
				if (webpageTitle.toLowerCase().indexOf(authors[i].trim().toLowerCase())>-1) {
					continue;
				}
				item.creators.push(ZU.cleanAuthor(authors[i], "author"));
			}
		}
		else
		{
			var authorString = ZU.xpathText(doc, '//p[@class="byline"]');
			var title = ZU.xpathText(doc, '//em[@class="title"]');
			if (authorString) {
				authorString = authorString.replace(title, '').replace('By', '');
				var authors = authorString.split('&');
				for (var i=0; i<authors.length; i++) {
					item.creators.push(ZU.cleanAuthor(authors[i], "author"));
				}
			}	
		}
		
		if (url.indexOf("/newsbeat/article") != -1) {
  			item.blogTitle = "BBC Newsbeat";
		}

		item.language = "en-GB";
		
		item.complete();
	});
	
	translator.getTranslatorObject(function(trans) {
		trans.itemType = itemType;
		trans.doWeb(doc, url);
});
}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.bbc.com/news/magazine-15335899",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Spain's stolen babies and the families who lived a lie",
				"creators": [
					{
						"firstName": "Katya",
						"lastName": "Adler",
						"creatorType": "author"
					}
				],
				"date": "2011-10-18T10:31:45+01:00",
				"abstractNote": "Spanish society has been shaken by revelations of the mass trafficking of babies, dating back to the Franco era but continuing until the 1990s involving respected doctors, nuns and priests.",
				"language": "en-GB",
				"libraryCatalog": "www.bbc.com",
				"publicationTitle": "BBC News",
				"section": "Magazine",
				"url": "http://www.bbc.com/news/magazine-15335899",
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
		"url": "http://www.bbc.com/news/world/asia/india",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://www.bbc.com/news/blogs-news-from-elsewhere-37117404",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "China staff fined for not liking boss's Weibo posts",
				"creators": [],
				"date": "2016-08-18T12:55:52+01:00",
				"abstractNote": "Company in China punishes employees who don't comment on manager's social media posts.",
				"language": "en-GB",
				"libraryCatalog": "www.bbc.com",
				"publicationTitle": "BBC News",
				"section": "News from Elsewhere",
				"url": "http://www.bbc.com/news/blogs-news-from-elsewhere-37117404",
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
		"url": "http://www.bbc.com/news/magazine-36287752",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "'I found my dad on Facebook'",
				"creators": [
					{
						"firstName": "Abdirahim",
						"lastName": "Saeed",
						"creatorType": "author"
					},
					{
						"firstName": "Deirdre",
						"lastName": "Finnerty",
						"creatorType": "author"
					}
				],
				"date": "2016-08-17T00:49:43+01:00",
				"abstractNote": "How a simple post on social media ended a Russian woman's 40-year search for her father.",
				"language": "en-GB",
				"libraryCatalog": "www.bbc.com",
				"publicationTitle": "BBC News",
				"section": "Magazine",
				"url": "http://www.bbc.com/news/magazine-36287752",
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
		"url": "http://www.bbc.co.uk/search?q=harry+potter",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://www.bbc.co.uk/newsbeat/article/32129457/will-new-music-streaming-service-tidal-make-the-waves-artists-want",
		"items": [
			{
				"itemType": "blogPost",
				"title": "Will new music streaming service Tidal make the waves artists want?",
				"creators": [
					{
						"firstName": "Chi Chi",
						"lastName": "Izundu",
						"creatorType": "author"
					}
				],
				"date": "2015-03-31",
				"abstractNote": "Big names in the world of music made it known that they wanted a change when they all stood on stage on Monday and announced the relaunch of streaming service Tidal.",
				"blogTitle": "BBC Newsbeat",
				"language": "en-GB",
				"url": "http://www.bbc.co.uk/newsbeat/article/32129457/will-new-music-streaming-service-tidal-make-the-waves-artists-want",
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
		"url": "http://www.bbc.com/sport/olympics/37068610",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Rio Olympics 2016: Joseph Schooling beats Michael Phelps in 100m butterfly",
				"creators": [],
				"date": "2016/08/13 1:43:21",
				"abstractNote": "Singapore's Joseph Schooling wins his nation's first ever gold medal with victory in the 100m butterfly as Michael Phelps finishes joint second.",
				"language": "en-GB",
				"libraryCatalog": "www.bbc.com",
				"publicationTitle": "BBC Sport",
				"section": "Olympics",
				"shortTitle": "Rio Olympics 2016",
				"url": "http://www.bbc.com/sport/olympics/37068610",
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
