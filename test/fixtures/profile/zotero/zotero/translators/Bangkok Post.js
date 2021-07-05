{
	"translatorID": "7f74d823-d2ba-481c-b717-8b12c90ed874",
	"translatorType": 4,
	"label": "Bangkok Post",
	"creator": "Matt Mayer",
	"target": "^https://www\\.bangkokpost\\.com/[a-z0-9-]+/([a-z0-9-]+/)?[0-9]+",
	"minVersion": "3.0",
	"maxVersion": null,
	"priority": 100,
	"inRepository": true,
	"browserSupport": "gcsibv",
	"lastUpdated": "2021-06-07 17:30:00"
}

/*
 * ***** BEGIN LICENSE BLOCK *****

	Copyright © 2020 Matt Mayer
	
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
function detectWeb(_doc, _url) {
	return 'newspaperArticle';
}

function doWeb(doc, url) {
	scrape(doc, url);
}
function getMetaTag(doc, attr, value, contentattr) {
	const tag = Array.from(doc.getElementsByTagName("meta")).filter(m => m.attributes[attr] && m.attributes[attr].value == value)[0];
	if (tag && tag.attributes[contentattr]) {
		return tag.attributes[contentattr].value;
	}
	return null;
}
function scrape(doc, _url) {
	const translator = Zotero.loadTranslator('web');
	// Embedded Metadata
	translator.setTranslator('951c027d-74ac-47d4-a107-9c3069ab7b48');
	translator.setDocument(doc);
	
	translator.setHandler('itemDone', function (obj, item) {
		// Add data for fields that are not covered by Embedded Metadata
		// Author name is stored as firstname lastname
		const authorName = getMetaTag(doc, "property", "cXenseParse:author", "content");
		if (authorName) {
			item.creators = [ZU.cleanAuthor(authorName, "author", false)];
		}
		// Date is stored as a timestamp like 2020-09-07T17:37:00+07:00, just extract the YYYY-MM-DD at start
		const date = getMetaTag(doc, "name", "cXenseParse:recs:publishtime", "content");
		if (date) {
			item.date = date.substr(0, 10);
		}
		
		item.publicationTitle = "Bangkok Post";
		item.itemType = "newspaperArticle";
		
		item.complete();
	});
	translator.translate();
}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://www.bangkokpost.com/thailand/politics/1981267/house-general-debate-set-for-wednesday",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "House general debate set for Wednesday",
				"creators": [
					{
						"firstName": "Aekarach",
						"lastName": "Sattaburuth",
						"creatorType": "author"
					}
				],
				"date": "2020-09-07",
				"abstractNote": "A general debate without a vote in the House of Representatives has been scheduled for Wednesday for MPs to question the government on the current economic and political crises and suggest ways of solving related problems.",
				"libraryCatalog": "www.bangkokpost.com",
				"publicationTitle": "Bangkok Post",
				"url": "https://www.bangkokpost.com/thailand/politics/1981267/house-general-debate-set-for-wednesday",
				"attachments": [
					{
						"title": "Snapshot",
						"mimeType": "text/html"
					}
				],
				"tags": [
					{
						"tag": "cabinet ministers"
					},
					{
						"tag": "debate"
					},
					{
						"tag": "general debate"
					},
					{
						"tag": "government mps"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.bangkokpost.com/tech/1979315/air-force-satellite-napa-1-launched",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Air force satellite Napa-1 launched",
				"creators": [
					{
						"firstName": "Wassana",
						"lastName": "Nanuam",
						"creatorType": "author"
					}
				],
				"date": "2020-09-03",
				"abstractNote": "The Royal Thai Air Force’s first security satellite, Napa-1, was successfully launched on a European rocket from French Guiana on Thursday morning.",
				"libraryCatalog": "www.bangkokpost.com",
				"publicationTitle": "Bangkok Post",
				"url": "https://www.bangkokpost.com/tech/1979315/air-force-satellite-napa-1-launched",
				"attachments": [
					{
						"title": "Snapshot",
						"mimeType": "text/html"
					}
				],
				"tags": [
					{
						"tag": "French Guiana"
					},
					{
						"tag": "Napa-1"
					},
					{
						"tag": "air force"
					},
					{
						"tag": "launched"
					},
					{
						"tag": "satellite"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.bangkokpost.com/opinion/opinion/1981587/tech-is-key-to-rebooting-tourism",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Tech is key to rebooting tourism",
				"creators": [
					{
						"firstName": "Jeff",
						"lastName": "Paine",
						"creatorType": "author"
					}
				],
				"date": "2020-09-08",
				"abstractNote": "Southeast Asia relies heavily on tourism. In 2019, the travel and tourism industry contributed 12.1% of the region's GDP and approximately one in 10 people are employed within and around it, according to the World Travel and Tourism Council (WTTC).",
				"libraryCatalog": "www.bangkokpost.com",
				"publicationTitle": "Bangkok Post",
				"url": "https://www.bangkokpost.com/opinion/opinion/1981587/tech-is-key-to-rebooting-tourism",
				"attachments": [
					{
						"title": "Snapshot",
						"mimeType": "text/html"
					}
				],
				"tags": [
					{
						"tag": "domestic tourism"
					},
					{
						"tag": "industry"
					},
					{
						"tag": "tourism"
					},
					{
						"tag": "tourism industry"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/
