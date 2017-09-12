{
	"translatorID": "6f5f1b24-7519-4314-880f-d7004fbcfe7e",
	"label": "ReliefWeb",
	"creator": "Michael Berkowitz",
	"target": "^https?://(www\\.)?reliefweb\\.int/",
	"minVersion": "1.0.0b4.r5",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "g",
	"lastUpdated": "2015-06-02 21:13:59"
}

function detectWeb(doc, url) {
	if (url.match(/(S|s)earch(R|r)esults/)) {
		return "multiple";
	} else if (url.match(/(O|o)pen(D|d)ocument/)) {
		return "journalArticle";
	}
}

function doWeb(doc, url) {
	var arts = new Array();
	if (detectWeb(doc, url) == "multiple") {
		var items = new Object();
		var links = doc.evaluate('//div[@id="View"]/table/tbody/tr/td[4][@class="docView"]/a', doc, null, XPathResult.ANY_TYPE, null);
		var link;
		while (link = links.iterateNext()) {
			items[link.href] = Zotero.Utilities.trimInternal(link.textContent);
		}
		items = Zotero.selectItems(items);
		for (var i in items) {
			arts.push(i);	
		}
	} else {
		arts = [url];
	}
	Zotero.debug(arts);
	Zotero.Utilities.processDocuments(arts, function(doc) {
		var item = new Zotero.Item("journalArticle");
		item.title = Zotero.Utilities.trimInternal(doc.evaluate('//div[@id="docTitle"]/h1', doc, null, XPathResult.ANY_TYPE, null).iterateNext().textContent);
		item.date = Zotero.Utilities.trimInternal(doc.evaluate('//div[@id="link"]/p[2]', doc, null, XPathResult.ANY_TYPE, null).iterateNext().textContent.substr(6));
		item.url = doc.location.href;
		if (doc.evaluate('//div[@id="docBody"]/p/i',doc, null, XPathResult.ANY_TYPE, null).iterateNext()) {
			var auts = doc.evaluate('//div[@id="docBody"]/p/i', doc, null, XPathResult.ANY_TYPE, null).iterateNext().textContent;
			item.abstractNote = Zotero.Utilities.trimInternal(doc.evaluate('//div[@id="docBody"]/p[1]', doc, null, XPathResult.ANY_TYPE, null).iterateNext().textContent.replace(auts, ""));
			auts = auts.replace('By ', "").split(/\//);
			for (var i=0; i<auts.length; i++) {
				item.creators.push(Zotero.Utilities.cleanAuthor(auts[i], "author"));
			}
		} else {
			item.abstractNote = Zotero.Utilities.trimInternal(doc.evaluate('//div[@id="docBody"]/p[1]', doc, null, XPathResult.ANY_TYPE, null).iterateNext().textContent);
		}
			
		item.complete();
	}, function() {Zotero.done();});
	Zotero.wait();
}