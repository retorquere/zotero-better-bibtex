{
	"translatorID": "186efdd2-3621-4703-aac6-3b5e286bdd86",
	"label": "Hindawi Publishers",
	"creator": "Sebastian Karcher",
	"target": "^https?://www\\.hindawi\\.com/(journals|search)/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsbv",
	"lastUpdated": "2016-01-06 05:33:07"
}

/*
	Translator
   Copyright (C) 2012 Sebastian Karcher an Avram Lyon

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
var namespace = {"x"  : "http://www.w3.org/1999/xhtml"}

function detectWeb(doc,url) {
	var xpath='//x:meta[@name="citation_journal_title"]';

	if (ZU.xpath(doc, xpath, namespace).length > 0) {
		return "journalArticle";
	}
			
	if (url.indexOf("/search/")!=-1 || url.indexOf("/journals/")!=-1) {
		multxpath = '//x:div[@class="middle_content"]/x:ul/x:li/x:a[contains(@href, "/journals/")]|\
		//x:div[contains(@id, "SearchResult")]/x:ul/x:li/x:a[contains(@href, "/journals/")]'
	
	if (ZU.xpath(doc, multxpath, namespace).length>0){
			return "multiple";
		}
	}
	return false;
}



function doWeb(doc,url)
{
	if (detectWeb(doc, url) == "multiple") {
		var hits = {};
		var urls = [];
		resultxpath = '//x:div[@class="middle_content"]/x:ul/x:li/x:a[contains(@href, "/journals/")]|\
		//x:div[contains(@id, "SearchResult")]/x:ul/x:li/x:a[contains(@href, "/journals/")]'
		var results = ZU.xpath(doc, resultxpath, namespace);
	
		for (var i in results) {
			hits[results[i].href] = results[i].textContent;
		}
		Z.selectItems(hits, function(items) {
			if (items == null) return true;
			for (var j in items) {
				urls.push(j);
			}
			ZU.processDocuments(urls, doWeb);
		});
	} else {
		var translator = Zotero.loadTranslator('web');
		//use Embedded Metadata
		translator.setTranslator("951c027d-74ac-47d4-a107-9c3069ab7b48");
		translator.setDocument(doc);
		translator.setHandler('itemDone', function(obj, item) {
			if (!item.pages && item.DOI) {
				// use article ID as a page (seems to be the last part of URL/DOI)
				item.pages = 'e' + item.DOI.substr(item.DOI.lastIndexOf('/') + 1);
			}
			//remove duplicate metadata			
			for (var i in item){
				if (typeof item[i] == "string" && item[i].match(/^.+,/)){
					//Z.debug(item[i])
					  item[i] = item[i].replace(/^(PMID: )?(.+), \2$/, "$1$2");
				}
			}
			//remove duplicate authors
			if (item.creators.length && item.creators.length % 2 == 0) {
  				var duplicate = true;
  				for (var i = 0, j = item.creators.length / 2; duplicate && j < item.creators.length; i++, j++) {
					var a1 = item.creators[i], a2 = item.creators[j];
					duplicate = a1.firstName == a2.firstName && a1.lastName == a2.lastName;
  				}

				if (duplicate) {
					item.creators = item.creators.slice(0, item.creators.length / 2);
  				}
			}
			//convert html entities in abstract
			if (item.abstractNote){
				item.abstractNote = ZU.unescapeHTML(item.abstractNote);
			}
			item.complete();
		});
		translator.translate();
	}
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
				"extra": "PMID: 26273292",
				"language": "en",
				"libraryCatalog": "www.hindawi.com",
				"pages": "e210527",
				"publicationTitle": "International Journal of Endocrinology",
				"url": "https://www.hindawi.com/journals/ije/2015/210527/abs/",
				"volume": "2015",
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
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/