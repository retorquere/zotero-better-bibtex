{
	"translatorID": "4f0d0c90-5da0-11df-a08a-0800200c9a66",
	"label": "FAZ.NET",
	"creator": "ibex, Sebastian Karcher",
	"target": "^https?://((www\\.)?faz\\.net/.)",
	"minVersion": "2.1",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2016-09-19 21:07:47"
}

/*
	FAZ Translator - Parses FAZ articles and creates Zotero-based metadata.
	Copyright (C) 2010-2012 ibex and Sebastian Karcher

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


/* Zotero API */

function detectWeb(doc, url) {

	//Zotero.debug("ibex detectWeb URL= "+ url);
	if (doc.title == "Suche und Suchergebnisse - FAZ" && getSearchResults(doc, true)) {
		return "multiple";
	} else if (ZU.xpathText(doc, '//div[@class = "FAZArtikelEinleitung"]')) {
		return "newspaperArticle";
	}
}

function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	//make sure we don't get media objects
	var rows = ZU.xpath(doc, '//div[not(descendant::span[@class="icon-play30"])]/a[@class="TeaserHeadLink"]');
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
	var newArticle = new Zotero.Item('newspaperArticle');
	newArticle.url = url;
	newArticle.title = ZU.trimInternal(ZU.xpathText(doc, '//div[@class = "FAZArtikelEinleitung"]/h2').trim().replace(/\n/g,":")).replace(/^,/, "");
	var date = ZU.xpathText(doc, '(//span[@class="Datum"])[1]/@content');
	if (date) newArticle.date = ZU.trimInternal(date.replace(/T.+$/, ""));
	var teaser = ZU.xpathText(doc, '//div[@class="FAZArtikelEinleitung"]/p[@class = "Copy"]');
	if (teaser != null) {
		newArticle.abstractNote = Zotero.Utilities.trimInternal(teaser).replace(/^,\s*/, "");
	}

	//some authors are in /a, some aren't we need to distinguish to get this right
	if (ZU.xpathText(doc, '//div[@class="FAZArtikelEinleitung"]/span[@class = "Autor"]/span[contains(@class, "caps")]/a') != null) {
		var xpath = '//div[@class="FAZArtikelEinleitung"]/span[@class = "Autor"]/span[contains(@class, "caps")]/a';
	} else {
		var xpath = '//div[@class="FAZArtikelEinleitung"]/span[@class ="Autor"]/span/span[contains(@class, "caps")]';
	};
	var authors = ZU.xpath(doc, xpath);
	
		for (i in authors) {
			newArticle.creators.push(Zotero.Utilities.cleanAuthor(authors[i].textContent, "author"));
		}

	newArticle.publicationTitle = "Frankfurter Allgemeine Zeitung";

	var section = ZU.xpathText(doc, '//ul[@id="nav"]/li/span[@class = "Selected"]');
	if (section != null) {
		newArticle.section = Zotero.Utilities.trimInternal(section);
	}

	var source = ZU.xpath(doc, '//div[@id="MainColumn"]/div[@class = "Article"]/p[@class = "ArticleSrc"]').innerHTML;
	if (source != null) {
		//	newArticle.extra = ZU.trimInternal(ZU.cleanTags(source));
	}
	//language
	var language = ZU.xpathText(doc, '//meta[@name="language"]/@content');
	if (language != null) newArticle.language = language;
	else newArticle.language = "de-DE";
	
	newArticle.ISSN = "0174-4909";
	newArticle.attachments.push({
		title: "FAZ.NET Article Snapshot",
		mimeType: "text/html",
		url: doc.location.href,
		snapshot: true
	});

	newArticle.complete();
}

/* There is no built-in function to count object properties which often are used as associative arrays.*/

function countObjectProperties(obj) {
	var size = 0;
	for (var key in obj) {
		if (obj.hasOwnProperty(key)) size++;
	}
	return size;
};
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.faz.net/sonntagszeitung/wissenschaft/wissenschaftsphilosophie-krumme-wege-der-vernunft-1654864.html",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Wissenschaftsphilosophie: Krumme Wege der Vernunft",
				"creators": [
					{
						"firstName": "Fynn Ole",
						"lastName": "Engler",
						"creatorType": "author"
					},
					{
						"firstName": "Jürgen",
						"lastName": "Renn",
						"creatorType": "author"
					}
				],
				"date": "2011-06-13",
				"ISSN": "0174-4909",
				"abstractNote": "Wissenschaft hat eine Geschichte, wie kann sie dann aber rational sein? Im Briefwechsel zwischen Ludwik Fleck und Moritz Schlick deuteten sich bereits Antworten an.",
				"language": "de-DE",
				"libraryCatalog": "FAZ.NET",
				"publicationTitle": "Frankfurter Allgemeine Zeitung",
				"shortTitle": "Wissenschaftsphilosophie",
				"url": "http://www.faz.net/sonntagszeitung/wissenschaft/wissenschaftsphilosophie-krumme-wege-der-vernunft-1654864.html",
				"attachments": [
					{
						"title": "FAZ.NET Article Snapshot",
						"mimeType": "text/html",
						"snapshot": true
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
		"url": "http://www.faz.net/suche/?query=argentinien&suchbegriffImage.x=0&suchbegriffImage.y=0&resultsPerPage=20",
		"items": "multiple"
	}
]
/** END TEST CASES **/
