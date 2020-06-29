{
	"translatorID": "8cf74360-e772-4818-8cf1-eda0481c7dfb",
	"label": "OECD",
	"creator": "Sebastian Karcher",
	"target": "^https?://(www\\.)?oecd-ilibrary\\.org",
	"minVersion": "2.1",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcs",
	"lastUpdated": "2017-01-03 07:41:53"
}

/*
	***** BEGIN LICENSE BLOCK *****
	
	Copyright © 2012 Sebastian Karcher 
	This file is part of Zotero.
	
	Zotero is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.
	
	Zotero is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU Affero General Public License for more details.
	
	You should have received a copy of the GNU Affero General Public License
	along with Zotero.  If not, see <http://www.gnu.org/licenses/>.
	
	***** END LICENSE BLOCK *****
*/

function detectWeb(doc, url) {
	var bodyId = doc.body.getAttribute("id");
	if (ZU.xpathText(doc, '//ul[@class="sidebar-list"]//a[contains(@title, "Cite this")]')){		
		if (ZU.xpathText(doc, '//li[@class="editorial-board"]')){
			return "journalArticle";
		} else if (bodyId && bodyId=="bookpage") {
			return "book";
		} else {
			return "report";
		}
	}
	if (ZU.xpath(doc, '//table[contains (@class, "search-results")]').length>0){
		return "multiple";
	}
}	

function doWeb(doc, url){

	var articles = new Array();
	if (detectWeb(doc, url) == "multiple") { 
		var items = {};
		var titles = doc.evaluate('//td[@class="expand metadata"]/strong/a', doc, null, XPathResult.ANY_TYPE, null);
		var title;
		while (title = titles.iterateNext()) {
			items[title.href] = title.textContent;
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
		scrape(doc, url);
	}
}


function scrape(doc, url){
	var pdfurl = ZU.xpathText(doc, '//ul[contains(@class, "fulltext")][1]//a[contains(@class, "pdf")]/@href');
	var language = url.match(/\-([a-z]+)$/)
	var RWurl = url + "?fmt=txt";
	Zotero.Utilities.HTTP.doGet(RWurl, function (text) {
	
		text = text.replace(/\nK\d+\s/g, "\nK1 ");
		if (text.search(/RT Generic/)!=-1){
			text = text.replace(/RT Generic/, "RT Report");
			text = text.replace(/JF (.+)/, "CL $1");
		}		
		//Zotero.debug(text)
		var translator = Zotero.loadTranslator("import");
		translator.setTranslator("1a3506da-a303-4b0a-a1cd-f216e6138d86");
		translator.setString(text);
		translator.setHandler("itemDone", function(obj, item) {
			if (language) item.language = language[1];
			if (item.itemType =="report" || item.itemType =="book"){
				if (!item.place) item.place="Paris";
			}
			for (var i in item.creators){
				if (!item.creators[i].firstName) item.creators[i].fieldMode = 1;	
			}
			//we need to run through this to get the PDF because of redirect.
			if (pdfurl){	
				ZU.processDocuments(pdfurl.replace(/,\s.+/, ""), function(newdoc){
					item.attachments = [{document: newdoc, title: "OECD Fulltext", }];
					item.complete();
				})
			}
			else item.complete();
		});	
		translator.translate();
	});
}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.oecd-ilibrary.org/economics/current-account-benchmarks-for-turkey_5k92smtqp9vk-en",
		"items": [
			{
				"itemType": "report",
				"creators": [
					{
						"lastName": "Röhn",
						"firstName": "Oliver",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [
					"Bayesian model averaging",
					"Turkey",
					"current account benchmarks",
					"model uncertainty",
					"external sustainability",
					"current account"
				],
				"seeAlso": [],
				"attachments": [
					{
						"title": "OECD Fulltext"
					}
				],
				"title": "Current Account Benchmarks for Turkey",
				"reportType": "OECD Economics Department Working Papers",
				"date": "Sep 14 2012",
				"abstractNote": "Turkey&#8217;s current account deficit widened to almost 10% of GDP in 2011 and has been narrowing only gradually since. An important question is to what extent Turkey&#8217;s current account deficit is excessive. To explore this issue, one needs to establish benchmarks. In this paper current account benchmarks are derived using the external sustainability as well as the macroeconomic balance approach. However, the standard macroeconomic balance approach ignores the uncertainty inherent in the model selection process given the relatively large number of possible determinants of current account balances. This paper therefore extends the macroeconomic balance approach to account for model uncertainty by using Bayesian Model Averaging techniques. Results from both approaches suggest that current account benchmarks for the current account deficit lie in the range of 3% to 5&#189; per cent of GDP, which is broadly in line with previous estimates but substantially below recent current account deficit levels. This Working Paper relates to the 2012 OECD Economic Survey of Turkey (www.oecd.org/eco/surveys/turkey).",
				"institution": "Organisation for Economic Co-operation and Development",
				"DOI": "10.1787/5k92smtqp9vk-en",
				"url": "http://www.oecd-ilibrary.org/content/workingpaper/5k92smtqp9vk-en",
				"language": "en",
				"place": "Paris",
				"libraryCatalog": "OECD",
				"accessDate": "CURRENT_TIMESTAMP"
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.oecd-ilibrary.org/search?option1=titleAbstract&option2=&value2=&option3=&value3=&option4=&value4=&option5=&value5=&option6=&value6=&option7=&value7=&option8=&value8=&option9=&value9=&option10=&value10=&option11=&value11=&option12=&value12=&option13=&value13=&option14=&value14=&option15=&value15=&option16=&value16=&option17=&value17=&option21=discontinued&value21=true&option22=excludeKeyTableEditions&value22=true&option18=sort&value18=&form_name=quick&discontin=factbooks&value1=labor&x=0&y=0",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://www.oecd-ilibrary.org/governance/better-regulation-in-europe-france-2010_9789264086968-en",
		"items": [
			{
				"itemType": "book",
				"creators": [
					{
						"lastName": "OECD",
						"creatorType": "author",
						"fieldMode": 1
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "OECD Fulltext"
					}
				],
				"title": "Better Regulation in Europe: France 2010",
				"publicationTitle": "Better Regulation in Europe",
				"date": "Sep 17 2010",
				"abstractNote": "This report maps and analyses the core issues which together make up effective regulatory management for France, laying down a framework of what should be driving regulatory policy and reform in the future. Issues examined include: strategy and policies for improving regulatory management; institutional capacities for effective regulation and the broader policy making context; transparency and processes for effective public consultation and communication; processes for the development of new regulations, including impact assessment and for the management of the regulatory stock, including administrative burdens; compliance rates, enforcement policy and appeal processes; and the multilevel dimension: interface between different levels of government and interface between national processes and those of the EU. This book is part of a project examining better regulation, being carried out in partnership with the European Commission.",
				"publisher": "Organisation for Economic Co-operation and Development",
				"ISBN": "9789264086555",
				"DOI": "10.1787/9789264086968-en",
				"url": "http://www.oecd-ilibrary.org/content/book/9789264086968-en",
				"language": "en",
				"place": "Paris",
				"libraryCatalog": "OECD",
				"accessDate": "CURRENT_TIMESTAMP",
				"shortTitle": "Better Regulation in Europe"
			}
		]
	}
]
/** END TEST CASES **/