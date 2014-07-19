{
	"translatorID": "d9a16cf3-8b86-4cab-8610-dbd913ad1a44",
	"label": "Archives Canada-France",
	"creator": "Adam Crymble",
	"target": "^https?://bd\\.archivescanadafrance\\.org",
	"minVersion": "1.0.0b4.r5",
	"maxVersion": "",
	"priority": 100,
	"browserSupport": "gcsibv",
	"inRepository": true,
	"translatorType": 4,
	"lastUpdated": "2012-01-01 01:42:16"
}

function detectWeb(doc, url) {
	
	if (doc.location.href.match("doc.xsp?")) {
		return "book";
	} else if (doc.evaluate('//li/a', doc, null, XPathResult.ANY_TYPE, null).iterateNext()) {
		return "multiple";
	} else if (doc.evaluate('//td[1][@class="icones"]/a', doc, null, XPathResult.ANY_TYPE, null).iterateNext()) {
		return "multiple";
	}
}

function associateData (newItem, dataTags, field, zoteroField) {
	if (dataTags[field]) {
		newItem[zoteroField] = dataTags[field];
	}
}

function scrape(doc, url) {

	var namespace = doc.documentElement.namespaceURI;
	var nsResolver = namespace ? function(prefix) {
		if (prefix == 'x') return namespace; else return null;
	} : null;	
	
	var dataTags = new Object();
	var tagsContent = new Array();
	var fieldTitle;
		
	var newItem = new Zotero.Item("book");
	var xPathHeaders = '//td[2]/div[@class="ead-c"]/div[@class="ead-did"]/table[@class="ead-did"]/tbody/tr/td[1]';

	if (doc.evaluate(xPathHeaders, doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext()) {
		var headers = doc.evaluate(xPathHeaders, doc, nsResolver, XPathResult.ANY_TYPE, null);
		var contents = doc.evaluate('//td[2][@class="did-content"]', doc, nsResolver, XPathResult.ANY_TYPE, null);
	
		while (fieldTitle = headers.iterateNext()) {
			fieldTitle = fieldTitle.textContent.replace(/\s+/g, '');
			if (fieldTitle == "Origination" || fieldTitle == "Origine") {
				fieldTitle = "Origination";
			}
			dataTags[fieldTitle] = Zotero.Utilities.cleanTags(contents.iterateNext().textContent.replace(/^\s*|\s*$/g, ''));
		}
		
		if (dataTags["Origination"]) {
			var author = dataTags["Origination"];
			if (!author.match(", ")) {
				newItem.creators.push({lastName: author, creatorType: "author"});
			} else {
				var authors = author.split(", ");
				author = authors[1] + " " + authors[0];
				newItem.creators.push(Zotero.Utilities.cleanAuthor(author, "author"));
			}
		}
	}
	
	
	if (doc.evaluate('//h1[@class="doc-title"]', doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext()) {
		newItem.title = doc.evaluate('//h1[@class="doc-title"]', doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext().textContent;
	} else if (doc.evaluate('//td[2]/div[@class="notice"]/p', doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext()) {
		newItem.title = doc.evaluate('//td[2]/div[@class="notice"]/p', doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext().textContent;
	} else {		
		newItem.title = doc.title + " Title Not Found";
	}
		
	associateData (newItem, dataTags, "PhysicalDescription", "pages");
	associateData (newItem, dataTags, "Descriptionmatérielle", "pages");
	
	associateData (newItem, dataTags, "Repository", "repository");
	associateData (newItem, dataTags, "Lieudeconservation", "repository");
	
	associateData (newItem, dataTags, "LanguageoftheMaterial", "language");
	associateData (newItem, dataTags, "Langue", "language");
	
	associateData (newItem, dataTags, "Identifier", "callNumber");
	associateData (newItem, dataTags, "Cote", "callNumber");
	
	associateData (newItem, dataTags, "Datesextrêmes", "date");
	associateData (newItem, dataTags, "Dates", "date");

	newItem.url = doc.location.href;
	newItem.complete();
}

function doWeb(doc, url) {
	var namespace = doc.documentElement.namespaceURI;
	var nsResolver = namespace ? function(prefix) {
		if (prefix == 'x') return namespace; else return null;
	} : null;
	
	var articles = new Array();
	
	if (detectWeb(doc, url) == "multiple") {
		
		var items = new Object();
		
		if (doc.evaluate('//td[1][@class="icones"]/a', doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext()) {
			var titles = doc.evaluate('//td[2][@class="ressource"]', doc, nsResolver, XPathResult.ANY_TYPE, null);
			var titlesCount = doc.evaluate('count (//td[2][@class="ressource"])', doc, nsResolver, XPathResult.ANY_TYPE, null);
			var links = doc.evaluate('//td[1][@class="icones"]/a', doc,  nsResolver, XPathResult.ANY_TYPE, null);
				
			var next_link;
			
			for (var i = 0; i < titlesCount.numberValue; i++) {
				next_link = links.iterateNext().href;
				if (!next_link.match("doc.xsp")) {
					next_link = links.iterateNext().href;
				}
				items[next_link] = titles.iterateNext().textContent;
			}
		}
		
		if (doc.evaluate('//li/a', doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext()) {
			var titles = doc.evaluate('//li/a', doc, nsResolver, XPathResult.ANY_TYPE, null);
			var next_title;
			while (next_title = titles.iterateNext()) {
				items[next_title.href] = next_title.textContent;
			}
		}
		
		items = Zotero.selectItems(items);
			for (var i in items) {
				articles.push(i);
			}
		
	} else if (doc.evaluate('//div[@class="ancestor"]/a', doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext()) {
		
		var link = doc.evaluate('//div[@class="ancestor"]/a', doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext().href;
	
		articles = [link];
	} else {
		articles = [url]
	}
	Zotero.Utilities.processDocuments(articles, scrape, function() {Zotero.done();});
	Zotero.wait();
}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://bd.archivescanadafrance.org/sdx-222-acf-pleade-2/acf/search-acf.xsp?sq1=montreal&fi1=fulltext&sq2=&fi2=fulltext&sq3=&fi3=fulltext&ed=&dbeg=&dend=&frepo=&forig=&x=0&y=0#resume",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://bd.archivescanadafrance.org/sdx-222-acf-pleade-2/acf/doc.xsp?id=CAANQ_PISTARD_03Q808_392_CAANQ_PISTARD_03Q808_392&qid=sdx_q0&fmt=tab&base=fa&n=5&root=CAANQ_PISTARD_03Q808_392&ss=true&as=&ai=&from=",
		"items": [
			{
				"itemType": "book",
				"creators": [],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [],
				"title": "Fonds Intendants",
				"url": "http://bd.archivescanadafrance.org/sdx-222-acf-pleade-2/acf/doc.xsp?id=ANQ_00001_intendants&fmt=tab&base=fa&root=CAANQ_PISTARD_03Q808_392&n=5&qid=sdx_q0&ss=true&as=&ai=",
				"libraryCatalog": "Archives Canada-France",
				"accessDate": "CURRENT_TIMESTAMP"
			}
		]
	}
]
/** END TEST CASES **/