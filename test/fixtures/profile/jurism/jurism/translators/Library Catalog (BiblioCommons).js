{
	"translatorID": "5d506fe3-dbde-4424-90e8-d219c63faf72",
	"label": "Library Catalog (BiblioCommons)",
	"creator": "Avram Lyon",
	"target": "^https?://[^/]+\\.bibliocommons\\.com/",
	"minVersion": "2.1",
	"maxVersion": "",
	"priority": 250,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2015-06-02 20:44:02"
}

/*
	***** BEGIN LICENSE BLOCK *****

	BiblioCommons Translator
	Copyright © 2011 Avram Lyon, ajlyon@gmail.com

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
	if (url.match(/\/item\/(?:show|catalogue_info)/))
		return "book";
	if (url.match(/\/search\?t=/))
		return "multiple";
	return false;
}

function doWeb(doc, url) {
	var n = doc.documentElement.namespaceURI;
	var ns = n ? function(prefix) {
		if (prefix == 'x') return n; else return null;
	} : null;

	// Load MARC
	var translator = Z.loadTranslator("import");
	translator.setTranslator("a6ee60df-1ddc-4aae-bb25-45e0537be973");

	var domain = url.match(/https?:\/\/([^.\/]+)/)[1];

	if (url.match(/\/item\/show/)) {
		Zotero.Utilities.doGet(url.replace(/\/item\/show/,"/item/catalogue_info"),
					function (text) {
						//Z.debug(text)
						translator.getTranslatorObject(function (obj) {
							processor({	
								translator: obj,
								text: text,
								domain: domain
							});
						})
					}, function() {Zotero.done()});
	} else if (url.match(/\/item\/catalogue_info/)) {
		translator.getTranslatorObject(function (obj) {
			processor({	
				translator: obj,
				text: doc.documentElement.innerHTML,
				domain: domain
			});
		})
	} else if (url.match(/\/search\?t=/)) {
		var results = doc.evaluate('//div[@id="bibList"]/div/div//span[@class="title"]/a[1]', doc, ns, XPathResult.ANY_TYPE, null);
		var items = new Array();
		var result;
		while (result = results.iterateNext()) {
				var title = result.textContent;
				var url = result.href.replace(/\/show\//,"/catalogue_info/");
				items[url] = title;
		}
		Zotero.selectItems(items, function (items) {
			var urls = [];
			var i;
			for (i in items) urls.push(i);
			Zotero.Utilities.doGet(urls, function (text) {
				translator.getTranslatorObject(function (obj) {
					processor({
						translator: obj,
						text: text,
						domain: domain
					});
				})
			}, function() {Zotero.done()});
		});
		Zotero.wait();
	}
}

function processor (obj) {
		// Gets {translator: , text: }
		//	Z.debug(obj.text)
		// Here, we split up the table and insert little placeholders between record bits
		var marced = obj.text.replace(/\s+/g," ")
					.replace(/^.*<div id="marc_details">(?:\s*<[^>"]+>\s*)*/,"")
					.replace(/\s*(<table.*?>|<tbody>)\s*/g, "")
					//looks like the odd/even attribute has mostly been remove from tr
					.replace(/<tr( +class="(?:odd|even)")?>\s*/g,"")
					.replace(/<td +scope="row" +class="marcTag"><strong>(\d+)<\/strong><\/td>\s*/g,"$1\x1F")
					// We may be breaking the indicator here
					.replace(/<td\s+class="marcIndicator">\s*(\d*)\s*<\/td>\s*/g,"$1\x1F")
					.replace(/<td +class="marcTagData">(.*?)<\/td>\s*<\/tr>\s*/g,"$1\x1E")
					.replace(/\x1F(?:[^\x1F]*)$/,"\x1F")
					// We have some extra 0's at the start of the leader
					.replace(/^000/,"");
		//Z.debug(marced);
		// We've used the record delimiter to delimit fields
		var fields = marced.split("\x1E");
		
		// The preprocess function gets the translator object, if available
		// This is pretty vital for fancy translators like MARC
		var marc = obj["translator"];
		// Make a record, only one.
		var record = new marc.record();
		// The first piece is the MARC leader
		record.leader = fields.shift();
		for (var i=0; i<fields.length; i++) {
			var field = fields[i];
			//Z.debug(field)
			// Skip blanks
			if (field.replace(/\x1F|\s/g,"") == "") continue;
			// We're using the subfield delimiter to separate the field code,
			// indicator, and the content.
			var pieces = field.split("\x1F");
			if (pieces.length>2){
			record.addField(pieces[0].trim(),
							pieces[1].trim(),
							// Now we insert the subfield delimiter
							pieces[2].replace(/\$([a-z]|$)/g,"\x1F$1").trim());
			}				
		}
		// returns {translator: , text: false, items: [Zotero.Item[]]}
		var item = new Zotero.Item();
		record.translate(item);
		item.libraryCatalog = obj.domain + " Library Catalog";
		item.complete();
		return true;
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://bostonpl.bibliocommons.com/item/show/2051015075_labor",
		"items": [
			{
				"itemType": "book",
				"title": "Labor",
				"creators": [
					{
						"firstName": "Marcia McKenna",
						"lastName": "Biddle",
						"creatorType": "author"
					}
				],
				"date": "1979",
				"ISBN": "9780875181677",
				"abstractNote": "Brief biographies of five women prominently involved in the labor movement in the United States: Mother Jones, Mary Heaton Vorse, Frances Perkins, Addie Wyatt, and Dolores Huerta. Also includes 11 other women who have made outstanding contributions",
				"callNumber": "HD6079.2.U5 B52",
				"libraryCatalog": "bostonpl Library Catalog",
				"numPages": "126",
				"place": "Minneapolis",
				"publisher": "Dillon Press",
				"series": "Contributions of women",
				"attachments": [],
				"tags": [
					"United States",
					"Women",
					"Women labor union members",
					"Working class"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://bostonpl.bibliocommons.com/search?t=smart&search_category=keyword&q=labor&commit=Search",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://nypl.bibliocommons.com/item/show/10974089052_labour",
		"items": [
			{
				"itemType": "book",
				"title": "Labour",
				"creators": [
					{
						"firstName": "György",
						"lastName": "Lukács",
						"creatorType": "author"
					},
					{
						"firstName": "György",
						"lastName": "Lukács",
						"creatorType": "author"
					}
				],
				"date": "1980",
				"callNumber": "JFD 87-5272",
				"language": "eng",
				"libraryCatalog": "nypl Library Catalog",
				"numPages": "139",
				"place": "London",
				"publisher": "Merlin Press",
				"series": "The Ontology of social being",
				"seriesNumber": "3",
				"attachments": [],
				"tags": [
					"Labor",
					"Philosophy",
					"Philosophy, Marxist"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/