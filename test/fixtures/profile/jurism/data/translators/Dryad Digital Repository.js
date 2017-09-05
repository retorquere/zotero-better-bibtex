{
	"translatorID": "7a81d945-7d9c-4f8c-bd7b-4226c1cab40e",
	"label": "Dryad Digital Repository",
	"creator": "Nathan Day",
	"target": "^https?://(www\\.)?datadryad\\.org/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2015-06-23 02:09:11"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2014 Dryad Digital Repository

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
	// Dryad search page
	if (url.indexOf('/discover?') != -1) {
		return getSearchResults(doc, true) ? 'multiple' : false;
	} else {
		var result = ZU.xpathText(doc,'//meta[@name="DC.type"][1]/@content');
		// Dryad data package
		if (result === 'Article') {
			return 'journalArticle';
		// Dryad data file
		} else if (result === 'Dataset') {
			//return 'dataset';
			return 'journalArticle';
		}
	}
	return false;
}

function doWeb(doc, url) {
	var itemType = detectWeb(doc, url);
	if (itemType === 'journalArticle') {
		scrape(doc, url);
	} else if (itemType === 'multiple') {
		Zotero.selectItems(getSearchResults(doc), function(items) {
			if (!items) return true;
			
			var urls = [];
			for (var i in items) {
				urls.push(i);
			}
			
			ZU.processDocuments(urls, scrape);
		})
	}
}

function getSearchResults(doc, checkOnly) {
	var results = ZU.xpath(doc, '//li[contains(@class,"ds-artifact-item")]/div/a'),
		items = {},
		found = false;
	
	for (var i=0; i<results.length; i++) {
		var title = results[i].getElementsByClassName('artifact-title')[0];
		if (!title) continue;
		
		if (checkOnly) return true;
		found = true;
		
		title = ZU.trimInternal(title.textContent).replace(/^Data From:\s*/i, '');
		items[results[i].href] = title;
	}
	
	return found ? items : false;
}

function scrape(doc, url) {
	var package_doi = ZU.xpathText(doc, '//meta[@name="DCTERMS.isPartOf"]/@content');
	
	var translator = Zotero.loadTranslator('web');
	// use the Embedded Metadata translator
	translator.setTranslator('951c027d-74ac-47d4-a107-9c3069ab7b48');
	translator.setDocument(doc);
	translator.setHandler('itemDone', function(obj, item) {
		var itemDoi = item.url.replace(/^.*?doi:/, '');
		item.DOI = itemDoi;
		item.url = ''; // the doi value is to be used in lieu of the url
		
		item.itemType 	= 'journalArticle';
		// signal a dataset until supported per
		// https://www.zotero.org/support/dev/translators/datasets
		item.extra = '{:itemType: dataset}';
		item.archive = 'Dryad Digital Repository';
		item.attachments = [];
		item.shortTitle = '';
		
		// Add a .seeAlso value if this is a page for a single data file,
		// rather than for a data package collection.
		// This is a data file if there is a DCTERMS.isPartOf property.
		if (package_doi && package_doi !== 'doi:' + itemDoi) {
			item.seeAlso = [package_doi.substring(4)];
		}
		item.itemID = itemDoi; // internal value for seeAlso relation
		
		item.complete();
	});
	translator.translate();
	
	// Value for page's possible DCTERMS.isPartOf <meta> tag,
	// minus the initial 'doi:'.
	// This value is used to set the seeAlso value for a data-file record.
	if (package_doi) {
		ZU.processDocuments('http://datadryad.org/resource/' + package_doi, scrape);
	}
}
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://datadryad.org/resource/doi:10.5061/dryad.9025",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Data from: Phylogenetic analyses of mitochondrial and nuclear data in haematophagous flies support the paraphyly of the genus Stomoxys (Diptera: Muscidae)",
				"creators": [
					{
						"firstName": "Najla",
						"lastName": "Dsouli",
						"creatorType": "author"
					},
					{
						"firstName": "Frédéric",
						"lastName": "Delsuc",
						"creatorType": "author"
					},
					{
						"firstName": "Johan",
						"lastName": "Michaux",
						"creatorType": "author"
					},
					{
						"firstName": "Eric",
						"lastName": "De Stordeur",
						"creatorType": "author"
					},
					{
						"firstName": "Arnaud",
						"lastName": "Couloux",
						"creatorType": "author"
					},
					{
						"firstName": "Michel",
						"lastName": "Veuille",
						"creatorType": "author"
					},
					{
						"firstName": "Gérard",
						"lastName": "Duvallet",
						"creatorType": "author"
					}
				],
				"date": "2011-02-13",
				"DOI": "10.5061/dryad.9025",
				"abstractNote": "The genus Stomoxys Geoffroy (Diptera; Muscidae) contains species of parasitic flies that are of medical and economic importance. We conducted a phylogenetic analysis including 10 representative species of the genus including multiple exemplars, together with the closely related genera Prostomoxys Zumpt, Haematobosca Bezzi, and Haematobia Lepeletier & Serville. Phylogenetic relationships were inferred using maximum likelihood and Bayesian methods from DNA fragments from the cytochrome c oxidase subunit I (COI, 753 bp) and cytochrome b (CytB, 587 bp) mitochondrial genes, and the nuclear ribosomal internal transcribed spacer 2 (ITS2, 426 bp). The combination of mitochondrial and nuclear data strongly supports the paraphyly of the genus Stomoxys because of the inclusion of Prostomoxys saegerae Zumpt. This unexpected result suggests that Prostomoxys should be renamed into Stomoxys. Also, the deep molecular divergence observed between the subspecies Stomoxys niger niger Macquart and S. niger bilineatus Grünbreg led us to propose that they should rather be considered as distinct species, in agreement with ecological data. Bayesian phylogenetic analyses support three distinct lineages within the genus Stomoxys with a strong biogeographical component. The first lineage consists solely of the divergent Asian species S. indicus Picard which appears as the sister-group to all remaining Stomoxys species. The second clade groups the strictly African species Stomoxys inornatus Grünbreg, Stomoxys transvittatus Villeneuve, Stomoxys omega Newstead, and Stomoxys pallidus Roubaud. Finally, the third clade includes both African occurring and more widespread species such as the livestock pest Stomoxys calcitrans Linnaeus. Divergence time estimates indicate that the genus Stomoxys originated in the late Oligocene around 30 million years ago, with the major lineages diversifying in the Early Miocene between 20 and 15 million years ago at a time when temperate forests developed in the Northern Hemisphere.",
				"archive": "Dryad Digital Repository",
				"extra": "{:itemType: dataset}",
				"itemID": "10.5061/dryad.9025",
				"libraryCatalog": "datadryad.org",
				"attachments": [],
				"tags": [
					"Molecular dating",
					"Phylogenetic relationship",
					"Stomoxys flies"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://datadryad.org/resource/doi:10.5061/dryad.9025/2",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Dsouli-InfectGenetEvol11 phylogram",
				"creators": [
					{
						"firstName": "Najla",
						"lastName": "Dsouli",
						"creatorType": "author"
					},
					{
						"firstName": "Frédéric",
						"lastName": "Delsuc",
						"creatorType": "author"
					},
					{
						"firstName": "Johan",
						"lastName": "Michaux",
						"creatorType": "author"
					},
					{
						"firstName": "Eric",
						"lastName": "De Stordeur",
						"creatorType": "author"
					},
					{
						"firstName": "Arnaud",
						"lastName": "Couloux",
						"creatorType": "author"
					},
					{
						"firstName": "Michel",
						"lastName": "Veuille",
						"creatorType": "author"
					},
					{
						"firstName": "Gérard",
						"lastName": "Duvallet",
						"creatorType": "author"
					}
				],
				"date": "2011-03-31",
				"DOI": "10.5061/dryad.9025/2",
				"abstractNote": "This phylogram is the 50% majority\r\nrule consensus tree presented in Figure 1. It was obtained with Bayesian inference using MrBayes under the GTR + G model. Numbers at nodes indicate posterior probabilities (PP).",
				"archive": "Dryad Digital Repository",
				"extra": "{:itemType: dataset}",
				"itemID": "10.5061/dryad.9025/2",
				"libraryCatalog": "datadryad.org",
				"rights": "http://creativecommons.org/publicdomain/zero/1.0/",
				"attachments": [],
				"tags": [
					"Molecular dating",
					"Phylogenetic relationship",
					"Stomoxys flies"
				],
				"notes": [],
				"seeAlso": [
					"10.5061/dryad.9025"
				]
			},
			{
				"itemType": "journalArticle",
				"title": "Data from: Phylogenetic analyses of mitochondrial and nuclear data in haematophagous flies support the paraphyly of the genus Stomoxys (Diptera: Muscidae)",
				"creators": [
					{
						"firstName": "Najla",
						"lastName": "Dsouli",
						"creatorType": "author"
					},
					{
						"firstName": "Frédéric",
						"lastName": "Delsuc",
						"creatorType": "author"
					},
					{
						"firstName": "Johan",
						"lastName": "Michaux",
						"creatorType": "author"
					},
					{
						"firstName": "Eric",
						"lastName": "De Stordeur",
						"creatorType": "author"
					},
					{
						"firstName": "Arnaud",
						"lastName": "Couloux",
						"creatorType": "author"
					},
					{
						"firstName": "Michel",
						"lastName": "Veuille",
						"creatorType": "author"
					},
					{
						"firstName": "Gérard",
						"lastName": "Duvallet",
						"creatorType": "author"
					}
				],
				"date": "2011-02-13",
				"DOI": "10.5061/dryad.9025",
				"abstractNote": "The genus Stomoxys Geoffroy (Diptera; Muscidae) contains species of parasitic flies that are of medical and economic importance. We conducted a phylogenetic analysis including 10 representative species of the genus including multiple exemplars, together with the closely related genera Prostomoxys Zumpt, Haematobosca Bezzi, and Haematobia Lepeletier & Serville. Phylogenetic relationships were inferred using maximum likelihood and Bayesian methods from DNA fragments from the cytochrome c oxidase subunit I (COI, 753 bp) and cytochrome b (CytB, 587 bp) mitochondrial genes, and the nuclear ribosomal internal transcribed spacer 2 (ITS2, 426 bp). The combination of mitochondrial and nuclear data strongly supports the paraphyly of the genus Stomoxys because of the inclusion of Prostomoxys saegerae Zumpt. This unexpected result suggests that Prostomoxys should be renamed into Stomoxys. Also, the deep molecular divergence observed between the subspecies Stomoxys niger niger Macquart and S. niger bilineatus Grünbreg led us to propose that they should rather be considered as distinct species, in agreement with ecological data. Bayesian phylogenetic analyses support three distinct lineages within the genus Stomoxys with a strong biogeographical component. The first lineage consists solely of the divergent Asian species S. indicus Picard which appears as the sister-group to all remaining Stomoxys species. The second clade groups the strictly African species Stomoxys inornatus Grünbreg, Stomoxys transvittatus Villeneuve, Stomoxys omega Newstead, and Stomoxys pallidus Roubaud. Finally, the third clade includes both African occurring and more widespread species such as the livestock pest Stomoxys calcitrans Linnaeus. Divergence time estimates indicate that the genus Stomoxys originated in the late Oligocene around 30 million years ago, with the major lineages diversifying in the Early Miocene between 20 and 15 million years ago at a time when temperate forests developed in the Northern Hemisphere.",
				"archive": "Dryad Digital Repository",
				"extra": "{:itemType: dataset}",
				"itemID": "10.5061/dryad.9025",
				"libraryCatalog": "datadryad.org",
				"attachments": [],
				"tags": [
					"Molecular dating",
					"Phylogenetic relationship",
					"Stomoxys flies"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://datadryad.org/discover?query=&submit=Go&fq=dc.subject%3APhylogenetic+relationship&filtertype=*&filter=&rpp=5&sort_by=score&order=DESC",
		"items": "multiple"
	}
]
/** END TEST CASES **/