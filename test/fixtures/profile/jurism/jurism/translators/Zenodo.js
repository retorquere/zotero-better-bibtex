{
	"translatorID": "a714cb93-6595-482f-b371-a4ca0be14449",
	"label": "Zenodo",
	"creator": "Philipp Zumstein",
	"target": "^https?://zenodo\\.org",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2016-06-13 10:18:29"
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
	if (url.indexOf('/record/')>-1) {
		var collections = ZU.xpath(doc, '//div[contains(@class, "metadata")]//a[@class="navtrail"]');
		for (var i=0; i<collections.length; i++) {
			//Z.debug(collections[i].textContent);
			switch (collections[i].textContent) {
				case "Software":
					return "computerProgram";
				case "Videos/Audio":
					return "videoRecording";//or audioRecording?
				case "Images":
					return "artwork";
				case "Presentations":
				case "Posters":
					return "presentation";
				case "Lessons":
				case "Books":
					return "book";
				case "book-section":
					return "chapter";
				case "conference-papers":
					return "conferencePaper"
				case "patents":
					return "patent";
				case "reports":
				case "working-papers":
				case "technical-notes":
				case "project-deliverables":
				case "project-milestones":
				case "proposals":
					return "report";
				case "Theses":
					return "thesis";
				case "Datasets":
					//change when dataset as itemtype is available
				case "journal-articles":
				case "preprints":
					return "journalArticle";
			}
		}
		return "journalArticle";
	} else if (getSearchResults(doc, true)) {
		return "multiple";
	}
}

function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = ZU.xpath(doc, '//div[contains(@class, "row")]//h4/a');
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
	var translator = Zotero.loadTranslator('web');
	var type = detectWeb(doc, url);
	var schemaType = ZU.xpathText(doc, '//div[@id="wrap"]//div[@itemscope]/@itemtype');
	// Embedded Metadata
	translator.setTranslator('951c027d-74ac-47d4-a107-9c3069ab7b48');
	translator.setDocument(doc);

	translator.setHandler('itemDone', function (obj, item) {
		// sometimes DOIs have to been cleaned up
		// e.g. https://zenodo.org/record/54747
		var dois = item.DOI.split(", ");
		var cleaned = [];
		for (var i=0; i<dois.length; i++) {
			if (dois[i].substr(0,3) == "10.") {
				cleaned.push(dois[i]);
			}
		}
		item.DOI = cleaned.join();
		if (type != "journalArticle" && type != "conferencePaper") {
			item.extra = "DOI: " + item.DOI;
		}
		if (schemaType == "http://schema.org/Dataset") {
			item.extra = "itemType: dataset\n" + "DOI: " + item.DOI;
		}
		item.complete();
	});

	translator.getTranslatorObject(function(trans) {
		trans.itemType = type;
		trans.doWeb(doc, url);
	});
}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://zenodo.org/record/54766?ln=en",
		"items": [
			{
				"itemType": "thesis",
				"title": "Measurement and Analysis of Strains Developed on Tie-rods of a Steering System",
				"creators": [
					{
						"firstName": "Stefan",
						"lastName": "Asenov",
						"creatorType": "author"
					}
				],
				"date": "2016/06/03",
				"abstractNote": "Modern day manufacturers research and develop vehicles that are equipped\nwith steering assist to help drivers undertake manoeuvres. However the lack of\nresearch for a situation where one tie-rod experiences different strains than the\nopposite one leads to failure in the tie-rod assembly and misalignment in the wheels&nbsp;over time. The performance of the steering system would be improved if this&nbsp;information existed. This bachelor&rsquo;s dissertation looks into this specific situation and&nbsp;conducts an examination on the tie-rods.\nA simple kinematic model is used to determine how the steering system moves\nwhen there is a steering input. An investigation has been conducted to determine how&nbsp;the system&rsquo;s geometry affects the strains.\nThe experiment vehicle is a Formula Student car which is designed by the\nstudents of Coventry University. The tests performed show the difference in situations&nbsp;where the two front tyres are on a single surface, two different surfaces &ndash; one with high&nbsp;friction, the other with low friction and a situation where there&rsquo;s an obstacle in the way&nbsp;of one of the tyres.\nThe experiment results show a major difference in strain in the front tie-rods in\nthe different situations. Interesting conclusions can be made due to the results for the&nbsp;different surface situation where one of the tyres receives similar results in bothcompression and tension, but the other one receives results with great difference.\nThis results given in the report can be a starting ground and help with the\nimprovement in steering systems if more research is conducted.",
				"extra": "DOI: 10.5281/zenodo.54766",
				"libraryCatalog": "zenodo.org",
				"url": "http://zenodo.org/record/54766",
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
					"strain steering system"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://zenodo.org/record/54747",
		"items": [
			{
				"itemType": "presentation",
				"title": "An introduction to data visualizations for open access advocacy",
				"creators": [
					{
						"firstName": "Marieke",
						"lastName": "Guy",
						"creatorType": "author"
					}
				],
				"date": "2015/09/17",
				"abstractNote": "Guides you through important steps in developing relevant visualizations by showcasing the work of PASTEUR4OA to develop visualizations from ROARMAP.",
				"extra": "DOI: 10.5281/zenodo.54747",
				"url": "http://zenodo.org/record/54747",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					"Data visualisation",
					"Open Access",
					"Open Access policy",
					"PASTEUR4OA",
					"ROARMAP"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://zenodo.org/record/14837?ln=en",
		"items": [
			{
				"itemType": "artwork",
				"title": "Figures 8-11 in A new Savignia from Cretan caves (Araneae: Linyphiidae)",
				"creators": [
					{
						"firstName": "Jan",
						"lastName": "Bosselaers",
						"creatorType": "author"
					},
					{
						"firstName": "Hans",
						"lastName": "Henderickx",
						"creatorType": "author"
					}
				],
				"date": "2002/11/26",
				"abstractNote": "FIGURES 8-11. Savignia naniplopi sp. nov., female paratype. 8, epigyne, ventral view; 9, epigyne, posterior view; 10, epigyne, lateral view; 11, cleared vulva, ventral view. Scale bar: 8-10, 0.30 mm; 11, 0.13 mm.",
				"extra": "DOI: 10.5281/zenodo.14837",
				"libraryCatalog": "zenodo.org",
				"shortTitle": "Figures 8-11 in A new Savignia from Cretan caves (Araneae",
				"url": "http://zenodo.org/record/14837",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					"Arachnida",
					"Araneae",
					"Crete",
					"Greece",
					"Linyphiidae",
					"Savignia",
					"cave",
					"new species",
					"troglobiont"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://zenodo.org/search?ln=en&p=zotero&action_search=",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://zenodo.org/record/11879?ln=en",
		"items": [
			{
				"itemType": "book",
				"title": "Sequence Comparison in Historical Linguistics",
				"creators": [
					{
						"firstName": "Johann-Mattis",
						"lastName": "List",
						"creatorType": "author"
					},
					{
						"firstName": "Hans",
						"lastName": "Geisler",
						"creatorType": "author"
					},
					{
						"firstName": "Wiebke",
						"lastName": "Petersen",
						"creatorType": "author"
					}
				],
				"date": "2014",
				"ISBN": "9783943460728",
				"abstractNote": "The comparison of sound sequences (words, morphemes) constitutes the core of many techniques and methods in historical linguistics. With the help of these techniques, corresponding sounds can be determined, historically related words can be identified, and the history of languages can be uncovered. So far, the application of traditional techniques for sequence comparison is very tedious and time-consuming, since scholars have to apply them manually, without computational support. In this study, algorithms from bioinformatics are used to develop computational methods for sequence comparison in historical linguistics. The new methods automatize several steps of the traditional comparative method and can thus help to ease the painstaking work of language comparison.",
				"extra": "DOI: 10.5281/zenodo.11879",
				"libraryCatalog": "zenodo.org",
				"publisher": "Düsseldorf University Press",
				"url": "http://zenodo.org/record/11879",
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
					"computational linguistics",
					"historical linguistics",
					"phonetic alignment",
					"sequence comparison"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://zenodo.org/record/45756?ln=en#.VsoJtEKVuYU",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "X-ray diffraction images for DPF3 tandem PHD fingers co-crystallized with an acetylated histone-derived peptide",
				"creators": [
					{
						"firstName": "Wolfram",
						"lastName": "Tempel",
						"creatorType": "author"
					},
					{
						"firstName": "Yanli",
						"lastName": "Liu",
						"creatorType": "author"
					},
					{
						"firstName": "Jinrong",
						"lastName": "Min",
						"creatorType": "author"
					},
					{
						"firstName": "Peter",
						"lastName": "Loppnau",
						"creatorType": "author"
					},
					{
						"firstName": "Anthony",
						"lastName": "Zhao",
						"creatorType": "author"
					},
					{
						"firstName": "Su",
						"lastName": "Qin",
						"creatorType": "author"
					}
				],
				"date": "2016/02/10",
				"DOI": "10.5281/zenodo.45756",
				"abstractNote": "This submission includes a tar archive of bzipped diffraction images recorded with the ADSC Q315r detector at the Advanced Photon Source of Argonne National Laboratory, Structural Biology Center beam line 19-ID. Relevant meta data can be found in the headers of those diffraction images.\n\nPlease find below the content of an input file XDS.INP for the program&nbsp;XDS&nbsp;(Kabsch, 2010), which&nbsp;may be used for data reduction. The &quot;NAME_TEMPLATE_OF_DATA_FRAMES=&quot; item inside&nbsp;XDS.INP may need to be edited to point to the location of the downloaded and untarred images.\n\n!!! Paste lines below in to a file named XDS.INP\n\nDETECTOR=ADSC &nbsp;MINIMUM_VALID_PIXEL_VALUE=1 &nbsp;OVERLOAD= 65000\nDIRECTION_OF_DETECTOR_X-AXIS= 1.0 0.0 0.0\nDIRECTION_OF_DETECTOR_Y-AXIS= 0.0 1.0 0.0\nTRUSTED_REGION=0.0 1.05\nMAXIMUM_NUMBER_OF_JOBS=10\nORGX= &nbsp; 1582.82 &nbsp;ORGY= &nbsp; 1485.54\nDETECTOR_DISTANCE= 150\nROTATION_AXIS= -1.0 0.0 0.0\nOSCILLATION_RANGE=1\nX-RAY_WAVELENGTH= 1.2821511\nINCIDENT_BEAM_DIRECTION=0.0 0.0 1.0\nFRACTION_OF_POLARIZATION=0.90\nPOLARIZATION_PLANE_NORMAL= 0.0 1.0 0.0\nSPACE_GROUP_NUMBER=20\nUNIT_CELL_CONSTANTS= 100.030 &nbsp; 121.697 &nbsp; &nbsp;56.554 &nbsp; &nbsp;90.000 &nbsp; &nbsp;90.000 &nbsp; &nbsp;90.000\nDATA_RANGE=1 &nbsp;180\nBACKGROUND_RANGE=1 6\nSPOT_RANGE=1 3\nSPOT_RANGE=31 33\nMAX_CELL_AXIS_ERROR=0.03\nMAX_CELL_ANGLE_ERROR=2.0\nTEST_RESOLUTION_RANGE=8.0 3.8\nMIN_RFL_Rmeas= 50\nMAX_FAC_Rmeas=2.0\nVALUE_RANGE_FOR_TRUSTED_DETECTOR_PIXELS= 6000 30000\nINCLUDE_RESOLUTION_RANGE=50.0 1.7\nFRIEDEL&#39;S_LAW= FALSE\nSTARTING_ANGLE= -100 &nbsp; &nbsp; &nbsp;STARTING_FRAME=1\nNAME_TEMPLATE_OF_DATA_FRAMES= ../x247398/t1.0???.img\n\n!!! End of XDS.INP\n\n&nbsp;\n\n&nbsp;",
				"extra": "itemType: dataset\nDOI: 10.5281/zenodo.45756",
				"libraryCatalog": "zenodo.org",
				"publicationTitle": "Zenodo",
				"url": "http://zenodo.org/record/45756",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					"Structural Genomics Consortium",
					"crystallography",
					"diffraction",
					"protein structure"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/