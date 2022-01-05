{
	"translatorID": "8e98b11a-5648-42b2-8542-5f366cb953f6",
	"translatorType": 4,
	"label": "Art Institute of Chicago",
	"creator": "nikhil trivedi, Illya Moskvin",
	"target": "^https?://(www\\.)?artic\\.edu/(artworks/|collection)",
	"minVersion": "3.0",
	"maxVersion": null,
	"priority": 100,
	"inRepository": true,
	"browserSupport": "gcsibv",
	"lastUpdated": "2021-06-04 20:45:00"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2021 Art Institute of Chicago

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

function detectWeb(doc) {
	if (ZU.xpathText(doc, '//html[contains(@class, "p-artwork-show")]')) {
		return 'artwork';
	}
	else if (ZU.xpathText(doc, '//html[contains(@class, "p-collection-index")]')) {
		return 'multiple';
	}
	return false;
}

function doWeb(doc) {
	if (detectWeb(doc) == "multiple") {
		Zotero.selectItems(getSearchResults(doc, false), function (items) {
			if (!items) {
				return true;
			}
			var articles = [];
			for (var i in items) {
				articles.push(i);
			}
			ZU.processDocuments(articles, scrape);
			return true;
		});
	} else {
		scrape(doc);
	}
}

function scrape(doc) {
	var item = new Zotero.Item('artwork');
	item.title = ZU.xpathText(doc, '//h1');

	var artists = ZU.xpath(doc, '//meta[contains(@name, "citation_author")]');
	for (var i = 0; i < artists.length; i++) {
		var cleaned = artists[i].content.replace(/\(.*\)$/, '').trim();
		item.creators.push(ZU.cleanAuthor(cleaned, 'artist'));
	}

	item.attachments.push({
		title: 'Snapshot',
		document: doc
	});

	item.date = ZU
		.xpath(doc, '//dl[@id="dl-artwork-details"]/dd[@itemprop="dateCreated"]/*/a')
		.map(function (date) {
			return date.textContent;
		})
		.join(', ');

	item.artworkMedium = ZU.xpathText(doc, '//dl[@id="dl-artwork-details"]/dd[@itemprop="material"]');
	item.artworkSize = ZU.xpathText(doc, '//dl[@id="dl-artwork-details"]/dd[@itemprop="size"]');
	item.callNumber = ZU.xpathText(doc, '//dl[@id="dl-artwork-details"]/dd[@itemprop="identifier"]');

	item.url = ZU.xpathText(doc, '//link[@rel="canonical"]/@href');

	item.complete();
}

function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = ZU.xpath(doc, '//ul[@id="artworksList"]/li/a');
	for (var i = 0; i < rows.length; i++) {
		var href = rows[i].href;
		var title = ZU.trimInternal(rows[i].textContent);
		if (!href || !title) continue;
		if (checkOnly) return true;
		found = true;
		items[href] = title;
	}
	return found ? items : false;
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://www.artic.edu/artworks/129884/starry-night-and-the-astronauts",
		"items": [
			{
				"itemType": "artwork",
				"title": "Starry Night and the Astronauts",
				"creators": [
					{
						"firstName": "Alma",
						"lastName": "Thomas",
						"creatorType": "artist"
					}
				],
				"date": "1972",
				"artworkMedium": "Acrylic on canvas",
				"artworkSize": "152.4 × 134.6 cm (60 × 53 in.)",
				"callNumber": "1994.36",
				"libraryCatalog": "Art Institute of Chicago",
				"url": "https://www.artic.edu/artworks/129884/starry-night-and-the-astronauts",
				"attachments": [
					{
						"title": "Snapshot",
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
		"url": "https://www.artic.edu/artworks/156538/chicago-stock-exchange-trading-room-reconstruction-at-the-art-institute-of-chicago",
		"items": [
			{
				"itemType": "artwork",
				"title": "Chicago Stock Exchange Trading Room: Reconstruction at the Art Institute of Chicago",
				"creators": [
					{
						"lastName": "Architects",
						"creatorType": "artist",
						"firstName": "Adler & Sullivan"
					}
				],
				"date": "Built 1893–1894",
				"artworkMedium": "Mixed media recreation of room",
				"artworkSize": "Room is roughly 5,704 square feet (not including gallery)",
				"callNumber": "RX23310/0002",
				"libraryCatalog": "Art Institute of Chicago",
				"shortTitle": "Chicago Stock Exchange Trading Room",
				"url": "https://www.artic.edu/artworks/156538/chicago-stock-exchange-trading-room-reconstruction-at-the-art-institute-of-chicago",
				"attachments": [
					{
						"title": "Snapshot",
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
		"url": "https://www.artic.edu/artworks/28560/the-bedroom",
		"items": [
			{
				"itemType": "artwork",
				"title": "The Bedroom",
				"creators": [
					{
						"lastName": "Gogh",
						"creatorType": "artist",
						"firstName": "Vincent van"
					}
				],
				"date": "1889",
				"artworkMedium": "Oil on canvas",
				"artworkSize": "73.6 × 92.3 cm (29 × 36 5/8 in.)",
				"callNumber": "1926.417",
				"libraryCatalog": "Art Institute of Chicago",
				"url": "https://www.artic.edu/artworks/28560/the-bedroom",
				"attachments": [
					{
						"title": "Snapshot",
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
		"url": "https://www.artic.edu/artworks/52273/platform-bench",
		"items": [
			{
				"itemType": "artwork",
				"title": "Platform Bench",
				"creators": [
					{
						"firstName": "George",
						"lastName": "Nelson",
						"creatorType": "artist"
					},
					{
						"lastName": "Inc",
						"creatorType": "artist",
						"firstName": "Herman Miller"
					}
				],
				"date": "Designed 1946, Made 1946-1967, c. 1946-1967",
				"artworkMedium": "Birch",
				"artworkSize": "35.5 × 47 × 183.5 cm (14 × 18 1/2 × 72 1/4 in.)",
				"callNumber": "1978.141",
				"libraryCatalog": "Art Institute of Chicago",
				"url": "https://www.artic.edu/artworks/52273/platform-bench",
				"attachments": [
					{
						"title": "Snapshot",
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
		"url": "https://www.artic.edu/artworks/7691/gathering-seaweed-at-omori",
		"items": [
			{
				"itemType": "artwork",
				"title": "Gathering Seaweed at Omori",
				"creators": [
					{
						"firstName": "Utagawa",
						"lastName": "Kuniyoshi",
						"creatorType": "artist"
					}
				],
				"artworkMedium": "Ink and red pigment on paper",
				"callNumber": "1958.191",
				"libraryCatalog": "Art Institute of Chicago",
				"url": "https://www.artic.edu/artworks/7691/gathering-seaweed-at-omori",
				"attachments": [
					{
						"title": "Snapshot",
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
