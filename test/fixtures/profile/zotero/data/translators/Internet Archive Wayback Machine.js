{
	"translatorID": "513a53f5-b95e-4df6-a03e-3348d9ec9f44",
	"label": "Internet Archive Wayback Machine",
	"creator": "Sean Takats",
	"target": "^https?://web\\.archive\\.org/web/",
	"minVersion": "1.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2014-07-05 10:50:25"
}

function detectWeb(doc, url){
	var xpath = '//td[@class="mainBody"]/a';
	var links = doc.evaluate(xpath, doc, null, XPathResult.ANY_TYPE, null);
	if (links.iterateNext()){
		return "multiple";
	}
	return "webpage";
}

function doWeb(doc, url){
	var uris = new Array();
	var dateRe = new RegExp("^https?://web.archive.org/web/([0-9]+)");
	if (dateRe.test(url)){ //handle single item
		scrape(doc, url)
	} else{//handle multiple items
		var xpath = '//td[@class="mainBody"]/a';
		var links = doc.evaluate(xpath, doc, null, XPathResult.ANY_TYPE, null);
		var items=new Array();
		var link;
		while (link = links.iterateNext()){
			items[link.href] = link.textContent;
		}
		Zotero.selectItems(items, function (items) {
					if (!items) {
						return true;
					}
					for (var i in items) {
						uris.push(i);
					}
					ZU.processDocuments(uris, scrape);
				});
	}
}

function scrape(doc, url){
		var dateRe = new RegExp("^https?://web.archive.org/web/([0-9]+)");
		//create new webpage Item from page
		var newItem = new Zotero.Item("webpage");
		newItem.title = doc.title;
		newItem.url = url;
		//parse date and add
		var m = dateRe.exec(doc.location.href);
		var date = m[1];
		date = date.substr(0, 4) + "-" + date.substr(4,2) + "-" + date.substr(6,2);
		newItem.date = date;
		//create snapshot
		newItem.attachments = [{url:doc.location.href, title:doc.title, mimeType:"text/html"}];
		newItem.complete();
}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://web.archive.org/web/20110310073553/http://www.taz.de/",
		"items": [
			{
				"itemType": "webpage",
				"creators": [],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "taz.de",
						"mimeType": "text/html"
					}
				],
				"title": "taz.de",
				"url": "http://web.archive.org/web/20110310073553/http://www.taz.de/",
				"date": "2011-03-10",
				"libraryCatalog": "Internet Archive Wayback Machine",
				"accessDate": "CURRENT_TIMESTAMP"
			}
		]
	}
]
/** END TEST CASES **/