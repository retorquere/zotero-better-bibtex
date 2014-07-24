{
	"translatorID": "cde4428-5434-437f-9cd9-2281d14dbf9",
	"label": "Ovid",
	"creator": "Simon Kornblith, Michael Berkowitz, and Ovid Technologies",
	"target": "(gw2|asinghal|sp)[^\\/]+/ovidweb\\.cgi",
	"minVersion": "2.1.9",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcs",
	"lastUpdated": "2013-07-31 22:24:15"
}

/*
   Ovid Zotero Translator
   Copyright (c) 2000-2012 Ovid Technologies, Inc.

   This program is free software: you can redistribute it and/or modify
   it under the terms of the GNU Affero General Public License as
   published by the Free Software Foundation, either version 3 of the
   License, or (at your option) any later version.

   This program is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   GNU Affero General Public License for more details.

   You should have received a copy of the GNU Affero General Public License
   along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
/*
   This translator will only work with http://ovidsp.ovid.com and will
   detect citations in the following scenarios.

   -- On MSP (Main search page) after performing a search and at least one search
	  result is available on the page.
   -- On MyProject if at least one citation is displayed.
   -- On Journals tab if at least one issue is displayed.
*/

function detectWeb(doc, url) {
	Zotero.debug("detectWeb");

	// Do not show the Zotero icone on books.
	if (doc.evaluate('.//table[@class="booklist-record-header"]', doc, null, XPathResult.ANY_TYPE, null).iterateNext()) {
		return false;
	}

	var results = doc.evaluate('.//input[@class="bibrecord-checkbox"]', doc, null, XPathResult.ANY_TYPE, null);
	//Zotero.debug('results::' + results.iterateNext());
	var count = 0;
	while (results.iterateNext()) {
		if (++count > 1) return "multiple";
	}

	if (count == 1) return "journalArticle";

	//some pages don't have a checkbox, but we can follow a link to abstract, which does
	var a = doc.getElementById('abstract');
	if(a && a.nodeName.toUpperCase() == 'A') return 'journalArticle';
	
	return false;
}

function senCase(string) {
	var words = string.split(/\b/);
	for (var i = 0; i < words.length; i++) {
		if (words[i].match(/[A-Z]/)) {
			words[i] = words[i][0] + words[i].substring(1).toLowerCase();
		}
	}
	return words.join("");
}

function doWeb(doc, url) {
	var results = doc.evaluate('.//input[@class="bibrecord-checkbox"]', doc, null, XPathResult.ANY_TYPE, null);

	var count = 0;
	while (results.iterateNext()) {
		if (++count > 1) break;
	}
	
	//if we're on a page with no checkboxes, we might have to redirect to a different page
	if(!count) {
		Z.debug("Could not find any checkboxes. Looking for link to abstract...");
		var a = doc.getElementById('abstract');
		if(a && a.href) {
			ZU.processDocuments(a.href, doWeb);
			return;
		}
		Z.debug("No link found. This will fail.");
	}
	
	var post = "S=" + doc.evaluate('.//input[@name="S"]', doc, null, XPathResult.ANY_TYPE, null).iterateNext().value;
	var record_type = "";
	if (count > 1) { // If page contains multiple Articles.
		var items = new Object();
		var tableRows;
		// Go through table rows
		if (doc.evaluate('//div[@id="titles-records"]/table[starts-with(@class, "titles-row")]', doc, null, XPathResult.ANY_TYPE, null).iterateNext()) {
			tableRows = doc.evaluate('//div[@id="titles-records"]/table[starts-with(@class, "titles-row")]', doc, null, XPathResult.ANY_TYPE, null);
			record_type = "record-on-msp"; // can be journal record
		} else if (doc.evaluate('//div[@id="titles-records"]/table[starts-with(@class, "toc-row")]', doc, null, XPathResult.ANY_TYPE, null).iterateNext()) {
			tableRows = doc.evaluate('//div[@id="titles-records"]/table[starts-with(@class, "toc-row")]', doc, null, XPathResult.ANY_TYPE, null);
			record_type = "journal-record";
		} else if (doc.evaluate('//div[@id="item-records"]/table[starts-with(@class, "titles-row")] | //div[@id="item-records"]/table[contains(@class,"citation-block")] | //div[@id="item-records"]//td[@class="citation-banner-critical-info"]', doc, null, XPathResult.ANY_TYPE, null).iterateNext()) {
			tableRows = doc.evaluate('//div[@id="item-records"]/table[starts-with(@class, "titles-row")] | //div[@id="item-records"]/table[contains(@class,"citation-block")] | //div[@id="item-records"]//td[@class="citation-banner-critical-info"]', doc, null, XPathResult.ANY_TYPE, null);
			record_type = "record-on-myproject"; // On My Project
		} else if (doc.evaluate('//div[@id="titles-records" or @id="item-records"]/table[starts-with(@class, "citation-table")]', doc, null, XPathResult.ANY_TYPE, null).iterateNext()) {
			// citation-table
			tableRows = doc.evaluate('//div[@id="titles-records" or @id="item-records"]/table[starts-with(@class, "citation-table")]', doc, null, XPathResult.ANY_TYPE, null);
			record_type = "ovid-citation-labled"; // On MSP
		}

		Zotero.debug("record_type1: " + record_type);
		var tableRow;
		while (tableRow = tableRows.iterateNext()) {
			var id = doc.evaluate('.//input[@name="R"]', tableRow, null, XPathResult.ANY_TYPE, null).iterateNext().value;

			var title_container;

			if (title_container = doc.evaluate('.//a[contains(@class,"citation_title")]', tableRow, null, XPathResult.ANY_TYPE, null).iterateNext()) {
				items[id] = Zotero.Utilities.trimInternal(title_container.textContent);
			}

			if (!items[id]) {
				// We can't remove 'record_type == "record-on-msp"' form condition b/c for
				// Books records if no title then it should pick the chapter title.
				if (record_type == "record-on-msp" || record_type == "journal-record") { // this is MSP records
					if (title_container = doc.evaluate('.//span[@class="titles-title"]', tableRow, null, XPathResult.ANY_TYPE, null).iterateNext()) {
						Zotero.debug("Journal record");
						items[id] = Zotero.Utilities.trimInternal(title_container.textContent);
					} else if (title_container = doc.evaluate('.//div[@class="article-title"]', tableRow, null, XPathResult.ANY_TYPE, null).iterateNext()) {
						Zotero.debug("without title record");
						// Find the chapter title from title_container.
						var title;
						if (title = doc.evaluate('.//span[@class="chapter_title"]', title_container, null, XPathResult.ANY_TYPE, null).iterateNext()) {
							items[id] = Zotero.Utilities.trimInternal(title.textContent);
						}
						// if chapter_title not found collect entire text.
						else {
							items[id] = Zotero.Utilities.trimInternal(title_container.textContent);
						}
					}
				} else if (record_type == "record-on-myproject") { //this is for OUS
					if (title_container = doc.evaluate('.//span[@class="titles-title"] | .//div[@class="muse-title" or @class="chapter-title"] | .//a[contains(@href, "citation_title")]', tableRow, null, XPathResult.ANY_TYPE, null).iterateNext()) {
						items[id] = Zotero.Utilities.trimInternal(title_container.textContent);
						Zotero.debug("items[id]" + items[id]);
					}
				} else if (record_type == "ovid-citation-labled") {
					if (table_container = doc.evaluate('.//table[@class="citation-block" or contains(@class, "citation-table") ]', tableRow, null, XPathResult.ANY_TYPE, null).iterateNext()) {
						if (title_container = doc.evaluate('.//a[contains(@href, "&Buy+PDF=") or contains(@href, "&Complete+Reference=")  or contains(@href, "&Abstract+Reference=") or contains(@href, "&Link+Set=") ]', table_container, null, XPathResult.ANY_TYPE, null).iterateNext()) {
							items[id] = Zotero.Utilities.trimInternal(title_container.textContent);
						}
					}
				}
			}
			// Still if no title available to display, just show the record index.
			if (!items[id]) {
				items[id] = 'Record Index: ' + id;
			}

		}
		var items = Zotero.selectItems(items);
		if (!items) return true;

		for (var i in items) {
			post += "&R=" + i;
		}

		var selectvar = doc.evaluate('.//input[@name="SELECT"]', doc, null, XPathResult.ANY_TYPE, null);
		var nextselect = selectvar.iterateNext().value;

	} else if (count == 1) { // If page contains single Article.
		var id = doc.evaluate('.//input[@name="R" and @class="bibrecord-checkbox"]', doc, null, XPathResult.ANY_TYPE, null).iterateNext().value;
		post += "&R=" + id;
	}

	post += "&jumpstartLink=1";
	post += "&Citation Page=Export Citation"; // Required on non-js browser
	var is_OUS = 0;
	if (doc.evaluate('//div[@id="OUSRT"]', doc, null, XPathResult.ANY_TYPE, null).iterateNext()) {
		Zotero.debug("For OUS");
		is_OUS = 1;
	}

	if (is_OUS) {
		//For OUS records {need to format UI code for OUS records in endnode formate }
		Zotero.debug("For OUS");
		var CitManPrev = doc.evaluate('.//input[@name="Datalist"]', doc, null, XPathResult.ANY_TYPE, null).iterateNext().value.replace(/\|.*/, "");
		post += "&cmexport=1&exportType=endnote&zoteroRecords=1&ousRecords=1&Citation Action=" + CitManPrev;
	} else { //for MSP records
		var CitManPrev = doc.evaluate('.//input[@name="CitManPrev"]', doc, null, XPathResult.ANY_TYPE, null).iterateNext().value.replace(/\|.*/, "");
		post += "&cmexport=1&exportType=endnote&cmFields=ALL&zoteroRecords=1&Citation Action=" + CitManPrev;
	}

	url = url.replace(/ovidweb\.cgi.*$/i, "ovidweb.cgi");

	Zotero.debug("URL: " + url + "?" + post);
	Zotero.Utilities.HTTP.doPost(url, post, function (text) {
		//Z.debug(text);
		var lines = text.split("\n");
		var haveStarted = false;
		var newItemRe = /^(<[0-9]+\.\s>|[0-9]+\.\s\s)/;

		var newItem = new Zotero.Item("journalArticle");
		for (var i in lines) {
			if (!haveStarted && newItemRe.test(lines[i])) {
				haveStarted = true;
			} else if (newItemRe.test(lines[i])) {
				newItem.complete();
				newItem = new Zotero.Item("journalArticle");
			} else if (lines[i].substr(2, 4) == "  - " && haveStarted) {
				var fieldCode = lines[i].substr(0, 2);
				var fieldContent = Zotero.Utilities.trimInternal(lines[i].substr(6));
				if (fieldCode == "TI") {
					newItem.title = fieldContent.replace(/\. \[\w+\]$/, "");
				} else if (fieldCode == "AU") {
					var names = fieldContent.split(", ");

					if (names.length >= 2) {
						// get rid of the weird field codes
						if (names.length == 2) {
							names[1] = names[1].replace(/ [\+\*\S\[\]]+$/, "");
						}
						names[1] = names[1].replace(/ (?:MD|PhD|[BM]Sc|[BM]A|MPH|MB)$/i, "");

						newItem.creators.push({
							firstName: names[1],
							lastName: names[0],
							creatorType: "author"
						});
					} else if (fieldContent.match(/^(.*) [A-Z]{1,3}$/)) {
						names = fieldContent.match(/^(.*) ([A-Z]{1,3})$/);
						newItem.creators.push({
							firstName: names[2],
							lastName: names[1],
							creatorType: "author"
						});
					} else {
						newItem.creators.push({
							lastName: names[0],
							isInstitution: true,
							creatorType: "author"
						});
					}
				} else if (fieldCode == "SO") {
					if (fieldContent.match(/\d{4}/)) {
						newItem.date = fieldContent.match(/\d{4}/)[0];
					}
					if (fieldContent.match(/(\d+)\((\d+)\)/)) {
						var voliss = fieldContent.match(/(\d+)\((\d+)\)/);

						newItem.volume = voliss[1];
						newItem.issue = voliss[2];
					}
					if (fieldContent.match(/vol\.\s*(\d+)/)) {
						newItem.volume = fieldContent.match(/vol\.\s*(\d+)/)[1];
					}
					if (fieldContent.match(/vol\.\s*\d+\s*,\s*no\.\s*(\d+)/)) {
						newItem.issue = fieldContent.match(/vol\.\s*\d+\s*,\s*no\.\s*(\d+)/)[1];
					}
					if (fieldContent.match(/\d+\-\d+/)) newItem.pages = fieldContent.match(/\d+\-\d+/)[0];
					if (fieldContent.match(/pp\.\s*(\d+\-\d+)/)) newItem.pages = fieldContent.match(/pp\.\s*(\d+\-\d+)/)[1];
					if (fieldContent.match(/[J|j]ournal[-\s\w]+/)) {
						newItem.publicationTitle = fieldContent.match(/[J|j]ournal[-\s\w]+/)[0];
					} else {
						newItem.publicationTitle = Zotero.Utilities.trimInternal(fieldContent.split(/(\.|;|(,\s*vol\.))/)[0]);
					}
				} else if (fieldCode == "SB") {
					newItem.tags.push(Zotero.Utilities.superCleanString(fieldContent));
				} else if (fieldCode == "KW") {
					newItem.tags.push(fieldContent.split(/; +/));
				} else if (fieldCode == "DB") {
					newItem.repository = "Ovid (" + fieldContent + ")";
					if (fieldContent.match(/Books\@Ovid/)) {
						newItem.itemType = "book";
					}
				} else if (fieldCode == "DI") {
					newItem.DOI = fieldContent;
				} else if (fieldCode == "DO") {
					newItem.DOI = fieldContent;
				} else if (fieldCode == "DP") {
					newItem.date = fieldContent;
				} else if (fieldCode == "IS") {
					newItem.ISSN = fieldContent;
				} else if (fieldCode == "AB") {
					newItem.abstractNote = fieldContent;
				} else if (fieldCode == "XL") {
					newItem.url = fieldContent;
				} else if (fieldCode == "PU") {
					newItem.publisher = fieldContent;
				}

				if (!newItem.title) {
					newItem.title = "Ovid Record- Title not available";
				}
			}
		}
		Zotero.debug("DONE!!!!!!!!!!!! ");

		// last item is complete
		if (haveStarted) {
			newItem.complete();
		}
		Zotero.done();
	});
	Zotero.wait();
}
