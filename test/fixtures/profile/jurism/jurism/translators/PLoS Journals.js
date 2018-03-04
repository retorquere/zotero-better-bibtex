{
	"translatorID": "9575e804-219e-4cd6-813d-9b690cbfc0fc",
	"label": "PLoS Journals",
	"creator": "Michael Berkowitz, Rintze Zelle, and Sebastian Karcher",
	"target": "^https?://(www\\.plos(one|ntds|compbiol|pathogens|genetics|medicine|biology)\\.org|journals\\.plos\\.org(/\\w+)?)/(search|\\w+/article)",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2017-01-22 19:28:36"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2012-2016 Rintze Zelle, Michael Berkowitz, and Sebastian Karcher

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
	if (url.indexOf("Search.action") != -1
		|| url.indexOf("browse.action") != -1
		|| url.indexOf("browseIssue.action") != -1
		|| url.indexOf("/search?") != -1
		|| url.indexOf("/search/") != -1
		|| url.indexOf("/issue") != -1) {
		return getSearchResults(doc, url, true) ? "multiple" : false;
	} else if (ZU.xpathText(doc, '//meta[@name="citation_title"]/@content')) {
		return "journalArticle";
	}
}

function getSearchResults(doc, url, checkOnly) {
	var articlex = '//article//a[contains(@href, "/article?id=")]';
	var articles = ZU.xpath(doc, articlex),
		items = {},
		found = false;
	for (var i=0; i<articles.length; i++) {
		var url = articles[i].href;
		var title = ZU.trimInternal(articles[i].textContent);
		if (!url || !title) continue;
		if (checkOnly) return true;
		items[url] = title;
		found = true;
	}
	
	return found ? items : false;
}

function doWeb(doc, url) {
	if (detectWeb(doc, url) == 'multiple') {
		Zotero.selectItems(getSearchResults(doc, url), function(items) {
			if (!items) return true;
			//Z.debug(items)
			var urls = [];
			for (var i in items) {
				urls.push(i);
			}
			ZU.processDocuments(urls, scrape);
		});
	} else {
		scrape(doc, url);
	}
}

function scrape(doc, url) {
	var translator = Zotero.loadTranslator('web');
	translator.setTranslator('951c027d-74ac-47d4-a107-9c3069ab7b48');//https://github.com/zotero/translators/blob/master/Embedded%20Metadata.js
	translator.setDocument(doc);
	translator.setHandler('itemDone', function (obj, item) {
		item.libraryCatalog = "PLoS Journals";
		if (item.abstractNote) {
			item.abstractNote = item.abstractNote.replace(/\s*\n\s*/, "\n")
		}
		item.complete();
	});
	translator.getTranslatorObject(function(trans) {
		trans.doWeb(doc, url);
	});
}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://journals.plos.org/plosbiology/article?id=10.1371/journal.pbio.1001090",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "The Naturally Processed CD95L Elicits a c-Yes/Calcium/PI3K-Driven Cell Migration Pathway",
				"creators": [
					{
						"firstName": "Sébastien",
						"lastName": "Tauzin",
						"creatorType": "author"
					},
					{
						"firstName": "Benjamin",
						"lastName": "Chaigne-Delalande",
						"creatorType": "author"
					},
					{
						"firstName": "Eric",
						"lastName": "Selva",
						"creatorType": "author"
					},
					{
						"firstName": "Nadine",
						"lastName": "Khadra",
						"creatorType": "author"
					},
					{
						"firstName": "Sophie",
						"lastName": "Daburon",
						"creatorType": "author"
					},
					{
						"firstName": "Cécile",
						"lastName": "Contin-Bordes",
						"creatorType": "author"
					},
					{
						"firstName": "Patrick",
						"lastName": "Blanco",
						"creatorType": "author"
					},
					{
						"firstName": "Jacques Le",
						"lastName": "Seyec",
						"creatorType": "author"
					},
					{
						"firstName": "Thomas",
						"lastName": "Ducret",
						"creatorType": "author"
					},
					{
						"firstName": "Laurent",
						"lastName": "Counillon",
						"creatorType": "author"
					},
					{
						"firstName": "Jean-François",
						"lastName": "Moreau",
						"creatorType": "author"
					},
					{
						"firstName": "Paul",
						"lastName": "Hofman",
						"creatorType": "author"
					},
					{
						"firstName": "Pierre",
						"lastName": "Vacher",
						"creatorType": "author"
					},
					{
						"firstName": "Patrick",
						"lastName": "Legembre",
						"creatorType": "author"
					}
				],
				"date": "Jun 21, 2011",
				"DOI": "10.1371/journal.pbio.1001090",
				"ISSN": "1545-7885",
				"abstractNote": "Author Summary The “death receptor” CD95 (also known as Fas) plays an essential role in ensuring immune tolerance of self antigens as well as in the elimination of the body's cells that have been infected or transformed. This receptor is engaged by the membrane-bound ligand CD95L, which can be released into blood circulation after cleavage by metalloproteases. Hitherto, most of the studies on the CD95 signal have been performed with chimeric CD95Ls that mimic the membrane-bound ligand and exhibit a level of aggregation beyond that described for the metalloprotease-cleaved ligand. Multi-aggregated CD95L elicits a caspase-driven apoptotic signal. In this study, we observe that levels of soluble and naturally processed CD95L in sera of patients suffering from lupus correlate with disease severity. Strikingly, although this soluble CD95L fails to trigger cell death unlike its chimeric version, it induces a “non-canonical” Ca2+/c-yes/PI3K-dependent signaling pathway that promotes the transmigration of T-lymphocytes across the endothelial barrier. These findings shed light on an entirely new role for the soluble CD95L that may contribute to local or systemic tissue damage by enhancing the infiltration of activated T-lymphocytes. Overall, these findings underline the importance of revisiting the role of this “apoptotic cytokine” in the context of chronic inflammatory disorders.",
				"issue": "6",
				"journalAbbreviation": "PLOS Biology",
				"libraryCatalog": "PLoS Journals",
				"pages": "e1001090",
				"publicationTitle": "PLOS Biology",
				"url": "http://journals.plos.org/plosbiology/article?id=10.1371/journal.pbio.1001090",
				"volume": "9",
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
					"Apoptosis",
					"Apoptotic signaling cascade",
					"Cell membranes",
					"Cell migration",
					"Cell motility",
					"Signal processing",
					"Systemic lupus erythematosus",
					"T cells"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://journals.plos.org/plosmedicine/article?id=10.1371/journal.pmed.1000098",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "An Economic Evaluation of Venous Thromboembolism Prophylaxis Strategies in Critically Ill Trauma Patients at Risk of Bleeding",
				"creators": [
					{
						"firstName": "T. Carter",
						"lastName": "Chiasson",
						"creatorType": "author"
					},
					{
						"firstName": "Braden J.",
						"lastName": "Manns",
						"creatorType": "author"
					},
					{
						"firstName": "Henry Thomas",
						"lastName": "Stelfox",
						"creatorType": "author"
					}
				],
				"date": "Jun 23, 2009",
				"DOI": "10.1371/journal.pmed.1000098",
				"ISSN": "1549-1676",
				"abstractNote": "Using decision analysis, Henry Stelfox and colleagues estimate the cost-effectiveness of three venous thromboembolism prophylaxis strategies in patients with severe traumatic injuries who were also at risk for bleeding complications.",
				"issue": "6",
				"journalAbbreviation": "PLOS Medicine",
				"libraryCatalog": "PLoS Journals",
				"pages": "e1000098",
				"publicationTitle": "PLOS Medicine",
				"url": "http://journals.plos.org/plosmedicine/article?id=10.1371/journal.pmed.1000098",
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
					"Deep vein thrombosis",
					"Hemorrhage",
					"Heparin",
					"Intensive care units",
					"Prophylaxis",
					"Pulmonary embolism",
					"Traumatic injury",
					"Venous thromboembolism"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.plosmedicine.org/article/browseIssue.action",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://www.plosbiology.org/search/simple?from=globalSimpleSearch&filterJournals=PLoSBiology&query=amygdala&x=0&y=1",
		"items": "multiple"
	}
]
/** END TEST CASES **/