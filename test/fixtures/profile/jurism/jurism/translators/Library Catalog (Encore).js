{
	"translatorID": "446764bf-7da6-49ec-b7a7-fefcbafe317f",
	"label": "Library Catalog (Encore)",
	"creator": "Sebastian Karcher",
	"target": "/iii/encore/(record|search)",
	"minVersion": "1.0",
	"maxVersion": "",
	"priority": 270,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsb",
	"lastUpdated": "2014-08-26 03:59:48"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Encore Library Catalog Translator
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


function detectWeb(doc, url){
	var bibIdRe = new RegExp("encore/record");
	if (bibIdRe.test(url)){
		return "book";
	}

var bibIdSearch = new RegExp("encore/search");
	if (bibIdSearch.test(url)){
		return "multiple";
	}
}




function doWeb(doc, url) {
	var uri = doc.location.href;
	var newUri;
	// load translator for MARC
	var translator = Zotero.loadTranslator("import");
	translator.setTranslator("a6ee60df-1ddc-4aae-bb25-45e0537be973");
	translator.getTranslatorObject(function(marc) {
		if (detectWeb(doc, url) == "book") {
			newUri = uri.replace(/\?/, "?marcData=Y&");
			pageByPage(marc, [newUri]);
		} else {	// Search results page
			// Require link to match this
			var tagRegexp = new RegExp();
			tagRegexp.compile('^https?://[^/]+/search\\??/[^/]+/[^/]+/[0-9]+\%2C[^/]+/frameset');
			
			var urls = new Array();
			var availableItems = {};
			var firstURL = false;
			
			var tableRows = doc.evaluate('//td[@class="browseResultContent" or @class="itemTitleCell"]|//div[contains(@class,"searchResult") and contains(@class, "Browse")] ',
										 doc, null, XPathResult.ANY_TYPE, null);
			// Go through table rows
			var i = 0;
			while(tableRow = tableRows.iterateNext()) {
				// get link
				var links = ZU.xpath(tableRow, './/*[@class="dpBibTitle"]/span/a');
				if (links.length==0) links = ZU.xpath(tableRow, './/*[@class="dpBibTitle"]/a');							
				for (var i=0; i<links.length; i++) {
					if(availableItems[links[i].href]) {
						continue;
					}							
					if (links[i].textContent.match(/\w+/)){ 
						availableItems[links[i].href] = links[i].textContent.trim();}
					}
			};
			Zotero.selectItems(availableItems, function (items) {
				if(!items) {
					return true;
				}
				
				var newUrls = new Array();
				for(var itemURL in items) {
					newUrls.push(itemURL.replace("?", "?marcData=Y&"));
				}
				pageByPage(marc, newUrls);
			});
		}
	});
}



//functions:
function scrape(marc, newDoc) {

	var xpath = '//pre/text()';
	if (newDoc.evaluate(xpath, newDoc, null, XPathResult.ANY_TYPE, null).iterateNext()) {
		var elmts = newDoc.evaluate(xpath, newDoc, null, XPathResult.ANY_TYPE, null);
		var useNodeValue = true;
	} else {
		var elmts = newDoc.evaluate('//pre', newDoc, null, XPathResult.ANY_TYPE, null);
		var useNodeValue = false;
	}

	var elmt;
	while(elmt = elmts.iterateNext()) {
		if (useNodeValue) {
			var text = elmt.nodeValue;
		} else {
			var text = elmt.textContent;
		}
		var newItem = new Zotero.Item();
		var record = new marc.record();
		
		var linee = text.split("\n");
		for (var i=0; i<linee.length; i++) {
			if(!linee[i]) {
				continue;
			}
			
			linee[i] = linee[i].replace(/[\xA0_\t]/g, " ");
			var value = linee[i].substr(7);
			
			if(linee[i].substr(0, 6) == "      ") {
				// add this onto previous value
				tagValue += value;
			} else {
				if(linee[i].substr(0, 6) == "LEADER") {
					// trap leader
					record.leader = value;
				} else {
					if(tagValue) {	// finish last tag
						tagValue = tagValue.replace(/\|(.)/g, marc.subfieldDelimiter+"$1");
						if(tagValue[0] != marc.subfieldDelimiter) {
							tagValue = marc.subfieldDelimiter+"a"+tagValue;
						}
						
						// add previous tag
						record.addField(tag, ind, tagValue);
					}
					
					var tag = linee[i].substr(0, 3);
					var ind  = linee[i].substr(4, 2);
					var tagValue = value;
				}
			}
		}
		if(tagValue) {
			tagValue = tagValue.replace(/\|(.)/g, marc.subfieldDelimiter+"$1");
			if(tagValue[0] != marc.subfieldDelimiter) {
				tagValue = marc.subfieldDelimiter+"a"+tagValue;
			}
			
			// add previous tag
			record.addField(tag, ind, tagValue);
		}
		
		record.translate(newItem);
		//the library catalogue name isn't perfect, but should be unambiguous. 
		var domain = newDoc.location.href.match(/https?:\/\/([^/]+)/);
		newItem.repository = domain[1].replace(/encore\./, "")+" Library Catalog";
		// there is too much stuff in the note field - or file this as an abstract?
		newItem.notes = [];		
		newItem.complete();
	}
}

function pageByPage(marc, urls) {
	Zotero.Utilities.processDocuments(urls, function(newDoc) {
		scrape(marc, newDoc);
	}, function() { Zotero.done() });
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://encore.colorado.edu/iii/encore/search?formids=target&lang=eng&suite=def&reservedids=lang%2Csuite&submitmode=&submitname=&target=thelen&Search.x=0&Search.y=0",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://encore.coalliance.org/iii/encore/search/C|Sthelen|Orightresult|U1?lang=eng",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://encore.colorado.edu/iii/encore/record/C__Rb5910060__Sthelen__P0%2C3__Orightresult__X4?lang=eng&suite=cobalt",
		"items": [
			{
				"itemType": "book",
				"creators": [
					{
						"firstName": "Marcel",
						"lastName": "Thelen",
						"creatorType": "editor"
					},
					{
						"firstName": "F.",
						"lastName": "Steurs",
						"creatorType": "editor"
					}
				],
				"notes": [],
				"tags": [
					"Language and languages",
					"Terms and phrases"
				],
				"seeAlso": [],
				"attachments": [],
				"ISBN": "9789027223371",
				"title": "Terminology in everyday life",
				"place": "Amsterdam, The Netherlands : Philadelphia, Pa",
				"publisher": "John Benjamins Pub. Co",
				"date": "2010",
				"numPages": "271",
				"series": "Terminology and lexicography research and practice",
				"seriesNumber": "v. 13",
				"callNumber": "P305 .T4437 2010",
				"libraryCatalog": "colorado.edu Library Catalog"
			}
		]
	}
]
/** END TEST CASES **/