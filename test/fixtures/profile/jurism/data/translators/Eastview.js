{
	"translatorID": "c59896bc-4beb-43ed-8109-a73a13251828",
	"label": "Eastview",
	"creator": "Sebastian Karcher",
	"target": "^https?://dlib\\.eastview\\.com/(search/(advanced|simple)/|browse/(doc|favorites|issue))",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsb",
	"lastUpdated": "2014-09-01 13:01:04"
}

/*
	***** BEGIN LICENSE BLOCK *****
	
	Copyright © 2014 Sebastian Karcher
	
	This file is part of Zotero.
	
	Zotero is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.
	
	Zotero is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU Affero General Public License for more details.
	
	You should have received a copy of the GNU Affero General Public License
	along with Zotero.  If not, see <http://www.gnu.org/licenses/>.
	
	***** END LICENSE BLOCK *****
*/
function detectWeb(doc, url) {
	if (url.search("/search/simple/articles?") != -1 || url.indexOf("/search/advanced/articles") != -1 || url.search(/browse\/(favorites|issue)/) != -1) {
		if (ZU.xpath(doc, '//td[contains(@class, "title-cell")]/a').length) return "multiple";
	} else {
		return "newspaperArticle"
	}
}

var typeMap = {
	"Argumenty i fakty": "magazineArticle",
	"Argumenty nedeli": "magazineArticle",
	"Ekonomika i zhizn'": "magazineArticle",
	"Ekspert": "magazineArticle",
	"Izvestiia": "newspaperArticle",
	"Kommersant. Daily": "newspaperArticle",
	"Komsomol'skaia pravda": "newspaperArticle",
	"Kul'tura": "magazineArticle",
	"Literaturnaia gazeta": "magazineArticle",
	"Moscow Times, The": "newspaperArticle",
	"Moskovskaia pravda": "newspaperArticle",
	"Moskovskii komsomolets": "newspaperArticle",
	"New Times, The": "magazineArticle",
	"Nezavisimaia gazeta": "newspaperArticle",
	"Novaia gazeta": "newspaperArticle",
	"Novye izvestiia": "newspaperArticle",
	"Ogonek": "magazineArticle",
	"Pravda": "newspaperArticle",
	"President": "magazineArticle",
	"Profil'": "magazineArticle",
	"RBK Daily": "newspaperArticle",
	"Rossiiskaia gazeta": "newspaperArticle",
	"Rossiiskie vesti": "newspaperArticle",
	"Russkii reporter": "magazineArticle",
	"Sankt-Peterburgskie vedomosti": "newspaperArticle",
	"Slovo": "magazineArticle",
	"Sovetskaia Rossiia": "newspaperArticle",
	"Trud": "newspaperArticle",
	"Vecherniaia Moskva": "newspaperArticle",
	"Vedomosti": "newspaperArticle",
	"Zavtra": "newspaperArticle"
}

function permaLink(URL) {
	var id = URL.match(/id=(\d+)/);
	if (id) return "http://dlib.eastview.com/browse/doc/" + id[1];
	else return URL
}


function scrape(doc, url) {
	Z.debug(url)
	var item = new Zotero.Item("newspaperArticle");
	var publication = ZU.xpathText(doc, '//a[@class="path" and contains(@href, "browse/publication")]');
	item.publication = publication;
	var voliss = ZU.xpathText(doc, '//a[@class="path" and contains(@href, "browse/issue/")]');
	if (voliss) {
		var issue = voliss.match(/No\. (\d+)/);
		if (issue) item.issue = issue[1];
		var volume = voliss.match(/Vol\. (\d+)/);
		if (volume) item.volume = volume[1];
	}
	var database = ZU.xpathText(doc, '//a[@class="path" and contains(@href, "browse/udb")]');
	if (database) item.libraryCatalog = database.replace(/\(.+\)/, "") + "(Eastview)";
	if (doc.getElementById('metatable')) {
		//we have the metadata in a table
		var metatable = doc.getElementById('metatable');
		var title = ZU.xpathText(metatable, './/td[@class="hdr" and contains(text(), "Article Title")]/following-sibling::td[@class="val"]');
		var source = ZU.xpathText(metatable, './/td[@class="hdr" and contains(text(), "Source")]/following-sibling::td[@class="val"]');
		if (source) {
			var date = source.match(/(January|February|March|April|May|Juni|July|August|September|October|November|December)\s+(\d{1,2},\s+)?\d{4}/);
			if (date) item.date = ZU.trimInternal(date[0]);
			var pages = source.match(/page\(s\): (\d+(?:-\d+)?)/);
			if (pages) item.page = pages[1]
		}
		var author = ZU.xpathText(metatable, './/td[@class="hdr" and contains(text(), "Author(s)")]/following-sibling::td[@class="val"]');
		if (author) {
			//Z.debug(author)
			authors = author.trim().split(/\s*,\s*/);
			for (var i=0; i<authors.length; i++) {
				item.creators.push(ZU.cleanAuthor(authors[i], "author"))
			}
		}
		item.place = ZU.xpathText(doc, '//table[@id="metatable"]//td[@class="hdr" and contains(text(), "Place of Publication")]/following-sibling::td');
	} else {
		var title = ZU.xpathText(doc, '//div[@class="change_font"]');
		//the "old" page format. We have very little structure here, doing the best we can.	
		var header = ZU.xpathText(doc, '//tbody/tr/td/ul');
		Z.debug(header);
		var date = header.match(/Date:\s*(\d{2}-\d{2}-\d{2,4})/);
		if (date) item.date = date[1];
	}

	//see if we have a match for item type; default to newspaper otherwise.
	var itemType = typeMap[item.publication];
	if (itemType) item.itemType = itemType;
	item.attachments.push({
		document: doc,
		title: "Eastview Fulltext Snapshot",
		mimeType: "text/html"
	});
	if (title && title == title.toUpperCase()) {
		title = ZU.capitalizeTitle(title, true);
	}
	item.title = title;
	//sometimes items actually don't have a title: use the publication title instead.
	if (!item.title) item.title = item.publication;
	item.complete();

}

/**
* function to scrape directly from the search table. Not used at this point, but leaving in case we'll want to implement it
function scrapeSearch(doc, url) {
	//Z.debug(ZU.xpathText(doc, './td'))
	var dataTags = new Object();
	var newItem = new Zotero.Item("journalArticle");
	
	var title = ZU.xpathText(doc, './td[contains(@class, "title-cell")]/a');
	if (title==title.toUpperCase()){
		title = ZU.capitalizeTitle(title.toLowerCase(), true);
	}
	newItem.title=  title;
	
	var author = ZU.xpathText(doc, './td[contains(@class, "title-cell")]/following-sibling::td[1]');
	if (author){
		//Z.debug(author)
		authors = author.replace(/—/, "").trim().split(/\s*,\s/);
		for (var i in authors){
			if (authors[i]) newItem.creators.push(ZU.cleanAuthor(authors[i], "author"))
		}
	}
	
	newItem.publication = ZU.xpathText(doc, './td[contains(@class, "source-cell")]');
	newItem.date = ZU.xpathText(doc, './td[contains(@class, "source-cell")]/following-sibling::td[1]');
	
	var attachmentLink = ZU.xpathText(doc, './td[contains(@class, "title-cell")]/a/@href');
	if (attachmentLink){
		newItem.attachments.push({url:attachmentLink, title:title, mimeType:"text/html"})
	}
	newItem.complete();
} */


function doWeb(doc, url) {
	var articles = new Array();
	var items = {};
	if (detectWeb(doc, url) == "multiple") {
		var titles = ZU.xpath(doc, '//td[contains(@class, "title-cell")]/a');
		//var number = ZU.xpath(doc, '//td[contains(@class, "check-cell")]/following-sibling::td[1]');
		for (var i = 0; i < titles.length; i++) {
			items[titles[i].href] = titles[i].textContent.trim();
		}
		Zotero.selectItems(items, function(items) {
			if (!items) {
				return true;
			}
			for (var i in items) {
				/* For scraping search table 
				var xpath = '//tr[td[text()="' + i + '"]]'
				var node = ZU.xpath(doc, xpath);
				scrapeSearch(node, url); */
				articles.push(permaLink(i))
			}
			ZU.processDocuments(articles, scrape)
		});
	} else {
		if (url.search(/doc\/\d+/) != -1) {
			scrape(doc, url);
		}
		//always scrape from the permalink page, which has extra publication info at the top
		else {
			ZU.processDocuments(permaLink(url), scrape);
		}
	}
}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://dlib.eastview.com/search/simple/articles?isTranslite=&doajax=1&searchForOriginal=%d0%a3%d0%9a%d0%a0%d0%90%d0%98%d0%9d*%20AND%20(%d0%9f%d0%92%d0%9e%20OR%20%d0%91%d0%a3%d0%9a%20OR%20%d0%97%d0%a0%d0%9a)%20&predefined=0&fromDay=1&fromMonth=0&fromYear=2014&toDay=17&toMonth=6&toYear=2014&dateRangeType=range&rangeType=all&udbIds=1450&_udbIds=on&udbIds=1019&_udbIds=on&udbIds=1310&_udbIds=on&udbIds=870&_udbIds=on&udbIds=2210&_udbIds=on&udbIds=1790&_udbIds=on&udbIds=1670&_udbIds=on&udbIds=1490&_udbIds=on&udbIds=1030&_udbIds=on&udbIds=1710&_udbIds=on&udbIds=1130&_udbIds=on&udbIds=1610&_udbIds=on&udbIds=1590&_udbIds=on&udbIds=690&_udbIds=on&udbIds=1990&_udbIds=on&udbIds=691&_udbIds=on&udbIds=692&_udbIds=on&udbIds=350&_udbIds=on&udbIds=1230&_udbIds=on&udbIds=1&_udbIds=on&udbIds=4&_udbIds=on&udbIds=2190&_udbIds=on&udbIds=1970&_udbIds=on&udbIds=5&_udbIds=on&udbIds=730&_udbIds=on&udbIds=12&_udbIds=on&udbIds=1890&_udbIds=on&udbIds=293&_udbIds=on&udbIds=1950&_udbIds=on&udbIds=270&_udbIds=on&udbIds=890&_udbIds=on&udbIds=6&_udbIds=on&udbIds=390&_udbIds=on&udbIds=1210&_udbIds=on&udbIds=9&_udbIds=on&udbIds=550&_udbIds=on&udbIds=570&_udbIds=on&udbIds=2&_udbIds=on&udbIds=1650&_udbIds=on&udbIds=1830&_udbIds=on&udbIds=8&_udbIds=on&udbIds=491&_udbIds=on&udbIds=292&_udbIds=on&udbIds=490&_udbIds=on&show=1&search=Search",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://dlib.eastview.com/browse/doc/2945904",
		"items": [
			{
				"itemType": "newspaperArticle",
				"creators": [],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Eastview Fulltext Snapshot",
						"mimeType": "text/html"
					}
				],
				"publication": "ITAR-TASS  Daily",
				"issue": "9",
				"libraryCatalog": "Russian Central Newspapers (Eastview)",
				"date": "02-11-98",
				"title": "Moscow"
			}
		]
	},
	{
		"type": "web",
		"url": "http://dlib.eastview.com/browse/doc/39272962",
		"items": [
			{
				"itemType": "newspaperArticle",
				"creators": [
					{
						"firstName": "Rostislav",
						"lastName": "Angel'skii'",
						"creatorType": "author"
					},
					{
						"firstName": "Vladimir",
						"lastName": "Korovin",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Eastview Fulltext Snapshot",
						"mimeType": "text/html"
					}
				],
				"publication": "Tekhnika i vooruzhenie",
				"issue": "3",
				"libraryCatalog": "Military & Security Periodicals (Eastview)",
				"date": "March 2014",
				"page": "20-24",
				"place": "Moscow, Russian Federation",
				"title": "Zanitnyi' raketnyi' kompleks S-300F \"Fort\""
			}
		]
	},
	{
		"type": "web",
		"url": "http://dlib.eastview.com/browse/doc/42109039",
		"items": [
			{
				"itemType": "newspaperArticle",
				"creators": [],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Eastview Fulltext Snapshot",
						"mimeType": "text/html"
					}
				],
				"publication": "Narodnaia gazeta",
				"libraryCatalog": "Baltics, Belarus, Moldova, Ukraine (Eastview)",
				"date": "March 20, 2014",
				"place": "Minsk, Belarus",
				"title": "Narodnaia gazeta"
			}
		]
	}
]
/** END TEST CASES **/