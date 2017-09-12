{
	"translatorID": "625c6435-e235-4402-a48f-3095a9c1a09c",
	"label": "DBLP Computer Science Bibliography",
	"creator": "Adam Crymble, Sebastian Karcher, Philipp Zumstein",
	"target": "^https?://(www\\.)?(dblp(\\.org|\\.uni-trier\\.de/|\\.dagstuhl\\.de/)|informatik\\.uni-trier\\.de/\\~ley/)",
	"minVersion": "1.0.0b4.r5",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsv",
	"lastUpdated": "2016-09-11 19:41:55"
}

function detectWeb(doc, url) {
	if (url.indexOf('rec/bibtex') !== -1) {
		if (url.indexOf('journals') !== -1) {
			return "journalArticle";
		} else if (url.indexOf('conf') !== -1) {
			return "conferencePaper";
		} else if (url.indexOf('series') !== -1 || url.indexOf('reference') !== -1) {
			return "bookSection";
		} else if (url.indexOf('books') !== -1) {
			return "book";
		} else if (url.indexOf('phd') !== -1) {
			return "thesis";
		} else { //generic fallback
			return "journalArticle";
		}
	} else if ((url.match(/\/db\/(journals|conf|series|reference)/) || url.match(/\/pers\/(hd|ht|hy)/)) && !url.match(/index[\w-]*\.html/)) {
		return "multiple"
	}
}


function scrape(doc, url) {
	var xPathAllData = doc.evaluate('//pre', doc, null, XPathResult.ANY_TYPE, null);
	var firstData = xPathAllData.iterateNext(); //only if exists
	var firstDataText = firstData.textContent.replace(/ ee\s*=/, " url ="); //e.g. ee = {http://dx.doi.org/10.1007/978-3-319-00035-0_37},
	Zotero.debug(firstDataText);

	//conferencePapers and bookSections are linked in DBLP
	//with the crossref field to the second BibTeX entry
	//for the proceeding or book. In these cases the following
	//lines (if-part) are handling the second entry and extracting
	//relevant fields and save it (later) to the main entry.
	var secondData;
	if (secondData = xPathAllData.iterateNext()) {
		var secondDataText = secondData.textContent;
		Zotero.debug(secondDataText);

		var trans = Zotero.loadTranslator('import');
		trans.setTranslator('9cb70025-a888-4a29-a210-93ec52da40d4');//https://github.com/zotero/translators/blob/master/BibTeX.js
		trans.setString(secondDataText);

		trans.setHandler('itemDone', function (obj, item) {
			scrapeMainPart(firstDataText, item);
		});

		trans.translate();
	} else { //if there are no secondData: scrape without additional data
		scrapeMainPart(firstDataText, null);
	}
}


function scrapeMainPart(firstDataText, secondDataItem) {
	//scrape from the firstDataText and if secondDataItem
	//is not null, add/update these information
	var trans = Zotero.loadTranslator('import');
	trans.setTranslator('9cb70025-a888-4a29-a210-93ec52da40d4');//https://github.com/zotero/translators/blob/master/BibTeX.js
	trans.setString(firstDataText);

	trans.setHandler('itemDone', function (obj, item) {
		Zotero.debug("item.itemType = " + item.itemType);
		if (secondDataItem) {
			if (secondDataItem.title && item.itemType == "conferencePaper") item.proceedingsTitle = secondDataItem.title;
			if (secondDataItem.title && item.itemType == "bookSection") item.booktitle = secondDataItem.titel;
			if (secondDataItem.creators && secondDataItem.creators.length > 0) item.creators = item.creators.concat(secondDataItem.creators);
			if (secondDataItem.publisher && !item.publisher) item.publisher = secondDataItem.publisher;
			if (secondDataItem.series && !item.series) item.series = secondDataItem.series;
			if (secondDataItem.volume && !item.volume) item.volume = secondDataItem.volume;
			if (secondDataItem.ISBN && !item.ISBN) item.ISBN = secondDataItem.ISBN;
		}
		
		//Assume that the url contains an doi. If the item does not
		//yet contain a doi, then save the doi and delete the url.
		//If the item contains the doi corresponding to the url
		//then just delete the url and keep the doi.
		if(item.url && item.url.search(/^https?:\/\/(?:dx\.)?doi\.org\/10\./i) != -1) {
			var doi = ZU.cleanDOI(item.url);
			if(doi && (!item.DOI || item.DOI == doi)) {
				item.DOI = doi;
				delete item.url;
			}
		}
		
		item.complete();
	});

	trans.translate();

}

function doWeb(doc, url) {
	if (detectWeb(doc, url) == "multiple") {
		var items = new Object();
		var articles = new Array();
		var rows = ZU.xpath(doc, '//body/ul/li|//li[contains(@class, "entry")]')
		for(var i=0; i<rows.length; i++) {
			//Careful: If you get more than one node,
			//ZU.xpathText will join the textContent of each with commas. 
			var title = ZU.xpathText(rows[i], './b|./div/span[@class="title"]');
			var link = ZU.xpathText(rows[i], './a[contains(@href, "rec/bibtex") and not(contains(@href, ".xml"))]/@href|./nav//div/a[contains(@href, "rec/bibtex") and not(contains(@href, ".xml"))]/@href');
			items[link] = title;
		}
		Zotero.selectItems(items, function (items) {
			if (!items) {
				return true;
			}
			for (var i in items) {
				articles.push(i);
			}
			ZU.processDocuments(articles, scrape);
		});
	} else {
		scrape(doc, url);
	}
} /** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://dblp.org/rec/bibtex/journals/cssc/XuY12",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "On the Preliminary Test Backfitting and Speckman Estimators in Partially Linear Models and Numerical Comparisons",
				"creators": [
					{
						"firstName": "Jianwen",
						"lastName": "Xu",
						"creatorType": "author"
					},
					{
						"firstName": "Hu",
						"lastName": "Yang",
						"creatorType": "author"
					}
				],
				"date": "2012",
				"DOI": "10.1080/03610918.2011.588356",
				"issue": "3",
				"itemID": "DBLP:journals/cssc/XuY12",
				"libraryCatalog": "DBLP Computer Science Bibliography",
				"pages": "327–341",
				"publicationTitle": "Communications in Statistics - Simulation and Computation",
				"volume": "41",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://dblp.org/rec/bibtex/conf/ats/KochteZBIWHCP10",
		"items": [
			{
				"itemType": "conferencePaper",
				"title": "Efficient Simulation of Structural Faults for the Reliability Evaluation at System-Level",
				"creators": [
					{
						"firstName": "Michael A.",
						"lastName": "Kochte",
						"creatorType": "author"
					},
					{
						"firstName": "Christian G.",
						"lastName": "Zoellin",
						"creatorType": "author"
					},
					{
						"firstName": "Rafal",
						"lastName": "Baranowski",
						"creatorType": "author"
					},
					{
						"firstName": "Michael E.",
						"lastName": "Imhof",
						"creatorType": "author"
					},
					{
						"firstName": "Hans-Joachim",
						"lastName": "Wunderlich",
						"creatorType": "author"
					},
					{
						"firstName": "Nadereh",
						"lastName": "Hatami",
						"creatorType": "author"
					},
					{
						"firstName": "Stefano Di",
						"lastName": "Carlo",
						"creatorType": "author"
					},
					{
						"firstName": "Paolo",
						"lastName": "Prinetto",
						"creatorType": "author"
					}
				],
				"date": "2010",
				"DOI": "10.1109/ATS.2010.10",
				"ISBN": "9780769542485",
				"itemID": "DBLP:conf/ats/KochteZBIWHCP10",
				"libraryCatalog": "DBLP Computer Science Bibliography",
				"pages": "3–8",
				"proceedingsTitle": "Proceedings of the 19th IEEE Asian Test Symposium, ATS 2010, 1-4 December 2010, Shanghai, China",
				"publisher": "IEEE Computer Society",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.informatik.uni-trier.de/~ley/db/journals/tois/tois25.html",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://dblp.uni-trier.de/db/journals/tods/tods31.html",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://dblp.dagstuhl.de/pers/hd/k/Knuth:Donald_E=.html",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://dblp.uni-trier.de/rec/bibtex/conf/approx/SchederT13",
		"items": [
			{
				"itemType": "conferencePaper",
				"title": "On the Average Sensitivity and Density of k-CNF Formulas",
				"creators": [
					{
						"firstName": "Dominik",
						"lastName": "Scheder",
						"creatorType": "author"
					},
					{
						"firstName": "Li-Yang",
						"lastName": "Tan",
						"creatorType": "author"
					},
					{
						"firstName": "Prasad",
						"lastName": "Raghavendra",
						"creatorType": "editor"
					},
					{
						"firstName": "Sofya",
						"lastName": "Raskhodnikova",
						"creatorType": "editor"
					},
					{
						"firstName": "Klaus",
						"lastName": "Jansen",
						"creatorType": "editor"
					},
					{
						"firstName": "José D. P.",
						"lastName": "Rolim",
						"creatorType": "editor"
					}
				],
				"date": "2013",
				"DOI": "10.1007/978-3-642-40328-6_47",
				"ISBN": "9783642403279",
				"itemID": "DBLP:conf/approx/SchederT13",
				"libraryCatalog": "DBLP Computer Science Bibliography",
				"pages": "683–698",
				"proceedingsTitle": "Approximation, Randomization, and Combinatorial Optimization. Algorithms and Techniques - 16th International Workshop, APPROX 2013, and 17th International Workshop, RANDOM 2013, Berkeley, CA, USA, August 21-23, 2013. Proceedings",
				"publisher": "Springer",
				"series": "Lecture Notes in Computer Science",
				"volume": "8096",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/