{
	"translatorID": "1f40baef-eece-43e4-a1cc-27d20c0ce086",
	"label": "Engineering Village",
	"creator": "Ben Parr, Sebastian Karcher",
	"target": "^https?://(www\\.)?engineeringvillage(2)?\\.(com|org)",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2018-10-07 10:02:04"
}

/*
	***** BEGIN LICENSE BLOCK *****
	
	Engineering Village Translator - Copyright © 2018 Sebastian Karcher 
	This file is part of Zotero.
	
	Zotero is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.
	
	Zotero is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU Affero General Public License for more details.
	
	You should have received a copy of the GNU Affero General Public License
	along with Zotero.  If not, see <http://www.gnu.org/licenses/>.
	
	***** END LICENSE BLOCK *****
*/

function detectWeb(doc, url) {
	Z.monitorDOMChanges(doc.getElementById("ev-application"), {childList: true});
	var printlink = doc.getElementById('printlink');
	if (url.includes("/search/doc/") && printlink && getDocIDs(printlink.href)) {
		return "journalArticle";
	}
	if ((url.includes("quick.url?") || url.includes("expert.url?") || url.includes("thesaurus.url?")) && getSearchResults(doc, true)) {
		return "multiple";
	}
}


function getDocIDs(url) {
	var m = url.match(/\bdocidlist=([^&#]+)/);
	if (!m) return false;
	
	return decodeURIComponent(m[1]).split(',');
}


function getSearchResults(doc, checkOnly) {
	var rows = doc.querySelectorAll('div[class*=result-row]'),
		items = {},
		found = false;
	for (var i=0; i<rows.length; i++) {
		var checkbox = rows[i].querySelector('input[name="cbresult"]');
		if (!checkbox) continue;
		var docid = checkbox.getAttribute('docid');
		if (!docid) continue;
		var title = rows[i].querySelector('h3.result-title');
		if (!title) continue;
		
		if (checkOnly) return true;
		found = true;
		items[docid] = ZU.trimInternal(title.textContent);
	}
	
	return found ? items : false;
}

function doWeb(doc, url) {
	if (detectWeb(doc, url) == 'multiple') {
		Zotero.selectItems(getSearchResults(doc), function (items) {
			if (!items) return true;
			
			var ids = [];
			for (var i in items) {
				ids.push(i);
			}
			
			fetchRIS(doc, ids);
		});
	} else {
		var printlink = doc.getElementById('printlink');
		fetchRIS(doc, getDocIDs(printlink.href));
	}
}


function fetchRIS(doc, docIDs) {
	Z.debug(docIDs);
	
	// handlelist to accompany the docidlist. Seems like it just has to be a
	// list of numbers the same size as the docid list.
	var handleList = new Array(docIDs.length);
	for (var i=0; i<docIDs.length; i++) {
		handleList[i] = i+1;
	}
	
	var db = doc.getElementsByName('database')[0];
	if (db) db = db.value;
	if (!db) db = "1";
	
	var url = '/delivery/download/submit.url?downloadformat=ris'
		+ '&filenameprefix=Engineering_Village&displayformat=abstract'
		+ '&database=' + encodeURIComponent(db)
		+ '&docidlist=' + encodeURIComponent(docIDs.join(','))
		+ '&handlelist=' + encodeURIComponent(handleList.join(','));
	
	// This is what their web page does. It also sends Content-type and
	// Content-length parameters in the body, but seems like we can skip that
	// part
	ZU.doPost(url, "", function(text) {
		// Z.debug(text);
		
		var translator = Zotero.loadTranslator("import");
		// RIS
		translator.setTranslator("32d59d2d-b65a-4da4-b0a3-bdd3cfb979e7");
		translator.setString(text);
		translator.setHandler('itemDone', function(obj, item) {
			item.attachments = [];
			item.notes = [];
			
			item.complete();
		});
		translator.translate();
	});
}
/** BEGIN TEST CASES **/
var testCases = []
/** END TEST CASES **/
