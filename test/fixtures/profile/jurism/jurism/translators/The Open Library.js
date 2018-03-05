{
	"translatorID": "96b54986-16c7-45ea-b296-fde962d658b2",
	"label": "The Open Library",
	"creator": "Sebastian Karcher",
	"target": "^https?://openlibrary\\.org",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsbv",
	"lastUpdated": "2017-05-25 13:52:51"
}

/*
	***** BEGIN LICENSE BLOCK *****
	
	Copyright © 2013 Sebastian Karcher 
	This file is part of Zotero.
	
	Zotero is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.
	
	Zotero is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU Affero General Public License for more details.
	
	You should have received a copy of the GNU Affero General Public License
	along with Zotero.  If not, see <http://www.gnu.org/licenses/>.
	
	***** END LICENSE BLOCK *****
*/

function detectWeb(doc, url) {
	if (url.match(/\/search\?/)) {
		return "multiple";
	} else if (url.search(/\/works\/OL\d+W\//)!=-1){
		if (ZU.xpathText(doc, '//h1/span/a[@title="View this edition"]')) return "book";
		else if (ZU.xpathText(doc, '//table[@id="editions"]/tbody/tr[1]/td/div[@class="title"]')); return "multiple"
	} else  if (url.search(/\/books\/OL\d+M\//)!=-1){
		return "book";
	}
}

function getEdition(doc, url){
	if (url.search(/\/books\/OL\d+M\//)!=-1) {
		scrape(doc, url);
	}
	else if (ZU.xpathText(doc, '//h1/span/a[@title="View this edition"]')){
		var editionurl = ZU.xpathText(doc, '//h1/span/a[@title="View this edition"]/@href');
		ZU.processDocuments(editionurl, scrape);
	}
	else {
		var editionurl = ZU.xpathText(doc, '//table[@id="editions"]/tbody/tr[1]/td/div[@class="title"]/a/@href');
		ZU.processDocuments(editionurl, scrape);
	}
	
}

function scrape(doc, url) {
	var regex = /(OL[A-Z0-9]+)\/.+/;
	var dcUrl = url.replace(regex, "$1.rdf");
	var olid = url.match(regex);
	
	//no ISBN in the RDF data; scraping that from the page; sigh.
	var isbnscrape;
	if (ZU.xpathText(doc, '//td[@class="title" and span[contains(text(), "ISBN 13")]]') ){
		isbnscrape = ZU.xpathText(doc, '//td[@class="title" and span[contains(text(), "ISBN 13")]]/following-sibling::td');
	} else {
		isbnscrape = ZU.xpathText(doc, '//td[@class="title" and span[contains(text(), "ISBN 10")]]/following-sibling::td');
	}
	Zotero.Utilities.doGet(dcUrl, function (text) {
		//Z.debug(text)
		var docxml = (new DOMParser()).parseFromString(text, "text/xml");
  	 	ns = {	"rdf" : "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
				"rdfs" : "http://www.w3.org/2000/01/rdf-schema#",
				"ol" : "http://openlibrary.org/type/edition#",
				"owl" : "http://www.w3.org/2002/07/owl#",
				"bibo" : "http://purl.org/ontology/bibo/",
				"rdvocab" : "http://RDVocab.info/elements/",
				"rdrel" : "http://RDVocab.info/RDARelationshipsWEMI/",
				"dcterms" : "http://purl.org/dc/terms/",
				"dc" : "http://purl.org/dc/elements/1.1/",
				"dcam" : "http://purl.org/dc/dcam/",
				"foaf" : "http://xmlns.com/foaf/0.1/",
				"ov"	: "http://open.vocab.org/terms.ttl"};
		var authors = ZU.xpath(docxml, '//bibo:authorList//rdf:Description/foaf:name', ns);
		var numPages = ZU.xpathText(docxml, '//dcterms:extent', ns);
		var place = ZU.xpathText(docxml, '//rdvocab:placeOfPublication', ns);
		var isbn = ZU.xpathText(docxml, '//bibo:isbn10|//bibo:isbn13', ns);
		var note = ZU.xpathText(docxml, '//rdvocab:note', ns);
		var translator = Zotero.loadTranslator("import");
		translator.setTranslator("5e3ad958-ac79-463d-812b-a86a9235c28f");
		translator.setString(text);
		translator.setHandler("itemDone", function (obj, item) {
			item.itemType = "book";
			//the DC doesn't distinguish between personal and institutional authors - get them from the page and parse
			//var authors = ZU.xpath(doc, '//div[@id="archivalDescriptionArea"]//div[@class="field"]/h3[contains(text(), "Name of creator")]/following-sibling::div/a');
			item.creators = [];
			for (i = 0; i<authors.length; i++) {
				item.creators.push(ZU.cleanAuthor(authors[i].textContent, "author"));
				//if (!item.creators[i].firstName) item.creators[i].fieldMode = 1;
			}
			//The Archive gets mapped to the relations tag - we want its name, not the description in archeion
			if (numPages) item.numPages = numPages.replace(/p\..*/, "");
			if (note) item.notes.push(note);
			if (item.extra) item.abstractNote=item.extra; item.extra="";
			if (olid) {
				item.extra = "Open Library ID: " + olid[1];
			}
			item.place = place;
			if (isbn) item.ISBN= isbn;
			else item.ISBN = isbnscrape;
			item.itemID = "";
			item.title = item.title.replace(/\s:/, ":")
			item.complete();
		});
	translator.translate();
	});
}

function doWeb(doc, url) {
	if (detectWeb(doc, url) == "multiple") {
		var articles = new Array();
		var items = new Object();
		//If scraping from search results, we take the first edition listed for a work. 
		//If scraping from a "Works" page, however, we let the user pick the edition 
		//search results
		var titles = ZU.xpath(doc, '//h3[@class="booktitle"]/a');
		//works pages with multiple editions
		if (titles.length<1){
			titles = ZU.xpath(doc, '//table[@id="editions"]//div[@class="title"]/a')
		}
		for (var i in titles) {
			items[titles[i].href] = titles[i].textContent;
		}
		Zotero.selectItems(items, function (items) {
			if (!items) {
				return true;
			}
			for (var i in items) {
				articles.push(i);
			}
			Zotero.Utilities.processDocuments(articles, getEdition);
		});
	} else {
		if (url.search(/\/works\/OL\d+W/)!=-1) getEdition(doc, url);
		else scrape(doc, url);
	}
}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://openlibrary.org/search?q=skocpol",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://openlibrary.org/works/OL2079360W/Boomerang",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://openlibrary.org/works/OL2079351W/Etats_et_r%c3%a9volutions_sociales",
		"items": [
			{
				"itemType": "book",
				"title": "Etats et révolutions sociales",
				"creators": [
					{
						"firstName": "Theda",
						"lastName": "Skocpol",
						"creatorType": "author"
					}
				],
				"date": "April 3, 1985",
				"ISBN": "9782213014012",
				"extra": "Open Library ID: OL12455445M",
				"libraryCatalog": "The Open Library",
				"numPages": "486",
				"publisher": "Fayard",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://openlibrary.org/books/OL13188011M/Borges",
		"items": [
			{
				"itemType": "book",
				"title": "Borges: Prosa Completa  4 Volumes",
				"creators": [
					{
						"firstName": "Jorge Luis",
						"lastName": "Borges",
						"creatorType": "author"
					}
				],
				"date": "1985",
				"ISBN": "9788402103222",
				"extra": "Open Library ID: OL13188011M",
				"libraryCatalog": "The Open Library",
				"publisher": "Bruguera",
				"shortTitle": "Borges",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/