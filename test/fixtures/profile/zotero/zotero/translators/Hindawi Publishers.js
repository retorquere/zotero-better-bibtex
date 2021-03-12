{
	"translatorID": "186efdd2-3621-4703-aac6-3b5e286bdd86",
	"translatorType": 4,
	"label": "Hindawi Publishers",
	"creator": "Sebastian Karcher",
	"target": "^https?://www\\.hindawi\\.com/(journals|search)/",
	"minVersion": "3.0",
	"maxVersion": null,
	"priority": 100,
	"inRepository": true,
	"browserSupport": "gcsbv",
	"lastUpdated": "2021-03-07 18:50:00"
}

/*
	Translator
   Copyright (C) 2021 Sebastian Karcher

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
// eslint-disable-next-line
function attr(docOrElem,selector,attr,index){var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector);return elem?elem.getAttribute(attr):null;}function text(docOrElem,selector,index){var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector);return elem?elem.textContent:null;}

// eslint-disable-next-line no-unused-vars
function detectWeb(doc, url) {
	if (attr(doc, 'meta[name="citation_title"]', 'content')) {
		return "journalArticle";
	}
	else if (getSearchResults(doc, true)) {
		return "multiple";
	}
	return false;
}

function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = doc.querySelectorAll('div.toc_article');
	for (let row of rows) {
		let href = attr(row, 'a[aria-label="Article Title"]', 'href');
		let title = ZU.trimInternal(text(row, 'h2'));
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
			if (items) ZU.processDocuments(Object.keys(items), scrape);
		});
	}
	else {
		scrape(doc, url);
	}
}


function scrape(doc, url) {
	var translator = Zotero.loadTranslator('web');
	// Embedded Metadata
	translator.setTranslator('951c027d-74ac-47d4-a107-9c3069ab7b48');
	// translator.setDocument(doc);
	
	translator.setHandler('itemDone', function (obj, item) {
		if (!item.pages && item.DOI) {
			// use article ID as a page (seems to be the last part of URL/DOI)
			item.pages = 'e' + item.DOI.substr(item.DOI.lastIndexOf('/') + 1);
		}
		if (item.DOI) {
			item.DOI = ZU.cleanDOI(item.DOI);
		}
		
		// convert html entities in abstract
		if (item.abstractNote) {
			item.abstractNote = ZU.unescapeHTML(item.abstractNote);
		}
		item.complete();
	});

	translator.getTranslatorObject(function (trans) {
		trans.itemType = "journalArticle";
		// TODO map additional meta tags here, or delete completely
		trans.doWeb(doc, url);
	});
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.hindawi.com/journals/jo/2012/",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://www.hindawi.com/search/all/data/",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://www.hindawi.com/journals/ije/2015/210527/",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Validity of 12-Month Falls Recall in Community-Dwelling Older Women Participating in a Clinical Trial",
				"creators": [
					{
						"firstName": "Kerrie M.",
						"lastName": "Sanders",
						"creatorType": "author"
					},
					{
						"firstName": "Amanda L.",
						"lastName": "Stuart",
						"creatorType": "author"
					},
					{
						"firstName": "David",
						"lastName": "Scott",
						"creatorType": "author"
					},
					{
						"firstName": "Mark A.",
						"lastName": "Kotowicz",
						"creatorType": "author"
					},
					{
						"firstName": "Geoff C.",
						"lastName": "Nicholson",
						"creatorType": "author"
					}
				],
				"date": "2015/07/27",
				"DOI": "10.1155/2015/210527",
				"ISSN": "1687-8337",
				"abstractNote": "Objectives. To compare 12-month falls recall with falls reported prospectively on daily falls calendars in a clinical trial of women aged ≥70 years. Methods. 2,096 community-dwelling women at high risk of falls and/or fracture completed a daily falls calendar and standardised interviews when falls were recorded, for 12 months. Data were compared to a 12-month falls recall question that categorised falls status as “no falls,” “a few times,” “several,” and “regular” falls. Results. 898 (43%) participants reported a fall on daily falls calendars of whom 692 (77%) recalled fall(s) at 12 months. Participants who did not recall a fall were older (median 79.3 years versus 77.8 years, ). Smaller proportions of fallers who sustained an injury or accessed health care failed to recall a fall (all ). Among participants who recalled “no fall,” 85% reported zero falls on daily calendars. Few women selected falls categories of “several times” or “regular” (4.1% and 0.4%, resp.) and the sensitivity of these categories was low (30% to 33%). Simply categorising participants into fallers or nonfallers had 77% sensitivity and 94% specificity. Conclusion. For studies where intensive ascertainment of falls is not feasible, 12-month falls recall questions with fewer responses may be an acceptable alternative.",
				"language": "en",
				"libraryCatalog": "www.hindawi.com",
				"pages": "e210527",
				"publicationTitle": "International Journal of Endocrinology",
				"url": "https://www.hindawi.com/journals/ije/2015/210527/",
				"volume": "2015",
				"attachments": [
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					},
					{
						"title": "Snapshot",
						"mimeType": "text/html"
					}
				],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/
