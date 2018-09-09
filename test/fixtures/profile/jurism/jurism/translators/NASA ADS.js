{
	"translatorID": "7987b420-e8cb-4bea-8ef7-61c2377cd686",
	"label": "NASA ADS",
	"creator": "Philipp Zumstein, Asa Kusuma and Ramesh Srigiriraju",
	"target": "^https?://(ukads|cdsads|ads|adsabs|esoads|adswww|www\\.ads)\\.(inasan|iucaa\\.ernet|nottingham\\.ac|harvard|eso|u-strasbg|nao\\.ac|astro\\.puc|bao\\.ac|on|kasi\\.re|grangenet|lipi\\.go|mao\\.kiev)\\.(edu|org|net|fr|jp|cl|id|uk|cn|ua|in|ru|br|kr)/(cgi-bin|abs)/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2018-02-17 17:39:33"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2018 Philipp Zumstein
	
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


// attr()/text() v2
function attr(docOrElem,selector,attr,index){var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector);return elem?elem.getAttribute(attr):null;}function text(docOrElem,selector,index){var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector);return elem?elem.textContent:null;}


function detectWeb(doc, url) {
	if (attr(doc, 'input[name="bibcode"][type="checkbox"]', 'value')) {
		return "multiple";
	} else if (attr(doc, 'input[name="bibcode"][type="hidden"]', 'value')){
		return "journalArticle";
	}
}

function scrape(bibcodes, url, doc) {
	// We can retrieve one RIS file containing the bibliographic
	// information of multiples entries specified by their
	// bibcode.
	var hostname = url.replace(/\/(cgi-bin|abs)\/.*/, '');
	var getURL = hostname + '/cgi-bin/nph-bib_query?'+bibcodes.join('&')+'&data_type=REFMAN&nocookieset=1';
	// Some articles have a full text link to the PDF, which
	// we can find by going through all links in <a>-tags. This
	// works for the detail page as well as for the mulitple page.
	var atags = doc.querySelectorAll('a');
	Zotero.Utilities.HTTP.doGet(getURL, function(text){	
		// load translator for RIS
		var translator = Zotero.loadTranslator("import");
		translator.setTranslator("32d59d2d-b65a-4da4-b0a3-bdd3cfb979e7");
		translator.setString(text);
		translator.setHandler("itemDone", function(obj, item) {
			if (item.url && item.url.includes('/abs/')) {
				let bibcode = item.url.split('/abs/')[1];
				let pdfUrl;
				// Go through all a tags and look for one including the
				// corresponding bibcode and the link_type for full-text PDF.
				for (let i=0; i<atags.length; i++) {
					let atagUrl = atags[i].href;
					if (atagUrl.includes('bibcode='+bibcode) && atagUrl.includes('link_type=ARTICLE')) {
						pdfUrl = atagUrl;
					}
				}
				if (pdfUrl) {
					//Z.debug(pdfUrl);
					item.attachments = [{
						url: pdfUrl,
						title: "Full Text PDF",
						mimeType: "application/pdf"
					}];
				}
			}
			item.complete();
		});	
		translator.translate();
	});
}


function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = doc.querySelectorAll('input[name="bibcode"][type="checkbox"]');
	for (var i=0; i<rows.length; i++) {
		var value = rows[i].value;
		var title = value;
		if (!value || !title) continue;
		if (checkOnly) return true;
		found = true;
		items[value] = title;
	}
	return found ? items : false;
}


function doWeb(doc, url) {
	if (detectWeb(doc, url) == "multiple") {
		Zotero.selectItems(getSearchResults(doc, false), function (items) {
			if (!items) {
				return true;
			}
			var bibcodes = [];
			for (var i in items) {
				bibcodes.push('bibcode='+i);
			}
			scrape(bibcodes, url, doc);
		});
	} else {
		var bibcode = attr(doc, 'input[name="bibcode"][type="hidden"]', 'value');
		scrape(['bibcode='+bibcode], url, doc);
	}
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://adsabs.harvard.edu/cgi-bin/basic_connect?qsearch=star&version=1",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://adsabs.harvard.edu/abs/1955ApJ...121..161S",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "The Luminosity Function and Stellar Evolution.",
				"creators": [
					{
						"lastName": "Salpeter",
						"firstName": "Edwin E.",
						"creatorType": "author"
					}
				],
				"date": "January 1, 1955",
				"DOI": "10.1086/145971",
				"ISSN": "0004-637X",
				"abstractNote": "Abstract image available at: \nhttp://adsabs.harvard.edu/abs/1955ApJ...121..161S",
				"journalAbbreviation": "The Astrophysical Journal",
				"libraryCatalog": "NASA ADS",
				"pages": "161",
				"publicationTitle": "The Astrophysical Journal",
				"url": "http://adsabs.harvard.edu/abs/1955ApJ...121..161S",
				"volume": "121",
				"attachments": [
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					}
				],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/
