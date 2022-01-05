{
	"translatorID": "e0234bcf-bc56-4577-aa94-fe86a27f6fd6",
	"label": "The Globe and Mail",
	"creator": "Sonali Gupta",
	"target": "^https?://www\\.theglobeandmail\\.com/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2017-04-29 17:01:57"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2017 Sonali Gupta
	
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
	if (url.indexOf("/search/") != -1 && getSearchResults(doc, true)) {
		return "multiple";
	}
	else if (ZU.xpathText(doc, '//article')) {
		return "newspaperArticle";
	}
}

function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = ZU.xpath(doc, '//article/h3/a');
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
	
	newItem = new Zotero.Item("newspaperArticle");
	newItem.url = url;

	//get headline
	var title = ZU.xpathText(doc, '//article/h1');
	if (!title) title = ZU.xpathText(doc, '//meta[@property="og:title"]/@content');
	newItem.title = title;

	//get abstract
	newItem.abstractNote = ZU.xpathText(doc, '//meta[@property="og:description"]/@content');
	
	//get date
	var xpathdate = '//time[@itemprop="datePublished"]';
	var date = ZU.xpathText(doc, xpathdate);
	if (date) {
		newItem.date = ZU.strToISO(date);
	}

	//get author
	var authors = ZU.xpath(doc, '//meta[@itemprop="author"]/@content');
	for (var i = 0; i<authors.length; i++){
		newItem.creators.push(ZU.cleanAuthor(authors[i].textContent, "author"));
	}

	var publishers = ZU.xpath(doc, '//article/header//div[@itemprop="publisher"]//p');
	for (var i = 0; i<publishers.length; i++){
		newItem.creators.push( {
		"lastName" : publishers[i].innerText,
		"creatorType" : "contributor",
		"fieldmode" : 1
		});
	}

	newItem.language = ZU.xpathText(doc, '//meta[@http-equiv="Content-Language"]/@content');
	
	newItem.section = ZU.xpathText(doc, '//meta[@name="article:type"]/@content');

	var xpathtags = ZU.xpathText(doc, '//meta[@name="keywords"]/@content');
	newItem.tags = xpathtags.split(";").filter(function(tag) {return tag.length != 0});

	var related_links = ZU.xpathText(doc, '//article//li/p/a/@href');
	var note=""
	if (related_links)
		note = addNote(note, related_links.split(",").filter(function(tag) {return tag.length != 0}))
	if (note.length != 0) {
		newItem.notes.push( {note: note} );
	}

	newItem.attachments.push({
		document: doc,
		title: "The Globe and Mail Snapshot",
	});
	newItem.complete();
}

function addNote(originalNote, newNote) {
	if (originalNote.length == 0) {
		originalNote = "Related URL: " + newNote;
	}
	else
	{
		originalNote += newNote;
	}
	return originalNote;
}
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://www.theglobeandmail.com/news/toronto/doug-ford-says-hes-not-yet-sure-about-his-political-future/article21428180/",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Doug Ford to decide provincial Tory leadership run in 'a couple weeks'",
				"creators": [
					{
						"firstName": "Ann",
						"lastName": "Hui",
						"creatorType": "author"
					},
					{
						"lastName": "The Globe and Mail",
						"creatorType": "contributor",
						"fieldmode": 1
					}
				],
				"date": "2014-11-03",
				"abstractNote": "He says he will decide soon about whether to run for Ontario Tory leadership and does not rule out another attempt at the Toronto mayoralty",
				"language": "en-ca",
				"libraryCatalog": "The Globe and Mail",
				"section": "news",
				"url": "https://www.theglobeandmail.com/news/toronto/doug-ford-says-hes-not-yet-sure-about-his-political-future/article21428180/",
				"attachments": [
					{
						"title": "The Globe and Mail Snapshot"
					}
				],
				"tags": [
					"Christine Elliott",
					"Doug Ford",
					"Jim Flaherty",
					"John Tory",
					"Ontario Progressive Conservative",
					"Rob Ford",
					"leadership"
				],
				"notes": [
					{
						"note": "Related URL: https://www.theglobeandmail.com/news/toronto/doug-ford-says-ontario-pc-leadership-bid-is-on-the-table/article21358827/, https://www.theglobeandmail.com/news/toronto/uniting-a-divided-toronto-will-be-a-key-task-for-torys-transition-team/article21359883/, https://www.theglobeandmail.com/news/toronto/a-chuckling-ford-on-his-mayoralty-it-will-definitely-be-remembered/article21414526/"
					}
				],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.theglobeandmail.com/search/?q=nuclear",
		"items": "multiple"
	}
]
/** END TEST CASES **/