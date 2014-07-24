{
	"translatorID": "9d822257-2eec-4674-b6d0-2504f54c8890",
	"label": "African Journals Online",
	"creator": "Sebastian Karcher",
	"target": "^https?://www\\.ajol\\.info/index\\.php",
	"minVersion": "2.1.9",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2013-04-15 18:04:37"
}

/*
   African Journals Online Translator
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

function detectWeb(doc, url) {
	var xpath = '//meta[@name="citation_journal_title"]';

	if (ZU.xpath(doc, xpath).length > 0) {
		return "journalArticle";
	}

	if (url.match(/index\/search|index.php\/[a-z]+$/)) {
		return "multiple";
	}

	return false;
}


function doWeb(doc, url) {
	if (detectWeb(doc, url) == "multiple") {
		var hits = {};
		var urls = [];
		//distinguish between search results and ToCs, which require different logic
		if (url.match(/index\/search/)) {
			var rows = ZU.xpath(doc, "//table[@class='listing']//tr[@valign='top']");
			if (!rows || rows.length == 0) results = ZU.xpath(doc, "//form[@name='search']/table[3]/tbody/tr/td[2]/a[@class='hiddenlink']");

			for (var i in rows) {
				var titles = ZU.xpathText(rows[i], './td[3]');
				var URL = ZU.xpathText(rows[i], './td[4]/a[1]/@href');
				hits[URL] = titles;
			}
		} else {
			var results = ZU.xpath(doc, "//td[@class='tocTitle']/a");
			for (var i in results) {
				hits[results[i].href] = results[i].textContent;
			}
		}

		Z.selectItems(hits, function (items) {
			if (items == null) return true;
			for (var j in items) {
				urls.push(j);
			}
			ZU.processDocuments(urls, function (myDoc) {
				doWeb(myDoc, myDoc.location.href)
			}, function () {
				Z.done()
			});

			Z.wait();
		});
	} else {
		// We call the Embedded Metadata translator to do the actual work
		var translator = Zotero.loadTranslator("import");
		translator.setTranslator("951c027d-74ac-47d4-a107-9c3069ab7b48");
		translator.setHandler("itemDone", function (obj, item) {
			item.abstractNote = item.extra;
			item.extra = '';
			item.complete();
		});

		translator.getTranslatorObject(function (obj) {
			obj.doWeb(doc, url);
		});
	}
}
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.ajol.info/index.php/actat",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://www.ajol.info/index.php/thrb/article/view/63347",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"firstName": "Akinwumi A.",
						"lastName": "Akinyede",
						"creatorType": "author"
					},
					{
						"firstName": "Alade",
						"lastName": "Akintonwa",
						"creatorType": "author"
					},
					{
						"firstName": "Charles",
						"lastName": "Okany",
						"creatorType": "author"
					},
					{
						"firstName": "Olufunsho",
						"lastName": "Awodele",
						"creatorType": "author"
					},
					{
						"firstName": "Duro C.",
						"lastName": "Dolapo",
						"creatorType": "author"
					},
					{
						"firstName": "Adebimpe",
						"lastName": "Adeyinka",
						"creatorType": "author"
					},
					{
						"firstName": "Ademola",
						"lastName": "Yusuf",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [
					"HIV patients",
					"Nigeria",
					"knowledge",
					"malaria",
					"prevention",
					"treatment"
				],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					},
					{
						"title": "Snapshot"
					}
				],
				"title": "Knowledge, treatment seeking and preventive practices in respect of malaria among patients with HIV at the Lagos University Teaching Hospital",
				"publicationTitle": "Tanzania Journal of Health Research",
				"rights": "Copyright for articles published in this journal is retained by the journal.",
				"date": "2011/10/17",
				"language": "en",
				"volume": "13",
				"issue": "4",
				"DOI": "10.4314/thrb.v13i4.63347",
				"ISSN": "1821 0 9241",
				"url": "http://www.ajol.info/index.php/thrb/article/view/63347",
				"abstractNote": "The synergistic interaction between Human Immunodeficiency virus (HIV) disease and Malaria makes it mandatory for patients with HIV to respond appropriately in preventing and treating malaria. Such response will help to control the two diseases. This study assessed the knowledge of 495 patients attending the HIV clinic, in Lagos University Teaching Hospital, Nigeria.&nbsp; Their treatment seeking, preventive practices with regards to malaria, as well as the impact of socio &ndash; demographic / socio - economic status were assessed. Out of these patients, 245 (49.5 %) used insecticide treated bed nets; this practice was not influenced by socio &ndash; demographic or socio &ndash; economic factors.&nbsp; However, knowledge of the cause, knowledge of prevention of malaria, appropriate use of antimalarial drugs and seeking treatment from the right source increased with increasing level of education (p &lt; 0.05). A greater proportion of the patients, 321 (64.9 %) utilized hospitals, pharmacy outlets or health centres when they perceived an attack of malaria. Educational intervention may result in these patients seeking treatment from the right place when an attack of malaria fever is perceived.",
				"libraryCatalog": "www.ajol.info"
			}
		]
	}
]
/** END TEST CASES **/