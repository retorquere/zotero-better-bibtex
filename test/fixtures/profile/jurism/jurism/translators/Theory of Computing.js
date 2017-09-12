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
	"lastUpdated": "2016-03-23 16:47:35"
}

/*****
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

*****/




/*****
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

 ******/




//A Regexp for extracting the Domain

var surveyRegexp = new RegExp("articles/(gs[^/]+)");
var journalRegexp = new RegExp("articles/(v[^/]+)");

function detectWeb(doc, url){
	if (surveyRegexp.test(url))
		return "book";
	else
		return "journalArticle";
}

function doWeb(doc, url){
	var typeRegExp;
	var type = detectWeb(doc, url);

	//Select the right regexp according to the article type
	if (type == "journalArticle")
		typeRegExp = journalRegexp;
	else
		typeRegExp = surveyRegexp;

	var urlData = typeRegExp.exec(url);
	//urlData is an Array of three elements, with the element at index 1 containg the
	//base domain of the mirror being accesses, and the element at index 2
	//containing the article ID.

	var articleID = urlData[1];

	//We now start constructing the Zoetro item
	var newItem = new Zotero.Item(type);

	//Store the snapshot and the PDF file
	newItem.attachments.push({
		title: "Theory of Computing Snapshot",
		document: doc});
	var pdfLink = articleID + ".pdf";
	newItem.attachments.push({
		title: "Theory of computing Full Text PDF",
		mimeType: "application/pdf",
		url:pdfLink});

	//Get the article topLine
	var topLine = ZU.xpathText(doc, '//div[@id="articletopline"]');

	//Get the article publication date lines
	var pubDateLines = ZU.xpathText(doc, '//div[@id="articledates"]');

	//Get the article copyright line (to determine authors) 
	//This seems the most consistent way of determining the authors for this
	//journal.
	var authorLine = ZU.xpathText(doc, '//div[@id="copyright"]/a[1]');

	var keywordLine = ZU.xpathText(doc, '(//div[@class="hang"])[3]');

	var DOI = ZU.xpathText(doc, '//div[@id="doi"]');

	//Now start filling up data
	//Title
	var title = ZU.xpathText(doc, '//div[@id="articletitle"]');
	if (!title)
		title = ZU.xpathText(doc, '//div[@id="title"]');
	newItem.title = title;

	//DOI and URL
	newItem.DOI = ZU.cleanDOI(DOI);
	newItem.url = url;

	//Publcication date line
	if (pubDateLines){
		var pubDateRegexp = /Published:\s+(\w+\s+[0-9]+(?:,|\s)+[0-9]+)/gm;
		newItem.date = pubDateRegexp.exec(pubDateLines)[1];

		//This also contain page information for surveys
		if (type == "book"){
			var pageNum = /([0-9]+)\s+pages/.exec(pubDateLines)[1];
			newItem.numPages = pageNum;
		}
	}

	//Keywords
	if (keywordLine){
		keywords = ZU.trimInternal(/Keywords:\s+(.*)/.exec(keywordLine)[1]);
		keywordList = keywords.split(/,\s+/);
		newItem.tags = keywordList;
	}

	//Author
	if (authorLine){
		authorLine = ZU.trimInternal(authorLine);
		authors = /[^0-9]+[0-9]+\s+(.*)/.exec(authorLine)[1];
		authors = authors.replace(/,?\s+and\s+/, ", ");
		authorList = authors.split(/\s*,\s+/);
		for (author in authorList){
			newItem.creators.push(ZU.cleanAuthor(authorList[author], "author"));
		}
	}

	//Article number etc.
	if (topLine){
		topLine = ZU.trimInternal(topLine);
		if (type == "book"){
			number = /Graduate Surveys\s+([0-9]+)/.exec(topLine)[1];
			newItem.seriesNumber = number;    
		} else if (type == "journalArticle"){
			volumeData = /Volume\s+([0-9]+).*Article\s+([0-9]+)\s+pp\.\s+([0-9]+)-([0-9]+)/.exec(topLine);
			newItem.volume = volumeData[1];
			newItem.number = volumeData[2];
			newItem.pages = volumeData[3] + "–" + volumeData[4];
		}       
	}

	//Format specific data
	if (type == "book"){
		newItem.series = "Graduate Surveys";
		newItem.publisher = "Theory of Computing Library";
	}

	if (type == "journalArticle"){
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
				"notes": [],
				"tags": [
					"sensitivity",
					"block sensitivity",
					"complexity measures of Boolean functions"
				],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Theory of Computing Snapshot"
					},
					{
						"title": "Theory of computing Full Text PDF",
						"mimeType": "application/pdf"
					}
				],
				"title": "Variations on the Sensitivity Conjecture",
				"DOI": "10.4086/toc.gs.2011.004",
				"url": "http://theoryofcomputing.org/articles/gs004/",
				"date": "June 22, 2011",
				"numPages": "27",
				"seriesNumber": "4",
				"series": "Graduate Surveys",
				"publisher": "Theory of Computing Library",
				"libraryCatalog": "Theory of Computing",
				"accessDate": "CURRENT_TIMESTAMP"
			}
		]
	},
	{
		"type": "web",
		"url": "http://toc.nada.kth.se/articles/v009a013/index.html",
		"items": [
			{
				"itemType": "journalArticle",
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
				"notes": [],
				"tags": [
					"derandomization",
					"expanders",
					"explicit construction",
					"hitting sets",
					"perfect hashing"
				],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Theory of Computing Snapshot"
					},
					{
						"title": "Theory of computing Full Text PDF",
						"mimeType": "application/pdf"
					}
				],
				"title": "Optimal Hitting Sets for Combinatorial Shapes",
				"DOI": "10.4086/toc.2013.v009a013",
				"url": "http://toc.nada.kth.se/articles/v009a013/index.html",
				"date": "May 25, 2013",
				"volume": "9",
				"number": "13",
				"pages": "441–470",
				"publicationTitle": "Theory of Computing",
				"publisher": "Theory of Computing",
				"libraryCatalog": "Theory of Computing",
				"accessDate": "CURRENT_TIMESTAMP"
			}
		]
	},
	{
		"type": "web",
		"url": "http://tocmirror.cs.tau.ac.il/articles/gs003/index.html",
		"items": [
			{
				"itemType": "book",
				"creators": [
					{
						"firstName": "Emanuele",
						"lastName": "Viola",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [
					"additive combinatorics",
					"linearity testing"
				],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Theory of Computing Snapshot"
					},
					{
						"title": "Theory of computing Full Text PDF",
						"mimeType": "application/pdf"
					}
				],
				"title": "Selected Results in Additive Combinatorics: An Exposition",
				"DOI": "10.4086/toc.gs.2011.003",
				"url": "http://tocmirror.cs.tau.ac.il/articles/gs003/index.html",
				"date": "May 15, 2011",
				"numPages": "15",
				"seriesNumber": "3",
				"series": "Graduate Surveys",
				"publisher": "Theory of Computing Library",
				"libraryCatalog": "Theory of Computing",
				"accessDate": "CURRENT_TIMESTAMP",
				"shortTitle": "Selected Results in Additive Combinatorics"
			}
		]
	},
	{
		"type": "web",
		"url": "http://toc.ilab.sztaki.hu/articles/v005a002/index.html",
		"items": [
			{
				"itemType": "journalArticle",
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
				"notes": [],
				"tags": [
					"history-independent",
					"write-once memory",
					"tamper-evident",
					"vote storage mechanism",
					"information-theoretic security",
					"conflict resolution",
					"expander graphs"
				],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Theory of Computing Snapshot"
					},
					{
						"title": "Theory of computing Full Text PDF",
						"mimeType": "application/pdf"
					}
				],
				"title": "Deterministic History-Independent Strategies for Storing Information on Write-Once Memories",
				"DOI": "10.4086/toc.2009.v005a002",
				"url": "http://toc.ilab.sztaki.hu/articles/v005a002/index.html",
				"date": "May 23, 2009",
				"volume": "5",
				"number": "2",
				"pages": "43–67",
				"publicationTitle": "Theory of Computing",
				"publisher": "Theory of Computing",
				"libraryCatalog": "Theory of Computing",
				"accessDate": "CURRENT_TIMESTAMP"
			}
		]
	},
	{
		"type": "web",
		"url": "http://toc.cse.iitk.ac.in/articles/v009a009/index.html",
		"items": [
			{
				"itemType": "journalArticle",
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
				"notes": [],
				"tags": [
					"electronic cash",
					"multivariate polynomials",
					"quantum cryptography",
					"quantum lower bounds"
				],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Theory of Computing Snapshot"
					},
					{
						"title": "Theory of computing Full Text PDF",
						"mimeType": "application/pdf"
					}
				],
				"title": "Quantum Money from Hidden Subspaces",
				"DOI": "10.4086/toc.2013.v009a009",
				"url": "http://toc.cse.iitk.ac.in/articles/v009a009/index.html",
				"date": "March 11, 2013",
				"volume": "9",
				"number": "9",
				"pages": "349–401",
				"publicationTitle": "Theory of Computing",
				"publisher": "Theory of Computing",
				"libraryCatalog": "Theory of Computing",
				"accessDate": "CURRENT_TIMESTAMP"
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.cims.nyu.edu/~regev/toc/articles/gs003/",
		"items": [
			{
				"itemType": "book",
				"creators": [
					{
						"firstName": "Emanuele",
						"lastName": "Viola",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [
					"additive combinatorics",
					"linearity testing"
				],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Theory of Computing Snapshot"
					},
					{
						"title": "Theory of computing Full Text PDF",
						"mimeType": "application/pdf"
					}
				],
				"title": "Selected Results in Additive Combinatorics: An Exposition",
				"DOI": "10.4086/toc.gs.2011.003",
				"url": "http://www.cims.nyu.edu/~regev/toc/articles/gs003/",
				"date": "May 15, 2011",
				"numPages": "15",
				"seriesNumber": "3",
				"series": "Graduate Surveys",
				"publisher": "Theory of Computing Library",
				"libraryCatalog": "Theory of Computing",
				"accessDate": "CURRENT_TIMESTAMP",
				"shortTitle": "Selected Results in Additive Combinatorics"
			}
		]
	}
]
/** END TEST CASES **/