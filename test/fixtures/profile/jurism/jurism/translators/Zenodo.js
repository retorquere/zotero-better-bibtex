{
	"translatorID": "a714cb93-6595-482f-b371-a4ca0be14449",
	"label": "Zenodo",
	"creator": "Philipp Zumstein, Sebastian Karcher",
	"target": "^https?://zenodo\\.org",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2018-03-08 08:11:55"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2016, 2017 Philipp Zumstein & Sebastian Karcher

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
	if (url.includes('/record/')) {
		var collections = ZU.xpath(doc, '//span[@class="pull-right"]/span[contains(@class, "label-default")]');
		for (var i=0; i<collections.length; i++) {
			var type = collections[i].textContent.toLowerCase();
			//Z.debug(type)
			switch (type) {
			case "software":
				return "computerProgram";
			case "video/audio":
				return "videoRecording";//or audioRecording?
			case "figure":
			case "drawing":
			case "photo":
			case "diagram":
			case "plot":
				return "artwork";
			case "presentation":
			case "conference paper":
			case "poster":
			case "lesson":
				return "presentation";
			case "book":
				return "book";
			case "book section":
				return "bookSection";
			case "patent":
				return "patent";
			case "report":
			case "working paper":
			case "project deliverables":
			case "preprint":
				return "report";
			case "thesis":
				return "thesis";
			case "dataset":
				//change when dataset as itemtype is available
				return "document";
			case "journal article":
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
	var rows = ZU.xpath(doc, '//invenio-search-results//h4/a');
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


function scrape(doc, url) {
	var abstract = ZU.xpathText(doc, '//meta[@name="description"]/@content');
	var doi = ZU.xpathText(doc, '//meta[@name="citation_doi"]/@content');
	var schemaType = ZU.xpathText(doc, '//div[contains(@class, "record-detail")]//div[@itemscope]/@itemtype');
	var pdfURL = ZU.xpathText(doc, '//meta[@name="citation_pdf_url"]/@content');
	var tags = ZU.xpath(doc, '//meta[@name="citation_keywords"]');
	var cslURL = url.replace(/#.+/, "").replace(/\?.+/, "").replace(/\/export\/.+/, "") + "/export/csl";
	//Z.debug(cslURL)
	//Z.debug(schemaType)
	// use CSL JSON translator
	ZU.processDocuments(cslURL, function(newDoc){
		var text = ZU.xpathText(newDoc, '//h3/following-sibling::pre');
		//Z.debug(text)
		text = text.replace(/publisher_place/, "publisher-place");
		text = text.replace(/container_title/, "container-title");

		var trans = Zotero.loadTranslator('import');
		trans.setTranslator('bc03b4fe-436d-4a1f-ba59-de4d2d7a63f7');
		trans.setString(text);
		trans.setHandler("itemDone", function(obj, item) {
			// The "note" field of CSL maps to Extra. Put it in a note instead
			if (item.extra) {
				item.notes.push({"note": item.extra});
				item.extra = "";
			}

			if (!item.DOI && doi) {
				item.extra = "DOI: " + doi;
			}
			//workaround while we don't have proper item type for data
			//if (schemaType && schemaType.includes("Dataset")) {
			if (ZU.xpathText(doc, '//span[@class="pull-right"]/span[contains(@class, "label-default") and contains(., "Dataset")]')) {
				if (item.extra) {
					item.extra += "\ntype: dataset";
				}
				else {
					item.extra = "type: dataset";
				}
			}

			//get PDF attachment, otherwise just snapshot.
			if (pdfURL) {
				item.attachments.push({url:pdfURL, title: "Zenodo Full Text PDF", mimeType: "application/pdf"});
			}
			else {
				item.attachments.push({url:url, title: "Zenodo Snapshot", mimeType: "text/html"});
			}
			for (var i = 0; i<tags.length; i++) {
				item.tags.push(tags[i].content);
			}

			//something is odd with zenodo's author parsing to CSL on some pages; fix it
			//e.g. https://zenodo.org/record/569323
			for (var i = 0; i< item.creators.length; i++) {
				if (!item.creators[i].firstName) {
					if (item.creators[i].lastName.includes(",")) {
						item.creators[i].firstName = item.creators[i].lastName.replace(/.+?,\s*/, "");
						item.creators[i].lastName = item.creators[i].lastName.replace(/,.+/, "");
					} else {
						item.creators[i].fieldMode = true;
					}
				}
				delete item.creators[i].creatorTypeID;
			}

			//Don't use Zenodo as university for theses
			if (item.itemType == "thesis" && item.publisher == "Zenodo") {
				item.publisher = "";
			}
			if (item.date) item.date = ZU.strToISO(item.date);
			item.url = url;
			if (abstract) item.abstractNote = abstract;

			item.itemType = detectWeb(doc, url);
			item.itemID = "";
			item.complete();
		});
		trans.translate();
	});
}
/** BEGIN TEST CASES **/
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
						"lastName": "Asenov",
						"firstName": "Stefan",
						"creatorType": "author"
					}
				],
				"date": "2016-06-03",
				"abstractNote": "Modern day manufacturers research and develop vehicles that are equipped with steering assist to help drivers undertake manoeuvres. However the lack of research for a situation where one tie-rod experiences different strains than the opposite one leads to failure in the tie-rod assembly and misalignment in the wheels over time. The performance of the steering system would be improved if this information existed. This bachelor’s dissertation looks into this specific situation and conducts an examination on the tie-rods. A simple kinematic model is used to determine how the steering system moves when there is a steering input. An investigation has been conducted to determine how the system’s geometry affects the strains. The experiment vehicle is a Formula Student car which is designed by the students of Coventry University. The tests performed show the difference in situations where the two front tyres are on a single surface, two different surfaces – one with high friction, the other with low friction and a situation where there’s an obstacle in the way of one of the tyres. The experiment results show a major difference in strain in the front tie-rods in the different situations. Interesting conclusions can be made due to the results for the different surface situation where one of the tyres receives similar results in bothcompression and tension, but the other one receives results with great difference. This results given in the report can be a starting ground and help with the improvement in steering systems if more research is conducted.",
				"extra": "DOI: 10.5281/zenodo.54766",
				"libraryCatalog": "Zenodo",
				"url": "https://zenodo.org/record/54766?ln=en",
				"attachments": [
					{
						"title": "Zenodo Full Text PDF",
						"mimeType": "application/pdf"
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
						"lastName": "Guy",
						"firstName": "Marieke",
						"creatorType": "presenter"
					}
				],
				"date": "2015-09-17",
				"abstractNote": "Guides you through important steps in developing relevant visualizations by showcasing the work of PASTEUR4OA to develop visualizations from ROARMAP.",
				"extra": "DOI: 10.5281/zenodo.54747",
				"url": "https://zenodo.org/record/54747",
				"attachments": [
					{
						"title": "Zenodo Snapshot",
						"mimeType": "text/html"
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
						"lastName": "Bosselaers",
						"firstName": "Jan",
						"creatorType": "author"
					},
					{
						"lastName": "Henderickx",
						"firstName": "Hans",
						"creatorType": "author"
					}
				],
				"date": "2002-11-26",
				"abstractNote": "FIGURES 8-11. Savignia naniplopi sp. nov., female paratype. 8, epigyne, ventral view; 9, epigyne, posterior view; 10, epigyne, lateral view; 11, cleared vulva, ventral view. Scale bar: 8-10, 0.30 mm; 11, 0.13 mm.",
				"extra": "DOI: 10.5281/zenodo.14837",
				"libraryCatalog": "Zenodo",
				"shortTitle": "Figures 8-11 in A new Savignia from Cretan caves (Araneae",
				"url": "https://zenodo.org/record/14837?ln=en",
				"attachments": [
					{
						"title": "Zenodo Snapshot",
						"mimeType": "text/html"
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
				"notes": [
					{
						"note": "Figure uploaded by Plazi"
					}
				],
				"seeAlso": []
			}
		]
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
						"lastName": "List",
						"firstName": "Johann-Mattis",
						"creatorType": "author"
					}
				],
				"date": "2014-09-04",
				"ISBN": "9783943460728",
				"abstractNote": "The comparison of sound sequences (words, morphemes) constitutes the core of many techniques and methods in historical linguistics. With the help of these techniques, corresponding sounds can be determined, historically related words can be identified, and the history of languages can be uncovered. So far, the application of traditional techniques for sequence comparison is very tedious and time-consuming, since scholars have to apply them manually, without computational support. In this study, algorithms from bioinformatics are used to develop computational methods for sequence comparison in historical linguistics. The new methods automatize several steps of the traditional comparative method and can thus help to ease the painstaking work of language comparison.",
				"extra": "DOI: 10.5281/zenodo.11879",
				"libraryCatalog": "Zenodo",
				"place": "Düsseldorf",
				"publisher": "Düsseldorf University Press",
				"url": "https://zenodo.org/record/11879?ln=en",
				"attachments": [
					{
						"title": "Zenodo Full Text PDF",
						"mimeType": "application/pdf"
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
				"itemType": "document",
				"title": "X-ray diffraction images for  DPF3 tandem PHD fingers co-crystallized with an acetylated histone-derived peptide",
				"creators": [
					{
						"lastName": "Tempel",
						"firstName": "Wolfram",
						"creatorType": "author"
					},
					{
						"lastName": "Liu",
						"firstName": "Yanli",
						"creatorType": "author"
					},
					{
						"lastName": "Qin",
						"firstName": "Su",
						"creatorType": "author"
					},
					{
						"lastName": "Zhao",
						"firstName": "Anthony",
						"creatorType": "author"
					},
					{
						"lastName": "Loppnau",
						"firstName": "Peter",
						"creatorType": "author"
					},
					{
						"lastName": "Min",
						"firstName": "Jinrong",
						"creatorType": "author"
					}
				],
				"date": "2016-02-10",
				"abstractNote": "This submission includes a tar archive of bzipped diffraction images recorded with the ADSC Q315r detector at the Advanced Photon Source of Argonne National Laboratory, Structural Biology Center beam line 19-ID. Relevant meta data can be found in the headers of those diffraction images. Please find below the content of an input file XDS.INP for the program XDS (Kabsch, 2010), which may be used for data reduction. The \"NAME_TEMPLATE_OF_DATA_FRAMES=\" item inside XDS.INP may need to be edited to point to the location of the downloaded and untarred images. !!! Paste lines below in to a file named XDS.INP DETECTOR=ADSC  MINIMUM_VALID_PIXEL_VALUE=1  OVERLOAD= 65000 DIRECTION_OF_DETECTOR_X-AXIS= 1.0 0.0 0.0 DIRECTION_OF_DETECTOR_Y-AXIS= 0.0 1.0 0.0 TRUSTED_REGION=0.0 1.05 MAXIMUM_NUMBER_OF_JOBS=10 ORGX=   1582.82  ORGY=   1485.54 DETECTOR_DISTANCE= 150 ROTATION_AXIS= -1.0 0.0 0.0 OSCILLATION_RANGE=1 X-RAY_WAVELENGTH= 1.2821511 INCIDENT_BEAM_DIRECTION=0.0 0.0 1.0 FRACTION_OF_POLARIZATION=0.90 POLARIZATION_PLANE_NORMAL= 0.0 1.0 0.0 SPACE_GROUP_NUMBER=20 UNIT_CELL_CONSTANTS= 100.030   121.697    56.554    90.000    90.000    90.000 DATA_RANGE=1  180 BACKGROUND_RANGE=1 6 SPOT_RANGE=1 3 SPOT_RANGE=31 33 MAX_CELL_AXIS_ERROR=0.03 MAX_CELL_ANGLE_ERROR=2.0 TEST_RESOLUTION_RANGE=8.0 3.8 MIN_RFL_Rmeas= 50 MAX_FAC_Rmeas=2.0 VALUE_RANGE_FOR_TRUSTED_DETECTOR_PIXELS= 6000 30000 INCLUDE_RESOLUTION_RANGE=50.0 1.7 FRIEDEL'S_LAW= FALSE STARTING_ANGLE= -100      STARTING_FRAME=1 NAME_TEMPLATE_OF_DATA_FRAMES= ../x247398/t1.0???.img !!! End of XDS.INP",
				"extra": "DOI: 10.5281/zenodo.45756\ntype: dataset",
				"libraryCatalog": "Zenodo",
				"publisher": "Zenodo",
				"url": "https://zenodo.org/record/45756?ln=en#.VsoJtEKVuYU",
				"attachments": [
					{
						"title": "Zenodo Snapshot",
						"mimeType": "text/html"
					}
				],
				"tags": [
					"Structural Genomics Consortium",
					"crystallography",
					"diffraction",
					"protein structure"
				],
				"notes": [
					{
						"note": "Argonne is operated by UChicago Argonne, LLC, for the U.S. Department of Energy, Office of Biological and Environmental Research under contract DE-AC02-06CH11357. The SGC is a registered charity (number 1097737) that receives funds from AbbVie, Bayer Pharma AG, Boehringer Ingelheim, Canada Foundation for Innovation, Eshelman Institute for Innovation, Genome Canada through Ontario Genomics Institute, Innovative Medicines Initiative (EU/EFPIA) [ULTRA-DD grant no. 115766], Janssen, Merck & Co., Novartis Pharma AG, Ontario Ministry of Economic Development and Innovation, Pfizer, São Paulo Research Foundation-FAPESP, Takeda, and the Wellcome Trust."
					}
				],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://zenodo.org/search?page=1&size=20&q=&type=video",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://zenodo.org/record/569323#.WUiYiyeQxh9",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "A few words about methodology",
				"creators": [
					{
						"lastName": "Schaffer",
						"creatorType": "author",
						"firstName": "Frederic Charles"
					}
				],
				"date": "2016-12-31",
				"DOI": "10.5281/zenodo.569323",
				"abstractNote": "In mulling over how to most productively respond to the reflections offered by Lahra Smith, Gary Goertz, and Patrick Jackson, I tried to place myself in the armchair of a Qualitative & Multi-Method Research reader. What big methodological questions, I asked myself, are raised by their reviews of my book? How might I weigh in, generatively, on those questions?",
				"issue": "1/2",
				"libraryCatalog": "Zenodo",
				"pages": "52-56",
				"publicationTitle": "Qualitative & Multi-Method Research",
				"url": "https://zenodo.org/record/569323#.WUiYiyeQxh9",
				"volume": "14",
				"attachments": [
					{
						"title": "Zenodo Full Text PDF",
						"mimeType": "application/pdf"
					}
				],
				"tags": [
					"qualitative methods"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://zenodo.org/record/1048320",
		"items": [
			{
				"itemType": "computerProgram",
				"creators": [
					{
						"lastName": "Carl Boettiger",
						"firstName": "",
						"creatorType": "author",
						"fieldMode": true
					},
					{
						"lastName": "Maëlle Salmon",
						"firstName": "",
						"creatorType": "author",
						"fieldMode": true
					},
					{
						"lastName": "Noam Ross",
						"firstName": "",
						"creatorType": "author",
						"fieldMode": true
					},
					{
						"lastName": "Arfon Smith",
						"firstName": "",
						"creatorType": "author",
						"fieldMode": true
					},
					{
						"lastName": "Anna Krystalli",
						"firstName": "",
						"creatorType": "author",
						"fieldMode": true
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Zenodo Snapshot",
						"mimeType": "text/html"
					}
				],
				"title": "ropensci/codemetar: codemetar: Generate CodeMeta Metadata for R Packages",
				"publisher": "Zenodo",
				"abstractNote": "an R package for generating and working with codemeta",
				"date": "2017-11-13",
				"extra": "DOI: 10.5281/zenodo.1048320",
				"url": "https://zenodo.org/record/1048320",
				"libraryCatalog": "Zenodo",
				"accessDate": "2018-03-07T13:45:35Z",
				"shortTitle": "ropensci/codemetar",
				"company": "Zenodo"
			}
		]
	}
];
/** END TEST CASES **/
