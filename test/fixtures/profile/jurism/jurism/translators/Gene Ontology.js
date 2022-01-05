{
	"translatorID": "cee0cca2-e82a-4618-b6cf-16327970169d",
	"label": "Gene Ontology",
	"creator": "Amelia Ireland",
	"target": "^https?://.*\\.geneontology\\.org",
	"minVersion": "2.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcv",
	"lastUpdated": "2014-01-05 11:26:46"
}

/*
	Gene Ontology website translator
	Copyright (C) 2010-2011 girlwithglasses, amelia.ireland@gmail.com

	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU General Public License for more details.

	You should have received a copy of the GNU General Public License
	along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
/*
	This translator works on cited PubMed references on the Gene Ontology website.

	It makes use of the code of the existing PubMed translator; thanks to the
	authors of that translator for their premium quality code.
*/


var items = {};
var selectArray = {};	
function detectWeb(doc, url) {
	var xPath = '//cite//*[@class="pmid"] | //cite//a[contains (@href, "pubmed")]';
	var cites = doc.evaluate(xPath, doc, null, XPathResult.ANY_TYPE, null).iterateNext();

	if (cites)
	{	Zotero.debug("Found some cites!");
		return "multiple";
	}
}

function doWeb(doc, url) {
	var PMIDs = getPMIDs(doc);
	retrievePMIDs(PMIDs, doc);
}


function getPMIDs(doc){
	var myPMID = '//cite//*[@class="pmid"] | //cite//a[contains (@href, "pubmed")]';
	var pmids = doc.evaluate(myPMID, doc, null, XPathResult.ANY_TYPE, null);
	var pmid_list = new Array();
	var unknown_list = new Array();
	var x;
	while (x = pmids.iterateNext()) {
		if (x.href && x.href.match('pubmed')) {
			// get the number
			var n = x.href.lastIndexOf("/");
			n++;
			pmid_list.push(x.href.substr(n));
//			Zotero.debug("Got a pubmed href! " + x.href.substr(n));
		}
		else {
			unknown_list.push(x);
		}
	}
	if (unknown_list.length > 0) {
//		Zotero.debug("Couldn't work out what to do with these refs: " + unknown_list.join("\n"));
	}
	if (pmid_list.length > 0) {
		Zotero.debug( "Found " + pmid_list.length + " PMIDs!" );
	}
	return pmid_list;
}

function retrievePMIDs(PMIDs, doc){
	_numPMIDs = PMIDs.length;
	for (var i=0; i<_numPMIDs; i++){
		(function(doc, PMID) {
			var translate = Zotero.loadTranslator("search");
			translate.setTranslator("fcf41bed-0cbc-3704-85c7-8062a0068a7a");
	
			var item = {"itemType":"journalArticle", "PMID":PMID};
			translate.setSearch(item);
	
			// don't save when item is done
			translate.setHandler("itemDone", function(translate, item) {
				item.repository = "CrossRef";
				items[PMID] = item;
				selectArray[PMID] = item.title;
			});
	
			translate.setHandler("done", function(translate) {
				_numPMIDs--;
				if (numPMIDs <= 0) {
					completePMIDs(doc);
				}
			});
	
			// Don't throw on error
			translate.setHandler("error", function() {});
	
			translate.translate();
		})(doc, PMIDs[i]);	
	}
}

function completePMIDs(doc) {
	// all PMIDs retrieved now
	// check to see if there is more than one DOI
	var numPMIDs = 0;
	for (var PMID in selectArray) {
		numPMIDs++;
		if (numPMIDs == 1) break;
	}
	if (numPMIDs == 0) {
		throw "Could not find PMID";
	}  else {
		Zotero.selectItems(selectArray, function(selectedPMIDs) {
			if (!selectedPMIDs) return true;

			for (var PMID in selectedPMIDs) {
				items[PMID].complete();
			}
		});
	}
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.geneontology.org/GO.cite.shtml",
		"items": "multiple"
	}
]
/** END TEST CASES **/