{
	"translatorID": "0a61e167-de9a-4f93-a68a-628b48855909",
	"translatorType": 8,
	"label": "Crossref REST",
	"creator": "Martynas Bagdonas",
	"target": "",
	"minVersion": "5.0.0",
	"maxVersion": null,
	"priority": 90,
	"inRepository": true,
	"browserSupport": "gcsibv",
	"lastUpdated": "2018-06-16 12:00:00"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2018

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

// Based on CrossRef.js (by Simon Kornblith), which uses OpenURL API

// This translator uses the newer REST API
// https://github.com/Crossref/rest-api-doc
// https://github.com/Crossref/rest-api-doc/blob/master/api_format.md
// REST API documentation not always reflect the actual API
// and some fields are undocumented.
// All Crossref item types can be retrieved at http://api.crossref.org/types

function removeUnsupportedMarkup(text) {
	let markupRE = /<(\/?)(\w+)[^<>]*>/gi;
	let supportedMarkup = ['i', 'b', 'sub', 'sup', 'sc'];
	let transformMarkup = {
		'scp': {
			open: '<span style="font-variant:small-caps;">',
			close: '</span>'
		}
	};
	
	return text.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1') // Remove CDATA markup
		.replace(markupRE, function (m, close, name) {
			name = name.toLowerCase();
			
			if (supportedMarkup.includes(name)) {
				return (close ? '</' : '<') + name + '>';
			}
			
			let newMarkup = transformMarkup[name.toLowerCase()];
			if (newMarkup) {
				return close ? newMarkup.close : newMarkup.open;
			}
			
			return '';
		});
}

function fixAuthorCapitalization(string) {
	// Try to use capitalization function from Zotero Utilities,
	// because the current one doesn't support unicode names.
	// Can't fix this either because ZU.XRegExp.replace is
	// malfunctioning when calling from translators.
	if (ZU.capitalizeName) return ZU.capitalizeName(string);
	if (typeof string === "string" && string.toUpperCase() === string) {
		string = string.toLowerCase().replace(/\b[a-z]/g, function (m) {
			return m[0].toUpperCase();
		});
	}
	return string;
}

function parseCreators(result, item, typeOverrideMap) {
	let types = ['author', 'editor', 'chair', 'translator'];
	
	for (let i = 0; i < types.length; i++) {
		let type = types[i];
		
		if (result[type]) {
			let creatorType = null;
			
			if (typeOverrideMap && typeOverrideMap[type] !== undefined) {
				creatorType = typeOverrideMap[type];
			}
			else if (type === "author" || type === "editor" || type === "translator") {
				creatorType = type;
			}
			else {
				creatorType = "contributor";
			}
			
			if (!creatorType) continue;
			
			for (let j = 0; j < result[type].length; j++) {
				let creator = {};
				
				creator.creatorType = creatorType;
				
				if (result[type].name) { // Organization
					creator.fieldMode = 1;
					creator.lastName = result[type][j].name;
				}
				else {
					creator.firstName = fixAuthorCapitalization(result[type][j].given);
					creator.lastName = fixAuthorCapitalization(result[type][j].family);
					if (!creator.firstName) creator.fieldMode = 1;
				}
				
				item.creators.push(creator);
			}
		}
	}
}

function processCrossref(json) {
	json = JSON.parse(json);
	
	for (let i = 0; i < json.message.items.length; i++) {
		let result = json.message.items[i];
		
		let item = null;
		
		// Journal article
		if (['journal-article'].includes(result.type)) {
			item = new Zotero.Item("journalArticle");
			if (result['container-title']) item.publicationTitle = result['container-title'][0];
			if (result['short-container-title']
				&& result['short-container-title'][0] !== result['container-title'][0]) {
				item.journalAbbreviation = result['short-container-title'][0];
			}
			item.volume = result.volume;
			item.issue = result.issue;
			if (result.ISBN) item.ISBN = result.ISBN[0];
			if (result.ISSN) item.ISSN = result.ISSN[0];
		}
		// Book
		else if (['book', 'book-series', 'book-set', 'book-track', 'monograph', 'reference-book']
				.includes(result.type)) {
			item = new Zotero.Item("book");
			item.publisher = result.publisher;
			item.place = result['publisher-location'];
			if (result.ISBN) item.ISBN = result.ISBN[0];
		}
		// Book section
		else if (['book-chapter', 'book-part', 'book-section', 'reference-entry']
				.includes(result.type)) {
			item = new Zotero.Item("bookSection");
			item.publisher = result.publisher;
			item.place = result['publisher-location'];
			if (result.ISBN) item.ISBN = result.ISBN[0];
		}
		// Report
		else if (['dataset', 'posted-content', 'report', 'report-series', 'standard']
				.includes(result.type)) {
			item = new Zotero.Item("report");
			item.institution = result.publisher;
			item.place = result['publisher-location'];
			item.seriesTitle = result['container-title'];
		}
		// Conference paper
		else if (['proceedings-article'].includes(result.type)) {
			item = new Zotero.Item("conferencePaper");
			item.proceedingsTitle = result['container-title'];
			item.publisher = result.publisher;
			if (result.event) {
				item.conferenceName = result.event.name;
				item.place = result.event.location;
			}
			if (result.ISBN) item.ISBN = result.ISBN[0];
		}
		// Thesis
		else if (['dissertation'].includes(result.type)) {
			item = new Zotero.Item("thesis");
			item.university = result.publisher;
			item.place = result['publisher-location'];
		}
		else {
			return;
		}
		
		// edited-book, standard-series - ignore, because Crossref has zero results for this type
		// component, journal, journal-issue, journal-volume, other, proceedings - ignore,
		// because Zotero doesn't have equivalent item types.
		
		item.abstractNote = result.abstract;
		
		parseCreators(result, item);
		
		
		// Contains the earliest of: published-online, published-print, content-created
		let pubDate = result['issued'];
		
		if (pubDate && pubDate['date-parts'][0]) {
			let year = pubDate['date-parts'][0][0];
			let month = pubDate['date-parts'][0][1];
			let day = pubDate['date-parts'][0][2];
			
			if (year) {
				if (month) {
					if (day) {
						item.date = year + "-" + month + "-" + day;
					}
					else {
						item.date = month + "/" + year;
					}
				}
				else {
					item.date = year;
				}
			}
		}
		
		item.pages = result.page;
		
		if (result.DOI) {
			if (ZU.fieldIsValidForType('DOI', item.itemType)) {
				item.DOI = result.DOI;
			}
			// add DOI to extra for unsupprted items
			else {
				if (item.extra) {
					item.extra += '\nDOI: ' + result.DOI;
				}
				else {
					item.extra = 'DOI: ' + result.DOI;
				}
			}
		}
		
		// result.URL is always http://dx.doi.org/..
		
		if (result.link && result.link.URL) item.url = result.link.URL;
		
		if (result.title && result.title[0]) {
			item.title = result.title[0];
			if (result.subtitle && result.subtitle[0]) {
				// Don't duplicate subtitle if it already exists in title
				if (item.title.toLowerCase().indexOf(result.subtitle[0].toLowerCase()) < 0) {
					item.title += ': ' + result.subtitle[0];
				}
			}
			item.title = removeUnsupportedMarkup(item.title);
		}
		
		// Check if there are potential issues with character encoding and try to fix it
		// e.g. 10.1057/9780230391116.0016 (en dash in title is presented as <control><control>â)
		for (let field in item) {
			if (typeof item[field] !== 'string') continue;
			// Check for control characters that should never be in strings from Crossref
			if (/[\u007F-\u009F]/.test(item[field])) {
				item[field] = decodeURIComponent(escape(item[field]));
			}
			item[field] = ZU.unescapeHTML(item[field]);
		}
		item.libraryCatalog = 'Crossref';
		item.complete();
	}
}

function detectSearch(item) {
	return false;
}

function doSearch(item) {
	// Reduce network traffic by selecting only required fields
	let selectedFields = [
		'type',
		'container-title',
		'short-container-title',
		'volume',
		'issue',
		'ISBN',
		'ISSN',
		'publisher',
		'publisher-location',
		'event',
		'abstract',
		'issued',
		'page',
		'DOI',
		'link',
		'title',
		'subtitle',
		'author',
		'editor',
		'chair',
		'translator'
	];
	
	let query = null;
	
	if (item.DOI) {
		if (Array.isArray(item.DOI)) {
			query = '?filter=doi:' + item.DOI.map(x => ZU.cleanDOI(x)).filter(x => x).join(',doi:');
		} else {
			query = '?filter=doi:' + ZU.cleanDOI(item.DOI);
		}
	}
	else if (item.query) {
		query = '?query.bibliographic=' + encodeURIComponent(item.query);
	}
	else return;
	
	query += '&select=' + selectedFields.join(',');
	
	if (Z.getHiddenPref('CrossrefREST.email')) {
		query += '&mailto=' + Z.getHiddenPref('CrossrefREST.email');
	}
	
	ZU.doGet('https://api.crossref.org/works/' + query, function (responseText) {
		processCrossref(responseText);
	});
}

/** BEGIN TEST CASES **/
var testCases = [];
/** END TEST CASES **/