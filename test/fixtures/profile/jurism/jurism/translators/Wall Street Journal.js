{
	"translatorID": "53f8d182-4edc-4eab-b5a1-141698a1303b",
	"label": "Wall Street Journal",
	"creator": "Philipp Zumstein",
	"target": "^https?://(online|blogs|www)?\\.wsj\\.com/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2019-06-23 22:38:11"
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
	if (url.includes('blogs.wsj.com')) {
		return "blogPost";
	}
	else if (url.includes('articles')) {
		return "newspaperArticle";
	}
	else if (getSearchResults(doc, true)) {
		return "multiple";
	}
	return false;
}

function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = ZU.xpath(doc, '//h3[contains(@class, "headline")]/a');
	for (var i = 0; i < rows.length; i++) {
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
			if (!items) return;

			var articles = [];
			for (var i in items) {
				articles.push(i);
			}
			ZU.processDocuments(articles, scrape);
		});
	}
	else {
		scrape(doc, url);
	}
}


function scrape(doc, url) {
	var translator = Zotero.loadTranslator('web');
	var type = detectWeb(doc, url);
	// Embedded Metadata
	translator.setTranslator('951c027d-74ac-47d4-a107-9c3069ab7b48');
	translator.setHandler('itemDone', function (obj, item) {
		item.ISSN = "0099-9660";
		item.language = "en-US";
		if (type == "newspaperArticle") {
			item.publicationTitle = "Wall Street Journal";
		}
		// Multiple authors are not seperated into multiple metadata fields
		// and will therefore be extracted wrongly into one author. We
		// correct this by using the JSON-LD data.
		var jsonld = ZU.xpathText(doc, '//script[@type="application/ld+json"]');
		if (jsonld) {
			var firstContext = jsonld.indexOf("@context");
			if (firstContext > 0) {
				var secondContext = jsonld.indexOf("@context", firstContext + 1);
				// sometimes there is a second context at the end, which makes the
				// json non-valid, therefore we delete that before
				// e.g. https://www.wsj.com/articles/the-turnabout-on-religious-freedom-11561155218
				if (secondContext > -1) {
					Z.debug("Delete second context from JSON data");
					jsonld = jsonld.substr(0, secondContext - 1).replace(/[, {"]*$/, '');
				}
			}
			var data = JSON.parse(jsonld);
			if (data.creator && data.creator.length) {
				item.creators = [];
				for (var i = 0; i < data.creator.length; i++) {
					item.creators.push(ZU.cleanAuthor(data.creator[i], "author"));
				}
			}
		}
		item.complete();
	});
	
	translator.getTranslatorObject(function (trans) {
		trans.itemType = type;
		trans.addCustomFields({
			"article.published": "date"
		});
		trans.doWeb(doc, url);
	});
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://www.wsj.com/news/articles/SB10001424052970204517204577046222233016362",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "America's Jobless, Yearning for Oz",
				"creators": [
					{
						"firstName": "John W.",
						"lastName": "Miller",
						"creatorType": "author"
					}
				],
				"date": "2011-11-19T05:01:00.000Z",
				"ISSN": "0099-9660",
				"abstractNote": "A profile of an Australian miner making $200,000 a year, published in The Wall Street Journal, led hundreds of people to ask how they could apply for such a job.",
				"language": "en-US",
				"libraryCatalog": "www.wsj.com",
				"publicationTitle": "Wall Street Journal",
				"section": "Careers",
				"url": "https://www.wsj.com/articles/SB10001424052970204517204577046222233016362",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					"economic news",
					"economic performance",
					"employment",
					"indicators",
					"unemployment"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.wsj.com/news/articles/SB10001424052970203471004577144672783559392",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "An Odd Turn in Insider Case",
				"creators": [
					{
						"firstName": "Jenny",
						"lastName": "Strasburg",
						"creatorType": "author"
					},
					{
						"firstName": "Susan",
						"lastName": "Pulliam",
						"creatorType": "author"
					}
				],
				"date": "2012-01-07T05:01:00.000Z",
				"ISSN": "0099-9660",
				"abstractNote": "An outspoken analyst who is embroiled in the Wall Street insider-trading investigation allegedly left threatening messages for two FBI agents.",
				"language": "en-US",
				"libraryCatalog": "www.wsj.com",
				"publicationTitle": "Wall Street Journal",
				"section": "Markets",
				"url": "https://www.wsj.com/articles/SB10001424052970203471004577144672783559392",
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
		"url": "https://blogs.wsj.com/overheard/2012/01/06/the-ego-has-landed/",
		"items": [
			{
				"itemType": "blogPost",
				"title": "The Ego Has Landed",
				"creators": [
					{
						"firstName": "Liam",
						"lastName": "Denning",
						"creatorType": "author"
					}
				],
				"date": "2012-01-06T21:22:12-05:00",
				"abstractNote": "In their gut, most investors know a narcissistic CEO is cause for caution. But how do you prove that? A group of academics have come up with a possible solution.",
				"blogTitle": "WSJ",
				"language": "en-US",
				"url": "https://blogs.wsj.com/overheard/2012/01/06/the-ego-has-landed/",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					"ceo",
					"m&a"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.wsj.com/search/term.html?KEYWORDS=argentina&mod=DNH_S",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://blogs.wsj.com/economics/2012/01/07/number-of-the-week-americans-cheaper-restaurant-bills/",
		"items": [
			{
				"itemType": "blogPost",
				"title": "Number of the Week: Americans’ Cheaper Restaurant Bills",
				"creators": [
					{
						"firstName": "Phil",
						"lastName": "Izzo",
						"creatorType": "author"
					}
				],
				"date": "2012-01-07T10:00:55-05:00",
				"abstractNote": "Americans spend less per visit to restaurants than most other major industrialized countries, according to data compiled by market research firm NPD Group.",
				"blogTitle": "WSJ",
				"language": "en-US",
				"shortTitle": "Number of the Week",
				"url": "https://blogs.wsj.com/economics/2012/01/07/number-of-the-week-americans-cheaper-restaurant-bills/",
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
		"url": "https://www.wsj.com/articles/american-detained-in-north-korea-to-face-trial-next-sunday-1410053845",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "American Detained in North Korea to Face Trial Next Sunday",
				"creators": [
					{
						"firstName": "Jeyup S.",
						"lastName": "Kwaak",
						"creatorType": "author"
					}
				],
				"date": "2014-09-07T01:37:00.000Z",
				"ISSN": "0099-9660",
				"abstractNote": "Matthew Miller, one of three Americans detained by North Korea, will face trial next Sunday, the country's state media said.",
				"language": "en-US",
				"libraryCatalog": "www.wsj.com",
				"publicationTitle": "Wall Street Journal",
				"section": "World",
				"url": "https://www.wsj.com/articles/american-detained-in-north-korea-to-face-trial-next-sunday-1410053845",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					{
						"tag": "Matthew Miller"
					},
					{
						"tag": "american detained in north korea"
					},
					{
						"tag": "american in north korea"
					},
					{
						"tag": "courts"
					},
					{
						"tag": "crime"
					},
					{
						"tag": "general news"
					},
					{
						"tag": "matthew miller"
					},
					{
						"tag": "north korea"
					},
					{
						"tag": "oasn"
					},
					{
						"tag": "onew"
					},
					{
						"tag": "political"
					},
					{
						"tag": "world news"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/
