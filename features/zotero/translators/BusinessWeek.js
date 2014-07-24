{
	"translatorID": "fb342bae-7727-483b-a871-c64c663c2fae",
	"label": "BusinessWeek",
	"creator": "Michael Berkowitz",
	"target": "^https?://(www\\.|search\\.)?businessweek\\.com",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2014-02-14 00:21:11"
}

function detectWeb(doc, url) {
	if (doc.evaluate('//body[contains(@class, "searchResults")]|//div[contains(@class, "search_result")]', doc, null, XPathResult.ANY_TYPE, null).iterateNext()) {
		return "multiple";
	} else if (doc.evaluate('//h1[@class="headline"]', doc, null, XPathResult.ANY_TYPE, null).iterateNext()) {
		return "magazineArticle";
	}
}

function doWeb(doc, url) {
	var articles = new Array();
	if (detectWeb(doc, url) == "multiple") {
		if (ZU.xpathText(doc, '//h3[@class="story"]/a')){
			var results = doc.evaluate('//h3[@class="story"]/a', doc, null, XPathResult.ANY_TYPE, null);
		}
		else if (ZU.xpathText(doc, '//div[@class="results"]//a[./h4]')){
				var results = doc.evaluate('//div[@class="results"]//a[./h4]', doc, null, XPathResult.ANY_TYPE, null);
		}
		var result;
		var items = new Object();
		while (result = results.iterateNext()) {
			items[result.href] = Zotero.Utilities.trimInternal(result.textContent);
		}
	Zotero.selectItems(items, function (items) {
			if (!items) {
				return true;
			}
			for (var i in items) {
				articles.push(i);
			}
			Zotero.Utilities.processDocuments(articles, scrape, function () {
				Zotero.done();
			});
		});
	} else {
		scrape(doc, url)
	}
}

function scrape(doc, url){
var metaTags = new Object();
		var metas = doc.evaluate('//meta', doc, null, XPathResult.ANY_TYPE, null);
		var meta;
		while (meta = metas.iterateNext()) {
			metaTags[meta.name] = meta.content;
		}
		Zotero.debug(metaTags);
		var item = new Zotero.Item("magazineArticle");
		item.title = ZU.xpathText(doc, '//h1[@class="headline"]');
		if (metaTags['description']) item.abstractNote = metaTags['description'];
		if (metaTags['keywords']) item.tags = metaTags['keywords'].split(/\s*,\s*/);
		//some articles don't have author tags - prevent this from failing
		if (metaTags['author']) {
			var authors = metaTags['author'].split(/\s*and\s*|\s*,\s*/);
			for (i in authors){
				item.creators.push(Zotero.Utilities.cleanAuthor(authors[i], "author"));
			}
		}
		item.publicationTitle = "BusinessWeek: " + metaTags['channel'];
		item.url = url;
		item.date = metaTags['pub_date'].replace(/(\d{4})(\d{2})(\d{2})/, "$2/$3/$1").replace(/T.+/, "");
		item.complete();
	}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.businessweek.com/management/ten-things-only-bad-managers-say-09232011.html?campaign_id=rss_topStories",
		"items": [
			{
				"itemType": "magazineArticle",
				"creators": [
					{
						"firstName": "Liz",
						"lastName": "Ryan",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [
					"leadership",
					"Management",
					"bad bosses",
					"leaders",
					"Liz Ryan",
					"bad managers",
					"lousy managers"
				],
				"seeAlso": [],
				"attachments": [],
				"title": "Ten Things Only Bad Managers Say",
				"abstractNote": "Nope, it's not just you. These jerks are out there",
				"publicationTitle": "BusinessWeek: management",
				"url": "http://www.businessweek.com/management/ten-things-only-bad-managers-say-09232011.html?campaign_id=rss_topStories",
				"date": "2011-09-23",
				"libraryCatalog": "BusinessWeek",
				"accessDate": "CURRENT_TIMESTAMP"
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.businessweek.com/search?q=linux&resultsPerPage=20&sort=date",
		"items": "multiple"
	}
]
/** END TEST CASES **/