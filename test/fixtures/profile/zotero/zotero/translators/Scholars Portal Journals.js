{
	"translatorID": "5ac0fd37-5578-4f82-8340-0e135b6336ee",
	"label": "Scholars Portal Journals",
	"creator": "Bartek Kawula",
	"target": "^https?://journals\\.scholarsportal\\.info/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2021-02-05 18:25:57"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2021 Bartek Kawula

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
	if (url.includes('/my-articles')) {
		if (getItems(doc)) {
			return 'multiple';
		}
	}
	else if (url.includes('/search?q')) {
		if (getItems(doc)) {
			return 'multiple';
		}
	}
	else if (url.includes('/browse/')) {
		let browse = doc.getElementById('toc');
		if (browse) {
			Zotero.monitorDOMChanges(browse.parentElement);
		}
		if (getItems(doc)) {
			return 'multiple';
		}
	}
	else if (url.includes('/details/')) {
		return 'journalArticle';
	}
	return false;
}

function doWeb(doc, url) {
	let type = detectWeb(doc, url);
	if (type == 'multiple') {
		let list = getItems(doc);
		Zotero.selectItems(list, function (selectedItems) {
			if (!selectedItems) return true;
			let articles = [];
			for (let i in selectedItems) {
				let article = '/ris?uri=' + i;
				articles.push(article);
			}
			ZU.doGet(articles, scrape);
			return false;
		}
		);
	}
	else {
		let uri = getURI(url);
		let article = '/ris?uri=' + uri;
		ZU.doGet(article, scrape);
	}
	return false;
}

function getURI(url) {
	var a = '';
	var b = '';
	if (url.includes('/details/')) {
		a = url.indexOf('details');
		b = url.indexOf('xml');
		return url.substring(a + 7, b + 3);
	}
	else if (url.includes('/resolve/')) {
		if (url.includes('.xml')) {
			a = url.indexOf('/resolve/');
			b = url.indexOf('xml');
			return url.substring(a + 9, b + 3);
		}
		else {
			return '/' + url.split('/resolve/')[1] + '.xml';
		}
	}
	return false;
}

function getItems(doc) {
	var items = {}, found = false;
	var titles = '';
	if (doc.URL.includes('/my-articles')) {
		titles = ZU.xpath(doc.getElementById('my-articles-list'), './/div[@class = "title"]/h3/a');
		for (let i = 0; i < titles.length; i++) {
			let title = ZU.trimInternal(titles[i].textContent);
			let uri = getURI(titles[i].href);
			items[uri] = title;
			found = true;
		}
	}
	else {
		if (doc.URL.includes('/browse')) {
			titles = ZU.xpath(doc, './/div/h3/a');
		}
		else {
			titles = ZU.xpath(doc.getElementById('result-list'), './/div[@class = "details"]/h3/a');
		}
		for (let i = 0; i < titles.length; i++) {
			let title = ZU.trimInternal(titles[i].textContent);
			let uri = getURI(titles[i].href);
			items[uri] = title;
			found = true;
		}
	}
	return found ? items : false;
}

function scrape(text) {
	// loading RIS transformer.
	let translator = Zotero.loadTranslator('import');
	translator.setTranslator('32d59d2d-b65a-4da4-b0a3-bdd3cfb979e7');
	translator.setString(text);
	translator.setHandler('itemDone', function (obj, item) {
		let uri = getURI(item.attachments[0].path);
		let pdfURL = '/pdf' + uri;
		item.url = 'https://journals.scholarsportal.info/details' + uri;
		item.attachments = [{
			url: pdfURL,
			title: 'Scholars Portal Full Text PDF',
			mimeType: 'application/pdf'
		}];
		item.complete();
	});
	translator.translate();
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://journals.scholarsportal.info/search?q=water&search_in=anywhere&date_from=&date_to=&sort=relevance&sub=",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://journals.scholarsportal.info/details/10704965/v16i0001/58_ioiaaphwuiub.xml",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Impact of Increased Access and Price on Household Water Use in Urban Bolivia",
				"creators": [
					{
						"lastName": "Israel",
						"firstName": "Debra K.",
						"creatorType": "author"
					}
				],
				"date": "2007",
				"DOI": "10.1177/1070496506298190",
				"ISSN": "1070-4965",
				"abstractNote": "Using the 1994 Bolivian Integrated Household Survey, this study analyzes the equity implications of urban water sector reform including both increased water prices and increased access to piped water. Household water expenditures are examined by income decile, and low-income households are found to spend a higher percentage of income on water than high-income households. However, households purchasing from private water vendors could benefit from obtaining piped water, because regression analysis shows that on average, these households spend more on water than those with piped water inside their buildings or yards. This differential was the greatest in the city of Cochabamba, which also had the largest percentage of households purchasing from private water vendors. To understand the equity impact of water reform, the effects on both prereform users of piped water and those without access to piped water must be considered.",
				"issue": "1",
				"journalAbbreviation": "The Journal of Environment & Development",
				"libraryCatalog": "Scholars Portal Journals",
				"pages": "58-83",
				"publicationTitle": "The Journal of Environment & Development",
				"url": "https://journals.scholarsportal.info/details/10704965/v16i0001/58_ioiaaphwuiub.xml",
				"volume": "16",
				"attachments": [
					{
						"title": "Scholars Portal Full Text PDF",
						"mimeType": "application/pdf"
					}
				],
				"tags": [
					{
						"tag": "Bolivia"
					},
					{
						"tag": "Latin America"
					},
					{
						"tag": "equity"
					},
					{
						"tag": "water reform"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://journals.scholarsportal.info/browse/toc?uri=/08939454&p=1",
		"items": "multiple"
	}
]
/** END TEST CASES **/
