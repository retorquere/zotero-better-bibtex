{
	"translatorID": "40b9ca22-8df4-4f3b-9cb6-8f9b55486d30",
	"label": "The Telegraph",
	"creator": "Philipp Zumstein",
	"target": "^https?://[^/]*telegraph\\.co\\.uk/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2019-06-10 22:56:17"
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


function detectWeb(doc, _url) {
	if (ZU.xpathText(doc, '//meta[@property="og:type"]/@content') == "article") {
		if (ZU.xpathText(doc, '//meta[@name="tmgads.channel"]/@content') == 'blogs') {
			return 'blogPost';
		}
		else {
			return 'newspaperArticle';
		}
	}
	return false;
}


function scrape(doc, url) {
	var type = detectWeb(doc, url);
	var translator = Zotero.loadTranslator('web');
	translator.setTranslator('951c027d-74ac-47d4-a107-9c3069ab7b48');
	// translator.setDocument(doc);
	
	translator.setHandler('itemDone', function (obj, item) {
		// set proper item type
		item.itemType = type;
		// fix title
		item.title = item.title.replace(/\s*[-–][^-–]*Telegraph[^-]*$/, '');
	
		// fix newlines in abstract
		item.abstractNote = ZU.trimInternal(item.abstractNote);

		// keywords
		var keywords = ZU.xpathText(doc, '//meta[@name="keywords"]/@content');
		if (keywords && keywords.trim()) {
			item.tags = keywords.split(/,\s*/);
		}
		
		// the author extraction from EM contains also additional info/clutter about persons
		// e.g. "Chief Political Correspondent"
		// thus, we do here a different scraping method
		item.creators = [];
		var authors = ZU.xpathText(doc, '//meta[@name="GSAAuthor"]/@content')
					|| ZU.xpathText(doc, '//meta[@name="DCSext.author"]/@content');
		if (authors) {
			let authorsList = authors.split(';');
			for (let author of authorsList) {
				// clean authors string
				// e.g. "By Alex Spillius in Washington"
				author = author.replace(/^By /, '').replace(/ in .*/, '');
				item.creators.push(ZU.cleanAuthor(author, 'author'));
			}
		}
		
		if (item.date) {
			item.date = ZU.strToISO(item.date);
		}
		
		if (item.itemType == "newspaperArticle") {
			item.ISSN = "0307-1235";
		}
		
		item.language = "en-GB";

		item.complete();
	});
	
	translator.getTranslatorObject(function (em) {
		em.addCustomFields({
			'DCSext.articleFirstPublished': 'date'
		});

		em.doWeb(doc, url);
	});
}


function doWeb(doc, url) {
	scrape(doc, url);
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.telegraph.co.uk/news/worldnews/asia/china/8888909/China-Google-Earth-spots-huge-unidentified-structures-in-Gobi-desert.html",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "China: Google Earth spots huge, unidentified structures in Gobi desert",
				"creators": [
					{
						"firstName": "Malcolm",
						"lastName": "Moore",
						"creatorType": "author"
					}
				],
				"date": "2011-11-14",
				"ISSN": "0307-1235",
				"abstractNote": "Vast, unidentified, structures have been spotted by satellites in the barren Gobi desert, raising questions about what China might be building in a region it uses for its military, space and nuclear programmes.",
				"language": "en-GB",
				"libraryCatalog": "www.telegraph.co.uk",
				"section": "World",
				"shortTitle": "China",
				"url": "http://www.telegraph.co.uk/news/worldnews/asia/china/8888909/China-Google-Earth-spots-huge-unidentified-structures-in-Gobi-desert.html",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					"Asia",
					"China",
					"News",
					"World News"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.telegraph.co.uk/news/2017/05/26/britain-should-pay-brexit-divorce-bill-sake-future-relations/",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Britain should pay Brexit divorce bill for the sake of 'future relations' with EU, says Donald Tusk",
				"creators": [
					{
						"firstName": "Gordon",
						"lastName": "Rayner",
						"creatorType": "author"
					}
				],
				"date": "2017-05-26",
				"ISSN": "0307-1235",
				"abstractNote": "Donald Tusk has told Britain to pay its Brexit divorce bill for the sake of &ldquo;future relations&rdquo; with the EU as he rubbished suggestions that Brussels might end up owing money to the UK.",
				"language": "en-GB",
				"libraryCatalog": "www.telegraph.co.uk",
				"publicationTitle": "The Telegraph",
				"url": "http://www.telegraph.co.uk/news/2017/05/26/britain-should-pay-brexit-divorce-bill-sake-future-relations/",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					"Boris Johnson",
					"Brexit",
					"Brexit Negotiations",
					"Brussels",
					"David Davis",
					"Divorce",
					"Donald Trump",
					"Donald Tusk",
					"Europe",
					"European Commission",
					"European Council",
					"European Union",
					"G7 Summit",
					"Jean-Claude Juncker",
					"News",
					"Politics",
					"Standard",
					"Terrorism",
					"Theresa May"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.telegraph.co.uk/news/2017/03/26/hong-kong-chief-executive-election-need-know/",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "The Hong Kong chief executive election: What you need to know",
				"creators": [
					{
						"firstName": "Neil",
						"lastName": "Connor",
						"creatorType": "author"
					}
				],
				"date": "2017-03-26",
				"ISSN": "0307-1235",
				"abstractNote": "A committee will decide Hong Kong&rsquo;s new leader on Sunday in the first chief executive election since mass protests brought the city to a standstill in 2014.",
				"language": "en-GB",
				"libraryCatalog": "www.telegraph.co.uk",
				"publicationTitle": "The Telegraph",
				"shortTitle": "The Hong Kong chief executive election",
				"url": "http://www.telegraph.co.uk/news/2017/03/26/hong-kong-chief-executive-election-need-know/",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					"Asia",
					"China",
					"Hong Kong",
					"News",
					"Standard",
					"World News"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.telegraph.co.uk/news/worldnews/barackobama/6262938/Barack-Obama-cancels-meeting-with-Dalai-Lama-to-keep-China-happy.html",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Barack Obama cancels meeting with Dalai Lama 'to keep China happy'",
				"creators": [
					{
						"firstName": "Alex",
						"lastName": "Spillius",
						"creatorType": "author"
					}
				],
				"date": "2009-10-05",
				"ISSN": "0307-1235",
				"abstractNote": "President Barack Obama has refused to meet the Dalai Lama in Washington this week in a move to curry favour with the Chinese.",
				"language": "en-GB",
				"libraryCatalog": "www.telegraph.co.uk",
				"section": "World",
				"url": "http://www.telegraph.co.uk/news/worldnews/barackobama/6262938/Barack-Obama-cancels-meeting-with-Dalai-Lama-to-keep-China-happy.html",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					"Barack Obama",
					"News",
					"World News"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.telegraph.co.uk/news/2017/06/09/election-results-2017-theresa-may-clings-power-needs-support/",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Election results 2017: Theresa May says sorry to defeated Tory candidates as she eyes deal with DUP",
				"creators": [
					{
						"firstName": "Laura",
						"lastName": "Hughes",
						"creatorType": "author"
					},
					{
						"firstName": "Jack",
						"lastName": "Maidment",
						"creatorType": "author"
					},
					{
						"firstName": "Barney",
						"lastName": "Henderson",
						"creatorType": "author"
					}
				],
				"date": "2017-06-09",
				"ISSN": "0307-1235",
				"abstractNote": "Theresa May has said sorry to the Tory MPs and ministers who lost their seats as a result of her decision to call a snap general election which cost the Conservatives their majority.",
				"language": "en-GB",
				"libraryCatalog": "www.telegraph.co.uk",
				"publicationTitle": "The Telegraph",
				"shortTitle": "Election results 2017",
				"url": "http://www.telegraph.co.uk/news/2017/06/09/election-results-2017-theresa-may-clings-power-needs-support/",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					"Conservative Party",
					"General Election 2017",
					"Jeremy Corbyn",
					"Labour Party",
					"News",
					"Politics",
					"Theresa May",
					"UK News"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/
