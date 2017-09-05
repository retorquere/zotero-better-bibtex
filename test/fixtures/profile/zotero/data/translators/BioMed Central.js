{
	"translatorID": "75ccea3c-fdb8-4473-8203-ceb27f3395f8",
	"label": "BioMed Central",
	"creator": "Philipp Zumstein",
	"target": "^https?://[^\\.]+\\.(biomedcentral|springeropen)\\.com/(articles|search)",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2017-06-24 17:55:46"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2015 Philipp Zumstein

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


//This translator covers BioMedCentral but also SpringerOpen.

function detectWeb(doc, url) {
	if (url.indexOf('.com/articles/10.1186/')>-1) {
		return "journalArticle";
	} else if (getSearchResults(doc, true)) {
		return "multiple";
	}
}

function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = ZU.xpath(doc, '//div[@id="search-container"]//article//h3[contains(@class,"ResultsList_title")]/a');
	for (var i=0; i<rows.length; i++) {
		var href = rows[i].href;
		var title = ZU.trimInternal(rows[i].textContent);
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
			var articles = new Array();
			for (var i in items) {
				articles.push(i);
			}
			ZU.processDocuments(articles, scrape);
		});
	} else {
		scrape(doc, url);
	}
}

function scrape(doc, url) {
	var DOI = url.match(/\/(10\.[^#?]+)/)[1];
	var risURL = "http://citation-needed.services.springer.com/v2/references/" + DOI + "?format=refman&flavour=citation";
	var pdfURL = doc.getElementById("articlePdf");
	ZU.doGet(risURL, function(text) {
		var translator = Zotero.loadTranslator("import");
		translator.setTranslator("32d59d2d-b65a-4da4-b0a3-bdd3cfb979e7");
		translator.setString(text);
		translator.setHandler("itemDone", function(obj, item) {

			//We have to fix issue and pages because these informations are
			//wrong in the RIS data.
			var citation = ZU.xpath(doc, '//span[@class="ArticleCitation_Volume"]');
			if (citation.length>0) {
				fixCitation(item, citation[0].innerHTML);
			}

			var keywordsNodes = doc.getElementsByClassName("Keyword");
			for (var i=0; i<keywordsNodes.length; i++) {
				item.tags.push( keywordsNodes[i].textContent );
			}
			
			if (pdfURL) {
				item.attachments.push({
					url: pdfURL.href,
					title: "Full Text PDF",
					mimeType: "application/pdf"
				});
			}
			item.attachments.push({
				title: "Snapshot",
				document: doc
			});
			item.complete();
		})
		translator.translate();
	})
}

function fixCitation(item, citation) {
	//This function fixes the information for issue and pages
	//depending on the information in the citation string.
	//e.g. citation = <strong>8</strong>:212
	//  or citation = <strong>2</strong>(1):S1
	var re = /<strong>(\d+)<\/strong>([\w()]*):(\w+)/;
	var m = citation.match(re);
	if (m) {
		if (item.pages) {
			//save the pages (PDF) first
			item.notes.push({ note: "Pages " + item.pages + " in PDF" });
		}
		if (item.volume != m[1]) {//This should actually be the same as in RIS.
			Z.debug("Volume number differs in RIS and citation text: " + item.volume + "!=" + m[1]);
			item.volume = m[1];
		}
		//Most of the journal articles at BMC do not have issue numbers;
		//however this value seem to be filled by default with 1 in the RIS.
		//Therefore, we have to delete it here or replace it by the correct
		//value.
		item.issue = m[2].replace(/[()]/g, "");
		//The article ids should be treated similar to pages.
		item.pages = m[3];
	}

}
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://biotechnologyforbiofuels.biomedcentral.com/articles/10.1186/s13068-015-0395-8",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Biomass accessibility analysis using electron tomography",
				"creators": [
					{
						"lastName": "Hinkle",
						"firstName": "Jacob D.",
						"creatorType": "author"
					},
					{
						"lastName": "Ciesielski",
						"firstName": "Peter N.",
						"creatorType": "author"
					},
					{
						"lastName": "Gruchalla",
						"firstName": "Kenny",
						"creatorType": "author"
					},
					{
						"lastName": "Munch",
						"firstName": "Kristin R.",
						"creatorType": "author"
					},
					{
						"lastName": "Donohoe",
						"firstName": "Bryon S.",
						"creatorType": "author"
					}
				],
				"date": "2015",
				"DOI": "10.1186/s13068-015-0395-8",
				"ISSN": "1754-6834",
				"abstractNote": "Substrate accessibility to catalysts has been a dominant theme in theories of biomass deconstruction. However, current methods of quantifying accessibility do not elucidate mechanisms for increased accessibility due to changes in microstructure following pretreatment.",
				"journalAbbreviation": "Biotechnology for Biofuels",
				"libraryCatalog": "BioMed Central",
				"pages": "212",
				"publicationTitle": "Biotechnology for Biofuels",
				"url": "http://dx.doi.org/10.1186/s13068-015-0395-8",
				"volume": "8",
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
					"Accessibility",
					"Biomass",
					"Cellulose",
					"Porosimetry",
					"Pretreatment",
					"Tomography"
				],
				"notes": [
					{
						"note": "Pages 212 in PDF"
					}
				],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://parasitesandvectors.biomedcentral.com/articles/10.1186/1756-3305-2-S1-S1",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Canine leishmaniosis in South America",
				"creators": [
					{
						"lastName": "Dantas-Torres",
						"firstName": "Filipe",
						"creatorType": "author"
					}
				],
				"date": "2009",
				"DOI": "10.1186/1756-3305-2-S1-S1",
				"ISSN": "1756-3305",
				"abstractNote": "Canine leishmaniosis is widespread in South America, where a number of Leishmania species have been isolated or molecularly characterised from dogs. Most cases of canine leishmaniosis are caused by Leishmania infantum (syn. Leishmania chagasi) and Leishmania braziliensis. The only well-established vector of Leishmania parasites to dogs in South America is Lutzomyia longipalpis, the main vector of L. infantum, but many other phlebotomine sandfly species might be involved. For quite some time, canine leishmaniosis has been regarded as a rural disease, but nowadays it is well-established in large urbanised areas. Serological investigations reveal that the prevalence of anti-Leishmania antibodies in dogs might reach more than 50%, being as high as 75% in highly endemic foci. Many aspects related to the epidemiology of canine leishmaniosis (e.g., factors increasing the risk disease development) in some South American countries other than Brazil are poorly understood and should be further studied. A better understanding of the epidemiology of canine leishmaniosis in South America would be helpful to design sustainable control and prevention strategies against Leishmania infection in both dogs and humans.",
				"issue": "1",
				"journalAbbreviation": "Parasites & Vectors",
				"libraryCatalog": "BioMed Central",
				"pages": "S1",
				"publicationTitle": "Parasites & Vectors",
				"url": "http://dx.doi.org/10.1186/1756-3305-2-S1-S1",
				"volume": "2",
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
		"url": "https://www.biomedcentral.com/search?query=zelle&searchType=publisherSearch",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://bmcevolbiol.biomedcentral.com/articles/",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://jfootankleres.biomedcentral.com/articles/10.1186/1757-1146-1-S1-O4",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Plantar fascia thickness and first metatarsal mobility in patients with diabetes and neuropathy",
				"creators": [
					{
						"lastName": "Rao",
						"firstName": "Smita",
						"creatorType": "author"
					},
					{
						"lastName": "Saltzman",
						"firstName": "Charles L.",
						"creatorType": "author"
					},
					{
						"lastName": "Yack",
						"firstName": "H. John",
						"creatorType": "author"
					}
				],
				"date": "2008",
				"DOI": "10.1186/1757-1146-1-S1-O4",
				"ISSN": "1757-1146",
				"issue": "1",
				"journalAbbreviation": "Journal of Foot and Ankle Research",
				"libraryCatalog": "BioMed Central",
				"pages": "O4",
				"publicationTitle": "Journal of Foot and Ankle Research",
				"url": "http://dx.doi.org/10.1186/1757-1146-1-S1-O4",
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
	},
	{
		"type": "web",
		"url": "https://journalofinequalitiesandapplications.springeropen.com/articles/10.1186/1029-242X-2011-53",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Approximately cubic functional equations and cubic multipliers",
				"creators": [
					{
						"lastName": "Bodaghi",
						"firstName": "Abasalt",
						"creatorType": "author"
					},
					{
						"lastName": "Alias",
						"firstName": "Idham Arif",
						"creatorType": "author"
					},
					{
						"lastName": "Ghahramani",
						"firstName": "Mohammad Hossein",
						"creatorType": "author"
					}
				],
				"date": "2011",
				"DOI": "10.1186/1029-242X-2011-53",
				"ISSN": "1029-242X",
				"abstractNote": "In this paper, we prove the Hyers-Ulam stability and the superstability for cubic functional equation by using the fixed point alternative theorem. As a consequence, we show that the cubic multipliers are superstable under some conditions.",
				"journalAbbreviation": "Journal of Inequalities and Applications",
				"libraryCatalog": "BioMed Central",
				"pages": "53",
				"publicationTitle": "Journal of Inequalities and Applications",
				"url": "http://dx.doi.org/10.1186/1029-242X-2011-53",
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
				"notes": [
					{
						"note": "Pages 53 in PDF"
					}
				],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://nanoscalereslett.springeropen.com/articles/10.1186/1556-276X-6-530",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Nanoscale potassium niobate crystal structure and phase transition",
				"creators": [
					{
						"lastName": "Chen",
						"firstName": "Haiyan",
						"creatorType": "author"
					},
					{
						"lastName": "Zhang",
						"firstName": "Yixuan",
						"creatorType": "author"
					},
					{
						"lastName": "Lu",
						"firstName": "Yanling",
						"creatorType": "author"
					}
				],
				"date": "2011",
				"DOI": "10.1186/1556-276X-6-530",
				"ISSN": "1556-276X",
				"abstractNote": "Nanoscale potassium niobate (KNbO3) powders of orthorhombic structure were synthesized using the sol-gel method. The heat-treatment temperature of the gels had a pronounced effect on KNbO3 particle size and morphology. Field emission scanning electron microscopy and transmission electron microscopy were used to determine particle size and morphology. The average KNbO3 grain size was estimated to be less than 100 nm, and transmission electron microscopy images indicated that KNbO3 particles had a brick-like morphology. Synchrotron X-ray diffraction was used to identify the room-temperature structures using Rietveld refinement. The ferroelectric orthorhombic phase was retained even for particles smaller than 50 nm. The orthorhombic to tetragonal and tetragonal to cubic phase transitions of nanocrystalline KNbO3 were investigated using temperature-dependent powder X-ray diffraction. Differential scanning calorimetry was used to examine the temperature dependence of KNbO3 phase transition. The Curie temperature and phase transition were independent of particle size, and Rietveld analyses showed increasing distortions with decreasing particle size.",
				"journalAbbreviation": "Nanoscale Research Letters",
				"libraryCatalog": "BioMed Central",
				"pages": "530",
				"publicationTitle": "Nanoscale Research Letters",
				"url": "http://dx.doi.org/10.1186/1556-276X-6-530",
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
				"notes": [
					{
						"note": "Pages 530 in PDF"
					}
				],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://ccj.springeropen.com/articles/10.1186/1752-153X-5-5",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Cacao seeds are a \"Super Fruit\": A comparative analysis of various fruit powders and products",
				"creators": [
					{
						"lastName": "Crozier",
						"firstName": "Stephen J.",
						"creatorType": "author"
					},
					{
						"lastName": "Preston",
						"firstName": "Amy G.",
						"creatorType": "author"
					},
					{
						"lastName": "Hurst",
						"firstName": "Jeffrey W.",
						"creatorType": "author"
					},
					{
						"lastName": "Payne",
						"firstName": "Mark J.",
						"creatorType": "author"
					},
					{
						"lastName": "Mann",
						"firstName": "Julie",
						"creatorType": "author"
					},
					{
						"lastName": "Hainly",
						"firstName": "Larry",
						"creatorType": "author"
					},
					{
						"lastName": "Miller",
						"firstName": "Debra L.",
						"creatorType": "author"
					}
				],
				"date": "2011",
				"DOI": "10.1186/1752-153X-5-5",
				"ISSN": "1752-153X",
				"abstractNote": "Numerous popular media sources have developed lists of \"Super Foods\" and, more recently, \"Super Fruits\". Such distinctions often are based on the antioxidant capacity and content of naturally occurring compounds such as polyphenols within those whole fruits or juices of the fruit which may be linked to potential health benefits. Cocoa powder and chocolate are made from an extract of the seeds of the fruit of the Theobroma cacao tree. In this study, we compared cocoa powder and cocoa products to powders and juices derived from fruits commonly considered \"Super Fruits\".",
				"journalAbbreviation": "Chemistry Central Journal",
				"libraryCatalog": "BioMed Central",
				"pages": "5",
				"publicationTitle": "Chemistry Central Journal",
				"shortTitle": "Cacao seeds are a \"Super Fruit\"",
				"url": "http://dx.doi.org/10.1186/1752-153X-5-5",
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
				"notes": [
					{
						"note": "Pages 5 in PDF"
					}
				],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/