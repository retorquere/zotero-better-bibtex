{
	"translatorID": "488fe1e0-b7d2-406f-8257-5060418ce9b2",
	"label": "fr-online.de",
	"creator": "Martin Meyerhoff",
	"target": "^https?://www\\.fr-online\\.de",
	"minVersion": "2.1.9",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2014-04-03 17:37:43"
}

/*
fr-online.de Translator
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
Works w/ search and overviews. I had to include the ugly hack stopping non-articles (photo-streams) to make the multiple item import return an error. Test on:
http://www.fr-online.de/politik/spezials/wikileaks---die-enthuellungsplattform/-/4882932/4882932/-/index.html
http://www.fr-online.de/page/search/fr-online/home/suche/-/1473784/1473784/-/view/asSearch/-/index.html?contextsIds=1472660&docTypes=%22MauArticle,MauGallery,DMBrightcoveVideo,CMDownload,DMMovie,DMEvent,DMVenue%22&offset=5&pageNumber=2&searchMode=SIMPLEALL&sortBy=maupublicationdate&userQuery=Wikileaks
http://www.fr-online.de/wirtschaft/krise/-/1471908/1471908/-/index.html
http://www.fr-online.de/wirtschaft/krise/portugal-koennte-rettungspaket-benoetigen/-/1471908/8251842/-/index.html
*/

function detectWeb(doc, url) {
	var FR_article_XPath = "//h1[contains(@class, 'ArticleHeadline')]|//h1[contains(@class, 'Title')]";
	var FR_multiple_XPath = ".//*[@id='ContainerContent']/div//div[contains(@class, 'ItemHeadline')]/a"


	if (doc.evaluate(FR_article_XPath, doc, null, XPathResult.ANY_TYPE, null).iterateNext()) {
		//Zotero.debug("newspaperArticle");
		return "newspaperArticle";
	} else if (doc.location.href.match(/^http\:\/\/www\.fr-online\.de\/.*?page\/search/)) {
		//Zotero.debug("multiple");
		return "multiple";
	} else if (doc.evaluate(FR_multiple_XPath, doc, null, XPathResult.ANY_TYPE, null).iterateNext()) {
		//Zotero.debug("multiple");
		return "multiple";
	}
}

function authorCase(author) { // Turns All-Uppercase-Authors to normally cased Authors
	var words = author.split(/\s/);
	var authorFixed = '';
	for (var i in words) {
		words[i] = words[i][0].toUpperCase() + words[i].substr(1).toLowerCase();
		authorFixed = authorFixed + words[i] + ' ';
	}
	return (authorFixed);
}

function scrape(doc, url) {
	if (detectWeb(doc, url) =="newspaperArticle"){
		Z.debug("here")
		var newItem = new Zotero.Item("newspaperArticle");
		newItem.url = doc.location.href;


		// This is for the title!
		var title_XPath = '//title'
		var title = doc.evaluate(title_XPath, doc, null, XPathResult.ANY_TYPE, null).iterateNext().textContent;
		newItem.title = title.split("|")[0].replace(/^\s*|\s*$/g, '');

		// This is for the author!
		var author_XPath = '//meta[@name="author"]';
		var author = doc.evaluate(author_XPath, doc, null, XPathResult.ANY_TYPE, null).iterateNext().content;
		author = author.split(/\,\s|\sund\s/g);
		if (author[0].match(/Rundschau/)) { // Frankfurter Rundschau is no author.
			author[0] = "";
		}
		for (var i in author) {
			if (author[i].match(/\s/)) { // only names that contain a space!
				author[i] = Zotero.Utilities.trim(author[i]);
				author[i] = authorCase(author[i]);
				newItem.creators.push(Zotero.Utilities.cleanAuthor(author[i], "author"));
			}
		}

		//Summary
		var summary_XPath = '//meta[@name="description"]';
		if (doc.evaluate(summary_XPath, doc, null, XPathResult.ANY_TYPE, null).iterateNext()) {
			var summary = doc.evaluate(summary_XPath, doc, null, XPathResult.ANY_TYPE, null).iterateNext().content;
			newItem.abstractNote = Zotero.Utilities.trim(summary);
		}

		//Date	
		var date_XPath = ".//div[contains(@class, 'Date')]";
		var date = doc.evaluate(date_XPath, doc, null, XPathResult.ANY_TYPE, null).iterateNext().textContent;
		newItem.date = date.trim();

		// No Tags. FR does not provide consistently meaningful ones.
		// Publikation
		newItem.publicationTitle = "fr-online.de"

		// Section
		var section_XPath = '//title'
		var section = doc.evaluate(section_XPath, doc, null, XPathResult.ANY_TYPE, null).iterateNext().textContent;
		section = section.split(/\||-/);
		newItem.section = section[1].replace(/^\s*|\s*$/g, '');

		//Language
		var language = ZU.xpathText(doc, '//meta[@http-equiv="content-language"]/@content');
		if (language != null) newItem.language = language;

		// Attachment
		var printurl = doc.location.href;
		if (printurl.match("asFirstTeaser")) {
			printurl = printurl.replace("asFirstTeaser", "printVersion");
		} else {
			printurl = printurl.replace(/\-\/index.html$/, "-/view/printVersion/-/index.html");
		}
		newItem.attachments.push({
			url: printurl,
			title: newItem.title,
			mimeType: "text/html"
		});
		newItem.complete()
	}

}

function doWeb(doc, url) {

	var articles = new Array();

	if (detectWeb(doc, url) == "multiple") {
		var items = new Object();

		var titles = doc.evaluate(".//*[@id='ContainerContentLinie']/div/h2/a|.//*[@id='ContainerContent']/div/div[contains(@class, 'Headline2')]/a|.//*[@id='ContainerContent']/div/div/div[contains(@class, 'link_article')]/a|.//*[@id='Main']/div[contains(@class, '2ColHP')]/div/div/div[contains(@class, 'Headline2')]/a", doc, null, XPathResult.ANY_TYPE, null);

		var next_title;
		while (next_title = titles.iterateNext()) {
			// This excludes the videos, whos link terminates in a hash.
			if (next_title.href.match(/.*html$/)) {
				items[next_title.href] = next_title.textContent;
			}
		}
		Zotero.selectItems(items, function (items) {
			if (!items) {
				return true;
			}
			for (var i in items) {
				articles.push(i);
			}
			Zotero.Utilities.processDocuments(articles, scrape);
		});
	} else {
		scrape(doc, url);
	}
}
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.fr-online.de/spezials/wikileaks---die-enthuellungsplattform,4882932,4882932.html",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://www.fr-online.de/krise/1471908,1471908.html",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://www.fr-online.de/schuldenkrise/andeutung-des-finanzministers-portugal-koennte-rettungspaket-benoetigen,1471908,8251842.html",
		"items": [
			{
				"itemType": "newspaperArticle",
				"creators": [],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Andeutung des Finanzministers: Portugal könnte Rettungspaket benötigen",
						"mimeType": "text/html"
					}
				],
				"url": "http://www.fr-online.de/schuldenkrise/andeutung-des-finanzministers-portugal-koennte-rettungspaket-benoetigen,1471908,8251842.html",
				"title": "Andeutung des Finanzministers: Portugal könnte Rettungspaket benötigen",
				"abstractNote": "Eine politische Krise in Portugal aufgrund der harten Sparvorgaben der Europäischen Union könnte ein Rettungspaket notwendig machen, fürchtet Finanzminister Fernando Teixeira dos Santos.",
				"date": "21. März 2011",
				"publicationTitle": "fr-online.de",
				"section": "Schuldenkrise",
				"language": "de",
				"libraryCatalog": "fr-online.de",
				"accessDate": "CURRENT_TIMESTAMP",
				"shortTitle": "Andeutung des Finanzministers"
			}
		]
	}
]
/** END TEST CASES **/