{
	"translatorID": "6871e8c5-f935-4ba1-8305-0ba563ce3941",
	"label": "PEI Archival Information Network",
	"creator": "Philipp Zumstein",
	"target": "^https?://www\\.archives\\.pe\\.ca/atom/index\\.php/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2017-01-22 15:45:20"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2017 Philipp Zumstein

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
	if (url.indexOf('search?')>-1 && getSearchResults(doc, true)) {
		return "multiple";
	} else if (ZU.xpathText(doc, '//section[@id="action-icons" and contains(., "Dublin Core")]')){
		return "journalArticle";
	} 
}


function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = ZU.xpath(doc, '//article[contains(@class, "search-result")]//a');
	for (var i=0; i<rows.length; i++) {
		var href = rows[i].href;
		var title = ZU.trimInternal(rows[i].textContent);
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
				return true;
			}
			var articles = [];
			for (var i in items) {
				articles.push(i);
			}
			ZU.processDocuments(articles, scrape);
		});
	} else {
		scrape(doc, url);
	}
}


function scrape(doc, url) {
	//Somehow it is important to switch here also to English in the
	//parameter, because otherwise it will not work when the original
	//website is viewed in French.
	var urlRDF = url.split(';')[0] + ";dc?sf_culture=en&sf_format=xml";
	
	ZU.doGet(urlRDF, function(text) {
		var parser = new DOMParser();
		var xml = parser.parseFromString(text, "text/xml");
		//call RDF translator
		var translator = Zotero.loadTranslator("import");
		translator.setTranslator("5e3ad958-ac79-463d-812b-a86a9235c28f");
		translator.setString(text);
		translator.setHandler('itemDone', function (obj, item) {
			var identifiers = xml.getElementsByTagNameNS('http://purl.org/dc/elements/1.1/', 'identifier');
			var value;
			for (var i=0; i<identifiers.length; i++) {
				value = identifiers[i].textContent;
				if (value.indexOf('http')>-1) {
					item.url = value;
				}
				if (value.indexOf('Acc')>-1) {
					item.callNumber = value;
				}
			}
			var format = xml.getElementsByTagNameNS('http://purl.org/dc/elements/1.1/', 'format');
			if (format) {
				item.notes.push({note: "Format: " + format[0].textContent});
			}
			if (item.abstractNote) {
				item.abstractNote = ZU.unescapeHTML(item.abstractNote);
			}
			if (item.rights) {
				item.rights = item.rights.toLowerCase();
			}
			delete item.itemID;//otherwise this will show up as difference in testing
			item.complete();
		});
		translator.translate();
	});
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.archives.pe.ca/atom/index.php/charlottetown-gas-light-company-fonds",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Charlottetown Gas Light Company fonds",
				"creators": [
					{
						"firstName": "Charlottetown Gas Light",
						"lastName": "Company",
						"creatorType": "author"
					}
				],
				"date": "1855-1858, 1870, 1896",
				"abstractNote": "This fonds consists of a day book of the Charlottetown Gas Light Company spanning the years 1855-1858.  Information includes the date, the amount of cash received for gas light services, the name of the client, the amount of wages made to employees, and various other financial transactions of the company.   Also in the fonds are three share certificates from the company, one dated 1870 and two dated 1896.",
				"callNumber": "Acc2286",
				"language": "eng",
				"libraryCatalog": "PEI Archival Information Network",
				"rights": "no restrictions on access",
				"url": "http://www.archives.pe.ca/atom/index.php/charlottetown-gas-light-company-fonds",
				"attachments": [],
				"tags": [
					"Charlottetown Gas Light Company",
					"Corporations",
					"Day books",
					"Gas lighting"
				],
				"notes": [
					{
						"note": "Format: .03 m of textual records"
					}
				],
				"seeAlso": [
					"http://www.archives.pe.ca/atom/index.php/public-archives-and-records-office-of-prince-edward-island",
					"Public Archives and Records Office of Prince Edward Island"
				]
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.archives.pe.ca/atom/index.php/carrie-holman-collection",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Carrie Holman collection",
				"creators": [
					{
						"firstName": "Carrie Ellen",
						"lastName": "Holman",
						"creatorType": "author"
					}
				],
				"date": "1895-1972",
				"abstractNote": "The majority of the collection consists of records relating to Carrie Holman.  A scrapbook of newspaper clippings of her radio broadcasts (1948), newspaper clippings (1927-1948, 1968-1972), and correspondence (1937-1971) consisting of letters and telegrams to Carrie make up the majority of the collection.  Papers belonging to Gladys Holman, including a coronation medal and certificate commemorating the silver jubilee of George V and Queen Mary (1935), George Vl and Queen Elizabeth (1937), and Queen Elizabeth ll (1953), as well as a graduation photograph of Carrie are also contained in the collection.",
				"callNumber": "Acc2626",
				"language": "eng",
				"libraryCatalog": "PEI Archival Information Network",
				"rights": "no restrictions on access",
				"url": "http://www.archives.pe.ca/atom/index.php/carrie-holman-collection",
				"attachments": [],
				"tags": [
					"Radio broadcasting",
					"Royalty"
				],
				"notes": [
					{
						"note": "Format: .06 m of textual records\n1 photograph"
					}
				],
				"seeAlso": [
					"http://www.archives.pe.ca/atom/index.php/public-archives-and-records-office-of-prince-edward-island",
					"Public Archives and Records Office of Prince Edward Island"
				]
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.archives.pe.ca/atom/index.php/medal-commemorating-xiith-international-congress-on-archives-xiie-congres-international-des-archives-montreal;rad?sf_culture=fr",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Medal commemorating XIIth International Congress on Archives / XIIe Congres- International des Archives, Montreal",
				"creators": [
					{
						"firstName": "International Council on",
						"lastName": "Archives",
						"creatorType": "author"
					}
				],
				"date": "September 1992",
				"abstractNote": "The fonds consists of a medal commemorating the Twelfth Congress of the International Council on Archives, a suede pouch, and a plastic stand. The congress was held from the 7-11 September 1992 in Montreal, Canada. The theme of the congress was \"The Profession of the Archivist in the Information Age\".",
				"callNumber": "Acc4281",
				"libraryCatalog": "PEI Archival Information Network",
				"rights": "no restrictions on access",
				"url": "http://www.archives.pe.ca/atom/index.php/medal-commemorating-xiith-international-congress-on-archives-xiie-congres-international-des-archives-montreal",
				"attachments": [],
				"tags": [
					"Archives - Conferences and conventions",
					"International Congress on Archives, XII, Montreal, 1992"
				],
				"notes": [
					{
						"note": "Format: 1 medal"
					}
				],
				"seeAlso": [
					"http://www.archives.pe.ca/atom/index.php/public-archives-and-records-office-of-prince-edward-island",
					"Public Archives and Records Office of Prince Edward Island"
				]
			}
		]
	}
]
/** END TEST CASES **/
