{
	"translatorID": "89592f50-6ae8-491e-8988-969002012b1b",
	"label": "National Library of Belarus",
	"creator": "Philipp Zumstein",
	"target": "^https?://www\\.nlb\\.by/portal/page/portal/index/resources/(basicsearch|expandedsearch|anothersearch|authoritet|newdoc|top100)",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2017-01-01 15:28:10"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2014 Philipp Zumstein

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
	if (url.indexOf('strutsAction=biblinfoaction.do') != -1 && getMarcNode(doc).length>0 ) {//single item
		return "book";
	} else if (getSearchResults(doc, true)) {
		return "multiple";
	}
}


//for testing in detectWeb use true for checkOnly
//for the items in doWeb use false for checkOnly
//then the items will be an object containing the href/title pairs
function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = ZU.xpath(doc, '//div[@id="search_result" or @id="expandedsearchView"]//td[contains(@class, "link")]//a' );
	for (var i=0; i<rows.length; i++) {
		var href = rows[i].href;
		var title = ZU.trimInternal(rows[i].textContent);
		if (!href || !title) continue;
		if (title != "") {
			if (checkOnly) return true;
			found = true;
			items[href] = title;
		}
	}
	return found ? items : false;
}

function getMarcNode(doc) {//the node in the DOM contains the BELMARC data
	return ZU.xpath(doc, '//div[contains(@id, "belmarc")]//td[not(contains(@class, "fon_gray"))]/font[contains(@class, "tekst")]');
}

function doWeb(doc, url) {
	if (detectWeb(doc, url) == "multiple") {
		
		Zotero.selectItems(getSearchResults(doc, false), function (items) {
			if (!items) {
				return true;
			}
			var articles = new Array();
			for (var i in items) {
				articles.push(i);
			}
			ZU.processDocuments(articles, scrape);
		});
	} else {
		scrape(doc, url);
	}
}


function scrape(doc, url) {
	var children = getMarcNode(doc)[0].childNodes;
	var lines = [];
	for (var i=0; i<children.length; i++) {
		if (children[i].nodeType == 3) {//ignore <br> nodes, only textNodes
			var text = ZU.trimInternal(children[i].textContent) ;
			if (text.length>0) {
				lines.push(text);
			}
		}
	}
	//Z.debug(lines);
	
	//call MARC translator
	var translator = Zotero.loadTranslator("import");
	
	translator.setTranslator("a6ee60df-1ddc-4aae-bb25-45e0537be973");
	translator.getTranslatorObject(function (marc) {

		var record = new marc.record();
		var newItem = new Zotero.Item();
		record.leader = lines[0];
		for (var j=1; j<lines.length; j++) {
			var currentLine = lines[j];
			var fieldTag = currentLine.substr(0,3);
			var indicators;
			var fieldContent;
			if (fieldTag.substr(0,2) == "00") {
				indicators = "";
				fieldContent = currentLine.substr(4);
			} else {
				indicators = currentLine.substr(4,2);
				fieldContent = currentLine.substr(7).replace(/\$(\w)\s*/g, marc.subfieldDelimiter+"$1");
			}
			
			record.addField( fieldTag, indicators, fieldContent);
		}
		
		record.translate(newItem);
		
		record._associateDBField(newItem, 899, "p", "callNumber");
		record._associateDBField(newItem, 215, "a", "numPages");//this field may contain more information about the extent of a book, therefore we do here on porpuse no more cleaning of the number only (has to be done manually)
		record._associateTags(newItem, 606, "a");
		
		newItem.complete();
	});
	
	
}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.nlb.by/portal/page/portal/index/resources/expandedsearch?classId=B33E739B22884D82AACAC24EBFB1DA89&submitR=empty&_piref73_180746_73_34794_34794.biId=386521&_piref73_180746_73_34794_34794.strutsAction=biblinfoaction.do&lang=en",
		"items": [
			{
				"itemType": "book",
				"title": "Vibrational states in deformed nuclei.Chaos,order and individual nature of nuclei",
				"creators": [
					{
						"firstName": "V. G. V. G.",
						"lastName": "Soloviev ",
						"creatorType": "author"
					}
				],
				"date": "1993",
				"callNumber": "1Ок25736(ДХ)",
				"language": "eng",
				"libraryCatalog": "National Library of Belarus",
				"numPages": "20p",
				"place": "Dubna",
				"series": "Prepr",
				"seriesNumber": "E4-93-223--",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/