{
	"translatorID": "a14ac3eb-64a0-4179-970c-92ecc2fec992",
	"label": "Scopus",
	"creator": "Michael Berkowitz, Rintze Zelle and Avram Lyon",
	"target": "^https?://www\\.scopus\\.com[^/]*",
	"minVersion": "2.1",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsib",
	"lastUpdated": "2017-06-16 19:45:59"
}

/*
   Scopus Translator
   Copyright (C) 2008-2014 Center for History and New Media and Sebastian Karcher

   This program is free software: you can redistribute it and/or modify
   it under the terms of the GNU Affero General Public License as published by
   the Free Software Foundation, either version 3 of the License, or
   (at your option) any later version.

   This program is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   GNU General Public License for more details.

   You should have received a copy of the GNU Affero General Public License
   along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

function detectWeb(doc, url) {
	if (url.indexOf("/results/") !== -1 &&
		getBoxes(doc).iterateNext()) {
		return "multiple";
	} else if (url.indexOf("/record/") !== -1) {
		return "journalArticle";
	}
}

function getEID(url) {
	return url.match(/eid=([^&]+)/)[1];
}

function getBoxes(doc) {

	return doc.evaluate('//div[@id="resultsBody"]//span[@class="docTitle"]', doc, null, XPathResult.ANY_TYPE, null);
}

function doWeb(doc, url) {
	var articles = [];
	if (detectWeb(doc, url) == "multiple") {
		items = {};
		var boxes = getBoxes(doc);
		var box;
		while (box = boxes.iterateNext()) {
			var link = doc.evaluate('.//a', box, null, XPathResult.ANY_TYPE, null).iterateNext();
			items[link.href] = Zotero.Utilities.trimInternal(link.textContent);
		}
		Zotero.selectItems(items, function (items) {
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
	//ISBN, language, and ISSN are not in the export data - get them from the page
	var ISSN = ZU.xpathText(doc, '//div[contains(@class, "formatSourceExtended")]/span[strong[contains(text(), "ISSN:")]]');
	var ISBN = ZU.xpathText(doc, '//div[contains(@class, "formatSourceExtended")]/span[strong[contains(text(), "ISBN:")]]');
	var language = ZU.xpathText(doc, '//div[contains(@class, "formatSourceExtended")]/span[strong[contains(text(), "Original language:")]]');
	var prefix= url.match(/^https?:\/\//)[0];
	var get = prefix + doc.location.host + 
		'/onclick/export.uri?oneClickExport=%7b%22Format%22%3a%22RIS%22%2c%22View%22%3a%22CiteAbsKeyws%22%7d&origin=recordpage&eid=';
		//this is the encoded version of oneClickExport={"Format":"RIS","View":"CiteAbsKeyws"} but since it's always the same, no need to run encodeURL
	var eid = getEID(url)
	var rislink = get + eid + "&zone=recordPageHeader&outputType=export&txGid=0";
	Z.debug(rislink)
	Zotero.Utilities.HTTP.doGet(rislink, function(text) {
		// load translator for RIS
		//Z.debug(text)
		if (text.search(/T2  -/)!=-1 && text.search(/JF  -/)!=-1){
			//SCOPUS RIS mishandles alternate titles and journal titles
			//if both fields are present, T2 is the alternate title and JF the journal title
			text = text.replace(/T2  -/, "N1  -" ).replace(/JF  -/, "T2  -");
			
		}
		//Scopus places a stray TY right above the DB field
		text = text.replace(/TY.+\nDB/, "DB")
		//Some Journal Articles are oddly SER
		text = text.replace(/TY  - SER/, "TY  - JOUR")
		//Z.debug(text)
		var translator = Zotero.loadTranslator("import");
		translator.setTranslator("32d59d2d-b65a-4da4-b0a3-bdd3cfb979e7");
		translator.setString(text);
		translator.setHandler("itemDone", function(obj, item) {
			var notes = [];
			for (i in item.notes) {
				if (item.notes[i]['note'].match(/Export Date:|Source:/))
					continue;
				notes.push(item.notes[i]);
			}
			item.notes = notes;
			item.url = "";
			for (var i in item.creators){
				if (item.creators[i].fieldMode = 1 && item.creators[i].lastName.indexOf(" ")!=-1){
					item.creators[i].firstName = item.creators[i].lastName.match(/\s(.+)/)[1];
					item.creators[i].lastName = item.creators[i].lastName.replace(/\s.+/, "");
					item.creators[i].fieldMode = 2
				}
			}
			item.attachments.push({document: doc, title: "SCOPUS Snapshot", mimeType: "text/html"});
			if (ISSN) item.ISSN = ZU.cleanISSN(ISSN);
			if (ISBN) item.ISBN = ZU.cleanISBN(ISBN);
			if (language) item.language = language.replace(/Original language:/, "").trim();
			item.complete();
		});
		translator.translate();
	});;
}
