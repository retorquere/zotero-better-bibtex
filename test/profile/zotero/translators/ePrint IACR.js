{
	"translatorID": "04a23cbe-5f8b-d6cd-8eb1-2e23bcc8ae8f",
	"label": "ePrint IACR",
	"creator": "Jonas Schrieb",
	"target": "^https?://eprint\\.iacr\\.org/",
	"minVersion": "1.0.0b3.r1",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2014-03-25 09:43:59"
}

function detectWeb(doc, url) {
	var singleRe   = /^https?:\/\/eprint\.iacr\.org\/(\d{4}\/\d{3}|cgi-bin\/print\.pl)/;
	var multipleRe = /^https?:\/\/eprint\.iacr\.org\/(complete|curr|\d{4}|(cgi|eprint)-bin\/search\.pl)/;
	if(singleRe.test(url)) {
		return "report";
	} else if(multipleRe.test(url)) {
		return "multiple";
	}
}

function scrape(doc, url) {
	var reportNoXPath = "//h2";
	var titleXPath    = "//p[1]/b";
	var authorsXPath  = "//p[2]/i";
	var abstractXPath = "//p[starts-with(b/text(),\"Abstract\")]/text() | //p[not(*)]";
	var keywordsXPath = "//p[starts-with(b/text(),\"Category\")]";

	var reportNo = doc.evaluate(reportNoXPath, doc, null, XPathResult.ANY_TYPE, null).iterateNext().textContent;
	reportNo = reportNo.match(/(\d{4})\/(\d{3})$/);
	var year = reportNo[1];
	var no   = reportNo[2];

	var title = doc.evaluate(titleXPath, doc, null, XPathResult.ANY_TYPE, null).iterateNext().textContent;

	var authors = doc.evaluate(authorsXPath, doc, null, XPathResult.ANY_TYPE, null).iterateNext().textContent;
	authors = authors.split(" and ");
	
	var abstr = "";
	var abstractLines = doc.evaluate(abstractXPath, doc, null, XPathResult.ANY_TYPE, null);
	var nextLine;
	while(nextLine = abstractLines.iterateNext()) {
		abstr += nextLine.textContent;
	}
	
	var keywords = doc.evaluate(keywordsXPath, doc, null, XPathResult.ANY_TYPE, null).iterateNext().textContent;
	var tmp = keywords.match(/Category \/ Keywords: (?:([^\/]*) \/ )?([^\/]*)/);
	keywords = tmp[2].split(", ")
	keywords.unshift(tmp[1]);

	var newItem = new Zotero.Item("report");
	
	newItem.date = year;
	newItem.reportNumber = no;
	newItem.url = "http://eprint.iacr.org/"+year+"/"+no;
	newItem.title = title;
	newItem.abstractNote = abstr;
	for (var i in authors) {
		newItem.creators.push(Zotero.Utilities.cleanAuthor(authors[i], "author"));
	}
for (var i = 0; i < keywords.length; i++) {
	//sometimes the keywords split returns an empty tag - those crash the translator if they're pushed.
	if (keywords[i] != null){
		newItem.tags.push(keywords[i]);}
	}
	newItem.attachments = [
		{url:newItem.url, title:"ePrint IACR Snapshot", mimeType:"text/html"},
		{url:newItem.url+".pdf", title:"ePrint IACR Full Text PDF", mimeType:"application/pdf"}
	];
	newItem.complete();

}

function doWeb(doc, url) {

	var articles = new Array();
	var items = new Object();
	var nextTitle;

	if (detectWeb(doc, url) == "multiple") {
		var titleXPath = "//dl/dd/b";
		var linkXPath = "//dl/dt/a[1]";

		var titles = doc.evaluate(titleXPath, doc, null, XPathResult.ANY_TYPE, null);
		var links  = doc.evaluate(linkXPath,  doc, null, XPathResult.ANY_TYPE, null);
		while (nextTitle = titles.iterateNext()) {
			nextLink = links.iterateNext();
			items[nextLink.href] = nextTitle.textContent;
		}
		Zotero.selectItems(items, function (items) {
			if (!items) {
				Zotero.done();
				return true;
			}
			for (var i in items) {
				articles.push(i);
			}
			ZU.processDocuments(articles, scrape);
		});
	} else {
		scrape(doc, url)
	}
}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://eprint.iacr.org/2005/033",
		"items": [
			{
				"itemType": "report",
				"creators": [
					{
						"firstName": "Serge",
						"lastName": "Mister",
						"creatorType": "author"
					},
					{
						"firstName": "Robert",
						"lastName": "Zuccherato",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [
					"cryptographic protocols",
					"applications",
					"cryptanalysis"
				],
				"seeAlso": [],
				"attachments": [
					{
						"url": "http://eprint.iacr.org/2005/033",
						"title": "ePrint IACR Snapshot",
						"mimeType": "text/html"
					},
					{
						"url": "http://eprint.iacr.org/2005/033.pdf",
						"title": "ePrint IACR Full Text PDF",
						"mimeType": "application/pdf"
					}
				],
				"date": "2005",
				"reportNumber": "033",
				"url": "http://eprint.iacr.org/2005/033",
				"title": "An Attack on CFB Mode Encryption As Used By OpenPGP",
				"abstractNote": "This paper describes an adaptive-chosen-ciphertext attack on the Cipher Feedback (CFB) mode of encryption as used in OpenPGP.  In most circumstances it will allow an attacker to determine 16 bits of any block of plaintext with about $2^{15}$ oracle queries for the initial \nsetup work and $2^{15}$ oracle queries for each block.  Standard CFB mode encryption does not appear to be affected by this attack.  It applies to a particular variation of CFB used by OpenPGP.  In particular it exploits an ad-hoc integrity check feature in OpenPGP which was meant as a \"quick check\" to determine the correctness of the decrypting symmetric key.",
				"libraryCatalog": "ePrint IACR",
				"accessDate": "CURRENT_TIMESTAMP"
			}
		]
	},
	{
		"type": "web",
		"url": "https://eprint.iacr.org/eprint-bin/search.pl?last=31&title=1",
		"items": "multiple"
	}
]
/** END TEST CASES **/