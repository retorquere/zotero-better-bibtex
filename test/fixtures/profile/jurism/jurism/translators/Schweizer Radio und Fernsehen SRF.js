{
	"translatorID": "a8e51f4e-0372-42ad-81a8-bc3dcea6dc03",
	"label": "Schweizer Radio und Fernsehen SRF",
	"creator": "ibex, Sebastian Karcher",
	"target": "^https?://(www\\.)?srf\\.ch/sendungen/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2017-06-24 22:06:07"
}

/*
	DRS Translator - Parses Schweizer Radio DRS articles and creates Zotero-based
	metadata.
	Copyright (C) 2011 ibex, 2012 Sebastian Karcher

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

/*
Barebones re-write. This will work for radio shows, but nothing else & no search results. Shouldn't be too hard to add more.
*/

/* Zotero API */
function detectWeb(doc, url) {
	if (ZU.xpathText(doc, '//h1[@class="article-heading"]')) {
		return "radioBroadcast";
	// Archive pages
	} else if (ZU.xpathText(doc, '//div[contains(@class, "container_episodes")]')) {
		return "multiple";
	}
}

/* Zotero API */
function doWeb(doc, url) {
	// Z.debug("ibex doWeb URL = " + url);
	var urls = new Array();
	if (detectWeb(doc, url) == "multiple") {
		var items = {}
	var titles = ZU.xpath(doc, '//div[@class="module-content"]/h3/a');
	for (var i = 0; i<titles.length; i++){
		items[titles[i].href] = titles[i].textContent.trim();	
	}
	Zotero.selectItems(items, function (items) {
			if (!items) {
				return true;
			}
			for (var i in items) {
				urls.push(i);
			}
			Zotero.Utilities.processDocuments(urls, scrape);
		});
	} else {
		scrape(doc,url)
	}
}

/* Zotero API */
function scrape(doc) {
	// Z.debug("ibex scrape URL = " + doc.location.href);

	// Fetch meta tags and fill meta tag array for associateMeta() function
	var newItem = new Z.Item('radioBroadcast');
	newItem.url = doc.location.href;

	newItem.title = ZU.xpathText(doc, '//h1[@class="article-heading"]');
	
	var date = ZU.xpathText(doc, '//li[@class="publication"]');
	//Z.debug(date);
	if (date) {
		var match = date.match(/^[^,]+,([^,]+),.+/);
		if (match) {
			newItem.date = match[1];
		} else {
			newItem.date = date;
		}
	}


	newItem.language = 'de-CH';
	newItem.programTitle = ZU.xpathText(doc, '//header//h1/img/@alt')
	newItem.network = "Schweizer Radio und Fernsehen SRF";
	newItem.abstractNote = ZU.xpathText(doc, '//p[contains(@class, "lead-text")]');
	
	var runningTime = ZU.xpath(doc, '//div[@id = "article"]//a[@class = "beitrag_hoeren"]');
	if (runningTime.length > 0) {
		newItem.runningTime = ZU.trimInternal(runningTime[0].textContent.match(/(\d|:)+/)[0]);
	}

	var authors = ZU.xpath(doc, '//p[@class = "author"]/span');
	for (var i = 0; i < authors.length; i++) {
		var author = authors[i].textContent;
		// Remove prefix
		newItem.creators.push(ZU.cleanAuthor(author, "author"));
	}

	newItem.complete();
}
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.srf.ch/sendungen/echo-der-zeit/micheline-calmy-rey-zu-ihrem-ruecktritt",
		"items": [
			{
				"itemType": "radioBroadcast",
				"title": "Micheline Calmy-Rey zu ihrem Rücktritt",
				"creators": [
					{
						"firstName": "Ursula",
						"lastName": "Hürzeler",
						"creatorType": "author"
					},
					{
						"firstName": "Markus",
						"lastName": "Mugglin",
						"creatorType": "author"
					}
				],
				"date": "7. September 2011",
				"language": "de-CH",
				"libraryCatalog": "Schweizer Radio und Fernsehen SRF",
				"network": "Schweizer Radio und Fernsehen SRF",
				"url": "http://www.srf.ch/sendungen/echo-der-zeit/micheline-calmy-rey-zu-ihrem-ruecktritt",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.srf.ch/sendungen/echo-der-zeit/sendungen",
		"items": "multiple"
	}
]
/** END TEST CASES **/
