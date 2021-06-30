{
	"translatorID": "b97af278-52c1-4fc4-9c8b-5175c83941f2",
	"translatorType": 4,
	"label": "New Left Review",
	"creator": "Bo An",
	"target": "^https?://(www\\.)?newleftreview\\.org/issues/",
	"minVersion": "3.0",
	"maxVersion": null,
	"priority": 100,
	"inRepository": true,
	"browserSupport": "gcsibv",
	"lastUpdated": "2021-06-16 21:20:00"
}

/*
	***** BEGIN LICENSE BLOCK *****
	Copyright © 2021 Bo An
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
	const article = "articles";
	const isArticle = url.includes(article);
	if (isArticle) {
		return 'journalArticle';
	}
	else {
		return 'multiple';
	}
}

function doWeb(doc, url) {
	if (detectWeb(doc, url) == "multiple") {
		Zotero.selectItems(getSearchResults(doc, false), (items) => {
			if (!items) {
				return true;
			}
			const articles = [];
			for (const i in items) {
				articles.push(i);
			}
			ZU.processDocuments(articles, scrape);
			return true;
		});
	}
	else {
		scrape(doc, url);
	}
}

function getSearchResults(doc) {
	let items = {};
	let found = false;

	const articleLinks = doc.querySelectorAll('a.article-link');

	articleLinks.forEach((articleLink, articleIndex) => {
		const href = articleLink.href;
		let title = text(articleLink, '.programme-note__title');
		const author = text(articleLink, '.programme-note__author');
		if (author) {
			title += ` (${author})`;
		}
		items[href] = title;
		if (found === false) {
			found = true;
		}
	});

	return found ? items : false;
}

function scrape(doc, _) {
	const newItem = new Zotero.Item('journalArticle');

	newItem.publicationTitle = "New Left Review";
	newItem.journalAbbreviation = "New Left Rev";

	const title = ZU.xpath(doc, '//meta[@itemprop="name"]/@content')[0].value;
	newItem.title = title;

	const description = ZU.xpathText(doc, '//meta[@name="description"]/@content');
	if (description) {
		newItem.abstractNote = description;
	}

	const authors = ZU.xpath(doc, '//meta[@itemprop="author"]/@content');
	const authorFullNames = authors.map(author => author.value);
	authorFullNames.forEach((authorFullName) => {
		newItem.creators.push(ZU.cleanAuthor(authorFullName, "author", false));
	});

	const issueNum = ZU.xpathText(doc, '//span[@class="article-publication-details__issue_number"]');
	newItem.issue = issueNum;

	const pageStart = ZU.xpathText(doc, '//meta[@itemprop="pageStart"]/@content');
	const pageEnd = ZU.xpathText(doc, '//meta[@itemprop="pageEnd"]/@content');
	newItem.pages = `${pageStart}-${pageEnd}`;

	const publicationDate = ZU.xpathText(doc, '//time[@itemprop="datePublished"]/@datetime');
	newItem.date = publicationDate;

	let pdfUrl = undefined;
	const pdfUrlEl = ZU.xpath(doc, '//a[@title="Download PDF version"]');
	if (pdfUrlEl[0]) {
		pdfUrl = pdfUrlEl[0].href;
	}
	if (pdfUrl) {
		newItem.attachments.push({
			url: pdfUrl,
			mimeType: "application/pdf",
		});
	}

	newItem.complete();
}


/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://newleftreview.org/issues/ii128/articles/georgi-derluguian-a-small-world-war/",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "A Small World War",
				"creators": [
					{
						"firstName": "Georgi",
						"lastName": "Derluguian",
						"creatorType": "author"
					}
				],
				"date": "2021-04-30",
				"abstractNote": "At the intersection of Eurasia’s pre-modern empires, Transcaucasia has long been a battlezone. With the waning of American-led globalization, and its legacy of militarization, are their avatars—Russia, Turkey, Iran—re-emerging, equipped with Israeli drones? Georgi Derluguian locates the 2020 war for Nagorno Karabagh in the geopolitical longue durée.",
				"issue": "128",
				"journalAbbreviation": "New Left Rev",
				"libraryCatalog": "New Left Review",
				"pages": "24-46",
				"publicationTitle": "New Left Review",
				"attachments": [
					{
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
		"url": "https://newleftreview.org/issues/ii115/articles/didier-fassin-anne-claire-defossez-an-improbable-movement",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "An Improbable Movement?",
				"creators": [
					{
						"firstName": "Didier",
						"lastName": "Fassin",
						"creatorType": "author"
					},
					{
						"firstName": "Anne-Claire",
						"lastName": "Defossez",
						"creatorType": "author"
					}
				],
				"date": "2019-02-01",
				"abstractNote": "The policies and pretensions of a Bourbonnais president as background to the political insurgency of provincial France. Origins and complexion of the gilets jaunes mobilization, with the Elysée resorting to the worst police violence since May 68.",
				"issue": "115",
				"journalAbbreviation": "New Left Rev",
				"libraryCatalog": "New Left Review",
				"pages": "77-92",
				"publicationTitle": "New Left Review",
				"attachments": [
					{
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
		"url": "https://newleftreview.org/issues/ii128",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://newleftreview.org/issues/ii128/articles/michael-lipkin-domesticating-hegel",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Domesticating Hegel",
				"creators": [
					{
						"firstName": "Michael",
						"lastName": "Lipkin",
						"creatorType": "author"
					}
				],
				"date": "2021-04-30",
				"abstractNote": "Michael Lipkin on Klaus Vieweg, Hegel: Der Philosoph der Freiheit. The author of Philosophy of Right as roistering liberal.",
				"issue": "128",
				"journalAbbreviation": "New Left Rev",
				"libraryCatalog": "New Left Review",
				"pages": "153-160",
				"publicationTitle": "New Left Review",
				"attachments": [
					{
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
		"url": "https://newleftreview.org/issues/i171",
		"items": "multiple"
	}
]
/** END TEST CASES **/
