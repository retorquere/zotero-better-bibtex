{
	"translatorID": "c159dcfe-8a53-4301-a499-30f6549c340d",
	"label": "DOI",
	"creator": "Simon Kornblith",
	"target": "",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 300,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsv",
	"lastUpdated": "2014-02-23 11:23:36"
}

var items = {};
var selectArray = {};

var __num_DOIs;

// builds a list of DOIs
function getDOIs(doc) {
	// TODO Detect DOIs more correctly.
	// The actual rules for DOIs are very lax-- but we're more strict.
	// Specifically, we should allow space characters, and all Unicode
	// characters except for control characters. Here, we're cheating
	// by not allowing ampersands, to fix an issue with getting DOIs
	// out of URLs.
	// Description at: http://www.doi.org/handbook_2000/appendix_1.html#A1-4
	const DOIre = /\b10\.[0-9]{4,}\/[^\s&]*[^\s\&\.,]/g;
	const DOIXPath = "//text()[contains(., '10.')]\
						[not(parent::script or parent::style)]";

	var DOIs = [];

	var node, m, DOI;
	var results = doc.evaluate(DOIXPath, doc, null, XPathResult.ANY_TYPE, null);
	while(node = results.iterateNext()) {
		//Z.debug(node.nodeValue)
		DOIre.lastMatch = 0;
		while(m = DOIre.exec(node.nodeValue)) {
			DOI = m[0];
			if(DOI.substr(-1) == ")" && DOI.indexOf("(") == -1) {
				DOI = DOI.substr(0, DOI.length-1);
			}
			// only add new DOIs
			if(DOIs.indexOf(DOI) == -1) {
				DOIs.push(DOI);
			}
		}
	}

	return DOIs;
}

function detectWeb(doc, url) {
	// Blacklist the advertising iframe in ScienceDirect guest mode:
	// http://www.sciencedirect.com/science/advertisement/options/num/264322/mainCat/general/cat/general/acct/...
	// This can be removed from blacklist when 5c324134c636a3a3e0432f1d2f277a6bc2717c2a hits all clients (Z 3.0+)
	const blacklistRe = /^https?:\/\/[^/]*(?:google\.com|sciencedirect\.com\/science\/advertisement\/)/i;
	
	if(!blacklistRe.test(url)) {
		var DOIs = getDOIs(doc);
		if(DOIs.length) {
			return DOIs.length == 1 ? "journalArticle" : "multiple";
		}
	}
	return false;
}

function completeDOIs(doc) {
	// all DOIs retrieved now
	// check to see if there is more than one DOI
	var numDOIs = 0;
	for(var DOI in selectArray) {
		numDOIs++;
		if(numDOIs == 2) break;
	}
	if(numDOIs == 0) {
		throw "DOI Translator: could not find DOI";
	} else if(numDOIs == 1) {
		// do we want to add URL of the page?
		items[DOI].url = doc.location.href;
		items[DOI].attachments = [{document:doc}];
		items[DOI].complete();
	} else {
		Zotero.selectItems(selectArray, function(selectedDOIs) {
			if(!selectedDOIs) return true;

			for(var DOI in selectedDOIs) {
				items[DOI].complete();
			}
		});
	}
}

function retrieveDOIs(DOIs, doc) {
	__num_DOIs = DOIs.length;

	for(var i=0, n=DOIs.length; i<n; i++) {
		(function(doc, DOI) {
			var translate = Zotero.loadTranslator("search");
			translate.setTranslator("11645bd1-0420-45c1-badb-53fb41eeb753");
	
			var item = {"itemType":"journalArticle", "DOI":DOI};
			translate.setSearch(item);
	
			// don't save when item is done
			translate.setHandler("itemDone", function(translate, item) {
				item.repository = "CrossRef";
				items[DOI] = item;
				selectArray[DOI] = item.title;
			});
	
			translate.setHandler("done", function(translate) {
				__num_DOIs--;
				if(__num_DOIs <= 0) {
					completeDOIs(doc);
				}
			});
	
			// Don't throw on error
			translate.setHandler("error", function() {});
	
			translate.translate();
		})(doc, DOIs[i]);
	}
}

function doWeb(doc, url) {
	var DOIs = getDOIs(doc);

	// retrieve full items asynchronously
	retrieveDOIs(DOIs, doc);
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
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"creatorType": "author",
						"firstName": "Jean M.",
						"lastName": "Twenge"
					},
					{
						"creatorType": "author",
						"firstName": "Stacy M.",
						"lastName": "Campbell"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{}
				],
				"publicationTitle": "Journal of Managerial Psychology",
				"volume": "23",
				"issue": "8",
				"language": "en",
				"ISSN": "0268-3946",
				"date": "2008",
				"pages": "862-877",
				"DOI": "10.1108/02683940810904367",
				"url": "http://libguides.csuchico.edu/citingbusiness",
				"title": "Generational differences in psychological traits and their impact on the workplace",
				"libraryCatalog": "CrossRef",
				"accessDate": "CURRENT_TIMESTAMP"
			}
		]
	}
]
/** END TEST CASES **/