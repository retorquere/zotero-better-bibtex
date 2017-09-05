{
	"translatorID": "ce5f2849-4500-47cc-8d7d-3fc0a1de9848",
	"label": "Microbiology Society Journals",
	"creator": "Philipp Zumstein",
	"target": "^https?://(www\\.)?(\\w)+\\.microbiologyresearch\\.org/(content/journal/|search?)",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2016-01-06 16:10:00"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2016 Philipp Zumstein

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
	if ( url.search(/\/content\/journal\/\w+\/10\./) >-1) {
		//e.g. http://jmm.microbiologyresearch.org/content/journal/jmm/10.1099/00222615-15-2-189
		return "journalArticle";
	}
	if (getSearchResults(doc, true)) {
		//e.g. http://ijs.microbiologyresearch.org/content/journal/ijsem/65/11
		//http://jmm.microbiologyresearch.org/search?option1=author&noRedirect=true&value1=Ateequr+Rehman&facetOptions=2&facetNames=pub_author_facet&operator2=AND&option2=pub_author_facet&value2=%27Patricia+Lepage%27
		return "multiple";
	}
}

function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = ZU.xpath(doc, '//li[contains(@class, "list-group-item")]//h4/a');
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
	var risURL;
	var node = ZU.xpath(doc, '//ul[@id="export-list"]/li/a[contains(@title,"RefWorks")]');
	if (node.length > 0) {
		risURL = node[0].href;
	} else {
		risURL = url + "/cite/refworks";
	}

	ZU.doGet(risURL, function(text) {
		var translator = Zotero.loadTranslator("import");
		translator.setTranslator("1a3506da-a303-4b0a-a1cd-f216e6138d86");
		translator.setString(text);
		translator.setHandler("itemDone", function(obj, item) {
			var pdfURL = ZU.xpathText(doc, '//div[contains(@class,"textoptionsFulltext")]//a[contains(@class,"pdf")]/@href');
			if (pdfURL) {
				item.attachments.push({
					url: pdfURL,
					title: "Full Text PDF",
					mimeType: "application/pdf"
				});
			}
			item.attachments.push({
				title: "Snapshot",
				document: doc
			});
			var abstract = ZU.xpath(doc,'//div[contains(@class, "abstract")]//div[contains(@class,"article-container")]');
			if (abstract.length > 0) {
				item.abstractNote = abstract[0].textContent.replace(/^\s*Summary/, '').trim();
			}
			item.complete();
		})
		translator.translate();
	})
}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://jmm.microbiologyresearch.org/content/journal/jmm/10.1099/00222615-15-2-189",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "The Microbial Ecology of the Large Bowel of Breastfed and Formula-fed Infants During the First Year of Life",
				"creators": [
					{
						"lastName": "Stark",
						"firstName": "P. L.",
						"creatorType": "author"
					},
					{
						"lastName": "Lee",
						"firstName": "A.",
						"creatorType": "author"
					}
				],
				"date": "1982",
				"DOI": "10.1099/00222615-15-2-189",
				"abstractNote": "The succession of bacterial populations in the large bowel of seven breast-fed and seven formula-fed infants was examined during the first year of life. The composition of the intestinal microflora varied according to the infant's diet. During the first week of life breast-fed and formula-fed infants were colonised by enterobacteria and enterococci followed by bifidobacteria, Bacteroides spp., clostridia and anaerobic streptococci. From week 4 until solid foods were given, breast-fed babies had a simple flora consisting of bifidobacteria and relatively few enterobacteria and enterococci. Formula-fed babies during the corresponding period were more often colonised by other anaerobes in addition to bifidobacteria and had higher counts of facultatively anaerobic bacteria. The introduction of solid food to the breast-fed infants caused a major disturbance in the microbial ecology of the large bowel as counts of enterobacteria and enterococci rose sharply and colonisation by Bacteroides spp., clostridia and anaerobic streptococci occurred. This was not observed when formula-fed infants began to take solids; instead, counts of facultative anaerobes remained high while colonisation by anaerobes other than bifidobacteria continued. At 12 months, the anaerobic bacterial populations of the large bowel of breast-fed and formula-fed infants were beginning to resemble those of adults in number and composition and there was a corresponding decrease in the number of facultative anaerobes. These changes are discussed in relation to changes in susceptibility to gastro-intestinal infection.",
				"issue": "2",
				"libraryCatalog": "Microbiology Society Journals",
				"pages": "189-203",
				"publicationTitle": "Journal of Medical Microbiology",
				"url": "http://jmm.microbiologyresearch.org/content/journal/jmm/10.1099/00222615-15-2-189",
				"volume": "15",
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
		"url": "http://ijs.microbiologyresearch.org/content/journal/ijsem/10.1099/ijsem.0.000872",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Reclassification of Achromobacter spiritinus Vandamme et al. 2013 as a later heterotypic synonym of Achromobacter marplatensis Gomila et al. 2011",
				"creators": [
					{
						"lastName": "Vandamme",
						"firstName": "Peter A.",
						"creatorType": "author"
					},
					{
						"lastName": "Peeters",
						"firstName": "Charlotte",
						"creatorType": "author"
					},
					{
						"lastName": "Cnockaert",
						"firstName": "Margo",
						"creatorType": "author"
					},
					{
						"lastName": "Gomila",
						"firstName": "Margarita",
						"creatorType": "author"
					},
					{
						"lastName": "Moore",
						"firstName": "Edward R. B.",
						"creatorType": "author"
					},
					{
						"lastName": "Spilker",
						"firstName": "Theodore",
						"creatorType": "author"
					},
					{
						"lastName": "LiPuma",
						"firstName": "John J.",
						"creatorType": "author"
					}
				],
				"date": "2016",
				"DOI": "10.1099/ijsem.0.000872",
				"abstractNote": "A repeat multi-locus sequence analysis (MLSA) of concatenated nusA, eno, rpoB, gltB, lepA, nuoL and nrdA sequences of strains classified as Achromobacter marplatensis was performed. The results revealed that earlier reported sequence data of the proposed type strain were erroneous, and that the corrected concatenated sequence divergence between the A. marplatensis LMG 26219T ( = CCUG 56371T) sequence type and that of strains of Achromobacter spiritinus was well below the 2.1 % threshold value that delineates species of the genus Achromobacter. These results therefore demonstrated that strains which were classified as A. spiritinus should be reclassified as A. marplatensis and that the name Achromobacter spiritinus should no longer be used. An emendation of the description of Achromobacter marplatensis is warranted.",
				"issue": "4",
				"libraryCatalog": "Microbiology Society Journals",
				"pages": "1641-1644",
				"publicationTitle": "International Journal of Systematic and Evolutionary Microbiology",
				"url": "http://ijs.microbiologyresearch.org/content/journal/ijsem/10.1099/ijsem.0.000872",
				"volume": "66",
				"attachments": [
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
		"url": "http://mic.microbiologyresearch.org/search?value1=h2o&option1=all&option2=pub_serialIdent&value2=&operator2=AND",
		"items": "multiple"
	}
]
/** END TEST CASES **/