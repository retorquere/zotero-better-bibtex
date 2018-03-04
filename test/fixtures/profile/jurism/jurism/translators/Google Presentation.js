{
	"translatorID": "c114f9fd-6387-4387-853d-fcfe5ab3ac0a",
	"label": "Google Presentation",
	"creator": "Philipp Zumstein",
	"target": "^https?://docs\\.google\\.com/presentation/d/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2017-08-28 15:33:15"
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
	if (ZU.xpathText(doc, '//script[contains(., "SK_config[\'title\']")]')) {
		return "presentation";
	}
}


function doWeb(doc, url) {
	var textContent = ZU.xpathText(doc, '//body');
	var item = new Zotero.Item('presentation');

	var titleMatch = textContent.match(/SK_config\['title'\]\s?=\s?'([^;]*)';/);
	item.title = titleMatch[1];
	
	//SK_config['lastModified'] = ["Lydia Pintscher", 1495520656216, 2];
	var modifiedMatch = textContent.match(/SK_config\['lastModified'\]\s?=\s?([^;]*);/);
	if (modifiedMatch) {
		var modifiedData = JSON.parse(modifiedMatch[1]);
		item.creators.push(ZU.cleanAuthor(modifiedData[0], "author"));
		var date = new Date(modifiedData[1]);
    		item.date = date.toISOString();
	}
	
	var urlparts = url.split('/');
	var id = urlparts[5];
	urlparts.splice(6);
	var baseUrl = urlparts.join('/');
	item.url = baseUrl;
	var pdfUrl = baseUrl + '/export/pdf?id=' + id;
	//Z.debug(pdfUrl);
	item.attachments.push({
		url: pdfUrl,
		title: "Full Text PDF",
		mimeType: "application/pdf"
	});
	
	item.complete();
	
}


/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://docs.google.com/presentation/d/1XX-yzT98fglAfFkHoixOI1XC1uwrS6f0u1xjdZT9TYI/edit#slide=id.p",
		"items": [
			{
				"itemType": "presentation",
				"title": "WikiCite 2017: Wikidata: Current trends and priorities (and trivia)",
				"creators": [
					{
						"firstName": "Lydia",
						"lastName": "Pintscher",
						"creatorType": "author"
					}
				],
				"date": "2017-05-23T06:24:16.216Z",
				"shortTitle": "WikiCite 2017",
				"url": "https://docs.google.com/presentation/d/1XX-yzT98fglAfFkHoixOI1XC1uwrS6f0u1xjdZT9TYI",
				"attachments": [
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
	},
	{
		"type": "web",
		"url": "https://docs.google.com/presentation/d/13O08buimOzZWbv6GHxMv5LJS3TUAWF2R7_fwToggA64/edit#slide=id.i0",
		"items": [
			{
				"itemType": "presentation",
				"title": "16.1 powerpoint",
				"creators": [
					{
						"firstName": "Katie",
						"lastName": "Hulse",
						"creatorType": "author"
					}
				],
				"date": "2012-11-20T19:32:53.370Z",
				"url": "https://docs.google.com/presentation/d/13O08buimOzZWbv6GHxMv5LJS3TUAWF2R7_fwToggA64",
				"attachments": [
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
