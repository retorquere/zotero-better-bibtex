{
	"translatorID": "4363275e-5cc5-4627-9a7f-951fb58a02c3",
	"label": "Cornell University Press",
	"creator": "Sebastian Karcer",
	"target": "^https?://www\\.cornellpress\\.cornell\\.edu/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2016-09-10 11:32:31"
}

/*
	***** BEGIN LICENSE BLOCK *****
	
	Copyright © 2012 Sebastian Karcher
	
	This file is part of Zotero.
	
	Zotero is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.
	
	Zotero is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU Affero General Public License for more details.
	
	You should have received a copy of the GNU Affero General Public License
	along with Zotero.  If not, see <http://www.gnu.org/licenses/>.
	
	***** END LICENSE BLOCK *****
*/

function detectWeb(doc, url) {
	if (url.match("/book/")) {
		return "book";
	} else if (url.match("/search/?") || url.match("/catalog/?")) {
		return "multiple";
	}
}

function doWeb(doc, url) {
	var books = new Array();
	if (detectWeb(doc, url) == "multiple") {
		var items = new Object();
		var rows = ZU.xpath(doc, '//div[@class="GCOIblockcontents"]')
		for (var i in rows) {
			titles = ZU.xpathText(rows[i], './a/div[@class="MainTitle"]')
			urls = ZU.xpathText(rows[i], './a/@href')
			items[urls] = titles;
		}
		Zotero.selectItems(items, function (items) {
			if (!items) {
				return true;
			}
			for (var i in items) {
				books.push(i);
			}
			Zotero.Utilities.processDocuments(books, scrape);
		});
	} else {
		scrape(doc, url);
	}
}

function scrape(doc, url) {
	var newItem = new Zotero.Item("book");
	var dataTags = new Object();
	var fields = ZU.xpath(doc, '//span[@class="detailbox"]');

	for (var i in fields) {
		var field = fields[i].textContent.trim();
		var value = ZU.xpathText(fields[i], './following-sibling::span[@class="DetailLabelText"]');
		//Z.debug(field + ": " + value)
		switch (field) {
			case "Title":
				newItem.title = value;
				break;
			case "Subtitle":
				newItem.title = newItem.title + ": " + value;
				break;
			case "Author":
				newItem.creators.push(ZU.cleanAuthor(value, "author"));
				break;
			case "Authors":
				var author = value.split(/\s*,\s*/);
				for (var j in author) {
					newItem.creators.push(ZU.cleanAuthor(author[j], "author"));
				}
				break;
			case "Edited by":
				var editor = value.split(/\s*,\s*/);
				for (var j in editor) {
					newItem.creators.push(ZU.cleanAuthor(editor[j], "editor"));
				}
				break;
			case "Translated by":
				var translator = value.split(/\s*,\s*/);
				for (var j in translator) {
					newItem.creators.push(ZU.cleanAuthor(translator[j], "translator"));
				}
				break;
			case "Publisher":
				newItem.publisher = value;
				break;
			case "ISBN-13":
				newItem.ISBN = value;
				break;
			case "Publication Date":
			case "Title First Published":
			case "Publication Date":
				newItem.date = ZU.strToISO(value);
				break;
			case "Collection":
				newItem.series = value;
				break;
			case "Language":
			case "Languages":
				newItem.language = value;
				break;
			case "Nb of pages":
			case "Main content page count":
				newItem.numPages = value;
				break;
			case "BISAC Subject Heading":
				var tags = value.split(/\n/);
				for (var j in tags) {
					newItem.tags[j] = tags[j].replace(/.+\//, "").trim();
				}
				break;
		}
	}
	
	//add default publisher, place if nothing else is specified
	if (!newItem.publisher) {
		newItem.publisher = "Cornell University Press";
		newItem.place = "Ithaca, NY";
	} else if (!newItem.place) {
		if (newItem.publisher.indexOf("Leuven") != -1) {
			newItem.place = "Leuven";
		} else {
			newItem.place = "Ithaca, NY"
		}
	}
	
	newItem.abstractNote = ZU.xpathText(doc, '//div[@id="bookpagedescription"]');
	newItem.complete();
} /** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.cornellpress.cornell.edu/book/?GCOI=80140100486370",
		"items": [
			{
				"itemType": "book",
				"title": "Missing: Persons and Politics",
				"creators": [
					{
						"firstName": "Jenny",
						"lastName": "Edkins",
						"creatorType": "author"
					}
				],
				"date": "2011-09-01",
				"ISBN": "9781501705649",
				"abstractNote": "Stories of the missing offer profound insights into the tension between how political systems see us and how we see each other. The search for people who go missing as a result of war, political violence, genocide, or natural disaster reveals how forms of governance that objectify the person are challenged. Contemporary political systems treat persons instrumentally, as objects to be administered rather than as singular beings: the apparatus of government recognizes categories, not people. In contrast, relatives of the missing demand that authorities focus on a particular person: families and friends are looking for someone who to them is unique and irreplaceable.\n\n\n\n\tIn Missing, Jenny Edkins highlights stories from a range of circumstances that shed light on this critical tension: the aftermath of World War II, when millions in Europe were displaced; the period following the fall of the World Trade Center towers in Manhattan in 2001 and the bombings in London in 2005; searches for military personnel missing in action; the thousands of political \"disappearances\" in Latin America; and in more quotidian circumstances where people walk out on their families and disappear of their own volition. When someone goes missing we often find that we didn't know them as well as we thought: there is a sense in which we are \"missing\" even to our nearest and dearest and even when we are present, not absent. In this thought-provoking book, Edkins investigates what this more profound \"missingness\" might mean in political terms.",
				"libraryCatalog": "Cornell University Press",
				"numPages": "296",
				"place": "Ithaca, NY",
				"publisher": "Cornell University Press",
				"shortTitle": "Missing",
				"attachments": [],
				"tags": [
					"History & Theory",
					"Political"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.cornellpress.cornell.edu/book/?GCOI=80140100195440",
		"items": [
			{
				"itemType": "book",
				"title": "Paradigms for a Metaphorology",
				"creators": [
					{
						"firstName": "Hans",
						"lastName": "Blumenberg",
						"creatorType": "author"
					},
					{
						"firstName": "Robert",
						"lastName": "Savage",
						"creatorType": "translator"
					}
				],
				"date": "2010-08-19",
				"ISBN": "9781501704352",
				"abstractNote": "\"Paradigms for a Metaphorology may be read as a kind of beginner's guide to Blumenberg, a programmatic introduction to his vast and multifaceted oeuvre. Its brevity makes it an ideal point of entry for readers daunted by the sheer bulk of Blumenberg's later writings, or distracted by their profusion of historical detail. Paradigms expresses many of Blumenberg's key ideas with a directness, concision, and clarity he would rarely match elsewhere. What is more, because it served as a beginner’s guide for its author as well, allowing him to undertake an initial survey of problems that would preoccupy him for the remainder of his life, it has the additional advantage that it can offer us a glimpse into what might be called the 'genesis of the Blumenbergian world.’\"—from the Afterword by Robert Savage\n\n\n\n\tWhat role do metaphors play in philosophical language? Are they impediments to clear thinking and clear expression, rhetorical flourishes that may well help to make philosophy more accessible to a lay audience, but that ought ideally to be eradicated in the interests of terminological exactness? Or can the images used by philosophers tell us more about the hopes and cares, attitudes and indifferences that regulate an epoch than their carefully elaborated systems of thought?\n\n\n\n\tIn Paradigms for a Metaphorology, originally published in 1960 and here made available for the first time in English translation, Hans Blumenberg (1920–1996) approaches these questions by examining the relationship between metaphors and concepts. Blumenberg argues for the existence of \"absolute metaphors\" that cannot be translated back into conceptual language. These metaphors answer the supposedly naïve, theoretically unanswerable questions whose relevance lies quite simply in the fact that they cannot be brushed aside, since we do not pose them ourselves but find them already posed in the ground of our existence. They leap into a void that concepts are unable to fill.\n\n\n\n\tAn afterword by the translator, Robert Savage, positions the book in the intellectual context of its time and explains its continuing importance for work in the history of ideas.",
				"libraryCatalog": "Cornell University Press",
				"numPages": "160",
				"place": "Ithaca, NY",
				"publisher": "Cornell University Press",
				"series": "Signale: Modern German Letters, Cultures, and Thought",
				"attachments": [],
				"tags": [
					"Criticism",
					"Methodology",
					"Semiotics & Theory"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.cornellpress.cornell.edu/catalog/?category_id=19",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://www.cornellpress.cornell.edu/search/?fa=rechercheA&keyType=all&keywords=translated&title=&author=&isbnORissn=&Collection_ID=&Format_id=&Editeur=&LanguageCode=&StartYear=----&EndYear=2012&formfield1234567893=39860609%2C19953448&formfield1234567894=",
		"items": "multiple"
	}
]
/** END TEST CASES **/