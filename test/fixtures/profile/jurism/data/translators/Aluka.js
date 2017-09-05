{
	"translatorID": "e8fc7ebc-b63d-4eb3-a16c-91da232f7220",
	"label": "Aluka",
	"creator": "Philipp Zumstein",
	"target": "^https?://(www\\.)aluka\\.org/(stable/|struggles/search\\?|struggles/collection/)",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2016-09-27 06:02:24"
}

/*
	***** BEGIN LICENSE BLOCK *****
	
	Copyright © 2016 Philipp Zumstein
	
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


function detectWeb(doc, url){
	var type = ZU.xpathText(doc, '//div[contains(@class, "resource-type")]//div[contains(@class, "metadata-value")]');
	var itemType = typeMap[type]
	if (itemType) {
		return itemType
	} else if (getSearchResults(doc, true)) {
		return "multiple";
	} else {
		Z.debug("Unrecognized type: " + type);
		return "report";
	}
}

// Aluka types we can import
// TODO: Improve support for other Aluka item types?
// Correspondence, Circulars, Newsletters, Interviews, Pamphlets, Policy Documents, Posters, Press Releases, Reports, Testimonies, Transcripts
var typeMap = {
	"Books":"book",
	"Aluka Essays":"report",
	"photograph":"artwork",
	"Photographs":"artwork",
	"Slides (Photographs)": "artwork",
	"Panoramas":"artwork",
	"Journals (Periodicals)":"journalArticle",
	"Magazines (Periodicals)" : "magazineArticle",
	"Articles":"journalArticle",
	"Correspondence":"letter",
	"Letters (Correspondence)" : "letter",
	"Interviews":"interview",
	"Reports":"report",
	"Transcripts":"presentation",
	"Memorandums":"report"
}

function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = ZU.xpath(doc, '//h3[@class="title"]/a');
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
	var itemType = detectWeb(doc, url);
	var newItem = new Zotero.Item(itemType);
	newItem.title = ZU.xpathText(doc, '//h1[contains(@class, "title")]');
	var rows = ZU.xpath(doc, '//section[contains(@class, "metadata-section")]/div[contains(@class, "row")]');
	for (var i=0; i<rows.length; i++) {
		var label = rows[i].className.replace("row", "").trim();
		var values = ZU.xpathText(rows[i], './/div[contains(@class, "metadata-value")]', null, "|");
		//Z.debug(label); Z.debug(values);
		switch (label) {
			case "date":
				newItem.date = values;
				break;
			case "topic":
			case "coverage-spatial":
			case "coverage-temporal":
				var tags = values.split("|");
				for (var j=0; j<tags.length; j++) {
					newItem.tags.push(ZU.cleanTags(tags[j]));
				}
				break;
			case "author":
				var authors = values.split("|");
				for (var j=0; j<authors.length; j++) {
					newItem.creators.push(ZU.cleanAuthor(authors[j], "author", true));
				}
				break;
			case "contributor":
				var authors = values.split("|");
				for (var j=0; j<authors.length; j++) {
					newItem.creators.push(ZU.cleanAuthor(authors[j], "contributor", true));
				}
				break;
			case "publisher":
				newItem.publisher = values;
				break;
			case "description":
				newItem.abstractNote = values;
				break;
			case "language":
				newItem.language = values;
				break;
			case "format-extent-lenghtsize":
				newItem.numPages = values;
				break;
			case "attribution":
				newItem.rights = values;
				break;
			case "collection":
				newItem.series = values;
				break;
			case "repository":
				newItem.archive = values;
				break;
			case "source":
				//newItem.extra = values;
				break;
		}
	}
	newItem.url = url;
	newItem.complete();
}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.aluka.org/struggles/search?so=ps_collection_name_str+asc&Query=argentina",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://www.aluka.org/stable/10.5555/AL.SFF.DOCUMENT.ydlwcc0342",
		"items": [
			{
				"itemType": "letter",
				"title": "[Letter from P. Abrecht (WCC, Geneva) to L. Nillus, Buenos Aires]",
				"creators": [
					{
						"firstName": "Programme to Combat Racism",
						"lastName": "World Council of Churches",
						"creatorType": "author"
					},
					{
						"firstName": "Paul",
						"lastName": "Abrecht",
						"creatorType": "author"
					}
				],
				"date": "1968-12-13",
				"archive": "World Council of Churches",
				"language": "English",
				"libraryCatalog": "Aluka",
				"rights": "By kind permission of the World Council of Churches (WCC).",
				"url": "http://www.aluka.org/stable/10.5555/AL.SFF.DOCUMENT.ydlwcc0342",
				"attachments": [],
				"tags": [
					"1969",
					"Argentina",
					"Brazil",
					"Colombia",
					"Global",
					"Regional And International Contexts",
					"United Kingdom"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.aluka.org/stable/10.5555/al.sff.document.af000284?searchUri=so%3Dps_collection_name_str%2Basc%26Query%3Dstruggle",
		"items": [
			{
				"itemType": "presentation",
				"title": "Nelson Mandela Speaks to Workers About the Struggle for Freedom in South Africa",
				"creators": [
					{
						"firstName": "Nelson",
						"lastName": "Mandela",
						"creatorType": "author"
					},
					{
						"lastName": "Africa Fund",
						"creatorType": "contributor"
					},
					{
						"lastName": "National Union of Mineworkers",
						"creatorType": "contributor"
					}
				],
				"date": "1991-04",
				"abstractNote": "Struggle for Freedom. African National Congress. Nelson Mandela. National Union of Mineworkers. Political violence. Negotiations. F. W. de Klerk. Adriaan Vlok. NUM. ANC. Inkatha. Political Prisoners. Apartheid. Resolution on Sanctions. White domination. Anti-apartheid movement. Death squads. Police. Soweto. COSATU. Gold. Human rights. Goldstone. Investment code. General Van der Merwe. Sebokeng. Interim government. Constituent Assembly. Democratic government.",
				"language": "English",
				"rights": "By kind permission of Africa Action, incorporating the American Committee on Africa, The Africa Fund, and the Africa Policy Information Center.",
				"url": "http://www.aluka.org/stable/10.5555/al.sff.document.af000284?searchUri=so%3Dps_collection_name_str%2Basc%26Query%3Dstruggle",
				"attachments": [],
				"tags": [
					"1990 - 1991",
					"Economic Systems",
					"Internal Conflicts",
					"Judicial Systems",
					"North America",
					"Popular Resistance",
					"Regional And International Contexts",
					"South Africa",
					"The Colonial System And Its Consequences",
					"Wars Of Liberation, Internal Conflicts, And Destabilization"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/