{
	"translatorID": "d93c14fb-d327-4540-b60a-327309ea512b",
	"label": "Journal of Electronic Publishing",
	"creator": "Sebastian Karcher",
	"target": "^https?://quod\\.lib\\.umich\\.edu/j/jep",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2018-01-31 20:16:13"
}

/*
   Journal for Electronic Publishing Translator
   Copyright (C) 2012 Sebastian Karcher

   This program is free software: you can redistribute it and/or modify
   it under the terms of the GNU Affero General Public License as published by
   the Free Software Foundation, either version 3 of the License, or
   (at your option) any later version.

   This program is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   GNU Affero General Public License for more details.

   You should have received a copy of the GNU Affero General Public License
   along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/


function detectWeb(doc,url) {
	if (attr(doc, 'meta[name="DC.citation.volume"]', 'content')) {
		return "journalArticle";
	}
	if (getSearchResults(doc, true)) {
		return "multiple";
	}
}


// attr()/text() v2
function attr(docOrElem,selector,attr,index){var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector);return elem?elem.getAttribute(attr):null;}function text(docOrElem,selector,index){var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector);return elem?elem.textContent:null;}


function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = doc.querySelectorAll('#searchresults tr>td>a, #picklistbody tr>td>a');
	for (let i=0; i<rows.length; i++) {
		let href = rows[i].href;
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
			var articles = [];
			for (var i in items) {
				articles.push(i);
			}
			ZU.processDocuments(articles, scrape);
		});
	} else {
		scrape(doc, url);
	}
}


function scrape(doc, url) {
	// We call the Embedded Metadata translator to do the actual work
	var abstract = ZU.xpathText(doc, '//p[@class="prelim"]');

	var translator = Zotero.loadTranslator("web");
	translator.setTranslator("951c027d-74ac-47d4-a107-9c3069ab7b48");
	translator.setHandler("itemDone", function(obj, item) {
		item.abstractNote = abstract;
		item.complete();
	});
	translator.getTranslatorObject(function (obj) {
		obj.doWeb(doc, url);
	});

}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://quod.lib.umich.edu/j/jep/3336451.0014.1*?rgn=full+text",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://quod.lib.umich.edu/j/jep?type=simple&q1=zotero&rgn=full+text&cite1=&cite1restrict=author&cite2=&cite2restrict=author&Submit=Search",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://quod.lib.umich.edu/j/jep/3336451.0014.212?rgn=main;view=fulltext;q1=zotero",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "The Upright Script: Words in Space and on the Page",
				"creators": [
					{
						"firstName": "Amaranth",
						"lastName": "Borsuk",
						"creatorType": "author"
					}
				],
				"date": "2011-10-03",
				"DOI": "10.3998/3336451.0014.212",
				"ISSN": "1080-2711",
				"abstractNote": "This essay provides a critical analysis of the way pervasive data culture impacts the form of poetry and conceptions of authorship for those print and digital poets who let it enter their work. As depicted in popular media, the data cloud is a confusing and disordered space in which we lose all sense of privacy. However, a number of contemporary poets seek to get lost in this ether, reveling in the network of language that surrounds us. They do so in part because the very technologies that make such data visible in turn make the writer invisible, an authorial position more comfortable for poets of the networked age. Examined alongside the recent surge in interest in infosthetics, conceptual and digital poetry can be seen as embracing a “data poetics” attuned to the materiality of language.",
				"issue": "2",
				"language": "en",
				"libraryCatalog": "quod.lib.umich.edu",
				"publicationTitle": "Journal of Electronic Publishing",
				"shortTitle": "The Upright Script",
				"url": "http://dx.doi.org/10.3998/3336451.0014.212",
				"volume": "14",
				"attachments": [
					{
						"title": "Snapshot"
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
