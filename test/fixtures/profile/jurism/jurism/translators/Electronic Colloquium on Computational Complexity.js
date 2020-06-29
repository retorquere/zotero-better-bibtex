{
	"translatorID": "09a9599e-c20e-a405-d10d-35ad4130a426",
	"label": "Electronic Colloquium on Computational Complexity",
	"creator": "Jonas Schrieb",
	"target": "^https?://eccc\\.weizmann\\.ac\\.il/",
	"minVersion": "1.0.0b3.r1",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsib",
	"lastUpdated": "2017-01-05 17:11:41"
}

function detectWeb(doc, url) {
	var singleRe   = /^https?:\/\/eccc\.weizmann\.ac\.il\/report\/\d{4}\/\d{3}/;
	var multipleRe = /^https?:\/\/eccc\.weizmann\.ac\.il\/(title|year|keyword)\//;
	if (singleRe.test(url)) {
		return "report";
	} else if (multipleRe.test(url)) {
		return "multiple";
	}
}

function scrape(doc) {
	var newItem = new Zotero.Item("report");

	var url = doc.location.href;
	var tmp  = url.match(/\/(\d{4})\/(\d{3})\/$/);
	newItem.date = tmp[1];
	newItem.reportNumber = tmp[2];
	newItem.url = url;
	


	var titleXPath    = "id('box')//h4";
	newItem.title = doc.evaluate(titleXPath, doc, null, XPathResult.ANY_TYPE, null).iterateNext().textContent;



	var authorsXPath  = "id('box')//a[contains(@href,'author')]";
	var authors = doc.evaluate(authorsXPath, doc, null, XPathResult.ANY_TYPE, null);
	var nextAuthor;
	while (nextAuthor = authors.iterateNext()) {
		newItem.creators.push(Zotero.Utilities.cleanAuthor(nextAuthor.textContent, "author"));
	}


	
	var keywordsXPath = "id('box')//a[contains(@href,'keyword')]";
	var keywords = doc.evaluate(keywordsXPath, doc, null, XPathResult.ANY_TYPE, null);
	var nextKeyword;
	var i = 0;
	while (nextKeyword = keywords.iterateNext()) {
		newItem.tags[i++] = nextKeyword.textContent;
	}



	var abstractXPath = "id('box')/text()";
	var abstractLines = doc.evaluate(abstractXPath, doc, null, XPathResult.ANY_TYPE, null);
	newItem.abstractNote = "";
	var nextLine;
	while (nextLine = abstractLines.iterateNext()) {
		newItem.abstractNote += nextLine.textContent;
	}



	newItem.attachments = [
		{url:url, title:"ECCC Snapshot", mimeType:"text/html"},
		{url:url+"download", title:"ECCC Full Text PDF", mimeType:"application/pdf"}
	];

	newItem.complete();
}

function doWeb(doc, url) {
	var articles = new Array();
	var items = new Object();
	var nextTitle;

	if (detectWeb(doc, url) == "multiple") {
		var titleXPath = "//a[starts-with(@href,'/report/')]/h4";
		var linkXPath = "//a[starts-with(@href,'/report/')][h4]";

		var titles = doc.evaluate(titleXPath, doc, null, XPathResult.ANY_TYPE, null);
		var links  = doc.evaluate(linkXPath,  doc, null, XPathResult.ANY_TYPE, null);
		while (nextTitle = titles.iterateNext()) {
			nextLink = links.iterateNext();
			items[nextLink.href] = nextTitle.textContent;
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
		scrape(doc, url)
	}
}
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://eccc.weizmann.ac.il/report/2006/067/",
		"items": [
			{
				"itemType": "report",
				"creators": [
					{
						"firstName": "Heiner",
						"lastName": "Ackermann",
						"creatorType": "author"
					},
					{
						"firstName": "Heiko",
						"lastName": "Röglin",
						"creatorType": "author"
					},
					{
						"firstName": "Berthold",
						"lastName": "Vöcking",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [
					"Combinatorial Structure",
					"Congestion Games",
					"Convergence Time",
					"PLS-Completeness"
				],
				"seeAlso": [],
				"attachments": [
					{
						"url": "https://eccc.weizmann.ac.il/report/2006/067/",
						"title": "ECCC Snapshot",
						"mimeType": "text/html"
					},
					{
						"url": "https://eccc.weizmann.ac.il/report/2006/067/download",
						"title": "ECCC Full Text PDF",
						"mimeType": "application/pdf"
					}
				],
				"date": "2006",
				"reportNumber": "067",
				"url": "https://eccc.weizmann.ac.il/report/2006/067/",
				"title": "On the Impact of Combinatorial Structure on Congestion Games",
				"abstractNote": "",
				"libraryCatalog": "Electronic Colloquium on Computational Complexity",
				"accessDate": "CURRENT_TIMESTAMP"
			}
		]
	},
	{
		"type": "web",
		"url": "https://eccc.weizmann.ac.il/keyword/13486/",
		"items": "multiple"
	}
]
/** END TEST CASES **/
