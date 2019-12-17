{
	"translatorID": "327cacea-9603-4554-91a8-ed0587e0d83a",
	"label": "JISC Historical Texts",
	"creator": "Sebastian Karcher",
	"target": "^https?://(data.)?[^/]*historicaltexts\\.jisc\\.ac\\.uk/(view|results)\\?",
	"minVersion": "4.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2018-10-12 02:32:08"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2018 Sebastian Karcher
	
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


// attr()/text() v2
function attr(docOrElem,selector,attr,index){var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector);return elem?elem.getAttribute(attr):null;}function text(docOrElem,selector,index){var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector);return elem?elem.textContent:null;}


function detectWeb(doc, url) {

	if (url.includes('/view?')) {
		return "book";
	} else if (url.includes("/results?terms")) {
		// we don't use getSearchResults so we don't need the DOM object which loads after page load finishes
		return "multiple";
	}
}


function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = doc.querySelectorAll('a[class*="book-title"]');
	for (let i=0; i<rows.length; i++) {
		let href = rows[i].href;
		let title = ZU.trimInternal(rows[i].textContent);
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
			for (let article of articles) {
				scrape(article);
			}
		});
	} else {
		scrape(url);
	}
}

function generateJSONUrl(url) {
	let pubId = url.match(/pubId=([^&]+)/);
	if (!pubId) return false;
	
	else if (pubId[1].startsWith("ukmhl")) {
		return "https://data.ukmhl.historicaltexts.jisc.ac.uk/elasticsearch/ukmhl/publication/" + pubId[1];
	}
	else if (pubId[1].startsWith("bl-")) {
		return "https://data.historicaltexts.jisc.ac.uk/elasticsearch/es1/ht/bl/publication/" + pubId[1];
	}
	else if (pubId[1].startsWith("ecco-")) {
		return "https://data.historicaltexts.jisc.ac.uk/elasticsearch/es1/ht/ecco/publication/" + pubId[1];
	}
	else if (pubId[1].startsWith("eebo-")) {
		return "https://data.historicaltexts.jisc.ac.uk/elasticsearch/es1/ht/eebo/publication/" + pubId[1];
	}
	else return false;
}

function scrape(url) {
	var JSONurl = generateJSONUrl(url);
	if (!JSONurl) {
		throw("Can't generate JSON ID");
	}
	
	ZU.doGet(JSONurl, function(text){
		//Z.debug(text);
		var data = JSON.parse(text);
		if (data.hits && data.hits.hits.length) {
			data = data.hits.hits[0];
		}
		var creation = data._source.lifecycle.creation;
		var publication = data._source.lifecycle.publication[0];
		var media = data._source.media[0];
		var item = new Zotero.Item("book");
		
		
		if (creation) {
			var author = creation[0].author;
			//Z.debug(author);
			if (author) {
				item.creators.push(ZU.cleanAuthor(author[0].name[0].value, "author", true));
			}
		}
		if (publication) {
			if (publication.publisher) {
				item.publisher = publication.publisher[0].name[0].value;
			}
			if (publication.place) {
				item.place = publication.place[0].name[0].value;
			}
			if (publication.date) {
				item.date = publication.date[0].value;
			}
		}
		
		item.title= data._source.summary_title;
		item.numPages = media.page_count;
		if (data._source.edition) {
			item.edition = data._source.edition[0].statement;
		}
		if (data._source.series) {
			item.volume = data._source.series[0].volume;
		}
		
		var topics = data._source.subjects.topic;
		if (topics) {
			for (let topic of topics) {
				item.tags.push(topic.name[0].value);
			}
		}
		
		item.url = url.replace(/&.+/, "");
		
		var formats = media.format;
		var pdfUrl;
		for (let format of formats) {
			if (format.type == "pdf") {
				pdfUrl = "/media/pdf/" + format.location;
				//Z.debug(pdfUrl);
				break;
			}
		}
		if (pdfUrl) {
			item.attachments.push({url: pdfUrl, title: "Historical Text PDF", mimeType: "application/pdf"});
		}
		item.complete();
	});
	

}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://data.ukmhl.historicaltexts.jisc.ac.uk/view?pubId=ukmhl-b20392497&pageId=ukmhl-b20392497-1",
		"items": [
			{
				"itemType": "book",
				"title": "Test types for determining the acuteness of vision",
				"creators": [
					{
						"firstName": "George",
						"lastName": "Cowell",
						"creatorType": "author"
					}
				],
				"date": "189-?",
				"libraryCatalog": "JISC Historical Texts",
				"numPages": 4,
				"place": "London",
				"publisher": "Printed And Sold By Harrison And Sons",
				"url": "https://data.ukmhl.historicaltexts.jisc.ac.uk/view?pubId=ukmhl-b20392497",
				"attachments": [
					{
						"title": "Historical Text PDF",
						"mimeType": "application/pdf"
					}
				],
				"tags": [
					{
						"tag": "Vision Tests"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://data.ukmhl.historicaltexts.jisc.ac.uk/view?pubId=ukmhl-b21304439_0003&pageId=ukmhl-b21304439_0003-1",
		"items": [
			{
				"itemType": "book",
				"title": "A compendium of the anatomy of the human body",
				"creators": [
					{
						"firstName": "Andrew",
						"lastName": "Fyfe",
						"creatorType": "author"
					}
				],
				"date": "1812-18",
				"edition": "Fifth edition, enlarged and improved. To which is now added, a fourth volume, containing Outlines of comparative anatomy.",
				"libraryCatalog": "JISC Historical Texts",
				"numPages": 350,
				"place": "Edinburgh",
				"publisher": "Printed By J. Pillans & Sons For Adam Black ... Etc",
				"url": "https://data.ukmhl.historicaltexts.jisc.ac.uk/view?pubId=ukmhl-b21304439_0003",
				"volume": "3",
				"attachments": [
					{
						"title": "Historical Text PDF",
						"mimeType": "application/pdf"
					}
				],
				"tags": [
					{
						"tag": "Anatomy"
					},
					{
						"tag": "Anatomy, Comparative"
					},
					{
						"tag": "Bones"
					},
					{
						"tag": "Human anatomy"
					},
					{
						"tag": "Ligaments"
					},
					{
						"tag": "Muscles"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/
