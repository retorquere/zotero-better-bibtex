{
	"translatorID": "0fd5beb3-646a-4e01-960b-e7168d9292e1",
	"translatorType": 4,
	"label": "Europe PMC",
	"creator": "Abe Jellinek",
	"target": "^https?://europepmc\\.org/",
	"minVersion": "3.0",
	"maxVersion": null,
	"priority": 100,
	"inRepository": true,
	"browserSupport": "gcsibv",
	"lastUpdated": "2021-06-23 01:35:00"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2021 Abe Jellinek
	
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
		if (url.includes('/PPR/')) {
			return 'report';
		}
		else {
			return "journalArticle";
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
	var rows = doc.querySelectorAll('.citation-title > a[href*="/article/"]');
	for (let row of rows) {
		let href = getJSONURL(row.href);
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
			if (!items) return;
			Object.keys(items).forEach(scrape);
		});
	}
	else {
		let jsonURL = getJSONURL(url);
		if (jsonURL) {
			scrape(jsonURL);
		}
		else {
			Z.debug('Couldn\'t extract ID from URL: ' + url);
		}
	}
}

function scrape(jsonURL) {
	ZU.doGet(jsonURL, function (respText) {
		processJSON(JSON.parse(respText));
	});
}

function getJSONURL(pageURL) {
	let id = (pageURL.match(/\/article\/[^/]+\/([^/?]+)/) || [])[1];
	if (!id) return null;
	let idField = id.match(/pmc/i) ? 'PMCID' : 'ext_id';
	return `https://europepmc.org/api/get/articleApi?query=${idField}:${id}&resultType=core&format=json`;
}

function processJSON(json) {
	if (!json.resultList || !json.resultList.result || !json.resultList.result.length) {
		Z.debug('Query returned no results');
		return;
	}
	
	for (let result of json.resultList.result) {
		let item = resultToItem(result);
		item.complete();
	}
}

function resultToItem(result) {
	let item = new Zotero.Item();
	
	processPubTypeList(result.pubTypeList, item);
	
	item.title = result.title.replace(/.$/, '');
	item.abstractNote = result.abstractText && ZU.cleanTags(result.abstractText);
	item.pages = result.pageInfo;
	item.language = result.language;
	item.DOI = result.doi && ZU.cleanDOI(result.doi);
	item.rights = result.license;
	
	processJournalInfo(result.journalInfo, item);
	processURLList(result.fullTextUrlList, item);
	processAuthorList(result.authorList, item);
	processKeywordList(result.keywordList, item);
	
	if (!item.date) {
		item.date = result.pubYear;
	}
	
	if (result.pmid) {
		item.extra = (item.extra || '') + `PMID: ${result.pmid}\n`;
	}
	
	if (result.pmcid) {
		item.extra = (item.extra || '') + `PMCID: ${result.pmcid}\n`;
	}
	
	return item;
}

function processPubTypeList(pubTypeList, item) {
	if (!pubTypeList || !pubTypeList.pubType) return;
	
	if (pubTypeList.pubType.length == 1 && pubTypeList.pubType[0] == 'Preprint') {
		item.itemType = 'report';
		item.extra = (item.extra || '') + `Type: article\n`;
	}
	else {
		item.itemType = 'journalArticle';
	}
}

function processJournalInfo(journalInfo, item) {
	if (!journalInfo || !journalInfo.journal) return;
	
	item.publicationTitle = journalInfo.journal.title.split(' : ')[0].replace('. ', ' ');
	item.journalAbbreviation = journalInfo.journal.isoabbreviation;
	item.volume = journalInfo.volume;
	item.issue = journalInfo.issue;
	item.ISSN = journalInfo.journal.ESSN || journalInfo.journal.essn
		|| journalInfo.journal.ISSN || journalInfo.journal.issn;
	item.date = journalInfo.printPublicationDate;
}

function processURLList(urlList, item) {
	if (!urlList || !urlList.fullTextUrl) return;
	
	let foundOA = false;
	for (let urlBlock of urlList.fullTextUrl) {
		if (!foundOA && urlBlock.documentStyle == 'pdf') {
			item.attachments.push({
				url: urlBlock.url,
				title: `Full Text PDF (${urlBlock.availability})`,
				mimeType: 'application/pdf'
			});
			
			if (urlBlock.availabilityCode == 'OA') {
				foundOA = true;
			}
		}
		else if (urlBlock.documentStyle == 'html'
			|| (urlBlock.documentStyle == 'doi' && !item.url)) {
			item.url = urlBlock.url;
		}
	}
}

function processAuthorList(authorList, item) {
	if (!authorList || !authorList.author) return;
	
	for (let author of authorList.author) {
		if (author.firstName && author.lastName) {
			item.creators.push({
				firstName: author.firstName || author.initials,
				lastName: author.lastName,
				creatorType: 'author'
			});
		}
		else {
			let nameWithComma = author.fullName.replace(/(\s)/, ',$1');
			item.creators.push(ZU.cleanAuthor(nameWithComma, 'author', true));
		}
	}
}

function processKeywordList(keywordList, item) {
	if (!keywordList || !keywordList.keyword) return;
	
	for (let keyword of keywordList.keyword) {
		item.tags.push({ tag: keyword });
	}
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://europepmc.org/article/MED/32923700",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Exposure to low temperatures suppresses the production of B-cell activating factor via TLR3 in BEAS-2B cells",
				"creators": [
					{
						"firstName": "Yusuke",
						"lastName": "Yoshino",
						"creatorType": "author"
					},
					{
						"firstName": "Ai",
						"lastName": "Yamamoto",
						"creatorType": "author"
					},
					{
						"firstName": "Keita",
						"lastName": "Misu",
						"creatorType": "author"
					},
					{
						"firstName": "Yoshitaka",
						"lastName": "Wakabayashi",
						"creatorType": "author"
					},
					{
						"firstName": "Takatoshi",
						"lastName": "Kitazawa",
						"creatorType": "author"
					},
					{
						"firstName": "Yasuo",
						"lastName": "Ota",
						"creatorType": "author"
					}
				],
				"date": "2020-12-01",
				"DOI": "10.1016/j.bbrep.2020.100809",
				"ISSN": "2405-5808",
				"abstractNote": "Acute viral respiratory tract infections (RTIs) are commonly associated with cold weather; however, the mechanism behind this is still unclear. Secretory IgA (sIgA) mainly contributes to the immune response against pathogenic microorganisms in the respiratory tract. Certain pathogen-associated molecular patterns (PAMPs) induce the expression of B-cell activating factor (BAFF) in epithelial cells, macrophages, and dendritic cells. BAFF transforms B cells into plasma cells, which leads to the mass production of immunoglobulins, including IgA, on the mucosal epithelium. However, no studies have described the relationship between cold exposure and BAFF and/or sIgA in RTI. The aim of our study was to determine this relationship in vitro by investigating the effect of low temperature on BAFF production by BEAS-2B cells after the addition of toll-like receptor (TLR) ligands. We showed stimulation of polyinosinic:polycytidylic acid (poly I:C), which led BEAS-2B to produce interferon (IFN)-β. IFN-β itself induced BEAS-2B cells to produce BAFF. Janus kinase inhibitor I decreased the amount of BAFF produced in BEAS-2B cells upon stimulation with IFN-β and poly I:C. Significantly less BAFF was produced post-poly I:C stimulation in low-temperature conditions than in normal-temperature conditions (mean ± SD: 41.2 ± 23.3 [33 °C] vs. 138.3 ± 7.1 pg/mL [37 °C], P = 0.05). However, the low-temperature condition itself was not cytotoxic. The stimulation of poly I:C produced BAFF from BEAS2B cells via IFN-β production and the JAK/signal transducer and activator of transcription pathway played an important role in BAFF production in BEAS-2B cells. Cold exposure reduced BAFF production by BEAS2B cells after stimulation with the TLR3 ligand. Cold exposure may, therefore, suppress the production of BAFF, resulting in the inhibition of IgA secretion in the bronchial epithelium, which explains the increased frequency of RTIs in cold weather.",
				"extra": "PMID: 32923700\nPMCID: PMC7474404",
				"journalAbbreviation": "Biochem Biophys Rep",
				"language": "eng",
				"libraryCatalog": "Europe PMC",
				"pages": "100809",
				"publicationTitle": "Biochemistry and biophysics reports",
				"rights": "cc by-nc-nd",
				"url": "https://europepmc.org/articles/PMC7474404",
				"volume": "24",
				"attachments": [
					{
						"title": "Full Text PDF (Open access)",
						"mimeType": "application/pdf"
					}
				],
				"tags": [
					{
						"tag": "B-cell Activating Factor"
					},
					{
						"tag": "Beas-2b Cells"
					},
					{
						"tag": "Low temperature"
					},
					{
						"tag": "Secretory IgA"
					},
					{
						"tag": "Toll-like Receptor Ligand"
					},
					{
						"tag": "Viral Respiratory Tract Infection"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://europepmc.org/article/MED/34136733",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Quantum simulation of hyperbolic space with circuit quantum electrodynamics: From graphs to geometry",
				"creators": [
					{
						"firstName": "Igor",
						"lastName": "Boettcher",
						"creatorType": "author"
					},
					{
						"firstName": "Przemyslaw",
						"lastName": "Bienias",
						"creatorType": "author"
					},
					{
						"firstName": "Ron",
						"lastName": "Belyansky",
						"creatorType": "author"
					},
					{
						"firstName": "Alicia J",
						"lastName": "Kollár",
						"creatorType": "author"
					},
					{
						"firstName": "Alexey V",
						"lastName": "Gorshkov",
						"creatorType": "author"
					}
				],
				"date": "2020-09-01",
				"DOI": "10.1103/physreva.102.032208",
				"ISSN": "2469-9934",
				"abstractNote": "We show how quantum many-body systems on hyperbolic lattices with nearest-neighbor hopping and local interactions can be mapped onto quantum field theories in continuous negatively curved space. The underlying lattices have recently been realized experimentally with superconducting resonators and therefore allow for a table-top quantum simulation of quantum physics in curved background. Our mapping provides a computational tool to determine observables of the discrete system even for large lattices, where exact diagonalization fails. As an application and proof of principle we quantitatively reproduce the ground state energy, spectral gap, and correlation functions of the noninteracting lattice system by means of analytic formulas on the Poincaré disk, and show how conformal symmetry emerges for large lattices. This sets the stage for studying interactions and disorder on hyperbolic graphs in the future. Importantly, our analysis reveals that even relatively small discrete hyperbolic lattices emulate the continuous geometry of negatively curved space, and thus can be used to experimentally resolve fundamental open problems at the interface of interacting many-body systems, quantum field theory in curved space, and quantum gravity.",
				"extra": "PMID: 34136733\nPMCID: PMC8204532",
				"issue": "3",
				"journalAbbreviation": "Phys Rev A (Coll Park)",
				"language": "eng",
				"libraryCatalog": "Europe PMC",
				"publicationTitle": "Physical review A",
				"shortTitle": "Quantum simulation of hyperbolic space with circuit quantum electrodynamics",
				"url": "https://europepmc.org/articles/PMC8204532",
				"volume": "102",
				"attachments": [
					{
						"title": "Full Text PDF (Free)",
						"mimeType": "application/pdf"
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
		"url": "https://europepmc.org/article/PPR/PPR358366",
		"items": [
			{
				"itemType": "report",
				"title": "Fly ash application in moorum embankment and its stability analysis using FLAC/SLOPE and Response Surface Metho",
				"creators": [
					{
						"firstName": "Sagar Dattatray",
						"lastName": "Turkane",
						"creatorType": "author"
					},
					{
						"firstName": "Sandeep Kumar",
						"lastName": "Chouksey",
						"creatorType": "author"
					}
				],
				"date": "2021",
				"abstractNote": "This paper presents the application of fly ash in moorum embankment by partial replacement of moorum with fly ash and its stability analysis has been carried out. An experimental investigation was carried out on moorum blended with fly ash at different proportions of fly ash by dry weight of soil for the moorum embankment stability analysis. The Index properties and strength properties were assessed by performing Atterberg's limit, specific gravity, grain size distribution, compaction test, direct shear test (DST), and California Bearing Ratio (CBR) test respectively. The embankment slope stability analysis was performed using FLAC/SLOPE version 8.10 (Fast Lagrangian Analysis of Continua) software at a various slope angle of 30°, 32°, and 34° and different heights of the embankment of 6 m, 8 m, and 10 m to calculate Factor of Safety (FOS). FOS decreases with the increment of fly ash content, the height of embankment, and slope angle respectively. In addition to the numerical analysis, Response Surface Methodology (RSM) based (Face-Centered Central Composite Design) was used to predict FOS. The developed mathematical equation illustrates that the RSM model was statistically significant and the results give a reliable prediction of FOS.",
				"extra": "Type: article",
				"libraryCatalog": "Europe PMC",
				"url": "https://doi.org/10.21203/rs.3.rs-631949/v1",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://europepmc.org/search?query=symmetry",
		"defer": true,
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://europepmc.org/article/pmc/pmc3198533",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Zotero: A bibliographic assistant to researcher",
				"creators": [
					{
						"firstName": "K K Mueen",
						"lastName": "Ahmed",
						"creatorType": "author"
					},
					{
						"firstName": "Bandar E",
						"lastName": "Al Dhubaib",
						"creatorType": "author"
					}
				],
				"date": "2011-10-01",
				"DOI": "10.4103/0976-500x.85940",
				"ISSN": "0976-5018",
				"extra": "PMID: 22025866\nPMCID: PMC3198533",
				"issue": "4",
				"journalAbbreviation": "J Pharmacol Pharmacother",
				"language": "eng",
				"libraryCatalog": "Europe PMC",
				"pages": "303-305",
				"publicationTitle": "Journal of pharmacology & pharmacotherapeutics",
				"rights": "cc by-nc-sa",
				"shortTitle": "Zotero",
				"url": "https://europepmc.org/articles/PMC3198533",
				"volume": "2",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/
