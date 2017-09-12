{
	"translatorID": "f520b141-9ce8-42f4-93ec-a39e375a9516",
	"label": "Pubget",
	"creator": "Sebastian Karcher",
	"target": "^https?://pubget\\.com/(search|journals|paper|mesh_browser)",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsbv",
	"lastUpdated": "2013-06-08 14:05:46"
}

/*
	Translator
   Pubget Translator Copyright (C) 2013 Sebastian Karcher

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
				
	if (url.match(/\/search\?.*\&q=|\/mesh_browser\/./)) {
		return "multiple";
	}
	
	else if (ZU.xpath(doc, xpath).length > 0) {
		return "journalArticle";
	}
	return false;
}


function doWeb(doc,url)
{
	if (detectWeb(doc, url) == "multiple") {
		var hits = {};
		var urls = [];
		var results = ZU.xpath(doc,'//div[@class="results"]//li/a[@class="title"]');
	
		for (var i in results) {
			hits[results[i].href] = results[i].textContent;
		}
		Z.selectItems(hits, function(items) {
			if (items == null) return true;
			for (var j in items) {
				urls.push(j);
			}
			ZU.processDocuments(urls, function (myDoc) { 
				doWeb(myDoc, myDoc.location.href) });

		});
	} else if (ZU.xpathText(doc, '//meta[@name="citation_pmid"]/@content') &&
		ZU.xpathText(doc, '//meta[@name="citation_pmid"]/@content').search(/\d+/)!=-1){
		//the best data is from Pubmed
		var pmid = ZU.xpathText(doc, '//meta[@name="citation_pmid"]/@content');
		var url = "http://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&retmode=xml&id=" + pmid;
		Zotero.Utilities.HTTP.doGet(url, function(text) {
		// load translator for PubMed	
			var translator = Zotero.loadTranslator("import");
			translator.setTranslator("fcf41bed-0cbc-3704-85c7-8062a0068a7a");
			translator.setString(text);
	
			// don't save when item is done
			translator.setHandler("itemDone", function(obj, item) {
				item.attachments.push({document:doc, title:"Pubget Snapshot", mimeType:"text/html"})
				item.complete()
		});
		translator.translate();
	});
	} else{	
	// We call the Embedded Metadata translator as a fallback
	var translator = Zotero.loadTranslator('web');
	//use Embedded Metadata
	translator.setTranslator("951c027d-74ac-47d4-a107-9c3069ab7b48");
	translator.setDocument(doc);
	translator.setHandler('itemDone', function(obj, item) {
				item.abstractNote = ZU.xpathText(doc, '//div[@class="paper"]/p[@class="abstract"]');
				item.extra = '';
				item.complete();
				});
	translator.translate();
	}
}
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://pubget.com/search?utf8=%E2%9C%93&q=zotero",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://pubget.com/paper/22289095/Comparison_of_select_reference_management_tools",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"firstName": "Yingting",
						"lastName": "Zhang",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [
					"Information Storage and Retrieval",
					"Medical Informatics",
					"Software",
					"User-Computer Interface"
				],
				"seeAlso": [],
				"attachments": [
					{
						"title": "PubMed entry",
						"mimeType": "text/html",
						"snapshot": false
					},
					{
						"title": "Pubget Snapshot",
						"mimeType": "text/html"
					}
				],
				"title": "Comparison of select reference management tools",
				"pages": "45-60",
				"ISSN": "1540-9597",
				"journalAbbreviation": "Med Ref Serv Q",
				"publicationTitle": "Medical Reference Services Quarterly",
				"volume": "31",
				"issue": "1",
				"date": "2012",
				"language": "eng",
				"abstractNote": "Bibliographic management tools have been widely used by researchers to store, organize, and manage their references for research papers, theses, dissertations, journal articles, and other publications. There are a number of reference management tools available. In order for users to decide which tool is best for their needs, it is important to know each tool's strengths and weaknesses. This article compares four reference management tools, one of which is licensed by University of Medicine and Dentistry of New Jersey libraries and the other three are open source and freely available. They were chosen based on their functionality, ease of use, availability to library users, and popularity. These four tools are EndNote/EndNote Web, Zotero, Connotea, and Mendeley Desktop/Mendeley Web. Each tool is analyzed in terms of the following features: accessing, collecting, organizing, collaborating, and citing/formatting. A comparison table is included to summarize the key features of these tools.",
				"DOI": "10.1080/02763869.2012.641841",
				"extra": "PMID: 22289095",
				"libraryCatalog": "Pubget"
			}
		]
	}
]
/** END TEST CASES **/