{
	"translatorID": "99f11c5d-4413-4f96-9fc7-72fbd40372ef",
	"label": "EPA National Library Catalog",
	"creator": "Sebastian Karcher",
	"target": "^https?://cfpub\\.epa\\.gov/ols",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcv",
	"lastUpdated": "2014-03-17 19:59:24"
}

/**
	Copyright (c) 2014 Sebastian Karcher
	
	This program is free software: you can redistribute it and/or
	modify it under the terms of the GNU Affero General Public License
	as published by the Free Software Foundation, either version 3 of
	the License, or (at your option) any later version.
	
	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
	Affero General Public License for more details.
	
	You should have received a copy of the GNU Affero General Public
	License along with this program. If not, see
	<http://www.gnu.org/licenses/>.
*/


function detectWeb(doc, url){
	if (url.indexOf("records_found.cfm")!=-1){
		return "multiple"
	}
	else {
		return findItemType(doc);
	}
}

function doWeb(doc, url){
	if (detectWeb(doc, url)=="multiple"){
		items = {};
		articles = [];
		var titles = ZU.xpath(doc, '//td/a[@id="results"]');
		for (var i=0; i<titles.length; i++){
			items[titles[i].href] = titles[i].textContent		
		}

		Zotero.selectItems(items, function (items) {
			if (!items) return true;

			for (var i in items) articles.push(i.replace(/catalog_brief_record\.cfm/, "catalog_full_record.cfm"));

			ZU.processDocuments(articles, scrape)
		});
	}
	else{
		if (url.indexOf("catalog_brief_record.cfm")!=-1){
			var fullRecordURL = url.replace(/catalog_brief_record\.cfm/, "catalog_full_record.cfm");
			ZU.processDocuments(fullRecordURL, scrape)
		}
		else{
			scrape(doc, url);	
		}
	}
}

function findItemType(doc){
	var title = ZU.xpathText(doc, '//tbody/tr/td[b[contains(text(), "Main Title")]]/following-sibling::td');
	if (ZU.xpathText(doc, '//tbody/tr/td/b[contains(text(), "Report Number")]')){
		return "report";
	}
	else if (title.search(/[\[\{]videorecording[\}\]]/)!=-1){
		return "videoRecording"
	}
	else if (title.search(/[\[\{]sound recording[\}\]]/)!=-1){
		return "audioRecording"
	}	
	else{
		return "book"
	}
}

function scrape(doc, url){
	var item = new Zotero.Item("book");
	var title=ZU.xpathText(doc, '//tbody/tr/td[b[contains(text(), "Main Title")]]/following-sibling::td');
	item.title = title.replace(/[\[\{].+?[\}\]]/, "").replace(/[,\/\s:.]*$/, "").replace(/\s*:/, ":").trim();

var publisher = ZU.xpathText(doc, '//tbody/tr/td[b[contains(text(), "Publisher")]]/following-sibling::td');
	var ISBN = ZU.xpathText(doc, '//tbody/tr/td[b[contains(text(), "ISBN")]]/following-sibling::td');
	var place = ZU.xpathText(doc, '//tbody/tr/td[b[contains(text(), "Place Published")]]/following-sibling::td');
	var date = ZU.xpathText(doc, '//tbody/tr/td[b[contains(text(), "Year Published")]]/following-sibling::td');
	var language = ZU.xpathText(doc, '//tbody/tr/td[b[contains(text(), "Language")]]/following-sibling::td');
	var collation = ZU.xpathText(doc, '//tbody/tr/td[b[contains(text(), "Collation")]]/following-sibling::td');
	var reportNo = ZU.xpathText(doc, '//tbody/tr/td[b[contains(text(), "Report Number")]]/following-sibling::td');
	var tags = ZU.xpath(doc, '//tbody/tr/td[b[contains(text(), "Subjects")]]/following-sibling::td/a');
	var corpAuthor = ZU.xpathText(doc, '//tbody/tr/td[b[contains(text(), "CORP Author")]]/following-sibling::td');
	var firstAuthor = ZU.xpathText(doc, '//tbody/tr/td[b[text()="Author"]]/following-sibling::td');
	var otherAuthors = ZU.xpath(doc, '//tbody/tr/td[b[text()="Other Authors"]]/following-sibling::td//td/a');
	var Notes = ZU.xpathText(doc, '//tbody/tr/td[b[text()="Notes"]]/following-sibling::td');
	var contentsNotes = ZU.xpathText(doc, '//tbody/tr/td[b[text()="Contents Notes"]]/following-sibling::td');
	//we grab only the first link - there is too much guessing involved otherwise
	var link =ZU.xpathText(doc, '(//tbody/tr/td[b[text()="Internet Access"]]/following-sibling::td//tr/td/a)[1]');
	
	item.abstractNote = ZU.xpathText(doc, '//tbody/tr/td[b[text()="Abstract"]]/following-sibling::td');
	if (publisher) item.publisher= publisher.replace(/[,\/\s:]*$/, "").trim();
	if (reportNo) item.reportNumber= reportNo.replace(/[,\/\s:]*$/, "").trim();
	if (place) item.place = place.replace(/[,\/\s:]*$/, "").trim();
	if (date) item.date = date.replace(/[,\/\s:]*$/, "").trim();
	if (language) item.language = language.replace(/[,\/\s]*$/, "").trim();
	if (ISBN) item.ISBN = ZU.cleanISBN(ISBN);
	if (collation){
		var numPages = collation.match(/(\d+)\s+p(?:\.|ages)/);
		if (numPages) item.numPages = numPages[1];
	} 
	for (var i=0; i<tags.length; i++){
		item.tags.push(tags[i].textContent.replace(/[;,\/.\s]*$/, ""))
	}
	
	if (link) item.attachments.push({url: link, title: "EPA Library Resource"})
	item.notes.push(Notes + "\n" + contentsNotes)
	item.itemType = findItemType(doc);
	var hasAuthor;
	if (firstAuthor){
		hasAuthor=true;
		item.creators.push(ZU.cleanAuthor(firstAuthor, "author", true))
	}
	if (corpAuthor){
		hasAuthor = true;
		corpAuthor = corpAuthor.split(/\s*;\s*/);
		for (var i=0; i<corpAuthor.length; i++){
			item.creators.push({lastName: corpAuthor[i].replace(/[\/,.]+$/, ""), creatorType: "author", fieldMode: true })			
		}
	}
	if (otherAuthors.length>0){
		var role = "editor";
		if (hasAuthor) role = "author"; //if an item has multiple authors, they're listed as other authors
		for (var i=0; i<otherAuthors.length;i++){
			item.creators.push(ZU.cleanAuthor(otherAuthors[i].textContent, role, true))
		}
	}
	
	item.complete();
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://cfpub.epa.gov/ols/catalog/catalog_records_found.cfm?&FIELD1=KEYWORD&INPUT1=lead&TYPE1=NONE",
		"items": "multiple"
	}
]
/** END TEST CASES **/