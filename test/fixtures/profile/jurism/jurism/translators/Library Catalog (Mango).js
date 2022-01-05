{
	"translatorID": "fa87288d-406b-48cb-a957-7defcf415a64",
	"label": "Library Catalog (Mango)",
	"creator": "Sebastian Karcher",
	"target": "\\.catalog\\.fcla\\.edu/.+\\.jsp\\?",
	"minVersion": "2.1.9",
	"maxVersion": "",
	"priority": 200,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2012-09-24 12:32:34"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Mango Library Translator
	Copyright © 2011 Sebastian Karcher and CHNM

	This file is part of Zotero.

	Zotero is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	Zotero is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
	GNU Affero General Public License for more details.

	You should have received a copy of the GNU Affero General Public License
	along with Zotero. If not, see <http://www.gnu.org/licenses/>.

	***** END LICENSE BLOCK *****
*/


/*
not tests working, should work e.g. here:
http://fsu.catalog.fcla.edu/permalink.jsp?23FS000905416
http://fgcu.catalog.fcla.edu/permalink.jsp?25GC000505950
http://ucf.catalog.fcla.edu/permalink.jsp?29CF000392490
http://fau.catalog.fcla.edu/permalink.jsp?28FA000629423
*/




function detectWeb(doc, url) {
	var namespace = doc.documentElement.namespaceURI;
	var nsResolver = namespace ? function(prefix) {
		if (prefix == 'x') return namespace; else return null;
	} : null;
	//Try to avoid false positives - test for presence of MARC for individual items.
	var xpath = '//td/a[contains(@href, "&V=M")]|//td/a[contains(@href, "&V=U")]'
	if (doc.evaluate(xpath, doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext()){
		return "book";
	}
	//for multiples be conservative - make sure these are items that likely have MARC
	else if (url.match(/fl=bo|Book/) && !url.match(/\&DLS=/)) return "multiple";

}

function scrape(marc, newDoc) {
	var namespace = newDoc.documentElement.namespaceURI;
	var nsResolver = namespace ? function(prefix) {
	  if (prefix == 'x') return namespace; else return null;
	} : null;

	var newItem = new Zotero.Item();
	var record = new marc.record();
	//The width = 95% seems consistent, though there really should be a better way to get to this
	var xpath = '//table[@width="95%"]/tbody/tr[@class="trGenContent"]';
	var elmts = newDoc.evaluate(xpath, newDoc, nsResolver, XPathResult.ANY_TYPE, null);
	var elmt;
	while (elmt = elmts.iterateNext()) {

	  var tag =	ZU.xpathText(elmt, './td[1]');
	  var ind =   ZU.xpathText(elmt, './td[2]');
	  var tagValue =   ZU.xpathText(elmt, './td[3]');
	//Z.debug("tag: "+tag+" ind: "+ind+" tagValue: "+tagValue)
	if (tag == "LDR"){
	  record.leader = tagValue;
	}
	else if (tag != "FMT"){
	  tagValue = tagValue.replace(/\|/g, marc.subfieldDelimiter);
		record.addField(tag, ind, tagValue);
	}

	}
	//Z.debug(record)
		record.translate(newItem);
	// put stuff from notes into extra
		for (var i in newItem.notes){
		if (extra){
		  extra = extra + "\n" +newItem.notes[i].note;
		}
		else {
		  var	extra= newItem.notes[i].note;
		}
		}
  newItem.extra = extra;
		newItem.notes = [];
		//editors get mapped as contributors - but so do many others who should be
		// --> for books that don't have an author, turn contributors into editors.
  if (newItem.itemType=="book"){
	var hasAuthor = false;
	for (var i in newItem.creators) {
	  if (newItem.creators[i].creatorType=="author") {
	hasAuthor = true;
	  }
	}
	if (!hasAuthor) {
	  for (var i in newItem.creators) {
	if (newItem.creators[i].creatorType=="contributor") {
	  newItem.creators[i].creatorType="editor";
	}
	  }
	}
  }

  newItem.complete();

}

function pageByPage(marc, urls) {
	Zotero.Utilities.processDocuments(urls, function(newDoc) {
		scrape(marc, newDoc);
	}, function() { Zotero.done() });
}

function doWeb(doc, url) {
	var uri = doc.location.href;
	var newUri;
	// load translator for MARC
	var translator = Zotero.loadTranslator("import");
	translator.setTranslator("a6ee60df-1ddc-4aae-bb25-45e0537be973");
	translator.getTranslatorObject(function(marc) {
		var namespace = doc.documentElement.namespaceURI;
		var nsResolver = namespace ? function(prefix) {
			if (prefix == 'x') return namespace; else return null;
		} : null;

		if (detectWeb(doc, url) == "book") {
	//we prefer local MARC, but some items have only unimarc
		  var localmarc = '//td/a[contains(@href, "&V=M")]';
		  var unimarc = '//td/a[contains(@href, "&V=U")]';
			if (doc.evaluate(localmarc, doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext()){
			newUri = uri.replace(/\&V=D\&/, "&V=M&");
			}
			else if (doc.evaluate(unimarc, doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext()){
				newUri = uri.replace(/\&V=D\&/, "&V=U&");
			}
		  Z.debug(newUri);
			pageByPage(marc, [newUri]);
		}
else {	// Search results page
			var urls = new Array();
			var availableItems = new Array();
			var firstURL = false;

			var tableRows = doc.evaluate('//td[@id="dimRecords3"]/table//table[@width="100%"]', doc, nsResolver, XPathResult.ANY_TYPE, null);
			// Go through table rows
			var i = 0;
			while (tableRow = tableRows.iterateNext()) {
				// get link
				var links = doc.evaluate('.//div/a[contains(@id, "Title")]', tableRow, nsResolver, XPathResult.ANY_TYPE, null);
				var link = links.iterateNext();
				if (!link) {
					var links = doc.evaluate('.//div/a[contains(@id, "Title")]/@href', tableRow, nsResolver, XPathResult.ANY_TYPE, null);
					link = links.iterateNext();
				}

				if (link) {
					if (availableItems[link.href]) {
						continue;
					}

					// Go through links
					while (link) {
						if (link.textContent.match(/\w+/)) availableItems[link.href] = link.textContent;
						link = links.iterateNext();
					}
					i++;
				}
			};

			 Zotero.selectItems(availableItems, function (items) {
			if (!items) {
				return true;
			}

			var newUrls = new Array();
			for (var itemURL in items) {
				newUrls.push(itemURL.replace(/\&V=D\&/, "&V=M&"));
			}
			pageByPage(marc, newUrls);
			})
		}
	});

	Zotero.wait();
}
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://fsu.catalog.fcla.edu/fs.jsp?st=FS000905416&ix=pm&I=0&V=D&pm=1",
		"items": [
			{
				"itemType": "book",
				"creators": [
					{
						"firstName": "Richard C.",
						"lastName": "Sweetland",
						"creatorType": "editor"
					},
					{
						"firstName": "Daniel J.",
						"lastName": "Keyser",
						"creatorType": "editor"
					}
				],
				"notes": [],
				"tags": [
					"Psychological tests",
					"Educational tests and measurements",
					"Occupational aptitude tests",
					"Educational Measurement",
					"Psychological Tests"
				],
				"seeAlso": [],
				"attachments": [],
				"ISBN": "0933701055",
				"title": "Tests: a comprehensive reference for assessments in psychology, education, and business",
				"edition": "2nd ed",
				"place": "Kansas City, Mo",
				"publisher": "Test Corp. of America",
				"date": "1986",
				"numPages": "1122",
				"callNumber": "BF176 .T43 1986",
				"extra": "Includes indexes",
				"libraryCatalog": "Library Catalog (Mango)",
				"shortTitle": "Tests"
			}
		]
	},
	{
		"type": "web",
		"url": "http://fgcu.catalog.fcla.edu/gc.jsp?st=GC000505950&ix=pm&I=0&V=D&pm=1",
		"items": [
			{
				"itemType": "book",
				"creators": [
					{
						"firstName": "N. T.",
						"lastName": "Phillipson",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [
					"Smith, Adam",
					"Economists",
					"Scotland"
				],
				"seeAlso": [],
				"attachments": [],
				"ISBN": "0300169272",
				"title": "Adam Smith: an enlightened life",
				"place": "New Haven, CT ; London",
				"publisher": "Yale University Press",
				"date": "2010",
				"numPages": "345",
				"callNumber": "HB103.S6 P45 2010",
				"extra": "1. A Kirkcaldy upbringing -- 2. Glasgow, Glasgow University and Francis Hutcheson's enlightenment -- 3. Private study 1740-46: Oxford and David Hume -- 4. Edinburgh's early enlightenment -- 5. Smith's Edinburgh lectures: a conjectural history -- 6. Professor of moral philosophy at Glasgow, I. 1751-9 -- 7. The 'Theory of moral sentiments' and the civilizing powers of commerce -- 8. Professor of moral philosophy at Glasgow, 2. 1759-63 -- 9. Smith and the Duke of Buccleuch in Europe 1764-6 -- 10. London, Kirkcaldy and the making of the 'Wealth of nations' 1766-76 -- 11. The 'Wealth of nations' and Smith's \"very violent attack ... upon the whole commercial system of Great Britain\" -- 12. Hume's death -- 13. Last years in Edinburgh 1778-90 A Kirkcaldy upbringing -- Glasgow, Glasgow University and Francis Hutcheson's enlightenment -- Private study 1740-46 : Oxford and David Hume -- Edinburgh's early enlightenment -- Smith's Edinburgh lectures : a conjectural history -- Professor of moral philosophy at Glasgow, I. 1751-9 -- The 'Theory of moral sentiments' and the civilizing powers of commerce -- Professor of moral philosophy at Glasgow, 2. 1759-63 -- Smith and the Duke of Buccleuch in Europe 1764-6 -- London, Kirkcaldy and the making of the 'Wealth of nations' 1766-76 -- The 'Wealth of nations' and Smith's \"very violent attack ... upon the whole commercial system of Great Britain\" -- Hume's death -- Last years in Edinburgh 1778-90\nNicholas Phillipson's intellectual biography of Adam Smith shows that Smith saw himself as philosopher rather than an economist. Phillipson shows Smith's famous works were a part of a larger scheme to establish a \"Science of Man,\" which was to encompass law, history, and aesthetics as well as economics and ethics. Phillipson explains Adam Smith's part in the rapidly changing intellectual and commercial cultures of Glasgow and Edinburgh at the time of the Scottish Enlightenment. Above all Phillipson explains how far Smith's ideas developed in dialog with his closest friend David Hume. --Publisher's description",
				"libraryCatalog": "Library Catalog (Mango)",
				"shortTitle": "Adam Smith"
			}
		]
	}
]
/** END TEST CASES **/