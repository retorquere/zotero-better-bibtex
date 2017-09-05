{
	"translatorID": "5ae63913-669a-4792-9f45-e089a37de9ab",
	"label": "BAILII",
	"creator": "Bill McKinney",
	"target": "^https?://www\\.bailii\\.org(/cgi\\-bin/markup\\.cgi\\?doc\\=)?/\\w+/cases/.+",
	"minVersion": "1.0.0b4.r1",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2014-04-03 16:36:35"
}

function detectWeb(doc, url) {
	var liiRegexp= /^https?:\/\/www\.bailii\.org(?:\/cgi\-bin\/markup\.cgi\?doc\=)?\/\w+\/cases\/.+\.html/
	if(liiRegexp.test(url)) {
		return "case";
	} else {
		var aTags = doc.getElementsByTagName("a");
		for(var i=0; i<aTags.length; i++) {
			if(liiRegexp.test(aTags[i].href)) {
				return "multiple";
			}
		}
	}
}

function scrape(doc, url) {
	var newItem = new Zotero.Item("case");
	newItem.title = doc.title;
	newItem.url = doc.location.href;
	var titleRegexp = /^(.+)\s+\[(\d+)\]\s+(.+)\s+\((\d+)\s+(\w+)\s+(\d+)\)/
	var titleMatch = titleRegexp .exec(doc.title);
	if (titleMatch ) {
		newItem.caseName = titleMatch[1] + " [" + titleMatch[2] + "] " + titleMatch[3];
		newItem.dateDecided = titleMatch[4] + " " + titleMatch[5] + " " + titleMatch[6];
	} else {
		newItem.caseName = doc.title;
		newItem.dateDecided = "not found";
	}

	var courtRegexp = /cases\/([^\/]+)\/([^\/]+)\//
	var courtMatch = courtRegexp.exec(doc.location.href);
	if (courtMatch) {
		var divRegexp = /\w+/
		var divMatch = divRegexp.exec(courtMatch[2]);
		if (divMatch) {
			newItem.court = courtMatch[1] + " (" + courtMatch[2] + ")";
		} else {
			newItem.court = courtMatch[1];
		}
	} else {
		newItem.court = "not found";
	}
	
	// judge
	var panel = doc.getElementsByTagName("PANEL");
	if (panel.length > 0) {
		var tmp = panel[0].innerHTML;
		newItem.creators.push({lastName:tmp, creatorType:"judge", fieldMode:true});
		
	}
	// citation
	var cite = doc.getElementsByTagName("CITATION");
	if (cite.length > 0) {
		var tmpc = cite[0].childNodes[0].innerHTML;
		newItem.notes.push({note:tmpc});
	}
	newItem.attachments = [{url: url, title: "BAILII Snapshot", mimeType: "text/html"}];
	newItem.complete();
}

function doWeb(doc, url) {
	var liiRegexp= /http:\/\/www\.bailii\.org(?:\/cgi\-bin\/markup\.cgi\?doc\=)?\/\w+\/cases\/.+\.html/
	if(liiRegexp.test(url)) {
		scrape(doc);
	} else {
		var items = Zotero.Utilities.getItemArray(doc, doc, liiRegexp);
		var urls = new Array();
		Zotero.selectItems(items, function (items) {
			if (!items) {
				return true;
			}
			for (var i in items) {
				urls.push(i);
			}
			Zotero.Utilities.processDocuments(urls, scrape, function () {
				Zotero.done();
			});
			Zotero.wait();	
		});
	}
}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.bailii.org/cgi-bin/markup.cgi?doc=/eu/cases/EUECJ/2011/C40308.html&query=copyright&method=boolean",
		"items": [
			{
				"itemType": "case",
				"creators": [],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "BAILII Snapshot",
						"mimeType": "text/html"
					}
				],
				"title": "Football Association Premier League & Ors (Freedom to provide services) [2011] EUECJ C-403/08",
				"url": "http://www.bailii.org/cgi-bin/markup.cgi?doc=/eu/cases/EUECJ/2011/C40308.html&query=copyright&method=boolean",
				"caseName": "Football Association Premier League & Ors (Freedom to provide services) [2011] EUECJ C-403/08",
				"dateDecided": "04 October 2011",
				"court": "EUECJ (2011)",
				"libraryCatalog": "BAILII",
				"accessDate": "CURRENT_TIMESTAMP"
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.bailii.org/eu/cases/EUECJ/2007/",
		"items": "multiple"
	}
]
/** END TEST CASES **/