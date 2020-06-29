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
	"lastUpdated": "2014-09-17 04:55:38"
}

function detectWeb(doc, url) {
	if (url.indexOf("article?") != -1 || url.indexOf("article;") != -1 || url.indexOf("/art") != -1) {
		return "journalArticle";
	} 
	//permalinks
	else if (url.indexOf("/content/") != -1  && getRisUrl(doc) ) {
		return "journalArticle";
	}
	
	else if ((url.indexOf("search?") !=-1 || url.indexOf("search;") != -1) && getSearchResults(doc)) {
		return "multiple";
	}
}


function getRisUrl(doc) {
	return ZU.xpathText(doc, '//div[contains(@class,"export-formats")]/ul/li/a[@title="EndNote Export"]/@href');
}


function getSearchResults(doc) {
	var items = {}, found = false;
	var rows = doc.getElementsByClassName('searchResultTitle');
	for (var i=0; i<rows.length; i++) {
		var id = ZU.xpathText(rows[i], './a/@href');
		var title = ZU.xpathText(rows[i], './a/@title');
		if (!id || !title) {
			continue;
		} else {
			found = true;
			items[id] = title;
		}
	}
	return found ? items : false;
}


function doWeb(doc, url) {
	var articles = new Array();
	if (detectWeb(doc, url) == "multiple") {
		
		var items = getSearchResults(doc);
		
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
		var risurl = getRisUrl(newDoc);
		if (newDoc.evaluate('//div[@id="abstract"]', newDoc, null, XPathResult.ANY_TYPE, null).iterateNext()) {
			abs = Zotero.Utilities.trimInternal(newDoc.evaluate('//div[@id="abstract"]', newDoc, null, XPathResult.ANY_TYPE, null).iterateNext().textContent).substr(10);
		}
		var articleID = ZU.xpathText(newDoc, '/html/head/meta[@name="IC.identifier"]/@content');
		if (articleID) {
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
				if (item.date) item.date = item.date.replace(/T00:00:00\/*/, "")
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
				"title": "Strategies for enabling the use of research evidence",
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
				"date": "2014-01-01",
				"DOI": "10.1332/174426413X13836441441630",
				"issue": "1",
				"journalAbbreviation": "Evidence & Policy: A Journal of Research, Debate and Practice",
				"libraryCatalog": "IngentaConnect",
				"pages": "3-4",
				"publicationTitle": "Evidence & Policy: A Journal of Research, Debate and Practice",
				"volume": "10",
				"attachments": [
					{
						"title": "IngentaConnect Full Text PDF",
						"mimeType": "application/pdf"
					}
				],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.ingentaconnect.com/search/article?option1=title&value1=credibility+associated+with+how+often+they+present+research+evidence+to+public+or+partly+government-owned+organisations&sortDescending=true&sortField=default&pageSize=10&index=1",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Are indicators of faculty members' credibility associated with how often they present research evidence to public or partly government-owned organisations? A cross-sectional survey",
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
				"date": "2014-01-01",
				"DOI": "10.1332/174426413X662699",
				"abstractNote": "This study provides an empirical test of the assumption that the credibility of the messenger is one of the factors that influence knowledge mobilisation among policy makers. This general hypothesis was tested using a database of 321 social scientists from the province of Quebec that combines survey and bibliometric data. A regression model was used to study the association between indicators of faculty members' credibility and the number of times they have presented research evidence to public or partly government-owned organisations over an 18-month period. Overall, empirical results provide new evidence supporting the credibility hypothesis.",
				"issue": "1",
				"journalAbbreviation": "Evidence & Policy: A Journal of Research, Debate and Practice",
				"libraryCatalog": "IngentaConnect",
				"pages": "5-27",
				"publicationTitle": "Evidence & Policy: A Journal of Research, Debate and Practice",
				"shortTitle": "Are indicators of faculty members' credibility associated with how often they present research evidence to public or partly government-owned organisations?",
				"volume": "10",
				"attachments": [
					{
						"title": "IngentaConnect Full Text PDF",
						"mimeType": "application/pdf"
					}
				],
				"tags": [
					"Credibility",
					"Cross-Sectional Survey",
					"Faculty Members",
					"Knowledge Transfer"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.ingentaconnect.com/content/mohr/acp/2014/00000214/00000004/art00003",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Teilnahme an der vorsätzlichen sittenwidrigen Vermögensschädigung im Gesellschafts- und Kapitalmarktrecht (§§ 826, 830 Abs. 1 Satz 1 und Abs. 2 BGB)",
				"creators": [
					{
						"lastName": "Oechsler",
						"firstName": "Jürgen",
						"creatorType": "author"
					}
				],
				"date": "2014-08-01",
				"DOI": "10.1628/000389914X14061177683732",
				"issue": "4",
				"journalAbbreviation": "Archiv fuer die civilistische Praxis",
				"libraryCatalog": "IngentaConnect",
				"pages": "542-566",
				"publicationTitle": "Archiv fuer die civilistische Praxis",
				"volume": "214",
				"attachments": [
					{
						"title": "IngentaConnect Full Text PDF",
						"mimeType": "application/pdf"
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