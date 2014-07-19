{
	"translatorID": "d93c14fb-d327-4540-b60a-327309ea512b",
	"label": "Journal of Electronic Publishing",
	"creator": "Sebastian Karcher",
	"target": "http://quod.lib.umich.edu/.*c=jep",
	"minVersion": "2.1.9",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2012-05-08 23:17:32"
}

/*
   Journal for Electronic Publishing Translator
   Copyright (C) 2012 Sebastian Karcher

   This program is free software: you can redistribute it and/or modify
   it under the terms of the GNU Affero General Public License as published by
   the Free Software Foundation, either version 3 of the License, or
   (at your option) any later version.

   This program is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   GNU Affero General Public License for more details.

   You should have received a copy of the GNU Affero General Public License
   along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

function detectWeb(doc,url) {
	var xpath='//meta[@name="DC.citation.volume"]';
	var mxpath= '//table[@id="searchresults"]|//div[@id="picklistbody"]';
	if (ZU.xpath(doc, xpath).length > 0) {
		return "journalArticle";
	}
			
	if (ZU.xpath(doc, mxpath).length > 0) {
		return "multiple";
	}
	return false;
}


function doWeb(doc,url)
{
	if (detectWeb(doc, url) == "multiple") {
		var hits = {};
		var urls = [];
		var results = ZU.xpath(doc, '//tr[@class="even" or @class="odd"]/td/a');
	
		for (var i in results) {
			hits[results[i].href] = results[i].textContent;
		}
		Z.selectItems(hits, function(items) {
			if (items == null) return true;
			for (var j in items) {
				urls.push(j);
			}
			ZU.processDocuments(urls, function (myDoc) { 
				doWeb(myDoc, myDoc.location.href) }, function () {Z.done()});

			Z.wait();
		});
	} else {
		// We call the Embedded Metadata translator to do the actual work
		var abstract = ZU.xpathText(doc, '//p[@class="prelim"]');
		var doi = ZU.xpathText(doc, '//div[@id="doi"]/a').match(/10\..+/)[0];
		var issue = ZU.xpathText(doc, '//meta[@name="DC.citation.issue"]/@content')
		var volume = ZU.xpathText(doc, '//meta[@name="DC.citation.volume"]/@content')
		
		var translator = Zotero.loadTranslator("import");
		translator.setTranslator("951c027d-74ac-47d4-a107-9c3069ab7b48");
		translator.setHandler("itemDone", function(obj, item) {
				item.itemType = "journalArticle";
				item.issue = issue;
				item.volume = volume;
				item.abstractNote = abstract;
				item.doi = doi;
				item.publicationTitle = "The Journal of Electronic Publishing";
				item.complete();
				});
		translator.getTranslatorObject(function (obj) {
				obj.doWeb(doc, url);
				});
	}
}
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://quod.lib.umich.edu/j/jep/3336451.0014.1*?rgn=full+text",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://quod.lib.umich.edu/j/jep?type=simple&q1=zotero&rgn=full+text&cite1=&cite1restrict=author&cite2=&cite2restrict=author&Submit=Search",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://quod.lib.umich.edu/j/jep/3336451.0014.212?rgn=main;view=fulltext;q1=zotero",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"firstName": "Amaranth",
						"lastName": "Borsuk",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"ISSN": "1080-2711",
				"url": "http://quod.lib.umich.edu/j/jep/3336451.0014.212?rgn=main;view=fulltext;q1=zotero",
				"libraryCatalog": "quod.lib.umich.edu",
				"issue": "2",
				"abstractNote": "This essay provides a critical analysis of the way pervasive data culture impacts the form of poetry and conceptions of authorship for those print and digital poets who let it enter their work. As depicted in popular media, the data cloud is a confusing and disordered space in which we lose all sense of privacy. However, a number of contemporary poets seek to get lost in this ether, reveling in the network of language that surrounds us. They do so in part because the very technologies that make such data visible in turn make the writer invisible, an authorial position more comfortable for poets of the networked age. Examined alongside the recent surge in interest in infosthetics, conceptual and digital poetry can be seen as embracing a “data poetics” attuned to the materiality of language.",
				"shortTitle": "The Upright Script",
				"title": "The Upright Script: Words in Space and on the Page",
				"date": "Fall 2011",
				"volume": "14",
				"publicationTitle": "The Journal of Electronic Publishing"
			}
		]
	}
]
/** END TEST CASES **/