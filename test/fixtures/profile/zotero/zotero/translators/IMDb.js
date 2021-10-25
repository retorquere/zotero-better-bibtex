{
	"translatorID": "a30274ac-d3d1-4977-80f4-5320613226ec",
	"translatorType": 4,
	"label": "IMDb",
	"creator": "Philipp Zumstien",
	"target": "^https?://www\\.imdb\\.com/",
	"minVersion": "3.0",
	"maxVersion": null,
	"priority": 100,
	"inRepository": true,
	"browserSupport": "gcsibv",
	"lastUpdated": "2021-06-03 19:30:00"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2021 Philipp Zumstein
	
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
	if (url.includes('/title/tt')) {
		return "film";
	}
	else if (url.includes('/find?') && getSearchResults(doc, true)) {
		return "multiple";
	}
	return false;
}

function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = ZU.xpath(doc, '//td[contains(@class, "result_text")]');
	for (let i = 0; i < rows.length; i++) {
		var href = ZU.xpathText(rows[i], './a/@href');
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
				return;
			}
			var articles = [];
			for (var i in items) {
				articles.push(i);
			}
			ZU.processDocuments(articles, scrape);
		});
	}
	else {
		scrape(doc, url);
	}
}

function scrape(doc, _url) {
	var item = new Zotero.Item("film");
	let json = JSON.parse(text(doc, 'script[type="application/ld+json"]'));
	item.title = json.name;// note that json only has the original title
	var transTitle = ZU.trimInternal(ZU.xpathText(doc, "//h1/text()"));
	if (transTitle && transTitle !== item.title) addExtra(item, "Translated title: " + transTitle);
	item.date = json.datePublished;
	item.runningTime = "duration" in json ? json.duration.replace("PT", "").toLowerCase() : "";
	item.genre = Array.isArray(json.genre) ? json.genre.join(", ") : json.genre;
	item.abstractNote = json.description;
	var creatorsMapping = {
		director: "director",
		creator: "scriptwriter",
		actor: "contributor"
	};
	for (var role in creatorsMapping) {
		if (!json[role]) continue;
		var creators = json[role];
		if (!Array.isArray(creators)) {
			item.creators.push(ZU.cleanAuthor(creators.name, creatorsMapping[role]));
		}
		else {
			for (var i = 0; i < creators.length; i++) {
				if (creators[i]["@type"] == "Person") item.creators.push(ZU.cleanAuthor(creators[i].name, creatorsMapping[role]));
			}
		}
	}
	let companyNodes = doc.querySelectorAll('a[href*="/company/"]');
	let companies = [];
	for (let company of companyNodes) {
		companies.push(company.textContent);
	}
	item.distributor = companies.join(', ');
	var pageId = attr(doc, 'meta[property="imdb:pageConst"]', 'content');
	if (pageId) {
		addExtra(item, "IMDb ID: " + pageId);
	}
	let locationLinks = doc.querySelectorAll('a[href*="title/?country_of_origin"]');
	addExtra(item, "event-location: "
		+ [...locationLinks].map(a => a.innerText).join(', '));
	item.tags = "keywords" in json ? json.keywords.split(",") : [];
	item.complete();
}

function addExtra(item, value) {
	if (!item.extra) {
		item.extra = '';
	}
	else {
		item.extra += "\n";
	}
	item.extra += value;
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://www.imdb.com/title/tt0089276/",
		"items": [
			{
				"itemType": "film",
				"title": "La historia oficial",
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
						"firstName": "Norma",
						"lastName": "Aleandro",
						"creatorType": "contributor"
					},
					{
						"firstName": "Héctor",
						"lastName": "Alterio",
						"creatorType": "contributor"
					},
					{
						"firstName": "Chunchuna",
						"lastName": "Villafañe",
						"creatorType": "contributor"
					}
				],
				"date": "1985-11-08",
				"abstractNote": "During the final months of Argentinian Military Dictatorship in 1983, a high school teacher sets out to find out who the mother of her adopted daughter is.",
				"distributor": "Historias Cinematograficas Cinemania, Progress Communications",
				"extra": "Translated title: The Official Story\nIMDb ID: tt0089276\nevent-location: Argentina",
				"genre": "Drama, History, War",
				"libraryCatalog": "IMDb",
				"runningTime": "1h52m",
				"attachments": [],
				"tags": [
					{
						"tag": "adopted daughter"
					},
					{
						"tag": "high school teacher"
					},
					{
						"tag": "lawyer"
					},
					{
						"tag": "school"
					},
					{
						"tag": "thumb sucking"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.imdb.com/find?q=shakespeare&s=tt",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://www.imdb.com/title/tt0060613/",
		"items": [
			{
				"itemType": "film",
				"title": "Käpy selän alla",
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
					}
				],
				"date": "1966-10-21",
				"abstractNote": "Depiction of four urban youths and their excursion to the countryside.",
				"distributor": "FJ-Filmi",
				"extra": "IMDb ID: tt0060613\nevent-location: Finland",
				"genre": "Drama",
				"libraryCatalog": "IMDb",
				"runningTime": "1h29m",
				"attachments": [],
				"tags": [
					{
						"tag": "countryside"
					},
					{
						"tag": "dance"
					},
					{
						"tag": "film star"
					},
					{
						"tag": "snakebite"
					},
					{
						"tag": "topless"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/
