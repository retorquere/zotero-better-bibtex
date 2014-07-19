{
	"translatorID": "5ed5ab01-899f-4a3b-a74c-290fb2a1c9a4",
	"label": "AustLII and NZLII",
	"creator": "Bill McKinney and Sebastian Karcher",
	"target": "^https?://www\\.(?:austlii\\.edu\\.au|nzlii\\.org)",
	"minVersion": "2.1.9",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2012-05-16 23:48:05"
}

function detectWeb(doc, url) {
	var austliiRegexp = /\/cases\/.+\d\.html/
	if(austliiRegexp.test(url)) {
		return "case";
	} else {
		var aTags = doc.getElementsByTagName("a");
		for(var i=0; i<aTags.length; i++) {
			if(austliiRegexp.test(aTags[i].href)) {
				return "multiple";
			}
		}
	}
}


function scrape(doc) {
	var newItem = new Zotero.Item("case");
	var voliss = ZU.xpathText(doc, '//h2');
	var title = voliss.match(/.+?\[/)[0].replace(/\[/, "");
	newItem.title =  newItem.caseName = title;
	//ZU.capitalizeTitle(title.toLowerCase(), true);
	newItem.url = doc.location.href;
	var court = ZU.trim(voliss.match(/\].+?[\(\[]/)[0].replace(/[\]\(\[]/g, ""))
	newItem.court = court.match(/[^0-9]+/)[0]
	newItem.docketNumber=court.match(/\d+/)[0]
	newItem.dateDecided = voliss.match(/\(\d[^\)]+\d{4}\)/)[0].replace(/[\(\)]/g, "");
	newItem.attachments = [{ document:doc, title:"AustLII/NZLII snapshort", mimeType:"text/html"}];
	newItem.complete();
}

function doWeb(doc, url) {
	var austliiRegexp = /\/cases\/.+\d\.html/;
	if(austliiRegexp.test(url)) {
		scrape(doc);
	} else {
		var items = Zotero.Utilities.getItemArray(doc, doc, austliiRegexp);
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
}
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.austlii.edu.au/au/cases/cth/FamCA/2006/212.html",
		"items": [
			{
				"itemType": "case",
				"creators": [],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "AustLII/NZLII snapshort",
						"mimeType": "text/html"
					}
				],
				"caseName": "C & M",
				"title": "C & M",
				"url": "http://www.austlii.edu.au/au/cases/cth/FamCA/2006/212.html",
				"court": "FamCA",
				"docketNumber": "212",
				"dateDecided": "20 January 2006",
				"libraryCatalog": "AustLII and NZLII",
				"accessDate": "CURRENT_TIMESTAMP"
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.austlii.edu.au/au/cases/cth/FCA/2010/1.html",
		"items": [
			{
				"itemType": "case",
				"creators": [],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "AustLII/NZLII snapshort",
						"mimeType": "text/html"
					}
				],
				"caseName": "Yeo, in the matter of AES Services (Aust) Pty Ltd (ACN 111 306 543) (Administrators Appointed)",
				"title": "Yeo, in the matter of AES Services (Aust) Pty Ltd (ACN 111 306 543) (Administrators Appointed)",
				"url": "http://www.austlii.edu.au/au/cases/cth/FCA/2010/1.html",
				"court": "FCA",
				"docketNumber": "1",
				"dateDecided": "5 January 2010",
				"libraryCatalog": "AustLII and NZLII",
				"accessDate": "CURRENT_TIMESTAMP"
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.nzlii.org/nz/cases/NZSC/2008/1.html",
		"items": [
			{
				"itemType": "case",
				"creators": [],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "AustLII/NZLII snapshort",
						"mimeType": "text/html"
					}
				],
				"caseName": "Bronwyn Estate Ltd and ors v Gareth Hoole and others",
				"title": "Bronwyn Estate Ltd and ors v Gareth Hoole and others",
				"url": "http://www.nzlii.org/nz/cases/NZSC/2008/1.html",
				"court": "NZSC",
				"docketNumber": "1",
				"dateDecided": "8 February 2008",
				"libraryCatalog": "AustLII and NZLII",
				"accessDate": "CURRENT_TIMESTAMP"
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.austlii.edu.au/au/cases/act/ACTSC/2010/",
		"items": "multiple"
	}
]
/** END TEST CASES **/