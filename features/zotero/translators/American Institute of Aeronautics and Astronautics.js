{
	"translatorID": "75edc5a1-6470-465a-a928-ccb77d95eb72",
	"label": "American Institute of Aeronautics and Astronautics",
	"creator": "Michael Berkowitz",
	"target": "^https?://arc\\.aiaa\\.org/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcv",
	"lastUpdated": "2013-12-12 03:22:14"
}

/*
AIAA Translator 
Copyright (C) 2013 Sebastian Karcher
Based on ASCE

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

function detectWeb(doc, url) {
	if (url.match(/\/doi\/abs\/10\.|\/doi\/full\/10\./)) {
		return "journalArticle";
	} else if(url.match(/\/action\/doSearch\?|\/toc\//))
		{
		return "multiple";
	}
}


function doWeb(doc, url) {
	if (detectWeb(doc, url) == "multiple") {
		var items = new Object();
		var rows = ZU.xpath(doc, '//table[@class="articleEntry"]');
		var doi;
		var title;
		for(var i=0, n=rows.length; i<n; i++) {
			doi = ZU.xpathText(rows[i], './/a[contains(@href, "/doi/abs/10.")]/@href') //.match(/10\..+/)
			//Z.debug(doi)
			title = ZU.xpathText(rows[i], './/div[@class="art_title"]')
			if(doi && title) {
				items[doi.match(/10\.[^\?]+/)[0]] = title;
			}
		}
		//Z.debug(items)
		Zotero.selectItems(items, function(selectedItems){
			if(!selectedItems) return true;
			
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
	var pdfurl = '/doi/pdf/';
	var absurl = '/doi/abs/';

	//add attachments
	item.attachments = [{
		title: 'AIAA Full Text PDF',
		url: pdfurl + doi,
		mimeType: 'application/pdf'
	}];
	if(doc) {
		item.attachments.push({
			title: 'AIAA Snapshot',
			document: doc
		});
	} else {
		item.attachments.push({
			title: 'AIAA Snapshot',
			url: item.url || absurl + doi,
			mimeType: 'text/html'
		});
	}

	item.complete();
}

function scrape(doc, url, dois) {
	var postUrl =   '/action/downloadCitation';
	var postBody = 	'downloadFileName=citation&' +
					'direct=true&' +
					'include=abs&' +
					'doi=';
	var risFormat = '&format=ris';
	var bibtexFormat = '&format=bibtex';

	for(var i=0, n=dois.length; i<n; i++) {
		(function(doi) {
			ZU.doPost(postUrl, postBody + doi + bibtexFormat, function(text) {
				var translator = Zotero.loadTranslator("import");
				// Use BibTeX translator
				translator.setTranslator("9cb70025-a888-4a29-a210-93ec52da40d4");
				translator.setString(text);
				translator.setHandler("itemDone", function(obj, item) {
					item.bookTitle = item.publicationTitle;
					//Z.debug(text)
					//unfortunately, bibtex is missing some data
					//publisher, ISSN/ISBN
					ZU.doPost(postUrl, postBody + doi + risFormat, function(text) {
						//Z.debug(text)
						risTrans = Zotero.loadTranslator("import");
						risTrans.setTranslator("32d59d2d-b65a-4da4-b0a3-bdd3cfb979e7");
						risTrans.setString(text);
						risTrans.setHandler("itemDone", function(obj, risItem) {
							item.publisher = risItem.publisher;
							item.ISSN = risItem.ISSN;
							item.ISBN = risItem.ISBN;
							finalizeItem(item, doc, doi);
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
		"url": "http://arc.aiaa.org/action/doSearch?searchText=titanium",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://arc.aiaa.org/doi/abs/10.2514/1.T3744?prevSearch=&searchHistoryKey=",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"firstName": "Songping",
						"lastName": "Mo",
						"creatorType": "author"
					},
					{
						"firstName": "Ying",
						"lastName": "Chen",
						"creatorType": "author"
					},
					{
						"firstName": "Xing",
						"lastName": "Li",
						"creatorType": "author"
					},
					{
						"firstName": "Lisi",
						"lastName": "Jia",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "AIAA Full Text PDF",
						"mimeType": "application/pdf"
					},
					{
						"title": "AIAA Snapshot"
					}
				],
				"itemID": "doi:10.2514/1.T3744",
				"title": "Solidification Characteristics of Titania Nanofluids",
				"publicationTitle": "Journal of Thermophysics and Heat Transfer",
				"volume": "26",
				"issue": "1",
				"pages": "192-196",
				"date": "2012",
				"DOI": "10.2514/1.T3744",
				"url": "http://arc.aiaa.org/doi/abs/10.2514/1.T3744",
				"bookTitle": "Journal of Thermophysics and Heat Transfer",
				"publisher": "American Institute of Aeronautics and Astronautics",
				"ISSN": "0887-8722",
				"libraryCatalog": "American Institute of Aeronautics and Astronautics",
				"accessDate": "CURRENT_TIMESTAMP"
			}
		]
	}
]
/** END TEST CASES **/