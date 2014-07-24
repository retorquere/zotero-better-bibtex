{
	"translatorID": "74af9c75-dc14-4cdb-bb0b-1bbb13ba2e22",
	"label": "Landes Publishers",
	"creator": "Sebastian Karcher",
	"target": "^https?://www\\.landesbioscience\\.com",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsbv",
	"lastUpdated": "2014-06-11 21:49:07"
}

/*
	Translator
   Copyright (C) 2013 Sebastian Karcher

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

	var xpath='//meta[@name="citation_journal_title"]';

	if (ZU.xpath(doc, xpath).length > 0) {
		return "journalArticle";
	}
			
	if (url.indexOf("/search/")!=-1 || url.indexOf("/toc/")!=-1) {
		multxpath = '//a[contains(@class, "toc_title_link") or contains(@class, "search_result_link")]'
	
	if (ZU.xpath(doc, multxpath).length>0){
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
		resultxpath = '//a[contains(@class, "toc_title_link") or contains(@class, "search_result_link")]'
		var results = ZU.xpath(doc, resultxpath);
	
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
		var abstract = ZU.xpathText(doc, '//div[@class="span6"]//div[@class="pad_l"]')
		var translator = Zotero.loadTranslator('web');
		//use Embedded Metadata
		translator.setTranslator("951c027d-74ac-47d4-a107-9c3069ab7b48");
		translator.setDocument(doc);
		translator.setHandler('itemDone', function(obj, item) {
			if (abstract) item.abstractNote = abstract.replace(/\n/g, " ");
			item.complete();
		});
		translator.translate();
	}
}
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://www.landesbioscience.com/search/?q_terms=cell&q_author=",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://www.landesbioscience.com/journals/cc/article/1683/",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"firstName": "Jun",
						"lastName": "Dai",
						"creatorType": "author"
					},
					{
						"firstName": "Jonathan M. G.",
						"lastName": "Higgins",
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
				"title": "Haspin: A Mitotic Histone Kinase Required for Metaphase Chromosome Alignment",
				"publicationTitle": "Cell Cycle",
				"volume": "4",
				"issue": "5",
				"number": "5",
				"patentNumber": "5",
				"pages": "665-668",
				"publisher": "Landes Bioscience",
				"institution": "Landes Bioscience",
				"company": "Landes Bioscience",
				"label": "Landes Bioscience",
				"distributor": "Landes Bioscience",
				"DOI": "10.4161/cc.4.5.1683",
				"ISSN": "1538-4101, 1551-4005",
				"url": "http://www.landesbioscience.com/journals/cc/article/1683/",
				"abstractNote": "The fidelity of chromosome segregation during cell division is critical to maintain genomic stability and to prevent cancer and birth defects. A key set of kinases that regulates this process has been identified and characterized over the last few years, including the Aurora, Polo and Nek families. Recently we proposed that a little-studied kinase known as haspin is a new member of this important group. During mitosis haspin is phosphorylated, associates with the chromosomes, centrosomes and spindle, and is responsible for phosphorylation of histone H3 at threonine-3. Depletion of haspin using RNA interference prevents normal alignment of chromosomes at metaphase, suggesting that haspin plays a crucial role in chromosome segregation. Here we discuss possible mechanisms of haspin action and the function of histone phosphorylation in mitosis. We also outline some of the questions raised by these new findings and consider what role haspin might play in cancer.",
				"date": "2005/03/02",
				"libraryCatalog": "www.landesbioscience.com",
				"accessDate": "CURRENT_TIMESTAMP",
				"shortTitle": "Haspin"
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.landesbioscience.com/journals/cc/toc/volume/4/issue/5/",
		"items": "multiple"
	}
]
/** END TEST CASES **/