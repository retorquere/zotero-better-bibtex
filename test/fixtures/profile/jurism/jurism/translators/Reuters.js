{
	"translatorID": "83979786-44af-494a-9ddb-46654e0486ef",
	"label": "Reuters",
	"creator": "Avram Lyon, Michael Berkowitz, Sebastian Karcher",
	"target": "^https?://(www|blogs)?\\.reuters\\.com/",
	"minVersion": "2.1.9",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2015-06-02 21:16:57"
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

function detectWeb(doc, url) {
	if (url.match(/^https?:\/\/(www\.)?reuters\.com\/article/)) {
		return "newspaperArticle";
	} else if (url.match(/^https?:\/\/blogs\.reuters\.com/)) {
	  return "blogPost";
	} else if (url.match(/search\?/)) {
	  return "multiple";
	}
}

function doWeb(doc, url) {
	var articles = new Array();
	if (detectWeb(doc, url) == "multiple") {
		var items = {};
		var titles = doc.evaluate('//li[@class="searchHeadline"]/a', doc, null, XPathResult.ANY_TYPE, null);
		var title;
		while (title = titles.iterateNext()) {
			items[title.href] = title.textContent;
		}

		Zotero.selectItems(items, function (items) {
			if (!items) {
				return true;
			}
			for (var i in items) {
				articles.push(i);
			}
			Zotero.Utilities.processDocuments(articles, scrape, function () {
				Zotero.done();
			});
			Zotero.wait();
		});
	} else {
		scrape(doc, url);
	}
}

function scrape(doc, url) {
	if (detectWeb(doc, url) == "newspaperArticle") {
		var item = new Zotero.Item("newspaperArticle");

		item.date = doc.evaluate('//meta[@name="REVISION_DATE"]', doc, null, XPathResult.ANY_TYPE, null).iterateNext().content;
		var byline = ZU.xpathText(doc, '//div[@id="articleInfo"]//p[@class="byline"]');
		if (byline) {
			var authors = byline.substr(3).split(/and |,/);
			for (var i=0; i<authors.length; i++) {
				item.creators.push(authorFix(authors[i]));
			}
		}
		item.publicationTitle = "Reuters";
	}
	if (detectWeb(doc, url) == "blogPost") {
		var item = new Zotero.Item("blogPost");

		item.date = ZU.xpathText(doc, '//div[@id="single"]/div[@class="timestamp"]');
		var byline = ZU.xpathText(doc, '//div[@class="author"]');
		if (byline) {
			var authors = byline.split(/and |,/);
			for (var i=0; i<authors.length; i++) {
				item.creators.push(authorFix(authors[i]));
			}
		}

		var blogtitle = ZU.xpathText(doc, '//h1');
		if (blogtitle) item.publicationTitle = "Reuters Blogs - " + blogtitle;
		else item.publicationTitle = "Reuters Blogs";
	}

	//general fields
	if(item) {
		item.title = ZU.xpathText(doc, '//meta[@property="og:title"]/@content');

		item.place = ZU.xpathText(doc, '//div[@id="articleInfo"]//span[@class="location"]');
		if (item.place) {
			if (item.place == item.place.toUpperCase()) item.place = Zotero.Utilities.capitalizeTitle(item.place.toLowerCase(), true);
		}

		item.url = ZU.xpathText(doc, '//link[@rel="canonical"]/@href');
		item.abstractNote = ZU.xpathText(doc, '//meta[@name="description"]/@content');

		var tags = ZU.xpathText(doc, '//meta[@name="keywords"]/@content');
		if(tags)
			item.tags = tags.trim().split(/\s*,\s*/);

		item.attachments.push({title: 'Snapshot', document: doc});

		item.complete();
	}
}

function authorFix(author) {
	// Sometimes we have "By Author"
	if (author.substr(0, 3).toLowerCase() == "by ") {
		author = author.substr(3);
	}
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
		"url": "http://www.reuters.com/article/2011/11/14/us-eurozone-idUSTRE7AC15K20111114",
		"items": [
			{
				"itemType": "newspaperArticle",
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
				"notes": [],
				"tags": [
					"Germany",
					"Greece",
					"Italy",
					"Germany",
					"Greece",
					"Italy",
					"Germany",
					"Angela Merkel",
					"Antonis Samaras",
					"George Papandreou",
					"Harry Papachristou",
					"Jens Weidmann",
					"Lucas Papademos",
					"Mario Monti",
					"Olli Rehn",
					"Philip Pullella",
					"Silvio Berlusconi",
					"Angela Merkel",
					"Antonis Samaras",
					"George Papandreou",
					"Giorgio Napolitano",
					"Harry Papachristou",
					"Jack Ablin",
					"Jens Weidmann",
					"Kai Pfaffenbach",
					"Lucas Papademos",
					"Mario Monti",
					"Olli Rehn",
					"Philip Pullella",
					"Silvio Berlusconi",
					"Angela Merkel",
					"Kai Pfaffenbach"
				],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"date": "Mon Nov 14 21:16:28 UTC 2011",
				"publicationTitle": "Reuters",
				"title": "Europe could be in worst hour since WW2: Merkel",
				"place": "Rome",
				"url": "http://www.reuters.com/article/2011/11/14/us-eurozone-idUSTRE7AC15K20111114",
				"abstractNote": "ROME (Reuters) - Prime Minister-designate Mario Monti meets the leaders of Italy's biggest two parties on Tuesday to discuss the many sacrifices needed to reverse a collapse in market confidence that is",
				"libraryCatalog": "Reuters",
				"accessDate": "CURRENT_TIMESTAMP",
				"shortTitle": "Europe could be in worst hour since WW2"
			}
		]
	},
	{
		"type": "web",
		"url": "http://blogs.reuters.com/lawrencesummers/2012/03/26/its-too-soon-to-return-to-normal-policies/",
		"items": [
			{
				"itemType": "blogPost",
				"creators": [
					{
						"firstName": "Lawrence",
						"lastName": "Summers",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [
					"deficit",
					"fiscal policy",
					"housing",
					"recovery",
					"unemployment"
				],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"title": "It’s too soon to return to normal policies",
				"abstractNote": "After years when the risks to the consensus modest-growth forecast were to the downside, they are now very much two-sided.",
				"url": "http://blogs.reuters.com/lawrencesummers/2012/03/26/its-too-soon-to-return-to-normal-policies/",
				"publicationTitle": "Reuters Blogs - Lawrence Summers",
				"libraryCatalog": "Reuters",
				"accessDate": "CURRENT_TIMESTAMP"
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.reuters.com/search?blob=europe",
		"items": "multiple"
	}
]
/** END TEST CASES **/