{
	"translatorID": "a9f7b277-e134-4d1d-ada6-8f7942be71a6",
	"label": "3news.co.nz",
	"creator": "Sopheak Hean",
	"target": "^https?://www\\.3news\\.co\\.nz",
	"minVersion": "1.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2013-12-09 20:59:33"
}

/*
	3news.co.nz Translator- Parses 3news.co.nz articles and creates Zotero-based metadata
   Copyright (C) 2011 Sopheak Hean, University of Waikato, Faculty of Education
   Contact:  maxximuscool@gmail.com

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

function detectWeb(doc, url) {
	var namespace = doc.documentElement.namespaceURI;
	var nsResolver = namespace ? function(prefix) {
	if (prefix == "x" ) return namespace; else return null;
	} : null;
	var test = doc.title;
	if  (test.indexOf("- blog -") != -1){
		return "blogPost";
	} else {
		if (test.indexOf("- Story -") != -1){
			return "newspaperArticle";
		}
	}
	return false;
}

function scrape (doc, url) {
	var namespace = doc.documentElement.namespaceURI;
	var nsResolver = namespace ? function(prefix) {
		if (prefix == 'x') return namespace; else return null;
	} : null

	if (detectWeb(doc, url) =="newspaperArticle"){
		var newItem = new Zotero.Item('newspaperArticle');
		newItem.url = doc.location.href;
		newItem.publicationTitle = "3news.co.nz";
		newItem.language = "English";

		if (dodate(doc, url) !=null){
			newItem.date = dodate(doc, url);
		}

		if (doAbstract(doc, url) != null) {
		newItem.abstractNote= doAbstract(doc, url);
		}
		var au = '//div[@id="article_start"]/p/strong';
		var author = doAuthor(doc, url, au);
		var title = '//h1';
		if (doTitle(doc, url, title) !=null){
			newItem.title = doTitle(doc, url, title);
		}
		if (author != null){

			newItem.creators.push(Zotero.Utilities.cleanAuthor(author, "author"));
		}

		if(doSection(doc,url) !=null){
			newItem.section = doSection(doc,url);
		}
		if(doCopyright(doc,url) !=null){
			newItem.rights = doCopyright(doc,url);
		}
		newItem.attachments.push({title:"3news.co.nz Snapshot", mimeType:"text/html", url:newItem.url});
		newItem.complete();
	}


	else if (detectWeb(doc,url) =="blogPost"){
		var newItem = new Zotero.Item('blogPost');
		newItem.url = doc.location.href;
		//newItem.publicationTitle = "3news.co.nz";
		newItem.language = "English";
		if (doAbstract(doc, url) != null) {
		newItem.abstractNote= doAbstract(doc, url);
		}
		if (dodate(doc, url) !=null){
			newItem.date = dodate(doc, url);
		}
		var title = '//h1';
		if (doTitle(doc, url, title) !=null){
			newItem.title = doTitle(doc, url, title);
		}
		var author = '//div[@id="article_start"]/p/strong';
		if (doAuthor(doc, url, author) != null){
			newItem.creators.push(Zotero.Utilities.cleanAuthor(doAuthor(doc, url, author), "author"));
		}
		if(doSection(doc,url) !=null){
			newItem.section = doSection(doc,url);
		}
		if(doCopyright(doc,url) !=null){
			newItem.rights = doCopyright(doc,url);
		}
		newItem.attachments.push({title:"3news.co.nz Snapshot", mimeType:"text/html", url:newItem.url});
		newItem.complete();

	}
}

function doSection (doc, url) {
	var section = '//div[@id="menu"]/ul/li/a[@class="SelectedItem"]';
	var sectionObject =doc.evaluate(section, doc, null, XPathResult.ANY_TYPE, null).iterateNext();
	if(sectionObject){
		return sectionObject.textContent;
	} else return null;
}

function dodate ( doc, url ) {
	var date='//div[@id="byline_date"]';
	var dateObject = doc.evaluate(date, doc, null, XPathResult.ANY_TYPE, null).iterateNext();
	if (dateObject){
			dateObject = dateObject.textContent.replace(/\s(\d:{0,9})+:(\d{0,9})+([a-zA-Z.]{1,4})/, '');
			return dateObject;
		} else return null;
}

function doTitle(doc, url, title){
	var namespace = doc.documentElement.namespaceURI;
	var nsResolver = namespace ? function(prefix) {
		if (prefix == 'x') return namespace; else return null;
	} : null;
	var titleObject = doc.evaluate(title, doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext();
	if (titleObject){
			var articleTitle= titleObject.textContent;
			return articleTitle;
	}
	else return null;
}


function doAuthor(doc, url, author){
	var author2 = author;
	var authorObject = doc.evaluate(author2, doc, null, XPathResult.ANY_TYPE, null).iterateNext();
	if (authorObject){
		authorObject= authorObject.textContent.replace(/By\s/, '');
		return authorObject;
	}
	else return null;
}


function doAbstract(doc, url){
	var namespace = doc.documentElement.namespaceURI;
	var nsResolver = namespace ? function(prefix) {
		if (prefix == 'x') return namespace; else return null;
	} : null;


	var a= "//meta[@name='DESCRIPTION']";
	var abs= doc.evaluate(a, doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext();
	if (abs){
		 var abstractString = abs.content;
		 return abstractString;

	}
	else return null;

}

function doCopyright(doc, url){
	var namespace = doc.documentElement.namespaceURI;
	var nsResolver = namespace ? function(prefix) {
		if (prefix == 'x') return namespace; else return null;
	} : null;

	var CP = '//meta[@name="COPYRIGHT"]';
	var copyrightObject =  doc.evaluate(CP, doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext();
	if (copyrightObject){
		 return copyrightObject.content;

	}
	else return null;
}

function doWeb(doc, url) {
	var namespace = doc.documentElement.namespaceURI;
	var nsResolver = namespace ? function(prefix) {
		if (prefix == 'x') return namespace; else return null;
	} : null;


	var articles = new Array();
	if (detectWeb(doc, url) == "newspaperArticle" || detectWeb(doc, url) == "blogPost") {
		scrape(doc, url);
	} else {
		/** Multiple cannot be done for this translator **/
		Zotero.Utilities.processDocuments(articles, scrape, function() {Zotero.done();});
		Zotero.wait();
	}
}
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.3news.co.nz/Obama-bus-tour-Barbecue-to-Bieber/tabid/417/articleID/230090/Default.aspx",
		"items": [
			{
				"itemType": "newspaperArticle",
				"creators": [
					{
						"firstName": "Julie",
						"lastName": "Pace",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "3news.co.nz Snapshot",
						"mimeType": "text/html"
					}
				],
				"url": "http://www.3news.co.nz/Obama-bus-tour-Barbecue-to-Bieber/tabid/417/articleID/230090/Default.aspx",
				"publicationTitle": "3news.co.nz",
				"language": "English",
				"date": "Wednesday 19 Oct 2011",
				"abstractNote": "President Barack Obama said he wanted to use his bus trip through rural North Carolina and Virginia to hear directly from the American people.",
				"title": "Obama bus tour: Barbecue to Bieber",
				"libraryCatalog": "3news.co.nz",
				"accessDate": "CURRENT_TIMESTAMP",
				"shortTitle": "Obama bus tour"
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.3news.co.nz/Unemployed-youth-would-fill-Eden-Park---blog/tabid/1135/articleID/222342/Default.aspx",
		"items": [
			{
				"itemType": "blogPost",
				"creators": [
					{
						"firstName": "Duncan",
						"lastName": "Garner",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "3news.co.nz Snapshot",
						"mimeType": "text/html"
					}
				],
				"url": "http://www.3news.co.nz/Unemployed-youth-would-fill-Eden-Park---blog/tabid/1135/articleID/222342/Default.aspx",
				"language": "English",
				"abstractNote": "58,000 young people between the ages of 15-24 are not in education, training or work - this is National's biggest first term failure.",
				"date": "Tuesday 16 Aug 2011",
				"title": "Unemployed youth would fill Eden Park - blog",
				"libraryCatalog": "3news.co.nz",
				"accessDate": "CURRENT_TIMESTAMP"
			}
		]
	}
]
/** END TEST CASES **/