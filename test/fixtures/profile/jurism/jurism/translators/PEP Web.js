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
	"lastUpdated": "2015-03-20 06:07:35"
}

//Only works for journal articles, and only for single entries.
//Author names sometimes omit periods after the first initials.

function detectWeb(doc, url) {

	if (url.indexOf("/document.php")!=-1)
		return "journalArticle";
}


function scrape(doc, url) {
	
	var newItem = new Zotero.Item("journalArticle");
	newItem.url = doc.location.href;
	var citeString = ZU.xpathText(doc, '//span[@id="maincite"]');
	var titleString = ZU.xpathText(doc, '//p[@class="title"]/a/text()');
	if (!titleString) titleString = ZU.xpathText(doc, '//p[@class="title"]/text()[1]');
	//authors
	var authors = citeString.match(/(^.*?)\(/)[1].toString();
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
	var pubname = citeString.match(/(\)\.\s)(.*)(\,)/)
	if (pubname) pubname = pubname[0];
	var pubminus = citeString.match(/(\)\.\s)(.*?)(\.)/);
	if (pubminus) pubminus = pubminus[0];
	else pubminus = "";
	if (pubname){
		pubname = pubname.replace(pubminus, '');
		pubname = pubname.replace(/\,/, '');
		pubname = pubname.replace(/\.*/, '');
		pubname = pubname.replace(/^\s*/, '');
		pubname = pubname.replace(/\s*$/, '')
		newItem.publicationTitle = pubname;
	}
	
	//volume
	var volumeandpages = citeString.match(/[0-9]*\:([0-9]*(\-?)[0-9]*)\.$/);
	if (volumeandpages){ 
		volumeandpages =  volumeandpages[0];
		var volume = volumeandpages.match(/([0-9]*)\:/);
		if (volume) newItem.volume = volume[1];
	
		//pages
		var pages = volumeandpages.match(/\:([0-9]*)(\-?)([0-9]*)/)[0].toString();
		pages = pages.replace(":", '');
		pages = pages.replace(".", '');
		newItem.pages = pages;
	}
	newItem.attachments.push({url:doc.location.href, title:"PEP Web Snapshot", mimeType:"text/html"});

	newItem.complete();	
}


function doWeb(doc, url) {
	scrape(doc, url)
}
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.pep-web.org/document.php?id=ajp.068.0024a",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Childhood and Trauma",
				"creators": [
					{
						"firstName": "P. J.",
						"lastName": "Boschan",
						"creatorType": "author"
					}
				],
				"date": "2008",
				"accessDate": "CURRENT_TIMESTAMP",
				"libraryCatalog": "PEP Web",
				"pages": "24-32",
				"publicationTitle": "Am. J. Psychoanal.",
				"url": "http://www.pep-web.org/document.php?id=ajp.068.0024a",
				"volume": "68",
				"attachments": [
					{
						"title": "PEP Web Snapshot",
						"mimeType": "text/html"
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
		"url": "http://www.pep-web.org/document.php?id=se.014.0237a&type=hitlist&num=0&query=zone1%2Cparagraphs|zone2%2Cparagraphs|author%2Cfreud|title%2Cmourning+and+melancholia|viewperiod%2Cweek|sort%2Cyear%2Ca#hit1",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Mourning and Melancholia",
				"creators": [
					{
						"firstName": "S.",
						"lastName": "Freud",
						"creatorType": "author"
					}
				],
				"date": "1917",
				"libraryCatalog": "PEP Web",
				"publicationTitle": "The Standard Edition of the Complete Psychological Works of Sigmund Freud Volume XIV (1914-1916): On the History of the Psycho-Analytic Movement, Papers on Metapsychology and Other Works,",
				"url": "http://www.pep-web.org/document.php?id=se.014.0237a&type=hitlist&num=0&query=zone1%2Cparagraphs|zone2%2Cparagraphs|author%2Cfreud|title%2Cmourning+and+melancholia|viewperiod%2Cweek|sort%2Cyear%2Ca#hit1",
				"attachments": [
					{
						"title": "PEP Web Snapshot",
						"mimeType": "text/html"
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