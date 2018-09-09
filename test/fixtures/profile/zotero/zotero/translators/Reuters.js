{
	"translatorID": "83979786-44af-494a-9ddb-46654e0486ef",
	"label": "Reuters",
	"creator": "Avram Lyon, Michael Berkowitz, Sebastian Karcher",
	"target": "^https?://\\w+\\.reuters\\.com/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2018-03-05 19:27:07"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Reuters Translator
	Copyright © 2011 Avram Lyon, ajlyon@gmail.com, Sebastian Karcher

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


// attr()/text() v2
function attr(docOrElem,selector,attr,index){var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector);return elem?elem.getAttribute(attr):null;}function text(docOrElem,selector,index){var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector);return elem?elem.textContent:null;}


function detectWeb(doc, url) {
	if (url.includes("/article/")) {
		return "newspaperArticle";
	} else if (url.includes("blogs.reuters.com")) {
	  return "blogPost";
	} else if (url.includes('/search/') && getSearchResults(doc, true)) {
	  return "multiple";
	}
}


function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = doc.querySelectorAll('h3.search-result-title>a');
	for (let i=0; i<rows.length; i++) {
		let href = rows[i].href;
		let title = ZU.trimInternal(rows[i].textContent);
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
	var type = detectWeb(doc, url);
	// copy meta tags in body to head
	var head = doc.getElementsByTagName('head');
	var metasInBody = ZU.xpath(doc, '//body/meta');
	for (var i=0; i<metasInBody.length; i++) {
		head[0].append(metasInBody[i]);
	}
	var translator = Zotero.loadTranslator('web');
	// Embedded Metadata
	translator.setTranslator('951c027d-74ac-47d4-a107-9c3069ab7b48');
	// translator.setDocument(doc);
	
	translator.setHandler('itemDone', function (obj, item) {
		if (detectWeb(doc, url) == "newspaperArticle") {
			item.date = attr(doc, 'meta[name="REVISION_DATE"]', 'content');
			var authors = doc.querySelectorAll('[class*="BylineBar_byline_"] a');
			var byline = ZU.xpathText(doc, '//div[@id="articleInfo"]//p[@class="byline"]');
			for (let i=0; i<authors.length; i++) {
				item.creators.push(authorFix(authors[i].textContent));
			}
			item.publicationTitle = "Reuters";
		}
		if (detectWeb(doc, url) == "blogPost") {
			item.date = text(doc, '#thebyline .timestamp');
			var byline = text(doc, 'div.author');
			if (byline) {
				var authors = byline.split(/and |,/);
				for (let i=0; i<authors.length; i++) {
					item.creators.push(authorFix(authors[i]));
				}
			}
	
			var blogtitle = text(doc, 'h1');
			if (blogtitle) item.publicationTitle = "Reuters Blogs - " + blogtitle;
			else item.publicationTitle = "Reuters Blogs";
		}
		
		if (item.date) {
			item.date = ZU.strToISO(item.date);
		}
		item.place = ZU.xpathText(doc, '//div[@id="articleInfo"]//span[@class="location"]');
		if (item.place) {
			if (item.place == item.place.toUpperCase()) item.place = Zotero.Utilities.capitalizeTitle(item.place.toLowerCase(), true);
		}

		item.complete();
	});

	translator.getTranslatorObject(function(trans) {
		trans.itemType = type;
		trans.doWeb(doc, url);
	});
}


function authorFix(author) {
	// Sometimes we have "By Author"
	author = author.replace(/^\s*by/i, '');

	var cleaned = Zotero.Utilities.cleanAuthor(author, "author");
	// If we have only one name, set the author to one-name mode
	if (cleaned.firstName == "") {
		cleaned["fieldMode"] = true;
	} else {
		// We can check for all lower-case and capitalize if necessary
		// All-uppercase is handled by cleanAuthor
		cleaned.firstName = (cleaned.firstName == cleaned.firstName.toLowerCase()) ? Zotero.Utilities.capitalizeTitle(cleaned.firstName, true) : cleaned.firstName;
		cleaned.lastName = (cleaned.lastName == cleaned.lastName.toLowerCase()) ? Zotero.Utilities.capitalizeTitle(cleaned.lastName, true) : cleaned.lastName;
	}
	return cleaned;
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://www.reuters.com/article/us-eurozone/europe-could-be-in-worst-hour-since-ww2-merkel-idUSTRE7AC15K20111114",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Europe could be in worst hour since WW2: Merkel",
				"creators": [
					{
						"firstName": "James",
						"lastName": "Mackenzie",
						"creatorType": "author"
					},
					{
						"firstName": "Barry",
						"lastName": "Moody",
						"creatorType": "author"
					}
				],
				"date": "2011-11-14",
				"abstractNote": "Prime Minister-designate Mario Monti meets the leaders of Italy's biggest two parties on Tuesday to discuss the \"many sacrifices\" needed to reverse a collapse in market confidence that is driving an ever deepening euro zone debt crisis.",
				"language": "en",
				"libraryCatalog": "www.reuters.com",
				"publicationTitle": "Reuters",
				"shortTitle": "Europe could be in worst hour since WW2",
				"url": "https://www.reuters.com/article/us-eurozone/new-italian-greek-governments-race-to-limit-damage-idUSTRE7AC15K20111114",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					{
						"tag": "Angela Merkel"
					},
					{
						"tag": "Angela Merkel"
					},
					{
						"tag": "Angela Merkel"
					},
					{
						"tag": "Antonis Samaras"
					},
					{
						"tag": "Antonis Samaras"
					},
					{
						"tag": "Debt / Fixed Income Markets"
					},
					{
						"tag": "Diplomacy / Foreign Policy"
					},
					{
						"tag": "EUROZONE"
					},
					{
						"tag": "Economic Events"
					},
					{
						"tag": "Euro Zone as a Whole"
					},
					{
						"tag": "Europe"
					},
					{
						"tag": "European Union"
					},
					{
						"tag": "George Papandreou"
					},
					{
						"tag": "George Papandreou"
					},
					{
						"tag": "Germany"
					},
					{
						"tag": "Germany"
					},
					{
						"tag": "Germany"
					},
					{
						"tag": "Giorgio Napolitano"
					},
					{
						"tag": "Government / Politics"
					},
					{
						"tag": "Government Finances"
					},
					{
						"tag": "Greece"
					},
					{
						"tag": "Greece"
					},
					{
						"tag": "Greece"
					},
					{
						"tag": "Harry Papachristou"
					},
					{
						"tag": "Harry Papachristou"
					},
					{
						"tag": "Italy"
					},
					{
						"tag": "Italy"
					},
					{
						"tag": "Italy"
					},
					{
						"tag": "Jack Ablin"
					},
					{
						"tag": "Jens Weidmann"
					},
					{
						"tag": "Jens Weidmann"
					},
					{
						"tag": "Kai Pfaffenbach"
					},
					{
						"tag": "Kai Pfaffenbach"
					},
					{
						"tag": "Lucas Papademos"
					},
					{
						"tag": "Lucas Papademos"
					},
					{
						"tag": "Mario Monti"
					},
					{
						"tag": "Mario Monti"
					},
					{
						"tag": "National Government Debt"
					},
					{
						"tag": "Olli Rehn"
					},
					{
						"tag": "Olli Rehn"
					},
					{
						"tag": "Philip Pullella"
					},
					{
						"tag": "Philip Pullella"
					},
					{
						"tag": "Silvio Berlusconi"
					},
					{
						"tag": "Silvio Berlusconi"
					},
					{
						"tag": "US"
					},
					{
						"tag": "Western Europe"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://blogs.reuters.com/lawrencesummers/2012/03/26/its-too-soon-to-return-to-normal-policies/",
		"items": [
			{
				"itemType": "blogPost",
				"title": "It’s too soon to return to normal policies",
				"creators": [
					{
						"firstName": "Lawrence",
						"lastName": "Summers",
						"creatorType": "author"
					}
				],
				"date": "2012-03-26",
				"abstractNote": "After years when the risks to the consensus modest-growth forecast were to the downside, they are now very much two-sided.",
				"blogTitle": "Reuters Blogs",
				"url": "http://blogs.reuters.com/lawrencesummers/2012/03/26/its-too-soon-to-return-to-normal-policies/",
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
		"url": "https://www.reuters.com/search/news?blob=europe",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://de.reuters.com/article/deutschland-koalition-csu-idDEKBN1GH2GW",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "CSU besetzt Ministerien nur mit Männern",
				"creators": [],
				"date": "2018-03-05",
				"abstractNote": "Die CSU schickt anders als ihre Koalitionspartner CDU und SPD ausschließlich Männer an die Spitze der ihr zustehenden Bundesministerien.",
				"language": "de",
				"libraryCatalog": "de.reuters.com",
				"publicationTitle": "Reuters",
				"url": "https://de.reuters.com/article/deutschland-koalition-csu-idDEKBN1GH2GW",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					{
						"tag": "Africa"
					},
					{
						"tag": "Auto and Truck Manufacturers (TRBC)"
					},
					{
						"tag": "CSU"
					},
					{
						"tag": "Conflicts / War / Peace"
					},
					{
						"tag": "DEUTSCHLAND"
					},
					{
						"tag": "Elections / Voting"
					},
					{
						"tag": "Euro Zone"
					},
					{
						"tag": "Europe"
					},
					{
						"tag": "General"
					},
					{
						"tag": "German Language"
					},
					{
						"tag": "Germany"
					},
					{
						"tag": "Government / Politics"
					},
					{
						"tag": "International / National Security"
					},
					{
						"tag": "Internet / World Wide Web"
					},
					{
						"tag": "KOALITION"
					},
					{
						"tag": "Science"
					},
					{
						"tag": "Technology / Media / Telecoms"
					},
					{
						"tag": "Western Europe"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/
