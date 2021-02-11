{
	"translatorID": "3b978207-5d5c-416f-b15e-2d9da4aa75e9",
	"label": "OSF Preprints",
	"creator": "Sebastian Karcher",
	"target": "^https?://(osf\\.io|psyarxiv\\.com|arabixiv\\.org|biohackrxiv\\.org|eartharxiv\\.org|ecoevorxiv\\.org|ecsarxiv\\.org|edarxiv\\.org|engrxiv\\.org|frenxiv\\.org|indiarxiv\\.org|mediarxiv\\.org|paleorxiv\\.org)",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2020-10-09 03:33:11"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2020 Sebastian Karcher

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
// eslint-disable-next-line
function attr(docOrElem,selector,attr,index){var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector);return elem?elem.getAttribute(attr):null}function text(docOrElem,selector,index){var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector);return elem?elem.textContent:null}


function detectWeb(doc, url) {
	Z.monitorDOMChanges(doc.body, { childList: true });
	if (text(doc, 'h1#preprintTitle')) {
		return "report";
	}
	else if (url.includes("discover?") && getSearchResults(doc, true)) {
		return "multiple";
	}
	return false;
}


function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	// The Preprint search on OSF includes other preprints such as PeerJ and RePec
	var supportedSites = /^https?:\/\/(osf\.io|psyarxiv\.com|arabixiv\.org|biohackrxiv\.org|eartharxiv\.org|ecoevorxiv\.org|ecsarxiv\.org|edarxiv\.org|engrxiv\.org|frenxiv\.org|indiarxiv\.org|mediarxiv\.org|paleorxiv\.org)/;
	var rows = doc.querySelectorAll('.search-result h4>a');
	for (let row of rows) {
		let href = row.href;
		let title = ZU.trimInternal(row.textContent);
		if (!href || !title || !supportedSites.test(href)) continue;
		if (checkOnly) return true;
		found = true;
		items[href] = title;
	}
	return found ? items : false;
}

function doWeb(doc, url) {
	if (detectWeb(doc, url) == "multiple") {
		Zotero.selectItems(getSearchResults(doc, false), function (items) {
			if (items) ZU.doGet(constructAPIURL(Object.keys(items)), osfAPIImport);
		});
	}
	else {
		scrape(doc, url);
	}
}


// takes and array of preprint URLs, extracts the ID and constructs an API call to OSF
function constructAPIURL(urls) {
	var ids = [];
	for (let url of urls) {
		let id;
		if (url.match(/\.(io|com|org)\/([a-z0-9]+)/)) {
			id = url.match(/\.(?:io|com|org)\/([a-z0-9]+)/)[1];
		}
		if (id) {
			ids.push("https://api.osf.io/v2/preprints/" + id + "/?embed=contributors&embed=provider");
		}
	}
	return ids;
}

function osfAPIImport(text) {
	// Z.debug(text);
	let json = JSON.parse(text);
	let attr = json.data.attributes;
	let embeds = json.data.embeds;
	var item = new Zotero.Item("report");
	// currently we're just doing preprints, but putting this here in case we'll want to handle different OSF
	// item types in the future
	// let type = json.data.type
	item.title = attr.title;
	item.abstractNote = attr.description;
	item.date = attr.date_published;
	item.publisher = embeds.provider.data.attributes.name;
	if (json.data.links.preprint_doi) {
		let doi = json.data.links.preprint_doi.replace(/https:\/\/doi\.org\//, "");
		item.extra = "DOI: " + doi + "\ntype: article";
	}
	else {
		item.extra = "type: article";
	}
	item.url = json.data.links.html;
	for (let tag of attr.tags) {
		item.tags.push(tag);
	}

	for (let contributor of embeds.contributors.data) {
		let author = contributor.embeds.users.data.attributes;
		if (author.given_name && author.family_name) {
			// add middle names
			let givenNames = author.given_name + ' ' + author.middle_names;
			item.creators.push({ lastName: author.family_name, firstName: givenNames.trim(), creatorType: "author" });
		}
		else {
			item.creators.push({ lastName: author.full_name, creatorType: "author", fieldMode: 1 });
		}
	}
	if (json.data.relationships.primary_file) {
		let fileID = json.data.relationships.primary_file.links.related.href.replace("https://api.osf.io/v2/files/", "");
		item.attachments.push({ url: "https://osf.io/download/" + fileID, title: "OSF Preprint", mimeType: "application/pdf" });
	}

	item.complete();
}

function scrape(doc, url) {
	var translator = Zotero.loadTranslator('web');
	// Embedded Metadata
	translator.setTranslator('951c027d-74ac-47d4-a107-9c3069ab7b48');

	translator.setHandler('itemDone', function (obj, item) {
		if (item.extra) {
			item.extra += "\ntype: article";
		}
		else {
			item.extra = "type: article";
		}
		// remove Snapshot, which is useless for OSF preprints (plus we should always get a PDF)
		for (let i = item.attachments.length - 1; i >= 0; i--) {
			if (item.attachments[i].title == "Snapshot") {
				item.attachments.splice(i, 1);
			}
		}
		item.libraryCatalog = "OSF Preprints";
		item.complete();
	});

	translator.getTranslatorObject(function (trans) {
		trans.itemType = "report";
		trans.doWeb(doc, url);
	});
}


/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://psyarxiv.com/nx2b4/",
		"items": [
			{
				"itemType": "report",
				"title": "The Dutch Auditory & Image Vocabulary test (DAIVT): A new Dutch receptive vocabulary test for students",
				"creators": [
					{
						"firstName": "Ibrich",
						"lastName": "Bousard",
						"creatorType": "author"
					},
					{
						"firstName": "Marc",
						"lastName": "Brysbaert",
						"creatorType": "author"
					}
				],
				"date": "2020-05-05T19:14:05.245Z",
				"abstractNote": "We introduce a new Dutch receptive vocabulary test, the Dutch auditory & image vocabulary test (DAIVT). The test is multiple-choice and assesses vocabulary knowledge for spoken words. The measure has an online format, has free access, and allows easy data collection. The test was developed with the intent to enable testing for research purposes in university students. This paper describes the test construction. We cover three phases: 1) collecting stimulus materials and developing the test’s first version, 2) an exploratory item-analysis on the first draft (n= 93), and 3) validating the test (both the second and the final version) by comparing it to two existing tests (n= 270, n= 157). The results indicate that the test is reliable and correlates well with existing Dutch receptive vocabulary tests (convergent validity). The final version of the DAIVT comprises 90 test items and 1 practice item. It can be used for research.",
				"extra": "DOI: 10.31234/osf.io/nx2b4\ntype: article",
				"institution": "PsyArXiv",
				"libraryCatalog": "OSF Preprints",
				"shortTitle": "The Dutch Auditory & Image Vocabulary test (DAIVT)",
				"url": "https://psyarxiv.com/nx2b4/",
				"attachments": [
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					}
				],
				"tags": [
					{
						"tag": "Cognitive Psychology"
					},
					{
						"tag": "Dutch vocabulary"
					},
					{
						"tag": "Language"
					},
					{
						"tag": "Social and Behavioral Sciences"
					},
					{
						"tag": "individual differences"
					},
					{
						"tag": "receptive vocabulary"
					},
					{
						"tag": "spoken word comprehension"
					},
					{
						"tag": "vocabulary test"
					},
					{
						"tag": "word knowledge"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://osf.io/b2xmp/",
		"items": [
			{
				"itemType": "report",
				"title": "‘All In’: A Pragmatic Framework for COVID-19 Testing and Action on a Global Scale",
				"creators": [
					{
						"firstName": "Syril",
						"lastName": "Pettit",
						"creatorType": "author"
					},
					{
						"firstName": "Keith",
						"lastName": "Jerome",
						"creatorType": "author"
					},
					{
						"firstName": "David",
						"lastName": "Rouquie",
						"creatorType": "author"
					},
					{
						"firstName": "Susan",
						"lastName": "Hester",
						"creatorType": "author"
					},
					{
						"firstName": "Leah",
						"lastName": "Wehmas",
						"creatorType": "author"
					},
					{
						"firstName": "Bernard",
						"lastName": "Mari",
						"creatorType": "author"
					},
					{
						"firstName": "Pascal",
						"lastName": "Barbry",
						"creatorType": "author"
					},
					{
						"firstName": "Yasunari",
						"lastName": "Kanda",
						"creatorType": "author"
					},
					{
						"firstName": "Mineo",
						"lastName": "Matsumoto",
						"creatorType": "author"
					},
					{
						"firstName": "Jason",
						"lastName": "Botten",
						"creatorType": "author"
					},
					{
						"firstName": "Emily",
						"lastName": "Bruce",
						"creatorType": "author"
					}
				],
				"date": "2020-04-29T12:19:21.907Z",
				"abstractNote": "Current demand for SARS-CoV-2 testing is straining material resource and labor capacity around the globe.  As a result, the public health and clinical community are hindered in their ability to monitor and contain the spread of COVID-19.  Despite broad consensus that more testing is needed, pragmatic guidance towards realizing this objective has been limited.  This paper addresses this limitation by proposing a novel and geographically agnostic framework (‘the 4Ps Framework) to guide multidisciplinary, scalable, resource-efficient, and achievable efforts towards enhanced testing capacity.  The 4Ps (Prioritize, Propagate, Partition, and Provide) are described in terms of specific opportunities to enhance the volume, diversity, characterization, and implementation of SARS-CoV-2 testing to benefit public health.  Coordinated deployment of the strategic and tactical recommendations described in this framework have the potential to rapidly expand available testing capacity, improve public health decision-making in response to the COVID-19 pandemic, and/or to be applied in future emergent disease outbreaks.",
				"extra": "DOI: 10.31219/osf.io/b2xmp\ntype: article",
				"institution": "OSF Preprints",
				"libraryCatalog": "OSF Preprints",
				"shortTitle": "‘All In’",
				"url": "https://osf.io/b2xmp/",
				"attachments": [
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					}
				],
				"tags": [
					{
						"tag": "COVID-19"
					},
					{
						"tag": "Diseases"
					},
					{
						"tag": "Health Policy"
					},
					{
						"tag": "Life Sciences"
					},
					{
						"tag": "Medicine and Health Sciences"
					},
					{
						"tag": "Microbiology"
					},
					{
						"tag": "Pandemic"
					},
					{
						"tag": "Public Affairs"
					},
					{
						"tag": "Public Health"
					},
					{
						"tag": "Public Policy and Public Administration"
					},
					{
						"tag": "RT-PCR"
					},
					{
						"tag": "SARS-CoV-2"
					},
					{
						"tag": "Social and Behavioral Sciences"
					},
					{
						"tag": "Virologic Testing"
					},
					{
						"tag": "Virology"
					},
					{
						"tag": "Virus Diseases"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://osf.io/preprints/discover?provider=OSFORAgriXivORSocArXiv&q=testing",
		"items": "multiple"
	}
]
/** END TEST CASES **/
