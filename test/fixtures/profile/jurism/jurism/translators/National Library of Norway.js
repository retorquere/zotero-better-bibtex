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
	"lastUpdated": "2017-11-29 23:36:00"
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
	// The page can change from a search page to a single item page
	// without loading the whole content as a new website, so we
	// need to monitor for DOM changes.
	Z.monitorDOMChanges(ZU.xpath(doc, '//div[contains(@class, "layout-content")]')[0], {childList: true});

	// New UI - search page
	if (url.includes('nb.no/search?')){
		return 'multiple';
	}

	// Old UI – item (these URLs are not yet redirected to the new UI)
	if (url.includes('nb.no/nbsok/nb/')){
		var nodes = ZU.xpath(doc, '//meta[@name="dc:type"]');
		if (nodes.length) {
			var dcType = nodes[0].getAttribute('content');
			return mapMediaType(dcType);
		}
	}

	// New UI - item
	if (url.includes('nb.no/items/')){
		// There is a dc:type meta tag, but it contains values like
		// "nonfiction" or "Text", so not helpful like before when it contained
		// material type.
		return 'book';
	}
}

function doWeb(doc, url) {
	if (detectWeb(doc, url) == 'multiple') {
		var linkItems = ZU.xpath(doc, '//a[contains(@href, "items")]');
		var items = {};
		linkItems.forEach(function(linkItem) {
			var link = linkItem.getAttribute('href');

			// The search result list has two different layouts: 'grid' and 'list'.
			// The first xpath is for the grid view, the second for the list view.
			var title = ZU.xpathText(linkItem, './/label[@class="title" or @class="subtitle"]')
				|| ZU.xpathText(linkItem, './/dd[position() < 4]');

			if (title) {
				items[link] = title;
			}
		});
		Zotero.selectItems(items, function(items) {
			if (!items) {
				return true;
			}
			var urls = Object.keys(items);
			ZU.processDocuments(urls, processUrl);
		});
	} else {
		processUrl(doc, url);
	}
}

function getIdentifierFromUrl(url) {
	// New-style URL
	var matches = url.match(/nb\.no\/items\/([^#?;]+)/);
	if (matches) {
		return matches[1];
	}
	// Old-style URL
	matches = url.match(/nb\.no\/nbsok\/nb\/([^#?;]+)/);
	if (matches) {
		return matches[1];
	}
}

function mapMediaType(mediaType) {
	var mediaTypes = {
		'Bøker': 'book',
		'Tidsskrift': 'book', // complete issues or volumes, not articles
		'Aviser': 'newspaperArticle',
		'Film': 'videoRecording',
		'Fjernsyn': 'videoRecording',
		'Radio': 'radioBroadcast',
		'Kart': 'map',
	};
	return mediaTypes[mediaType] || 'book';  // default to 'book'
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
	while (m = numPagesRE.exec(str)) {
		numPages.push(m[1].trim()
			.replace(/[ ,\-]+/g,'+')
			.toLowerCase() // for Roman numerals
		);
	}
	return numPages.join('; ');
}

function getMODS(url, cb) {
	ZU.doGet(url, function(text){
		var translator = Zotero.loadTranslator('import');
		translator.setTranslator('0e2235e7-babf-413c-9acf-f27cce5f059c');
		translator.setString(text);
		translator.setHandler('itemDone', function(obj, item) {
			cb(item);
		});
		translator.translate();
	});
}


function apiRequest(url, cb) {
	ZU.doGet(url, function(text){
		var obj;
		try {
			obj = JSON.parse(text);
		} catch (e) {
			throw('Failed parsing JSON from ' + url + '.json');
		}
		cb(obj);
	});
}

function processUrl(doc, url) {
	var identifier = getIdentifierFromUrl(url);
	// Note to self: the identifier can be a URN, but also sesamid or other kind of identifier
	var modsUrl = 'https://api.nb.no/catalog/v1/metadata/' + identifier + '/mods';
	var apiUrl = 'https://api.nb.no/catalog/v1/items/' + identifier ;

	// Utilize the RIS importer to prepare a mostly complete record
	getMODS(modsUrl, function(item) {
		item = trimBrackets(item);

		// Concat and normalize notes
		var note = item.notes.map(function(note) { return note.note; })
			.join('.\n')
			.replace(/<\/?p>/g, '')   // paragraph tags
			.replace(/&nbsp;/g, ' ')  // hard spaces
			.replace(/ +/g, ' ')      // multiple spaces
		if (note) {
			item.notes = [{ note: note }];
		}

		item.date = ZU.strToISO(item.date);

		if (item.archiveLocation) {
			delete item.archiveLocation;
		}
		if (item.callNumber) {
			delete item.callNumber;
		}
		item.tags = [];

		// Use the (undocumented) JSON api to add some data missing in the RIS export
		apiRequest(apiUrl, function(apiResponse) {

			var m = apiResponse.metadata;

			item = trimBrackets(item);

			item.numPages = extractNumPages(m.physicalDescription.extent);


			if (item.accessDate) {
				// Better leave this to Zotero
				delete item.accessDate;
			}

			if (m.identifiers.urn) {
				item.url = 'https://urn.nb.no/' + apiResponse.metadata.identifiers.urn;
			}

			if (m.series && m.series.length) {
				item.series = m.series[0];
			}

			if (m.mediaTypes && m.mediaTypes.length) {
				item.type = mapMediaType(m.mediaTypes[0]);
			}

			item.complete();
		});

	});
}
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://www.nb.no/items/URN:NBN:no-nb_digibok_2013022624011",
		"items": [
			{
				"itemType": "book",
				"title": "Memoirs of Lewis Holberg",
				"creators": [
					{
						"lastName": "Holberg",
						"firstName": "Ludvig",
						"creatorType": "author"
					}
				],
				"date": "1827",
				"libraryCatalog": "National Library of Norway",
				"numPages": "vii+289",
				"place": "London",
				"publisher": "Hunt and Clarke",
				"language": "eng; lat",
				"series": "Autobiography : a collection of the most instructive and amusing lives ever published vol. 12",
				"url": "https://urn.nb.no/URN:NBN:no-nb_digibok_2013022624011",
				"attachments": [],
				"notes": [
					{
						"note": "statement of responsibility: written by himself in Latin : and now first translated into English.\nreproduction: Elektronisk reproduksjon [Norge] Nasjonalbiblioteket Digital 2013-03-01"
					}
				],
				"tags": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.nb.no/items/URN:NBN:no-nb_digibok_2008030304011",
		"items": [
			{
				"itemType": "book",
				"title": "Mat frå gard og grend: om mat og matkultur i Lesja og Gudbrandsdalen gjennom 100år",
				"creators": [
					{
						"lastName": "Nordset",
						"firstName": "Bjørg",
						"creatorType": "author"
					},
					{
						"lastName": "Lesja bondekvinnelag",
						"fieldMode": 1,
						"creatorType": "author"
					}
				],
				"date": "1995",
				"ISBN": "9788291375052",
				"libraryCatalog": "National Library of Norway",
				"numPages": "176",
				"publisher": "Snøhetta forl.",
				"shortTitle": "Mat frå gard og grend",
				"url": "https://urn.nb.no/URN:NBN:no-nb_digibok_2008030304011",
				"attachments": [],
				"notes": [
					{
						"note": "statement of responsibility: Lesja bondekvinnelag ; red.: Bjørg Nordset ; [foto: [hovedsakelig] Bjarne Fossøy].\nOpplagshistorikk: 2. oppl. 1995; 3. oppl. 2001.\nreproduction: Elektronisk reproduksjon [Norge] Nasjonalbiblioteket Digital 2009-04-09"
					}
				],
				"seeAlso": [],
				"tags": [],
				"place": "Lesja",
				"language": "nob"
			}
		]
	}
]
/** END TEST CASES **/
