{
	"translatorID": "186efdd2-3621-4703-aac6-3b5e286bdd86",
	"label": "Hindawi Publishers",
	"creator": "Sebastian Karcher",
	"target": "http://www.hindawi.com/(journals|search)/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsbv",
	"lastUpdated": "2014-05-01 00:37:52"
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

function detectWeb(doc,url) {
	var namespace = {"x"  : "http://www.w3.org/1999/xhtml"}
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
		var namespace = {"x"  : "http://www.w3.org/1999/xhtml"}
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
			if(!item.pages && item.DOI) {
				// use article ID as a page (seems to be the last part of URL/DOI)
				item.pages = 'e' + item.DOI.substr(item.DOI.lastIndexOf('/') + 1);
			}
			item.extra = "";
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
		"url": "http://www.hindawi.com/journals/scientifica/2012/942507/",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"firstName": "C. Francisco",
						"lastName": "Espinel",
						"creatorType": "author"
					},
					{
						"firstName": "Shaughn",
						"lastName": "Keating",
						"creatorType": "author"
					},
					{
						"firstName": "Hanina",
						"lastName": "Hibshoosh",
						"creatorType": "author"
					},
					{
						"firstName": "Bret",
						"lastName": "Taback",
						"creatorType": "author"
					},
					{
						"firstName": "Kathie-Ann",
						"lastName": "Joseph",
						"creatorType": "author"
					},
					{
						"firstName": "Mahmoud",
						"lastName": "El-Tamer",
						"creatorType": "author"
					},
					{
						"firstName": "Sheldon",
						"lastName": "Feldman",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [],
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
				"language": "en",
				"abstractNote": "Background. The MammaPrint (MP) diagnostic assay stratifies breast cancer patients into high- and low-risk groups using mRNA analysis of a 70-gene profile. The assay is validated for assessment of patients with estrogen receptor positive or negative tumors less than 5 cm with 3 or fewer malignant lymph nodes. TargetPrint (TP) is an assay for assessing estrogen, progesterone, and HER2-neu receptor status based on mRNA expression. A potential limitation of these assays is that they require an evaluation of fresh tissue samples. There is limited published experience describing MP or TP implementation. Methods. Over 10 months, 4 breast surgeons obtained samples from 54 patients for MP/TP analysis. The samples were analyzed by Agendia Labs. The tumors were independently evaluated for receptor status using immunohistochemistry (IHC). Retrospectively, we identified patients who were assessed by MP/TP during this period. Patients who underwent OncotypeDx evaluation were also identified. Results. Of the 54 patients receiving MP, 4 were found ineligible for MP risk assessment because &#x3e;3 lymph nodes were found to be malignant. Out of all eligible patients, 14/50 (28&#x25;) had samples whose quantity of tumor was not sufficient for analysis (QNS). Out of eligible patients with tumors &#x3c;1&#x2009;cm, 7/8 (88&#x25;) had QNS samples. 7/42 with tumors &#x2265;1&#x2009;cm (17&#x25;) had QNS samples. Nine patients had discordant receptor results when evaluated by IHC versus. TP. Of patients who also underwent OncotypeDx testing, 6/14 (43&#x25;) had discordant results with MP. Conclusions. This study indicates that using MP/TP assay is feasible in a tertiary care center but there may be utility in limiting MP testing to patients with tumors between 1 and 5&#x2009;cm due to high likelihood of uninformative results in subcentimeter tumors. Further study is needed to explore the discordance between oncotype and MP results.",
				"DOI": "10.6064/2012/942507",
				"url": "http://www.hindawi.com/journals/scientifica/2012/942507/abs/",
				"libraryCatalog": "www.hindawi.com",
				"shortTitle": "MammaPrint Feasibility in a Large Tertiary Urban Medical Center",
				"title": "MammaPrint Feasibility in a Large Tertiary Urban Medical Center: An Initial Experience",
				"publicationTitle": "Scientifica",
				"volume": "2012",
				"date": "2012/12/31",
				"pages": "e942507"
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.hindawi.com/search/all/data/",
		"items": "multiple"
	}
]
/** END TEST CASES **/