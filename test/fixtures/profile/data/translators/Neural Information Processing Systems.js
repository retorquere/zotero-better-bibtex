{
	"translatorID": "c816f8ad-4c73-4f6d-914e-a6e7212746cf",
	"label": "Neural Information Processing Systems",
	"creator": "Fei Qi, Sebastian Karcher",
	"target": "^https?://(books|papers)\\.nips\\.cc/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2014-03-11 19:45:28"
}

function detectWeb(doc, url) {
	var contRe = /\/book\//;
	var m = contRe.exec( url );
	if (m && ZU.xpathText(doc, '//ul/li/a[contains(@href, "paper")]')) return "multiple";
	else if (url.indexOf("/paper/") && ZU.xpathText(doc, '//meta[@name="citation_title"]/@content')) return "bookSection";
	return false;
}

function scrape(doc, url) {
		var pdfurl = url + ".pdf";
		var bibtexurl = url+ "/bibtex"
		Zotero.Utilities.HTTP.doGet(bibtexurl, function( text ) {
			var translator = Zotero.loadTranslator("import");
			translator.setTranslator("9cb70025-a888-4a29-a210-93ec52da40d4");
			// Zotero.debug( text );
			translator.setString( text );
			translator.setHandler( "itemDone", function( obj, item ) {
				item.attachments = [{url: pdfurl, title:"NIPS Full Text PDF", mimeType:"application/pdf"},
									{document: doc, title: "NIPS Snapshort", mimeTYpe: "text/html"}];
				item.complete();
			});
			translator.translate();
		});
}

function doWeb( doc, url ) {
	var titleRe = '//ul/li/a[contains(@href, "paper")]';
	if (detectWeb(doc, url) == "multiple") {
		// Retrive items
		var items = new Object();
		var arts = new Array();
		var titles =  doc.evaluate( titleRe, doc, null, XPathResult.ANY_TYPE, null);
		while( title = titles.iterateNext()) {
			var art = new Object;
			items[title.href] = title.textContent;
		}
		Zotero.selectItems(items, function (items) {
			if (!items) {
				return true;
			}
			for (var i in items) {
				arts.push(i);
			}
			ZU.processDocuments(arts, scrape)
		});
	}
	else{
		scrape(doc, url)
	}
}
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://papers.nips.cc/paper/3689-information-theoretic-lower-bounds-on-the-oracle-complexity-of-convex-optimization",
		"items": [
			{
				"itemType": "bookSection",
				"creators": [
					{
						"firstName": "Alekh",
						"lastName": "Agarwal",
						"creatorType": "author"
					},
					{
						"firstName": "Martin J",
						"lastName": "Wainwright",
						"creatorType": "author"
					},
					{
						"firstName": "Peter L.",
						"lastName": "Bartlett",
						"creatorType": "author"
					},
					{
						"firstName": "Pradeep K.",
						"lastName": "Ravikumar",
						"creatorType": "author"
					},
					{
						"firstName": "Y.",
						"lastName": "Bengio",
						"creatorType": "editor"
					},
					{
						"firstName": "D.",
						"lastName": "Schuurmans",
						"creatorType": "editor"
					},
					{
						"firstName": "J. D.",
						"lastName": "Lafferty",
						"creatorType": "editor"
					},
					{
						"firstName": "C. K. I.",
						"lastName": "Williams",
						"creatorType": "editor"
					},
					{
						"firstName": "A.",
						"lastName": "Culotta",
						"creatorType": "editor"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "NIPS Full Text PDF",
						"mimeType": "application/pdf"
					},
					{
						"title": "NIPS Snapshort",
						"mimeTYpe": "text/html"
					}
				],
				"itemID": "NIPS2009_3689",
				"title": "Information-theoretic lower bounds on the oracle complexity of convex optimization",
				"pages": "1–9",
				"date": "2009",
				"publisher": "Curran Associates, Inc.",
				"url": "http://papers.nips.cc/paper/3689-information-theoretic-lower-bounds-on-the-oracle-complexity-of-convex-optimization.pdf",
				"libraryCatalog": "Neural Information Processing Systems",
				"bookTitle": "Advances in Neural Information Processing Systems 22"
			}
		]
	},
	{
		"type": "web",
		"url": "http://papers.nips.cc/book/advances-in-neural-information-processing-systems-22-2009",
		"items": "multiple"
	}
]
/** END TEST CASES **/