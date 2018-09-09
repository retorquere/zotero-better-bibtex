{
	"translatorID": "54ac4ec1-9d07-45d3-9d96-48bed3411fb6",
	"label": "National Library of Australia (new catalog)",
	"creator": "Philipp Zumstein",
	"target": "^https?://catalogue\\.nla\\.gov\\.au",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2018-01-30 09:40:11"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2018 Philipp Zumstein
	
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
function attr(docOrElem,selector,attr,index){var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector);return elem?elem.getAttribute(attr):null;}function text(docOrElem,selector,index){var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector);return elem?elem.textContent:null;}


function detectWeb(doc, url) {
	if (url.match("/Record/[0-9]+")) {
		var format = doc.getElementById("myformat").textContent;
		return computeFormat(format);
		
	} else if (url.includes("/Search/Home") && doc.getElementById("resultItemLine1")) {
		return "multiple";
	}
}


// map the nla formats to zotero formats
function computeFormat(format){
	// clean up whitespace and remove commas from items with multiple formats
	format = Zotero.Utilities.trimInternal(format.replace(',', ''));
	if (format == "Audio") return "audioRecording";
	if (format == "Book") return "book";
	if (format == "Journal/Newspaper") return "journalArticle";
	if (format == "Manuscript") return "manuscript";
	if (format == "Map") return "map";
	if (format == "Music") return "audioRecording";
	if (format == "Online") return "webpage";
	if (format == "Picture") return "artwork";
	if (format == "Video") return "videoRecording";
	// default
	return "book";
}


function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = doc.querySelectorAll('.resultitem a.title');
	for (let i=0; i<rows.length; i++) {
		let href = rows[i].href;
		if (!/\/Record\/\d+/.test(href)) continue;
		let title = ZU.trimInternal(rows[i].textContent);
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
			processUrls(Object.keys(items));
		});
	} else {
		processUrls([url]);
	}
}


function processUrls(urls) {
	for (let i=0; i<urls.length; i++) {
		var bibid = urls[i].match(/\/Record\/(\d+)\b/);
		if (bibid) {
			var marcUrl = "/Record/" + bibid[1] + "/Export?style=marc";
			ZU.doGet(marcUrl, scrapeMarc);
		}
	}
}

function scrapeMarc(text) {
	var translator = Zotero.loadTranslator("import");
	translator.setTranslator("a6ee60df-1ddc-4aae-bb25-45e0537be973");
	translator.setString(text);
	translator.translate();
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://catalogue.nla.gov.au/Record/773336?lookfor=labor&offset=10&max=65985",
		"items": [
			{
				"itemType": "book",
				"title": "Labor: readings on major issues",
				"creators": [
					{
						"firstName": "Richard Allen",
						"lastName": "Lester",
						"creatorType": "author"
					}
				],
				"date": "1967",
				"callNumber": "331.082",
				"libraryCatalog": "National Library of Australia (new catalog)",
				"place": "New York",
				"publisher": "Random House",
				"shortTitle": "Labor",
				"attachments": [],
				"tags": [
					{
						"tag": "Labor unions"
					},
					{
						"tag": "United States"
					},
					{
						"tag": "United States"
					},
					{
						"tag": "Working class"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://catalogue.nla.gov.au/Search/Home?lookfor=labor&type=all&limit%5B%5D=&submit=Find&filter[]=language:%22eng%22",
		"items": "multiple"
	}
]
/** END TEST CASES **/
