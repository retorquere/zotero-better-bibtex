{
	"translatorID": "f8b5501a-1acc-4ffa-a0a5-594add5e6bd3",
	"label": "US National Archives Research Catalog",
	"creator": "Philipp Zumstein",
	"target": "^https?://catalog\\.archives\\.gov",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2019-06-11 13:43:26"
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
	if (url.includes('/id/')) {
		return "book";
		// something like archival material would be more appropriate...
		// but for now we use this type to save some information
	}
	// multiples will not work easily because the API will then return
	// somehow an empty json, thus we skipped this here.
	return false;
}


function doWeb(doc, url) {
	var position = url.indexOf('/id/');
	var id = url.substr(position + 4);
	var posturl = 'https://catalog.archives.gov/OpaAPI/iapi/v1/exports/noauth';
	var postdata = 'export.format=json&export.type=full&export.what=metadata&naIds=' + id + '&rows=1';
	
	ZU.doPost(posturl, postdata, function (result) {
		var parsed = JSON.parse(result);
		var exporturl = parsed.opaResponse.exportFile.url;
		ZU.doGet(exporturl, function (data) {
			var json = JSON.parse(data);
			var item = new Zotero.Item("book");
			
			item.title = json[0].title;
			var creators = json[0].creators;
			for (var i = 0; i < creators.length; i++) {
				creators[i] = creators[i].replace('(Most Recent)', '');
				if (creators[i].includes(", ")) {
					item.creators.push(ZU.cleanAuthor(creators[i], "author"));
				}
				else {
					creators[i] = creators[i].replace(/\.? ?\d\d?\/\d\d?\/\d\d\d\d-\d\d?\/\d\d?\/\d\d\d\d/, '');
					if (creators[i].length > 255) {
						creators[i] = creators[i].substr(0, 251) + '...';
					}
					item.creators.push({ lastName: creators[i].trim(), creatorType: 'author', fieldMode: true });
				}
			}
			if (json[0].productionDates) {
				item.date = json[0].productionDates[0];
			}
			else {
				item.date = json[0].date;
			}
			if (json[0].from) {
				item.series = json[0].from[0];
			}
			item.abstractNote = json[0].scopeAndContentNote;
			item.archive = json[0].archivedCopies.contacts1[0];
			item.archiveLocation = json[0].localIdentifier;
			item.extra = 'National Archives Identifier: ' + json[0].arcIdentifier;
			
			item.attachments.push({
				document: doc,
				title: "Snapshot"
			});

			item.complete();
		});
	});
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://catalog.archives.gov/id/486076",
		"items": [
			{
				"itemType": "book",
				"title": "The Struggle for Trade Union Democracy, December 1947",
				"creators": [
					{
						"lastName": "Supreme Commander for the Allied Powers. Economic and Scientific Section. Director for Labor. Labor Division",
						"creatorType": "author",
						"fieldMode": true
					}
				],
				"date": "1945 - 1952",
				"archive": "National Archives at College Park - Textual Reference(RDT2)",
				"extra": "National Archives Identifier: 486076",
				"libraryCatalog": "US National Archives Research Catalog",
				"series": "Series: Topical File, 1945 - 1952",
				"attachments": [
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
		"url": "https://catalog.archives.gov/id/5496901",
		"items": [
			{
				"itemType": "book",
				"title": "Alien Case File for Francisca Torre Vda De Garcia",
				"creators": [
					{
						"lastName": "Department of Justice. Immigration and Naturalization Service",
						"creatorType": "author",
						"fieldMode": true
					}
				],
				"date": "1944 - 2003",
				"abstractNote": "This file consists of an alien case file for Francisca Torre Vda De Garcia.  Date of birth is listed as 10/10/1901.  Country is listed as Cuba.  Port of Entry is Miami, Florida.  Date of entry is 03/08/1973.  Father is listed as Zotero.  Mother is listed as Candita.  Alias name is listed as Francisca Torres.",
				"archive": "National Archives at Kansas City[A](RM-KC[A])",
				"archiveLocation": "A20229735/085-08-0653/Box 186",
				"extra": "National Archives Identifier: 5496901",
				"libraryCatalog": "US National Archives Research Catalog",
				"series": "Series: Alien Case Files, 1944 - 2003",
				"attachments": [
					{
						"title": "Snapshot"
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
