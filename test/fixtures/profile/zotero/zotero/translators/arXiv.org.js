{
	"translatorID": "ecddda2e-4fc6-4aea-9f17-ef3b56d7377a",
	"label": "arXiv.org",
	"creator": "Sean Takats and Michael Berkowitz",
	"target": "^https?://([^\\.]+\\.)?(arxiv\\.org|xxx\\.lanl\\.gov)/(find|catchup|list/\\w|abs/|pdf/)",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 12,
	"browserSupport": "gcsv",
	"lastUpdated": "2018-04-17 20:00:00"
}

function detectSearch(item) {
	return !!item.arXiv;
}

function doSearch(item) {
	var url = 'https://export.arxiv.org/oai2?verb=GetRecord&metadataPrefix=oai_dc'
		+ '&identifier=oai%3AarXiv.org%3A' + encodeURIComponent(item.arXiv);
	ZU.doGet(url, parseXML);
}

function detectWeb(doc, url) {
	var searchRe = /^https?:\/\/(?:([^\.]+\.))?(?:arxiv\.org|xxx\.lanl\.gov)\/(?:find|list|catchup)/;
	
	if(searchRe.test(url)) {
		return "multiple";
	} else {
		return "journalArticle";
	}
}

function doWeb(doc, url) {
	if(detectWeb(doc, url) == 'multiple') {
		var rows = ZU.xpath(doc, '//div[@id="dlpage"]/dl/dt');
		var getTitleId;
		if(rows.length) {
			// arXiv.org format
			getTitleId = function(row) {
				var id = ZU.xpathText(row, './/a[@title="Abstract"]').trim().substr(6); // Trim off arXiv:
				var title = ZU.trimInternal(
					ZU.xpathText(row, './following-sibling::dd[1]//div[contains(@class, "list-title")]/text()[last()]'));
				return {
					title: title,
					id: id
				};
			};
		} else if( (rows = ZU.xpath(doc, '//table/tbody/tr[./td[@class="lti"]]')).length ) {
			// eprintweb.org format
			getTitleId = function(row) {
				var title = ZU.trimInternal(ZU.xpathText(row, './td'));
				var id = ZU.xpathText(row, './following-sibling::tr[.//a][1]/td/b').trim().substr(6);
				return {
					title: title,
					id: id
				};
			};
		} else {
			throw new Error("Unrecognized multiples format");
		}
		
		var items = {};
		for(var i=0; i<rows.length; i++) {
			var row = getTitleId(rows[i]);
			items[row.id] = row.title;
		}
		
		Z.selectItems(items, function(items) {
			if(!items) return;
			
			var urls = [];
			for(var id in items) {
				urls.push('http://export.arxiv.org/oai2'
					+ '?verb=GetRecord&metadataPrefix=oai_dc'
					+ '&identifier=oai%3AarXiv.org%3A' + encodeURIComponent(id)
				);
			}
			
			ZU.doGet(urls, parseXML);
		})
	} else {
		var id;
		var p = url.indexOf("/pdf/");
		if (p>-1) {
			id = url.substring(p+5, url.length-4);
		} else {
			id = ZU.xpathText(doc, '//td[contains(@class,"arxivid")]/a')
				|| ZU.xpathText(doc, '//b[starts-with(normalize-space(text()),"arXiv:")]');
		}
		if(!id) throw new Error('Could not find arXiv ID on page.');
		
		id = id.trim().replace(/^arxiv:\s*|v\d+|\s+.*$/ig, '');
		var url = 'http://export.arxiv.org/oai2?verb=GetRecord&metadataPrefix=oai_dc'
			+ '&identifier=oai%3AarXiv.org%3A' + encodeURIComponent(id);
		ZU.doGet(url, parseXML);
	}
}



function parseXML(text) {
	//Z.debug(text);
	
	var ns = {
		oai_dc: 'http://www.openarchives.org/OAI/2.0/oai_dc/',
		dc: 'http://purl.org/dc/elements/1.1/',
		xsi: 'http://www.w3.org/2001/XMLSchema-instance',
		n: 'http://www.openarchives.org/OAI/2.0/' // Default
	};
	var newItem = new Zotero.Item("journalArticle");
	
	var xml = (new DOMParser()).parseFromString(text, "text/xml");
	var dcMeta = ZU.xpath(xml, '//n:GetRecord/n:record/n:metadata/oai_dc:dc', ns)[0];

	newItem.title = getXPathNodeTrimmed(dcMeta, "dc:title", ns);
	getCreatorNodes(dcMeta, "dc:creator", newItem, "author", ns);		
	newItem.date = getXPathNodeTrimmed(dcMeta, "dc:date", ns);
	
	
	var descriptions = ZU.xpath(dcMeta, "./dc:description", ns);
	
	//Put the first description into abstract, all other into notes.
	if (descriptions.length>0) {
		newItem.abstractNote = ZU.trimInternal(descriptions[0].textContent);
		for(var j=1; j<descriptions.length; j++) {
			var noteStr = ZU.trimInternal(descriptions[j].textContent);
			newItem.notes.push({note:noteStr});		
		}	
	}	
	var subjects = ZU.xpath(dcMeta, "./dc:subject", ns);
	for(var j=0; j<subjects.length; j++) {
		var subject = ZU.trimInternal(subjects[j].textContent);
		newItem.tags.push(subject);		
	}	
					
	var identifiers = ZU.xpath(dcMeta, "./dc:identifier", ns);
	for(var j=0; j<identifiers.length; j++) {
		var identifier = ZU.trimInternal(identifiers[j].textContent);
		if (identifier.substr(0, 4) == "doi:") {
			newItem.DOI = identifier.substr(4);
		}
		else if (identifier.substr(0, 7) == "http://") {
			newItem.url = identifier;
		}
	}

	var articleID = ZU.xpath(xml, "//n:GetRecord/n:record/n:header/n:identifier", ns)[0];
	if(articleID) articleID = ZU.trimInternal(articleID.textContent).substr(14); // Trim off oai:arXiv.org:
	
	var articleField = ZU.xpathText(xml, '//n:GetRecord/n:record/n:header/n:setSpec', ns);
	if (articleField) articleField = "[" + articleField.replace(/^.+?:/, "") + "]";
	
	if (articleID && articleID.indexOf("/") != -1) {
		newItem.publicationTitle = "arXiv:" + articleID;
	} else {
		newItem.publicationTitle = "arXiv:" + articleID + " " + articleField;
	}
	
	newItem.extra = 'arXiv: ' + articleID;
	
	newItem.attachments.push({
		title: 'arXiv:'+articleID + " PDF",
		url: "http://www.arxiv.org/pdf/" + articleID + ".pdf",
		mimeType: "application/pdf"
	});
	newItem.attachments.push({
		title: "arXiv.org Snapshot",
		url: newItem.url,
		mimeType:"text/html"
	});
	
	//retrieve and supplement publication data for published articles via DOI
	if (newItem.DOI) {
		var translate = Zotero.loadTranslator("search");
		// CrossRef
		translate.setTranslator("11645bd1-0420-45c1-badb-53fb41eeb753");
		
		var item = {"itemType":"journalArticle", "DOI": newItem.DOI};
		translate.setSearch(item);
		translate.setHandler("itemDone", function(obj, item) {
			//Z.debug(item)
			newItem.volume = item.volume;
			newItem.issue = item.issue;
			newItem.pages = item.pages;
			newItem.date = item.date;
			newItem.ISSN = item.ISSN;
			if (item.publicationTitle) {
				newItem.publicationTitle = item.publicationTitle;
			}
			newItem.date = item.date;
		});
		translate.setHandler("done", function() {
			newItem.complete();
		});
		translate.setHandler("error", function() {});
		translate.translate();
	} else {
		newItem.complete();
	}
}


function getXPathNodeTrimmed(dcMeta, name, ns) {
	var node = ZU.xpath(dcMeta, './'+name, ns);
	if(node.length) {
		return ZU.trimInternal(node[0].textContent);
	}
	return '';
}

function getCreatorNodes(dcMeta, name, newItem, creatorType, ns) {
	var nodes = ZU.xpath(dcMeta, './'+name, ns);
	for(var i=0; i<nodes.length; i++) {
		newItem.creators.push(
			ZU.cleanAuthor(nodes[i].textContent, creatorType, true)
		);
	}
}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://arxiv.org/list/astro-ph/new",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://arxiv.org/abs/1107.4612",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "A Model For Polarised Microwave Foreground Emission From Interstellar Dust",
				"creators": [
					{
						"firstName": "D. T.",
						"lastName": "O'Dea",
						"creatorType": "author"
					},
					{
						"firstName": "C. N.",
						"lastName": "Clark",
						"creatorType": "author"
					},
					{
						"firstName": "C. R.",
						"lastName": "Contaldi",
						"creatorType": "author"
					},
					{
						"firstName": "C. J.",
						"lastName": "MacTavish",
						"creatorType": "author"
					}
				],
				"date": "2012-01-11",
				"DOI": "10.1111/j.1365-2966.2011.19851.x",
				"ISSN": "00358711",
				"abstractNote": "The upcoming generation of cosmic microwave background (CMB) experiments face a major challenge in detecting the weak cosmic B-mode signature predicted as a product of primordial gravitational waves. To achieve the required sensitivity these experiments must have impressive control of systematic effects and detailed understanding of the foreground emission that will influence the signal. In this paper, we present templates of the intensity and polarisation of emission from one of the main Galactic foregrounds, interstellar dust. These are produced using a model which includes a 3D description of the Galactic magnetic field, examining both large and small scales. We also include in the model the details of the dust density, grain alignment and the intrinsic polarisation of the emission from an individual grain. We present here Stokes parameter template maps at 150GHz and provide an on-line repository (http://www.imperial.ac.uk/people/c.contaldi/fgpol) for these and additional maps at frequencies that will be targeted by upcoming experiments such as EBEX, Spider and SPTpol.",
				"extra": "arXiv: 1107.4612",
				"issue": "2",
				"libraryCatalog": "arXiv.org",
				"pages": "1795-1803",
				"publicationTitle": "Monthly Notices of the Royal Astronomical Society",
				"url": "http://arxiv.org/abs/1107.4612",
				"volume": "419",
				"attachments": [
					{
						"title": "arXiv:1107.4612 PDF",
						"mimeType": "application/pdf"
					},
					{
						"title": "arXiv.org Snapshot",
						"mimeType": "text/html"
					}
				],
				"tags": [
					"Astrophysics - Astrophysics of Galaxies",
					"Astrophysics - Cosmology and Nongalactic Astrophysics"
				],
				"notes": [
					{
						"note": "Comment: 7 pages, 4 figures"
					}
				],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://arxiv.org/abs/astro-ph/0603274",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Properties of the $\\delta$ Scorpii Circumstellar Disk from Continuum Modeling",
				"creators": [
					{
						"firstName": "A. C.",
						"lastName": "Carciofi",
						"creatorType": "author"
					},
					{
						"firstName": "A. S.",
						"lastName": "Miroshnichenko",
						"creatorType": "author"
					},
					{
						"firstName": "A. V.",
						"lastName": "Kusakin",
						"creatorType": "author"
					},
					{
						"firstName": "J. E.",
						"lastName": "Bjorkman",
						"creatorType": "author"
					},
					{
						"firstName": "K. S.",
						"lastName": "Bjorkman",
						"creatorType": "author"
					},
					{
						"firstName": "F.",
						"lastName": "Marang",
						"creatorType": "author"
					},
					{
						"firstName": "K. S.",
						"lastName": "Kuratov",
						"creatorType": "author"
					},
					{
						"firstName": "P. Garcí",
						"lastName": "a-Lario",
						"creatorType": "author"
					},
					{
						"firstName": "J. V. Perea",
						"lastName": "Calderón",
						"creatorType": "author"
					},
					{
						"firstName": "J.",
						"lastName": "Fabregat",
						"creatorType": "author"
					},
					{
						"firstName": "A. M.",
						"lastName": "Magalhães",
						"creatorType": "author"
					}
				],
				"date": "12/2006",
				"DOI": "10.1086/507935",
				"ISSN": "0004-637X, 1538-4357",
				"abstractNote": "We present optical $WBVR$ and infrared $JHKL$ photometric observations of the Be binary system $\\delta$ Sco, obtained in 2000--2005, mid-infrared (10 and $18 \\mu$m) photometry and optical ($\\lambda\\lambda$ 3200--10500 \\AA) spectropolarimetry obtained in 2001. Our optical photometry confirms the results of much more frequent visual monitoring of $\\delta$ Sco. In 2005, we detected a significant decrease in the object's brightness, both in optical and near-infrared brightness, which is associated with a continuous rise in the hydrogen line strenghts. We discuss possible causes for this phenomenon, which is difficult to explain in view of current models of Be star disks. The 2001 spectral energy distribution and polarization are succesfully modeled with a three-dimensional non-LTE Monte Carlo code which produces a self-consistent determination of the hydrogen level populations, electron temperature, and gas density for hot star disks. Our disk model is hydrostatically supported in the vertical direction and radially controlled by viscosity. Such a disk model has, essentially, only two free parameters, viz., the equatorial mass loss rate and the disk outer radius. We find that the primary companion is surrounded by a small (7 $R_\\star$), geometrically-thin disk, which is highly non-isothermal and fully ionized. Our model requires an average equatorial mass loss rate of $1.5\\times 10^{-9} M_{\\sun}$ yr$^{-1}$.",
				"extra": "arXiv: astro-ph/0603274",
				"issue": "2",
				"libraryCatalog": "arXiv.org",
				"pages": "1617-1625",
				"publicationTitle": "The Astrophysical Journal",
				"url": "http://arxiv.org/abs/astro-ph/0603274",
				"volume": "652",
				"attachments": [
					{
						"title": "arXiv:astro-ph/0603274 PDF",
						"mimeType": "application/pdf"
					},
					{
						"title": "arXiv.org Snapshot",
						"mimeType": "text/html"
					}
				],
				"tags": [
					"Astrophysics"
				],
				"notes": [
					{
						"note": "Comment: 27 pages, 9 figures, submitted to ApJ"
					}
				],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://arxiv.org/abs/1307.1469",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Precision of a Low-Cost InGaAs Detector for Near Infrared Photometry",
				"creators": [
					{
						"firstName": "Peter W.",
						"lastName": "Sullivan",
						"creatorType": "author"
					},
					{
						"firstName": "Bryce",
						"lastName": "Croll",
						"creatorType": "author"
					},
					{
						"firstName": "Robert A.",
						"lastName": "Simcoe",
						"creatorType": "author"
					}
				],
				"date": "09/2013",
				"DOI": "10.1086/672573",
				"ISSN": "00046280, 15383873",
				"abstractNote": "We have designed, constructed, and tested an InGaAs near-infrared camera to explore whether low-cost detectors can make small (<1 m) telescopes capable of precise (<1 mmag) infrared photometry of relatively bright targets. The camera is constructed around the 640x512 pixel APS640C sensor built by FLIR Electro-Optical Components. We designed custom analog-to-digital electronics for maximum stability and minimum noise. The InGaAs dark current halves with every 7 deg C of cooling, and we reduce it to 840 e-/s/pixel (with a pixel-to-pixel variation of +/-200 e-/s/pixel) by cooling the array to -20 deg C. Beyond this point, glow from the readout dominates. The single-sample read noise of 149 e- is reduced to 54 e- through up-the-ramp sampling. Laboratory testing with a star field generated by a lenslet array shows that 2-star differential photometry is possible to a precision of 631 +/-205 ppm (0.68 mmag) hr^-0.5 at a flux of 2.4E4 e-/s. Employing three comparison stars and de-correlating reference signals further improves the precision to 483 +/-161 ppm (0.52 mmag) hr^-0.5. Photometric observations of HD80606 and HD80607 (J=7.7 and 7.8) in the Y band shows that differential photometry to a precision of 415 ppm (0.45 mmag) hr^-0.5 is achieved with an effective telescope aperture of 0.25 m. Next-generation InGaAs detectors should indeed enable Poisson-limited photometry of brighter dwarfs with particular advantage for late-M and L types. In addition, one might acquire near-infrared photometry simultaneously with optical photometry or radial velocity measurements to maximize the return of exoplanet searches with small telescopes.",
				"extra": "arXiv: 1307.1469",
				"issue": "931",
				"libraryCatalog": "arXiv.org",
				"pages": "1021-1030",
				"publicationTitle": "Publications of the Astronomical Society of the Pacific",
				"url": "http://arxiv.org/abs/1307.1469",
				"volume": "125",
				"attachments": [
					{
						"title": "arXiv:1307.1469 PDF",
						"mimeType": "application/pdf"
					},
					{
						"title": "arXiv.org Snapshot",
						"mimeType": "text/html"
					}
				],
				"tags": [
					"Astrophysics - Earth and Planetary Astrophysics",
					"Astrophysics - Instrumentation and Methods for Astrophysics"
				],
				"notes": [
					{
						"note": "Comment: Accepted to PASP"
					}
				],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://xxx.lanl.gov/abs/1307.1469",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Precision of a Low-Cost InGaAs Detector for Near Infrared Photometry",
				"creators": [
					{
						"firstName": "Peter W.",
						"lastName": "Sullivan",
						"creatorType": "author"
					},
					{
						"firstName": "Bryce",
						"lastName": "Croll",
						"creatorType": "author"
					},
					{
						"firstName": "Robert A.",
						"lastName": "Simcoe",
						"creatorType": "author"
					}
				],
				"date": "09/2013",
				"DOI": "10.1086/672573",
				"ISSN": "00046280, 15383873",
				"abstractNote": "We have designed, constructed, and tested an InGaAs near-infrared camera to explore whether low-cost detectors can make small (<1 m) telescopes capable of precise (<1 mmag) infrared photometry of relatively bright targets. The camera is constructed around the 640x512 pixel APS640C sensor built by FLIR Electro-Optical Components. We designed custom analog-to-digital electronics for maximum stability and minimum noise. The InGaAs dark current halves with every 7 deg C of cooling, and we reduce it to 840 e-/s/pixel (with a pixel-to-pixel variation of +/-200 e-/s/pixel) by cooling the array to -20 deg C. Beyond this point, glow from the readout dominates. The single-sample read noise of 149 e- is reduced to 54 e- through up-the-ramp sampling. Laboratory testing with a star field generated by a lenslet array shows that 2-star differential photometry is possible to a precision of 631 +/-205 ppm (0.68 mmag) hr^-0.5 at a flux of 2.4E4 e-/s. Employing three comparison stars and de-correlating reference signals further improves the precision to 483 +/-161 ppm (0.52 mmag) hr^-0.5. Photometric observations of HD80606 and HD80607 (J=7.7 and 7.8) in the Y band shows that differential photometry to a precision of 415 ppm (0.45 mmag) hr^-0.5 is achieved with an effective telescope aperture of 0.25 m. Next-generation InGaAs detectors should indeed enable Poisson-limited photometry of brighter dwarfs with particular advantage for late-M and L types. In addition, one might acquire near-infrared photometry simultaneously with optical photometry or radial velocity measurements to maximize the return of exoplanet searches with small telescopes.",
				"extra": "arXiv: 1307.1469",
				"issue": "931",
				"libraryCatalog": "arXiv.org",
				"pages": "1021-1030",
				"publicationTitle": "Publications of the Astronomical Society of the Pacific",
				"url": "http://arxiv.org/abs/1307.1469",
				"volume": "125",
				"attachments": [
					{
						"title": "arXiv:1307.1469 PDF",
						"mimeType": "application/pdf"
					},
					{
						"title": "arXiv.org Snapshot",
						"mimeType": "text/html"
					}
				],
				"tags": [
					"Astrophysics - Earth and Planetary Astrophysics",
					"Astrophysics - Instrumentation and Methods for Astrophysics"
				],
				"notes": [
					{
						"note": "Comment: Accepted to PASP"
					}
				],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://arxiv.org/find/cs/1/au:+Hoffmann_M/0/1/0/all/0/1",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://arxiv.org/pdf/1402.1516.pdf",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "A dual pair for free boundary fluids",
				"creators": [
					{
						"firstName": "Francois",
						"lastName": "Gay-Balmaz",
						"creatorType": "author"
					},
					{
						"firstName": "Cornelia",
						"lastName": "Vizman",
						"creatorType": "author"
					}
				],
				"date": "2014-02-06",
				"abstractNote": "We construct a dual pair associated to the Hamiltonian geometric formulation of perfect fluids with free boundaries. This dual pair is defined on the cotangent bundle of the space of volume preserving embeddings of a manifold with boundary into a boundaryless manifold of the same dimension. The dual pair properties are rigorously verified in the infinite dimensional Fr\\'echet manifold setting. It provides an example of a dual pair associated to actions that are not completely mutually orthogonal.",
				"extra": "arXiv: 1402.1516",
				"libraryCatalog": "arXiv.org",
				"publicationTitle": "arXiv:1402.1516 [math-ph]",
				"url": "http://arxiv.org/abs/1402.1516",
				"attachments": [
					{
						"title": "arXiv:1402.1516 PDF",
						"mimeType": "application/pdf"
					},
					{
						"title": "arXiv.org Snapshot",
						"mimeType": "text/html"
					}
				],
				"tags": [
					"Mathematical Physics",
					"Mathematics - Symplectic Geometry"
				],
				"notes": [
					{
						"note": "Comment: 17 pages"
					}
				],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/