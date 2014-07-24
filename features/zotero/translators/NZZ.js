{
	"translatorID": "61ffe600-55e0-11df-bed9-0002a5d5c51b",
	"label": "NZZ",
	"creator": "ibex, Sebastian Karcher",
	"target": "^https?://(www\\.)?nzz\\.ch/.",
	"minVersion": "2.1.9",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2014-06-01 23:06:06"
}

/*
	NZZ Translator - Parses NZZ articles and creates Zotero-based metadata.
	Copyright (C) 2010&2012 ibex and Sebastian Karcher

	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
	GNU General Public License for more details.

	You should have received a copy of the GNU General Public License
	along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

/* Get the first xpath element from doc, if not found return null. */
function getXPath(xpath, doc) {
	return doc.evaluate(xpath, doc, null, XPathResult.ANY_TYPE, null).iterateNext();
}

/* Zotero API */
function detectWeb(doc, url) {
	//Zotero.debug("ibex detectWeb URL= " + url);
	if (url.match(/search\?form/)) {
		return "multiple";
	} else if (getXPath('//article[@class = "article-full"]', doc)) {
		return "newspaperArticle";
	}
}

/* Zotero API */
function doWeb(doc, url) {
	//Zotero.debug("ibex doWeb URL= " + url);
	var articles = new Array();
	var urls = new Array();
	if (detectWeb(doc, url) == "multiple") {
	var items = {};
		var titles = doc.evaluate('//hgroup/h2/a', doc, null, XPathResult.ANY_TYPE, null);
		var title;
		while (title = titles.iterateNext()) {
			//ignore topic pages;
			if (title.href.search(/\d$/)==-1) continue;
			items[title.href] = title.textContent;
		}
		Zotero.selectItems(items, function (items) {
			if (!items) {
				return true;
			}
			for (var i in items) {
				articles.push(i);
			}
			Zotero.Utilities.processDocuments(articles, scrape, function () {
				Zotero.done();
			});
		});
	} else {
		scrape(doc, url);
	}
}

/* Three types of articles: "Neue Zürcher Zeitung", "NZZ Online" and "NZZ am Sonntag" */
function scrape(doc) {
	//Zotero.debug("ibex scrape URL = " + doc.location.href);
	var newItem = new Zotero.Item('newspaperArticle');
	newItem.url = doc.location.href;
	newItem.title = Zotero.Utilities.trimInternal(getXPath('//hgroup/h1', doc).textContent);
	var date = ZU.xpathText(doc, '//hgroup/time/@datetime');
	if (date) newItem.date = date.replace(/\d\d\:\d\d:\d\d/, "").trim();
	newItem.publicationTitle = "Neue Zürcher Zeitung";
	newItem.ISSN = "0376-6829";
	newItem.language = "de";

	var titleprefix = getXPath('//hgroup/h5', doc);
	if ((titleprefix != null) && (Zotero.Utilities.trimInternal(titleprefix.textContent) != "")) {
		newItem.shortTitle = newItem.title;
		newItem.title = Zotero.Utilities.trimInternal(titleprefix.textContent) + ": " + newItem.title;
	}

	var subtitle = getXPath('//hgroup/h2', doc);
	if ((subtitle != null) && (Zotero.Utilities.trimInternal(subtitle.textContent) != "")) {
		newItem.shortTitle = newItem.title;
		newItem.title += ": " + Zotero.Utilities.trimInternal(subtitle.textContent);
	}

	var teaser = getXPath('//article/h5', doc);
	if ((teaser != null) && (Zotero.Utilities.trimInternal(teaser.textContent) != "")) {
		newItem.abstractNote = Zotero.Utilities.trimInternal(teaser.textContent);
	}

	var authorline = getXPath('//article/address/span', doc);
	if (!authorline) authorline = getXPath('//h6//span[@class="author"]', doc)
	if (authorline != null) {
		authorline = Zotero.Utilities.trimInternal(authorline.textContent);
		//assumption of authorline: "[Interview:|Von ]name1[, name2] [und Name3][, location]"
		authorline = authorline.replace(/^Von /, "");
		authorline = authorline.replace(/^Interview: /, "");
		authorline = authorline.replace(/vor Ort /i, "");
		//remove ", location"
		authorline = Zotero.Utilities.trim(authorline.replace(/, \S*$/, ""));

		var authors = authorline.split(/,|und/);
		for (var i = 0; i < authors.length && authorline.length > 0; i++) {
			newItem.creators.push(Zotero.Utilities.cleanAuthor(authors[i], "author"));
			if (!newItem.creators[i].firstName){
				newItem.creators[i].fieldMode = 1;
			}
		}
	}

	var section = getXPath('//hgroup/h6/a', doc);
	if (!section) section = getXPath('//h1/a[@class="link-info"]', doc);
	if (section != null) {
		var sectionText = Zotero.Utilities.trimInternal(section.textContent);
		if (sectionText.indexOf("NZZ am Sonntag") > -1 ) {
			newItem.publicationTitle = "NZZ am Sonntag";
			newItem.ISSN = "1660-0851";
			newItem.section = "";
		} else {
			newItem.section = sectionText;
		}
	}

	var source = getXPath('//div[@id = "content"]//span[@class="quelle"]', doc);
	if (source != null) {
		newItem.extra = Zotero.Utilities.trimInternal(source.textContent).replace(/^\(/,"").replace(/\)$/,"");
	}

	newItem.attachments.push({title:"NZZ Online Article Snapshot", mimeType:"text/html", url:doc.location.href, snapshot:true});

	newItem.complete();
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.nzz.ch/nachrichten/wirtschaft/aktuell/kuoni-gta-uebernahme-1.13276960",
		"items": [
			{
				"itemType": "newspaperArticle",
				"creators": [],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "NZZ Online Article Snapshot",
						"mimeType": "text/html",
						"snapshot": true
					}
				],
				"url": "http://www.nzz.ch/aktuell/wirtschaft/uebersicht/kuoni-gta-uebernahme-1.13276960",
				"title": "Kuoni profitiert von der GTA-Übernahme: Deutliches Umsatzplus in den ersten neun Monaten",
				"date": "2011-11-10",
				"publicationTitle": "Neue Zürcher Zeitung",
				"ISSN": "0376-6829",
				"language": "de",
				"shortTitle": "Kuoni profitiert von der GTA-Übernahme",
				"abstractNote": "Der Reisekonzern Kuoni hat in den ersten neun Monaten von der Übernahme des Reisekonzerns Gullivers Travel Associates (GTA) profitiert. Der Umsatz stieg, und der Konzern machte Gewinn.",
				"section": "Nachrichten",
				"libraryCatalog": "NZZ"
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.nzz.ch/aktuell/international/wie-ein-mexikanisches-staedtchen-die-boesewichte-vertrieb-1.17091747",
		"items": [
			{
				"itemType": "newspaperArticle",
				"creators": [
					{
						"firstName": "Matthias",
						"lastName": "Knecht",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "NZZ Online Article Snapshot",
						"mimeType": "text/html",
						"snapshot": true
					}
				],
				"url": "http://www.nzz.ch/aktuell/international/uebersicht/wie-ein-mexikanisches-staedtchen-die-boesewichte-vertrieb-1.17091747",
				"title": "Wie ein mexikanisches Städtchen die Bösewichte vertrieb: Landsgemeinde als Mittel gegen das organisierte Verbrechen und korrupte Behörden",
				"date": "2012-05-30",
				"publicationTitle": "Neue Zürcher Zeitung",
				"ISSN": "0376-6829",
				"language": "de",
				"shortTitle": "Wie ein mexikanisches Städtchen die Bösewichte vertrieb",
				"abstractNote": "Mit einem Aufstand haben die Einwohner der mexikanischen Gemeinde Cherán die Holzfällermafia vertrieben. Sie haben eine Landsgemeinde gegründet und entdeckt, dass direktdemokratische Institutionen Korruption verhindern.",
				"section": "International",
				"libraryCatalog": "NZZ"
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.nzz.ch/search?form%5Bq%5D=arbeitsmarkt",
		"items": "multiple"
	}
]
/** END TEST CASES **/