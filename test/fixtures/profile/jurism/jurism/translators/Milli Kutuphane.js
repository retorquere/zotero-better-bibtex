{
	"translatorID": "a5998785-222b-4459-9ce8-9c081d599af7",
	"label": "Milli Kütüphane",
	"creator": "Philipp Zumstein",
	"target": "^https?://(www\\.)?kasif\\.mkutup\\.gov\\.tr/",
	"minVersion": "4.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2017-10-01 17:23:23"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2017 Philipp Zumstein
	
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


// attr()/text() v2
function attr(docOrElem,selector,attr,index){var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector);return elem?elem.getAttribute(attr):null}function text(docOrElem,selector,index){var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector);return elem?elem.textContent:null}


function detectWeb(doc, url) {
	if (url.indexOf('/SonucDetay.aspx?MakId=')>-1) {
		return "book";
	} else if (url.indexOf('/OpacArama.aspx?')>-1 && getSearchResults(doc, true)) {
		return "multiple";
	}
	Z.monitorDOMChanges(doc.getElementById('dvKapsam'), {childList: true});
}


function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;

	var rows = doc.querySelectorAll('.SonucDiv1');
	
	for (var i=0; i<rows.length; i++) {
		var onclick = rows[i].onclick;
		var href;
		if (onclick) {
			var param = onclick.toString().match(/Goster\((\d+),(\d+)\)/);
			if (param) {
				//we don't handle articles which don't have MARC data
				if (param[2] !== "1700") {
					href = 'SonucDetay.aspx?MakId=' + param[1];
				}
			}
		}
		var title = ZU.trimInternal(rows[i].textContent);
		if (!href || !title) continue;
		if (checkOnly) return true;
		found = true;
		items[href] = title;
	}
	return found ? items : false;
}


function doWeb(doc, url) {
	if (detectWeb(doc, url) == "multiple") {
		Zotero.selectItems(getSearchResults(doc, false), function (items) {
			if (!items) {
				return true;
			}
			var articles = [];
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
	
	var lines = doc.querySelectorAll('#cntPlcPortal_grdMrc tr');
	
	//call MARC translator
	var translator = Zotero.loadTranslator("import");
	translator.setTranslator("a6ee60df-1ddc-4aae-bb25-45e0537be973");
	translator.getTranslatorObject(function (marc) {

		var record = new marc.record();
		var newItem = new Zotero.Item();
		//ignore the table headings in lines[0]
		record.leader = text(lines[1], 'td', 4);
		var fieldTag, indicators, fieldContent;
		for (var j=2; j<lines.length; j++) {
			//multiple lines with same fieldTag do not repeat it
			//i.e. in these cases we will just take same value as before
			if (text(lines[j], 'td', 0).trim().length>0) {
				fieldTag = text(lines[j], 'td', 0);
			}
			indicators = text(lines[j], 'td', 1) + text(lines[j], 'td', 2);
			fieldContent = '';
			if (text(lines[j], 'td', 3).trim().length>0) {
				fieldContent = marc.subfieldDelimiter + text(lines[j], 'td', 3);
			}
			fieldContent += text(lines[j], 'td', 4);
			
			record.addField(fieldTag, indicators, fieldContent);
		}
		
		record.translate(newItem);
		
		//don't save value "no publisher" = "yayl.y."
		if (newItem.publisher == 'yayl.y.') {
			delete newItem.publisher;
		}
		
		newItem.complete();
	});
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://kasif.mkutup.gov.tr/SonucDetay.aspx?MakId=954757",
		"items": [
			{
				"itemType": "book",
				"title": "Protestanlıkta sakramentler",
				"creators": [
					{
						"firstName": "Muhammet",
						"lastName": "Tarakçı",
						"creatorType": "author"
					}
				],
				"date": "2012",
				"ISBN": "9786054487059",
				"callNumber": "2014 AD 15480",
				"language": "TUR",
				"libraryCatalog": "Milli Kütüphane",
				"numPages": "296",
				"place": "Bursa",
				"publisher": "Emin Yayınları",
				"series": "Emin Yayınları",
				"seriesNumber": "122",
				"attachments": [],
				"tags": [
					"Protestanlık (Hıristiyanlık)"
				],
				"notes": [
					{
						"note": "Dizin vardır"
					}
				],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://kasif.mkutup.gov.tr/SonucDetay.aspx?MakId=423635",
		"items": [
			{
				"itemType": "book",
				"title": "Peygamberlik makamı ve sevgili peygamberimiz",
				"creators": [
					{
						"firstName": "Nihat (F)",
						"lastName": "Dalgın",
						"creatorType": "editor"
					},
					{
						"firstName": "Yunus (F)",
						"lastName": "Macit",
						"creatorType": "editor"
					}
				],
				"date": "1992",
				"callNumber": "1993 AD 4043",
				"language": "TUR",
				"libraryCatalog": "Milli Kütüphane",
				"numPages": "126",
				"place": "Samsun",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/
