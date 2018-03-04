{
	"translatorID": "a30274ac-d3d1-4977-80f4-5320613226ec",
	"label": "IMDb",
	"creator": "Philipp Zumstien",
	"target": "^https?://www\\.imdb\\.com/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2017-06-16 20:02:57"
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
	if (url.indexOf('/title/tt')>-1) {
		return "film";
	} else if (url.indexOf('/find?')>-1 && getSearchResults(doc, true)) {
		return "multiple";
	}
}


function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = ZU.xpath(doc, '//td[contains(@class, "result_text")]');
	for (var i=0; i<rows.length; i++) {
		var href = ZU.xpathText(rows[i], './a/@href');
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
		var titleWrapper = ZU.xpath(doc, '//div[contains(@class, "title_wrapper")]');
		var title = ZU.xpathText(titleWrapper, './h1/text()[1]');
		if (title) {
			item.title = title;
		}
		item.date = ZU.xpathText(titleWrapper, './/meta[@itemprop="datePublished"]/@content');
		item.runningTime = ZU.xpathText(titleWrapper, './/time[@itemprop="duration"]');
		item.genre = ZU.xpathText(titleWrapper, './/span[@itemprop="genre"]');
		var origTitle = ZU.xpathText(titleWrapper, './/div[contains(@class, "originalTitle")]/text()[1]');
		if (origTitle) {
			addExtra(item, "original-title: "+origTitle);
		}
		var pageId = ZU.xpathText(doc, '//meta[@property="pageId"]/@content');
		if (pageId) {
			addExtra(item, "IMDb ID: "+pageId);
		}
		
		var summary = ZU.xpath(doc, '//div[contains(@class, "plot_summary_wrapper")]');
		var creatorsMapping = {
			"director": "director",
			"creator": "scriptwriter",
			"actors": "contributor"
		};
		for (var role in creatorsMapping) {
			var creators = ZU.xpath(summary, './/span[@itemprop="'+role+'"]//span[@itemprop="name"]');
			for (var i=0; i<creators.length; i++) {
				item.creators.push(ZU.cleanAuthor(creators[i].textContent, creatorsMapping[role]));
			}
		}
		
		//the keywords in the meta tags are very generic
		item.tags = [];
		var tags = ZU.xpath(doc, '//div[@itemprop="keywords"]/a');
		for (var i=0; i<tags.length; i++) {
			item.tags.push(tags[i].textContent);
		}
		
		item.complete();
		
	});

	translator.getTranslatorObject(function(trans) {
		trans.itemType = "film";
		trans.doWeb(doc, url);
	});
}


function addExtra(item, value) {
	if(!item.extra) {
		item.extra = '';
	} else {
		item.extra += "\n";
	}
	item.extra += value;
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.imdb.com/title/tt0089276/",
		"items": [
			{
				"itemType": "film",
				"title": "The Official Story",
				"creators": [
					{
						"firstName": "Luis",
						"lastName": "Puenzo",
						"creatorType": "director"
					},
					{
						"firstName": "Aída",
						"lastName": "Bortnik",
						"creatorType": "scriptwriter"
					},
					{
						"firstName": "Luis",
						"lastName": "Puenzo",
						"creatorType": "scriptwriter"
					},
					{
						"firstName": "Norma",
						"lastName": "Aleandro",
						"creatorType": "contributor"
					},
					{
						"firstName": "Héctor",
						"lastName": "Alterio",
						"creatorType": "contributor"
					},
					{
						"firstName": "Chunchuna",
						"lastName": "Villafañe",
						"creatorType": "contributor"
					}
				],
				"date": "1985-11-08",
				"abstractNote": "Directed by Luis Puenzo.  With Norma Aleandro, Héctor Alterio, Chunchuna Villafañe, Hugo Arana. After the end of the Dirty War, a high school teacher sets out to find out who the mother of her adopted daughter is.",
				"extra": "original-title: La historia oficial\nIMDb ID: tt0089276",
				"genre": "Drama, History, War",
				"libraryCatalog": "www.imdb.com",
				"runningTime": "1h 52min",
				"url": "http://www.imdb.com/title/tt0089276/",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					" adopted daughter",
					" high school teacher",
					" lawyer",
					" professor",
					" school"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.imdb.com/find?q=shakespeare&s=tt",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://www.imdb.com/title/tt0060613/",
		"items": [
			{
				"itemType": "film",
				"title": "Skin, Skin",
				"creators": [
					{
						"firstName": "Mikko",
						"lastName": "Niskanen",
						"creatorType": "director"
					},
					{
						"firstName": "Robert",
						"lastName": "Alfthan",
						"creatorType": "scriptwriter"
					},
					{
						"firstName": "Marja-Leena",
						"lastName": "Mikkola",
						"creatorType": "scriptwriter"
					},
					{
						"firstName": "Eero",
						"lastName": "Melasniemi",
						"creatorType": "contributor"
					},
					{
						"firstName": "Kristiina",
						"lastName": "Halkola",
						"creatorType": "contributor"
					},
					{
						"firstName": "Pekka",
						"lastName": "Autiovuori",
						"creatorType": "contributor"
					}
				],
				"date": "1967-08-18",
				"abstractNote": "Directed by Mikko Niskanen.  With Eero Melasniemi, Kristiina Halkola, Pekka Autiovuori, Kirsti Wallasvaara. Depiction of four urban youths and their excursion to the countryside.",
				"extra": "original-title: Käpy selän alla\nIMDb ID: tt0060613",
				"genre": "Drama",
				"libraryCatalog": "www.imdb.com",
				"runningTime": "1h 29min",
				"url": "http://www.imdb.com/title/tt0060613/",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					" countryside",
					" dance",
					" drunk",
					" topless",
					" youth"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/