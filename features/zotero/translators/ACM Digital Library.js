{
	"translatorID": "f3f092bf-ae09-4be6-8855-a22ddd817925",
	"label": "ACM Digital Library",
	"creator": "Simon Kornblith, Michael Berkowitz, John McCaffery, and Sebastian Karcher",
	"target": "^https?://[^/]*dl\\.acm\\.org[^/]*/(?:results\\.cfm|citation\\.cfm)",
	"minVersion": "1.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsbv",
	"lastUpdated": "2013-12-03 22:31:52"
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
function detectWeb(doc, url) {
	if (url.indexOf("/results.cfm") != -1) {
		//Zotero.debug("Multiple items detected");
		return "multiple";
	} else if (url.indexOf("/citation.cfm") != -1) {
		//Zotero.debug("Single item detected");
		return getArticleType(doc, url);

	}
}



function doWeb(doc, url) {
	var URIs = new Array();
	var items = new Object();
	if (detectWeb(doc, url) == "multiple") {

		var xpath = '//tr/td/a[@target="_self"]';
		var articles = doc.evaluate(xpath, doc, null, XPathResult.ANY_TYPE, null);
		var next_art = articles.iterateNext();
		while (next_art) {
			items[next_art.href] = next_art.textContent;
			next_art = articles.iterateNext();
		}

		Zotero.selectItems(items, function (items) {
			if (!items) {
				return true;
			}
			for (var i in items) {
				i = i.replace(/\&preflayout\=(tabs|flat)/, "") + "&preflayout=flat"
				//Z.debug(i)
				URIs.push(i);
			}
			Zotero.Utilities.processDocuments(URIs, scrape, function () {
				Zotero.done();
			});

			Zotero.wait();
		});
	} else {
		var newURL;
		newURL = url.replace(/\&preflayout\=(tabs|flat)/, "") + "&preflayout=flat"
		//Z.debug(newURL);
		scrape(doc, newURL);
	}
}
//get abstract where possible - this fails frequently

function scrape(doc) {
	var xpath = '//div/div[@style="display:inline"]';
	var abs = getText(xpath, doc);

	//get genric URL, preferring the conference version.
	var url = getText('//meta[@name="citation_conference"]/following-sibling::meta[@name="citation_abstract_html_url"]/@content', doc) || getText('//meta[@name="citation_abstract_html_url"]/@content', doc);
	//Zotero.debug('generic URL: ' + url);
	var matchtest = url.match(/[0-9]+\.[0-9]+/);

	//get item ID and parent ID
	//Some items have no parent ID - set the parent ID for them to empty
	if (url.match(/[0-9]+\.[0-9]/) != null) {
		var itemid = String(url.match(/\.[0-9]+/)).replace(/\./, '');
		var parentid = String(url.match(/id\=[0-9]+/)).replace(/id\=/, "");
	} else {
		var itemid = String(url.match(/id\=[0-9]+/)).replace(/id\=/, "");
		var parentid = "";
	}

	//compose bibtex URL
	var bibtexstring = 'id=' + itemid + '&parent_id=' + parentid + '&expformat=bibtex';
	var bibtexURL = url.replace(/citation\.cfm/, "exportformats.cfm").replace(/id\=.+/, bibtexstring);
	Zotero.debug('bibtex URL: ' + bibtexURL);
	Zotero.Utilities.HTTP.doGet(bibtexURL, function (text) {
		// If we can find an @inproceedings, prefer that.  Papers that have both
		// @inproceedings and @article are conference papers that also appear in
		// newsletters.  We should prefer the conference proceedings version.
		var inproceedingsIndex = text.toLowerCase().indexOf('@inproceedings');
		if (inproceedingsIndex != -1) {
			var ts = text.substring(inproceedingsIndex);
			text = ts.substring(0, ts.toLowerCase().indexOf('</pre>'));
		}
		var translator = Zotero.loadTranslator("import");
		var haveImported = false;
		translator.setTranslator("9cb70025-a888-4a29-a210-93ec52da40d4");
		translator.setString(text);
		//Zotero.debug('bibtex data: ' + text);
		translator.setHandler("itemDone", function (obj, item) {
			// Only return one item
			if (haveImported) return;
			//get the URL for the pdf fulltext from the metadata
			var pdfURL = getText('//meta[@name="citation_pdf_url"]/@content', doc);
			item.attachments = [{
				url: pdfURL,
				title: "ACM Full Text PDF",
				mimeType: "application/pdf"
			}];
			//fix DOIs if they're in URL form
			if (item.DOI) item.DOI = item.DOI.replace(/^.*\/10\./, "10.");
			//The Abstract from above - may or may not work
			if (abs) item.abstractNote = abs;
			//Conference Locations shouldn't go int Loc in Archive (nor should anything else)
			item.archiveLocation = "";
			// some bibtext contains odd </kwd> tags - remove them
			for(var i=0; i<item.tags.length; i++) {
				item.tags[i] = item.tags[i].replace("</kwd>", "");
			}
			item.complete();
			haveImported = true;
		});
		translator.translate();
	});
}

//Simon's helper funcitons.
/**
 * Find out what kind of document this is by checking google metadata
 * @param doc The XML document describing the page
 * @param url The URL of the page being scanned
 * @param nsResolver the namespace resolver function
 * @return a string with either "multiple", "journalArticle",  "conferencePaper", or "book" in it, depending on the type of document
 */

function getArticleType(doc, url) {
	//var toc = doc.evaluate(tocX, doc, null, XPathResult.ANY_TYPE, null).iterateNext();
	if (url.indexOf("results.cfm") != -1) {
		//Zotero.debug("Type: multiple");
		return "multiple";
	}

	var conference = getText('//meta[@name="citation_conference"]/@content', doc);
	var journal = getText('//meta[@name="citation_journal_title"]/@content', doc);
	//Zotero.debug(conference);
	if (conference.trim()) return "conferencePaper";
	else if (journal.trim()) return "journalArticle";
	else return "book";

}

/**
 * Get the text from the first node defined by the given xPathString
 * @param pathString the XPath indicating which node to get the text from
 * @param doc The XML document describing the page
 * @param nsResolver the namespace resolver function
 * @return the text in the defined node or "Unable to scrape text" if the node was not found or if there was no text content
 */

function getText(pathString, doc) {
	var path = doc.evaluate(pathString, doc, null, XPathResult.ANY_TYPE, null);
	var node = path.iterateNext();

	if (node == null || node.textContent == undefined || node.textContent == null) {
		//Zotero.debug("Unable to retrieve text for XPath: " + pathString);
		return "";
	}

	return node.textContent;
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://dl.acm.org/citation.cfm?id=1596682&preflayout=tabs",
		"items": [
			{
				"itemType": "conferencePaper",
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
				"notes": [],
				"tags": [
					"calling context tree",
					"performance-aware revision control",
					"profiling"
				],
				"seeAlso": [],
				"attachments": [
					{
						"title": "ACM Full Text PDF",
						"mimeType": "application/pdf"
					}
				],
				"series": "PPPJ '09",
				"ISBN": "978-1-60558-598-7",
				"url": "http://doi.acm.org/10.1145/1596655.1596682",
				"DOI": "10.1145/1596655.1596682",
				"place": "New York, NY, USA",
				"abstractNote": "Repository-based revision control systems such as CVS, RCS, Subversion, and GIT, are extremely useful tools that enable software developers to concurrently modify source code, manage conflicting changes, and commit updates as new revisions. Such systems facilitate collaboration with and concurrent contribution to shared source code by large developer bases. In this work, we investigate a framework for \"performance-aware\" repository and revision control for Java programs. Our system automatically tracks behavioral differences across revisions to provide developers with feedback as to how their change impacts performance of the application. It does so as part of the repository commit process by profiling the performance of the program or component, and performing automatic analyses that identify differences in the dynamic behavior or performance between two code revisions. In this paper, we present our system that is based upon and extends prior work on calling context tree (CCT) profiling and performance differencing. Our framework couples the use of precise CCT information annotated with performance metrics and call-site information, with a simple tree comparison technique and novel heuristics that together target the cause of performance differences between code revisions without knowledge of program semantics. We evaluate the efficacy of the framework using a number of open source Java applications and present a case study in which we use the framework to distinguish two revisions of the popular FindBugs application.",
				"libraryCatalog": "ACM Digital Library",
				"title": "Tracking Performance Across Software Revisions",
				"proceedingsTitle": "Proceedings of the 7th International Conference on Principles and Practice of Programming in Java",
				"date": "2009",
				"pages": "162–171",
				"publisher": "ACM",
				"itemID": "Mostafa:2009:TPA:1596655.1596682"
			}
		],
		"defer": true
	},
	{
		"type": "web",
		"url": "http://dl.acm.org/citation.cfm?id=1717186&coll=DL&dl=GUIDE",
		"items": [
			{
				"itemType": "book",
				"creators": [
					{
						"firstName": "Jon",
						"lastName": "Loeliger",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"url": "",
						"title": "ACM Full Text PDF",
						"mimeType": "application/pdf"
					}
				],
				"ISBN": "0596520123, 9780596520120",
				"edition": "1st",
				"abstractNote": "Version Control with Git takes you step-by-step through ways to track, merge, and manage software projects, using this highly flexible, open source version control system. Git permits virtually an infinite variety of methods for development and collaboration. Created by Linus Torvalds to manage development of the Linux kernel, it's become the principal tool for distributed version control. But Git's flexibility also means that some users don't understand how to use it to their best advantage. Version Control with Git offers tutorials on the most effective ways to use it, as well as friendly yet rigorous advice to help you navigate Git's many functions. With this book, you will: Learn how to use Git in several real-world development environments Gain insight into Git's common-use cases, initial tasks, and basic functions Understand how to use Git for both centralized and distributed version control Use Git to manage patches, diffs, merges, and conflicts Acquire advanced techniques such as rebasing, hooks, and ways to handle submodules (subprojects) Learn how to use Git with Subversion Git has earned the respect of developers around the world. Find out how you can benefit from this amazing tool with Version Control with Git.",
				"libraryCatalog": "ACM Digital Library",
				"shortTitle": "Version Control with Git",
				"title": "Version Control with Git: Powerful Tools and Techniques for Collaborative Software Development",
				"date": "2009",
				"publisher": "O'Reilly Media, Inc.",
				"itemID": "Loeliger:2009:VCG:1717186"
			}
		],
		"defer": true
	},
	{
		"type": "web",
		"url": "http://dl.acm.org/citation.cfm?id=254650.257486&coll=DL&dl=GUIDE",
		"items": [
			{
				"itemType": "journalArticle",
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
				"notes": [],
				"tags": [
					"DFM",
					"DFT",
					"MCM",
					"SMT",
					"board",
					"simulation",
					"test",
					"yield"
				],
				"seeAlso": [],
				"attachments": [
					{
						"url": "",
						"title": "ACM Full Text PDF",
						"mimeType": "application/pdf"
					}
				],
				"itemID": "Tegethoff:1997:STM:254650.257486",
				"title": "Simulation Techniques for the Manufacturing Test of MCMs",
				"publicationTitle": "J. Electron. Test.",
				"volume": "10",
				"issue": "1-2",
				"date": "February 1997",
				"ISSN": "0923-8174",
				"pages": "137–149",
				"url": "http://dx.doi.org/10.1023/A:1008286901817",
				"DOI": "10.1023/A:1008286901817",
				"abstractNote": "Simulation techniques used in the Manufacturing Test SIMulator\n(MTSIM) are described. MTSIM is a Concurrent Engineering tool used to\nsimulate the manufacturing test and\nrepair aspects of boards and MCMs from design concept \nthrough manufacturing release. MTSIM helps designers select assembly\nprocess, specify Design For Test (DFT) features, select board test\ncoverage, specify ASIC defect level goals, establish product\nfeasibility, and predict manufacturing quality and cost goals. A new\nyield model for boards and MCMs which accounts for the\nclustering of solder defects is introduced and used to\npredict the yield at each test step. In addition, MTSIM\nestimates the average number of defects per board detected at each\ntest step, and estimates costs incurred in test execution, fault\nisolation and repair. MTSIM models were validated with\nhigh performance assemblies at Hewlett-Packard (HP).",
				"libraryCatalog": "ACM Digital Library"
			}
		]
	},
	{
		"type": "web",
		"url": "http://dl.acm.org/citation.cfm?id=258948.258973&coll=DL&dl=ACM",
		"items": [
			{
				"itemType": "conferencePaper",
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
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "ACM Full Text PDF",
						"mimeType": "application/pdf"
					}
				],
				"series": "ICFP '97",
				"ISBN": "0-89791-918-1",
				"url": "http://doi.acm.org/10.1145/258948.258973",
				"DOI": "10.1145/258948.258973",
				"place": "New York, NY, USA",
				"abstractNote": "Fran (Functional Reactive Animation) is a collection of data types and functions for composing richly interactive, multimedia animations. The key ideas in Fran are its notions of behaviors and events. Behaviors are time-varying, reactive values, while events are sets of arbitrarily complex conditions, carrying possibly rich information. Most traditional values can be treated as behaviors, and when images are thus treated, they become animations. Although these notions are captured as data types rather than a programming language, we provide them with a denotational semantics, including a proper treatment of real time, to guide reasoning and implementation. A method to effectively and efficiently perform event detection using interval analysis is also described, which relies on the partial information structure on the domain of event times. Fran has been implemented in Hugs, yielding surprisingly good performance for an interpreter-based system. Several examples are given, including the ability to describe physical phenomena involving gravity, springs, velocity, acceleration, etc. using ordinary differential equations.",
				"libraryCatalog": "ACM Digital Library",
				"title": "Functional Reactive Animation",
				"proceedingsTitle": "Proceedings of the Second ACM SIGPLAN International Conference on Functional Programming",
				"date": "1997",
				"pages": "263–273",
				"publisher": "ACM",
				"itemID": "Elliott:1997:FRA:258948.258973"
			}
		],
		"defer": true
	}
]
/** END TEST CASES **/
