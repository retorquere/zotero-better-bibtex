{
	"translatorID": "aee2323e-ce00-4fcc-a949-06eb1becc98f",
	"label": "Epicurious",
	"creator": "Philipp Zumstein",
	"target": "^https?://www\\.epicurious\\.com/(tools/searchresults|recipes/food/views)",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2016-09-14 10:54:06"
}

/*
	***** BEGIN LICENSE BLOCK *****
	
	Copyright © 2016 Philipp Zumstein
	
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
	if (url.indexOf('/recipes/')>-1) {
		return "blogPost";
	} else if (getSearchResults(doc, true)) {
		return "multiple";
	}
}


function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = ZU.xpath(doc, '//div[@id="searchresults"]//a[@class="recipeLnk"]');
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
	var date = ZU.xpathText(doc, '//meta[@itemprop="datePublished"]/@content')
	
	var translator = Zotero.loadTranslator('web');
	// Embedded Metadata
	translator.setTranslator('951c027d-74ac-47d4-a107-9c3069ab7b48');

	translator.setHandler('itemDone', function (obj, item) {
		item.date = date;
		item.complete();
	});
	
	translator.getTranslatorObject(function(trans) {
		trans.itemType = "blogPost";
		trans.doWeb(doc, url);
	});
}
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.epicurious.com/recipes/food/views/Bitter-Orange-Creme-Brulee-361549",
		"items": [
			{
				"itemType": "blogPost",
				"title": "Bitter Orange Crème Brûlée",
				"creators": [
					{
						"firstName": "Jeff",
						"lastName": "Morgan",
						"creatorType": "author"
					}
				],
				"date": "2010-10-05T04:00:00.000Z",
				"abstractNote": "The simple addition of orange zest adds a delightful dimension to this French classic, with tangy citrus notes enhancing the creamy-sweet custard. Home cooks who don't have a chef's blowtorch can easily use their broiler/grill to caramelize the sugar topping. But remember to leave the oven door slightly open and keep watch. A golden sugar crust can quickly turn black if left too long under the flame.\n        \n        This dessert was born of a collaboration between the cellar and the kitchen. Some years ago during the creation of Chandon Richeour off-dry sparkling wine, which has a hint of sweetnessour winemaker recalled the aromatics issuing from the orange tree that grew not far from the wine cellar. He ran to the kitchen with a bottle of the new wine and asked if the chefs could produce a dessert that evoked the same citrus impression. Bitter Orange Crème Brûlée is now a signature dish at the restaurant.For a nice pairing with this dessert, add the classic ladyfinger sugar cookies, if you like; they bring a crisp element to join the silky custard and the crunch of the sugar. Make them in advance of the crème brûlée.",
				"blogTitle": "Epicurious",
				"url": "http://www.epicurious.com/recipes/food/views/bitter-orange-creme-brulee-361549",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					"Advance Prep Required",
					"Citrus",
					"Dessert",
					"Egg",
					"Fruit",
					"Orange",
					"Ramekin"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.epicurious.com/tools/searchresults?search=chocolate&x=0&y=0",
		"items": "multiple"
	}
]
/** END TEST CASES **/