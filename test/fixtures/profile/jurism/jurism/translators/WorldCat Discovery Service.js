{
	"translatorID": "fd8dc5f6-a6dd-42b2-948f-600f5da844ea",
	"label": "WorldCat Discovery Service",
	"creator": "Sebastian Karcher",
	"target": "^https?://[^/]+\\.worldcat\\.org/",
	"minVersion": "3.0.9",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsbv",
	"lastUpdated": "2019-11-26 22:21:07"
}

/*
	***** BEGIN LICENSE BLOCK *****
	
	WorldCat Discovery Service translator; Copyright © 2015 Sebastian Karcher
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

function detectWeb(doc, _url) {
	var results = getSearchResults(doc);
	if (results.length) {
		return "multiple";
	}

	// single result
	// generate item and return type
	var co = getFirstContextObj(doc);
	if (ZU.xpathText(doc, '//input[@id="dbList"]/@value') && co) {
		return generateItem(doc, co).itemType;
	}
	return false;
}

/**
 * Generates a Zotero item from a single item WorldCat page,
 * or the first item on a multiple item page
 */
function generateItem(doc, co) {
	var item = new Zotero.Item();
	ZU.parseContextObject(co, item);
	// item types not covered by COinS will still need to be covered. See the corresponding code in Open Worldcat.
	return item;
}

function getSearchResults(doc) {
	var results = ZU.xpath(doc, '//ol[@class="results"]/li[contains(@id, "record")]');
	return results;
}

function getFirstContextObj(doc) {
	return ZU.xpathText(doc, '//span[contains(@class, "Z3988")][1]/@title');
}


/**
 * Given an item URL, extract OCLC ID
 */
function extractOCLCID(url) {
	var id = url.match(/\/oclc\/([^?]+)/);
	if (!id) return false;
	return id[1];
}


/**
 * Given an item URL, extract database ID
 */
function extractDatabaseID(doc) {
	return ZU.xpathText(doc, '//input[@id="dbList"]/@value');
}

function composeURL(oclcID, databaseID) {
	var risURL = "/share/citation.ris?oclcNumber=" + oclcID + "&databaseIds=" + encodeURIComponent(databaseID);
	return risURL;
}

/**
 * RIS Scraper Function
 *
 */

function scrape(risURL) {
	ZU.doGet(risURL, function (text) {
		// Z.debug(text);

		if (!/^TY {1,2}- /m.test(text)) {
			throw new Error("RIS not found in response");
		}

		// conference proceedings exported as CONF, but fields match BOOK better
		text = text.replace(/TY\s+-\s+CONF\s+[\s\S]+?\n\s*ER\s+-/g, function (m) {
			return m.replace(/^TY\s+-\s+CONF\s*$/mg, 'TY  - BOOK')
				// authors are actually editors
				.replace(/^A1\s+-\s+/mg, 'A3  - ');
		});

		// Zotero.debug("Importing corrected RIS: \n" + text);

		var translator = Zotero.loadTranslator("import");
		translator.setTranslator("32d59d2d-b65a-4da4-b0a3-bdd3cfb979e7");
		translator.setString(text);
		translator.setHandler("itemDone", function (obj, item) {
			item.extra = undefined;
			item.archive = undefined;
			// clean up ISBNs
			if (item.ISBN) {
				var ISBN = item.ISBN.split(/\s/);
				var ISBNarray = [];
				for (let i = 0; i < ISBN.length; i++) {
					if (ZU.cleanISBN(ISBN[i])) {
						ISBNarray.push(ZU.cleanISBN(ISBN[i]));
					}
				}
				item.ISBN = ISBNarray.join(" ");
			}
			// remove space before colon
			item.title = item.title.replace(/\s+:/, ":");

			// remove trailing colon after place
			if (item.place) {
				item.place = item.place.replace(/:\s*$/, "");
			}

			// remove traling period after publication

			if (item.publicationTitle) {
				item.publicationTitle = item.publicationTitle.replace(/\.\s*$/, "");
			}
			// remove trailing commar after publisher
			if (item.publisher) {
				item.publisher = item.publisher.replace(/,\s*$/, "");
			}
			// correct field mode for corporate authors
			for (let i = 0; i < item.creators.length; i++) {
				if (!item.creators[i].firstName) {
					item.creators[i].fieldMode = 1;
				}
			}

			// number of pages gets mapped to section???
			if (item.section) {
				// extract possible roman numerals and number of pages without the p
				var numPages = item.section.match(/(([lxiv]+,\s*)?\d+)\s*p/);
				if (numPages) item.numPages = numPages[1];
			}
			
			// the url field sometimes contains an additional label, e.g. for TOC
			// "url": "Table of contents http://bvbr.bib-bvb.de:8991/...
			if (item.url) {
				var posUrl = item.url.indexOf('http');
				if (posUrl > 0
					|| item.url.includes("http://bvbr.bib-bvb.de:8991")
				) {
					item.attachments.push({
						url: item.url.substr(posUrl),
						title: posUrl > 0 ? item.url.substr(0, posUrl) : "Table of contents",
						snapshot: false
					});
					delete item.url;
				}
			}

			item.complete();
		});
		translator.getTranslatorObject(function (trans) {
			trans.options.defaultItemType = 'book'; // if not supplied, default to book
			trans.options.typeMap = {
				ELEC: 'book'
			}; // ebooks should be imported as books

			trans.doImport();
		});
	});
}

function doWeb(doc, url) {
	var results = getSearchResults(doc);
	if (detectWeb(doc, url) == "multiple") {
		var items = {};
		var articles = [];
		for (var i = 0, n = results.length; i < n; i++) {
			let title = ZU.xpathText(results[i], './/div[contains(@class, "title") and a[@class="record-title"]]');
			// Z.debug(title)
			if (!title) continue;
			let oclcID = ZU.xpathText(results[i], './@data-oclcnum');
			// Z.debug(oclcID)
			let databaseID = ZU.xpathText(results[i], './@data-database-list');
			// Z.debug(databaseID)
			let risURL = composeURL(oclcID, databaseID);
			Z.debug(risURL);
			items[risURL] = title.trim();
		}

		Zotero.selectItems(items, function (items) {
			if (!items) return;

			for (var i in items) {
				articles.push(i);
			}
			scrape(articles);
		});
	}
	else {
		let oclcID = extractOCLCID(url);
		let databaseID = extractDatabaseID(doc);
		if (!oclcID) throw new Error("WorldCat: Failed to extract OCLC ID from URL: " + url);
		let risURL = composeURL(oclcID, databaseID);
		Z.debug("risURL= " + risURL);
		scrape(risURL);
	}
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://sbts.on.worldcat.org/oclc/795005226?databaseList=239,283,638",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Steven E. Runge. Discourse Grammar of the Greek New Testament",
				"creators": [
					{
						"lastName": "Long",
						"firstName": "C.",
						"creatorType": "author"
					}
				],
				"date": "2012",
				"ISSN": "0360-3032",
				"issue": "1",
				"libraryCatalog": "WorldCat Discovery Service",
				"pages": "129-132",
				"publicationTitle": "Trinity journal",
				"volume": "33",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://lpts.on.worldcat.org/search?queryString=au:Mary%20GrandPre%CC%81&databaseList=638",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://sbts.on.worldcat.org/search?databaseList=&queryString=runge+discourse+grammar",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://sbts.on.worldcat.org/oclc/667874424?databaseList=239,283,638",
		"items": [
			{
				"itemType": "book",
				"title": "Discourse grammar of the Greek New Testament: a practical introduction for teaching and exegesis",
				"creators": [
					{
						"lastName": "Runge",
						"firstName": "Steven E.",
						"creatorType": "author"
					}
				],
				"date": "2010",
				"ISBN": "9781598565836",
				"language": "English",
				"libraryCatalog": "WorldCat Discovery Service",
				"numPages": "xx, 404",
				"place": "Peabody, Mass.",
				"publisher": "Hendrickson Publishers Marketing",
				"series": "Lexham Bible reference series",
				"shortTitle": "Discourse grammar of the Greek New Testament",
				"attachments": [
					{
						"title": "Table of contents",
						"snapshot": false
					}
				],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/
