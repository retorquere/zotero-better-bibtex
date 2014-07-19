{
	"translatorID": "8d72adbc-376c-4a33-b6be-730bc235190f",
	"label": "IEEE Computer Society",
	"creator": "fasthae@gmail.com, Sebastian Karcher",
	"target": "^https?://(www[0-9]?|search[0-9]?)\\.computer\\.org/(csdl/(mags/[0-9a-z/]+|trans/[0-9a-z/]+|letters/[0-9a-z]+|proceedings/[0-9a-z/]+|doi|abs/proceedings)|search/results|portal/web/computingnow/.*content\\?)",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2013-11-18 22:27:18"
}

function detectWeb(doc, url) {
	//supports table of contents, seach results and single document pages
	if (url.indexOf("search/results") > 1) {
		return "multiple";
	} else if (url.indexOf("/csdl/mags/") > 1) {
		if (url.indexOf("index.html") != -1) return "multiple";
		else return "magazineArticle";
	} else if (url.search(/\/portal\/web\/computingnow\/.*content/) > 1) {
		if (url.indexOf("index.html") != -1) return "multiple";
		else if(ZU.xpath(doc, '//li/a[contains(text(), "BibTex") and contains(@href, ".bib")]|//div[@id="bibText-content"]').length > 0) return "magazineArticle";
	} else if (url.indexOf("/csdl/trans/") > 1) {
		if (url.indexOf("index.html") != -1) return "multiple";
		else return "journalArticle";
	} else if (url.indexOf("/csdl/proceedings/") > 1) {
		if (url.indexOf("index.html") != -1) return "multiple";
		else return "conferencePaper";
	} else if (url.indexOf("/csdl/abs/proceedings/") > 1) {
		return "multiple";
	} else if (url.indexOf("/csdl/letters/") > 1) {
		if (url.indexOf("index.html") != -1) return "multiple";
		else return "journalArticle";
	} else if (url.indexOf("/portal/web/csdl/doi/") > 1) {
		var refWork = doc.evaluate('//div[@id="refWorksText-content"]', doc, null, XPathResult.ANY_TYPE, null).iterateNext();
		refWork = refWork.textContent.substr(0, 9);
		if (refWork.indexOf("JOUR") > 1) return "journalArticle";
		else if (refWork.indexOf("MGZN") > 1) return "magazineArticle";
		else if (refWork.indexOf("CONF") > 1) return "conferencePaper";
		else return false;
	} else {
		return false;
	}

}
// move this to a var to pass to scrape
var templte;

function doWeb(doc, url) {
	if (detectWeb(doc, url) == 'multiple') {
		templte = doc.body.innerHTML;
		templte = templte.substr(templte.indexOf("linkWithParms += '&") + 19);
		templte = templte.substr(0, templte.indexOf("';"));
		var items = new Array();
		var search = 0;

		if (url.indexOf("search/results") != -1) {
			var entries = doc.evaluate('//div[@id="toc-articles-list" or @class="searchresult-data"]', doc, null, XPathResult.ANY_TYPE, null);
			var entry;
			while (entry = entries.iterateNext()) {
				var title = "";
				var titleNode = doc.evaluate('.//b', entry, null, XPathResult.ANY_TYPE, null).iterateNext();
				if (titleNode) title += titleNode.textContent;
				var linkNode = doc.evaluate('.//img[@src="images/abstract_icon.gif"]/ancestor::a', entry, null, XPathResult.ANY_TYPE, null).iterateNext();
				if (linkNode) {
					var link = linkNode.href;
					items[link] = Zotero.Utilities.trimInternal(title);
				}
			}
		} else {
			var entries = doc.evaluate('//div[@id="toc-articles-list"]', doc, null, XPathResult.ANY_TYPE, null);
			var entry, title, linkk;
			while (entry = entries.iterateNext()) {
				titleNode = doc.evaluate('./a', entry, null, XPathResult.ANY_TYPE, null).iterateNext();
				if (titleNode) {
					title = titleNode.textContent;
					//add link url of the abstract icon
					linkk = ZU.xpathText(entry, "./following-sibling::div[@id='toc-articles-img-main'][1]//td[@class='toc-description'][1]//a/@href");
					items[linkk] = Zotero.Utilities.trimInternal(title);
				}
			}
		}

		// let user select documents to scrape
		Zotero.selectItems(items, function (items) {
			if (!items) return true;
			var urls = new Array();
			for (var url in items) {
				urls.push(url);
			}
			if (search != 1) Zotero.Utilities.processDocuments(urls, scrape);
			else Zotero.Utilities.doGet(urls, scrapt);
		});
	} else {
		scrape(doc);
	}
}

function scrapt(txt) {
	throw "Not Supported yet!";
}

function scrape(doc, url) {
	var itemType = detectWeb(doc, doc.location.href);
	var abstractText = doc.evaluate('//div[@class="abs-articlesummary"]|//p[@class="abstract"]', doc, null, XPathResult.ANY_TYPE, null).iterateNext();
	if (abstractText) abstractText = Zotero.Utilities.trimInternal(abstractText.textContent);
	var keywords = new Array();
	var keywordText = doc.evaluate('//div[span="Index Terms:"]/div', doc, null, XPathResult.ANY_TYPE, null).iterateNext();
	if (keywordText) keywords = (Zotero.Utilities.trimInternal(keywordText.textContent.toLowerCase())).split(",");
	var attachments = new Array();
	var notes = new Array();
	attachments.push({
		document: doc,
		mimeType: "text/html",
		title: "IEEE Computer Snapshot"
	});

	var htmls = doc.evaluate('//img[@src="/plugins/images/digitalLibrary/dl_html_icon.gif"]/ancestor::a', doc, null, XPathResult.ANY_TYPE, null);
	var htmlDoc;

	if (htmlDoc = htmls.iterateNext()) {
		//var urlField = htmlDoc.attributes.getNamedItem("onclick").value;
		var urlField = htmlDoc.href;
		urlField = urlField.substr(urlField.indexOf('"') + 1);
		urlField = urlField.substr(0, urlField.indexOf('"'));
		if (urlField.indexOf("?") > -1) {
			urlField += '&' + templte;
		} else {
			urlField += '?' + templte;
		}
		urlField = "http://www2.computer.org" + urlField;
		var mimeTypeField = "text/html";
		var titleField = "IEEE Computer Full Text Snapshot";
		var attachment = {
			url: urlField,
			mimeType: mimeTypeField,
			title: titleField
		};
		attachments.push(attachment);
	}

	var pdfurl = ZU.xpathText(doc, '//div[@class="abs-pdf"]/a/@href')
	if (pdfurl) {
		var mimeTypeField = "application/pdf";
		var titleField = "IEEE Computer Full Text PDF";
		var attachment = {
			url: pdfurl,
			mimeType: mimeTypeField,
			title: titleField
		};
		attachments.push(attachment);
	} else {
		notes.push({
			note: "Complete PDF document was either not available or accessible. Please make sure you're logged in to the digital library to retrieve the complete PDF document."
		});
	}

	var bibtex = doc.evaluate('//div[@id="bibText-content"]', doc, null, XPathResult.ANY_TYPE, null).iterateNext();
	var bibtexlink = ZU.xpathText(doc, '//li/a[contains(text(), "BibTex") and contains(@href, ".bib")]/@href')
	if (bibtex) {
		bibtex = bibtex.textContent;
		//bibtex = bibtex.substring(bibtex.indexOf("document.write('")+16,bibtex.indexOf("');Popup.document.close();"));
		//workaround as bibtex translator obviously needs a whitespace following the first curly brace
		bibtex = Zotero.Utilities.cleanTags(bibtex);
		bibtex = Zotero.Utilities.trimInternal(bibtex);
		var translator = Zotero.loadTranslator("import");
		translator.setTranslator("9cb70025-a888-4a29-a210-93ec52da40d4");
		translator.setString(bibtex);
		translator.setHandler("itemDone", function (obj, item) {
			if (item.url) { // add http to url
				item.url = "http://" + item.url;
			}
			if (itemType) item.itemType = itemType;
			item.attachments = attachments;
			if (abstractText) item.abstractNote = abstractText;
			if (keywords) item.tags = keywords;
			if (notes) item.notes = notes;
			if (item.DOI) item.DOI = item.DOI.replace(/^.*?10\./, "10.")
			item.complete();
		});
		translator.translate();
		
	} else if (bibtexlink) {
		ZU.doGet(bibtexlink, function (text) {
			var translator = Zotero.loadTranslator("import");
			translator.setTranslator("9cb70025-a888-4a29-a210-93ec52da40d4");
			translator.setString(text);
			translator.setHandler("itemDone", function (obj, item) {
				if (item.url) { // add http to url
					item.url = "http://" + item.url;
				}
				if (itemType) item.itemType = itemType;
				item.attachments = attachments;
				if (abstractText) item.abstractNote = abstractText;
				if (keywords) item.tags = keywords;
				if (notes) item.notes = notes;
				if (item.DOI) item.DOI = item.DOI.replace(/^.*?10\./, "10.")
				item.complete();
			});
			translator.translate();
		})
	} else {
		throw "No BibTeX found!";
	}
}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.computer.org/csdl/trans/ta/2012/01/tta2012010003-abs.html",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"firstName": "Bjorn",
						"lastName": "Schuller",
						"creatorType": "author"
					},
					{
						"firstName": "Ellen",
						"lastName": "Douglas-Cowie",
						"creatorType": "author"
					},
					{
						"firstName": "Anton",
						"lastName": "Batliner",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [
					"behavioral sciences",
					"context awareness",
					"cultural differences",
					"emotion recognition",
					"human factors",
					"resource management",
					"special issues and sections",
					"speech processing",
					"system analysis and design"
				],
				"seeAlso": [],
				"attachments": [
					{
						"mimeType": "text/html",
						"title": "IEEE Computer Snapshot"
					},
					{
						"mimeType": "application/pdf",
						"title": "IEEE Computer Full Text PDF"
					}
				],
				"itemID": "10.1109/T-AFFC.2012.10",
				"title": "Guest Editorial: Special Section on Naturalistic Affect Resources for System Building and Evaluation",
				"publicationTitle": "IEEE Transactions on Affective Computing",
				"volume": "3",
				"issue": "1",
				"ISSN": "1949-3045",
				"date": "2012",
				"pages": "3-4",
				"DOI": "10.1109/T-AFFC.2012.10",
				"abstractNote": "The papers in this special section focus on the deployment of naturalistic affect resources for systems design and analysis.",
				"libraryCatalog": "IEEE Computer Society",
				"shortTitle": "Guest Editorial"
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.computer.org/csdl/letters/ca/2012/01/lca2012010001-abs.html",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"firstName": "Simha",
						"lastName": "Sethumadhavan",
						"creatorType": "author"
					},
					{
						"firstName": "Ryan",
						"lastName": "Roberts",
						"creatorType": "author"
					},
					{
						"firstName": "Yannis",
						"lastName": "Tsividis",
						"creatorType": "author"
					}
				],
				"notes": [
					{
						"note": "Complete PDF document was either not available or accessible. Please make sure you're logged in to the digital library to retrieve the complete PDF document."
					}
				],
				"tags": [
					" design studies",
					"hybrid systems"
				],
				"seeAlso": [],
				"attachments": [
					{
						"mimeType": "text/html",
						"title": "IEEE Computer Snapshot"
					}
				],
				"itemID": "10.1109/L-CA.2011.22",
				"title": "A Case for Hybrid Discrete-Continuous Architectures",
				"publicationTitle": "IEEE Computer Architecture Letters",
				"volume": "11",
				"issue": "1",
				"ISSN": "1556-6056",
				"date": "2012",
				"pages": "1-4",
				"DOI": "10.1109/L-CA.2011.22",
				"abstractNote": "Current technology trends indicate that power- and energyefficiency will limit chip throughput in the future. Current solutions to these problems, either in the way of programmable or fixed-function digital accelerators will soon reach their limits as microarchitectural overheads are successively trimmed. A significant departure from current computing methods is required to carry forward computing advances beyond digital accelerators. In this paper we describe how the energy-efficiency of a large class of problems can be improved by employing a hybrid of the discrete and continuous models of computation instead of the ubiquitous, traditional discrete model of computation. We present preliminary analysis of domains and benchmarks that can be accelerated with the new model. Analysis shows that machine learning, physics and up to one-third of SPEC, RMS and Berkeley suite of applications can be accelerated with the new hybrid model.",
				"libraryCatalog": "IEEE Computer Society"
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.computer.org/csdl/mags/cg/2012/06/mcg2012060006-abs.html",
		"items": [
			{
				"itemType": "magazineArticle",
				"creators": [
					{
						"firstName": "Ying",
						"lastName": "Zhu",
						"creatorType": "author"
					}
				],
				"notes": [
					{
						"note": "Complete PDF document was either not available or accessible. Please make sure you're logged in to the digital library to retrieve the complete PDF document."
					}
				],
				"tags": [
					"computer graphics",
					"data visualization",
					"data visualization",
					"data visualization",
					"google",
					"google",
					"google chart tools",
					"google fusion tables",
					"google maps api",
					"processing",
					"visualization education"
				],
				"seeAlso": [],
				"attachments": [
					{
						"mimeType": "text/html",
						"title": "IEEE Computer Snapshot"
					}
				],
				"itemID": "10.1109/MCG.2012.114",
				"title": "Introducing Google Chart Tools and Google Maps API in Data Visualization Courses",
				"publicationTitle": "IEEE Computer Graphics and Applications",
				"volume": "32",
				"issue": "6",
				"ISSN": "0272-1716",
				"date": "2012",
				"pages": "6-9",
				"abstractNote": "This article reports the experience of using Google Chart Tools and Google Maps in a data visualization course at Georgia State University. These visualization toolkits have many benefits but haven&amp;rsquo;t been widely used in such courses. Students found them easy to use for creating a variety of interactive data visualizations.",
				"libraryCatalog": "IEEE Computer Society"
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.computer.org/csdl/trans/ta/2012/01/index.html",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://www.computer.org/csdl/proceedings/bibe/2010/4083/00/4083a001-abs.html",
		"items": [
			{
				"itemType": "conferencePaper",
				"creators": [
					{
						"firstName": "Lana X.",
						"lastName": "Garmire",
						"creatorType": "author"
					},
					{
						"firstName": "Shankar",
						"lastName": "Subramaniam",
						"creatorType": "author"
					},
					{
						"firstName": "David",
						"lastName": "Garmire",
						"creatorType": "author"
					},
					{
						"firstName": "Chris K.",
						"lastName": "Glass",
						"creatorType": "author"
					}
				],
				"notes": [
					{
						"note": "Complete PDF document was either not available or accessible. Please make sure you're logged in to the digital library to retrieve the complete PDF document."
					}
				],
				"tags": [
					"chip-seq; clustering; non-coding rna; rna polymerase; macrophage"
				],
				"seeAlso": [],
				"attachments": [
					{
						"mimeType": "text/html",
						"title": "IEEE Computer Snapshot"
					}
				],
				"itemID": "10.1109/BIBE.2010.10",
				"title": "A Clustering Approach to Identify Intergenic Non-coding RNA in Mouse Macrophages",
				"volume": "0",
				"date": "2010",
				"ISBN": "978-0-7695-4083-2",
				"pages": "1-6",
				"DOI": "10.1109/BIBE.2010.10",
				"publisher": "IEEE Computer Society",
				"place": "Los Alamitos, CA, USA",
				"abstractNote": "We present a global clustering approach to identify putative intergenic non-coding RNAs based on the RNA polymerase II and Histone 3 lysine 4 trimethylation signatures. Both of these signatures are processed from the digital sequencing tags produced by chromatin immunoprecipitation, a high-throughput massively parallel sequencing (ChIP-Seq) technology. Our method compares favorably to the comparison method. We characterize the intergenic non-coding RNAs to have conservative promoters. We predict that these nc-RNAs are related to metabolic process without lipopolysaccharides (LPS) treatment, but shift towards developmental and immune-related functions with LPS treatment. We demonstrate that more intergenic nc-RNAs respond positively to LPS treatment, rather than negatively. Using QPCR, we experimentally validate 8 out of 11 nc-RNA regions respond to LPS treatment as predicted by the computational method.",
				"libraryCatalog": "IEEE Computer Society",
				"proceedingsTitle": "13th IEEE International Conference on BioInformatics and BioEngineering"
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.computer.org/csdl/proceedings/bibe/2010/4083/00/index.html",
		"items": "multiple"
	}
]
/** END TEST CASES **/