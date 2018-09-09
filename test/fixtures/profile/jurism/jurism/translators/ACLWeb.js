{
	"translatorID": "f4a5876a-3e53-40e2-9032-d99a30d7a6fc",
	"label": "ACLWeb",
	"creator": "Nathan Schneider, Guy Aglionby",
	"target": "^https?://(www\\.)?aclweb\\.org/anthology/[^#]+",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2018-03-24 09:47:15"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2018 Guy Aglionby
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
	if (doc.contentType === 'application/pdf' || url.endsWith('.bib')) {
		let id = url.split('/').pop();
		return id[0] == 'J' || id[0] == 'Q' ? 'journalArticle' : 'conferencePaper';
	} else {
		return 'multiple';
	}
}

function doWeb(doc, url) {
	if (detectWeb(doc, url) === 'multiple') {
		Zotero.selectItems(extractFullProceedings(doc), function (selected) {
			if (!selected) {
				return true;
			}
			
			Object.keys(selected).forEach(function (id) {
				let bibtexElement = ZU.xpath(doc, '//a[contains(@href, "' + id + '.bib")]');
				
				// Sometimes there won't be a BibTeX link, so we need to check
				// and scrape directly from the proceedings page if there isn't.
				if (bibtexElement.length) {
					let bibtexURL = bibtexElement[0].href;
					ZU.doGet(bibtexURL, function(responseString, responseObj, url) {
						scrapeBibtex(responseString, url);
					});
				} else {
					scrapeProceedings(doc, id);
				}
			});
		});
	} else if(url.endsWith('.bib')) {
		// e.g. http://www.aclweb.org/anthology/P10-4014.bib
		let bibtex = ZU.xpath(doc, '//pre')[0].textContent;
		scrapeBibtex(bibtex, url);
	} else if (doc.contentType === 'application/pdf') {
		let bibtexURL = url.replace('.pdf', '') + '.bib';
		ZU.doGet(bibtexURL, function(responseString, responseObj) {
			// Some items don't have .bib entries. In those cases we need to go
			// to the proceedings page and scrape the information from there,
			// given that we have the ID of the paper from the URL.
			let is404 = responseString.includes('<title>404 Not Found</title>');
			if (is404) {
				// e.g. http://www.aclweb.org/anthology/Q14-1019
				let id = url.split('/').pop().replace('.pdf', '');
				ZU.processDocuments(constructProceedingsURL(id), function(doc) {
					scrapeProceedings(doc, id);
				});
			} else {
				// e.g. http://www.aclweb.org/anthology/P10-4014
				scrapeBibtex(responseString, bibtexURL);
			}
		});
	}
}

function extractFullProceedings(doc) {
	let unwantedTitles = ['Front Matter', 'Author Index', 'Keyword Index'].map(function(title) { 
		return 'not(contains(., "' + title + '"))';
	}).join(' and ');
	
	let baseXpath = '//div[@id="content"]/p[i[' + unwantedTitles + ']]/';
	
	let ids = ZU.xpath(doc, baseXpath + 'a[@href = concat(text(), ".pdf")]');
	ids = ids.map(function(id) { return id.textContent; });
	
	let authors = ZU.xpath(doc, baseXpath + 'b');
	authors = authors.map(function(author) { return author.textContent; });
	
	let titles = ZU.xpath(doc, baseXpath + 'i');
	titles = titles.map(function(title) { return title.textContent; });
	
	let items = {};

	for (let i = 0; i < ids.length; i++) {
		let articleAuthors = authors[i].split('; ');
		let authorSurname = articleAuthors[0].split(' ').pop();
		let etAl = articleAuthors.length > 1 ? ' et al.' : '';
		let author = authorSurname + etAl;
		items[ids[i]] = ids[i] + ' (' + author + '): ' + titles[i];
	}
	
	return items;
}

function scrapeBibtex(responseString, bibtexURL) {
	let pdfURL = bibtexURL.replace('.bib', '.pdf');
			
	let translator = Zotero.loadTranslator("import");
	translator.setTranslator("9cb70025-a888-4a29-a210-93ec52da40d4");
	translator.setString(responseString);
	translator.setHandler("itemDone", function (obj, item) {
		item.attachments.push({
			url: pdfURL,
			title: 'Full Text PDF',
			mimeType: 'application/pdf'
		});
		delete item.itemID;
		item.complete();
	});
	translator.translate();
}

function scrapeProceedings(doc, id) {
	let itemType = id[0] == 'J' || id[0] == 'Q' ? 'journalArticle' : 'conferencePaper';
	let newItem = new Zotero.Item(itemType);
	
	let paragraphXpath = '//p[a[text()="' + id + '"]]/';
	
	let pdfURL = ZU.xpathText(doc, paragraphXpath + 'a[contains(@href, "pdf")]/@href');
	newItem.attachments.push({
		title: "Full Text PDF",
		mimeType: "application/pdf",
		url: pdfURL
	});
	
	// The same proceedings list page can have multiple titles on it, so get the
	// one relevant to this paper ID.
	// e.g. http://www.aclweb.org/anthology/Y/Y16/
	let titles = ZU.xpath(doc, paragraphXpath + 'preceding-sibling::h1');
	
	if (itemType == 'conferencePaper') {
		newItem.proceedingsTitle = titles[titles.length - 1].textContent;
		newItem.publisher = 'Association for Computational Linguistics';
	} else {
		let publicationName = id[0] == 'J' 
			? 'Computational Linguistics'
			: 'Transactions of the Association of Computational Linguistics';
		newItem.publicationTitle = publicationName;
		let journalInfo = titles[titles.length - 1].textContent;
		let matchVolume = journalInfo.match(/Volume (\d)/);
		if (matchVolume) newItem.volume = matchVolume[1];
		let matchIssue = journalInfo.match(/(Issue|Number) (\d)/);
		if (matchIssue) newItem.issue = matchIssue[2];
	}
	
	newItem.url = constructProceedingsURL(id) + '/' + id;
	
	let titleElement = ZU.xpath(doc, paragraphXpath + 'i')[0];
	newItem.title = titleElement.textContent;
	
	let authorElement = ZU.xpath(doc, paragraphXpath + 'b')[0];
	let authors = authorElement.textContent.split('; ');
	newItem.creators = authors.map(function(author) {
		return ZU.cleanAuthor(author, 'author');
	});
	
	let year = id.split('-')[0].substring(1);
	year = year < 50 ? '20' + year : '19' + year;
	newItem.date = year;
	newItem.complete();
}

function constructProceedingsURL(id) {
	const STUB_URL = 'http://aclweb.org/anthology/';
	let idComponents = id.split('-');
	return STUB_URL + idComponents[0][0] + '/' + idComponents[0];
}
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://aclweb.org/anthology/P/P93/",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://aclweb.org/anthology/Y/Y16/",
		"items": "multiple"
	}
]
/** END TEST CASES **/
