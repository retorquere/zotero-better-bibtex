{
	"translatorID": "c159dcfe-8a53-4301-a499-30f6549c340d",
	"label": "DOI",
	"creator": "Simon Kornblith",
	"target": "",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 400,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2020-03-13 02:38:54"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2019 Simon Kornblith

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

// builds a list of DOIs
function getDOIs(doc) {
	// TODO Detect DOIs more correctly.
	// The actual rules for DOIs are very lax-- but we're more strict.
	// Specifically, we should allow space characters, and all Unicode
	// characters except for control characters. Here, we're cheating
	// by not allowing ampersands, to fix an issue with getting DOIs
	// out of URLs.
	// Additionally, all content inside <noscript> is picked up as text()
	// by the xpath, which we don't necessarily want to exclude, but
	// that means that we can get DOIs inside node attributes and we should
	// exclude quotes in this case.
	// DOI should never end with a period or a comma (we hope)
	// Description at: http://www.doi.org/handbook_2000/appendix_1.html#A1-4
	const DOIre = /\b10\.[0-9]{4,}\/[^\s&"']*[^\s&"'.,]/g;

	var dois = [];

	var m, DOI;
	var treeWalker = doc.createTreeWalker(doc.documentElement, 4, null, false);
	var ignore = ['script', 'style'];
	while (treeWalker.nextNode()) {
		if (ignore.includes(treeWalker.currentNode.parentNode.tagName.toLowerCase())) continue;
		// Z.debug(node.nodeValue)
		DOIre.lastIndex = 0;
		while ((m = DOIre.exec(treeWalker.currentNode.nodeValue))) {
			DOI = m[0];
			if (DOI.endsWith(")") && !DOI.includes("(")) {
				DOI = DOI.substr(0, DOI.length - 1);
			}
			if (DOI.endsWith("}") && !DOI.includes("{")) {
				DOI = DOI.substr(0, DOI.length - 1);
			}
			// only add new DOIs
			if (!dois.includes(DOI)) {
				dois.push(DOI);
			}
		}
	}
	
	// FIXME: The test for this (developmentbookshelf.com) fails in Scaffold due
	// to a cookie error, though running the code in Scaffold still works
	var links = doc.querySelectorAll('a[href]');
	for (let link of links) {
		DOIre.lastIndex = 0;
		let m = DOIre.exec(link.href);
		if (m) {
			let doi = m[0];
			if (doi.endsWith(")") && !doi.includes("(")) {
				doi = doi.substr(0, doi.length - 1);
			}
			if (doi.endsWith("}") && !doi.includes("{")) {
				doi = doi.substr(0, doi.length - 1);
			}
			// only add new DOIs
			if (!dois.includes(doi)) {
				dois.push(doi);
			}
		}
	}

	return dois;
}

function detectWeb(doc, url) {
	// Blacklist the advertising iframe in ScienceDirect guest mode:
	// http://www.sciencedirect.com/science/advertisement/options/num/264322/mainCat/general/cat/general/acct/...
	// This can be removed from blacklist when 5c324134c636a3a3e0432f1d2f277a6bc2717c2a hits all clients (Z 3.0+)
	const blacklistRe = /^https?:\/\/[^/]*(?:google\.com|sciencedirect\.com\/science\/advertisement\/)/i;
	
	if (!blacklistRe.test(url)) {
		var DOIs = getDOIs(doc);
		if (DOIs.length) {
			return "multiple";
		}
	}
	return false;
}

function retrieveDOIs(dois) {
	let items = {};
	let numDOIs = dois.length;

	for (const doi of dois) {
		items[doi] = null;
		
		const translate = Zotero.loadTranslator("search");
		translate.setTranslator("b28d0d42-8549-4c6d-83fc-8382874a5cb9");
		translate.setSearch({ itemType: "journalArticle", DOI: doi });
	
		// don't save when item is done
		translate.setHandler("itemDone", function (_translate, item) {
			if (!item.title) {
				Zotero.debug("No title available for " + item.DOI);
				item.title = "[No Title]";
			}
			items[item.DOI] = item;
		});
		/* eslint-disable no-loop-func */
		translate.setHandler("done", function () {
			numDOIs--;
			
			// All DOIs retrieved
			if (numDOIs <= 0) {
				// Check to see if there's at least one DOI
				if (!Object.keys(items).length) {
					throw new Error("DOI Translator: could not find DOI");
				}
				
				// Only show items that resolved successfully
				let select = {};
				for (let doi in items) {
					let item = items[doi];
					if (item) {
						select[doi] = item.title || "[" + item.DOI + "]";
					}
				}
				Zotero.selectItems(select, function (selectedDOIs) {
					if (!selectedDOIs) return;
					
					for (let selectedDOI in selectedDOIs) {
						items[selectedDOI].complete();
					}
				});
			}
		});
	
		// Don't throw on error
		translate.setHandler("error", function () {});
	
		translate.translate();
	}
}

function doWeb(doc) {
	var dois = getDOIs(doc);
	Z.debug(dois);
	retrieveDOIs(dois);
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://blog.apastyle.org/apastyle/digital-object-identifier-doi/",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://libguides.csuchico.edu/citingbusiness",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://www.egms.de/static/de/journals/mbi/2015-15/mbi000336.shtml",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://www.roboticsproceedings.org/rss09/p23.html",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://en.wikipedia.org/wiki/Template_talk:Doi",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://www.developmentbookshelf.com/action/showPublications",
		"items": "multiple"
	}
]
/** END TEST CASES **/
