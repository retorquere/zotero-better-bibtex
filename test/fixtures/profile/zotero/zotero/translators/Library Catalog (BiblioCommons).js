{
	"translatorID": "5d506fe3-dbde-4424-90e8-d219c63faf72",
	"translatorType": 4,
	"label": "Library Catalog (BiblioCommons)",
	"creator": "Avram Lyon and Abe Jellinek",
	"target": "^https?://[^/]+\\.bibliocommons\\.com/",
	"minVersion": "2.1",
	"maxVersion": null,
	"priority": 250,
	"inRepository": true,
	"browserSupport": "gcsibv",
	"lastUpdated": "2021-05-26 17:00:00"
}

/*
	***** BEGIN LICENSE BLOCK *****

	BiblioCommons Translator
	Copyright © 2021 Avram Lyon <ajlyon@gmail.com> and Abe Jellinek

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
	if (url.match(/\/v2\/record\//)) {
		return "book";
	}
	if (url.match(/\/v2\/search\?[^/]*query=/)) {
		return "multiple";
	}
	return false;
}

function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = doc.querySelectorAll('h2.cp-title > a[href*="/item/show"]');
	for (let row of rows) {
		let href = row.href;
		let title = ZU.trimInternal(text(row, '.title-content'));
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

function scrape(doc, url) {
	let item = new Zotero.Item();
	item.libraryCatalog = attr(doc, 'meta[property="og:site_name"]', 'content');
	
	let recordUrl = url.endsWith('/originalrecord') ? url : url + '/originalrecord';
	ZU.processDocuments(recordUrl, function (marcDoc) {
		if (!marcDoc.querySelector('.bib-item-row')) {
			// a small number of items don't have MARC data
			// in that case, we just do our best
			Z.debug("No MARC data");
			
			item.itemType = 'book';
			item.title = text(doc, '.cp-bib-title span[aria-hidden]');
			let subtitle = text(doc, '.cp-bib-subtitle');
			if (subtitle) {
				item.title += ": " + subtitle;
			}
			let authors = doc.querySelectorAll('.main-info .cp-bib-authors span[aria-hidden]');
			for (let author of authors) {
				item.creators.push(ZU.cleanAuthor(author.innerText, "author", true));
			}
			let bibFields = doc.querySelectorAll('.cp-bib-field');
			for (let bibField of bibFields) {
				if (text(bibField, '.cp-bib-field-label').includes("Publication")) {
					let value = text(bibField, '.main-content').split(', ');
					item.publisher = value[0];
					item.date = value[1];
				}
			}
			
			let isbnMatches = text(doc, 'script[data-iso-key="_0"]')
				.match(/"values":\["([0-9]{10}|[0-9]{13})"\]/);
			let isbn = isbnMatches && isbnMatches[1];
			if (isbn) {
				item.ISBN = ZU.cleanISBN(isbn);
			}
			item.complete();
			
			return;
		}
		
		// Load MARC
		let translator = Z.loadTranslator("import");
		translator.setTranslator("a6ee60df-1ddc-4aae-bb25-45e0537be973");
		
		translator.getTranslatorObject(function (marc) {
			let record = new marc.record();
			for (let row of marcDoc.querySelectorAll('.bib-item-row')) {
				record.addField(text(row, '.tag'), text(row, '.indicator'), row.lastChild.innerText.replace(/\$/g, '\x1F'));
			}
			record.translate(item);
			item.complete();
		});
	});
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://bostonpl.bibliocommons.com/v2/record/S75C2051015",
		"items": [
			{
				"itemType": "book",
				"title": "Labor",
				"creators": [
					{
						"firstName": "Marcia McKenna",
						"lastName": "Biddle",
						"creatorType": "author"
					}
				],
				"date": "1979",
				"ISBN": "9780875181677",
				"abstractNote": "Brief biographies of five women prominently involved in the labor movement in the United States: Mother Jones, Mary Heaton Vorse, Frances Perkins, Addie Wyatt, and Dolores Huerta. Also includes 11 other women who have made outstanding contributions",
				"callNumber": "HD6079.2.U5 B52",
				"libraryCatalog": "Boston Public Library",
				"numPages": "126",
				"place": "Minneapolis",
				"publisher": "Dillon Press",
				"series": "Contributions of women",
				"attachments": [],
				"tags": [
					{
						"tag": "Biography Juvenile literature"
					},
					{
						"tag": "Biography Juvenile literature"
					},
					{
						"tag": "Juvenile biography"
					},
					{
						"tag": "Juvenile literature"
					},
					{
						"tag": "United States"
					},
					{
						"tag": "United States"
					},
					{
						"tag": "Women"
					},
					{
						"tag": "Women labor union members"
					},
					{
						"tag": "Women labor union members"
					},
					{
						"tag": "Working class"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://bostonpl.bibliocommons.com/v2/search?query=labor&searchType=smart",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://markham.bibliocommons.com/v2/record/S34C297846",
		"items": [
			{
				"itemType": "book",
				"title": "The raven",
				"creators": [
					{
						"firstName": "Edgar Allan",
						"lastName": "Poe",
						"creatorType": "author"
					},
					{
						"firstName": "Ryan",
						"lastName": "Price",
						"creatorType": "author"
					}
				],
				"date": "2006",
				"ISBN": "9781553374732",
				"abstractNote": "An illustrated version of Edgar Allan Poe's poem",
				"callNumber": "J 811.3 Poe 9254tc",
				"libraryCatalog": "Markham Public Library",
				"numPages": "1",
				"place": "Toronto",
				"publisher": "Kids Can Press",
				"series": "Visions in poetry",
				"attachments": [],
				"tags": [
					{
						"tag": "Fantasy poetry, American"
					},
					{
						"tag": "Poetry"
					},
					{
						"tag": "Ravens"
					}
				],
				"notes": [
					{
						"note": "\"KCP Poetry.\""
					}
				],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/
