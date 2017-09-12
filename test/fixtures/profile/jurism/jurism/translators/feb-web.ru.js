{
	"translatorID": "e92c8359-c3fc-468b-bc6a-107b2744fd17",
	"label": "feb-web.ru",
	"creator": "Avram Lyon",
	"target": "^https?://(www\\.)?feb-web\\.ru/.*cmd=2",
	"minVersion": "1.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2017-01-01 16:09:57"
}

/*
   FEB-WEB Translator
   Copyright (C) 2011 Avram Lyon, ajlyon@gmail.com

   This program is free software: you can redistribute it and/or modify
   it under the terms of the GNU Affero General Public License as published by
   the Free Software Foundation, either version 3 of the License, or
   (at your option) any later version.

   This program is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   GNU Affero General Public License for more details.

   You should have received a copy of the GNU Affero General Public License
   along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

function detectWeb(doc, url) {
	return "bookSection";
}

function doWeb(doc, url) {
	url = url.replace(/\?.*/,'');
	ZU.processDocuments([url + "?cmd=1!"], function (cDoc) {
		var cite = ZU.xpath(cDoc, "//body/p");
		if (!cite) return;
		
		var item = new Zotero.Item("bookSection");
		var authorPieces = ZU.xpathText(cite[0], "./em").split(" ");
		item.creators.push({
			"creatorType": "author",
			"lastName": authorPieces.shift(),
			"firstName": authorPieces.join(" ")
		});
		
		item.title = ZU.xpathText(cite[0], "./b[1]");

		var rem = ZU.xpathText(cite[0], "./b[1]/following-sibling::text()|./b[1]/following-sibling::b");
		//Z.debug(rem);
		var matches = rem.match(/(\s*\/\/\s*[А-Я][а-я]+ [А-Я][а-я]?. [А-Я][а-я]?.\s+)?([А-Я][^—]*)?—\s*([А-Яа-яa-zA-Z;. -]+):\s+([А-Яа-яA-Za-z -.,]+)[, ]+([0-9—]{4,9})/);
		if (matches) {
			item.bookTitle = matches[2];
			item.place = matches[3];
			item.publisher = matches[4].replace(/,\s*$/,'');
			item.date = matches[5];
		}
		
		if (cite.length > 1) {
			item.volume = ZU.xpathText(cite[1], "./table/preceding-sibling::b/preceding-sibling::text()").replace(/\.?\s*—?\s*$/,'').replace(/^\s*Т.\s*/,'');
			var newdate = ZU.xpathText(cite[1], "./table/preceding-sibling::b[1]");
			item.pages = ZU.xpathText(cite[1], "./table/preceding-sibling::b/following-sibling::text()").replace(/^\s*[—. ]*\s*(.*)[\n\t, ]*$/,'$1').replace(/[Сс. ]/g,'').replace(/—/g,'-');
			if (newdate && newdate != "") item.date = newdate;
		}
		
		if (item.bookTitle) {
			var numVols = item.bookTitle.match(/В (\d+)-?х? тт?(?:ома)?х?\.?/);
			if (numVols) item.numberOfVolumes = numVols[1];
		}

		item.libraryCatalog = "Фундаментальная электронная библиотека";
		
		item.attachments.push({document: doc, title:"Полный текст"});
		item.attachments.push({url: url, title:"Адрес ресурса", snapshot:false});
		
		item.complete();
		
	}, function () { Zotero.done() });
	Zotero.wait();
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://feb-web.ru/feb/boratyn/texts/br2/br22003-.htm?cmd=2#%D0%A2%D0%B5%D0%BA%D1%81%D1%82",
		"items": [
			{
				"itemType": "bookSection",
				"creators": [
					{
						"creatorType": "author",
						"lastName": "Баратынский",
						"firstName": "Е. А. "
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"document": false,
						"title": "Полный текст"
					},
					{
						"url": false,
						"title": "Адрес ресурса",
						"snapshot": false
					}
				],
				"title": "Эда",
				"bookTitle": "Полное собрание стихотворений: В 2 т.",
				"place": "Л.",
				"publisher": "Сов. писатель",
				"date": "1936",
				"volume": "2",
				"pages": "3-23",
				"numberOfVolumes": "2",
				"libraryCatalog": "Фундаментальная электронная библиотека"
			}
		]
	},
	{
		"type": "web",
		"url": "http://feb-web.ru/feb/lermont/texts/lerm05/vol02/l522015-.htm?cmd=2",
		"items": [
			{
				"itemType": "bookSection",
				"creators": [
					{
						"creatorType": "author",
						"lastName": "Лермонтов",
						"firstName": "М. Ю. "
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"document": false,
						"title": "Полный текст"
					},
					{
						"url": false,
						"title": "Адрес ресурса",
						"snapshot": false
					}
				],
				"title": "Смерть поэта",
				"bookTitle": "Полное собрание сочинений: В 5 т.",
				"place": "М.; Л.",
				"publisher": "Academia",
				"date": "1936",
				"volume": "2. Стихотворения, 1836—1841",
				"pages": "15-17",
				"numberOfVolumes": "5",
				"libraryCatalog": "Фундаментальная электронная библиотека"
			}
		]
	}
]
/** END TEST CASES **/