{
	"translatorID": "4ea89035-3dc4-4ae3-b22d-726bc0d83a64",
	"label": "Galegroup",
	"creator": "Sebastian Karcher and Aurimas Vinckevicius",
	"target": "^https?://(find\\.galegroup\\.com/|go\\.galegroup\\.com/gdsc)",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2018-10-07 16:06:56"
}

/*
	***** BEGIN LICENSE BLOCK *****
	
	Galegroup Translator - Copyright © 2012-2018 Sebastian Karcher 
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

var composeAttachment = composeAttachmentDefault;
var composeRisUrl = composeRisUrlDefault;

function getSearchResults(doc) {
	// Default
	var results = ZU.xpath(doc, '//*[@id="SearchResults"]//section[@class="resultsBody"]/ul/li');
	if (results.length) {
		results.linkXPath = './p[@class="subTitle"]/a';
		Z.debug("Default Layout");
		return results;
	}
	
	// Ecco
	results = ZU.xpath(doc, '//div[@id="resultsBox"]//li[@class="resrow"]');
	if (results.length) {
		results.linkXPath = './/div[@class="pic_Title"]/a';
		Z.debug("Ecco, but using Default");
		return results;
	}
	
	// Time Literary Supplement & Times Digital Archive
	results = ZU.xpath(doc, '//div[@id="results_list"]/ul[@class="resultsListBox"]');
	if (results.length) {
		results.linkXPath = './/p[@class="articleTitle"]//a';
		if (doc.title.includes("The Times Digital Archive")) {
			Z.debug("Times Digital Archive");
			composeRisUrl = composeRisUrlTDA;
		}
		else {
			composeRisUrl = composeRisUrlGNV;
			Z.debug("TLS, but using GNV/TDA combo");
		}
		composeAttachment = composeAttachmentTDA;

		return results;
	}
	

	// Archives Unbound
	results = ZU.xpath(doc, '//div[@id="resultsTable"]/div');
	if (results.length) {
		results.linkXPath = './/span[@class="title"]//a';
		Z.debug("Archives Unbound, but using Default");
		return results;
	}
	
	// Gale NewsVault
	results = ZU.xpath(doc, '//*[@id="results_list"]/div[contains(@class,"resultList")]');
	if (results.length) {
		results.linkXPath = './div[@class="pub_details"]//li[@class="resultInfo"]/p//a';
		Z.debug("Using GNV");
		composeAttachment = composeAttachmentGNV;
		composeRisUrl = composeRisUrlGNV;
		return results;
	}
	
	// LegalTrac (not sure this still exists 2018-09-24)
	results = ZU.xpath(doc, '//*[@id="sr_ul"]/li');
	if (results.length) {
		results.linkXPath = './/span[@class="title"]/a';
		Z.debug("LegalTrac, but using Default");
		return results;
	}
	
	return [];
}

function detectWeb(doc, url) {
	if (url.includes('/newspaperRetrieve.do')) {
		return "newspaperArticle";
	}
	
	if (url.includes('/retrieve.do') || url.includes('/i.do') || url.includes('/infomark.do')) {
		if (url.includes('/ecco/')) return "book";
		else if (url.includes('prodId=TLSH') || url.includes('prodID=TTDA') || url.includes('prodID=DVNW')) {
			return "newspaperArticle";
		}
		return "journalArticle";
	}
	
	if (getSearchResults(doc).length) return "multiple";
}



function composeRisUrlGNV(url) {
	let baseUrl = url.replace(/#.*/,'').replace(/\/[^\/?]+\?.+/, '/centralizedGenerateCitation.do?');
	let userGroupName = url.match(/userGroupName=[^&]+/)[0];
	let prodId = url.match(/prodId=[^&]+/)[0];
	let tabID  = url.match(/tabID=[^&]+/)[0];
	let docId = url.match(/docId=[^&]+/);
	if (docId) {
		docId = docId[0];
	}
	else {
		docId = url.match(/relevancePageBatch=[^&]+/)[0].replace(/relevancePageBatch/, "docId");
	}
	let contentSet= url.match(/contentSet=[^&]+/)[0];
	return baseUrl + "actionString=FormatCitation&inPS=true&citationFormat=ENDNOTE" + "&" + userGroupName  + "&" + contentSet +"&" + docId + "&" + prodId + "&" + tabID;

}

function composeRisUrlDefault(url) {
	return url.replace(/#.*/,'').replace(/\/[^\/?]+(?=\?|$)/, '/generateCitation.do')
		.replace(/\bactionString=[^&]*&?/g, '').replace(/\bcitationFormat=[^&]*&?/g, '')
		.replace(/\&u=/, "&userGroupName=").replace(/\&id=/, "&docId=") //for bookmarked pages
		+ '&actionString=FormatCitation&citationFormat=ENDNOTE';
}

// The Times Digital Archive
function composeRisUrlTDA(url) {
	if (url.indexOf('relevancePageBatch=') != -1) {
		url = url.replace(/\bdocId=[^&]*&?/g, "").replace(/\&relevancePageBatch=/, "&docId=");
	}
	return url.replace(/#.*/,'').replace(/\/[^\/?]+(?=\?|$)/, '/generateCitation.do')
		.replace(/\bactionString=[^&]*&?/g, '').replace(/\bcitationFormat=[^&]*&?/g, '')
		+ '&actionString=FormatCitation&citationFormat=ENDNOTE';
}



function composeAttachmentDefault(doc, url) {
	var pdf = !!(doc.getElementById('pdfLink') || doc.getElementById('docTools-pdf'));
	var attachment = ZU.xpath(doc, '//*[@id="docTools-download"]/a[./@href]')[0];
	if (attachment && pdf ) {
		url = attachment.href;
		return {
			url: url.replace(/#.*/, '').replace(/\/[^\/?]+(?=\?|$)/, '/downloadDocument.do')
				.replace(/\b(?:actionCmd|downloadFormat)=[^&]*&?/g, '')
				+ '&actionCmd=DO_DOWNLOAD_DOCUMENT&downloadFormat=' + (pdf?'PDF':'HTML'),
			title: "Full Text " + (pdf?'PDF':'HTML'),
			mimeType: pdf?'application/pdf':'text/html'
		};
	} else {
		return {document: doc, title: "Snapshot"};
	}
}



function composeAttachmentGNV(doc, url) {
	var lowerLimit = ZU.xpathText(doc, '//form[@id="resultsForm"]/input[@name="pdfLowerLimit"]/@value') || '1';
	var upperLimit = ZU.xpathText(doc, '//form[@id="resultsForm"]/input[@name="pdfHigherLimit"]/@value') || lowerLimit;
	var numPages = ZU.xpathText(doc, '//form[@id="resultsForm"]/input[@name="noOfPages"]/@value') || (upperLimit - lowerLimit + 1);
	var pdfUrl = url.replace(/#.*/,'').replace(/\/[^\/?]+(?=\?|$)/, '/downloadDocument.do')
			.replace(/\b(?:scale|orientation|docType|pageIndex|relatedDocId|isIllustration|imageId|aCmnd|recNum|pageRange|noOfPages)=[^&]*&?/g, '')
			+ '&scale=&orientation=&docType=&pageIndex=1&relatedDocId=&isIllustration=false'
			+ '&imageId=&aCmnd=PDFFormat&recNum=&' + 'noOfPages=' + numPages + '&pageRange=' + lowerLimit + '-' + upperLimit;
	
	Z.debug(pdfUrl);
	return {
		url: pdfUrl,
		title: 'Full Text PDF',
		mimeType: 'application/pdf'
	};
}

function composeAttachmentTDA(doc, url) {
	if (url.indexOf('relevancePageBatch=') != -1) {
		url = url.replace(/\bdocId=[^&]*&?/g, "").replace(/\&relevancePageBatch=/, "&docId=");
	}
	return composeAttachmentGNV(doc, url);
}

function parseRis(text, attachment) {
	text = text.trim();
	// gale puts issue numbers in M1
	text = text.replace(/M1\s*\-/g, "IS  -");
	// L2 is probably meant to be UR, but we can ignore it altogether
	text = text.replace(/^L2\s+-.+\n/gm, '');
	// we can map copyright notes via CR
	text = text.replace(/^N1(?=\s+-\s+copyright)/igm, 'CR');
	// Z.debug(text);
	
	var translator = Zotero.loadTranslator("import");
	translator.setTranslator("32d59d2d-b65a-4da4-b0a3-bdd3cfb979e7");
	translator.setString(text);
	translator.setHandler("itemDone", function (obj, item) {
		if (attachment) item.attachments.push(attachment);
		if (item.ISSN) {
			item.ISSN = ZU.cleanISSN(item.ISSN);
		}
		if (item.pages && item.pages.endsWith("+")) {
			item.pages = item.pages.replace(/\+/, "-");
		}
		item.complete();
	});
	translator.translate();
}

function processArticles(articles) {
	var article;
	while (article = articles.shift()) {
		ZU.processDocuments(article, function(doc, url) {
			processPage(doc, url);
			processArticles(articles);
		});
	}
}

function processPage(doc, url) {
	var attachment = composeAttachment(doc, url);
	Z.debug(composeRisUrl(url))
	ZU.doGet(composeRisUrl(url), function(text) {
		parseRis(text, attachment);
	});
}

function doWeb(doc, url) {
	if (detectWeb(doc, url) == "multiple") {
		var results = getSearchResults(doc);
		var items = {};
		for (var i=0, n=results.length; i<n; i++) {
			var link = ZU.xpath(results[i], results.linkXPath)[0];
			if (!link) continue;
			
			items[link.href] = ZU.trimInternal(link.textContent);
		}
		
		Zotero.selectItems(items, function (items) {
			if (!items) return true;
			
			var articles = [];
			for (var i in items) {
				articles.push(i);
			}
			processArticles(articles);
		});
	} else {
		if (doc.title.includes('NewsVault')) {
			Z.debug("Using GNV");
			composeAttachment = composeAttachmentGNV;
			composeRisUrl = composeRisUrlGNV;
		} else if (doc.title.includes('Times Literary Supplement')) {
			Z.debug("Times Literary Supplment Using GNV/TDA");
			composeAttachment = composeAttachmentTDA;
			composeRisUrl = composeRisUrlGNV;
			
		} else if (doc.title.includes('The Times Digital Archive')) {
			Z.debug("Using TDA");
			composeAttachment = composeAttachmentTDA;
			composeRisUrl = composeRisUrlTDA;
		} else if (doc.title.includes('Eighteenth Century Collections Online')) {
			Z.debug("Using Ecco (Default)");
			// keeping this separate as there is a different attachment logic
			// we might want to use that in the future.
		} else {
			Z.debug("Using Default");
		}
		
		processPage(doc, url);
	}
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://find.galegroup.com/tlsh/infomark.do?&source=gale&prodId=TLSH&userGroupName=nysl_ce_syr&tabID=T003&docPage=article&searchType=&docId=EX1200180081&type=multipage&contentSet=LTO&version=1.0",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Science in 1901",
				"creators": [
					{
						"lastName": "Ross",
						"firstName": "Hugh Munro",
						"creatorType": "author"
					}
				],
				"date": "January 17, 1902",
				"archive": "Times Literary Supplement Historical Archive",
				"libraryCatalog": "Gale",
				"pages": "5+",
				"place": "London, England",
				"publicationTitle": "The Times Literary Supplement",
				"url": "http://find.galegroup.com/tlsh/infomark.do?&source=gale&prodId=TLSH&userGroupName=nysl_ce_syr&tabID=T003&docPage=article&searchType=&docId=EX1200180081&type=multipage&contentSet=LTO&version=1.0",
				"attachments": [
					{
						"title": "Full Text PDF",
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
