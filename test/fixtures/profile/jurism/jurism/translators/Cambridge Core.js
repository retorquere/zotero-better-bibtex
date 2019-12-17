{
	"translatorID": "850f4c5f-71fb-4669-b7da-7fb7a95500ef",
	"label": "Cambridge Core",
	"creator": "Sebastian Karcher",
	"target": "^https?://www\\.cambridge\\.org/core/(search\\?|journals/)",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2019-11-18 23:01:07"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2016 Sebastian Karcher

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
	if (url.includes('/article/')) {
		return "journalArticle"; // we'll want to add book chapter and books eventually using /books/
	}
	else if (getSearchResults(doc, true)) {
		return "multiple";
	}
	return false;
}

function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = ZU.xpath(doc, '//li[@class="title"]//a[contains(@href, "/article/") or contains(@href, "/product/")]');
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
			for (let i in items) {
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
	translator.setHandler('itemDone', function (obj, item) {
		item.url = url;
		var abstract = ZU.xpathText(doc, '//div[@class="abstract"]');
		if (abstract) {
			item.abstractNote = abstract;
		}
		item.title = ZU.unescapeHTML(item.title);
		item.libraryCatalog = "Cambridge Core";
		item.complete();
	});

	translator.getTranslatorObject(function (trans) {
		trans.itemType = "journalArticle";
		trans.doWeb(doc, url);
	});
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://www.cambridge.org/core/journals/journal-of-american-studies/article/samo-as-an-escape-clause-jean-michel-basquiats-engagement-with-a-commodified-american-africanism/1E4368D610A957B84F6DA3A58B8BF164",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "“SAMO© as an Escape Clause”: Jean-Michel Basquiat's Engagement with a Commodified American Africanism",
				"creators": [
					{
						"firstName": "Laurie A.",
						"lastName": "Rodrigues",
						"creatorType": "author"
					}
				],
				"date": "2011/05",
				"DOI": "10.1017/S0021875810001738",
				"ISSN": "1469-5154, 0021-8758",
				"abstractNote": "Heir to the racist configuration of the American art exchange and the delimiting appraisals of blackness in the American mainstream media, Jean-Michel Basquiat appeared on the late 1970s New York City street art scene – then he called himself “SAMO.” Not long thereafter, Basquiat grew into one of the most influential artists of an international movement that began around 1980, marked by a return to figurative painting. Given its rough, seemingly untrained and extreme, conceptual nature, Basquiat's high-art oeuvre might not look so sophisticated to the uninformed viewer. However, Basquiat's work reveals a powerful poetic and visual gift, “heady enough to confound academics and hip enough to capture the attention span of the hip hop nation,” as Greg Tate has remarked. As noted by Richard Marshall, Basquiat's aesthetic strength actually comes from his striving “to achieve a balance between the visual and intellectual attributes” of his artwork. Like Marshall, Tate, and others, I will connect with Basquiat's unique, self-reflexively experimental visual practices of signifying and examine anew Basquiat's active contribution to his self-alienation, as Hebdige has called it. Basquiat's aesthetic makes of his paintings economies of accumulation, building a productive play of contingency from the mainstream's constructions of race. This aesthetic move speaks to a need for escape from the perceived epistemic necessities of blackness. Through these economies of accumulation we see, as Tate has pointed out, Basquiat's “intellectual obsession” with issues such as ancestry/modernity, personhood/property and originality/origins of knowledge, driven by his tireless need to problematize mainstream media's discourses surrounding race – in other words, a commodified American Africanism.",
				"issue": "2",
				"language": "en",
				"libraryCatalog": "Cambridge Core",
				"pages": "227-243",
				"publicationTitle": "Journal of American Studies",
				"shortTitle": "“SAMO© as an Escape Clause”",
				"url": "https://www.cambridge.org/core/journals/journal-of-american-studies/article/samo-as-an-escape-clause-jean-michel-basquiats-engagement-with-a-commodified-american-africanism/1E4368D610A957B84F6DA3A58B8BF164",
				"volume": "45",
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
	},
	{
		"type": "web",
		"url": "https://www.cambridge.org/core/journals/journal-of-fluid-mechanics/article/high-resolution-simulations-of-cylindrical-density-currents/30D62864BDED84A6CC81F5823950767B",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "High-resolution simulations of cylindrical density currents",
				"creators": [
					{
						"firstName": "Mariano I.",
						"lastName": "Cantero",
						"creatorType": "author"
					},
					{
						"firstName": "S.",
						"lastName": "Balachandar",
						"creatorType": "author"
					},
					{
						"firstName": "Marcelo H.",
						"lastName": "Garcia",
						"creatorType": "author"
					}
				],
				"date": "2007/11",
				"DOI": "10.1017/S0022112007008166",
				"ISSN": "1469-7645, 0022-1120",
				"abstractNote": "Three-dimensional highly resolved simulations are presented for cylindrical density currents using the Boussinesq approximation for small density difference. Three Reynolds numbers (Re) are investigated (895, 3450 and 8950, which correspond to values of the Grashof number of 105, 1.5 × 106 and 107, respectively) in order to identify differences in the flow structure and dynamics. The simulations are performed using a fully de-aliased pseudospectral code that captures the complete range of time and length scales of the flow. The simulated flows present the main features observed in experiments at large Re. As the current develops, it transitions through different phases of spreading, namely acceleration, slumping, inertial and viscous Soon after release the interface between light and heavy fluids rolls up forming Kelvin–Helmholtz vortices. The formation of the first vortex sets the transition between acceleration and slumping phases. Vortex formation continues only during the slumping phase and the formation of the last Kelvin–Helmholtz vortex signals the departure from the slumping phase. The coherent Kelvin–Helmholtz vortices undergo azimuthal instabilities and eventually break up into small-scale turbulence. In the case of planar currents this turbulent region extends over the entire body of the current, while in the cylindrical case it only extends to the regions of Kelvin–Helmholtz vortex breakup. The flow develops three-dimensionality right from the beginning with incipient lobes and clefts forming at the lower frontal region. These instabilities grow in size and extend to the upper part of the front. Lobes and clefts continuously merge and split and result in a complex pattern that evolves very dynamically. The wavelength of the lobes grows as the flow spreads, while the local Re of the flow decreases. However, the number of lobes is maintained over time. Owing to the high resolution of the simulations, we have been able to link the lobe and cleft structure to local flow patterns and vortical structures. In the near-front region and body of the current several hairpin vortices populate the flow. Laboratory experiments have been performed at the higher Re and compared to the simulation results showing good agreement. Movies are available with the online version of the paper.",
				"language": "en",
				"libraryCatalog": "Cambridge Core",
				"pages": "437-469",
				"publicationTitle": "Journal of Fluid Mechanics",
				"url": "https://www.cambridge.org/core/journals/journal-of-fluid-mechanics/article/high-resolution-simulations-of-cylindrical-density-currents/30D62864BDED84A6CC81F5823950767B",
				"volume": "590",
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
						"tag": "Gravity currents"
					},
					{
						"tag": "Vortex breakdown"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.cambridge.org/core/journals/american-political-science-review/issue/F6F2E8238A6D139A91D343A62AB2CECC",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://www.cambridge.org/core/search?q=labor&sort=&aggs%5BonlyShowAvailable%5D%5Bfilters%5D=&aggs%5BopenAccess%5D%5Bfilters%5D=&aggs%5BproductTypes%5D%5Bfilters%5D=JOURNAL_ARTICLE&aggs%5BproductDate%5D%5Bfilters%5D=&aggs%5BproductSubject%5D%5Bfilters%5D=&aggs%5BproductJournal%5D%5Bfilters%5D=&aggs%5BproductPublisher%5D%5Bfilters%5D=&aggs%5BproductSociety%5D%5Bfilters%5D=&aggs%5BproductPublisherSeries%5D%5Bfilters%5D=&aggs%5BproductCollection%5D%5Bfilters%5D=&showJackets=&filters%5BauthorTerms%5D=&filters%5BdateYearRange%5D%5Bfrom%5D=&filters%5BdateYearRange%5D%5Bto%5D=&hideArticleGraphicalAbstracts=true",
		"items": "multiple"
	}
]
/** END TEST CASES **/
