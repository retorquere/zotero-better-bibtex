{
	"translatorID": "446764bf-7da6-49ec-b7a7-fefcbafe317f",
	"label": "Library Catalog (Encore)",
	"creator": "Sebastian Karcher",
	"target": "/iii/encore/(record|search)",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 270,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2017-11-25 15:51:49"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2017 Sebastian Karcher

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
	if (url.includes("encore/record")) {
		return "book";
	} else if (url.includes("encore/search")) {
		return "multiple";
	}
}

function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = doc.querySelectorAll('a[id^=recordDisplayLink2Component]');
	for (let i = 0; i < rows.length; i++) {
		let href = createMarcURL(rows[i].href);
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
		Zotero.selectItems(getSearchResults(doc, false), function(items) {
			if (!items) {
				return true;
			}
			var articles = [];
			for (var i in items) {
				articles.push(i);
			}
			scrape(articles);
		});
	} else {
		var marcURL = createMarcURL(url);
		scrape([marcURL]);
	}
}

function createMarcURL(url) {
	//construct the marc URL
	return url.replace(/\?/, "?marcData=Y&");
}

function scrape(marcURL) {
	for (let i = 0; i < marcURL.length; i++) {
		//Z.debug(marcURL[i])
		// the library catalogue name isn't perfect, but should be unambiguous. 
		var domain = marcURL[i].match(/https?:\/\/([^/]+)/);
		ZU.doGet(marcURL[i], function(text) {
			var translator = Zotero.loadTranslator("import");
			translator.setTranslator("a6ee60df-1ddc-4aae-bb25-45e0537be973");
			translator.getTranslatorObject(function(marc) {
				var record = new marc.record();
				var newItem = new Zotero.Item();
				text = text.replace(/^\n/mg, '') // skip empty lines
						.replace(/\s?\n\s+/gm, ' '); // delete line breaks when only needed for displaying long lines
				//Z.debug(text);
				var line = text.split("\n");
				for (var j = 0; j < line.length; j++) {
					line[j] = line[j].replace(/[\xA0_\t]/g, " ");
					var value = line[j].substr(7);
					if (line[j].substr(0, 6) == "LEADER") {
						// trap leader
						record.leader = value;
					} else {
						var tag = line[j].substr(0, 3);
						var ind = line[j].substr(4, 2);
						if (value) {
							value = value.replace(/\|(.)/g, marc.subfieldDelimiter + "$1");
							if (value[0] != marc.subfieldDelimiter) {
								value = marc.subfieldDelimiter + "a" + value;
							}
							record.addField(tag, ind, value);
						}
					}
				}

				record.translate(newItem);
				newItem.repository = domain[1].replace(/encore\./, "");
				// there is too much stuff in the note field - or file this as an abstract?
				newItem.notes = [];
				newItem.complete();
			});
		});
	}
}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://sallypro.sandiego.edu/iii/encore/record/C__Rb4044553__Stesting__P0%2C6__Orightresult__U__X6?lang=eng&suite=cobalt",
		"items": [
			{
				"itemType": "book",
				"title": "Evaluation and testing in nursing education",
				"creators": [
					{
						"firstName": "Marilyn H.",
						"lastName": "Oermann",
						"creatorType": "author"
					},
					{
						"firstName": "Kathleen B.",
						"lastName": "Gaberson",
						"creatorType": "author"
					}
				],
				"date": "2017",
				"ISBN": "9780826194886",
				"abstractNote": "Considered the \"gold standard' for evaluation and testing in nursing education, this classic text helps educators to assess the level of learning achieved in the classroom, clinical settings, and online. The fifth edition helps teachers to keep pace with new learning dynamics through expanded coverage of essential concepts in assessment, evaluation, and testing in a wider variety of learning environments. It presents new content on evaluation in online programs and testing, and features a new chapter on using simulation for assessment and high stakes evaluations. Also included is updated information on clinical evaluation and program evaluation along with current research featuring new examples and tools. The fifth edition expands content on standardized tests, including how to write test items for licensure and certification exam prep, and provides new information on developing rubrics for assessing written assignments. -- Provided by publisher",
				"callNumber": "RT73.7 .O47 2017",
				"edition": "Fifth edition",
				"extra": "OCLC: 957077777",
				"libraryCatalog": "sallypro.sandiego.edu",
				"numPages": "403",
				"place": "New York, NY",
				"publisher": "Springer Publishing Company, LLC",
				"attachments": [],
				"tags": [
					{
						"tag": "Ability testing"
					},
					{
						"tag": "Ability testing"
					},
					{
						"tag": "Examinations"
					},
					{
						"tag": "Examinations"
					},
					{
						"tag": "Nursing"
					},
					{
						"tag": "Nursing"
					},
					{
						"tag": "Nursing"
					},
					{
						"tag": "Nursing"
					},
					{
						"tag": "Nursing"
					},
					{
						"tag": "Nursing"
					},
					{
						"tag": "Study and teaching Evaluation"
					},
					{
						"tag": "Study and teaching Evaluation"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://sallypro.sandiego.edu/iii/encore/search/C__Rb3558162__Stesting__Orightresult__U__X6?lang=eng&suite=cobalt#resultRecord-b3558162",
		"items": "multiple"
	}
]
/** END TEST CASES **/
