{
	"translatorID": "05d07af9-105a-4572-99f6-a8e231c0daef",
	"translatorType": 6,
	"label": "COinS",
	"creator": "Simon Kornblith",
	"target": null,
	"minVersion": "2.1",
	"maxVersion": null,
	"priority": 310,
	"inRepository": true,
	"browserSupport": "gcsv",
	"lastUpdated": "2021-06-03 14:25:00"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2021 Simon Kornblith and Abe Jellinek

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

function detectWeb(doc, _url) {
	var encounteredType = false;
	
	var spans = doc.querySelectorAll('span.Z3988[title]');
	for (let span of spans) {
		// determine if it's a valid type
		var item = new Zotero.Item();
		Zotero.Utilities.parseContextObject(span.title, item);
		
		if (item.itemType) {
			if (encounteredType) {
				return "multiple";
			}
			else {
				encounteredType = item.itemType;
			}
		}
	}
	
	return encounteredType;
}

// Borrowed from Nature translator
function supplementItem(item, supp, prefer, ignore) {
	if (!prefer) prefer = [];
	if (!ignore) ignore = [];
	
	for (var i in supp) {
		if (ignore.includes(i)) continue;
		if (i == 'creators' || i == 'attachments' || i == 'notes'
			|| i == 'tags' || i == 'seeAlso'
		) {
			if ((item.hasOwnProperty(i) && item[i].length) // Supplement only if completely empty
				|| (!supp[i].length || typeof supp[i] == 'string')
			) {
				continue;
			}
		}
		else if (!supp.hasOwnProperty(i)
			|| (item.hasOwnProperty(i) && !prefer.includes(i))) {
			continue;
		}

		Z.debug('Supplementing item.' + i);
		item[i] = supp[i];
	}

	return item;
}

// used to retrieve next COinS object when asynchronously parsing COinS objects
// on a page
function retrieveNextCOinS(needFullItems, newItems, couldUseFullItems, doc) {
	if (needFullItems.length) {
		var item = needFullItems.shift();
		
		Zotero.debug("Looking up contextObject");
		var search = Zotero.loadTranslator("search");
		search.setHandler("itemDone", function (obj, newItem) {
			supplementItem(newItem, item, [], ['contextObject', 'repository']);
			newItems.push(newItem);
		});
		search.setHandler("done", function () {
			retrieveNextCOinS(needFullItems, newItems, couldUseFullItems, doc);
		});
		// Don't throw on error
		search.setHandler("error", function () {
			Zotero.debug("Failed to look up item:");
			Zotero.debug(item);
		});
		// look for translators
		search.setHandler("translators", function (obj, translators) {
			if (translators.length) {
				search.setTranslator(translators);
				search.translate();
			}
			else {
				retrieveNextCOinS(needFullItems, newItems, couldUseFullItems, doc);
			}
		});
		
		search.setSearch(item);
		search.getTranslators();
	}
	else {
		completeCOinS(newItems, couldUseFullItems, doc);
		Zotero.done();
	}
}

// saves all COinS objects
function completeCOinS(newItems, couldUseFullItems, doc) {
	if (newItems.length > 1) {
		var selectArray = new Array(newItems.length);
		for (var i in newItems) {
			selectArray[i] = newItems[i].title;
		}
		
		Zotero.selectItems(selectArray, function (selectArray) {
			if (!selectArray) return;
			var useIndices = [];
			for (var i in selectArray) {
				useIndices.push(i);
			}
			completeItems(newItems, useIndices, couldUseFullItems, doc);
		});
	}
	else if (newItems.length) {
		completeItems(newItems, [0], couldUseFullItems, doc);
	}
}

function completeItems(newItems, useIndices, couldUseFullItems, doc) {
	if (!useIndices.length) {
		return;
	}
	var i = useIndices.shift();
	
	// grab full item if the COinS was missing an author
	if (couldUseFullItems[i]) {
		Zotero.debug("Looking up contextObject");
		var search = Zotero.loadTranslator("search");
		
		var firstItem = false;
		search.setHandler("itemDone", function (obj, newItem) {
			supplementItem(newItem, newItems[i], [], ['contextObject', 'repository']);
			if (!firstItem) {
				// add doc as attachment
				newItem.attachments.push({ document: doc });
				newItem.complete();
				firstItem = true;
			}
		});
		search.setHandler("done", function (_obj) {
			// if we didn't find anything, use what we had before (even if it
			// lacks the creator)
			if (!firstItem) {
				newItems[i].complete();
			}
			// call next
			completeItems(newItems, useIndices, couldUseFullItems);
		});
		// Don't throw on error
		search.setHandler("error", function () {});
		search.setHandler("translators", function (obj, translators) {
			if (translators.length) {
				search.setTranslator(translators);
				search.translate();
			}
			else {
				// add doc as attachment
				newItems[i].attachments.push({ document: doc });
				newItems[i].complete();
				// call next
				completeItems(newItems, useIndices, couldUseFullItems);
			}
		});
		
		search.setSearch(newItems[i]);
		search.getTranslators();
	}
	else {
		// add doc as attachment
		newItems[i].attachments.push({ document: doc });
		newItems[i].complete();
		// call next
		completeItems(newItems, useIndices, couldUseFullItems);
	}
}

function doWeb(doc, _url) {
	var newItems = [];
	var needFullItems = [];
	var couldUseFullItems = [];

	var spans = doc.querySelectorAll('span.Z3988[title]');
	for (let span of spans) {
		var spanTitle = span.title;
		var newItem = new Zotero.Item();
		newItem.repository = false;	// do not save repository
		if (Zotero.Utilities.parseContextObject(spanTitle, newItem)) {
			if (newItem.title) {
				if (!newItem.creators.length) {
					// if we have a title but little other identifying
					// information, say we'll get full item later
					newItem.contextObject = spanTitle;
					couldUseFullItems[newItems.length] = true;
				}
				
				// title and creators are minimum data to avoid looking up
				newItems.push(newItem);
			}
			else {
				// retrieve full item
				newItem.contextObject = spanTitle;
				needFullItems.push(newItem);
			}
		}
	}
	
	Zotero.debug(needFullItems);
	if (needFullItems.length) {
		// retrieve full items asynchronously
		Zotero.wait();
		retrieveNextCOinS(needFullItems, newItems, couldUseFullItems, doc);
	}
	else {
		completeCOinS(newItems, couldUseFullItems, doc);
	}
}

function doExport() {
	var item;
	var co;
	
	while ((item = Zotero.nextItem())) {
		co = Zotero.Utilities.createContextObject(item, "1.0");
		if (co) {
			Zotero.write("<span class='Z3988' title='" + Zotero.Utilities.htmlSpecialChars(co) + "'></span>\n");
		}
	}
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://husdal.com/2011/06/19/disruptions-in-supply-networks/",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Disruptions and supply networks: a multi-level, multi-theoretical relational perspective",
				"creators": [
					{
						"firstName": "Phil",
						"lastName": "Greening",
						"creatorType": "author"
					},
					{
						"firstName": "Christine",
						"lastName": "Rutherford",
						"creatorType": "author"
					}
				],
				"date": "2011",
				"issue": "1",
				"pages": "104-126",
				"publicationTitle": "International Journal of Logistics Management",
				"shortTitle": "Disruptions and supply networks",
				"volume": "22",
				"attachments": [
					{
						"mimeType": "text/html"
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
		"url": "http://gamblershouse.wordpress.com/2011/06/19/the-view-from-dolores/",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://www.worldcat.org/title/genealogy-of-the-royal-family-of-great-britain-shewing-the-descent-of-queen-victoria-through-five-of-the-saxon-kings-who-were-crowned-at-kingston-upon-thames/oclc/559794003&referer=brief_results",
		"items": [
			{
				"itemType": "book",
				"title": "The Genealogy of the Royal Family of Great Britain, shewing the descent of ... Queen Victoria, through five of the Saxon Kings who were crowned ... at Kingston-upon-Thames.",
				"creators": [
					{
						"lastName": "Royal Families (England)",
						"isInstitution": true
					},
					{
						"lastName": "GENEALOGY",
						"creatorType": "author"
					}
				],
				"date": "1850",
				"place": "London",
				"publisher": "C. & E. Layton",
				"attachments": [
					{
						"mimeType": "text/html"
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
