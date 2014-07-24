{
	"translatorID": "32ad4782-b106-4ccb-8ae1-ff102ba93eef",
	"label": "PEP Web",
	"creator": "Akilesh Ayyar",
	"target": "^https?://www\\.pep-web\\.org",
	"minVersion": "1.0.0b3.r1",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2012-03-12 01:22:21"
}

//Only works for journal articles, and only for single entries.
//Author names sometimes omit periods after the first initials.

function detectWeb(doc, url) {

	var namespace = doc.documentElement.namespaceURI;
	var nsResolver = namespace ? function(prefix) {
		if (prefix == 'x') return namespace; else return null;
	} : null;
	

	if (url.match(/document/))
		return "journalArticle";
}


function scrape(doc, url) {
	var namespace = doc.documentElement.namespaceURI;
	var nsResolver = namespace ? function(prefix) {
	if (prefix == 'x') return namespace; else return null;
	} : null;
	
	var newItem = new Zotero.Item("journalArticle");
	newItem.url = doc.location.href;
		
	var xPathString = "//span[@id='maincite']";

	var xPathString2 = '//p[@class="title"]/a';
	
	var myXPathObject = doc.evaluate(xPathString, doc, nsResolver, XPathResult.ANY_TYPE, null); 
	var myXPathObject2 = doc.evaluate(xPathString2, doc, nsResolver, XPathResult.ANY_TYPE, null);
	
	var citeString = myXPathObject.iterateNext().textContent;
	var titleString = myXPathObject2.iterateNext().textContent;
	
	//authors
	var authors = citeString.match(/(^.*)\(/)[1].toString();
	if (authors == ' ') {
	 authors = "Unknown";
   } 

	var currentauthor;
	
	//grab all but last author, if there are more than one
	while (authors.match(/^(.*?)(\,)(\s)([A-Z]\.)*\,\s/)) {
		currentauthor = authors.match(/^(.*?)(\,)(\s)([A-Z]\.)*/)[0].toString();
		newItem.creators.push(Zotero.Utilities.cleanAuthor(currentauthor, "author", true));
		authors = authors.replace(/^(.*?)(\,)(\s)([A-Z]\.)*\,\s/, '');
	}
	
	//grab remaining author, or sole author if there's only one
	if (authors != null) {
		currentauthor = authors;
		newItem.creators.push(Zotero.Utilities.cleanAuthor(currentauthor, "author", true));
	}
	
	//title
	newItem.title = titleString;
	
	//year
	var year = citeString.match(/\([0-9][0-9][0-9][0-9]\)/).toString();
	year = year.replace(/\(/, '');
	year = year.replace(/\)/, '');
	newItem.date = year;
	
	//publication name
	var pubname = citeString.match(/(\)\.\s)(.*)(\,)/)[0].toString();
	var pubminus = citeString.match(/(\)\.\s)(.*?)(\.)/)[0].toString();
	pubname = pubname.replace(pubminus, '');
	pubname = pubname.replace(/\,/, '');
	pubname = pubname.replace(/\.*/, '');
	pubname = pubname.replace(/^\s*/, '');
	pubname = pubname.replace(/\s*$/, '')
	newItem.publicationTitle = pubname;

	//volume
	var volumeandpages = citeString.match(/[0-9]*\:([0-9]*(\-?)[0-9]*)\.$/)[0].toString();
	var volume = volumeandpages.match(/[0-9]*\:/)[0].toString();
	volume = volume.replace(":", '');
	newItem.volume = volume;

	//pages
	var pages = volumeandpages.match(/\:([0-9]*)(\-?)([0-9]*)/)[0].toString();
	pages = pages.replace(":", '');
	pages = pages.replace(".", '');
	newItem.pages = pages;

	newItem.attachments.push({url:doc.location.href, title:"PEP Web Snapshot", mimeType:"text/html"});

	newItem.complete();	
}


function doWeb(doc, url) {

	var articles = new Array();

	articles = [url];

	Zotero.Utilities.processDocuments(articles, scrape, function(){Zotero.done();});
	Zotero.wait();
}
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.pep-web.org/document.php?id=ajp.068.0024a",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"firstName": "P. J.",
						"lastName": "Boschan",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "PEP Web Snapshot",
						"mimeType": "text/html"
					}
				],
				"url": "http://www.pep-web.org/document.php?id=ajp.068.0024a",
				"title": "Childhood and Trauma",
				"date": "2008",
				"publicationTitle": "Am. J. Psychoanal.",
				"volume": "68",
				"pages": "24-32",
				"libraryCatalog": "PEP Web",
				"accessDate": "CURRENT_TIMESTAMP"
			}
		]
	}
]
/** END TEST CASES **/