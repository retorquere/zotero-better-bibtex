{
	"translatorID": "50a4cf3f-92ef-4e9f-ab15-815229159b16",
	"label": "National Archives of Australia",
	"creator": "Tim Sherratt",
	"target": "^https?://recordsearch\\.naa\\.gov\\.au/",
	"minVersion": "1.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsbv",
	"lastUpdated": "2014-04-03 17:48:28"
}

/*
   National Archives of Australia Translator
   Copyright (C) 2011 Tim Sherratt (tim@discontents.com.au, @wragge)

   This program is free software: you can redistribute it and/or modify
   it under the terms of the GNU Affero General Public License as published by
   the Free Software Foundation, either version 3 of the License, or
   (at your option) any later version.

   This program is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   GNU Affero General Public License for more details.

   You should have received a copy of the GNU Affero General Public License
   along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

function detectWeb(doc, url) {
	//RecordSearch - items and series - or Photosearch results
	if (url.match(/SeriesListing\.asp/i) || url.match(/ItemsListing\.asp/i) || url.match(/PhotoSearchSearchResults\.asp/i)) {
			return "multiple";
	} else if (url.match(/SeriesDetail\.asp/i) || url.match(/ItemDetail\.asp/i) || url.match(/PhotoSearchItemDetail\.asp/i) || url.match(/imagine\.asp/i)) {
			return "manuscript";
	}
}

function doWeb(doc, url) {
	// To avoid cross domain errors make sure links match current sub-domain
	var baseURL = doc.location.href.match(/(https?:\/\/[a-z0-9]+\.naa\.gov\.au)/)[1];
	var records = new Array();
	var titles, links, title, link;
	var setupCallback = function () {
	if (records.length) {
			var record = records.shift();
			var item = new Zotero.Item("manuscript");
			item.archive = "National Archives of Australia";
			var tags = new Array();
			if (record.match(/Imagine\.asp/i)) {
				var postString, barcode, page, numPages;
				item.libraryCatalog = "RecordSearch";
				if (doc.body.innerHTML.match(/Digital copy of NAA:/)) {
					doc.evaluate('//img[@id="fileimage"]/@src', doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.textContent.match(/B=(\d+)&S=(\d+)&/);
					barcode = RegExp.$1;
					page = RegExp.$2;
					numPages = Zotero.Utilities.trimInternal(doc.evaluate('//input[@id="printto"]/@value', doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.textContent);
				// You're using the original RS interface
				} else {
					barcode = Zotero.Utilities.trimInternal(doc.evaluate('//input[@id="Hidden1"]/@value', doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.textContent);
					page = Zotero.Utilities.trimInternal(doc.evaluate('//input[@id="Text1"]/@value', doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.textContent);
					numPages = Zotero.Utilities.trimInternal(doc.evaluate('//input[@id="Hidden3"]/@value', doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.textContent);
				}
				// This is a digital image -- ie a folio
				item.pages = page;
				item.numPages = numPages;
				item.url = 'http://recordsearch.naa.gov.au/NaaMedia/ShowImage.asp?B=' + barcode + '&S=' + page + '&T=P';
				if (doc.referrer.match(/NameSearch/i)) {
					var itemURL = baseURL + "/NameSearch/Interface/ItemDetail.aspx?Barcode=" + barcode;
				} else {
					var itemURL = baseURL + '/SearchNRetrieve/Interface/DetailsReports/ItemDetail.aspx?Barcode=' + barcode;
				}
				item.manuscriptType = 'folio';
				Zotero.Utilities.processDocuments(itemURL, function(itemDoc) {
					var series = Zotero.Utilities.trimInternal(itemDoc.evaluate('//td[@class="field"][. ="Series number"]/following-sibling::td/a', itemDoc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.lastChild.textContent);
					var control = Zotero.Utilities.trimInternal(itemDoc.evaluate('//td[@class="field"][. ="Control symbol"]/following-sibling::td', itemDoc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.lastChild.textContent);
					var refNumber = series + ", " + control;
					item.title = 'Page ' + page + ' of NAA: ' + refNumber;
					item.archiveLocation = refNumber;
					// Save a copy of the image
					item.attachments = [{url:item.url, title:'Digital copy of NAA: ' + refNumber + ', p. ' + page, mimeType:"image/jpeg" }];
					// MACHINE TAGS
					// The file of which this page is a part.
					// item.tags.push('dcterms:isPartOf="http://www.naa.gov.au/cgi-bin/Search?O=I&Number=' + barcode + '"');
					// Citation
					// item.tags.push('dcterms:bibliographicCitation="NAA: ' + refNumber + ', p. ' + page + '"');
					// item.tags.push('xmlns:dcterms="http://purl.org/dc/terms/"');
					item.complete();
					setupCallback();
				});
			} else if (record.match(/PhotoSearchItemDetail\.asp/i)) {
		item.libraryCatalog = "PhotoSearch";
				Zotero.Utilities.processDocuments(record, function (doc) {
					item.title = Zotero.Utilities.trimInternal(doc.evaluate('//b[. ="Title :"]/following-sibling::text()[1]', doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.textContent);
					item.manuscriptType = "photograph";
					var barcode = Zotero.Utilities.trimInternal(doc.evaluate('//b[. ="Barcode : "]/following-sibling::text()[1]', doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.textContent);
					var series = Zotero.Utilities.trimInternal(doc.evaluate('//b[. ="Find other items in this series :"]/following-sibling::a/text()[1]', doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.textContent);
					var refNumber = Zotero.Utilities.trimInternal(doc.evaluate('//b[. ="Image no. :"]/following-sibling::text()[1]', doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.textContent);
					item.archiveLocation = refNumber;
					item.url = "http://www.naa.gov.au/cgi-bin/Search?O=PSI&Number=" + barcode;
					if (doc.evaluate('//b[. ="Date :"]/following-sibling::text()[1]', doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue != null) {
							item.date = Zotero.Utilities.trimInternal(doc.evaluate('//b[. ="Date :"]/following-sibling::text()[1]', doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.textContent);
					}
					if (doc.evaluate('//b[. ="Location : "]/following-sibling::text()[1]', doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue != null) {
							item.place = Zotero.Utilities.trimInternal(doc.evaluate('//b[. ="Location : "]/following-sibling::text()[1]', doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.textContent);
					}
					// Save subjects as tags
					subjects = new Array();
					subjects.push(Zotero.Utilities.trimInternal(doc.evaluate('//b[. ="Primary subject :"]/following-sibling::*[1]', doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.textContent).toLowerCase());
					subjects.push(Zotero.Utilities.trimInternal(doc.evaluate('//b[. ="Secondary subject :"]/following-sibling::*[1]', doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.textContent).toLowerCase());
					for (var i in subjects) {
							if (subjects[i] != '') {
									item.tags.push(subjects[i]);
							}
					}
					// Citation
					// item.tags.push('dcterms:bibliographicCitation="NAA: ' + refNumber + '"');
					// Save barcode as identifier
					// item.tags.push('dcterms:identifier="' + barcode + '"');
					// Series of which this is a member
					// item.tags.push('dcterms:isPartOf="http://www.naa.gov.au/cgi-bin/Search?Number=' + series + '"');
					// Same file in RecordSearch
					// item.tags.push('owl:sameAs="http://www.naa.gov.au/cgi-bin/Search?O=I&Number=' + barcode + '"');
					// Namespace declarations
					// item.tags.push('xmlns:dcterms="http://purl.org/dc/terms/"');
					// item.tags.push('xmlns:owl="http://www.w3.org/2002/07/owl#"');
					// Attach copy of photo as attachment
					var imgURL = "http://recordsearch.naa.gov.au/NaaMedia/ShowImage.asp?B=" + barcode + "&S=1&T=P";
					item.attachments = [{url:imgURL, title:"Digital image of NAA: "+ item.archiveLocation, mimeType:"image/jpeg" }];
					item.complete();
			setupCallback();
				});
			} else if (record.match(/SeriesDetail\.asp/i)) {
				item.libraryCatalog = "RecordSearch";
				Zotero.Utilities.processDocuments(record, function (doc) {
					item.title = Zotero.Utilities.trimInternal(doc.evaluate('//td[@class="field"][contains(.,"Title")]/following-sibling::td', doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.lastChild.textContent);
					var refNumber = Zotero.Utilities.trimInternal(doc.evaluate('//td[@class="field"][contains(.,"Series number")]/following-sibling::td', doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.lastChild.textContent);
					item.archiveLocation = refNumber;
					item.manuscriptType = "series";
					// Link into RecordSearch
					item.url = "http://www.naa.gov.au/cgi-bin/Search?Number=" + refNumber;
					// Contents dates
					try {
						item.date = Zotero.Utilities.trimInternal(doc.evaluate('//td[@class="field"]/div[contains(.,"Contents dates")]/../following-sibling::td', doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.lastChild.textContent);
					} catch(e) {
						// Not all series have contents dates
					}
					// Agencies recording into this series
					var agencies = doc.evaluate('//div[@id="provenanceRecording"]/ul/li/div[@class="linkagesInfo"]', doc, null, XPathResult.ANY_TYPE, null);
					while (agency = agencies.iterateNext()) {
						item.creators.push({lastName: agency.textContent, creatorType: "creator"});
					}
					// Save series note as abstract
					try {
						var note = Zotero.Utilities.cleanTags(Zotero.Utilities.trimInternal(doc.evaluate('//div[@id="notes"]', doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.textContent));
						item.abstractNote = note;
					} catch(e) {
						// Not all series have notes?
					}
					// MACHINE TAGS
					item.extra = "";
					// Format
					try {
						var format = Zotero.Utilities.trimInternal(doc.evaluate('//td[@class="field"][div="Predominant physical format"]/following-sibling::td', doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.lastChild.textContent);
						// item.tags.push('dcterms:format="' + format + '"');
						item.extra = "Format: " + format + "\n";
					} catch(e) {
						// Not sure if all series have formats
					}
					// Number of items described on RecordSearch
					try {
						var described = doc.evaluate('//td[@class="field"][contains(.,"Items in this series on RecordSearch")]/following-sibling::td/a', doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.textContent;
						// item.tags.push('dcterms:extent="' + described + ' items described"');
						item.extra += "Items on RecordSearch: " + described + "\n";
					} catch(e) {
						// Not all series have items described
					}
					// Quantities and locations
					var quantities = doc.evaluate('//td[@class="field"][contains(.,"Quantity and location")]/following-sibling::td/ul/li', doc, null, XPathResult.ANY_TYPE, null);
					while (quantity = quantities.iterateNext()) {
						// item.tags.push('dcterms:extent="' + quantity.textContent + '"');
						item.extra += "Quantity and location: " + quantity.textContent + "\n";
					}
					// Citation
					item.tags.push('dcterms:bibliographicCitation="NAA: ' + refNumber + '"');
					// Declare dcterms namespace
					// item.tags.push('xmlns:dcterms="http://purl.org/dc/terms/"');
					item.complete();
			setupCallback();
				});
			} else if (record.match(/ItemDetail\.asp/i)) {
				item.manuscriptType = 'file';
				item.libraryCatalog = "RecordSearch";
				Zotero.Utilities.processDocuments(record, function (doc) {
					item.title = Zotero.Utilities.trimInternal(doc.evaluate('//td[@class="field"][contains(.,"Title")]/following-sibling::td', doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.lastChild.textContent);
					var series = Zotero.Utilities.trimInternal(doc.evaluate('//td[@class="field"][contains(.,"Series number")]/following-sibling::td/a', doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.lastChild.textContent);
					var control = Zotero.Utilities.trimInternal(doc.evaluate('//td[@class="field"][contains(.,"Control symbol")]/following-sibling::td', doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.lastChild.textContent);
					var refNumber = series + ', ' + control;
					item.archiveLocation = refNumber;
					var barcode = Zotero.Utilities.trimInternal(doc.evaluate('//td[@class="field"][contains(.,"Item barcode")]/following-sibling::td', doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.lastChild.textContent);
					// Link into RecordSearch
					item.url = "http://www.naa.gov.au/cgi-bin/Search?O=I&Number=" + barcode;
					// Contents dates
					item.date = Zotero.Utilities.trimInternal(doc.evaluate('//td[@class="field"][contains(.,"Contents date range")]/following-sibling::td', doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.lastChild.textContent);
					// Location
					if (doc.evaluate('//td[@class="field"][contains(.,"Location")]/following-sibling::td', doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue != null) {
							item.place = Zotero.Utilities.trimInternal(doc.evaluate('//td[@class="field"][contains(.,"Location")]/following-sibling::td', doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.lastChild.textContent);
					}
					// Save item note as abstract
					if (doc.evaluate('//div[@id="notes"]', doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue != null) {
							item.abstractNote = Zotero.Utilities.cleanTags(Zotero.Utilities.trimInternal(doc.evaluate('//div[@id="notes"]', doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.textContent));
					}
					// MACHINE TAGS
					// The series this item belongs to
					// item.tags.push('dcterms:isPartOf="http://www.naa.gov.au/cgi-bin/Search?Number=' + series + '"');
					// Citation
					// item.tags.push('dcterms:bibliographicCitation="NAA: ' + refNumber + '"');
					// Save the barcode as an identifier
					// item.tags.push('dcterms:identifier="' + barcode + '"');
					// Access status
					var access = Zotero.Utilities.trimInternal(doc.evaluate('//td[@class="field"][contains(.,"Access status")]/following-sibling::td', doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.lastChild.textContent);
					// item.tags.push('dcterms:accessRights="' + access + '"');
					item.extra = "Access: " + access + "\n";
					// Format
					try {
						var format = Zotero.Utilities.trimInternal(doc.evaluate('//td[@class="field"][div="Physical format"]/following-sibling::td', doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.lastChild.textContent);
						// item.tags.push('dcterms:format="' + format + '"');
						item.extra += "Format: " + format + "\n";
					} catch(e) {
						// Not sure if there's always a format
					}
					// Declare dcterms namespace
					// item.tags.push('xmlns:dcterms="http://purl.org/dc/terms/"');
					// Is there a digital copy? - if so find the number of pages in the digitised file
					if (doc.evaluate('//a[. ="View digital copy "]', doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue != null) {
						item.extra += "Digitised\n";
						itemURL = baseURL + "/scripts/Imagine.asp?B=" + barcode + "&z=ignore";
						// Retrieve the digitised file
						Zotero.Utilities.processDocuments(itemURL, function (itemDoc) {
							item.numPages = Zotero.Utilities.trimInternal(itemDoc.evaluate('//input[@id="Hidden3"]/@value', itemDoc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.textContent);
							item.complete();
							setupCallback();
						});
					} else {
						item.complete();
						setupCallback();
					}
				});
			}
		} else {
		Zotero.done();
	}
	}
	if (detectWeb(doc, url) == "multiple") {
		var titles, links, title, link;
		var items = new Object();
		// Files
		if (url.match(/ItemsListing\.asp/i)) {
				titles = doc.evaluate('//td[4][@title="Go to Item details"]', doc, null, XPathResult.ANY_TYPE, null);
				links = doc.evaluate('//td[3][@title="Go to Item details"]/a', doc, null, XPathResult.ANY_TYPE, null);
				// Photos
		} else if (url.match(/PhotoSearchSearchResults\.asp/i)) {
				titles = doc.evaluate('//td[b="Title :"]/a[1]', doc, null, XPathResult.ANY_TYPE, null);
				links = doc.evaluate('//td[b="Title :"]/a[1]', doc, null, XPathResult.ANY_TYPE, null);
				//Series
		} else if (url.match(/SeriesListing\.asp/i)) {
				titles = doc.evaluate('//td[3][@title="Go to Series details"]', doc, null, XPathResult.ANY_TYPE, null);
				links = doc.evaluate('//td[2][@title="Go to Series details"]/a', doc, null, XPathResult.ANY_TYPE, null);
		}
		while ((title = titles.iterateNext()) && (link = links.iterateNext())) {
				if (url.match(/PhotoSearchSearchResults\.asp/i)) {
						items[link.href] = Zotero.Utilities.trimInternal(title.lastChild.textContent);
				} else {
						items[link.href] = Zotero.Utilities.trimInternal(title.firstChild.textContent);
				}
		}
		Zotero.selectItems(items, function(items) {
			if(!items) {
				return true;
			}
			for (var i in items) {
				records.push(i);
			}
			setupCallback();
		});
	} else {
		records = [url];
		setupCallback();
	}
}

/** BEGIN TEST CASES **/
var testCases = []
/** END TEST CASES **/