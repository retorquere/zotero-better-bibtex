{
	"translatorID": "58ab2618-4a25-4b9b-83a7-80cd0259f896",
	"label": "Gallica",
	"creator": "Philipp Zumstein",
	"target": "^https?://gallica\\.bnf\\.fr",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2016-09-21 09:49:15"
}

/*
	***** BEGIN LICENSE BLOCK *****
	
	Copyright © 2016 Philipp Zumstein
	
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
	if (url.indexOf('/search/')>-1 && getSearchResults(doc, true)) {
		return "multiple";
	} else if (url.indexOf('http://gallica.bnf.fr/ark:')>-1) {
		var icon = ZU.xpathText(doc, '(//li[contains(@class, "typeDoc")]//span[contains(@class, "pictos")]/@class)[1]');
		if (icon) {
			icon = icon.replace("pictos", "").trim();
			var type = getDoctypeGallica(icon);
			if (type) {
				return type;
			} else {
				return "book";//default
			}
		}
		return;
	}
}


function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = ZU.xpath(doc, '//div[contains(@class, "result-item")]//h2/a');
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


// This function takes the name of the icon, and returns the Zotero item name
function getDoctypeGallica(iconname) {
	if (iconname.indexOf("carte")>-1) {
		return "map";
	} else if (iconname.indexOf("image")>-1) {
		return "artwork";
	} else if (iconname.indexOf("sonore")>-1) {
		return "audioRecording";
	} else {
		//default for e.g. "livre", "manuscrit", "partition", "fascicule"
		//or any unrecognized icon
		return "book";
	}
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
	var type = detectWeb(doc, url);
	
	var translator = Zotero.loadTranslator('web');
	// Embedded Metadata
	translator.setTranslator('951c027d-74ac-47d4-a107-9c3069ab7b48');

	translator.setHandler('itemDone', function (obj, item) {
		//additional data from the "notice" field
		var notice = {};
		var labels = ZU.xpath(doc, '//div[@id="noticeId"]/dl/dt');
		for (var i=0; i<labels.length; i++) {
			var label = labels[i].textContent;
			var value = ZU.xpathText(labels[i], './following-sibling::dd[1]');
			if (label && value) {
				//Z.debug(label);Z.debug(value);
				if (label.indexOf('Éditeur')>-1 || label.indexOf('Publisher')>-1 || label.indexOf('Editor')>-1) {
					var m = value.match(/^(.*)\((.*)\)/);
					if (m) {
						item.publisher = m[1];
						item.place = m[2];
					} else {
						item.publisher = value;
					}
				}
				if (label.indexOf('Language')>-1 || label.indexOf('Langue')>-1 || label.indexOf('Língua')>-1 || label.indexOf('Idioma')>-1) {
					item.language = value;
				}
				if (label.indexOf('Identifier')>-1 || label.indexOf('Identifiant')>-1 || label.indexOf('Senha')>-1) {
					if (value.trim().indexOf('ISSN')==0) {
						item.ISSN = value.trim().substring(4);
					} else if (value.trim().indexOf('ark:')==0) {
						item.extra = value;
					} else {
						Z.debug("Unrecoginized identifier: " + value);
					}
				}
				
			}
		}
		item.complete();
	});
	
	translator.getTranslatorObject(function(trans) {
		trans.itemType = type;
		trans.doWeb(doc, url);
	});
}
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://gallica.bnf.fr/ark:/12148/bpt6k58121413.r=cervantes.langEN",
		"items": [
			{
				"itemType": "book",
				"creators": [
					{
						"firstName": "Édouard",
						"lastName": "Cat",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [
					"Cervantes Saavedra, Miguel de (1547-1616)"
				],
				"seeAlso": [],
				"attachments": [],
				"title": "Miguel Cervantès / par É. Cat,...",
				"publisher": "Gedalge (Paris)",
				"date": "1892",
				"language": "Français",
				"rights": "domaine public",
				"url": "http://gallica.bnf.fr/ark:/12148/bpt6k58121413",
				"libraryCatalog": "Gallica",
				"accessDate": "CURRENT_TIMESTAMP"
			}
		]
	},
	{
		"type": "web",
		"url": "http://gallica.bnf.fr/Search?ArianeWireIndex=index&p=1&lang=EN&q=cervantes",
		"items": "multiple"
	}
]
/** END TEST CASES **/