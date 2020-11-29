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
	"lastUpdated": "2020-10-31 11:08:32"
}

function detectWeb(doc, url) {
	var m = url.match(/^https?:\/\/[^/]+\/[^/]*\/[^/]*\/\d+/);
	//Z.debug(m)
	if (url.includes('/node/') || m) {
		return "magazineArticle";
	}
	if (getSearchResults(doc, url, true)) {
		return "multiple";
	}
	return false;
}

function scrape(doc, url) {
	var newItem = new Zotero.Item("magazineArticle");
	newItem.ISSN = "0013-0613";
	newItem.url = url;
	newItem.publicationTitle = "The Economist";

	// Headline
	var title = text('h1 *[itemprop=headline]');
	// As of 10/2020 these meta tags seem to be removed from the DOM after page load,
	// so this won't work
	if (!title) title = ZU.xpathText(doc, '//meta[@property="og:title"]/@content');
	if (!title) {
		try {
			title = JSON.parse(text('script#__NEXT_DATA__')).props.pageProps.content.headline;
		}
		catch (e) {}
	}
	newItem.title = title;

	if (doc.evaluate('//div[@class="clear"][@id="pay-barrier"]/div[@class="col-right"]', doc, null, XPathResult.ANY_TYPE, null).iterateNext()) {
		newItem.extra = "(Subscription only)";
		newItem.complete();
		return;
	}
	//get abstract
	var abstract = ZU.xpathText(doc, '//h1[@class="rubric"]');
	if (!abstract) abstract = ZU.xpathText(doc, '//*[@itemprop="description"]');
	newItem.abstractNote = abstract;
	//get date and extra stuff
	newItem.date = ZU.xpathText(doc, '//time[@itemtype="http://schema.org/DateTime"]/@datetime');
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
	if (url.includes('/search?')) {
		rows = ZU.xpath(doc, '//a[@class="search-result"]');
	}
	else {
		rows = doc.querySelectorAll('a.headline-link');
	}
	for (let i = 0; i < rows.length; i++) {
		var href = rows[i].href;
		let [subhead, head] = rows[i].innerText.split(/\n/);
		let title = ZU.trimInternal(subhead);
		if (head) {
			title = ZU.trimInternal(head) + ' — ' + title;
		}
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
				return;
			}
			var articles = [];
			for (var i in items) {
				articles.push(i);
			}
			ZU.processDocuments(articles, scrape);
		});
	}
	else {
		scrape(doc, url);
	}
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://www.economist.com/asia/2011/11/12/dreams-and-realities",
		"items": [
			{
				"itemType": "magazineArticle",
				"title": "Dreams and realities",
				"creators": [],
				"date": "2011-11-12T00:00:00Z",
				"ISSN": "0013-0613",
				"abstractNote": "A battle over American-led free trade brews in Asia",
				"libraryCatalog": "The Economist",
				"publicationTitle": "The Economist",
				"url": "https://www.economist.com/asia/2011/11/12/dreams-and-realities",
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
		"url": "https://www.economist.com/international/2017/08/19/the-e-mail-larry-page-should-have-written-to-james-damore",
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
				"url": "https://www.economist.com/international/2017/08/19/the-e-mail-larry-page-should-have-written-to-james-damore",
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
		"url": "https://www.economist.com/democracy-in-america/2017/11/15/the-justices-dive-into-new-abortion-controversy",
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
				"url": "https://www.economist.com/democracy-in-america/2017/11/15/the-justices-dive-into-new-abortion-controversy",
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
