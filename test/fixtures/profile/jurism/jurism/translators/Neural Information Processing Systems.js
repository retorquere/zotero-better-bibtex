{
	"translatorID": "c816f8ad-4c73-4f6d-914e-a6e7212746cf",
	"label": "Neural Information Processing Systems",
	"creator": "Fei Qi, Sebastian Karcher, Guy Aglionby",
	"target": "^https?://papers\\.nips\\.cc/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2018-09-17 14:30:14"
}

function detectWeb(doc, url) {
	let contRe = /\/book\/|\/author\/|\/search\//;
	if (contRe.exec(url) && getSearchResults(doc, true)) return "multiple";
	else if (url.includes("/paper/")) return "bookSection";
	return false;
}

function scrape(doc, url) {
	//work on PDF pages
	let baseurl = url.replace(/\.pdf$/, "");
	let pdfurl = baseurl + ".pdf";
	let bibtexurl = baseurl+ "/bibtex";
	Zotero.Utilities.HTTP.doGet(bibtexurl, function( text ) {
		let translator = Zotero.loadTranslator("import");
		translator.setTranslator("9cb70025-a888-4a29-a210-93ec52da40d4");
		translator.setString( text );
		translator.setHandler( "itemDone", function( obj, item ) {
			item.attachments.push({url: pdfurl, title:"NIPS Full Text PDF", mimeType:"application/pdf"});
			if (url.endsWith(".pdf")) {
				item.attachments.push({url: baseurl, title:"NIPS Snapshot", mimeType: "text/html"});
			}
			else {
				item.attachments.push({document: doc, title: "NIPS Snapshot"});
			}
			item.complete();
		});
		translator.translate();
	});
}

function doWeb(doc, url) {
	if (detectWeb(doc, url) == "multiple") {
		let items = getSearchResults(doc, false);
		Zotero.selectItems(items, function (items) {
			if (!items) {
				return true;
			}
			ZU.processDocuments(Object.keys(items), scrape);
		});
	}
	else {
		scrape(doc, url);
	}
}

function getSearchResults(doc, checkOnly) {
	let items = {};
	let found = false;
	let rows = ZU.xpath(doc, '//li//a[contains(@href, "paper")]');
	for (let i=0; i<rows.length; i++) {
		let href = rows[i].href;
		let title = ZU.trimInternal(rows[i].textContent);
		if (!href || !title) continue;
		if (checkOnly) return true;
		found = true;
		items[href] = title;
	}
	return found ? items : false;
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
	},
	{
		"type": "web",
		"url": "https://papers.nips.cc/author/richard-s-zemel-388",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://papers.nips.cc/search/?q=bill",
		"items": "multiple"
	}
]
/** END TEST CASES **/
