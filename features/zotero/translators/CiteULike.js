{
	"translatorID": "8917b41c-8527-4ee7-b2dd-bcbc3fa5eabd",
	"label": "CiteULike",
	"creator": "Sean Takats",
	"target": "https?://(?:www\\.)?citeulike.org(?:.*/tag/[^/]*$|/search/|/journal/|/user/|/group/[0-9]+/library$|/\\?page=[0-9]+$|/.*article/[0-9]+$|/$)",
	"minVersion": "1.0.0b4.r5",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2013-02-24 23:19:16"
}

function detectWeb(doc, url){
	var articleRe = /\/article\/[0-9]+$/;
	var m = url.match(articleRe);
	var newUris = new Array();
	
	if (m){
		return "journalArticle";
	} else {
		return "multiple";
	}
}

function doWeb(doc, url){
	var articleRe = /\/article\/[0-9]+$/;
	var m = url.match(articleRe);
	var newUris = new Array();
	
	if (m){
		newUris.push(url.replace(/citeulike\.org\//, "citeulike.org/endnote/"));
	} else {
		var namespace = doc.documentElement.namespaceURI;
		var nsResolver = namespace ? function(prefix) {
			if (prefix == 'x') return namespace; else return null;
		} : null;
		var elmt;
		var elmts = doc.evaluate('//a[@class="title"]', doc, nsResolver, XPathResult.ANY_TYPE, null);
		var items = new Object();		
		while(elmt = elmts.iterateNext()) {
			items[elmt.href] = Zotero.Utilities.trimInternal(elmt.textContent);
		} 
		items = Zotero.selectItems(items);
		if(!items) return true;
		for(var uri in items) {
			newUris.push(uri.replace(/citeulike\.org\//, "citeulike.org/endnote/"));
		}
	}
	Zotero.Utilities.HTTP.doGet(newUris, function(text) {
		var translator = Zotero.loadTranslator("import");
		translator.setTranslator("32d59d2d-b65a-4da4-b0a3-bdd3cfb979e7");
		translator.setString(text);
		translator.translate();
		Zotero.done();
	});
	Zotero.wait();
}
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.citeulike.org/user/kevin3stone/article/567475",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"lastName": "Nebut",
						"firstName": "C",
						"creatorType": "author"
					},
					{
						"lastName": "Fleurey",
						"firstName": "F",
						"creatorType": "author"
					},
					{
						"lastName": "Le Traon",
						"firstName": "Y",
						"creatorType": "author"
					},
					{
						"lastName": "Jezequel",
						"firstName": "JM",
						"creatorType": "author"
					}
				],
				"notes": [
					{
						"note": "<p>This paper introduces a new approach to automatically generating test cases from requirements which are described by use cases and contracts. With the aid of sequence diagrams, test scenarios can be generated from test objectives. The authors also provide a simulator to correct requirements by doing simulation and model checking. When applying the approach to real life cases, requirement formalization still poses great challenges to business analysts.</p>"
					}
				],
				"tags": [
					"automation",
					"test",
					"test_case_generation",
					"testing",
					"use_case"
				],
				"seeAlso": [],
				"attachments": [],
				"title": "Automatic test generation: a use case driven approach",
				"publicationTitle": "IEEE Transactions on Software Engineering",
				"volume": "32",
				"issue": "3",
				"pages": "140-155",
				"ISSN": "0098-5589",
				"abstractNote": "Use cases are believed to be a good basis for system testing. Yet, to automate the test generation process, there is a large gap to bridge between high-level use cases and concrete test cases. We propose a new approach for automating the generation of system test scenarios in the context of object-oriented embedded software, taking into account traceability problems between high-level views and concrete test case execution. Starting from a formalization of the requirements based on use cases extended with contracts, we automatically build a transition system from which we synthesize test cases. Our objective is to cover the system in terms of statement coverage with those generated tests: an empirical evaluation of our approach is given based on this objective and several case studies. We briefly discuss the experimental deployment of our approach in the field at Thales Airborne Systems.",
				"url": "http://dx.doi.org/10.1109/tse.2006.22",
				"DOI": "10.1109/tse.2006.22",
				"date": "March 2006",
				"libraryCatalog": "CiteULike",
				"accessDate": "CURRENT_TIMESTAMP",
				"shortTitle": "Automatic test generation"
			}
		]
	}
]
/** END TEST CASES **/