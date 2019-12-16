{
	"translatorID": "558babe7-5fca-47ea-af0f-2d9bb5bc5e53",
	"label": "Theory of Computing",
	"creator": "Piyush Srivastava",
	"target": "^https?://(theoryofcomputing\\.org|toc\\.cse\\.iitk\\.ac\\.in|www\\.cims\\.nyu\\.edu/~regev/toc|toc\\.ilab\\.sztaki\\.hu|toc\\.nada\\.kth\\.se|tocmirror\\.cs\\.tau\\.ac\\.il)/articles/[vg].*(/|html?)$",
	"minVersion": "1.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcv",
	"lastUpdated": "2019-06-10 22:52:50"
}

/*
   Copyright 2013, Piyush Srivastava.

   This program is free software: you can redistribute it and/or modify it
   under the terms of the GNU Affero General Public License as published by the
   Free Software Foundation, either version 3 of the License, or (at your
   option) any later version.

   This program is distributed in the hope that it will be useful, but WITHOUT
   ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
   FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public License
   for more details.

   You should have received a copy of the GNU Affero General Public License
   along with this program.  If not, see <http://www.gnu.org/licenses/>.

*/


/*
  Theory of Computing translator
  *****************************


 The Theory of Computing journal has mirror sites located at the following
 domains:

 1) theoryofcomputing.org
 2) toc.cse.iitk.ac.in
 3) toc.nada.kth.se
 4) toc.ilab.sztaki.hu
 5) tocmirror.cs.tau.ac.il
 6) www.cims.nyu.edu/~regev/toc/

 It has two kinds of articles, "Graduate Surveys", which their provided BibTeX
 classes regard as "books" and regular "Journal Articles".  The structure of the
 URL for the graduate survey looks like

 DOMAIN/articles/gs[0-9]{3}/

 while that of the articles looks like

 DOMAIN/articles/v[0-9]{3}a{0-9]{3}/.

 These formats are used by detectWeb to find out whether we are looking at a
 graduate survey ("Book") or a journal article.

 The theory of computing journal provides the PDF file for a given article (say
 gs001) at the url DOMAIN/article/gs001/gs001.pdf.

*/


// A Regexp for extracting the Domain

var surveyRegexp = new RegExp("articles/(gs[^/]+)");
var journalRegexp = new RegExp("articles/(v[^/]+)");

function detectWeb(doc, url) {
	if (surveyRegexp.test(url)) return "book";
	else return "journalArticle";
}

function doWeb(doc, url) {
	var typeRegExp;
	var type = detectWeb(doc, url);

	// Select the right regexp according to the article type
	if (type == "journalArticle") typeRegExp = journalRegexp;
	else typeRegExp = surveyRegexp;

	var urlData = typeRegExp.exec(url);
	// urlData is an Array of three elements, with the element at index 1 containg the
	// base domain of the mirror being accesses, and the element at index 2
	// containing the article ID.

	var articleID = urlData[1];

	// We now start constructing the Zoetro item
	var newItem = new Zotero.Item(type);

	// Store the snapshot and the PDF file
	newItem.attachments.push({
		title: "Theory of Computing Snapshot", document: doc
	});
	var pdfLink = articleID + ".pdf";
	newItem.attachments.push({
		title: "Theory of computing Full Text PDF",
		mimeType: "application/pdf",
		url: pdfLink
	});

	// Get the article topLine
	var topLine = ZU.xpathText(doc, '//div[@id="articletopline"]');

	// Get the article publication date lines
	var pubDateLines = ZU.xpathText(doc, '//div[@id="articledates"]');

	// Get the article copyright line (to determine authors)
	// This seems the most consistent way of determining the authors for this
	// journal.
	var authorLine = ZU.xpathText(doc, '//div[@id="copyright"]/a[1]');

	var keywordLine = ZU.xpathText(doc, '(//div[@class="hang"])[3]');

	var DOI = ZU.xpathText(doc, '//div[@id="doi"]');

	// Now start filling up data
	// Title
	var title = ZU.xpathText(doc, '//div[@id="articletitle"]');
	if (!title) title = ZU.xpathText(doc, '//div[@id="title"]');
	newItem.title = title;

	// DOI and URL
	newItem.DOI = ZU.cleanDOI(DOI);
	newItem.url = url;

	// Publcication date line
	if (pubDateLines) {
		var pubDateRegexp = /Published:\s+(\w+\s+[0-9]+(?:,|\s)+[0-9]+)/gm;
		newItem.date = pubDateRegexp.exec(pubDateLines)[1];

		// This also contain page information for surveys
		if (type == "book") {
			var pageNum = /([0-9]+)\s+pages/.exec(pubDateLines)[1];
			newItem.numPages = pageNum;
		}
	}

	// Keywords
	if (keywordLine) {
		let keywords = ZU.trimInternal(/Keywords:\s+(.*)/.exec(keywordLine)[1]);
		let keywordList = keywords.split(/,\s+/);
		newItem.tags = keywordList;
	}

	// Author
	if (authorLine) {
		authorLine = ZU.trimInternal(authorLine);
		let authors = /[^0-9]+[0-9]+\s+(.*)/.exec(authorLine)[1];
		authors = authors.replace(/,?\s+and\s+/, ", ");
		let authorList = authors.split(/\s*,\s+/);
		for (let author in authorList) {
			newItem.creators.push(ZU.cleanAuthor(authorList[author], "author"));
		}
	}

	// Article number etc.
	if (topLine) {
		topLine = ZU.trimInternal(topLine);
		if (type == "book") {
			let number = /Graduate Surveys\s+([0-9]+)/.exec(topLine)[1];
			newItem.seriesNumber = number;
		}
		else if (type == "journalArticle") {
			let volumeData = /Volume\s+([0-9]+).*Article\s+([0-9]+)\s+pp\.\s+([0-9]+)-([0-9]+)/.exec(topLine);
			newItem.volume = volumeData[1];
			newItem.number = volumeData[2];
			newItem.pages = volumeData[3] + "–" + volumeData[4];
		}
	}

	// Format specific data
	if (type == "book") {
		newItem.series = "Graduate Surveys";
		newItem.publisher = "Theory of Computing Library";
	}

	if (type == "journalArticle") {
		newItem.publicationTitle = "Theory of Computing";
		newItem.publisher = "Theory of Computing";
	}

	newItem.complete();
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://theoryofcomputing.org/articles/gs004/",
		"items": [
			{
				"itemType": "book",
				"title": "Variations on the Sensitivity Conjecture",
				"creators": [
					{
						"firstName": "Pooya",
						"lastName": "Hatami",
						"creatorType": "author"
					},
					{
						"firstName": "Raghav",
						"lastName": "Kulkarni",
						"creatorType": "author"
					},
					{
						"firstName": "Denis",
						"lastName": "Pankratov",
						"creatorType": "author"
					}
				],
				"date": "June 22, 2011",
				"DOI": "10.4086/toc.gs.2011.004",
				"accessDate": "CURRENT_TIMESTAMP",
				"libraryCatalog": "Theory of Computing",
				"numPages": "27",
				"publisher": "Theory of Computing Library",
				"series": "Graduate Surveys",
				"seriesNumber": "4",
				"url": "http://theoryofcomputing.org/articles/gs004/",
				"attachments": [
					{
						"title": "Theory of Computing Snapshot"
					},
					{
						"title": "Theory of computing Full Text PDF",
						"mimeType": "application/pdf"
					}
				],
				"tags": [
					"block sensitivity",
					"complexity measures of Boolean functions",
					"sensitivity"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://toc.nada.kth.se/articles/v009a013/index.html",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Optimal Hitting Sets for Combinatorial Shapes",
				"creators": [
					{
						"firstName": "Aditya",
						"lastName": "Bhaskara",
						"creatorType": "author"
					},
					{
						"firstName": "Devendra",
						"lastName": "Desai",
						"creatorType": "author"
					},
					{
						"firstName": "Srikanth",
						"lastName": "Srinivasan",
						"creatorType": "author"
					}
				],
				"date": "May 25, 2013",
				"DOI": "10.4086/toc.2013.v009a013",
				"accessDate": "CURRENT_TIMESTAMP",
				"libraryCatalog": "Theory of Computing",
				"number": "13",
				"pages": "441–470",
				"publicationTitle": "Theory of Computing",
				"publisher": "Theory of Computing",
				"url": "http://toc.nada.kth.se/articles/v009a013/index.html",
				"volume": "9",
				"attachments": [
					{
						"title": "Theory of Computing Snapshot"
					},
					{
						"title": "Theory of computing Full Text PDF",
						"mimeType": "application/pdf"
					}
				],
				"tags": [
					"derandomization",
					"expanders",
					"explicit construction",
					"hitting sets",
					"perfect hashing"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://tocmirror.cs.tau.ac.il/articles/gs003/index.html",
		"items": [
			{
				"itemType": "book",
				"title": "Selected Results in Additive Combinatorics: An Exposition",
				"creators": [
					{
						"firstName": "Emanuele",
						"lastName": "Viola",
						"creatorType": "author"
					}
				],
				"date": "May 15, 2011",
				"DOI": "10.4086/toc.gs.2011.003",
				"accessDate": "CURRENT_TIMESTAMP",
				"libraryCatalog": "Theory of Computing",
				"numPages": "15",
				"publisher": "Theory of Computing Library",
				"series": "Graduate Surveys",
				"seriesNumber": "3",
				"shortTitle": "Selected Results in Additive Combinatorics",
				"url": "http://tocmirror.cs.tau.ac.il/articles/gs003/index.html",
				"attachments": [
					{
						"title": "Theory of Computing Snapshot"
					},
					{
						"title": "Theory of computing Full Text PDF",
						"mimeType": "application/pdf"
					}
				],
				"tags": [
					"additive combinatorics",
					"linearity testing"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://toc.ilab.sztaki.hu/articles/v005a002/index.html",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Deterministic History-Independent Strategies for Storing Information on Write-Once Memories",
				"creators": [
					{
						"firstName": "Tal",
						"lastName": "Moran",
						"creatorType": "author"
					},
					{
						"firstName": "Moni",
						"lastName": "Naor",
						"creatorType": "author"
					},
					{
						"firstName": "Gil",
						"lastName": "Segev",
						"creatorType": "author"
					}
				],
				"date": "May 23, 2009",
				"DOI": "10.4086/toc.2009.v005a002",
				"accessDate": "CURRENT_TIMESTAMP",
				"libraryCatalog": "Theory of Computing",
				"number": "2",
				"pages": "43–67",
				"publicationTitle": "Theory of Computing",
				"publisher": "Theory of Computing",
				"url": "http://toc.ilab.sztaki.hu/articles/v005a002/index.html",
				"volume": "5",
				"attachments": [
					{
						"title": "Theory of Computing Snapshot"
					},
					{
						"title": "Theory of computing Full Text PDF",
						"mimeType": "application/pdf"
					}
				],
				"tags": [
					"conflict resolution",
					"expander graphs",
					"history-independent",
					"information-theoretic security",
					"tamper-evident",
					"vote storage mechanism",
					"write-once memory"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://toc.nada.kth.se/articles/v009a009/index.html",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Quantum Money from Hidden Subspaces",
				"creators": [
					{
						"firstName": "Scott",
						"lastName": "Aaronson",
						"creatorType": "author"
					},
					{
						"firstName": "Paul",
						"lastName": "Christiano",
						"creatorType": "author"
					}
				],
				"date": "March 11, 2013",
				"DOI": "10.4086/toc.2013.v009a009",
				"libraryCatalog": "Theory of Computing",
				"pages": "349–401",
				"publicationTitle": "Theory of Computing",
				"url": "http://toc.nada.kth.se/articles/v009a009/index.html",
				"volume": "9",
				"attachments": [
					{
						"title": "Theory of Computing Snapshot"
					},
					{
						"title": "Theory of computing Full Text PDF",
						"mimeType": "application/pdf"
					}
				],
				"tags": [
					"electronic cash",
					"multivariate polynomials",
					"quantum cryptography",
					"quantum lower bounds"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.cims.nyu.edu/~regev/toc/articles/gs003/",
		"items": [
			{
				"itemType": "book",
				"title": "Selected Results in Additive Combinatorics: An Exposition",
				"creators": [
					{
						"firstName": "Emanuele",
						"lastName": "Viola",
						"creatorType": "author"
					}
				],
				"date": "May 15, 2011",
				"DOI": "10.4086/toc.gs.2011.003",
				"accessDate": "CURRENT_TIMESTAMP",
				"libraryCatalog": "Theory of Computing",
				"numPages": "15",
				"publisher": "Theory of Computing Library",
				"series": "Graduate Surveys",
				"seriesNumber": "3",
				"shortTitle": "Selected Results in Additive Combinatorics",
				"url": "http://www.cims.nyu.edu/~regev/toc/articles/gs003/",
				"attachments": [
					{
						"title": "Theory of Computing Snapshot"
					},
					{
						"title": "Theory of computing Full Text PDF",
						"mimeType": "application/pdf"
					}
				],
				"tags": [
					"additive combinatorics",
					"linearity testing"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/
