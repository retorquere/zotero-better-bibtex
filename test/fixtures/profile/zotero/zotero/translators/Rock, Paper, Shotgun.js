{
	"translatorID": "5a5b1fcd-8491-4c56-84a7-5dba19fe2c02",
	"label": "Rock, Paper, Shotgun",
	"creator": "czar",
	"target": "^https?://(www\\.)?rockpapershotgun\\.(com|de)",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2018-07-21 01:56:54"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2018 czar
	http://en.wikipedia.org/wiki/User_talk:Czar

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
	if (/\/\d{4}\/\d{2}\/\d{2}\//.test(url)) {
		return "blogPost";
	} else if (getSearchResults(doc, true)) {
		return "multiple";
	}
}


function scrape(doc, url) {
	var translator = Zotero.loadTranslator('web');
	translator.setTranslator('951c027d-74ac-47d4-a107-9c3069ab7b48'); // embedded metadata (EM)
	translator.setDocument(doc);
	
	translator.setHandler('itemDone', function (obj, item) { // corrections to EM
		item.itemType = "blogPost";
		item.publicationTitle = "Rock, Paper, Shotgun";
		item.date = ZU.strToISO(url.match(/\d{4}\/\d{2}\/\d{2}/));
		item.tags = []; // reset bad tag metadata
		var tags = doc.querySelectorAll('.tags a');
		for (let tagObj of tags) {
			var tag = tagObj.textContent;
			if (tag == tag.toLowerCase()) {
				tag = tag.replace(/\w/, c => c.toUpperCase());
			}
			item.tags.push(tag);
		}
		item.creators = []; // reset bad author metadata
		var tld = url.match(/\.com|\.de/);
		var jsonURL = 'https://www.rockpapershotgun'+tld+'/wp-json/oembed/1.0/embed?url='+url;
		ZU.doGet(jsonURL, function(text) {
			var isValidJSON = true;
			try { JSON.parse(text) } catch (e) { isValidJSON = false }
			if (isValidJSON) {
				var json = JSON.parse(text);
				if (json.author_name) {
					item.creators.push(ZU.cleanAuthor(json.author_name, "author"));
					if (item.creators[0].lastName == "UK") {
						delete item.creators[0].firstName;      // remove the firstName param
						item.creators[0].lastName = "RPS UK";	// write the desired name to lastName
						item.creators[0].fieldMode = 1;         // change to single-field mode
					}
				}
			}
			item.complete();
		});
	});

	translator.getTranslatorObject(function(trans) {
		trans.doWeb(doc, url);
	});
}


function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = doc.querySelectorAll('.content h1 a, .block td a, main p.title a, div.gsc-thumbnail-inside a.gs-title');
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
	switch (detectWeb(doc, url)) {
		case "multiple":
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
			break;
		default:
			scrape(doc, url);
			break;
	}
}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://www.rockpapershotgun.com/2015/12/04/dr-langeskov-the-tiger-and-the-terribly-cursed-emerald-a-whirlwind-heist-review/",
		"items": [
			{
				"itemType": "blogPost",
				"title": "Wot I Think – Dr. Langeskov, The Tiger and The Terribly Cursed Emerald: A Whirlwind Heist",
				"creators": [
					{
						"firstName": "Alec",
						"lastName": "Meer",
						"creatorType": "author"
					}
				],
				"date": "2015-12-04",
				"abstractNote": "Dr. Langeskov, The Tiger and The Terribly Cursed Emerald: A Whirlwind Heist is the new game from the new studio from William Pugh, co-developer of The Stanley",
				"blogTitle": "Rock, Paper, Shotgun",
				"language": "en-US",
				"shortTitle": "Wot I Think – Dr. Langeskov, The Tiger and The Terribly Cursed Emerald",
				"url": "https://www.rockpapershotgun.com/2015/12/04/dr-langeskov-the-tiger-and-the-terribly-cursed-emerald-a-whirlwind-heist-review/",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					{
						"tag": "Crows Crows Crows"
					},
					{
						"tag": "Dr. Langeskov The Tiger and The Terribly Cursed Emerald: A Whirlwind Heist"
					},
					{
						"tag": "Feature"
					},
					{
						"tag": "Free"
					},
					{
						"tag": "Review"
					},
					{
						"tag": "The Beginner's Guide"
					},
					{
						"tag": "The Stanley Parable"
					},
					{
						"tag": "William Pugh"
					},
					{
						"tag": "Wot i think"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.rockpapershotgun.com/2012/02/23/thought-mass-effects-day-one-dlc-explained-considered/",
		"items": [
			{
				"itemType": "blogPost",
				"title": "Thought: Mass Effect’s Day One DLC Explained, Pondered",
				"creators": [
					{
						"firstName": "John",
						"lastName": "Walker",
						"creatorType": "author"
					}
				],
				"date": "2012-02-23",
				"abstractNote": "A cause of occasional, but rather fervent ire of recent times has been day one DLC. Why do people get pissed off? Because times were you’d buy a game, and",
				"blogTitle": "Rock, Paper, Shotgun",
				"language": "en-US",
				"shortTitle": "Thought",
				"url": "https://www.rockpapershotgun.com/2012/02/23/thought-mass-effects-day-one-dlc-explained-considered/",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					{
						"tag": "BioWare"
					},
					{
						"tag": "DLC"
					},
					{
						"tag": "Electronic Arts"
					},
					{
						"tag": "Mass Effect 3"
					},
					{
						"tag": "day one DLC"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.rockpapershotgun.com/category/free-pc-games/",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://www.rockpapershotgun.com/?s=earthbound",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://www.rockpapershotgun.de/",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://www.rockpapershotgun.de/2018/04/27/eastward-sieht-aus-wie-ein-umwerfend-huebscher-last-of-us-vorfahre-aus-der-snes-aera/",
		"items": [
			{
				"itemType": "blogPost",
				"title": "Eastward sieht aus wie ein (umwerfend hübscher) Last-of-Us-Vorfahre aus der SNES-Ära",
				"creators": [
					{
						"lastName": "RPS UK",
						"creatorType": "author",
						"fieldMode": 1
					}
				],
				"date": "2018-04-27",
				"blogTitle": "Rock, Paper, Shotgun",
				"language": "de-DE",
				"url": "https://www.rockpapershotgun.de/2018/04/27/eastward-sieht-aus-wie-ein-umwerfend-huebscher-last-of-us-vorfahre-aus-der-snes-aera/",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					{
						"tag": "Chucklefish"
					},
					{
						"tag": "Eastward"
					},
					{
						"tag": "Pixpil"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/
