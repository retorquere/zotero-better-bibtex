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
	"browserSupport": "gcsibv",
	"lastUpdated": "2018-09-02 23:10:00"
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
	if (url.includes("/search/simple/articles?") || url.includes("/search/advanced/articles") || url.search(/browse\/(favorites|issue)/) != -1) {
		Z.monitorDOMChanges(doc.getElementById("articleSearchContainer"), {
			childList: true
		});
		if (getSearchResults(doc, true)) return "multiple";
	} else {
		return "newspaperArticle"
	}
}

function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = ZU.xpath(doc, '//div[@id="articleSearchContainer"]//a[@class="Link" and contains(@href, "doc?")]');

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
	if (id) return "/browse/doc/" + id[1];
	else return URL;
}

function pdfLink(URL) {
	 var id = URL.match(/id=(\d+)/);
	 if (id) return "/browse/pdf-download?articleid=" + id[1];
	 else return URL;
}

function scrape(doc, url) {
	//Z.debug(url);
	var item = new Zotero.Item("newspaperArticle");
	var publication = ZU.xpathText(doc, '//a[@class="path" and contains(@href, "browse/publication")]');
	item.publicationTitle = publication;
	var voliss = ZU.xpathText(doc, '//a[@class="path" and contains(@href, "browse/issue/")]');
	if (voliss) {
		var issue = voliss.match(/No\. (\d+)/);
		if (issue) item.issue = issue[1];
		var volume = voliss.match(/Vol\. (\d+)/);
		if (volume) item.volume = volume[1];
	}
	var database = ZU.xpathText(doc, '//a[@class="path" and contains(@href, "browse/udb")]');
	if (database) item.libraryCatalog = database.replace(/\(.+\)/, "") + "(Eastview)";
	if (ZU.xpathText(doc, '//table[@class="table table-condensed Table Table-noTopBorder"]//td[contains(text(), "Article")]')) {
		//we have the metadata in a table
		var metatable = ZU.xpath(doc, '//table[tbody/tr/td[contains(text(), "Article")]]');
		var title = ZU.xpathText(metatable, './/td[contains(text(), "Article")]/following-sibling::td');
		var source = ZU.xpathText(metatable, './/td[contains(text(), "Source")]/following-sibling::td');
		if (source) {
			var date = source.match(/(January|February|March|April|May|Juni|July|August|September|October|November|December)\s+(\d{1,2},\s+)?\d{4}/);
			if (date) item.date = ZU.trimInternal(date[0]);
			var pages = source.match(/page\(s\): (\d+(?:-\d+)?)/);
			if (pages) item.page = pages[1];
			if (!item.publicationTitle) {
				var publication = source.match(/^(.+?),/);
				if (publication) item.publicationTitle = publication[1];
			}
		}
		if (!item.publicationTitle) {
			item.publicationTitle = ZU.xpathText(metatable, './/td[text()="Title"]/following-sibling::td');

		}
		if (!item.pages) {
			var pagesOnly = ZU.xpathText(metatable, './/td[contains(text(), "Page(s)")]/following-sibling::td');
			item.pages = pagesOnly;
		}
		var author = ZU.xpathText(metatable, './/td[contains(text(), "Author(s)")]/following-sibling::td');
		if (author) {
			//Z.debug(author)
			authors = author.trim().split(/\s*,\s*/);
			for (var i = 0; i < authors.length; i++) {
				item.creators.push(ZU.cleanAuthor(authors[i], "author"));
			}
		}
		var place = ZU.xpathText(metatable, './/td[contains(text(), "Place of Publication")]/following-sibling::td');
		if (place) item.place = ZU.trimInternal(place);
	} else {
		var title = ZU.xpathText(doc, '//div[@class="table-responsive"]/div[@class="change_font"]');
		//the "old" page format. We have very little structure here, doing the best we can.
		var header = ZU.xpathText(doc, '//div[@class="table-responsive"]/ul[1]');
		//Z.debug(header);
		var date = header.match(/Date:\s*(\d{2}-\d{2}-\d{2,4})/);
		if (date) item.date = date[1];
		if (!item.publicationTitle) {
			//most of the time the publication title is in quotation marks
			var publication = header.match(/\"(.+?)\"/);
			if (publication) item.publicationTitle = publication[1];
			//if all else fails we just take the top of the file
			else {
				item.publicationTitle = header.trim().match(/^.+/);
			}
		}
	}
	//see if we have a match for item type; default to newspaper otherwise.
	var itemType = typeMap[item.publicationTitle];
	if (itemType) item.itemType = itemType;
	//Attach real PDF for PDFs:
	if (doc.querySelectorAll('#pdfjsContainer').length) {
		item.attachments.push({
			url: pdfLink(url),
			title: "Eastview Fulltext PDF",
			mimeType: "application/pdf"
		});
	}
	else {
		item.attachments.push({
			document: doc,
			title: "Eastview Fulltext Snapshot",
			mimeType: "text/html"
		});
	}

	if (title && title == title.toUpperCase()) {
		title = ZU.capitalizeTitle(title, true);
	}
	item.title = title;
	//Z.debug(item)
	//sometimes items actually don't have a title: use the publication title instead.
	if (!item.title) item.title = item.publicationTitle;
	item.complete();
}

function doWeb(doc, url) {
	var articles = [];
	var items = {};
	if (detectWeb(doc, url) == "multiple") {
		Zotero.selectItems(getSearchResults(doc, false), function(items) {
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

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://dlib.eastview.com/search/simple/articles?isTranslite=&doajax=1&searchForOriginal=%d0%a3%d0%9a%d0%a0%d0%90%d0%98%d0%9d*%20AND%20(%d0%9f%d0%92%d0%9e%20OR%20%d0%91%d0%a3%d0%9a%20OR%20%d0%97%d0%a0%d0%9a)%20&predefined=0&fromDay=1&fromMonth=0&fromYear=2014&toDay=17&toMonth=6&toYear=2014&dateRangeType=range&rangeType=all&udbIds=1450&_udbIds=on&udbIds=1019&_udbIds=on&udbIds=1310&_udbIds=on&udbIds=870&_udbIds=on&udbIds=2210&_udbIds=on&udbIds=1790&_udbIds=on&udbIds=1670&_udbIds=on&udbIds=1490&_udbIds=on&udbIds=1030&_udbIds=on&udbIds=1710&_udbIds=on&udbIds=1130&_udbIds=on&udbIds=1610&_udbIds=on&udbIds=1590&_udbIds=on&udbIds=690&_udbIds=on&udbIds=1990&_udbIds=on&udbIds=691&_udbIds=on&udbIds=692&_udbIds=on&udbIds=350&_udbIds=on&udbIds=1230&_udbIds=on&udbIds=1&_udbIds=on&udbIds=4&_udbIds=on&udbIds=2190&_udbIds=on&udbIds=1970&_udbIds=on&udbIds=5&_udbIds=on&udbIds=730&_udbIds=on&udbIds=12&_udbIds=on&udbIds=1890&_udbIds=on&udbIds=293&_udbIds=on&udbIds=1950&_udbIds=on&udbIds=270&_udbIds=on&udbIds=890&_udbIds=on&udbIds=6&_udbIds=on&udbIds=390&_udbIds=on&udbIds=1210&_udbIds=on&udbIds=9&_udbIds=on&udbIds=550&_udbIds=on&udbIds=570&_udbIds=on&udbIds=2&_udbIds=on&udbIds=1650&_udbIds=on&udbIds=1830&_udbIds=on&udbIds=8&_udbIds=on&udbIds=491&_udbIds=on&udbIds=292&_udbIds=on&udbIds=490&_udbIds=on&show=1&search=Search",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://dlib.eastview.com/browse/doc/2945904",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Moscow",
				"creators": [],
				"date": "02-11-98",
				"libraryCatalog": "Eastview",
				"publicationTitle": "Itar-Tass Weekly News",
				"attachments": [
					{
						"title": "Eastview Fulltext Snapshot",
						"mimeType": "text/html"
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
		"url": "https://dlib.eastview.com/browse/doc/39272962",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Zanitnyi raketnyi kompleks S-300F \"Fort\"",
				"creators": [
					{
						"firstName": "Rostislav",
						"lastName": "Angel'skii",
						"creatorType": "author"
					},
					{
						"firstName": "Vladimir",
						"lastName": "Korovin",
						"creatorType": "author"
					}
				],
				"date": "March 2014",
				"libraryCatalog": "Russian Military & Security Periodicals (Eastview)",
				"place": "Moscow, Russian Federation",
				"publicationTitle": "Tekhnika i vooruzhenie",
				"attachments": [
					{
						"title": "Eastview Fulltext Snapshot",
						"mimeType": "text/html"
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
		"url": "http://dlib.eastview.com/browse/doc/42109039",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Narodnaia gazeta",
				"creators": [],
				"date": "March 20, 2014",
				"libraryCatalog": "Baltics, Belarus, Moldova, Ukraine (Eastview)",
				"place": "Minsk, Belarus",
				"publication": "Narodnaia gazeta",
				"attachments": [
					{
						"title": "Eastview Fulltext Snapshot",
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
