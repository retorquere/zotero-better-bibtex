{
	"translatorID": "cf87eca8-041d-b954-795a-2d86348999d5",
	"translatorType": 4,
	"label": "Library Catalog (Aleph)",
	"creator": "Simon Kornblith, Michael Berkowitz, Ming Yeung Cheung",
	"target": "^https?://[^/]+/F(/?[A-Z0-9\\-]*(\\?.*)?$|\\?func=find|\\?func=scan|\\?func=short|\\?local_base=)",
	"minVersion": "1.0.0b3.r1",
	"maxVersion": null,
	"priority": 250,
	"inRepository": true,
	"browserSupport": "gcsb",
	"lastUpdated": "2021-05-21 04:15:00"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2021 Simon Kornblith, Michael Berkowitz, and Ming Yeung Cheung

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
Aleph OPAC Translator
Example installations (mainly French):
http://naude.bibliotheque-mazarine.fr/
http://bibli.polytechnique.fr/
http://sifrix2.sdv.fr/
http://aleph.insa-rouen.fr
http://brenet.ens-lyon.fr
http://bu-pau.univ-pau.fr/
http://babel.bu.univ-paris5.fr
http://inti.univ-paris4.fr/
http://servaleph.univ-catholyon.fr/
http://armada.scd.univ-paris12.fr/
http://catalogue.univ-angers.fr/
http://biblio.ville-lehavre.fr/
http://opac.nebis.ch/
http://scd2.univ-lille1.fr/
http://catalogue.univ-paris1.fr/
http://source.ulg.ac.be/
http://med.cite-sciences.fr/
http://biblio.mulhouse.fr/
http://mediatheque.sigdci76.fr/
http://opac.biu-montpellier.fr/
Japanese Diet Library:
https://ndlopac.ndl.go.jp
Germany:
http://aleph-www.ub.fu-berlin.de
http://opac.hu-berlin.de
http://alephdai.ub.hu-berlin.de
https://aleph.mpg.de

Mexico:
iibiblio.unam.mx

Poland:
https://aleph.bg.pwr.wroc.pl/F
*/

function detectWeb(doc, url) {
	var singleRe = new RegExp("^https?://[^/]+/F/?[A-Z0-9\\-]*\\?.*(?:func=full-set-set|func=direct|func=myshelf-full.*)");
	
	if (singleRe.test(url)) {
		return "book";
	}
	else {
		var tags = doc.getElementsByTagName("a");
		for (var i = 0; i < tags.length; i++) {
			if (singleRe.test(tags[i].href)) {
				return "multiple";
			}
		}
	}
	return false;
}

function doWeb(doc, url) {
	var detailRe = new RegExp("^https?://[^/]+/F/?[A-Z0-9\\-]*\\?.*(?:func=full-set-set|func=direct|func=myshelf-full|func=myself_full.*)");
	var mab2Opac = new RegExp("^https?://(?!alephdai)[^/]+berlin|193\\.30\\.112\\.134|duisburg-essen/F/[A-Z0-9\\-]+\\?.*|^https?://katalog\\.ub\\.uni-duesseldorf\\.de/F|^https?://aleph\\.mpg\\.de/F");
	var uri = doc.location.href;
	var newUris = [];
	
	if (detailRe.test(uri)) {
		// find the 'add to basket' link where it will have the document number, replace the function with 'direct'
		if (doc.evaluate('//*[contains(@href, "myshelf-add-ful-1")]', doc, null, XPathResult.ANY_TYPE, null).iterateNext()) {
			var elmtsAdd = doc.evaluate('//*[contains(@href, "myshelf-add-ful-1")]', doc, null, XPathResult.ANY_TYPE, null);
			var adduri = elmtsAdd.iterateNext().attributes.getNamedItem("href").value;
			adduri = adduri.replace("myshelf-add-ful-1", "direct");
			// adduri = adduri.replace("myshelf-add-ful-1", "myshelf-full");
			var baseuri = uri.match(".*\\?");
			var funcuri = adduri.match("\\?.*");
			newuri = baseuri + funcuri[0].match("[^\\?].*");
			newuri += "&format=001";
			// Zotero.debug('baseuri = ' + baseuri);
			// Zotero.debug('funcuri = ' + funcuri);
			Zotero.debug('directuri = ' + newuri);
		}
		else {
			var newuri = uri.replace(/&format=[0-9]{3}/, "&format=001");
			if (newuri == uri) newuri += "&format=001";
		}
		
		var translator = Zotero.loadTranslator("import");
		if (mab2Opac.test(uri)) {
			Z.debug("Using MAB2 translator");
			translator.setTranslator("91acf493-0de7-4473-8b62-89fd141e6c74");
		}
		else {
			translator.setTranslator("a6ee60df-1ddc-4aae-bb25-45e0537be973");
		}
		translator.getTranslatorObject(function (marc) {
			Zotero.Utilities.processDocuments([newuri], function (newDoc) {
				scrape(newDoc, marc, url);
			});
		});
	}
	else {
		var itemRegexp = '^https?://[^/]+/F/?[A-Z0-9\\-]*\\?.*(?:func=full-set-set.*\\&format=999|func=direct|func=myshelf-full.*)';
		var items = Zotero.Utilities.getItemArray(doc, doc, itemRegexp, '^[0-9]+$');
		// ugly hack to see if we have any items
		var haveItems = Array.isArray(items) && items.length != 0;
		
		// If we don't have any items otherwise, let us use the numbers
		if (!haveItems) {
			items = Zotero.Utilities.getItemArray(doc, doc, itemRegexp);
			
			// We try to get more text by grabbing the whole table row
			var newItems = {};
			for (var link in items) {
				// Z.debug(link.match(/[A-Z0-9]{20}[A-Z0-9]*-[0-9]+\?func.*$/)[0]);
				var text = ZU.xpathText(doc, '//a[contains(@href,"' + link.match(/[A-Z0-9]{20}[A-Z0-9]*-[0-9]+\?func.*$/)[0] + '")]/ancestor::tr[1]');
				if (text) {
					newItems[link] = text;
					haveItems = true;
				}
			}
			if (haveItems) items = newItems;
		}
		
		Zotero.selectItems(items, function (items) {
			if (!items) {
				return;
			}
			
			for (var i in items) {
				var newUri = i.replace("&format=999", "&format=001");
				if (newUri == i) {
					newUri += "&format=001";
				}
				newUris.push(newUri);
			}
			
			var translator = Zotero.loadTranslator("import");
			if (mab2Opac.test(uri)) {
				Z.debug("Using MAB2 translator");
				translator.setTranslator("91acf493-0de7-4473-8b62-89fd141e6c74");
			}
			else {
				translator.setTranslator("a6ee60df-1ddc-4aae-bb25-45e0537be973");
			}
			translator.getTranslatorObject(function (marc) {
				Zotero.Utilities.processDocuments(newUris, function (newDoc) {
					scrape(newDoc, marc, url);
				});
			});
		});
	}
}

function scrape(newDoc, marc, url) {
	// var nonstandard = false;
	var th = false;
	var ndl = false;
	var xpath;
	// Z.debug(uri)
	if (newDoc.evaluate('//*[tr[td/text()="LDR"]]/tr[td[2]]', newDoc, null, XPathResult.ANY_TYPE, null).iterateNext()) {
		xpath = '//*[tr[td/text()="LDR"]]/tr[td[2]]';
	}
	else if (newDoc.evaluate('//tbody[tr/td[@scope="row"]/strong[contains(text(), "LDR")]]', newDoc, null, XPathResult.ANY_TYPE, null).iterateNext()) {
		// UCSB Pegasus
		xpath = '//tbody[tr/td[@scope="row"]/strong[contains(text(), "LDR")]]/tr';
	}
	else if (newDoc.evaluate('//*[tr[th[normalize-space(text())="LDR"]]]/tr[td[1]]', newDoc, null, XPathResult.ANY_TYPE, null).iterateNext()) {
		xpath = '//*[tr[th[normalize-space(text())="LDR"]]]/tr[td[1]]';
		th = true;
	}
	else if (newDoc.evaluate('//tr[2]//table[2]//tr', newDoc, null, XPathResult.ANY_TYPE, null).iterateNext()) {
		xpath = '//tr[2]//table[2]//tr[td[2]]';
		// nonstandard = true;
	}
	else if (newDoc.evaluate('//table//tr[td[2][@class="td1"]]', newDoc, null, XPathResult.ANY_TYPE, null).iterateNext()) {
		xpath = '//table//tr[td[2][@class="td1"]]';
		// nonstandard = true;
	}
	else if (newDoc.evaluate('//table/tbody/tr[td/span/b]', newDoc, null, XPathResult.ANY_TYPE, null).iterateNext()) {
		// for NDL library
		xpath = '//table/tbody/tr[td/span/b]';
		ndl = true;
	}
	else if (newDoc.evaluate('//tr/td[2]/table/tbody[tr/td[contains(text(), "LDR")]]', newDoc, null, XPathResult.ANY_TYPE, null).iterateNext()) {
		xpath = '//tr/td[2]/table/tbody[tr/td[contains(text(), "LDR")]]/tr';
		// nonstandard = true;
	}

	// Z.debug(xpath)
	var elmts = newDoc.evaluate(xpath, newDoc, null, XPathResult.ANY_TYPE, null);
	var elmt;
	var record = new marc.record();
	while ((elmt = elmts.iterateNext())) {
		var field;
		if (th) {
			field = Zotero.Utilities.superCleanString(newDoc.evaluate('./th', elmt, null, XPathResult.ANY_TYPE, null).iterateNext().textContent);
		}
		else {
			field = Zotero.Utilities.superCleanString(newDoc.evaluate('./td[1]', elmt, null, XPathResult.ANY_TYPE, null).iterateNext().textContent);
		}
		// if (nonstandard) {
		//     var field = Zotero.Utilities.superCleanString(newDoc.evaluate('./td[1]', elmt, null, XPathResult.ANY_TYPE, null).iterateNext().textContent);
		// } else {
		//     var field = Zotero.Utilities.superCleanString(newDoc.evaluate('./TD[1]/text()[1]', elmt, null, XPathResult.ANY_TYPE, null).iterateNext().nodeValue);
		// }
		// var field = Zotero.Utilities.superCleanString(newDoc.evaluate('./td[1]', elmt, null, XPathResult.ANY_TYPE, null).iterateNext().textContent);
		if (field) {
			var value;
			if (th) {
				value = newDoc.evaluate('./TD[1]', elmt, null, XPathResult.ANY_TYPE, null).iterateNext().textContent; // .split(/\n/)[1];
			}
			else if (ndl) {
				value = newDoc.evaluate('./TD[3]', elmt, null, XPathResult.ANY_TYPE, null).iterateNext().textContent;
			}
			else {
				value = newDoc.evaluate('./TD[2]', elmt, null, XPathResult.ANY_TYPE, null).iterateNext().textContent; // .split(/\n/)[1];
			}
			if (value.split(/\n/)[1]) value = Zotero.Utilities.trimInternal(value.split(/\n/)[1]);
			Zotero.debug(field + " : " + value);
			if (field == "LDR") {
				record.leader = value;
			}
			else if (field != "FMT") {
				value = value.replace(/\|([a-z]) /g, marc.subfieldDelimiter + "$1");

				var code = field.substring(0, 3);
				var ind = "";
				if (field.length > 3) {
					ind = field[3];
					if (field.length > 4) {
						ind += field[4];
					}
				}

				record.addField(code, ind, value);
			}
		}
	}

	var newItem = new Zotero.Item();
	record.translate(newItem);

	var domain = url.match(/https?:\/\/([^/]+)/);
	newItem.repository = domain[1] + " Library Catalog";

	for (var i in newItem.creators) {
		if (!newItem.creators[i].firstName) {
			var name = newItem.creators[i].lastName.split(/([^\s]+)\s+(.*)$/);
			newItem.creators[i] = { lastName: name[1], firstName: name[2], creatorType: 'author' };
		}
	}

	var oldCreators = newItem.creators;
	newItem.creators = [];
	var transient = [];
	for (i = 0; i < oldCreators.length; i++) {
		var a = oldCreators[i];
		if (a.lastName) {
			if (!a.lastName.match(/\d+/)) transient.push(a);
		}
	}
	for (i = 0; i < transient.length; i++) {
		a = transient[i];
		if (a.firstName) {
			if (a.firstName.match(/\|/)) a.firstName = a.firstName.match(/([^|]+)\s+|/)[1];
		}
	}
	newItem.creators = transient;
	newItem.title = newItem.title.replace(/(<<|>>)/g, '');
	newItem.complete();
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://aleph.mpg.de/F?func=direct&doc_number=000000037&local_base=mpg01",
		"items": [
			{
				"itemType": "book",
				"title": "The primary auditory neurons of the mammalian cochlea",
				"creators": [
					{
						"firstName": "Alain",
						"lastName": "Dabdoub",
						"creatorType": "author"
					},
					{
						"firstName": "Bernd",
						"lastName": "Fritzsch",
						"creatorType": "author"
					},
					{
						"firstName": "Arthur N.",
						"lastName": "Popper",
						"creatorType": "author"
					},
					{
						"firstName": "Richard R.",
						"lastName": "Fay",
						"creatorType": "author"
					}
				],
				"date": "2016",
				"ISBN": "9781493930302",
				"extra": "Literaturangaben",
				"language": "eng",
				"libraryCatalog": "aleph.mpg.de Library Catalog",
				"series": "Springer handbook of auditory research ; 52",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://naude.bibliotheque-mazarine.fr/F/?func=direct&doc_number=000319644",
		"items": [
			{
				"itemType": "book",
				"title": "Registre du dépôt de Nesle: oeuvres d'art saisies pendant la Révolution chez les émigrés et condamnés parisiens en vue de l'instruction publique",
				"creators": [
					{
						"firstName": "Jean-Pierre",
						"lastName": "Samoyault ",
						"creatorType": "author"
					},
					{
						"lastName": "Société",
						"firstName": "de l'histoire de l'art français ",
						"creatorType": "author"
					}
				],
				"date": "2021",
				"ISBN": "9782701806174",
				"language": "fre",
				"libraryCatalog": "naude.bibliotheque-mazarine.fr Library Catalog",
				"place": "Paris",
				"publisher": "éditions de Boccard",
				"series": "Archives de l'art français",
				"seriesNumber": "nouvelle période, XLI",
				"shortTitle": "Registre du dépôt de Nesle",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/
