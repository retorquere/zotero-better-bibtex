{
	"translatorID": "6ec8008d-b206-4a4c-8d0a-8ef33807703b",
	"label": "The Economist",
	"creator": "Michael Berkowitz",
	"target": "^https?://(www\\.)?economist\\.com/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2014-04-04 09:55:12"
}

function detectWeb(doc, url) {
	if (doc.location.href.indexOf("/search/") != -1) {
		return "multiple";
	} else if (ZU.xpathText(doc, '//h3[@class="headline"]')) {
		return "magazineArticle";
	} else if (ZU.xpathText(doc, '//div[@class="view-content"]//div[@class="article"]') || ZU.xpathText(doc, '//div[@id="column-content"]//section[contains(@class, "news-package")]')){
		return "multiple";
	} 

}

function scrape(doc, url) {

	newItem = new Zotero.Item("magazineArticle");
	newItem.ISSN = "0013-0613";
	newItem.url = doc.location.href;
	newItem.publicationTitle = "The Economist";


	//get headline
	var title = ZU.xpathText(doc, '//h3[@class="headline"]');
	if (!title) title = ZU.xpathText(doc, '//meta[@property="og:title"]/@content');
	newItem.title = title;

	if (doc.evaluate('//div[@class="clear"][@id="pay-barrier"]/div[@class="col-right"]', doc, null, XPathResult.ANY_TYPE, null).iterateNext()) {
		newItem.extra = "(Subscription only)";
	}

	if (newItem.extra == "(Subscription only)") {
		newItem.complete();
		return;
	}
	//get abstract
	var abstract = ZU.xpathText(doc, '//h1[@class="rubric"]');
	if (!abstract) abstract = ZU.xpathText(doc, '//meta[@property="og:description"]/@content');
	newItem.abstractNote = abstract;
	//get date and extra stuff
	newItem.date = ZU.xpathText(doc, '//time[@class="date-created"]')
	var url = doc.location.href;
	newItem.attachments = [{
		document: doc,
		title: "The Economist Snapshot",
		mimeType: "text/html"
	}];

	newItem.complete();
}


function doWeb(doc, url) {

	var urls = new Array();

	if (detectWeb(doc, url) == "multiple") {

		var articles = new Array();
		var items = {};
		//search results
		var titles = doc.evaluate('//div[contains(@class, "gs-title")]/a[@class="gs-title" and not(contains(@href, "topics"))]', doc, null, XPathResult.ANY_TYPE, null);
		//sections
		if (!titles.iterateNext()){
			var titles = doc.evaluate('//section[contains(@class, "news-package")]//article/a|//section[contains(@class, "news-package")]//ul/li/div/a[@class="headline"]', doc, null, XPathResult.ANY_TYPE, null);
		}
		//print ToC
		if (!titles.iterateNext()){
			var titles = doc.evaluate('//div[@class="article"]/a[@class="node-link"]', doc, null, XPathResult.ANY_TYPE, null);
		}
		
		var title;
		while (title = titles.iterateNext()) {
			items[title.href] = title.textContent.trim();
		}
		Zotero.selectItems(items, function (items) {
			if (!items) {
				return true;
			}
			for (var i in items) {
				articles.push(i);
			}
			Zotero.Utilities.processDocuments(articles, scrape)
		})
	} else{
		scrape(doc, url);
	}
}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.economist.com/node/21538214",
		"items": [
			{
				"itemType": "magazineArticle",
				"creators": [],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "The Economist Snapshot",
						"mimeType": "text/html"
					}
				],
				"ISSN": "0013-0613",
				"url": "http://www.economist.com/node/21538214",
				"publicationTitle": "The Economist",
				"title": "Dreams and realities",
				"abstractNote": "A battle over American-led free trade brews in Asia",
				"date": "Nov 12th 2011",
				"libraryCatalog": "The Economist"
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.economist.com/printedition/2013-12-07",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://www.economist.com/world/united-states",
		"items": "multiple"
	}
]
/** END TEST CASES **/