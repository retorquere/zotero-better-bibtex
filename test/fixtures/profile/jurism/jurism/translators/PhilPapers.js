{
	"translatorID": "8df4f61b-0881-4c85-9186-05f457edb4d3",
	"label": "PhilPapers",
	"creator": "Sebastian Karcher",
	"target": "^https?://philpapers\\.org",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2015-09-25 00:35:34"
}

/*
	***** BEGIN LICENSE BLOCK *****
	
	Copyright © 2012 Sebastian Karcher 
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
	if (url.search(/\/s|pub\//)!=-1) return "multiple";
	if (url.indexOf("/browse/")!=-1 && ZU.xpathText(doc, '//ol[@class="entryList"]/li/@id')!= null) return "multiple";
	if (url.indexOf("/rec/")!=-1) return "journalArticle";
}
	

function doWeb(doc, url){

	var ids = new Array();
	if (detectWeb(doc, url) == "multiple") { 
		var items = {};
		var titles = ZU.xpath(doc, '//li/span[@class="citation"]//span[contains (@class, "articleTitle")]');
		var identifiers = ZU.xpath(doc, '//ol[@class="entryList"]/li/@id');
		for (var i in titles) {
			items[identifiers[i].textContent] = titles[i].textContent;
		}
		Zotero.selectItems(items, function (items) {
			if (!items) {
				return true;
			}
			for (var i in items) {
				ids.push(i.replace(/^e/, ""));
			}
			scrape(ids);
		});
	} else {
		var identifier = url.match(/(\/rec\/)([A-Z-\d]+)/)[2]
		//Z.debug(identifier)
		scrape([identifier]);
	}
}

function scrape(identifier){
	Z.debug(identifier)
	for (var i =0; i<identifier.length; i++){
		var bibtexurl= "http://philpapers.org/export.html?__format=bib&eId="+identifier[i]+"&formatName=BibTeX";
		//Z.debug(bibtexurl);
		Zotero.Utilities.HTTP.doGet(bibtexurl, function (text) {
		//Z.debug(text);
		//remove line breaks, then match match the bibtex.
		bibtex = text.replace(/\n/g, "").match(/<pre class='export'>.+<\/pre>/)[0];
		//Zotero.debug(bibtex)
	 	var url = "http://philpapers.org/rec/" + identifier[i];
			var translator = Zotero.loadTranslator("import");
			translator.setTranslator("9cb70025-a888-4a29-a210-93ec52da40d4");
			translator.setString(bibtex);
			translator.setHandler("itemDone", function(obj, item) {
				item.attachments = [{url:url, title: "PhilPapers - Snapshot", mimeType: "text/html"}];
				item.complete();
				});	
			translator.translate();
			});
	}	
}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://philpapers.org/rec/COROCA-4",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"firstName": "Josep E.",
						"lastName": "Corbí",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "PhilPapers - Snapshot",
						"mimeType": "text/html"
					}
				],
				"itemID": "Corbi2011-COROCA-4",
				"volume": "26",
				"issue": "4",
				"title": "Observation, Character, and A Purely First-Person Point of View",
				"publicationTitle": "Acta Analytica",
				"date": "2011",
				"pages": "311–328",
				"libraryCatalog": "PhilPapers"
			}
		]
	},
	{
		"type": "web",
		"url": "http://philpapers.org/browse/causal-realism",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://philpapers.org/pub/6",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://philpapers.org/s/solipsism",
		"items": "multiple"
	}
]
/** END TEST CASES **/