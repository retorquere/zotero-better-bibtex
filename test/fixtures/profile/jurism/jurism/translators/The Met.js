{
	"translatorID": "72dbad15-cd1a-4d52-b2ed-7d67f909cada",
	"label": "The Met",
	"creator": "Aurimas Vinckevicius, Philipp Zumstein",
	"target": "^https?://metmuseum\\.org/art/collection",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2017-07-01 11:39:10"
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
	if (ZU.xpathText(doc, '//div[contains(@class, "collection-details__tombstone")]')) {
		return 'artwork';
	}
	//multiples are working when waiting for the website to load completely,
	//but automatic testing seems difficult, try manually e.g.
	//http://metmuseum.org/art/collection?ft=albrecht+d%C3%BCrer&noqs=true
	if (getSearchResults(doc, true)) return 'multiple';
}


function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = ZU.xpath(doc, '//h2[contains(@class, "card__title")]/a');
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
	var item = new Zotero.Item('artwork');
	item.title = ZU.xpathText(doc, '//h1');
	
	var meta = ZU.xpath(doc, '//div[contains(@class, "collection-details__tombstone")]/dl')
	for (var i=0; i<meta.length; i++) {
		var heading = ZU.xpathText(meta[i], './dt[contains(@class, "label")]');
		heading = heading.toLowerCase().substr(0, heading.length-1);
		var content = ZU.xpathText(meta[i], './dd[contains(@class, "value")]');
		//Z.debug(heading + content)

		switch (heading) {
			case 'date':
			case 'medium':
				item[heading] = content;
				break;
			case 'dimensions':
				item.artworkSize = content;
				break;
			case 'accession number':
				item.callNumber = content;
				break;
			case 'classification':
			case 'period':
			case 'culture':
				item.tags.push(content);
				break;
			case 'artist':
				var cleaned = content.replace(/\(.*\)$/, '').trim();
				if (cleaned.split(' ').length>2) {
					item.creators.push({'lastName': content, 'creatorType': 'artist', 'fieldMode': 1})
				} else {
					item.creators.push(ZU.cleanAuthor(cleaned, "artist"));
				}
				break;
		}
	} 
	
	item.abstractNote = ZU.xpathText(doc, '//div[contains(@class, "collection-details__label")]');
	item.libraryCatalog = 'The Metropolitan Museum of Art';
	item.url = ZU.xpathText(doc, '//link[@rel="canonical"]/@href');
	
	var download = ZU.xpathText(doc, '//li[contains(@class, "utility-menu__item--download")]/a/@href');
	if (download) {
		item.attachments.push({
			title: 'Met Image',
			url: download
		});
	}
	item.attachments.push({
		title: 'Snapshot',
		document: doc
	});
	
	item.complete();
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://metmuseum.org/art/collection/search/328877?rpp=30&pg=1&rndkey=20140708&ft=*&who=Babylonian&pos=4",
		"items": [
			{
				"itemType": "artwork",
				"title": "Cuneiform tablet case impressed with four cylinder seals, for cuneiform tablet 86.11.214a: field rental",
				"creators": [],
				"date": "ca. 1749–1712 B.C.",
				"artworkMedium": "Clay",
				"artworkSize": "2.1 x 4.4 x 2.9 cm (7/8 x 1 3/4 x 1 1/8 in.)",
				"callNumber": "86.11.214b",
				"libraryCatalog": "The Metropolitan Museum of Art",
				"shortTitle": "Cuneiform tablet case impressed with four cylinder seals, for cuneiform tablet 86.11.214a",
				"url": "http://metmuseum.org/art/collection/search/328877",
				"attachments": [
					{
						"title": "Met Image"
					},
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					"Babylonian",
					"Clay-Tablets-Inscribed-Seal Impressions",
					"Old Babylonian"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://metmuseum.org/art/collection/search/328877",
		"items": [
			{
				"itemType": "artwork",
				"title": "Cuneiform tablet case impressed with four cylinder seals, for cuneiform tablet 86.11.214a: field rental",
				"creators": [],
				"date": "ca. 1749–1712 B.C.",
				"artworkMedium": "Clay",
				"artworkSize": "2.1 x 4.4 x 2.9 cm (7/8 x 1 3/4 x 1 1/8 in.)",
				"callNumber": "86.11.214b",
				"libraryCatalog": "The Metropolitan Museum of Art",
				"shortTitle": "Cuneiform tablet case impressed with four cylinder seals, for cuneiform tablet 86.11.214a",
				"url": "http://metmuseum.org/art/collection/search/328877",
				"attachments": [
					{
						"title": "Met Image"
					},
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					"Babylonian",
					"Clay-Tablets-Inscribed-Seal Impressions",
					"Old Babylonian"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://metmuseum.org/art/collection/search/436243?rpp=30&pg=1&ft=albrecht+d%c3%bcrer&pos=1",
		"items": [
			{
				"itemType": "artwork",
				"title": "Salvator Mundi",
				"creators": [
					{
						"firstName": "Albrecht",
						"lastName": "Dürer",
						"creatorType": "artist"
					}
				],
				"date": "ca. 1505",
				"abstractNote": "This picture of Christ as Salvator Mundi, Savior of the World, who raises his right hand in blessing and in his left holds a globe representing the earth, can be appreciated both as a painting and as a drawing. Albrecht Dürer, the premier artist of the German Renaissance, probably began this work shortly before he departed for Italy in 1505, but completed only the drapery. His unusually extensive and meticulous preparatory drawing on the panel is visible in the unfinished portions of Christ's face and hands.",
				"artworkMedium": "Oil on linden",
				"artworkSize": "22 7/8 x 18 1/2in. (58.1 x 47cm)",
				"callNumber": "32.100.64",
				"libraryCatalog": "The Metropolitan Museum of Art",
				"url": "http://metmuseum.org/art/collection/search/436243",
				"attachments": [
					{
						"title": "Met Image"
					},
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					"Paintings"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/