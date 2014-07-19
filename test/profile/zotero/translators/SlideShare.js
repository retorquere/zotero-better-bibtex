{
	"translatorID": "0cc8e259-106e-4793-8c26-6ec8114a9160",
	"label": "SlideShare",
	"creator": "Michael Berkowitz",
	"target": "https?://[^/]*slideshare\\.net/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2013-12-12 13:47:36"
}

function scrape(doc) {
	var item = new Zotero.Item("presentation");
	item.title = ZU.xpathText(doc, '(//meta[@name="title" or @property="og:title"]/@content)[1]') ||
				ZU.xpathText(doc, '/html/head/title');

	var creator = ZU.xpathText(doc, '//meta[@name="dc_creator"]/@content') ||
					ZU.xpathText(doc, '//a[contains(@class,"h-author-name")]');
	if(creator && creator.trim())
		item.creators.push({lastName:creator.trim(), creatorType:'author'});

	item.abstractNote = ZU.xpathText(doc, '(//p[contains(@class, "descriptionExpanded")] |\
					//p[contains(@class, "description") and\
					not(following-sibling::p[contains(@class, "descriptionExpanded")])])');

	var tags = ZU.xpathText(doc, '//meta[contains(@name, "slideshow_tag")]/@content');
	if (tags) tags = tags.split(/\s*,\s*/);
	for(var i in tags) {
		item.tags.push(tags[i].trim());
	}

	item.rights = ZU.xpathText(doc, '//p[@class="license"]');

	item.type = ZU.xpathText(doc, '//ul[@class="h-slideshow-categories"]/li[1]');

	var date = ZU.xpathText(doc, '//meta[contains(@property, "updated_at")]/@content');
	if(date) item.date = date.replace(/\d{2}:\d{2}:\d{2}\s+[+-]\d{4}/, "")
	item.url = doc.location.href
	item.repository = "SlideShare";

	var loggedin = !doc.getElementById('login_link');
	var pdfurl = ZU.xpathText(doc, '//li[@class="action-download"]/a/@href');
	if(loggedin && pdfurl) {
		//is this always pdf?
		item.attachments.push({url:pdfurl, title:"SlideShare Slide Show", mimeType:"application/pdf"});
	}

	item.complete();	
}

function detectWeb(doc, url) {
	if (url.indexOf("/search/") != -1 &&
		ZU.xpath(doc, '//ol[contains(@class, "searchResults")]\
					//div[./a[@class="slideshow-title"]]').length) {
		return "multiple";
	} else if ((ZU.xpathText(doc, '//meta[@name="og_type"]/@content') && ZU.xpathText(doc, '//meta[@name="og_type"]/@content') == 'article') || (ZU.xpathText(doc, '//meta[@name="og_type"]/@content') && ZU.xpathText(doc, '//meta[@name="og_type"]/@content').search(/presentation/)!=-1)) {
		return "presentation";
	}
}

function doWeb(doc, url) {
	var shows = new Array();
	if (detectWeb(doc, url) == "multiple") {
		var links = ZU.xpath(doc,'//ol[contains(@class, "searchResults")]\
					//div[./a[@class="slideshow-title"]]');
		Zotero.selectItems( ZU.getItemArray(doc, links, null,'from_search='),
			function(items) {
				if (!items) return true;
	
				var shows = new Array();
				for (var i in items) {
					shows.push(i);
				}
				ZU.processDocuments(shows, scrape)
			});
	} else {
		scrape(doc);
	}
}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.slideshare.net/eby/zotero-and-you-or-bibliography-on-the-semantic-web",
		"items": [
			{
				"itemType": "presentation",
				"creators": [
					{
						"lastName": "eby",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [],
				"title": "Zotero and You, or Bibliography on the Semantic Web",
				"abstractNote": "Representatives from the Center for History and New Media will introduce Zotero, a free and open source extension for Firefox that allows you to collect, organize and archive your research materials. After a brief demo and explanation, we will discuss best practices for making your projects \"Zotero ready\" and other opportunities to integrate with your digital projects through the Zotero API.",
				"rights": "© All Rights Reserved",
				"date": "2008-03-06 16:51:58 UTC",
				"url": "http://www.slideshare.net/eby/zotero-and-you-or-bibliography-on-the-semantic-web",
				"presentationType": "Business"
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.slideshare.net/search/slideshow?searchfrom=header&q=zotero",
		"items": "multiple"
	}
]
/** END TEST CASES **/