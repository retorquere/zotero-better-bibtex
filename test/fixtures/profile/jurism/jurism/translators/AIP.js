{
	"translatorID": "48d3b115-7e09-4134-ad5d-0beda6296761",
	"label": "AIP",
	"creator": "Aurimas Vinckevicius",
	"target": "^https?://scitation\\.aip\\.org/(search\\?|content/)",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2015-10-17 17:37:33"
}

function getSearchResults(doc) {
	return doc.getElementsByClassName("resultItem");
}

function detectWeb(doc, url) {
	if (url.indexOf('search') !== -1 && getSearchResults(doc).length) {
		return 'multiple';
	}
	
	if (ZU.xpathText(doc, '/html/head/meta[@name="citation_journal_title"]/@content')) {
		return 'journalArticle';
	}
	else if (doc.body.id == 'conferencepaper') return "conferencePaper"
}
function doWeb(doc, url) {
	if (detectWeb(doc, url) == 'multiple') {
		var results = getSearchResults(doc);
		var items = {};
		for (var i=0, n=results.length; i<n; i++) {
			var title = ZU.xpath(results[i], './/div[@class="title"]/a')[0];
			items[title.href] = ZU.trimInternal(title.textContent);
		}
		
		Z.selectItems(items, function(selectedItems) {
			if (!selectedItems) return true;
			
			var urls = [];
			for (var i in selectedItems) {
				urls.push(i);
			}
			
			ZU.processDocuments(urls, scrape);
		})
	} else {
		scrape(doc, url);
	}
}

function scrape(doc, url) {
	//use Embedded Metadata
	var translator = Z.loadTranslator('web');
	translator.setTranslator('951c027d-74ac-47d4-a107-9c3069ab7b48');
	translator.setDocument(doc);
	
	translator.setHandler('itemDone', function(obj, item) {
		//for conference papers, we're missing some metadata
		if (!item.publicationTitle
			&& ZU.xpath(doc, '//div[@id="breadcrumb"]/a[@title="Link to conference proceedings"]').length) {
			item.publicationTitle = "AIP Conference Proceedings";
			item.volume = ZU.xpathText(doc, '//div[@class="itemCitation"]//span[@class="citationvolume"]');
		}
		
		//check if we have the correct publication date
		var year = doc.getElementsByClassName('itemCitation')[0];
		if (year) year = year.textContent.match(/\((\d{4})\)/);
		if (year && (!item.date || item.date.indexOf(year[1]) == -1) ) {
			item.date = year[1];
		}
		
		
		var pdf = ZU.xpath(doc, '//div[@class="pdfItem"]/a[@class="pdf" and @href]')[0];
		if (pdf) {
			item.attachments.push({
				title: "Full Text PDF",
				url: pdf.href,
				mimeType: 'application/pdf'
			});
		}
		
		var keywords = ZU.xpath(doc, '//div[@class="keywords-container"]//dt/a');
		var tags = [];
		for (var i=0, n=keywords.length; i<n; i++) {
			tags.push(ZU.trimInternal(keywords[i].textContent));
		}
		if (tags.length) {
			item.tags = tags;
		}
		
		item.complete();
	});
	
	translator.translate();
}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://scitation.aip.org/content/aip/journal/aplmater/1/2/10.1063/1.4818002",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"firstName": "Ian",
						"lastName": "MacLaren",
						"creatorType": "author"
					},
					{
						"firstName": "LiQiu",
						"lastName": "Wang",
						"creatorType": "author"
					},
					{
						"firstName": "Owen",
						"lastName": "Morris",
						"creatorType": "author"
					},
					{
						"firstName": "Alan J.",
						"lastName": "Craven",
						"creatorType": "author"
					},
					{
						"firstName": "Robert L.",
						"lastName": "Stamps",
						"creatorType": "author"
					},
					{
						"firstName": "Bernhard",
						"lastName": "Schaffer",
						"creatorType": "author"
					},
					{
						"firstName": "Quentin M.",
						"lastName": "Ramasse",
						"creatorType": "author"
					},
					{
						"firstName": "Shu",
						"lastName": "Miao",
						"creatorType": "author"
					},
					{
						"firstName": "Kambiz",
						"lastName": "Kalantari",
						"creatorType": "author"
					},
					{
						"firstName": "Iasmi",
						"lastName": "Sterianou",
						"creatorType": "author"
					},
					{
						"firstName": "Ian M.",
						"lastName": "Reaney",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [
					"Antiferroelectricity",
					"Antiferroelectricity",
					"Dielectric oxides",
					"Dielectric oxides",
					"Image reconstruction",
					"Image reconstruction",
					"Iron group ions",
					"Iron group ions",
					"Ozone",
					"Ozone"
				],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Snapshot"
					},
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					}
				],
				"title": "Local stabilisation of polar order at charged antiphase boundaries in antiferroelectric (Bi0.85Nd0.15)(Ti0.1Fe0.9)O3",
				"date": "2013/08/01",
				"publicationTitle": "APL Materials",
				"volume": "1",
				"issue": "2",
				"abstractNote": "Observation of an unusual, negatively-charged antiphase boundary in (Bi0.85Nd0.15)(Ti0.1Fe0.9)O3 is reported. Aberration corrected scanning transmission electron microscopy is used to establish the full three dimensional structure of this boundary including O-ion positions to ∼±10 pm. The charged antiphase boundary stabilises tetragonally distorted regions with a strong polar ordering to either side of the boundary, with a characteristic length scale determined by the excess charge trapped at the boundary. Far away from the boundary the crystal relaxes into the well-known Nd-stabilised antiferroelectric phase.",
				"DOI": "10.1063/1.4818002",
				"pages": "021102",
				"ISSN": "2166-532X",
				"url": "http://scitation.aip.org/content/aip/journal/aplmater/1/2/10.1063/1.4818002",
				"libraryCatalog": "scitation.aip.org"
			}
		]
	},
	{
		"type": "web",
		"url": "http://scitation.aip.org/content/aip/proceeding/aipcp/10.1063/1.4756630",
		"items": [
			{
				"itemType": "conferencePaper",
				"creators": [
					{
						"firstName": "S.",
						"lastName": "Št'astník",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [
					"Advanced materials",
					"Insulator surfaces",
					"Materials science",
					"Numerical analysis",
					"Surface finishing"
				],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Snapshot"
					},
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					}
				],
				"title": "Evaluation of thermal resistance of building insulations with reflective surfaces",
				"publisher": "AIP Publishing",
				"date": "2012/09/26",
				"volume": "1479",
				"conferenceName": "NUMERICAL ANALYSIS AND APPLIED MATHEMATICS ICNAAM 2012: International Conference of Numerical Analysis and Applied Mathematics",
				"abstractNote": "The thermal resistance of advanced insulation materials, applied namely in civil engineering, containing reflective surfaces and air gaps, cannot be evaluated correctly using the valid European standards because of presence of the dominant nonlinear radiative heat transfer and other phenomena not included in the recommended computational formulae. The proper general physical analysis refers to rather complicated problems from classical thermodynamics, whose both existence theory and numerical analysis contain open questions and cannot be done in practice when the optimization of composition of insulation layers is required. This paper, coming from original experimental results, demonstrates an alternative simplified computational approach, taking into account the most important physical processes, useful in the design of modern insulation systems.",
				"DOI": "10.1063/1.4756630",
				"pages": "2204-2207",
				"url": "http://scitation.aip.org/content/aip/proceeding/aipcp/10.1063/1.4756630",
				"libraryCatalog": "scitation.aip.org",
				"proceedingsTitle": "AIP Conference Proceedings"
			}
		]
	},
	{
		"type": "web",
		"url": "http://scitation.aip.org/search?value1=insulation&option1=all&option12=resultCategory&value12=ResearchPublicationContent",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://scitation.aip.org/content/aip/journal/jap/49/3/10.1063/1.324716",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"firstName": "L.",
						"lastName": "Berger",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [
					"Carrier generation",
					"Conduction electrons",
					"Domain walls",
					"Iron",
					"Magnetoresistance"
				],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Snapshot"
					},
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					}
				],
				"title": "Low‐field magnetoresistance and domain drag in ferromagnets",
				"date": "1978/03/01",
				"publicationTitle": "Journal of Applied Physics",
				"volume": "49",
				"issue": "3",
				"abstractNote": "Despite common misconceptions, domain walls are too thick to ’’scatter’’ electrons appreciably. However, electrons crossing a wall apply a torque to it, which tends to cant the wall spins. This could be used to measure the conduction electron spin polarization. Most of the low‐field resistive anomalies observed in pure Fe, Ni and Co at low temperature are caused by the Lorentz force associated with the internal field B=M s present inside each domain. The existence of low‐resistivity paths extending over many domains accounts for still unexplained magnetoresistance data in ironwhiskers. In uniaxial materials, a d.c. eddy‐current loop caused by the Hall effect runs around each wall. The field H z generated by these loops tends to ’’drag’’ the whole domain structure in the direction of the carrier drift velocity. Also, the Joule dissipation of the eddy currents manifests itself as an excess Ohmic resistance. As predicted, this excess resistance decreases as the square of the field, in amorphous Gd25Co75 films, in MnBi films, and in pure bulk cobalt, when the walls are removed by an external field. The excess resistance can also be changed by reorienting the walls.",
				"DOI": "10.1063/1.324716",
				"pages": "2156-2161",
				"ISSN": "0021-8979, 1089-7550",
				"url": "http://scitation.aip.org/content/aip/journal/jap/49/3/10.1063/1.324716",
				"libraryCatalog": "scitation.aip.org"
			}
		]
	}
]
/** END TEST CASES **/