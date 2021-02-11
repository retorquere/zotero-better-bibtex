{
	"translatorID": "3fce237f-8744-4434-b448-4b79eb194ea8",
	"translatorType": 4,
	"label": "Library Catalog (Quolto)",
	"creator": "Sebastian Karcher",
	"target": "/record/-/record/|results/-/results|^https?://(www\\.)?(mokka\\.hu/|odrportal\\.hu/).+results",
	"minVersion": "3.0",
	"maxVersion": null,
	"priority": 100,
	"inRepository": true,
	"browserSupport": "gcsibv",
	"lastUpdated": "2020-11-12 13:20:00"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2020 YOUR_NAME <- TODO
	
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

// attr()/text() v2
// eslint-disable-next-line
function attr(docOrElem,selector,attr,index){var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector);return elem?elem.getAttribute(attr):null;}function text(docOrElem,selector,index){var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector);return elem?elem.textContent:null;}


function detectWeb(doc, url) {
	if (url.includes('/record/-/record/')) {
		return "book";
	}
	else if (getSearchResults(doc, true)) {
		return "multiple";
	}
	return false;
}

function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	// e.g. http://portal.bjc.qulto.ro/
	var rows = doc.querySelectorAll('.results-record-wrapper');
	
	
	if (rows.length) {
		for (let row of rows) {
			let href = attr(row, '.go-to-record a', 'href');
			let title = ZU.trimInternal(text(row, '.data-wrapper-title div.metadata-value'));
			if (!href || !title) continue;
			if (checkOnly) return true;
			found = true;
			items[href] = title;
		}
	}
	else {
		// e.g. http://www.odrportal.hu
		rows = doc.querySelectorAll('.recordRow>table');
		for (let row of rows) {
			let href = attr(row, 'td a', 'href');
			let title = ZU.trimInternal(text(row, 'td.title'));
			if (!href || !title) continue;
			if (checkOnly) return true;
			found = true;
			items[href] = title;
		}
	}
	return found ? items : false;
}

function doWeb(doc, url) {
	if (detectWeb(doc, url) == "multiple") {
		Zotero.selectItems(getSearchResults(doc, false), function (items) {
			if (items) ZU.processDocuments(Object.keys(items), scrape);
		});
	}
	else {
		scrape(doc, url);
	}
}

function cleanMARCXML(text) {
	// MARC XML is served inside an HTML div element with line breaks and escaped angle brackets
	const chars = { '&lt;': '<', '&gt;': '>' };
	text = text.replace(/&[gl]t;/g, m => chars[m]).replace(/<\/?div[^>]*>|&nbsp;|<br\s?\/>/g, "");
	return text.trim();
}
function scrape(doc, url) {
	// the URL is constructed using a string after the first "record" in the URL
	let baseurl = url.substr(0, url.indexOf("record") + 6);
	let MarcXMLUrl = baseurl + "?p_p_id=DisplayRecord_WAR_akfweb&p_p_lifecycle=2&p_p_state=normal&p_p_mode=view&p_p_resource_id=getRecord&p_p_cacheability=cacheLevelPage&p_p_col_id=column-1&p_p_col_count=2&_DisplayRecord_WAR_akfweb_implicitModel=true";
	// Z.debug(MarcXMLUrl);

	// regular display
	let recordId = url.match(/manifestation\/([^/?#]+)/);
	// permalink
	if (!recordId) {
		recordId = url.match(/record\/-\/record\/([^/?#]+)/);
	}
	recordId = recordId[1];
	// Z.debug(baseurl + "/-/record/" + recordId);
	let post = "recordId=" + recordId + "&dbid=solr&recordType=manifestation&format=marcxml.html&fromOutside=false";
	ZU.doPost(MarcXMLUrl, post, function (text) {
		// Z.debug(text);
		text = cleanMARCXML(text);
		// Z.debug(text);
		// MARCXML
		var translator = Zotero.loadTranslator("import");
		translator.setTranslator("edd87d07-9194-42f8-b2ad-997c4c7deefd");
		translator.setString(text);
		translator.setHandler("itemDone", function (obj, item) {
			item.attachments.push({
				title: "Library Catalog link",
				url: baseurl + "/-/record/" + recordId,
				snapshot: false
			});
			item.complete();
		});
		translator.translate();
	});
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.odrportal.hu/web/guest/record/-/record/MOKKAI0008496100",
		"items": [
			{
				"itemType": "book",
				"title": "2. Mednarodna likovna razstava =: Medunarodna likovna izlozba = Internationale Ausstellung bildender Künstler = Nemzetközi Képzőművészeti Kiállítás = Medzinárodná vytvarná vystava: Razstavni Paviljon Arhitekta Franca Novaka, Murska Sobota ... 7. IX.-16. X. 1969",
				"creators": [],
				"date": "1969",
				"abstractNote": "Bartha László kőszegi, Geszler Mária, Majthényi Károly, Tóth V. László, Horváth János, Mészáros József szombathelyi képzőművészek munkái a kiállításon",
				"callNumber": "73/76(100):061.4(497Muraszombat)=00",
				"language": "mul",
				"libraryCatalog": "Library Catalog (Quolto)",
				"numPages": "93",
				"place": "Murska Sobota",
				"publisher": "Organizacijski komite mednarodne likovne razstave",
				"shortTitle": "2. Mednarodna likovna razstava =",
				"attachments": [
					{
						"title": "Library Catalog link",
						"snapshot": false
					}
				],
				"tags": [
					{
						"tag": "Bartha László (1908-1998)"
					},
					{
						"tag": "Geszler Mária"
					},
					{
						"tag": "Horváth János (1930-)"
					},
					{
						"tag": "Kőszeg"
					},
					{
						"tag": "Majthényi Károly (1914-1990)"
					},
					{
						"tag": "Mészáros József (1925-1979)"
					},
					{
						"tag": "Szombathely"
					},
					{
						"tag": "Tóth László, V. (1930-2001)"
					},
					{
						"tag": "festészet, festőművész"
					},
					{
						"tag": "kerámiaművészet, keramikus"
					},
					{
						"tag": "kulturális kapcsolat/nemzetközi"
					},
					{
						"tag": "képzőművészet, képzőművész"
					},
					{
						"tag": "nemzetközi kapcsolat/Szlovénia"
					},
					{
						"tag": "szobrászat, szobrászművész"
					}
				],
				"notes": [
					{
						"note": "Katalógus"
					}
				],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://portal.bjc.qulto.ro/record/-/record/BJC216859",
		"items": [
			{
				"itemType": "book",
				"title": "Examen de credinţă: versuri",
				"creators": [
					{
						"firstName": "Victoria",
						"lastName": "Fătu-Nalaţiu",
						"creatorType": "author"
					},
					{
						"firstName": "Gabriela",
						"lastName": "Rusu",
						"creatorType": "author"
					},
					{
						"firstName": "Oliv",
						"lastName": "Mircea",
						"creatorType": "author"
					}
				],
				"date": "1997",
				"ISBN": "9789739739733",
				"callNumber": "împrumut la sală 845674 821.135.1-1/F26",
				"language": "rumeng",
				"libraryCatalog": "Library Catalog (Quolto)",
				"numPages": "136",
				"place": "Bistriţa",
				"publisher": "Aletheia",
				"shortTitle": "Examen de credinţă",
				"attachments": [
					{
						"title": "Library Catalog link",
						"snapshot": false
					}
				],
				"tags": [],
				"notes": [
					{
						"note": "Ediţie bilingvă"
					}
				],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://portal.bjm.qulto.ro:8081/ro/record/-/record/BJM384882",
		"items": [
			{
				"itemType": "book",
				"title": "Mâna stângă a întunericului",
				"creators": [
					{
						"firstName": "Ursula K.",
						"lastName": "Le Guin",
						"creatorType": "author"
					},
					{
						"firstName": "Mihai-Dan",
						"lastName": "Pavelescu",
						"creatorType": "author"
					}
				],
				"date": "2006",
				"ISBN": "9789735698669",
				"callNumber": "BJM",
				"edition": "Ediţia a 2-a revizuită",
				"language": "rum",
				"libraryCatalog": "Library Catalog (Quolto)",
				"numPages": "301",
				"place": "Bucureşti",
				"publisher": "Nemira",
				"series": "Nautilus",
				"attachments": [
					{
						"title": "Library Catalog link",
						"snapshot": false
					}
				],
				"tags": [
					{
						"tag": "LITERATURĂ AMERICANĂ"
					},
					{
						"tag": "LITERATURĂ AMERICANĂ(roman s.f.)"
					},
					{
						"tag": "roman"
					}
				],
				"notes": [
					{
						"note": "Titlul original : The Left Hand of Darkness"
					}
				],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/
