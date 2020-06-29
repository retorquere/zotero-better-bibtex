{
	"translatorID": "0507797c-9bc4-4374-92ca-9e3763b6922b",
	"label": "World History Connected",
	"creator": "Frederick Gibbs",
	"target": "worldhistoryconnected\\.press|historycooperative.*/whc/",
	"minVersion": "1.0.0b4.r5",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2014-02-27 23:05:02"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2014-2019 Frederick Gibbs
	
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
function scrape(doc) {
	
	var newItem = new Zotero.Item("journalArticle");
	newItem.url = doc.location.href;
	
	var titlePath, title;
	var bookTitle;
	var month, year;
	var metaTags = doc.getElementsByTagName("meta");
	
	newItem.publicationTitle = ZU.xpathText(doc, '//meta[@name="Journal"]/@content');
	newItem.volume = ZU.xpathText(doc, '//meta[@name="Volume"]/@content');
	newItem.issue = ZU.xpathText(doc, '//meta[@name="Issue"]/@content');
	// in the case of book reviews, the title field is blank
	//but quotes are not escaped properly, so if an article title begins with quotes, then the title tag looks blank even though it is not.
	//(though semantically it is)
	//they use the meta tag 'FileType' to indicate Aritlce or Book Review. silly, but we can use it.
	
	if (ZU.xpathText(doc, '//meta[@name="File Type"]/@content') == 'Book Review') {
		//for a book review, title of reviewed book is
		titlePath = '/html/body/table[4]/tbody/tr[3]/td[1]/i';	
		newItem.title = "Review of " + doc.evaluate(titlePath, doc, null, XPathResult.ANY_TYPE, null).iterateNext().textContent;

	} else {
		//it would be nice to grab the title from the meta tags, but quotations are properly escaped and the tags are therefore malformed.
		titlePath = '/html/body/table[4]/tbody/tr[2]/td[1]/h2';
		title = doc.evaluate(titlePath, doc, null, XPathResult.ANY_TYPE, null).iterateNext();
		if ( title ) {
			newItem.title = Zotero.Utilities.trimInternal(Zotero.Utilities.superCleanString(title.textContent));
		}
	}

	var authors = ZU.xpath(doc, '//meta[@name="Author"]/@content');
	for (let j in authors) {
		authors[j] = authors[j].textContent.replace("Reviewed by ", "");
		newItem.creators.push(Zotero.Utilities.cleanAuthor(authors[j], "author"));
	}
	
	var month = ZU.xpathText(doc, '//meta[@name="PublicationMonth"]/@content');
	var year = ZU.xpathText(doc, '//meta[@name="PublicationYear"]/@content');
	if (month || year) {
		newItem.date = month +" "+ year;
	}
	
	newItem.attachments.push({document:doc, title:"World History Connected Snapshot"});
	
	newItem.complete();
}

function detectWeb(doc, url) {
	if (doc.title.includes("Contents")) {
		return 'multiple';
	} else if ( doc.title.includes("Search results") &&
		Zotero.Utilities.xpath(doc, '/html/body/dl/dt/strong/a[starts-with(text(),"World History Connected | Vol.")]').length ) {
		return 'multiple';
	} else if ( url.match(/\/\d+\.\d+\/[^\/]+/) ) {
		return 'journalArticle';
	}
}

function doWeb(doc, url) {
	
	var searchLinks;
	
	if (doc.title.includes("Contents") || doc.title.includes("Search results")) {

		if (doc.title.includes("Contents |")) {
			searchLinks = doc.evaluate('//tbody/tr[2]/td[1]/table//a', doc, null, XPathResult.ANY_TYPE, null);	
		} 
		else if ( doc.title.includes("| Search results")) {
			searchLinks = doc.evaluate('/html/body/dl/dt/strong/a[starts-with(text(),"World History Connected | Vol.")]', doc, null, XPathResult.ANY_TYPE, null);
		}
		
		var link;
		var title;
		var items = new Object();
		var uris = new Array();
		
		let elmt;
		while (elmt = searchLinks.iterateNext()) {
			//Zotero.debug(elmt.href);
			title = Zotero.Utilities.superCleanString(elmt.textContent);
			link = elmt.href;
			if (title && link){
				items[link] = title;
			}
		}
		Zotero.selectItems(items, function (items) {
			if (!items) {
				return true;
			}
			for (var i in items) {
				uris.push(i);
			}
			Zotero.Utilities.processDocuments(uris, scrape);
		});
	} else {
		scrape(doc);
	}
}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://worldhistoryconnected.press.illinois.edu/9.1/chaiklin.html",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"firstName": "Martha",
						"lastName": "Chaiklin",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"document": {
							"location": {}
						},
						"title": "World History Connected Snapshot"
					}
				],
				"url": "http://worldhistoryconnected.press.illinois.edu/9.1/chaiklin.html",
				"publicationTitle": "World History Connected",
				"volume": "9",
				"issue": "1",
				"title": "The Merchant's Ark: Live Animal Gifts in Early Modern Dutch-Japanese Relations",
				"date": "February 2012",
				"libraryCatalog": "World History Connected",
				"accessDate": "CURRENT_TIMESTAMP",
				"shortTitle": "The Merchant's Ark"
			}
		]
	},
	{
		"type": "web",
		"url": "http://worldhistoryconnected.press.illinois.edu/9.1/",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://worldhistoryconnected.press.illinois.edu/cgi-bin/htsearch?method=and&format=builtin-long&sort=score&config=whc&restrict=&exclude=&words=world",
		"items": "multiple"
	}
];
/** END TEST CASES **/
