{
	"translatorID": "fa8f8274-ada5-415a-96dd-a5c19fce7046",
	"label": "Chronicling America",
	"creator": "Sebastian Karcher",
	"target": "^https?://chroniclingamerica\\.loc\\.gov",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2013-03-31 23:29:08"
}

/*
   Chronicling America Translator
   Copyright (C) 2012 Sebastian Karcher

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
	var xpath='//meta[@name="citation_title"]';
		
	if (ZU.xpath(doc, xpath).length > 0) {
		return "newspaperArticle";
	}
			
	if (url.search(/\/search\/pages\/results\/?/)!=-1) {
		return "multiple";
	}

	return false;
}


function doWeb(doc,url)
{
	if (detectWeb(doc, url) == "multiple") {
		var hits = {};
		var urls = [];
		var results = ZU.xpath(doc,'//td/div[@class="highlite"]/a[2]');
	
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
			item.itemType = "newspaperArticle";
			if (item.abstractNote) item.notes.push(item.abstractNote);
			item.abstractNote = "";
			item.itemID = "";
			var pdfurl = ZU.xpathText(doc, '//head/link[@type="application/pdf"]/@href');
			if (pdfurl){
				item.attachments.push({url:'http://chroniclingamerica.loc.gov' +pdfurl, title:"Chronicling American PDF", mimeType: "application/pdf"})
			}
			item.language=ZU.xpathText(doc, '//meta[@name="mods.languageTerm"]/@content')	
			var publication = ZU.xpathText(doc, '//meta[@name="mods.title"]/@content'); 
			if (publication) item.publication = publication.replace(/[\.\s]*$/, "");	
			item.complete();

		});
		translator.translate();
	}
}
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://chroniclingamerica.loc.gov/search/pages/results/?date1=1836&rows=20&searchType=basic&state=&date2=1922&proxtext=wilson&y=0&x=0&dateFilterType=yearRange",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://chroniclingamerica.loc.gov/lccn/sn83030193/1912-02-14/ed-1/seq-15/#words=Wilson&date1=1836&rows=20&searchType=basic&state=&date2=1922&proxtext=wilson&y=0&x=0&dateFilterType=yearRange&index=4",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "The evening world. (New York, N.Y.) 1887-1931, February 14, 1912, Image 15",
				"creators": [],
				"date": "1912/02/14",
				"ISSN": "1941-0654",
				"language": "eng",
				"libraryCatalog": "chroniclingamerica.loc.gov",
				"url": "http://chroniclingamerica.loc.gov/lccn/sn83030193/1912-02-14/ed-1/seq-15/",
				"attachments": [
					{
						"title": "Snapshot"
					},
					{
						"title": "Chronicling American PDF",
						"mimeType": "application/pdf"
					}
				],
				"tags": [
					"New York (N.Y.)--Newspapers.",
					"New York (State)--New York County.--fast--(OCoLC)fst01234953",
					"New York (State)--New York.--fast--(OCoLC)fst01204333",
					"New York County (N.Y.)--Newspapers."
				],
				"notes": [
					"The evening world. (New York, N.Y.) 1887-1931, February 14, 1912, Image 15, brought to you by The New York Public Library, Astor, Lenox and Tilden Foundation, and the National Digital Newspaper Program."
				],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/