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
	"lastUpdated": "2016-09-05 23:14:05"
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


function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = ZU.xpath(doc, '//h3[@class="post-title entry-title"]/a|//li[@class="archivedate expanded"]/ul[@class="posts"]/li/a');
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
//Blogger translator. Code by Adam Crymble

function scrape(doc, url) {
	var tagsContent = new Array();
	var newItem = new Zotero.Item("blogPost");
	
	//title
		if (ZU.xpathText(doc, '//h3[@class="post-title entry-title"]/a')) {
			newItem.title = ZU.xpathText(doc, '//h3[@class="post-title entry-title"]/a');
		} else {
			newItem.title = doc.title;
		}
	
	//author, if available
		if (ZU.xpathText(doc, '//span[@class="post-author vcard"]//span[@class="fn"]')) {
			var author = ZU.xpathText(doc, '//span[@class="post-author vcard"]//span[@class="fn"]').trim();
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
		newItem.date = ZU.xpathText(doc, '//h2[@class="date-header"]');
			

	//tags, if available
		var tags = ZU.xpath(doc, '//span[@class="post-labels"]/a');
		for (var i = 0; i < tags.length; i++) {
			newItem.tags.push(tags[i].textContent);
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
		Zotero.selectItems(getSearchResults(doc, false), function(items) {
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
}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://observationalepidemiology.blogspot.com/2011/10/tweet-from-matt-yglesias.html",
		"items": [
			{
				"itemType": "blogPost",
				"title": "A tweet from Matt Yglesias",
				"creators": [
					{
						"firstName": "",
						"lastName": "Joseph",
						"creatorType": "author"
					}
				],
				"date": "Monday, October 24, 2011",
				"accessDate": "CURRENT_TIMESTAMP",
				"blogTitle": "West Coast Stat Views (on Observational Epidemiology and more)",
				"libraryCatalog": "Blogger",
				"url": "http://observationalepidemiology.blogspot.com/2011/10/tweet-from-matt-yglesias.html",
				"attachments": [
					{
						"title": "Blogspot Snapshot",
						"mimeType": "text/html"
					}
				],
				"tags": [
					"Mark",
					"Matthew Yglesias"
				],
				"notes": [],
				"seeAlso": []
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
				"title": "Politica Argentina - Blog de Psicología Política de Federico González: Perciben una caída en la imagen de la Presidenta",
				"creators": [
					{
						"firstName": "Federico",
						"lastName": "Gonzalez",
						"creatorType": "author"
					}
				],
				"date": "domingo, 11 de marzo de 2012",
				"blogTitle": "Politica Argentina - Blog de Psicología Política de Federico González",
				"shortTitle": "Politica Argentina - Blog de Psicología Política de Federico González",
				"url": "http://argentina-politica.blogspot.com/2012/03/perciben-una-caida-en-la-imagen-de-la.html",
				"attachments": [
					{
						"title": "Blogspot Snapshot",
						"mimeType": "text/html"
					}
				],
				"tags": [
					"Cristina Kirchner",
					"imagen"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://utotherescue.blogspot.com/2013/11/the-heart-of-matter-humanities-do-more.html",
		"items": [
			{
				"itemType": "blogPost",
				"title": "National Humanities Report Reinforces Stereotypes about the Humanities ~ Remaking the University",
				"creators": [
					{
						"firstName": "Michael",
						"lastName": "Meranze",
						"creatorType": "author"
					}
				],
				"date": "Monday, November 25, 2013",
				"blogTitle": "National Humanities Report Reinforces Stereotypes about the Humanities ~ Remaking the University",
				"url": "http://utotherescue.blogspot.com/2013/11/the-heart-of-matter-humanities-do-more.html",
				"attachments": [
					{
						"title": "Blogspot Snapshot",
						"mimeType": "text/html"
					}
				],
				"tags": [
					"Cuts",
					"Development",
					"Humanities",
					"Liberal Arts",
					"guest post"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://jamsubuntu.blogspot.com/2009/01/unmount-command-not-found.html",
		"items": [
			{
				"itemType": "blogPost",
				"title": "Jam's Ubuntu Linux Blog: unmount: command not found",
				"creators": [],
				"date": "Wednesday, 7 January 2009",
				"blogTitle": "Jam's Ubuntu Linux Blog",
				"shortTitle": "Jam's Ubuntu Linux Blog",
				"url": "https://jamsubuntu.blogspot.com/2009/01/unmount-command-not-found.html",
				"attachments": [
					{
						"title": "Blogspot Snapshot",
						"mimeType": "text/html"
					}
				],
				"tags": [
					"Command Line"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/