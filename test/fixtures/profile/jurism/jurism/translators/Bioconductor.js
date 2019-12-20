{
	"translatorID": "21f62926-4343-4518-b6f2-a284e650e64a",
	"label": "Bioconductor",
	"creator": "Qiang Hu",
	"target": "https?://(www\\.)?bioconductor\\.org/(packages/.*/bioc/html|help/search)/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2019-09-17 16:47:07"
}

/*
	***** BEGIN LICENSE BLOCK *****
	
	Bioconductor Packages Translator
	Copyright © 2019 Qiang Hu
	
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

// attr()/text() v2
// eslint-disable-next-line
function attr(docOrElem,selector,attr,index){var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector);return elem?elem.getAttribute(attr):null;}function text(docOrElem,selector,index){var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector);return elem?elem.textContent:null;} 


function detectWeb(doc, url) {
	if (url.includes('/bioc/html/')) {
		return "computerProgram";
	}
	else if (url.includes('/search/index.html') && getSearchResults(doc, true)) {
		return "multiple";
	}
	else {
		return false;
	}
}


function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = doc.querySelectorAll('dl>dt>a[href*="/bioc/html/"]');
	for (let i = 0; i < rows.length; i++) {
		let href = rows[i].href;
		let title = ZU.trimInternal(rows[i].textContent);
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
			if (!items) {
				return;
			}
			var articles = [];
			for (var i in items) {
				articles.push(i);
			}
			ZU.processDocuments(articles, scrape);
		});
	}
	else if (detectWeb(doc, url) == "computerProgram") {
		scrape(doc, url);
	}
}


function scrape(doc, url) {
	var item = new Zotero.Item('computerProgram');
	item.title = text(doc, '#PageContent > h1');
	var subtitle = text(doc, '#PageContent > div.do_not_rebase > h2');
	if (subtitle) {
		item.title += ": " + subtitle;
	}
	var doi = ZU.xpathText(doc, '//*[@id="PageContent"]/div[2]/a[contains(@href, "https://doi.org/")]');
	if (doi !== null) {
		item.extra = 'DOI: ' + doi;
	}
	var rows = doc.querySelectorAll('#PageContent > div.do_not_rebase > p');
	for (let i = 0; i < rows.length; i++) {
		if (ZU.trimInternal(rows[i].textContent).startsWith('Bioconductor version:')) {
			item.company = ZU.trimInternal(rows[i].textContent);
			item.abstractNote = ZU.trimInternal(rows[i + 1].textContent);
		}
		if (ZU.trimInternal(rows[i].textContent).startsWith('Author')) {
			var authorString = ZU.trimInternal(rows[i].textContent);
			var creators = authorString.replace(/Author:\s*/, '').replace(/\[.+?\]/g, '').replace(/\(.+?\)/g, '');
			creators = creators.split(/,|and\s*/);
			for (let i = 0; i < creators.length; i++) {
				item.creators.push(ZU.cleanAuthor(creators[i], 'programmer'));
			}
		}
	}

	item.versionNumber = ZU.xpathText(doc, '//table/tbody/tr/td[contains(text(), "Version")]/following-sibling::td');
	item.rights = ZU.xpathText(doc, '//table/tbody/tr/td[contains(text(), "License")]/following-sibling::td');
	item.url = ZU.xpathText(doc, '//table/tbody/tr/td[contains(text(), "Package Short Url")]/following-sibling::td') || url;
	var year = ZU.xpathText(doc, '//*[@id="SiteGlobalFooter"]/div/p[contains(text(), "Copyright")]');
	if (year) {
		item.date = year.match(/\d+/g)[1];
	}
	
	var tags = ZU.xpath(doc, '//td[contains(text(), "biocViews")]/following-sibling::td/a');
	for (let i = 0; i < tags.length; i++) {
		item.tags.push(tags[i].textContent);
	}

	item.complete();
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://bioconductor.org/help/search/index.html?q=SummarizedExperiment/",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://bioconductor.org/packages/release/bioc/html/SummarizedExperiment.html",
		"items": [
			{
				"itemType": "computerProgram",
				"title": "SummarizedExperiment: SummarizedExperiment container",
				"creators": [
					{
						"firstName": "Martin",
						"lastName": "Morgan",
						"creatorType": "programmer"
					},
					{
						"firstName": "Valerie",
						"lastName": "Obenchain",
						"creatorType": "programmer"
					},
					{
						"firstName": "Jim",
						"lastName": "Hester",
						"creatorType": "programmer"
					},
					{
						"firstName": "Hervé",
						"lastName": "Pagès",
						"creatorType": "programmer"
					}
				],
				"date": "2019",
				"abstractNote": "The SummarizedExperiment container contains one or more assays, each represented by a matrix-like object of numeric or other mode. The rows typically represent genomic ranges of interest and the columns represent samples.",
				"company": "Bioconductor version: Release (3.9)",
				"extra": "DOI: 10.18129/B9.bioc.SummarizedExperiment",
				"libraryCatalog": "Bioconductor",
				"rights": "Artistic-2.0",
				"shortTitle": "SummarizedExperiment",
				"url": "http://bioconductor.org/packages/SummarizedExperiment/",
				"versionNumber": "1.14.1",
				"attachments": [],
				"tags": [
					{
						"tag": "Annotation"
					},
					{
						"tag": "Coverage"
					},
					{
						"tag": "Genetics"
					},
					{
						"tag": "GenomeAnnotation"
					},
					{
						"tag": "Infrastructure"
					},
					{
						"tag": "Sequencing"
					},
					{
						"tag": "Software"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://bioconductor.org/packages/devel/bioc/html/SummarizedExperiment.html",
		"items": [
			{
				"itemType": "computerProgram",
				"title": "SummarizedExperiment: SummarizedExperiment container",
				"creators": [
					{
						"firstName": "Martin",
						"lastName": "Morgan",
						"creatorType": "programmer"
					},
					{
						"firstName": "Valerie",
						"lastName": "Obenchain",
						"creatorType": "programmer"
					},
					{
						"firstName": "Jim",
						"lastName": "Hester",
						"creatorType": "programmer"
					},
					{
						"firstName": "Hervé",
						"lastName": "Pagès",
						"creatorType": "programmer"
					}
				],
				"date": "2019",
				"abstractNote": "The SummarizedExperiment container contains one or more assays, each represented by a matrix-like object of numeric or other mode. The rows typically represent genomic ranges of interest and the columns represent samples.",
				"company": "Bioconductor version: Development (3.10)",
				"extra": "DOI: 10.18129/B9.bioc.SummarizedExperiment",
				"libraryCatalog": "Bioconductor",
				"rights": "Artistic-2.0",
				"shortTitle": "SummarizedExperiment",
				"url": "http://bioconductor.org/packages/SummarizedExperiment/",
				"versionNumber": "1.15.9",
				"attachments": [],
				"tags": [
					{
						"tag": "Annotation"
					},
					{
						"tag": "Coverage"
					},
					{
						"tag": "Genetics"
					},
					{
						"tag": "GenomeAnnotation"
					},
					{
						"tag": "Infrastructure"
					},
					{
						"tag": "Sequencing"
					},
					{
						"tag": "Software"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://bioconductor.org/packages/3.2/bioc/html/SummarizedExperiment.html",
		"items": [
			{
				"itemType": "computerProgram",
				"title": "SummarizedExperiment: SummarizedExperiment container",
				"creators": [
					{
						"firstName": "Martin",
						"lastName": "Morgan",
						"creatorType": "programmer"
					},
					{
						"firstName": "Valerie",
						"lastName": "Obenchain",
						"creatorType": "programmer"
					},
					{
						"firstName": "Jim",
						"lastName": "Hester",
						"creatorType": "programmer"
					},
					{
						"firstName": "Hervé",
						"lastName": "Pagès",
						"creatorType": "programmer"
					}
				],
				"date": "2016",
				"abstractNote": "The SummarizedExperiment container contains one or more assays, each represented by a matrix-like object of numeric or other mode. The rows typically represent genomic ranges of interest and the columns represent samples.",
				"company": "Bioconductor version: 3.2",
				"libraryCatalog": "Bioconductor",
				"rights": "Artistic-2.0",
				"shortTitle": "SummarizedExperiment",
				"url": "http://bioconductor.org/packages/SummarizedExperiment/",
				"versionNumber": "1.0.2",
				"attachments": [],
				"tags": [
					{
						"tag": "Annotation"
					},
					{
						"tag": "Coverage"
					},
					{
						"tag": "Genetics"
					},
					{
						"tag": "GenomeAnnotation"
					},
					{
						"tag": "Infrastructure"
					},
					{
						"tag": "Sequencing"
					},
					{
						"tag": "Software"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/
