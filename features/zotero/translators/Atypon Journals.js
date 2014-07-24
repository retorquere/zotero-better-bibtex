{
	"translatorID": "5af42734-7cd5-4c69-97fc-bc406999bdba",
	"label": "Atypon Journals",
	"creator": "Sebastian Karcher",
	"target": "^[^?#]+(?:/doi/(?:abs|full|figure|ref|citedby|book)/10\\.|/action/doSearch\\?)|^https?://[^/]+/toc/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 200,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2014-06-01 17:35:03"
}

/*
Atypon Journals Translator
Copyright (C) 2011-2014 Sebastian Karcher

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program. If not, see <http://www.gnu.org/licenses/>.
*/


function detectWeb(doc, url) {
	if (url.search(/^https?:\/\/[^\/]+\/toc\/|\/action\/doSearch\?/) != -1) {
		return Object.keys(getSearchResults(doc)).length ? "multiple" : false;
	}
	
	if (url.indexOf('/doi/book/') != -1) {
		return 'book';
	}
	else if (url.search(/\.ch\d+$/)!=-1){
		return 'bookSection';
	}
	return "journalArticle";
}

function getSearchResults(doc) {
	var articles = {};
	var container = doc.getElementsByName('frmSearchResults')[0]
		|| doc.getElementsByName('frmAbs')[0];
	if(!container) {
		Z.debug('Atypon: multiples container not found.');
		return articles;
	}
	var rows = container.getElementsByClassName('articleEntry');
	for(var i = 0; i<rows.length; i++) {
		var title = rows[i].getElementsByClassName('art_title')[0];
		if(!title) continue;
		title = ZU.trimInternal(title.textContent);
		
		var url = ZU.xpathText(rows[i], '(.//a[contains(@href, "/doi/abs/") or\
			contains(@href, "/doi/full/") or contains(@href, "/doi/book/")])[1]/@href');
		if(!url) continue;
		
		articles[url] = title;
	}
	if (!Object.keys(articles).length){
		Z.debug("trying alternate multiple format");
		var rows = ZU.xpath(container, '//div[contains(@class, "item-details")]');
		for(var i = 0; i<rows.length; i++) {
			var title = ZU.xpathText(rows[i], './h3');
			var url = ZU.xpathText(rows[i], '(.//ul[contains(@class, "icon-list")]/li/a[contains(@href, "/doi/abs/") or\
				contains(@href, "/doi/full/") or contains(@href, "/doi/book/")])[1]/@href');
			if(!url) continue;
			articles[url] = title;
		}
	}
	return articles;
}

function doWeb(doc, url) {
	var arts = new Array();
	if (detectWeb(doc, url) == "multiple") {
		Zotero.selectItems(getSearchResults(doc), function (items) {
			if (!items) {
				return true;
			}
			urls = new Array();
			for (var itemurl in items) {
				//Z.debug(itemurl)
				//some search results have some "baggage" at the end - remove
				urls.push(itemurl.replace(/\?prev.+/, ""));
			}
			Z.debug(urls)
			ZU.processDocuments(urls, scrape)
		});

	} else {
		scrape(doc, url)
	}
}

function scrape(doc, url) {
	url = url.replace(/[?#].*/, "");
	var replURLRegExp = /\/doi\/(?:abs|full|figure|ref|citedby|book)\//;
	var pdfurl = url.replace(replURLRegExp, "/doi/pdf/");
	var doi = url.match(/10\.[^?#]+/)[0];
	var citationurl = url.replace(replURLRegExp, "/action/showCitFormats?doi=");
	var abstract = ZU.xpathText(doc, '//div[@class="abstractSection"]')
	var tags = ZU.xpath(doc, '//p[@class="fulltext"]//a[contains(@href, "keywordsfield") or contains(@href, "Keyword=")]');
	Z.debug("Citation URL: " + citationurl);
	ZU.processDocuments(citationurl, function(citationDoc){
		var filename = citationDoc.evaluate('//form[@target="_self"]//input[@name="downloadFileName"]', citationDoc, null, XPathResult.ANY_TYPE, null).iterateNext().value;
		Z.debug("Filename: " + filename);
		var get = '/action/downloadCitation';
		var post = 'doi=' + doi + '&downloadFileName=' + filename + '&format=ris&direct=true&include=cit';
		Zotero.Utilities.HTTP.doPost(get, post, function (text) {
			//Z.debug(text);
			var translator = Zotero.loadTranslator("import");
			// Calling the RIS translator
			translator.setTranslator("32d59d2d-b65a-4da4-b0a3-bdd3cfb979e7");
			translator.setString(text);
			translator.setHandler("itemDone", function (obj, item) {
				item.url = url;
				item.notes = [];
				for (var i in tags){
					item.tags.push(tags[i].textContent)
				}
				item.abstractNote = abstract;
				item.attachments = [{
					url: pdfurl,
					title: "Full Text PDF",
					mimeType: "application/pdf"
				}, {
					document: doc,
					title: "Snapshot",
					mimeType: "text/html"
				}];
				item.libraryCatalog = url.replace(/^https?:\/\/(?:www\.)?/, '')
					.replace(/[\/:].*/, '') + " (Atypon)";
				item.complete();
			});
			translator.translate();
		});
	})
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.esajournals.org/doi/abs/10.1890/09-1234.1",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"lastName": "Gao",
						"firstName": "Chao",
						"creatorType": "author"
					},
					{
						"lastName": "Wang",
						"firstName": "Han",
						"creatorType": "author"
					},
					{
						"lastName": "Weng",
						"firstName": "Ensheng",
						"creatorType": "author"
					},
					{
						"lastName": "Lakshmivarahan",
						"firstName": "S.",
						"creatorType": "author"
					},
					{
						"lastName": "Zhang",
						"firstName": "Yanfen",
						"creatorType": "author"
					},
					{
						"lastName": "Luo",
						"firstName": "Yiqi",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [
					"carbon cycle",
					"data assimilation",
					"ecological forecast",
					"ensemble Kalman filter (EnKF)",
					"parameter estimation",
					"uncertainty analysis"
				],
				"seeAlso": [],
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
				"DOI": "10.1890/09-1234.1",
				"journalAbbreviation": "Ecological Applications",
				"issue": "5",
				"ISSN": "1051-0761",
				"url": "http://www.esajournals.org/doi/abs/10.1890/09-1234.1",
				"abstractNote": "The ensemble Kalman filter (EnKF) has been used in weather forecasting to assimilate observations into weather models. In this study, we examine how effectively forecasts of a forest carbon cycle can be improved by assimilating observations with the EnKF. We used the EnKF to assimilate into the terrestrial ecosystem (TECO) model eight data sets collected at the Duke Forest between 1996 and 2004 (foliage biomass, fine root biomass, woody biomass, litterfall, microbial biomass, forest floor carbon, soil carbon, and soil respiration). We then used the trained model to forecast changes in carbon pools from 2004 to 2012. Our daily analysis of parameters indicated that all the exit rates were well constrained by the EnKF, with the exception of the exit rates controlling the loss of metabolic litter and passive soil organic matter. The poor constraint of these two parameters resulted from the low sensitivity of TECO predictions to their values and the poor correlation between these parameters and the observed variables. Using the estimated parameters, the model predictions and observations were in agreement. Model forecasts indicate 15 380–15 660 g C/m2 stored in Duke Forest by 2012 (a 27% increase since 2004). Parameter uncertainties decreased as data were sequentially assimilated into the model using the EnKF. Uncertainties in forecast carbon sinks increased over time for the long-term carbon pools (woody biomass, structure litter, slow and passive SOM) but remained constant over time for the short-term carbon pools (foliage, fine root, metabolic litter, and microbial carbon). Overall, EnKF can effectively assimilate multiple data sets into an ecosystem model to constrain parameters, forecast dynamics of state variables, and evaluate uncertainty.",
				"libraryCatalog": "esajournals.org (Atypon)",
				"title": "Assimilation of multiple data sets with the ensemble Kalman filter to improve forecasts of forest carbon dynamics",
				"date": "February 22, 2011",
				"publicationTitle": "Ecological Applications",
				"pages": "1461-1473",
				"volume": "21"
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.esajournals.org/toc/ecap/21/5",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://pubs.rsna.org/toc/radiographics/toc/33/7",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://pubs.rsna.org/doi/abs/10.1148/rg.337125073",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"lastName": "Stojanovska",
						"firstName": "Jadranka",
						"creatorType": "author"
					},
					{
						"lastName": "Garg",
						"firstName": "Anubhav",
						"creatorType": "author"
					},
					{
						"lastName": "Patel",
						"firstName": "Smita",
						"creatorType": "author"
					},
					{
						"lastName": "Melville",
						"firstName": "David M.",
						"creatorType": "author"
					},
					{
						"lastName": "Kazerooni",
						"firstName": "Ella A.",
						"creatorType": "author"
					},
					{
						"lastName": "Mueller",
						"firstName": "Gisela C.",
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
						"title": "Snapshot",
						"mimeType": "text/html"
					}
				],
				"DOI": "10.1148/rg.337125073",
				"journalAbbreviation": "RadioGraphics",
				"issue": "7",
				"ISSN": "0271-5333",
				"url": "http://pubs.rsna.org/doi/abs/10.1148/rg.337125073",
				"abstractNote": "Sudden cardiac death is defined as death from unexpected circulatory arrest—usually a result of cardiac arrhythmia—that occurs within 1 hour of the onset of symptoms. Proper and timely identification of individuals at risk for sudden cardiac death and the diagnosis of its predisposing conditions are vital. A careful history and physical examination, in addition to electrocardiography and cardiac imaging, are essential to identify conditions associated with sudden cardiac death. Among young adults (18–35 years), sudden cardiac death most commonly results from a previously undiagnosed congenital or hereditary condition, such as coronary artery anomalies and inherited cardiomyopathies (eg, hypertrophic cardiomyopathy, arrhythmogenic right ventricular cardiomyopathy [ARVC], dilated cardiomyopathy, and noncompaction cardiomyopathy). Overall, the most common causes of sudden cardiac death in young adults are, in descending order of frequency, hypertrophic cardiomyopathy, coronary artery anomalies with an interarterial or intramural course, and ARVC. Often, sudden cardiac death is precipitated by ventricular tachycardia or fibrillation and may be prevented with an implantable cardioverter defibrillator (ICD). Risk stratification to determine the need for an ICD is challenging and involves imaging, particularly echocardiography and cardiac magnetic resonance (MR) imaging. Coronary artery anomalies, a diverse group of congenital disorders with a variable manifestation, may be depicted at coronary computed tomographic angiography or MR angiography. A thorough understanding of clinical risk stratification, imaging features, and complementary diagnostic tools for the evaluation of cardiac disorders that may lead to sudden cardiac death is essential to effectively use imaging to guide diagnosis and therapy.",
				"libraryCatalog": "pubs.rsna.org (Atypon)",
				"shortTitle": "Congenital and Hereditary Causes of Sudden Cardiac Death in Young Adults",
				"title": "Congenital and Hereditary Causes of Sudden Cardiac Death in Young Adults: Diagnosis, Differential Diagnosis, and Risk Stratification",
				"date": "November 1, 2013",
				"publicationTitle": "RadioGraphics",
				"pages": "1977-2001",
				"volume": "33"
			}
		]
	},
	{
		"type": "web",
		"url": "http://pubs.rsna.org/action/doSearch?SeriesKey=&AllField=cardiac",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://epubs.siam.org/doi/book/10.1137/1.9780898718553",
		"items": [
			{
				"itemType": "book",
				"creators": [
					{
						"lastName": "Hubert",
						"firstName": "L.",
						"creatorType": "author"
					},
					{
						"lastName": "Arabie",
						"firstName": "P.",
						"creatorType": "author"
					},
					{
						"lastName": "Meulman",
						"firstName": "J.",
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
						"title": "Snapshot",
						"mimeType": "text/html"
					}
				],
				"url": "http://epubs.siam.org/doi/book/10.1137/1.9780898718553",
				"numPages": "172",
				"series": "Discrete Mathematics and Applications",
				"ISBN": "978-0-89871-478-4",
				"abstractNote": "The first part of this monograph's title, Combinatorial Data Analysis (CDA), refers to a wide class of methods for the study of relevant data sets in which the arrangement of a collection of objects is absolutely central. Characteristically, CDA is involved either with the identification of arrangements that are optimal for a specific representation of a given data set (usually operationalized with some specific loss or merit function that guides a combinatorial search defined over a domain constructed from the constraints imposed by the particular representation selected), or with the determination in a confirmatory manner of whether a specific object arrangement given a priori reflects the observed data. As the second part of the title, Optimization by Dynamic Programming, suggests, the sole focus of this monograph is on the identification of arrangements; it is then restricted further, to where the combinatorial search is carried out by a recursive optimization process based on the general principles of dynamic programming. For an introduction to confirmatory CDA without any type of optimization component, the reader is referred to the monograph by Hubert (1987). For the use of combinatorial optimization strategies other than dynamic programming for some (clustering) problems in CDA, the recent comprehensive review by Hansen and Jaumard (1997) provides a particularly good introduction.",
				"libraryCatalog": "epubs.siam.org (Atypon)",
				"date": "January 1, 2001",
				"title": "Combinatorial Data Analysis",
				"publisher": "Society for Industrial and Applied Mathematics"
			}
		]
	},
	{
		"type": "web",
		"url": "http://epubs.siam.org/doi/abs/10.1137/1.9780898718553.ch6",
		"items": [
			{
				"itemType": "bookSection",
				"creators": [],
				"notes": [],
				"tags": [],
				"seeAlso": [],
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
				"numberOfVolumes": "0",
				"url": "http://epubs.siam.org/doi/abs/10.1137/1.9780898718553.ch6",
				"bookTitle": "Combinatorial Data Analysis",
				"series": "Discrete Mathematics and Applications",
				"ISBN": "978-0-89871-478-4",
				"abstractNote": "6.1 Introduction There are a variety of extensions of the topics introduced in the previous chapters that could be pursued, several of which have been mentioned earlier along with a comment that they would not be developed in any detail within this monograph. Among some of these possibilities are: (a) the development of a mechanism for generating all the optimal solutions for a specific optimization task when multiple optima may be present, not just one representative exemplar; (b) the incorporation of other loss or merit measures within the various sequencing and partitioning contexts discussed; (c) extensions to the analysis of arbitrary t-mode data, with possible (order) restrictions on some modes but not others, or to a framework in which proximity is given on more than just a pair of objects, e.g., proximity could be defined for all distinct object triples (see Daws (1996)); (d) the generalization of the task of constructing optimal ordered partitions to a two- or higher-mode context that may be hierarchical and/or have various types of order or precedence constraints imposed; and (e) the extension of object ordering constraints when they are to be imposed (e.g., in various partitioning and two-mode sequencing tasks) to the use of circular object orders, where optimal subsets or ordered sequences must now be consistent with respect to a circular contiguity structure.",
				"libraryCatalog": "epubs.siam.org (Atypon)",
				"date": "January 1, 2001",
				"pages": "103-114",
				"title": "6. Extensions and Generalizations",
				"publisher": "Society for Industrial and Applied Mathematics"
			}
		]
	},
	{
		"type": "web",
		"url": "http://online.liebertpub.com/doi/abs/10.1089/cmb.2009.0238",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"lastName": "Boisvert",
						"firstName": "Sébastien",
						"creatorType": "author"
					},
					{
						"lastName": "Laviolette",
						"firstName": "François",
						"creatorType": "author"
					},
					{
						"lastName": "Corbeil",
						"firstName": "Jacques",
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
						"title": "Snapshot",
						"mimeType": "text/html"
					}
				],
				"DOI": "10.1089/cmb.2009.0238",
				"journalAbbreviation": "Journal of Computational Biology",
				"issue": "11",
				"ISSN": "1066-5277",
				"url": "http://online.liebertpub.com/doi/abs/10.1089/cmb.2009.0238",
				"abstractNote": "An accurate genome sequence of a desired species is now a pre-requisite for genome research. An important step in obtaining a high-quality genome sequence is to correctly assemble short reads into longer sequences accurately representing contiguous genomic regions. Current sequencing technologies continue to offer increases in throughput, and corresponding reductions in cost and time. Unfortunately, the benefit of obtaining a large number of reads is complicated by sequencing errors, with different biases being observed with each platform. Although software are available to assemble reads for each individual system, no procedure has been proposed for high-quality simultaneous assembly based on reads from a mix of different technologies. In this paper, we describe a parallel short-read assembler, called Ray, which has been developed to assemble reads obtained from a combination of sequencing platforms. We compared its performance to other assemblers on simulated and real datasets. We used a combination of Roche/454 and Illumina reads to assemble three different genomes. We showed that mixing sequencing technologies systematically reduces the number of contigs and the number of errors. Because of its open nature, this new tool will hopefully serve as a basis to develop an assembler that can be of universal utilization (availability: http://deNovoAssembler.sf.Net/). For online Supplementary Material, see www.liebertonline.com.",
				"libraryCatalog": "online.liebertpub.com (Atypon)",
				"shortTitle": "Ray",
				"title": "Ray: Simultaneous Assembly of Reads from a Mix of High-Throughput Sequencing Technologies",
				"date": "October 20, 2010",
				"publicationTitle": "Journal of Computational Biology",
				"pages": "1519-1533",
				"volume": "17"
			}
		]
	},
	{
		"type": "web",
		"url": "http://journals.jps.jp/toc/jpsj/2014/83/6",
		"items": "multiple"
	}
]
/** END TEST CASES **/