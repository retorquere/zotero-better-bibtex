{
	"translatorID": "97930de6-8709-409a-a80c-ed64421a842e",
	"label": "Lippincott Williams and Wilkins",
	"creator": "Philipp Zumstein",
	"target": "^https?://(www\\.)?journals\\.lww\\.com/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2017-09-01 17:23:56"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2017 Philipp Zumstein
	
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


// attr()/text() v2
function attr(docOrElem,selector,attr,index){var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector);return elem?elem.getAttribute(attr):null}function text(docOrElem,selector,index){var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector);return elem?elem.textContent:null}


function detectWeb(doc, url) {
	if (attr(doc, 'meta[property="og:type"]', 'content')=="article") {
		return "journalArticle";
	} else if (url.indexOf('/pages/')>-1 && getSearchResults(doc, true)) {
		return "multiple";
	}
}

function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = doc.querySelectorAll('h4>a[title]');
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
	//The metatags are like HighWire tags but have 'wkhealth_' instead
	//of 'citation_' in their name. We change this to the standard
	//before calling metadata translator.
	var metatags = doc.getElementsByTagName("meta");
	for (var i=0; i<metatags.length; i++) {
		var name = metatags[i].getAttribute('name');
		if (name && name.indexOf('wkhealth_')>-1 && name.indexOf('_pdf_url')==-1) {
			//only if the corresponding meta element is not yet there (e.g. doi)
			if (!attr(doc, 'meta[name=' + name.replace('wkhealth_', 'citation_') + ']', 'content')) {
				metatags[i].setAttribute('name', name.replace('wkhealth_', 'citation_'));
			}
		}
	}
	
	
	var translator = Zotero.loadTranslator('web');
	// Embedded Metadata
	translator.setTranslator('951c027d-74ac-47d4-a107-9c3069ab7b48');
	//translator.setDocument(doc);
	
	translator.setHandler('itemDone', function (obj, item) {
		//abstract on the page is more complete then the one in the metadata
		var abstract = text(doc, '#article-abstract-content1');
		if (abstract) {
			item.abstractNote = abstract;
		}
		//in the website there is also the end page number mentioned
		var span = text(doc, '#ej-journal-date-volume-issue-pg');
		if (span) {
			var m = span.match(/- pp? (\d+)[-–](\d+)/);
			if (item.pages) {
				if (item.pages.indexOf('–')==-1) {
					if (m && m[1]==item.pages) {
						item.pages += '–'+m[2];
					}
				}
			} else {
				if (m) {
					item.pages = m[1] + '–' + m[2];
				}
			}
		}
		
		item.url = url;
		
		/* currently this does not work
		var pdf = attr(doc, 'li>i.icon-file-pdf', 'class');
		var pdfurl = attr(doc, 'meta[name="wkhealth_pdf_url"]', 'content');
		Z.debug(pdfurl);
		if (pdf && pdfurl) {
			item.attachments.push({
				title: "Full Text PDF",
				url: pdfurl,
				mimeType: "application/pdf"
			})
		}
		*/
		
		item.complete();
	});

	translator.getTranslatorObject(function(trans) {
		trans.itemType = "journalArticle";
		trans.doWeb(doc, url);
	});
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://journals.lww.com/nurseeducatoronline/Abstract/2010/09000/Zotero__Harnessing_the_Power_of_a_Personal.11.aspx",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Zotero: Harnessing the Power of a Personal Bibliographic Manager",
				"creators": [
					{
						"firstName": "Jaekea T.",
						"lastName": "Coar",
						"creatorType": "author"
					},
					{
						"firstName": "Jeanne P.",
						"lastName": "Sewell",
						"creatorType": "author"
					}
				],
				"date": "September/October 2010",
				"DOI": "10.1097/NNE.0b013e3181ed81e4",
				"ISSN": "0363-3624",
				"abstractNote": "Zotero is a powerful free personal bibliographic manager (PBM) for writers. Use of a PBM allows the writer to focus on content, rather than the tedious details of formatting citations and references. Zotero 2.0 (http://www.zotero.org) has new features including the ability to synchronize citations with the off-site Zotero server and the ability to collaborate and share with others. An overview on how to use the software and discussion about the strengths and limitations are included.",
				"issue": "5",
				"libraryCatalog": "journals.lww.com",
				"pages": "205–207",
				"publicationTitle": "Nurse Educator",
				"shortTitle": "Zotero",
				"url": "http://journals.lww.com/nurseeducatoronline/Abstract/2010/09000/Zotero__Harnessing_the_Power_of_a_Personal.11.aspx",
				"volume": "35",
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
		"url": "http://journals.lww.com/anatomicpathology/Abstract/2017/09000/Social_Media_and_Pathology___Where_Are_We_Now_and.6.aspx",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Social Media and Pathology: Where Are We Now and Why Does it Matter?",
				"creators": [
					{
						"firstName": "James",
						"lastName": "Isom",
						"creatorType": "author"
					},
					{
						"firstName": "Meggen",
						"lastName": "Walsh",
						"creatorType": "author"
					},
					{
						"firstName": "Jerad M.",
						"lastName": "Gardner",
						"creatorType": "author"
					}
				],
				"date": "September 2017",
				"DOI": "10.1097/PAP.0000000000000159",
				"ISSN": "1072-4109",
				"abstractNote": "Social media has exploded in popularity in recent years. It is a powerful new tool for networking, collaborating, and for the communication and evolution of ideas. It has been increasingly used for business purposes and is now being embraced by physicians including pathologists. Pathology professional organizations and even peer-reviewed pathology journals are now beginning to use social media, as well. There are multiple social media platforms, including Twitter, Facebook, Instagram, LinkedIn, and others. Each platform has different audiences and different ways to share content and interact with other users. This paper discusses the different social media platforms and how they are being used in pathology currently.",
				"issue": "5",
				"libraryCatalog": "journals.lww.com",
				"pages": "294–303",
				"publicationTitle": "Advances in Anatomic Pathology",
				"shortTitle": "Social Media and Pathology",
				"url": "http://journals.lww.com/anatomicpathology/Abstract/2017/09000/Social_Media_and_Pathology___Where_Are_We_Now_and.6.aspx",
				"volume": "24",
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
		"url": "http://journals.lww.com/co-pulmonarymedicine/Abstract/publishahead/Sleep_complications_following_traumatic_brain.99270.aspx",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Sleep complications following traumatic brain injury.",
				"creators": [
					{
						"firstName": "Natalie A.",
						"lastName": "Grima",
						"creatorType": "author"
					},
					{
						"firstName": "Jennie L.",
						"lastName": "Ponsford",
						"creatorType": "author"
					},
					{
						"firstName": "Matthew P.",
						"lastName": "Pase",
						"creatorType": "author"
					}
				],
				"date": "August 30, 2017",
				"DOI": "10.1097/MCP.0000000000000429",
				"ISSN": "1070-5287",
				"abstractNote": "Purpose of review: Recent research has provided extensive characterization as to the frequency and nature of sleep disturbances following traumatic brain injury (TBI). This review summarizes the current state of knowledge and proposes future directions for research.\n        Recent findings: Complaints of sleep disturbance are common following TBI, and objective assessments of sleep largely corroborate these complaints. Sleep is often disturbed in the acute phase postinjury and can persist for decades, with the prevalence of sleep disorders higher in patients with TBI as compared with the general population. The factors causing sleep disturbance appear to involve numerous interrelated primary and secondary factors, including direct damage to vital sleep-regulating regions of the brain, alterations in the circadian system, lowered mood as well as increased anxiety and pain. The complex web of contributing factors implies that combination therapies targeting a number of putative causal mechanisms may yield the greatest success in terms of improving sleep postinjury.\n        Summary: Sleep disturbance is a common consequence of TBI. Research is needed to ascertain the primary drivers of sleep disturbance postinjury to guide the development of targeted interventions. In the absence of a single mechanism, combination therapies may prove most fruitful.\n        Copyright (C) 2017 Wolters Kluwer Health, Inc. All rights reserved.",
				"libraryCatalog": "journals.lww.com",
				"publicationTitle": "Current Opinion in Pulmonary Medicine",
				"url": "http://journals.lww.com/co-pulmonarymedicine/Abstract/publishahead/Sleep_complications_following_traumatic_brain.99270.aspx",
				"volume": "Publish Ahead of Print",
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
		"url": "http://journals.lww.com/jbjsjournal/Citation/2017/08160/Workplace_Violence_and_Active_Shooter.14.aspx",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Workplace Violence and Active Shooter Considerations for Health-Care Workers: AOA Critical Issues",
				"creators": [
					{
						"firstName": "Bryan",
						"lastName": "Warren",
						"creatorType": "author"
					},
					{
						"firstName": "Michael",
						"lastName": "Bosse",
						"creatorType": "author"
					},
					{
						"firstName": "Paul III",
						"lastName": "Tornetta",
						"creatorType": "author"
					}
				],
				"date": "August 16, 2017",
				"DOI": "10.2106/JBJS.16.01250",
				"ISSN": "0021-9355",
				"abstractNote": "An abstract is unavailable.",
				"issue": "16",
				"libraryCatalog": "journals.lww.com",
				"pages": "e88",
				"publicationTitle": "JBJS",
				"shortTitle": "Workplace Violence and Active Shooter Considerations for Health-Care Workers",
				"url": "http://journals.lww.com/jbjsjournal/Citation/2017/08160/Workplace_Violence_and_Active_Shooter.14.aspx",
				"volume": "99",
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
		"url": "http://journals.lww.com/cinjournal/pages/default.aspx",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://journals.lww.com/pages/results.aspx?txtkeywords=zotero",
		"items": "multiple"
	}
]
/** END TEST CASES **/