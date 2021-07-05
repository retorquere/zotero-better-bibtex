{
	"translatorID": "b51ac026-ed35-4c68-89bb-b42b1e1ce8f2",
	"translatorType": 4,
	"label": "MCV",
	"creator": "czar and Abe Jellinek",
	"target": "^https?://(www\\.)?mcvuk\\.com",
	"minVersion": "3.0",
	"maxVersion": null,
	"priority": 100,
	"inRepository": true,
	"browserSupport": "gcsibv",
	"lastUpdated": "2021-06-15 16:25:00"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2018-2021 czar (http://en.wikipedia.org/wiki/User_talk:Czar)
	                      and Abe Jellinek
	
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
	if (doc.querySelector('meta[name="description"]')) {
		return "magazineArticle";
	} else if (getSearchResults(doc, true)) {
		return "multiple";
	}
}


function scrape(doc, url) {
	let item = new Zotero.Item('magazineArticle');
	let json = JSON.parse(text(doc, '.tie-schema-graph'));

	item.title = decodeEntities(json.headline, doc);
	item.publicationTitle = "MCV";
	item.ISSN = "1469-4832";
	item.date = json.dateModified || json.datePublished;
	item.url = json.url;
	item.abstractNote = decodeEntities(json.description, doc);
	item.language = 'en';
	for (let tag of json.keywords.split(',')) {
		if (tag.toLowerCase().startsWith('mcv')) continue;
		item.tags.push({ tag });
	}
	item.creators.push(ZU.cleanAuthor(json.author.name, 'author'));
	if (["Staff", "Editors"].includes(item.creators[0].lastName)) {
		delete item.creators[0].firstName;                    // remove the firstName param
		item.creators[0].lastName = "MCV Editors"; // write the desired name to lastName
		item.creators[0].fieldMode = 1;                       // change to single-field mode
	}
	item.attachments.push({ document: doc, title: 'Snapshot' });
	
	item.complete();
}


function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = doc.querySelectorAll('.post-box-title');
	var links = doc.querySelectorAll('.post-box-title a');
	for (let i=0; i<rows.length; i++) {
		let href = links[i].href;
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
		case "magazineArticle":
			scrape(doc, url);
			break;
	}
}

function decodeEntities(str, doc) {
	if (!str || !str.includes('&') || !doc.createElement) {
		return str;
	}

	// https://stackoverflow.com/questions/7394748/whats-the-right-way-to-decode-a-string-that-has-special-html-entities-in-it/7394787#7394787
	var textarea = doc.createElement('textarea');
	textarea.innerHTML = str;
	return textarea.value;
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://www.mcvuk.com/business-news/no-dlc-for-rare-replay/",
		"items": [
			{
				"itemType": "magazineArticle",
				"title": "No DLC for Rare Replay",
				"creators": [
					{
						"lastName": "MCV Editors",
						"creatorType": "author",
						"fieldMode": 1
					}
				],
				"date": "2016-01-26T09:45:00+00:00",
				"ISSN": "1469-4832",
				"abstractNote": "No more games will be added to the Rare Replay collection, the studio has said.UK developer Rare hinted that more games could be added to its package of 30 titles, when engineer James Thomas said on a",
				"language": "en",
				"libraryCatalog": "MCV",
				"publicationTitle": "MCV",
				"url": "https://www.mcvuk.com/business-news/no-dlc-for-rare-replay/",
				"attachments": [
					{
						"title": "Snapshot",
						"snapshot": true,
						"mimeType": "text/html"
					}
				],
				"tags": [
					{
						"tag": "dlc"
					},
					{
						"tag": "rare"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.mcvuk.com/esports/seagull-quits-pro-overwatch-in-favour-of-streaming/",
		"items": [
			{
				"itemType": "magazineArticle",
				"title": "Seagull quits pro Overwatch in favour of streaming",
				"creators": [
					{
						"lastName": "MCV Editors",
						"creatorType": "author",
						"fieldMode": 1
					}
				],
				"date": "2017-04-14T10:30:00+01:00",
				"ISSN": "1469-4832",
				"abstractNote": "Arguably the biggest name in professional Overwatch has quit his team in order to focus on streaming. Brandon \"Seagull\" Larned rose to fame when his Twitch stream exploded during the ea",
				"language": "en",
				"libraryCatalog": "MCV",
				"publicationTitle": "MCV",
				"url": "https://www.mcvuk.com/esports/seagull-quits-pro-overwatch-in-favour-of-streaming/",
				"attachments": [
					{
						"title": "Snapshot",
						"snapshot": true,
						"mimeType": "text/html"
					}
				],
				"tags": [
					{
						"tag": "NRG"
					},
					{
						"tag": "mike-stubbs"
					},
					{
						"tag": "overwatch"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.mcvuk.com/?s=earthbound",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://www.mcvuk.com/business-news/koch-media-unveils-its-new-gaming-label-prime-matter/",
		"items": [
			{
				"itemType": "magazineArticle",
				"title": "Koch Media unveils its new gaming label, Prime Matter",
				"creators": [
					{
						"firstName": "Chris",
						"lastName": "Wallace",
						"creatorType": "author"
					}
				],
				"date": "2021-06-11T10:36:00+01:00",
				"ISSN": "1469-4832",
				"abstractNote": "Koch Media has unveiled its new gaming label, titled Prime Matter. The new label will be publishing a variety of new titles across a wide range of genres, as well as some established brands from the l",
				"language": "en",
				"libraryCatalog": "MCV",
				"publicationTitle": "MCV",
				"url": "https://www.mcvuk.com/business-news/koch-media-unveils-its-new-gaming-label-prime-matter/",
				"attachments": [
					{
						"title": "Snapshot",
						"snapshot": true,
						"mimeType": "text/html"
					}
				],
				"tags": [
					{
						"tag": "koch media"
					},
					{
						"tag": "prime matter"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/
