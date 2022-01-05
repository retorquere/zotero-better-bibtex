{
	"translatorID": "f26cfb71-efd7-47ae-a28c-d4d8852096bd",
	"label": "Cell Press",
	"creator": "Michael Berkowitz, Sebastian Karcher, Aurimas Vinckevicius",
	"target": "^https?://([^/]*\\.)?cell\\.com",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2017-06-06 22:03:36"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Cell Journals Translator
	Copyright © 2011 Sebastian Karcher and Aurimas Vinckevicius

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
	if (ZU.xpathText(doc, '//meta[@name="citation_journal_title"]/@content')) {
		return 'journalArticle';
	} else if (url.indexOf('doSearch?') != -1 &&
		ZU.xpath(doc, '//form[contains(@id, "Search")]\
			//a[contains(@href, "abstract") or contains(@href, "fulltext")]') ) {
		return 'multiple';
	}
}

function scrape(doc, url) {
	//use Embedded Metadata
	var translator = Zotero.loadTranslator('web');
	translator.setTranslator('951c027d-74ac-47d4-a107-9c3069ab7b48');
	translator.setDocument(doc);

	translator.setHandler('itemDone', function(obj, item) {
		//occasionally creators are not supplied,
		//but we can get them from the page
		if (!item.creators.length) {
			var creators = ZU.xpath(doc, '//div[@id="article_meta"]\
								//p[./a[starts-with(@href,"mailto:")]]/strong');
			for (var i=0, n=creators.length; i<n; i++) {
				item.creators.push(
					ZU.cleanAuthor(creators[i].textContent, 'author'));
			}
		}
		
		//normalize date
		if (item.date) {
			item.date = ZU.strToISO(item.date);
		}
		
		//delete dublicate PMID in extra field
		if (item.extra) {
			var m = item.extra.match(/PMID: (\d+), (\d+)/);
			if (m && m[1]==m[2]) {
				item.extra = "PMID: " + m[1];
			}
		}
		
		//extend relativ urls
		if (item.url && item.url.indexOf("http") == -1) {
			item.url = "http://www.cell.com" + item.url;
		}

		var abstractDiv = doc.getElementById('main_fulltext_content');
		var abstract = ZU.xpathText(doc, '//div[contains(@class, "abstract")]/div[contains(@class, "content")]/p')
			item.abstractNote = abstract;

		//fetch direct PDF link (ScienceDirect)
		var pdfUrl;
		for (var i=0, n=item.attachments.length; i<n; i++) {
			if (item.attachments[i].mimeType &&
				item.attachments[i].mimeType == 'application/pdf') {
				pdfUrl = item.attachments[i].url;
				//delete attachment
				item.attachments.splice(i,1);
				n--;
				i--;
			}
		}
		
		if (pdfUrl) {
			ZU.doGet(pdfUrl, function(text) {
				if (text.indexOf('onload="javascript:redirectToScienceURL();"') != -1) {
					var m = text.match(/value\s*=\s*"([^"]+)"/);
					if (m) {
						pdfUrl = m[1];
					}
				} else if (text.indexOf('onload="javascript:trackPDFDownload();"') != -1) {
					pdfUrl += (pdfUrl.indexOf('?') != -1 ? '&' : '?') +
								'intermediate=true';
				}
				
				item.attachments.push({
					title: 'Full Text PDF',
					url: pdfUrl,
					mimeType: 'application/pdf'
				});
				
				finalize(item, doc, url, pdfUrl);
			});
		} else {
			finalize(item, doc, url, pdfUrl);
		}
	});

	translator.translate();
}

//mimetype map for supplementary attachments
//intentionally excluding potentially large files like videos and zip files
var suppTypeMap = {
	'pdf': 'application/pdf',
	'doc': 'application/msword',
	'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
	'xls': 'application/vnd.ms-excel',
	'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
};

function finalize(item, doc, url, pdfUrl) {
	if (Z.getHiddenPref && Z.getHiddenPref('attachSupplementary')) {
		try {
			//check if there is supplementary data
			var tabs = doc.getElementById('aotftabs');
			var suppLink;
			if (tabs) {
				//enhanced view (AJAX driven), but let's see if we even have supp. data
				suppLink = ZU.xpath(tabs, './/a[@href="#suppinfo"]')[0];
				if (suppLink) {
					//construct a link to the standard view of supp. data
					suppLink = url.replace(/[^\/]+(?=\/[^\/]*$)/, 'supplemental')
						.replace(/[?#].*/, '');
				}
			} else if (tabs = doc.getElementById('article_options')) {
				//standard view
				suppLink = ZU.xpathText(tabs, './/a[text()="Supplemental Data"]/@href');
			}
			if (suppLink) {
				if (Z.getHiddenPref('supplementaryAsLink')) {
					item.attachments.push({
						title: 'Supplementary Data',
						url: suppLink,
						mimeType: 'text/html',
						snapshot: false
					});
				} else {
					ZU.processDocuments(suppLink, function(suppDoc) {
						var suppEntries = ZU.xpath(suppDoc, '//div[@id="main_supp"]/dl/dt');
						for (var i=0, n=suppEntries.length; i<n; i++) {
							var link = suppEntries[i].getElementsByTagName('a')[0];
							if (!link) return;
							
							link = link.href;
							
							var title = ZU.trimInternal(suppEntries[i].textContent)
								.replace(/\s*\([^()]+kb\)$/, '');
							var desc = suppEntries[i].nextSibling;
							if (desc && desc.nodeName.toUpperCase() == 'DD'
								&& (desc = ZU.trimInternal(desc.textContent))) {
								if (title) title += ': ';
								title += desc;
							}
							
							var mimeType = suppTypeMap[link.substr(link.lastIndexOf('.')+1)];
							
							item.attachments.push({
								title: title,
								url: link,
								mimeType: mimeType,
								snapshot: !!mimeType
							});
						}
					}, function() { item.complete(); });
					return;
				}
			}
			item.complete();
		} catch(e) {
			Z.debug("Error attaching supplementary data.");
			Z.debug(e);
			item.complete();
		}
	} else {
		item.complete();
	}
}

function doWeb(doc, url) {
	if (detectWeb(doc, url) == 'multiple') {
		var res = ZU.xpath(doc,'//form[contains(@id, "Search")]\
									//div[@class="article-details"]');
		var url, items = new Object();
		for (var i=0, n=res.length; i<n; i++) {
			url = ZU.xpathText(res[i], './h2/a/@href');
			if (url) {
				items[url] = ZU.xpathText(res[i], './h2/a');
			}
		}
		Zotero.selectItems(items, function(selectedItems) {
			if (!selectedItems) return true;

			var urls = new Array();
			for (var i in selectedItems) {
				urls.push(i);
			}
			ZU.processDocuments(urls, scrape);
		});
	} else {
		scrape(doc, url);
	}
}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.cell.com/abstract/S0092-8674(11)00581-2",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Kynurenine 3-Monooxygenase Inhibition in Blood Ameliorates Neurodegeneration",
				"creators": [
					{
						"firstName": "Daniel",
						"lastName": "Zwilling",
						"creatorType": "author"
					},
					{
						"firstName": "Shao-Yi",
						"lastName": "Huang",
						"creatorType": "author"
					},
					{
						"firstName": "Korrapati V.",
						"lastName": "Sathyasaikumar",
						"creatorType": "author"
					},
					{
						"firstName": "Francesca M.",
						"lastName": "Notarangelo",
						"creatorType": "author"
					},
					{
						"firstName": "Paolo",
						"lastName": "Guidetti",
						"creatorType": "author"
					},
					{
						"firstName": "Hui-Qiu",
						"lastName": "Wu",
						"creatorType": "author"
					},
					{
						"firstName": "Jason",
						"lastName": "Lee",
						"creatorType": "author"
					},
					{
						"firstName": "Jennifer",
						"lastName": "Truong",
						"creatorType": "author"
					},
					{
						"firstName": "Yaisa",
						"lastName": "Andrews-Zwilling",
						"creatorType": "author"
					},
					{
						"firstName": "Eric W.",
						"lastName": "Hsieh",
						"creatorType": "author"
					},
					{
						"firstName": "Jamie Y.",
						"lastName": "Louie",
						"creatorType": "author"
					},
					{
						"firstName": "Tiffany",
						"lastName": "Wu",
						"creatorType": "author"
					},
					{
						"firstName": "Kimberly",
						"lastName": "Scearce-Levie",
						"creatorType": "author"
					},
					{
						"firstName": "Christina",
						"lastName": "Patrick",
						"creatorType": "author"
					},
					{
						"firstName": "Anthony",
						"lastName": "Adame",
						"creatorType": "author"
					},
					{
						"firstName": "Flaviano",
						"lastName": "Giorgini",
						"creatorType": "author"
					},
					{
						"firstName": "Saliha",
						"lastName": "Moussaoui",
						"creatorType": "author"
					},
					{
						"firstName": "Grit",
						"lastName": "Laue",
						"creatorType": "author"
					},
					{
						"firstName": "Arash",
						"lastName": "Rassoulpour",
						"creatorType": "author"
					},
					{
						"firstName": "Gunnar",
						"lastName": "Flik",
						"creatorType": "author"
					},
					{
						"firstName": "Yadong",
						"lastName": "Huang",
						"creatorType": "author"
					},
					{
						"firstName": "Joseph M.",
						"lastName": "Muchowski",
						"creatorType": "author"
					},
					{
						"firstName": "Eliezer",
						"lastName": "Masliah",
						"creatorType": "author"
					},
					{
						"firstName": "Robert",
						"lastName": "Schwarcz",
						"creatorType": "author"
					},
					{
						"firstName": "Paul J.",
						"lastName": "Muchowski",
						"creatorType": "author"
					}
				],
				"date": "2011-06-10",
				"DOI": "10.1016/j.cell.2011.05.020",
				"ISSN": "0092-8674, 1097-4172",
				"abstractNote": "Metabolites in the kynurenine pathway, generated by tryptophan degradation, are thought to play an important role in neurodegenerative disorders, including Alzheimer's and Huntington's diseases. In these disorders, glutamate receptor-mediated excitotoxicity and free radical formation have been correlated with decreased levels of the neuroprotective metabolite kynurenic acid. Here, we describe the synthesis and characterization of JM6, a small-molecule prodrug inhibitor of kynurenine 3-monooxygenase (KMO). Chronic oral administration of JM6 inhibits KMO in the blood, increasing kynurenic acid levels and reducing extracellular glutamate in the brain. In a transgenic mouse model of Alzheimer's disease, JM6 prevents spatial memory deficits, anxiety-related behavior, and synaptic loss. JM6 also extends life span, prevents synaptic loss, and decreases microglial activation in a mouse model of Huntington's disease. These findings support a critical link between tryptophan metabolism in the blood and neurodegeneration, and they provide a foundation for treatment of neurodegenerative diseases.",
				"extra": "PMID: 21640374",
				"issue": "6",
				"journalAbbreviation": "Cell",
				"language": "English",
				"libraryCatalog": "www.cell.com",
				"pages": "863-874",
				"publicationTitle": "Cell",
				"url": "http://www.cell.com/cell/abstract/S0092-8674(11)00581-2",
				"volume": "145",
				"attachments": [
					{
						"title": "Snapshot"
					},
					{
						"title": "PubMed entry",
						"mimeType": "text/html",
						"snapshot": false
					},
					{
						"title": "Full Text PDF",
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
		"url": "http://www.cell.com/trends/ecology-evolution/abstract/S0169-5347(12)00002-X",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Punishment and cooperation in nature",
				"creators": [
					{
						"firstName": "Nichola J.",
						"lastName": "Raihani",
						"creatorType": "author"
					},
					{
						"firstName": "Alex",
						"lastName": "Thornton",
						"creatorType": "author"
					},
					{
						"firstName": "Redouan",
						"lastName": "Bshary",
						"creatorType": "author"
					}
				],
				"date": "2012-05-01",
				"DOI": "10.1016/j.tree.2011.12.004",
				"ISSN": "0169-5347",
				"abstractNote": "Humans use punishment to promote cooperation in laboratory experiments but evidence that punishment plays a similar role in non-human animals is comparatively rare. In this article, we examine why this may be the case by reviewing evidence from both laboratory experiments on humans and ecologically relevant studies on non-human animals. Generally, punishment appears to be most probable if players differ in strength or strategic options. Although these conditions are common in nature, punishment (unlike other forms of aggression) involves immediate payoff reductions to both punisher and target, with net benefits to punishers contingent on cheats behaving more cooperatively in future interactions. In many cases, aggression yielding immediate benefits may suffice to deter cheats and might explain the relative scarcity of punishment in nature.",
				"extra": "PMID: 22284810",
				"issue": "5",
				"journalAbbreviation": "Trends in Ecology & Evolution",
				"language": "English",
				"libraryCatalog": "www.cell.com",
				"pages": "288-295",
				"publicationTitle": "Trends in Ecology & Evolution",
				"url": "http://www.cell.com/trends/ecology-evolution/abstract/S0169-5347(12)00002-X",
				"volume": "27",
				"attachments": [
					{
						"title": "Snapshot"
					},
					{
						"title": "PubMed entry",
						"mimeType": "text/html",
						"snapshot": false
					},
					{
						"title": "Full Text PDF",
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
		"url": "http://www.cell.com/abstract/S0092-8674(05)00554-4",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Inactivation of the SR Protein Splicing Factor ASF/SF2 Results in Genomic Instability",
				"creators": [
					{
						"firstName": "Xialu",
						"lastName": "Li",
						"creatorType": "author"
					},
					{
						"firstName": "James L.",
						"lastName": "Manley",
						"creatorType": "author"
					}
				],
				"date": "2005-08-12",
				"DOI": "10.1016/j.cell.2005.06.008",
				"ISSN": "0092-8674, 1097-4172",
				"abstractNote": "SR proteins constitute a family of pre-mRNA splicing factors now thought to play several roles in mRNA metabolism in metazoan cells. Here we provide evidence that a prototypical SR protein, ASF/SF2, is unexpectedly required for maintenance of genomic stability. We first show that in vivo depletion of ASF/SF2 results in a hypermutation phenotype likely due to DNA rearrangements, reflected in the rapid appearance of DNA double-strand breaks and high-molecular-weight DNA fragments. Analysis of DNA from ASF/SF2-depleted cells revealed that the nontemplate strand of a transcribed gene was single stranded due to formation of an RNA:DNA hybrid, R loop structure. Stable overexpression of RNase H suppressed the DNA-fragmentation and hypermutation phenotypes. Indicative of a direct role, ASF/SF2 prevented R loop formation in a reconstituted in vitro transcription reaction. Our results support a model by which recruitment of ASF/SF2 to nascent transcripts by RNA polymerase II prevents formation of mutagenic R loop structures.",
				"extra": "PMID: 16096057",
				"issue": "3",
				"journalAbbreviation": "Cell",
				"language": "English",
				"libraryCatalog": "www.cell.com",
				"pages": "365-378",
				"publicationTitle": "Cell",
				"url": "http://www.cell.com/cell/abstract/S0092-8674(05)00554-4",
				"volume": "122",
				"attachments": [
					{
						"title": "Snapshot"
					},
					{
						"title": "PubMed entry",
						"mimeType": "text/html",
						"snapshot": false
					},
					{
						"title": "Full Text PDF",
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
		"url": "http://www.cell.com/action/doSearch?searchType=quick&searchText=brain&occurrences=all&journalCode=&searchScope=fullSite",
		"items": "multiple"
	}
]
/** END TEST CASES **/