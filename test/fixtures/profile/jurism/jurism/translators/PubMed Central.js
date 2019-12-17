{
	"translatorID": "27ee5b2c-2a5a-4afc-a0aa-d386642d4eed",
	"label": "PubMed Central",
	"creator": "Michael Berkowitz and Rintze Zelle",
	"target": "^https://(www\\.)?ncbi\\.nlm\\.nih\\.gov/pmc",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2019-04-07 17:23:07"
}


/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2017-2019 Michael Berkowitz and Rintze Zelle

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
	if (getPMCID(url)) {
		return "journalArticle";
	}
	
	if (getSearchResults(doc, true)) {
		return "multiple";
	}

	return false;
}

function doWeb(doc, url) {
	if (detectWeb(doc, url) == "multiple") {
		var results = getSearchResults(doc);
		Zotero.selectItems(results.ids, function (ids) {
			if (!ids) {
				return true;
			}
			var pmcids = [];
			for (var i in ids) {
				pmcids.push(i);
			}
			lookupPMCIDs(pmcids, doc, results.pdfs);
			return true;
		});
	}
	else {
		var pmcid = getPMCID(url);
		var pdf = getPDF(doc, '//td[@class="format-menu"]//a[contains(@href,".pdf")]'
				+ '|//div[@class="format-menu"]//a[contains(@href,".pdf")]'
				+ '|//aside[@id="jr-alt-p"]/div/a[contains(@href,".pdf")]');
		// if we're looking at a pdf, just use the current url
		if (!pdf && url.search(/\/pdf\/.+.pdf/) != -1) {
			pdf = url;
		}
		var pdfCollection = {};
				
		if (pdf) pdfCollection[pmcid] = pdf;
			
		lookupPMCIDs([pmcid], doc, pdfCollection);
	}
}

function getPMCID(url) {
	var pmcid = url.match(/\/articles\/PMC([\d]+)/);
	return pmcid ? pmcid[1] : false;
}


function getPDF(doc, xpath) {
	var pdf = ZU.xpath(doc, xpath);
	return pdf.length ? pdf[0].href : false;
}

function getSearchResults(doc, checkOnly) {
	var articles = doc.getElementsByClassName('rprt'),
		ids = {},
		pdfCollection = {},
		found = false;
	for (var i = 0; i < articles.length; i++) {
		var article = articles[i],
			pmcid = ZU.xpathText(article, './/dl[@class="rprtid"]/dd');
		if (pmcid) pmcid = pmcid.match(/PMC([\d]+)/);
		if (pmcid) {
			if (checkOnly) return true;
			
			var title = ZU.xpathText(article, './/div[@class="title"]');
			var pdf = getPDF(article, './/div[@class="links"]/a'
				+ '[@class="view" and contains(@href,".pdf")][1]');
			const cb = article.querySelector('input[type=checkbox]');
			ids[pmcid[1]] = {
				title,
				checked: cb && cb.checked,
			};
			
			found = true;
			
			if (pdf) pdfCollection[pmcid[1]] = pdf;
		}
	}
	return found ? { ids: ids, pdfs: pdfCollection } : false;
}

function lookupPMCIDs(ids, doc, pdfLink) {
	var newUri = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pmc&retmode=xml&id="
		+ encodeURIComponent(ids.join(","));
	Zotero.debug(newUri);
	ZU.doGet(newUri, function (text) {
		text = text.replace(/(<[^!>][^>]*>)/g, function (str) {
			return str.replace(/[-:]/gm, "");
		}); // Strip hyphens and colons from element names, attribute names and attribute values
		
		text = text.replace(/<xref[^</]*<\/xref>/g, ""); // Strip xref cross reference from e.g. title
		// Z.debug(text)
		var parser = new DOMParser();
		var doc = parser.parseFromString(text, "text/xml");

		var articles = ZU.xpath(doc, '/pmcarticleset/article');

		for (var i in articles) {
			var newItem = new Zotero.Item("journalArticle");
			
			var journal = ZU.xpath(articles[i], 'front/journalmeta');

			newItem.journalAbbreviation = ZU.xpathText(journal, 'journalid[@journalidtype="nlmta"]');
			
			var journalTitle;
			if ((journalTitle = ZU.xpathText(journal, 'journaltitlegroup/journaltitle'))) {
				newItem.publicationTitle = journalTitle;
			}
			else if ((journalTitle = ZU.xpathText(journal, 'journaltitle'))) {
				newItem.publicationTitle = journalTitle;
			}

			var issn;
			if ((issn = ZU.xpathText(journal, 'issn[@pubtype="ppub"]'))) {
				newItem.ISSN = issn;
			}
			else if ((issn = ZU.xpathText(journal, 'issn[@pubtype="epub"]'))) {
				newItem.ISSN = issn;
			}

			var article = ZU.xpath(articles[i], 'front/articlemeta');

			var abstract;
			if ((abstract = ZU.xpathText(article, 'abstract/p'))) {
				newItem.abstractNote = abstract;
			}
			else {
				var abstractSections = ZU.xpath(article, 'abstract/sec');
				abstract = [];
				for (const j in abstractSections) {
					abstract.push(ZU.xpathText(abstractSections[j], 'title') + "\n" + ZU.xpathText(abstractSections[j], 'p'));
				}
				newItem.abstractNote = abstract.join("\n\n");
			}

			newItem.DOI = ZU.xpathText(article, 'articleid[@pubidtype="doi"]');
			
			newItem.extra = "PMID: " + ZU.xpathText(article, 'articleid[@pubidtype="pmid"]') + "\n";
			newItem.extra = newItem.extra + "PMCID: PMC" + ids[i];

			newItem.title = ZU.trim(ZU.xpathText(article, 'titlegroup/articletitle'));
			
			newItem.volume = ZU.xpathText(article, 'volume');
			newItem.issue = ZU.xpathText(article, 'issue');

			var lastPage = ZU.xpathText(article, 'lpage');
			var firstPage = ZU.xpathText(article, 'fpage');
			if (firstPage && lastPage && (firstPage != lastPage)) {
				newItem.pages = firstPage + "-" + lastPage;
			}
			else if (firstPage) {
				newItem.pages = firstPage;
			}

			var pubDate = ZU.xpath(article, 'pubdate[@pubtype="ppub"]');
			if (!pubDate.length) {
				pubDate = ZU.xpath(article, 'pubdate[@pubtype="epub"]');
			}
			if (pubDate) {
				if (ZU.xpathText(pubDate, 'day')) {
					newItem.date = ZU.xpathText(pubDate, 'year') + "-" + ZU.xpathText(pubDate, 'month') + "-" + ZU.xpathText(pubDate, 'day');
				}
				else if (ZU.xpathText(pubDate, 'month')) {
					newItem.date = ZU.xpathText(pubDate, 'year') + "-" + ZU.xpathText(pubDate, 'month');
				}
				else if (ZU.xpathText(pubDate, 'year')) {
					newItem.date = ZU.xpathText(pubDate, 'year');
				}
			}

			var contributors = ZU.xpath(article, 'contribgroup/contrib');
			if (contributors) {
				var authors = ZU.xpath(article, 'contribgroup/contrib[@contribtype="author"]');
				for (const j in authors) {
					var lastName = ZU.xpathText(authors[j], 'name/surname');
					var firstName = ZU.xpathText(authors[j], 'name/givennames');
					if (firstName || lastName) {
						newItem.creators.push({
							lastName: lastName,
							firstName: firstName,
							creatorType: "author"
						});
					}
				}
			}

			var linkurl = "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC" + ids[i] + "/";
			newItem.url = linkurl;
			newItem.attachments = [{
				url: linkurl,
				title: "PubMed Central Link",
				mimeType: "text/html",
				snapshot: false
			}];
			
			let pdfFileName;
			if (pdfLink) {
				pdfFileName = pdfLink[ids[i]];
			}
			else if (ZU.xpathText(article, 'selfuri/@xlinktitle') == "pdf") {
				pdfFileName = "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC"
				+ ids[i] + "/pdf/" + ZU.xpathText(article, 'selfuri/@xlinkhref');
			}
			else if (ZU.xpathText(article, 'articleid[@pubidtype="publisherid"]')) {
				// this should work on most multiples
				pdfFileName = "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC"
				+ ids[i] + "/pdf/" + ZU.xpathText(article, 'articleid[@pubidtype="publisherid"]') + ".pdf";
			}
			
			if (pdfFileName) {
				newItem.attachments.push({
					title: "PubMed Central Full Text PDF",
					mimeType: "application/pdf",
					url: pdfFileName
				});
			}

			newItem.complete();
		}
	});
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC2377243/?tool=pmcentrez",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Effects of long-term low-dose oxygen supplementation on the epithelial function, collagen metabolism and interstitial fibrogenesis in the guinea pig lung",
				"creators": [
					{
						"lastName": "Aoki",
						"firstName": "Takuya",
						"creatorType": "author"
					},
					{
						"lastName": "Yamasawa",
						"firstName": "Fumihiro",
						"creatorType": "author"
					},
					{
						"lastName": "Kawashiro",
						"firstName": "Takeo",
						"creatorType": "author"
					},
					{
						"lastName": "Shibata",
						"firstName": "Tetsuichi",
						"creatorType": "author"
					},
					{
						"lastName": "Ishizaka",
						"firstName": "Akitoshi",
						"creatorType": "author"
					},
					{
						"lastName": "Urano",
						"firstName": "Tetsuya",
						"creatorType": "author"
					},
					{
						"lastName": "Okada",
						"firstName": "Yasumasa",
						"creatorType": "author"
					}
				],
				"date": "2008",
				"DOI": "10.1186/1465-9921-9-37",
				"ISSN": "1465-9921",
				"abstractNote": "Background\nThe patient population receiving long-term oxygen therapy has increased with the rising morbidity of COPD. Although high-dose oxygen induces pulmonary edema and interstitial fibrosis, potential lung injury caused by long-term exposure to low-dose oxygen has not been fully analyzed. This study was designed to clarify the effects of long-term low-dose oxygen inhalation on pulmonary epithelial function, edema formation, collagen metabolism, and alveolar fibrosis.\n\nMethods\nGuinea pigs (n = 159) were exposed to either 21% or 40% oxygen for a maximum of 16 weeks, and to 90% oxygen for a maximum of 120 hours. Clearance of inhaled technetium-labeled diethylene triamine pentaacetate (Tc-DTPA) and bronchoalveolar lavage fluid-to-serum ratio (BAL/Serum) of albumin (ALB) were used as markers of epithelial permeability. Lung wet-to-dry weight ratio (W/D) was measured to evaluate pulmonary edema, and types I and III collagenolytic activities and hydroxyproline content in the lung were analyzed as indices of collagen metabolism. Pulmonary fibrotic state was evaluated by histological quantification of fibrous tissue area stained with aniline blue.\n\nResults\nThe clearance of Tc-DTPA was higher with 2 week exposure to 40% oxygen, while BAL/Serum Alb and W/D did not differ between the 40% and 21% groups. In the 40% oxygen group, type I collagenolytic activities at 2 and 4 weeks and type III collagenolytic activity at 2 weeks were increased. Hydroxyproline and fibrous tissue area were also increased at 2 weeks. No discernible injury was histologically observed in the 40% group, while progressive alveolar damage was observed in the 90% group.\n\nConclusion\nThese results indicate that epithelial function is damaged, collagen metabolism is affected, and both breakdown of collagen fibrils and fibrogenesis are transiently induced even with low-dose 40% oxygen exposure. However, these changes are successfully compensated even with continuous exposure to low-dose oxygen. We conclude that long-term low-dose oxygen exposure does not significantly induce permanent lung injury in guinea pigs.",
				"extra": "PMID: 18439301\nPMCID: PMC2377243",
				"issue": "1",
				"journalAbbreviation": "Respir Res",
				"libraryCatalog": "PubMed Central",
				"pages": "37",
				"publicationTitle": "Respiratory Research",
				"url": "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC2377243/",
				"volume": "9",
				"attachments": [
					{
						"title": "PubMed Central Link",
						"mimeType": "text/html",
						"snapshot": false
					},
					{
						"title": "PubMed Central Full Text PDF",
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
		"url": "https://www.ncbi.nlm.nih.gov/pmc/?term=anger",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://www.ncbi.nlm.nih.gov/pmc/issues/184700/",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3139813/?report=classic",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Evaluation Metrics for Biostatistical and Epidemiological Collaborations",
				"creators": [
					{
						"lastName": "Rubio",
						"firstName": "Doris McGartland",
						"creatorType": "author"
					},
					{
						"lastName": "del Junco",
						"firstName": "Deborah J.",
						"creatorType": "author"
					},
					{
						"lastName": "Bhore",
						"firstName": "Rafia",
						"creatorType": "author"
					},
					{
						"lastName": "Lindsell",
						"firstName": "Christopher J.",
						"creatorType": "author"
					},
					{
						"lastName": "Oster",
						"firstName": "Robert A.",
						"creatorType": "author"
					},
					{
						"lastName": "Wittkowski",
						"firstName": "Knut M.",
						"creatorType": "author"
					},
					{
						"lastName": "Welty",
						"firstName": "Leah J.",
						"creatorType": "author"
					},
					{
						"lastName": "Li",
						"firstName": "Yi-Ju",
						"creatorType": "author"
					},
					{
						"lastName": "DeMets",
						"firstName": "Dave",
						"creatorType": "author"
					}
				],
				"date": "2011-10-15",
				"DOI": "10.1002/sim.4184",
				"ISSN": "0277-6715",
				"abstractNote": "Increasing demands for evidence-based medicine and for the translation of biomedical research into individual and public health benefit have been accompanied by the proliferation of special units that offer expertise in biostatistics, epidemiology, and research design (BERD) within academic health centers. Objective metrics that can be used to evaluate, track, and improve the performance of these BERD units are critical to their successful establishment and sustainable future. To develop a set of reliable but versatile metrics that can be adapted easily to different environments and evolving needs, we consulted with members of BERD units from the consortium of academic health centers funded by the Clinical and Translational Science Award Program of the National Institutes of Health. Through a systematic process of consensus building and document drafting, we formulated metrics that covered the three identified domains of BERD practices: the development and maintenance of collaborations with clinical and translational science investigators, the application of BERD-related methods to clinical and translational research, and the discovery of novel BERD-related methodologies. In this article, we describe the set of metrics and advocate their use for evaluating BERD practices. The routine application, comparison of findings across diverse BERD units, and ongoing refinement of the metrics will identify trends, facilitate meaningful changes, and ultimately enhance the contribution of BERD activities to biomedical research.",
				"extra": "PMID: 21284015\nPMCID: PMC3139813",
				"issue": "23",
				"journalAbbreviation": "Stat Med",
				"libraryCatalog": "PubMed Central",
				"pages": "2767-2777",
				"publicationTitle": "Statistics in medicine",
				"url": "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3139813/",
				"volume": "30",
				"attachments": [
					{
						"title": "PubMed Central Link",
						"mimeType": "text/html",
						"snapshot": false
					},
					{
						"title": "PubMed Central Full Text PDF",
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
		"url": "https://www.ncbi.nlm.nih.gov/pmc/?term=test",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC2801612/?report=reader",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Cdk4 Regulates Recruitment of Quiescent β-Cells and Ductal Epithelial Progenitors to Reconstitute β-Cell Mass",
				"creators": [
					{
						"lastName": "Lee",
						"firstName": "Ji-Hyeon",
						"creatorType": "author"
					},
					{
						"lastName": "Jo",
						"firstName": "Junghyo",
						"creatorType": "author"
					},
					{
						"lastName": "Hardikar",
						"firstName": "Anandwardhan A.",
						"creatorType": "author"
					},
					{
						"lastName": "Periwal",
						"firstName": "Vipul",
						"creatorType": "author"
					},
					{
						"lastName": "Rane",
						"firstName": "Sushil G.",
						"creatorType": "author"
					}
				],
				"date": "2010-1-13",
				"DOI": "10.1371/journal.pone.0008653",
				"ISSN": "1932-6203",
				"abstractNote": "Insulin-producing pancreatic islet β cells (β-cells) are destroyed, severely depleted or functionally impaired in diabetes. Therefore, replacing functional β-cell mass would advance clinical diabetes management. We have previously demonstrated the importance of Cdk4 in regulating β-cell mass. Cdk4-deficient mice display β-cell hypoplasia and develop diabetes, whereas β-cell hyperplasia is observed in mice expressing an active Cdk4R24C kinase. While β-cell replication appears to be the primary mechanism responsible for β-cell mass increase, considerable evidence also supports a contribution from the pancreatic ductal epithelium in generation of new β-cells. Further, while it is believed that majority of β-cells are in a state of ‘dormancy’, it is unclear if and to what extent the quiescent cells can be coaxed to participate in the β-cell regenerative response. Here, we address these queries using a model of partial pancreatectomy (PX) in Cdk4 mutant mice. To investigate the kinetics of the regeneration process precisely, we performed DNA analog-based lineage-tracing studies followed by mathematical modeling. Within a week after PX, we observed considerable proliferation of islet β-cells and ductal epithelial cells. Interestingly, the mathematical model showed that recruitment of quiescent cells into the active cell cycle promotes β-cell mass reconstitution in the Cdk4R24C pancreas. Moreover, within 24–48 hours post-PX, ductal epithelial cells expressing the transcription factor Pdx-1 dramatically increased. We also detected insulin-positive cells in the ductal epithelium along with a significant increase of islet-like cell clusters in the Cdk4R24C pancreas. We conclude that Cdk4 not only promotes β-cell replication, but also facilitates the activation of β-cell progenitors in the ductal epithelium. In addition, we show that Cdk4 controls β-cell mass by recruiting quiescent cells to enter the cell cycle. Comparing the contribution of cell proliferation and islet-like clusters to the total increase in insulin-positive cells suggests a hitherto uncharacterized large non-proliferative contribution.",
				"extra": "PMID: 20084282\nPMCID: PMC2801612",
				"issue": "1",
				"journalAbbreviation": "PLoS One",
				"libraryCatalog": "PubMed Central",
				"publicationTitle": "PLoS ONE",
				"url": "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC2801612/",
				"volume": "5",
				"attachments": [
					{
						"title": "PubMed Central Link",
						"mimeType": "text/html",
						"snapshot": false
					},
					{
						"title": "PubMed Central Full Text PDF",
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
		"url": "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4368415/pdf/imr0264-0088.pdf",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "The human immune response to tuberculosis and its treatment: a view from the blood",
				"creators": [
					{
						"lastName": "Cliff",
						"firstName": "Jacqueline M",
						"creatorType": "author"
					},
					{
						"lastName": "Kaufmann",
						"firstName": "Stefan H E",
						"creatorType": "author"
					},
					{
						"lastName": "McShane",
						"firstName": "Helen",
						"creatorType": "author"
					},
					{
						"lastName": "van Helden",
						"firstName": "Paul",
						"creatorType": "author"
					},
					{
						"lastName": "O'Garra",
						"firstName": "Anne",
						"creatorType": "author"
					}
				],
				"date": "2015-3",
				"DOI": "10.1111/imr.12269",
				"ISSN": "0105-2896",
				"abstractNote": "The immune response upon infection with the pathogen Mycobacterium tuberculosis is poorly understood, hampering the discovery of new treatments and the improvements in diagnosis. In the last years, a blood transcriptional signature in tuberculosis has provided knowledge on the immune response occurring during active tuberculosis disease. This signature was absent in the majority of asymptomatic individuals who are latently infected with M. tuberculosis (referred to as latent). Using modular and pathway analyses of the complex data has shown, now in multiple studies, that the signature of active tuberculosis is dominated by overexpression of interferon-inducible genes (consisting of both type I and type II interferon signaling), myeloid genes, and inflammatory genes. There is also downregulation of genes encoding B and T-cell function. The blood signature of tuberculosis correlates with the extent of radiographic disease and is diminished upon effective treatment suggesting the possibility of new improved strategies to support diagnostic assays and methods for drug treatment monitoring. The signature suggested a previously under-appreciated role for type I interferons in development of active tuberculosis disease, and numerous mechanisms have now been uncovered to explain how type I interferon impedes the protective response to M. tuberculosis infection.",
				"extra": "PMID: 25703554\nPMCID: PMC4368415",
				"issue": "1",
				"journalAbbreviation": "Immunol Rev",
				"libraryCatalog": "PubMed Central",
				"pages": "88-102",
				"publicationTitle": "Immunological Reviews",
				"shortTitle": "The human immune response to tuberculosis and its treatment",
				"url": "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4368415/",
				"volume": "264",
				"attachments": [
					{
						"title": "PubMed Central Link",
						"mimeType": "text/html",
						"snapshot": false
					},
					{
						"title": "PubMed Central Full Text PDF",
						"mimeType": "application/pdf"
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
