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
	"browserSupport": "gcsv",
	"lastUpdated": "2016-11-05 10:57:01"
}

// The variables items and selectArray will be filled during the first
// as well as the second retrieveDOIs function call and therefore they
// are defined global.
var items = {};
var selectArray = {};


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
	const DOIXPath = "//text()[contains(., '10.')]\
						[not(parent::script or parent::style)]";

	var dois = [];

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
			if(DOI.substr(-1) == "}" && DOI.indexOf("{") == -1) {
				DOI = DOI.substr(0, DOI.length-1);
			}
			// only add new DOIs
			if(dois.indexOf(DOI) == -1) {
				dois.push(DOI);
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
	
	if(!blacklistRe.test(url)) {
		var DOIs = getDOIs(doc);
		if(DOIs.length) {
			return "multiple";
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
	} else {
		Zotero.selectItems(selectArray, function(selectedDOIs) {
			if(!selectedDOIs) return true;

			for(var DOI in selectedDOIs) {
				items[DOI].complete();
			}
		});
	}
}

function retrieveDOIs(dois, doc, providers) {
	var numDois = dois.length;
	var provider = providers.shift();
	
	var remainingDOIs = dois.slice();//copy array but not by reference

	for(var i=0, n=dois.length; i<n; i++) {
		(function(doc, DOI) {
			var translate = Zotero.loadTranslator("search");
			translate.setTranslator(provider.id);
	
			var item = {"itemType":"journalArticle", "DOI":DOI};
			translate.setSearch(item);
	
			// don't save when item is done
			translate.setHandler("itemDone", function(translate, item) {
				selectArray[item.DOI] = item.title;
				if (!item.title) {
					Zotero.debug("No title available for " + item.DOI);
					item.title = "[No Title]";
					selectArray[item.DOI] = "[" + item.DOI + "]";
				}
				items[item.DOI] = item;

				// done means not remaining anymore
				if (remainingDOIs.indexOf(item.DOI) > -1) {
					remainingDOIs.splice(remainingDOIs.indexOf(item.DOI), 1);
				} else {
					Z.debug(item.DOI + " not anymore in the list of remainingDOIs = " + remainingDOIs);
				}
			});
	
			translate.setHandler("done", function(translate) {
				numDois--;
				if(numDois <= 0) {
					Z.debug("Done with " + provider.name + ". Remaining DOIs: " + remainingDOIs);
					if (providers.length > 0 && remainingDOIs.length > 0) {
						retrieveDOIs(remainingDOIs, doc, providers);
					} else {
						completeDOIs(doc);
					}
				}
			});
	
			// Don't throw on error
			translate.setHandler("error", function() {});
	
			translate.translate();
		})(doc, dois[i]);
	}
}

function doWeb(doc, url) {
	var dois = getDOIs(doc);
	Z.debug(dois);
	var providers = [
		{
			id : "11645bd1-0420-45c1-badb-53fb41eeb753",
			name : "CrossRef"
		},
		{
			id : "9f1fb86b-92c8-4db7-b8ee-0b481d456428",
			name : "DataCite"
		}
	];
	retrieveDOIs(dois, doc, providers);
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
	}
]
/** END TEST CASES **/