{
	"translatorID": "18bc329c-51af-497e-a7cf-aa572fae363d",
	"label": "Archives Canada",
	"creator": "Adam Crymble",
	"target": "^https?://(www\\.)?archivescanada\\.ca",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsb",
	"lastUpdated": "2019-06-13 23:00:25"
}


/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2019 Adam Crymble

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

function detectWeb(doc, _url) {
	if (doc.location.href.match("RouteRqst")) {
		return "multiple";
	}
	else if (doc.location.href.match("ItemDisplay")) {
		return "book";
	}
	return false;
}

function associateData(newItem, dataTags, field, zoteroField) {
	if (dataTags[field]) {
		newItem[zoteroField] = dataTags[field];
	}
}

function scrape(doc, _url) {
	var dataTags = {};
	var tagsContent = [];
	var cainNo;
	var newItem = new Zotero.Item("book");

	var data = doc.evaluate('//td/p', doc, null, XPathResult.ANY_TYPE, null);
	var dataCount = doc.evaluate('count (//td/p)', doc, null, XPathResult.ANY_TYPE, null);

	for (i = 0; i < dataCount.numberValue; i++) {
		let data1 = data.iterateNext().textContent.replace(/^\s*|\s*$/g, '').split(":");
		let fieldTitle = data1[0].replace(/\s+/g, '');

		if (fieldTitle == "PROVENANCE") {
			var multiAuthors = data1[1].split(/\n/);

			for (var j = 0; j < multiAuthors.length; j++) {
				if (multiAuthors[j].match(",")) {
					var authorName = multiAuthors[j].replace(/^\s*|\s*$/g, '').split(",");

					authorName[0] = authorName[0].replace(/\s+/g, '');
					dataTags.PROVENANCE = (authorName[1] + (" ") + authorName[0]);
					newItem.creators.push(Zotero.Utilities.cleanAuthor(dataTags.PROVENANCE, "author"));
				}
				else {
					newItem.creators.push({ lastName: multiAuthors[j].replace(/^\s*|\s*$/g, ''), creatorType: "creator" });
				}
			}
		}
		else if (fieldTitle == "SUBJECTS" | fieldTitle == "MATIÈRES") {
			tagsContent = data1[1].split(/\n/);
		}
		else {
			dataTags[fieldTitle] = data1[1];
		}
	}

	if (doc.evaluate('//tr[3]/td/table/tbody/tr[1]/td/table/tbody/tr[2]/td/table/tbody/tr/td[1]', doc, null, XPathResult.ANY_TYPE, null).iterateNext()) {
		cainNo = doc.evaluate('//tr[3]/td/table/tbody/tr[1]/td/table/tbody/tr[2]/td/table/tbody/tr/td[1]', doc, null, XPathResult.ANY_TYPE, null).iterateNext().textContent;
		newItem.archiveLocation = cainNo.replace(/^\s*|\s*$/g, '');
	}
	for (var i = 0; i < tagsContent.length; i++) {
		newItem.tags[i] = tagsContent[i].replace(/^\s*|\s*$/g, '');
	}

	associateData(newItem, dataTags, "TITLE", "title");
	associateData(newItem, dataTags, "REPOSITORY", "repository");
	associateData(newItem, dataTags, "RETRIEVALNUMBER", "callNumber");
	associateData(newItem, dataTags, "DATES", "date");
	associateData(newItem, dataTags, "SCOPEANDCONTENT", "abstractNote");
	associateData(newItem, dataTags, "LANGUAGE", "language");

	associateData(newItem, dataTags, "LANGUE", "language");
	associateData(newItem, dataTags, "TITRE", "title");
	associateData(newItem, dataTags, "CENTRED'ARCHIVES", "repository");
	associateData(newItem, dataTags, "NUMÉROD'EXTRACTION", "callNumber");
	associateData(newItem, dataTags, "PORTÉEETCONTENU", "abstractNote");

	newItem.url = doc.location.href;

	newItem.complete();
}

function doWeb(doc, url) {
	var articles = [];

	if (detectWeb(doc, url) == "multiple") {
		var items = {};

		var titles = doc.evaluate('//td[3]/a', doc, null, XPathResult.ANY_TYPE, null);

		var nextTitle;
		while (nextTitle = titles.iterateNext()) { // eslint-disable-line no-cond-assign
			items[nextTitle.href] = nextTitle.textContent;
		}
		Zotero.selectItems(items, function (items) {
			if (!items) return;

			for (var i in items) {
				articles.push(i);
			}
			Zotero.Utilities.processDocuments(articles, scrape);
		});
	}
	else {
		scrape(doc, url);
	}
}
