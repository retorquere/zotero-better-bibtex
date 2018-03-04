{
	"translatorID": "0eeb2ac0-fbaf-4994-b98f-203d273eb9fa",
	"label": "Inter-Research Science Center",
	"creator": "Philipp Zumstein",
	"target": "^https?://www\\.int-res\\.com/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2017-10-22 20:07:17"
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


// attr()/text() v2
function attr(docOrElem,selector,attr,index){var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector);return elem?elem.getAttribute(attr):null}function text(docOrElem,selector,index){var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector);return elem?elem.textContent:null}


function detectWeb(doc, url) {
	if (attr(doc, 'meta[name="citation_title"]', 'content')) {
		return "journalArticle";
	} else if (getSearchResults(doc, true)) {
		return "multiple";
	}
}

function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = doc.querySelectorAll('.journal-index td, .journal-index p, .gsc-thumbnail-inside div.gs-title');
	for (var i=0; i<rows.length; i++) {
		var href = attr(rows[i], 'a:first-of-type', 'data-ctorig') || attr(rows[i], 'a:first-of-type', 'href');
		var title = ZU.trimInternal(rows[i].textContent);
		if (!href || !title) continue;
		if (href.search(/abstracts\/[a-z]+\/[v0-9]+\/[p\-0-9]+\//) == -1) continue;
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
	//translator.setDocument(doc);
	
	translator.setHandler('itemDone', function (obj, item) {
		var abstract = text(doc, '.abstract_block');
		if (abstract) {
			item.abstractNote = abstract.replace(/^ABSTRACT: /, '');
		}
		if (item.date) {
			item.date = ZU.strToISO(item.date);
		}
		item.complete();
	});

	translator.getTranslatorObject(function(trans) {
		trans.doWeb(doc, url);
	});
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.int-res.com/abstracts/meps/v403/",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://www.int-res.com/abstracts/meps/v403/p13-27/",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Scaling giant kelp field measurements to regional scales using satellite observations",
				"creators": [
					{
						"firstName": "Kyle C.",
						"lastName": "Cavanaugh",
						"creatorType": "author"
					},
					{
						"firstName": "David A.",
						"lastName": "Siegel",
						"creatorType": "author"
					},
					{
						"firstName": "Brian P.",
						"lastName": "Kinlan",
						"creatorType": "author"
					},
					{
						"firstName": "Daniel C.",
						"lastName": "Reed",
						"creatorType": "author"
					}
				],
				"date": "2010-03-22",
				"DOI": "10.3354/meps08467",
				"ISSN": "0171-8630, 1616-1599",
				"abstractNote": "Little is known about the local to regional scale variability in biomass and productivity of many subtidal ecosystems, as appropriate field surveys are both time and labor intensive. Here, we combined high-resolution satellite imagery with aerial photos and diver sampling to assess changes in giant kelp Macrocystis pyrifera canopy cover and biomass along a ~60 km stretch of coastline in the Santa Barbara Channel, California, USA. Our objectives were to (1) develop new methods for estimating giant kelp canopy cover and biomass using satellite imagery, and (2) assess temporal changes in kelp forest biomass across multiple spatial scales. Results of the satellite kelp cover classification compared very favorably with near-coincident high-resolution aerial camera surveys (r2 = 0.90). Monthly diver observations of biomass for fixed plots at 3 kelp forest sites were strongly correlated with satellite determinations of normalized difference vegetation index (NDVI) signals (r2 = 0.77). This allowed us to examine variation in giant kelp biomass across multiple spatial scales (pixel, plot, site, and region). The relationship between plot scale (40 m) changes in biomass and remote assessments of site scale (~1 km) changes varied among sites and depended on the relative location of the plot and the size of the kelp forest at each site. Changes in biomass among sites were well correlated with each other and with the aggregated regional (~60 km) total. Linking field measurements of giant kelp biomass made on a plot scale with regional estimates made by satellite facilitates an understanding of the regional patterns and drivers of biomass and primary production of giant kelp forest ecosystems.",
				"libraryCatalog": "www.int-res.com",
				"pages": "13-27",
				"publicationTitle": "Marine Ecology Progress Series",
				"url": "http://www.int-res.com/abstracts/meps/v403/p13-27/",
				"volume": "403",
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
						"tag": "Giant kelp"
					},
					{
						"tag": "Remote sensing"
					},
					{
						"tag": "Satellite data"
					},
					{
						"tag": "Scaling"
					},
					{
						"tag": "Spatial and temporal variability"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/
