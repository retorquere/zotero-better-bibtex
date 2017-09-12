{
	"translatorID": "98ad3ad1-9d43-4b2e-bc36-172cbf00ba1d",
	"label": "eLife",
	"creator": "Aurimas Vinckevicius, Sebastian Karcher",
	"target": "^https?://(elife\\.)?elifesciences\\.org/(content/|search|category/|browse|archive)",
	"minVersion": "4.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsbv",
	"lastUpdated": "2017-01-01 15:18:32"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2014-2016 Aurimas Vinckevicius and Sebastian Karcher

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
	if(getSearchResults(doc).length) {
		return "multiple";
	}
	
	return "journalArticle";
}

function getSearchResults(doc) {
	return ZU.xpath(doc, '//div[contains(@class, "view-elife-search") or contains(@class, "view-elife-archive")]//\
				h2[@class="article-teaser__title"]/a');
}

function doWeb(doc, url) {
	if(detectWeb(doc, url) == "multiple") {
		var searchResults = getSearchResults(doc);
		var items = {};
		for(var i=0, n=searchResults.length; i<n; i++) {
			items[searchResults[i].href] = searchResults[i].textContent;
		}
		
		Z.selectItems(items, function(selectedItems) {
			if(!selectedItems) return true;
			
			var urls = [];
			for(var i in selectedItems) {
				urls.push(i);
			}
			ZU.processDocuments(urls, scrape);
		})
	} else {
		scrape(doc, url);
	}
}

function scrape(doc, url) {
	var translator = Zotero.loadTranslator("web");
	//Embedded Metadata
	translator.setTranslator("951c027d-74ac-47d4-a107-9c3069ab7b48");
	translator.setDocument(doc);
	translator.setHandler("itemDone", function(obj, item) {
		//make sure there is no PMID in extra. Only then use extra as abstract when we have none.
		if (item.extra) {
			
			var PMID = item.extra.match(/PMID:\s*\d+/);
			if(!item.abstractNote) item.abstractNote = item.extra.replace(/PMID:\s*\d+/, "");
			delete item.extra;
			if (PMID) item.extra = PMID[0];
		}
		//abstractNote may contain the title in the beginning, separated by a |
		if (item.abstractNote) {
			var pos = item.abstractNote.indexOf('|');
			if (pos>-1) {
				item.abstractNote = item.abstractNote.substr(pos+1);
			}
		}
		//the journal abbreviation field just repeates the journal title;
		item.journalAbbreviation = "";
		//some keywords have escaped html tags. unescape them so we don't split the tags
		keywords = ZU.xpathText(doc, '//meta[@name="citation_keywords"]/@content');
		if (keywords) {
			item.tags = [];
			keywords = ZU.unescapeHTML(keywords).split(/\s*,\s*/);
			for (var i = 0; i<keywords.length; i++) {
				item.tags.push(keywords[i]);
			}

		}
		//clean out the authors if they're not in citation_author, so we don't import junk from elsewhere
		//as on http://elifesciences.org/content/2/E00565V1
		if (!ZU.xpathText(doc, '//meta[@name="citation_author"]/@content')) {
			item.creators = [];
		}
		item.complete();
	});
	translator.getTranslatorObject(function(trans) {
		trans.itemType = 'journalArticle';
		trans.addCustomFields({
			'description': 'abstractNote'
		});
		trans.doWeb(doc, url);
	});
}
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://elifesciences.org/content/2/e00799",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "The eLife approach to peer review",
				"creators": [
					{
						"firstName": "Randy",
						"lastName": "Schekman",
						"creatorType": "author"
					},
					{
						"firstName": "Fiona",
						"lastName": "Watt",
						"creatorType": "author"
					},
					{
						"firstName": "Detlef",
						"lastName": "Weigel",
						"creatorType": "author"
					}
				],
				"date": "2013/04/30",
				"DOI": "10.7554/eLife.00799",
				"ISSN": "2050-084X",
				"abstractNote": "All editorial decisions at eLife are taken by working scientists in a process that emphasizes fairness, speed and transparency.",
				"extra": "PMID: 23638304",
				"language": "en",
				"libraryCatalog": "elifesciences.org",
				"pages": "e00799",
				"publicationTitle": "eLife",
				"rights": "© 2013, Schekman et al. This article is distributed under the terms of the Creative Commons Attribution License, which permits unrestricted use and redistribution provided that the original author and source are credited.",
				"url": "https://elifesciences.org/content/2/e00799v1",
				"volume": "2",
				"attachments": [
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					},
					{
						"title": "Snapshot"
					},
					{
						"title": "PubMed entry",
						"mimeType": "text/html",
						"snapshot": false
					}
				],
				"tags": [
					"<italic>eLife</italic>",
					"peer review",
					"publishing",
					"scientific publishing"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://elifesciences.org/content/2/e00767",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Unmasking the role of mast cells in dengue",
				"creators": [
					{
						"firstName": "Panisadee",
						"lastName": "Avirutnan",
						"creatorType": "author"
					},
					{
						"firstName": "Ponpan",
						"lastName": "Matangkasombut",
						"creatorType": "author"
					}
				],
				"date": "2013/04/30",
				"DOI": "10.7554/eLife.00767",
				"ISSN": "2050-084X",
				"abstractNote": "Immune cells called mast cells can hinder rather than help the body's response to dengue virus, which suggests that mast cell products could be used as biomarkers to identify severe forms of the disease.",
				"extra": "PMID: 23638302",
				"language": "en",
				"libraryCatalog": "elifesciences.org",
				"pages": "e00767",
				"publicationTitle": "eLife",
				"rights": "© 2013, Avirutnan and Matangkasombut. This article is distributed under the terms of the Creative Commons Attribution License, which permits unrestricted use and redistribution provided that the original author and source are credited.",
				"url": "https://elifesciences.org/content/2/e00767v1",
				"volume": "2",
				"attachments": [
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					},
					{
						"title": "Snapshot"
					},
					{
						"title": "PubMed entry",
						"mimeType": "text/html",
						"snapshot": false
					}
				],
				"tags": [
					"Human",
					"Mouse",
					"Virus",
					"chymase",
					"dengue virus",
					"infectious disease",
					"leukotrienes",
					"mast cell",
					"vascular leakage"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://elifesciences.org/content/2/e00473",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Accurate timekeeping is controlled by a cycling activator in Arabidopsis",
				"creators": [
					{
						"firstName": "Polly Yingshan",
						"lastName": "Hsu",
						"creatorType": "author"
					},
					{
						"firstName": "Upendra K.",
						"lastName": "Devisetty",
						"creatorType": "author"
					},
					{
						"firstName": "Stacey L.",
						"lastName": "Harmer",
						"creatorType": "author"
					}
				],
				"date": "2013/04/30",
				"DOI": "10.7554/eLife.00473",
				"ISSN": "2050-084X",
				"abstractNote": "The circadian clock in the model plant organism Arabidopsis thaliana is best described as a highly connected network made up of clock-regulated activators and repressors of transcription, rather than two coupled, repressor-based feedback loops.",
				"extra": "PMID: 23638299",
				"language": "en",
				"libraryCatalog": "elifesciences.org",
				"pages": "e00473",
				"publicationTitle": "eLife",
				"rights": "© 2013, Hsu et al. This article is distributed under the terms of the Creative Commons Attribution License, which permits unrestricted use and redistribution provided that the original author and source are credited.",
				"url": "https://elifesciences.org/content/2/e00473v1",
				"volume": "2",
				"attachments": [
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					},
					{
						"title": "Snapshot"
					},
					{
						"title": "PubMed entry",
						"mimeType": "text/html",
						"snapshot": false
					}
				],
				"tags": [
					"<italic>A. thaliana</italic>",
					"circadian rhythm",
					"evening element",
					"phase",
					"transcription factor"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://elifesciences.org/content/2/e00639",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Basic research at the epicenter of an epidemic",
				"creators": [
					{
						"firstName": "William R.",
						"lastName": "Bishai",
						"creatorType": "author"
					}
				],
				"date": "2013/04/02",
				"DOI": "10.7554/eLife.00639",
				"ISSN": "2050-084X",
				"abstractNote": "William R Bishai, director of the KwaZulu-Natal Research Institute for Tuberculosis and HIV (K-RITH), argues that the best place to carry out research into a disease is in its midst.",
				"extra": "PMID: 23577235",
				"language": "en",
				"libraryCatalog": "elifesciences.org",
				"pages": "e00639",
				"publicationTitle": "eLife",
				"rights": "© 2013, Bishai. This article is distributed under the terms of the Creative Commons Attribution License, which permits unrestricted use and redistribution provided that the original author and source are credited.",
				"url": "https://elifesciences.org/content/2/e00639v1",
				"volume": "2",
				"attachments": [
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					},
					{
						"title": "Snapshot"
					},
					{
						"title": "PubMed entry",
						"mimeType": "text/html",
						"snapshot": false
					}
				],
				"tags": [
					"HIV",
					"K-RITH",
					"South Africa",
					"TB",
					"drug resistance",
					"epidemic"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://elifesciences.org/content/2/e00565",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Correction: Quantification of gait parameters in freely walking wild type and sensory deprived Drosophila melanogaster",
				"creators": [
					{
						"firstName": "César S.",
						"lastName": "Mendes",
						"creatorType": "author"
					},
					{
						"firstName": "Imre",
						"lastName": "Bartos",
						"creatorType": "author"
					},
					{
						"firstName": "Turgay",
						"lastName": "Akay",
						"creatorType": "author"
					},
					{
						"firstName": "Szabolcs",
						"lastName": "Márka",
						"creatorType": "author"
					},
					{
						"firstName": "Richard S.",
						"lastName": "Mann",
						"creatorType": "author"
					}
				],
				"date": "2013/02/11",
				"DOI": "10.7554/eLife.00565",
				"ISSN": "2050-084X",
				"language": "en",
				"libraryCatalog": "elifesciences.org",
				"pages": "e00565",
				"publicationTitle": "eLife",
				"rights": "© 2013, Mendes et al. This article is distributed under the terms of the Creative Commons Attribution License, which permits unrestricted use and redistribution provided that the original author and source are credited.",
				"shortTitle": "Correction",
				"url": "https://elifesciences.org/content/2/e00565v1",
				"volume": "2",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					"<italic>D. melanogaster</italic>",
					"coordination",
					"gait analysis",
					"motor neuron",
					"proprioception",
					"sensory feedback",
					"walking behavior"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://elifesciences.org/category/biochemistry",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://elifesciences.org/search?keyword=RNA&sort_by=search_api_relevance",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://elifesciences.org/archive/2016/02",
		"items": "multiple"
	}
]
/** END TEST CASES **/