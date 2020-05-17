{
	"translatorID": "e3748cf3-36dc-4816-bf86-95a0b63feb03",
	"label": "Gale Databases",
	"creator": "Jim Miazek",
	"target": "^https?://[^?&]*(?:gale|galegroup|galetesting|ggtest)\\.com(?:\\:\\d+)?/ps/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2019-12-25 09:35:52"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Gale Databases Translator - Copyright © 2019
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


function processMultipleEntries(entries) {
	var keyValuePairs = {};
	for (var entry of entries) {
		keyValuePairs[entry.href] = entry.textContent;
	}
	Zotero.selectItems(keyValuePairs, function (selectedItems) {
		if (selectedItems) {
			Zotero.Utilities.processDocuments(Object.keys(selectedItems), processSingleEntry);
		}
	});
}

function processSingleEntry(doc) {
	var entry = doc.querySelector('.zotero');
	var docId = entry.getAttribute('data-documentnumber');
	var documentUrl = entry.getAttribute('href');
	var productName = entry.getAttribute('data-productname');
	var documentData = '{"docId":"' + docId + '","documentUrl":"' + documentUrl + '","productName":"' + productName + '"}';
	var urlParams = "citationFormat=RIS&documentData=" + encodeURIComponent(documentData).replace(/%20/g, "+");
	Zotero.Utilities.doPost("/ps/citationtools/rest/cite/download", urlParams, translate);
}

function translate(data) {
	var translator = Zotero.loadTranslator("import");
	// use RIS translator
	translator.setTranslator("32d59d2d-b65a-4da4-b0a3-bdd3cfb979e7");
	translator.setString(transform(data));
	translator.setHandler("itemDone", function (obj, item) {
		if (item.ISSN) {
			item.ISSN = Zotero.Utilities.cleanISSN(item.ISSN);
		}
		if (item.pages && item.pages.endsWith("+")) {
			item.pages = item.pages.replace(/\+/, "-");
		}
		item.attachments.push({ document: data, title: "Snapshot" });
		item.complete();
	});
	translator.translate();
}

function transform(ris) {
	return ris.trim()
		.replace(/M1\s*-/g, "IS  -") // gale puts issue numbers in M1
		.replace(/^(?:L2|M2)\s+-.+\n/gm, '') // Ignore
		.replace(/^SP\s+-\s+NA\n/gm, '') // Remove missing page numbers
		.replace(/^N1(?=\s+-\s+copyright)/igm, 'CR');
}

function getCitableDocuments(doc) {
	return doc.getElementsByClassName('zotero');
}


function detectWeb(doc, _url) {
	if (doc.getElementById('searchResults')) {
		Zotero.monitorDOMChanges(doc.querySelector('#searchResults'));
	}
	var entries = getCitableDocuments(doc);
	switch (entries.length) {
		case 0: return false;
		case 1: return entries[0].getAttribute('data-zoterolabel');
		default: return 'multiple';
	}
}

function doWeb(doc, _url) {
	var entries = getCitableDocuments(doc);
	switch (entries.length) {
		case 0: break;
		case 1: processSingleEntry(doc); break;
		default: processMultipleEntries(entries);
	}
}


/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://go.gale.com/ps/i.do?p=PROF&u=nysl_ce_syr&id=GALE|A213083272&v=2.1&it=r&sid=PROF&asid=a8973dd8",
		"items": [
			{
				"itemType": "magazineArticle",
				"title": "Improving a counselor education Web site through usability testing: the bibliotherapy education project",
				"creators": [
					{
						"lastName": "McMillen",
						"firstName": "Paula S.",
						"creatorType": "author"
					},
					{
						"lastName": "Pehrsson",
						"firstName": "Dale-Elizabeth",
						"creatorType": "author"
					}
				],
				"date": "Dezember 2009",
				"ISSN": "0011-0035",
				"archive": "Gale OneFile: Educator's Reference Complete",
				"issue": "2",
				"language": "English",
				"libraryCatalog": "Gale",
				"pages": "122-",
				"publicationTitle": "Counselor Education and Supervision",
				"shortTitle": "Improving a counselor education Web site through usability testing",
				"url": "https://link.gale.com/apps/doc/A213083272/PROF?u=nysl_ce_syr&sid=zotero&xid=a8973dd8",
				"volume": "49",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					{
						"tag": "Bibliotherapy"
					},
					{
						"tag": "Counseling"
					},
					{
						"tag": "Counselling"
					},
					{
						"tag": "Usability testing"
					},
					{
						"tag": "Web sites (World Wide Web)"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/
