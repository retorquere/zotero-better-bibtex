{
	"translatorID": "b28d0d42-8549-4c6d-83fc-8382874a5cb9",
	"label": "DOI Content Negotiation",
	"creator": "Sebastian Karcher",
	"target": "",
	"minVersion": "4.0.29.11",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 8,
	"browserSupport": "gcs",
	"lastUpdated": "2019-01-26 18:00:00"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2019 Sebastian Karcher

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

function detectSearch(items) {
	return (filterQuery(items).length > 0);
}

// return an array of DOIs from the query (items or text)
function filterQuery(items) {
	if (!items) return [];

	if (typeof items == 'string' || !items.length) items = [items];

	// filter out invalid queries
	var dois = [], doi;
	for (var i = 0, n = items.length; i < n; i++) {
		if (items[i].DOI && (doi = ZU.cleanDOI(items[i].DOI))) {
			dois.push(doi);
		}
		else if (typeof items[i] == 'string' && (doi = ZU.cleanDOI(items[i]))) {
			dois.push(doi);
		}
	}
	return dois;
}

function doSearch(items) {
	var dois = filterQuery(items);
	if (!dois.length) return;
	processDOIs(dois);
}

function processDOIs(dois) {
	var doi = dois.pop();
	// by content negotiation we asked for datacite or crossref format, or CSL JSON
	ZU.doGet('https://doi.org/' + encodeURIComponent(doi), function (text) {
		if (!text) {
			return;
		}
		Z.debug(text);
		
		var trans = Zotero.loadTranslator('import');
		trans.setString(text);
		if (text.includes("<crossref")) {
			// Crossref Unixref
			trans.setTranslator('93514073-b541-4e02-9180-c36d2f3bb401');
			trans.setHandler('itemDone', function (obj, item) {
				item.libraryCatalog = "DOI.org (Crossref)";
				item.complete();
			});
			trans.translate();
		}
		else if (text.includes("http://datacite.org/schema")) {
			// Datacite JSON
			trans.setTranslator('b5b5808b-1c61-473d-9a02-e1f5ba7b8eef');
			trans.setHandler('itemDone', function (obj, item) {
				item.libraryCatalog = "DOI.org (Datacite)";
				item.complete();
			});
			trans.translate();
		}
		else {
			// use CSL JSON translator
			trans.setTranslator('bc03b4fe-436d-4a1f-ba59-de4d2d7a63f7');
			trans.setHandler('itemDone', function (obj, item) {
				item.libraryCatalog = "DOI.org (CSL JSON)";
				// check if there are potential issues with character encoding and try to fix it
				// e.g. 10.1057/9780230391116.0016 (en dash in title is presented as escaped unicode)
				for (var field in item) {
					if (typeof item[field] != 'string') continue;
					// check for control characters that should never be in strings from CrossRef
					if (/[\u007F-\u009F]/.test(item[field])) {
						var escaped = item[field].replace(/[^0-9A-Za-z ]/g, function (c) {
							return "%" + c.charCodeAt(0).toString(16);
						});
						item[field] = decodeURIComponent(escaped);
					}
				}
				item.complete();
			});
			trans.translate();
		}
	}, function () {
		if (dois.length) processDOIs(dois);
	}, undefined, { Accept: "application/vnd.datacite.datacite+json, application/vnd.crossref.unixref+xml, application/vnd.citationstyles.csl+json" });
}

/** BEGIN TEST CASES **/
var testCases = [{
	"type": "search",
	"input": {
		"DOI": "10.12763/ONA1045"
	},
	"items": [{
		"itemType": "journalArticle",
		"url": "http://docnum.univ-lorraine.fr/pulsar/RCR_543952102_NA1045.pdf",
		"pages": "39.79 MB, 402 pages",
		"date": "1734",
		"DOI": "10.12763/ona1045",
		"accessDate": "2019-02-02T02:31:57Z",
		"libraryCatalog": "DOI.org (Datacite)",
		"language": "fre",
		"title": "Code criminel de l'empereur Charles V vulgairement appellé la Caroline contenant les loix qui sont suivies dans les jurisdictions criminelles de l'Empire et à l'usage des conseils de guerre des troupes suisses.",
		"creators": [{
			"firstName": "",
			"lastName": "Heiliges Römisches Reich Deutscher Nation",
			"creatorType": "author"
		},
		{
			"firstName": "Franz Adam. Éditeur Scientifique",
			"lastName": "Vogel",
			"creatorType": "contributor"
		},
		{
			"firstName": "Simon, Claude (167 ?-1752) Éditeur",
			"lastName": "Commercial",
			"creatorType": "contributor"
		},
		{
			"firstName": "",
			"lastName": "Université De Lorraine-Direction De La Documentation Et De L'Edition",
			"creatorType": "contributor"
		}
		],
		"tags": [
			"Droit"
		],
		"relations": [],
		"attachments": [],
		"notes": [
			"<h2>Other</h2>\nLe code est accompagné de commentaires de F. A. Vogel, qui signe l'épitre dédicatoire<h2>Other</h2>\nReliure 18è siècle<h2>Other</h2>\nEx-libris manuscrit \"Ex libris Dufour\""
		]
	}]
},
{
	"type": "search",
	"input": {
		"DOI": "10.7336/academicus.2014.09.05"
	},
	"items": [{
		"itemType": "journalArticle",
		"url": "http://academicus.edu.al/?subpage=volumes&nr=9",
		"volume": "9",
		"pages": "69-78",
		"publicationTitle": "Academicus International Scientific Journal",
		"ISSN": "20793715",
		"date": "01/2014",
		"DOI": "10.7336/academicus.2014.09.05",
		"accessDate": "2019-02-02T03:28:48Z",
		"libraryCatalog": "DOI.org (Crossref)",
		"title": "Second world war, communism and post-communism in Albania, an equilateral triangle of a tragic trans-Adriatic story. The Eftimiadi’s Saga",
		"creators": [{
			"firstName": "Muner",
			"lastName": "Paolo",
			"creatorType": "author"
		}],
		"tags": [],
		"relations": [],
		"attachments": [],
		"notes": []
	}]
}
]
/** END TEST CASES **/
