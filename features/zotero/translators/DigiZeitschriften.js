{
	"translatorID": "e46830a2-1b19-4b6b-9f1a-e5e9760a0f80",
	"label": "DigiZeitschriften",
	"creator": "Philipp Zumstein",
	"target": "^https?://www\\.digizeitschriften\\.de/((en/)?dms/|index\\.php\\?id=27[24])",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsv",
	"lastUpdated": "2014-05-08 23:06:53"
}

/*
	***** BEGIN LICENSE BLOCK *****

	DigiZeitschriften Translator, Copyright © 2014 Philipp Zumstein
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
	if (url.indexOf("/img/") != -1 || url.indexOf("index.php?id=274") != -1 ) {//e.g. http://www.digizeitschriften.de/index.php?id=274&PPN=PPN342672002_0020&DMDID=dmdlog84&L=2
		return "journalArticle";
	} else if ( (url.indexOf("/toc/") != -1 || url.indexOf("index.php?id=272")) && getSearchResults(doc).length>0) {
		return "multiple";
	}
}


function getSearchResults(doc) {
	return ZU.xpath(doc, '//span[contains(@class, "sitetitle") and ./parent::a/following-sibling::div]');
}

function doWeb(doc, url) {
	var articles = new Array();
	if (detectWeb(doc, url) == "multiple") {
		var items = {};
		var titles = getSearchResults(doc);
		for (var i=0; i<titles.length; i++) {
			items[titles[i].parentNode.href] = titles[i].textContent;
		}
		Zotero.selectItems(items, function (items) {
			if (!items) {
				return true;
			}
			for (var i in items) {
				articles.push(i);
			}
			ZU.processDocuments(articles, scrape);
		});
	} else {
		scrape(doc, url);
	}
}


function extractField(fieldName, text) {
	//extracts the value of the field with the name 'fieldName'
	//in the text 'text' and returns it
	var expression = new RegExp("<span>\\s*<strong>\\s*"+fieldName+":?\\s*</strong>\\s*</span>\\s*<span>([^<]*)</span>");
	var extraction = text.match(expression);
	if (extraction) {
		return extraction[1];
	} else {
		return false;
	}
}


function scrape(doc, url) {
	var metadataUrl = ZU.xpath(doc, '//ul[@id="submenu"]/li[2]/a')[0].href.replace("/en/", "/");
	var item = new Zotero.Item("journalArticle");
	ZU.doGet(metadataUrl, function(text) {
		var structure = {};
		var type;
		var posBefore = text.indexOf('<ul xmlns:mods="http://www.loc.gov/mods/v3">');
		var posAfter = text.indexOf('<ul xmlns:mods="http://www.loc.gov/mods/v3">', posBefore+1);
		while (posAfter>-1) {
			type = extractField("Strukturtyp", text.substring(posBefore, posAfter) );
			structure[type] = [posBefore, posAfter];
			posBefore = posAfter;
			posAfter = text.indexOf('<ul xmlns:mods="http://www.loc.gov/mods/v3">', posBefore+1);
		}
		type = extractField("Strukturtyp", text.substring(posBefore) );
		structure[type] = [posBefore, text.length];
		//Z.debug(structure);
		
		var articleData;
		//check whether last type was article or something similar
		if (type != "Zeitschrift" && type != "Zeitschriftenband" && type != "Zeitschriftheft" && type != "Zeitschriftenteil") {
			articleData = text.substring(structure[type][0], structure[type][1]);
		} else {
			Z.debug(structure);
			throw new Error('Unsupported item type.');
		}
		
		item.title = extractField("Titel", articleData );
		
		var author = extractField("Autor", articleData );
		if (author) {
			item.creators.push( ZU.cleanAuthor( author, "author") );
		}
		
		if (structure["Zeitschriftenheft"]) {
			var issueData = text.substring(structure["Zeitschriftenheft"][0], structure["Zeitschriftenheft"][1]);
			item.issue = extractField("Titel", issueData);
		}
		
		if (structure["Zeitschriftenband"]) {
			var volumeData = text.substring(structure["Zeitschriftenband"][0], structure["Zeitschriftenband"][1]);
			item.publication = extractField("Titel", volumeData );
			item.volume = extractField("Band", volumeData );
			item.date = extractField("Erscheinungsjahr", volumeData );
			item.publisher = extractField("Verlag", volumeData );
		}
		
		if (structure["Zeitschrift"]) {
			var journalData = text.substring(structure["Zeitschrift"][0], structure["Zeitschrift"][1]);
			item.place = extractField("Erscheinungsort", journalData );
			item.issn = extractField("ISSN", journalData );
		}
		
		var pages = ZU.xpathText(doc, '(//span[contains(@class, "struct")])[last()]');
		pages = pages.match(/(?:\d+\s*-\s*)?\d+\s*$/);
		if (pages) item.pages = pages[0].replace(/\s+/g, '');
		
		item.attachments = [{
			title: "Snapshot",
			document:doc
		}];
		
		item.complete();
	});
	
}
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.digizeitschriften.de/dms/img/?PPN=PPN356261603_0054&DMDID=dmdlog15",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"firstName": "Wolfgang",
						"lastName": "Schuster",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"title": "Quadratische Identitäten bei Polygonen.",
				"publication": "Aequationes Mathematicae",
				"volume": "54",
				"date": "1997",
				"publisher": "Birkhäuser",
				"place": "Basel",
				"issn": "0001-9054",
				"pages": "117-143",
				"libraryCatalog": "DigiZeitschriften"
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.digizeitschriften.de/en/dms/img/?PPN=GDZPPN002612097",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"firstName": "Wolfgang",
						"lastName": "Schuster",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"title": "Quadratische Identitäten bei Polygonen.",
				"publication": "Aequationes Mathematicae",
				"volume": "54",
				"date": "1997",
				"publisher": "Birkhäuser",
				"place": "Basel",
				"issn": "0001-9054",
				"pages": "117-143",
				"libraryCatalog": "DigiZeitschriften"
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.digizeitschriften.de/dms/img/?PPN=PPN379931524_0002&DMDID=dmdlog10",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"firstName": "Hans",
						"lastName": "Hermes",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"title": "Die Soundness des Prädikatenkalküls auf der Basis der Quineschen Regeln.",
				"publication": "Archiv für mathematische Logik und Grundlagenforschung",
				"volume": "2",
				"date": "1954/56",
				"publisher": "Kohlhammer",
				"place": "Berlin",
				"issn": "0003-9268",
				"pages": "68-77",
				"libraryCatalog": "DigiZeitschriften"
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.digizeitschriften.de/dms/img/?PPN=GDZPPN002612097",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"firstName": "Wolfgang",
						"lastName": "Schuster",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"title": "Quadratische Identitäten bei Polygonen.",
				"publication": "Aequationes Mathematicae",
				"volume": "54",
				"date": "1997",
				"publisher": "Birkhäuser",
				"place": "Basel",
				"issn": "0001-9054",
				"pages": "117-143",
				"libraryCatalog": "DigiZeitschriften"
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.digizeitschriften.de/dms/toc/?PPN=GDZPPN002612089",
		"items": "multiple"
	}
]
/** END TEST CASES **/