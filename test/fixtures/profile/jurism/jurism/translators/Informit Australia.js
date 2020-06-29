{
	"translatorID": "1fdc31af-065d-4923-9e90-ab4afe5cca8b",
	"label": "Informit Australia",
	"creator": "Sebastian Karcher",
	"target": "^https?://search\\.informit\\.com\\.au/search",
	"minVersion": "1.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcs",
	"lastUpdated": "2013-12-06 14:04:29"
}

/*
	***** BEGIN LICENSE BLOCK *****
	
	Copyright © 2013 Sebastian Karcher
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

	var type = ZU.xpathText(doc, '//p[span[contains(text(), "Document Type")]]')
	if (type) {
		type=type.replace(/^[^\:]+\:/, "").replace(/;.+/,"").trim();
		if (typeMap[type]) return typeMap[type]
	else return "journalArticle"
	}
	else if (url.match(/action\=doSearch/)) {
		return "multiple";
	}
	return false;
}


var typeMap = {
		"Journal Article": "journalArticle",
		"Book Chapter": "bookSection",
		"Book Item": "bookSection",
		"Report (Complete)": "report",
		"Report": "report"
	
}


function doWeb(doc, url) {
	if (detectWeb(doc, url) == "multiple") {
		var items = {};
		var articles = [];
		var results = ZU.xpath(doc, '//form[@id="searchResults"]/div[@class="box"]');
		var link;
		var title;
		for (var i in results) {
			link = ZU.xpathText(results[i], './ul[@id="recordNav"]/li[@class="firstItem"]/a/@href');
			title = ZU.xpathText(results[i], './div[@class="metadata"]/p[1]');
			items[link] = title
		}
		Zotero.selectItems(items, function (items) {
			if (!items) {
				return true;
			}
			for (var i in items) {
				articles.push(i);
			}
			Zotero.Utilities.processDocuments(articles, scrape);	
		});
	} else {
		scrape(doc, url)
}

function scrape(doc, url){
	var item = new Zotero.Item(detectWeb(doc, url));
	item.title = ZU.xpathText(doc, '//p[span[contains(text(), "Title:")]][1]').replace(/^Title:\s*/, "");
	var publication;
	if (publication= ZU.xpathText(doc, '//p[span[contains(text(), "Journal Title:")]][1]')){	
		//some reports are published in journals. Fix item type
		item.itemType = "journalArticle";
		item.publicationTitle = publication.replace(/^Journal Title:\s*/, "")
	}
	var authors;
	if (authors= ZU.xpathText(doc, '//p[span[contains(text(), "Personal Author:")]]')){
	authors = authors.replace(/^Personal Author:\s*/, "");
	authors = authors.split(/\s*;\s*/);
	for (var i in authors){
		item.creators.push(ZU.cleanAuthor(authors[i], "author", true))
	}
	}
	
	var cauthors;
	if (cauthors= ZU.xpathText(doc, '//p[span[contains(text(), "Corporate Author:")]]')){
	cauthors = cauthors.replace(/^Corporate Author:\s*/, "");
	cauthors = cauthors.split(/\s*;\s*/);
	for (var i in cauthors){
		item.creators.push({lastName: cauthors[i].trim(), fieldMode: true})
	}
	}
	
	var tags;
	if (tags= ZU.xpathText(doc, '//p[span[contains(text(), "Subject(s):")]]')){
	tags = tags.replace(/^Volume:\s*/, "").split(/\s*;\s/);
	for (var i in tags){
		item.tags.push(tags[i].trim())
	}
	}
	
	var volume;
	if (volume= ZU.xpathText(doc, '//p[span[contains(text(), "Volume:")]]')){
	item.volume = volume.replace(/^Volume:\s*/, "")
	}
	
	var issue;
	if (issue= ZU.xpathText(doc, '//p[span[contains(text(), "Issue:")]]')){
		item.issue = issue.replace(/^Issue:\s*/, "")
	}
	
	var publisher;
	if (publisher= ZU.xpathText(doc, '//p[span[contains(text(), "Name of Publisher:")]]')){
		item.publisher = publisher.replace(/^Name of Publisher:\s*/, "")
	}

		
	var place;
	if (place= ZU.xpathText(doc, '//p[span[contains(text(), "Place of Publication:")]]')){
		item.place = place.replace(/^Place of Publication:\s*/, "")
	}

		
	var series;
	if (series= ZU.xpathText(doc, '//p[span[contains(text(), "Series:")]]')){
		item.series = series.replace(/^Series:\s*/, "")
	}
	
	var page;
	if (page= ZU.xpathText(doc, '//p[span[contains(text(), "Pagination:")]]')){
	 	if (item.itemType == "journalArticle" ||item.itemType == "bookSection") item.page = page.replace(/^Pagination:\s*/, "");
		else item.numPages = page.replace(/^Pagination:\s*/, "").replace(/\s*p\.?\s*/, "");		
	}
	
		
	var sourcetitle;
	if (sourcetitle= ZU.xpathText(doc, '//p[span[contains(text(), "Source Title:")]]')){
		item.bookTitle = sourcetitle.replace(/^Source Title:\s*/, "")
	}
	
	var language;
	if (language= ZU.xpathText(doc, '//p[span[contains(text(), "Language:")]]')){
	item.language = language.replace(/^Language:\s*/, "")
	}
	var date;
	if (date= ZU.xpathText(doc, '//p[span[contains(text(), "Date of Publication:")]]')){
	item.date = date.replace(/^Date of Publication:\s*/, "")
	}
	
	var ISSN;
	if (ISSN= ZU.xpathText(doc, '//p[span[contains(text(), "ISSN:")]]')){
	item.ISSN = ISSN.replace(/^e?ISSN:\s*/, "")
	}

	var ISBN;
	if (ISBN= ZU.xpathText(doc, '//p[span[contains(text(), "ISBN:")]]')){
	item.ISBN = ISBN.replace(/^e?ISBN:\s*/, "")
	}
	
	var abstract;
	if (abstract= ZU.xpathText(doc, '//p[span[contains(text(), "Abstract:")]]')){
	item.abstractNote = abstract.replace(/^Abstract:\s*/, "")
	}
	
	item.attachments.push({document: doc, title: "informit Snapshot", mimeType: "text/html"})
	item.complete();
	}
}
