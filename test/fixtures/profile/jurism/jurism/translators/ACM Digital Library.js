{
	"translatorID": "f3f092bf-ae09-4be6-8855-a22ddd817925",
	"label": "ACM Digital Library",
	"creator": "Guy Aglionby",
	"target": "^https://dl\\.acm\\.org/(doi|do|profile|toc|topic|keyword|action/doSearch|acmbooks|browse)",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2020-04-20 05:31:35"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2019 Guy Aglionby
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

// attr()/text() v2
// eslint-disable-next-line
function attr(docOrElem,selector,attr,index){var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector);return elem?elem.getAttribute(attr):null;}function text(docOrElem,selector,index){var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector);return elem?elem.textContent:null;}

function detectWeb(doc, url) {
	if (isContentUrl(url)) {
		let subtypeMatch = getItemSubtype(doc);
		if (!subtypeMatch) {
			return 'journalArticle';
		}
		let subtype = subtypeMatch[1].toLowerCase();

		if (subtype == 'conference') {
			return 'conferencePaper';
		}
		else if (subtype == 'journal' || subtype == 'periodical' || subtype == 'magazine' || subtype == 'newsletter') {
			return 'journalArticle';
		}
		else if (subtype == 'report' || subtype == 'rfc') {
			return 'report';
		}
		else if (subtype == 'thesis') {
			return 'thesis';
		}
		else if (subtype == 'software') {
			return 'computerProgram';
		}
		else if (subtype == 'dataset') {
			return 'document';
		}
		else if (subtype == 'book') {
			let bookTypeRegex = /page:string:([\w ]+)/;
			let extractedContext = attr(doc, 'meta[name=pbContext]', 'content');
			let bookType = extractedContext.match(bookTypeRegex);
			if (bookType && bookType[1].toLowerCase() == 'book page') {
				return 'book';
			}
			else {
				return 'bookSection';
			}
		}
		return 'journalArticle';
	}
	else if (getSearchResults(doc, false)) {
		return 'multiple';
	}
	return false;
}

function doWeb(doc, url) {
	if (detectWeb(doc, url) == 'multiple') {
		Zotero.selectItems(getSearchResults(doc), function (selected) {
			if (selected) {
				ZU.processDocuments(Object.keys(selected), scrape);
			}
		});
	}
	else {
		scrape(doc);
	}
}

function getItemSubtype(doc) {
	let extractedContext = attr(doc, 'meta[name=pbContext]', 'content');
	let subtypeRegex = /csubtype:string:(\w+)/;
	return extractedContext.match(subtypeRegex);
}

function isContentUrl(url) {
	return (url.includes('/doi/') || url.includes('/do/')) && !url.includes('/doi/proceedings');
}

function getSearchResults(doc, checkOnly) {
	let items = {};
	let found = false;
	let results = doc.querySelectorAll('h5.issue-item__title a');
	
	for (let i = 0; i < results.length; i++) {
		let url = results[i].href;
		let title = ZU.trimInternal(results[i].textContent);
		if (!title || !url) {
			continue;
		}
		
		if (!isContentUrl(url)) {
			continue;
		}
		
		if (checkOnly) {
			return true;
		}
		found = true;
		items[url] = title;
	}
	
	return found ? items : false;
}

function scrape(doc) {
	let doi = attr(doc, 'input[name=doiVal]', 'value');
	let lookupEndpoint = 'https://dl.acm.org/action/exportCiteProcCitation';
	let postBody = 'targetFile=custom-bibtex&format=bibTex&dois=' + encodeURIComponent(doi);
	
	ZU.doPost(lookupEndpoint, postBody, function (returnedText) {
		let json = JSON.parse(returnedText);
		let cslItem = json.items[0][doi];
		cslItem.type = cslItem.type.toLowerCase().replace('_', '-');
		
		// Some pages use ARTICLE rather than ARTICLE_JOURNAL
		// https://github.com/zotero/translators/issues/2162
		if (cslItem.type == 'article') {
			cslItem.type = 'article-journal';
		}
		else if (cslItem.type == 'thesis') {
			// The advisor is indicated as an editor in CSL which
			// ZU.itemFromCSLJSON incorrectly extracts as an author.
			delete cslItem.editor;
			// The (co-)chair(s) or supervisor(s) are included in CSL as additional authors.
			cslItem.author.splice(1);
		}
		
		let item = new Zotero.Item();
		ZU.itemFromCSLJSON(item, cslItem);
		
		let abstractElements = doc.querySelectorAll('div.article__abstract p, div.abstractSection p');
		let abstract = Array.from(abstractElements).map(x => x.textContent).join('\n\n');
		if (abstract.length && abstract.toLowerCase() != 'no abstract available.') {
			item.abstractNote = ZU.trimInternal(abstract);
		}
		
		let pdfElement = doc.querySelector('a[title=PDF]');
		if (pdfElement) {
			item.attachments.push({
				url: pdfElement.href,
				title: 'Full Text PDF',
				mimeType: 'application/pdf'
			});
		}
		
		if (item.itemType == 'journalArticle') {
			// Publication name in the CSL is shortened; scrape from page to get full title.
			let expandedTitle = text(doc, 'span.epub-section__title');
			if (expandedTitle) {
				item.journalAbbreviation = item.publicationTitle;
				item.publicationTitle = expandedTitle;
			}
			// Article number 46 --> pages = 46:1–46:22
			if (cslItem.number) {
				let number = cslItem.number.replace("Article", "").trim();
				if (item.pages) {
					item.pages = item.pages.split("–").map(x => number + ":" + x).join("–");
				}
				else {
					item.pages = number;
				}
			}
		}
		
		if (!item.creators.length) {
			// There are cases where authors are not included in the CSL
			// (for example, a chapter of a book) so we must scrape them.
			// e.g. https://dl.acm.org/doi/abs/10.5555/3336323.C5474411
			let authorElements = doc.querySelectorAll('div.citation span.loa__author-name');
			authorElements.forEach(function (element) {
				item.creators.push(ZU.cleanAuthor(element.textContent, 'author'));
			});
		}
		
		if (!item.ISBN && cslItem.ISBN) {
			let isbnLength = cslItem.ISBN.replace('-', '').length;
			let isbnText = 'ISBN-' + isbnLength + ': ' + cslItem.ISBN;
			item.extra = item.extra ? item.extra + '\n' + isbnText : isbnText;
		}
		
		let numPages = text(doc, 'div.pages-info span');
		if (numPages && !item.numPages) {
			item.numPages = numPages;
		}
		
		let tagElements = doc.querySelectorAll('div.tags-widget a');
		tagElements.forEach(function (tag) {
			item.tags.push(tag.textContent);
		});
		
		if (getItemSubtype(doc) == 'dataset') {
			item.extra = item.extra ? item.extra + '\nitemType: data' : 'itemType: data';
		}
		
		delete item.callNumber;
		
		item.complete();
	});
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://dl.acm.org/doi/abs/10.1145/1596655.1596682",
		"items": [
			{
				"itemType": "conferencePaper",
				"title": "Tracking performance across software revisions",
				"creators": [
					{
						"lastName": "Mostafa",
						"firstName": "Nagy",
						"creatorTypeID": 1,
						"creatorType": "author"
					},
					{
						"lastName": "Krintz",
						"firstName": "Chandra",
						"creatorTypeID": 1,
						"creatorType": "author"
					}
				],
				"date": "August 27, 2009",
				"DOI": "10.1145/1596655.1596682",
				"ISBN": "9781605585987",
				"abstractNote": "Repository-based revision control systems such as CVS, RCS, Subversion, and GIT, are extremely useful tools that enable software developers to concurrently modify source code, manage conflicting changes, and commit updates as new revisions. Such systems facilitate collaboration with and concurrent contribution to shared source code by large developer bases. In this work, we investigate a framework for \"performance-aware\" repository and revision control for Java programs. Our system automatically tracks behavioral differences across revisions to provide developers with feedback as to how their change impacts performance of the application. It does so as part of the repository commit process by profiling the performance of the program or component, and performing automatic analyses that identify differences in the dynamic behavior or performance between two code revisions. In this paper, we present our system that is based upon and extends prior work on calling context tree (CCT) profiling and performance differencing. Our framework couples the use of precise CCT information annotated with performance metrics and call-site information, with a simple tree comparison technique and novel heuristics that together target the cause of performance differences between code revisions without knowledge of program semantics. We evaluate the efficacy of the framework using a number of open source Java applications and present a case study in which we use the framework to distinguish two revisions of the popular FindBugs application.",
				"itemID": "10.1145/1596655.1596682",
				"libraryCatalog": "ACM Digital Library",
				"pages": "162–171",
				"place": "New York, NY, USA",
				"proceedingsTitle": "Proceedings of the 7th International Conference on Principles and Practice of Programming in Java",
				"publisher": "Association for Computing Machinery",
				"series": "PPPJ '09",
				"url": "https://doi.org/10.1145/1596655.1596682",
				"attachments": [
					{
						"title": "Full Text PDF",
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
		"url": "https://dl.acm.org/doi/10.5555/1717186",
		"items": [
			{
				"itemType": "book",
				"title": "Version Control with Git: Powerful Tools and Techniques for Collaborative Software Development",
				"creators": [
					{
						"lastName": "Loeliger",
						"firstName": "Jon",
						"creatorTypeID": 1,
						"creatorType": "author"
					}
				],
				"date": "2009",
				"ISBN": "9780596520120",
				"abstractNote": "Version Control with Git takes you step-by-step through ways to track, merge, and manage software projects, using this highly flexible, open source version control system. Git permits virtually an infinite variety of methods for development and collaboration. Created by Linus Torvalds to manage development of the Linux kernel, it's become the principal tool for distributed version control. But Git's flexibility also means that some users don't understand how to use it to their best advantage. Version Control with Git offers tutorials on the most effective ways to use it, as well as friendly yet rigorous advice to help you navigate Git's many functions. With this book, you will: Learn how to use Git in several real-world development environments Gain insight into Git's common-use cases, initial tasks, and basic functions Understand how to use Git for both centralized and distributed version control Use Git to manage patches, diffs, merges, and conflicts Acquire advanced techniques such as rebasing, hooks, and ways to handle submodules (subprojects) Learn how to use Git with Subversion Git has earned the respect of developers around the world. Find out how you can benefit from this amazing tool with Version Control with Git.",
				"edition": "1st",
				"itemID": "10.5555/1717186",
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
		"url": "https://dl.acm.org/doi/abs/10.1023/A:1008286901817",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Simulation Techniques for the Manufacturing Test of MCMs",
				"creators": [
					{
						"lastName": "Tegethoff",
						"firstName": "Mick",
						"creatorTypeID": 1,
						"creatorType": "author"
					},
					{
						"lastName": "Chen",
						"firstName": "Tom",
						"creatorTypeID": 1,
						"creatorType": "author"
					}
				],
				"date": "February 1, 1997",
				"DOI": "10.1023/A:1008286901817",
				"ISSN": "0923-8174",
				"abstractNote": "Simulation techniques used in the Manufacturing Test SIMulator (MTSIM) are described. MTSIM is a Concurrent Engineering tool used to simulate the manufacturing test and repair aspects of boards and MCMs from design concept through manufacturing release. MTSIM helps designers select assembly process, specify Design For Test (DFT) features, select board test coverage, specify ASIC defect level goals, establish product feasibility, and predict manufacturing quality and cost goals. A new yield model for boards and MCMs which accounts for the clustering of solder defects is introduced and used to predict the yield at each test step. In addition, MTSIM estimates the average number of defects per board detected at each test step, and estimates costs incurred in test execution, fault isolation and repair. MTSIM models were validated with high performance assemblies at Hewlett-Packard (HP).",
				"issue": "1-2",
				"itemID": "10.1023/A:1008286901817",
				"journalAbbreviation": "J. Electron. Test.",
				"libraryCatalog": "ACM Digital Library",
				"pages": "137–149",
				"publicationTitle": "Journal of Electronic Testing: Theory and Applications",
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
		"url": "https://dl.acm.org/doi/abs/10.1145/258948.258973",
		"items": [
			{
				"itemType": "conferencePaper",
				"title": "Functional reactive animation",
				"creators": [
					{
						"lastName": "Elliott",
						"firstName": "Conal",
						"creatorTypeID": 1,
						"creatorType": "author"
					},
					{
						"lastName": "Hudak",
						"firstName": "Paul",
						"creatorTypeID": 1,
						"creatorType": "author"
					}
				],
				"date": "August 1, 1997",
				"DOI": "10.1145/258948.258973",
				"ISBN": "9780897919180",
				"abstractNote": "Fran (Functional Reactive Animation) is a collection of data types and functions for composing richly interactive, multimedia animations. The key ideas in Fran are its notions of behaviors and events. Behaviors are time-varying, reactive values, while events are sets of arbitrarily complex conditions, carrying possibly rich information. Most traditional values can be treated as behaviors, and when images are thus treated, they become animations. Although these notions are captured as data types rather than a programming language, we provide them with a denotational semantics, including a proper treatment of real time, to guide reasoning and implementation. A method to effectively and efficiently perform event detection using interval analysis is also described, which relies on the partial information structure on the domain of event times. Fran has been implemented in Hugs, yielding surprisingly good performance for an interpreter-based system. Several examples are given, including the ability to describe physical phenomena involving gravity, springs, velocity, acceleration, etc. using ordinary differential equations.",
				"itemID": "10.1145/258948.258973",
				"libraryCatalog": "ACM Digital Library",
				"pages": "263–273",
				"place": "New York, NY, USA",
				"proceedingsTitle": "Proceedings of the second ACM SIGPLAN international conference on Functional programming",
				"publisher": "Association for Computing Machinery",
				"series": "ICFP '97",
				"url": "https://doi.org/10.1145/258948.258973",
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
	},
	{
		"type": "web",
		"url": "https://dl.acm.org/doi/abs/10.1145/2566617",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Check-ins in “Blau Space”: Applying Blau’s Macrosociological Theory to Foursquare Check-ins from New York City",
				"creators": [
					{
						"lastName": "Joseph",
						"firstName": "Kenneth",
						"creatorTypeID": 1,
						"creatorType": "author"
					},
					{
						"lastName": "Carley",
						"firstName": "Kathleen M.",
						"creatorTypeID": 1,
						"creatorType": "author"
					},
					{
						"lastName": "Hong",
						"firstName": "Jason I.",
						"creatorTypeID": 1,
						"creatorType": "author"
					}
				],
				"date": "September 18, 2014",
				"DOI": "10.1145/2566617",
				"ISSN": "2157-6904",
				"abstractNote": "Peter Blau was one of the first to define a latent social space and utilize it to provide concrete hypotheses. Blau defines social structure via social “parameters” (constraints). Actors that are closer together (more homogenous) in this social parameter space are more likely to interact. One of Blau’s most important hypotheses resulting from this work was that the consolidation of parameters could lead to isolated social groups. For example, the consolidation of race and income might lead to segregation. In the present work, we use Foursquare data from New York City to explore evidence of homogeneity along certain social parameters and consolidation that breeds social isolation in communities of locations checked in to by similar users. More specifically, we first test the extent to which communities detected via Latent Dirichlet Allocation are homogenous across a set of four social constraints—racial homophily, income homophily, personal interest homophily and physical space. Using a bootstrapping approach, we find that 14 (of 20) communities are statistically, and all but one qualitatively, homogenous along one of these social constraints, showing the relevance of Blau’s latent space model in venue communities determined via user check-in behavior. We then consider the extent to which communities with consolidated parameters, those homogenous on more than one parameter, represent socially isolated populations. We find communities homogenous on multiple parameters, including a homosexual community and a “hipster” community, that show support for Blau’s hypothesis that consolidation breeds social isolation. We consider these results in the context of mediated communication, in particular in the context of self-representation on social media.",
				"issue": "3",
				"itemID": "10.1145/2566617",
				"journalAbbreviation": "ACM Trans. Intell. Syst. Technol.",
				"libraryCatalog": "ACM Digital Library",
				"pages": "46:1–46:22",
				"publicationTitle": "ACM Transactions on Intelligent Systems and Technology",
				"shortTitle": "Check-ins in “Blau Space”",
				"url": "https://doi.org/10.1145/2566617",
				"volume": "5",
				"attachments": [
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					}
				],
				"tags": [
					{
						"tag": "Foursquare"
					},
					{
						"tag": "community structure"
					},
					{
						"tag": "latent social space"
					},
					{
						"tag": "urban analytics"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://dl.acm.org/doi/abs/10.5555/3336323.C5474411",
		"items": [
			{
				"itemType": "bookSection",
				"title": "2007--2016",
				"creators": [
					{
						"firstName": "Peter A.",
						"lastName": "Freeman",
						"creatorType": "author"
					},
					{
						"firstName": "W. Richards",
						"lastName": "Adrion",
						"creatorType": "author"
					},
					{
						"firstName": "William",
						"lastName": "Aspray",
						"creatorType": "author"
					}
				],
				"ISBN": "9781450372763",
				"abstractNote": "This organizational history relates the role of the National Science Foundation (NSF) in the development of modern computing. Drawing upon new and existing oral histories, extensive use of NSF documents, and the experience of two of the authors as senior managers, this book describes how NSF's programmatic activities originated and evolved to become the primary source of funding for fundamental research in computing and information technologies. The book traces how NSF's support has provided facilities and education for computing usage by all scientific disciplines, aided in institution and professional community building, supported fundamental research in computer science and allied disciplines, and led the efforts to broaden participation in computing by all segments of society. Today, the research and infrastructure facilitated by NSF computing programs are significant economic drivers of American society and industry. For example, NSF supported work that led to the first widelyused web browser, Netscape; sponsored the creation of algorithms at the core of the Google search engine; facilitated the growth of the public Internet; and funded research on the scientific basis for countless other applications and technologies. NSF has advanced the development of human capital and ideas for future advances in computing and its applications. This account is the first comprehensive coverage of NSF's role in the extraordinary growth and expansion of modern computing and its use. It will appeal to historians of computing, policy makers and leaders in government and academia, and individuals interested in the history and development of computing and the NSF.",
				"bookTitle": "Computing and the National Science Foundation, 1950--2016: Building a Foundation for Modern Computing",
				"itemID": "10.5555/3336323.C5474411",
				"libraryCatalog": "ACM Digital Library",
				"place": "New York, NY, USA",
				"publisher": "Association for Computing Machinery",
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
	},
	{
		"type": "web",
		"url": "https://dl.acm.org/doi/10.1145/3264631.3264634",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Beyond screen and voice: augmenting aural navigation with screenless access",
				"creators": [
					{
						"lastName": "Gross",
						"firstName": "Mikaylah",
						"creatorTypeID": 1,
						"creatorType": "author"
					},
					{
						"lastName": "Bolchini",
						"firstName": "Davide",
						"creatorTypeID": 1,
						"creatorType": "author"
					}
				],
				"date": "August 2, 2018",
				"DOI": "10.1145/3264631.3264634",
				"ISSN": "1558-2337",
				"abstractNote": "The current interaction paradigm to access the mobile web forces people who are blind to hold out their phone at all times, thus increasing the risk for the device to fall or be robbed. Moreover, such continuous, two-handed interaction on a small screen hampers the ability of people who are blind to keep their hands free to control aiding devices (e.g., cane) or touch objects nearby, especially on-the-go. To investigate alternative paradigms, we are exploring and reifying strategies for \"screenless access\": a browsing approach that enables users to interact touch-free with aural navigation architectures using one-handed, in-air gestures recognized by an off-the-shelf armband. In this article, we summarize key highlights from an exploratory study with ten participants who are blind or visually impaired who experienced our screenless access prototype. We observed proficient navigation performance after basic training, users conceptual fit with a screen-free paradigm, and low levels of cognitive load, notwithstanding the errors and limits of the design and system proposed. The full paper appeared in W4A2018 [1].",
				"issue": "121",
				"itemID": "10.1145/3264631.3264634",
				"journalAbbreviation": "SIGACCESS Access. Comput.",
				"libraryCatalog": "ACM Digital Library",
				"pages": "3:1",
				"publicationTitle": "ACM SIGACCESS Accessibility and Computing",
				"shortTitle": "Beyond screen and voice",
				"url": "https://doi.org/10.1145/3264631.3264634",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://dl.acm.org/doi/10.1145/2854146",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Why Google stores billions of lines of code in a single repository",
				"creators": [
					{
						"lastName": "Potvin",
						"firstName": "Rachel",
						"creatorTypeID": 1,
						"creatorType": "author"
					},
					{
						"lastName": "Levenberg",
						"firstName": "Josh",
						"creatorTypeID": 1,
						"creatorType": "author"
					}
				],
				"date": "June 24, 2016",
				"DOI": "10.1145/2854146",
				"ISSN": "0001-0782",
				"abstractNote": "Google's monolithic repository provides a common source of truth for tens of thousands of developers around the world.",
				"issue": "7",
				"itemID": "10.1145/2854146",
				"journalAbbreviation": "Commun. ACM",
				"libraryCatalog": "ACM Digital Library",
				"pages": "78–87",
				"publicationTitle": "Communications of the ACM",
				"url": "https://doi.org/10.1145/2854146",
				"volume": "59",
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
	},
	{
		"type": "web",
		"url": "https://dl.acm.org/doi/book/10.5555/1087674",
		"items": [
			{
				"itemType": "thesis",
				"title": "A \"void-trimming\" methodology of generating shrink-wrapped mesh for component-based complex \"dirty\" geometry",
				"creators": [
					{
						"lastName": "Yuan",
						"firstName": "Wei",
						"creatorTypeID": 1,
						"creatorType": "author"
					}
				],
				"date": "2005",
				"abstractNote": "The geometric surface model generated by common CAD tools is often “dirty” (cracks, small gaps, small holes, surface penetration, inconsistent surface orientation, bad edge-face connectivity, etc.). Also, problems of component overlapping, island components, and patch duplication exist in a component-based system. The process of traditional geometric healing and repairing methods is time-consuming (weeks or months), and often time fails when dealing with a complex “dirty” geometric model. In this dissertation, a new methodology based on “void volume trimming” is presented to resolve problems stated above. The meshing process starts from generating a Cartesian volume mesh using the 2 N tree (instead of the traditional Octree) data structure. With this structure, several mesh adaptation methods based on geometric features coupled with a smoothing algorithm between neighbor cells are developed to generate the preferred mesh sizes at desired regions while ensuring the gradual transition between dense and coarse meshes. In the process of constructing surface mesh for “dirty” geometric components, an effective “surface orientation free” algorithm is proposed. For resolving of “mesh leak” at cracks and small gap regions, the continuous “intersecting cell” set is used instead of geometric surfaces as the domain bound. The major contribution of this dissertation is the development of “void volume trimming” algorithm. With this methodology, the watertight feature can be promised, and the axis-aligned surface mesh is gradually adjusted to be geometric aligned while maintaining high mesh quality. Meanwhile, the surface mesh is pushed towards the geometry for satisfaction of mapping criteria. The constrained smoothing algorithm presented in this dissertation further improves the mesh quality while shrinking the surface mesh closer to geometry components. At the same time, the use of the SPP (Shortest Path Projection) algorithm coupled with the ADT (Alternating Digital Tree) data structure has been shown that it is efficient when generating body-fitted surface meshes for complex “dirty” geometries while maintaining high performance. The present critical feature preservation method has shown its capability of capturing the detailed features, while the introduced patch mapping method can topologically maintain the geometric model property. Case studies and application results have demonstrated that the current methodology is efficient for handling the component-based complex “dirty” geometric model.",
				"extra": "AAI3164056\nISBN-10: 0496987127",
				"itemID": "10.5555/1087674",
				"libraryCatalog": "ACM Digital Library",
				"numPages": "118",
				"place": "USA",
				"thesisType": "phd",
				"university": "University of Alabama in Huntsville",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://dl.acm.org/profile/81460641152/publications?Role=author",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://dl.acm.org/toc/interactions/2016/24/1",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://dl.acm.org/topic/ccs2012/10010147.10010341.10010342.10010343",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://dl.acm.org/doi/proceedings/10.1145/2342541",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://dl.acm.org/keyword/pesq",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://dl.acm.org/action/doSearch?AllField=Zotero",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://dl.acm.org/browse/book",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://dl.acm.org/subject/mobile",
		"items": "multiple"
	}
]
/** END TEST CASES **/
