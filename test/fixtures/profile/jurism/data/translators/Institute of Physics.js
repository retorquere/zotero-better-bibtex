{
	"translatorID": "9346ddef-126b-47ec-afef-8809ed1972ab",
	"label": "Institute of Physics",
	"creator": "Michael Berkowitz and Avram Lyon and Sebastian Karcher",
	"target": "^https?://iopscience\\.iop\\.org/((article/10\\.[^/]+/)?[0-9-X]+/.+|n?search\\?.+)",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 99,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsbv",
	"lastUpdated": "2016-11-01 12:54:14"
}

/*
   IOP Translator
   Copyright (C) 2013-2015 Sebastian Karcher

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
	if (ZU.xpath(doc, '//meta[@name="citation_journal_title"]').length > 0) {
		return "journalArticle";
	} else if (url.indexOf("/pdf/") == -1 && getResults(doc).length){
		return "multiple";
	}

	return false;
}

function getResults(doc){
	return ZU.xpath(doc, '//div[@class="searchResCol1"]//h4/a|//a[contains(@class, "art-list-item-title")]');	
}	

function doWeb(doc,url)
{
	if (detectWeb(doc, url) == "multiple") {
		var hits = {};
		var urls = [];
		//search results
			
		//var results = ZU.xpath(doc,"//table[@id='articles-list']//td[@class='article-entry']//p/strong/a");
	 	var results = getResults(doc)
		for (var i =0; i<results.length; i++) {
			hits[results[i].href] = results[i].textContent.trim();
		}
		Z.selectItems(hits, function(items) {
			if (items == null) return true;
			for (var j in items) {
				urls.push(j);
			}
			ZU.processDocuments(urls, scrape);

		});
	} else {
		scrape (doc, url);
	}
}

function scrape (doc, url){
	//Z.debug(url)
	var DOI = ZU.xpathText(doc, '//meta[@name="citation_doi"]/@content');
	var journalAbbr = ZU.xpathText(doc, '//meta[@name="citation_journal_abbrev"]/@content');
	var ISSN = ZU.xpathText(doc, '//meta[@name="citation_issn"]/@content');
	var journalAbbr = ZU.xpathText(doc, '//meta[@name="citation_journal_abbrev"]/@content');
	var language = ZU.xpathText(doc, '//meta[@name="dc.language"]/@content');
	var pdfURL = url.replace(/(\/meta)?([#?].+)?$/, "") + "/pdf"
	//Z.debug("pdfURL: " + pdfURL)
	var bibtexurl = ZU.xpathText(doc, '//a[contains(@class, "btn-cit-abs-bib")]/@href');
	//Z.debug(bibtexurl)
	ZU.doGet(bibtexurl, function (text) {
	//Z.debug(text)
		var translator = Zotero.loadTranslator("import");
		translator.setTranslator("9cb70025-a888-4a29-a210-93ec52da40d4");
		translator.setString(text);
		translator.setHandler("itemDone", function(obj, item) {
			item.DOI = DOI;
			item.ISSN = ISSN;
			item.language = language;
			item.journalAbbreviation = journalAbbr;
			item.attachments.push({url: pdfURL, title: "IOP Full Text PDF", mimeType: "application/pdf"})
			item.complete();
		});	
		translator.translate();
	});

}
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://iopscience.iop.org/article/10.1088/0022-3727/34/10/311/meta",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Hydrodynamical simulation of the electric wind in a cylindrical vessel with positive point-to-plane device",
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
				"date": "2001",
				"DOI": "10.1088/0022-3727/34/10/311",
				"ISSN": "0022-3727",
				"abstractNote": "Electrical corona discharges at atmospheric pressure in a positive point-to-plane configuration create an electric wind from the point to the plane which, in a closed cylindrical vessel, generates in a few seconds axisymmetrical vortices in the vessel. Photography and video recording show that a small ring vortex appears around the discharge axis, close to the plane, enlarges and progressively fills the vessel up to a stationary situation. A simplified stationary model was first used in order to take into account the measured values of the wind velocity along the discharge axis as well as the velocity field lines visualized by smoke particles. Simulation and experimental results are in fairly good agreement, and a few particular adjustments concerning temperature profiles were made to improve the numerical results. Then, a dynamical model, including the effect of the repetitive ionizing fronts (streamers) occurring in the filamentary discharge, allows one to render an account of the transient evolution of the velocity field lines towards the stationary vortices. Although the numerical simulation could not be continued to a steady state, it shows that a small ring vortex is created near the point electrode, moves rapidly from the point to the plane and then begins to enlarge at the right (experimental) place.",
				"issue": "10",
				"itemID": "0022-3727-34-10-311",
				"journalAbbreviation": "J. Phys. D: Appl. Phys.",
				"language": "en",
				"libraryCatalog": "Institute of Physics",
				"pages": "1510",
				"publicationTitle": "Journal of Physics D: Applied Physics",
				"url": "http://stacks.iop.org/0022-3727/34/i=10/a=311",
				"volume": "34",
				"attachments": [
					{
						"title": "IOP Full Text PDF",
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
		"url": "http://iopscience.iop.org/search?searchType=fullText&fieldedquery=fun&f=titleabs&time=all&submit=Search&navsubmit=Search",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://iopscience.iop.org/article/10.1088/1741-2560/10/2/026008#jne451204f3",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Local-learning-based neuron selection for grasping gesture prediction in motor brain machine interfaces",
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
						"lastName": "Weidong Chen",
						"creatorType": "author",
						"fieldMode": 1
					},
					{
						"firstName": "Xiaoxiang",
						"lastName": "Zheng",
						"creatorType": "author"
					}
				],
				"date": "2013",
				"DOI": "10.1088/1741-2560/10/2/026008",
				"ISSN": "1741-2552",
				"abstractNote": "Objective . The high-dimensional neural recordings bring computational challenges to movement decoding in motor brain machine interfaces (mBMI), especially for portable applications. However, not all recorded neural activities relate to the execution of a certain movement task. This paper proposes to use a local-learning-based method to perform neuron selection for the gesture prediction in a reaching and grasping task. Approach . Nonlinear neural activities are decomposed into a set of linear ones in a weighted feature space. A margin is defined to measure the distance between inter-class and intra-class neural patterns. The weights, reflecting the importance of neurons, are obtained by minimizing a margin-based exponential error function. To find the most dominant neurons in the task, 1-norm regularization is introduced to the objective function for sparse weights, where near-zero weights indicate irrelevant neurons. Main results . The signals of only 10 neurons out of 70 selected by the proposed method could achieve over 95% of the full recording's decoding accuracy of gesture predictions, no matter which different decoding methods are used (support vector machine and K-nearest neighbor). The temporal activities of the selected neurons show visually distinguishable patterns associated with various hand states. Compared with other algorithms, the proposed method can better eliminate the irrelevant neurons with near-zero weights and provides the important neuron subset with the best decoding performance in statistics. The weights of important neurons converge usually within 10–20 iterations. In addition, we study the temporal and spatial variation of neuron importance along a period of one and a half months in the same task. A high decoding performance can be maintained by updating the neuron subset. Significance . The proposed algorithm effectively ascertains the neuronal importance without assuming any coding model and provides a high performance with different decoding models. It shows better robustness of identifying the important neurons with noisy signals presented. The low demand of computational resources which, reflected by the fast convergence, indicates the feasibility of the method applied in portable BMI systems. The ascertainment of the important neurons helps to inspect neural patterns visually associated with the movement task. The elimination of irrelevant neurons greatly reduces the computational burden of mBMI systems and maintains the performance with better robustness.",
				"issue": "2",
				"itemID": "1741-2552-10-2-026008",
				"journalAbbreviation": "J. Neural Eng.",
				"language": "en",
				"libraryCatalog": "Institute of Physics",
				"pages": "026008",
				"publicationTitle": "Journal of Neural Engineering",
				"url": "http://stacks.iop.org/1741-2552/10/i=2/a=026008",
				"volume": "10",
				"attachments": [
					{
						"title": "IOP Full Text PDF",
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
		"url": "http://iopscience.iop.org/0004-637X/776/1",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://iopscience.iop.org/article/10.1088/0004-637X/768/1/87",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Quasi-periodic Oscillations and Broadband Variability in Short Magnetar Bursts",
				"creators": [
					{
						"firstName": "Daniela",
						"lastName": "Huppenkothen",
						"creatorType": "author"
					},
					{
						"firstName": "Anna L.",
						"lastName": "Watts",
						"creatorType": "author"
					},
					{
						"firstName": "Phil",
						"lastName": "Uttley",
						"creatorType": "author"
					},
					{
						"firstName": "Alexander J. van der",
						"lastName": "Horst",
						"creatorType": "author"
					},
					{
						"firstName": "Michiel van der",
						"lastName": "Klis",
						"creatorType": "author"
					},
					{
						"firstName": "Chryssa",
						"lastName": "Kouveliotou",
						"creatorType": "author"
					},
					{
						"firstName": "Ersin",
						"lastName": "Göğüş",
						"creatorType": "author"
					},
					{
						"firstName": "Jonathan",
						"lastName": "Granot",
						"creatorType": "author"
					},
					{
						"firstName": "Simon",
						"lastName": "Vaughan",
						"creatorType": "author"
					},
					{
						"firstName": "Mark H.",
						"lastName": "Finger",
						"creatorType": "author"
					}
				],
				"date": "2013",
				"DOI": "10.1088/0004-637X/768/1/87",
				"ISSN": "0004-637X",
				"abstractNote": "The discovery of quasi-periodic oscillations (QPOs) in magnetar giant flares has opened up prospects for neutron star asteroseismology. However, with only three giant flares ever recorded, and only two with data of sufficient quality to search for QPOs, such analysis is seriously data limited. We set out a procedure for doing QPO searches in the far more numerous, short, less energetic magnetar bursts. The short, transient nature of these bursts requires the implementation of sophisticated statistical techniques to make reliable inferences. Using Bayesian statistics, we model the periodogram as a combination of red noise at low frequencies and white noise at high frequencies, which we show is a conservative approach to the problem. We use empirical models to make inferences about the potential signature of periodic and QPOs at these frequencies. We compare our method with previously used techniques and find that although it is on the whole more conservative, it is also more reliable in ruling out false positives. We illustrate our Bayesian method by applying it to a sample of 27 bursts from the magnetar SGR J0501+4516 observed by the Fermi Gamma-ray Burst Monitor, and we find no evidence for the presence of QPOs in any of the bursts in the unbinned spectra, but do find a candidate detection in the binned spectra of one burst. However, whether this signal is due to a genuine quasi-periodic process, or can be attributed to unmodeled effects in the noise is at this point a matter of interpretation.",
				"issue": "1",
				"itemID": "0004-637X-768-1-87",
				"journalAbbreviation": "ApJ",
				"language": "en",
				"libraryCatalog": "Institute of Physics",
				"pages": "87",
				"publicationTitle": "The Astrophysical Journal",
				"url": "http://stacks.iop.org/0004-637X/768/i=1/a=87",
				"volume": "768",
				"attachments": [
					{
						"title": "IOP Full Text PDF",
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
		"url": "http://iopscience.iop.org/nsearch?terms=energy&searchType=yourSearch&navsubmit=Search",
		"items": "multiple"
	}
]
/** END TEST CASES **/