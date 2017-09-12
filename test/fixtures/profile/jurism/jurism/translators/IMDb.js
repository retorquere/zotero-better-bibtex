{
	"translatorID": "a30274ac-d3d1-4977-80f4-5320613226ec",
	"label": "IMDb",
	"creator": "Avram Lyon",
	"target": "^https?://www\\.imdb\\.com/",
	"minVersion": "2.1",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsbv",
	"lastUpdated": "2015-09-23 21:04:11"
}

/*
	***** BEGIN LICENSE BLOCK *****

	IMDB Translator
	Copyright © 2011 Avram Lyon, ajlyon@gmail.com

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
	if (url.match(/\/title\/tt\d+/)) {
		return "film";
	} else if (url.match(/\/find\?/)) {
		return "multiple";
	}
}

function doWeb(doc, url) {
	var n = doc.documentElement.namespaceURI;
	var ns = n ?
	function (prefix) {
		if (prefix == 'x') return n;
		else return null;
	} : null;

	var ids = new Array();
	if (detectWeb(doc, url) == "multiple") {
		var results = doc.evaluate('//td[a[contains(@href,"/title/tt")]]', doc, ns, XPathResult.ANY_TYPE, null);
		var items = {};
		var result;
		while (result = results.iterateNext()) {
			var link = doc.evaluate('./a[contains(@href,"/title/tt")]', result, ns, XPathResult.ANY_TYPE, null).iterateNext();
			var title = result.textContent;
			//Zotero.debug(link.href);
			var url = link.href.match(/\/title\/(tt\d+)/)[1];
			items[url] = title;
		}

		Zotero.selectItems(items, function (items) {
			if (!items) {
				Zotero.done();
				return true;
			}
			for (var i in items) {
				ids.push(i);
			}
			apiFetch(ids);
		});
	} else {
		var id = url.match(/\/title\/(tt\d+)/)[1];
		apiFetch([id]);
	}
}

// Takes IMDB IDs and makes items
function apiFetch(ids) {
	var apiRoot = "http://omdbapi.com/?i="; //&tomatoes=true removed as it often breaks the API
	for (i in ids) ids[i] = apiRoot + ids[i];
	Zotero.Utilities.doGet(ids, parseIMDBapi);
}

// parse result from imdbapi.com
// should be json
function parseIMDBapi(text, response, url) {
	//Zotero.debug(url);
	//Zotero.debug(text);
	try {
		var obj = JSON.parse(text);
	} catch (e) {
		Zotero.debug("JSON parse error");
		throw e;
	}
	var item = new Zotero.Item("film");
	item.title = obj.Title;
	item.date = obj.Released ? obj.Released : obj.Year;
	item.genre = obj.Genre;
	if (obj.Director) item = addCreator(item, obj.Director, "director");
	if (obj.Writer) item = addCreator(item, obj.Writer, "scriptwriter");
	if (obj.Actors) item = addCreator(item, obj.Actors, "contributor");
	item.abstractNote = obj.Plot;
	item.attachments.push({
		url: obj.Poster,
		title: "Poster"
	});
	item.runningTime = obj.Runtime;
	item.extra = "IMDB ID: " + obj.imdbID;
	item.extra += "\nIMDB Rating: " + obj.imdbRating + " (" + obj.imdbVotes + " votes)";
	//rotten tomatoes ranking break the API frequently
	//item.extra += "; Rotten Tomatoes: " + obj.tomatoRating + " (" + obj.tomatoReviews + " reviews " + " " + obj.tomatoFresh + " fresh, " + obj.tomatoRotten + " rotten)" + ", Tomato Meter: " + obj.tomatoMeter;
	item.complete();
}

function addCreator(item, creator, type) {
	if (creator == "N/A") {
		Zotero.debug("Discarding " + type + "=" + creator);
		return item;
	}
	var broken = creator.split(",");
	for (i in broken) {
		item.creators.push(Zotero.Utilities.cleanAuthor(broken[i], type));
	}
	return item;
}
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.imdb.com/title/tt0089276/",
		"items": [
			{
				"itemType": "film",
				"title": "The Official Story",
				"creators": [
					{
						"firstName": "Luis",
						"lastName": "Puenzo",
						"creatorType": "director"
					},
					{
						"firstName": "Aída",
						"lastName": "Bortnik",
						"creatorType": "scriptwriter"
					},
					{
						"firstName": "Luis",
						"lastName": "Puenzo",
						"creatorType": "scriptwriter"
					},
					{
						"firstName": "Héctor",
						"lastName": "Alterio",
						"creatorType": "contributor"
					},
					{
						"firstName": "Norma",
						"lastName": "Aleandro",
						"creatorType": "contributor"
					},
					{
						"firstName": "Chunchuna",
						"lastName": "Villafañe",
						"creatorType": "contributor"
					},
					{
						"firstName": "Hugo",
						"lastName": "Arana",
						"creatorType": "contributor"
					}
				],
				"date": "08 Nov 1985",
				"abstractNote": "After the end of the Dirty War, a high school teacher sets out to find out who the mother of her adopted daughter is.",
				"extra": "IMDB ID: tt0089276\nIMDB Rating: 7.8 (5,300 votes)",
				"genre": "Drama, History, War",
				"libraryCatalog": "IMDb",
				"runningTime": "112 min",
				"attachments": [
					{
						"title": "Poster"
					}
				],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.imdb.com/find?q=shakespeare&s=tt",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://www.imdb.com/title/tt0060613/",
		"items": [
			{
				"itemType": "film",
				"title": "Skin, Skin",
				"creators": [
					{
						"firstName": "Mikko",
						"lastName": "Niskanen",
						"creatorType": "director"
					},
					{
						"firstName": "Robert",
						"lastName": "Alfthan",
						"creatorType": "scriptwriter"
					},
					{
						"firstName": "Marja-Leena",
						"lastName": "Mikkola",
						"creatorType": "scriptwriter"
					},
					{
						"firstName": "Eero",
						"lastName": "Melasniemi",
						"creatorType": "contributor"
					},
					{
						"firstName": "Kristiina",
						"lastName": "Halkola",
						"creatorType": "contributor"
					},
					{
						"firstName": "Pekka",
						"lastName": "Autiovuori",
						"creatorType": "contributor"
					},
					{
						"firstName": "Kirsti",
						"lastName": "Wallasvaara",
						"creatorType": "contributor"
					}
				],
				"date": "21 Oct 1966",
				"abstractNote": "Depiction of four urban youths and their excursion to the countryside.",
				"extra": "IMDB ID: tt0060613\nIMDB Rating: 7.0 (466 votes)",
				"genre": "Drama",
				"libraryCatalog": "IMDb",
				"runningTime": "89 min",
				"attachments": [
					{
						"title": "Poster"
					}
				],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/