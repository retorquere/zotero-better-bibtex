{
	"translatorID": "7448d1d7-57e4-4685-b6e4-d4d9f7046fc2",
	"label": "SFU IPinCH",
	"creator": "Aurimas Vinckevicius",
	"target": "^https?://[^/]*sfu\\.ca/kbipinch/(records|browse|search)/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2013-06-19 10:30:31"
}

/*
	***** BEGIN LICENSE BLOCK *****

	SFU IPinCH - translator for Zotero
	Copyright © 2010 Aurimas Vinckevicius

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
	if (url.indexOf('/browse/') != -1 || url.indexOf('/search/') != -1) {
		if (ZU.xpath(doc, '//div[@class="citation"]').length) {
			return 'multiple';
		}
	} else if (url.indexOf('/records/') != -1) {
		var type = ZU.xpathText(doc, '//meta[@name="itemType"]/@content');
		if (type && ZU.itemTypeExists(type)) {
			return type;
		}
	}
}

function scrape(doc, url) {
	var item = new Zotero.Item(detectWeb(doc, url));
	var meta = ZU.xpath(doc, '//meta[@name]');
	var place = new Array();
	var date = ['', '', ''];
	var months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun',
				'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
	for (var i=0, n=meta.length; i<n; i++) {
		switch (meta[i].name) {
			case 'author':
			case 'editor':
			case 'persenter':
			case 'artist':
				item.creators.push(
					ZU.cleanAuthor(meta[i].content, meta[i].name, true));
				break;
			case 'title':
			case 'publicationTitle':
			case 'bookTitle':
			case 'volume':
			case 'pages':
			case 'edition':
			case 'publisher':
			case 'conferenceName':
			case 'websiteTitle':
			case 'rights':
				item[meta[i].name] = ZU.trimInternal(meta[i].content);
				break;
			case 'dateY':
				date[0] = meta[i].content;
				break;
			case 'dateM':
				date[1] = months.indexOf(meta[i].content.trim()
											.toLowerCase().substr(0,3)) + 1 ||
								meta[i].content.replace(/\D+/g, '');
				break;
			//case 'dateDE':	end date for presentation
			case 'dateD':
				date[2] = meta[i].content.replace(/\D+/g,'');
			case 'issue':
				item.issue = meta[i].content.replace(/\D+/g, '');
				break
			case 'place':
			case 'placeCity':
				place[0] = meta[i].content;
				break;
			case 'placeCountry':
				place[1] = meta[i].content;
				break;
			case 'description':
				item.abstractNote = ZU.trimInternal(meta[i].content);
				break;
			case 'keywords':
				item.tags = meta[i].content.split(/,\s+/);
				break;
			case 'url':
				item.url = meta[i].content;
				break;
			case 'medium':
				item.artworkMedium = meta[i].content;
				break;
		}
	}

	if (!item.title) item.title = ZU.xpathText(doc, '//title')
									.split(/\s*\|/)[0].trim();

	if (place[0]) item.place = place.join(', ');
	else item.place = place[1];

	item.date = date.join('-').replace(/(^-.*|--.*|-$)/g,'');
	item.libraryCatalog = 'IPinCH';
	item.callNumber = url.match(/records\/(\d+)/i)[1];
	item.complete();
}

function doWeb(doc, url) {
	if (detectWeb(doc, url) == 'multiple') {
		var links = ZU.xpath(doc, '//div[@class="citation"]');
		Zotero.selectItems(ZU.getItemArray(doc, links), function(selectedItems) {
			if (!selectedItems) return true;

			var urls = new Array();
			for (var i in selectedItems) {
				urls.push(i);
			}
			ZU.processDocuments(urls,
						function(doc) { scrape(doc, doc.location.href) });
		});
	} else {
		scrape(doc, url);
	}
}
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.sfu.ca/kbipinch/records/125/",
		"items": [
			{
				"itemType": "presentation",
				"creators": [],
				"notes": [],
				"tags": [
					"IPinCH",
					"ipinch",
					"IP",
					"intellectual property",
					"cultural heritage",
					"traditional knowledge",
					"community-based participatory research",
					"theory",
					"practice",
					"policy",
					"ethics",
					"archaeology",
					"research",
					"Aboriginal",
					"indigenous",
					"culture",
					"anthropology",
					"law",
					"museum",
					"community",
					"knowledge",
					"academic"
				],
				"seeAlso": [],
				"attachments": [],
				"abstractNote": "<p>The Intellectual Property Issues in Cultural Heritage (IPinCH) research project is an international collaboration of over 50 archaeologists, lawyers, anthropologists, museum specialists, ethicists and other specialists, and 25 partnering organizations (including, among others, Parks Canada, the World Intellectual Property Organization, the Champagne and Aishihik First Nation, and the Barunga Community Management Board, an Aboriginal organization from Australia) building a foundation to facilitate fair and equitable exchanges of knowledge relating to archaeology and cultural heritage. The project is concerned with the theoretical, ethical, and practical implications of using knowledge about the past, and how these may affect communities, researchers, and other stakeholders. Based at the Archaeology Department of Simon Fraser University, in Burnaby, British Columbia, Canada, the project is funded by the Social Sciences and Humanities Research Council of Canada. Project team members and partner organizations can be found in Canada, USA, Australia, New Zealand, UK, Germany, Switzerland and South Africa. A number of partner organizations are indigenous communities. Research will follow a community-based participatory research (CBPR) approach. The IPinCH project provides a foundation of research, knowledge and resources to assist scholars, academic institutions, descendant communities, policy makers, and many other stakeholders in negotiating more equitable and successful terms of research and policies through an agenda of community-based field research and topical exploration of intellectual property issues.</p>",
				"rights": "Author",
				"title": "Indigenous concepts, values and knowledge for sustainable development: New Zealand case studies",
				"issue": "22",
				"place": "University of Waikato, Hamilton, New Zealand",
				"date": "2002-11-22",
				"libraryCatalog": "IPinCH",
				"callNumber": "125",
				"shortTitle": "Indigenous concepts, values and knowledge for sustainable development"
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.sfu.ca/kbipinch/records/13/",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"firstName": "Thomas",
						"lastName": "Hayden",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [
					"IPinCH",
					"ipinch",
					"IP",
					"intellectual property",
					"cultural heritage",
					"traditional knowledge",
					"community-based participatory research",
					"theory",
					"practice",
					"policy",
					"ethics",
					"archaeology",
					"research",
					"Aboriginal",
					"indigenous",
					"culture",
					"anthropology",
					"law",
					"museum",
					"community",
					"knowledge",
					"academic"
				],
				"seeAlso": [],
				"attachments": [],
				"abstractNote": "<p>The Intellectual Property Issues in Cultural Heritage (IPinCH) research project is an international collaboration of over 50 archaeologists, lawyers, anthropologists, museum specialists, ethicists and other specialists, and 25 partnering organizations (including, among others, Parks Canada, the World Intellectual Property Organization, the Champagne and Aishihik First Nation, and the Barunga Community Management Board, an Aboriginal organization from Australia) building a foundation to facilitate fair and equitable exchanges of knowledge relating to archaeology and cultural heritage. The project is concerned with the theoretical, ethical, and practical implications of using knowledge about the past, and how these may affect communities, researchers, and other stakeholders. Based at the Archaeology Department of Simon Fraser University, in Burnaby, British Columbia, Canada, the project is funded by the Social Sciences and Humanities Research Council of Canada. Project team members and partner organizations can be found in Canada, USA, Australia, New Zealand, UK, Germany, Switzerland and South Africa. A number of partner organizations are indigenous communities. Research will follow a community-based participatory research (CBPR) approach. The IPinCH project provides a foundation of research, knowledge and resources to assist scholars, academic institutions, descendant communities, policy makers, and many other stakeholders in negotiating more equitable and successful terms of research and policies through an agenda of community-based field research and topical exploration of intellectual property issues.</p>",
				"rights": "Nature Publishing Group",
				"pages": "481-483",
				"volume": "445",
				"publicationTitle": "Nature",
				"title": "Ground Force",
				"issue": "7127",
				"date": "2007",
				"libraryCatalog": "IPinCH",
				"callNumber": "13"
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.sfu.ca/kbipinch/records/14/",
		"items": [
			{
				"itemType": "conferencePaper",
				"creators": [
					{
						"firstName": "Kimberly",
						"lastName": "Christen",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [
					"IPinCH",
					"ipinch",
					"IP",
					"intellectual property",
					"cultural heritage",
					"traditional knowledge",
					"community-based participatory research",
					"theory",
					"practice",
					"policy",
					"ethics",
					"archaeology",
					"research",
					"Aboriginal",
					"indigenous",
					"culture",
					"anthropology",
					"law",
					"museum",
					"community",
					"knowledge",
					"academic"
				],
				"seeAlso": [],
				"attachments": [],
				"abstractNote": "<p>The Intellectual Property Issues in Cultural Heritage (IPinCH) research project is an international collaboration of over 50 archaeologists, lawyers, anthropologists, museum specialists, ethicists and other specialists, and 25 partnering organizations (including, among others, Parks Canada, the World Intellectual Property Organization, the Champagne and Aishihik First Nation, and the Barunga Community Management Board, an Aboriginal organization from Australia) building a foundation to facilitate fair and equitable exchanges of knowledge relating to archaeology and cultural heritage. The project is concerned with the theoretical, ethical, and practical implications of using knowledge about the past, and how these may affect communities, researchers, and other stakeholders. Based at the Archaeology Department of Simon Fraser University, in Burnaby, British Columbia, Canada, the project is funded by the Social Sciences and Humanities Research Council of Canada. Project team members and partner organizations can be found in Canada, USA, Australia, New Zealand, UK, Germany, Switzerland and South Africa. A number of partner organizations are indigenous communities. Research will follow a community-based participatory research (CBPR) approach. The IPinCH project provides a foundation of research, knowledge and resources to assist scholars, academic institutions, descendant communities, policy makers, and many other stakeholders in negotiating more equitable and successful terms of research and policies through an agenda of community-based field research and topical exploration of intellectual property issues.</p>",
				"rights": "Authors",
				"conferenceName": "Folklore and Ethnomusicology Colloquium Series on Intellectual and Cultural Property",
				"title": "Mundane Mobilizations and Practical Partnerships: Repackaging Aboriginal Culture",
				"place": "Indiana University, Bloomington, U.S.A",
				"date": "2004-11",
				"libraryCatalog": "IPinCH",
				"callNumber": "14",
				"shortTitle": "Mundane Mobilizations and Practical Partnerships"
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.sfu.ca/kbipinch/records/20/",
		"items": [
			{
				"itemType": "magazineArticle",
				"creators": [
					{
						"firstName": "David",
						"lastName": "Lowenthal",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [
					"IPinCH",
					"ipinch",
					"IP",
					"intellectual property",
					"cultural heritage",
					"traditional knowledge",
					"community-based participatory research",
					"theory",
					"practice",
					"policy",
					"ethics",
					"archaeology",
					"research",
					"Aboriginal",
					"indigenous",
					"culture",
					"anthropology",
					"law",
					"museum",
					"community",
					"knowledge",
					"academic"
				],
				"seeAlso": [],
				"attachments": [],
				"abstractNote": "<p>The Intellectual Property Issues in Cultural Heritage (IPinCH) research project is an international collaboration of over 50 archaeologists, lawyers, anthropologists, museum specialists, ethicists and other specialists, and 25 partnering organizations (including, among others, Parks Canada, the World Intellectual Property Organization, the Champagne and Aishihik First Nation, and the Barunga Community Management Board, an Aboriginal organization from Australia) building a foundation to facilitate fair and equitable exchanges of knowledge relating to archaeology and cultural heritage. The project is concerned with the theoretical, ethical, and practical implications of using knowledge about the past, and how these may affect communities, researchers, and other stakeholders. Based at the Archaeology Department of Simon Fraser University, in Burnaby, British Columbia, Canada, the project is funded by the Social Sciences and Humanities Research Council of Canada. Project team members and partner organizations can be found in Canada, USA, Australia, New Zealand, UK, Germany, Switzerland and South Africa. A number of partner organizations are indigenous communities. Research will follow a community-based participatory research (CBPR) approach. The IPinCH project provides a foundation of research, knowledge and resources to assist scholars, academic institutions, descendant communities, policy makers, and many other stakeholders in negotiating more equitable and successful terms of research and policies through an agenda of community-based field research and topical exploration of intellectual property issues.</p>",
				"rights": "Author; Spiked 2000-2005",
				"title": "Heritage Wars",
				"publicationTitle": "Spiked Culture",
				"url": "http://www.spiked-online.com/Articles/0000000CAFCC.htm",
				"date": "2006",
				"libraryCatalog": "IPinCH",
				"callNumber": "20",
				"accessDate": "CURRENT_TIMESTAMP"
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.sfu.ca/kbipinch/records/24/",
		"items": [
			{
				"itemType": "webpage",
				"creators": [
					{
						"lastName": "Archaeological Data Service",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [
					"IPinCH",
					"ipinch",
					"IP",
					"intellectual property",
					"cultural heritage",
					"traditional knowledge",
					"community-based participatory research",
					"theory",
					"practice",
					"policy",
					"ethics",
					"archaeology",
					"research",
					"Aboriginal",
					"indigenous",
					"culture",
					"anthropology",
					"law",
					"museum",
					"community",
					"knowledge",
					"academic"
				],
				"seeAlso": [],
				"attachments": [],
				"abstractNote": "<p>The Intellectual Property Issues in Cultural Heritage (IPinCH) research project is an international collaboration of over 50 archaeologists, lawyers, anthropologists, museum specialists, ethicists and other specialists, and 25 partnering organizations (including, among others, Parks Canada, the World Intellectual Property Organization, the Champagne and Aishihik First Nation, and the Barunga Community Management Board, an Aboriginal organization from Australia) building a foundation to facilitate fair and equitable exchanges of knowledge relating to archaeology and cultural heritage. The project is concerned with the theoretical, ethical, and practical implications of using knowledge about the past, and how these may affect communities, researchers, and other stakeholders. Based at the Archaeology Department of Simon Fraser University, in Burnaby, British Columbia, Canada, the project is funded by the Social Sciences and Humanities Research Council of Canada. Project team members and partner organizations can be found in Canada, USA, Australia, New Zealand, UK, Germany, Switzerland and South Africa. A number of partner organizations are indigenous communities. Research will follow a community-based participatory research (CBPR) approach. The IPinCH project provides a foundation of research, knowledge and resources to assist scholars, academic institutions, descendant communities, policy makers, and many other stakeholders in negotiating more equitable and successful terms of research and policies through an agenda of community-based field research and topical exploration of intellectual property issues.</p>",
				"rights": "© ADS 1996-2009",
				"url": "http://ads.ahds.ac.uk/arena/",
				"websiteTitle": "ARENA: Archaeological Records of Europe Networked Access.",
				"publisher": "Archaeology Data Service",
				"title": "ARENA: Archaeological Records of Europe Networked Access.",
				"date": "2009",
				"libraryCatalog": "IPinCH",
				"callNumber": "24",
				"accessDate": "CURRENT_TIMESTAMP",
				"shortTitle": "ARENA"
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.sfu.ca/kbipinch/records/25/",
		"items": [
			{
				"itemType": "document",
				"creators": [
					{
						"firstName": "William",
						"lastName": "Kilbride",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [
					"IPinCH",
					"ipinch",
					"IP",
					"intellectual property",
					"cultural heritage",
					"traditional knowledge",
					"community-based participatory research",
					"theory",
					"practice",
					"policy",
					"ethics",
					"archaeology",
					"research",
					"Aboriginal",
					"indigenous",
					"culture",
					"anthropology",
					"law",
					"museum",
					"community",
					"knowledge",
					"academic"
				],
				"seeAlso": [],
				"attachments": [],
				"abstractNote": "<p>The Intellectual Property Issues in Cultural Heritage (IPinCH) research project is an international collaboration of over 50 archaeologists, lawyers, anthropologists, museum specialists, ethicists and other specialists, and 25 partnering organizations (including, among others, Parks Canada, the World Intellectual Property Organization, the Champagne and Aishihik First Nation, and the Barunga Community Management Board, an Aboriginal organization from Australia) building a foundation to facilitate fair and equitable exchanges of knowledge relating to archaeology and cultural heritage. The project is concerned with the theoretical, ethical, and practical implications of using knowledge about the past, and how these may affect communities, researchers, and other stakeholders. Based at the Archaeology Department of Simon Fraser University, in Burnaby, British Columbia, Canada, the project is funded by the Social Sciences and Humanities Research Council of Canada. Project team members and partner organizations can be found in Canada, USA, Australia, New Zealand, UK, Germany, Switzerland and South Africa. A number of partner organizations are indigenous communities. Research will follow a community-based participatory research (CBPR) approach. The IPinCH project provides a foundation of research, knowledge and resources to assist scholars, academic institutions, descendant communities, policy makers, and many other stakeholders in negotiating more equitable and successful terms of research and policies through an agenda of community-based field research and topical exploration of intellectual property issues.</p>",
				"rights": "Author",
				"title": "Copyright and Intellectual Property Rights: A Case Study from the Web Face",
				"bookTitle": "Arts and Humanities Data Service",
				"url": "http://ahds.ac.uk/creating/case-studies/protecting-rights/",
				"date": "2004",
				"libraryCatalog": "IPinCH",
				"callNumber": "25",
				"accessDate": "CURRENT_TIMESTAMP",
				"shortTitle": "Copyright and Intellectual Property Rights"
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.sfu.ca/kbipinch/records/27/",
		"items": [
			{
				"itemType": "magazineArticle",
				"creators": [
					{
						"firstName": "Heather",
						"lastName": "Pringle",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [
					"IPinCH",
					"ipinch",
					"IP",
					"intellectual property",
					"cultural heritage",
					"traditional knowledge",
					"community-based participatory research",
					"theory",
					"practice",
					"policy",
					"ethics",
					"archaeology",
					"research",
					"Aboriginal",
					"indigenous",
					"culture",
					"anthropology",
					"law",
					"museum",
					"community",
					"knowledge",
					"academic"
				],
				"seeAlso": [],
				"attachments": [],
				"abstractNote": "<p>The Intellectual Property Issues in Cultural Heritage (IPinCH) research project is an international collaboration of over 50 archaeologists, lawyers, anthropologists, museum specialists, ethicists and other specialists, and 25 partnering organizations (including, among others, Parks Canada, the World Intellectual Property Organization, the Champagne and Aishihik First Nation, and the Barunga Community Management Board, an Aboriginal organization from Australia) building a foundation to facilitate fair and equitable exchanges of knowledge relating to archaeology and cultural heritage. The project is concerned with the theoretical, ethical, and practical implications of using knowledge about the past, and how these may affect communities, researchers, and other stakeholders. Based at the Archaeology Department of Simon Fraser University, in Burnaby, British Columbia, Canada, the project is funded by the Social Sciences and Humanities Research Council of Canada. Project team members and partner organizations can be found in Canada, USA, Australia, New Zealand, UK, Germany, Switzerland and South Africa. A number of partner organizations are indigenous communities. Research will follow a community-based participatory research (CBPR) approach. The IPinCH project provides a foundation of research, knowledge and resources to assist scholars, academic institutions, descendant communities, policy makers, and many other stakeholders in negotiating more equitable and successful terms of research and policies through an agenda of community-based field research and topical exploration of intellectual property issues.</p>",
				"rights": "Discover Magazine (Kalmbach Publishing Co.)",
				"title": "Secrets of the Alpaca Mummies",
				"publicationTitle": "Discover",
				"issue": "1",
				"date": "2001-4-1",
				"libraryCatalog": "IPinCH",
				"callNumber": "27"
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.sfu.ca/kbipinch/records/33/",
		"items": [
			{
				"itemType": "report",
				"creators": [
					{
						"firstName": "Brian",
						"lastName": "Thom",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [
					"IPinCH",
					"ipinch",
					"IP",
					"intellectual property",
					"cultural heritage",
					"traditional knowledge",
					"community-based participatory research",
					"theory",
					"practice",
					"policy",
					"ethics",
					"archaeology",
					"research",
					"Aboriginal",
					"indigenous",
					"culture",
					"anthropology",
					"law",
					"museum",
					"community",
					"knowledge",
					"academic"
				],
				"seeAlso": [],
				"attachments": [],
				"abstractNote": "<p>The Intellectual Property Issues in Cultural Heritage (IPinCH) research project is an international collaboration of over 50 archaeologists, lawyers, anthropologists, museum specialists, ethicists and other specialists, and 25 partnering organizations (including, among others, Parks Canada, the World Intellectual Property Organization, the Champagne and Aishihik First Nation, and the Barunga Community Management Board, an Aboriginal organization from Australia) building a foundation to facilitate fair and equitable exchanges of knowledge relating to archaeology and cultural heritage. The project is concerned with the theoretical, ethical, and practical implications of using knowledge about the past, and how these may affect communities, researchers, and other stakeholders. Based at the Archaeology Department of Simon Fraser University, in Burnaby, British Columbia, Canada, the project is funded by the Social Sciences and Humanities Research Council of Canada. Project team members and partner organizations can be found in Canada, USA, Australia, New Zealand, UK, Germany, Switzerland and South Africa. A number of partner organizations are indigenous communities. Research will follow a community-based participatory research (CBPR) approach. The IPinCH project provides a foundation of research, knowledge and resources to assist scholars, academic institutions, descendant communities, policy makers, and many other stakeholders in negotiating more equitable and successful terms of research and policies through an agenda of community-based field research and topical exploration of intellectual property issues.</p>",
				"rights": "Author",
				"title": "Respecting and Protecting Aboriginal Intangible Property: Copyright and Contracts in Research Relationships with Aboriginal Communities",
				"publisher": "Department of Canadian Heritage, Copyright Policy Branch, PCH contract no.45172644",
				"place": "Ottawa",
				"date": "2006",
				"libraryCatalog": "IPinCH",
				"callNumber": "33",
				"shortTitle": "Respecting and Protecting Aboriginal Intangible Property"
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.sfu.ca/kbipinch/records/57/",
		"items": [
			{
				"itemType": "newspaperArticle",
				"creators": [
					{
						"firstName": "Hugh",
						"lastName": "Eakin",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [
					"IPinCH",
					"ipinch",
					"IP",
					"intellectual property",
					"cultural heritage",
					"traditional knowledge",
					"community-based participatory research",
					"theory",
					"practice",
					"policy",
					"ethics",
					"archaeology",
					"research",
					"Aboriginal",
					"indigenous",
					"culture",
					"anthropology",
					"law",
					"museum",
					"community",
					"knowledge",
					"academic"
				],
				"seeAlso": [],
				"attachments": [],
				"abstractNote": "<p>The Intellectual Property Issues in Cultural Heritage (IPinCH) research project is an international collaboration of over 50 archaeologists, lawyers, anthropologists, museum specialists, ethicists and other specialists, and 25 partnering organizations (including, among others, Parks Canada, the World Intellectual Property Organization, the Champagne and Aishihik First Nation, and the Barunga Community Management Board, an Aboriginal organization from Australia) building a foundation to facilitate fair and equitable exchanges of knowledge relating to archaeology and cultural heritage. The project is concerned with the theoretical, ethical, and practical implications of using knowledge about the past, and how these may affect communities, researchers, and other stakeholders. Based at the Archaeology Department of Simon Fraser University, in Burnaby, British Columbia, Canada, the project is funded by the Social Sciences and Humanities Research Council of Canada. Project team members and partner organizations can be found in Canada, USA, Australia, New Zealand, UK, Germany, Switzerland and South Africa. A number of partner organizations are indigenous communities. Research will follow a community-based participatory research (CBPR) approach. The IPinCH project provides a foundation of research, knowledge and resources to assist scholars, academic institutions, descendant communities, policy makers, and many other stakeholders in negotiating more equitable and successful terms of research and policies through an agenda of community-based field research and topical exploration of intellectual property issues.</p>",
				"rights": "NYtimes",
				"title": "Plunder or politics? Clash on Inca artifacts.",
				"publicationTitle": "NY Times",
				"issue": "1",
				"url": "http://www.nytimes.com/2006/02/01/arts/01iht-museum.html?pagewanted=2&adxnnl=1&adxnnlx=1255465783-z4x5KyMtjgCxaKABNBTvxw",
				"date": "2005-2-1",
				"libraryCatalog": "IPinCH",
				"callNumber": "57",
				"accessDate": "CURRENT_TIMESTAMP",
				"shortTitle": "Plunder or politics?"
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.sfu.ca/kbipinch/records/48/",
		"items": [
			{
				"itemType": "report",
				"creators": [
					{
						"lastName": "Canadian Environmental Assessment Agency",
						"creatorType": "author"
					},
					{
						"lastName": "Canadian Environmental Assessment Agency",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [
					"IPinCH",
					"ipinch",
					"IP",
					"intellectual property",
					"cultural heritage",
					"traditional knowledge",
					"community-based participatory research",
					"theory",
					"practice",
					"policy",
					"ethics",
					"archaeology",
					"research",
					"Aboriginal",
					"indigenous",
					"culture",
					"anthropology",
					"law",
					"museum",
					"community",
					"knowledge",
					"academic"
				],
				"seeAlso": [],
				"attachments": [],
				"abstractNote": "<p>The Intellectual Property Issues in Cultural Heritage (IPinCH) research project is an international collaboration of over 50 archaeologists, lawyers, anthropologists, museum specialists, ethicists and other specialists, and 25 partnering organizations (including, among others, Parks Canada, the World Intellectual Property Organization, the Champagne and Aishihik First Nation, and the Barunga Community Management Board, an Aboriginal organization from Australia) building a foundation to facilitate fair and equitable exchanges of knowledge relating to archaeology and cultural heritage. The project is concerned with the theoretical, ethical, and practical implications of using knowledge about the past, and how these may affect communities, researchers, and other stakeholders. Based at the Archaeology Department of Simon Fraser University, in Burnaby, British Columbia, Canada, the project is funded by the Social Sciences and Humanities Research Council of Canada. Project team members and partner organizations can be found in Canada, USA, Australia, New Zealand, UK, Germany, Switzerland and South Africa. A number of partner organizations are indigenous communities. Research will follow a community-based participatory research (CBPR) approach. The IPinCH project provides a foundation of research, knowledge and resources to assist scholars, academic institutions, descendant communities, policy makers, and many other stakeholders in negotiating more equitable and successful terms of research and policies through an agenda of community-based field research and topical exploration of intellectual property issues.</p>",
				"rights": "Canadian Environmental Assessment Agency",
				"bookTitle": "Considering Aboriginal traditional knowledge in environmental assessments conducted under the Canadian Environmental Assessment Act -- Interim Principles",
				"publisher": "Canadian Environmental Assessment Agency",
				"title": "Intellectual Property Issues in Cultural Heritage",
				"place": "Unknown",
				"date": "2009",
				"libraryCatalog": "IPinCH",
				"callNumber": "48"
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.sfu.ca/kbipinch/records/63/",
		"items": [
			{
				"itemType": "letter",
				"creators": [
					{
						"firstName": "Lois Chichinoff",
						"lastName": "Thadei",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [
					"IPinCH",
					"ipinch",
					"IP",
					"intellectual property",
					"cultural heritage",
					"traditional knowledge",
					"community-based participatory research",
					"theory",
					"practice",
					"policy",
					"ethics",
					"archaeology",
					"research",
					"Aboriginal",
					"indigenous",
					"culture",
					"anthropology",
					"law",
					"museum",
					"community",
					"knowledge",
					"academic"
				],
				"seeAlso": [],
				"attachments": [],
				"abstractNote": "<p>The Intellectual Property Issues in Cultural Heritage (IPinCH) research project is an international collaboration of over 50 archaeologists, lawyers, anthropologists, museum specialists, ethicists and other specialists, and 25 partnering organizations (including, among others, Parks Canada, the World Intellectual Property Organization, the Champagne and Aishihik First Nation, and the Barunga Community Management Board, an Aboriginal organization from Australia) building a foundation to facilitate fair and equitable exchanges of knowledge relating to archaeology and cultural heritage. The project is concerned with the theoretical, ethical, and practical implications of using knowledge about the past, and how these may affect communities, researchers, and other stakeholders. Based at the Archaeology Department of Simon Fraser University, in Burnaby, British Columbia, Canada, the project is funded by the Social Sciences and Humanities Research Council of Canada. Project team members and partner organizations can be found in Canada, USA, Australia, New Zealand, UK, Germany, Switzerland and South Africa. A number of partner organizations are indigenous communities. Research will follow a community-based participatory research (CBPR) approach. The IPinCH project provides a foundation of research, knowledge and resources to assist scholars, academic institutions, descendant communities, policy makers, and many other stakeholders in negotiating more equitable and successful terms of research and policies through an agenda of community-based field research and topical exploration of intellectual property issues.</p>",
				"rights": "Author",
				"title": "Tse-whit-zen Village Protection",
				"date": "N.D",
				"libraryCatalog": "IPinCH",
				"callNumber": "63"
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.sfu.ca/kbipinch/records/74/",
		"items": [
			{
				"itemType": "book",
				"creators": [
					{
						"firstName": "Timothy",
						"lastName": "Liam",
						"creatorType": "editor"
					},
					{
						"firstName": "Hector L.",
						"lastName": "McQueen",
						"creatorType": "editor"
					},
					{
						"firstName": "Calum M.",
						"lastName": "Carmichael",
						"creatorType": "editor"
					}
				],
				"notes": [],
				"tags": [
					"IPinCH",
					"ipinch",
					"IP",
					"intellectual property",
					"cultural heritage",
					"traditional knowledge",
					"community-based participatory research",
					"theory",
					"practice",
					"policy",
					"ethics",
					"archaeology",
					"research",
					"Aboriginal",
					"indigenous",
					"culture",
					"anthropology",
					"law",
					"museum",
					"community",
					"knowledge",
					"academic"
				],
				"seeAlso": [],
				"attachments": [],
				"abstractNote": "<p>The Intellectual Property Issues in Cultural Heritage (IPinCH) research project is an international collaboration of over 50 archaeologists, lawyers, anthropologists, museum specialists, ethicists and other specialists, and 25 partnering organizations (including, among others, Parks Canada, the World Intellectual Property Organization, the Champagne and Aishihik First Nation, and the Barunga Community Management Board, an Aboriginal organization from Australia) building a foundation to facilitate fair and equitable exchanges of knowledge relating to archaeology and cultural heritage. The project is concerned with the theoretical, ethical, and practical implications of using knowledge about the past, and how these may affect communities, researchers, and other stakeholders. Based at the Archaeology Department of Simon Fraser University, in Burnaby, British Columbia, Canada, the project is funded by the Social Sciences and Humanities Research Council of Canada. Project team members and partner organizations can be found in Canada, USA, Australia, New Zealand, UK, Germany, Switzerland and South Africa. A number of partner organizations are indigenous communities. Research will follow a community-based participatory research (CBPR) approach. The IPinCH project provides a foundation of research, knowledge and resources to assist scholars, academic institutions, descendant communities, policy makers, and many other stakeholders in negotiating more equitable and successful terms of research and policies through an agenda of community-based field research and topical exploration of intellectual property issues.</p>",
				"rights": "unknown",
				"title": "On Scrolls, Artefacts and Intellectual Property",
				"publisher": "Journal for the Study of Pseudepigrapha Supplement Series 38",
				"place": "Sage Publishers",
				"date": "2001",
				"libraryCatalog": "IPinCH",
				"callNumber": "74"
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.sfu.ca/kbipinch/records/195/",
		"items": [
			{
				"itemType": "thesis",
				"creators": [
					{
						"firstName": "Maria Luisa",
						"lastName": "De Paloi",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [
					"IPinCH",
					"ipinch",
					"IP",
					"intellectual property",
					"cultural heritage",
					"traditional knowledge",
					"community-based participatory research",
					"theory",
					"practice",
					"policy",
					"ethics",
					"archaeology",
					"research",
					"Aboriginal",
					"indigenous",
					"culture",
					"anthropology",
					"law",
					"museum",
					"community",
					"knowledge",
					"academic"
				],
				"seeAlso": [],
				"attachments": [],
				"abstractNote": "<p>The Intellectual Property Issues in Cultural Heritage (IPinCH) research project is an international collaboration of over 50 archaeologists, lawyers, anthropologists, museum specialists, ethicists and other specialists, and 25 partnering organizations (including, among others, Parks Canada, the World Intellectual Property Organization, the Champagne and Aishihik First Nation, and the Barunga Community Management Board, an Aboriginal organization from Australia) building a foundation to facilitate fair and equitable exchanges of knowledge relating to archaeology and cultural heritage. The project is concerned with the theoretical, ethical, and practical implications of using knowledge about the past, and how these may affect communities, researchers, and other stakeholders. Based at the Archaeology Department of Simon Fraser University, in Burnaby, British Columbia, Canada, the project is funded by the Social Sciences and Humanities Research Council of Canada. Project team members and partner organizations can be found in Canada, USA, Australia, New Zealand, UK, Germany, Switzerland and South Africa. A number of partner organizations are indigenous communities. Research will follow a community-based participatory research (CBPR) approach. The IPinCH project provides a foundation of research, knowledge and resources to assist scholars, academic institutions, descendant communities, policy makers, and many other stakeholders in negotiating more equitable and successful terms of research and policies through an agenda of community-based field research and topical exploration of intellectual property issues.</p>",
				"rights": "Author",
				"title": "Beyond Tokenism: Aboriginal Involvement in Archaeological Resource Management in British Columbia",
				"publisher": "University of British Columbia",
				"place": "Vancouver",
				"date": "1999",
				"libraryCatalog": "IPinCH",
				"callNumber": "195",
				"shortTitle": "Beyond Tokenism"
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.sfu.ca/kbipinch/records/170/",
		"items": [
			{
				"itemType": "bookSection",
				"creators": [
					{
						"firstName": "James",
						"lastName": "Bessen",
						"creatorType": "author"
					},
					{
						"lastName": "n/a",
						"creatorType": "editor"
					},
					{
						"firstName": "Michael J.",
						"lastName": "Meurer",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [
					"IPinCH",
					"ipinch",
					"IP",
					"intellectual property",
					"cultural heritage",
					"traditional knowledge",
					"community-based participatory research",
					"theory",
					"practice",
					"policy",
					"ethics",
					"archaeology",
					"research",
					"Aboriginal",
					"indigenous",
					"culture",
					"anthropology",
					"law",
					"museum",
					"community",
					"knowledge",
					"academic"
				],
				"seeAlso": [],
				"attachments": [],
				"abstractNote": "<p>The Intellectual Property Issues in Cultural Heritage (IPinCH) research project is an international collaboration of over 50 archaeologists, lawyers, anthropologists, museum specialists, ethicists and other specialists, and 25 partnering organizations (including, among others, Parks Canada, the World Intellectual Property Organization, the Champagne and Aishihik First Nation, and the Barunga Community Management Board, an Aboriginal organization from Australia) building a foundation to facilitate fair and equitable exchanges of knowledge relating to archaeology and cultural heritage. The project is concerned with the theoretical, ethical, and practical implications of using knowledge about the past, and how these may affect communities, researchers, and other stakeholders. Based at the Archaeology Department of Simon Fraser University, in Burnaby, British Columbia, Canada, the project is funded by the Social Sciences and Humanities Research Council of Canada. Project team members and partner organizations can be found in Canada, USA, Australia, New Zealand, UK, Germany, Switzerland and South Africa. A number of partner organizations are indigenous communities. Research will follow a community-based participatory research (CBPR) approach. The IPinCH project provides a foundation of research, knowledge and resources to assist scholars, academic institutions, descendant communities, policy makers, and many other stakeholders in negotiating more equitable and successful terms of research and policies through an agenda of community-based field research and topical exploration of intellectual property issues.</p>",
				"rights": "Authors",
				"title": "Introduction: The Argument in Brief, In: Patent Failure: How Judges, Bureaucrats, and Lawyers Put Innovators at Risk",
				"bookTitle": "Patent Failure: How Judges, Bureaucrats, and Lawyers Put Innovators at Risk",
				"pages": "1-19",
				"publisher": "Princeton University Press",
				"date": "2008",
				"libraryCatalog": "IPinCH",
				"callNumber": "170",
				"shortTitle": "Introduction"
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.sfu.ca/kbipinch/records/209/",
		"items": [
			{
				"itemType": "artwork",
				"creators": [
					{
						"lastName": "The Islander Group",
						"creatorType": "artist"
					}
				],
				"notes": [],
				"tags": [
					"IPinCH",
					"ipinch",
					"IP",
					"intellectual property",
					"cultural heritage",
					"traditional knowledge",
					"community-based participatory research",
					"theory",
					"practice",
					"policy",
					"ethics",
					"archaeology",
					"research",
					"Aboriginal",
					"indigenous",
					"culture",
					"anthropology",
					"law",
					"museum",
					"community",
					"knowledge",
					"academic"
				],
				"seeAlso": [],
				"attachments": [],
				"abstractNote": "<p>The Intellectual Property Issues in Cultural Heritage (IPinCH) research project is an international collaboration of over 50 archaeologists, lawyers, anthropologists, museum specialists, ethicists and other specialists, and 25 partnering organizations (including, among others, Parks Canada, the World Intellectual Property Organization, the Champagne and Aishihik First Nation, and the Barunga Community Management Board, an Aboriginal organization from Australia) building a foundation to facilitate fair and equitable exchanges of knowledge relating to archaeology and cultural heritage. The project is concerned with the theoretical, ethical, and practical implications of using knowledge about the past, and how these may affect communities, researchers, and other stakeholders. Based at the Archaeology Department of Simon Fraser University, in Burnaby, British Columbia, Canada, the project is funded by the Social Sciences and Humanities Research Council of Canada. Project team members and partner organizations can be found in Canada, USA, Australia, New Zealand, UK, Germany, Switzerland and South Africa. A number of partner organizations are indigenous communities. Research will follow a community-based participatory research (CBPR) approach. The IPinCH project provides a foundation of research, knowledge and resources to assist scholars, academic institutions, descendant communities, policy makers, and many other stakeholders in negotiating more equitable and successful terms of research and policies through an agenda of community-based field research and topical exploration of intellectual property issues.</p>",
				"rights": "Author",
				"title": "Hawaiian Native Treasures",
				"artworkMedium": "Facimile petroglyphs - labels",
				"libraryCatalog": "IPinCH",
				"callNumber": "209"
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.sfu.ca/kbipinch/browse/id/6/",
		"items": "multiple"
	}
]
/** END TEST CASES **/