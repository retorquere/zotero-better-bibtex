{
	"translatorID": "46291dc3-5cbd-47b7-8af4-d009078186f6",
	"label": "CiNii",
	"creator": "Michael Berkowitz and Mitsuo Yoshida",
	"target": "^https?://ci\\.nii\\.ac\\.jp/",
	"minVersion": "1.0.0b4.r5",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2012-11-24 13:12:41"
}

function detectWeb(doc, url) {
	if (url.match(/naid/)) {
		return "journalArticle";
	} else if (doc.evaluate('//a[contains(@href, "/naid/")]', doc, null, XPathResult.ANY_TYPE, null).iterateNext()) {
		return "multiple";
	}
}

function doWeb(doc, url) {
	var arts = new Array();
	if (detectWeb(doc, url) == "multiple") {
		var items = new Object();
		var links = doc.evaluate('//a[contains(@href, "/naid/")]', doc, null, XPathResult.ANY_TYPE, null);
		var link;
		while (link = links.iterateNext()) {
			items[link.href] = Zotero.Utilities.trimInternal(link.textContent);
		}
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
	} else {
		scrape(doc, url)
	}
}
function scrape(doc, url){
		var newurl = doc.location.href;
		var biblink = ZU.xpathText(doc, '//li/div/a[contains(text(), "BibTeX")]/@href');
	//Z.debug(biblink)
	var tags = new Array();
		if (doc.evaluate('//a[@rel="tag"]', doc, null, XPathResult.ANY_TYPE, null).iterateNext()) {
			var kws = doc.evaluate('//a[@rel="tag"]', doc, null, XPathResult.ANY_TYPE, null);
			var kw;
			while (kw = kws.iterateNext()) {
				tags.push(Zotero.Utilities.trimInternal(kw.textContent));
			}
		}
		var abstractNote;
		if (doc.evaluate('//div[@class="abstract"]', doc, null, XPathResult.ANY_TYPE, null).iterateNext()) {
			abstractNote = doc.evaluate('//div[@class="abstract"]', doc, null, XPathResult.ANY_TYPE, null).iterateNext().textContent;
		}
		Zotero.Utilities.HTTP.doGet(biblink, function(text) {
			var trans = Zotero.loadTranslator("import");
			trans.setTranslator("9cb70025-a888-4a29-a210-93ec52da40d4");
			trans.setString(text);
			trans.setHandler("itemDone", function(obj, item) {
				item.url = newurl;
				item.attachments = [{url:item.url, title:item.title + " Snapshot", mimeType:"text/html"}];
				item.tags = tags;
				item.abstractNote = abstractNote;
				item.complete();
			});
			trans.translate();
		});
	}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://ci.nii.ac.jp/search?q=test&range=0&count=20&sortorder=1&type=0",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://ci.nii.ac.jp/naid/110000244188/ja/",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "<研究速報>観測用既存鉄骨造モデル構造物を用いたオンライン応答実験=Pseudo-dynamic tests on existing steel model structure for seismic monitoring",
				"creators": [
					{
						"firstName": "謙一=Kenichi Ohi",
						"lastName": "大井",
						"creatorType": "author"
					},
					{
						"firstName": "輿助=Yosuke Shimawaki",
						"lastName": "嶋脇",
						"creatorType": "author"
					},
					{
						"firstName": "拓海=Takumi Ito",
						"lastName": "伊藤",
						"creatorType": "author"
					},
					{
						"firstName": "Li",
						"lastName": "Yushun",
						"creatorType": "author"
					}
				],
				"date": "November 2002",
				"DOI": "10.11188/seisankenkyu.54.384",
				"ISSN": "0037105X",
				"issue": "6",
				"itemID": "110000244188",
				"libraryCatalog": "CiNii",
				"pages": "384-387",
				"publicationTitle": "生産研究",
				"url": "http://ci.nii.ac.jp/naid/110000244188/ja/",
				"volume": "54",
				"attachments": [
					{
						"title": "<研究速報>観測用既存鉄骨造モデル構造物を用いたオンライン応答実験=Pseudo-dynamic tests on existing steel model structure for seismic monitoring Snapshot",
						"mimeType": "text/html"
					}
				],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/