{
	"translatorID": "291934d5-36ec-4b81-ac9c-c5ad5313dba4",
	"label": "Pion Journals",
	"creator": "Michael Berkowitz",
	"target": "^https?://(www\\.)?(hthpweb|envplan|perceptionweb)\\.com/",
	"minVersion": "1.0.0b4.r5",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2015-06-02 21:11:22"
}

function detectWeb(doc, url) {
	if (url.match(/search\.cgi/) || url.match(/ranking/) || url.match(/volume=/)) {
		return "multiple";
	} else if (url.match(/abstract\.cgi/)) {
		return "journalArticle";
	}
}

function doWeb(doc, url) {
	if (detectWeb(doc, url) == "multiple") {
		var items = Zotero.Utilities.getItemArray(doc, doc, "abstract.cgi\\?id=");
		var arts = new Array();	
		
		Zotero.selectItems(items, function (items) {
			if (!items) {
				return true;
			}
			for (var i in items) {
				arts.push(i);
			}
			Zotero.Utilities.processDocuments(arts, scrape, function () {
				Zotero.done();
			});
			Zotero.wait();	
		});
	}
		 else {
		scrape(doc, url)
	}
}
function scrape(doc, url){
		var item = new Zotero.Item("journalArticle");
		item.publicationTitle = Zotero.Utilities.trimInternal(doc.evaluate('//div[@id="footer"]/div[@class="left"]/i', doc, null, XPathResult.ANY_TYPE, null).iterateNext().textContent);
		item.title = Zotero.Utilities.trimInternal(doc.evaluate('//div[@id="total"]/p[2]//b', doc, null, XPathResult.ANY_TYPE, null).iterateNext().textContent);
		var authors = Zotero.Utilities.trimInternal(doc.evaluate('//div[@id="total"]/p[3]/b', doc, null, XPathResult.ANY_TYPE, null).iterateNext().textContent).split(/,\s*/);
		for (var i=0; i<authors.length; i++) {
			var aut = authors[i];
			item.creators.push(Zotero.Utilities.cleanAuthor(aut, "author"));
		}
		if (doc.evaluate('//div[@id="title"]/div[@class="left"]/font', doc, null, XPathResult.ANY_TYPE, null).iterateNext().textContent.match(/\d+/)) {
			var voliss = doc.evaluate('//div[@id="title"]/div[@class="left"]/font', doc, null, XPathResult.ANY_TYPE, null).iterateNext().textContent.match(/(\d+)\s+volume\s+(\d+)\s*\((\d+)\)\s+(pages\s+(.*))?$/);
			//Zotero.debug(voliss);
			item.date = voliss[1];
			item.volume = voliss[2];
			item.issue = voliss[3];
			if (voliss[5]) item.pages = voliss[5];
		} else {
			item.date = Zotero.Utilities.trimInternal(doc.evaluate('//div[@id="total"]/p[4]', doc, null, XPathResult.ANY_TYPE, null).iterateNext().textContent).match(/(\d+)$/)[1];
		}
		item.DOI = Zotero.Utilities.trimInternal(doc.evaluate('//div[@id="title"]/div[@class="right"]/font', doc, null, XPathResult.ANY_TYPE, null).iterateNext().textContent).substr(4);
		
		if (doc.evaluate('//a[contains(@href, ".pdf")]', doc, null, XPathResult.ANY_TYPE, null).iterateNext()) var pdfurl = doc.evaluate('//a[contains(@href, ".pdf")]', doc, null, XPathResult.ANY_TYPE, null).iterateNext().href;
		item.url = doc.location.href;
		var pub = item.publicationTitle;
		item.attachments = [{url:item.url, title:pub + " Snapshot", mimeType:"text/html"}];
		if (pdfurl) item.attachments.push({url:pdfurl, title:pub + " Full Text PDF", mimeType:"application/pdf"});
		item.abstractNote = Zotero.Utilities.trimInternal(doc.evaluate('//div[@id="total"]/p[5]', doc, null, XPathResult.ANY_TYPE, null).iterateNext().textContent).substr(10);
		item.complete();
	}
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.perceptionweb.com/abstract.cgi?id=p6018",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"firstName": "Sven",
						"lastName": "Vrins",
						"creatorType": "author"
					},
					{
						"firstName": "Tessa C. J. de",
						"lastName": "Wit",
						"creatorType": "author"
					},
					{
						"firstName": "Rob van",
						"lastName": "Lier",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Perception Snapshot",
						"mimeType": "text/html"
					},
					{
						"title": "Perception Full Text PDF",
						"mimeType": "application/pdf"
					}
				],
				"publicationTitle": "Perception",
				"title": "Bricks, butter, and slices of cucumber: Investigating semantic influences in amodal completion",
				"date": "2009",
				"volume": "38",
				"issue": "1",
				"pages": "17 – 29",
				"DOI": "10.1068/p6018",
				"url": "http://www.perceptionweb.com/abstract.cgi?id=p6018",
				"abstractNote": "Objects in our world are partly occluded by other objects or sometimes even partly by themselves. Amodal completion is a visual process that enables us to perceive these objects as complete and is influenced by both local object information, present at contour intersections, and overall (global) object shape. In contrast, object semantics have been demonstrated to play no role in amodal completion but do so only by means of subjective methods. In the present study, object semantics were operationalised by material hardness of familiar objects which was varied to test whether it leaves amodal completion unaffected. Specifically, we investigated the perceived form of joined naturalistic objects that differ in perceived material hardness, employing the primed matching paradigm. In experiments 1 and 2, probing three different prime durations, amodal completion of a notched circular object changes systematically with the hardness of the object it was joined to. These results are in line with the view that amodal completion is inseparable from general object interpretation, during which object semantics may dominate.",
				"libraryCatalog": "Pion Journals",
				"accessDate": "CURRENT_TIMESTAMP",
				"shortTitle": "Bricks, butter, and slices of cucumber"
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.envplan.com/abstract.cgi?id=a311901",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"firstName": "P. J.",
						"lastName": "Taylor",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Environment and Planning A Snapshot",
						"mimeType": "text/html"
					},
					{
						"title": "Environment and Planning A Full Text PDF",
						"mimeType": "application/pdf"
					}
				],
				"publicationTitle": "Environment and Planning A",
				"title": "CommentarySo-called 'world cities': the evidential structure within a literature",
				"date": "1999",
				"volume": "31",
				"issue": "11",
				"pages": "1901 – 1904",
				"DOI": "10.1068/a311901",
				"url": "http://www.envplan.com/abstract.cgi?id=a311901",
				"abstractNote": "b = 'pion';",
				"libraryCatalog": "Pion Journals",
				"accessDate": "CURRENT_TIMESTAMP",
				"shortTitle": "CommentarySo-called 'world cities'"
			}
		]
	}
]
/** END TEST CASES **/