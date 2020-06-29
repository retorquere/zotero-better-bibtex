{
	"translatorID": "097c963e-3866-4c6f-a6b4-f5e9d0d15530",
	"label": "DTU Orbit",
	"creator": "Sebastian Karcher",
	"target": "^https?://orbit\\.dtu\\.dk/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcbv",
	"lastUpdated": "2013-05-15 20:05:47"
}

/*
	***** BEGIN LICENSE BLOCK *****
	
	Copyright © 2013 Sebastian Karcher
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

function detectWeb(doc, url) {
	if (url.search(/publications\/search\.html/)!=-1) return "multiple";
	else if (url.search(/\/publications\/.+\.html/)!=-1) return "journalArticle";
	return false;
}
	

function doWeb(doc, url){

	var articles = new Array();
	if (detectWeb(doc, url) == "multiple") { 
		var items = {};
		var titles = doc.evaluate('//li[@class="portal_list_item"]/div//a[contains(@href, "/publications/")]', doc, null, XPathResult.ANY_TYPE, null);
		var title;
		while (title = titles.iterateNext()) {
			items[title.href] = title.textContent;
		}
		Zotero.selectItems(items, function (items) {
			if (!items) {
				return true;
			}
			for (var i in items) {
				articles.push(i);
			}
			Zotero.Utilities.processDocuments(articles, scrape)
		});
	} else {
		scrape(doc, url);
	}
}

function scrape(doc, url){
	var pdfurl = ZU.xpathText(doc, '//ul[@class="relations documents"]//a[contains(@href, ".pdf")]/@href');
	//also work on citatin page
	var risurl = url.replace(/(\/export)?\.html/,"/export.html");
	ZU.processDocuments(risurl, function (doc) {	
		//assemble RIS line by line
		rislines = ZU.xpath(doc, '//div[@class="view_container"]/div[contains(@class, "_ris")]/p')
		var risarray = [];
		for (i in rislines){
			risarray.push(rislines[i].textContent)
		}
		var ris = risarray.join("\n");
		//Zotero.debug(ris)
		var translator = Zotero.loadTranslator("import");
		translator.setTranslator("32d59d2d-b65a-4da4-b0a3-bdd3cfb979e7");
		translator.setString(ris);
		translator.setHandler("itemDone", function(obj, item) {
			if (pdfurl)	item.attachments = [{url:pdfurl, title: "DTU Orbit - Full Text PDF", mimeType: "application/pdf"}];
			item.complete();
		});	
		translator.translate();
	});
}
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://orbit.dtu.dk/en/publications/nonlinear-wave-equation-in-frequency-domain-accurate-modeling-of-ultrafast-interaction-in-anisotropic-nonlinear-media(726e7daf-08e1-44c5-9e4f-6e98e8fa1b12).html",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Nonlinear wave equation in frequency domain: accurate modeling of ultrafast interaction in anisotropic nonlinear media",
				"creators": [
					{
						"lastName": "Guo",
						"firstName": "Hairun",
						"creatorType": "author"
					},
					{
						"lastName": "Zeng",
						"firstName": "Xianglong",
						"creatorType": "author"
					},
					{
						"lastName": "Zhou",
						"firstName": "Binbin",
						"creatorType": "author"
					},
					{
						"lastName": "Bache",
						"firstName": "Morten",
						"creatorType": "author"
					}
				],
				"date": "March 1, 2013",
				"DOI": "10.1364/JOSAB.30.000494",
				"ISSN": "0740-3224",
				"abstractNote": "We interpret the purely spectral forward Maxwell equation with up to third-order induced polarizations for pulse propagation and interactions in quadratic nonlinear crystals. The interpreted equation, also named the nonlinear wave equation in the frequency domain, includes quadratic and cubic nonlinearities, delayed Raman effects, and anisotropic nonlinearities. The full potential of this wave equation is demonstrated by investigating simulations of solitons generated in the process of ultrafast cascaded second-harmonic generation. We show that a balance in the soliton delay can be achieved due to competition between self-steepening, Raman effects, and self-steepening-like effects from cascading originating in the group-velocity mismatch between the pump and the second harmonic. We analyze the first-order contributions, and show that this balance can be broken to create fast or slow pulses. Through further simulations we demonstrate few-cycle compressed solitons in extremely short crystals, where spectral phenomena, such as blue/red shifting, nonstationary radiation in accordance with the nonlocal phase-matching condition, and dispersive-wave generation are observed and marked, which helps improve the experimental knowledge of cascading nonlinear soliton pulse compression.",
				"issue": "3",
				"journalAbbreviation": "Optical Society of America. Journal B: Optical Physics",
				"libraryCatalog": "DTU Orbit",
				"pages": "494-504",
				"publicationTitle": "Optical Society of America. Journal B: Optical Physics",
				"shortTitle": "Nonlinear wave equation in frequency domain",
				"volume": "30",
				"attachments": [
					{
						"title": "DTU Orbit - Full Text PDF",
						"mimeType": "application/pdf"
					}
				],
				"tags": [],
				"notes": [
					{
						"note": "<p>This paper was published in JOSA B and is made available as an electronic reprint with the permission of OSA. The paper can be found at the following URL on the OSA website: http://www.opticsinfobase.org/josab/abstract.cfm?URI=josab-30-3-494. Systematic or multiple reproduction or distribution to multiple locations via electronic or other means is prohibited and is subject to penalties under law.</p>"
					}
				],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://orbit.dtu.dk/en/publications/search.html?search=labor&uri=&advanced=true&institution=all&organisationName=&organisations=&type=&publicationstatus=&publicationcategory=&peerreview=&publicationYearsFrom=&publicationYearsTo=&submissionYearsFrom=&submissionYearsTo=",
		"items": "multiple"
	}
]
/** END TEST CASES **/