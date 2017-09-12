{
	"translatorID": "04e63564-b92b-41cd-a9d5-366a02056d10",
	"label": "GaleGDC",
	"creator": "GaleGDC",
	"target": "/gdc/ncco|/gdc/xsearch|/gdc/artemis",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 270,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsb",
	"lastUpdated": "2014-08-26 03:45:45"
}

/*
 * Gale GDC Copyright (C) 2011 Gale GDC
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the
 * GNU General Public License as published by the Free
 * Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <http://www.gnu.org/licenses/>.
 */

function detectWeb(doc, url) {
	return GaleZotero.detectGaleWeb(doc, url);
}

function doWeb(doc, url) {
	return GaleZotero.doGaleWeb(doc, url);
}

var GaleZotero = (function() {

	function detectGaleWeb(doc, url) {
		if (shouldExclude(url)) {
			return false;
		}
		var result = false;
		if (isBookSection(url)) {
			result = 'bookSection';
		} else if (isManuscript(url)) {
			result = 'manuscript';
		} else if (isMap(url)) {
			result = 'map';
		} else if (isVideo(url)) {
			result = 'videoRecording';
		} else if (isImage(url)) {
			result = 'film';
		} else if (isNewspaperArticle(url)) {
			result = 'newspaperArticle';
		} else if (isMagazineArticle(url)) {
			result = 'magazineArticle';
		} else if (isMultiple(doc, url)) {
			result = 'multiple';
		} else if (isDocument(url)) {
			result = 'document';
		}
		return result;
	}

	function doGaleWeb(doc, url) {
		var risImporter = initializeRisImporter();
		var searchResults = getSearchResults(doc, url);
		if (searchResults) {
			var items = Zotero.Utilities.getItemArray(doc, searchResults, /\&zid=/);
			Zotero.selectItems(items, function(selectedItems) {
				if (!selectedItems) {
					return true;
				}
				var item;
				for (item in selectedItems) {
					if (selectedItems.hasOwnProperty(item)) {
						var docid = parseValue('documentId', item);
						var productName = parseValue('product_name', item);
						var urlForPosting = doc.getElementById("zotero_form").action
											+ '&citation_document_id=' + docid
											+ '&citation_document_url=' + encodeURIComponent(item.replace('|', '%7C'))
											+ '&product_name=' + productName;
						importSingleDocument(risImporter, urlForPosting);
					}
				}
			});
		} else {
			processSingleDocument(risImporter, doc);
		}
	}

	function importSingleDocument(risImporter, urlForPosting) {
		Zotero.Utilities.doPost(urlForPosting, '', function(text, obj) {
			risImporter.setString(text);
			risImporter.translate();
		});
	}

	function processSingleDocument(risImporter, doc) {
		var citationForm = doc.getElementById("citation_form");
		var otherUrl = citationForm.citation_document_url.value;
		var docId = citationForm.citation_document_id.value;
		var productName = citationForm.product_name.value;
		var urlForPosting = citationForm.action
				+ "&citation_format=ris"
				+ "&citation_document_url=" + encodeURIComponent(otherUrl)
				+ "&citation_document_id=" + encodeURIComponent(docId)
				+ '&product_name=' + productName;
		importSingleDocument(risImporter, urlForPosting);
	}

	function parseValue(name, item) {
		var regExp = new RegExp('[?&]' + name + '=([^&#]+)');
		var matchingGroups = regExp.exec(item);
		return matchingGroups ? matchingGroups[1] : '';
	}

	function getSearchResults(doc, url) {
		var searchResultsLocators = ['//div[@regionid="searchResults"]',
							   '//table[@id="searchResult"]',
							   '//table[@id="markedDocuments"]',
							   '//div[@class="search_results_center"]'];
		var resultsLocator = searchResultsLocators.join(' | ');
		return doc.evaluate(resultsLocator, doc, null, XPathResult.ANY_TYPE, null).iterateNext();
	}

	function isNewspaperArticle(url) {
		return (/NewspapersDetails/).test(url);
	}
	
	function isMagazineArticle(url) {
		return (/MagazinesDetails/).test(url);
	}

	function isMap(url) {
		return (/MapsDetails/).test(url);
	}

	function isDocument(url) {
		return (/Details/).test(url);
	}

	function isManuscript(url) {
		return (/ManuscriptsDetails/).test(url);
	}

	function isMultiple(doc, url) {
		return (/FullList|savedDocuments|searchResults/).test(url) && getSearchResults(doc, url);
	}

	function shouldExclude(url) {
		return (/CitationsFullList/).test(url);
	}

	function isBookSection(url) {
		return (/MonographsDetails|PhotographsDetails/).test(url);
	}

	function isVideo(url) {
		return (/VideosDetails/).test(url);
	}

	function isImage(url) {
		return (/ImagesDetails/).test(url);
	}

	function initializeRisImporter() {
		var importer = Zotero.loadTranslator("import");
		importer.setHandler("itemDone", function(obj, item) {
			item.attachments = [];
			item.complete();
		});
		importer.setTranslator("32d59d2d-b65a-4da4-b0a3-bdd3cfb979e7");
		return importer;
	}

	return {
		detectGaleWeb : detectGaleWeb,
		doGaleWeb : doGaleWeb,
		_privateData : {
			parseValue : parseValue,
			importSingleDocument : importSingleDocument,
			processSingleDocument : processSingleDocument
		}
	};

}());
