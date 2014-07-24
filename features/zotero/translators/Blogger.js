{
	"translatorID": "6f9aa90d-6631-4459-81ef-a0758d2e3921",
	"label": "Blogger",
	"creator": "Adam Crymble",
	"target": "\\.blogspot\\.com",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2014-02-14 00:20:16"
}

function detectWeb(doc, url) {
	var result = doc.evaluate('//h3[contains(@class,"post-title") and contains(@class,"entry-title")]', doc, null, XPathResult.ANY_TYPE, null);
	var entry = result.iterateNext();
	if (entry && result.iterateNext()) {
		return "multiple";
	} else if (entry) {
		return "blogPost";
	} else {
		return false;
	}
}

//Blogger translator. Code by Adam Crymble

function scrape(doc, url) {
	var tagsContent = new Array();
	var newItem = new Zotero.Item("blogPost");
	
	//title
		if (doc.evaluate('//h3[@class="post-title entry-title"]/a', doc, null, XPathResult.ANY_TYPE, null).iterateNext()) {
		
			newItem.title = doc.evaluate('//h3[@class="post-title entry-title"]/a', doc, null, XPathResult.ANY_TYPE, null).iterateNext().textContent;
		} else {
			newItem.title = doc.title;
		}
	
	//author, if available
		if (doc.evaluate('//span[@class="post-author vcard"]', doc,  null, XPathResult.ANY_TYPE, null).iterateNext()) {
			var author = doc.evaluate('//span[@class="post-author vcard"]//span[@class="fn"]', doc,  null, XPathResult.ANY_TYPE, null).iterateNext().textContent.replace(/^\s*|\s*$/g, '');
			var author = author.toLowerCase();
			if (author.match(/\sby\s/)) {
				var shortenAuthor = author.indexOf(" by");
				author = author.substr(shortenAuthor + 3).replace(/^\s*|\s$/g, '');
			}
			var words = author.split(/\s/);
				for (var i in words) {
					words[i] = words[i].substr(0, 1).toUpperCase() + words[i].substr(1).toLowerCase();
				}
			author = words.join(" ");
			newItem.creators.push(Zotero.Utilities.cleanAuthor(author, "author"));
		}
	
	//date, if available
		if (doc.evaluate('//h2[@class="date-header"]', doc, null, XPathResult.ANY_TYPE, null).iterateNext()) {
			newItem.date = doc.evaluate('//h2[@class="date-header"]', doc, null, XPathResult.ANY_TYPE, null).iterateNext().textContent;
			
		}
		
	//tags, if available
		if (doc.evaluate('//span[@class="post-labels"]/a', doc, null, XPathResult.ANY_TYPE, null).iterateNext()) {
			var tags = doc.evaluate('//span[@class="post-labels"]/a', doc, null, XPathResult.ANY_TYPE, null);
			
			var tags1;
			while (tags1 = tags.iterateNext()) {
				tagsContent.push(tags1.textContent);
			}
			
			for (var i = 0; i < tagsContent.length; i++) {
				newItem.tags[i] = tagsContent[i];
			}
		}
		
	var blogTitle1 = doc.title.split(":");
	var cleanurl = url.replace(/[\?#].+/, "");
	newItem.blogTitle = blogTitle1[0];
	newItem.url=cleanurl;
	newItem.attachments = [{url:cleanurl, title:"Blogspot Snapshot", mimeType: "text/html"}];

	newItem.complete();
}


function doWeb(doc, url) {
	var articles = new Array();
	
	if (detectWeb(doc, url) == "multiple") {
		var items = new Object();
				
		var titles = doc.evaluate('//h3[@class="post-title entry-title"]/a', doc, null, XPathResult.ANY_TYPE, null);
		var titles1 = doc.evaluate('//li[@class="archivedate expanded"]/ul[@class="posts"]/li/a', doc, null, XPathResult.ANY_TYPE, null);
				
		var next_title;
		while (next_title = titles.iterateNext()) {
			items[next_title.href] = next_title.textContent;
		}
		
		while (next_title = titles1.iterateNext()) {
			items[next_title.href] = next_title.textContent;
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
		scrape(doc, url);
	}
}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://observationalepidemiology.blogspot.com/2011/10/tweet-from-matt-yglesias.html",
		"items": [
			{
				"itemType": "blogPost",
				"creators": [
					{
						"firstName": "",
						"lastName": "Joseph",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [
					"Mark",
					"Matthew Yglesias"
				],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Blogspot Snapshot",
						"mimeType": "text/html"
					}
				],
				"title": "A tweet from Matt Yglesias",
				"date": "Monday, October 24, 2011",
				"blogTitle": "West Coast Stat Views (on Observational Epidemiology and more)",
				"url": "http://observationalepidemiology.blogspot.com/2011/10/tweet-from-matt-yglesias.html",
				"libraryCatalog": "Blogger",
				"accessDate": "CURRENT_TIMESTAMP"
			}
		]
	},
	{
		"type": "web",
		"url": "http://observationalepidemiology.blogspot.com/",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://argentina-politica.blogspot.com/2012/03/perciben-una-caida-en-la-imagen-de-la.html",
		"items": [
			{
				"itemType": "blogPost",
				"creators": [
					{
						"firstName": "Federico",
						"lastName": "Gonzalez",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [
					"Cristina Kirchner",
					"imagen"
				],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Blogspot Snapshot",
						"mimeType": "text/html"
					}
				],
				"title": "Politica Argentina - Blog de Psicología Política de Federico González: Perciben una caída en la imagen de la Presidenta",
				"date": "domingo, 11 de marzo de 2012",
				"blogTitle": "Politica Argentina - Blog de Psicología Política de Federico González",
				"url": "http://argentina-politica.blogspot.com/2012/03/perciben-una-caida-en-la-imagen-de-la.html",
				"shortTitle": "Politica Argentina - Blog de Psicología Política de Federico González"
			}
		]
	},
	{
		"type": "web",
		"url": "http://utotherescue.blogspot.com/2013/11/the-heart-of-matter-humanities-do-more.html",
		"items": [
			{
				"itemType": "blogPost",
				"creators": [
					{
						"firstName": "Michael",
						"lastName": "Meranze",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [
					"academic development",
					"arts and sciences",
					"cutting arts and humanities",
					"guest post",
					"Humanities and Social Science Knowledge",
					"humanities disciplines",
					"public purpose",
					"thought",
					"writing"
				],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Blogspot Snapshot",
						"mimeType": "text/html"
					}
				],
				"title": "National Humanities Report Reinforces Stereotypes about the Humanities ~ Remaking the University",
				"date": "Monday, November 25, 2013",
				"blogTitle": "National Humanities Report Reinforces Stereotypes about the Humanities ~ Remaking the University",
				"url": "http://utotherescue.blogspot.com/2013/11/the-heart-of-matter-humanities-do-more.html",
				"libraryCatalog": "Blogger",
				"accessDate": "CURRENT_TIMESTAMP"
			}
		]
	}
]
/** END TEST CASES **/