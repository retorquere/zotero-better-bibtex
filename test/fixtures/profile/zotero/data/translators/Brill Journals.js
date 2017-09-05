{
	"translatorID": "6d087de8-f858-4ac5-9fbd-2bf2b35ee41a",
	"label": "Brill Journals",
	"creator": "Sebastian Karcher",
	"target": "^https?://(www\\.)?booksandjournals\\.brillonline\\.com",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 150,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2017-07-27 10:35:13"
}

/*
   Brill Journals Translator
   Copyright (C) 2013 Sebastian Karcher an Avram Lyon

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
	var xpathtoc = '//div[contains(@class, "publistwrapper")]/div[@id="tabbedpages"]'	
	if (ZU.xpath(doc, xpath).length > 0) {
		return "journalArticle";
	}
	//TOCs		
	if (ZU.xpath(doc, xpathtoc).length > 0) {
		return "multiple";
	}
	//search results
	if (url.indexOf("/search?value")!=-1){
		return "multiple";
	}
	
	return false;
}


function doWeb(doc,url)
{
	if (detectWeb(doc, url) == "multiple") {
		var hits = {};
		var urls = [];
		//TOCs
		var results = ZU.xpath(doc, '//div[@id="tabbedpages" or @id="searchContent"]//h5/a[contains(@href, "/content/")]');
		//Search results
		if (results.length<1){
			results = ZU.xpath(doc, '//div[@class="resultItem"]//div[@class="title"]/a')
		}
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
	} else {
		// We call the Embedded Metadata translator to do the actual work
		var translator = Zotero.loadTranslator("web");
		translator.setTranslator("951c027d-74ac-47d4-a107-9c3069ab7b48");
		translator.setHandler("itemDone", function(obj, item) {
			item.DOI = ZU.xpathText(doc, '//span[@class="meta-value doi"]')
			item.url = url;
			var pdfurl = ZU.xpathText(doc, '//a[@class="pdf launchfulltextlink"]/@href')
			pdfurl = "http://booksandjournals.brillonline.com"  + pdfurl
			item.attachments.push({url: pdfurl, title: "Brill Journals PDF Full Text", mimeType: "application/pdf"})
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
		"url": "http://booksandjournals.brillonline.com/content/journals/10.1163/187254612x646206",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"firstName": "Sylvie",
						"lastName": "Bredeloup",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [
					"Guangzhou",
					"trading post",
					"African entrepreneurs",
					"African migration",
					"comptoir commercial",
					"entrepreneurs africains",
					"migration africaine"
				],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Snapshot"
					},
					{
						"title": "Brill Journals PDF Full Text",
						"mimeType": "application/pdf"
					}
				],
				"title": "African Trading Post in Guangzhou: Emergent or Recurrent Commercial Form?",
				"publisher": "Brill",
				"institution": "Brill",
				"company": "Brill",
				"label": "Brill",
				"distributor": "Brill",
				"date": "2012/01/01",
				"reportType": "Text",
				"letterType": "Text",
				"manuscriptType": "Text",
				"mapType": "Text",
				"thesisType": "Text",
				"websiteType": "Text",
				"presentationType": "Text",
				"postType": "Text",
				"audioFileType": "Text",
				"publicationTitle": "African Diaspora",
				"volume": "5",
				"issue": "1",
				"abstractNote": "Abstract In the early 2000s, nationals of Sub-Saharan Africa who had settled in the market places of Hong Kong, Bangkok, Jakarta, and Kuala Lumpur, moved to Guangzhou and opened offices in the upper floors of buildings in Baiyun and Yuexiu Districts. These were located in the northwest of the city, near the central railway station and one of the two fairs of Canton. Gradually these traders were able to create the necessary conditions of hospitality by opening community restaurants on upper floors, increasing the number of showrooms and offices as well as the services of freight and customs clearance in order to live up to an African itinerant customer’s expectations. From interviews carried out between 2006 and 2009 in the People’s Republic of China and in Hong Kong, Bangkok, Dubai, and West Africa, the article will first highlight the economic logics which have contributed to the constitution of African trading posts in China and describe their extension from the Middle East and from Asia. The second part will determine the respective roles of migrants and traveling Sub-Saharan entrepreneurs, before exploring their interactions with Chinese society in the setting up of these commercial networks. It will also look at the impact of toughening immigration policies. It is the principle of the African trading posts of anchoring of some traders in strategic places negotiated with the host society that allows the movement but also the temporary settlement of many visitors. The first established traders purchase products manufactured in the hinterland to fulfill the demand of the itinerant merchants who in turn supply customers located in other continents.",
				"pages": "27-50",
				"ISSN": "1872-5465",
				"url": "http://booksandjournals.brillonline.com/content/journals/10.1163/187254612x646206",
				"libraryCatalog": "booksandjournals.brillonline.com",
				"accessDate": "CURRENT_TIMESTAMP",
				"DOI": "10.1163/187254612X646206",
				"shortTitle": "African Trading Post in Guangzhou"
			}
		]
	},
	{
		"type": "web",
		"url": "http://booksandjournals.brillonline.com/content/18725465/4/2",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://booksandjournals.brillonline.com/search?value1=&option1=all&operator2=AND&value9=labour&option9=title&operator9=AND&value10=&option10=author&operator10=AND&value3=&option3=issnisbndoi&operator3=AND&value4=&option4=all&operator4=NOT&option7=contentType&operator7=AND&value7=Article&subjectname=&option8=dcterms_subject&operator8=AND&value8=&maxyear=2013&option5=year_from&operator5=AND&value5=&option6=year_to&operator6=AND&sortField=default&sortDescending=true",
		"items": "multiple"
	}
]
/** END TEST CASES **/