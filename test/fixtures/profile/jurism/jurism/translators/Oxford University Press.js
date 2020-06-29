{
	"translatorID": "e9989043-fcdf-4f33-93b6-0381828aeb41",
	"label": "Oxford University Press",
	"creator": "Jingjing Yin and Qiang Fang",
	"target": "^https?://global\\.oup\\.com/academic/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2017-01-08 15:58:04"
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
	//The url of books contains the ISBN (i.e. 9 digits) where the 
	//url of journals contains the ISSN (i.e. 4 digits).
	if (url.indexOf('/product/')>-1 && url.search(/\d{9}/)>-1) {
		return 'book';
	} else if (getSearchResults(doc, true)) {
		return "multiple";
	}
}


function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = ZU.xpath(doc, '//td[contains(@class, "result_biblio")]//a[contains(@href, "/academic/product/")]');
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
	var item = new Zotero.Item("book");

	var subTitle = doc.getElementsByClassName('product_biblio_strapline')[0];
	item.title = ZU.trimInternal(doc.getElementsByClassName('product_biblio_title')[0].textContent);
	if (subTitle) {
		item.title += ': ' + ZU.trimInternal(subTitle.textContent);
	}
	
	var edition = ZU.xpathText(doc, '//div[@id="overview_tab"]/div[@id="content"]/p[contains(., "Edition")]');
	if (edition) {
		item.edition = edition;
	}

	var creators = ZU.xpath(doc, '//div[@id="content"]/h3[contains(@class, "product_biblio_author")]/b');
	var role = "author";//default
	if (ZU.xpathText(doc, '//div[@id="content"]/h3[contains(@class, "product_biblio_author")]').indexOf("Edited by")>-1) {
		role = "editor";
	}
	for (var i=0; i<creators.length; i++) {
		var creator = creators[i].textContent;
		creator = creator.replace(/^(Prof|Dr)/, '');
		item.creators.push(ZU.cleanAuthor(creator, role));
	}
	
	var date = ZU.xpathText(doc, '//div[contains(@class, "product_sidebar")]/p[starts-with(., "Published:")]');
	if (date) {
		item.date = ZU.strToISO(date);
	}
	
	item.ISBN = ZU.xpathText(doc, '//div[contains(@class, "product_sidebar")]/p[starts-with(., "ISBN:")]');
	
	var pages = ZU.xpathText(doc, '//div[contains(@class, "product_sidebar")]/p[contains(., "Pages")]');
	if (pages) {
		var m = pages.match(/(\d+) Pages/);
		if (m) {
			item.numPages = m[1];
		}
	}
	
	item.series = ZU.xpathText(doc, '(//h3[contains(@class, "product_biblio_series_heading")])[1]');

	item.publisher = "Oxford University Press";
	item.place = "Oxford, New York";

	var abs = ZU.xpathText(doc, '//div[@id="description_tab"]//div[contains(@class, "expanding_content_container_inner_narrow")]');
	if (abs) {
		item.abstractNote = abs;
	}
	
	item.attachments.push({
		title: "Snapshot",
		document: doc
	});
		
	item.complete();
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://global.oup.com/academic/product/flute-time-1-piano-accompaniment-book-9780193221031?cc=de&lang=en&",
		"items": [
			{
				"itemType": "book",
				"title": "Flute Time 1 Piano Accompaniment book",
				"creators": [
					{
						"firstName": "Ian",
						"lastName": "Denley",
						"creatorType": "author"
					}
				],
				"date": "2003-07-24",
				"ISBN": "9780193221031",
				"abstractNote": "Piano accompaniments to selected pieces in Flute Time 1",
				"libraryCatalog": "Oxford University Press",
				"numPages": "32",
				"place": "Oxford, New York",
				"publisher": "Oxford University Press",
				"series": "Flute Time",
				"attachments": [
					{
						"title": "Snapshot"
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
		"url": "https://global.oup.com/academic/product/form-focused-instruction-and-teacher-education-9780194422505?cc=de&lang=en&",
		"items": [
			{
				"itemType": "book",
				"title": "Form-focused Instruction and Teacher Education: Studies in Honour of Rod Ellis",
				"creators": [
					{
						"firstName": "Sandra",
						"lastName": "Fotos",
						"creatorType": "author"
					},
					{
						"firstName": "Hossein",
						"lastName": "Nassaji",
						"creatorType": "author"
					}
				],
				"date": "2007-05-24",
				"ISBN": "9780194422505",
				"abstractNote": "An overview of form-focused instruction as an option for second language grammar teaching. It combines theoretical concerns, classroom practices, and teacher education.",
				"libraryCatalog": "Oxford University Press",
				"numPages": "296",
				"place": "Oxford, New York",
				"publisher": "Oxford University Press",
				"series": "Oxford Applied Linguistics",
				"shortTitle": "Form-focused Instruction and Teacher Education",
				"attachments": [
					{
						"title": "Snapshot"
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
		"url": "https://global.oup.com/academic/product/education-9780198781875?cc=de&lang=en&",
		"items": [
			{
				"itemType": "book",
				"title": "Education: Culture, Economy, and Society",
				"creators": [
					{
						"firstName": "A. H.",
						"lastName": "Halsey",
						"creatorType": "editor"
					},
					{
						"firstName": "Hugh",
						"lastName": "Lauder",
						"creatorType": "editor"
					},
					{
						"firstName": "Phillip",
						"lastName": "Brown",
						"creatorType": "editor"
					},
					{
						"firstName": "Amy Stuart",
						"lastName": "Wells",
						"creatorType": "editor"
					}
				],
				"date": "1997-04-17",
				"ISBN": "9780198781875",
				"abstractNote": "Education: Culture, Economy, and Society is a book for everyone concerned with the social study of education: students studying the sociology of education, foundations of education, educational policy, and other related courses. It aims to establish the social study of education at the centre stage of political and sociological debate about post-industrial societies. In examining major changes which have taken place in the late twentieth century, it gives students a comprehensive introduction to both the nature of these changes and to their interpretation in relation to long-standing debates within education, sociology, and cultural studies.   The extensive editorial introduction outlines the major theoretical approaches within the sociology of education, assesses their contribution to an adequate understanding of the changing educational context, and sets out the key issues and areas for future research. The 52 papers in this wide-ranging thematic reader bring together the most powerful work in education into an international dialogue which is sure to become a classic text.",
				"libraryCatalog": "Oxford University Press",
				"numPages": "848",
				"place": "Oxford, New York",
				"publisher": "Oxford University Press",
				"shortTitle": "Education",
				"attachments": [
					{
						"title": "Snapshot"
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
		"url": "https://global.oup.com/academic/product/computer-law-9780199696468?lang=en&cc=de#",
		"items": [
			{
				"itemType": "book",
				"title": "Computer Law",
				"creators": [
					{
						"firstName": "Chris",
						"lastName": "Reed",
						"creatorType": "author"
					}
				],
				"date": "2011-12-01",
				"ISBN": "9780199696468",
				"abstractNote": "This edition is fully updated to reflect the Digital Economy Act 2010 and changes to consumer protection law at EU level including the Unfair Commercial Practices Directive. Analysis of recent case law is also incorporated including, amongst others, the series of trade mark actions against eBay and copyrights suits against Google as well as the implications for IT contracts of BSkyB Ltd v HP Enterprise Services UK Ltd. All chapters have been revised to take into account the rapid evolution of the ways in which we consume, generate, store and exchange information, such as cloud computing, off-shoring and Web 2.0.Now established as a standard text on computer and information technology law, this book analyses the unique legal problems which arise from computing technology and transactions carried out through the exchange of digital information rather than human interaction. Topics covered range from contractual matters and intellectual property protection to electronic commerce, data protection and liability of internet service providers. Competition law issues are integrated into the various commercial sections as they arise to indicate their interaction with information technology law.",
				"edition": "Seventh Edition",
				"libraryCatalog": "Oxford University Press",
				"numPages": "800",
				"place": "Oxford, New York",
				"publisher": "Oxford University Press",
				"attachments": [
					{
						"title": "Snapshot"
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