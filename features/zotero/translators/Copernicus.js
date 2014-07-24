{
	"translatorID": "8082115d-5bc6-4517-a4e8-abed1b2a784a",
	"label": "Copernicus",
	"creator": "Michael Berkowitz",
	"target": "^https?://www\\.(?:adv-sci-res|earth-syst-dynam|adv-geosci|adv-radio-sci|ann-geophys|astrophys-space-sci-trans|atmos-chem-phys|atmos-meas-tech|biogeosciences|clim-past|electronic-earth|hydrol-earth-syst-sci|nat-hazards-earth-syst-sci|nonlin-processes-geophys|ocean-sci|soc-geogr|surv-perspect-integr-environ-soc|the-cryosphere|geosci-model-dev)(?:-discuss)?\\.net/",
	"minVersion": "2.1",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2014-03-31 13:44:16"
}

function detectWeb(doc, url) {
	if (doc.evaluate('//div[@id="publisher"]/iframe', doc, null, XPathResult.ANY_TYPE, null).iterateNext() || doc.evaluate('//td[*[a[contains(text(), "Abstract")]]]', doc, null, XPathResult.ANY_TYPE, null).iterateNext()) {
		return "multiple";
	} else if (doc.title.match(/Abstract/)) {
		return "journalArticle";
	}
}

function scrape (doc, url){
	var abstract = ZU.xpathText(doc, '//span[@class="pb_abstract"]');
	var link = url.replace(/\.html.*/, ".ris");
	Zotero.Utilities.HTTP.doGet(link, function(text) {
		var translator = Zotero.loadTranslator("import");
		translator.setTranslator("32d59d2d-b65a-4da4-b0a3-bdd3cfb979e7");
		translator.setString(text);
		translator.setHandler("itemDone", function(obj, item) {
			item.repository = "Copernicus Online Journals";
			if (!item.abstractNote && abstract){
				item.abstractNote = abstract.replace(/\n(?!\n)\s*/g, " ").replace(/^Abstract\.\s*/, ""); //preserve paragraphs but not line breaks all over
			}
			if(item.attachments[0]) {
				item.attachments[0].title = item.publicationTitle + " PDF";
				item.attachments[0].mimeType = "application/pdf";
			}

			item.attachments.push({
				title: item.publicationTitle + " Snapshot",
				url: item.url,
				mimeType: "text/html",
				snapshot: true
			})
			item.complete();
		});
		translator.translate();
	});
}

function doWeb(doc, url) {
	var arts = new Array();
	if (detectWeb(doc, url) == "multiple") {
		var items = new Object();
		if (doc.evaluate('//div[@id="publisher"]/iframe', doc, null, XPathResult.ANY_TYPE, null).iterateNext()) {
			var link = doc.evaluate('//div[@id="publisher"]/iframe', doc, null, XPathResult.ANY_TYPE, null).iterateNext().src;
			Zotero.Utilities.HTTP.doGet(link, function(text) {
				var links = text.match(/<a\s+target=\"_top\"\s+href=\"[^"]+\">[^<]+/g);
				for (var i =0; i<links.length; i++) {
					var link = links[i].match(/href=\"([^"]+)\">(.*)/);
					items[link[1]] = Zotero.Utilities.trimInternal(link[2]) + "...";
				}
				Zotero.selectItems(items, function (items) {
					if (!items) {
						Zotero.done();
						return true;
					}
					for (var i in items) {
						arts.push(i);
					}
					ZU.processDocuments(arts, scrape);
				});
			})
		} else {
			var titles = doc.evaluate('//td[*[a[contains(text(), "Abstract")]]]/span[@class="pb_toc_article_title"]', doc, null, XPathResult.ANY_TYPE, null);
			var links = doc.evaluate('//td[*[a[contains(text(), "Abstract")]]]//a[1]', doc, null, XPathResult.ANY_TYPE, null);
			var title;
			var link;
			while ((title = titles.iterateNext()) && (link = links.iterateNext())) {
				items[link.href] = title.textContent;
			}
			Zotero.selectItems(items, function (items) {
				if (!items) {
					Zotero.done();
					return true;
				}
				for (var i in items) {
					arts.push(i);
				}
				ZU.processDocuments(arts, scrape);
			});
		}
	} else {
		scrape(doc, url)
	}
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.adv-geosci.net/30/1/2011/adgeo-30-1-2011.html",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"lastName": "Michaelides",
						"firstName": "S.",
						"creatorType": "author"
					},
					{
						"lastName": "Athanasatos",
						"firstName": "S.",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Adv. Geosci. PDF",
						"downloadable": true,
						"mimeType": "application/pdf"
					},
					{
						"title": "Adv. Geosci. Snapshot",
						"mimeType": "text/html",
						"snapshot": true
					}
				],
				"title": "Preface ''Precipitation: Measurement, Climatology, Remote Sensing, and Modeling (EGU 2010)''",
				"journalAbbreviation": "Adv. Geosci.",
				"volume": "30",
				"pages": "1-2",
				"date": "May 9, 2011",
				"publisher": "Copernicus Publications",
				"ISSN": "1680-7359",
				"url": "http://www.adv-geosci.net/30/1/2011/",
				"DOI": "10.5194/adgeo-30-1-2011",
				"publicationTitle": "Adv. Geosci.",
				"abstractNote": "No abstract available.",
				"libraryCatalog": "Copernicus Online Journals",
				"accessDate": "CURRENT_TIMESTAMP",
				"shortTitle": "Preface ''Precipitation"
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.adv-radio-sci.net/6/1/2008/ars-6-1-2008.html",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"lastName": "Will",
						"firstName": "B.",
						"creatorType": "author"
					},
					{
						"lastName": "Gerding",
						"firstName": "M.",
						"creatorType": "author"
					},
					{
						"lastName": "Schultz",
						"firstName": "S.",
						"creatorType": "author"
					},
					{
						"lastName": "Schiek",
						"firstName": "B.",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Adv. Radio Sci. PDF",
						"downloadable": true,
						"mimeType": "application/pdf"
					},
					{
						"title": "Adv. Radio Sci. Snapshot",
						"mimeType": "text/html",
						"snapshot": true
					}
				],
				"title": "Time domain reflectrometry measurements using a movable obstacle for the determination of dielectric profiles",
				"journalAbbreviation": "Adv. Radio Sci.",
				"volume": "6",
				"pages": "1-4",
				"date": "May 26, 2008",
				"publisher": "Copernicus Publications",
				"ISSN": "1684-9973",
				"url": "http://www.adv-radio-sci.net/6/1/2008/",
				"DOI": "10.5194/ars-6-1-2008",
				"publicationTitle": "Adv. Radio Sci.",
				"abstractNote": "Microwave techniques for the measurement of the permittivity of soils including the water content of soils and other materials, especially TDR (time domain reflectometry), have become accepted as routine measurement techniques. This summary deals with an advanced use of the TDR principle for the determination of the water content of soil along a probe. The basis of the advanced TDR technique is a waveguide, which is inserted into the soil for obtaining measurements of the effective soil permittivity, from which the water content is estimated, and an obstacle, which can mechanically be moved along the probe and which acts as a reference reflection for the TDR system with an exactly known position. Based on the known mechanical position of the reference reflection, the measured electrical position can be used as a measure for the effective dielectric constant of the environment. Thus, it is possible to determine the effective dielectric constant with a spatial resolution given by the step size of the obstacle displacement.\n\n A conventional industrial TDR-system, operating in the baseband, is used for the signal generation and for the evaluation of the pulse delay time of the obstacle reflection. Thus, a cost effective method for the acquisition of the dielectric measurement data is available.",
				"libraryCatalog": "Copernicus Online Journals",
				"accessDate": "CURRENT_TIMESTAMP"
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.adv-geosci.net/title_and_author_search.html?x=0&y=0&title=measurement",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://www.atmos-chem-phys-discuss.net/14/2307/2014/acpd-14-2307-2014.html",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"lastName": "Thompson",
						"firstName": "R. L.",
						"creatorType": "author"
					},
					{
						"lastName": "Patra",
						"firstName": "P. K.",
						"creatorType": "author"
					},
					{
						"lastName": "Ishijima",
						"firstName": "K.",
						"creatorType": "author"
					},
					{
						"lastName": "Saikawa",
						"firstName": "E.",
						"creatorType": "author"
					},
					{
						"lastName": "Corazza",
						"firstName": "M.",
						"creatorType": "author"
					},
					{
						"lastName": "Karstens",
						"firstName": "U.",
						"creatorType": "author"
					},
					{
						"lastName": "Wilson",
						"firstName": "C.",
						"creatorType": "author"
					},
					{
						"lastName": "Bergamaschi",
						"firstName": "P.",
						"creatorType": "author"
					},
					{
						"lastName": "Dlugokencky",
						"firstName": "E.",
						"creatorType": "author"
					},
					{
						"lastName": "Sweeney",
						"firstName": "C.",
						"creatorType": "author"
					},
					{
						"lastName": "Prinn",
						"firstName": "R. G.",
						"creatorType": "author"
					},
					{
						"lastName": "Weiss",
						"firstName": "R. F.",
						"creatorType": "author"
					},
					{
						"lastName": "O'Doherty",
						"firstName": "S.",
						"creatorType": "author"
					},
					{
						"lastName": "Fraser",
						"firstName": "P. J.",
						"creatorType": "author"
					},
					{
						"lastName": "Steele",
						"firstName": "L. P.",
						"creatorType": "author"
					},
					{
						"lastName": "Krummel",
						"firstName": "P. B.",
						"creatorType": "author"
					},
					{
						"lastName": "Saunois",
						"firstName": "M.",
						"creatorType": "author"
					},
					{
						"lastName": "Chipperfield",
						"firstName": "M.",
						"creatorType": "author"
					},
					{
						"lastName": "Bousquet",
						"firstName": "P.",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Atmos. Chem. Phys. Discuss. PDF",
						"downloadable": true,
						"mimeType": "application/pdf"
					},
					{
						"title": "Atmos. Chem. Phys. Discuss. Snapshot",
						"mimeType": "text/html",
						"snapshot": true
					}
				],
				"title": "TransCom N2O model inter-comparison – Part 1: Assessing the influence of transport and surface fluxes on tropospheric N2O variability",
				"journalAbbreviation": "Atmos. Chem. Phys. Discuss.",
				"volume": "14",
				"issue": "2",
				"pages": "2307-2362",
				"date": "January 24, 2014",
				"publisher": "Copernicus Publications",
				"ISSN": "1680-7375",
				"url": "http://www.atmos-chem-phys-discuss.net/14/2307/2014/",
				"DOI": "10.5194/acpd-14-2307-2014",
				"publicationTitle": "Atmos. Chem. Phys. Discuss.",
				"abstractNote": "We present a comparison of chemistry-transport models (TransCom-N2O) to examine the importance of atmospheric transport and surface fluxes on the variability of N2O mixing ratios in the troposphere. Six different models and two model variants participated in the inter-comparison and simulations were made for the period 2006 to 2009. In addition to N2O, simulations of CFC-12 and SF6 were made by a subset of four of the models to provide information on the models proficiency in stratosphere-troposphere exchange (STE) and meridional transport, respectively. The same prior emissions were used by all models to restrict differences among models to transport and chemistry alone. Four different N2O flux scenarios totalling between 14 and 17 Tg N yr−1 (for 2005) globally were also compared. The modelled N2O mixing ratios were assessed against observations from in-situ stations, discrete air sampling networks, and aircraft. All models adequately captured the large-scale patterns of N2O and the vertical gradient from the troposphere to the stratosphere and most models also adequately captured the N2O tropospheric growth rate. However, all models underestimated the inter-hemispheric N2O gradient by at least 0.33 ppb (equivalent to 1.5 Tg N), which, even after accounting for an overestimate of emissions in the Southern Ocean of circa 1.0 Tg N, points to a likely underestimate of the Northern Hemisphere source by up to 0.5 Tg N and/or an overestimate of STE in the Northern Hemisphere. Comparison with aircraft data reveal that the models overestimate the amplitude of the N2O seasonal cycle at Hawaii (21° N, 158° W) below circa 6000 m, suggesting an overestimate of the importance of stratosphere to troposphere transport in the lower troposphere at this latitude. In the Northern Hemisphere, most of the models that provided CFC-12 simulations captured the phase of the CFC-12, seasonal cycle, indicating a reasonable representation of the timing of STE. However, for N2O all models simulated a too early minimum by 2 to 3 months owing to errors in the seasonal cycle in the prior soil emissions, which is still not adequately represented by terrestrial biosphere models. In the Southern Hemisphere, most models failed to capture the N2O and CFC-12 seasonality at Cape Grim, Tasmania, and all failed at the South Pole, whereas for SF6, all models could capture the seasonality at all sites, suggesting that there are large errors in modeled vertical transport in high southern latitudes.",
				"libraryCatalog": "Copernicus Online Journals",
				"accessDate": "CURRENT_TIMESTAMP",
				"shortTitle": "TransCom N2O model inter-comparison – Part 1"
			}
		]
	}
]
/** END TEST CASES **/