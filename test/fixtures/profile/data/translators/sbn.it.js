{
	"translatorID": "4c272290-7ac4-433e-862d-244884ed285a",
	"label": "sbn.it",
	"creator": "Philipp Zumstein",
	"target": "^https?://(www|opac)\\.sbn\\.it/opacsbn/opaclib\\?",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2017-06-24 10:05:03"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2015 Philipp Zumstein

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

var typeMapping = {
	"testo a stampa" : "book",
	//"musica a stampa" ,
	"documento da proiettare o video" : "videoRecording",
	"registrazione sonora" : "audioRecording",
	//"musica manoscritta",
	"documento grafico" : "artwork",
	//"risorsa elettronica",
	"documento cartografico a stampa" : "map",
	"registrazione sonora non musicale" : "audioRecording",
	//"documento multimediale",
	//"testo manoscritto",
	//"oggetto tridimensionale",
	//"documento cartografico manoscritto"
};

function detectWeb(doc, url) {
	if (url.indexOf("full.jsp")>-1) {
		var type = ZU.xpathText(doc, '//tr[ td[contains(@class,"detail_key") and contains(text(), "Tipo documento")] ]/td[contains(@class,"detail_value")]');
		//Z.debug(type.trim());
		return typeMapping[type.trim().toLowerCase()] || "book";
	} else if (getSearchResults(doc, true)) {
		return "multiple";
	}
}

function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = ZU.xpath(doc, '//table[@id="records"]//td/div[contains(@class, "rectitolo")]/a');
	for (var i=0; i<rows.length; i++) {
		var href = rows[i].href;
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
	var urlMarc = ZU.xpathText(doc, '//a[contains(@title, "Scarico Marc21 del record") or contains(@title, "Download Marc21 record")]/@href');
	//Z.debug(urlMarc);
	ZU.doGet(urlMarc, function(text) {
		//call MARC translator
		var translator = Zotero.loadTranslator("import");
		translator.setTranslator("a6ee60df-1ddc-4aae-bb25-45e0537be973");
		translator.setString(text);
		translator.translate();
	});
}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.sbn.it/opacsbn/opaclib?db=solr_iccu&select_db=solr_iccu&saveparams=false&resultForward=opac%2Ficcu%2Ffull.jsp&searchForm=opac%2Ficcu%2Ffree.jsp&y=0&do_cmd=search_show_cmd&x=0&nentries=1&rpnlabel=+Tutti+i+campi+%3D+zotero+%28parole+in+AND%29+&rpnquery=%2540attrset%2Bbib-1%2B%2B%2540attr%2B1%253D1016%2B%2540attr%2B4%253D6%2B%2522zotero%2522&&fname=none&from=1",
		"items": [
			{
				"itemType": "book",
				"title": "Zotero: a guide for librarians, researchers and educators",
				"creators": [
					{
						"firstName": "Jason",
						"lastName": "Puckett",
						"creatorType": "author"
					}
				],
				"date": "2011",
				"ISBN": "9780838985892",
				"language": "eng",
				"libraryCatalog": "sbn.it",
				"numPages": "159",
				"place": "Chicago (Ill.)",
				"publisher": "Association of college and research libraries",
				"shortTitle": "Zotero",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://opac.sbn.it/opacsbn/opaclib?db=solr_iccu&rpnquery=%2540attrset%2Bbib-1%2B%2B%2540attr%2B1%253D1032%2B%2540attr%2B4%253D2%2B%2522VEA0102960%2522&totalResult=1&select_db=solr_iccu&nentries=1&rpnlabel=BID%3DVEA0102960&resultForward=opac%2Ficcu%2Ffull.jsp&searchForm=opac%2Ficcu%2Ferror.jsp&do_cmd=show_cmd&saveparams=false&&fname=none&from=1",
		"items": [
			{
				"itemType": "book",
				"title": "La qualità: un impegno per le biblioteche: atti delle quarte giornate di studio del Cnba, Torino 22-24 maggio 1997",
				"creators": [
					{
						"lastName": "Coordinamento nazionale delle biblioteche di architettura",
						"creatorType": "author",
						"fieldMode": true
					},
					{
						"firstName": "Ezio",
						"lastName": "Tarantino",
						"creatorType": "editor"
					},
					{
						"firstName": "Giovanna",
						"lastName": "Terranova",
						"creatorType": "editor"
					}
				],
				"date": "1998",
				"callNumber": "026.72",
				"language": "ita",
				"libraryCatalog": "sbn.it",
				"numPages": "158",
				"place": "Roma",
				"publisher": "CNBA Coordinamento nazionale biblioteche di architettura",
				"shortTitle": "La qualità",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.sbn.it/opacsbn/opaclib?db=solr_iccu&select_db=solr_iccu&nentries=10&from=1&searchForm=opac/iccu/error.jsp&resultForward=opac/iccu/brief.jsp&do_cmd=show_cmd&rpnlabel=+Any+%3D+google+%28words+in+AND%29+&rpnquery=%40attrset+bib-1++%40attr+1%3D1016+%40attr+4%3D6+%22google%22&totalResult=186",
		"items": "multiple"
	}
]
/** END TEST CASES **/