{
	"translatorID": "303bdfc5-11b8-4107-bca1-63ca97701a0f",
	"label": "ASCE",
	"creator": "Sebastian Karcher",
	"target": "^https?://(www\\.)?ascelibrary\\.org/",
	"minVersion": "2.1.9",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2017-04-01 14:22:53"
}


/*
	***** BEGIN LICENSE BLOCK *****

	ASCE Translator
	(Based on Taylor and Francis Translator)
	Copyright © 2012 Sebastian Karcher

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


function getTitles(doc) {
	return ZU.xpath(doc, '//table[@class="articleEntry"]//td[@valign="top"]/a[1]');
}

function detectWeb(doc, url) {
/*	if (url.match(/\/doi\/abs\/10\.|\/doi\/full\/10\./)) {
		return "journalArticle";
	} else if (url.match(/\/action\/doSearch\?|\/toc\//))
		{
		return "multiple";
		} */
    //currently this triggers a massive download that shuts down Zotero for a significant time; turning it off until I have a fix (which should be shortly)
    return false;
}


function doWeb(doc, url) {
	if (detectWeb(doc, url) == "multiple") {
		var items = new Object();
		var titles = getTitles(doc);
		var doi;
		for (var i=0, n=titles.length; i<n; i++) {
			doi = titles[i].href.match(/\/doi\/(?:abs|full)\/(10\.[^?#]+)/);
			if (doi) {
				items[doi[1]] = titles[i].textContent;
			}
		}

		Zotero.selectItems(items, function(selectedItems){
			if (!selectedItems) return true;
			
			var dois = new Array();
			for (var i in selectedItems) {
				dois.push(i);
			}
			scrape(null, url,dois);
		});
	} else {
		var doi = url.match(/\/doi\/(?:abs|full)\/(10\.[^?#]+)/);
		scrape(doc, url,[doi[1]]);
	}
}

function finalizeItem(item, doc, doi, baseUrl) {
	var pdfurl = baseUrl + '/doi/pdf/';
	var absurl = baseUrl + '/doi/abs/';

	//add attachments
	item.attachments = [{
		title: 'Full Text PDF',
		url: pdfurl + doi,
		mimeType: 'application/pdf'
	}];
	if (doc) {
		item.attachments.push({
			title: 'Snapshot',
			document: doc
		});
	} else {
		item.attachments.push({
			title: 'Snapshot',
			url: item.url || absurl + doi,
			mimeType: 'text/html'
		});
	}

	item.complete();
}

function scrape(doc, url, dois) {
	var baseUrl = url.match(/https?:\/\/[^\/]+/)[0]
	var postUrl = baseUrl + '/action/downloadCitation';
	var postBody = 	'downloadFileName=citation&' +
					'direct=true&' +
					'include=abs&' +
					'doi=';
	var risFormat = '&format=ris';
	var bibtexFormat = '&format=bibtex';

	for (var i=0, n=dois.length; i<n; i++) {
		(function(doi) {
			ZU.doPost(postUrl, postBody + doi + bibtexFormat, function(text) {
				var translator = Zotero.loadTranslator("import");
				// Use BibTeX translator
				translator.setTranslator("9cb70025-a888-4a29-a210-93ec52da40d4");
				translator.setString(text);
				translator.setHandler("itemDone", function(obj, item) {
					item.bookTitle = item.publicationTitle;

					//unfortunately, bibtex is missing some data
					//publisher, ISSN/ISBN
					ZU.doPost(postUrl, postBody + doi + risFormat, function(text) {
						risTrans = Zotero.loadTranslator("import");
						risTrans.setTranslator("32d59d2d-b65a-4da4-b0a3-bdd3cfb979e7");
						risTrans.setString(text);
						risTrans.setHandler("itemDone", function(obj, risItem) {
							item.publisher = risItem.publisher;
							item.ISSN = risItem.ISSN;
							item.ISBN = risItem.ISBN;
							finalizeItem(item, doc, doi, baseUrl);
						});
						risTrans.translate();
					});
				});
				translator.translate();
			});
		})(dois[i]);
	}
}


/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://ascelibrary.org/action/doSearch?text1=test&field1=AllField&logicalOpe1=AND&text2=&field2=AllField&logicalOpe2=NOT&text3=&field3=AllField&logicalOpe3=AND&text4=&field4=AllField&logicalOpe4=AND&text5=&field5=AllField&logicalOpe5=AND&text6=&field6=AllField&logicalOpe6=AND&text7=&field7=AllField&AfterMonth=&AfterYear=&BeforeMonth=&BeforeYear=",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://ascelibrary.org/doi/abs/10.1061/%28ASCE%290887-381X%282003%2917%3A1%2837%29",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Friction Measurement on Cycleways Using a Portable Friction Tester",
				"creators": [
					{
						"firstName": "A.",
						"lastName": "Bergström",
						"creatorType": "author"
					},
					{
						"firstName": "H.",
						"lastName": "Åström",
						"creatorType": "author"
					},
					{
						"firstName": "R.",
						"lastName": "Magnusson",
						"creatorType": "author"
					}
				],
				"date": "2003",
				"DOI": "10.1061/(ASCE)0887-381X(2003)17:1(37)",
				"ISSN": "0887-381X",
				"abstractNote": "In seeking to promote cycling in wintertime, it is desirable to understand how important the winter maintenance service level is in people’s decision to cycle or not, and methods to compare different road conditions on cycleways are therefore needed. By measuring friction, an assessment of the service level can be achieved, but methods available often involve the use of large vehicles, which can lead to overloading damage on cycleways, and constitute a safety risk for cyclists and pedestrians. A portable friction tester (PFT), originally designed to measure friction on road markings, was thought to be an appropriate instrument for cycleways and was, therefore, tested on different winter road conditions, and on different cycleway pavement materials. In this study, it was found that the PFT is a valuable tool for measuring friction on cycleways. Different winter road conditions, as well as different pavement materials, can be distinguished from each other through PFT measurements. The PFT provides a good complement to visual inspections of cycleways in winter maintenance evaluation and can, for example, be used to determine if desired service levels have been achieved.",
				"issue": "1",
				"itemID": "doi:10.1061/(ASCE)0887-381X(2003)17:1(37)",
				"libraryCatalog": "ASCE",
				"pages": "37-57",
				"publicationTitle": "Journal of Cold Regions Engineering",
				"url": "http://dx.doi.org/10.1061/(ASCE)0887-381X(2003)17:1(37)",
				"volume": "17",
				"attachments": [
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					},
					{
						"title": "Snapshot"
					}
				],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://ascelibrary.org/toc/jcemd4/138/5",
		"items": "multiple"
	}
]
/** END TEST CASES **/
