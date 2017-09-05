{
	"translatorID": "c7830593-807e-48cb-99f2-c3bed2b148c2",
	"label": "New Zealand Herald",
	"creator": "Sopheak Hean, Michael Berkowitz",
	"target": "^https?://www\\.nzherald\\.co\\.nz",
	"minVersion": "1.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2014-04-03 17:49:28"
}

function detectWeb(doc, url) {
/* If the address bar has /news in it then its a newspaper article*/

	if (doc.location.href.indexOf("/search/results.cfm") !=-1){
		return "multiple";
	} else if (doc.location.href.indexOf("/news/article.cfm") !=-1){
		return "newspaperArticle";
	}
}

function associateData (newItem, items, field, zoteroField) {
	if (items[field]){
		newItem[zoteroField] = items[field];
	}
}

function scrape(doc, url){
	var authorTemp;

	var articleLanguage = "en-NZ";

	var newItem = new Zotero.Item('newspaperArticle');
	newItem.url = doc.location.href;

	newItem.publicationTitle = "New Zealand Herald";
	newItem.ISSN = "1170-0777";

	//Get title of the news via xpath
	var myXPath = '//h1[@class="articleTitle"]';
	var myXPathObject = doc.evaluate(myXPath, doc, null, XPathResult.ANY_TYPE, null).iterateNext().textContent;
	var headers;
	var items = new Object();
	var authorsTemp;
	var blankCell;
	var contents;
	var authorArray = new Array();

	/*
	 Get authors of the article
	 Remove "By " then replace "and " with ", "

	 Put the string into an array then split the array and loop all
	 authors then push author to Zotero.  Possible with more than 1 author
	 on an article.
	*/
	var authorXPath = '//p[@class="details"]';
	var authorXPathObject = doc.evaluate(authorXPath, doc, null, XPathResult.ANY_TYPE, null).iterateNext();

	if (authorXPathObject) {
		var authorString = authorXPathObject.textContent.replace(/\bBy\W+/g, '');
		if (authorString.match(/\W\band\W+/g)){
			authorTemp = authorString.replace(/\W\band\W+/g, ', ');
			authorArray = authorTemp.split(", ");
		} else if (!authorString.match(/\W\band\W+/g)){
			authorArray = authorString;
		}
		if( authorArray instanceof Array ) {
			for (var i in authorArray){
				var author;
				author = authorArray[i];
				newItem.creators.push(Zotero.Utilities.cleanAuthor(author, "author"));
			}
		} else {
			if (authorString.match(/\W\bof\W+/g)){
				authorTemp = authorString.replace (/\W\bof\W(.*)/g, '');
				authorArray = authorTemp;
				newItem.creators.push(Zotero.Utilities.cleanAuthor(authorTemp, "author"));

			}  else {
				newItem.creators.push(Zotero.Utilities.cleanAuthor(authorArray, "author"));
			}
		}
	}
	//date-Year
	var dateXPath = '//span[contains(@class, "storyDate")]';
	var dateXPathObject = doc.evaluate(dateXPath, doc, null, XPathResult.ANY_TYPE, null).iterateNext().textContent.replace(/\d{1,2}:\d{1,2} (AM|PM) (\w)+ /g, '');

	//If the original Xpath1 is equal to Updated then go to XPath2
	if ((dateXPathObject =="Updated")|| (dateXPathObject =="New")){
		var dateXPath = '//div[contains(@class, "tools")]/span[2]';
		var dateXPathObject = doc.evaluate(dateXPath, doc, null, XPathResult.ANY_TYPE, null).iterateNext().textContent.replace(/\d{1,2}:\d{1,2} (AM|PM) (\w)+ /g, '');
		newItem.date = dateXPathObject ;
	} else { //great found the date just push it to Zotero.
		var dateXPath = '//span[contains(@class, "storyDate")]';
		var dateXPathObject = doc.evaluate(dateXPath, doc, null, XPathResult.ANY_TYPE, null).iterateNext().textContent.replace(/\d{1,2}:\d{1,2} (AM|PM) (\w)+ /g, '');
		newItem.date = dateXPathObject ;
	}

	//Get Section of the news
	var sectionXPath = '//ul[@id="navContainer"]/li/a[contains(@class, "active")]';
	var sectionXPathObject = ZU.xpathText(doc, sectionXPath);
	newItem.section = sectionXPathObject;

	//Get news title
	headers =myXPathObject;
	newItem.title = headers;

	newItem.language= articleLanguage;

	//grab abstract from meta data
	var a= "//meta[@name='description']";
	newItem.abstractNote = doc.evaluate(a, doc, null, XPathResult.ANY_TYPE, null).iterateNext().content;
	newItem.complete();
}

function doWeb(doc, url){

	var articles = new Array();
	var items = new Object();
	var nextTitle;

	if (detectWeb(doc, url) == "multiple"){
		var titles = doc.evaluate('//div[@id="results"]//a[@class="headline"]', doc, null, XPathResult.ANY_TYPE, null);
		while (nextTitle = titles.iterateNext()){
			items[nextTitle.href] = nextTitle.textContent;
		}
	Zotero.selectItems(items, function (items) {
			if (!items) {
				return true;
			}
			for (var i in items) {
				articles.push(i);
			}
			Zotero.Utilities.processDocuments(articles, scrape);
		});
	} else {
		scrape(doc, url)
	}
}
/**
Test cases temporarily disabled; they occasionally hang the test harness
var testCases = [
	{
		"type": "web",
		"url": "http://www.nzherald.co.nz/business/news/article.cfm?c_id=3&objectid=10765066",
		"items": [
			{
				"itemType": "newspaperArticle",
				"creators": [],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [],
				"url": "http://www.nzherald.co.nz/business/news/article.cfm?c_id=3&objectid=10765066",
				"publicationTitle": "New Zealand Herald",
				"ISSN": "1170-0777",
				"date": "Nov 10, 2011",
				"section": "Business",
				"title": "Manufacturing slumps in October",
				"language": "en-NZ",
				"abstractNote": "The New Zealand manufacturing sector contracted in October to its worst level since June 2009 as the Rugby World Cup distracted business and the construction sector ebbed.",
				"libraryCatalog": "New Zealand Herald",
				"accessDate": "CURRENT_TIMESTAMP"
			}
		]
	},
	{
		"type": "web",
		"defer": true,
		"url": "http://www.nzherald.co.nz/labor/search/results.cfm?kw1=labor&kw2=&st=gsa",
		"items": "multiple"
	}
]
/** END TEST CASES **/