{
	"translatorID": "b0abb562-218c-4bf6-af66-c320fdb8ddd3",
	"label": "Philosopher's Imprint",
	"creator": "Philipp Zumstein",
	"target": "^https?://quod\\.lib\\.umich\\.edu/p/phimp",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2017-06-03 13:00:06"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2017 Philipp Zumstein
	
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

function detectWeb(doc, url) {
	if (url.indexOf('/p/phimp?t')>-1 && getSearchResults(doc, true)) {
		return "multiple";
	} else if (url.indexOf('/p/phimp/')>-1) {
		return "journalArticle";
	}
}

function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	//TODO: adjust the xpath
	var rows = ZU.xpath(doc, '//table[@id="searchresults"]//td[2]/a');
	for (var i=0; i<rows.length; i++) {
		var href = rows[i].href;
		var title = ZU.trimInternal(rows[i].textContent);
		if (!href || !title) continue;
		if (checkOnly) return true;
		found = true;
		items[href] = title;
	}
	return found ? items : false;
}


function doWeb(doc, url) {
	if (detectWeb(doc, url) == "multiple") {
		Zotero.selectItems(getSearchResults(doc, false), function (items) {
			if (!items) {
				return true;
			}
			var articles = [];
			for (var i in items) {
				articles.push(i);
			}
			
			
			ZU.processDocuments(articles, scrape);
		});
	} else {
		scrape(doc, url);
	}
}

function scrape(doc, url) {
	var abstract = ZU.xpathText(doc, '//div[contains(@class, "abstract")]/p[1]');
	var purl = ZU.xpathText(doc, '//div[@id="purl"]/a/@href');
	var license = ZU.xpathText(doc, '//a[@id="licenseicon"]/@href');
	var pdfurl = ZU.xpathText(doc, '//li[@id="download-pdf"]/a/@href');
	
	var translator = Zotero.loadTranslator('web');
	// Embedded Metadata
	translator.setTranslator('951c027d-74ac-47d4-a107-9c3069ab7b48');
	translator.setDocument(doc);
	translator.setHandler('itemDone', function (obj, item) {
		if (abstract) {
			item.abstractNote = abstract;
		}
		if (purl) {
			item.url = purl;
		}
		if (pdfurl) {
			item.attachments.push({
				url: pdfurl,
				title: "Full Text PDF",
				mimeType: "application/pdf"
			});
		}
		item.rights = license;
		item.place = "Ann Arbor, MI";
		item.publisher = "University of Michigan";
		
		item.complete();
	});
	translator.translate();
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://quod.lib.umich.edu/p/phimp?type=simple&rgn=full+text&q1=epistemology&cite1=&cite1restrict=author&cite2=&cite2restrict=author&Submit=Search",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://quod.lib.umich.edu/p/phimp/3521354.0004.003/1?rgn=full+text;view=image;q1=epistemology",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Morality, Fiction, and Possibility",
				"creators": [
					{
						"firstName": "Brian",
						"lastName": "Weatherson",
						"creatorType": "author"
					}
				],
				"date": "2004-11-01",
				"ISSN": "1533-628X",
				"abstractNote": "Authors have a lot of leeway with regard to what they can make true in their story. In general, if the author says that p is true in the fiction we're reading, we believe that p is true in that fiction. And if we're playing along with the fictional game, we imagine that, along with everything else in the story, p is true. But there are exceptions to these general principles. Many authors, most notably Kendall Walton and Tamar Szabó Gendler, have discussed apparent counterexamples when p is \"morally deviant\". Many other statements that are conceptually impossible also seem to be counterexamples. In this paper I do four things. I survey the range of counterexamples, or at least putative counterexamples, to the principles. Then I look to explanations of the counterexamples. I argue, following Gendler, that the explanation cannot simply be that morally deviant claims are impossible. I argue that the distinctive attitudes we have towards moral propositions cannot explain the counterexamples, since some of the examples don't involve moral concepts. And I put forward a proposed explanation that turns on the role of 'higher-level concepts', concepts that if they are satisfied are satisfied in virtue of more fundamental facts about the world, in fiction, and in imagination.",
				"issue": "3",
				"libraryCatalog": "quod.lib.umich.edu",
				"publicationTitle": "Philosopher's Imprint",
				"rights": "http://creativecommons.org/licenses/by-nc-nd/3.0/",
				"url": "http://hdl.handle.net/2027/spo.3521354.0004.003",
				"volume": "4",
				"attachments": [
					{
						"title": "Snapshot"
					},
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