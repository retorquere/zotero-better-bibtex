{
	"translatorID": "cee0cca2-e82a-4618-b6cf-16327970169d",
	"translatorType": 4,
	"label": "Gene Ontology",
	"creator": "Amelia Ireland and Abe Jellinek",
	"target": "^https?://(amigo\\.)?geneontology\\.org/",
	"minVersion": "2.0",
	"maxVersion": null,
	"priority": 100,
	"inRepository": true,
	"browserSupport": "gcsibv",
	"lastUpdated": "2021-06-23 01:35:00"
}

/*
	Copyright (C) 2010-2021 girlwithglasses (amelia.ireland@gmail.com)
							and Abe Jellinek

	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU General Public License for more details.

	You should have received a copy of the GNU General Public License
	along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
/*
	This translator works on cited PubMed references on the Gene Ontology website.

	It makes use of the code of the existing PubMed translator; thanks to the
	authors of that translator for their premium quality code.
*/


var items = {};
var choices = {};
var itemsRemaining = 0;

function detectWeb(doc, _url) {
	if (getPMIDs(doc, true)) {
		Zotero.debug("Found some cites!");
		return "multiple";
	}
	return false;
}

function getPMIDs(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = doc.querySelectorAll('cite a[title*="PMID:"], cite a[href*="/pubmed/"]');
	for (let row of rows) {
		let pmid = (row.href.match(/\/pubmed\/([0-9]+)/) || [])[1];
		if (!pmid) pmid = (row.textContent.match(/PMID:([0-9]+)/) || [])[1];
		let title = ZU.trimInternal(row.textContent);
		if (!pmid || !title) continue;
		if (checkOnly) return true;
		found = true;
		items[pmid] = title;
	}
	return found ? items : false;
}

function doWeb(doc, _url) {
	choices = getPMIDs(doc, false);
	items = {};
	
	let pmids = Object.keys(choices);
	itemsRemaining = pmids.length;
	
	for (let pmid of pmids) {
		searchWithPMID(pmid, itemLookupComplete);
	}
}

function searchWithPMID(pmid, callback) {
	var translate = Zotero.loadTranslator("search");
	translate.setTranslator("3d0231ce-fd4b-478c-b1d3-840389e5b68c"); // PubMed
	
	var item = { itemType: "journalArticle", PMID: pmid };
	translate.setSearch(item);
	
	// Don't throw on error
	translate.setHandler("error", function () {
		callback(null);
	});

	// don't save immediately when item is done
	translate.setHandler("itemDone", function (translate, item) {
		item.itemID = pmid;
		callback(item);
	});

	translate.translate();
}

function itemLookupComplete(item) {
	itemsRemaining--;
	
	if (item) {
		choices[item.itemID] = item.title;
		items[item.itemID] = item;
	}
	
	if (itemsRemaining <= 0) {
		Zotero.selectItems(choices, function (selected) {
			if (selected) {
				for (let selectedPMID of Object.keys(selected)) {
					items[selectedPMID].complete();
				}
			}
		});
	}
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://amigo.geneontology.org/amigo/term/GO:0048003",
		"items": "multiple"
	}
]
/** END TEST CASES **/
