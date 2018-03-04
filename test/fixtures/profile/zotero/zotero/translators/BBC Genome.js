{
	"translatorID": "777e5ce0-0b16-4a12-8e6c-5a1a2cb33189",
	"label": "BBC Genome",
	"creator": "Philipp Zumstein",
	"target": "^https?://genome\\.ch\\.bbc\\.co\\.uk/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2017-09-04 22:38:30"
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


// attr()/text() v2
function attr(docOrElem,selector,attr,index){var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector);return elem?elem.getAttribute(attr):null}function text(docOrElem,selector,index){var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector);return elem?elem.textContent:null}


function detectWeb(doc, url) {
	if (url.indexOf('/search/')>-1 && getSearchResults(doc, true)) {
		return "multiple";
	} else if (text(doc, 'div.programme-details')) {
		return "magazineArticle";
	}
}

function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = doc.querySelectorAll('h2>a.title');
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
	//each magazinArticle covers one radio or tv show
	var item = new Zotero.Item("magazineArticle");
	item.title = text(doc, 'h1');
	if (item.title == item.title.toUpperCase()) {
		item.title = ZU.capitalizeTitle(item.title, true);
	}
	
	var aside = text(doc, 'aside.issue p');
	//e.g.    Issue 2384\n   7 July 1969\n   Page 16
	var parts = aside.trim().split('\n');
	item.issue = parts[0].replace('Issue', '').trim();
	if (parts.length>1) item.date = ZU.strToISO(parts[1]);
	if (parts.length>2) item.pages = parts[2].replace('Page', '').trim();
	
	var aired = text(doc, '.primary-content a');
	var urlprogram = attr(doc, '.primary-content a', 'href');
	var synopsis = text(doc, '.synopsis');
	item.notes.push({note: aired});
	if (synopsis) {
		item.abstractNote = synopsis.trim();
	}
	
	item.publicationTitle = 'The Radio Times';
	item.ISSN = '0033-8060';
	item.language = 'en-GB';
	item.url = url;
	item.itemID = url + '#magazinArticle';
	item.attachments.push({
		document: doc,
		title: "Snapshot"
	});
	
	item.complete();
	
	//we also save a seperate item for the radio/tv show and connect these two
	//by a seeAlso link
	var tv = ["bbcone", "bbctwo", "bbcthree", "bbcfour", "cbbc", "cbeebies", 
		"bbcnews", "bbcparliament", "bbchd", "bbctv", "bbcchoice", "bbcknowledge"];
	var program = urlprogram.split('/')[2];
	var type = "radioBroadcast";
	if (tv.indexOf(program)>-1) {
		type = "tvBroadcast";
	}
	
	var additionalItem = new Zotero.Item(type);
	additionalItem.title = item.title;
	var pieces = aired.split(',');
	//e.g ["BBC Radio 4 FM" , "30 September 1967 6.35"]
	additionalItem.programTitle = pieces[0];
	if (pieces.length>1) {
		var date = ZU.strToISO(pieces[1].replace(time, ''));
		var time = text(doc, '.primary-content a span.time');
		if (time.indexOf('.') == 1) {
			time = '0'+time;
		}
		additionalItem.date = date +'T'+time.replace('.', ':');
	}
	additionalItem.seeAlso.push(item.itemID);
	additionalItem.complete();
}


//Update or test the test cases does not work because of the saving of
//two items at each time. But one can create new tests from the urls
//and then delete the old tests for updating.

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://genome.ch.bbc.co.uk/09d732e273ae49e490d35ff1b69bf5f9",
		"items": [
			{
				"itemType": "magazineArticle",
				"title": "St. Hilda's Band",
				"creators": [],
				"date": "1933-10-20",
				"ISSN": "0033-8060",
				"abstractNote": "Conducted by JAMES OLIVER \nRelayed from The Town Hall, Walsall",
				"issue": "525",
				"itemID": "http://genome.ch.bbc.co.uk/09d732e273ae49e490d35ff1b69bf5f9#magazinArticle",
				"language": "en-GB",
				"libraryCatalog": "BBC Genome",
				"pages": "68",
				"publicationTitle": "The Radio Times",
				"url": "http://genome.ch.bbc.co.uk/09d732e273ae49e490d35ff1b69bf5f9",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [],
				"notes": [
					{
						"note": "Regional Programme Midland, 28 October 1933 20.00"
					}
				],
				"seeAlso": []
			},
			{
				"itemType": "radioBroadcast",
				"title": "St. Hilda's Band",
				"creators": [],
				"date": "1933-10-28T20:00",
				"libraryCatalog": "BBC Genome",
				"programTitle": "Regional Programme Midland",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": [
					"http://genome.ch.bbc.co.uk/09d732e273ae49e490d35ff1b69bf5f9#magazinArticle"
				]
			}
		]
	},
	{
		"type": "web",
		"url": "http://genome.ch.bbc.co.uk/4bad6bdda36645d7be09f44bf51eff18",
		"items": [
			{
				"itemType": "magazineArticle",
				"title": "Apollo 11",
				"creators": [],
				"date": "1969-07-17",
				"ISSN": "0033-8060",
				"abstractNote": "The First Man on the Moon\n\nShortly after 7.0 this morning astronaut Neil Armstrong should set foot on the moon. As he goes down the steps Armstrong will switch on the black and white television camera to beam live pictures back to earth. That transmission should also cover the moment when Edwin Aldrin joins Armstrong on the surface and continue throughout the two hours and forty mins. of the Moon Walk.\n\nBefore that more live pictures are expected from the Command Module as Michael Collins looks towards the moon and the landing ground from sixty miles up.\nA report by James Burke with Patrick Moore from the Apollo Space Studio and Michael Charlton at Houston Mission Control",
				"issue": "2384",
				"itemID": "http://genome.ch.bbc.co.uk/4bad6bdda36645d7be09f44bf51eff18#magazinArticle",
				"language": "en-GB",
				"libraryCatalog": "BBC Genome",
				"pages": "16",
				"publicationTitle": "The Radio Times",
				"url": "http://genome.ch.bbc.co.uk/4bad6bdda36645d7be09f44bf51eff18",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [],
				"notes": [
					{
						"note": "BBC One London, 21 July 1969 6.00"
					}
				],
				"seeAlso": []
			},
			{
				"itemType": "tvBroadcast",
				"title": "Apollo 11",
				"creators": [],
				"date": "1969-07-21T06:00",
				"libraryCatalog": "BBC Genome",
				"programTitle": "BBC One London",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": [
					"http://genome.ch.bbc.co.uk/4bad6bdda36645d7be09f44bf51eff18#magazinArticle"
				]
			}
		]
	},
	{
		"type": "web",
		"url": "http://genome.ch.bbc.co.uk/search/0/20?adv=0&q=apollo+&media=all&yf=1923&yt=2009&mf=1&mt=12&tf=00%3A00&tt=00%3A00#search",
		"items": "multiple"
	}
]
/** END TEST CASES **/