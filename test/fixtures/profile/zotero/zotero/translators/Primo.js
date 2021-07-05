{
	"translatorID": "1300cd65-d23a-4bbf-93e5-a3c9e00d1066",
	"translatorType": 4,
	"label": "Primo",
	"creator": "Matt Burton, Avram Lyon, Etienne Cavalié, Rintze Zelle, Philipp Zumstein, Sebastian Karcher, Aurimas Vinckevicius",
	"target": "/primo_library/|/nebis/|^https?://www\\.recherche-portal\\.ch/zbz/",
	"minVersion": "2.1.9",
	"maxVersion": null,
	"priority": 101,
	"inRepository": true,
	"browserSupport": "gcsbv",
	"lastUpdated": "2021-06-14 17:05:00"
}

/*
	***** BEGIN LICENSE BLOCK *****
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


/*
Supports Primo 2:
Université de Nice, France (http://catalogue.unice.fr/)  (looks like this is Primo3 now, too)
Supports Primo 3
Boston College (http://www.bc.edu/libraries/),
Oxford Libraries (http://solo.ouls.ox.ac.uk/)

Primos with showPNX.jsp installed:
(1) http://purdue-primo-prod.hosted.exlibrisgroup.com/primo_library/libweb/action/search.do?vid=PURDUE
(2) http://primo.bib.uni-mannheim.de/primo_library/libweb/action/search.do?vid=MAN_UB
(3) http://limo.libis.be/primo_library/libweb/action/search.do?vid=LIBISnet&fromLogin=true
(4.a) http://virtuose.uqam.ca/primo_library/libweb/action/search.do?vid=UQAM
(5) http://searchit.princeton.edu/primo_library/libweb/action/dlDisplay.do?docId=PRN_VOYAGER2778598&vid=PRINCETON&institution=PRN
*/

function getSearchResults(doc) {
	// order dictates preference
	var linkXPaths = ['.//li[starts-with(@id,"exlidResult") and substring(@id,string-length(@id)-10)="-DetailsTab"]/a[@href]', // details link
		'.//h2[@class="EXLResultTitle"]/a[@href]']; // title link
	var resultsXPath = '//*[self::tr or self::div][starts-with(@id, "exlidResult") and '
		+ 'number(substring(@id,12))=substring(@id,12)][' + linkXPaths.join(' or ') + ']';
	// Z.debug(resultsXPath);
	var results = ZU.xpath(doc, resultsXPath);
	results.titleXPath = './/h2[@class="EXLResultTitle"]';
	results.linkXPaths = linkXPaths;
	return results;
}

function detectWeb(doc) {
	if (getSearchResults(doc).length) {
		return 'multiple';
	}
	
	var contentDiv = doc.getElementsByClassName('EXLFullResultsHeader');
	if (!contentDiv.length) contentDiv = doc.getElementsByClassName('EXLFullDisplay');
	if (!contentDiv.length) contentDiv = doc.getElementsByClassName('EXLFullView');
	if (contentDiv.length) return 'book';
	return false;
}

function doWeb(doc, url) {
	var searchResults = getSearchResults(doc);
	if (searchResults.length) {
		var items = {}, itemIDs = {}, title, link,
			linkXPaths = searchResults.linkXPaths;
		for (var i = 0, n = searchResults.length; i < n; i++) {
			title = ZU.xpathText(searchResults[i], searchResults.titleXPath);
			for (var j = 0, m = linkXPaths.length; j < m; j++) {
				link = ZU.xpath(searchResults[i], linkXPaths[j])[0];
				if (link) {
					break;
				}
			}
			
			if (!link || !title || !(title = ZU.trimInternal(title))) continue;
			
			items[link.href] = title;
			itemIDs[link.href] = { id: i, docID: getDocID(link.href) };
		}
		
		Z.selectItems(items, function (selectedItems) {
			if (!selectedItems) return true;
			
			var urls = [];
			for (var i in selectedItems) {
				urls.push({ url: i, id: itemIDs[i].id, docID: itemIDs[i].docID });
			}
			fetchPNX(urls);
			return true;
		});
	}
	else {
		fetchPNX([{ url: url, id: 0, docID: getDocID(url) }]);
	}
}

function getDocID(url) {
	var id = url.match(/\bdoc(?:Id)?=([^&]+)/i);
	if (id) return id[1];
	else return false;
}

// keeps track of which URL format works for retrieving PNX record
// and applies the correct transformation function
var PNXUrlGenerator = new function () {
	var functions = [
		// showPNX.js
		// using docIDs instead of IDs tied to a session
		// e.g. http://searchit.princeton.edu/primo_library/libweb/showPNX.jsp?id=PRN_VOYAGER7343340
		function (urlObj) {
			return getUrlWithId(urlObj.url, urlObj.docID);
		},
		// fall back to IDs
		// from: http://primo.bib.uni-mannheim.de/primo_library/libweb/action/search.do?...
		// to:   http://primo.bib.uni-mannheim.de/primo_library/libweb/showPNX.jsp?id=
		function (urlObj) {
			return getUrlWithId(urlObj.url, urlObj.id);
		},
		// simply add &showPnx=true
		function (urlObj) {
			var url = urlObj.url.split('#');
			if (!url[0].includes("?")) {
				url[0] += '?';
			}
			else {
				url[0] += '&';
			}
			return url[0] + 'showPnx=true';
		}
	];
	
	function getUrlWithId(url, id) {
		url = url.match(/(https?:\/\/[^?#]+\/)[^?#]+\/[^/]*(?:[?#]|$)/);
		if (!url) return false;
		return url[1] + 'showPNX.jsp?id=' + id;
	}
	
	this.currentFunction = 0;
	this.confirmed = false;
	
	this.getUrl = function (data) {
		var fun = functions[this.currentFunction];
		if (!fun) return false;
		
		return fun(data);
	};
	
	this.nextFunction = function () {
		if (!this.confirmed && this.currentFunction < functions.length) {
			Z.debug("Function " + this.currentFunction + " did not work.");
			this.currentFunction++;
			return true;
		}
		else {
			return false;
		}
	};
};

// retrieve PNX records for given items sequentially
function fetchPNX(itemData) {
	if (!itemData.length) return; // do this until we run out of URLs
	
	var data = itemData.shift();
	var url = PNXUrlGenerator.getUrl(data); // format URL if still possible
	if (!url) {
		if (PNXUrlGenerator.nextFunction()) {
			itemData.unshift(data);
		}
		else if (!PNXUrlGenerator.confirmed) {
			// in case we can't find PNX for a particular item,
			// go to the next and start looking from begining
			Z.debug("Could not determine PNX url from " + data.url);
			PNXUrlGenerator.currentFunction = 0;
		}
		
		fetchPNX(itemData);
		return;
	}
	
	var gotPNX = false;
	Z.debug("Trying " + url);
	ZU.doGet(url,
		function (text) {
			text = text.trim();
			if (text.substr(0, 5) != '<?xml' || text.search(/<error\b/i) !== -1) {
				// try a different PNX url
				gotPNX = false;
				return;
			}
			else {
				gotPNX = true;
				PNXUrlGenerator.confirmed = true;
			}

			importPNX(text, url);
		},
		function () {
			if (!gotPNX && PNXUrlGenerator.nextFunction()) {
				// if url function not confirmed, try another one on the same URL
				// otherwise, we move on
				itemData.unshift(data);
			}
			
			fetchPNX(itemData);
		},
		null,
		null,
		[200, 404, 500]
	);
}

function importPNX(text, url) {
	// Z.debug(text);
	var translator = Zotero.loadTranslator("import");
	translator.setTranslator("efd737c9-a227-4113-866e-d57fbc0684ca");
	translator.setString(text);
	translator.setHandler("itemDone", function (obj, item) {
		if (url) {
			item.libraryCatalog = url.match(/^https?:\/\/(.+?)\//)[1].replace(/\.hosted\.exlibrisgroup/, "");
		}
		item.complete();
	});
	translator.translate();
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://princeton-primo.hosted.exlibrisgroup.com/primo_library/libweb/action/dlDisplay.do?vid=PRINCETON&search_scope=All%20Princeton%20Libraries&docId=PRN_VOYAGER2778598&fn=permalink",
		"items": [
			{
				"itemType": "book",
				"title": "China and foreign missionaries.",
				"creators": [
					{
						"lastName": "Great Britain Foreign Office",
						"creatorType": "author",
						"fieldMode": 1
					}
				],
				"date": "1860",
				"callNumber": "5552.406",
				"language": "eng",
				"libraryCatalog": "princeton-primo.com",
				"place": "London",
				"publisher": "1860-1912",
				"attachments": [],
				"tags": [
					{
						"tag": "China"
					},
					{
						"tag": "China; China"
					},
					{
						"tag": "Foreign relations"
					},
					{
						"tag": "Foreign relations"
					},
					{
						"tag": "Great Britain; Great Britain"
					},
					{
						"tag": "Missions"
					},
					{
						"tag": "Religion; China"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://digitale.beic.it/primo_library/libweb/action/display.do?doc=39bei_digitool2018516",
		"items": [
			{
				"itemType": "book",
				"title": "Grida per i Milanesi che avevano seguito Ludovico il Moro",
				"creators": [
					{
						"lastName": "Milano",
						"creatorType": "author",
						"fieldMode": 1
					}
				],
				"date": "1500",
				"language": "ita",
				"libraryCatalog": "digitale.beic.it",
				"place": "Milano",
				"publisher": "Ambrogio : da Caponago",
				"attachments": [],
				"tags": [
					"LEGGI;ITALIA - STORIA MEDIOEVALE"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/
