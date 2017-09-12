{
	"translatorID": "fc353b26-8911-4c34-9196-f6f567c93901",
	"label": "Douban",
	"creator": "Ace Strong<acestrong@gmail.com>",
	"target": "^https?://(www|book)\\.douban\\.com/(subject|doulist|people/[a-zA-Z._]*/(do|wish|collect)|.*?status=(do|wish|collect)|group/[0-9]*?/collection|tag)",
	"minVersion": "2.0rc1",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2017-01-01 16:52:39"
}

/*
   Douban Translator
   Copyright (C) 2009-2010 TAO Cheng, acestrong@gmail.com

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
 *   - A search listing of books
 *   - A book page
 *   - A doulist page
 *   - A do page
 *   - A wish page
 *   - A collect page
 */
// http://book.douban.com/


// #################################
// #### Local utility functions ####
// #################################

function trimTags(text) {
	return text.replace(/(<.*?>)/g, "");
}

function trimMultispace(text) {
	return text.replace(/\n\s+/g, "\n");
}

// #############################
// ##### Scraper functions #####
// ############################# 

function scrapeAndParse(doc, url) {
Zotero.Utilities.HTTP.doGet(url, function(page){
	//Z.debug(page)
	var pattern;

	// 类型 & URL
	var itemType = "book";
	var newItem = new Zotero.Item(itemType);
//	Zotero.debug(itemType);
	newItem.url = url;

	// 标题
	pattern = /<h1>([\s\S]*?)<\/h1>/;
	if (pattern.test(page)) {
		var title = pattern.exec(page)[1];
		newItem.title = Zotero.Utilities.trim(trimTags(title));
//		Zotero.debug("title: "+title);
	}
	
	// 又名
	pattern = /<span [^>]*?>又名:(.*?)<\/span>/;
	if (pattern.test(page)) {
		var shortTitle = pattern.exec(page)[1];
		newItem.shortTitle = Zotero.Utilities.trim(shortTitle);
//		Zotero.debug("shortTitle: "+shortTitle);
	}

	// 作者
	
	page = page.replace(/\n/g, "")
	//Z.debug(page)
	pattern = /<span>\s*<span[^>]*?>\s*作者<\/span>:(.*?)<\/span>/;
	if (pattern.test(page)) {
		var authorNames = trimTags(pattern.exec(page)[1]);
		pattern = /(\[.*?\]|\(.*?\)|（.*?）)/g;
		authorNames = authorNames.replace(pattern, "").split("/");
//		Zotero.debug(authorNames);
		for (var i=0; i<authorNames.length; i++) {
			var useComma = true;
			pattern = /[A-Za-z]/;
			if (pattern.test(authorNames[i])) {
				// 外文名
				pattern = /,/;
				if (!pattern.test(authorNames[i])) {
					useComma = false;
				}
			}
			newItem.creators.push(Zotero.Utilities.cleanAuthor(
				Zotero.Utilities.trim(authorNames[i]),
				"author", useComma));
		}
	}
	
	// 译者
	pattern = /<span>\s*<span [^>]*?>\s*译者<\/span>:(.*?)<\/span>/;
	if (pattern.test(page)) {
		var translatorNames = trimTags(pattern.exec(page)[1]);
		pattern = /(\[.*?\])/g;
		translatorNames = translatorNames.replace(pattern, "").split("/");
//		Zotero.debug(translatorNames);
		for (var i=0; i<translatorNames.length; i++) {
			var useComma = true;
			pattern = /[A-Za-z]/;
			if (pattern.test(translatorNames[i])) {
				// 外文名
				useComma = false;
			}
			newItem.creators.push(Zotero.Utilities.cleanAuthor(
				Zotero.Utilities.trim(translatorNames[i]),
				"translator", useComma));
		}
	}

	// ISBN
	pattern = /<span [^>]*?>ISBN:<\/span>(.*?)<br\/>/;
	if (pattern.test(page)) {
		var isbn = pattern.exec(page)[1];
		newItem.ISBN = Zotero.Utilities.trim(isbn);
//		Zotero.debug("isbn: "+isbn);
	}
	
	// 页数
	pattern = /<span [^>]*?>页数:<\/span>(.*?)<br\/>/;
	if (pattern.test(page)) {
		var numPages = pattern.exec(page)[1];
		newItem.numPages = Zotero.Utilities.trim(numPages);
//		Zotero.debug("numPages: "+numPages);
	}
	
	// 出版社
	pattern = /<span [^>]*?>出版社:<\/span>(.*?)<br\/>/;
	if (pattern.test(page)) {
		var publisher = pattern.exec(page)[1];
		newItem.publisher = Zotero.Utilities.trim(publisher);
//		Zotero.debug("publisher: "+publisher);
	}
	
	// 丛书
	pattern = /<span [^>]*?>丛书:<\/span>(.*?)<br\/>/;
	if (pattern.test(page)) {
		var series = trimTags(pattern.exec(page)[1]);
		newItem.series = Zotero.Utilities.trim(series);
//		Zotero.debug("series: "+series);
	}
	
	// 出版年
	pattern = /<span [^>]*?>出版年:<\/span>(.*?)<br\/>/;
	if (pattern.test(page)) {
		var date = pattern.exec(page)[1];
		newItem.date = Zotero.Utilities.trim(date);
//		Zotero.debug("date: "+date);
	}
	
	// 简介
	var tags = ZU.xpath(doc, '//div[@id="db-tags-section"]/div//a');
	for (i in tags){
		newItem.tags.push(tags[i].textContent)
	}
	newItem.abstractNote = ZU.xpathText(doc, '//span[@class="short"]/div[@class="intro"]/p')
	
	newItem.complete();
});
}
// #########################
// ##### API functions #####
// #########################

function detectWeb(doc, url) {
	var pattern = /subject_search|doulist|people\/[a-zA-Z._]*?\/(?:do|wish|collect)|.*?status=(?:do|wish|collect)|group\/[0-9]*?\/collection|tag/;

	if (pattern.test(url)) {
		return "multiple";
	} else {
		return "book";
	}

	return false;
}

function doWeb(doc, url) {
	var articles = new Array();
	if(detectWeb(doc, url) == "multiple") { 
		var items = {};
		var titles = doc.evaluate('//div/h2/a[contains(@onclick, "moreurl")]', doc, null, XPathResult.ANY_TYPE, null);
		var title;
		while (title = titles.iterateNext()) {
			items[title.href] = title.textContent;
		}
		Zotero.selectItems(items, function (items) {
			if (!items) {
				return true;
			}
			for (var i in items) {
				articles.push(i);
			}
			Zotero.Utilities.processDocuments(articles, scrapeAndParse);
		});
	}
 	else {
		scrapeAndParse(doc, url);
	}
}
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://book.douban.com/subject_search?search_text=Murakami&cat=1001",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://book.douban.com/subject/1355643/",
		"items": [
			{
				"itemType": "book",
				"title": "Norwegian Wood",
				"creators": [
					{
						"firstName": "Haruki",
						"lastName": "Murakami",
						"creatorType": "author"
					},
					{
						"firstName": "Jay",
						"lastName": "Rubin",
						"creatorType": "translator"
					}
				],
				"date": "2003-06-30",
				"ISBN": "9780099448822",
				"abstractNote": "When he hears her favourite Beatles song, Toru Watanabe recalls his first love Naoko, the girlfriend of his best friend Kizuki. Immediately he is transported back almost twenty years to his student days in Tokyo, adrift in a world of uneasy friendships, casual sex, passion, loss and desire - to a time when an impetuous young woman called Midori marches into his life and he has ..., (展开全部)",
				"libraryCatalog": "Douban",
				"numPages": "400",
				"publisher": "Vintage",
				"url": "https://book.douban.com/subject/1355643/",
				"attachments": [],
				"tags": [
					"HarukiMurakami",
					"小说",
					"挪威森林英文版",
					"日本",
					"村上春树",
					"英文",
					"英文原版",
					"英文版"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/