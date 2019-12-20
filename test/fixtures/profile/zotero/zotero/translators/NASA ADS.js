{
	"translatorID": "7987b420-e8cb-4bea-8ef7-61c2377cd686",
	"translatorType": 4,
	"label": "NASA ADS",
	"creator": "Tim Hostetler",
	"target": "^https://ui\\.adsabs\\.harvard\\.edu/(search|abs)/",
	"minVersion": "3.0",
	"maxVersion": null,
	"priority": 100,
	"inRepository": true,
	"browserSupport": "gcsibv",
	"lastUpdated": "2019-12-05 03:05:00"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2019 Tim Hostetler

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

function getSearchResults(doc) {
	const results = doc.querySelectorAll("a[href$=abstract]");
	const entries = {};
	for (let el of results) {
		const titleEl = el.querySelector(":scope h3");
		if (!titleEl) {
			continue;
		}
		const hrefParts = el.getAttribute("href").split("/");
		if (hrefParts.length > 2) {
			const identifier = hrefParts[hrefParts.length - 2];
			entries[identifier] = ZU.trimInternal(titleEl.textContent);
		}
	}
	return entries;
}

function extractId(url) {
	return /\/abs\/(.*)\/abstract/.exec(url)[1];
}

function getTypeFromId(id) {
	// bibcodes always start with 4 digit year, then bibstem
	const bibstem = id.slice(4);
	if (bibstem.startsWith("MsT") || bibstem.startsWith("PhDT")) {
		return "thesis";
	}
	return "journalArticle";
}

function detectWeb(doc, url) {
	if (url.includes("/search/")) {
		return "multiple";
	}
	else if (url.includes("/abs/")) {
		return getTypeFromId(extractId(url));
	}
	return false;
}

function doWeb(doc, url) {
	if (detectWeb(doc, url) === "multiple") {
		Zotero.selectItems(getSearchResults(doc), function (items) {
			if (!items) return true;
			return scrape(Object.keys(items), doc);
		});
	}
	else {
		scrape([extractId(url)], url);
	}
}

function makePdfUrl(id) {
	return "https://ui.adsabs.harvard.edu/link_gateway/" + id + "/ARTICLE";
}

function scrape(ids, doc) {
	const exportUrl = "http://adsabs.harvard.edu/cgi-bin/nph-bib_query?"
		+ ids.join("&")
		+ "&data_type=REFMAN&nocookieset=1";
	ZU.doGet(exportUrl, function (text) {
		const translator = Zotero.loadTranslator("import");
		translator.setTranslator("32d59d2d-b65a-4da4-b0a3-bdd3cfb979e7");
		translator.setString(text);
		translator.setHandler("itemDone", function (obj, item) {
			const id = ids.pop();
			item.itemType = getTypeFromId(id);
			item.attachments.push({
				url: makePdfUrl(id),
				title: "Full Text PDF",
				mimeType: "application/pdf"
			});
			item.attachments.push({
				title: "Snapshot",
				document: doc
			});
			item.complete();
		});
		translator.translate();
	});
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://ui.adsabs.harvard.edu/search/q=star&sort=date%20desc%2C%20bibcode%20desc&p_=0",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://ui.adsabs.harvard.edu/abs/2020CNSNS..8205014M/abstract",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Modeling excitability in cerebellar stellate cells: Temporal changes in threshold, latency and frequency of firing",
				"creators": [
					{
						"lastName": "Mitry",
						"firstName": "John",
						"creatorType": "author"
					},
					{
						"lastName": "Alexander",
						"firstName": "Ryan P. D.",
						"creatorType": "author"
					},
					{
						"lastName": "Farjami",
						"firstName": "Saeed",
						"creatorType": "author"
					},
					{
						"lastName": "Bowie",
						"firstName": "Derek",
						"creatorType": "author"
					},
					{
						"lastName": "Khadra",
						"firstName": "Anmar",
						"creatorType": "author"
					}
				],
				"date": "March 1, 2020",
				"DOI": "10.1016/j.cnsns.2019.105014",
				"ISSN": "1007-5704",
				"abstractNote": "Cerebellar stellate cells are inhibitory molecular interneurons that \nregulate the firing properties of Purkinje cells, the sole output of\ncerebellar cortex. Recent evidence suggests that these cells exhibit\ntemporal increase in excitability during whole-cell patch-clamp\nconfiguration in a phenomenon termed runup. They also exhibit a\nnon-monotonic first-spike latency profile as a function of the holding\npotential in response to a fixed step-current. In this study, we use\nmodeling approaches to unravel the dynamics of runup and categorize the\nfiring behavior of cerebellar stellate cells as either type I or type II\noscillators. We then extend this analysis to investigate how the\nnon-monotonic latency profile manifests itself during runup. We employ a\npreviously developed, but revised, Hodgkin-Huxley type model to show\nthat stellate cells are indeed type I oscillators possessing a saddle\nnode on an invariant cycle (SNIC) bifurcation. The SNIC in the model\nacts as a \"threshold\" for tonic firing and produces a slow region in the\nphase space called the ghost of the SNIC. The model reveals that (i) the\nSNIC gets left-shifted during runup with respect to Iapp\n=Itest in the current-step protocol, and (ii) both the\ndistance from the stable limit cycle along with the slow region produce\nthe non-monotonic latency profile as a function of holding potential.\nUsing the model, we elucidate how latency can be made arbitrarily large\nfor a specific range of holding potentials close to the SNIC during\npre-runup (post-runup). We also demonstrate that the model can produce\ntransient single spikes in response to step-currents entirely below\nISNIC, and that a pair of dynamic inhibitory and excitatory\npost-synaptic inputs can robustly evoke action potentials, provided that\nthe magnitude of the inhibition is either low or high but not\nintermediate. Our results show that the topology of the SNIC is the key\nto explaining such behaviors.",
				"journalAbbreviation": "Communications in Nonlinear Science and Numerical Simulations",
				"libraryCatalog": "NASA ADS",
				"pages": "105014",
				"publicationTitle": "Communications in Nonlinear Science and Numerical Simulations",
				"shortTitle": "Modeling excitability in cerebellar stellate cells",
				"url": "http://adsabs.harvard.edu/abs/2020CNSNS..8205014M",
				"volume": "82",
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
						"tag": "Non-monotonic first-spike latency"
					},
					{
						"tag": "Runup"
					},
					{
						"tag": "Transient single spiking"
					},
					{
						"tag": "Type I oscillator with a SNIC"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://ui.adsabs.harvard.edu/abs/2019MsT.........15M/abstract",
		"items": [
			{
				"itemType": "thesis",
				"title": "Autonomous quantum Maxwell's demon using superconducting devices",
				"creators": [
					{
						"lastName": "Martins",
						"firstName": "Gabriela Fernandes",
						"creatorType": "author"
					}
				],
				"date": "July 1, 2019",
				"abstractNote": "During the last years, with the evolution of technology enabling the control of nano-mesoscopic systems, the possibility of experimentally implementing a Maxwell's demon has aroused much interest. Its classical version has already been implemented, in photonic and electronic systems, and currently its quantum version is being broadly studied. In this context, the purpose of this work is the development of a protocol for the implementation of the quantum version of an autonomous Maxwell's demon in a system of superconducting qubits. The system is composed of an Asymmetrical Single-Cooper-Pair Transistor, ASCPT, which has its extremities in contact with heat baths, such that the left one has a lower temperature than the right one. And of a device of two interacting Cooper-Pair Boxes, CPB's, named as an ECPB, for Extended Cooper-Pair Box. The ECPB is also in contact with a heat bath and possess a genuine quantum feature, entanglement, being described by its antisymmetric and symmetric states, that couple capacitively to the ASCPT with different strengths. A specific operating regime was found where the spontaneous dynamics of the tunneling of Cooper pairs through the ASCPT, will led to a heat transport from the bath in contact with the left extremity of the ASCPT to the bath at the right. And so, as in Maxwell's original thought experiment, the demon, which is composed by the ECPB and the island of the ASCPT, mediates a heat flux from a cold to a hot bath, without the expense of work. However as expected, the violation of the 2nd law of thermodynamics does not occur, as during the dynamics heat is also released to the bath in contact with the ECPB, compensating the decrease of entropy that occurs in the baths in contact with the ASCPT.",
				"journalAbbreviation": "Masters Thesis",
				"libraryCatalog": "NASA ADS",
				"publicationTitle": "Masters Thesis",
				"url": "http://adsabs.harvard.edu/abs/2019MsT.........15M",
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
		"url": "https://ui.adsabs.harvard.edu/abs/2019PhDT........69B/abstract",
		"items": [
			{
				"itemType": "thesis",
				"title": "Cosmology on the Edge of Lambda-Cold Dark Matter",
				"creators": [
					{
						"lastName": "Bernal",
						"firstName": "Jose Luis",
						"creatorType": "author"
					}
				],
				"date": "September 1, 2019",
				"abstractNote": "Cosmology is the science that studies the Universe as whole, aiming to understand its origin, composition and evolution. During the last decades, cosmology has transitioned from a \"data staved\" to a \"data driven\" science, inaugurating what is known as precision cosmology. This huge observational effort has confirmed and fostered theoretical research, and established the standard model of cosmology: Lambda-Cold Dark Matter (LCDM). This model successfully reproduces most of the observations. However, there are some persistent tensions between experiments that might be smoking guns of new physics beyond this model. Anyways, there is a difference between modeling and understanding, and LCDM is a phenomenological model that, for instance, does not describe the nature of the dark matter or dark energy. This thesis collects part of my research focused on pushing the limits of the standard\ncosmological model and its assumptions, regarding also existing tensions between experiments. New strategies to optimize the performance of future experiments are also proposed and discussed. The largest existing tension is between the direct measurements of the Hubble constant using the distance ladder in the local Universe and the inferred value obtained from observations of the Cosmic Microwave Background when LCDM is assumed. A model independent reconstruction of the late-time\nexpansion history of the Universe is carried out, which allows us to identify possible sources and solutions of the tension. We also\nintroduce the concept of the low redshift standard ruler, and measure it in a model independent way. Finally, we introduce a statistical\nmethodology to analyze several data sets in a conservative way, no matter the level of discrepancy between them, accounting for the potential presence of systematic errors. The role of primordial black holes as candidates for dark matter is addressed in this thesis, too. Concretely, the impact of an abundant population of primordial black holes in the rest of cosmological parameters is discussed, considering also populations with extended mass distributions. In addition, massive primordial black holes might be the seeds that are needed to explain the origin of the supermassive black holes located in the center of the galaxies. We predict the contribution of a population of massive primordial black holes to the 21 cm radiation from the dark ages. This way, observations of the 21 cm intensity mapping observations of the dark ages could be used to ascertain if the seeds of the supermassive black holes are primordial. Finally, we estimate the potential of radio-continuum galaxy surveys to constrain LCDM. These kind of\nexperiments can survey the sky quicker than spectroscopic and optical photometric surveys and cover much larger volumes. Therefore, they will be specially powerful to constrain physics which has impact on the largest observable scales, such as primordial non Gaussianity. On the other hand, intensity mapping experiments can reach higher redshifts than galaxy surveys, but the cosmological information of this signal is coupled with astrophysics. We propose a methodology to disentangle astrophysics and optimally extract cosmological information from the intensity mapping spectrum. Thanks to this methodology, intensity mapping will constrain the expansion history of the Universe up to reionization, as shown in this thesis.",
				"journalAbbreviation": "Ph.D. Thesis",
				"libraryCatalog": "NASA ADS",
				"publicationTitle": "Ph.D. Thesis",
				"url": "http://adsabs.harvard.edu/abs/2019PhDT........69B",
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
