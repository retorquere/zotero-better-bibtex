{
	"translatorID": "cde4428-5434-437f-9cd9-2281d14dbf9",
	"label": "Ovid",
	"creator": "Simon Kornblith, Michael Berkowitz, and Ovid Technologies",
	"target": "(gw2|asinghal|sp)[^/]+/ovidweb\\.cgi",
	"minVersion": "2.1.9",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcs",
	"lastUpdated": "2017-01-01 16:18:44"
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
Known "bug": translator will not work on PDF pages if those are accessed from
	individual item pages. There does not seem to be any way to construct
	metadata POST data from those views. If PDF is access directly from search
	results, we can reconstruct necessary data from the URL.
	
	We could try to go to a different page to fetch metadata
*/

function detectWeb(doc, url) {
	if (getSearchResults(doc, true) && getMetadataPost(doc, url, [0])) {
		return 'multiple';
	}
	
	var id = getIDFromPage(doc) || getIDFromUrl(url);
	Zotero.debug("Found ID: " + id);
	if (id && getMetadataPost(doc, url, [id])) {
		return 'journalArticle';
	}
	
	return false;
}

function getMetadataPost(doc, url, ids) {
	var s = doc.getElementById('S');
	if (s) s = s.value && 'S=' + encodeURIComponent(s.value);
	if (!s) s = getSFromUrl(url);
	if (!s || !ids.length) {
		if (!s) Zotero.debug("Could not find S parameter");
		if (!ids.length) Zotero.debug("No IDs supplied");
		return false;
	}
	
	var post = s
		+ '&R=' + ids.map(function(id) { return encodeURIComponent(id) }).join('&R=')
		+ "&jumpstartLink=1&Citation Page=Export Citation"
		+ "&cmexport=1&exportType=endnote&zoteroRecords=1";
		
	var action;
	if (doc.getElementById('OUSRT')) {
		//For OUS records, need to format UI code for OUS records in endnote format
		Zotero.debug("For OUS");
		action = doc.getElementsByName('Datalist')[0];
		post += "&ousRecords=1";
	} else { //for MSP records
		action = doc.getElementsByName('CitManPrev')[0];
		post += "&cmFields=ALL";
	}
	
	if (action) {
		action = action.value.replace(/\|.*/, "")
	} else {
		// Try getting it from URL
		var m = url.match(/S\.sh\.\d+/);
		if (m) {
			Zotero.debug("Using Citation Action parameter from URL: " + m[0]);
			action = m[0];
		}
	}
	
	if (!action) {
		Zotero.debug("Citation Action component not found");
		return false;
	}
	
	post += "&Citation Action=" + encodeURIComponent(action);
	
	return post;
}

function getIDFromPage(doc) {
	// E.g. single result in My Projects
	if (!doc.getElementsByClassName('citation-table').length) return;
	
	var checkboxes = doc.getElementsByClassName('bibrecord-checkbox');
	if (checkboxes.length == 1) {
		return checkboxes[0].value;
	}
}

function getIDFromUrl(url) {
	var m = decodeURI(url).match(/=S\.sh\.[^&#|]+\|([1-9]\d*)/);
	if (m) return m[1];
}

function getSFromUrl(url) {
	var m = decodeURI(url).match(/\bS=([^&]+)/);
	if (m) return 'S=' + encodeURIComponent(m[1]);
}

// seems like we have to check all of these, because some can be present but empty
// next to other nodes that are not empty
var titleNodeClasses = ['citation_title', 'titles-title', 'article-title',
	'chapter_title', 'chapter-title', 'muse-title', 'booklist-title'];
function getSearchResults(doc, checkOnly, extras) {
	var table = doc.getElementById('titles-records')
		|| doc.getElementById('item-records');
	if (!table) return false;
	
	var rows = table.getElementsByClassName('titles-row');
	if (!rows.length) rows = table.getElementsByClassName('toc-row');
	if (!rows.length) rows = table.getElementsByClassName('booklist-row');
	
	var successfulHit;
	if (!rows.length) return false;
	
	var items = {}, found = false;
	for (var i=0; i<rows.length; i++) {
		var row = rows[i];
		var id = row.getElementsByClassName('bibrecord-checkbox')[0];
		if (id) id = id.value;
		if (!id) continue;
		
		var title;
		if (successfulHit) {
			title = row.getElementsByClassName(successfulHit)[0];
			if (title) title = ZU.trimInternal(title.textContent);
		} else {
			for (var j=0; j<titleNodeClasses.length; j++) {
				title = row.getElementsByClassName(titleNodeClasses[j])[0];
				if (title) title = ZU.trimInternal(title.textContent);
				if (title) {
					successfulHit = titleNodeClasses[j];
					break;
				}
			}
		}
		
		if (!title) continue;
		
		if (checkOnly) return true;
		found = true;
		items[id] = title;
		
		var checkbox = row.querySelectorAll('input.bibrecord-checkbox')[0];
		if (checkbox) {
			items[id] = {
				title: title,
				checked: checkbox.checked
			};
		}
		
		if (extras) {
			// Look for PDF link
			var pdfLink = ZU.xpath(row, './/a[starts-with(@name, "PDF")]')[0];
			if (pdfLink) {
				extras[id] = {
					pdfLink: pdfLink.href
				};
			}
		}
	}
	
	return found ? items : false;
}

function doWeb(doc, url) {
	var extras = {};
	var results = getSearchResults(doc, false, extras);
	if (results) {
		Zotero.selectItems(results, function(selectedIds) {
			if (!selectedIds) return true;
			
			var ids = [];
			for (var i in selectedIds) {
				ids.push(i)
			}
			
			fetchMetadata(doc, url, ids, extras);
		});
	} else {
		var id = getIDFromPage(doc) || getIDFromUrl(url);
		
		// Look for PDF link on page as well
		var extras = {};
		var pdfLink = doc.getElementById('pdf')
			|| ZU.xpath(doc, '//a[starts-with(@name, "PDF")]')[0];
		if (pdfLink) {
			extras[id] = {
				pdfLink: pdfLink.href
			}
		} else if (pdfLink = doc.getElementById('embedded-frame')) {
			extras[id] = {
				resolvedPdfLink: pdfLink.src
			};
		} else {
			// Attempt to construct it from the URL
			var s = getSFromUrl(url);
			var pdfID = decodeURI(url).match(/\bS\.sh.\d+\|[1-9]\d*/);
			if (s && pdfID) {
				Zotero.debug("Manually constructing PDF URL. There might not be one available.");
				extras[id] = {
					pdfLink: 'ovidweb.cgi?' + s + '&PDFLink=B|' + encodeURIComponent(pdfID[0])
				};
			}
		}
		
		fetchMetadata(doc, url, [id], extras);
	}
}

function fetchMetadata(doc, url, ids, extras) {
	var postData = getMetadataPost(doc, url, ids);
	Zotero.debug("POST: " + postData);
	ZU.doPost('./ovidweb.cgi', postData, function (text) {
		// Get rid of some extra HTML fluff from the request if it's there
		// The section we want starts with something like
		// --HMvBAmfg|xxEGNm@\<{bVtBLgneqH?vKCw?nsIZhjcjsyRFVQ=
		// Content-type: application/x-bibliographic
		// Content-Transfer-Encoding: quoted-printable
		// Content-Description: Ovid Citations
		//
		// and ends with
		// --HMvBAmfg|xxEGNm@\<{bVtBLgneqH?vKCw?nsIZhjcjsyRFVQ=--

		text = text.replace(/[\s\S]*(--\S+)\s+Content-type:\s*application\/x-bibliographic[^<]+([\s\S]+?)\s*\1[\s\S]*/, '$2')
		Z.debug(text);
		
		var trans = Zotero.loadTranslator('import');
		// OVID Tagged
		trans.setTranslator('59e7e93e-4ef0-4777-8388-d6eddb3261bf');
		trans.setString(text);
		trans.setHandler('itemDone', function(obj, item) {
			if (item.itemID && extras[item.itemID]) {
				retrievePdfUrl(item, extras[item.itemID]);
			} else {
				item.complete();
			}
		});
		trans.translate();
	});
}

function retrievePdfUrl(item, extras) {
	if (extras.resolvedPdfLink) {
		item.attachments.push({
			title: "Full Text PDF",
			url: extras.resolvedPdfLink,
			mimeType: 'application/pdf'
		});
		item.complete();
	} else if (extras.pdfLink) {
		Zotero.debug("Looking for PDF URL on " + extras.pdfLink);
		ZU.doGet(extras.pdfLink, function(text) {
			var m = text.match(/<iframe [^>]*src\s*=\s*(['"])(.*?)\1/);
			if (m) {
				item.attachments.push({
					title: "Full Text PDF",
					url: m[2],
					mimeType: 'application/pdf'
				});
			}
		}, function() {
			item.complete();
		});
	} else {
		item.complete();
	}
}
/** BEGIN TEST CASES **/
var testCases = []
/** END TEST CASES **/