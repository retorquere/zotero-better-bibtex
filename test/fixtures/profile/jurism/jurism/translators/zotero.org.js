{
	"translatorID": "c82c574d-7fe8-49ca-a360-a05d6e34fec0",
	"label": "zotero.org",
	"creator": "Dan Stillman and Aurimas Vinckevicius",
	"target": "^https?://[^/]*zotero\\.org(:\\d+)?/.+/items(/|$)",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsv",
	"lastUpdated": "2017-10-20 20:50:32"
}

/*
  ***** BEGIN LICENSE BLOCK *****

  Copyright © 2017-2019 Dan Stillman and Aurimas Vinckevicius

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


var sessionKey;

function scrape(text) {
	var item = JSON.parse(text);
	var newItem = new Zotero.Item();
	for (var prop in item.data) {
		switch (prop) {
		case 'key':
		case 'version':
		case 'collections':
		case 'relations':
		case 'dateAdded':
		case 'dateModified':
			continue;
		}
		newItem[prop] = item.data[prop];
	}
	// TODO: Don't pass for notes, once client no longer requires it
	if (!newItem.title) newItem.title = "[Untitled]";
	newItem.complete();
}

function getListTitles(doc) {
	return ZU.xpath(doc, '//table[@id="field-table"]//td[@class="title"]'
		+ '[./a[not(contains(text(), "Unpublished Note"))]'
			+ '/span[not(contains(@class,"sprite-treeitem-attachment"))]]');
}

function getLibraryURI(doc) {
	var feed = ZU.xpath(doc, '//a[@type="application/atom+xml" and @rel="alternate"]')[0];
	if (!feed) return;
	var url = feed.href.match(/^.+?\/(?:users|groups)\/\w+/);
	if (!url) {
		url = decodeURIComponent(feed.href)
			.match(/https?:\/\/[^\/]+\/(?:users|groups)\/\w+/);
		if (!url) return;
	}
	if (!url) return;
	return (url[0] + '/items/').replace("https://api.zotero.org", "https://www.zotero.org/api");
}

function getSessionKey(doc) {
	var matches = doc.cookie.match(/zotero_www_session_v2=([a-z0-9]+)/);
	return matches ? matches[1] : null;
}

function detectWeb(doc, url) {
	//disable for libraries where we can't get a library URI or an apiKey
	if (!getLibraryURI(doc)) return;
	
	//single item
	if ( url.match(/\/itemKey\/\w+/) ) {
		return ZU.xpathText(doc, '//div[@id="item-details-div"]//td[preceding-sibling::th[text()="Item Type"]]/@class')
				|| false;
	}

	// Library and collections
	if ( ( url.match(/\/items\/?([?#].*)?$/)
		|| url.includes('/collectionKey/')
		|| url.match(/\/collection\/\w+/)
		|| url.includes('/tag/') )	
		&& getListTitles(doc).length ) {
		return "multiple";
	}
}

function doWeb(doc, url) {
	var headers = {
		'Zotero-API-Version': 3
	};
	var libraryURI = getLibraryURI(doc);
	// Pass session key in URL, as required for CSRF protection. This allows saving of items
	// in private libraries.
	var sessionKey = getSessionKey(doc);
	var suffix = sessionKey ? '?session=' + sessionKey : "";
	var itemRe = /\/itemKey\/(\w+)/;

	if (detectWeb(doc, url) == "multiple") {
		var elems = getListTitles(doc);
		var items = ZU.getItemArray(doc, elems);
		
		Zotero.selectItems(items, function(selectedItems) {
			if ( !selectedItems ) return true;

			var apiURIs = [], itemID;
			for (var url in selectedItems) {
				itemID = url.match(itemRe)[1];
				apiURIs.push(libraryURI + itemID + suffix);
			}

			Zotero.Utilities.HTTP.doGet(apiURIs, scrape, null, null, headers);
		});
	} else {
		var itemID = url.match(itemRe)[1];
		var itemURI = libraryURI + itemID + suffix;
		Zotero.Utilities.doGet(itemURI, scrape, null, null, headers);
	}
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://www.zotero.org/groups/729/all_things_zotero/items/itemKey/HXTTNJGD",
		"defer": true,
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Expert Searching, Zotero: A New Breed of Search Tool",
				"creators": [
					{
						"creatorType": "author",
						"firstName": "Mark",
						"lastName": "Desirto"
					}
				],
				"date": "April 2007",
				"extra": "00000 \nCited by 0000",
				"publicationTitle": "Medical Library Association Newsletter",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.zotero.org/groups/all_things_zotero/items",
		"defer": true,
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://www.zotero.org/groups/all_things_zotero/items/collectionKey/XX99JMW8",
		"defer": true,
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://www.zotero.org/groups/devtesting/items/tag/tag2",
		"defer": true,
		"items": "multiple"
	}
];
/** END TEST CASES **/
