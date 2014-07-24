{
	"translatorID": "4363275e-5cc5-4627-9a7f-951fb58a02c3",
	"label": "Cornell University Press",
	"creator": "Sebastian Karcer",
	"target": "^https?://www\\.cornellpress\\.cornell\\.edu/",
	"minVersion": "2.1.9",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2013-09-17 22:52:51"
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

function associateData(newItem, dataTags, field, zoteroField) {
	if (dataTags[field]) {
		newItem[zoteroField] = dataTags[field];
	}
}

function scrape(doc, url) {
	var newItem = new Zotero.Item("book");
	var dataTags = new Object();
	var fields = ZU.xpath(doc, '//span[@class="detailbox"]');
	var titles = ZU.xpath(doc, '//span[@class="DetailLabelText"]');

	for (var i in fields) {
		var field = fields[i].textContent.trim();
		dataTags[field] = titles[i].textContent;
		//Z.debug(field + ": " + dataTags[field])
		if (field == "Author") {
			newItem.creators.push(ZU.cleanAuthor(dataTags["Author"], "author"));
		} else if (field == "Authors") {
			var author = dataTags["Authors"].split(/\s*,\s*/);
			for (var j in author) {
				newItem.creators.push(ZU.cleanAuthor(author[j], "author"));
			}

		}
		if (field == "Edited by") {
			var editor = dataTags["Edited by"].split(/\s*,\s*/);
			for (var j in editor) {
				newItem.creators.push(ZU.cleanAuthor(editor[j], "editor"));
			}

		}
		if (field == "Translated by") {
			var translator = dataTags["Translated by"].split(/\s*,\s*/);
			for (var j in translator) {
				newItem.creators.push(ZU.cleanAuthor(translator[j], "translator"));
			}

		}
		if (field == "Subtitle") {
			var fulltitle = dataTags["Title"] + ": " + dataTags["Subtitle"];
			newItem.title = fulltitle;
		} else if (!fulltitle) newItem.title = dataTags["Title"];

		if (field == "BISAC Subject Heading") {
			var tags = dataTags[field].split(/\n/)
			for (var j in tags) {
				newItem.tags[j] = tags[j].replace(/.+\//, "").trim();
			}
		}

		if (field == "Publisher") {
			newItem.publisher = dataTags["Publisher"];
			if (newItem.publisher.indexOf("Leuven") != -1) newItem.place = "Leuven";
			else newItem.place = "Ithaca, NY"
		} else if (!newItem.publisher) {
			newItem.publisher = "Cornell University Press";
			newItem.place = "Ithaca, NY";
		}


	}
	associateData(newItem, dataTags, "ISBN-13", "ISBN");
	associateData(newItem, dataTags, "Publication Date", "date");
	associateData(newItem, dataTags, "Title First Published", "date");
	associateData(newItem, dataTags, "Publication Date", "date");
	associateData(newItem, dataTags, "Collection", "series");
	associateData(newItem, dataTags, "Language", "language");
	associateData(newItem, dataTags, "Languages", "language");
	associateData(newItem, dataTags, "Nb of pages", "numPages");
	associateData(newItem, dataTags, "Main content page count", "numPages");
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
				"creators": [
					{
						"firstName": "Jenny",
						"lastName": "Edkins",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [
					"History & Theory",
					"Demography",
					"Human Rights"
				],
				"seeAlso": [],
				"attachments": [],
				"title": "Missing: Persons and Politics",
				"publisher": "Cornell University Press",
				"place": "Ithaca, NY",
				"ISBN": "978-0-8014-5029-7",
				"date": "01 September 2011",
				"numPages": "280",
				"abstractNote": "Stories of the missing offer profound insights into the tension between how political systems see us and how we see each other. The search for people who go missing as a result of war, political violence, genocide, or natural disaster reveals how forms of governance that objectify the person are challenged. Contemporary political systems treat persons instrumentally, as objects to be administered rather than as singular beings: the apparatus of government recognizes categories, not people. In contrast, relatives of the missing demand that authorities focus on a particular person: families and friends are looking for someone who to them is unique and irreplaceable.    \tIn Missing, Jenny Edkins highlights stories from a range of circumstances that shed light on this critical tension: the aftermath of World War II, when millions in Europe were displaced; the period following the fall of the World Trade Center towers in Manhattan in 2001 and the bombings in London in 2005; searches for military personnel missing in action; the thousands of political \"disappearances\" in Latin America; and in more quotidian circumstances where people walk out on their families and disappear of their own volition. When someone goes missing we often find that we didn't know them as well as we thought: there is a sense in which we are \"missing\" even to our nearest and dearest and even when we are present, not absent. In this thought-provoking book, Edkins investigates what this more profound \"missingness\" might mean in political terms.",
				"libraryCatalog": "Cornell University Press",
				"shortTitle": "Missing"
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.cornellpress.cornell.edu/book/?GCOI=80140100195440",
		"items": [
			{
				"itemType": "book",
				"creators": [
					{
						"firstName": "Hans",
						"lastName": "Blumenberg",
						"creatorType": "author"
					},
					{
						"firstName": "Robert L.",
						"lastName": "Savage",
						"creatorType": "translator"
					}
				],
				"notes": [],
				"tags": [
					"Semiotics & Theory",
					"Criticism",
					"Methodology"
				],
				"seeAlso": [],
				"attachments": [],
				"title": "Paradigms for a Metaphorology",
				"publisher": "Cornell University Press",
				"place": "Ithaca, NY",
				"ISBN": "978-0-8014-4925-3",
				"date": "19 August 2010",
				"series": "Signale: Modern German Letters, Cultures, and Thought",
				"numPages": "160",
				"abstractNote": "\"Paradigms for a Metaphorology may be read as a kind of beginner's guide to Blumenberg, a programmatic introduction to his vast and multifaceted oeuvre. Its brevity makes it an ideal point of entry for readers daunted by the sheer bulk of Blumenberg's later writings, or distracted by their profusion of historical detail. Paradigms expresses many of Blumenberg's key ideas with a directness, concision, and clarity he would rarely match elsewhere. What is more, because it served as a beginner’s guide for its author as well, allowing him to undertake an initial survey of problems that would preoccupy him for the remainder of his life, it has the additional advantage that it can offer us a glimpse into what might be called the 'genesis of the Blumenbergian world.’\"—from the Afterword by Robert Savage    \tWhat role do metaphors play in philosophical language? Are they impediments to clear thinking and clear expression, rhetorical flourishes that may well help to make philosophy more accessible to a lay audience, but that ought ideally to be eradicated in the interests of terminological exactness? Or can the images used by philosophers tell us more about the hopes and cares, attitudes and indifferences that regulate an epoch than their carefully elaborated systems of thought?    \tIn Paradigms for a Metaphorology, originally published in 1960 and here made available for the first time in English translation, Hans Blumenberg (1920–1996) approaches these questions by examining the relationship between metaphors and concepts. Blumenberg argues for the existence of \"absolute metaphors\" that cannot be translated back into conceptual language. These metaphors answer the supposedly naïve, theoretically unanswerable questions whose relevance lies quite simply in the fact that they cannot be brushed aside, since we do not pose them ourselves but find them already posed in the ground of our existence. They leap into a void that concepts are unable to fill.    \tAn afterword by the translator, Robert Savage, positions the book in the intellectual context of its time and explains its continuing importance for work in the history of ideas.",
				"libraryCatalog": "Cornell University Press"
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