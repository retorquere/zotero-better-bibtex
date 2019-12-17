{
	"translatorID": "66782e6a-a8db-4ed2-9a4f-ce4b30372e22",
	"label": "University of Wisconsin-Madison Libraries Catalog",
	"creator": "Philipp Zumstein",
	"target": "^https://search\\.library\\.wisc\\.edu/(catalog|search)/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2019-06-11 10:25:18"
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


/*
  They use Primo and Alma as their backend and have programmed an
  individual frontend called Forward for their catalog. We can simply
  use their RIS data.
*/

function detectWeb(doc, url) {
	if (url.includes('/search/catalog') && getSearchResults(doc, true)) {
		return "multiple";
	}
	else if (url.includes('/catalog/')) {
		var format = ZU.xpathText(doc, '//span[@class="pub_title" and contains(., "Format")]/following-sibling::span[@class="pub_desc"]');
		// Z.debug(format);
		switch (format) {
			case "Sound Recordings":
				return "audioRecording";

			case "Videos, Slides, Films":
				return "videoRecording";

			case "Maps, Atlases":
				return "map";

			case "Computer software":
				return "computerProgramm";

			case "Photos, Drawings, Prints":
				return "artwork";

			case "Music Scores":
			case "Journals, Magazines, Newspapers": // there is no such itemType yet
			default:
				return "book";
		}
	}
	return false;
}

function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = doc.querySelectorAll('a.item_path[href*="/catalog/"]');
	for (var i = 0; i < rows.length; i++) {
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
			if (!items) return;

			var articles = [];
			for (var i in items) {
				articles.push(i);
			}
			ZU.processDocuments(articles, scrape);
		});
	}
	else {
		scrape(doc, url);
	}
}


function scrape(doc, url) {
	var risURL = url.replace(/[#?].*$/, '') + '.ris';
	// there is also a link tag for RIS but the href is currently missing

	ZU.doGet(risURL, function (text) {
		// delete birth/death year from author name
		text = text.replace(/^(AU\s+-.*), \d\d\d\d-(\d\d\d\d)?$/m, "$1");
		// music scores should be treated as book
		text = text.replace('TY  - MUSIC', 'TY  - BOOK');
		// Z.debug(text);

		var translator = Zotero.loadTranslator("import");
		translator.setTranslator("32d59d2d-b65a-4da4-b0a3-bdd3cfb979e7");
		translator.setString(text);
		translator.setHandler("itemDone", function (obj, item) {
			if (item.abstractNote) {
				// sometimes the physical description is saved in the abstract
				// e.g. 38 pages ; 24 cm
				var m = item.abstractNote.match(/(\d+)\spages\b/);
				if (m) {
					item.numPages = m[1];
					delete item.abstractNote;
				}
			}
			// clean-up the information for publisher
			// e.g. Chicago : Association of College and Research Libraries, 2011.
			if (item.publisher) {
				item.publisher = item.publisher.replace(/,\s\d\d\d\d\.?$/, '');
				var parts = item.publisher.split(' : ');
				if (parts.length == 2) {
					item.place = parts[0];
					item.publisher = parts[1];
				}
			}
			item.complete();
		});
		translator.translate();
	});
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://search.library.wisc.edu/catalog/9910104568102121",
		"items": [
			{
				"itemType": "book",
				"title": "Zotero : a guide for librarians, researchers, and educators",
				"creators": [
					{
						"lastName": "Puckett",
						"firstName": "Jason",
						"creatorType": "author"
					}
				],
				"date": "2011",
				"callNumber": "PN171.F56 P83 2011",
				"libraryCatalog": "University of Wisconsin-Madison Libraries Catalog",
				"numPages": "159",
				"place": "Chicago",
				"publisher": "Association of College and Research Libraries",
				"shortTitle": "Zotero",
				"url": "https://search.library.wisc.edu/catalog/9910104568102121",
				"attachments": [],
				"tags": [],
				"notes": [
					{
						"note": "<p>Includes bibliographical references.</p>"
					}
				],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://search.library.wisc.edu/catalog/9912334246702121",
		"items": [
			{
				"itemType": "book",
				"title": "Fiscal year 2017 budget amendments : communication from the President of the United States transmitting FY 2017 budget amendments for national security activities at the Department of Defense, the Department of State, and the U.S. Agency for International Development to fund overseas contingency operations",
				"creators": [
					{
						"lastName": "United States. President (2009-2017 : Obama)",
						"creatorType": "author",
						"fieldMode": 1
					}
				],
				"date": "2016",
				"callNumber": "Y 1.1/7: 114-178",
				"libraryCatalog": "University of Wisconsin-Madison Libraries Catalog",
				"numPages": "38",
				"place": "Washington",
				"publisher": "U.S. Government Publishing Office",
				"shortTitle": "Fiscal year 2017 budget amendments",
				"url": "https://search.library.wisc.edu/catalog/9912334246702121",
				"attachments": [],
				"tags": [],
				"notes": [
					{
						"note": "<p>Shipping list no.: 2017-0006-M.;&quot;November 14, 2016.&quot;;&quot;Referred to the Committee on Appropriations.&quot;;Microfiche. [Washington, D.C.] : U.S. Government Printing Office, [2017] 1 microfiche : negative.</p>"
					}
				],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://search.library.wisc.edu/catalog/999618880602121",
		"items": [
			{
				"itemType": "audioRecording",
				"title": "Settimo in mi bem. magg., op. 20 = Septet in E flat major, op. 20",
				"creators": [
					{
						"lastName": "Beethoven",
						"firstName": "Ludwig van",
						"creatorType": "composer"
					}
				],
				"date": "[1988]",
				"abstractNote": "1 audio disc (43 min.) : digital ; 4 3/4 in",
				"callNumber": "COMP DISC 385",
				"label": "Pontelambro, Como, Italy : Nuova Era, [1988] ℗1988",
				"libraryCatalog": "University of Wisconsin-Madison Libraries Catalog",
				"url": "https://search.library.wisc.edu/catalog/999618880602121",
				"attachments": [],
				"tags": [],
				"notes": [
					{
						"note": "<p>For clarinet, horn, bassoon, violin, viola, violoncello, and double bass.;Compact disc.;Duration: 42:10.;Program notes by Paolo Petazzi in Italian and English ([14] p. : ill.) inserted in container.;Forms part of: Curtiss Blake Collection.</p>"
					}
				],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://search.library.wisc.edu/catalog/9910065379202121",
		"items": [
			{
				"itemType": "book",
				"title": "Oktett für vier Violinen, zwei Violen und zwei Violoncelli, op. 20 : Arrangement für Klavier zu vier Händen",
				"creators": [
					{
						"lastName": "Mendelssohn-Bartholdy",
						"firstName": "Felix",
						"creatorType": "author"
					}
				],
				"date": "2004",
				"callNumber": "M3 M236 1997 Ser.3 v.5a",
				"libraryCatalog": "University of Wisconsin-Madison Libraries Catalog",
				"numPages": "101",
				"place": "Wiesbaden",
				"publisher": "Breitkopf & Härtel",
				"shortTitle": "Oktett für vier Violinen, zwei Violen und zwei Violoncelli, op. 20",
				"url": "https://search.library.wisc.edu/catalog/9910065379202121",
				"attachments": [],
				"tags": [],
				"notes": [
					{
						"note": "<p>Arrangement by the composer.;&quot;Herausgegeben von der Sächsischen Akademie der Wissenschaften zu Leipzig.&quot;--Series t.p.;Added t.p. in English.;Introd. in German with English translation; critical commentary in German on p. 95-101.;Includes bibliographical references.</p>"
					}
				],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://search.library.wisc.edu/search/catalog?q=zotero",
		"items": "multiple"
	}
]
/** END TEST CASES **/
