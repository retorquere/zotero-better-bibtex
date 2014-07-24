{
	"translatorID": "e40a27bc-0eef-4c50-b78b-37274808d7d2",
	"label": "J-Stage",
	"creator": "Sebastian Karcher",
	"target": "^https?://www\\.jstage\\.jst\\.go\\.jp/",
	"minVersion": "2.1.9",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2014-03-19 01:59:25"
}

/*
	***** BEGIN LICENSE BLOCK *****
	
	J-Stage translator - Copyright © 2012 Sebastian Karcher 
	This file is part of Zotero.
	
	Zotero is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.
	
	Zotero is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU Affero General Public License for more details.
	
	You should have received a copy of the GNU Affero General Public License
	along with Zotero.  If not, see <http://www.gnu.org/licenses/>.
	
	***** END LICENSE BLOCK *****
*/
function detectWeb(doc, url) {
	if (url.match(/\.jst\.go\.jp\/article\//)) {
		return "journalArticle";
	} else if (url.match(/\.jst\.go\.jp\/result\?/) || url.match(/\.jst\.go\.jp\/browse\//)) {
		return "multiple";
	}
}

function doWeb(doc, url) {
	var articles = new Array();
	if (detectWeb(doc, url) == "multiple") {
		var items = {};
		var titles = doc.evaluate('//div[contains(@class, "contents_detail")]/div/a|//h3[@class="mod-item-heading"]/a', doc, null, XPathResult.ANY_TYPE, null);
		var title;
		while (title = titles.iterateNext()) {
			items[title.href] = title.textContent;
		}
		Zotero.selectItems(items, function (items) {
			if (!items) {
				return true;
			}
			for (var i in items) {
				articles.push(i);
			}
			Zotero.Utilities.processDocuments(articles, scrape, function () {
				Zotero.done();
			});
			Zotero.wait();
		});
	} else {
		scrape(doc, url);
	}
}

// help function
function scrape(doc, url) {
	//get abstract and tags from article plage
	//the xpaths aren't great , but seem reliable across pages
	var pdfurl = ZU.xpath(doc, '//li[@class="icon-pdf"]/a/@href');
	pdfurl = "https://www.jstage.jst.go.jp" + pdfurl[1].textContent;
	Z.debug(pdfurl)
	var abs = ZU.xpathText(doc, '//div[@class="mod-section"]/p[@class="normal"]') //.replace(/\n/g, "")
	var tags = ZU.xpathText(doc, '//p[contains(@class, "keywords")]')
	if (tags){
	tags = tags.replace(/Keywords:/, "").split(/\s*,\s*/);
	for (i in tags) {
		tags[i] = ZU.trimInternal(tags[i]);
	}
	}
	//get BibTex Link
	var bibtexurl = ZU.xpathText(doc, '//li/a[contains(text(), "BibTeX")]/@href');
	Z.debug(bibtexurl)
	Zotero.Utilities.HTTP.doGet(bibtexurl, function (text) {
		var bibtex = text;
		//Zotero.debug(bibtex)
		var translator = Zotero.loadTranslator("import");
		translator.setTranslator("9cb70025-a888-4a29-a210-93ec52da40d4");
		translator.setString(bibtex);
		translator.setHandler("itemDone", function (obj, item) {
			if (abs) item.abstractNote = abs;
			if (tags) item.tags = tags;
			for (i in item.creators) {
				if (item.creators[i].lastName && item.creators[i].lastName == item.creators[i].lastName.toUpperCase()) {
					item.creators[i].lastName = Zotero.Utilities.capitalizeTitle(item.creators[i].lastName.toLowerCase(), true);
				}
				if (item.creators[i].firstName && item.creators[i].firstName == item.creators[i].firstName.toUpperCase()) {
					item.creators[i].firstName = Zotero.Utilities.capitalizeTitle(item.creators[i].firstName.toLowerCase(), true);
				}
			}
			if (item.title == item.title.toUpperCase()) {
				item.title = Zotero.Utilities.capitalizeTitle(item.title.toLowerCase(), true);
			}
			if (item.publicationTitle == item.publicationTitle.toUpperCase()) {
				item.publicationTitle = Zotero.Utilities.capitalizeTitle(item.publicationTitle.toLowerCase(), true);
			}
			item.attachments = [{
				url: item.url,
				title: "Jstage - Snapshot",
				mimeType: "text/html"
			}, {
				url: pdfurl,
				title: "Jstage - Full Text PDF",
				mimeType: "application/pdf"
			}];
			item.complete();
		});
		translator.translate();
	});
}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://www.jstage.jst.go.jp/article/prohe1990/45/0/45_0_811/_article",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"firstName": "Thai Nam",
						"lastName": "Pham",
						"creatorType": "author"
					},
					{
						"firstName": "Dawen",
						"lastName": "Yang",
						"creatorType": "author"
					},
					{
						"firstName": "Shinjiro",
						"lastName": "Kanae",
						"creatorType": "author"
					},
					{
						"firstName": "Taikan",
						"lastName": "Oki",
						"creatorType": "author"
					},
					{
						"firstName": "Katumi",
						"lastName": "Musiake",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [
					"soil erosion by water",
					"the RUSLE",
					"global estimation",
					"global data sets"
				],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Jstage - Snapshot",
						"mimeType": "text/html"
					},
					{
						"title": "Jstage - Full Text PDF",
						"mimeType": "application/pdf"
					}
				],
				"itemID": "2001811",
				"title": "Application of RUSLE Model on Global Soil Erosion Estimate",
				"publicationTitle": "Proceedings of Hydraulic Engineering",
				"volume": "45",
				"pages": "811-816",
				"date": "2001",
				"abstractNote": "Soil erosion is one of the most serious environmental problems commonly in over the world, which is caused by both natural and human factors. It is possible to investigate the global issue on soil erosion with the development of global data sets. This research estimated global soil erosion by the RUSLE model with use of a comprehensive global data set. The accuracy of the estimate mostly depends on the available information related to the study area. Present available finest data was used in this study. As the desired objective of estimating soil erosion by water at global scale, the application of RUSLE has shown its positive applicability on large-scale estimates. The study has shown a global view of water soil erosion potential with 0.5-degree grid resolution. Regional validations and examinations have been carried out by different ways. The global mean of annual soil erosion by water was estimated as 1100 ton/ km2, which agrees with several results obtained in different regions.",
				"libraryCatalog": "J-Stage"
			}
		]
	},
	{
		"type": "web",
		"defer": true,
		"url": "https://www.jstage.jst.go.jp/result?item1=4&word1=organic+agriculture+erosion",
		"items": "multiple"
	},
	{
		"type": "web",
		"defer": true,
		"url": "https://www.jstage.jst.go.jp/browse/bpb",
		"items": "multiple"
	}
]
/** END TEST CASES **/