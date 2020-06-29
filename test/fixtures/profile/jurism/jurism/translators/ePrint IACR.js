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
	"lastUpdated": "2017-05-18 02:42:48"
}

function detectWeb(doc, url) {
	var singleRe   = /^https?:\/\/eprint\.iacr\.org\/(\d{4}\/\d{3}|cgi-bin\/print\.pl)/;
	var multipleRe = /^https?:\/\/eprint\.iacr\.org\/(complete|curr|\d{4}|(cgi|eprint)-bin\/search\.pl)/;
	if (singleRe.test(url)) {
		return "report";
	} else if (multipleRe.test(url)) {
		return "multiple";
	}
}

function scrape(doc, url) {
	var reportNoXPath = "//h2";
	var titleXPath    = "(//p/b)[1]";
	var authorsXPath  = "(//p/i)[1]";
	var abstractXPath = "//p[starts-with(b/text(),\"Abstract\")]/text() | //p[not(*)]";
	var keywordsXPath = "//p[starts-with(b/text(),\"Category\")]";
	var reportNo = doc.evaluate(reportNoXPath, doc, null, XPathResult.ANY_TYPE, null).iterateNext().textContent;
	reportNo = reportNo.match(/(\d{4})\/(\d{3,4})$/);
	if (reportNo){
		var year = reportNo[1];
		var no   = reportNo[2];
	}
	var title = doc.evaluate(titleXPath, doc, null, XPathResult.ANY_TYPE, null).iterateNext().textContent;
	title = ZU.trimInternal(title);

	var authors = doc.evaluate(authorsXPath, doc, null, XPathResult.ANY_TYPE, null).iterateNext().textContent;
	authors = ZU.trimInternal(authors);
	authors = authors.split(" and ");
	
	var abstr = "";
	var abstractLines = doc.evaluate(abstractXPath, doc, null, XPathResult.ANY_TYPE, null);
	var nextLine;
	while (nextLine = abstractLines.iterateNext()) {
		// An inner line starting with \n starts a new paragraph in the abstract.
		if (nextLine.textContent[0] == "\n") {
			abstr += "\n\n";
		}
		abstr +=  ZU.trimInternal(nextLine.textContent);
	}
	
	var keywords = doc.evaluate(keywordsXPath, doc, null, XPathResult.ANY_TYPE, null).iterateNext().textContent;
	var tmp = keywords.match(/Category \/ Keywords: (?:([^\/]*) \/ )?([^\/]*)/);
	keywords = tmp[2].split(", ")
	keywords.unshift(tmp[1]);

	var newItem = new Zotero.Item("report");
	
	newItem.date = year;
	newItem.reportNumber = no;
	//we want to use this later & make sure we don't make http--> https requests or vice versa. 
	newItem.url = url.match(/^https?:\/\/[^\/]+/)[0] + "/" + year + "/" + no;
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
				return true;
			}
			for (var i in items) {
				articles.push(i);
			}
			ZU.processDocuments(articles, scrape);
		});
	} else {
		if (url.search(/\.pdf$/)!= -1) {
			//go to the landing page to scrape
			//we use http to prevent (somewhat mysterious) same-origin violations leading to permission denied errors
			url = url.replace(/\.pdf$/, "").replace(/^https/, "http")
			ZU.processDocuments([url], scrape)
		}
		else scrape(doc, url)
	}
}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://eprint.iacr.org/2005/033",
		"items": [
			{
				"itemType": "report",
				"title": "An Attack on CFB Mode Encryption As Used By OpenPGP",
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
				"date": "2005",
				"abstractNote": "This paper describes an adaptive-chosen-ciphertext attack on the Cipher Feedback (CFB) mode of encryption as used in OpenPGP. In most circumstances it will allow an attacker to determine 16 bits of any block of plaintext with about $2^{15}$ oracle queries for the initial setup work and $2^{15}$ oracle queries for each block. Standard CFB mode encryption does not appear to be affected by this attack. It applies to a particular variation of CFB used by OpenPGP. In particular it exploits an ad-hoc integrity check feature in OpenPGP which was meant as a \"quick check\" to determine the correctness of the decrypting symmetric key.",
				"accessDate": "CURRENT_TIMESTAMP",
				"libraryCatalog": "ePrint IACR",
				"reportNumber": "033",
				"url": "http://eprint.iacr.org/2005/033",
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
				"tags": [
					"applications",
					"cryptanalysis",
					"cryptographic protocols"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://eprint.iacr.org/eprint-bin/search.pl?last=31&title=1",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://eprint.iacr.org/2016/1013.pdf",
		"items": [
			{
				"itemType": "report",
				"title": "A Formal Security Analysis of the Signal Messaging Protocol",
				"creators": [
					{
						"firstName": "Katriel",
						"lastName": "Cohn-Gordon",
						"creatorType": "author"
					},
					{
						"firstName": "Cas",
						"lastName": "Cremers",
						"creatorType": "author"
					},
					{
						"firstName": "Benjamin",
						"lastName": "Dowling",
						"creatorType": "author"
					},
					{
						"firstName": "Luke",
						"lastName": "Garratt",
						"creatorType": "author"
					},
					{
						"firstName": "Douglas",
						"lastName": "Stebila",
						"creatorType": "author"
					}
				],
				"date": "2016",
				"abstractNote": "Signal is a new security protocol and accompanying app that provides end-to-end encryption for instant messaging. The core protocol has recently been adopted by WhatsApp, Facebook Messenger, and Google Allo among many others; the first two of these have at least 1 billion active users. Signal includes several uncommon security properties (such as \"future secrecy\" or \"post-compromise security\"), enabled by a novel technique called *ratcheting* in which session keys are updated with every message sent. Despite its importance and novelty, there has been little to no academic analysis of the Signal protocol.\n\nWe conduct the first security analysis of Signal's Key Agreement and Double Ratchet as a multi-stage key exchange protocol. We extract from the implementation a formal description of the abstract protocol, and define a security model which can capture the \"ratcheting\" key update structure. We then prove the security of Signal's core in our model, demonstrating several standard security properties. We have found no major flaws in the design, and hope that our presentation and results can serve as a starting point for other analyses of this widely adopted protocol.",
				"libraryCatalog": "ePrint IACR",
				"reportNumber": "1013",
				"url": "http://eprint.iacr.org/2016/1013",
				"attachments": [
					{
						"title": "ePrint IACR Snapshot",
						"mimeType": "text/html"
					},
					{
						"title": "ePrint IACR Full Text PDF",
						"mimeType": "application/pdf"
					}
				],
				"tags": [
					"Signal",
					"authenticated key exchange",
					"cryptographic protocols",
					"future secrecy",
					"messaging",
					"multi-stage key exchange",
					"post-compromise security",
					"protocols",
					"provable security"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/