{
	"translatorID": "a1a97ad4-493a-45f2-bd46-016069de4162",
	"label": "Optical Society of America",
	"creator": "Philipp Zumstein",
	"target": "^https?://(www\\.)?osapublishing\\.org",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2017-01-03 23:20:12"
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
	if (url.indexOf("abstract.cfm") != -1) {
		var conference = ZU.xpathText(doc, '//meta[@name="citation_conference_title"]/@content');
		var journal = ZU.xpathText(doc, '//meta[@name="citation_journal_title"]/@content');
		if (conference) {
			return "conferencePaper";
		} else if (journal) {
			return "journalArticle";
		} else {
			return "book";
		}
	} else if (getSearchResults(doc, true)) {
		return "multiple";
	} 
}


function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = ZU.xpath(doc, '//ul[@id="results"]/li[contains(@class, "sr-item")]//h3/a|//p[contains(@class, "article-title")]/a');
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
	//translator.setDocument(doc);

	translator.setHandler('itemDone', function (obj, item) {
		if (item.abstractNote ) {
			item.abstractNote = ZU.trimInternal(item.abstractNote);
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
				"url": "http://www.osapublishing.org/abstract.cfm?uri=josaa-16-1-191",
				"volume": "16",
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
					"Diffraction",
					"Lens system design",
					"Propagation"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.osapublishing.org/search.cfm?q=test&meta=1&cj=1&cc=1",
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
				"abstractNote": "Resilient packet ring ( IEEE 802.17) is a metropolitan area network technology for data transfer based on ring configuration.The paper provides guidelines for generation of recommends simulated environments for RPR testing ,discusses ways to test complex areas of RPR( e.g Fairness),provides guidelines for generating standard compliant test suite, and puts forward a strategy for automation of RPR testing.This paper is based on development of a RPR solution based on a Network processor.RPR specifies 39 state machines which implement the functionalities Topology Discovery, Protection, Datapath, OAM, Fairness and Shapers. The specification of the functionalities as well as the interaction between them makes RPR a complex protocol to validate. Lack of RPR test generator and inter dependency of control plane on data plane adds to the challenges of RPR testing. Careful planning, execution of testing in phases, building simulators and identifying the areas of challenges will guarantee success.Table of Contents Test Suite generationSimulators for RPR testingTest Sets for RPR testingTesting of RPR areasAutomation possibilities Test Suite generation Protocol Implementation Conformance Statements (PICs) provide a guidelines but it falls short of complete testing if you want to achieve the 'carrier grade' performance of the RPR. The test suite generation demands complete knowledge of the RPR Standard (IEEE 802.17, 802.17a, 802.17b).Simulators for RPR testing Simulator testing is a crucial part of RPR validation. Two types of simulators are recommended. Control plane simulator and the dataplane simulator The control plane functionality can be tested by building a stand alone simulator which can act as a frame work to exchange packets between the control plane instances.Pipeline integration stage is the integration of different modules of the packet processing modules. Pipeline integration testing is performed in the simulated environment with all the data path components treated as one single block. The packet headers are created and injected to the Receiver block and the packets from the pipeline are captured and analyzed at the transmit block. Most of the Network Processor development workbenches (e.g. transactor of IXP) support packet generators. More than 60% of the test cases can be executed in the pipeline integration stage using packet streams generated.Test Sets for RPR testingNo single test set has features required for RPR testing .The paper compares the capabilities of various test sets including Agilent and Ixia and proposes a combination of test sets for achieving RPR test coverage.Testing of RPR areasThe paper suggests methods to validate the following areas of RPR[1] 255 node testing [2] Fairness and Shaper testing [3] 50 milliseconds protection switch time[4] Testing of strict order frames [5] Jitter measurement [6] Performance monitoring testing[7] RPR-RPR BridgingSpatially Aware Sublayer (IEEE802.17b) introduces new challenge for validation of RPR. The paper discusses the complexities involved for validation of IEEE 802.17b.Automation possibilitiesThe paper discusses the areas of automation for RPR testing and methods for the same. RPR test automation can be achieved for the pipeline integration stage, On board integration and system testing phases",
				"conferenceName": "Optical Fiber Communication Conference",
				"language": "EN",
				"libraryCatalog": "www.osapublishing.org",
				"pages": "JThB89",
				"proceedingsTitle": "Optical Fiber Communication Conference and Exposition and The National Fiber Optic Engineers Conference (2006), paper JThB89",
				"publisher": "Optical Society of America",
				"rights": "© 2006 Optical Society of America",
				"url": "http://www.osapublishing.org/abstract.cfm?uri=OFC-2006-JThB89",
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
					"Other topics of general interest"
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
				"ISSN": "1539-4522",
				"abstractNote": "We discuss the realization of highly efficient fan-out elements. Laser-beam writing lithography is available now for fabricating smooth surface relief microstructures. We develop several methods for optimizing microstructure profiles. Only a small number of parameters in the object plane are necessary for determining the kinoform. This simplifies the calculation of M × N arrays also for large M and N. Experimental results for a 9-beam fan-out element are presented.",
				"issue": "26",
				"journalAbbreviation": "Appl. Opt., AO",
				"language": "EN",
				"libraryCatalog": "www.osapublishing.org",
				"pages": "5706-5711",
				"publicationTitle": "Applied Optics",
				"rights": "© 1992 Optical Society of America",
				"url": "http://www.osapublishing.org/abstract.cfm?uri=ao-31-26-5706",
				"volume": "31",
				"attachments": [
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					},
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