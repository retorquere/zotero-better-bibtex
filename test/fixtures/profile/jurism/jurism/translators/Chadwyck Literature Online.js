{
	"translatorID": "e13b0f9d-44ba-4ece-aa22-77993bb26ef2",
	"label": "Chadwyck Literature Online",
	"creator": "Sebastian Karcher",
	"target": "^https?://(lion|collections)\\.chadwyck\\.com/search",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsib",
	"lastUpdated": "2014-03-31 15:22:07"
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
	//this may not always get the right item type, but doing that may neither be possible nor terribly important.
	if (url.indexOf("searchFullrec.do?")!=-1||url.indexOf("searchFulltext.do?")!=-1){ 
		if (ZU.xpathText(doc, '//a[@class="bold" and contains(text(), "Download citation")]/@href')) return "journalArticle";
	}
	//I think these are all possible search results - not sure, though, may need to add
	if (url.indexOf("searchQuick")!=-1||url.indexOf("searchTexts") != -1) return "multiple";
}


function doWeb(doc, url){
	if (detectWeb(doc, url) == "multiple") { 
		var results = ZU.xpath(doc, '//tr/td/a[contains(@href, "/searchFull") and not(contains(@href, "area=authors"))]|//dl/a[contains(@href, "/searchFull")]')
		var hits = {};
		var urls = [];		
		for (var i in results) {
			hits[results[i].href] = results[i].textContent.trim();
		}
		
		Zotero.selectItems(hits, function (items) {
			if (!items) {
				return true;
			}
			for (var i in items) {
				urls.push(i);
			}
			ZU.processDocuments(urls, scrape)	
		});
	} else {
		scrape(doc, url);
	}
}

function scrape(doc, url){
	var id = url.match(/id=[^&]+/);
	var downloadurl = ZU.xpathText(doc, '//a[@class="bold" and contains(text(), "Download citation")]/@href')
	if (id) id = id[0]; else id = downloadurl.match(/id=[^&]+/)[0];
	var area = url.match(/area=([^&]+)/)[1];
	var carea = area.toLowerCase();
	var host = doc.location.host ? "http://" + doc.location.host : url.match(/https?:\/\/[^\/]+/)[0]
	var risurl = "http://" + doc.location.host + "/downloadCitation.do?" + id + "&area=" + area + "&citationArea=" + carea + "&citationFormat=procite&citationExport=direct";
	fetchRIS(risurl, downloadurl, 1)
}

function fetchRIS(risurl, downloadurl, retry){
	Zotero.Utilities.HTTP.doGet(risurl, function (text) {
		//Z.debug("RIS: " + text)
		var foundRIS = (text.indexOf('TY  - ') != -1);
		//Cookie weirdness - on some, but not all pages, this requires a cookie set by loading the citation page. 
		//That's what we do when the first try fails (modeled after APA Psycnet)
		if (!foundRIS && retry) {		
			//retry after accessing citation download page
			Z.debug('No RIS data. Retrying (' + retry + ').');
			ZU.doGet(downloadurl, function(){fetchRIS(risurl, --retry);});
			return;
		} 
		else if (!foundRIS){
			throw("Can't find RIS data");
			return;
		}
		var translator = Zotero.loadTranslator("import");
		translator.setTranslator("32d59d2d-b65a-4da4-b0a3-bdd3cfb979e7");
		translator.setString(text);
		translator.setHandler("itemDone", function(obj, item) {
			//We're using the permalink for the snapshot so users can quickly go to the item online, which may contain links to images of the work 
			//which are impossible to scrape
			item.attachments = [ 
				{url:item.url, title: "Chadwyck Literature Online Snapshot", mimeType: "text/html"}
			];
			item.url ="";
			//remove role description put into author first names
			for (i in item.creators){
				if (item.creators[i].firstName){
					item.creators[i].firstName = item.creators[i].firstName.replace(/\(.+/, "");
				}
			}
			//put copyright notes into rights field and delete. Delete generic Chadwyck Healey note
			var rights = "";
			for (var i = item.notes.length-1; i >= 0; i--){
				if (item.notes[i].note.match(/Copyright/)){
					rights += item.notes[i].note;
					item.notes.splice(i, 1);
				}
				else if (item.notes[i].note.match(/Chadwyck\-Healey/)){
					item.notes.splice(i, 1);
				}
			}
			
			if (rights) item.rights = rights.replace(/<\/?p>/g, " ");
			//fix all caps titles
			if (item.title == item.title.toUpperCase()){
				item.title = ZU.capitalizeTitle(item.title.toLowerCase(), true);
			}
			item.series = ""; //T3 contains meaningless info like "Literature online
			item.complete();
		});	
		translator.translate();
	});
}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://lion.chadwyck.com/searchQuickPhase1.do?QuickSearchField=borges",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://lion.chadwyck.com/searchFulltext.do?id=R04701895&divLevel=0&area=abell&DurUrl=Yes&forward=critref_ft",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"lastName": "Yamashita",
						"firstName": "Karen Tei",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Chadwyck Literature Online Snapshot",
						"mimeType": "text/html"
					}
				],
				"title": "Borges & I",
				"publicationTitle": "Massachusetts Review: a quarterly of literature, the arts, and public affairs",
				"journalAbbreviation": "Massachusetts Review: a quarterly of literature, the arts, and public affairs",
				"date": "Summer 2012",
				"volume": "53",
				"issue": "2",
				"pages": "209",
				"rights": "Copyright © 1996-2009 ProQuest LLC. All Rights Reserved.",
				"libraryCatalog": "Chadwyck Literature Online"
			}
		]
	},
	{
		"type": "web",
		"url": "http://lion.chadwyck.com/searchFullrec.do?id=R04673959&area=abell&forward=critref_fr&DurUrl=Yes",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"lastName": "Borges",
						"firstName": "Jorge Luis",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Chadwyck Literature Online Snapshot",
						"mimeType": "text/html"
					}
				],
				"title": "Music Box",
				"publicationTitle": "Poetry (New York; Chicago)",
				"journalAbbreviation": "Poetry (New York; Chicago)",
				"date": "2012",
				"volume": "199",
				"issue": "6",
				"pages": "536",
				"ISSN": "00322032",
				"rights": "Copyright © 1996-2009 ProQuest LLC. All Rights Reserved.",
				"libraryCatalog": "Chadwyck Literature Online"
			}
		]
	},
	{
		"type": "web",
		"url": "http://collections.chadwyck.com/searchFullrec.do?id=R04919506&area=abell&forward=critref_fr&DurUrl=Yes",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"lastName": "Connolly",
						"firstName": "Andy",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Chadwyck Literature Online Snapshot",
						"mimeType": "text/html"
					}
				],
				"title": "'the agitation of the autobiographical': national politics and aesthetic autonomy in Philip Roth's Exit Ghost.",
				"publicationTitle": "Journal of American Studies",
				"journalAbbreviation": "Journal of American Studies",
				"date": "2013",
				"pages": "637",
				"rights": "Copyright © 1996-2010 ProQuest LLC. All Rights Reserved.",
				"libraryCatalog": "Chadwyck Literature Online",
				"shortTitle": "'the agitation of the autobiographical'"
			}
		]
	}
]
/** END TEST CASES **/