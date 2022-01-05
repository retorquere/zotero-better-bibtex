{
	"translatorID": "7d8e6337-3f52-4e8c-8915-95a2ec755b6c",
	"translatorType": 4,
	"label": "Publications Office of the European Union",
	"creator": "Abe Jellinek",
	"target": "^https?://op\\.europa\\.eu/",
	"minVersion": "3.0",
	"maxVersion": null,
	"priority": 100,
	"inRepository": true,
	"browserSupport": "gcsibv",
	"lastUpdated": "2021-06-02 17:55:00"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2021 Abe Jellinek
	
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
	if (url.includes('/publication-detail/')
		&& (doc.querySelector('.col-isbn') || doc.querySelector('.col-doi'))) {
		return "book";
	}
	else if (getSearchResults(doc, true)) {
		return "multiple";
	}
	return false;
}

function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = doc.querySelectorAll('.search-results-items a.documentDetailLink');
	for (let row of rows) {
		let href = row.href;
		let title = ZU.trimInternal(row.textContent);
		if (!href || !title || !href.includes('/publication-detail/')) continue;
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

function scrape(doc) {
	// we would ideally just grab the "Metadata RDF" file here, but it doesn't
	// give us RDF that Zotero can do anything with. the official metadata
	// service (opac.publications.europa.eu) doesn't seem especially reliable.
	// so we'll instead try ISBN and DOI.
	
	let pdfLinks = doc.querySelectorAll('a.download');
	let search = Zotero.loadTranslator("search");
	
	let DOI = ZU.cleanDOI(text(doc, '.col-doi .detail-value'));

	let item;

	search.setHandler("translators", function (obj, translators) {
		search.setTranslator(translators);
		search.setHandler("itemDone", function (obj, lookupItem) {
			item = lookupItem;
			item.creators = [...doc.querySelectorAll('span[itemprop="author"]')]
				.map(span => ZU.cleanAuthor(span.innerText, 'author', true));
			item.title = item.title.replace(/[.,:;]+$/, '');
			item.ISBN = text('.col-isbn .detail-value');
			item.libraryCatalog = item.publisher = text(doc,
				'.site-main-logo span.screen-readers-only'); // localized
			// sometimes there are separate catalogue numbers for the PDF and
			// paper versions, but grabbing the first (PDF) is fine; either one
			// brings up the same document in the catalog.
			item.callNumber = text(doc, '.col-catalogueNumber .detail-value');
			item.abstractNote = text('.visible-description')
				+ ' ' + text('.show-more-description');
			for (let link of pdfLinks) {
				// most documents seem to have 1-3 PDFs for different languages;
				// if there are more languages available, they'll all be bundled
				// together as one file. so downloading all of them shouldn't be
				// overwhelming, and it's better than making assumptions or
				// asking for user input.
				item.attachments.push({
					url: link.href,
					title: `Full Text PDF (${link.dataset.language})`,
					mimeType: "application/pdf"
				});
			}
		});
		search.translate();
	});
	search.setHandler("done", function () {
		item.complete();
	});
	search.setSearch({ DOI });
	search.getTranslators();
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://op.europa.eu/en/publication-detail/-/publication/670d0ea7-5f85-11eb-b487-01aa75ed71a1/language-en/format-PDF/source-210185261",
		"items": [
			{
				"itemType": "book",
				"title": "Housing affordability in Ireland",
				"creators": [
					{
						"lastName": "Directorate-General for Economic and Financial Affairs (European Commission)",
						"creatorType": "author"
					},
					{
						"firstName": "Maria Jose",
						"lastName": "Doval Tedin",
						"creatorType": "author"
					},
					{
						"firstName": "Violaine",
						"lastName": "Faubert",
						"creatorType": "author"
					}
				],
				"date": "2020",
				"ISBN": "9789279773907",
				"abstractNote": "This Economic Brief analyses the main drivers of housing prices in recent years and examines policy options to improve housing affordability. A decade of under-investment following a property crash in 2008 led to a decrease in the housing stock per capita in Ireland. Its composition also became inadequate to meet the increased demand for urban apartments. As a result of persistent housing shortages, house prices grew faster than household income and home affordability worsened, especially for low-income tenants and homebuyers living in and around Dublin. Macroprudential measures have helped curb house price inflation in the owner-occupied sector since 2018. By contrast, prices in the rental sector continued growing to levels well above those prior the 2008 crisis. The evolution of house prices after the COVID-19 pandemic will depend on the speed of the economic recovery. Lower house prices and uncertainty may reduce housing construction and worsen affordability. Increasing housing supply by scaling-up the construction of social housing, reducing the restrictiveness of rent legislation and the relatively high delivery cost of housing could improve affordability. The latter might entail curbing land price inflation, increasing the relatively low productivity of the construction sector and addressing skills shortages. In case of a sluggish recovery following the COVID-19 pandemic, this may be combined with a temporary use of housing subsidies so as to help stabilise house prices and avoid risks in the financial markets.",
				"callNumber": "KC-BE-18-029-EN-N",
				"language": "eng",
				"libraryCatalog": "Publications Office of the European Union",
				"place": "LU",
				"publisher": "Publications Office of the European Union",
				"url": "https://data.europa.eu/doi/10.2765/528723",
				"attachments": [
					{
						"title": "Full Text PDF (en)",
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
		"url": "https://op.europa.eu/en/publication-detail/-/publication/fe6641fd-93fb-11ea-aac4-01aa75ed71a1/language-en",
		"items": [
			{
				"itemType": "book",
				"title": "70th Anniversary of the Schuman Declaration: from the declaration of 9 May 1950 to the European Union",
				"creators": [
					{
						"lastName": "Representation in Luxembourg (European Commission)",
						"creatorType": "author"
					}
				],
				"date": "2020",
				"ISBN": "9789276181743",
				"abstractNote": "The declaration made on 9 May 1950 by Robert Schuman (then French Foreign Minister) truly changed the course of European history. The power of his vision – inspired by his discussions with Jean Monnet – paved the way for a united Europe: an open-ended and constantly evolving process.",
				"callNumber": "ID-03-20-273-EN-N",
				"language": "eng",
				"libraryCatalog": "Publications Office of the European Union",
				"place": "LU",
				"publisher": "Publications Office of the European Union",
				"shortTitle": "70th Anniversary of the Schuman Declaration",
				"url": "https://data.europa.eu/doi/10.2775/777816",
				"attachments": [
					{
						"title": "Full Text PDF (de)",
						"mimeType": "application/pdf"
					},
					{
						"title": "Full Text PDF (en)",
						"mimeType": "application/pdf"
					},
					{
						"title": "Full Text PDF (fr)",
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
