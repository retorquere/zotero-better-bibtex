{
	"translatorID": "b8a86e36-c270-48c9-bdd1-22aaa167ef46",
	"label": "Agencia del ISBN",
	"creator": "Michael Berkowitz",
	"target": "^https?://www\\.mcu\\.es/webISBN",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcs",
	"lastUpdated": "2015-06-10 11:33:38"
}

function detectWeb(doc, url) {
	if (doc.evaluate('//div[@class="isbnResultado"]/div[@class="isbnResDescripcion"]', doc, null, XPathResult.ANY_TYPE, null).iterateNext()) {
		return "multiple";
	} else if (doc.evaluate('//div[@class="fichaISBN"]/div[@class="cabecera"]', doc, null, XPathResult.ANY_TYPE, null).iterateNext()) {
		return "book";
	}
}

function doWeb(doc, url) {
	var books = new Array();
	if (detectWeb(doc, url) == "multiple") {
		var items = new Object();
		var boxes = doc.evaluate('//div[@class="isbnResultado"]/div[@class="isbnResDescripcion"]', doc, null, XPathResult.ANY_TYPE, null);
		var box;
		while (box = boxes.iterateNext()) {
			var book = doc.evaluate('./p/span/strong/a', box, null, XPathResult.ANY_TYPE, null).iterateNext();
			items[book.href] = book.textContent;
		}
		Zotero.selectItems(items, function (items) {
			if (!items) {
				return true;
			}
			for (var i in items) {
				books.push(i);
			}
			Zotero.Utilities.processDocuments(books, scrape);	
		});
		
	} else {
		scrape(doc, url);
	}
}
		
		
	function scrape (doc, url){	
		var data = new Object();
		var rows = doc.evaluate('//div[@class="fichaISBN"]/table/tbody/tr', doc, null, XPathResult.ANY_TYPE, null);
		var next_row;
		while (next_row = rows.iterateNext()) {
			var heading = doc.evaluate('./th', next_row, null, XPathResult.ANY_TYPE, null).iterateNext().textContent;
			var value = doc.evaluate('./td', next_row, null, XPathResult.ANY_TYPE, null).iterateNext().textContent;
			data[heading.replace(/\W/g, "")] = value;
		}
		var isbn = Zotero.Utilities.trimInternal(doc.evaluate('//span[@class="cabTitulo"]/strong', doc, null, XPathResult.ANY_TYPE, null).iterateNext().textContent);
		var item = new Zotero.Item("book");
		item.ISBN = isbn;
		item.title = Zotero.Utilities.trimInternal(data['Ttulo']);
		item.title= item.title.replace(/\s+:/, ":");
		author = data['Autores'];
		if (author) {
			var authors = author.match(/\b.*,\s+\w+[^([]/g);
			for (var i=0; i<authors.length; i++) {
				var aut = Zotero.Utilities.trimInternal(authors[i]);
				item.creators.push(Zotero.Utilities.cleanAuthor(Zotero.Utilities.trimInternal(aut), "author", true));
			}
		}
		if (data['Publicacin']) item.publisher = Zotero.Utilities.trimInternal(data['Publicacin']);
		if (data['FechaEdicin']) item.date = Zotero.Utilities.trimInternal(data['FechaEdicin']);
		item.complete();
	}
/** BEGIN TEST CASES **/
var testCases = []
/** END TEST CASES **/