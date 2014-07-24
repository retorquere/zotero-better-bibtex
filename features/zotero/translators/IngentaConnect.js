{
	"translatorID": "9e306d5d-193f-44ae-9dd6-ace63bf47689",
	"label": "IngentaConnect",
	"creator": "Michael Berkowitz",
	"target": "^https?://(www\\.)?ingentaconnect\\.com",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2014-05-09 23:09:37"
}

function detectWeb(doc, url) {
	if (url.indexOf("article?") != -1 || url.indexOf("article;") != -1 || url.indexOf("/art") != -1) {
		return "journalArticle";
	} 
	//permalinks
	else if (url.indexOf("/content/") != -1  && ZU.xpathText(doc, '//div[contains(@class,"export-formats")]/ul/li/a[@title="EndNote Export"]')) {
		return "journalArticle";
	}
	
	else if (url.indexOf("search?") !=-1 || url.indexOf("search;") != -1) {
		return "multiple";
	}
}

function doWeb(doc, url) {
	var articles = new Array();
	if (detectWeb(doc, url) == "multiple") {
		var items = new Object();
		var artlink = '//div//p/strong/a';
		var links = doc.evaluate(artlink, doc, null, XPathResult.ANY_TYPE, null);
		var next_link;
		while (next_link = links.iterateNext()) {
			items[next_link.href] = next_link.textContent;
		}
		
		Zotero.selectItems(items, function (items) {
			if (!items) {
				return true;
			}
			for (var i in items) {
				articles.push(i);
			}
			Zotero.Utilities.processDocuments(articles, scrape);
		});
	} else {
		scrape(doc, url)
	}
}

function scrape(newDoc, url){
		var abs, pdf;
		var risurl = newDoc.evaluate('//div[contains(@class,"export-formats")]/ul/li/a[@title="EndNote Export"]', newDoc, null, XPathResult.ANY_TYPE, null).iterateNext().href;
		if (newDoc.evaluate('//div[@id="abstract"]', newDoc, null, XPathResult.ANY_TYPE, null).iterateNext()) {
			abs = Zotero.Utilities.trimInternal(newDoc.evaluate('//div[@id="abstract"]', newDoc, null, XPathResult.ANY_TYPE, null).iterateNext().textContent).substr(10);
		}
		var articleID = ZU.xpathText(newDoc, '/html/head/meta[@name="IC.identifier"]/@content');
		if(articleID) {
			pdf = '/search/download?pub=infobike://' + articleID + '&mimetype=application/pdf';
		} else {
			pdf = url.replace(/[?&#].*/, '')
				.replace('/content/', '/search/download?pub=infobike://')
				+ '&mimetype=application/pdf';
		}
		if (newDoc.evaluate('//div[@id="info"]/p[1]/a', newDoc, null, XPathResult.ANY_TYPE, null).iterateNext()) {
			var keywords = newDoc.evaluate('//div[@id="info"]/p[1]/a', newDoc, null, XPathResult.ANY_TYPE, null);
			var key;
			var keys = new Array();
			while (key = keywords.iterateNext()) {
				keys.push(Zotero.Utilities.capitalizeTitle(key.textContent, true));
			}
		}
		Zotero.Utilities.HTTP.doGet(risurl, function(text) {
			// fix spacing per spec
			text = text.replace(/([A-Z0-9]{2})  ?-/g,"$1  -");
			//Zotero.debug(text);
			text = text.replace(/(PY\s+\-\s+)\/+/, "$1");
			text = text.replace(/ER\s\s\-/, "") + "\nER  - ";
			var translator = Zotero.loadTranslator("import");
			translator.setTranslator("32d59d2d-b65a-4da4-b0a3-bdd3cfb979e7");
			translator.setString(text);
			translator.setHandler("itemDone", function(obj, item) {
				if (abs) item.abstractNote = abs;
				if (pdf) item.attachments.push({url:pdf, title:"IngentaConnect Full Text PDF", mimeType:"application/pdf"});
				// Note that the RIS translator gives us a link to the record already
				item.url = null;
				if (keys) item.tags = keys;
				if (item.date) item.date = item.date.replace(/\-01\-01T00:00:00\/*/, "")
				if (item.DOI) {
					if (item.DOI.match(/^doi:/)) {
						item.DOI = item.DOI.substr(4);
					}
				}
				item.complete();
			});
			translator.translate();
		});
}
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.ingentaconnect.com/search;jsessionid=296g394n0j012.alice?form_name=quicksearch&ie=%E0%A5%B0&value1=argentina&option1=tka&x=0&y=0",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://www.ingentaconnect.com/content/tpp/ep/2014/00000010/00000001/art00001",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"lastName": "Gough",
						"firstName": "David",
						"creatorType": "author"
					},
					{
						"lastName": "Boaz",
						"firstName": "Annette",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "IngentaConnect Full Text PDF",
						"mimeType": "application/pdf"
					}
				],
				"journalAbbreviation": "Evidence & Policy: A Journal of Research, Debate and Practice",
				"issue": "1",
				"DOI": "10.1332/174426413X13836441441630",
				"libraryCatalog": "IngentaConnect",
				"title": "Strategies for enabling the use of research evidence",
				"volume": "10",
				"pages": "3-4",
				"date": "2014",
				"publicationTitle": "Evidence & Policy: A Journal of Research, Debate and Practice"
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.ingentaconnect.com/search/article?option1=title&value1=credibility+associated+with+how+often+they+present+research+evidence+to+public+or+partly+government-owned+organisations&sortDescending=true&sortField=default&pageSize=10&index=1",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"lastName": "Ouimet",
						"firstName": "Mathieu",
						"creatorType": "author"
					},
					{
						"lastName": "Bédard",
						"firstName": "Pierre-Olivier",
						"creatorType": "author"
					},
					{
						"lastName": "Léon",
						"firstName": "Grégory",
						"creatorType": "author"
					},
					{
						"lastName": "Dagenais",
						"firstName": "Christian",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [
					"Credibility",
					"Cross-Sectional Survey",
					"Faculty Members",
					"Knowledge Transfer"
				],
				"seeAlso": [],
				"attachments": [
					{
						"title": "IngentaConnect Full Text PDF",
						"mimeType": "application/pdf"
					}
				],
				"journalAbbreviation": "Evidence & Policy: A Journal of Research, Debate and Practice",
				"issue": "1",
				"abstractNote": "This study provides an empirical test of the assumption that the credibility of the messenger is one of the factors that influence knowledge mobilisation among policy makers. This general hypothesis was tested using a database of 321 social scientists from the province of Quebec that combines survey and bibliometric data. A regression model was used to study the association between indicators of faculty members' credibility and the number of times they have presented research evidence to public or partly government-owned organisations over an 18-month period. Overall, empirical results provide new evidence supporting the credibility hypothesis.",
				"DOI": "10.1332/174426413X662699",
				"libraryCatalog": "IngentaConnect",
				"shortTitle": "Are indicators of faculty members' credibility associated with how often they present research evidence to public or partly government-owned organisations?",
				"title": "Are indicators of faculty members' credibility associated with how often they present research evidence to public or partly government-owned organisations? A cross-sectional survey",
				"volume": "10",
				"pages": "5-27",
				"date": "2014",
				"publicationTitle": "Evidence & Policy: A Journal of Research, Debate and Practice"
			}
		]
	}
]
/** END TEST CASES **/