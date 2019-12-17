{
	"translatorID": "f054a3d9-d705-4d2e-a96a-258508bebba3",
	"label": "Wired",
	"creator": "czar",
	"target": "^https?://(www\\.)?wired\\.(com|co\\.uk)",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2018-08-11 14:19:06"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2018 czar
	http://en.wikipedia.org/wiki/User_talk:Czar
	
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


// attr()/text() v2 per https://github.com/zotero/translators/issues/1277
function attr(docOrElem,selector,attr,index){var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector);return elem?elem.getAttribute(attr):null;}function text(docOrElem,selector,index){var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector);return elem?elem.textContent:null;}


function detectWeb(doc, url) {
	if (/\/(\d{4}\/\d{2}|story|article)\//.test(url)) {
		return "magazineArticle";
	} else if (/\/(category|tag|topic)\/|search\/?\?q=|wired\.com\/?$|wired\.co\.uk\/?$/.test(url) && getSearchResults(doc, true)) {
		return "multiple";
	}
}


function scrape(doc, url) {
	var translator = Zotero.loadTranslator('web');
	translator.setTranslator('951c027d-74ac-47d4-a107-9c3069ab7b48'); // embedded metadata
	translator.setDocument(doc);
	
	translator.setHandler('itemDone', function (obj, item) {
		item.itemType = "magazineArticle";
		if (url.includes("wired.co.uk/article")) {
			item.publicationTitle = "Wired UK";
			item.ISSN = "1357-0978";
			item.date = Zotero.Utilities.strToISO(text(doc,'div.a-author__article-date')); // use LSON-LD when implemented in EM
		} else { // if not wired.co.uk
			item.publicationTitle = "Wired";
			item.ISSN = "1059-1028";
			item.date = attr(doc,'meta[name="DisplayDate"], meta[name="parsely-pub-date"]','content');
			item.creators = [];
			var authorMetadata = attr(doc,'meta[name="Author"], meta[name="parsely-author"]','content');
			if (authorMetadata) {
				item.creators.push(ZU.cleanAuthor(authorMetadata, "author"));
			}
			if (item.tags) { // catch volume/issue if in tags
				var match = null;
				for (let tag of item.tags) {
					match = tag.match(/^(\d{2})\.(\d{2})$/);
					if (match) {
						item.volume = match[1];
						item.issue = parseInt(match[2]);
						item.tags.splice(item.tags.indexOf(tag),1);
						break;
					}
				}
			}
		}
		item.complete();
	});
	translator.getTranslatorObject(function(trans) {
		trans.doWeb(doc, url);
	});
}


function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = doc.querySelectorAll('div.card-component h2, li.archive-item-component h2, section.c-card-section article.c-card h3');
	var links = doc.querySelectorAll('.card-component__description > a:first-of-type, li.archive-item-component > a:first-of-type, section.c-card-section article.c-card > a');
	for (let i=0; i<rows.length; i++) {
		let href = links[i].href;
		let title = ZU.trimInternal(rows[i].textContent);
		if (!href || !title) continue;
		if (checkOnly) return true;
		found = true;
		items[href] = title;
	}
	return found ? items : false;
}


function doWeb(doc, url) {
	switch (detectWeb(doc, url)) {
	case "multiple":
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
		break;
	case "magazineArticle":
		scrape(doc, url);
		break;
	}
}
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://www.wired.com/2011/03/ff_kickstarter/",
		"items": [
			{
				"itemType": "magazineArticle",
				"title": "How Kickstarter Became a Lab for Daring Prototypes and Ingenious Products",
				"creators": [
					{
						"firstName": "Carlye",
						"lastName": "Adler",
						"creatorType": "author"
					}
				],
				"date": "2011-03-18",
				"ISSN": "1059-1028",
				"abstractNote": "A group of modern makers kick-started a website for passion projects and patrons.",
				"issue": 4,
				"language": "en-US",
				"libraryCatalog": "www.wired.com",
				"publicationTitle": "Wired",
				"url": "https://www.wired.com/2011/03/ff_kickstarter/",
				"volume": "19",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					{
						"tag": "Kickstarter"
					},
					{
						"tag": "Startups"
					},
					{
						"tag": "features"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.wired.com/story/in-defense-of-the-vegan-hot-dog/",
		"items": [
			{
				"itemType": "magazineArticle",
				"title": "In Defense of the Vegan Hot Dog",
				"creators": [
					{
						"firstName": "Emily",
						"lastName": "Dreyfuss",
						"creatorType": "author"
					}
				],
				"date": "2018-07-04T14:00:00.000Z",
				"ISSN": "1059-1028",
				"abstractNote": "One carnivore's advice: When a tofu dog snuggles up to your tube steak on the grill, don’t be a jerk about it.",
				"libraryCatalog": "www.wired.com",
				"publicationTitle": "Wired",
				"url": "https://www.wired.com/story/in-defense-of-the-vegan-hot-dog/",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					{
						"tag": "Cooking and Recipes"
					},
					{
						"tag": "Food and Drink"
					},
					{
						"tag": "grilling"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.wired.com/tag/kickstarter/",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://www.wired.com/category/culture/",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://www.wired.com/search/?q=kickstarter&page=1&sort=score",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://www.wired.co.uk/article/olafur-eliasson-little-sun-charge",
		"items": [
			{
				"itemType": "magazineArticle",
				"title": "Olafur Eliasson is Kickstarting a solar-powered phone charger",
				"creators": [
					{
						"firstName": "James",
						"lastName": "Temperton",
						"creatorType": "author"
					}
				],
				"date": "2015-09-03",
				"ISSN": "1357-0978",
				"abstractNote": "A high-performance, solar-powered phone charger designed by artist Olafur Eliasson and engineer Frederik Ottesen has raised more than €40,000 (£29,100) on Kickstarter",
				"libraryCatalog": "www.wired.co.uk",
				"publicationTitle": "Wired UK",
				"url": "https://www.wired.co.uk/article/olafur-eliasson-little-sun-charge",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					{
						"tag": "Design"
					},
					{
						"tag": "Smartphones"
					},
					{
						"tag": "Solar Power"
					},
					{
						"tag": "Technology"
					},
					{
						"tag": "Wired Video"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.wired.com/",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://www.wired.co.uk/",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://www.wired.co.uk/topic/culture",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://www.wired.co.uk/search?q=kickstarter",
		"items": "multiple"
	}
];
/** END TEST CASES **/
