{
	"translatorID": "29051e64-8eba-4b26-bbf1-0c224bc59497",
	"label": "ISTC",
	"creator": "Maike Kittelmann",
	"target": "^https?://data\\.cerl\\.org/istc/(_search|i[a-z]\\d{8})",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2016-12-28 14:39:45"
}

/*
	***** BEGIN LICENSE BLOCK *****
	
	RKE Web translator Copyright © 2016 Maike Kittelmann
	This file is part of Zotero.
	
	Zotero is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.
	
	Zotero is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU Affero General Public License for more details.
	
	You should have received a copy of the GNU Affero General Public License
	along with Zotero.  If not, see <http://www.gnu.org/licenses/>.
	
	***** END LICENSE BLOCK *****
*/


function detectWeb(doc, url) {
	if (url.indexOf('_search?') != -1 && getSearchResults(doc, true, url)) {
		return "multiple";
	} else if (url.search(/i[a-z]\d{8}/) != -1) {
		var title = ZU.trimInternal(ZU.xpath(doc, '//div[contains(@class, "ample-record")]/h3')[0].textContent);
		if (title) {
			return 'book';
		}
	}
}


function getSearchResults(doc, checkOnly, url) {
	var items = {};
	var found = false;
	var rows = ZU.xpath(doc, '//p[contains(@class, "ample-shortlist-item-entry")]/a[contains(@href, "/istc/i")]');
	for (i = 0; i < rows.length; i++) {
		var title = ZU.trimInternal(rows[i].textContent);
		var href = rows[i].href + '?format=json';
		if (!href || !title) continue;
		if (checkOnly) return true;
		found = true;
		items[href] = title;
	}
	return found ? items : false;
}


function doWeb(doc, url) {
	if (detectWeb(doc, url) == "multiple") {
		Zotero.selectItems(getSearchResults(doc, false, url), function(items) {
			if (!items) {
				return true;
			}
			var books = [];
			for (var i in items) {
				books.push(i);
			}
			ZU.doGet(Object.keys(items), scrape);
		});
	} else if (detectWeb(doc, url) == "book") {
		ZU.doGet(url + '?format=json', scrape);
	}
}


function scrape(response, obj, url) {
	var jsonObject = JSON.parse(response);
	var data = jsonObject.data;
	var item = new Zotero.Item('book');

	var name = data.author;
	item.creators.push(Zotero.Utilities.cleanAuthor(name, "author", true))

	item.title = data.title;
	item.url = url.replace('?format=json', '');

	var imprint = data.imprint[0];
	item.place = (imprint.imprint_place || '');
	item.publisher = (imprint.imprint_name || '');
	item.date = (imprint.imprint_date || '');

	if (data.notes) {
		item.notes.push(data.notes[0]);
	}

	if (imprint.geo_info && imprint.geo_info[0].geonames_id) {
		item.notes.push('Geonames identifier of printing place: ' + imprint.geo_info[0].geonames_id);
	}

	if (data.references) {
		var concatRef = '';
		for (var i in data.references) {
			var ref = data.references[i];
			var refName = (ref.reference_name || '');
			var refLoc = (ref.reference_location_in_source || '');
			concatRef += (refName + ' ' + refLoc + '; ');
		}
		concatRef = concatRef.replace(/; $/, '');
		item.notes.push('References: ' + concatRef);
	}

	item.callNumber = 'ISTC ' + jsonObject._id;
	item.language = (data.language_of_item || '');
	item.libraryCatalog = 'Incunabula Short Title Catalogue (ISTC)';
	item.tags = ['incunabula', 'istc'];
	item.accessed = new Date().toString();
	// // Uncomment the following if you always want to save the page as attachment:
	//  item.attachments = [{
	//	url: url.replace('?format=json', ''),
	//	title: "ISTC",
	//	mimeType: "text/html",
	//	snapshot: true
	// }];		
	item.complete();
}



/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://data.cerl.org/istc/if00117000",
		"items": [
			{
				"itemType": "book",
				"title": "Propositiones ex omnibus Aristotelis libris excerptae. Add: Benedictus Soncinas",
				"creators": [
					{
						"firstName": "Theophilus de",
						"lastName": "Ferrariis",
						"creatorType": "author"
					}
				],
				"date": "3 Aug. 1493",
				"callNumber": "ISTC if00117000",
				"language": "lat",
				"libraryCatalog": "Incunabula Short Title Catalogue (ISTC)",
				"place": "Venice",
				"publisher": "Johannes and Gregorius de Gregoriis, de Forlivio, for Alexander Calcedonius",
				"shortTitle": "Propositiones ex omnibus Aristotelis libris excerptae. Add",
				"url": "http://data.cerl.org/istc/if00117000",
				"attachments": [],
				"tags": [
					"incunabula",
					"istc"
				],
				"notes": [
					"Contains extracts from Latin translations of Aristotle by Leonardus Brunus Aretinus, etc. The translation of De mirabilibus auscultationibus by Antonius Beccaria is given entire (ff.113-128v)",
					"Geonames identifier of printing place: 3164603",
					"References: Goff F117; HC(+Add) 6997* ; Klebs 395.1; Pell 4777; Buffévent 199; Fernillot 239; Parguez 426; Zehnacker 878; Polain(B) 1475; IGI 3840; IBP 2172; IBPort 705; IBE 2419; SI 1519; CCIR F-6; IJL2 170; Badalić(Croatia) 444; Madsen 1571; Mendes 524; Martín Abad F-17; Sallander 1716; Coll(S) 1233; Sack(Freiburg) 1426; Hubay(Augsburg) 802; Voull(Trier) 1915; Schlechter-Ries 1707; Voull(B) 3875; Günt(L) 3226; Walsh 1986, 1987; Bod-inc F-022; Sheppard 3898; Rhodes(Oxford Colleges) 768; Pr 4531; BMC V 344; BSB-Ink F-82; GW 9826"
				],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://data.cerl.org/istc/_search?query=aristotle&from=0&size=10&mode=default&sort=default",
		"items": "multiple"
	}
]
/** END TEST CASES **/