{
	"translatorID": "8d72adbc-376c-4a33-b6be-730bc235190f",
	"label": "IEEE Computer Society",
	"creator": "Philipp Zumstein",
	"target": "^https?://(www[0-9]?|search[0-9]?)\\.computer\\.org/(csdl/(mags/[0-9a-z/]+|trans/[0-9a-z/]+|letters/[0-9a-z]+|proceedings/[0-9a-z/]+|doi|abs/proceedings)|search/results|portal/web/computingnow/.*content\\?)",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2017-06-07 18:52:06"
}

/*
	***** BEGIN LICENSE BLOCK *****
	
	Copyright © 2016 Philipp Zumstein
	
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


function detectWeb(doc, url) {
	//supports table of contents, seach results and single document pages
	if (url.indexOf("web/search?") > 1 || url.indexOf("index.html") > -1) {
		return "multiple";
	} else if (url.indexOf("/csdl/mags/") > 1) {
		return "magazineArticle";
	} else if (url.search(/\/portal\/web\/computingnow\/.*content/) > 1) {
		if (ZU.xpath(doc, '//li/a[contains(text(), "BibTex") and contains(@href, ".bib")]|//div[@id="bibText-content"]').length > 0) return "magazineArticle";
	} else if (url.indexOf("/csdl/trans/") > 1) {
		return "journalArticle";
	} else if (url.indexOf("/csdl/proceedings/") > 1) {
		return "conferencePaper";
	} else if (url.indexOf("/csdl/abs/proceedings/") > 1) {
		return "multiple";
	} else if (url.indexOf("/csdl/letters/") > 1) {
		return "journalArticle";
	} else if (url.indexOf("/portal/web/csdl/doi/") > 1) {
		var refWork = ZU.xpathText(doc, '//div[@id="refWorksText-content"]');
		if (refWork) refWork = refWork.substr(0, 9);
		else return false;
		if (refWork.indexOf("JOUR") > 1) return "journalArticle";
		else if (refWork.indexOf("MGZN") > 1) return "magazineArticle";
		else if (refWork.indexOf("CONF") > 1) return "conferencePaper";
		else return false;
	} else {
		return false;
	}
}

function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	//index pages
	var rows = ZU.xpath(doc, '//span[@class="tocLineItemTitle"]/a[not(contains(@href, ".pdf"))]');
	for (var i=0; i<rows.length; i++) {
		var href = rows[i].href;
		var title = ZU.trimInternal(rows[i].textContent);
		if (!href || !title) continue;
		if (checkOnly) return true;
		found = true;
		items[href] = title;
	}
	//search result pages
	rows = ZU.xpath(doc, '//div[@class="row"]');
	for (var i=0; i<rows.length; i++) {
		var href = ZU.xpathText(rows[i], './/a[contains(text(), "Abstract")]/@href');
		var title = ZU.xpathText(rows[i], './/span[contains(@class, "h4")]');
		if (!href || !title) continue;
		if (checkOnly) return true;
		found = true;
		items[href] = title;
	}
	return found ? items : false;
}


function doWeb(doc, url) {
	if (detectWeb(doc, url) == "multiple") {
		Zotero.selectItems(getSearchResults(doc, false), function (items) {
			if (!items) {
				return true;
			}
			var articles = [];
			for (var i in items) {
				articles.push(i);
			}
			ZU.processDocuments(articles, scrape);
		});
	} else {
		scrape(doc, url);
	}
}


function scrape(doc, url) {
	var bibtexlink = ZU.xpathText(doc, '//a[contains(text(), "BibTex") and contains(@href, "bibtex")]/@href');
	ZU.doGet(bibtexlink, function (text) {
		text = text.replace(/<br\/>/g,"");
		var translator = Zotero.loadTranslator("import");// BibTeX translator
		translator.setTranslator("9cb70025-a888-4a29-a210-93ec52da40d4");
		translator.setHandler("itemDone", function (obj, item) {
			if (item.DOI) item.DOI = item.DOI.replace(/^.*?10\./, "10.");
			finalize(doc, url, item);
			item.complete();
		});
		translator.setString(text);
		translator.translate();
	});
}


function finalize(doc, url, item) {
	item.itemType = detectWeb(doc, url);
	var title = ZU.xpathText(doc, '//div[@class="abstractTitle"]');
	
	//Sometimes the BibTeX does not contain the authors names and
	//then we have to try to extract this info from the website.
	if (item.creators.length == 0) {
		var authors = ZU.xpath(doc, '//div[@class="abstractTitle"]/following-sibling::div[@class="abstractAuthor"]/a');
		for (var i=0; i<authors.length; i++) {
			item.creators.push(ZU.cleanAuthor(authors[i].textContent, "author"));
		}
	}
	//Authors names in BibTeX are nonstandard and therefore
	//splitting into first and last name normally fails.
	//Moreover, ignore "undefined" authors
	var creators = [];
	for (var i=0; i<item.creators.length; i++) {
		if (item.creators[i].firstName=="") {
			if (item.creators[i].lastName!=="undefined") {
				creators.push(ZU.cleanAuthor(item.creators[i].lastName, item.creators[i].creatorType));
			}
			//delete the else cases
		} else {
			creators.push(item.creators[i]);
		}
	}
	item.creators = creators;
	//Adding abstract
	item.abstractNote = ZU.xpathText(doc, '//div[text()="ABSTRACT"]/following-sibling::div[1]');
	//Adding tags
	var keywordText = ZU.xpathText(doc, '//div[text()="INDEX TERMS"]/following-sibling::div[1]');
	if (keywordText) {
		keywordText = keywordText.replace(/,\s*$/, '');
		if (keywordText.indexOf(";")>-1) {
			item.tags = keywordText.split("; ");
		} else {
			item.tags = keywordText.split(", ");
		}
	}
	//Fixing undefined issue number from wrong BibTeX value "number = {undefined}"
	if (!item.issue || item.issue=="undefined") {
		var abstractText = ZU.xpathText(doc, '//div[@class="abstractTitle"]/following-sibling::div[contains(@class, "abstractText")]');
		var m = abstractText.match(/Issue No\. 0?(\d+)/);
		if (m) {
			item.issue = m[1];
		} else {
			delete item.issue;
		}
	}
	//Fixing wrong volume number from wrong BibTeX value "volume = {00}"
	if (item.volume=="00") {
		delete item.volume;
	}
	//Add isbn
	var isbn = ZU.xpathText(doc, '//div[@class="abstractText" and contains(text(), "ISBN:")]');
	if (!item.ISBN && isbn) {
		item.ISBN = isbn;
	}
	//Add attachments
	item.attachments.push({
		document: doc,
		mimeType: "text/html",
		title: "Snapshot"
	});
	var pdfurl = ZU.xpathText(doc, '//div[@class="panel-body"]//a[contains(text(), "PDF")]/@href');
	if (pdfurl) {
		item.attachments.push({
			url: pdfurl,
			mimeType: "application/pdf",
			title: "Full Text PDF"
		});
		
	} 
	
}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://www.computer.org/csdl/trans/ta/2012/01/tta2012010003-abs.html",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Guest Editorial: Special Section on Naturalistic Affect Resources for System Building and Evaluation",
				"creators": [
					{
						"firstName": "Bjorn",
						"lastName": "Schuller",
						"creatorType": "author"
					},
					{
						"firstName": "Ellen",
						"lastName": "Douglas-Cowie",
						"creatorType": "author"
					},
					{
						"firstName": "Anton",
						"lastName": "Batliner",
						"creatorType": "author"
					}
				],
				"date": "2012",
				"DOI": "10.1109/T-AFFC.2012.10",
				"ISSN": "1949-3045",
				"abstractNote": "The papers in this special section focus on the deployment of naturalistic affect resources for systems design and analysis.",
				"issue": "1",
				"itemID": "10.1109/T-AFFC.2012.10",
				"libraryCatalog": "IEEE Computer Society",
				"pages": "3-4",
				"publicationTitle": "IEEE Transactions on Affective Computing",
				"shortTitle": "Guest Editorial",
				"volume": "3",
				"attachments": [
					{
						"mimeType": "text/html",
						"title": "Snapshot"
					},
					{
						"mimeType": "application/pdf",
						"title": "Full Text PDF"
					}
				],
				"tags": [
					"Behavioral sciences",
					"Context awareness",
					"Cultural differences",
					"Emotion recognition",
					"Human factors",
					"Resource management",
					"Special issues and sections",
					"Speech processing",
					"System analysis and design"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.computer.org/csdl/letters/ca/2012/01/lca2012010001-abs.html",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "A Case for Hybrid Discrete-Continuous Architectures",
				"creators": [
					{
						"firstName": "Simha",
						"lastName": "Sethumadhavan",
						"creatorType": "author"
					},
					{
						"firstName": "Yannis",
						"lastName": "Tsividis",
						"creatorType": "author"
					},
					{
						"firstName": "Ryan",
						"lastName": "Roberts",
						"creatorType": "author"
					}
				],
				"date": "2011",
				"DOI": "10.1109/L-CA.2011.22",
				"ISSN": "1556-6056",
				"abstractNote": "Current technology trends indicate that power- and energyefficiency will limit chip throughput in the future. Current solutions to these problems, either in the way of programmable or fixed-function digital accelerators will soon reach their limits as microarchitectural overheads are successively trimmed. A significant departure from current computing methods is required to carry forward computing advances beyond digital accelerators. In this paper we describe how the energy-efficiency of a large class of problems can be improved by employing a hybrid of the discrete and continuous models of computation instead of the ubiquitous, traditional discrete model of computation. We present preliminary analysis of domains and benchmarks that can be accelerated with the new model. Analysis shows that machine learning, physics and up to one-third of SPEC, RMS and Berkeley suite of applications can be accelerated with the new hybrid model.",
				"issue": "1",
				"itemID": "10.1109/L-CA.2011.22",
				"libraryCatalog": "IEEE Computer Society",
				"pages": "1-4",
				"publicationTitle": "IEEE Computer Architecture Letters",
				"volume": "11",
				"attachments": [
					{
						"mimeType": "text/html",
						"title": "Snapshot"
					}
				],
				"tags": [
					"Design studies",
					"Hybrid systems"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.computer.org/csdl/mags/cg/2012/06/mcg2012060006-abs.html",
		"items": [
			{
				"itemType": "magazineArticle",
				"title": "Introducing Google Chart Tools and Google Maps API in Data Visualization Courses",
				"creators": [
					{
						"firstName": "Ying",
						"lastName": "Zhu",
						"creatorType": "author"
					}
				],
				"date": "2012",
				"ISSN": "0272-1716",
				"abstractNote": "This article reports the experience of using Google Chart Tools and Google Maps in a data visualization course at Georgia State University. These visualization toolkits have many benefits but haven't been widely used in such courses. Students found them easy to use for creating a variety of interactive data visualizations.",
				"issue": "6",
				"itemID": "10.1109/MCG.2012.114",
				"libraryCatalog": "IEEE Computer Society",
				"pages": "6-9",
				"publicationTitle": "IEEE Computer Graphics and Applications",
				"volume": "32",
				"attachments": [
					{
						"mimeType": "text/html",
						"title": "Snapshot"
					}
				],
				"tags": [
					"Data visualization",
					"Data visualization,visualization education",
					"Google",
					"Google Chart Tools",
					"Google Fusion Tables",
					"Google Maps API",
					"computer graphics",
					"data visualization",
					"processing"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.computer.org/csdl/trans/ta/2012/01/index.html",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://www.computer.org/csdl/proceedings/bibe/2010/4083/00/4083a001-abs.html",
		"items": [
			{
				"itemType": "conferencePaper",
				"title": "A Clustering Approach to Identify Intergenic Non-coding RNA in Mouse Macrophages",
				"creators": [
					{
						"firstName": "Lana X.",
						"lastName": "Garmire",
						"creatorType": "author"
					},
					{
						"firstName": "Shankar",
						"lastName": "Subramaniam",
						"creatorType": "author"
					},
					{
						"firstName": "David",
						"lastName": "Garmire",
						"creatorType": "author"
					},
					{
						"firstName": "Chris K.",
						"lastName": "Glass",
						"creatorType": "author"
					}
				],
				"date": "2010",
				"DOI": "10.1109/BIBE.2010.10",
				"ISBN": "9780769540832",
				"abstractNote": "We present a global clustering approach to identify putative intergenic non-coding RNAs based on the RNA polymerase II and Histone 3 lysine 4 trimethylation signatures. Both of these signatures are processed from the digital sequencing tags produced by chromatin immunoprecipitation, a high-throughput massively parallel sequencing (ChIP-Seq) technology. Our method compares favorably to the comparison method. We characterize the intergenic non-coding RNAs to have conservative promoters. We predict that these nc-RNAs are related to metabolic process without lipopolysaccharides (LPS) treatment, but shift towards developmental and immune-related functions with LPS treatment. We demonstrate that more intergenic nc-RNAs respond positively to LPS treatment, rather than negatively. Using QPCR, we experimentally validate 8 out of 11 nc-RNA regions respond to LPS treatment as predicted by the computational method.",
				"itemID": "10.1109/BIBE.2010.10",
				"libraryCatalog": "IEEE Computer Society",
				"pages": "1-6",
				"place": "Los Alamitos, CA, USA",
				"proceedingsTitle": "13th IEEE International Conference on BioInformatics and BioEngineering",
				"publisher": "IEEE Computer Society",
				"attachments": [
					{
						"mimeType": "text/html",
						"title": "Snapshot"
					}
				],
				"tags": [
					"ChIP-Seq",
					"RNA polymerase",
					"clustering",
					"macrophage",
					"non-coding RNA"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.computer.org/csdl/proceedings/bibe/2010/4083/00/index.html",
		"items": "multiple"
	}
]
/** END TEST CASES **/