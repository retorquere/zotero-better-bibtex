{
	"translatorID": "e16095ae-986c-4117-9cb6-20f3b7a52f64",
	"label": "Protein Data Bank",
	"creator": "Philipp Zumstein",
	"target": "^https?://www\\.(pdb|rcsb)\\.org/pdb/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2017-06-03 18:51:04"
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


function detectWeb(doc, url) {
	if (url.indexOf("results.do") != -1 && getSearchResults(doc, true)) {
		return "multiple";
	} else if (url.indexOf("structureId") != -1) {
		return "journalArticle";
	}
}


function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = ZU.xpath(doc, '//li[contains(@class, "oneSearchResult")]//h3/a');
	for (var i=0; i<rows.length; i++) {
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
	var translator = Zotero.loadTranslator('web');
	// Embedded Metadata
	translator.setTranslator('951c027d-74ac-47d4-a107-9c3069ab7b48');
	translator.setDocument(doc);
	translator.setHandler('itemDone', function (obj, item) {
		item.DOI = ZU.xpathText(doc, '//li[strong[contains(., "DOI")]]/a');
		item.tags = [];
		var pdburl = ZU.xpathText(doc, '//ul/li/a[contains(., "PDB Format")]/@href');
		if (pdburl) {
			item.attachments.push({
				url: pdburl,
				title: "Protein Data Bank .pdb File",
				mimeType: "chemical/x-pdb"
			});
		}
		item.complete();
	});
	translator.translate();
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.rcsb.org/pdb/explore/explore.do?structureId=1COW",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "The structure of bovine F1-ATPase complexed with the antibiotic inhibitor aurovertin B.",
				"creators": [
					{
						"firstName": "M. J.",
						"lastName": "van Raaij",
						"creatorType": "author"
					},
					{
						"firstName": "J. P.",
						"lastName": "Abrahams",
						"creatorType": "author"
					},
					{
						"firstName": "A. G.",
						"lastName": "Leslie",
						"creatorType": "author"
					},
					{
						"firstName": "J. E.",
						"lastName": "Walker",
						"creatorType": "author"
					}
				],
				"date": "1996",
				"DOI": "10.2210/pdb1cow/pdb",
				"abstractNote": "1COW: The structure of bovine F1-ATPase complexed with the antibiotic inhibitor aurovertin B.",
				"libraryCatalog": "www.rcsb.org",
				"pages": "6913-6917",
				"publicationTitle": "Proc.Natl.Acad.Sci.USA",
				"url": "http://www.rcsb.org/pdb/explore/explore.do?structureId=1COW",
				"volume": "93",
				"attachments": [
					{
						"title": "Snapshot"
					},
					{
						"title": "Protein Data Bank .pdb File",
						"mimeType": "chemical/x-pdb"
					}
				],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.rcsb.org/pdb/explore/explore.do?structureId=1VHZ",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Structural analysis of a set of proteins resulting from a bacterial genomics project",
				"creators": [
					{
						"firstName": "J.",
						"lastName": "Badger",
						"creatorType": "author"
					},
					{
						"firstName": "J. M.",
						"lastName": "Sauder",
						"creatorType": "author"
					},
					{
						"firstName": "J. M.",
						"lastName": "Adams",
						"creatorType": "author"
					},
					{
						"firstName": "S.",
						"lastName": "Antonysamy",
						"creatorType": "author"
					},
					{
						"firstName": "K.",
						"lastName": "Bain",
						"creatorType": "author"
					},
					{
						"firstName": "M. G.",
						"lastName": "Bergseid",
						"creatorType": "author"
					},
					{
						"firstName": "S. G.",
						"lastName": "Buchanan",
						"creatorType": "author"
					},
					{
						"firstName": "M. D.",
						"lastName": "Buchanan",
						"creatorType": "author"
					},
					{
						"firstName": "Y.",
						"lastName": "Batiyenko",
						"creatorType": "author"
					},
					{
						"firstName": "J. A.",
						"lastName": "Christopher",
						"creatorType": "author"
					},
					{
						"firstName": "S.",
						"lastName": "Emtage",
						"creatorType": "author"
					},
					{
						"firstName": "A.",
						"lastName": "Eroshkina",
						"creatorType": "author"
					},
					{
						"firstName": "I.",
						"lastName": "Feil",
						"creatorType": "author"
					},
					{
						"firstName": "E. B.",
						"lastName": "Furlong",
						"creatorType": "author"
					},
					{
						"firstName": "K. S.",
						"lastName": "Gajiwala",
						"creatorType": "author"
					},
					{
						"firstName": "X.",
						"lastName": "Gao",
						"creatorType": "author"
					},
					{
						"firstName": "D.",
						"lastName": "He",
						"creatorType": "author"
					},
					{
						"firstName": "J.",
						"lastName": "Hendle",
						"creatorType": "author"
					},
					{
						"firstName": "A.",
						"lastName": "Huber",
						"creatorType": "author"
					},
					{
						"firstName": "K.",
						"lastName": "Hoda",
						"creatorType": "author"
					},
					{
						"firstName": "P.",
						"lastName": "Kearins",
						"creatorType": "author"
					},
					{
						"firstName": "C.",
						"lastName": "Kissinger",
						"creatorType": "author"
					},
					{
						"firstName": "B.",
						"lastName": "Laubert",
						"creatorType": "author"
					},
					{
						"firstName": "H. A.",
						"lastName": "Lewis",
						"creatorType": "author"
					},
					{
						"firstName": "J.",
						"lastName": "Lin",
						"creatorType": "author"
					},
					{
						"firstName": "K.",
						"lastName": "Loomis",
						"creatorType": "author"
					},
					{
						"firstName": "D.",
						"lastName": "Lorimer",
						"creatorType": "author"
					},
					{
						"firstName": "G.",
						"lastName": "Louie",
						"creatorType": "author"
					},
					{
						"firstName": "M.",
						"lastName": "Maletic",
						"creatorType": "author"
					},
					{
						"firstName": "C. D.",
						"lastName": "Marsh",
						"creatorType": "author"
					},
					{
						"firstName": "I.",
						"lastName": "Miller",
						"creatorType": "author"
					},
					{
						"firstName": "J.",
						"lastName": "Molinari",
						"creatorType": "author"
					},
					{
						"firstName": "H. J.",
						"lastName": "Muller-Dieckmann",
						"creatorType": "author"
					},
					{
						"firstName": "J. M.",
						"lastName": "Newman",
						"creatorType": "author"
					},
					{
						"firstName": "B. W.",
						"lastName": "Noland",
						"creatorType": "author"
					},
					{
						"firstName": "B.",
						"lastName": "Pagarigan",
						"creatorType": "author"
					},
					{
						"firstName": "F.",
						"lastName": "Park",
						"creatorType": "author"
					},
					{
						"firstName": "T. S.",
						"lastName": "Peat",
						"creatorType": "author"
					},
					{
						"firstName": "K. W.",
						"lastName": "Post",
						"creatorType": "author"
					},
					{
						"firstName": "S.",
						"lastName": "Radojicic",
						"creatorType": "author"
					},
					{
						"firstName": "A.",
						"lastName": "Ramos",
						"creatorType": "author"
					},
					{
						"firstName": "R.",
						"lastName": "Romero",
						"creatorType": "author"
					},
					{
						"firstName": "M. E.",
						"lastName": "Rutter",
						"creatorType": "author"
					},
					{
						"firstName": "W. E.",
						"lastName": "Sanderson",
						"creatorType": "author"
					},
					{
						"firstName": "K. D.",
						"lastName": "Schwinn",
						"creatorType": "author"
					},
					{
						"firstName": "J.",
						"lastName": "Tresser",
						"creatorType": "author"
					},
					{
						"firstName": "J.",
						"lastName": "Winhoven",
						"creatorType": "author"
					},
					{
						"firstName": "T. A.",
						"lastName": "Wright",
						"creatorType": "author"
					},
					{
						"firstName": "L.",
						"lastName": "Wu",
						"creatorType": "author"
					},
					{
						"firstName": "J.",
						"lastName": "Xu",
						"creatorType": "author"
					},
					{
						"firstName": "T. J.",
						"lastName": "Harris",
						"creatorType": "author"
					}
				],
				"date": "2005",
				"DOI": "10.2210/pdb1vhz/pdb",
				"abstractNote": "1VHZ: Structural analysis of a set of proteins resulting from a bacterial genomics project",
				"libraryCatalog": "www.rcsb.org",
				"pages": "787-796",
				"publicationTitle": "Proteins",
				"url": "http://www.rcsb.org/pdb/explore/explore.do?structureId=1VHZ",
				"volume": "60",
				"attachments": [
					{
						"title": "Snapshot"
					},
					{
						"title": "Protein Data Bank .pdb File",
						"mimeType": "chemical/x-pdb"
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