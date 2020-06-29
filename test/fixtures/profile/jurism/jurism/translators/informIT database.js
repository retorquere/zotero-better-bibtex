{
	"translatorID": "add79dfd-7951-4c72-af1d-ce1d50aa4fb4",
	"label": "informIT database",
	"creator": "Adam Crymble, Sebastian Karcher",
	"target": "^https?://www\\.informit\\.com",
	"minVersion": "2.1.9",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2012-10-15 10:37:49"
}

function detectWeb(doc,  url) {
	if (doc.title.match("Search Results")) {
		return "multiple";
	} else if (doc.location.href.match("topics")) {
		return "multiple";

	} else if (doc.location.href.match("product")) {
		return "book";
	} else if (doc.location.href.match("guides")) {
		return "book";

	} else if (doc.location.href.match("-978")) {
		return "book";
	} else if (doc.location.href.match("library")) {
		return "bookSection";
	} else if (doc.location.href.match(/articles\/article/)) {
		return "bookSection";
	}
}

//informIT database translator. Code by Adam Crymble

function scrape(doc, url) {

	var dataTags = new Object();

	//FOR GUIDES
		if (doc.location.href.match("guides")) {
			var newItem = new Zotero.Item("book");
			newItem.title = doc.evaluate('//h1', doc, null, XPathResult.ANY_TYPE, null).iterateNext().textContent;

			var authors = doc.evaluate('//div[@class="titling"]/p/a', doc, null, XPathResult.ANY_TYPE, null).iterateNext().textContent;
		}

	//FOR ARTICLES
		if (doc.location.href.match(/articles\/article/)) {
			var newItem = new Zotero.Item("bookSection");

			var contents = doc.evaluate('//div[@id="articleHeader"]/ul/li', doc, null, XPathResult.ANY_TYPE, null);
			var xPathCount = doc.evaluate('count (//div[@id="articleHeader"]/ul/li)', doc, null, XPathResult.ANY_TYPE, null);

			var authors = contents.iterateNext().textContent.substr(3);

			if (doc.evaluate('//div[@class="relatedBook"]/p/a', doc, null, XPathResult.ANY_TYPE, null).iterateNext()) {
				newItem.bookTitle = doc.evaluate('//div[@class="relatedBook"]/p/a', doc, null, XPathResult.ANY_TYPE, null).iterateNext().textContent;
			}

			newItem.date = contents.iterateNext().textContent;

			var rights1;
			if (xPathCount.numberValue> 2) {
				newItem.rights = contents.iterateNext().textContent;
			}

			newItem.title = doc.evaluate('//h1', doc, null, XPathResult.ANY_TYPE, null).iterateNext().textContent;

		} else if (doc.evaluate('//ul[@class="bibliography"]/li', doc, null, XPathResult.ANY_TYPE, null).iterateNext()) {


	//FOR STORE BOOKS
		var newItem = new Zotero.Item("book");

		var contents = doc.evaluate('//ul[@class="bibliography"]/li', doc, null, XPathResult.ANY_TYPE, null);
		var xPathCount = doc.evaluate('count (//ul[@class="bibliography"]/li)', doc, null, XPathResult.ANY_TYPE, null);

		for (i=0; i<xPathCount.numberValue; i++) {
		 		dataTags[i] = Zotero.Utilities.cleanTags(contents.iterateNext().textContent.replace(/^\s*|\s*$/g, ''));
		 	}

		var authors = dataTags[0].substr(3);

		if (dataTags[1].match("Published")) {
			var publisherInfo = dataTags[1].substr(10);
			var date = publisherInfo.substr(0, 12);
			newItem.date = date;

			if (publisherInfo.match(/\sby/)) {
				var publishCo = publisherInfo.split(/\s*by\s*/);
				newItem.publisher = publishCo[1];
			}
		}
		var bibinfo = ZU.xpathText(doc, '//ul[@id="bibPubInfo"]');
		if (bibinfo){
			var numPages = bibinfo.match(/Pages: (\d+)/)[1];
			var edition = bibinfo.match(/Edition: (.+)/)[1];
			newItem.numPages = numPages;
			newItem.edition = edition;	
		}
		var isbn = ZU.xpathText(doc, '//ul[@id="bibISBN"]');
		if (isbn){
			isbn = isbn.replace(/.+\n\s*ISBN-10:\s*/, "").replace(/\s*ISBN-13:\s*/, ", ");
			newItem.ISBN = isbn;
		}
		newItem.title = doc.evaluate('//h1', doc, null, XPathResult.ANY_TYPE, null).iterateNext().textContent;


  	 //FOR LIBRARY BOOKS
		} else if (doc.location.href.match("library")) {

			var newItem = new Zotero.Item("bookSection");

			newItem.title = doc.evaluate('//h2', doc, null, XPathResult.ANY_TYPE, null).iterateNext().textContent;
			var meta = doc.evaluate('//div[@id="columnOne"]/p', doc, null, XPathResult.ANY_TYPE, null);
			newItem.bookTitle = meta.iterateNext().textContent;

			var authors = meta.iterateNext().textContent.substr(3);
		}

	 //SHARED
		var noMoreAuthor = 0;

		if (authors.match(" and ")) {
			authors = authors.split(" and ");
		} else if (authors.match(", ")) {
			authors = authors.split(", ");
		} else {
			newItem.creators.push(Zotero.Utilities.cleanAuthor(authors, "author"));
			noMoreAuthor = 1;
		}

		if (authors.length>0 && noMoreAuthor != 1) {

			for (var i = 0; i < authors.length; i++) {
				newItem.creators.push(Zotero.Utilities.cleanAuthor(authors[i], "author"));
			}
		}

	newItem.url = doc.location.href;
	if (newItem.publisher) newItem.publisher = Zotero.Utilities.trimInternal(newItem.publisher);
	newItem.complete();
}

function doWeb(doc, url) {
	var articles = new Array();

	if (detectWeb(doc, url) == "multiple") {
		var items = new Object();
		var next_title;

	   //xPath for Topics pages, else xPaths for regular search pages.
		if (doc.location.href.match("topics")) {
			var titles = doc.evaluate('//div[@class="productList articles"]/dl/dt/a', doc, null, XPathResult.ANY_TYPE, null);
		} else {
			var titles = doc.evaluate('//div[@class="searchresult"]/ul/li/a', doc, null, XPathResult.ANY_TYPE, null);
			var chapters = doc.evaluate('//dt/a', doc, null, XPathResult.ANY_TYPE, null);
		}

		while (next_title = titles.iterateNext()) {
			items[next_title.href] = next_title.textContent;
		}

		if (doc.title.match("Search Results")) {
			while (next_title = chapters.iterateNext()) {
				items[next_title.href] = next_title.textContent;
			}
		}

		Zotero.selectItems(items, function (items) {
			if (!items) {
				return true;
			}
			for (var i in items) {
				articles.push(i);
			}
			Zotero.Utilities.processDocuments(articles, scrape, function () {});
		});
	} else {
		scrape(doc, url)
	}
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.informit.com/articles/article.aspx?p=1756412",
		"items": [
			{
				"itemType": "bookSection",
				"title": "Your iPhone and iPad App Marketing Strategy: Grand Slam or Base Hits?",
				"creators": [
					{
						"firstName": "Jeffrey",
						"lastName": "Hughes",
						"creatorType": "author"
					}
				],
				"date": "Nov 3, 2011",
				"accessDate": "CURRENT_TIMESTAMP",
				"libraryCatalog": "informIT database",
				"shortTitle": "Your iPhone and iPad App Marketing Strategy",
				"url": "http://www.informit.com/articles/article.aspx?p=1756412",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.informit.com/store/marketing-your-new-business-9780132371780",
		"items": [
			{
				"itemType": "book",
				"title": "Marketing Your New Business",
				"creators": [
					{
						"firstName": "Bruce",
						"lastName": "Barringer",
						"creatorType": "author"
					}
				],
				"date": "Aug 12, 2010",
				"ISBN": "9780132371780",
				"edition": "1st",
				"libraryCatalog": "informIT database",
				"numPages": "8",
				"publisher": "FT Press. Part of the FT Press Delivers Elements series.",
				"url": "http://www.informit.com/store/marketing-your-new-business-9780132371780",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.informit.com/search/index.aspx?query=marketing&imageField.x=0&imageField.y=0",
		"items": "multiple"
	}
]
/** END TEST CASES **/