{
	"translatorID": "1e6d1529-246f-4429-84e2-1f1b180b250d",
	"label": "The Chronicle of Higher Education",
	"creator": "Simon Kornblith, Avram Lyon",
	"target": "^https?://(www\\.)?chronicle\\.com/",
	"minVersion": "2.1",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsbv",
	"lastUpdated": "2017-04-09 14:53:05"
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
		var results = ZU.xpath(doc, '//span[@class="content-card__heading"]/h4/a')
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
		var type = detectWeb(doc, url);
		var item = new Zotero.Item(type);

		item.url = doc.location.href;
		item.publicationTitle = "The Chronicle of Higher Education";
		// Does the ISSN apply to online-only blog posts?
		item.ISSN = "0009-5982";
		
		var byline = doc.evaluate('//header/div/span[@class="content-item__byline"]', doc, null, XPathResult.ANY_TYPE, null).iterateNext();
		if (!byline) byline = doc.evaluate('//div[@class="blog__author"]/a', doc, null, XPathResult.ANY_TYPE, null).iterateNext();
		if (byline !== null) {
			var authors = parseAuthors(byline.textContent.trim());
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
			item.date = ZU.xpathText(doc, '//header/div/span[@class="content-item__date"]')
			item.title = ZU.xpathText(doc, '//header/h1');
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
				"title": "The Second Day of THATCamp",
				"creators": [
					{
						"firstName": "Amy",
						"lastName": "Cavender",
						"creatorType": "author"
					}
				],
				"date": "March 26, 2010",
				"ISSN": "0009-5982",
				"accessDate": "CURRENT_TIMESTAMP",
				"libraryCatalog": "The Chronicle of Higher Education",
				"publicationTitle": "The Chronicle of Higher Education Blogs: ProfHacker",
				"url": "http://chronicle.com/blogs/profhacker/the-second-day-of-thatcamp/23068",
				"attachments": [
					{
						"title": "Chronicle of Higher Education Snapshot",
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
		"url": "http://chronicle.com/article/A-Little-Advice-From-32000/46210/",
		"items": [
			{
				"itemType": "magazineArticle",
				"title": "A Little Advice From 32,000 Graduate Students",
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
				"date": "January 14, 2002",
				"ISSN": "0009-5982",
				"accessDate": "CURRENT_TIMESTAMP",
				"libraryCatalog": "The Chronicle of Higher Education",
				"publicationTitle": "The Chronicle of Higher Education",
				"section": "Advice",
				"url": "http://chronicle.com/article/A-Little-Advice-From-32000/46210/",
				"attachments": [
					{
						"title": "Chronicle of Higher Education Snapshot",
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
		"url": "http://chronicle.com/article/Grinnells-Green-Secrets/2653/",
		"items": [
			{
				"itemType": "magazineArticle",
				"title": "Grinnell's Green Secrets",
				"creators": [
					{
						"firstName": "Xiao-Bo",
						"lastName": "Yuan",
						"creatorType": "author"
					}
				],
				"date": "June 16, 2006",
				"ISSN": "0009-5982",
				"libraryCatalog": "The Chronicle of Higher Education",
				"publicationTitle": "The Chronicle of Higher Education",
				"url": "http://chronicle.com/article/Grinnells-Green-Secrets/2653/",
				"attachments": [
					{
						"title": "Chronicle of Higher Education Snapshot",
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
		"url": "http://chronicle.com/blogs/brainstorm/humanities-cyberinfrastructure-project-bamboo/6138",
		"items": [
			{
				"itemType": "blogPost",
				"title": "Humanities Cyberinfrastructure: Project Bamboo",
				"creators": [
					{
						"firstName": "Stan",
						"lastName": "Katz",
						"creatorType": "author"
					}
				],
				"date": "July 17, 2008",
				"blogTitle": "The Chronicle of Higher Education Blogs: Brainstorm",
				"shortTitle": "Humanities Cyberinfrastructure",
				"url": "http://chronicle.com/blogs/brainstorm/humanities-cyberinfrastructure-project-bamboo/6138",
				"attachments": [
					{
						"title": "Chronicle of Higher Education Snapshot",
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
