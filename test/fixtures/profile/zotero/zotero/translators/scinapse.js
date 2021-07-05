{
	"translatorID": "42680c5e-1ae8-4171-ab53-afe1d8e840d4",
	"translatorType": 4,
	"label": "scinapse",
	"creator": "Vincent Carret",
	"target": "^https?://(www\\.)?scinapse\\.io/",
	"minVersion": "3.0",
	"maxVersion": null,
	"priority": 100,
	"inRepository": true,
	"browserSupport": "gcsibv",
	"lastUpdated": "2021-06-14 21:10:00"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2019-2021 Vincent Carret
	
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

function detectWeb(doc, url) {
	if ((url.includes('/journals/') || url.includes('/authors/') || url.includes('/search?')) && getSearchResults(doc, true)) {
		return "multiple";
	}
	else if (url.includes("/papers/")) {
		return "journalArticle";
	}
	return false;
}

function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;

	var rows = doc.querySelectorAll("a[href*='/papers/']");
	for (let row of rows) {
		let href = row.href;
		let title = ZU.trimInternal(row.textContent);
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

function scrapeEM(doc, url, postprocess) {
	var translator = Zotero.loadTranslator('web');
	// Embedded Metadata
	translator.setTranslator('951c027d-74ac-47d4-a107-9c3069ab7b48');
	translator.setDocument(doc);
	
	translator.setHandler('itemDone', function (obj, item) {
		item.abstractNote = item.abstractNote.replace(/^Abstract/, '')
			.split(' | ')[0];
		item.date = ZU.strToISO(item.date);
		item.attachments = [];
		postprocess(item);
	});

	translator.getTranslatorObject(function (trans) {
		trans.itemType = "journalArticle";
		trans.doWeb(doc, url);
	});
}

function scrape(doc, url) {
	scrapeEM(doc, url, function (item) {
		item.attachments.push({
			title: "Full Text PDF",
			url: attr(doc, 'a[href*=".pdf"][target="_blank"]', 'href'),
			mimeType: 'application/pdf'
		});
		
		var m = url.match(/\/papers\/([^/#?]+)/);
		if (m) {
			var bibUrl = "/api/citations/export?pids=" + m[1] + "&format=BIBTEX";
			ZU.doGet(bibUrl, function (text, xhr) {
				if (xhr.status != 200) {
					Z.debug("Couldn't fetch BibTeX");
					// it's fine, we'll return what EM gave us
					item.complete();
					return;
				}
				
				var translator = Zotero.loadTranslator("import");
				// BibTeX
				translator.setTranslator("9cb70025-a888-4a29-a210-93ec52da40d4");
				translator.setString(text);
				translator.setHandler("itemDone", function (obj, bibItem) {
					if (bibItem.publicationTitle) {
						// BibTeX publication title is better
						delete item.publicationTitle;
					}
					
					if (bibItem.url) {
						// EM URL is just the page URL
						delete item.url;
					}
					
					Object.assign(bibItem, item);
					bibItem.complete();
				});
				translator.translate();
			}, null, null, null, false);
		}
	});
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://www.scinapse.io/papers/2981511200",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Natural resources in the theory of production: the Georgescu-Roegen/Daly versus Solow/Stiglitz controversy",
				"creators": [
					{
						"firstName": "Quentin",
						"lastName": "Couix",
						"creatorType": "author"
					}
				],
				"date": "2019-10-23",
				"DOI": "10.1080/09672567.2019.1679210",
				"ISSN": "0967-2567",
				"abstractNote": "This paper provides a theoretical and methodological account of an important controversy between neocl",
				"issue": "6",
				"itemID": "Couix_2019",
				"language": "en",
				"libraryCatalog": "www.scinapse.io",
				"pages": "1341–1378",
				"publicationTitle": "The European Journal of the History of Economic Thought",
				"shortTitle": "Natural resources in the theory of production",
				"url": "https://doi.org/10.1080%2F09672567.2019.1679210",
				"volume": "26",
				"attachments": [
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					}
				],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://scinapse.io/journals/105799767",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://scinapse.io/authors/290705619",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://www.scinapse.io/papers/2908678941",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Electrospun polymer biomaterials",
				"creators": [
					{
						"firstName": "Jianxun",
						"lastName": "Ding",
						"creatorType": "author"
					},
					{
						"firstName": "Jin",
						"lastName": "Zhang",
						"creatorType": "author"
					},
					{
						"firstName": "Jiannan",
						"lastName": "Li",
						"creatorType": "author"
					},
					{
						"firstName": "Di",
						"lastName": "Li",
						"creatorType": "author"
					},
					{
						"firstName": "Chunsheng",
						"lastName": "Xiao",
						"creatorType": "author"
					},
					{
						"firstName": "Haihua",
						"lastName": "Xiao",
						"creatorType": "author"
					},
					{
						"firstName": "Huanghao",
						"lastName": "Yang",
						"creatorType": "author"
					},
					{
						"firstName": "Huang-Hao",
						"lastName": "Yang",
						"creatorType": "author"
					},
					{
						"firstName": "Xiuli",
						"lastName": "Zhuang",
						"creatorType": "author"
					},
					{
						"firstName": "Xuesi",
						"lastName": "Chen",
						"creatorType": "author"
					}
				],
				"date": "2019-01-14",
				"DOI": "10.1016/J.PROGPOLYMSCI.2019.01.002",
				"ISSN": "0079-6700",
				"abstractNote": "Electrospinning provides a versatile technique for the preparation of matrices with micro/nanoscopi",
				"itemID": "Ding_2019",
				"language": "en",
				"libraryCatalog": "www.scinapse.io",
				"pages": "1–34",
				"publicationTitle": "Progress in Polymer Science",
				"url": "https://doi.org/10.1016%2Fj.progpolymsci.2019.01.002",
				"volume": "90",
				"attachments": [
					{
						"title": "Full Text PDF",
						"url": "",
						"mimeType": "application/pdf"
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
