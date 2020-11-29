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
	"lastUpdated": "2020-02-20 21:11:47"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2020 Michael Berkowitz
	
	This file is part of Zotero.

	Zotero is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	Zotero is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
	GNU Affero General Public License for more details.

	You should have received a copy of the GNU Affero General Public License
	along with Zotero. If not, see <http://www.gnu.org/licenses/>.

	***** END LICENSE BLOCK *****
*/

// attr()/text() v2
// eslint-disable-next-line
function attr(docOrElem,selector,attr,index){var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector);return elem?elem.getAttribute(attr):null;}function text(docOrElem,selector,index){var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector);return elem?elem.textContent:null;}

function detectWeb(doc, url) {
	if (url.includes("article?") || url.includes("article;") || url.includes("/art")) {
		return "journalArticle";
	}
	// permalinks
	else if (url.includes("/content/") && getRisUrl(doc)) {
		return "journalArticle";
	}
	else if ((url.includes("search")) && getSearchResults(doc)) {
		return "multiple";
	}
	return false;
}

function getSearchResults(doc) {
	var items = {}, found = false;
	var rows = doc.getElementsByClassName('searchResultTitle');
	for (var i = 0; i < rows.length; i++) {
		var id = ZU.xpathText(rows[i], './a/@href');
		var title = ZU.xpathText(rows[i], './a/@title');
		if (!id || !title) {
			continue;
		}
		else {
			found = true;
			items[id] = title;
		}
	}
	return found ? items : false;
}

function doWeb(doc, url) {
	if (detectWeb(doc, url) == "multiple") {
		Zotero.selectItems(getSearchResults(doc, false), function (items) {
			if (!items) {
				return;
			}
			var articles = [];
			for (var i in items) {
				articles.push(i);
			}
			ZU.processDocuments(articles, scrape);
		});
	}
	else {
		scrape(doc, url);
	}
}

function getRisUrl(doc) {
	return ZU.xpathText(doc, '//div[contains(@class,"export-formats")]/ul/li/a[contains(text(), "EndNote")]/@href');
}

function scrape(newDoc, url) {
	var abs, pdf;
	var risurl = getRisUrl(newDoc);
	if (ZU.xpathText(newDoc, '//div[@id="abstract"]')) {
		abs = Zotero.Utilities.trimInternal(ZU.xpathText(newDoc, '//div[@id="abstract"]')).substr(10);
	}
	var articleID = ZU.xpathText(newDoc, '/html/head/meta[@name="IC.identifier"]/@content');
	if (articleID) {
		pdf = '/search/download?pub=infobike://' + articleID + '&mimetype=application/pdf';
	}
	else {
		pdf = url.replace(/[?&#].*/, '')
			.replace('/content/', '/search/download?pub=infobike://')
			+ '&mimetype=application/pdf';
	}
	if (ZU.xpathText(newDoc, '//div[@id="info"]/p[1]/a')) {
		var keywords = ZU.xpathText(newDoc, '//div[@id="info"]/p[1]/a');
		var key;
		var keys = [];
		while (key == keywords.iterateNext()) {
			keys.push(Zotero.Utilities.capitalizeTitle(key.textContent, true));
		}
	}
	Zotero.Utilities.HTTP.doGet(risurl, function (text) {
		// fix spacing per spec
		text = text.replace(/([A-Z0-9]{2})  ?-/g, "$1  -");
		// Zotero.debug(text);
		text = text.replace(/(PY\s+-\s+)\/+/, "$1");
		text = text.replace(/ER\s\s-/, "") + "\nER  - ";
		var translator = Zotero.loadTranslator("import");
		translator.setTranslator("32d59d2d-b65a-4da4-b0a3-bdd3cfb979e7");
		translator.setString(text);
		translator.setHandler("itemDone", function (obj, item) {
			if (abs) item.abstractNote = abs;
			if (pdf) item.attachments.push({ url: pdf, title: "IngentaConnect Full Text PDF", mimeType: "application/pdf" });
			// Note that the RIS translator gives us a link to the record already
			item.url = null;
			if (keys) item.tags = keys;
			if (item.date) item.date = item.date.replace(/T00:00:00\/*/, "");
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
		"url": "https://www.ingentaconnect.com/search%3bjsessionid=296g394n0j012.alice?form_name=quicksearch&ie=%25E0%25A5%25B0&value1=argentina&option1=tka&x=0&y=0",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://www.ingentaconnect.com/content/tpp/ep/2014/00000010/00000001/art00001",
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
		"url": "https://www.ingentaconnect.com/search/article?option1=title&value1=credibility+associated+with+how+often+they+present+research+evidence+to+public+or+partly+government-owned+organisations&sortDescending=true&sortField=default&pageSize=10&index=1",
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
				"abstractNote": "This study provides an empirical test of the assumption that the credibility of the messenger is one of the factors that influence knowledge mobilisation among policy makers. This general hypothesis was tested using a database of 321 social scientists from the province of Quebec that\ncombines survey and bibliometric data. A regression model was used to study the association between indicators of faculty members' credibility and the number of times they have presented research evidence to public or partly government-owned organisations over an 18-month period. Overall,\nempirical results provide new evidence supporting the credibility hypothesis.",
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
					{
						"tag": "CREDIBILITY"
					},
					{
						"tag": "CROSS-SECTIONAL SURVEY"
					},
					{
						"tag": "FACULTY MEMBERS"
					},
					{
						"tag": "KNOWLEDGE TRANSFER"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.ingentaconnect.com/search/article?option1=tka&value1=search&pageSize=10&index=1",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Search engine optimisation in 2017: A new world where old rules still matter",
				"creators": [
					{
						"lastName": "Alpert",
						"firstName": "Brian",
						"creatorType": "author"
					}
				],
				"date": "2017-03-01",
				"abstractNote": "The ability for website content to be found on search engines has always been a concern for anyone managing a website. Search has evolved, however, and improving ‘findability’ means more today than ever, in no small part due to the sophisticated technologies underpinning\ntoday’s search engines. This paper discusses the current state of search, provides an overview of still-important variables and techniques for search engine optimisation, and discusses newer, important considerations. Also discussed are priorities for relaunching an existing site (or\nlaunching a new one), and a look at current trends that illuminate where things are heading.",
				"issue": "1",
				"journalAbbreviation": "Journal of Digital & Social Media Marketing",
				"libraryCatalog": "IngentaConnect",
				"pages": "39-60",
				"publicationTitle": "Journal of Digital & Social Media Marketing",
				"shortTitle": "Search engine optimisation in 2017",
				"volume": "5",
				"attachments": [
					{
						"title": "IngentaConnect Full Text PDF",
						"mimeType": "application/pdf"
					}
				],
				"tags": [
					{
						"tag": "SEO"
					},
					{
						"tag": "engine"
					},
					{
						"tag": "findability"
					},
					{
						"tag": "marketing"
					},
					{
						"tag": "optimisation"
					},
					{
						"tag": "rank"
					},
					{
						"tag": "search"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/
