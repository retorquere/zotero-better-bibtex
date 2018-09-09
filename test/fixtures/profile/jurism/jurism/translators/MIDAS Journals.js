{
	"translatorID": "86c35e86-3f97-4e80-9356-8209c97737c2",
	"label": "MIDAS Journals",
	"creator": "Rupert Brooks",
	"target": "^https?://(www\\.)?(insight-journal|midasjournal|vtkjournal)\\.org/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2018-04-16 11:27:22"
}

/*
	Midas Journal Translator
	(Includes ITKJournal,InsightJournal,VTKJournal)
	Copyright (C) 2016-18 Rupert Brooks
	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.
	
	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU Affero General Public License for more details.
	
	You should have received a copy of the GNU Affero General Public License
	along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/


// attr()/text() v2
function attr(docOrElem,selector,attr,index){var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector);return elem?elem.getAttribute(attr):null;}function text(docOrElem,selector,index){var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector);return elem?elem.textContent:null;}


function detectWeb(doc, url) {
	if (url.includes("browse/publication")) return "journalArticle";
	if (url.includes("search/?search=") || url.includes("/?journal=") || url.includes("/browse/journal/")) {
		if (getSearchResults(doc, true)) return "multiple";
	}
}


function scrape(doc, url) {
	var newItem = new Zotero.Item("journalArticle");
	newItem.title = text(doc, '#publication>div.title');
	newItem.url = text(doc, '#publication>table>tbody>tr>td>a');
	newItem.publicationTitle = text(doc, '#publication>div.journal>a', 0);
	newItem.seriesTitle = text(doc, '#publication>div.journal>a', 1);
	newItem.abstractNote = text(doc, '#publication>div.abstract');
	if (newItem.abstractNote) newItem.abstractNote = ZU.trimInternal(newItem.abstractNote);
	var issnString = ZU.xpathText(doc, '//div[contains(@class,"issn")]');
	var issnMatch = new RegExp('ISSN\\s+(\\w+-\\w+)');
	var issnParse = issnMatch.exec(issnString);
	// The midas journal has no ISSN tag, for some reason
	if (issnParse)
	{
		newItem.ISSN = issnParse[1];
	}
	var submittedString = text(doc, '#publication>div.submittedby');
	//e.g. Submitted by Karthik Krishnan on 06-26-2013.
	var datematch = new RegExp("on +([0-9]+)\\-([0-9]+)\\-([0-9]+)");
	var dateparse = datematch.exec(submittedString);
	newItem.date = dateparse[3]+"-"+dateparse[1]+"-"+ dateparse[2];
	
	var splitDownloadPath = ZU.xpathText(doc, '//a[contains(text(),"Download All")]/@href').split('/');
	var version = splitDownloadPath[splitDownloadPath.length-1];
	newItem.extra="Revision: " + version;
	// Article ID
	newItem.pages = splitDownloadPath[splitDownloadPath.length-2];
	
	var pdfhref = ZU.xpathText(doc, '//a[contains(text(),"Download Paper")]/@href');
	if (pdfhref) {
		var tmp = url.split('/');
		pdflink = tmp[0]+'//' + tmp[2] + pdfhref;
			newItem.attachments.push({
			title: "Fulltext",
			url: pdflink,
			mimeType: "application/pdf"
		});
	}
	newItem.attachments.push({
		title: "Snapshot",
		document: doc,
		mimeType:"text/html"
	});
	
	// Only in XML there are also the first name of the authors.
	var postData = "data[Export][select]=xml&data[Export][submit]=Export";
	ZU.doPost(url, postData, function(text) {
		//Z.debug(text);
		parser = new DOMParser();
		xml = parser.parseFromString(text, "application/xml");
		
		var authors = ZU.xpath(xml, '//Author');
		for (let author of authors) {
			let lastName = ZU.xpathText(author, './LastName');
			let firstName = ZU.xpathText(author, './FirstName');
			newItem.creators.push({
				lastName: lastName,
				firstName: firstName,
				creatorType: "author"
			});
		}
		
		var tags = ZU.xpath(xml, '//Keyword');
		for (let tag of tags) {
			newItem.tags.push(tag.textContent);
		}
		
		newItem.language = ZU.xpathText(xml, '//Language');
		
		newItem.complete();
	});

}


function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = doc.querySelectorAll('.publication_title>a, td>a');
	for (var i=0; i<rows.length; i++) {
		var href = rows[i].href;
		if (!href.includes('/browse/publication/')) continue;
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
			var articles = [];
			for (var i in items) {
				articles.push(i);
			}
			ZU.processDocuments(articles, scrape);
		});
	} else {
		scrape(doc, url);
	}
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.insight-journal.org/browse/publication/988",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Computing Bone Morphometric Feature Maps from 3-Dimensional Images",
				"creators": [
					{
						"lastName": "Vimort",
						"firstName": "Jean-Baptiste",
						"creatorType": "author"
					},
					{
						"lastName": "McCormick",
						"firstName": "Matthew",
						"creatorType": "author"
					},
					{
						"lastName": "Paniagua",
						"firstName": "Beatriz",
						"creatorType": "author"
					}
				],
				"date": "2017-11-02",
				"ISSN": "2327-770X",
				"abstractNote": "This document describes a new remote module implemented for the Insight Toolkit (ITK), itkBoneMorphometry. This module contains bone analysis filters that compute features from N-dimensional images that represent the internal architecture of bone. The computation of the bone morphometry features in this module is based on well known methods. The two filters contained in this module are itkBoneMorphometryFeaturesFilter. which computes a set of features that describe the whole input image in the form of a feature vector, and itkBoneMorphometryFeaturesImageFilter, which computes an N-D feature map that locally describes the input image (i.e. for every voxel). itkBoneMorphometryFeaturesImageFilter can be configured based in the locality of the desired morphometry features by specifying the neighborhood size. This paper is accompanied by the source code, the input data, the choice of parameters and the output data that we have used for validating the algorithms described. This adheres to the fundamental principle that scientific publications must facilitate reproducibility of the reported results.",
				"extra": "Revision: 1",
				"libraryCatalog": "MIDAS Journals",
				"pages": "988",
				"publicationTitle": "The Insight Journal",
				"seriesTitle": "2017 January-December",
				"url": "http://hdl.handle.net/10380/3588",
				"attachments": [
					{
						"title": "Fulltext",
						"mimeType": "application/pdf"
					},
					{
						"title": "Snapshot",
						"mimeType": "text/html"
					}
				],
				"tags": [
					{
						"tag": "Bone Morphometry"
					},
					{
						"tag": "Image feature"
					},
					{
						"tag": "remote module"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.insight-journal.org/browse/publication/645",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Rotational Registration of Spherical Surfaces Represented as QuadEdge Meshes",
				"creators": [
					{
						"lastName": "Ibanez",
						"firstName": "Luis",
						"creatorType": "author"
					},
					{
						"lastName": "Audette",
						"firstName": "Michel",
						"creatorType": "author"
					},
					{
						"lastName": "Yeo",
						"firstName": "B.T. Thomas",
						"creatorType": "author"
					},
					{
						"lastName": "Golland",
						"firstName": "Polina",
						"creatorType": "author"
					}
				],
				"date": "2009-06-04",
				"ISSN": "2327-770X",
				"abstractNote": "This document describes a contribution to the Insight Toolkit intended to support the process of registering two Meshes. The methods included here are restricted to Meshes with a Spherical geometry and topology, and with scalar values associated to their nodes. This paper is accompanied with the source code, input data, parameters and output data that we used for validating the algorithm described in this paper. This adheres to the fundamental principle that scientific publications must facilitate reproducibility of the reported results.",
				"extra": "Revision: 3",
				"libraryCatalog": "MIDAS Journals",
				"pages": "645",
				"publicationTitle": "The Insight Journal",
				"seriesTitle": "2009 January - June",
				"url": "http://hdl.handle.net/10380/3063",
				"attachments": [
					{
						"title": "Fulltext",
						"mimeType": "application/pdf"
					},
					{
						"title": "Snapshot",
						"mimeType": "text/html"
					}
				],
				"tags": [
					{
						"tag": "Mesh"
					},
					{
						"tag": "Mesh Registration"
					},
					{
						"tag": "QuadEdgeMesh"
					},
					{
						"tag": "Registration"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.insight-journal.org/browse/publication/983",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Automatic Conductance Estimation Methods for Anisotropic Diffusion ITK Filters",
				"creators": [
					{
						"lastName": "Senra Filho",
						"firstName": "Antonio Carlos",
						"creatorType": "author"
					}
				],
				"date": "2017-05-03",
				"ISSN": "2327-770X",
				"abstractNote": "The anisotropic diffusion algorithm has been intensively studied in the past decades, which could be considered as a very efficient image denoising procedure in many biomedical applications. Several authors contributed many clever solutions for diffusion parameters fitting in specific imaging modalities. Furthermore, besides improvements regarding the image denoising quality, one important variable that must be carefully set is the conductance, which regulates the structural edges preservation among the objects presented in the image. The conductance value is strongly dependent on image noise level and an appropriate parameter setting is, usually, difficult to find for different images databases and modalities. Fortunately, thanks to many efforts from the scientific community, a few automatic methods have been proposed in order to set the conductance value automatically. Here, it is presented an ITK class which offers a simple collection of the most common automatic conductance setting approaches in order to assist researchers in image denoising procedures using anisotropic-based filtering methods (such as well described in the AnisotropicDiffusionFunction class).",
				"extra": "Revision: 1",
				"libraryCatalog": "MIDAS Journals",
				"pages": "983",
				"publicationTitle": "The Insight Journal",
				"seriesTitle": "2017 January-December",
				"url": "http://hdl.handle.net/10380/3572",
				"attachments": [
					{
						"title": "Fulltext",
						"mimeType": "application/pdf"
					},
					{
						"title": "Snapshot",
						"mimeType": "text/html"
					}
				],
				"tags": [
					{
						"tag": "Anisotropic Diffusion"
					},
					{
						"tag": "Conductance"
					},
					{
						"tag": "Image Filtering"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.midasjournal.org/?journal=40",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://www.vtkjournal.org/browse/journal/53",
		"items": "multiple"
	}
]
/** END TEST CASES **/
