{
	"translatorID": "7ecb9512-9195-478a-a525-40e71b01f3b0",
	"label": "Archiv fuer Sozialgeschichte",
	"creator": "Sebastian Karcher",
	"target": "^https?://library\\.fes\\.de/jportal/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcbv",
	"lastUpdated": "2013-05-15 20:05:47"
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
	if (url.indexOf("MCRSearchServlet?mode=results")!=-1 || url.indexOf("/receive/jportal_jpvolume_")!=-1) {
		return "multiple";
	} 
	else if (url.indexOf("/receive/jportal_jparticle")!=-1) return "journalArticle"
}

function scrape(doc, url) {
	var staticURL = ZU.xpathText(doc, '//td[@id="detailed-staticurl2"]/a/@href');
	var pdfURL = ZU.xpathText(doc, '//tr[@id="detailed-contents"]/td/a[contains(@href, ".pdf")]/@href');
	if (url.indexOf("?")!=-1) var xmlUrl = url + "&XSL.Style=xmlexport"
	else var xmlUrl = url + "?XSL.Style=xmlexport";
	Zotero.Utilities.doGet(xmlUrl, function (text) {
		//Z.debug(text)
		var docxml = (new DOMParser()).parseFromString(text, "text/xml");
  	 	ns = {	
  	 			"acl" : "xalan://org.mycore.access.MCRAccessManager",
  	 			"xsi" : "http://www.w3.org/2001/XMLSchema-instance",
  	 			"xlink" : "http://www.w3.org/1999/xlink"};
		
		var item = new Zotero.Item("journalArticle");
		var title = ZU.xpathText(docxml, '//maintitle[1]', ns);
		item.title = title.replace(/\/[^\/]+$/, "").replace(/\s*:/, ":");
		var authors = ZU.xpath(docxml, '//participants/participant[@xlink:title="author" or @xlink:title="reviewer"]', ns);
		var author;
		for (var i in authors){
			author = ZU.xpathText(authors[i], './@xlink:label', ns)
			item.creators.push(ZU.cleanAuthor(author, "author", true))
		}
		var reviewedauthors = ZU.xpath(docxml, '//participants/participant[@xlink:title="authorOfReviewer"]', ns);
		var reviewedauthor;
		for (var i in reviewedauthors){
			reviewedauthor = ZU.xpathText(reviewedauthors[i], './@xlink:label', ns)
			item.creators.push(ZU.cleanAuthor(reviewedauthor, "reviewedAuthor", true))
		}
		item.page = ZU.xpathText(docxml, '//sizes/size', ns);
		item.date = ZU.xpathText(docxml, '//dates/date[1]', ns);
		item.volume = ZU.xpathText(docxml, '//maintitle[contains(text(), "Band")]', ns).replace(/Band\s*/, "");
		item.language = "de-DE";
		item.url = staticURL;
		if (pdfURL) item.attachments.push({url: pdfURL, title: "AFS - Full Text PDF", mimeType: "application/pdf"})
		item.journalAbbreviation = "AFS";
		item.complete();
	});
}

function doWeb(doc, url) {
	if (detectWeb(doc, url) == "multiple") {
		var articles = new Array();
		var items = new Object();
		
		//search results
		var titles = ZU.xpath(doc, '//td[@id="leaf_afs-linkarea2"]//a[contains(@href, "/receive/jportal_jparticle")]');
		//volume browsing
		if (titles.length<1){
			titles = ZU.xpath(doc, '//td[@id="leaf-linkarea2"]//a[contains(@href, "/receive/jportal_jparticle")]');
		}
		for (var i in titles) {
			items[titles[i].href] = titles[i].textContent;
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
		scrape(doc, url);
	}
}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://library.fes.de/jportal/receive/jportal_jparticle_00010003",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"firstName": "Otto-Ernst",
						"lastName": "Schüddekopf",
						"creatorType": "author"
					},
					{
						"firstName": "Karl",
						"lastName": "Radek",
						"creatorType": "reviewedAuthor"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "AFS - Full Text PDF",
						"mimeType": "application/pdf"
					}
				],
				"title": "Karl Radek in Berlin: ein Kapitel deutsch-russischer Beziehungen im Jahre 1919",
				"page": "87 - 166",
				"date": "1962",
				"volume": "2",
				"language": "de-DE",
				"url": "http://library.fes.de/jportal/receive/jportal_jparticle_00010003",
				"journalAbbreviation": "AFS",
				"libraryCatalog": "Archiv fuer Sozialgeschichte",
				"accessDate": "CURRENT_TIMESTAMP",
				"shortTitle": "Karl Radek in Berlin"
			}
		]
	},
	{
		"type": "web",
		"url": "http://library.fes.de/jportal/receive/jportal_jpvolume_00010000?XSL.view.objectmetadata.SESSION=true&XSL.toc.pos.SESSION=1",
		"items": "multiple"
	}
]
/** END TEST CASES **/