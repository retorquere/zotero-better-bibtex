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
	"lastUpdated": "2019-10-22 05:31:06"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2019 Sean Takats and Michael Berkowitz

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

function detectSearch(item) {
	return !!item.arXiv;
}

function doSearch(item) {
	var url = 'https://export.arxiv.org/oai2?verb=GetRecord&metadataPrefix=oai_dc'
		+ '&identifier=oai%3AarXiv.org%3A' + encodeURIComponent(item.arXiv);
	ZU.doGet(url, parseXML);
}


var version;
// this variable will be set in doWeb and
// can be used then afterwards in the parseXML


function detectWeb(doc, url) {
	var searchRe = /^https?:\/\/(?:([^.]+\.))?(?:arxiv\.org|xxx\.lanl\.gov)\/(?:find|list|catchup)/;
	
	if (searchRe.test(url)) {
		return "multiple";
	}
	else {
		return "journalArticle";
	}
}

function doWeb(doc, url) {
	if (detectWeb(doc, url) == 'multiple') {
		var rows = ZU.xpath(doc, '//div[@id="dlpage"]/dl/dt');
		var getTitleId;
		if (rows.length) {
			// arXiv.org format
			getTitleId = function (row) {
				var id = ZU.xpathText(row, './/a[@title="Abstract"]').trim().substr(6); // Trim off arXiv:
				var title = ZU.trimInternal(
					ZU.xpathText(row, './following-sibling::dd[1]//div[contains(@class, "list-title")]/text()[last()]'));
				return {
					title: title,
					id: id
				};
			};
		}
		else if ((rows = ZU.xpath(doc, '//table/tbody/tr[./td[@class="lti"]]')).length) {
			// eprintweb.org format
			getTitleId = function (row) {
				var title = ZU.trimInternal(ZU.xpathText(row, './td'));
				var id = ZU.xpathText(row, './following-sibling::tr[.//a][1]/td/b').trim().substr(6);
				return {
					title: title,
					id: id
				};
			};
		}
		else {
			throw new Error("Unrecognized multiples format");
		}
		
		var items = {};
		for (let i = 0; i < rows.length; i++) {
			var row = getTitleId(rows[i]);
			items[row.id] = row.title;
		}
		
		Z.selectItems(items, function (items) {
			if (!items) return;
			
			var urls = [];
			for (var id in items) {
				urls.push('http://export.arxiv.org/oai2'
					+ '?verb=GetRecord&metadataPrefix=oai_dc'
					+ '&identifier=oai%3AarXiv.org%3A' + encodeURIComponent(id)
				);
			}
			
			ZU.doGet(urls, parseXML);
		});
	}
	else {
		var id;
		var versionMatch = url.match(/v(\d+)(\.pdf)?([?#].+)?$/);
		if (versionMatch) {
			version = versionMatch[1];
		}
		var p = url.indexOf("/pdf/");
		if (p > -1) {
			id = url.substring(p + 5, url.length - 4);
		}
		else {
			id = ZU.xpathText(doc, '(//span[@class="arxivid"]/a)[1]')
				|| ZU.xpathText(doc, '//b[starts-with(normalize-space(text()),"arXiv:")]');
		}
		if (!id) throw new Error('Could not find arXiv ID on page.');
		id = id.trim().replace(/^arxiv:\s*|v\d+|\s+.*$/ig, '');
		var apiurl = 'http://export.arxiv.org/oai2?verb=GetRecord&metadataPrefix=oai_dc'
			+ '&identifier=oai%3AarXiv.org%3A' + encodeURIComponent(id);
		ZU.doGet(apiurl, parseXML);
	}
}


function parseXML(text) {
	// Z.debug(text);
	/* eslint camelcase: ["error", { allow: ["oai_dc"] }] */
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
	var dates = ZU.xpath(dcMeta, './dc:date', ns)
		.map(element => element.textContent)
		.sort();
	if (dates.length > 0) {
		if (version && version < dates.length) {
			newItem.date = dates[version - 1];
		}
		else {
			// take the latest date
			newItem.date = dates[dates.length - 1];
		}
	}
	
	
	var descriptions = ZU.xpath(dcMeta, "./dc:description", ns);
	
	// Put the first description into abstract, all other into notes.
	if (descriptions.length > 0) {
		newItem.abstractNote = ZU.trimInternal(descriptions[0].textContent);
		for (let j = 1; j < descriptions.length; j++) {
			var noteStr = ZU.trimInternal(descriptions[j].textContent);
			newItem.notes.push({ note: noteStr });
		}
	}
	var subjects = ZU.xpath(dcMeta, "./dc:subject", ns);
	for (let j = 0; j < subjects.length; j++) {
		var subject = ZU.trimInternal(subjects[j].textContent);
		newItem.tags.push(subject);
	}
					
	var identifiers = ZU.xpath(dcMeta, "./dc:identifier", ns);
	for (let j = 0; j < identifiers.length; j++) {
		var identifier = ZU.trimInternal(identifiers[j].textContent);
		if (identifier.substr(0, 4) == "doi:") {
			newItem.DOI = identifier.substr(4);
		}
		else if (identifier.substr(0, 7) == "http://") {
			newItem.url = identifier;
		}
	}

	var articleID = ZU.xpath(xml, "//n:GetRecord/n:record/n:header/n:identifier", ns)[0];
	if (articleID) articleID = ZU.trimInternal(articleID.textContent).substr(14); // Trim off oai:arXiv.org:
	
	var articleField = ZU.xpathText(xml, '//n:GetRecord/n:record/n:header/n:setSpec', ns);
	if (articleField) articleField = "[" + articleField.replace(/^.+?:/, "") + "]";
	
	if (articleID && articleID.includes("/")) {
		newItem.publicationTitle = "arXiv:" + articleID;
	}
	else {
		newItem.publicationTitle = "arXiv:" + articleID + " " + articleField;
	}
	
	newItem.extra = 'arXiv: ' + articleID;
	if (version) {
		newItem.extra += '\nversion: ' + version;
	}
	
	var pdfUrl = "https://arxiv.org/pdf/" + articleID + (version ? "v" + version : "") + ".pdf";
	newItem.attachments.push({
		title: "arXiv Fulltext PDF",
		url: pdfUrl,
		mimeType: "application/pdf"
	});
	newItem.attachments.push({
		title: "arXiv.org Snapshot",
		url: newItem.url,
		mimeType: "text/html"
	});
	
	// retrieve and supplement publication data for published articles via DOI
	if (newItem.DOI) {
		var translate = Zotero.loadTranslator("search");
		// CrossRef
		translate.setTranslator("b28d0d42-8549-4c6d-83fc-8382874a5cb9");
		
		var item = { itemType: "journalArticle", DOI: newItem.DOI };
		translate.setSearch(item);
		translate.setHandler("itemDone", function (obj, item) {
			// Z.debug(item)
			newItem.volume = item.volume;
			newItem.issue = item.issue;
			newItem.pages = item.pages;
			newItem.date = item.date;
			newItem.ISSN = item.ISSN;
			if (item.publicationTitle) {
				newItem.publicationTitle = item.publicationTitle;
				newItem.journalAbbreviation = item.journalAbbreviation;
			}
			newItem.date = item.date;
		});
		translate.setHandler("done", function () {
			newItem.complete();
		});
		translate.setHandler("error", function () {});
		translate.translate();
	}
	else {
		newItem.complete();
	}
}


function getXPathNodeTrimmed(dcMeta, name, ns) {
	var node = ZU.xpath(dcMeta, './' + name, ns);
	if (node.length) {
		return ZU.trimInternal(node[0].textContent);
	}
	return '';
}

function getCreatorNodes(dcMeta, name, newItem, creatorType, ns) {
	var nodes = ZU.xpath(dcMeta, './' + name, ns);
	for (var i = 0; i < nodes.length; i++) {
		newItem.creators.push(
			ZU.cleanAuthor(nodes[i].textContent, creatorType, true)
		);
	}
}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://arxiv.org/list/astro-ph/new",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://arxiv.org/abs/1107.4612",
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
						"title": "arXiv Fulltext PDF",
						"mimeType": "application/pdf"
					},
					{
						"title": "arXiv.org Snapshot",
						"mimeType": "text/html"
					}
				],
				"tags": [
					{
						"tag": "Astrophysics - Astrophysics of Galaxies"
					},
					{
						"tag": "Astrophysics - Cosmology and Nongalactic Astrophysics"
					}
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
		"url": "https://arxiv.org/abs/astro-ph/0603274",
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
				"journalAbbreviation": "ApJ",
				"libraryCatalog": "arXiv.org",
				"pages": "1617-1625",
				"publicationTitle": "The Astrophysical Journal",
				"url": "http://arxiv.org/abs/astro-ph/0603274",
				"volume": "652",
				"attachments": [
					{
						"title": "arXiv Fulltext PDF",
						"mimeType": "application/pdf"
					},
					{
						"title": "arXiv.org Snapshot",
						"mimeType": "text/html"
					}
				],
				"tags": [
					{
						"tag": "Astrophysics"
					}
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
		"url": "https://arxiv.org/abs/1307.1469",
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
				"journalAbbreviation": "Publications of the Astronomical Society of the Pacific",
				"libraryCatalog": "arXiv.org",
				"pages": "1021-1030",
				"publicationTitle": "Publications of the Astronomical Society of the Pacific",
				"url": "http://arxiv.org/abs/1307.1469",
				"volume": "125",
				"attachments": [
					{
						"title": "arXiv Fulltext PDF",
						"mimeType": "application/pdf"
					},
					{
						"title": "arXiv.org Snapshot",
						"mimeType": "text/html"
					}
				],
				"tags": [
					{
						"tag": "Astrophysics - Earth and Planetary Astrophysics"
					},
					{
						"tag": "Astrophysics - Instrumentation and Methods for Astrophysics"
					}
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
		"url": "https://arxiv.org/find/cs/1/au:+Hoffmann_M/0/1/0/all/0/1",
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
	},
	{
		"type": "web",
		"url": "https://arxiv.org/abs/1810.04805v1",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding",
				"creators": [
					{
						"firstName": "Jacob",
						"lastName": "Devlin",
						"creatorType": "author"
					},
					{
						"firstName": "Ming-Wei",
						"lastName": "Chang",
						"creatorType": "author"
					},
					{
						"firstName": "Kenton",
						"lastName": "Lee",
						"creatorType": "author"
					},
					{
						"firstName": "Kristina",
						"lastName": "Toutanova",
						"creatorType": "author"
					}
				],
				"date": "2018-10-10",
				"abstractNote": "We introduce a new language representation model called BERT, which stands for Bidirectional Encoder Representations from Transformers. Unlike recent language representation models, BERT is designed to pre-train deep bidirectional representations from unlabeled text by jointly conditioning on both left and right context in all layers. As a result, the pre-trained BERT model can be fine-tuned with just one additional output layer to create state-of-the-art models for a wide range of tasks, such as question answering and language inference, without substantial task-specific architecture modifications. BERT is conceptually simple and empirically powerful. It obtains new state-of-the-art results on eleven natural language processing tasks, including pushing the GLUE score to 80.5% (7.7% point absolute improvement), MultiNLI accuracy to 86.7% (4.6% absolute improvement), SQuAD v1.1 question answering Test F1 to 93.2 (1.5 point absolute improvement) and SQuAD v2.0 Test F1 to 83.1 (5.1 point absolute improvement).",
				"extra": "arXiv: 1810.04805\nversion: 1",
				"libraryCatalog": "arXiv.org",
				"publicationTitle": "arXiv:1810.04805 [cs]",
				"shortTitle": "BERT",
				"url": "http://arxiv.org/abs/1810.04805",
				"attachments": [
					{
						"title": "arXiv Fulltext PDF",
						"mimeType": "application/pdf"
					},
					{
						"title": "arXiv.org Snapshot",
						"mimeType": "text/html"
					}
				],
				"tags": [
					{
						"tag": "Computer Science - Computation and Language"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://arxiv.org/abs/1810.04805v2",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding",
				"creators": [
					{
						"firstName": "Jacob",
						"lastName": "Devlin",
						"creatorType": "author"
					},
					{
						"firstName": "Ming-Wei",
						"lastName": "Chang",
						"creatorType": "author"
					},
					{
						"firstName": "Kenton",
						"lastName": "Lee",
						"creatorType": "author"
					},
					{
						"firstName": "Kristina",
						"lastName": "Toutanova",
						"creatorType": "author"
					}
				],
				"date": "2019-05-24",
				"abstractNote": "We introduce a new language representation model called BERT, which stands for Bidirectional Encoder Representations from Transformers. Unlike recent language representation models, BERT is designed to pre-train deep bidirectional representations from unlabeled text by jointly conditioning on both left and right context in all layers. As a result, the pre-trained BERT model can be fine-tuned with just one additional output layer to create state-of-the-art models for a wide range of tasks, such as question answering and language inference, without substantial task-specific architecture modifications. BERT is conceptually simple and empirically powerful. It obtains new state-of-the-art results on eleven natural language processing tasks, including pushing the GLUE score to 80.5% (7.7% point absolute improvement), MultiNLI accuracy to 86.7% (4.6% absolute improvement), SQuAD v1.1 question answering Test F1 to 93.2 (1.5 point absolute improvement) and SQuAD v2.0 Test F1 to 83.1 (5.1 point absolute improvement).",
				"extra": "arXiv: 1810.04805\nversion: 2",
				"libraryCatalog": "arXiv.org",
				"publicationTitle": "arXiv:1810.04805 [cs]",
				"shortTitle": "BERT",
				"url": "http://arxiv.org/abs/1810.04805",
				"attachments": [
					{
						"title": "arXiv Fulltext PDF",
						"mimeType": "application/pdf"
					},
					{
						"title": "arXiv.org Snapshot",
						"mimeType": "text/html"
					}
				],
				"tags": [
					{
						"tag": "Computer Science - Computation and Language"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/
