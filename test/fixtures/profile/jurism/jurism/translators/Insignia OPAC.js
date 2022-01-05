{
	"translatorID": "abd7c626-6913-42d4-a05f-acc6683c69da",
	"label": "Insignia OPAC",
	"creator": "Niko",
	"target": "^https?://[^/]+/(library|crts)/[^/?#]+\\.aspx",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcs",
	"lastUpdated": "2017-01-01 15:21:20"
}

/**
 * No tests, but translator can be tested at
 * http://www.insigniasoftware.com/library/WhatIsNew.aspx
 **/

function detectWeb(doc, url) {
	var type =  ZU.xpathText(doc, '//input[@id="__ZoteroType"]/@value');
	
	if (type=="book"){
		
		var xPathTitle = '//table[@id="tbDetailInfo_Basic"]/tbody/tr/td/label[@name="Title"]';
		var title = ZU.xpathText(doc, xPathTitle);
		if (title){
			return "book";
		}
	}
}


function doWeb(doc, url) {
	var xPathTitle = '//table[@id="tbDetailInfo_Basic"]/tbody/tr/td/label[@name="Title"]';
	var xpathSeries = '//table[@id="tbDetailInfo_Basic"]/tbody/tr/td/label[@name="Series"]';
	var xpathCallNumber = '//table[@id="tbDetailInfo_Basic"]/tbody/tr/td/label[@name="CallNo"]';
	var xpathEdition = '//table[@id="tbDetailInfo_Basic"]/tbody/tr/td/label[@name="Edition"]';
	var xpathAuthor = '//table[@id="tbDetailInfo_Basic"]/tbody/tr/td/label[@name="Author"]/a';
	
	var xpathISBN = '//table[@id="tbDetailInfo_Publication"]/tbody/tr/td/label[@name="ISBN"]';
	var xpathPublisher = '//table[@id="tbDetailInfo_Publication"]/tbody/tr/td/label[@name="Publication"]';
	var xpathDescription = '//table[@id="tbDetailInfo_Summary"]/tbody/tr/td/label[@name="Summary"]';
	var xpathDescription2 = '//table[@id="tbDetailInfo_Summary"]/tbody/tr/td/label[@name="Content"]';

	var xpathPageNumber = '//table[@id="tbDetailInfo_Publication"]/tbody/tr/td/label[@name="Collation"]';

	var item  = new Zotero.Item();
	item.itemType ="book";		
	item.title = ZU.xpathText(doc, xPathTitle);
	var isbns = ZU.xpathText(doc, xpathISBN);

	if (isbns) {
		isbns = isbns.split(';');
		for (var i=0, n=isbns.length; i<n; i++) {
			isbns[i] = ZU.cleanISBN(isbns[i]);
			if (!isbns[i]) {
				isbns.splice(i,1);
			}
		}
		item.ISBN = isbns.join('; ');
	}

	item.series = ZU.xpathText(doc, xpathSeries);
	item.callNumber = ZU.xpathText(doc, xpathCallNumber);
	item.edition = ZU.xpathText(doc, xpathEdition);

	var publisher = ZU.xpathText(doc, xpathPublisher);
	if (publisher) {
		var dateRE = /[\s,[]+c?(\d{4})[\]\s.]*$/gi;
		var date;
		while (date = dateRE.exec(publisher)) {
			if (!item.date) item.date = date[1];
			publisher = publisher.substring(0, publisher.length - date[0].length);
			dateRE.lastIndex = 0;
		}
		item.publisher = publisher;
	}

	var note = ZU.xpathText(doc, xpathDescription);
	if (note)
		item.notes.push(note);
	note = ZU.xpathText(doc, xpathDescription2);
	if (note)
		item.notes.push(note);
	
	//112 p. : col. ill. ; 15 cm..
	var textContent = ZU.xpathText(doc, xpathPageNumber);
	
	if (textContent){
		item.numPages = textContent.split(" p")[0];
	}
	saveAuthor(item,xpathAuthor,doc);
	item.complete();
}


function saveAuthor(item,xpathAuthor,doc) {
	var contents = doc.evaluate(xpathAuthor, doc, null, XPathResult.ANY_TYPE, null);
	var author;

	while (author = contents.iterateNext()) {
		item.creators.push(
			ZU.cleanAuthor(
				author.textContent.replace(/[\s\d-\.]+$/, ''),
				"author",
				true
			)
		);
	}
}
/** BEGIN TEST CASES **/
var testCases = []
/** END TEST CASES **/