{
	"translatorID": "0cc8e259-106e-4793-8c26-6ec8114a9160",
	"label": "SlideShare",
	"creator": "Michael Berkowitz",
	"target": "^https?://[^/]*slideshare\\.net/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2017-01-01 15:33:29"
}

function scrape(doc, url) {
	var item = new Zotero.Item("presentation");
	item.title = ZU.xpathText(doc, '(//meta[@name="title" or @property="og:title"]/@content)[1]') ||
				ZU.xpathText(doc, '/html/head/title');

	var creator = ZU.xpathText(doc, '//div[@itemprop="author"]//span[@itemprop="name"]');
	if (creator && creator.trim())
		item.creators.push({lastName:creator.trim(), creatorType:'author'});

	item.abstractNote = ZU.xpathText(doc, '//p[@id="slideshow-description-paragraph"]');

	var tags = ZU.xpathText(doc, '//meta[contains(@name, "slideshow_tag")]/@content');
	if (tags) tags = tags.split(/\s*,\s*/);
	for (var i in tags) {
		item.tags.push(tags[i].trim());
	}

	var rights = ZU.xpathText(doc, '//div[contains(@class, "license-container")]');
	if (rights && rights.trim()) item.rights = rights.trim()

	item.type = ZU.xpathText(doc, '//div[contains(@class, "categories-container")]//a[1]');

	var date = ZU.xpathText(doc, '//meta[@property = "slideshare:created_at"]/@content');
	if (date) item.date = date;
	item.url = url;
	item.libraryCatalog = "SlideShare";

	var loggedin = !doc.getElementById('login_link');
	var pdfurl = ZU.xpathText(doc, '//li[@class="action-download"]/a/@href');
	if (loggedin && pdfurl) {
		//is this always pdf?
		item.attachments.push({url:pdfurl, title:"SlideShare Slide Show", mimeType:"application/pdf"});
	}

	item.complete();	
}

function detectWeb(doc, url) {
	if (url.indexOf("/search/") != -1 &&
		ZU.xpath(doc, '//div[contains(@class, "searchResults")]\
					//div[./a[contains(@class, "slideshow-title")]]').length) {
		return "multiple";
	} else if ((ZU.xpathText(doc, '//meta[@name="og_type"]/@content') && ZU.xpathText(doc, '//meta[@name="og_type"]/@content') == 'article') || (ZU.xpathText(doc, '//meta[@name="og_type"]/@content') && ZU.xpathText(doc, '//meta[@name="og_type"]/@content').search(/presentation/)!=-1)) {
		return "presentation";
	}
}

function doWeb(doc, url) {
	if (detectWeb(doc, url) == "multiple") {
		var links = ZU.xpath(doc,'//div[contains(@class, "searchResults")]\
					//div[./a[contains(@class, "title-link")]]');
		Zotero.selectItems( ZU.getItemArray(doc, links, 'from_search=', null),
			function(items) {
				if (!items) return true;
	
				var shows = new Array();
				for (var i in items) {
					shows.push(i);
				}
				ZU.processDocuments(shows, scrape)
			});
	} else {
		scrape(doc, url);
	}
}
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://www.slideshare.net/eby/zotero-and-you-or-bibliography-on-the-semantic-web",
		"items": [
			{
				"itemType": "presentation",
				"title": "Zotero and You, or Bibliography on the Semantic Web",
				"creators": [
					{
						"lastName": "eby",
						"creatorType": "author"
					}
				],
				"date": "2008-03-06 10:51:58 UTC",
				"abstractNote": "Representatives from the Center for History and New Media will introduce Zotero, a free and open source extension for Firefox that allows you to collect, organize and archive your research materials. After a brief demo and explanation, we will discuss best practices for making your projects \"Zotero ready\" and other opportunities to integrate with your digital projects through the Zotero API.",
				"presentationType": "Business",
				"url": "https://www.slideshare.net/eby/zotero-and-you-or-bibliography-on-the-semantic-web",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.slideshare.net/search/slideshow?searchfrom=header&q=zotero",
		"items": "multiple"
	}
]
/** END TEST CASES **/