{
	"translatorID": "cb9e794e-7a65-47cd-90f6-58cdd191e8b0",
	"label": "Frontiers",
	"creator": "Jason Friedman and Simon Kornblith",
	"target": "^https?://(www|journal)\\.frontiersin\\.org/",
	"minVersion": "2.1.10",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2016-11-13 05:45:42"
}

/*
   Frontiers translator 
   Copyright (C) 2009-2011 Jason Friedman, write.to.jason@gmail.com
						   Simon Kornblith, simon@simonster.com

   This program is free software: you can redistribute it and/or modify
   it under the terms of the GNU Affero General Public License as published by
   the Free Software Foundation, either version 3 of the License, or
   (at your option) any later version.

   This program is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   GNU Affero General Public License for more details.

   You should have received a copy of the Affero GNU General Public License
   along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

function detectWeb(doc, url) {

	if (url.indexOf("abstract") != -1) {
		return "journalArticle";
	} else if (url.indexOf("full") != -1) {
		return "journalArticle";
	} else if (!ZU.isEmpty(getItems(doc, url))) {
		return "multiple";
	}
}

function getItems(doc, url) {
	var items = {};
	var links = doc.evaluate('//*[@class="AS55"]/a[contains(@title, " ") or contains(@title, "/")]', doc, null, XPathResult.ANY_TYPE, null);
	while (link = links.iterateNext()) {
		if (link.href.indexOf("/abstract") === -1) continue;
		items[link.href] = link.textContent;
	}
	return items;
}

function doWeb(doc, url) {
	var articles = new Array();

	// individual article
	if (detectWeb(doc, url) === "journalArticle") {
		scrape(doc, url);
		// search results / other page
	} else {
		var items = getItems(doc, url);
		Zotero.selectItems(items, function (items) {
			if (!items) {
				return true;
			}
			for (var i in items) {
				articles.push(i);
			}
			Zotero.Utilities.processDocuments(articles, scrape);
		});
	}
}

function scrape(doc, url) {
	var translator = Zotero.loadTranslator('web');
	// Embedded Metadata
	translator.setTranslator('951c027d-74ac-47d4-a107-9c3069ab7b48');
	//translator.setDocument(doc);

	translator.setHandler('itemDone', function (obj, item) {
   		item.libraryCatalog = "Frontiers";
   		//no need for a Snapshot
   		for (var i = item.attachments.length -1; i>=0; i--) {
   			if (item.attachments[i].title == "Snapshot") {
   				item.attachments.splice(i, 1);
   			}
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
		"url": "http://www.frontiersin.org/SearchData.aspx?sq=key+visual+features",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://journal.frontiersin.org/article/10.3389/fpsyg.2011.00326/full",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "What are the Visual Features Underlying Rapid Object Recognition?",
				"creators": [
					{
						"firstName": "Sébastien M.",
						"lastName": "Crouzet",
						"creatorType": "author"
					},
					{
						"firstName": "Thomas",
						"lastName": "Serre",
						"creatorType": "author"
					}
				],
				"date": "2011",
				"DOI": "10.3389/fpsyg.2011.00326",
				"ISSN": "1664-1078",
				"abstractNote": "Research progress in machine vision has been very significant in recent years. Robust face detection and identification algorithms are already readily available to consumers, and modern computer vision algorithms for generic object recognition are now coping with the richness and complexity of natural visual scenes. Unlike early vision models of object recognition that emphasized the role of figure-ground segmentation and spatial information between parts, recent successful approaches are based on the computation of loose collections of image features without prior segmentation or any explicit encoding of spatial relations. While these models remain simplistic models of visual processing, they suggest that, in principle, bottom-up activation of a loose collection of image features could support the rapid recognition of natural object categories and provide an initial coarse visual representation before more complex visual routines and attentional mechanisms take place. Focusing on biologically-plausible computational models of (bottom-up) pre-attentive visual recognition, we review some of the key visual features that have been described in the literature. We discuss the consistency of these feature-based representations with classical theories from visual psychology and test their ability to account for human performance on a rapid object categorization task.",
				"journalAbbreviation": "Front. Psychol.",
				"language": "English",
				"libraryCatalog": "Frontiers",
				"publicationTitle": "Frontiers in Psychology",
				"url": "http://journal.frontiersin.org/article/10.3389/fpsyg.2011.00326/full",
				"volume": "2",
				"attachments": [],
				"tags": [
					"Computational models",
					"Computer Vision",
					"feedforward",
					"rapid visual object recognition",
					"visual features"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://journal.frontiersin.org/article/10.3389/fmicb.2014.00402/full",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Aromatic inhibitors derived from ammonia-pretreated lignocellulose hinder bacterial ethanologenesis by activating regulatory circuits controlling inhibitor efflux and detoxification",
				"creators": [
					{
						"firstName": "David H.",
						"lastName": "Keating",
						"creatorType": "author"
					},
					{
						"firstName": "Yaoping",
						"lastName": "Zhang",
						"creatorType": "author"
					},
					{
						"firstName": "Irene M.",
						"lastName": "Ong",
						"creatorType": "author"
					},
					{
						"firstName": "Sean",
						"lastName": "McIlwain",
						"creatorType": "author"
					},
					{
						"firstName": "Eduardo H.",
						"lastName": "Morales",
						"creatorType": "author"
					},
					{
						"firstName": "Jeffrey A.",
						"lastName": "Grass",
						"creatorType": "author"
					},
					{
						"firstName": "Mary",
						"lastName": "Tremaine",
						"creatorType": "author"
					},
					{
						"firstName": "William",
						"lastName": "Bothfeld",
						"creatorType": "author"
					},
					{
						"firstName": "Alan",
						"lastName": "Higbee",
						"creatorType": "author"
					},
					{
						"firstName": "Arne",
						"lastName": "Ulbrich",
						"creatorType": "author"
					},
					{
						"firstName": "Allison J.",
						"lastName": "Balloon",
						"creatorType": "author"
					},
					{
						"firstName": "Michael S.",
						"lastName": "Westphall",
						"creatorType": "author"
					},
					{
						"firstName": "Josh",
						"lastName": "Aldrich",
						"creatorType": "author"
					},
					{
						"firstName": "Mary S.",
						"lastName": "Lipton",
						"creatorType": "author"
					},
					{
						"firstName": "Joonhoon",
						"lastName": "Kim",
						"creatorType": "author"
					},
					{
						"firstName": "Oleg V.",
						"lastName": "Moskvin",
						"creatorType": "author"
					},
					{
						"firstName": "Yury V.",
						"lastName": "Bukhman",
						"creatorType": "author"
					},
					{
						"firstName": "Joshua J.",
						"lastName": "Coon",
						"creatorType": "author"
					},
					{
						"firstName": "Patricia J.",
						"lastName": "Kiley",
						"creatorType": "author"
					},
					{
						"firstName": "Donna M.",
						"lastName": "Bates",
						"creatorType": "author"
					},
					{
						"firstName": "Robert",
						"lastName": "Landick",
						"creatorType": "author"
					}
				],
				"date": "2014",
				"DOI": "10.3389/fmicb.2014.00402",
				"ISSN": "1664-302X",
				"abstractNote": "Efficient microbial conversion of lignocellulosic hydrolysates to biofuels is a key barrier to the economically viable deployment of lignocellulosic biofuels. A chief contributor to this barrier is the impact on microbial processes and energy metabolism of lignocellulose-derived inhibitors, including phenolic carboxylates, phenolic amides (for ammonia-pretreated biomass), phenolic aldehydes, and furfurals. To understand the bacterial pathways induced by inhibitors present in ammonia-pretreated biomass hydrolysates, which are less well studied than acid-pretreated biomass hydrolysates, we developed and exploited synthetic mimics of ammonia-pretreated corn stover hydrolysate (ACSH). To determine regulatory responses to the inhibitors normally present in ACSH, we measured transcript and protein levels in an Escherichia coli ethanologen using RNA-seq and quantitative proteomics during fermentation to ethanol of synthetic hydrolysates containing or lacking the inhibitors. Our study identified four major regulators mediating these responses, the MarA/SoxS/Rob network, AaeR, FrmR, and YqhC. Induction of these regulons was correlated with a reduced rate of ethanol production, buildup of pyruvate, depletion of ATP and NAD(P)H, and an inhibition of xylose conversion. The aromatic aldehyde inhibitor 5-hydroxymethylfurfural appeared to be reduced to its alcohol form by the ethanologen during fermentation whereas phenolic acid and amide inhibitors were not metabolized. Together, our findings establish that the major regulatory responses to lignocellulose-derived inhibitors are mediated by transcriptional rather than translational regulators, suggest that energy consumed for inhibitor efflux and detoxification may limit biofuel production, and identify a network of regulators for future synthetic biology efforts.",
				"journalAbbreviation": "Front. Microbiol.",
				"language": "English",
				"libraryCatalog": "Frontiers",
				"publicationTitle": "Frontiers in Microbiology",
				"url": "http://journal.frontiersin.org/article/10.3389/fmicb.2014.00402/full",
				"volume": "5",
				"attachments": [],
				"tags": [
					"Biofuels",
					"Escherichia coli",
					"Ethanol",
					"Proteomics",
					"RNAseq",
					"Transcriptomics",
					"aromatic inhibitors",
					"lignocellulosic hydrolysate"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/