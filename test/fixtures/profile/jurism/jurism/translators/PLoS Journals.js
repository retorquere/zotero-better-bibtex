{
	"translatorID": "9575e804-219e-4cd6-813d-9b690cbfc0fc",
	"label": "PLoS Journals",
	"creator": "Michael Berkowitz, Rintze Zelle, and Sebastian Karcher",
	"target": "^https?://(www\\.plos(one|ntds|compbiol|pathogens|genetics|medicine|biology)\\.org|journals\\.plos\\.org)/(search/|\\w+/article)",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2016-02-27 21:46:37"
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
		|| url.indexOf("/search/") != -1) {
		return getSearchResults(doc, url, true) ? "multiple" : false;
	}
	else if (ZU.xpathText(doc, '//meta[@name="citation_title"]/@content')) {
		return "journalArticle";
	}
}

function getSearchResults(doc, url, checkOnly) {
	var articlex;
	if (url.indexOf("/search?") != -1) {
		articlex = '//dt[@class="search-results-title"]/a';
	} else if(url.indexOf('browseIssue.action') == -1) {
		articlex = '//span[@class="article"]/a';
	} else {
		articlex = '//div[@class="header"]/h3/a';
	}
	//Z.debug(articlex)
	var articles = ZU.xpath(doc, articlex),
		items = {},
		found = false;
	for (var i=0; i<articles.length; i++) {
		var url = articles[i].href;
		if (checkOnly) return true;
		items[url] = ZU.trimInternal(articles[i].textContent);
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
						"lastName": "Tauzin",
						"firstName": "Sébastien",
						"creatorType": "author"
					},
					{
						"lastName": "Chaigne-Delalande",
						"firstName": "Benjamin",
						"creatorType": "author"
					},
					{
						"lastName": "Selva",
						"firstName": "Eric",
						"creatorType": "author"
					},
					{
						"lastName": "Khadra",
						"firstName": "Nadine",
						"creatorType": "author"
					},
					{
						"lastName": "Daburon",
						"firstName": "Sophie",
						"creatorType": "author"
					},
					{
						"lastName": "Contin-Bordes",
						"firstName": "Cécile",
						"creatorType": "author"
					},
					{
						"lastName": "Blanco",
						"firstName": "Patrick",
						"creatorType": "author"
					},
					{
						"lastName": "Le Seyec",
						"firstName": "Jacques",
						"creatorType": "author"
					},
					{
						"lastName": "Ducret",
						"firstName": "Thomas",
						"creatorType": "author"
					},
					{
						"lastName": "Counillon",
						"firstName": "Laurent",
						"creatorType": "author"
					},
					{
						"lastName": "Moreau",
						"firstName": "Jean-François",
						"creatorType": "author"
					},
					{
						"lastName": "Hofman",
						"firstName": "Paul",
						"creatorType": "author"
					},
					{
						"lastName": "Vacher",
						"firstName": "Pierre",
						"creatorType": "author"
					},
					{
						"lastName": "Legembre",
						"firstName": "Patrick",
						"creatorType": "author"
					}
				],
				"date": "June 21, 2011",
				"DOI": "10.1371/journal.pbio.1001090",
				"abstractNote": "Author Summary\nThe “death receptor” CD95 (also known as Fas) plays an essential role in ensuring immune tolerance of self antigens as well as in the elimination of the body's cells that have been infected or transformed. This receptor is engaged by the membrane-bound ligand CD95L, which can be released into blood circulation after cleavage by metalloproteases. Hitherto, most of the studies on the CD95 signal have been performed with chimeric CD95Ls that mimic the membrane-bound ligand and exhibit a level of aggregation beyond that described for the metalloprotease-cleaved ligand. Multi-aggregated CD95L elicits a caspase-driven apoptotic signal. In this study, we observe that levels of soluble and naturally processed CD95L in sera of patients suffering from lupus correlate with disease severity. Strikingly, although this soluble CD95L fails to trigger cell death unlike its chimeric version, it induces a “non-canonical” Ca2+/c-yes/PI3K-dependent signaling pathway that promotes the transmigration of T-lymphocytes across the endothelial barrier. These findings shed light on an entirely new role for the soluble CD95L that may contribute to local or systemic tissue damage by enhancing the infiltration of activated T-lymphocytes. Overall, these findings underline the importance of revisiting the role of this “apoptotic cytokine” in the context of chronic inflammatory disorders.",
				"issue": "6",
				"journalAbbreviation": "PLoS Biol",
				"libraryCatalog": "PLoS Journals",
				"pages": "e1001090",
				"publicationTitle": "PLoS Biol",
				"url": "http://dx.doi.org/10.1371/journal.pbio.1001090",
				"volume": "9",
				"attachments": [
					{
						"title": "PLoS Full Text PDF",
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
		"url": "http://journals.plos.org/plosmedicine/article?id=10.1371/journal.pmed.1000098",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "An Economic Evaluation of Venous Thromboembolism Prophylaxis Strategies in Critically Ill Trauma Patients at Risk of Bleeding",
				"creators": [
					{
						"lastName": "Chiasson",
						"firstName": "T. Carter",
						"creatorType": "author"
					},
					{
						"lastName": "Manns",
						"firstName": "Braden J.",
						"creatorType": "author"
					},
					{
						"lastName": "Stelfox",
						"firstName": "Henry Thomas",
						"creatorType": "author"
					}
				],
				"date": "June 23, 2009",
				"DOI": "10.1371/journal.pmed.1000098",
				"abstractNote": "Using decision analysis, Henry Stelfox and colleagues estimate the cost-effectiveness of three venous thromboembolism prophylaxis strategies in patients with severe traumatic injuries who were also at risk for bleeding complications.",
				"issue": "6",
				"journalAbbreviation": "PLoS Med",
				"libraryCatalog": "PLoS Journals",
				"pages": "e1000098",
				"publicationTitle": "PLoS Med",
				"url": "http://dx.doi.org/10.1371/journal.pmed.1000098",
				"volume": "6",
				"attachments": [
					{
						"title": "PLoS Full Text PDF",
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