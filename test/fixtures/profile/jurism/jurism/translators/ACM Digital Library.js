{
	"translatorID": "f3f092bf-ae09-4be6-8855-a22ddd817925",
	"label": "ACM Digital Library",
	"creator": "Simon Kornblith, Michael Berkowitz, John McCaffery, and Sebastian Karcher",
	"target": "^https?://([^/]+\\.)?dl\\.acm\\.org/(results|citation|author_page|ccs/ccs)\\.cfm",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2019-10-03 09:45:46"
}

/*
ACM Digital Library Translator
Copyright (C) 2011 Sebastian Karcher and CHNM

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program. If not, see <http://www.gnu.org/licenses/>.
*/


// attr()/text() v2
function attr(docOrElem,selector,attr,index){var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector);return elem?elem.getAttribute(attr):null;}function text(docOrElem,selector,index){var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector);return elem?elem.textContent:null;}


function detectWeb(doc, url) {
	if (url.includes("/results.cfm") || url.includes("/author_page.cfm") || url.includes("/ccs/ccs.cfm")) {
		return getSearchResults(doc, true) ? 'multiple' : false;
	} else if (url.includes("/citation.cfm")) {
		return getArticleType(doc);
	}
}

function doWeb(doc, url) {
	if (detectWeb(doc, url) == "multiple") {
		Zotero.selectItems(getSearchResults(doc), function (items) {
			if (!items) {
				return true;
			}
			
			var urls = [];
			for (var i in items) {
				urls.push(i);
			}
			ZU.processDocuments(urls, scrape);
		});
	} else {
		scrape(doc);
	}
}


function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;	
	var results = doc.querySelectorAll('div#results div.title>a[target="_self"], #toShowTop10 li>a');
	
	for (var i=0; i<results.length; i++) {
		var url = results[i].href;
		var title = ZU.trimInternal(results[i].textContent);
		if (!title || !url) continue;
		
		if (checkOnly) return true;
		found = true;
		
		url = url.replace(/#.*/, '')
			.replace(/([?&])preflayout=[^&]*/, '$1')
			+ '&preflayout=flat';
		items[url] = title;
	}
	
	return found ? items : false;
}


function scrape(doc) {
	var abs = text(doc, '#abstract');

	// Get genric URL, preferring the conference version.
	var url = ZU.xpath(doc, '//meta[@name="citation_conference"]\
			/following-sibling::meta[@name="citation_abstract_html_url"]/@content')[0]
		|| ZU.xpath(doc, '//meta[@name="citation_abstract_html_url"]/@content')[0];
	url = url.textContent;

	// Get item ID and parent ID
	// ID format in the url is id=<parentID>.<itemID> or id=<itemID>
	// Some items have no parent ID - set the parent ID for them to empty
	var m = url.match(/\bid=(?:(\d+)\.)?(\d+)/);
	var itemID = m[2];
	var parentID = m[1] || '';

	//compose bibtex URL
	var bibtexstring = 'id=' + itemID + '&parent_id=' + parentID + '&expformat=bibtex';
	var bibtexURL = url.replace(/dl[.-]acm[.-]org[^\/]*/, "dl.acm.org")  //deproxify the URL above.
		.replace(/citation\.cfm/, 'downformats.cfm')
		.replace(/([?&])id=[^&#]+/, '$1' + bibtexstring);
	// As of 10/2019, embedded URL can be HTTP even when page is served via HTTPS proxy
	if (bibtexURL.startsWith('http:') && doc.location.href.startsWith('https')) {
		Z.debug("Forcing BibTeX URL to HTTPS")
		bibtexURL = bibtexURL.replace(/^http:/, 'https:');
	}
	Zotero.debug('BibTeX URL: ' + bibtexURL);
	
	ZU.doGet(bibtexURL, function (text) {
		var translator = Zotero.loadTranslator("import");
		translator.setTranslator("9cb70025-a888-4a29-a210-93ec52da40d4");
		translator.setString(text);
		translator.setHandler("itemDone", function (obj, item) {
			//get the URL for the pdf fulltext from the metadata
			var pdfURL = ZU.xpath(doc, '//meta[@name="citation_pdf_url"]/@content')[0];
			if (pdfURL) {
				pdfURL = pdfURL.textContent.replace(/dl[.-]acm[.-]org[^\/]*/, "dl.acm.org"); //deproxify URL
				// As of 10/2019, embedded URL can be HTTP even when page is served via HTTPS proxy
				if (pdfURL.startsWith('http:') && doc.location.href.startsWith('https')) {
					Z.debug("Forcing PDF URL to HTTPS")
					pdfURL = pdfURL.replace(/^http:/, 'https:');
				}
				Z.debug("PDF URL: " + pdfURL);
				item.attachments = [{
					url: pdfURL,
					title: "ACM Full Text PDF",
					mimeType: "application/pdf"
				}];
			}
			
			//fix DOIs if they're in URL form
			if (item.DOI) item.DOI = item.DOI.replace(/^.*\/(10\.\d+\/)/, '$1');
			
			//Conference Locations shouldn't go int Loc in Archive (nor should anything else)
			delete item.archiveLocation;
			
			// some bibtext contains odd </kwd> tags - remove them
			for (var i=0; i<item.tags.length; i++) {
				item.tags[i] = item.tags[i].replace("</kwd>", "");
			}
			
			//full issues of journals/magazines don't have a title
			if (!item.title && text.includes("issue_date")) {
				var m = text.match(/issue_date\s*=\s*{(.*)},?/);
				item.itemType = "book";
				item.title = item.publicationTitle;
				if (m) {
					item.title = item.title + ", " + m[1];
				}
			}
			
			//The abstract from above or we try to make an individual request
			//e.g. for multiples
			if (!item.abstractNote) {
				if (abs && abs.trim()) {
					item.abstractNote = abs;
					item.complete();
				} else {
					ZU.doGet("https://dl.acm.org/tab_abstract.cfm?id="+itemID, function(abstract) {
						item.abstractNote = ZU.unescapeHTML(abstract);
						if (item.abstractNote.trim() == "An abstract is not available.") delete item.abstractNote;
						item.complete();
					});
				}
			} else {
				item.complete();
			}
			
		});
		translator.translate();
	});
}

//Simon's helper funcitons.
/**
 * Find out what kind of document this is by checking google metadata
 * @param doc The XML document describing the page
 * @return a string with either "journalArticle",  "conferencePaper", or "book" in it, depending on the type of document
 */

function getArticleType(doc) {
	var conference = ZU.xpathText(doc, '//meta[@name="citation_conference"][1]/@content');
	if (conference && conference.trim()) return "conferencePaper";
	
	var journal = ZU.xpathText(doc, '//meta[@name="citation_journal_title"][1]/@content');
	if (journal && journal.trim()) return "journalArticle";
	
	return "book";
}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://dl.acm.org/citation.cfm?id=1596682&preflayout=tabs",
		"defer": true,
		"items": [
			{
				"itemType": "conferencePaper",
				"title": "Tracking Performance Across Software Revisions",
				"creators": [
					{
						"firstName": "Nagy",
						"lastName": "Mostafa",
						"creatorType": "author"
					},
					{
						"firstName": "Chandra",
						"lastName": "Krintz",
						"creatorType": "author"
					}
				],
				"date": "2009",
				"DOI": "10.1145/1596655.1596682",
				"ISBN": "9781605585987",
				"abstractNote": "Repository-based revision control systems such as CVS, RCS, Subversion, and GIT, are extremely useful tools that enable software developers to concurrently modify source code, manage conflicting changes, and commit updates as new revisions. Such systems facilitate collaboration with and concurrent contribution to shared source code by large developer bases. In this work, we investigate a framework for \"performance-aware\" repository and revision control for Java programs. Our system automatically tracks behavioral differences across revisions to provide developers with feedback as to how their change impacts performance of the application. It does so as part of the repository commit process by profiling the performance of the program or component, and performing automatic analyses that identify differences in the dynamic behavior or performance between two code revisions. In this paper, we present our system that is based upon and extends prior work on calling context tree (CCT) profiling and performance differencing. Our framework couples the use of precise CCT information annotated with performance metrics and call-site information, with a simple tree comparison technique and novel heuristics that together target the cause of performance differences between code revisions without knowledge of program semantics. We evaluate the efficacy of the framework using a number of open source Java applications and present a case study in which we use the framework to distinguish two revisions of the popular FindBugs application.",
				"extra": "event-place: Calgary, Alberta, Canada",
				"itemID": "Mostafa:2009:TPA:1596655.1596682",
				"libraryCatalog": "ACM Digital Library",
				"pages": "162–171",
				"place": "New York, NY, USA",
				"proceedingsTitle": "Proceedings of the 7th International Conference on Principles and Practice of Programming in Java",
				"publisher": "ACM",
				"series": "PPPJ '09",
				"url": "http://doi.acm.org/10.1145/1596655.1596682",
				"attachments": [
					{
						"title": "ACM Full Text PDF",
						"mimeType": "application/pdf"
					}
				],
				"tags": [
					{
						"tag": "calling context tree"
					},
					{
						"tag": "performance-aware revision control"
					},
					{
						"tag": "profiling"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://dl.acm.org/citation.cfm?id=1717186&coll=DL&dl=GUIDE",
		"defer": true,
		"items": [
			{
				"itemType": "book",
				"title": "Version Control with Git: Powerful Tools and Techniques for Collaborative Software Development",
				"creators": [
					{
						"firstName": "Jon",
						"lastName": "Loeliger",
						"creatorType": "author"
					}
				],
				"date": "2009",
				"ISBN": "9780596520120",
				"abstractNote": "Version Control with Git takes you step-by-step through ways to track, merge, and manage software projects, using this highly flexible, open source version control system. Git permits virtually an infinite variety of methods for development and collaboration. Created by Linus Torvalds to manage development of the Linux kernel, it's become the principal tool for distributed version control. But Git's flexibility also means that some users don't understand how to use it to their best advantage. Version Control with Git offers tutorials on the most effective ways to use it, as well as friendly yet rigorous advice to help you navigate Git's many functions. With this book, you will: Learn how to use Git in several real-world development environments Gain insight into Git's common-use cases, initial tasks, and basic functions Understand how to use Git for both centralized and distributed version control Use Git to manage patches, diffs, merges, and conflicts Acquire advanced techniques such as rebasing, hooks, and ways to handle submodules (subprojects) Learn how to use Git with Subversion Git has earned the respect of developers around the world. Find out how you can benefit from this amazing tool with Version Control with Git.",
				"edition": "1st",
				"itemID": "Loeliger:2009:VCG:1717186",
				"libraryCatalog": "ACM Digital Library",
				"publisher": "O'Reilly Media, Inc.",
				"shortTitle": "Version Control with Git",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://dl.acm.org/citation.cfm?id=254650.257486&coll=DL&dl=GUIDE",
		"defer": true,
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Simulation Techniques for the Manufacturing Test of MCMs",
				"creators": [
					{
						"firstName": "Mick",
						"lastName": "Tegethoff",
						"creatorType": "author"
					},
					{
						"firstName": "Tom",
						"lastName": "Chen",
						"creatorType": "author"
					}
				],
				"date": "February 1997",
				"DOI": "10.1023/A:1008286901817",
				"ISSN": "0923-8174",
				"abstractNote": "Simulation techniques used in the Manufacturing Test SIMulator\n(MTSIM) are described. MTSIM is a Concurrent Engineering tool used to\nsimulate the manufacturing test and\nrepair aspects of boards and MCMs from design concept \nthrough manufacturing release. MTSIM helps designers select assembly\nprocess, specify Design For Test (DFT) features, select board test\ncoverage, specify ASIC defect level goals, establish product\nfeasibility, and predict manufacturing quality and cost goals. A new\nyield model for boards and MCMs which accounts for the\nclustering of solder defects is introduced and used to\npredict the yield at each test step. In addition, MTSIM\nestimates the average number of defects per board detected at each\ntest step, and estimates costs incurred in test execution, fault\nisolation and repair. MTSIM models were validated with\nhigh performance assemblies at Hewlett-Packard (HP).",
				"issue": "1-2",
				"itemID": "Tegethoff:1997:STM:254650.257486",
				"libraryCatalog": "ACM Digital Library",
				"pages": "137–149",
				"publicationTitle": "J. Electron. Test.",
				"url": "https://doi.org/10.1023/A:1008286901817",
				"volume": "10",
				"attachments": [],
				"tags": [
					{
						"tag": "DFM"
					},
					{
						"tag": "DFT"
					},
					{
						"tag": "MCM"
					},
					{
						"tag": "SMT"
					},
					{
						"tag": "board"
					},
					{
						"tag": "simulation"
					},
					{
						"tag": "test"
					},
					{
						"tag": "yield"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://dl.acm.org/citation.cfm?id=258948.258973&coll=DL&dl=ACM",
		"defer": true,
		"items": [
			{
				"itemType": "conferencePaper",
				"title": "Functional Reactive Animation",
				"creators": [
					{
						"firstName": "Conal",
						"lastName": "Elliott",
						"creatorType": "author"
					},
					{
						"firstName": "Paul",
						"lastName": "Hudak",
						"creatorType": "author"
					}
				],
				"date": "1997",
				"DOI": "10.1145/258948.258973",
				"ISBN": "9780897919180",
				"abstractNote": "Fran (Functional Reactive Animation) is a collection of data types and functions for composing richly interactive, multimedia animations. The key ideas in Fran are its notions of behaviors and events. Behaviors are time-varying, reactive values, while events are sets of arbitrarily complex conditions, carrying possibly rich information. Most traditional values can be treated as behaviors, and when images are thus treated, they become animations. Although these notions are captured as data types rather than a programming language, we provide them with a denotational semantics, including a proper treatment of real time, to guide reasoning and implementation. A method to effectively and efficiently perform event detection using interval analysis is also described, which relies on the partial information structure on the domain of event times. Fran has been implemented in Hugs, yielding surprisingly good performance for an interpreter-based system. Several examples are given, including the ability to describe physical phenomena involving gravity, springs, velocity, acceleration, etc. using ordinary differential equations.",
				"extra": "event-place: Amsterdam, The Netherlands",
				"itemID": "Elliott:1997:FRA:258948.258973",
				"libraryCatalog": "ACM Digital Library",
				"pages": "263–273",
				"place": "New York, NY, USA",
				"proceedingsTitle": "Proceedings of the Second ACM SIGPLAN International Conference on Functional Programming",
				"publisher": "ACM",
				"series": "ICFP '97",
				"url": "http://doi.acm.org/10.1145/258948.258973",
				"attachments": [
					{
						"title": "ACM Full Text PDF",
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
		"url": "http://dl.acm.org/citation.cfm?id=2566617",
		"defer": true,
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Check-ins in “Blau Space”: Applying Blau’s Macrosociological Theory to Foursquare Check-ins from New York City",
				"creators": [
					{
						"firstName": "Kenneth",
						"lastName": "Joseph",
						"creatorType": "author"
					},
					{
						"firstName": "Kathleen M.",
						"lastName": "Carley",
						"creatorType": "author"
					},
					{
						"firstName": "Jason I.",
						"lastName": "Hong",
						"creatorType": "author"
					}
				],
				"date": "September 2014",
				"DOI": "10.1145/2566617",
				"ISSN": "2157-6904",
				"abstractNote": "Peter Blau was one of the first to define a latent social space and utilize it to provide concrete hypotheses. Blau defines social structure via social “parameters” (constraints). Actors that are closer together (more homogenous) in this social parameter space are more likely to interact. One of Blau’s most important hypotheses resulting from this work was that the consolidation of parameters could lead to isolated social groups. For example, the consolidation of race and income might lead to segregation. In the present work, we use Foursquare data from New York City to explore evidence of homogeneity along certain social parameters and consolidation that breeds social isolation in communities of locations checked in to by similar users. More specifically, we first test the extent to which communities detected via Latent Dirichlet Allocation are homogenous across a set of four social constraints—racial homophily, income homophily, personal interest homophily and physical space. Using a bootstrapping approach, we find that 14 (of 20) communities are statistically, and all but one qualitatively, homogenous along one of these social constraints, showing the relevance of Blau’s latent space model in venue communities determined via user check-in behavior. We then consider the extent to which communities with consolidated parameters, those homogenous on more than one parameter, represent socially isolated populations. We find communities homogenous on multiple parameters, including a homosexual community and a “hipster” community, that show support for Blau’s hypothesis that consolidation breeds social isolation. We consider these results in the context of mediated communication, in particular in the context of self-representation on social media.",
				"issue": "3",
				"itemID": "Joseph:2014:CLS:2648782.2566617",
				"libraryCatalog": "ACM Digital Library",
				"pages": "46:1–46:22",
				"publicationTitle": "ACM Trans. Intell. Syst. Technol.",
				"shortTitle": "Check-ins in “Blau Space”",
				"url": "http://doi.acm.org/10.1145/2566617",
				"volume": "5",
				"attachments": [
					{
						"title": "ACM Full Text PDF",
						"mimeType": "application/pdf"
					}
				],
				"tags": [
					"Foursquare",
					"community structure",
					"latent social space",
					"urban analytics"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://dl.acm.org/author_page.cfm?id=81100246710",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://dl.acm.org/citation.cfm?id=3029062",
		"items": [
			{
				"itemType": "book",
				"title": "interactions, January - February 2017",
				"creators": [
					{
						"firstName": "Ron",
						"lastName": "Wakkary",
						"creatorType": "editor"
					},
					{
						"firstName": "Erik",
						"lastName": "Stolterman",
						"creatorType": "editor"
					}
				],
				"date": "2016",
				"itemID": "Wakkary:2016:3029062",
				"libraryCatalog": "ACM Digital Library",
				"place": "New York, NY, USA",
				"publisher": "ACM",
				"volume": "24",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://dl.acm.org/ccs/ccs.cfm?id=10010343&lid=0.10010147.10010341.10010342.10010343",
		"items": "multiple"
	}
]
/** END TEST CASES **/
