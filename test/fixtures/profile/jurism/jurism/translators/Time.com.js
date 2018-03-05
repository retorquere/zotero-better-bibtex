{
	"translatorID": "d9be934c-edb9-490c-a88d-34e2ee106cd7",
	"label": "Time.com",
	"creator": "Michael Berkowitz",
	"target": "^https?://([^/]*\\.)?time\\.com/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsv",
	"lastUpdated": "2017-05-23 21:37:25"
}

function detectWeb(doc, url) {
	if (url.indexOf('results.html') != -1) {
		return "multiple";
	} else if (url.search(/\/article\/|\d{4}\/\d{2}\/\d{2}\/./) != -1
		|| ZU.xpath(doc, '//section[@class="article-body"]/div[@class="issue-date"]').length
		|| doc.getElementsByClassName('active').length
	) {
		return "magazineArticle";
	}
	// TODO: detect new content on scroll, beacause we should not detect on
	// ads and ToC content
}

function handleAuthors(authors) {
	if (authors && (authors = authors.trim())) {
		var matches = authors.match(/^\s*([^\/]+?)\s*\/\s*(.+?)\s*$/);
		if (matches) {
			if (matches[1] == 'AP' || matches[1] == 'Fortune') {
				authors = matches[2];
			} else {
				authors = matches[1];
			}
		}
		
		//x, y and z
		authors = authors.replace(/^By\s+|\sBy\s+/, "").split(/\s*,\s*|\s+and\s+/i);
		var authArr = [];
		for (var i = 0, n = authors.length; i < n; i++) {
			authArr.push(ZU.cleanAuthor(ZU.capitalizeTitle(authors[i].replace(/\s+@.+/, "")), 'author'));
		}
		if (authArr.length) return authArr;
	}
	return [];
}

function handleKeywords(keywords) {
	if (keywords && (keywords = keywords.trim())) {
		return keywords.split(', ');
	}
	return [];
}

function scrape(doc, url) {
	var article = ZU.xpath(doc, '//section/div[@class="wrapper"]/article[contains(@class, "active")]')[0],
		metaUrl = ZU.xpathText(doc, '/html/head/meta[@property="og:url"]/@content');

	if (article && metaUrl && doc.location.href.indexOf(metaUrl) == -1) {
		var item = new Zotero.Item("magazineArticle");
		item.title = ZU.trimInternal(article.getElementsByClassName('article-title')[0].textContent);
		item.publicationTitle = "Time";
		item.url = url;
		item.ISSN = "0040-781X";
		item.language = "en-US";
		
		var authors = article.getElementsByClassName('byline');
		if (authors.length) {
			item.creators = handleAuthors(authors
				.map(function(a) { return ZU.trimInternal(a.textContent) })
				.join(', ')
			);
		}

		var keywords = ZU.xpathText(article, 'header//a[@class="topic-tag" or @class="section-tag"]');
		if (keywords) item.tags = handleKeywords(keywords);

		item.abstractNote = ZU.xpathText(doc, '//h2[@class="article-excerpt"]');
		item.date = ZU.xpathText(article, 'header//time[@class="publish-date"]/@datetime');
		
		item.complete();
	} else {
		var translator = Zotero.loadTranslator('web');
		translator.setTranslator('951c027d-74ac-47d4-a107-9c3069ab7b48');
		translator.setDocument(doc);
		
		translator.setHandler('itemDone', function(obj, item) {
			item.itemType = "magazineArticle";
			item.publicationTitle = "Time";
			item.url = url;
			item.ISSN = "0040-781X";
			item.language = "en-US";
			
			var authors = ZU.xpathText(doc, '//meta[@name="byline"]/@content')
				|| ZU.xpathText(doc, '//span[@class="author vcard"]/a', null, ' and ')
				|| ZU.xpathText(doc, '//span[@class="entry-byline"]')
				|| ZU.xpathText(doc, '//header[@class="article-header"]\
					//ul[@class="article-authors"]//span[@class="byline"]/a');
			if (authors) item.creators = handleAuthors(authors);

			var title = ZU.xpathText(doc, '//h1[@class="entry-title"]');
			if (title) item.title = title;
			
			var keywords = ZU.xpathText(doc, '/html/head/meta[@name="keywords"]/@content')
				|| ZU.xpathText(doc, 'header//a[@class="topic-tag" or @class="section-tag"]');
			if (keywords) item.tags = handleKeywords(keywords);
			
			if (!item.abstractNote) item.abstractNote = ZU.xpathText(doc, '//h2[@class="article-excerpt"]');
			if (!item.date) item.date = ZU.xpathText(doc, '//time[@class="publish-date"]/@datetime');
			
			item.complete();
		});
		
		translator.getTranslatorObject(function(em) {
			em.addCustomFields({
				'date': 'date'
			});
		});

		translator.translate();
	}
}


function doWeb(doc, url) {
	var urls = new Array();
	if (detectWeb(doc, url) == 'multiple') {
		var items = ZU.getItemArray(doc, doc.getElementsByTagName("h3"));
		Zotero.selectItems(items, function(selectedItems) {
			if (!selectedItems) return true;
		
			var urls = new Array();
			for (var i in selectedItems) {
				urls.push(i);
			}
			Z.debug(urls)
			ZU.processDocuments(urls, scrape);
		});
	} else {
		scrape(doc, url);
	}
}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://time.com/3533556/the-war-on-teacher-tenure/",
		"items": [
			{
				"itemType": "magazineArticle",
				"title": "The War on Teacher Tenure",
				"creators": [
					{
						"firstName": "Haley Sweetland",
						"lastName": "Edwards",
						"creatorType": "author"
					}
				],
				"date": "2014-10-23 05:58:37",
				"ISSN": "0040-781X",
				"abstractNote": "It’s really difficult to fire a bad teacher. A group of Silicon Valley investors wants to change that",
				"accessDate": "CURRENT_TIMESTAMP",
				"libraryCatalog": "time.com",
				"publicationTitle": "Time",
				"url": "http://time.com/3533556/the-war-on-teacher-tenure/",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					"cover story",
					"education",
					"nation",
					"silicon valley",
					"teahers",
					"tech"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://time.com/3512672/the-new-ebola-protocols",
		"items": [
			{
				"itemType": "magazineArticle",
				"title": "The New Ebola Protocols",
				"creators": [
					{
						"firstName": "David Von",
						"lastName": "Drehle",
						"creatorType": "author"
					}
				],
				"date": "2014-10-16 06:26:47",
				"ISSN": "0040-781X",
				"abstractNote": "New U.S. cases have health experts rethinking the response and turning to doctors and hospitals that were truly prepared",
				"accessDate": "CURRENT_TIMESTAMP",
				"libraryCatalog": "time.com",
				"publicationTitle": "Time",
				"url": "http://time.com/3512672/the-new-ebola-protocols/",
				"attachments": [
					{
						"document": "[object]",
						"title": "Snapshot"
					}
				],
				"tags": [
					"ebola",
					"medicine"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://content.time.com/time/nation/article/0,8599,2099187,00.html",
		"items": [
			{
				"itemType": "magazineArticle",
				"title": "How the U.S. Postal Service Fell Apart",
				"creators": [
					{
						"firstName": "Josh",
						"lastName": "Sanburn",
						"creatorType": "author"
					}
				],
				"date": "Thursday, Nov. 17, 2011",
				"ISSN": "0040-781X",
				"abstractNote": "Battling debilitating congressional mandates and competition online, the USPS is closing thousands of post offices and struggling to find a place in the modern world. But there are people behind the scenes trying to save this American institution",
				"language": "en-US",
				"libraryCatalog": "content.time.com",
				"publicationTitle": "Time",
				"url": "http://content.time.com/time/nation/article/0,8599,2099187,00.html",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					"Post Offices",
					"Postal Service",
					"USPS",
					"United States Postal Service"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://content.time.com/time/nation/article/0,8599,2108263,00.html",
		"items": [
			{
				"itemType": "magazineArticle",
				"title": "On Scene in Indiana and Kentucky: When the Tornadoes Came",
				"creators": [
					{
						"firstName": "Cary",
						"lastName": "Stemle",
						"creatorType": "author"
					}
				],
				"date": "Sunday, Mar. 04, 2012",
				"ISSN": "0040-781X",
				"abstractNote": "The month of March isn't really the heart of the tornado season but they have come fast and with awesome destruction.",
				"language": "en-US",
				"libraryCatalog": "content.time.com",
				"publicationTitle": "Time",
				"shortTitle": "On Scene in Indiana and Kentucky",
				"url": "http://content.time.com/time/nation/article/0,8599,2108263,00.html",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					"destruction",
					"henryville",
					"indiana",
					"kentucky",
					"storm",
					"tornado",
					"weather"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://swampland.time.com/2012/03/04/obama-courts-aipac-before-netanyahu-meeting/?iid=sl-main-lede",
		"items": [
			{
				"itemType": "magazineArticle",
				"title": "Obama Courts AIPAC Before Netanyahu Meeting",
				"creators": [
					{
						"firstName": "Jay",
						"lastName": "Newton-Small",
						"creatorType": "author"
					}
				],
				"ISSN": "0040-781X",
				"abstractNote": "Obama rejected any notion that his administration has not been in Israel's corner. “Over the last three years, as President of the United States, I have kept my commitments to the state of Israel.\" The President then ticked off the number of ways he has supported Israel in the last year.",
				"language": "en-US",
				"libraryCatalog": "swampland.time.com",
				"publicationTitle": "Time",
				"url": "http://swampland.time.com/2012/03/04/obama-courts-aipac-before-netanyahu-meeting/?iid=sl-main-lede",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					"aipac",
					"barack obama",
					"bibi",
					"iran",
					"israel",
					"mahmoud ahamadinejad",
					"netanyahu",
					"obama",
					"speech",
					"washington"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://business.time.com/2012/03/02/struggling-to-stay-afloat-number-of-underwater-homeowners-keeps-on-rising/?iid=pf-main-lede/",
		"items": [
			{
				"itemType": "magazineArticle",
				"title": "Struggling to Stay Afloat: Number of Underwater Homeowners Keeps on Rising",
				"creators": [
					{
						"firstName": "Brad",
						"lastName": "Tuttle",
						"creatorType": "author"
					}
				],
				"ISSN": "0040-781X",
				"abstractNote": "Despite signs that some housing markets are improving, the overall trend is for home prices (and values) to keep dropping—and dropping. As values shrink, more and more homeowners find themselves underwater, the unfortunate scenario in which one owes more on the mortgage than the home is worth.",
				"language": "en-US",
				"libraryCatalog": "business.time.com",
				"publicationTitle": "Time",
				"shortTitle": "Struggling to Stay Afloat",
				"url": "http://business.time.com/2012/03/02/struggling-to-stay-afloat-number-of-underwater-homeowners-keeps-on-rising/?iid=pf-main-lede/",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					"arizona",
					"baltimore",
					"california",
					"california real estate",
					"dallas",
					"economics & policy",
					"florida",
					"florida real estate",
					"georgia",
					"mortgages",
					"nevada",
					"personal finance",
					"real estate & homes",
					"real estate markets",
					"sunbelt",
					"the economy",
					"underwater",
					"upside-down"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://search.time.com/results.html?Ntt=labor&N=0&Nty=1&p=0&cmd=tags",
		"items": "multiple"
	}
]
/** END TEST CASES **/