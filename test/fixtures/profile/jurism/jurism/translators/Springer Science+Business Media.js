{
	"translatorID": "dfec8317-9b59-4cc5-8771-cdcef719d171",
	"label": "Springer Science+Business Media",
	"creator": "Aurimas Vinckevicius",
	"target": "^https?://[^/]+/(((content|\\d+)/)?[-\\d]+/[A-Z]?\\d+/[A-Z]?\\d+|search/results|inst/\\d+\\?)",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 250,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsbv",
	"lastUpdated": "2015-09-18 22:51:42"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Springer Open Translator
	Copyright © 2011 Aurimas Vinckevicius

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

function getItems(doc, url) {
	//Since you can perform a cross-site search, make sure we have links that
	//we can scrape
	var host = url.match(/^https?:\/\/(?:[^/]+\.)?([^\.\/]+\.[^\.\/]+)(?:\/|$)/i);
	if(!host) return;
	host = host[1];
	return ZU.xpath(doc, '//table[@class="articles-feed" or @id="articles-list"]\
					//p[.//strong/a[contains(@href,"' + host + '/") and text()]]');
	}

function scrape(doc) {
	//get pmid from link to pubmed
	var pmid = ZU.xpathText(doc, '//div[@id="article-info"]/div[@id="associated-material-links"]//a[contains(@href, "/pubmed/")]/@href');
	var translator = Zotero.loadTranslator("web");
	//embedded metadata
	translator.setTranslator("951c027d-74ac-47d4-a107-9c3069ab7b48");
	translator.setDocument(doc);

	translator.setHandler("itemDone", function(obj, item) {
		//once we have a PMID field put this there.
		if (pmid) item.extra = "PMID: " + pmid.match(/\d+/)[0]

		//BMC doesn't always put correct links to PDFs in the meta tags
		//if we can scrape this from the page, use that
		var pdfUrl = ZU.xpath(doc, '//div[@id="viewing-options-links"]//a[text()="PDF" or text()="View PDF"]');
		if(pdfUrl.length) {
			item.attachments = [{
				title: 'Full Text PDF',
				url: pdfUrl[0].href,
				mimeType: 'application/pdf'
			},
			{
				title: "Snapshot",
				document: doc
			}];
		}
		
		// Abstract may be missing
		if (!item.abstractNote) {
			var abstract = ZU.xpath(doc, '//h3[normalize-space(text())="Abstract"]')[0];
			if (abstract) {
				var content = abstract.nextElementSibling;
				if (content && content.nodeName == 'P') {
					item.abstractNote = ZU.trimInternal(content.textContent);
				}
			}
		}

		//sometimes there's no url specified in the meta tags,
		//only og:url, which is for the website.
		//In that case, include current url
		if(!item.url.match(/[^\/]\/[^\/]/)) {
			item.url = doc.location.href;
		}

		//keywords
		var keywords = ZU.xpathText(doc, '//*[@id="keywords"]/text()', null, '; ');
		if(keywords) {
			item.tags = ZU.trimInternal(keywords).replace(/(^;\s*|\s*;$)/g,'')
							.split(/;\s*/);
		}

		item.complete();
	});

	translator.translate();
}

function detectWeb(doc, url) {
	var hostDB = ZU.xpathText(doc,'(//li[@id="SPR" or @id="BMC" or @id="CC"])[1]\
									/a/@href');
	if(hostDB) hostDB = hostDB.toLowerCase().replace(/^\s*https?:\/\//,'')
						.replace(/[^a-z]*$/,'');

	switch(hostDB) {
		case 'www.springeropen.com':
		case 'www.biomedcentral.com':
		case 'www.chemistrycentral.com':
			break;
		default:
			return;
	}

	//This should only include journals
	var title = ZU.xpathText(doc, '//meta[@name="citation_title"]/@content');
	if(title && title.trim()) {
		return 'journalArticle';
	}

	if(getItems(doc, url).length) {
		return 'multiple';
	}
}

function doWeb(doc, url) {
	if(detectWeb(doc, url) == 'multiple') {
		Zotero.selectItems( ZU.getItemArray(doc, getItems(doc, url) ),
						function(selectedItems) {
			if(!selectedItems) return true;

			var urls = new Array();
			for(var i in selectedItems) {
				urls.push(i);
			}

			ZU.processDocuments(urls, scrape);
		});
	} else {
		scrape(doc);
	}
}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.journalofinequalitiesandapplications.com/content/2011/1/53",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Approximately cubic functional equations and cubic multipliers",
				"creators": [
					{
						"firstName": "Abasalt",
						"lastName": "Bodaghi",
						"creatorType": "author"
					},
					{
						"firstName": "Idham A.",
						"lastName": "Alias",
						"creatorType": "author"
					},
					{
						"firstName": "Mohammad H.",
						"lastName": "Ghahramani",
						"creatorType": "author"
					}
				],
				"date": "2011-09-13",
				"DOI": "10.1186/1029-242X-2011-53",
				"ISSN": "1029-242X",
				"abstractNote": "In this paper, we prove the Hyers-Ulam stability and the superstability for cubic functional equation by using the fixed point alternative theorem. As a consequence, we show that the cubic multipliers are superstable under some conditions.",
				"issue": "1",
				"language": "en",
				"libraryCatalog": "www.journalofinequalitiesandapplications.com",
				"pages": "53",
				"publicationTitle": "Journal of Inequalities and Applications",
				"rights": "2011 Bodaghi et al; licensee Springer.",
				"url": "http://www.journalofinequalitiesandapplications.com/content/2011/1/53/abstract",
				"volume": "2011",
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
					"Hyers-Ulam stability",
					"Superstability",
					"cubic functional equation",
					"multiplier"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.nanoscalereslett.com/content/6/1/530/abstract",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Nanoscale potassium niobate crystal structure and phase transition",
				"creators": [
					{
						"firstName": "Haiyan",
						"lastName": "Chen",
						"creatorType": "author"
					},
					{
						"firstName": "Yixuan",
						"lastName": "Zhang",
						"creatorType": "author"
					},
					{
						"firstName": "Yanling",
						"lastName": "Lu",
						"creatorType": "author"
					}
				],
				"date": "2011-09-23",
				"DOI": "10.1186/1556-276X-6-530",
				"ISSN": "1556-276X",
				"abstractNote": "Nanoscale potassium niobate (KNbO3) powders of orthorhombic structure were synthesized using the sol-gel method. The heat-treatment temperature of the gels had a pronounced effect on KNbO3 particle size and morphology. Field emission scanning electron microscopy and transmission electron microscopy were used to determine particle size and morphology. The average KNbO3 grain size was estimated to be less than 100 nm, and transmission electron microscopy images indicated that KNbO3 particles had a brick-like morphology. Synchrotron X-ray diffraction was used to identify the room-temperature structures using Rietveld refinement. The ferroelectric orthorhombic phase was retained even for particles smaller than 50 nm. The orthorhombic to tetragonal and tetragonal to cubic phase transitions of nanocrystalline KNbO3 were investigated using temperature-dependent powder X-ray diffraction. Differential scanning calorimetry was used to examine the temperature dependence of KNbO3 phase transition. The Curie temperature and phase transition were independent of particle size, and Rietveld analyses showed increasing distortions with decreasing particle size.",
				"extra": "PMID: 21943345",
				"issue": "1",
				"language": "en",
				"libraryCatalog": "www.nanoscalereslett.com",
				"pages": "530",
				"publicationTitle": "Nanoscale Research Letters",
				"rights": "2011 Chen et al; licensee Springer.",
				"url": "http://www.nanoscalereslett.com/content/6/1/530/abstract",
				"volume": "6",
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
					"crystal structure",
					"nanoscale powder.",
					"phase transition",
					"potassium niobate"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://jwcn.eurasipjournals.com/search/results?terms=project",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://www.respiratory-research.com/search/results?terms=cells",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://www.respiratory-research.com/content/11/1/133",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Nicotinic receptors on rat alveolar macrophages dampen ATP-induced increase in cytosolic calcium concentration",
				"creators": [
					{
						"firstName": "Zbigniew",
						"lastName": "Mikulski",
						"creatorType": "author"
					},
					{
						"firstName": "Petra",
						"lastName": "Hartmann",
						"creatorType": "author"
					},
					{
						"firstName": "Gitte",
						"lastName": "Jositsch",
						"creatorType": "author"
					},
					{
						"firstName": "Zbigniew",
						"lastName": "Zasłona",
						"creatorType": "author"
					},
					{
						"firstName": "Katrin S.",
						"lastName": "Lips",
						"creatorType": "author"
					},
					{
						"firstName": "Uwe",
						"lastName": "Pfeil",
						"creatorType": "author"
					},
					{
						"firstName": "Hjalmar",
						"lastName": "Kurzen",
						"creatorType": "author"
					},
					{
						"firstName": "Jürgen",
						"lastName": "Lohmeyer",
						"creatorType": "author"
					},
					{
						"firstName": "Wolfgang G.",
						"lastName": "Clauss",
						"creatorType": "author"
					},
					{
						"firstName": "Veronika",
						"lastName": "Grau",
						"creatorType": "author"
					},
					{
						"firstName": "Martin",
						"lastName": "Fronius",
						"creatorType": "author"
					},
					{
						"firstName": "Wolfgang",
						"lastName": "Kummer",
						"creatorType": "author"
					}
				],
				"date": "2010-09-29",
				"DOI": "10.1186/1465-9921-11-133",
				"ISSN": "1465-9921",
				"abstractNote": "Nicotinic acetylcholine receptors (nAChR) have been identified on a variety of cells of the immune system and are generally considered to trigger anti-inflammatory events. In the present study, we determine the nAChR inventory of rat alveolar macrophages (AM), and investigate the cellular events evoked by stimulation with nicotine.",
				"extra": "PMID: 20920278",
				"issue": "1",
				"language": "en",
				"libraryCatalog": "www.respiratory-research.com",
				"pages": "133",
				"publicationTitle": "Respiratory Research",
				"rights": "2010 Mikulski et al; licensee BioMed Central Ltd.",
				"url": "http://respiratory-research.com/content/11/1/133/abstract",
				"volume": "11",
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
		"url": "http://journal.chemistrycentral.com/content/5/1/5",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Cacao seeds are a",
				"creators": [
					{
						"firstName": "Stephen J.",
						"lastName": "Crozier",
						"creatorType": "author"
					},
					{
						"firstName": "Amy G.",
						"lastName": "Preston",
						"creatorType": "author"
					},
					{
						"firstName": "Jeffrey W.",
						"lastName": "Hurst",
						"creatorType": "author"
					},
					{
						"firstName": "Mark J.",
						"lastName": "Payne",
						"creatorType": "author"
					},
					{
						"firstName": "Julie",
						"lastName": "Mann",
						"creatorType": "author"
					},
					{
						"firstName": "Larry",
						"lastName": "Hainly",
						"creatorType": "author"
					},
					{
						"firstName": "Debra L.",
						"lastName": "Miller",
						"creatorType": "author"
					}
				],
				"date": "2011-02-07",
				"DOI": "10.1186/1752-153X-5-5",
				"ISSN": "1752-153X",
				"abstractNote": "Numerous popular media sources have developed lists of \"Super Foods\" and, more recently, \"Super Fruits\". Such distinctions often are based on the antioxidant capacity and content of naturally occurring compounds such as polyphenols within those whole fruits or juices of the fruit which may be linked to potential health benefits. Cocoa powder and chocolate are made from an extract of the seeds of the fruit of the Theobroma cacao tree. In this study, we compared cocoa powder and cocoa products to powders and juices derived from fruits commonly considered \"Super Fruits\".",
				"extra": "PMID: 21299842",
				"issue": "1",
				"language": "en",
				"libraryCatalog": "journal.chemistrycentral.com",
				"pages": "5",
				"publicationTitle": "Chemistry Central Journal",
				"rights": "2011 Crozier et al",
				"url": "http://journal.chemistrycentral.com/content/5/1/5/abstract",
				"volume": "5",
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
		"url": "http://www.genomebiology.com/2003/4/7/223/abstract",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Poly(A)-binding proteins: multifunctional scaffolds for the post-transcriptional control of gene expression",
				"creators": [
					{
						"firstName": "David A.",
						"lastName": "Mangus",
						"creatorType": "author"
					},
					{
						"firstName": "Matthew C.",
						"lastName": "Evans",
						"creatorType": "author"
					},
					{
						"firstName": "Allan",
						"lastName": "Jacobson",
						"creatorType": "author"
					}
				],
				"date": "2003-07-01",
				"DOI": "10.1186/gb-2003-4-7-223",
				"ISSN": "1465-6906",
				"abstractNote": "Most eukaryotic mRNAs are subject to considerable post-transcriptional modification, including capping, splicing, and polyadenylation. The process of polyadenylation adds a 3' poly(A) tail and provides the mRNA with a binding site for a major class of regulatory factors, the poly(A)-binding proteins (PABPs). These highly conserved polypeptides are found only in eukaryotes; single-celled eukaryotes each have a single PABP, whereas humans have five and Arabidopis has eight. They typically bind poly(A) using one or more RNA-recognition motifs, globular domains common to numerous other eukaryotic RNA-binding proteins. Although they lack catalytic activity, PABPs have several roles in mediating gene expression. Nuclear PABPs are necessary for the synthesis of the poly(A) tail, regulating its ultimate length and stimulating maturation of the mRNA. Association with PABP is also a requirement for some mRNAs to be exported from the nucleus. In the cytoplasm, PABPs facilitate the formation of the 'closed loop' structure of the messenger ribonucleoprotein particle that is crucial for additional PABP activities that promote translation initiation and termination, recycling of ribosomes, and stability of the mRNA. Collectively, these sequential nuclear and cytoplasmic contributions comprise a cycle in which PABPs and the poly(A) tail first create and then eliminate a network of cis- acting interactions that control mRNA function.",
				"extra": "PMID: 12844354",
				"issue": "7",
				"language": "en",
				"libraryCatalog": "www.genomebiology.com",
				"pages": "223",
				"publicationTitle": "Genome Biology",
				"rights": "2003 BioMed Central Ltd",
				"shortTitle": "Poly(A)-binding proteins",
				"url": "http://www.genomebiology.com/2003/4/7/223/abstract",
				"volume": "4",
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
		"url": "http://www.biomedcentral.com/1752-0509/4/170",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Inference of hierarchical regulatory network of estrogen-dependent breast cancer through ChIP-based data",
				"creators": [
					{
						"firstName": "Fei",
						"lastName": "Gu",
						"creatorType": "author"
					},
					{
						"firstName": "Hang-Kai",
						"lastName": "Hsu",
						"creatorType": "author"
					},
					{
						"firstName": "Pei-Yin",
						"lastName": "Hsu",
						"creatorType": "author"
					},
					{
						"firstName": "Jiejun",
						"lastName": "Wu",
						"creatorType": "author"
					},
					{
						"firstName": "Yilin",
						"lastName": "Ma",
						"creatorType": "author"
					},
					{
						"firstName": "Jeffrey",
						"lastName": "Parvin",
						"creatorType": "author"
					},
					{
						"firstName": "Tim H.-M.",
						"lastName": "Huang",
						"creatorType": "author"
					},
					{
						"firstName": "Victor X.",
						"lastName": "Jin",
						"creatorType": "author"
					}
				],
				"date": "2010-12-17",
				"DOI": "10.1186/1752-0509-4-170",
				"ISSN": "1752-0509",
				"abstractNote": "Global profiling of in vivo protein-DNA interactions using ChIP-based technologies has evolved rapidly in recent years. Although many genome-wide studies have identified thousands of ERα binding sites and have revealed the associated transcription factor (TF) partners, such as AP1, FOXA1 and CEBP, little is known about ERα associated hierarchical transcriptional regulatory networks.",
				"extra": "PMID: 21167036",
				"issue": "1",
				"language": "en",
				"libraryCatalog": "www.biomedcentral.com",
				"pages": "170",
				"publicationTitle": "BMC Systems Biology",
				"rights": "2010 Gu et al; licensee BioMed Central Ltd.",
				"url": "http://www.biomedcentral.com/1752-0509/4/170/abstract",
				"volume": "4",
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
		"url": "http://www.jfootankleres.com/content/1/S1/O4",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Plantar fascia thickness and first metatarsal mobility in patients with diabetes and neuropathy",
				"creators": [
					{
						"firstName": "Smita",
						"lastName": "Rao",
						"creatorType": "author"
					},
					{
						"firstName": "Charles L.",
						"lastName": "Saltzman",
						"creatorType": "author"
					},
					{
						"firstName": "H. John",
						"lastName": "Yack",
						"creatorType": "author"
					}
				],
				"date": "2008-09-26",
				"DOI": "10.1186/1757-1146-1-S1-O4",
				"ISSN": "1757-1146",
				"issue": "Suppl 1",
				"language": "en",
				"libraryCatalog": "www.jfootankleres.com",
				"pages": "O4",
				"publicationTitle": "Journal of Foot and Ankle Research",
				"rights": "2008 Rao et al; licensee BioMed Central Ltd.",
				"url": "http://www.jfootankleres.com/content/1/S1/O4",
				"volume": "1",
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