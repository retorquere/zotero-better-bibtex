{
	"translatorID": "9346ddef-126b-47ec-afef-8809ed1972ab",
	"label": "Institute of Physics",
	"creator": "Michael Berkowitz and Avram Lyon",
	"target": "^https?://iopscience\\.iop\\.org/(?:[0-9-X]+/.+|search.+)",
	"minVersion": "2.1",
	"maxVersion": "",
	"priority": 99,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsbv",
	"lastUpdated": "2013-12-12 12:48:04"
}

/*
   IOP Translator
   Copyright (C) 2013 Sebastian Karcher

   This program is free software: you can redistribute it and/or modify
   it under the terms of the GNU Affero General Public License as published by
   the Free Software Foundation, either version 3 of the License, or
   (at your option) any later version.

   This program is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   GNU Affero General Public License for more details.

   You should have received a copy of the GNU Affero General Public License
   along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

function detectWeb(doc,url) {
	var xpath='//meta[@name="citation_journal_title"]';
		
	if (ZU.xpath(doc, xpath).length > 0) {
		return "journalArticle";
	}
			
	else if (!url.match(/\/pdf\//) && getResults(doc).length){
		return "multiple";
	}

	return false;
}

function getResults(doc){
	var results;
	if (ZU.xpathText(doc, '//div[@class="searchResCol1"]')){
			results = ZU.xpath(doc, '//div[@class="searchResCol1"]//h4/a')
		}
		//journal TOC
		else if (ZU.xpathText(doc, '//div[@class="paperEntry"]')){
		results = ZU.xpath(doc, '//div[@class="paperEntry"]//a[@class="title" and not(contains(@href, "fulltext"))]');
		}
	return results;	
}	

function doWeb(doc,url)
{
	if (detectWeb(doc, url) == "multiple") {
		var hits = {};
		var urls = [];
		//search results
			
		//var results = ZU.xpath(doc,"//table[@id='articles-list']//td[@class='article-entry']//p/strong/a");
	 	var results = getResults(doc)
		for (var i in results) {
			hits[results[i].href] = results[i].textContent.trim();
		}
		Z.selectItems(hits, function(items) {
			if (items == null) return true;
			for (var j in items) {
				urls.push(j);
			}
			ZU.processDocuments(urls, function (myDoc) { 
				doWeb(myDoc, myDoc.location.href) });

		});
	} else {
		// We call the Embedded Metadata translator to do the actual work
		var translator = Zotero.loadTranslator("import");
		translator.setTranslator("951c027d-74ac-47d4-a107-9c3069ab7b48");
		translator.setHandler("itemDone", function(obj, item) {
				item.libraryCatalog = "Institute of Physics"
				item.extra = '';
				item.complete();
				});
		translator.getTranslatorObject(function (obj) {
				obj.doWeb(doc, url);
				});
	}
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://iopscience.iop.org/0022-3727/34/10/311",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"firstName": "J.",
						"lastName": "Batina",
						"creatorType": "author"
					},
					{
						"firstName": "F.",
						"lastName": "Noël",
						"creatorType": "author"
					},
					{
						"firstName": "S.",
						"lastName": "Lachaud",
						"creatorType": "author"
					},
					{
						"firstName": "R.",
						"lastName": "Peyrous",
						"creatorType": "author"
					},
					{
						"firstName": "J. F.",
						"lastName": "Loiseau",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					},
					{
						"title": "Snapshot"
					}
				],
				"title": "Hydrodynamical simulation of the electric wind in a cylindrical vessel with positive point-to-plane device",
				"publisher": "IOP Publishing",
				"institution": "IOP Publishing",
				"company": "IOP Publishing",
				"label": "IOP Publishing",
				"distributor": "IOP Publishing",
				"date": "2001-05-21",
				"DOI": "10.1088/0022-3727/34/10/311",
				"reportType": "Text",
				"letterType": "Text",
				"manuscriptType": "Text",
				"mapType": "Text",
				"thesisType": "Text",
				"websiteType": "Text",
				"presentationType": "Text",
				"postType": "Text",
				"audioFileType": "Text",
				"language": "en",
				"publicationTitle": "Journal of Physics D: Applied Physics",
				"journalAbbreviation": "J. Phys. D: Appl. Phys.",
				"volume": "34",
				"issue": "10",
				"pages": "1510",
				"ISSN": "0022-3727",
				"url": "http://iopscience.iop.org/0022-3727/34/10/311",
				"abstractNote": "Electrical corona discharges at atmospheric pressure in a positive point-to-plane configuration create an electric wind from the point to the plane which, in a closed cylindrical vessel, generates in a few seconds axisymmetrical vortices in the vessel. Photography and video recording show that a small ring vortex appears around the discharge axis, close to the plane, enlarges and progressively fills the vessel up to a stationary situation. A simplified stationary model was first used in order to take into account the measured values of the wind velocity along the discharge axis as well as the velocity field lines visualized by smoke particles. Simulation and experimental results are in fairly good agreement, and a few particular adjustments concerning temperature profiles were made to improve the numerical results. Then, a dynamical model, including the effect of the repetitive ionizing fronts (streamers) occurring in the filamentary discharge, allows one to render an account of the transient evolution of the velocity field lines towards the stationary vortices. Although the numerical simulation could not be continued to a steady state, it shows that a small ring vortex is created near the point electrode, moves rapidly from the point to the plane and then begins to enlarge at the right (experimental) place.",
				"libraryCatalog": "Institute of Physics",
				"accessDate": "CURRENT_TIMESTAMP"
			}
		]
	},
	{
		"type": "web",
		"url": "http://iopscience.iop.org/search?searchType=fullText&fieldedquery=fun&f=titleabs&time=all&submit=Search&navsubmit=Search",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://iopscience.iop.org/1741-2552/10/2/026008/article#jne451204f3",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"firstName": "Kai",
						"lastName": "Xu",
						"creatorType": "author"
					},
					{
						"firstName": "Yiwen",
						"lastName": "Wang",
						"creatorType": "author"
					},
					{
						"firstName": "Yueming",
						"lastName": "Wang",
						"creatorType": "author"
					},
					{
						"firstName": "Fang",
						"lastName": "Wang",
						"creatorType": "author"
					},
					{
						"firstName": "Yaoyao",
						"lastName": "Hao",
						"creatorType": "author"
					},
					{
						"firstName": "Shaomin",
						"lastName": "Zhang",
						"creatorType": "author"
					},
					{
						"firstName": "Qiaosheng",
						"lastName": "Zhang",
						"creatorType": "author"
					},
					{
						"firstName": "Weidong",
						"lastName": "Chen",
						"creatorType": "author"
					},
					{
						"firstName": "Xiaoxiang",
						"lastName": "Zheng",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					},
					{
						"title": "Snapshot"
					}
				],
				"title": "Local-learning-based neuron selection for grasping gesture prediction in motor brain machine interfaces",
				"publisher": "IOP Publishing",
				"institution": "IOP Publishing",
				"company": "IOP Publishing",
				"label": "IOP Publishing",
				"distributor": "IOP Publishing",
				"date": "2013-04-01",
				"DOI": "10.1088/1741-2560/10/2/026008",
				"reportType": "Text",
				"letterType": "Text",
				"manuscriptType": "Text",
				"mapType": "Text",
				"thesisType": "Text",
				"websiteType": "Text",
				"presentationType": "Text",
				"postType": "Text",
				"audioFileType": "Text",
				"language": "en",
				"publicationTitle": "Journal of Neural Engineering",
				"journalAbbreviation": "J. Neural Eng.",
				"volume": "10",
				"issue": "2",
				"pages": "026008",
				"ISSN": "1741-2552",
				"url": "http://iopscience.iop.org/1741-2552/10/2/026008",
				"abstractNote": "Objective. The high-dimensional neural recordings bring computational challenges to movement decoding in motor brain machine interfaces (mBMI), especially for portable applications. However, not all recorded neural activities relate to the execution of a certain movement task. This paper proposes to use a local-learning-based method to perform neuron selection for the gesture prediction in a reaching and grasping task. Approach. Nonlinear neural activities are decomposed into a set of linear ones in a weighted feature space. A margin is defined to measure the distance between inter-class and intra-class neural patterns. The weights, reflecting the importance of neurons, are obtained by minimizing a margin-based exponential error function. To find the most dominant neurons in the task, 1-norm regularization is introduced to the objective function for sparse weights, where near-zero weights indicate irrelevant neurons. Main results. The signals of only 10 neurons out of 70 selected by the proposed method could achieve over 95% of the full recording's decoding accuracy of gesture predictions, no matter which different decoding methods are used (support vector machine and K-nearest neighbor). The temporal activities of the selected neurons show visually distinguishable patterns associated with various hand states. Compared with other algorithms, the proposed method can better eliminate the irrelevant neurons with near-zero weights and provides the important neuron subset with the best decoding performance in statistics. The weights of important neurons converge usually within 10–20 iterations. In addition, we study the temporal and spatial variation of neuron importance along a period of one and a half months in the same task. A high decoding performance can be maintained by updating the neuron subset. Significance. The proposed algorithm effectively ascertains the neuronal importance without assuming any coding model and provides a high performance with different decoding models. It shows better robustness of identifying the important neurons with noisy signals presented. The low demand of computational resources which, reflected by the fast convergence, indicates the feasibility of the method applied in portable BMI systems. The ascertainment of the important neurons helps to inspect neural patterns visually associated with the movement task. The elimination of irrelevant neurons greatly reduces the computational burden of mBMI systems and maintains the performance with better robustness.",
				"libraryCatalog": "Institute of Physics",
				"accessDate": "CURRENT_TIMESTAMP"
			}
		]
	},
	{
		"type": "web",
		"url": "http://iopscience.iop.org/0004-637X/776/1",
		"items": "multiple"
	}
]
/** END TEST CASES **/