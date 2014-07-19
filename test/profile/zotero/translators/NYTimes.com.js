{
	"translatorID": "ce7a3727-d184-407f-ac12-52837f3361ff",
	"label": "NYTimes.com",
	"creator": "Simon Kornblith",
	"target": "^https?://(?:query\\.nytimes\\.com/(?:search|gst)/(?:alternate/)?|(?:select\\.|www\\.|\\.blogs\\.)?nytimes\\.com/)",
	"minVersion": "2.1.9",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsv",
	"lastUpdated": "2014-06-11 21:54:15"
}

function detectWeb(doc, url) {
	// Check for search results
	var searchResults = doc.evaluate('//div[@id="search_results"] |//div[@id="searchResults"] |//div[@id="srchContent"]', doc, null, XPathResult.ANY_TYPE, null).iterateNext();
	if (searchResults) return "multiple";

	// Check for article meta tags
	var metaTags = doc.getElementsByTagName("meta");
	var haveHdl = false;
	var haveByl = false;
	var blogPost = false;
	for (var i in metaTags) {
		if (metaTags[i].name === "hdl") {
			haveHdl = true;
		} else if (metaTags[i].name == "byl") {
			haveByl = true;
		}
		else if (metaTags[i].name == "PST") {
			blogPost = true;
		}
		if (haveHdl && haveByl) return "newspaperArticle";
		else if (haveByl && blogPost) return "blogPost"
	}
	return false;
}

function associateMeta(newItem, metaTags, field, zoteroField) {
	if (metaTags[field]) {
		newItem[zoteroField] = metaTags[field];
	}
}

function scrape(doc, url) {

	
	var newItem = new Zotero.Item("newspaperArticle");
	newItem.publicationTitle = "The New York Times";
	newItem.ISSN = "0362-4331";
	var metaTags = new Object();
	var metaTagsProperty = new Object();
	if (url != undefined) {
		if(url.indexOf("blogs.nytimes.com")!= -1) newItem.itemType="blogPost";
		newItem.url = url;
		var metaTagRe = /<meta[^>]*>/gi;
		var nameRe = /name="([^"]+)"/i;
		var propertyRe = /property="([^"]+)"/i;
		var contentRe = /content="([^"]+)"/i;
		var m = doc.match(metaTagRe);

		if (!m) {
			return;
		}

		for (var i = 0; i < m.length; i++) {
			var name = nameRe.exec(m[i]);
			var content = contentRe.exec(m[i]);
			var property = propertyRe.exec(m[i]);
			var content = contentRe.exec(m[i]);
			if (name && content) {
				metaTags[name[1]] = content[1];
			}
			if (property && content) {	
				metaTagsProperty[property[1]] = content[1];
			}
		}
	/*	if (!metaTags["hdl"]) {
			return;
		}*/
		// We want to get everything on one page
		newItem.attachments.push({
			url: url.replace(/\.html\??([^/]*)(pagewanted=[^&]*)?([^/]*)$/, ".html?pagewanted=all&$1$2"),
			title: "New York Times Snapshot",
			mimeType: "text/html"
		});
	} else {
		var type = detectWeb(doc, url);
		newItem.itemType = type;
		newItem.url = doc.location.href;
		var metaTagHTML = doc.getElementsByTagName("meta");
		for (var i = 0; i < metaTagHTML.length; i++) {
			var key = metaTagHTML[i].getAttribute("name");
			var value = metaTagHTML[i].getAttribute("content");
			var prop = metaTagHTML[i].getAttribute("property");
			if (key && value) {
				metaTags[key] = value;
			}
			if (prop && value) {
				metaTagsProperty[prop] = value;
			}
			
		}
		// Get everything on one page is possible
		var singlePage = false;
		if (!newItem.url.match(/\?pagewanted=all/) && (singlePage = doc.evaluate('//ul[@id="toolsList"]/li[@class="singlePage"]/a', doc, null, XPathResult.ANY_TYPE, null).iterateNext())) {
			newItem.attachments.push({
				url: singlePage.href,
				title: "New York Times Snapshot",
				mimeType: "text/html"
			});
		} else {
			newItem.attachments.push({
				document: doc,
				title: "New York Times Snapshot"
			});
		}

	}

	associateMeta(newItem, metaTags, "dat", "date");
	associateMeta(newItem, metaTags, "hdl", "title");
	associateMeta(newItem, metaTags, "description", "abstractNote");
	if (type === "blogPost"){
		associateMeta(newItem, metaTagsProperty, "og:title", "title");
		associateMeta(newItem, metaTagsProperty, "og:site_name", "blogTitle");
	}
	associateMeta(newItem, metaTags, "dsk", "section");
	associateMeta(newItem, metaTags, "articleid", "accessionNumber");
	
	if (newItem.blogTitle) newItem.blogTitle = "The New York Times - " + newItem.blogTitle;
	
	if (metaTags["pdate"]) {
		newItem.date = metaTags["pdate"].replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3");
	}

	if (metaTags["byl"]) {
		var author = Zotero.Utilities.trimInternal(metaTags["byl"]);
		if (author.substr(0, 3).toLowerCase() == "by ") {
			author = author.substr(3);
		}

		var authors = author.split(" and ");
		for each(var author in authors) {
			// fix capitalization
			var words = author.split(" ");
			for (var i in words) {
				words[i] = words[i][0].toUpperCase() + words[i].substr(1).toLowerCase();
			}
			author = words.join(" ");

			if (words[0] == "The") {
				newItem.creators.push({
					lastName: author,
					creatorType: "author",
					fieldMode: true
				});
			} else {
				newItem.creators.push(Zotero.Utilities.cleanAuthor(author, "author"));
			}
		}
	}

	if (metaTags["keywords"]) {
		var keywords = metaTags["keywords"];
		newItem.tags = keywords.split(",");
		for (var i in newItem.tags) {
			newItem.tags[i] = newItem.tags[i].replace("  ", ", ");
		}
	}
	
	
	// Remove everything after .html from the URL - we want the canonical version
	//but not for historical abstracts, where it's needed
	if (!newItem.url.match(/abstract\.html/)) {
		newItem.url = newItem.url.replace(/\?.+/, '');
	}
	//	get pdf for archive articles - make sure we don't go here if we're getting multiples or regular items
	var pdfxpath = '//div[@id="articleAccess"]//span[@class="downloadPDF"]/a[contains(@href, "/pdf")]/@href'
	if (!m && ZU.xpathText(doc, pdfxpath) != null) {
		var pdflink = ZU.xpathText(doc, pdfxpath)
		Zotero.Utilities.doGet(pdflink, function (text) {
			var realpdf = text.match(/http\:\/\/article\.archive\.nytimes.+\"/);
			Z.debug("pdflink: " + realpdf)
			if (realpdf) {
				newItem.attachments.push({
					url: realpdf[0].replace(/\"/, ""),
					title: "NY Times Archive PDF",
					mimeType: "application/pdf"
				});
			}
		}, function () {
			newItem.complete();
		});
	} else {
		newItem.complete();
	}

}

function doWeb(doc, url) {
	var searchResults = doc.evaluate('//div[@id="search_results"] |//div[@id="searchResults"]| //div[@id="srchContent"]', doc, null, XPathResult.ANY_TYPE, null).iterateNext();
	if (searchResults) {
		var items = Zotero.Utilities.getItemArray(doc, searchResults, '^https?://(?:select\.|www\.)nytimes.com/.*\.html(\\?|$)');

		Zotero.selectItems(items, function (items) {
			if (!items) return true;

			var urls = [];
			for (var i in items) urls.push(i);

			Zotero.Utilities.HTTP.doGet(urls, function (text, response, url) {
				scrape(text, url)
			}, function () {
			}, null);
		});
	} else {
		scrape(doc);
	}
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://query.nytimes.com/gst/abstract.html?res=F30D15FD3F5813738DDDAC0894DB405B828DF1D3",
		"items": [
			{
				"itemType": "newspaperArticle",
				"creators": [
					{
						"firstName": "Special To The New York",
						"lastName": "Times",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "New York Times Snapshot"
					},
					{
						"title": "NY Times Archive PDF",
						"mimeType": "application/pdf"
					}
				],
				"publicationTitle": "The New York Times",
				"ISSN": "0362-4331",
				"url": "http://query.nytimes.com/gst/abstract.html?res=F30D15FD3F5813738DDDAC0894DB405B828DF1D3",
				"date": "1912-03-05",
				"title": "TWO MONEY INQUIRIES.; Hearings of Trust Charges and Aldrich Plan at the Same Time.",
				"abstractNote": "WASHINGTON, March 4. -- The Money Trust inquiry and consideration of the proposed Aldrich monetary legislation will probably be handled side by side by the House Banking and Currency Committee. The present tentative plan is to divide the committee into two parts, one of which, acting as a sub-committee, will investigate as far as it can those allegations of the Henry Money Trust resolution which fall within the jurisdiction of the Banking and Currency Committee.",
				"accessionNumber": "100523320",
				"libraryCatalog": "NYTimes.com",
				"accessDate": "CURRENT_TIMESTAMP"
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.nytimes.com/2010/08/21/education/21harvard.html?_r=1&scp=1&sq=marc%20hauser&st=cse",
		"items": [
			{
				"itemType": "newspaperArticle",
				"creators": [
					{
						"firstName": "Nicholas",
						"lastName": "Wade",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [
					"Science and Technology",
					"Research",
					"Ethics",
					"Hauser, Marc D",
					"Harvard University"
				],
				"seeAlso": [],
				"attachments": [
					{
						"title": "New York Times Snapshot"
					}
				],
				"publicationTitle": "The New York Times",
				"ISSN": "0362-4331",
				"url": "http://www.nytimes.com/2010/08/21/education/21harvard.html",
				"date": "2010-08-20",
				"title": "Harvard Finds Marc Hauser Guilty of Scientific Misconduct",
				"abstractNote": "The university has found Marc Hauser “solely responsible” for eight instances of scientific misconduct.",
				"section": "Education",
				"accessionNumber": "1248068890906",
				"libraryCatalog": "NYTimes.com",
				"accessDate": "CURRENT_TIMESTAMP"
			}
		]
	},
	{
		"type": "web",
		"defer": true,
		"url": "http://query.nytimes.com/search/sitesearch/#/marc+hauser",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://opinionator.blogs.nytimes.com/2013/06/19/our-broken-social-contract/",
		"items": [
			{
				"itemType": "blogPost",
				"creators": [
					{
						"firstName": "Thomas B.",
						"lastName": "Edsall",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [
					"Economic Conditions and Trends",
					"Income Inequality",
					"Social Conditions and Trends",
					"United States",
					"United States Economy"
				],
				"seeAlso": [],
				"attachments": [
					{
						"title": "New York Times Snapshot"
					}
				],
				"url": "http://opinionator.blogs.nytimes.com/2013/06/19/our-broken-social-contract/",
				"abstractNote": "At their core, are America’s problems primarily economic or moral?",
				"title": "Our Broken Social Contract",
				"blogTitle": "The New York Times",
				"date": "2013-06-19"
			}
		]
	}
]
/** END TEST CASES **/