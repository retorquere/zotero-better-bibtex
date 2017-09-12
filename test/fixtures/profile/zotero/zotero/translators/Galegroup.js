{
	"translatorID": "4ea89035-3dc4-4ae3-b22d-726bc0d83a64",
	"label": "Galegroup",
	"creator": "Sebastian Karcher and Aurimas Vinckevicius",
	"target": "^https?://(find|go)\\.galegroup\\.com",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsib",
	"lastUpdated": "2017-01-01 15:20:39"
}

/*
	***** BEGIN LICENSE BLOCK *****
	
	Galegroup Translator - Copyright © 2012 Sebastian Karcher 
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
function getSearchResults(doc) {
	//Gale Virtual Reference Library
	var results = ZU.xpath(doc, '//*[@id="SearchResults"]//section[@class="resultsBody"]/ul/li');
	if(results.length) {
		results.linkXPath = './p[@class="subTitle"]/a';
		Z.debug("Using GVRL");
		composeAttachment = composeAttachmentGVRL;
		composeRisUrl = composeRisUrlGVRL;
		return results;
	}
	
	//Academic OneFile
	//Academic ASAP
	results = ZU.xpath(doc, '//div[@id="resultsBox"]//li[@class="resrow"]');
	if(results.length) {
		results.linkXPath = './/div[@class="pic_Title"]/a';
		Z.debug("Academic, but using GVRL");
		composeAttachment = composeAttachmentGVRL;
		composeRisUrl = composeRisUrlGVRL;
		return results;
	}
	
	//LegalTrac
	results = ZU.xpath(doc, '//*[@id="sr_ul"]/li');
	if(results.length) {
		results.linkXPath = './/span[@class="title"]/a';
		Z.debug("LegalTrac, but using GVRL");
		composeAttachment = composeAttachmentGVRL;
		composeRisUrl = composeRisUrlGVRL;
		return results;
	}
	
	//Literature Resource Center
	results = ZU.xpath(doc, '//div[@id="resultsTable"]/div');
	if(results.length) {
		results.linkXPath = './/span[@class="title"]/a';
		Z.debug("LRC, but using GVRL");
		composeAttachment = composeAttachmentGVRL;
		composeRisUrl = composeRisUrlGVRL;
		return results;
	}
	
	//Gale NewsVault
	results = ZU.xpath(doc, '//*[@id="results_list"]/div[contains(@class,"resultList")]');
	if(results.length) {
		results.linkXPath = './div[@class="pub_details"]//li[@class="resultInfo"]/p//a';
		Z.debug("Using GNV");
		composeAttachment = composeAttachmentGNV;
		composeRisUrl = composeRisUrlGNV;
		return results;
	}
	
	/** TODO: **/
//	//19th century UK periodicals
//	results = ZU.xpath(doc, '//*[@id="content"]//table[@class="resultstable"]//tr[@class="selectedRow" or @class="unselectedRow"]');
//	if(results.length) {
//		results.linkXPath = './/b/a[contains(@href, "retrieve.do")]';
//		composeAttachment = composeAttachmentUKPC;
//		composeRisUrl = composeRisUrlUKPC;
//		return results;
//	}

	//Declassified Documents Reference System
	
	//"Full Citation" metadata:
	//  The Making of Modern Law (multiple)
	//  Sabin Americana 1500-1926
	
	//British Newspapers
	//Burney Collection Newspapers
	
	//Eighteenth Cnetury Collection Online
	//  works, but no PDFs
	
	//Biography in Context
	
	//Old InfoTrac ?? (various)
	
	return [];
}

function detectWeb(doc, url) {
	if(url.indexOf('/newspaperRetrieve.do') != -1) {
		return "newspaperArticle";
	}
	
	if(url.indexOf('/retrieve.do') != -1
		|| url.indexOf('/i.do') != -1
		|| url.indexOf('/infomark.do') != -1) {
		
		if(url.indexOf('/ecco/') != -1) return "book";
		
		return "journalArticle";
	}
	
	if(getSearchResults(doc).length) return "multiple";
}

var composeRisUrl;

function composeRisUrlGNV(url) {
	return url.replace(/#.*/,'').replace(/\/[^\/?]+(?=\?|$)/, '/centralizedGenerateCitation.do')
		.replace(/\bactionString=[^&]*&?/g, '').replace(/\bcitationFormat=[^&]*&?/g, '')
		+ '&actionString=FormatCitation&citationFormat=ENDNOTE';
}

function composeRisUrlGVRL(url) {
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

var composeAttachment;

function composeAttachmentGVRL(doc, url) {
	var pdf = !!(doc.getElementById('pdfLink') || doc.getElementById('docTools-pdf'));
	var attachment = ZU.xpath(doc, '//*[@id="docTools-download"]/a[./@href]')[0];
	if(attachment && pdf /* HTML currently pops up a download dialog for HTML attachments */) {
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
	return {
		url: url.replace(/#.*/,'').replace(/\/[^\/?]+(?=\?|$)/, '/downloadDocument.do')
			.replace(/\b(?:scale|orientation|docType|pageIndex|relatedDocId|isIllustration|imageId|aCmnd|recNum|pageRange|noOfPages)=[^&]*&?/g, '')
			+ '&scale=&orientation=&docType=&pageIndex=1&relatedDocId=&isIllustration=false'
			+ '&imageId=&aCmnd=PDFFormat&recNum=&' + 'noOfPages=' + numPages + '&pageRange=' + lowerLimit + '-' + upperLimit,
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
	//gale puts issue numbers in M1
	text = text.replace(/M1\s*\-/g, "IS  -");
	//L2 is probably meant to be UR, but we can ignore it altogether
	text = text.replace(/^L2\s+-.+\n/gm, '');
	//we can map copyright notes via CR
	text = text.replace(/^N1(?=\s+-\s+copyright)/igm, 'CR');
	//Z.debug(text);
	
	var translator = Zotero.loadTranslator("import");
	translator.setTranslator("32d59d2d-b65a-4da4-b0a3-bdd3cfb979e7");
	translator.setString(text);
	translator.setHandler("itemDone", function (obj, item) {
		if(attachment) item.attachments.push(attachment);
		item.complete();
	});
	translator.translate();
}

function processArticles(articles) {
	var article;
	while(article = articles.shift()) {
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
	if(detectWeb(doc, url) == "multiple") {
		var results = getSearchResults(doc);
		var items = {};
		for(var i=0, n=results.length; i<n; i++) {
			var link = ZU.xpath(results[i], results.linkXPath)[0];
			if(!link) continue;
			
			items[link.href] = ZU.trimInternal(link.textContent);
		}
		
		Zotero.selectItems(items, function (items) {
			if(!items) return true;
			
			var articles = [];
			for(var i in items) {
				articles.push(i);
			}
			processArticles(articles);
		});
	} else {
		if(doc.title.indexOf('NewsVault') != -1) {
			Z.debug("Using GNV");
			composeAttachment = composeAttachmentGNV;
			composeRisUrl = composeRisUrlGNV;
		} else if(doc.title.indexOf('The Times Digital Archive') != -1) {
			Z.debug("Using TDA");
			composeAttachment = composeAttachmentTDA;
			composeRisUrl = composeRisUrlTDA;
		} else {
			Z.debug("Using GVRL");
			composeAttachment = composeAttachmentGVRL;
			composeRisUrl = composeRisUrlGVRL;
		}
		
		processPage(doc, url);
	}
}
/** BEGIN TEST CASES **/
var testCases = []
/** END TEST CASES **/