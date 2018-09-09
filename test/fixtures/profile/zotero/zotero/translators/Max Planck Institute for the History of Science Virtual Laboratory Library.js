{
	"translatorID": "66928fe3-1e93-45a7-8e11-9df6de0a11b3",
	"label": "Max Planck Institute for the History of Science: Virtual Laboratory Library",
	"creator": "Sean Takats, Philipp Zumstein",
	"target": "^https?://vlp\\.mpiwg-berlin\\.mpg\\.de/library/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2018-01-31 23:20:18"
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
	if (url.includes('/library/data/lit')) {
		return "book";
	} else if (getSearchResults(doc, true)) {
		return "multiple";
	}
}


function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = doc.querySelectorAll('span[title], a[title], p[title]');
	for (let i=0; i<rows.length; i++) {
		let href = rows[i].title;
		let title = ZU.trimInternal(rows[i].textContent);
		if (!href || !title) continue;
		if (href.indexOf('lit') !== 0) continue;
		if (checkOnly) return true;
		found = true;
		items['library/meta?id='+href] = title;
	}
	return found ? items : false;
}


function doWeb(doc, url) {
	if (detectWeb(doc, url) == "multiple") {
		Zotero.selectItems(getSearchResults(doc, false), function (items) {
			if (!items) {
				return true;
			}
			var articles = [];
			for (var i in items) {
				articles.push(i);
			}
			scrapeMeta(articles);
		});
	} else {
		var m = url.match(/\/library\/data\/(lit\d+)\b/);
		scrapeMeta("/library/meta?id=" + m[1]);
	}
}


function scrapeMeta(uris) {
	Zotero.Utilities.HTTP.doGet(uris, function(text) {
		// load Refer translator
		var translator = Zotero.loadTranslator("import");
		translator.setTranslator("881f60f2-0802-411a-9228-ce5f47b64c7d");
		translator.setString(text);
		translator.setHandler("itemDone", function(obj, item) {
			item.type = undefined;
			item.complete();
		});
		translator.translate();
	});
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://vlp.mpiwg-berlin.mpg.de/library/search?-format=search&-op_referencetype=eq&referencetype=&-op_author=all&author=&-op_title=all&title=test&-op_secondarytitle=all&secondarytitle=&-op_sql_year=numerical&sql_year=&-op_fullreference=all&fullreference=&-op_online=numerical&-op_transcription=eq&-op_id=numerical&id=&-op_volumeid_search=ct&volumeid_search=&-op_project=eq&project=&-max=25&-display=short&-sort=author%2Csql_year&-find=+Start+Search+",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://vlp.mpiwg-berlin.mpg.de/library/data/lit38593?",
		"items": [
			{
				"itemType": "book",
				"title": "A descriptive list of anthropometric apparatus, consisting of instruments for measuring and testing the chief physical characteristics of the human body. Designed under the direction of Mr. Francis Galton",
				"creators": [
					{
						"firstName": "The Cambridge Scientific Instrument",
						"lastName": "Company",
						"creatorType": "author"
					}
				],
				"date": "1887",
				"language": "English",
				"libraryCatalog": "Max Planck Institute for the History of Science: Virtual Laboratory Library",
				"place": "Cambridge",
				"url": "http://vlp.mpiwg-berlin.mpg.de/references?id=lit38593",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/
