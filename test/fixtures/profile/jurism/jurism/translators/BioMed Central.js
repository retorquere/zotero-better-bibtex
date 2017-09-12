{
	"translatorID": "75ccea3c-fdb8-4473-8203-ceb27f3395f8",
	"label": "BioMed Central",
	"creator": "Philipp Zumstein",
	"target": "^https?://[^\\.]+\\.biomedcentral\\.com/(articles|search)",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2017-01-01 16:01:50"
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

function detectWeb(doc, url) {
	if (url.indexOf('biomedcentral.com/articles/10.1186/')>-1) {
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
		"url": "http://biotechnologyforbiofuels.biomedcentral.com/articles/10.1186/s13068-015-0395-8",
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
						"note": "Pages 1-16 in PDF"
					}
				],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://parasitesandvectors.biomedcentral.com/articles/10.1186/1756-3305-2-S1-S1",
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
				"pages": "1-8",
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
		"url": "http://www.biomedcentral.com/search?query=zelle&searchType=publisherSearch",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://bmcevolbiol.biomedcentral.com/articles/",
		"items": "multiple"
	}
]
/** END TEST CASES **/