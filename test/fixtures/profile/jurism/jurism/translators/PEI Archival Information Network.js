{
	"translatorID": "6871e8c5-f935-4ba1-8305-0ba563ce3941",
	"label": "PEI Archival Information Network",
	"creator": "Adam Crymble, Sebastian Karcher",
	"target": "^https?://www\\.archives\\.pe\\.ca",
	"minVersion": "1.0.0b4.r5",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2012-07-02 23:13:31"
}

function detectWeb(doc, url) {
	if (url.match(/dosearch\.php/)) {
		return "multiple";
	} else if (url.match(/fondsdetail\.php/)){
		return "book";
	} 
}

//PEI Archival Information Network translator: Code by Adam Crymble

var authors;
function associateData (newItem, dataTags, field, zoteroField) {
if (dataTags[field]) {
	newItem[zoteroField] = dataTags[field];
	}
}

function authors1() {
	for (var k = 0; k< authors.length; k++) { 
		if (authors[k].match(", ")) {
			var author = authors[k].split(", ");
			authors[k] = (author[1] + (" ") + author[0].replace(/^\s*|\s*$/g, ''));
						
			newItem.creators.push(Zotero.Utilities.cleanAuthor(authors[k], "author"));  		
		
		} else {
				
			newItem.creators.push({lastName: authors[k], creatorType: "creator"}); 
		}	
	}
}

function scrape(doc, url) {
	
	var dataTags = new Object();
	var fieldTitle;
	var contents;
	var tagsContent = new Array();
	
	newItem = new Zotero.Item("book");

	var xPathHeadings = doc.evaluate('//strong/small', doc, null, XPathResult.ANY_TYPE, null);
	var xPathContents = doc.evaluate('//td/ul|//td/pre/ul', doc, null, XPathResult.ANY_TYPE, null);
	var xPathCount = doc.evaluate('count(//strong/small)', doc, null, XPathResult.ANY_TYPE, null);
	for (i=0; i<xPathCount.numberValue; i++) {	 
			
		fieldTitle  = xPathHeadings.iterateNext().textContent.replace(/\s+/g, "");
		contents = xPathContents.iterateNext().textContent;
		
		if (fieldTitle == "AccessPoints") {
			
		//creates Author
			dataTags["Author"] = (contents.trim());
			contents = xPathContents.iterateNext().textContent;
				authors = dataTags["Author"].split(/\n/);
				authors1();		
				
		//creates Other Authors (if any)				
			dataTags["OtherAuthor"] = (contents.trim());
			contents = xPathContents.iterateNext().textContent;
				if (dataTags["OtherAuthor"].match("No Other Author access points found")) {
					
				} else {
					
					authors = dataTags["OtherAuthor"].split(/\n/);
					authors1();
				}
		
		//creates tags
			dataTags["subject"] = (contents);
			var tags;
			
			var tagLinks = doc.evaluate('//ul/a', doc, null, XPathResult.ANY_TYPE, null);
			var tagsLinksCount = doc.evaluate('count (//ul/a)', doc, null, XPathResult.ANY_TYPE, null);

				for (j = 0; j < tagsLinksCount.numberValue; j++) {
			
					tags = tagLinks.iterateNext();
					if (tags.href.match("subject")) {
					  	tagsContent.push(tags.textContent);
				 	 }
				}		
		} else {
			dataTags[fieldTitle] = (contents.replace(/^\s*|\s*$/g, ''));
		}	
	//	Z.debug(fieldTitle + ": " + dataTags[fieldTitle])
	}	

	for (var i = 0; i < tagsContent.length; i++) {
		newItem.tags[i] = tagsContent[i];
	}

	associateData (newItem, dataTags, "NameofRepository", "repository");
	associateData (newItem, dataTags, "DatesofCreation", "date");
	associateData (newItem, dataTags, "Identifier", "callNumber");
	associateData (newItem, dataTags, "PhysicalDescription", "extra");
	associateData (newItem, dataTags, "ScopeAndContent", "abstractNote");
	associateData (newItem, dataTags, "Title/StmntofResponsibility", "title");

	newItem.url = doc.location.href;
	newItem.complete();
}

function doWeb(doc, url) {
	var articles = new Array();
	if (detectWeb(doc, url) == "multiple") {
		var items = new Object();
		var titles = ZU.xpath(doc, '//tbody/tr/td/ul/li');
		var links = ZU.xpath(doc, '//tbody/tr/td/ul/li/a');
		for(var i in titles) {
			items[links[i].href] = titles[i].textContent;
		}
		Zotero.selectItems(items, function (items) {
			if (!items) {
				return true;
			}
			for (var i in items) {
				articles.push(i);
			}
			Zotero.Utilities.processDocuments(articles, scrape, function () {
				Zotero.done();
			});
		});
	} else {
		scrape(doc, url);
	}
}
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.archives.pe.ca/peiain/fondsdetail.php3?fonds=Acc2286",
		"items": [
			{
				"itemType": "book",
				"creators": [
					{
						"lastName": "Charlottetown Gas Light Company",
						"creatorType": "creator"
					}
				],
				"notes": [],
				"tags": [
					"Charlottetown Gas Light Company",
					"Corporations",
					"Day books",
					"Gas lighting"
				],
				"seeAlso": [],
				"attachments": [],
				"date": "1855-1858,1870, 1896",
				"callNumber": "Acc2286",
				"extra": ".03 m. of textual records",
				"title": "Charlottetown Gas Light Company fonds",
				"url": "http://www.archives.pe.ca/peiain/fondsdetail.php3?fonds=Acc2286",
				"libraryCatalog": "Public Archives and Records Office of Prince Edward Island",
				"accessDate": "CURRENT_TIMESTAMP"
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.archives.pe.ca/peiain/fondsdetail.php3?fonds=Acc2626",
		"items": [
			{
				"itemType": "book",
				"creators": [
					{
						"firstName": "Carrie Ellen",
						"lastName": "Holman",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [
					"Holman, Carrie Ellen, 1877-1972",
					"Radio broadcasting"
				],
				"seeAlso": [],
				"attachments": [],
				"date": "1895-1972",
				"callNumber": "Acc2626",
				"extra": ".06 m of textual records",
				"title": "Carrie Holman collection",
				"url": "http://www.archives.pe.ca/peiain/fondsdetail.php3?fonds=Acc2626",
				"libraryCatalog": "Public Archives and Records Office of Prince Edward Island",
				"accessDate": "CURRENT_TIMESTAMP"
			}
		]
	}
]
/** END TEST CASES **/
