{
	"translatorID": "a1a97ad4-493a-45f2-bd46-016069de4162",
	"translatorType": 4,
	"label": "Optical Society of America",
	"creator": "Philipp Zumstein",
	"target": "^https?://(www\\.)?osapublishing\\.org",
	"minVersion": "3.0",
	"maxVersion": null,
	"priority": 100,
	"inRepository": true,
	"browserSupport": "gcsibv",
	"lastUpdated": "2021-06-10 01:50:00"
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
	url = url.toLowerCase();
	if (url.includes("/abstract.cfm") || url.includes("/viewmedia.cfm")) {
		var conference = ZU.xpathText(doc, '//meta[@name="citation_conference_title"]/@content');
		var journal = ZU.xpathText(doc, '//meta[@name="citation_journal_title"]/@content');
		if (conference) {
			return "conferencePaper";
		}
		else if (journal) {
			return "journalArticle";
		}
		else {
			return "book";
		}
	}
	else if (getSearchResults(doc, true)) {
		return "multiple";
	}
	return false;
}


function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = ZU.xpath(doc, '//ul[@id="results"]/li[contains(@class, "sr-item")]//h3/a|//p[contains(@class, "article-title")]/a');
	for (var i = 0; i < rows.length; i++) {
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
				return;
			}
			var articles = [];
			for (var i in items) {
				articles.push(i);
			}
			ZU.processDocuments(articles, scrape);
		});
	}
	else {
		scrape(doc, url);
	}
}


function scrape(doc, url) {
	var translator = Zotero.loadTranslator('web');
	// Embedded Metadata
	translator.setTranslator('951c027d-74ac-47d4-a107-9c3069ab7b48');
	// translator.setDocument(doc);

	translator.setHandler('itemDone', function (obj, item) {
		item.title = decodeEntities(item.title, doc);
		item.bookTitle = decodeEntities(item.bookTitle, doc);
		item.publicationTitle = decodeEntities(item.publicationTitle, doc);
		item.rights = decodeEntities(item.rights, doc);
		
		if (item.abstractNote) {
			item.abstractNote = ZU.trimInternal(item.abstractNote);
		}

		item.complete();
	});

	translator.getTranslatorObject(function (trans) {
		trans.doWeb(doc, url);
	});
}


function decodeEntities(str, doc) {
	if (!str || !str.includes('&') || !doc.createElement) {
		return str;
	}
	
	// https://stackoverflow.com/questions/7394748/whats-the-right-way-to-decode-a-string-that-has-special-html-entities-in-it/7394787#7394787
	var textarea = doc.createElement('textarea');
	textarea.innerHTML = str;
	return textarea.value;
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://www.osapublishing.org/josaa/abstract.cfm?URI=josaa-16-1-191",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Lens axicons: systems composed of a diverging aberrated lens and a converging aberrated lens",
				"creators": [
					{
						"firstName": "Zbigniew",
						"lastName": "Jaroszewicz",
						"creatorType": "author"
					},
					{
						"firstName": "Javier",
						"lastName": "Morales",
						"creatorType": "author"
					}
				],
				"date": "1999/01/01",
				"DOI": "10.1364/JOSAA.16.000191",
				"ISSN": "1520-8532",
				"abstractNote": "This paper is a continuation of our previous publication on the stationary-phase-method analysis of lens axicons [J. Opt. Soc. Am. A152383 (1998)]. Systems with spherical aberration up to the fifth order are studied. Such lens axicons in their simplest versions can be made either as a setup composed of two separated third-order spherical-aberration lenses of opposite powers or as a doublet consisting of one third-order diverging element and one fifth-order converging element. The axial intensity distribution and the central core width turn out to be improved and become almost constant. The results obtained are compared with the numerical evaluation of the corresponding diffraction integral.",
				"issue": "1",
				"journalAbbreviation": "J. Opt. Soc. Am. A, JOSAA",
				"language": "EN",
				"libraryCatalog": "www.osapublishing.org",
				"pages": "191-197",
				"publicationTitle": "JOSA A",
				"rights": "© 1999 Optical Society of America",
				"shortTitle": "Lens axicons",
				"url": "https://www.osapublishing.org/josaa/abstract.cfm?uri=josaa-16-1-191",
				"volume": "16",
				"attachments": [
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					},
					{
						"title": "Snapshot",
						"mimeType": "text/html"
					}
				],
				"tags": [
					{
						"tag": "Axicons"
					},
					{
						"tag": "First order optics"
					},
					{
						"tag": "Geometric optics"
					},
					{
						"tag": "Spherical lenses"
					},
					{
						"tag": "Superlenses"
					},
					{
						"tag": "Wavefronts"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.osapublishing.org/search.cfm?q=test&meta=1&cj=1&cc=1",
		"defer": true,
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://www.osapublishing.org/abstract.cfm?URI=OFC-2006-JThB89",
		"items": [
			{
				"itemType": "conferencePaper",
				"title": "Challenges in Testing Resilient Packet Ring",
				"creators": [
					{
						"firstName": "Praveen",
						"lastName": "Chathnath",
						"creatorType": "author"
					}
				],
				"date": "2006/03/05",
				"abstractNote": "Resilient Packet Ring (RPR) is a metropolitan area network technology for data transfer based on ring configuration and is standardized as IEEE 802.17. RPR testing is challenging as it combines best of SONET networks and Data networks. The paper provides guidelines for generation of standard compliant test suite, recommends simulated environments for RPR testing and puts forward a strategy for automation of RPR testing. The paper describes various stages of RPR testing and the challenges considering entire project cycle.",
				"conferenceName": "Optical Fiber Communication Conference",
				"language": "EN",
				"libraryCatalog": "www.osapublishing.org",
				"pages": "JThB89",
				"proceedingsTitle": "Optical Fiber Communication Conference and Exposition and The National Fiber Optic Engineers Conference (2006), paper JThB89",
				"publisher": "Optical Society of America",
				"rights": "© 2006 Optical Society of America",
				"url": "https://www.osapublishing.org/abstract.cfm?uri=OFC-2006-JThB89",
				"attachments": [
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					},
					{
						"title": "Snapshot",
						"mimeType": "text/html"
					}
				],
				"tags": [
					{
						"tag": "Fluorescence correlation spectroscopy"
					},
					{
						"tag": "Green fluorescent protein"
					},
					{
						"tag": "Networking hardware"
					},
					{
						"tag": "Optical angular momentum"
					},
					{
						"tag": "Optical ethernet"
					},
					{
						"tag": "Refractive index"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.osapublishing.org/ao/abstract.cfm?URI=ao-31-26-5706",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Optimized kinoform structures for highly efficient fan-out elements",
				"creators": [
					{
						"firstName": "D.",
						"lastName": "Prongué",
						"creatorType": "author"
					},
					{
						"firstName": "H. P.",
						"lastName": "Herzig",
						"creatorType": "author"
					},
					{
						"firstName": "R.",
						"lastName": "Dändliker",
						"creatorType": "author"
					},
					{
						"firstName": "M. T.",
						"lastName": "Gale",
						"creatorType": "author"
					}
				],
				"date": "1992/09/10",
				"DOI": "10.1364/AO.31.005706",
				"ISSN": "2155-3165",
				"abstractNote": "We discuss the realization of highly efficient fan-out elements. Laser-beam writing lithography is available now for fabricating smooth surface relief microstructures. We develop several methods for optimizing microstructure profiles. Only a small number of parameters in the object plane are necessary for determining the kinoform. This simplifies the calculation of M × N arrays also for large M and N. Experimental results for a 9-beam fan-out element are presented.",
				"issue": "26",
				"journalAbbreviation": "Appl. Opt., AO",
				"language": "EN",
				"libraryCatalog": "www.osapublishing.org",
				"pages": "5706-5711",
				"publicationTitle": "Applied Optics",
				"rights": "© 1992 Optical Society of America",
				"url": "https://www.osapublishing.org/ao/abstract.cfm?uri=ao-31-26-5706",
				"volume": "31",
				"attachments": [
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					},
					{
						"title": "Snapshot",
						"mimeType": "text/html"
					}
				],
				"tags": [
					{
						"tag": "Dammann gratings"
					},
					{
						"tag": "Diffraction efficiency"
					},
					{
						"tag": "Laser beams"
					},
					{
						"tag": "Light sources"
					},
					{
						"tag": "Lithography"
					},
					{
						"tag": "Total internal reflection"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.osapublishing.org/ol/abstract.cfm?uri=ol-40-24-5750",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Metamaterial-waveguide bends with effective bend radius < λ<sub>0</sub>/2",
				"creators": [
					{
						"firstName": "Bing",
						"lastName": "Shen",
						"creatorType": "author"
					},
					{
						"firstName": "Randy",
						"lastName": "Polson",
						"creatorType": "author"
					},
					{
						"firstName": "Rajesh",
						"lastName": "Menon",
						"creatorType": "author"
					}
				],
				"date": "2015/12/15",
				"DOI": "10.1364/OL.40.005750",
				"ISSN": "1539-4794",
				"abstractNote": "We designed, fabricated, and characterized broadband, efficient, all-dielectric metamaterial-waveguide bends (MWBs) that redirect light by 180&#xA0;deg. The footprint of each MWB is 3&#x2009;&#x2009;&#x3BC;m&#xD7;3&#x2009;&#x2009;&#x3BC;m and redirection is achieved for single-mode waveguides spaced by 1.3&#xA0;&#x3BC;m, which corresponds to an effective bend radius of 0.65&#xA0;&#x3BC;m (&lt;&#x3BB;0/2 for &#x3BB;0=1.55&#x2009;&#x2009;&#x3BC;m). The designed and measured transmission efficiencies are &gt;80% and &#x223C;70%, respectively. Furthermore, the MWBs have an operating bandwidth &gt;66&#x2009;nm (design) and &gt;56&#x2009;&#x2009;nm (experiments). Our design methodology that incorporates fabrication constraints enables highly robust devices. The methodology can be extended to the general routing of light in tight spaces for large-scale photonic integration.",
				"issue": "24",
				"journalAbbreviation": "Opt. Lett., OL",
				"language": "EN",
				"libraryCatalog": "www.osapublishing.org",
				"pages": "5750-5753",
				"publicationTitle": "Optics Letters",
				"rights": "© 2015 Optical Society of America",
				"url": "https://www.osapublishing.org/ol/abstract.cfm?uri=ol-40-24-5750",
				"volume": "40",
				"attachments": [
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					},
					{
						"title": "Snapshot",
						"mimeType": "text/html"
					}
				],
				"tags": [
					{
						"tag": "Bend loss"
					},
					{
						"tag": "Light propagation"
					},
					{
						"tag": "Optical lithography"
					},
					{
						"tag": "Photonic crystals"
					},
					{
						"tag": "Photonic integration"
					},
					{
						"tag": "Plasmon waveguides"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/
