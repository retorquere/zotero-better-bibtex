{
	"translatorID": "c9338ed5-b512-4967-8ffe-ab9c973559ef",
	"label": "The Hamilton Spectator",
	"creator": "Adam Crymble",
	"target": "^https?://www\\.thespec\\.com",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2013-12-12 13:55:59"
}

function detectWeb(doc, url) {
	if (url.indexOf("/search/") != -1) {
		return "multiple";
	} else if (ZU.xpathText(doc, '//h1[@class="printable-title"]')) {
		return "newspaperArticle";
	}
}

//Hamilton Spectator translator. code by Adam Crymble

function scrape(doc, url) {
	var newItem = new Zotero.Item("newspaperArticle");

	if (doc.title.match("TheSpec.com - ")) {
		var lineBreak = doc.title.lastIndexOf(" - ");
		newItem.section = doc.title.substr(14, lineBreak-14);
	}

	var xPathAbstract = '//span[@class="subhead1"][@id="ctl00_ContentPlaceHolder_article_NavWebPart_Article_ctl00___SubTitle1__"]';
	if (doc.evaluate(xPathAbstract, doc, null, XPathResult.ANY_TYPE, null).iterateNext()) {
		newItem.abstractNote = doc.evaluate(xPathAbstract, doc, null, XPathResult.ANY_TYPE, null).iterateNext().textContent;
	}
	
	var xPathAuthor1 = '//span[@class="articleAuthor"][@id="ctl00_ContentPlaceHolder_article_NavWebPart_Article_ctl00___Author1__"]';
	if (doc.evaluate(xPathAuthor1, doc, null, XPathResult.ANY_TYPE, null).iterateNext()) {
		var author1 = doc.evaluate(xPathAuthor1, doc, null, XPathResult.ANY_TYPE, null).iterateNext().textContent;
		if (author1.match(", ")) {
			author1 = author1.split(", ");
			author1 = author1[0];
		}
		var words = author1.toLowerCase().split(/\s/);
				
		for (var i in words) {
			words[i] = words[i][0].toUpperCase() + words[i].substr(1).toLowerCase();
		}
				
		author1 = words.join(" ");
		newItem.creators.push(Zotero.Utilities.cleanAuthor(author1, "author"));	
	}
	
	var xPathAuthor2 = '//span[@class="td_page_author"]';
	if (doc.evaluate(xPathAuthor2, doc, null, XPathResult.ANY_TYPE, null).iterateNext()) {
		var author2 = doc.evaluate(xPathAuthor2, doc, null, XPathResult.ANY_TYPE, null).iterateNext().textContent;
		if (author2.match(", ")) {
			author2 = author2.split(", ");
			author2 = author2[0];
		}
		newItem.creators.push(Zotero.Utilities.cleanAuthor(author2, "author"));	
	}
	
	var xPathTitle = '//h1[@class="printable-title"]';
	newItem.title = doc.evaluate(xPathTitle, doc, null, XPathResult.ANY_TYPE, null).iterateNext().textContent;	

	newItem.abstractNote = ZU.xpathText(doc, '//meta[@name="description"]/@content');
	newItem.date = ZU.xpathText(doc, '//div[contains(@class, "above-page-title")]/span[contains(@class,"left")][1]');

	newItem.url = doc.location.href;
	newItem.publicationTitle = "The Hamilton Spectator";

	newItem.complete();
}

function doWeb(doc, url) {

	if (detectWeb(doc, url) == "multiple") {
		var items = new Object();
		
		var titles = doc.evaluate('//h3[@class="title"]/a', doc, null, XPathResult.ANY_TYPE, null);
		
		var next_title;
		while (next_title = titles.iterateNext()) {
				items[next_title.href] = next_title.textContent.trim();
		}
		Zotero.selectItems(items, function(items) {
			if(!items) return true;

			var articles = new Array();
			for (var i in items) {
				articles.push(i);
			}
			ZU.processDocuments(articles, function(doc) { scrape(doc, doc.location.href) });
		});
	} else {
		scrape(doc, url);
	}
}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.thespec.com/news-story/2223303-expert-calls-occupy-demos-most-important-in-generations-/",
		"items": [
			{
				"itemType": "newspaperArticle",
				"creators": [],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [],
				"title": "Expert calls Occupy demos most important in generations",
				"date": "Nov 16, 2011",
				"url": "http://www.thespec.com/news-story/2223303-expert-calls-occupy-demos-most-important-in-generations-/",
				"publicationTitle": "The Hamilton Spectator",
				"libraryCatalog": "The Hamilton Spectator",
				"accessDate": "CURRENT_TIMESTAMP"
			}
		]
	}
]
/** END TEST CASES **/