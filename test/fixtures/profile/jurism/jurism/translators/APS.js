{
	"translatorID": "2c310a37-a4dd-48d2-82c9-bd29c53c1c76",
	"label": "APS",
	"creator": "Aurimas Vinckevicius",
	"target": "^https?://journals\\.aps\\.org/([^/]+/(abstract|supplemental|references|cited-by|issues)/|search(\\?|/))",
	"minVersion": "3.0.12",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2017-01-14 21:44:41"
}

function detectWeb(doc, url) {
	var title = doc.getElementById('title');
	if (title && ZU.xpath(title, './/a[@id="export-article-link"]').length) {
		return "journalArticle";
	} else if (getSearchResults(doc, true)){
		return "multiple";
	}
}


function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = ZU.xpath(doc, '//div[contains(@class, "search-results")]//div[contains(@class, "row")]//h5/a');
	for (var i=0; i<rows.length; i++) {
		var href = rows[i].href;
		var title = ZU.trimInternal(cleanMath(rows[i].textContent));
		if (!href || !title) continue;
		if (checkOnly) return true;
		found = true;
		items[href] = title;
	}
	return found ? items : false;
}


function doWeb(doc, url) {
	if (detectWeb(doc, url) == "multiple") {
		Zotero.selectItems(getSearchResults(doc, false), function (items) {
			if (!items) {
				return true;
			}
			var articles = [];
			for (var i in items) {
				articles.push(i);
			}
			ZU.processDocuments(articles, scrape);
		});
	} else {
		scrape(doc, url);
	}
}


// Extension to mimeType mapping
var suppTypeMap = {
	'pdf': 'application/pdf',
	'zip': 'application/zip',
	'doc': 'application/msword',
	'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
	'xls': 'application/vnd.ms-excel',
	'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
	'mov': 'video/quicktime'
};

var dontDownload = [
	'application/zip',
	'video/quicktime'
];

function scrape(doc, url) {
	url = url.replace(/[?#].*/, '');
	
	if (url.indexOf('/abstract/') == -1) {
		// Go to Abstract page first so we can scrape the abstract
		url = url.replace(/\/(?:supplemental|references|cited-by)\//, '/abstract/');
		if (url.indexOf('/abstract/') == -1) {
			Zotero.debug('Unrecognized URL ' + url);
			return;
		}
		
		ZU.processDocuments(url, function(doc, url) {
			if (url.indexOf('/abstract/') == -1) {
				Zotero.debug('Redirected when trying to go to abstract page. ' + url);
				return;
			}
			scrape(doc, url)
		});
		return;
	}
	
	url = url.replace(/\/abstract\//, '/{REPLACE}/');
	
	// fetch RIS
	var risUrl = url.replace('{REPLACE}', 'export')
			   + '?type=ris&download=true';
	ZU.doGet(risUrl, function(text) {
		text = text.replace(/^ID\s+-\s+/mg, 'DO  - ');
		var trans = Zotero.loadTranslator('import');
		trans.setTranslator('32d59d2d-b65a-4da4-b0a3-bdd3cfb979e7'); //RIS
		trans.setString(text);
		trans.setHandler('itemDone', function(obj, item) {
			// scrape abstract from page
			item.abstractNote = ZU.trimInternal(cleanMath(
				ZU.xpathText(doc, '//section[contains(@class,"abstract")]/div[@class="content"]/p[1]')
			));
			
			// attach PDF
			if (ZU.xpath(doc, '//div[@class="article-nav-actions"]/a[contains(text(), "PDF")]').length) {
				item.attachments.push({
					title: 'Full Text PDF',
					url: url.replace('{REPLACE}', 'pdf'),
					mimeType: 'application/pdf'
				});
			}
			
			item.attachments.push({
				title: "APS Snapshot",
				document: doc
			});
			
			if (Z.getHiddenPref && Z.getHiddenPref('attachSupplementary')) {
				ZU.processDocuments(url.replace('{REPLACE}', 'supplemental'), function(doc) {
					try {
						var asLink = Z.getHiddenPref('supplementaryAsLink');
						var suppFiles = doc.getElementsByClassName('supplemental-file');
						for (var i=0; i<suppFiles.length; i++) {
							var link = suppFiles[i].getElementsByTagName('a')[0];
							if (!link || !link.href) continue;
							var title = link.getAttribute('data-id') || 'Supplementary Data';
							var type = suppTypeMap[link.href.split('.').pop()];
							if (asLink || dontDownload.indexOf(type) != -1) {
								item.attachments.push({
									title: title,
									url: link.href,
									mimeType: type || 'text/html',
									snapshot: false
								});
							} else {
								item.attachments.push({
									title: title,
									url: link.href,
									mimeType: type
								});
							}
						}
					} catch (e) {
						Z.debug('Could not attach supplemental data');
						Z.debug(e);
					}
				}, function() { item.complete() });
			} else {
				item.complete();
			}
		});
		trans.translate();
	});
}

function cleanMath(str) {
	//math tags appear to have duplicate content and are somehow left in even after textContent
	return str.replace(/<(math|mi)[^<>]*>.*?<\/\1>/g, '');
}
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://journals.aps.org/prd/abstract/10.1103/PhysRevD.84.077701",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Hints for a nonstandard Higgs boson from the LHC",
				"creators": [
					{
						"lastName": "Raidal",
						"firstName": "Martti",
						"creatorType": "author"
					},
					{
						"lastName": "Strumia",
						"firstName": "Alessandro",
						"creatorType": "author"
					}
				],
				"date": "October 21, 2011",
				"DOI": "10.1103/PhysRevD.84.077701",
				"abstractNote": "We reconsider Higgs boson invisible decays into Dark Matter in the light of recent Higgs searches at the LHC. Present hints in the Compact Muon Solenoid and ATLAS data favor a nonstandard Higgs boson with approximately 50% invisible branching ratio, and mass around 143 GeV. This situation can be realized within the simplest thermal scalar singlet Dark Matter model, predicting a Dark Matter mass around 50 GeV and direct detection cross section just below present bound. The present runs of the Xenon100 and LHC experiments can test this possibility.",
				"issue": "7",
				"journalAbbreviation": "Phys. Rev. D",
				"libraryCatalog": "APS",
				"pages": "077701",
				"publicationTitle": "Physical Review D",
				"url": "https://link.aps.org/doi/10.1103/PhysRevD.84.077701",
				"volume": "84",
				"attachments": [
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					},
					{
						"title": "APS Snapshot"
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
		"url": "https://journals.aps.org/prd/issues/84/7",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://journals.aps.org/search/results?sort=relevance&clauses=%5B%7B%22operator%22:%22AND%22,%22field%22:%22all%22,%22value%22:%22test%22%7D%5D",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://journals.aps.org/prl/abstract/10.1103/PhysRevLett.114.098105",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Magnetic Flattening of Stem-Cell Spheroids Indicates a Size-Dependent Elastocapillary Transition",
				"creators": [
					{
						"lastName": "Mazuel",
						"firstName": "Francois",
						"creatorType": "author"
					},
					{
						"lastName": "Reffay",
						"firstName": "Myriam",
						"creatorType": "author"
					},
					{
						"lastName": "Du",
						"firstName": "Vicard",
						"creatorType": "author"
					},
					{
						"lastName": "Bacri",
						"firstName": "Jean-Claude",
						"creatorType": "author"
					},
					{
						"lastName": "Rieu",
						"firstName": "Jean-Paul",
						"creatorType": "author"
					},
					{
						"lastName": "Wilhelm",
						"firstName": "Claire",
						"creatorType": "author"
					}
				],
				"date": "March 4, 2015",
				"DOI": "10.1103/PhysRevLett.114.098105",
				"abstractNote": "Cellular aggregates (spheroids) are widely used in biophysics and tissue engineering as model systems for biological tissues. In this Letter we propose novel methods for molding stem-cell spheroids, deforming them, and measuring their interfacial and elastic properties with a single method based on cell tagging with magnetic nanoparticles and application of a magnetic field gradient. Magnetic molding yields spheroids of unprecedented sizes (up to a few mm in diameter) and preserves tissue integrity. On subjecting these spheroids to magnetic flattening (over 150g), we observed a size-dependent elastocapillary transition with two modes of deformation: liquid-drop-like behavior for small spheroids, and elastic-sphere-like behavior for larger spheroids, followed by relaxation to a liquidlike drop.",
				"issue": "9",
				"journalAbbreviation": "Phys. Rev. Lett.",
				"libraryCatalog": "APS",
				"pages": "098105",
				"publicationTitle": "Physical Review Letters",
				"url": "https://link.aps.org/doi/10.1103/PhysRevLett.114.098105",
				"volume": "114",
				"attachments": [
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					},
					{
						"title": "APS Snapshot"
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
		"url": "https://journals.aps.org/prx/supplemental/10.1103/PhysRevX.5.011029",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Weyl Semimetal Phase in Noncentrosymmetric Transition-Metal Monophosphides",
				"creators": [
					{
						"lastName": "Weng",
						"firstName": "Hongming",
						"creatorType": "author"
					},
					{
						"lastName": "Fang",
						"firstName": "Chen",
						"creatorType": "author"
					},
					{
						"lastName": "Fang",
						"firstName": "Zhong",
						"creatorType": "author"
					},
					{
						"lastName": "Bernevig",
						"firstName": "B. Andrei",
						"creatorType": "author"
					},
					{
						"lastName": "Dai",
						"firstName": "Xi",
						"creatorType": "author"
					}
				],
				"date": "March 17, 2015",
				"DOI": "10.1103/PhysRevX.5.011029",
				"abstractNote": "Based on first-principle calculations, we show that a family of nonmagnetic materials including TaAs, TaP, NbAs, and NbP are Weyl semimetals (WSM) without inversion centers. We find twelve pairs of Weyl points in the whole Brillouin zone (BZ) for each of them. In the absence of spin-orbit coupling (SOC), band inversions in mirror-invariant planes lead to gapless nodal rings in the energy-momentum dispersion. The strong SOC in these materials then opens full gaps in the mirror planes, generating nonzero mirror Chern numbers and Weyl points off the mirror planes. The resulting surface-state Fermi arc structures on both (001) and (100) surfaces are also obtained, and they show interesting shapes, pointing to fascinating playgrounds for future experimental studies.",
				"issue": "1",
				"journalAbbreviation": "Phys. Rev. X",
				"libraryCatalog": "APS",
				"pages": "011029",
				"publicationTitle": "Physical Review X",
				"url": "https://link.aps.org/doi/10.1103/PhysRevX.5.011029",
				"volume": "5",
				"attachments": [
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					},
					{
						"title": "APS Snapshot"
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
		"url": "https://journals.aps.org/prx/references/10.1103/PhysRevX.5.011029",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Weyl Semimetal Phase in Noncentrosymmetric Transition-Metal Monophosphides",
				"creators": [
					{
						"lastName": "Weng",
						"firstName": "Hongming",
						"creatorType": "author"
					},
					{
						"lastName": "Fang",
						"firstName": "Chen",
						"creatorType": "author"
					},
					{
						"lastName": "Fang",
						"firstName": "Zhong",
						"creatorType": "author"
					},
					{
						"lastName": "Bernevig",
						"firstName": "B. Andrei",
						"creatorType": "author"
					},
					{
						"lastName": "Dai",
						"firstName": "Xi",
						"creatorType": "author"
					}
				],
				"date": "March 17, 2015",
				"DOI": "10.1103/PhysRevX.5.011029",
				"abstractNote": "Based on first-principle calculations, we show that a family of nonmagnetic materials including TaAs, TaP, NbAs, and NbP are Weyl semimetals (WSM) without inversion centers. We find twelve pairs of Weyl points in the whole Brillouin zone (BZ) for each of them. In the absence of spin-orbit coupling (SOC), band inversions in mirror-invariant planes lead to gapless nodal rings in the energy-momentum dispersion. The strong SOC in these materials then opens full gaps in the mirror planes, generating nonzero mirror Chern numbers and Weyl points off the mirror planes. The resulting surface-state Fermi arc structures on both (001) and (100) surfaces are also obtained, and they show interesting shapes, pointing to fascinating playgrounds for future experimental studies.",
				"issue": "1",
				"journalAbbreviation": "Phys. Rev. X",
				"libraryCatalog": "APS",
				"pages": "011029",
				"publicationTitle": "Physical Review X",
				"url": "https://link.aps.org/doi/10.1103/PhysRevX.5.011029",
				"volume": "5",
				"attachments": [
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					},
					{
						"title": "APS Snapshot"
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
		"url": "https://journals.aps.org/prx/cited-by/10.1103/PhysRevX.5.011003",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Ideal Negative Measurements in Quantum Walks Disprove Theories Based on Classical Trajectories",
				"creators": [
					{
						"lastName": "Robens",
						"firstName": "Carsten",
						"creatorType": "author"
					},
					{
						"lastName": "Alt",
						"firstName": "Wolfgang",
						"creatorType": "author"
					},
					{
						"lastName": "Meschede",
						"firstName": "Dieter",
						"creatorType": "author"
					},
					{
						"lastName": "Emary",
						"firstName": "Clive",
						"creatorType": "author"
					},
					{
						"lastName": "Alberti",
						"firstName": "Andrea",
						"creatorType": "author"
					}
				],
				"date": "January 20, 2015",
				"DOI": "10.1103/PhysRevX.5.011003",
				"abstractNote": "We report on a stringent test of the nonclassicality of the motion of a massive quantum particle, which propagates on a discrete lattice. Measuring temporal correlations of the position of single atoms performing a quantum walk, we observe a 6σ violation of the Leggett-Garg inequality. Our results rigorously excludes (i.e., falsifies) any explanation of quantum transport based on classical, well-defined trajectories. We use so-called ideal negative measurements—an essential requisite for any genuine Leggett-Garg test—to acquire information about the atom’s position, yet avoiding any direct interaction with it. The interaction-free measurement is based on a novel atom transport system, which allows us to directly probe the absence rather than the presence of atoms at a chosen lattice site. Beyond the fundamental aspect of this test, we demonstrate the application of the Leggett-Garg correlation function as a witness of quantum superposition. Here, we employ the witness to discriminate different types of walks spanning from merely classical to wholly quantum dynamics.",
				"issue": "1",
				"journalAbbreviation": "Phys. Rev. X",
				"libraryCatalog": "APS",
				"pages": "011003",
				"publicationTitle": "Physical Review X",
				"url": "https://link.aps.org/doi/10.1103/PhysRevX.5.011003",
				"volume": "5",
				"attachments": [
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					},
					{
						"title": "APS Snapshot"
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