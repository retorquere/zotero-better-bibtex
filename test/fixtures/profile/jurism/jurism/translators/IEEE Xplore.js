{
	"translatorID": "92d4ed84-8d0-4d3c-941f-d4b9124cfbb",
	"label": "IEEE Xplore",
	"creator": "Simon Kornblith, Michael Berkowitz, Bastian Koenings, and Avram Lyon",
	"target": "^https?://([^/]+\\.)?ieeexplore\\.ieee\\.org/([^#]+[&?]arnumber=\\d+|(abstract/)?document/|search/(searchresult|selected)\\.jsp|xpl/(mostRecentIssue|tocresult)\\.jsp\\?|xpl/conhome/\\d+/proceeding)",
	"minVersion": "4.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2019-10-06 21:42:54"
}

function detectWeb(doc, url) {
	if (doc.defaultView !== doc.defaultView.top) return false;
	
	if (/[?&]arnumber=(\d+)/i.test(url) || /\/document\/\d+/i.test(url)) {
		var firstBreadcrumb = ZU.xpathText(doc, '(//div[contains(@class, "breadcrumbs")]//a)[1]');
		if (firstBreadcrumb == "Conferences") {
			return "conferencePaper";
		}
		return "journalArticle";
	}
	
	// Issue page
	var results = doc.getElementById('results-blk');
	if (results) {
		return getSearchResults(doc, true) ? "multiple" : false;
	}
	
	// Search results
	if (url.includes("/search/searchresult.jsp")) {
		return "multiple";
	}
	
	// conference list results
	if (url.includes("xpl/conhome") && url.includes("proceeding")) {
		return "multiple";
	}

	// more generic method for other cases (is this still needed?)
	/*
	var scope = ZU.xpath(doc, '//div[contains(@class, "ng-scope")]')[0];
	if (!scope) {
		Zotero.debug("No scope");
		return;
	}
	
	Z.monitorDOMChanges(scope, {childList: true});

	if (getSearchResults(doc, true)) {
		return "multiple";
	}
	*/
	return false;
}

function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = ZU.xpath(doc, '//*[contains(@class, "article-list") or contains(@class, "List-results-items")]//h2/a|//*[@id="results-blk"]//*[@class="art-abs-url"]');

	for (var i = 0; i < rows.length; i++) {
		var href = rows[i].href;
		var title = ZU.trimInternal(rows[i].textContent);
		if (!href || !title) continue;
		if (checkOnly) return true;
		found = true;
		items[fixUrl(href)] = title;
	}
	return found ? items : false;
}

// Some pages don't show the metadata we need (http://forums.zotero.org/discussion/16283)
// No data: http://ieeexplore.ieee.org/search/srchabstract.jsp?tp=&arnumber=1397982
// No data: http://ieeexplore.ieee.org/stamp/stamp.jsp?tp=&arnumber=1397982
// Data: http://ieeexplore.ieee.org/xpls/abs_all.jsp?arnumber=1397982
// Also address issue of saving from PDF itself, I hope
// URL like http://ieeexplore.ieee.org/ielx4/78/2655/00080767.pdf?tp=&arnumber=80767&isnumber=2655
// Or: http://ieeexplore.ieee.org/stamp/stamp.jsp?tp=&arnumber=1575188&tag=1
function fixUrl(url) {
	var arnumber = url.match(/arnumber=(\d+)/);
	if (arnumber) {
		return url.replace(/\/(?:search|stamp|ielx[45])\/.*$/, "/xpls/abs_all.jsp?arnumber=" + arnumber[1]);
	}
	else {
		return url;
	}
}

function doWeb(doc, url) {
	if (detectWeb(doc, url) == "multiple") {
		Zotero.selectItems(getSearchResults(doc), function (items) {
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
	else if (url.includes("/search/") || url.includes("/stamp/") || url.includes("/ielx4/") || url.includes("/ielx5/")) {
		ZU.processDocuments([fixUrl(url)], scrape);
	}
	else {
		scrape(doc, url);
	}
}

function scrape(doc, url) {
	var arnumber = (url.match(/arnumber=(\d+)/) || url.match(/\/document\/(\d+)/))[1];
	var pdf = "/stamp/stamp.jsp?tp=&arnumber=" + arnumber;
	// Z.debug("arNumber = " + arnumber);
	
	var script = ZU.xpathText(doc, '//script[@type="text/javascript" and contains(., "global.document.metadata")]');
	if (script) {
		var dataRaw = script.split("global.document.metadata")[1]
.replace(/^=/, '').replace(/};[\s\S]*$/m, '}');
		try {
			var data = JSON.parse(dataRaw);
		}
		catch (e) {
			Z.debug("Error parsing JSON data:");
			Z.debug(e);
		}
	}
	
	
	var post = "recordIds=" + arnumber + "&fromPage=&citations-format=citation-abstract&download-format=download-bibtex";
	ZU.doPost('/xpl/downloadCitations', post, function (text) {
		text = ZU.unescapeHTML(text.replace(/(&[^\s;]+) and/g, '$1;'));
		// remove empty tag - we can take this out once empty tags are ignored
		text = text.replace(/(keywords=\{.+);\}/, "$1}");
		var earlyaccess = false;
		if (text.search(/^@null/) != -1) {
			earlyaccess = true;
			text = text.replace(/^@null/, "@article");
		}
		var translator = Zotero.loadTranslator("import");
		// Calling the BibTeX translator
		translator.setTranslator("9cb70025-a888-4a29-a210-93ec52da40d4");
		translator.setString(text);
		translator.setHandler("itemDone", function (obj, item) {
			item.notes = [];
			var res;
			// Rearrange titles, per http://forums.zotero.org/discussion/8056
			// If something has a comma or a period, and the text after comma ends with
			// "of", "IEEE", or the like, then we switch the parts. Prefer periods.
			if (item.publicationTitle.includes(".")) {
				res = item.publicationTitle.trim().match(/^(.*)\.(.*(?:of|on|IEE|IEEE|IET|IRE))$/);
			}
			else {
				res = item.publicationTitle.trim().match(/^(.*),(.*(?:of|on|IEE|IEEE|IET|IRE))$/);
			}
			if (res) {
				item.publicationTitle = res[2] + " " + res[1];
			}
			item.proceedingsTitle = item.conferenceName = item.publicationTitle;
			if (earlyaccess) {
				item.volume = "Early Access Online";
				item.issue = "";
				item.pages = "";
			}
			
			if (data && data.authors && data.authors.length == item.creators.length) {
				item.creators = [];
				for (let author of data.authors) {
					item.creators.push({
						firstName: author.firstName,
						lastName: author.lastName,
						creatorType: "author"
					});
				}
			}
			
			if (!item.ISSN && data && data.issn) {
				item.ISSN = data.issn.map(el => el.value).join(", ");
			}
			if (item.ISSN && !ZU.fieldIsValidForType('ISSN', item.itemType)) {
				item.extra = "ISSN: " + item.ISSN;
			}
			
			item.attachments.push({
				document: doc,
				title: "IEEE Xplore Abstract Record"
			});
			
			if (pdf) {
				ZU.doGet(pdf, function (src) {
					// Either the PDF is embedded in the page, or (e.g. for iOS)
					// the page has a redirect to the full-page PDF
					var m = /<i?frame src="([^"]+\.pdf\b[^"]*)"|<meta HTTP-EQUIV="REFRESH" content="0; url=([^\s"]+\.pdf\b[^\s"]*)"/.exec(src);
					var pdfUrl = m && (m[1] || m[2]);
					if (pdfUrl) {
						item.attachments.unshift({
							url: pdfUrl,
							title: "IEEE Xplore Full Text PDF",
							mimeType: "application/pdf"
						});
					}
					item.complete();
				}, null);
			}
			else {
				item.complete();
			}
		});

		translator.getTranslatorObject(function (trans) {
			trans.setKeywordSplitOnSpace(false);
			trans.setKeywordDelimRe('\\s*;\\s*', '');
			trans.doImport();
		});
	});
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://ieeexplore.ieee.org/document/4607247/?tp=&arnumber=4607247&refinements%3D4294967131%26openedRefinements%3D*%26filter%3DAND%28NOT%284283010803%29%29%26searchField%3DSearch+All%26queryText%3Dturing",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Fuzzy Turing Machines: Variants and Universality",
				"creators": [
					{
						"firstName": "Yongming",
						"lastName": "Li",
						"creatorType": "author"
					}
				],
				"date": "December 2008",
				"DOI": "10.1109/TFUZZ.2008.2004990",
				"ISSN": "1063-6706, 1941-0034",
				"abstractNote": "In this paper, we study some variants of fuzzy Turing machines (FTMs) and universal FTM. First, we give several formulations of FTMs, including, in particular, deterministic FTMs (DFTMs) and nondeterministic FTMs (NFTMs). We then show that DFTMs and NFTMs are not equivalent as far as the power of recognizing fuzzy languages is concerned. This contrasts sharply with classical TMs. Second, we show that there is no universal FTM that can exactly simulate any FTM on it. But if the membership degrees of fuzzy sets are restricted to a fixed finite subset A of [0,1], such a universal machine exists. We also show that a universal FTM exists in some approximate sense. This means, for any prescribed accuracy, that we can construct a universal machine that simulates any FTM with the given accuracy. Finally, we introduce the notions of fuzzy polynomial time-bounded computation and nondeterministic fuzzy polynomial time-bounded computation, and investigate their connections with polynomial time-bounded computation and nondeterministic polynomial time-bounded computation.",
				"issue": "6",
				"itemID": "4607247",
				"libraryCatalog": "IEEE Xplore",
				"pages": "1491-1502",
				"publicationTitle": "IEEE Transactions on Fuzzy Systems",
				"shortTitle": "Fuzzy Turing Machines",
				"volume": "16",
				"attachments": [
					{
						"title": "IEEE Xplore Abstract Record"
					}
				],
				"tags": [
					{
						"tag": "Computational complexity"
					},
					{
						"tag": "Computational modeling"
					},
					{
						"tag": "Computer science"
					},
					{
						"tag": "Deterministic fuzzy Turing machine (DFTM)"
					},
					{
						"tag": "Fuzzy sets"
					},
					{
						"tag": "Hardware"
					},
					{
						"tag": "Intelligent control"
					},
					{
						"tag": "Microcomputers"
					},
					{
						"tag": "Polynomials"
					},
					{
						"tag": "Turing machines"
					},
					{
						"tag": "Turing machines"
					},
					{
						"tag": "computational complexity"
					},
					{
						"tag": "deterministic automata"
					},
					{
						"tag": "deterministic fuzzy Turing machines"
					},
					{
						"tag": "fixed finite subset"
					},
					{
						"tag": "fuzzy computational complexity"
					},
					{
						"tag": "fuzzy grammar"
					},
					{
						"tag": "fuzzy languages"
					},
					{
						"tag": "fuzzy polynomial time-bounded computation"
					},
					{
						"tag": "fuzzy recursive language"
					},
					{
						"tag": "fuzzy recursively enumerable (f.r.e.) language"
					},
					{
						"tag": "fuzzy set theory"
					},
					{
						"tag": "fuzzy sets"
					},
					{
						"tag": "nondeterministic fuzzy Turing machine (NFTM)"
					},
					{
						"tag": "nondeterministic fuzzy Turing machines"
					},
					{
						"tag": "nondeterministic polynomial time-bounded computation"
					},
					{
						"tag": "universal fuzzy Turing machine (FTM)"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://ieeexplore.ieee.org/document/6221978/?arnumber=6221978",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Graph Matching for Adaptation in Remote Sensing",
				"creators": [
					{
						"firstName": "Devis",
						"lastName": "Tuia",
						"creatorType": "author"
					},
					{
						"firstName": "Jordi",
						"lastName": "Munoz-Mari",
						"creatorType": "author"
					},
					{
						"firstName": "Luis",
						"lastName": "Gomez-Chova",
						"creatorType": "author"
					},
					{
						"firstName": "Jesus",
						"lastName": "Malo",
						"creatorType": "author"
					}
				],
				"date": "January 2013",
				"DOI": "10.1109/TGRS.2012.2200045",
				"ISSN": "0196-2892, 1558-0644",
				"abstractNote": "We present an adaptation algorithm focused on the description of the data changes under different acquisition conditions. When considering a source and a destination domain, the adaptation is carried out by transforming one data set to the other using an appropriate nonlinear deformation. The eventually nonlinear transform is based on vector quantization and graph matching. The transfer learning mapping is defined in an unsupervised manner. Once this mapping has been defined, the samples in one domain are projected onto the other, thus allowing the application of any classifier or regressor in the transformed domain. Experiments on challenging remote sensing scenarios, such as multitemporal very high resolution image classification and angular effects compensation, show the validity of the proposed method to match-related domains and enhance the application of cross-domains image processing techniques.",
				"issue": "1",
				"itemID": "6221978",
				"libraryCatalog": "IEEE Xplore",
				"pages": "329-341",
				"publicationTitle": "IEEE Transactions on Geoscience and Remote Sensing",
				"volume": "51",
				"attachments": [
					{
						"title": "IEEE Xplore Full Text PDF",
						"mimeType": "application/pdf"
					},
					{
						"title": "IEEE Xplore Abstract Record"
					}
				],
				"tags": [
					{
						"tag": "Adaptation models"
					},
					{
						"tag": "Domain adaptation"
					},
					{
						"tag": "Entropy"
					},
					{
						"tag": "Manifolds"
					},
					{
						"tag": "Remote sensing"
					},
					{
						"tag": "Support vector machines"
					},
					{
						"tag": "Transforms"
					},
					{
						"tag": "Vector quantization"
					},
					{
						"tag": "adaptation algorithm"
					},
					{
						"tag": "angular effects"
					},
					{
						"tag": "cross-domain image processing techniques"
					},
					{
						"tag": "data acquisition conditions"
					},
					{
						"tag": "destination domain"
					},
					{
						"tag": "geophysical image processing"
					},
					{
						"tag": "geophysical techniques"
					},
					{
						"tag": "graph matching method"
					},
					{
						"tag": "image classification"
					},
					{
						"tag": "image matching"
					},
					{
						"tag": "image resolution"
					},
					{
						"tag": "model portability"
					},
					{
						"tag": "multitemporal classification"
					},
					{
						"tag": "multitemporal very high resolution image classification"
					},
					{
						"tag": "nonlinear deformation"
					},
					{
						"tag": "nonlinear transform"
					},
					{
						"tag": "remote sensing"
					},
					{
						"tag": "remote sensing"
					},
					{
						"tag": "source domain"
					},
					{
						"tag": "support vector machine (SVM)"
					},
					{
						"tag": "transfer learning"
					},
					{
						"tag": "transfer learning mapping"
					},
					{
						"tag": "vector quantization"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://ieeexplore.ieee.org/search/searchresult.jsp?queryText%3Dlabor&refinements=4291944246&pageNumber=1&resultAction=REFINE",
		"defer": true,
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://ieeexplore.ieee.org/xpl/conhome/7048058/proceeding",
		"defer": true,
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://ieeexplore.ieee.org/xpl/mostRecentIssue.jsp?punumber=6221021",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://ieeexplore.ieee.org/search/searchresult.jsp?queryText=Wind%20Farms&newsearch=true",
		"defer": true,
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://ieeexplore.ieee.org/document/1397982/?tp=&arnumber=1397982",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Analysis and circuit modeling of waveguide-separated absorption charge multiplication-avalanche photodetector (WG-SACM-APD)",
				"creators": [
					{
						"firstName": "Y.M.",
						"lastName": "El-Batawy",
						"creatorType": "author"
					},
					{
						"firstName": "M.J.",
						"lastName": "Deen",
						"creatorType": "author"
					}
				],
				"date": "March 2005",
				"DOI": "10.1109/TED.2005.843884",
				"ISSN": "0018-9383, 1557-9646",
				"abstractNote": "Waveguide photodetectors are considered leading candidates to overcome the bandwidth efficiency tradeoff of conventional photodetectors. In this paper, a theoretical physics-based model of the waveguide separated absorption charge multiplication avalanche photodetector (WG-SACM-APD) is presented. Both time and frequency modeling for this photodetector are developed and simulated results for different thicknesses of the absorption and multiplication layers and for different areas of the photodetector are presented. These simulations provide guidelines for the design of these high-performance photodiodes. In addition, a circuit model of the photodetector is presented in which the photodetector is a lumped circuit element so that circuit simulation of the entire photoreceiver is now feasible. The parasitics of the photodetector are included in the circuit model and it is shown how these parasitics degrade the photodetectors performance and how they can be partially compensated by an external inductor in series with the load resistor. The results obtained from the circuit model of the WG-SACM-APD are compared with published experimental results and good agreement is obtained. This circuit modeling can easily be applied to any WG-APD structure. The gain-bandwidth characteristic of WG-SACM-APD is studied for different areas and thicknesses of both the absorption and the multiplication layers. The dependence of the performance of the photodetector on the dimensions, the material parameters and the multiplication gain are also investigated.",
				"issue": "3",
				"itemID": "1397982",
				"libraryCatalog": "IEEE Xplore",
				"pages": "335-344",
				"publicationTitle": "IEEE Transactions on Electron Devices",
				"volume": "52",
				"attachments": [
					{
						"title": "IEEE Xplore Full Text PDF",
						"mimeType": "application/pdf"
					},
					{
						"title": "IEEE Xplore Abstract Record"
					}
				],
				"tags": [
					{
						"tag": "Avalanche photodetectors"
					},
					{
						"tag": "Avalanche photodiodes"
					},
					{
						"tag": "Linear circuits"
					},
					{
						"tag": "Optical receivers"
					},
					{
						"tag": "Photodetectors"
					},
					{
						"tag": "SACM photodetectors"
					},
					{
						"tag": "SACM photodetectors"
					},
					{
						"tag": "Semiconductor device modeling"
					},
					{
						"tag": "WG-SACM-APD circuit modeling"
					},
					{
						"tag": "absorption layers"
					},
					{
						"tag": "avalanche photodiodes"
					},
					{
						"tag": "circuit model of photodetectors"
					},
					{
						"tag": "circuit modeling"
					},
					{
						"tag": "circuit simulation"
					},
					{
						"tag": "circuit simulation"
					},
					{
						"tag": "external inductor"
					},
					{
						"tag": "frequency modeling"
					},
					{
						"tag": "high-performance photodiodes"
					},
					{
						"tag": "high-speed photodetectors"
					},
					{
						"tag": "high-speed photodetectors"
					},
					{
						"tag": "load resistor"
					},
					{
						"tag": "lumped circuit element"
					},
					{
						"tag": "lumped parameter networks"
					},
					{
						"tag": "multiplication layers"
					},
					{
						"tag": "optical receivers"
					},
					{
						"tag": "parasitics effects"
					},
					{
						"tag": "photodetector analysis"
					},
					{
						"tag": "photodetectors"
					},
					{
						"tag": "photodetectors"
					},
					{
						"tag": "photoreceiver"
					},
					{
						"tag": "physics-based modeling"
					},
					{
						"tag": "semiconductor device models"
					},
					{
						"tag": "theoretical physics-based model"
					},
					{
						"tag": "time modeling"
					},
					{
						"tag": "waveguide photodetectors"
					},
					{
						"tag": "waveguide photodetectors"
					},
					{
						"tag": "waveguide separated absorption charge multiplication avalanche photodetector"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://ieeexplore.ieee.org/document/6919256/?arnumber=6919256&punumber%3D6287639",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Information Security in Big Data: Privacy and Data Mining",
				"creators": [
					{
						"firstName": "Lei",
						"lastName": "Xu",
						"creatorType": "author"
					},
					{
						"firstName": "Chunxiao",
						"lastName": "Jiang",
						"creatorType": "author"
					},
					{
						"firstName": "Jian",
						"lastName": "Wang",
						"creatorType": "author"
					},
					{
						"firstName": "Jian",
						"lastName": "Yuan",
						"creatorType": "author"
					},
					{
						"firstName": "Yong",
						"lastName": "Ren",
						"creatorType": "author"
					}
				],
				"date": "2014",
				"DOI": "10.1109/ACCESS.2014.2362522",
				"ISSN": "2169-3536",
				"abstractNote": "The growing popularity and development of data mining technologies bring serious threat to the security of individual,'s sensitive information. An emerging research topic in data mining, known as privacy-preserving data mining (PPDM), has been extensively studied in recent years. The basic idea of PPDM is to modify the data in such a way so as to perform data mining algorithms effectively without compromising the security of sensitive information contained in the data. Current studies of PPDM mainly focus on how to reduce the privacy risk brought by data mining operations, while in fact, unwanted disclosure of sensitive information may also happen in the process of data collecting, data publishing, and information (i.e., the data mining results) delivering. In this paper, we view the privacy issues related to data mining from a wider perspective and investigate various approaches that can help to protect sensitive information. In particular, we identify four different types of users involved in data mining applications, namely, data provider, data collector, data miner, and decision maker. For each type of user, we discuss his privacy concerns and the methods that can be adopted to protect sensitive information. We briefly introduce the basics of related research topics, review state-of-the-art approaches, and present some preliminary thoughts on future research directions. Besides exploring the privacy-preserving approaches for each type of user, we also review the game theoretical approaches, which are proposed for analyzing the interactions among different users in a data mining scenario, each of whom has his own valuation on the sensitive information. By differentiating the responsibilities of different users with respect to security of sensitive information, we would like to provide some useful insights into the study of PPDM.",
				"itemID": "6919256",
				"libraryCatalog": "IEEE Xplore",
				"pages": "1149-1176",
				"publicationTitle": "IEEE Access",
				"shortTitle": "Information Security in Big Data",
				"volume": "2",
				"attachments": [
					{
						"title": "IEEE Xplore Full Text PDF",
						"mimeType": "application/pdf"
					},
					{
						"title": "IEEE Xplore Abstract Record"
					}
				],
				"tags": [
					{
						"tag": "Algorithm design and analysis"
					},
					{
						"tag": "Big Data"
					},
					{
						"tag": "Big Data"
					},
					{
						"tag": "Computer security"
					},
					{
						"tag": "Data mining"
					},
					{
						"tag": "Data mining"
					},
					{
						"tag": "Data privacy"
					},
					{
						"tag": "Game theory"
					},
					{
						"tag": "PPDM"
					},
					{
						"tag": "Privacy"
					},
					{
						"tag": "Tracking"
					},
					{
						"tag": "anonymization"
					},
					{
						"tag": "anonymization"
					},
					{
						"tag": "anti-tracking"
					},
					{
						"tag": "anti-tracking"
					},
					{
						"tag": "data acquisition"
					},
					{
						"tag": "data collector"
					},
					{
						"tag": "data miner"
					},
					{
						"tag": "data mining"
					},
					{
						"tag": "data mining"
					},
					{
						"tag": "data protection"
					},
					{
						"tag": "data provider"
					},
					{
						"tag": "data publishing"
					},
					{
						"tag": "decision maker"
					},
					{
						"tag": "game theory"
					},
					{
						"tag": "game theory"
					},
					{
						"tag": "game theory"
					},
					{
						"tag": "game theory"
					},
					{
						"tag": "information protection"
					},
					{
						"tag": "information security"
					},
					{
						"tag": "privacy auction"
					},
					{
						"tag": "privacy auction"
					},
					{
						"tag": "privacy preserving data mining"
					},
					{
						"tag": "privacy-preserving data mining"
					},
					{
						"tag": "privacypreserving data mining"
					},
					{
						"tag": "provenance"
					},
					{
						"tag": "provenance"
					},
					{
						"tag": "security of data"
					},
					{
						"tag": "sensitive information"
					},
					{
						"tag": "sensitive information"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://ieeexplore.ieee.org/document/80767/",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "An eigenanalysis interference canceler",
				"creators": [
					{
						"firstName": "A.M.",
						"lastName": "Haimovich",
						"creatorType": "author"
					},
					{
						"firstName": "Y.",
						"lastName": "Bar-Ness",
						"creatorType": "author"
					}
				],
				"date": "January 1991",
				"DOI": "10.1109/78.80767",
				"ISSN": "1053-587X, 1941-0476",
				"abstractNote": "Eigenanalysis methods are applied to interference cancellation problems. While with common array processing methods the cancellation is effected by global optimization procedures that include the interferences and the background noise, the proposed technique focuses on the interferences only, resulting in superior cancellation performance. Furthermore, the method achieves full effectiveness even for short observation times, when the number of samples used for processing is of the the order of the number of interferences. Adaptive implementation is obtained with a simple, fast converging algorithm.<>",
				"issue": "1",
				"itemID": "80767",
				"libraryCatalog": "IEEE Xplore",
				"pages": "76-84",
				"publicationTitle": "IEEE Transactions on Signal Processing",
				"volume": "39",
				"attachments": [
					{
						"title": "IEEE Xplore Full Text PDF",
						"mimeType": "application/pdf"
					},
					{
						"title": "IEEE Xplore Abstract Record"
					}
				],
				"tags": [
					{
						"tag": "Array signal processing"
					},
					{
						"tag": "Background noise"
					},
					{
						"tag": "Direction of arrival estimation"
					},
					{
						"tag": "Interference cancellation"
					},
					{
						"tag": "Jamming"
					},
					{
						"tag": "Noise cancellation"
					},
					{
						"tag": "Optimization methods"
					},
					{
						"tag": "Sensor arrays"
					},
					{
						"tag": "Signal to noise ratio"
					},
					{
						"tag": "Steady-state"
					},
					{
						"tag": "adaptive filters"
					},
					{
						"tag": "adaptive implementation"
					},
					{
						"tag": "array processing"
					},
					{
						"tag": "eigenanalysis methods"
					},
					{
						"tag": "eigenvalues and eigenfunctions"
					},
					{
						"tag": "fast converging algorithm"
					},
					{
						"tag": "filtering and prediction theory"
					},
					{
						"tag": "interference cancellation"
					},
					{
						"tag": "interference suppression"
					},
					{
						"tag": "signal processing"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://ieeexplore.ieee.org/abstract/document/7696113/?reload=true",
		"items": [
			{
				"itemType": "conferencePaper",
				"title": "3D flexible antenna realization process using liquid metal and additive technology",
				"creators": [
					{
						"firstName": "Mathieu",
						"lastName": "Cosker",
						"creatorType": "author"
					},
					{
						"firstName": "Fabien",
						"lastName": "Ferrero",
						"creatorType": "author"
					},
					{
						"firstName": "Leonardo",
						"lastName": "Lizzi",
						"creatorType": "author"
					},
					{
						"firstName": "Robert",
						"lastName": "Staraj",
						"creatorType": "author"
					},
					{
						"firstName": "Jean-Marc",
						"lastName": "Ribero",
						"creatorType": "author"
					}
				],
				"date": "June 2016",
				"DOI": "10.1109/APS.2016.7696113",
				"abstractNote": "This paper presents a method to design 3D flexible antennas using liquid metal and additive technology (3D printer based on Fused Deposition Modeling (FDM) technology). The fabricated antennas present flexible properties. The design method is first presented and validated using the example of a simple inverted F antenna (IFA) in Ultra High Frequency (UHF) band. The design, the fabrication and the obtained measured results are discussed.",
				"conferenceName": "2016 IEEE International Symposium on Antennas and Propagation (APSURSI)",
				"extra": "ISSN: 1947-1491",
				"itemID": "7696113",
				"libraryCatalog": "IEEE Xplore",
				"pages": "809-810",
				"proceedingsTitle": "2016 IEEE International Symposium on Antennas and Propagation (APSURSI)",
				"attachments": [
					{
						"title": "IEEE Xplore Full Text PDF",
						"mimeType": "application/pdf"
					},
					{
						"title": "IEEE Xplore Abstract Record"
					}
				],
				"tags": [
					{
						"tag": "3D flexible antenna design"
					},
					{
						"tag": "3D flexible antenna realization process"
					},
					{
						"tag": "3D printer"
					},
					{
						"tag": "3D printer"
					},
					{
						"tag": "Antenna measurements"
					},
					{
						"tag": "Antenna radiation patterns"
					},
					{
						"tag": "FDM technology"
					},
					{
						"tag": "IFA"
					},
					{
						"tag": "IFA antenna"
					},
					{
						"tag": "Liquids"
					},
					{
						"tag": "Metals"
					},
					{
						"tag": "Printers"
					},
					{
						"tag": "Three-dimensional displays"
					},
					{
						"tag": "UHF antennas"
					},
					{
						"tag": "UHF band"
					},
					{
						"tag": "additive technology"
					},
					{
						"tag": "additives"
					},
					{
						"tag": "antenna fabrication"
					},
					{
						"tag": "fused deposition modeling technology"
					},
					{
						"tag": "inverted F antenna"
					},
					{
						"tag": "liquid metal"
					},
					{
						"tag": "liquid metal and additive technology"
					},
					{
						"tag": "liquid metals"
					},
					{
						"tag": "planar inverted-F antennas"
					},
					{
						"tag": "rapid prototyping (industrial)"
					},
					{
						"tag": "ultra high frequency band"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/
