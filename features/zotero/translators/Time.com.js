{
	"translatorID": "d9be934c-edb9-490c-a88d-34e2ee106cd7",
	"label": "Time.com",
	"creator": "Michael Berkowitz",
	"target": "^https?://[^/]*\\.time\\.com/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsv",
	"lastUpdated": "2014-01-02 17:52:46"
}

function detectWeb(doc, url) {

	if (url.indexOf('results.html') != -1) {
		return "multiple";
	} else 
	if (url.search(/\/article\/|\d{4}\/\d{2}\/\d{2}\/./)!=-1) {
		return "magazineArticle";
	}
}

function scrape(doc, url) {
	var translator = Zotero.loadTranslator('web');
	translator.setTranslator('951c027d-74ac-47d4-a107-9c3069ab7b48');
	translator.setDocument(doc);

	translator.setHandler('itemDone', function(obj, item) {
		item.itemType = "magazineArticle";
		item.publicationTitle = "Time";
		item.url = url;
		item.ISSN = "0040-718X";
		item.title = ZU.xpathText(doc, '//h1[@class="entry-title"]')
		if(!item.title) item.title = ZU.xpathText(doc, '//meta[@property="og:title"]/@content')
		//authors
		var authors = ZU.xpathText(doc, '/html/head/meta[@name="byline"]/@content');
		if(!authors) authors = ZU.xpathText(doc, '//span[@class="author vcard"]/a', null, ' and ');
		if(!authors) authors = ZU.xpathText(doc, '//span[@class="entry-byline"]')
		if(authors && authors.trim()) {
			var matches = authors.match(/^\s*([^\/]+?)\s*\/\s*(.+?)\s*$/);
			if(matches) {
				if(matches[1] == 'AP') {
					authors = matches[2];
				} else {
					authors = matches[1];
				}
			}

			authors = authors.replace(/^By\s+|\sBy\s+/, "").split(/ and /i);
			var authArr = new Array();
			for(var i=0, n=authors.length; i<n; i++) {
				authArr.push(ZU.cleanAuthor(ZU.capitalizeTitle(authors[i].replace(/@.+/, "")), 'author'));
			}
	
			if(authArr.length) {
				item.creators = authArr;
			}
		}

		//keywords
		var keywords = ZU.xpathText(doc, '/html/head/meta[@name="keywords"]/@content');
		if(keywords && keywords.trim()) {
			item.tags = ZU.capitalizeTitle(keywords).split(', ');
		}

		item.complete();
	});

	translator.getTranslatorObject(function(em) {
		em.addCustomFields({
			'date': 'date'
		});
	});

	translator.translate();
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
		"url": "http://content.time.com/time/nation/article/0,8599,2099187,00.html",
		"items": [
			{
				"itemType": "magazineArticle",
				"creators": [
					{
						"firstName": "Josh",
						"lastName": "Sanburn",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [
					"Post Offices",
					"Postal Service",
					"USPS",
					"United States Postal Service"
				],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"title": "How the U.S. Postal Service Fell Apart",
				"publicationTitle": "Time",
				"url": "http://content.time.com/time/nation/article/0,8599,2099187,00.html",
				"abstractNote": "Battling debilitating congressional mandates and competition online, the USPS is closing thousands of post offices and struggling to find a place in the modern world. But there are people behind the scenes trying to save this American institution",
				"libraryCatalog": "content.time.com",
				"accessDate": "CURRENT_TIMESTAMP",
				"date": "Thursday, Nov. 17, 2011",
				"ISSN": "0040-718X"
			}
		]
	},
	{
		"type": "web",
		"url": "http://content.time.com/time/nation/article/0,8599,2108263,00.html",
		"items": [
			{
				"itemType": "magazineArticle",
				"creators": [
					{
						"firstName": "Cary",
						"lastName": "Stemle",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [
					"weather",
					"storm",
					"tornado",
					"henryville",
					"indiana",
					"kentucky",
					"destruction"
				],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"title": "On Scene in Indiana and Kentucky: When the Tornadoes Came",
				"publicationTitle": "Time",
				"url": "http://content.time.com/time/nation/article/0,8599,2108263,00.html",
				"abstractNote": "The month of March isn't really the heart of the tornado season but they have come fast and with awesome destruction.",
				"libraryCatalog": "content.time.com",
				"accessDate": "CURRENT_TIMESTAMP",
				"date": "Sunday, Mar. 04, 2012",
				"ISSN": "0040-718X",
				"shortTitle": "On Scene in Indiana and Kentucky"
			}
		]
	},
	{
		"type": "web",
		"url": "http://swampland.time.com/2012/03/04/obama-courts-aipac-before-netanyahu-meeting/?iid=sl-main-lede",
		"items": [
			{
				"itemType": "magazineArticle",
				"creators": [
					{
						"firstName": "Jay",
						"lastName": "Newton-Small",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [
					"barack obama",
					"aipac",
					"bibi",
					"iran",
					"israel",
					"mahmoud ahamadinejad",
					"netanyahu",
					"obama",
					"speech",
					"washington"
				],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"title": "Obama Courts AIPAC Before Netanyahu Meeting",
				"publicationTitle": "Time",
				"url": "http://swampland.time.com/2012/03/04/obama-courts-aipac-before-netanyahu-meeting/?iid=sl-main-lede",
				"abstractNote": "Obama rejected any notion that his administration has not been in Israel's corner. “Over the last three years, as President of the United States, I have kept my commitments to the state of Israel.\" The President then ticked off the number of ways he has supported Israel in the last year.",
				"libraryCatalog": "swampland.time.com",
				"accessDate": "CURRENT_TIMESTAMP",
				"ISSN": "0040-718X"
			}
		]
	},
	{
		"type": "web",
		"url": "http://business.time.com/2012/03/02/struggling-to-stay-afloat-number-of-underwater-homeowners-keeps-on-rising/?iid=pf-main-lede/",
		"items": [
			{
				"itemType": "magazineArticle",
				"creators": [
					{
						"firstName": "Brad",
						"lastName": "Tuttle",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [
					"california real estate",
					"economics & policy",
					"florida real estate",
					"mortgages",
					"personal finance",
					"real estate & homes",
					"real estate markets",
					"the economy",
					"arizona",
					"baltimore",
					"california",
					"dallas",
					"florida",
					"georgia",
					"nevada",
					"sunbelt",
					"underwater",
					"upside-down"
				],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"title": "Struggling to Stay Afloat: Number of Underwater Homeowners Keeps on Rising",
				"publicationTitle": "Time",
				"url": "http://business.time.com/2012/03/02/struggling-to-stay-afloat-number-of-underwater-homeowners-keeps-on-rising/?iid=pf-main-lede/",
				"abstractNote": "Despite signs that some housing markets are improving, the overall trend is for home prices (and values) to keep dropping—and dropping. As values shrink, more and more homeowners find themselves underwater, the unfortunate scenario in which one owes more on the mortgage than the home is worth.",
				"libraryCatalog": "business.time.com",
				"accessDate": "CURRENT_TIMESTAMP",
				"ISSN": "0040-718X",
				"shortTitle": "Struggling to Stay Afloat"
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