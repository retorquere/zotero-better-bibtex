{
	"translatorID": "62c0e36a-ee2f-4aa0-b111-5e2cbd7bb5ba",
	"label": "MetaPress",
	"creator": "Michael Berkowitz, Sebastian Karcher",
	"target": "https?://(.*)metapress\\.com/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2013-10-02 17:02:31"
}

function detectWeb(doc, url) {
	if (ZU.xpath(doc, '//div[@class="primitive article"]/h2/a[1]').length > 0) {
		return "multiple";
	} else if (url.match(/content\/[^?/]/)) {
		switch(ZU.trimInternal(ZU.xpathText(doc, '//*[@id="ctl00_PageHeadingLabel"]') || '').toLowerCase()) {
			case 'book chapter':
				return 'bookSection';
			default:
				return "journalArticle";
		}
	}
}

function doWeb(doc, url) {
	if (detectWeb(doc, url) == "multiple") {
		var hits = {};
		var urls = [];
		var results = ZU.xpath(doc, '//div[@class="primitive article"]/h2/a[1]');
		for (var i in results) {
			hits[results[i].href] = results[i].textContent;
		}
		Z.selectItems(hits, function (items) {
			if (items == null) return true;
			for (var j in items) {
				urls.push(j);
			}
			ZU.processDocuments(urls, scrape);
		})
	} else {
		scrape(doc, url)
	}
}

function scrape(doc, url) {
	var host = doc.location.host;
	var tagsx = '//td[@class="mainPageContent"]/div[3]';
	var artid = url.match(/content\/([^\/]+)/)[1]
	if (doc.evaluate(tagsx, doc, null, XPathResult.ANY_TYPE, null).iterateNext()) {
		var tags = Zotero.Utilities.trimInternal(doc.evaluate(tagsx, doc, null, XPathResult.ANY_TYPE, null).iterateNext().textContent).split(",");
	}
	Zotero.Utilities.HTTP.doPost('/export.mpx', 'code=' + artid + '&mode=ris', function (text) {
		// load translator for RIS
		//some entries have empty author fields, or fields with just a comma. Delete those.
		text = text.replace(/AU  - [\s,]+\n/g, "");
		//book chapters are supposed to be CHAP not CHAPTER
		text = text.replace(/TY\s+-\s+CHAP.+/g, 'TY  - CHAP');
		//Z.debug(text);
		var translator = Zotero.loadTranslator("import");
		translator.setTranslator("32d59d2d-b65a-4da4-b0a3-bdd3cfb979e7");
		translator.setString(text);
		translator.setHandler("itemDone", function (obj, item) {
			var pdfurl = 'http://' + host +'/content/' + artid + '/fulltext.pdf';
			item.attachments = [{
				url: item.url,
				title: "MetaPress Snapshot",
				mimeType: "text/html"
			}, {
				url: pdfurl,
				title: "MetaPress Full Text PDF",
				mimeType: "application/pdf"
			}];
			//if (tags) item.tags = tags;
			if (item.abstractNote) {
				if (item.abstractNote.substr(0, 8) == "Abstract") item.abstractNote = Zotero.Utilities.trimInternal(item.abstractNote.substr(8));
			}
			item.complete();
		});
		translator.translate();
		Zotero.done();
	});
}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://metapress.com/content/y737165n6x0q1455/",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"lastName": "Yabuuchi",
						"firstName": "Shigemi",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "MetaPress Snapshot",
						"mimeType": "text/html"
					},
					{
						"title": "MetaPress Full Text PDF",
						"mimeType": "application/pdf"
					}
				],
				"publicationTitle": "Journal of Economic Integration",
				"title": "Immigration and Unemployment of Skilled and Unskilled Labor",
				"volume": "23",
				"issue": "2",
				"pages": "331-345",
				"url": "http://www.metapress.com/content/Y737165N6X0Q1455",
				"abstractNote": "This paper discusses the problem of unemployment in developed countries that faces international labor movement. There are two types of unemployment. The first traditional type of unemployment exists simply because the common wage rate is fixed and higher than the equilibrium level. The second one may exist when the wage rate in one sector is high and fixed, while that in the other is flexible. On the other hand, an extensive movement of labor among countries has been observed. Thus, this paper investigates the effects of immigration and other policies on the two types of unemployment. JEL classification : F16, F22, J64, R23",
				"date": "June 1, 2008",
				"libraryCatalog": "MetaPress",
				"accessDate": "CURRENT_TIMESTAMP"
			}
		]
	},
	{
		"type": "web",
		"url": "http://metapress.com/content/?k=labor+market",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://metapress.com/content/j99677822343/?v=editorial",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://brepols.metapress.com/content/V4G02936X2860845",
		"items": [
			{
				"itemType": "bookSection",
				"creators": [
					{
						"lastName": "Abram",
						"firstName": "Andrew",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "MetaPress Snapshot",
						"mimeType": "text/html"
					},
					{
						"title": "MetaPress Full Text PDF",
						"mimeType": "application/pdf"
					}
				],
				"publicationTitle": "Medieval Church Studies",
				"title": "The Regular Canons in the Medieval British Isles",
				"pages": "79-95",
				"url": "http://dx.doi.org/10.1484/M.MCS-EB.5.100378",
				"DOI": "10.1484/M.MCS-EB.5.100378",
				"date": "2011",
				"libraryCatalog": "MetaPress",
				"accessDate": "CURRENT_TIMESTAMP"
			}
		]
	}
]
/** END TEST CASES **/