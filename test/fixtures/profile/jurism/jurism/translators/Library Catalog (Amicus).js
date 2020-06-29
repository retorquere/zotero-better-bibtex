{
	"translatorID": "a0a9a45c-cc9e-497c-962e-a366618df985",
	"label": "Library Catalog (Amicus)",
	"creator": "Sebastian Karcher",
	"target": "^https?://amicus\\.collectionscanada\\.ca/aaweb-bin/aamain",
	"minVersion": "2.1.9",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2014-08-26 03:47:57"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Amicus Library Translator
	Copyright ? 2011 Sebastian Karcher and CHNM

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


function detectWeb(doc, url) {
	if (url.match(/aamain\/itemdisp/)){
		return "book"
	}
	else if (url.match(/aamain\/rqst_sb/)){
		return "multiple";
	}
}

function scrape(marc, newDoc) {
	var namespace = newDoc.documentElement.namespaceURI;
	var nsResolver = namespace ? function(prefix) {
	  if (prefix == 'x') return namespace; else return null;
	} : null;
	var xpath = '//pre';
	var elmts = newDoc.evaluate(xpath, newDoc, null, XPathResult.ANY_TYPE, null);
	var elmt;
	while (elmt = elmts.iterateNext()) {
		var text = elmt.textContent;
		text = text.replace(/AMICUS No. [0-9]+\n\s+/, "");
		//Z.debug(text);
		var newItem = new Zotero.Item();
		var record = new marc.record();
		
		var linee = text.split("\n");
		linee[0]=linee[0].replace(/^\s+/, "");
		//Zotero.debug(linee[0]);
		for (var i=0; i<linee.length; i++) {
			if (!linee[i]) {
				continue;
			}
			
			var value = linee[i].substr(7);
			if (linee[i].substr(0, 6) == "      ") {
				// add this onto previous value
				tagValue += value;
			} else {
				if (linee[i].substr(0, 3) == "000") {
					// trap leader
					record.leader = value;
					//Zotero.debug("Leader: " + record.leader);
				} else {
					if (tagValue) {	// finish last tag
						tagValue = tagValue.replace(/º/g, marc.subfieldDelimiter);
						if (tagValue[0] != marc.subfieldDelimiter) {
							tagValue = marc.subfieldDelimiter+"a"+tagValue;
						}
						//Zotero.debug("tag: "+tag+" ind: " + ind+" tagValue: "+tagValue );
						record.addField(tag, ind, tagValue);
					}
					var tag = linee[i].substr(0, 3);
					var ind  = linee[i].substr(4, 2);
					var tagValue = value;
				}
			}
		}
		if (tagValue) {
			tagValue = tagValue.replace(/º/g, marc.subfieldDelimiter);
			if (tagValue[0] != marc.subfieldDelimiter) {
				//Z.debug("here")
				tagValue = marc.subfieldDelimiter+"a"+tagValue;
			}
			// add previous tag
			//Zotero.debug("tag: "+tag+" ind: " + ind+" tagValue: "+tagValue );
			record.addField(tag, ind, tagValue);
		}
		//Zotero.debug(record);
		record.translate(newItem);
	 
		// put stuff from notes into extra, separated by new lines for each note
		for (var i in newItem.notes) {
			if (extra) {
				extra = extra + "\n" +newItem.notes[i].note
			} else {
				var extra = newItem.notes[i].note		
			}
		}
		newItem.extra = extra
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
}

function pageByPage(marc, urls) {
	Z.debug(urls)
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
			if (url.search(/\&d=\d/)!= -1) newUri = url.replace(/\&d=\d/, "&d=3")
			else newUri = url+"&d=3"
			//Z.debug(newUri);
			pageByPage(marc, [newUri]);
		} 
		
		
		else {	// Search results page
			// Require link to match this
			var tagRegexp = new RegExp();
			tagRegexp.compile('^https?://[^/]+/search\\??/[^/]+/[^/]+/[0-9]+\%2C[^/]+/frameset');
			
			var urls = new Array();
			var availableItems = new Array();
			var firstURL = false;
			
			var tableRows = doc.evaluate('//table/tbody/tr[@valign="TOP"]', doc, nsResolver, XPathResult.ANY_TYPE, null);
			// Go through table rows
			var i = 0;
			while (tableRow = tableRows.iterateNext()) {
				// get link
				var links = doc.evaluate('.//td/a[0]', tableRow, nsResolver, XPathResult.ANY_TYPE, null);
				var link = links.iterateNext();
				if (!link) {
					var links = doc.evaluate(".//a[@href]", tableRow, nsResolver, XPathResult.ANY_TYPE, null);
					link = links.iterateNext();
				}
				
				if (link) {
					if (availableItems[link.href]) {
						continue;
					}
					
					// Go through links
					while (link) {
						if (link.textContent.match(/\w+/))
							availableItems[link.href] = link.textContent;
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
					newUrls.push(itemURL + "&d=3");
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
		"url": "http://amicus.collectionscanada.ca/aaweb-bin/aamain/itemdisp?sessionKey=999999999_142&l=0&d=2&v=0&lvl=1&itm=10442013",
		"items": [
			{
				"itemType": "book",
				"title": "Adam Smith (1723-1790): ein Werk und seine Wirkungsgeschichte",
				"creators": [
					{
						"firstName": "Heinz-Dieter",
						"lastName": "Kurz",
						"creatorType": "editor"
					}
				],
				"date": "1990",
				"ISBN": "9783926570260",
				"callNumber": "HB103.S6 A6223 1990",
				"libraryCatalog": "Library Catalog (Amicus)",
				"numPages": "297",
				"place": "Marburg",
				"publisher": "Metropolis",
				"shortTitle": "Adam Smith (1723-1790)",
				"attachments": [],
				"tags": [
					"Smith, Adam"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/