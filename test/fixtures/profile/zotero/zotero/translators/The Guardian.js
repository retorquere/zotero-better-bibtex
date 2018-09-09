{
	"translatorID": "8e11559d-60f0-4a7f-bb91-99ac0c5a2d63",
	"label": "The Guardian",
	"creator": "Philipp Zumstein",
	"target": "^https?://(www\\.)?(guardian\\.co\\.uk|theguardian\\.com)",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2018-08-11 14:15:22"
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
	if (ZU.xpathText(doc, '//div[contains(@class, "content__main-column")]//h1')) {
		return "newspaperArticle";
	} else if (getSearchResults(doc, true)) {
		return "multiple";
	}
}

function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = ZU.xpath(doc, '//a[@data-link-name="article"]');
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
	var translator = Zotero.loadTranslator('web');
	// Embedded Metadata
	translator.setTranslator('951c027d-74ac-47d4-a107-9c3069ab7b48');
	//translator.setDocument(doc);
	
	translator.setHandler('itemDone', function (obj, item) {
		//The authors in the metadata are incomplete and are not cleaned,
		//but contain unneccessary data about location etc.
		//Thus we try to take them directly from the byline.
		var byline = ZU.xpathText(doc, '//p[contains(@class, "byline")]');
		if (byline) {
			item.creators = [];
			var authors = byline.replace(/\s(in|for)\s.+/, '').split(/\s+and\s+|\s*,\s*/);
			for (var i=0; i<authors.length; i++) {
				item.creators.push(ZU.cleanAuthor(authors[i], "author"));
			}
		}
		item.language = "en-GB";
		// og:url does not preserve https prefixes, so use canonical link until fixed
		var canonical = doc.querySelector('link[rel="canonical"]');
		if (canonical) {
			item.url = canonical.href;
		}
		var serie = ZU.xpathText(doc, '(//a[contains(@class, "content__label__link")])[1]');
		if (serie=="The Observer") {
			item.publicationTitle = "The Observer";
			item.ISSN = "0029-7712";
		} else {
			item.publicationTitle = "The Guardian";
			item.ISSN = "0261-3077";
		}
		item.complete();
	});

	translator.getTranslatorObject(function(trans) {
		trans.itemType = "newspaperArticle";
		trans.doWeb(doc, url);
	});
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://www.theguardian.com/world/2013/mar/05/hugo-chavez-dies-cuba",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Venezuela begins seven days of mourning following death of Hugo Chávez",
				"creators": [
					{
						"firstName": "Jonathan",
						"lastName": "Watts",
						"creatorType": "author"
					},
					{
						"firstName": "Virginia",
						"lastName": "Lopez",
						"creatorType": "author"
					}
				],
				"date": "2013-03-06T15:38:00.000Z",
				"ISSN": "0261-3077",
				"abstractNote": "Death comes 21 months after it was revealed he had a tumour, and he will be given a state funeral in the capital",
				"language": "en-GB",
				"libraryCatalog": "www.theguardian.com",
				"publicationTitle": "The Guardian",
				"section": "World news",
				"url": "https://www.theguardian.com/world/2013/mar/05/hugo-chavez-dies-cuba",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					{
						"tag": "Americas"
					},
					{
						"tag": "Hugo Chávez"
					},
					{
						"tag": "Venezuela"
					},
					{
						"tag": "World news"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.theguardian.com/world/2013/mar/06/pentagon-iraqi-torture-centres-link",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Revealed: Pentagon's link to Iraqi torture centres",
				"creators": [
					{
						"firstName": "Mona",
						"lastName": "Mahmood",
						"creatorType": "author"
					},
					{
						"firstName": "Maggie",
						"lastName": "O'Kane",
						"creatorType": "author"
					},
					{
						"firstName": "Chavala",
						"lastName": "Madlena",
						"creatorType": "author"
					},
					{
						"firstName": "Teresa",
						"lastName": "Smith",
						"creatorType": "author"
					}
				],
				"date": "2013-03-06T20:04:00.000Z",
				"ISSN": "0261-3077",
				"abstractNote": "Exclusive: General David Petraeus and 'dirty wars' veteran behind commando units implicated in detainee abuse See the full-length documentary film of the 15-month investigation",
				"language": "en-GB",
				"libraryCatalog": "www.theguardian.com",
				"publicationTitle": "The Guardian",
				"section": "World news",
				"shortTitle": "Revealed",
				"url": "https://www.theguardian.com/world/2013/mar/06/pentagon-iraqi-torture-centres-link",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					{
						"tag": "Americas"
					},
					{
						"tag": "David Petraeus"
					},
					{
						"tag": "El Salvador"
					},
					{
						"tag": "Iraq"
					},
					{
						"tag": "Middle East and North Africa"
					},
					{
						"tag": "Nicaragua"
					},
					{
						"tag": "Torture"
					},
					{
						"tag": "US foreign policy"
					},
					{
						"tag": "US military"
					},
					{
						"tag": "US news"
					},
					{
						"tag": "World news"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.theguardian.com/world/2013/feb/26/football-heaven-god-play?INTCMP=SRCH",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Is there football in heaven?",
				"creators": [
					{
						"firstName": "Percy",
						"lastName": "Zvomuya",
						"creatorType": "author"
					}
				],
				"date": "2013-02-26T17:18:55.000Z",
				"ISSN": "0261-3077",
				"abstractNote": "If there is, does God himself play? And if he does, what position, asks Percy Zvomuya?",
				"language": "en-GB",
				"libraryCatalog": "www.theguardian.com",
				"publicationTitle": "The Guardian",
				"section": "World news",
				"url": "https://www.theguardian.com/world/2013/feb/26/football-heaven-god-play",
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
						"tag": "Eric Cantona"
					},
					{
						"tag": "Football"
					},
					{
						"tag": "George Best"
					},
					{
						"tag": "Religion"
					},
					{
						"tag": "South Africa"
					},
					{
						"tag": "World news"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.theguardian.com/media/2015/feb/18/peter-oborne-daily-telegraph-newspaper-unprecedented",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Peter Oborne: what I have seen is unprecedented in a quality newspaper",
				"creators": [
					{
						"firstName": "Archie",
						"lastName": "Bland",
						"creatorType": "author"
					}
				],
				"date": "2015-02-18T20:22:30.000Z",
				"ISSN": "0261-3077",
				"abstractNote": "The political commentator talks about the response to his attack on the Daily Telegraph, his hopes for the future of the paper – and why the distinction between deer hunting and deer stalking matters",
				"language": "en-GB",
				"libraryCatalog": "www.theguardian.com",
				"publicationTitle": "The Guardian",
				"section": "Media",
				"shortTitle": "Peter Oborne",
				"url": "https://www.theguardian.com/media/2015/feb/18/peter-oborne-daily-telegraph-newspaper-unprecedented",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					{
						"tag": "Barclay Brothers"
					},
					{
						"tag": "Daily Telegraph"
					},
					{
						"tag": "Media"
					},
					{
						"tag": "Murdoch MacLennan"
					},
					{
						"tag": "National newspapers"
					},
					{
						"tag": "Newspapers"
					},
					{
						"tag": "Newspapers & magazines"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.theguardian.com/books/2011/nov/27/christmas-gifts-2011-books-tree",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Christmas gifts 2011: which books will be under your tree?",
				"creators": [],
				"date": "2011-11-27T00:05:08.000Z",
				"ISSN": "0029-7712",
				"abstractNote": "Our critics choose the books they intend to give this Christmas, and the ones they hope to receive",
				"language": "en-GB",
				"libraryCatalog": "www.theguardian.com",
				"publicationTitle": "The Observer",
				"section": "Books",
				"shortTitle": "Christmas gifts 2011",
				"url": "https://www.theguardian.com/books/2011/nov/27/christmas-gifts-2011-books-tree",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					{
						"tag": "Alan Hollinghurst"
					},
					{
						"tag": "Art and design books"
					},
					{
						"tag": "Best books of the year"
					},
					{
						"tag": "Biography books"
					},
					{
						"tag": "Books"
					},
					{
						"tag": "Business and finance books"
					},
					{
						"tag": "Caitlin Moran"
					},
					{
						"tag": "Charles Dickens"
					},
					{
						"tag": "Christopher Hitchens"
					},
					{
						"tag": "Comics and graphic novels"
					},
					{
						"tag": "Culture"
					},
					{
						"tag": "Fiction"
					},
					{
						"tag": "Food and drink books"
					},
					{
						"tag": "Health"
					},
					{
						"tag": "History books"
					},
					{
						"tag": "Julian Barnes"
					},
					{
						"tag": "Magazines"
					},
					{
						"tag": "Magnum"
					},
					{
						"tag": "Poetry"
					},
					{
						"tag": "Private Eye"
					},
					{
						"tag": "Robert Harris"
					},
					{
						"tag": "Science and nature books"
					},
					{
						"tag": "Thrillers"
					},
					{
						"tag": "Tina Fey"
					},
					{
						"tag": "mind and body books"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.theguardian.com/books/2018/may/27/bullshit-jobs-a-theory-david-graeber-review-laboured-rant",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Bullshit Jobs: A Theory review – laboured rant about the world of work",
				"creators": [
					{
						"firstName": "Andrew",
						"lastName": "Anthony",
						"creatorType": "author"
					}
				],
				"date": "2018-05-27T08:00:20.000Z",
				"ISSN": "0029-7712",
				"abstractNote": "David Graeber’s snarky study of the meaningless nature of modern employment adds little to our understanding of it",
				"language": "en-GB",
				"libraryCatalog": "www.theguardian.com",
				"publicationTitle": "The Observer",
				"section": "Books",
				"shortTitle": "Bullshit Jobs",
				"url": "https://www.theguardian.com/books/2018/may/27/bullshit-jobs-a-theory-david-graeber-review-laboured-rant",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					{
						"tag": "Books"
					},
					{
						"tag": "Culture"
					},
					{
						"tag": "Economics"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/
