{
	"translatorID": "b24ee183-58a6-443d-b8f9-c5cd5a3a0f73",
	"label": "Paris Review",
	"creator": "Avram Lyon, Philipp Zumstein",
	"target": "^https?://www\\.theparisreview\\.org/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2017-01-22 12:19:22"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2010 Avram Lyon, ajlyon@gmail.com

	Paris Review Translator
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


function detectWeb(doc, url){
	if (url.match(/\/(interviews|poetry|fiction|letters-essays|art-photography)\/\d+\//)) {
		return "magazineArticle";
	} else if (url.match(/\/blog\/\d+\//)) {
		return "blogPost";
	} else if (getSearchResults(doc, true)){
		return "multiple";
	}
}


function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = ZU.xpath(doc, '//article//h1/a|//article//a[header/section/h1]');
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
	var type = detectWeb(doc, url);
	var translator = Zotero.loadTranslator('web');
	// Embedded Metadata
	translator.setTranslator('951c027d-74ac-47d4-a107-9c3069ab7b48');
	
	translator.setHandler('itemDone', function (obj, item) {
		if (item.abstractNote) {
			item.abstractNote = ZU.unescapeHTML(item.abstractNote);
		}
		
		if (type == "magazineArticle") {
			var issuevolume = ZU.xpathText(doc, '//section[contains(@class, "article-top-rail")]/h3');
			var a = issuevolume.split(",");
			if (a.length > 1) {
				item.issue = a[0].replace('Issue', '');
				item.volume = a[1];
				if (!item.date) {
					item.date = ZU.strToISO(a[1]);
				}
			} else {
				item.volume = a[0];
			}
			item.ISSN="0031-2037";
		}

		item.complete();
	});
	
	translator.getTranslatorObject(function(trans) {
		trans.itemType = type;
		trans.addCustomFields({
			'twitter:description': 'abstractNote'
		});
		trans.doWeb(doc, url);
	});
}
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.theparisreview.org/search?q=argentina",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://www.theparisreview.org/blog/2011/11/07/o-and-i/",
		"items": [
			{
				"itemType": "blogPost",
				"title": "O. and I",
				"creators": [
					{
						"firstName": "Adam",
						"lastName": "Wilson",
						"creatorType": "author"
					}
				],
				"date": "2011-11-07T13:15:51-05:00",
				"abstractNote": "My interest in Owen Wilson (American actor b. 1968) is admittedly creepy, undoubtedly perverse, and possibly based on nothing more than the fact of our shared last name. For I, too, am something of, My interest in Owen Wilson (American actor b. 1968) is admittedly creepy, undoubtedly perverse, and possibly based on nothing more than the fact of our shared last name. For I, too, am something of a Wilson. A shared Anglo-Saxon surname, however, is merely the first parallel between our lives. To wit: Like O., I was […]",
				"blogTitle": "The Paris Review",
				"url": "https://www.theparisreview.org/blog/2011/11/07/o-and-i/",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					"All I Wanna Do",
					"Ben Stiller",
					"Demi Moore",
					"Dodgeball",
					"Flirting with Disaster",
					"Gaylord Focker",
					"Greta Gerwig",
					"Kate Hudson",
					"Meet the Parents",
					"Midnight in Paris",
					"New Yorker Festival",
					"Owen Wilson",
					"Reality Bites",
					"Robert DeNiro",
					"Rushmore",
					"Seinfeld",
					"Sheryl Crowe",
					"The Darjeeling Limited",
					"The Royal Tennenbaums",
					"WASP",
					"Wes Anderson",
					"Woody Allen",
					"Your Friends and Neighbors"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.theparisreview.org/interviews/2955/julio-cortazar-the-art-of-fiction-no-83-julio-cortazar",
		"items": [
			{
				"itemType": "magazineArticle",
				"title": "Julio Cortázar, The Art of Fiction No. 83",
				"creators": [
					{
						"firstName": "Interviewed by Jason",
						"lastName": "Weiss",
						"creatorType": "author"
					}
				],
				"date": "1984",
				"ISSN": "0031-2037",
				"abstractNote": "INTERVIEWER You have said at various times that, for you, literature is like a game. In what ways? CORTÁZAR For me, literature is a form of play. But I’ve always added that there are two forms of play: football, for example, which is basically a game, and then games that are very pro...",
				"issue": "93",
				"libraryCatalog": "www.theparisreview.org",
				"publicationTitle": "The Paris Review",
				"url": "//www.theparisreview.org/interviews/2955/julio-cortazar-the-art-of-fiction-no-83-julio-cortazar",
				"volume": "Fall 1984",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					"Paris Review",
					"artists",
					"biography",
					"critics",
					"interviews",
					"memoir",
					"novelist",
					"quotes",
					"short stories",
					"writers"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/