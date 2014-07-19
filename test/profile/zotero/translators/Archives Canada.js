{
	"translatorID": "18bc329c-51af-497e-a7cf-aa572fae363d",
	"label": "Archives Canada",
	"creator": "Adam Crymble",
	"target": "^https?://(www\\.)?archivescanada\\.ca",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsb",
	"lastUpdated": "2013-12-07 15:18:12"
}

function detectWeb (doc, url) {
	if (doc.location.href.match("RouteRqst")) {
		return "multiple";
	} else if (doc.location.href.match("ItemDisplay")) {
		return "book";
	}	
}

function associateData (newItem, dataTags, field, zoteroField) {
	if (dataTags[field]) {
		newItem[zoteroField] = dataTags[field];
	}
}

function scrape(doc, url) {
	var dataTags = new Object();
	var tagsContent = new Array();
	var cainNo;
	var newItem = new Zotero.Item("book");

	var data = doc.evaluate('//td/p', doc, null, XPathResult.ANY_TYPE, null);
	var dataCount = doc.evaluate('count (//td/p)', doc, null, XPathResult.ANY_TYPE, null);

	for (i=0; i<dataCount.numberValue; i++) {	 	
	 		data1 = data.iterateNext().textContent.replace(/^\s*|\s*$/g, '').split(":");
	 		fieldTitle = data1[0].replace(/\s+/g, '');

	 		if (fieldTitle == "PROVENANCE") {
		 		
		 		var multiAuthors = data1[1].split(/\n/);
		 		
		 		for (var j = 0; j < multiAuthors.length; j++) {
			 		if (multiAuthors[j].match(",")) {
				 		
				 		var authorName = multiAuthors[j].replace(/^\s*|\s*$/g, '').split(",");
				 	
				 		authorName[0] = authorName[0].replace(/\s+/g, '');
				 		dataTags["PROVENANCE"] = (authorName[1] + (" ") + authorName[0]);
				 		newItem.creators.push(Zotero.Utilities.cleanAuthor(dataTags["PROVENANCE"], "author")); 	
 		
			 		} else {	
			 		
			 			newItem.creators.push({lastName: multiAuthors[j].replace(/^\s*|\s*$/g, ''), creatorType: "creator"});
		 			}
		 		} 		
		 		
	 		} else if (fieldTitle == "SUBJECTS" | fieldTitle == "MATIÈRES") {
		 		tagsContent = data1[1].split(/\n/);
		 			 		
	 		} else {
	 		
	 			dataTags[fieldTitle] = data1[1];
	 		}
	 	}
	 	
	 	if (doc.evaluate('//tr[3]/td/table/tbody/tr[1]/td/table/tbody/tr[2]/td/table/tbody/tr/td[1]', doc, null, XPathResult.ANY_TYPE, null).iterateNext()) {
	 		cainNo = doc.evaluate('//tr[3]/td/table/tbody/tr[1]/td/table/tbody/tr[2]/td/table/tbody/tr/td[1]', doc, null, XPathResult.ANY_TYPE, null).iterateNext().textContent;
	 		newItem.archiveLocation = cainNo.replace(/^\s*|\s*$/g, '');
	 	}
	 		for (var i = 0; i < tagsContent.length; i++) {
		 		newItem.tags[i] = tagsContent[i].replace(/^\s*|\s*$/g, '');
	 		}
	 		
	 	associateData (newItem, dataTags, "TITLE", "title" );
	 	associateData (newItem, dataTags, "REPOSITORY", "repository" );
	 	associateData (newItem, dataTags, "RETRIEVALNUMBER", "callNumber" );
	 	associateData (newItem, dataTags, "DATES", "date" );
	 	associateData (newItem, dataTags, "SCOPEANDCONTENT", "abstractNote" );
	 	associateData (newItem, dataTags, "LANGUAGE", "language" );
	 	
	 	associateData (newItem, dataTags, "LANGUE", "language" );
	 	associateData (newItem, dataTags, "TITRE", "title" );
	 	associateData (newItem, dataTags, "CENTRED'ARCHIVES", "repository" );
	 	associateData (newItem, dataTags, "NUMÉROD'EXTRACTION", "callNumber" );
	 	associateData (newItem, dataTags, "PORTÉEETCONTENU", "abstractNote" );
	
	newItem.url = doc.location.href;

	newItem.complete();
}

function doWeb(doc, url) {
	var articles = new Array();
	
	if (detectWeb(doc, url) == "multiple") {
		var items = new Object();
		
		var titles = doc.evaluate('//td[3]/a', doc, null, XPathResult.ANY_TYPE, null);

		var next_title;
		while (next_title = titles.iterateNext()) {
			items[next_title.href] = next_title.textContent;
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
}/** BEGIN TEST CASES **/
var testCases = []
/** END TEST CASES **/