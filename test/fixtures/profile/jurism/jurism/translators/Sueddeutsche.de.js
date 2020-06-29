{
	"translatorID": "2e4ebd19-83ab-4a56-8fa6-bcd52b576470",
	"label": "Sueddeutsche.de",
	"creator": "Martin Meyerhoff",
	"target": "^https?://www\\.sueddeutsche\\.de",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2017-06-24 21:03:57"
}

/*
Sueddeutsche.de Translator
Copyright (C) 2011 Martin Meyerhoff

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

/*
This one has the search function on a different host, so I cannot scan the search results. A multiple option, though, is given for the page itself.
Test here:
http://www.sueddeutsche.de/politik
http://www.sueddeutsche.de/thema/Krieg_in_Libyen
http://www.sueddeutsche.de/muenchen

Reference article: http://www.sueddeutsche.de/wissen/embryonale-stammzellen-wo-sind-die-naiven-1.1143034
*/

function detectWeb(doc, url) {
	if (ZU.xpathText(doc, '//h2/strong')) {
		return "newspaperArticle";
	} else if (ZU.xpath(doc, '//div[@id="topthemen" or @class="panoramateaser" \
						or contains(@class,"maincolumn") or contains(@class, "teaser")]\
						//a[starts-with(@class,"entry-title") \
						and starts-with(@href,"http://www.sueddeutsche.de") \
						and not(contains(@href,"/app/"))]').length){
		return "multiple";
	}
}

function scrape(doc, url) {
	//don't parse things like image galleries
	//e.g. http://www.sueddeutsche.de/kultur/thomas-manns-villa-in-los-angeles-weimar-am-pazifik-1.1301388
	if (!ZU.xpathText(doc, '//h2/strong')) return;

	var newItem = new Zotero.Item("newspaperArticle");
	newItem.url = url;

	var title = ZU.xpathText(doc, '//meta[contains(@property, "og:title")]/@content');
	newItem.title = Zotero.Utilities.trim(title.replace(/\s?–\s?/, ": "));

	// Author. This is tricky, the SZ uses the author field for whatever they like.
	// Sometimes, there is no author.
	var author =  ZU.xpathText(doc, '//section[contains(@class, "authors")]//span[contains(@class, "moreInfo")]/strong')

	// One case i've seen: A full sentence as the "author", with no author in it.
	if (author && author.trim().charAt(author.length - 1) != '.') {
		author = author.replace(/^\s*Von\s|Ein Kommentar von/i, '')
		// For multiple Authors, the SZ uses comma, und and u
						.split(/\s+(?:und|u|,)\s+/);

		for (var i in author) {
			if (author[i].match(/\s/)) { // only names that contain a space!
				newItem.creators.push(ZU.cleanAuthor(author[i], "author"));
			}
		}
	}

	// summary
	newItem.abstractNote = ZU.xpathText(doc, '//meta[contains(@property, "og:description")]/@content');

	// Date
	newItem.date = ZU.xpathText(doc, "//time[@class='timeformat']");
	if (newItem.date) {
		newItem.date = ZU.strToISO(newItem.date);
	}

	// Section
	var section = url.match(/sueddeutsche\.de\/([^\/]+)/);
	newItem.section = ZU.capitalizeTitle(section[1]);

	// Tags
	var tags = ZU.xpathText(doc, '//meta[@name="keywords"]/@content');
	if (tags) {
		tags = tags.split(/\s*,\s+/);
		for (var i=0, n=tags.length; i<n; i++) {
			newItem.tags.push(ZU.trimInternal(tags[i]));
		}
	}

	// Publication
	newItem.publicationTitle = "sueddeutsche.de"
	newItem.ISSN = "0174-4917";
	newItem.language = "de";

	// Attachment. inserting /2.220/ gives us a printable version
	var printurl = url.replace(/(.*\/)(.*$)/, '$12.220/$2');
	newItem.attachments.push({
		url: printurl,
		title: "Snapshot",
		mimeType: "text/html",
		snapshot: true
	});

	newItem.complete()
}

function doWeb(doc, url) {
	if (detectWeb(doc, url) == "multiple") {
		var links = ZU.xpath(doc,
						'//div[@id="topthemen" or @class="panoramateaser" \
						or contains(@class,"maincolumn") or contains(@class, "teaser")]\
						//a[starts-with(@class,"entry-title") \
						and starts-with(@href,"http://www.sueddeutsche.de") \
						and not(contains(@href,"/app/"))]');

		var items = new Object();
		var title;
		for (var i=0, n=links.length; i<n; i++) {
			title = ZU.xpathText(links[i], './node()[not(self::div)]', null, '');
			items[links[i].href] = ZU.trimInternal(title);
		}

		Zotero.selectItems(items, function(items) {
			if (!items) return true;

			var articles = new Array();
			for (var i in items) {
				articles.push(i);
			}
			ZU.processDocuments(articles, scrape);
		});
	} else {
		scrape(doc, url);
	}
}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.sueddeutsche.de/politik/verdacht-gegen-hessischen-verfassungsschuetzer-spitzname-kleiner-adolf-1.1190178",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Spitzname \"Kleiner Adolf\"",
				"creators": [
					{
						"firstName": "Peter",
						"lastName": "Blechschmidt",
						"creatorType": "author"
					},
					{
						"firstName": "Marc",
						"lastName": "Widmann",
						"creatorType": "author"
					}
				],
				"date": "2011-11-16",
				"ISSN": "0174-4917",
				"abstractNote": "Als die Zwickauer Zelle in einem Kasseler Internet-Café Halit Y. hinrichtet, surft ein hessischer Verfassungsschützer dort im Netz. In seiner Wohnung findet die Polizei später Hinweise auf eine rechtsradikale Gesinnung - doch die Ermittlungen gegen den Mann werden eingestellt. Dabei bleiben viele Fragen offen.",
				"language": "de",
				"libraryCatalog": "Sueddeutsche.de",
				"publicationTitle": "sueddeutsche.de",
				"section": "politik",
				"url": "http://www.sueddeutsche.de/politik/verdacht-gegen-hessischen-verfassungsschuetzer-spitzname-kleiner-adolf-1.1190178",
				"attachments": [
					{
						"title": "Snapshot",
						"mimeType": "text/html",
						"snapshot": true
					}
				],
				"tags": [
					"Internet",
					"Politik",
					"Polizei",
					"SZ",
					"Süddeutsche Zeitung",
					"rechter Terror"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.sueddeutsche.de/politik",
		"items": "multiple"
	}
]
/** END TEST CASES **/