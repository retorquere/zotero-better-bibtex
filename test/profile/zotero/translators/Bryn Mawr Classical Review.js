{
	"translatorID": "635c1246-e0c8-40a0-8799-a73a0b013ad8",
	"label": "Bryn Mawr Classical Review",
	"creator": "Michael Berkowitz",
	"target": "^https?://bmcr\\.brynmawr\\.edu",
	"minVersion": "1.0.0b4.r5",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2013-01-23 12:41:08"
}

function detectWeb(doc, url) {
	if (url.match(/by_reviewer/) || url.match(/by_author/) || url.match(/recent.html/) || url.match(/\/\d{4}\/$/)) {
		return "multiple";
	} else if (url.match(/[\d\-]+\.html$/)) {
		return "journalArticle";
	}
}

function doWeb(doc, url) {
	var ns = doc.documentElement.namespaceURI;
	var nsResolver = ns ? function(prefix) {
		if (prefix == 'x') return ns; else return null;
	} : null;
	var arts = new Array();
	if (detectWeb(doc, url) == "multiple") {
		var items = new Object();
		if (doc.evaluate('//table/tbody/tr/td/ul/li/i', doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext()) {
			var boxes = doc.evaluate('//table/tbody/tr/td/ul/li', doc, nsResolver, XPathResult.ANY_TYPE, null);
			var box;
			while (box = boxes.iterateNext()) {
				var link = doc.evaluate('./a', box, nsResolver, XPathResult.ANY_TYPE, null).iterateNext().href;
				var title = doc.evaluate('./i', box, nsResolver, XPathResult.ANY_TYPE, null).iterateNext().textContent;
				items[link] = title;
			}
		} else if (doc.evaluate('//table/tbody/tr/td/ul/li', doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext()) {
			var title = doc.evaluate('//table/tbody/tr/td/ul/li', doc, nsResolver, XPathResult.ANY_TYPE, null);
			var next;
			while (next = title.iterateNext()) {
				items[next.href]  = Zotero.Utilities.trimInternal(next.textContent);
			}
		} else if (url.match(/google\.com/)) {
			var titles = doc.evaluate('//h2[@class="r"]/a[@class="l"]', doc, nsResolver, XPathResult.ANY_TYPE, null);
			var title;
			while (title = titles.iterateNext()) {
				items[title.href] = title.textContent;
			}
		}
		items = Zotero.selectItems(items);
		for (var i in items) {
			arts.push(i);
		}
	} else {
		arts = [url];
	}
	Zotero.Utilities.processDocuments(arts, function(doc) {
		var item = new Zotero.Item("journalArticle");
		var title = doc.evaluate('//h3/i', doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext().textContent;
		item.title = "Review of: " + Zotero.Utilities.trimInternal(title);
		var data = doc.evaluate('//h3[i]', doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext().textContent;
		var title = title.replace("(", "\\(").replace(")", "\\)");
		var author = doc.evaluate('//b[contains(text(), "Reviewed")]', doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext().textContent.match(/Reviewed by\s+([^,]+),/)[1];
		item.creators.push(Zotero.Utilities.cleanAuthor(author, "author"));
		var splitRe = new RegExp(title);
		var authors = data.split(splitRe)[0].replace(/\([^)]+\)/, "").split(/(,|and)\s+/);
		Zotero.debug(authors);
		for each (var aut in authors) {
			if (aut.match(/\w/) && (aut != "and")) {
				item.creators.push(Zotero.Utilities.cleanAuthor(aut, "reviewedAuthor"));
			}
		}
		item.url = doc.location.href;
		item.attachments = [{url:item.url, title:item.title, mimeType:"text/html"}];
		if (doc.evaluate('/html/body/center/table/tbody/tr/td/center/table/tbody/tr/td//font', doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext()) {
			item.date = Zotero.Utilities.trimInternal(doc.evaluate('/html/body/center/table/tbody/tr/td/center/table/tbody/tr/td//font', doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext().textContent.replace("Bryn Mawr Classical Review ", "").replace(/\./g, "/"));
		} else {
			item.date = Zotero.Utilities.trimInternal(doc.evaluate('/html/body/h3', doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext().textContent.replace("Bryn Mawr Classical Review ", "").replace(/\./g, "/"))
		}
		item.complete();
	});
}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://bmcr.brynmawr.edu/2010/2010-01-02.html",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"firstName": "Christina S.",
						"lastName": "Kraus",
						"creatorType": "author"
					},
					{
						"firstName": "Michael",
						"lastName": "Comber",
						"creatorType": "reviewedAuthor"
					},
					{
						"firstName": "Catalina",
						"lastName": "Balmaceda",
						"creatorType": "reviewedAuthor"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"url": "http://bmcr.brynmawr.edu/2010/2010-01-02.html",
						"title": "Review of: Sallust: The War Against Jugurtha. Aris and Phillips Classical Texts",
						"mimeType": "text/html"
					}
				],
				"title": "Review of: Sallust: The War Against Jugurtha. Aris and Phillips Classical Texts",
				"url": "http://bmcr.brynmawr.edu/2010/2010-01-02.html",
				"date": "2010/01/02",
				"libraryCatalog": "Bryn Mawr Classical Review",
				"accessDate": "CURRENT_TIMESTAMP",
				"shortTitle": "Review of"
			}
		]
	},
	{
		"type": "web",
		"url": "http://bmcr.brynmawr.edu/2013/2013-01-44.html",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"firstName": "Christina S.",
						"lastName": "Kraus",
						"creatorType": "author"
					},
					{
						"firstName": "Anthony",
						"lastName": "Grafton",
						"creatorType": "reviewedAuthor"
					},
					{
						"firstName": "Glenn W.",
						"lastName": "Most",
						"creatorType": "reviewedAuthor"
					},
					{
						"firstName": "Salvatore",
						"lastName": "Settis",
						"creatorType": "reviewedAuthor"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Review of: The Classical Tradition",
						"mimeType": "text/html"
					}
				],
				"title": "Review of: The Classical Tradition",
				"url": "http://bmcr.brynmawr.edu/2013/2013-01-44.html",
				"date": "2013/01/44",
				"libraryCatalog": "Bryn Mawr Classical Review",
				"accessDate": "CURRENT_TIMESTAMP",
				"shortTitle": "Review of"
			}
		]
	}
]
/** END TEST CASES **/