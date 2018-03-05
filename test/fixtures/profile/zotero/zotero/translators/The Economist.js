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
	"lastUpdated": "2017-11-28 13:38:42"
}

function detectWeb(doc, url) {
	var m = url.match(/^https?:\/\/[^\/]+\/[^\/]*\/[^\/]*\/\d+/);
	//Z.debug(m)
	if (url.includes('/node/') || m) {
		return "magazineArticle";
	} else if (getSearchResults(doc, url, true)) {
		return "multiple";
	} 

}

function scrape(doc, url) {

	newItem = new Zotero.Item("magazineArticle");
	newItem.ISSN = "0013-0613";
	newItem.url = url;
	newItem.publicationTitle = "The Economist";

	//get headline
	var title = ZU.xpathText(doc, '//h3[@class="headline"]');
	if (!title) title = ZU.xpathText(doc, '//meta[@property="og:title"]/@content');
	newItem.title = title;

	if (doc.evaluate('//div[@class="clear"][@id="pay-barrier"]/div[@class="col-right"]', doc, null, XPathResult.ANY_TYPE, null).iterateNext()) {
		newItem.extra = "(Subscription only)";
		newItem.complete();
		return;
	}
	//get abstract
	var abstract = ZU.xpathText(doc, '//h1[@class="rubric"]');
	if (!abstract) abstract = ZU.xpathText(doc, '//meta[@property="og:description"]/@content');
	newItem.abstractNote = abstract;
	//get date and extra stuff
	newItem.date = ZU.xpathText(doc, '//time[@itemprop="dateCreated"]/@datetime');
	newItem.attachments = [{
		document: doc,
		title: "The Economist Snapshot",
		mimeType: "text/html"
	}];

	newItem.complete();
}


function getSearchResults(doc, url, checkOnly) {
	var items = {};
	var found = false;
	var rows;
	if (url.indexOf('/printedition/')>-1) {
		rows = ZU.xpath(doc, '//li/a[contains(@class, "list__link")]');
	} else if (url.indexOf('/search?')>-1) {
		rows = ZU.xpath(doc, '//div[contains(@class, "gs-title")]/a[@class="gs-title" and not(contains(@href, "topics"))]');
	} else {
		rows = ZU.xpath(doc, '//article/a[contains(@class, "teaser__link")]');
	}
	for (var i=0; i<rows.length; i++) {
		var href = rows[i].href;
		var title = ZU.trimInternal(rows[i].textContent);
		if (!href || !title) continue;
		if (checkOnly) return true;
		found = true;
		items[href] = title;
	}
	return found ? items : false;
}


function doWeb(doc, url) {
	if (detectWeb(doc, url) == "multiple") {
		Zotero.selectItems(getSearchResults(doc, url, false), function (items) {
			if (!items) {
				return true;
			}
			var articles = [];
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
		"url": "http://www.economist.com/node/21538214",
		"items": [
			{
				"itemType": "magazineArticle",
				"title": "Dreams and realities",
				"creators": [],
				"date": "2011-11-12T00:00:00+0000",
				"ISSN": "0013-0613",
				"abstractNote": "A battle over American-led free trade brews in Asia",
				"libraryCatalog": "The Economist",
				"publicationTitle": "The Economist",
				"url": "http://www.economist.com/node/21538214",
				"attachments": [
					{
						"title": "The Economist Snapshot",
						"mimeType": "text/html"
					}
				],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.economist.com/printedition/2013-12-07",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://www.economist.com/sections/united-states",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://www.economist.com/search?q=mannheim",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://www.economist.com/news/international/21726276-last-week-newspaper-said-alphabets-boss-should-write-detailed-ringing-rebuttal",
		"items": [
			{
				"itemType": "magazineArticle",
				"title": "The e-mail Larry Page should have written to James Damore",
				"creators": [],
				"date": "2017-08-19T00:00:00Z",
				"ISSN": "0013-0613",
				"abstractNote": "Last week this newspaper said Alphabet’s boss should write a “detailed, ringing rebuttal” of a viral anti-diversity memo sent at Google. Here is how we imagine it",
				"libraryCatalog": "The Economist",
				"publicationTitle": "The Economist",
				"url": "https://www.economist.com/news/international/21726276-last-week-newspaper-said-alphabets-boss-should-write-detailed-ringing-rebuttal",
				"attachments": [
					{
						"title": "The Economist Snapshot",
						"mimeType": "text/html"
					}
				],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.economist.com/blogs/democracyinamerica/2017/11/free-speech-supreme-court",
		"items": [
			{
				"itemType": "magazineArticle",
				"title": "The justices dive into new abortion controversy",
				"creators": [],
				"date": "2017-11-15T07:47:30Z",
				"ISSN": "0013-0613",
				"abstractNote": "Can a state require pro-life pregnancy centres to alert women of government-funded abortions?",
				"libraryCatalog": "The Economist",
				"publicationTitle": "The Economist",
				"url": "https://www.economist.com/blogs/democracyinamerica/2017/11/free-speech-supreme-court",
				"attachments": [
					{
						"title": "The Economist Snapshot",
						"mimeType": "text/html"
					}
				],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/
