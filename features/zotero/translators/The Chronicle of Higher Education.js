{
	"translatorID": "1e6d1529-246f-4429-84e2-1f1b180b250d",
	"label": "The Chronicle of Higher Education",
	"creator": "Simon Kornblith, Avram Lyon",
	"target": "^https?://chronicle\\.com/",
	"minVersion": "2.1",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsbv",
	"lastUpdated": "2013-12-09 23:24:00"
}

/*
 This translator works on articles posted in The Chronicle of Higher Education.

 It is based on the earlier translator by Simon Kornblith, but the Chronicle has
 significantly restructured the site since 2006, breaking the old translator.
*/

function detectWeb(doc, url) {
	/* The /daily/ and /weekly/ sections are leftover from the previous version
	   of the translator; they don't appear to still be on the Chronicle site, but
	   they might persist in older URLs. */
	var articleRegexp = /\/(daily|weekly|article|blogPost|blogs\/\w+)\/[^/]+\// ;
	if(articleRegexp.test(url) && ZU.xpathText(doc, '//h1')) {
		var section = url.match(articleRegexp);
		switch (section[1]) {
			case "weekly":
			case "daily":
			case "article":
				return "magazineArticle";
			case "blogPost":    
				return "blogPost";
			default:
				if (section[1].indexOf("blogs") !== -1)
					return "blogPost";
				return false;
		}
	} else {
		// This approach, used again below, is pretty crude.
		var aTags = doc.getElementsByTagName("a");
		for(var i=0; i<aTags.length; i++) {
			if(articleRegexp.test(aTags[i].href)) {
				return "multiple";
			}
		}
	}
}

function doWeb (doc, url) {

	
	var articles = new Array();
	if (detectWeb(doc, url) == "multiple") {
		var items = {};
		var results = ZU.xpath(doc, '//h4[@class="result-title"]/a')
		if (results.length<1){
			var results = ZU.xpath(doc, '//div[@id="portal"]//h4/a[contains(@href, "/article/")]|//div[@id="portal"]//h2/a[contains(@href, "/article/")]|//div[@class="blogpost-container"]/a' )
		}
		for (var i in results){
			items[results[i].href] = results[i].textContent.trim();
		}
		
		Zotero.selectItems(items, function (items) {
			if (!items) {
				return true;
			}
			for (var i in items) {
				articles.push(i);
			}
			Z.debug(articles)
			Zotero.Utilities.processDocuments(articles, scrape);	
		});
	} else {
		scrape(doc, url)
	}
}

function scrape (doc, url){
		var type = detectWeb(doc, doc.location.href);
		var item = new Zotero.Item(type);

		item.url = doc.location.href;
		item.publicationTitle = "The Chronicle of Higher Education";
		// Does the ISSN apply to online-only blog posts?
		item.ISSN = "0009-5982";
		
		var byline = doc.evaluate('//p[@class="byline"]', doc, null, XPathResult.ANY_TYPE, null).iterateNext();
		if (!byline) byline = doc.evaluate('//div[@class="blog__author"]/a', doc, null, XPathResult.ANY_TYPE, null).iterateNext();
		if (byline !== null) {
			var authors = parseAuthors(byline.textContent);
			for (var i = 0; i < authors.length; i++) {
				item.creators.push(Zotero.Utilities.cleanAuthor(authors[i], "author"));
			}
		}
		
		// Behavior for some items is different:
		if(type === "blogPost") {
			item.date = ZU.xpathText(doc, '//div[@class="blog__author"]/time');
			item.title = ZU.xpathText(doc, '//h2[@class="blog__title"]');
			//legacy blogs
			if (!item.title) item.title = ZU.xpathText(doc, '//h1[@class="title"]')
			if(!item.date) item.date= ZU.xpathText(doc, '//p[@class="time"]');
			
			var blogname = ZU.xpathText(doc, '//div[@class="blog__mast"]//h2[contains(@class, "blog__name")]');
			if (blogname) item.publicationTitle = item.publicationTitle + " Blogs: " + blogname;
		} else {
			var dateline = doc.evaluate('//p[@class="dateline"]', doc, null, XPathResult.ANY_TYPE, null).iterateNext();
			if (dateline !== null) {
				item.date = dateline.textContent;
			}
			item.title = ZU.xpathText(doc, '//div[@class="article"]/h1');
			var section = ZU.xpathText(doc, '//div[@class="header-breadcrumb-wrap"]/h1');
			if (section) item.section = ZU.trimInternal(section)
			
			// Some items have publication details at the end of the article; one
			// example is: http://chronicle.com/article/Grinnells-Green-Secrets/2653/
			var articleParagraphs = doc.evaluate('//div[@class="article-body"]/p', doc, null, XPathResult.ANY_TYPE, null);
			var par;
			while ((par = articleParagraphs.iterateNext()) !== null) {
				var data = par.textContent.match(/Section: ([a-zA-Z -&]+)[\n\t ]+Volume ([0-9]+), Issue ([0-9]+), Page ([0-9A-Za-z]+)/);
				if (data !== null && data.length > 0) {
					item.pages = data[4];
					// If the section here and in the page proper are different, concatenate
					if (item.section !== data[1])
						item.section = item.section + " : " + Zotero.Utilities.trimInternal(data[1]);
					// Since newspaperArticle doesn't have Volume / Issue, put as Edition
					item.edition = "Volume " + data[2] + ", Issue " + data[3];
				}
			}
		}
		
		item.attachments.push({url:doc.location.href, title: ("Chronicle of Higher Education Snapshot"), mimeType:"text/html"});
		item.complete();

}

function parseAuthors(author) {
		// Sometimes we have "By Author and Author"
		if(author.substr(0, 3).toLowerCase() == "by ") {
			author = author.substr(3);
		}
		
		// Sometimes the author is in all caps
		var pieces = author.split(" ");
		for (var i = 0; i < pieces.length; i++) {
			// TODO Make the all-caps character class more inclusive
			if (pieces[i].match(/[A-Z-]+/) !== null)
				pieces[i] = Zotero.Utilities.capitalizeTitle(pieces[i].toLowerCase(), true);
		}
		author = pieces.join(" ");
		
		// Somtimes we have multiple authors
		var authors = author.split(" and ");
		return authors;
}


/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://chronicle.com/blogs/profhacker/the-second-day-of-thatcamp/23068",
		"items": [
			{
				"itemType": "blogPost",
				"creators": [
					{
						"firstName": "Amy",
						"lastName": "Cavender",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Chronicle of Higher Education Snapshot",
						"mimeType": "text/html"
					}
				],
				"url": "http://chronicle.com/blogs/profhacker/the-second-day-of-thatcamp/23068",
				"publicationTitle": "The Chronicle of Higher Education Blogs: ProfHacker",
				"ISSN": "0009-5982",
				"date": "March 26, 2010",
				"title": "The Second Day of THATCamp",
				"libraryCatalog": "The Chronicle of Higher Education",
				"accessDate": "CURRENT_TIMESTAMP"
			}
		]
	},
	{
		"type": "web",
		"url": "http://chronicle.com/article/A-Little-Advice-From-32000/46210/",
		"items": [
			{
				"itemType": "magazineArticle",
				"creators": [
					{
						"firstName": "Adam",
						"lastName": "Fagen",
						"creatorType": "author"
					},
					{
						"firstName": "Kimberly Suedkamp",
						"lastName": "Wells",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Chronicle of Higher Education Snapshot",
						"mimeType": "text/html"
					}
				],
				"url": "http://chronicle.com/article/A-Little-Advice-From-32000/46210/",
				"publicationTitle": "The Chronicle of Higher Education",
				"ISSN": "0009-5982",
				"date": "January 14, 2002",
				"title": "A Little Advice From 32,000 Graduate Students",
				"section": "Advice",
				"libraryCatalog": "The Chronicle of Higher Education",
				"accessDate": "CURRENT_TIMESTAMP"
			}
		]
	},
	{
		"type": "web",
		"url": "http://chronicle.com/article/Grinnells-Green-Secrets/2653/",
		"items": [
			{
				"itemType": "magazineArticle",
				"creators": [
					{
						"firstName": "Xiao-Bo",
						"lastName": "Yuan",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Chronicle of Higher Education Snapshot",
						"mimeType": "text/html"
					}
				],
				"url": "http://chronicle.com/article/Grinnells-Green-Secrets/2653/",
				"publicationTitle": "The Chronicle of Higher Education",
				"ISSN": "0009-5982",
				"date": "June 16, 2006",
				"title": "Grinnell's Green Secrets",
				"section": "News : Short Subjects",
				"pages": "A9",
				"edition": "Volume 52, Issue 41",
				"libraryCatalog": "The Chronicle of Higher Education",
				"accessDate": "CURRENT_TIMESTAMP"
			}
		]
	},
	{
		"type": "web",
		"url": "http://chronicle.com/blogPost/humanities-cyberinfrastructure-project-bamboo/6138",
		"items": [
			{
				"itemType": "blogPost",
				"creators": [
					{
						"firstName": "Stan",
						"lastName": "Katz",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Chronicle of Higher Education Snapshot",
						"mimeType": "text/html"
					}
				],
				"url": "http://chronicle.com/blogPost/humanities-cyberinfrastructure-project-bamboo/6138",
				"publicationTitle": "The Chronicle of Higher Education",
				"ISSN": "0009-5982",
				"date": "July 17, 2008, 01:29 PM ET",
				"title": "Humanities Cyberinfrastructure: Project Bamboo",
				"libraryCatalog": "The Chronicle of Higher Education",
				"accessDate": "CURRENT_TIMESTAMP",
				"shortTitle": "Humanities Cyberinfrastructure"
			}
		]
	},
	{
		"type": "web",
		"url": "http://chronicle.com/section/Opinion-Ideas/40/?eio=58977",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://chronicle.com/search/?search_siteId=5&contextId=&action=rem&searchQueryString=adjunct",
		"items": "multiple"
	}
]
/** END TEST CASES **/