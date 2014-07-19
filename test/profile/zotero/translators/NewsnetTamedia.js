{
	"translatorID": "caecaea0-5d06-11df-a08a-0800200c9a66",
	"label": "Newsnet/Tamedia",
	"creator": "ibex",
	"target": "^https?://((www\\.)?(tagesanzeiger|(bo\\.)?bernerzeitung|bazonline|derbund|thurgauerzeitung|24heures)\\.ch/.)",
	"minVersion": "2.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2014-04-03 17:48:45"
}

/*
	Tagesanzeiger.ch Translator - Parses tagesanzeiger.ch, bernerzeitung.ch,
	bazonline.ch, derbund.ch, thurgauerzeitung.ch articles from to the
	Newsnetz and creates Zotero-based metadata.
	Copyright (C) 2010 ibex

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
	//Zotero.debug("ibex detectWeb URL= "+ url);
	if (doc.location.href.indexOf("suche.html?") != -1 && doc.getElementById("panelArticleItems")) {
		return "multiple";
	} else if (doc.location.href.indexOf("/story/") != -1
			&& getXPath('//div[@id = "singlePage"]/div[@id = "singleLeft"]/h2', doc)) {
		return "newspaperArticle";
	}
}

/* Zotero API */
function doWeb(doc, url) {
	//Zotero.debug("ibex doWeb URL= "+ url);
	if (detectWeb(doc, url) == "multiple") {
		var items = Zotero.Utilities.getItemArray(doc, doc.getElementById("panelArticleItems").getElementsByTagName("h3"), '/story/\\d+');
		if (!items || countObjectProperties(items) == 0) {
			return true;
		}
		Zotero.selectItems(items, function(items) {
			if (!items) return true;

			var urls = new Array();
			for (var i in items) {
				urls.push(i);
			}
			ZU.processDocuments(urls, scrape);
		});
	} else {
		scrape(doc);
	}
}

function scrape(doc) {
	//Zotero.debug("ibex scrape URL = " + doc.location.href);
	var newArticle = new Zotero.Item('newspaperArticle');
	newArticle.url = doc.location.href;
	newArticle.title = Zotero.Utilities.trimInternal(getXPath('//div[@id = "singleLeft"]/h2', doc).textContent);

	var titleprefix = getXPath('//div[@id = "singleLeft"]/h6', doc);
	if ((titleprefix != null) && (Zotero.Utilities.trimInternal(titleprefix.textContent) != "")) {
		newArticle.shortTitle = newArticle.title;
		newArticle.title = Zotero.Utilities.trimInternal(titleprefix.textContent) + ": " + newArticle.title;
	}

	var date = Zotero.Utilities.trimInternal(getXPath('//div[@id = "singleLeft"]/p[@class = "publishedDate"]', doc).textContent);
	newArticle.date = Zotero.Utilities.trimInternal(date.split(/[:,] */)[1]);

	var authorline = getXPath('//div[@id = "singleLeft"]/div[@id = "metaLine"]/h5', doc);
	if (authorline != null && authorline.textContent.length > 0) {
		authorline = Zotero.Utilities.trimInternal(authorline.textContent);
		//remove script code "//<![CDATA[  ...  //]]>"
		authorline = authorline.replace(/\/\/<!\[CDATA\[.*\/\/\]\]>/, "");
		//assumption of authorline: "[Interview:|Von name1 [und Name2][, location].] [Aktualisiert ...]"
		authorline = authorline.replace(/Von /, "");
		authorline = authorline.replace(/Interview: /, "");
		authorline = authorline.replace(/Aktualisiert .*$/, "");
		authorline = authorline.replace(/Mis à jour le .*$/, "");
		authorline = authorline.replace(/Mis à jour à .*$/, "");
		authorline = authorline.replace(/, .*$/, "");
		authorline = Zotero.Utilities.trim(authorline.replace(/\. .*$/, ""));

		var authors = authorline.split(" und ");
		for (var i = 0; i < authors.length && authorline.length > 0; i++) {
			newArticle.creators.push(Zotero.Utilities.cleanAuthor(authors[i], "author"));
		}
	}

	var teaser = getXPath('//div[@id = "singleLeft"]/p[@class = "teaser"]', doc);
	if (teaser != null) {
		newArticle.abstractNote = Zotero.Utilities.trimInternal(teaser.textContent);
	}

	var publicationTitle = getXPath('//div[@id = "singleLeft"]//span[@class = "idcode"]', doc);
	newArticle.publicationTitle = doc.location.host.replace(/^www./,"");
	if (publicationTitle != null) {
		publicationTitle = Zotero.Utilities.trimInternal(publicationTitle.textContent);
		newArticle.publicationTitle += ": " + publicationTitle;
		if (publicationTitle == '(Tages-Anzeiger)') {
			newArticle.publicationTitle = "Tages-Anzeiger";
			newArticle.ISSN = "1422-9994";
		}
	}
	if (doc.location.host.indexOf("24heures.ch") > -1) {
		newArticle.language = "fr";
	} else {
		newArticle.language = "de";
	}

	var section = getXPath('//div[@id = "singleHeader"]/h1/span', doc);
	if (section != null) {
			newArticle.section = Zotero.Utilities.trimInternal(section.textContent);
	}

	newArticle.attachments.push({title:"tagesanzeiger.ch Article Snapshot", mimeType:"text/html", url:doc.location.href + "/print.html", snapshot:true});

	newArticle.complete();
}

/* There is no built-in function to count object properties which often are used as associative arrays.*/
function countObjectProperties(obj) {
	var size = 0;
	for (var key in obj) {
		if (obj.hasOwnProperty(key)) size++;
	}
	return size;
}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.tagesanzeiger.ch/wissen/natur/Duestere-Fakten-zum-Klimawandel/story/13137025",
		"items": [
			{
				"itemType": "newspaperArticle",
				"creators": [],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "tagesanzeiger.ch Article Snapshot",
						"mimeType": "text/html",
						"snapshot": true
					}
				],
				"url": "http://www.tagesanzeiger.ch/wissen/natur/Duestere-Fakten-zum-Klimawandel/story/13137025",
				"title": "Düstere Fakten zum Klimawandel",
				"date": "09.11.2011",
				"abstractNote": "Der neueste Bericht der Internationalen Energieagentur ist besorgniserregend. Das Klima könnte sich noch viel stärker erwärmen als bisher erwartet.",
				"publicationTitle": "tagesanzeiger.ch: (kle/dapd)",
				"language": "de",
				"section": "Wissen",
				"libraryCatalog": "Newsnet/Tamedia",
				"accessDate": "CURRENT_TIMESTAMP"
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.tagesanzeiger.ch/service/suche/suche.html?date=alle&order=date&key=arbeitsmarkt",
		"items": "multiple"
	}
]
/** END TEST CASES **/