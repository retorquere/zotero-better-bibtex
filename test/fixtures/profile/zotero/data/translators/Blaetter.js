{
	"translatorID": "e8e10bd4-fd6f-4297-a060-a8e0a479043f",
	"label": "Blaetter fuer deutsche und internationale Politik",
	"creator": "Martin Meyerhoff",
	"target": "^https?://www\\.blaetter\\.de",
	"minVersion": "1.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2014-04-03 16:42:18"
}

/*
Blätter für deutsche und internationale Politik
Copyright (C) 2011 Martin Meyerhoff

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program. If not, see <http://www.gnu.org/licenses/>.
*/


function detectWeb(doc, url) {

	// I use XPaths. Therefore, I need the following block.
	var Blaetter_ArticleTools_XPath = ".//div[contains(@id, 'node')]/h2";
	var Blaetter_Multiple_XPath = ".//div[contains(@class, 'teaser') and not(contains(@class, 'dossier'))]/h3[@class='headline']/a";
	
	if (doc.evaluate(Blaetter_ArticleTools_XPath, doc, null, XPathResult.ANY_TYPE, null).iterateNext() ){ 
		Zotero.debug("magazineArticle");
		return "magazineArticle";
	} else if (doc.evaluate(Blaetter_Multiple_XPath, doc, null, XPathResult.ANY_TYPE, null).iterateNext() ){ 
		Zotero.debug("multiple");
		return "multiple";
	}
}


function scrape(doc, url) {
	var newItem = new Zotero.Item("magazineArticle");
	newItem.url = doc.location.href; 

	
	// This is for the title
	
	var title_XPath =".//h2[@class='headline']";
	var title = doc.evaluate(title_XPath, doc, null, XPathResult.ANY_TYPE, null).iterateNext().textContent;
	newItem.title = title;
	
	// Author
	var author_XPath = ".//h4[@class='author']/a";
	if (doc.evaluate(author_XPath, doc, null, XPathResult.ANY_TYPE, null)){
		var author_obj  = doc.evaluate(author_XPath, doc, null, XPathResult.ANY_TYPE, null);
		var next_author;
		while (next_author= author_obj.iterateNext()) {
			Zotero.debug(next_author.textContent);
			newItem.creators.push(Zotero.Utilities.cleanAuthor(next_author.textContent, "author"));
		}
	} 
	
	// Tags
	var tags_XPath = ".//p[@class='credit']/a[@class='rb']";
	if (doc.evaluate(author_XPath, doc, null, XPathResult.ANY_TYPE, null)){
		var tags_obj  = doc.evaluate(tags_XPath, doc, null, XPathResult.ANY_TYPE, null);
		var next_tag;
		while (next_tag= tags_obj.iterateNext()) {
			newItem.tags.push(next_tag.textContent);
		}
	} 
	
	// Attachment. If there's a PDF available, grab it, otherwise just take the HTML site.
	var pdfurl_XPath = "//ul/li[contains(@class, 'download')]/a";
	if (doc.evaluate(pdfurl_XPath, doc, null, XPathResult.ANY_TYPE, null).iterateNext()){
		var pdfurl = doc.evaluate(pdfurl_XPath, doc, null, XPathResult.ANY_TYPE, null).iterateNext().href;
		newItem.attachments.push({url:pdfurl, title:doc.title, mimeType:"application/pdf"}); 

	} else {
		newItem.attachments.push({url:doc.location.href, title:doc.title, mimeType:"text/html"}); 

	}
	
	// Publication Title
	newItem.publicationTitle = "Blätter für deutsche und internationale Politik";
	// Issue, Year and Date
	var credit_XPath = ".//p[@class='credit']";
	if (doc.evaluate(credit_XPath, doc, null, XPathResult.ANY_TYPE, null).iterateNext())	{
		var credit= doc.evaluate(credit_XPath, doc, null, XPathResult.ANY_TYPE, null).iterateNext().textContent;	
		newItem.date = credit.replace(/.*(\d+)\/(\d\d\d\d?).*\n.*/g, '$2-$1-00'); // Standard Date Format
		newItem.date = newItem.date.replace(/-(\d)-/, '-0$1-'); // If Month is single-digit, add a zero before it.
		newItem.pages= credit.replace(/.*,\sSeite\s(\d+-\d+).*\n.*/g, '$1');
	} else if (doc.location.href.match("/dokumente/")  ){
		var title2_XPath =".//h3[@class='subtitle']";
		// Zotero doesn't have a field for subtitle, so just add a colon and then the subtitle.
		var title2 = doc.evaluate(title2_XPath, doc, null, XPathResult.ANY_TYPE, null).iterateNext().textContent;
		newItem.title = newItem.title + ": " + title2.replace(/(.*)(,\s\d+\.\d+\.\d\d\d\d)$/, '$1'); 
		// And the date is in there as well...
		newItem.date = title2.replace(/(.*,\s)(\d+\.\d+\.\d\d\d\d)$/, '$2'); 
	}
	
	var summary_XPath = ".//meta[@name='description']";
	var summary = doc.evaluate(summary_XPath, doc, null, XPathResult.ANY_TYPE, null).iterateNext().content;
	newItem.abstractNote = Zotero.Utilities.unescapeHTML(summary);
	
	newItem.complete();
}
function doWeb(doc, url) {

	var articles = new Array();
	
	if (detectWeb(doc, url) == "multiple") {
		var items = new Object();
		
		var Blaetter_Multiple_XPath = ".//div[contains(@class, 'teaser') and not(contains(@class, 'dossier'))]/h3[@class='headline']/a";
		 if (doc.evaluate(Blaetter_Multiple_XPath, doc, null, XPathResult.ANY_TYPE, null).iterateNext() ){
			var titles = doc.evaluate(Blaetter_Multiple_XPath, doc, null, XPathResult.ANY_TYPE, null);
		} 
		var next_title;
		
		while (next_title = titles.iterateNext()) {
			Zotero.debug(next_title.textContent);
			items[next_title.href] = next_title.textContent;
		}
		Zotero.selectItems(items, function (items) {
			if (!items) {
				Zotero.done();
			}
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
		"url": "http://www.blaetter.de/archiv/themen/antisemitismus",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://www.blaetter.de/archiv/jahrgaenge/2011/august/die-linkspartei-ideologie-oder-politik",
		"items": [
			{
				"itemType": "magazineArticle",
				"creators": [
					{
						"firstName": "André",
						"lastName": "Brie",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [
					"Antisemitismus",
					"Demokratie",
					"Parteien"
				],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Die Linkspartei: Ideologie oder Politik | Blätter für deutsche und internationale Politik",
						"mimeType": "text/html"
					}
				],
				"url": "https://www.blaetter.de/archiv/jahrgaenge/2011/august/die-linkspartei-ideologie-oder-politik",
				"title": "Die Linkspartei: Ideologie oder Politik",
				"publicationTitle": "Blätter für deutsche und internationale Politik",
				"date": "2011-08-00",
				"pages": "16-22",
				"abstractNote": "„Eine Partei zerfleischt sich“, hieß es am 1. Juli in den „heute“-Nachrichten des ZDF über die Linkspartei. Es ist erst gut zwei Monate her, dass die Parteiführung ihre heftigen Differenzen für beendet erklärt hatte und zu gemeinsamer politischer Sacharbeit zurückkehren wollte.",
				"libraryCatalog": "Blaetter fuer deutsche und internationale Politik",
				"shortTitle": "Die Linkspartei"
			}
		]
	}
]
/** END TEST CASES **/