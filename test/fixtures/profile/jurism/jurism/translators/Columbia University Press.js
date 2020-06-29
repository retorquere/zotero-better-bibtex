{
	"translatorID": "a75e0594-a9e8-466e-9ce8-c10560ea59fd",
	"label": "Columbia University Press",
	"creator": "Philipp Zumstein",
	"target": "^https?://(www\\.)?cup\\.columbia\\.edu/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2016-09-10 11:35:07"
}

/*
	***** BEGIN LICENSE BLOCK *****
	
	Copyright © 2016 Philipp Zumstein
	
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
	if (url.indexOf("/book/")>-1) {
		return "book";
	} else if (getSearchResults(doc, true)) {
		return "multiple";
	}
}

function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = ZU.xpath(doc, '//div[contains(@class, "search-list")]//h2/a');
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
	item.title = ZU.xpathText(doc, '//div[contains(@class, "book-header")]/h1[@class="title"]');
	var bookDetails = ZU.xpath(doc, '//div[(contains(@class, "book-header") and contains(@class, "pc-only")) or contains(@class, "book-details")]//p[@class]');
	for (var i=0; i<bookDetails.length; i++) {
		switch (bookDetails[i].className) {
			case "subtitle":
				item.title = item.title + ": " + bookDetails[i].textContent;
				break;
			case "author":
				var creatorString = ZU.trimInternal(bookDetails[i].textContent);
				Z.debug(creatorString);
				var posEditors = creatorString.indexOf("Edited");
				if (posEditors == -1) {
					posEditors = creatorString.length;
				}
				var posTranslators = creatorString.indexOf("Translated");
				if (posTranslators == -1) {
					posTranslators = creatorString.length;
				}
				//assume that editors will be mentioned before translators
				aut = creatorString.substr(0, Math.min(posEditors, posTranslators)).split(/\band\b|,/);
				for (var k=0; k<aut.length; k++) {
					if (aut[k].trim() == "") continue;
					item.creators.push(Zotero.Utilities.cleanAuthor(aut[k], "author"));
				}
				edt = creatorString.substr(posEditors, posTranslators).replace(/Edited (by)?/, "").split(/\band\b|,/);
				for (var k=0; k<edt.length; k++) {
					if (edt[k].trim() == "") continue;
					item.creators.push(Zotero.Utilities.cleanAuthor(edt[k], "editor"));
				}
				tra = creatorString.substr(posTranslators).replace(/Translated (by)?/, "").split(/\band\b|,/);
				for (var k=0; k<tra.length; k++) {
					if (tra[k].trim() == "") continue;
					item.creators.push(Zotero.Utilities.cleanAuthor(tra[k], "translator"));
				}
				break;
			case "pubdate":
				item.date = ZU.strToISO(bookDetails[i].textContent);
				break;
			case "publisher":
				item.publisher =  bookDetails[i].textContent;
				break;
			case "isbn":
				item.ISBN = bookDetails[i].textContent;
				break;
			case "pages":
				item.pages = bookDetails[i].textContent;
				break;
		}
		
	}
	
	//if there is no publisher field, assume it's published by CUP
	if (!item.publisher) {
		item.publisher = "Columbia University Press";
	}
	
	item.abstractNote = ZU.xpathText(doc, '//div[contains(@class, "sp__the-description")]');

	item.complete();
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://cup.columbia.edu/search-results?keyword=islam",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://cup.columbia.edu/book/politics-and-cultures-of-islamization-in-southeast-asia/9783933127815",
		"items": [
			{
				"itemType": "book",
				"title": "Politics and Cultures of Islamization in Southeast Asia: Indonesia and Malaysia in the Nineteen-nineties",
				"creators": [
					{
						"firstName": "Georg",
						"lastName": "Stauth",
						"creatorType": "author"
					}
				],
				"date": "2002-07",
				"ISBN": "9783933127815",
				"abstractNote": "This book is about cultural and political figures, institutions and ideas in a period of transition in two Muslim countries in Southeast Asia, Malaysia and Indonesia. It also addresses some of the permutations of civilizing processes in Singapore and the city-state's image, moving across its borders into the region and representing a miracle of modernity beyond ideas. The central theme is the way in which Islam was re-constructed as an intellectual and socio-political tradition in Southeast Asia in the nineteen-nineties. Scholars who approach Islam both as a textual and local tradition, students who take the heartlands of Islam as imaginative landscapes for cultural transformation and politicians and institutions which have been concerned with transmitting the idea of Islamization are the subjects of this inquiry into different patterns of modernity in a tropical region still bearing the signature of a colonial past.",
				"libraryCatalog": "Columbia University Press",
				"publisher": "Columbia University Press",
				"shortTitle": "Politics and Cultures of Islamization in Southeast Asia",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://cup.columbia.edu/book/religion-and-state/9780231120388",
		"items": [
			{
				"itemType": "book",
				"title": "Religion and State: The Muslim Approach to Politics",
				"creators": [
					{
						"firstName": "L. Carl",
						"lastName": "Brown",
						"creatorType": "author"
					}
				],
				"date": "2001-08",
				"ISBN": "9780231529372",
				"abstractNote": "If Westerners know a single Islamic term, it is likely to be jihad, the Arabic word for \"holy war.\" The image of Islam as an inherently aggressive and xenophobic religion has long prevailed in the West and can at times appear to be substantiated by current events. L. Carl Brown challenges this conventional wisdom with a fascinating historical overview of the relationship between religious and political life in the Muslim world ranging from Islam's early centuries to the present day. Religion and State examines the commonplace notion—held by both radical Muslim ideologues and various Western observers alike—that in Islam there is no separation between religion and politics. By placing this assertion in a broad historical context, the book reveals both the continuities between premodern and modern Islamic political thought as well as the distinctive dimensions of modern Muslim experiences. Brown shows that both the modern-day fundamentalists and their critics have it wrong when they posit an eternally militant, unchanging Islam outside of history. \"They are conflating theology and history. They are confusing the oughtand the is,\" he writes. As the historical record shows, mainstream Muslim political thought in premodern times tended toward political quietism.Brown maintains that we can better understand present-day politics among Muslims by accepting the reality of their historical diversity while at the same time seeking to identify what may be distinctive in Muslim thought and action. In order to illuminate the distinguishing characteristics of Islam in relation to politics, Brown compares this religion with its two Semitic sisters, Judaism and Christianity, drawing striking comparisons between Islam today and Christianity during the Reformation. With a wealth of evidence, he recreates a tradition of Islamic diversity every bit as rich as that of Judaism and Christianity.",
				"libraryCatalog": "Columbia University Press",
				"publisher": "Columbia University Press",
				"shortTitle": "Religion and State",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://cup.columbia.edu/book/islam/9780231126830",
		"items": [
			{
				"itemType": "book",
				"title": "Islam: An Historical Introduction",
				"creators": [
					{
						"firstName": "Gerhard",
						"lastName": "Endress",
						"creatorType": "author"
					},
					{
						"firstName": "Carole",
						"lastName": "Hillenbrand",
						"creatorType": "translator"
					}
				],
				"date": "2003-01",
				"ISBN": "9780231126830",
				"abstractNote": "Hailed as a concise survey of Islamic history and culture, An Introduction to Islam covers everything from Islamic theology and law to the development of the Arabic, Persian, and Turkish languages, from social and economic life in the middle ages to the invention of the Muslim calendar. For the second edition, the text as well as the references and bibliography have been brought up to date.",
				"libraryCatalog": "Columbia University Press",
				"publisher": "Columbia University Press",
				"shortTitle": "Islam",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/