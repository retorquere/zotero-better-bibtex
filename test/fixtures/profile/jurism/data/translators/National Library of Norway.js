{
	"translatorID": "7bd82b70-1ed7-4aaf-bea2-bcbe6429a3ee",
	"label": "National Library of Norway",
	"creator": "Dan Michael O. Heggø",
	"target": "^https?://(www\\.)?nb\\.no/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2016-12-28 12:25:50"
}

/*
	***** BEGIN LICENSE BLOCK *****

	National Library of Norway Translator
	Copyright © 2016 Dan Michael O. Heggø

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
	if (url.indexOf("/nbsok/search?") != -1) {
		return "multiple";
	} else if (url.indexOf("/nbsok/nb/") != -1) {
		var mediaTypes = {
			'Bøker': 'book',
			'Tidsskrift': 'book', // complete issues or volumes, not articles
			'Aviser': 'newspaperArticle',
			'Film': 'videoRecording',
			'Fjernsyn': 'videoRecording',
			'Radio': 'radioBroadcast',
			'Kart': 'map',
		};
		var nodes = ZU.xpath(doc, '//input[@id="mediaType"]');
		if (nodes.length && mediaTypes[nodes[0].value]) {
			return mediaTypes[nodes[0].value];
		}
	}
}

function doWeb(doc, url) {
	if (detectWeb(doc, url) == "multiple") {
		var items = ZU.getItemArray(doc, doc, '/nbsok/nb/');
		Zotero.selectItems(items, function(items) {
			if(!items) {
				return true;
			}
			var urls = Object.keys(items);
			ZU.processDocuments(urls, scrape);
		});
	} else {
		scrape(doc, url);
	}
}

function trimBrackets(obj) {
	// Trim brackets from all values
	Object.keys(obj).forEach(function(key) {
		if (typeof(obj[key]) == 'string') {
			obj[key] = obj[key].replace(/^\[/, '').replace(/\]$/, '');
		}
	});
	return obj;
}

function extractNumPages(str) {
	// Borrowed from Library Catalog (PICA). See #756
	//make sure things like 2 partition don't match, but 2 p at the end of the field do
	// f., p., and S. are "pages" in various languages
	// For multi-volume works, we expect formats like:
	//   x-109 p., 510 p. and X, 106 S.; 123 S.
	var numPagesRE = /\[?\b((?:[ivxlcdm\d]+[ ,\-]*)+)\]?\s+[fps]\b/ig,
		numPages = [], m;
	while(m = numPagesRE.exec(str)) {
		numPages.push(m[1].trim()
			.replace(/[ ,\-]+/g,'+')
			.toLowerCase() // for Roman numerals
		);
	}
	return numPages.join('; ');
}

function getRIS(url, cb) {
	ZU.doGet(url, function(text){
		var translator = Zotero.loadTranslator("import");
		translator.setTranslator("32d59d2d-b65a-4da4-b0a3-bdd3cfb979e7");
		translator.setString(text);
		translator.setHandler("itemDone", function(obj, item) {
			cb(item);
		});
		translator.translate();
	});
}

function scrape(doc, url) {
	var endNote = ZU.xpath(doc, '//a[text()="EndNote"]');
	getRIS(endNote[0].href, function(item) {
		item = trimBrackets(item);

		// Normalize notes
		item.notes.forEach(function(note) {
			note.note = note.note
				.replace(/^<p>/, '').replace(/<\/p>$/, '')  // paragraph tags
				.replace(/&nbsp;/g, ' ')        // hard spaces
				.replace(/ +/g, ' ')            // multiple spaces
				;
		});

		if (item.numPages) {
			item.numPages = extractNumPages(item.numPages);
		}
		
		item.date = ZU.strToISO(item.date);

		// Add permalink
		var container = doc.getElementById('preview_metadata');
		if (container) {
			item.url = ZU.xpathText(container, './/a[contains(@href, "urn.nb.no")]');
		}

		item.complete();
	});
}
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.nb.no/nbsok/nb/b0426ebe3f16cd56d81959510d52b05b",
		"items": [
			{
				"itemType": "videoRecording",
				"title": "Sammenslåing av BP og Amoco - Dagsrevyen 1998.12.31 (6: 9)",
				"creators": [],
				"date": "1996-12-31",
				"libraryCatalog": "National Library of Norway",
				"shortTitle": "Sammenslåing av BP og Amoco - Dagsrevyen 1998.12.31 (6",
				"url": "http://urn.nb.no/URN:NBN:no-nb_video_11201",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.nb.no/nbsok/nb/a4cd69796dd3312c9780f5982a4a31f1",
		"items": [
			{
				"itemType": "book",
				"title": "Mat frå gard og grend: om mat og matkultur i Lesja og Gudbrandsdalen gjennom 100år",
				"creators": [
					{
						"lastName": "Nordset",
						"firstName": "Bjørg",
						"creatorType": "author"
					}
				],
				"date": "1995",
				"ISBN": "9788291375052",
				"libraryCatalog": "National Library of Norway",
				"numPages": "176",
				"place": "Lesja",
				"publisher": "Bondekvinnelaget",
				"shortTitle": "Mat frå gard og grend",
				"url": "http://urn.nb.no/URN:NBN:no-nb_digibok_2008030304011",
				"attachments": [],
				"tags": [
					"Foods",
					"Gudbrandsdalen",
					"History",
					"Kokebøker",
					"Lesja",
					"Mattradisjoner",
					"Merkedager",
					"Preservation",
					"Religiøse fester"
				],
				"notes": [
					{
						"note": "Opplagshistorikk: 2. oppl. 1995; 3. oppl. 2001"
					}
				],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/