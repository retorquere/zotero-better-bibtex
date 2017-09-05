{
	"translatorID": "06142d59-fa9c-48c3-982b-6e7c67d3d6b8",
	"label": "The Hindu",
	"creator": "Philipp Zumstein",
	"target": "^https?://www\\.thehindu\\.com/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2017-07-05 10:59:44"
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

/**
This translator interfaces with www.thehindu.com on the current content
of the newspaper. The other translator "The Hindu (old)" deals with older
content (pre 2009)
**/

function detectWeb(doc, url) {
	if (url.indexOf('.ece')>-1) {
		return "newspaperArticle";
	} else if (url.indexOf('/search/?') && getSearchResults(doc, true)) {
		return "multiple";
	}
}

function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = ZU.xpath(doc, '//div[contains(@class, "story-card-33-news") or contains(@class, "story-card-news")]//a[contains(@href, ".ece")]');
	for (var i=0; i<rows.length; i++) {
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
		//fix the authors
		var authors = ZU.xpath(doc, '//div[contains(@class, "author-container")]/span');
		if (authors.length>0) {
			item.creators = [];
			for (var i=0; i<authors.length; i++) {
				insertCreator(authors[i].textContent, item);
			}
		}
		if (!item.date) {
			item.date = ZU.xpathText(doc, '//meta[@name="publish-date"]/@content');
		}
		var utcontainer = ZU.xpathText(doc, '(//div[contains(@class, "ut-container")]/span)[1]');
		//test that we are not already in the date node (name of places should not contain any number)
		if (utcontainer && !utcontainer.match(/\d/g)) {
			item.place = ZU.capitalizeTitle(utcontainer.replace(/,\s*$/, ''), true);
		}
		item.language = "en-IN";
		item.publicationTitle = "The Hindu";
		item.ISSN = "0971-751X";
		item.complete();
	});

	translator.getTranslatorObject(function(trans) {
		trans.itemType = "newspaperArticle";
		trans.doWeb(doc, url);
	});
}


function insertCreator(authorName, newItem){
	/*Check for some author name conventions unique to the Hindu*/
	/*Right now we are using the following: 
	  
	  1) PTI, a news agency, is often credited as an author on The
	  Hindu articles.  We just change the author status to
	  "contributor", and retain the capitalization.
	  
	  2) Some articles are bylined "Special Coresspondent". Again, we
	  change the author status to "contributor".
	  
	*/
	authorName = ZU.capitalizeTitle(authorName.toLowerCase(), true);
	if (authorName == "Pti") {
		newItem.creators.push({
			lastName: "PTI", 
			creatorType: 'contributor', 
			fieldMode: 1
		});
	} else if (authorName == "Special Correspondent") {
		newItem.creators.push({
			lastName: "Special Correspondent", 
			creatorType: 'contributor', 
			fieldMode: 1
		});
	} else {
		newItem.creators.push(ZU.cleanAuthor(authorName, "author"));
	}
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.thehindu.com/news/national/telegram-no-more-stop-100-stop/article4914819.ece",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Telegram no more STOP 100 STOP",
				"creators": [
					{
						"firstName": "Shiv Sahay",
						"lastName": "Singh",
						"creatorType": "author"
					}
				],
				"date": "2013-07-14T17:42:52+05:30",
				"ISSN": "0971-751X",
				"abstractNote": "India bids adieu to the telegram after 163 years",
				"language": "en-IN",
				"libraryCatalog": "www.thehindu.com",
				"place": "Kolkata",
				"publicationTitle": "The Hindu",
				"section": "National",
				"url": "http://www.thehindu.com/news/national/telegram-no-more-stop-100-stop/article4914819.ece",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					"BSNL",
					"Telegram",
					"Telegram service discontinuation",
					"Telegraph service"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.thehindu.com/features/once-favoured-now-forgotten/article4912011.ece?homepage=true",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Once favoured, now forgotten",
				"creators": [
					{
						"firstName": "Anusha",
						"lastName": "Parthasarathy",
						"creatorType": "author"
					},
					{
						"firstName": "Lakshmi",
						"lastName": "Krupa",
						"creatorType": "author"
					}
				],
				"date": "2013-07-14T18:29:36+05:30",
				"ISSN": "0971-751X",
				"abstractNote": "An important part of people’s lives for many years, the telegram is now no more. And, we can’t help but think of such integral aspects of our growing up years that have now disappeared or have become less significant. Though they have moved aside so we could embrace a better lifestyle, they will always remain an ode to an age when life was much simpler. Anusha Parthasarathy and Lakshmi Krupa press the rewind button",
				"language": "en-IN",
				"libraryCatalog": "www.thehindu.com",
				"place": "Chennai",
				"publicationTitle": "The Hindu",
				"section": "Features",
				"url": "http://www.thehindu.com/features/metroplus/once-favoured-now-forgotten/article4912011.ece",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					"Cassette tapes",
					"Dial-up",
					"Floppy discs",
					"Gramophone",
					"Pager",
					"Roll films",
					"Transistor radio",
					"Typewriter",
					"VCR"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.thehindu.com/business/Economy/petrol-prices-to-go-up-by-rs-155-per-litre/article4914855.ece",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Petrol prices to go up by Rs. 1.55 per litre",
				"creators": [
					{
						"lastName": "PTI",
						"creatorType": "contributor",
						"fieldMode": 1
					}
				],
				"date": "2013-07-14T17:57:17+05:30",
				"ISSN": "0971-751X",
				"abstractNote": "This is the fourth increase since June. It was raised by 75 paise on June 1, followed by a Rs. 2 per litre increase on June 16 and a Rs. 1.82 per litre hike on June 29.",
				"language": "en-IN",
				"libraryCatalog": "www.thehindu.com",
				"place": "New Delhi",
				"publicationTitle": "The Hindu",
				"section": "Economy",
				"url": "http://www.thehindu.com/business/Economy/petrol-prices-to-go-up-by-rs-155-per-litre/article4914855.ece",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					"Petrol price hike",
					"Rupee fall",
					"oil imports",
					"oil marketing companies"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.thehindu.com/opinion/columns/Chandrasekhar/the-forgotten-software-boom/article4914571.ece",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "The forgotten software boom",
				"creators": [
					{
						"firstName": "C. P.",
						"lastName": "Chandrasekhar",
						"creatorType": "author"
					}
				],
				"date": "2013-07-14T13:57:47+05:30",
				"ISSN": "0971-751X",
				"abstractNote": "India’s software and information technology-enabled services (ITeS) exports have lost momentum. Since 2007-08 the Reserve Bank of India has been conducting an annual survey of exports of computer soft",
				"language": "en-IN",
				"libraryCatalog": "www.thehindu.com",
				"publicationTitle": "The Hindu",
				"section": "Chandrasekhar",
				"url": "http://www.thehindu.com/opinion/columns/Chandrasekhar/the-forgotten-software-boom/article4914571.ece",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					"IT industry",
					"ITeS",
					"NASSCOM",
					"economic slowdown"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/