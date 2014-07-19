{
	"translatorID": "27ee5b2c-2a5a-4afc-a0aa-d386642d4eed",
	"label": "PubMed Central",
	"creator": "Michael Berkowitz and Rintze Zelle",
	"target": "https?://[^/]*.nih.gov/",
	"minVersion": "2.1.9",
	"maxVersion": "",
	"priority": 101,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsbv",
	"lastUpdated": "2013-11-19 08:23:18"
}

function detectWeb(doc, url) {
	var namespace = doc.documentElement.namespaceURI;
	var nsResolver = namespace ? function(prefix) {
		if (prefix == 'x') return namespace; else return null;
	} : null;
	
	try {var pmid = url.match(/ncbi\.nlm\.nih\.gov\/pmc\/articles\/PMC([\d]+)/)[1];} catch (e) {}
	if (pmid) {
		return "journalArticle";
	}
	
	var uids = doc.evaluate('//div[@class="rprt"]//dl[@class="rprtid"]/dd', doc, nsResolver, XPathResult.ANY_TYPE, null);
	if(uids.iterateNext()) {
		if (uids.iterateNext()){
			return "multiple";
		}
		return "journalArticle";
	}
}

function lookupPMCIDs(ids, doc, pdfLink) {
	Zotero.wait();
	var newUri = "http://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pmc&retmode=xml&id=" + ids.join(",");
	Zotero.debug(newUri);
	Zotero.Utilities.HTTP.doGet(newUri, function (text) {
		text = text.replace(/(<[^!>][^>]*>)/g, function replacer(str, p1, p2, offset, s) {
			return str.replace(/-/gm, "");
		}); //Strip hyphens from element names, attribute names and attribute values
		text = text.replace(/(<[^!>][^>]*>)/g, function replacer(str, p1, p2, offset, s) {
			return str.replace(/:/gm, "");
		}); //Strip colons from element names, attribute names and attribute values
		text = text.replace(/<xref[^<\/]*<\/xref>/g, ""); //Strip xref cross reference from e.g. title
		text = Zotero.Utilities.trim(text);
		//Z.debug(text)
		
		var parser = new DOMParser();
		var doc = parser.parseFromString(text, "text/xml");

		var articles = ZU.xpath(doc, '/pmcarticleset/article');

		for(var i in articles) {
			var newItem = new Zotero.Item("journalArticle");
			
			var journal = ZU.xpath(articles[i], 'front/journalmeta');

			newItem.journalAbbreviation = ZU.xpathText(journal, 'journalid[@journalidtype="nlmta"]');
			
			var journalTitle;
			if ((journalTitle = ZU.xpathText(journal, 'journaltitlegroup/journaltitle'))) {
				newItem.publicationTitle = journalTitle;
			} else if ((journalTitle = ZU.xpathText(journal, 'journaltitle'))) {
				newItem.publicationTitle = journalTitle;
			}

			var issn;
			if ((issn = ZU.xpathText(journal, 'issn[@pubtype="ppub"]'))) {
				newItem.ISSN = issn;
			} else if ((issn = ZU.xpathText(journal, 'issn[@pubtype="epub"]'))) {
				newItem.ISSN = issn;
			}

			var article = ZU.xpath(articles[i], 'front/articlemeta');

			var abstract;
			if ((abstract = ZU.xpathText(article, 'abstract/p'))) {
				newItem.abstractNote = abstract;
			} else {
				var abstractSections = ZU.xpath(article, 'abstract/sec');
				var abstract = [];
				for (var j in abstractSections) {
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
			} else if (firstPage) {
				newItem.pages = firstPage;
			}

			var pubDate = ZU.xpath(article, 'pubdate[@pubtype="ppub"]');
			if (!pubDate.length) {
				pubDate = ZU.xpath(article, 'pubdate[@pubtype="epub"]');
			}
			if (pubDate) {
				if (ZU.xpathText(pubDate, 'day')) {
					newItem.date = ZU.xpathText(pubDate, 'year') + "-" + ZU.xpathText(pubDate, 'month') + "-" + ZU.xpathText(pubDate, 'day');
				} else if (ZU.xpathText(pubDate, 'month')) {
					newItem.date = ZU.xpathText(pubDate, 'year') + "-" + ZU.xpathText(pubDate, 'month');
				} else if (ZU.xpathText(pubDate, 'year')) {
					newItem.date = ZU.xpathText(pubDate, 'year');
				}
			}

			var contributors = ZU.xpath(article, 'contribgroup/contrib');
			if (contributors) {
				var authors = ZU.xpath(article, 'contribgroup/contrib[@contribtype="author"]');
				for (var j in authors) {
					var lastName = ZU.xpathText(authors[j], 'name/surname');
					var firstName = ZU.xpathText(authors[j], 'name/givennames');
					if (firstName || lastName) {
						newItem.creators.push({
							lastName: lastName,
							firstName: firstName
						});
					}
				}
			}

			var linkurl = "http://www.ncbi.nlm.nih.gov/pmc/articles/PMC" + ids[i] + "/";
			newItem.url = linkurl;
			newItem.attachments = [{
				url: linkurl,
				title: "PubMed Central Link",
				mimeType: "text/html",
				snapshot: false
			}];
			
			if (ZU.xpathText(article, 'selfuri/@xlinktitle') == "pdf") {
				var pdfFileName = ZU.xpathText(article, 'selfuri/@xlinkhref');
			} else if (pdfLink) {
				var pdfFileName = pdfLink;
			} else if (ZU.xpathText(article, 'articleid[@pubidtype="publisherid"]')){
				//this should work on most multiples
				var pdfFileName = ZU.xpathText(article, 'articleid[@pubidtype="publisherid"]') + ".pdf";
			}
			
			if (pdfFileName) {
				var pdfURL = "http://www.ncbi.nlm.nih.gov/pmc/articles/PMC" + ids[i] + "/pdf/" + pdfFileName;
				newItem.attachments.push({
				title:"PubMed Central Full Text PDF",
				mimeType:"application/pdf",
				url:pdfURL
				});
			}

			newItem.complete();
		}

		Zotero.done();
	});
}



function doWeb(doc, url) {
	var namespace = doc.documentElement.namespaceURI;
	var nsResolver = namespace ?
	function (prefix) {
		if (prefix == 'x') return namespace;
		else return null;
	} : null;

	var ids = new Array();
	var pmcid;
	var pdfLink;
	var resultsCount = 0;
	try {
		pmcid = url.match(/ncbi\.nlm\.nih\.gov\/pmc\/articles\/PMC([\d]+)/)[1];
	} catch(e) {}
	if (pmcid) {
		try {
			var formatLinks = doc.evaluate('//td[@class="format-menu"]//a'
				+ '|//div[@class="format-menu"]//a'
				+ '|//aside[@id="jr-alt-p"]/div/a', doc, nsResolver, XPathResult.ANY_TYPE, null);
			while (!pdfLink && (formatLink = formatLinks.iterateNext())) {
				pdfLink = formatLink.href;
				//Z.debug(pdfLink);
				if(pdfLink && (pdfLink = pdfLink.match(/\/pdf\/([^\/]*\.pdf$)/))) {
					pdfLink = pdfLink[1];
				}
			}
		} catch (e) {}
		ids.push(pmcid);
		lookupPMCIDs(ids, doc, pdfLink);
	} else {
		var pmcids = doc.evaluate('//div[@class="rprt"]//dl[@class="rprtid"]/dd', doc, nsResolver, XPathResult.ANY_TYPE, null);
		var titles = doc.evaluate('//div[@class="rprt"]//div[@class="title"]', doc, nsResolver, XPathResult.ANY_TYPE, null);
		var title;
		while (pmcid = pmcids.iterateNext()) {
			title = titles.iterateNext();
			ids[pmcid.textContent.match(/PMC([\d]+)/)[1]] = title.textContent;
			resultsCount = resultsCount + 1;
		}
		// Don't display selectItems when there's only one
		// The actual PMCID is the array key
		if (resultsCount == 1) {
			for (var i in ids) {
				lookupPMCIDs(i, doc);
				break;
			}
			return true;
		}
		
		
		Zotero.selectItems(ids, function (ids) {
			if (!ids) {
				return true;
			}
			var pmcids = new Array();
			for (var i in ids) {
				pmcids.push(i);
			}
			lookupPMCIDs(pmcids, doc);
		});
	}
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.ncbi.nlm.nih.gov/pmc/articles/PMC2377243/?tool=pmcentrez",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"lastName": "Aoki",
						"firstName": "Takuya"
					},
					{
						"lastName": "Yamasawa",
						"firstName": "Fumihiro"
					},
					{
						"lastName": "Kawashiro",
						"firstName": "Takeo"
					},
					{
						"lastName": "Shibata",
						"firstName": "Tetsuichi"
					},
					{
						"lastName": "Ishizaka",
						"firstName": "Akitoshi"
					},
					{
						"lastName": "Urano",
						"firstName": "Tetsuya"
					},
					{
						"lastName": "Okada",
						"firstName": "Yasumasa"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
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
				"journalAbbreviation": "Respir Res",
				"publicationTitle": "Respiratory Research",
				"ISSN": "1465-9921",
				"abstractNote": "Background\nThe patient population receiving long-term oxygen therapy has increased with the rising morbidity of COPD. Although high-dose oxygen induces pulmonary edema and interstitial fibrosis, potential lung injury caused by long-term exposure to low-dose oxygen has not been fully analyzed. This study was designed to clarify the effects of long-term low-dose oxygen inhalation on pulmonary epithelial function, edema formation, collagen metabolism, and alveolar fibrosis.\n\nMethods\nGuinea pigs (n = 159) were exposed to either 21% or 40% oxygen for a maximum of 16 weeks, and to 90% oxygen for a maximum of 120 hours. Clearance of inhaled technetium-labeled diethylene triamine pentaacetate (Tc-DTPA) and bronchoalveolar lavage fluid-to-serum ratio (BAL/Serum) of albumin (ALB) were used as markers of epithelial permeability. Lung wet-to-dry weight ratio (W/D) was measured to evaluate pulmonary edema, and types I and III collagenolytic activities and hydroxyproline content in the lung were analyzed as indices of collagen metabolism. Pulmonary fibrotic state was evaluated by histological quantification of fibrous tissue area stained with aniline blue.\n\nResults\nThe clearance of Tc-DTPA was higher with 2 week exposure to 40% oxygen, while BAL/Serum Alb and W/D did not differ between the 40% and 21% groups. In the 40% oxygen group, type I collagenolytic activities at 2 and 4 weeks and type III collagenolytic activity at 2 weeks were increased. Hydroxyproline and fibrous tissue area were also increased at 2 weeks. No discernible injury was histologically observed in the 40% group, while progressive alveolar damage was observed in the 90% group.\n\nConclusion\nThese results indicate that epithelial function is damaged, collagen metabolism is affected, and both breakdown of collagen fibrils and fibrogenesis are transiently induced even with low-dose 40% oxygen exposure. However, these changes are successfully compensated even with continuous exposure to low-dose oxygen. We conclude that long-term low-dose oxygen exposure does not significantly induce permanent lung injury in guinea pigs.",
				"DOI": "10.1186/1465-9921-9-37",
				"extra": "PMID: 18439301\nPMCID: PMC2377243",
				"title": "Effects of long-term low-dose oxygen supplementation on the epithelial function, collagen metabolism and interstitial fibrogenesis in the guinea pig lung",
				"volume": "9",
				"issue": "1",
				"pages": "37",
				"date": "2008",
				"url": "http://www.ncbi.nlm.nih.gov/pmc/articles/PMC2377243/",
				"libraryCatalog": "PubMed Central",
				"accessDate": "CURRENT_TIMESTAMP"
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.ncbi.nlm.nih.gov/pmc/?term=anger",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://www.ncbi.nlm.nih.gov/pmc/issues/184700/",
		"items": "multiple"
	}
]
/** END TEST CASES **/