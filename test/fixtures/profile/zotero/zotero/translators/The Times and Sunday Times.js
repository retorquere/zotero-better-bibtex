{
	"translatorID": "53f8d182-4edc-4eab-b5a1-141698a10101",
	"label": "The Times and Sunday Times",
	"creator": "Philipp Zumstein",
	"target": "^https?://www\\.thetimes\\.co\\.uk/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2019-06-10 22:58:10"
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
	if (url.includes('/edition/') || url.includes('/article/')) {
		return "newspaperArticle";
	}
	return false;
}


function doWeb(doc, url) {
	scrape(doc, url);
}


function scrape(doc, url) {
	var translator = Zotero.loadTranslator('web');
	// Embedded Metadata
	translator.setTranslator('951c027d-74ac-47d4-a107-9c3069ab7b48');
	// translator.setDocument(doc);
	
	translator.setHandler('itemDone', function (obj, item) {
		var date = ZU.xpathText(doc, '//time[contains(@class, "Dateline")]');
		if (date) {
			item.date = ZU.strToISO(date);
		}
		item.publicationTitle = ZU.xpathText(doc, '//p[contains(@class, "Meta-content")]/span[contains(@class, "Publication")]');
		if (item.publicationTitle == "The Sunday Times") {
			item.ISSN = "0956-1382";
		}
		else {
			item.ISSN = "0140-0460";
		}
		item.url = ZU.xpathText(doc, '//link[@rel="canonical"]/@href') || url;
		item.section = ZU.xpathText(doc, '//article[@id="article-main"]/@data-article-sectionname');
		item.complete();
	});

	translator.getTranslatorObject(function (trans) {
		trans.itemType = "newspaperArticle";
		trans.doWeb(doc, url);
	});
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://www.thetimes.co.uk/edition/scotland/rare-animals-among-body-count-at-scottish-zoos-htpkmkfvx",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Rare animals among body count at Scottish zoos",
				"creators": [
					{
						"firstName": "Mark",
						"lastName": "Macaskill",
						"creatorType": "author"
					}
				],
				"date": "2017-07-02",
				"ISSN": "0956-1382",
				"abstractNote": "More than 900 creatures in the care of the Royal Zoological Society of Scotland (RZSS) died in captivity last year, including several hundred rare snails bred for conservation. Figures released by...",
				"libraryCatalog": "www.thetimes.co.uk",
				"publicationTitle": "The Sunday Times",
				"section": "Scotland",
				"url": "https://www.thetimes.co.uk/article/rare-animals-among-body-count-at-scottish-zoos-htpkmkfvx",
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
		"url": "https://www.thetimes.co.uk/edition/money/weve-come-a-long-way-since-1967-reg-2l5j3gsph",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "We’ve come a long way since 1967, Reg",
				"creators": [
					{
						"firstName": "Nina",
						"lastName": "Montagu-Smith",
						"creatorType": "author"
					}
				],
				"date": "2017-07-02",
				"ISSN": "0956-1382",
				"abstractNote": "Last week was the 50th anniversary of a landmark in the history of money: on June 27, 1967, the world’s first cash machine was unveiled in the unlikely setting of a Barclays branch in Enfield...",
				"libraryCatalog": "www.thetimes.co.uk",
				"publicationTitle": "The Sunday Times",
				"section": "Money",
				"url": "https://www.thetimes.co.uk/article/weve-come-a-long-way-since-1967-reg-2l5j3gsph",
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
		"url": "https://www.thetimes.co.uk/edition/news/british-museum-looks-to-the-future-with-digital-developments-to-control-crowds-3dfczszdz",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "British Museum looks to the future with digital developments to control crowds",
				"creators": [
					{
						"firstName": "David",
						"lastName": "Sanderson",
						"creatorType": "author"
					}
				],
				"date": "2017-07-05",
				"ISSN": "0140-0460",
				"abstractNote": "The British Museum launched its vision for the future yesterday and indicated that its digital developments will be used to control the enormous crowds that flock to its artefacts. The museum’s...",
				"libraryCatalog": "www.thetimes.co.uk",
				"publicationTitle": "The Times",
				"section": "News",
				"url": "https://www.thetimes.co.uk/article/british-museum-looks-to-the-future-with-digital-developments-to-control-crowds-3dfczszdz",
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
