{
	"translatorID": "303bdfc5-11b8-4107-bca1-63ca97701a0f",
	"label": "ASCE",
	"creator": "Sebastian Karcher",
	"target": "^https?://(www\\.)?ascelibrary\\.org/(toc|doi|action)/",
	"minVersion": "2.1.9",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2020-06-28 02:29:25"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2020 Sebastian Karcher

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
function attr(docOrElem,selector,attr,index){var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector);return elem?elem.getAttribute(attr):null}function text(docOrElem,selector,index){var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector);return elem?elem.textContent:null}

function detectWeb(doc, url) {
	if (/\/doi\/((abs|full)\/)?10\./.test(url)) {
		return "journalArticle";
	}
	else if (getSearchResults(doc, true)) {
		return "multiple";
	}
	return false;
}

function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = doc.querySelectorAll('div[class*="art_title"]>a');
	for (let row of rows) {
		let href = row.href;
		let title = ZU.trimInternal(row.textContent);
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
			if (items) ZU.processDocuments(Object.keys(items), scrape);
		});
	}
	else {
		scrape(doc, url);
	}
}

function scrape(doc, url) {
	// EM only gets a social media preview for the abastract
	let abstract = text(doc, 'article.article div[class*="Abstract"]>p');

	// Z.debug(abstract);
	var translator = Zotero.loadTranslator('web');
	// Embedded Metadata
	translator.setTranslator('951c027d-74ac-47d4-a107-9c3069ab7b48');
	translator.setDocument(doc);

	translator.setHandler('itemDone', function (obj, item) {
		item.libraryCatalog = "ASCE";
		if (abstract) {
			item.abstractNote = abstract;
		}
		// Remove mapping from DC:coverage to archiveLocation
		item.archiveLocation = "";
		item.complete();
	});

	translator.getTranslatorObject(function (trans) {
		trans.doWeb(doc, url);
	});
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://ascelibrary.org/action/doSearch?text1=test&field1=AllField&logicalOpe1=AND&text2=&field2=AllField&logicalOpe2=NOT&text3=&field3=AllField&logicalOpe3=AND&text4=&field4=AllField&logicalOpe4=AND&text5=&field5=AllField&logicalOpe5=AND&text6=&field6=AllField&logicalOpe6=AND&text7=&field7=AllField&AfterMonth=&AfterYear=&BeforeMonth=&BeforeYear=",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://ascelibrary.org/doi/abs/10.1061/%28ASCE%290887-381X%282003%2917%3A1%2837%29",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Friction Measurement on Cycleways Using a Portable Friction Tester",
				"creators": [
					{
						"firstName": "A.",
						"lastName": "Bergström",
						"creatorType": "author"
					},
					{
						"firstName": "H.",
						"lastName": "Åström",
						"creatorType": "author"
					},
					{
						"firstName": "R.",
						"lastName": "Magnusson",
						"creatorType": "author"
					}
				],
				"date": "2003/03/01",
				"DOI": "10.1061/(ASCE)0887-381X(2003)17:1(37)",
				"ISSN": "0887-381X",
				"abstractNote": "In seeking to promote cycling in wintertime, it is desirable to understand how important the winter maintenance service level is in people’s decision to cycle or not, and methods to compare different road conditions on cycleways are therefore needed. By measuring friction, an assessment of the service level can be achieved, but methods available often involve the use of large vehicles, which can lead to overloading damage on cycleways, and constitute a safety risk for cyclists and pedestrians. A portable friction tester (PFT), originally designed to measure friction on road markings, was thought to be an appropriate instrument for cycleways and was, therefore, tested on different winter road conditions, and on different cycleway pavement materials. In this study, it was found that the PFT is a valuable tool for measuring friction on cycleways. Different winter road conditions, as well as different pavement materials, can be distinguished from each other through PFT measurements. The PFT provides a good complement to visual inspections of cycleways in winter maintenance evaluation and can, for example, be used to determine if desired service levels have been achieved.",
				"issue": "1",
				"language": "EN",
				"libraryCatalog": "ASCE",
				"pages": "37-57",
				"publicationTitle": "Journal of Cold Regions Engineering",
				"rights": "Copyright © 2003 American Society of Civil Engineers",
				"url": "https://ascelibrary.org/doi/abs/10.1061/%28ASCE%290887-381X%282003%2917%3A1%2837%29",
				"volume": "17",
				"attachments": [
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					},
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					{
						"tag": "Bicycles"
					},
					{
						"tag": "Friction"
					},
					{
						"tag": "Maintenance"
					},
					{
						"tag": "Measurement"
					},
					{
						"tag": "Roads"
					},
					{
						"tag": "friction"
					},
					{
						"tag": "inspection"
					},
					{
						"tag": "maintenance engineering"
					},
					{
						"tag": "road traffic"
					},
					{
						"tag": "safety"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://ascelibrary.org/toc/jcemd4/138/5",
		"items": "multiple"
	}
]
/** END TEST CASES **/
