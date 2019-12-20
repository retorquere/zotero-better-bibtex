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
	"lastUpdated": "2019-06-10 21:51:43"
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
	url = url.replace(/[?#].+/, "");
	if (/\d{8}$/.test(url) || /\d{7}\.(stm)$/.test(url)) {
		var pageNode = doc.getElementById("page");
		if (pageNode) {
			// Z.debug(pageNode.className);
			if (pageNode.className.includes("media-asset-page") || pageNode.className.includes("vxp-headlines")) {
				return "videoRecording";
			}
		}
		return "newspaperArticle";
	}
	if (url.includes("/newsbeat/article")) {
		return "blogPost";
	}
	if (getSearchResults(doc, true)) {
		return "multiple";
	}
	return false;
}

function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = ZU.xpath(doc, '//a[h3]');
	// for NewsBeat
	if (!rows.length) {
		rows = ZU.xpath(doc, '//article/div/h1[@itemprop="headline"]/a');
	}
	for (let i = 0; i < rows.length; i++) {
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
				return;
			}
			var articles = [];
			for (let i in items) {
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
	url = url.replace(/[?#].+/, "");
	var itemType = detectWeb(doc, url);
	
	var translator = Zotero.loadTranslator('web');
	// Embedded Metadata
	translator.setTranslator('951c027d-74ac-47d4-a107-9c3069ab7b48');
	translator.setDocument(doc);
	
	translator.setHandler('itemDone', function (obj, item) {
		// add date and time if missing by one of four attempts:
		// 1. look at the json-ld data
		// 2. calculate it from the data-seconds attribute
		// 3. extract it from a nonstandard meta field
		// 4. for old pages, get from metadata
		var jsonld = ZU.xpathText(doc, '//script[@type="application/ld+json"]');
		var data = JSON.parse(jsonld);
		// Z.debug(data);
		if (data && data.datePublished) {
			item.date = data.datePublished;
		}
		else {
			var seconds = ZU.xpathText(doc, '(//div[h1 or h2]//*[contains(@class, "date")]/@data-seconds)[1]');
			if (!item.date && seconds) {
				// Z.debug(seconds);
				var date = new Date(1000 * seconds);
				item.date = date.toISOString();
			}
			else {
				item.date = ZU.xpathText(doc, '//meta[@property="rnews:datePublished"]/@content');
				if (!item.date) {
					item.date = ZU.xpathText(doc, '//p[@class="timestamp"]');
					if (!item.date) {
						item.date = ZU.xpathText(doc, '//meta[@name="OriginalPublicationDate"]/@content');
					}
				}
			}
		}
		
		if (item.date) {
			item.date = ZU.strToISO(item.date);
		}
		// delete wrongly attached creators like
		// "firstName": "B. B. C.", "lastName": "News"
		item.creators = [];
		// add authors from byline__name but only if they
		// are real authors and not just part of the webpage title
		// like By BBC Trending, By News from Elsewhere... or By Who, What Why
		var authorString = ZU.xpathText(doc, '//span[@class="byline__name"]');
		var webpageTitle = ZU.xpathText(doc, '//h1');
		if (authorString) {
			authorString = authorString.replace('By', '').replace('...', '');
			let authors = authorString.split('&');
			for (let i = 0; i < authors.length; i++) {
				if (webpageTitle.toLowerCase().includes(authors[i].trim().toLowerCase())) {
					continue;
				}
				item.creators.push(ZU.cleanAuthor(authors[i], "author"));
			}
		}
		else {
			authorString = ZU.xpathText(doc, '//p[@class="byline"]');
			var title = ZU.xpathText(doc, '//em[@class="title"]');
			if (authorString) {
				authorString = authorString.replace(title, '').replace('By', '');
				let authors = authorString.split('&');
				for (let i = 0; i < authors.length; i++) {
					item.creators.push(ZU.cleanAuthor(authors[i], "author"));
				}
			}
		}
		
		if (url.includes("/newsbeat/article")) {
			item.blogTitle = "BBC Newsbeat";
		}

		// description for old BBC pages
		if (!item.abstractNote) {
			item.abstractNote = ZU.xpathText(doc, '//meta[@name="Description"]/@content');
		}

		for (let i in item.tags) {
			item.tags[i] = item.tags[i].charAt(0).toUpperCase() + item.tags[i].substring(1);
		}

		if (!item.language || item.language === "en") {
			item.language = "en-GB";
		}

		if (url.substr(-4) == ".stm") {
			item.title = ZU.xpathText(doc, '//meta[@name="Headline"]/@content');
		}

		item.complete();
	});

	translator.getTranslatorObject(function (trans) {
		trans.itemType = itemType;
		trans.doWeb(doc, url);
	});
}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://www.bbc.com/news/magazine-15335899",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Spain's stolen babies",
				"creators": [
					{
						"firstName": "Katya",
						"lastName": "Adler",
						"creatorType": "author"
					}
				],
				"date": "2011-10-18",
				"abstractNote": "Spanish society has been shaken by revelations of the mass trafficking of babies, dating back to the Franco era but continuing until the 1990s involving respected doctors, nuns and priests.",
				"language": "en-GB",
				"libraryCatalog": "www.bbc.com",
				"publicationTitle": "BBC News",
				"section": "Magazine",
				"url": "https://www.bbc.com/news/magazine-15335899",
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
		"url": "https://www.bbc.com/news/blogs-news-from-elsewhere-37117404",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Fines for not liking boss's Weibo posts",
				"creators": [],
				"date": "2016-08-18",
				"abstractNote": "Company in China punishes employees who don't comment on manager's social media posts.",
				"language": "en-GB",
				"libraryCatalog": "www.bbc.com",
				"publicationTitle": "BBC News",
				"section": "News from Elsewhere",
				"url": "https://www.bbc.com/news/blogs-news-from-elsewhere-37117404",
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
		"url": "https://www.bbc.com/news/magazine-36287752",
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
				"date": "2016-08-17",
				"abstractNote": "How a simple post on social media ended a Russian woman's 40-year search for her father.",
				"language": "en-GB",
				"libraryCatalog": "www.bbc.com",
				"publicationTitle": "BBC News",
				"section": "Magazine",
				"url": "https://www.bbc.com/news/magazine-36287752",
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
				"title": "Will new music streaming service Tidal make the waves artists want? - BBC Newsbeat",
				"creators": [
					{
						"firstName": "Chi Chi",
						"lastName": "Izundu",
						"creatorType": "author"
					}
				],
				"date": "2015-03-31",
				"abstractNote": "Exclusive music news, big interviews, entertainment, social media trends and video from the news people at BBC Radio 1 and 1Xtra.",
				"blogTitle": "BBC Newsbeat",
				"language": "en-GB",
				"shortTitle": "Will new music streaming service Tidal make the waves artists want?",
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
		"url": "https://www.bbc.com/sport/olympics/37068610",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Rio Olympics 2016: Joseph Schooling beats Michael Phelps in 100m butterfly",
				"creators": [],
				"date": "2016-08-13",
				"abstractNote": "Singapore's Joseph Schooling wins his nation's first ever gold medal with victory in the 100m butterfly as Michael Phelps finishes joint second.",
				"language": "en-GB",
				"libraryCatalog": "www.bbc.com",
				"publicationTitle": "BBC Sport",
				"section": "Olympics",
				"shortTitle": "Rio Olympics 2016",
				"url": "https://www.bbc.com/sport/olympics/37068610",
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
		"url": "http://news.bbc.co.uk/2/hi/uk_news/politics/2116949.stm",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "EU must expand, Straw warns",
				"creators": [],
				"date": "2002-07-08",
				"abstractNote": "Debate on reform of the Common Agricultural Policy must not dilute support for EU enlargement, Foreign Secretary Jack Straw will warn.",
				"language": "en-GB",
				"libraryCatalog": "news.bbc.co.uk",
				"url": "http://news.bbc.co.uk/2/hi/uk_news/politics/2116949.stm",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					"BBC",
					"BBC News",
					"British",
					"Foreign",
					"International",
					"News",
					"News online",
					"Online",
					"Service",
					"Uk",
					"World"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.bbc.com/portuguese/internacional-48562081",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Como peixes e até camarões podem ser 'recrutados' como espiões",
				"creators": [
					{
						"firstName": "Emma",
						"lastName": "Woollacott",
						"creatorType": "author"
					}
				],
				"date": "2019-06-10",
				"abstractNote": "Animais são usados ​​há muito tempo para fins militares, mas agora um projeto americano quer saber se as criaturas marinhas também podem agir como sensores.",
				"language": "pt",
				"libraryCatalog": "www.bbc.com",
				"publicationTitle": "BBC News Brasil",
				"section": "Internacional",
				"url": "https://www.bbc.com/portuguese/internacional-48562081",
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
