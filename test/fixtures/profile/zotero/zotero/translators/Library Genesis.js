{
	"translatorID": "11614156-f421-4e89-8ce0-a5e69ce3ebed",
	"translatorType": 4,
	"label": "Library Genesis",
	"creator": "Reverend Wicks Cherrycoke",
	"target": "^https?://(libgen\\.[a-z]{2}|gen\\.lib\\.rus\\.ec)/",
	"minVersion": "3.0",
	"maxVersion": null,
	"priority": 100,
	"inRepository": true,
	"browserSupport": "gcsi",
	"lastUpdated": "2021-06-11 04:20:00"
}

/*
***** BEGIN LICENSE BLOCK *****

	Copyright © 2016 Rev. Wicks Cherrycoke
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


var MD5_REGEX = /md5=([0-9a-fA-F]+)/;
var AUTHOR_REGEX = /author\s*=\s*{(.*?)}/;


function detectWeb(doc, url) {
	if (url.includes('book/index.php')) {
		return 'book';
	}
	return false;
}

function doWeb(doc, url) {
	var md5Hash = MD5_REGEX.exec(url)[1];

	// To save some work, we use the provided bibtex file to retrieve the
	// metadata and use Zotero's built-in bibtex importer
	var bibtexUrl = "/book/bibtex.php?md5=" + md5Hash;
	ZU.processDocuments(bibtexUrl, function (bibtexDoc) {
		var bibtexStr = bibtexDoc.getElementsByTagName("textarea")[0].value;
		var translator = Zotero.loadTranslator('import');
		translator.setTranslator('9cb70025-a888-4a29-a210-93ec52da40d4');
		translator.setString(bibtexStr);
		translator.setHandler('itemDone', function (obj, item) {
			// The bibtex messes up multiple authors, so we set them ourselves
			var authorStr = AUTHOR_REGEX.exec(bibtexStr)[1];
			if (authorStr.includes(';')) {
				item.creators = authorStr.split(";").map(function (author) {
					// Are we dealing with "last, first" formatting?
					var useCommas = (author.includes(","));
					return ZU.cleanAuthor(author, "author", useCommas);
				});
			}
			else {
				item.creators = authorStr.split(",").map(function (author) {
					return ZU.cleanAuthor(author, "author", false);
				});
			}
			// It also messes up multiple ISBNs, so we just pick the first one
			if (item.ISBN) {
				[' ', ','].forEach(function (splitChar) {
					if (item.ISBN.includes(splitChar)) {
						item.ISBN = item.ISBN.split(splitChar)[0];
					}
				});
			}
			// Add the full text attachment
			/* NOTE: For now this is commented out, pending a decision on how to
					 deal with possibly huge downloads, see issue #1056 for details.
			var MIME_TYPES = {
				pdf: 'application/pdf',
				epub: 'application/epub+zip',
				mobi: 'application/x-mobipocket-ebook',
				djvu: 'image/vnd.djvu'
			};
			var extension = ZU.xpathText(
				doc, '//td[contains(./font/text(), "Extension")]/following-sibling::td');
			var downloadUrl = "/get/" + md5Hash + "/" + md5Hash + "." + extension;
			item.attachments.push({
				title: "Full Text",
				url: downloadUrl,
				mimeType: MIME_TYPES[extension]});
			*/
			item.complete();
		});
		translator.translate();
	});
}


/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://gen.lib.rus.ec/book/index.php?md5=A2560CC676A29BD4B289A2034894AF69",
		"items": [
			{
				"itemType": "book",
				"title": "African ivories",
				"creators": [
					{
						"firstName": "Ezra",
						"lastName": "Kate",
						"creatorType": "author"
					}
				],
				"date": "1984",
				"itemID": "book:882539",
				"libraryCatalog": "Library Genesis",
				"publisher": "The Metropolitan Museum of Art",
				"url": "http://gen.lib.rus.ec/book/index.php?md5=a2560cc676a29bd4b289a2034894af69",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://libgen.rs/book/index.php?md5=664C8F28B54C7166469F54F0D1395D5E",
		"items": [
			{
				"itemType": "book",
				"title": "Disenfranchised: The Rise and Fall of Industrial Citizenship in China",
				"creators": [
					{
						"firstName": "Joel",
						"lastName": "Andreas",
						"creatorType": "author"
					}
				],
				"date": "2019",
				"ISBN": "9780190052614",
				"itemID": "book:2780848",
				"libraryCatalog": "Library Genesis",
				"publisher": "Oxford University Press, USA",
				"shortTitle": "Disenfranchised",
				"url": "http://gen.lib.rus.ec/book/index.php?md5=664C8F28B54C7166469F54F0D1395D5E",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://libgen.rs/book/index.php?md5=3F3AE2E1C6293A4550904E2587FF1441",
		"items": [
			{
				"itemType": "book",
				"title": "Gravity's Rainbow, domination, and freedom",
				"creators": [
					{
						"firstName": "Luc",
						"lastName": "Herman",
						"creatorType": "author"
					},
					{
						"firstName": "Steven",
						"lastName": "Weisenburger",
						"creatorType": "author"
					},
					{
						"firstName": "Thomas",
						"lastName": "Pynchon",
						"creatorType": "author"
					}
				],
				"date": "2013",
				"ISBN": "9780820335087",
				"itemID": "book:1425220",
				"libraryCatalog": "Library Genesis",
				"publisher": "The University of Georgia Press",
				"url": "http://gen.lib.rus.ec/book/index.php?md5=3f3ae2e1c6293a4550904e2587ff1441",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://libgen.rs/book/index.php?md5=8AE55C8664341707B748EADE479C02C1",
		"items": [
			{
				"itemType": "book",
				"title": "Mason & Dixon",
				"creators": [
					{
						"firstName": "Thomas",
						"lastName": "Pynchon",
						"creatorType": "author"
					}
				],
				"date": "1998",
				"ISBN": "9780805058376",
				"itemID": "book:536374",
				"libraryCatalog": "Library Genesis",
				"publisher": "Holt Paperbacks",
				"url": "http://gen.lib.rus.ec/book/index.php?md5=8ae55c8664341707b748eade479c02c1",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://libgen.rs/book/index.php?md5=16C402F4F9B737EA33C4EA5D938331A0",
		"items": [
			{
				"itemType": "book",
				"title": "Nineteen Eighty-Four",
				"creators": [
					{
						"firstName": "George",
						"lastName": "Orwell",
						"creatorType": "author"
					},
					{
						"firstName": "Erich",
						"lastName": "Fromm",
						"creatorType": "author"
					},
					{
						"firstName": "Thomas",
						"lastName": "Pynchon",
						"creatorType": "author"
					},
					{
						"firstName": "Daniel",
						"lastName": "Lagin",
						"creatorType": "author"
					}
				],
				"date": "2003",
				"ISBN": "9780452284234",
				"itemID": "book:266853",
				"libraryCatalog": "Library Genesis",
				"publisher": "Plume",
				"url": "http://gen.lib.rus.ec/book/index.php?md5=16c402f4f9b737ea33c4ea5d938331a0",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://libgen.rs/book/index.php?md5=A05BE4942325AEA362E2AFF8C305B0DE",
		"items": [
			{
				"itemType": "book",
				"title": "Deep Learning [pre-pub version]",
				"creators": [
					{
						"firstName": "Ian",
						"lastName": "Goodfellow",
						"creatorType": "author"
					},
					{
						"firstName": "Yoshua",
						"lastName": "Bengio",
						"creatorType": "author"
					},
					{
						"firstName": "Aaron",
						"lastName": "Courville",
						"creatorType": "author"
					}
				],
				"date": "2016",
				"itemID": "book:1491328",
				"libraryCatalog": "Library Genesis",
				"publisher": "MIT Press",
				"url": "http://gen.lib.rus.ec/book/index.php?md5=a05be4942325aea362e2aff8c305b0de",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://libgen.st/book/index.php?md5=BD4B66472A15D6F0A2BC350A833581C1",
		"items": [
			{
				"itemType": "book",
				"title": "A Short History of Chinese Philosophy",
				"creators": [
					{
						"firstName": "Fung",
						"lastName": "Yu-lan",
						"creatorType": "author"
					},
					{
						"firstName": "Derek",
						"lastName": "Bodde",
						"creatorType": "author"
					}
				],
				"date": "1948",
				"itemID": "book:885016",
				"libraryCatalog": "Library Genesis",
				"publisher": "The Free Press",
				"url": "http://gen.lib.rus.ec/book/index.php?md5=bd4b66472a15d6f0a2bc350a833581c1",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/
