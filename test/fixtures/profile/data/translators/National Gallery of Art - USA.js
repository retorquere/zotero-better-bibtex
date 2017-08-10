{
	"translatorID": "ed28758b-9c39-4e1c-af89-ce1c9202b70f",
	"label": "National Gallery of Art - USA",
	"creator": "Adam Crymble",
	"target": "^https?://www\\.nga\\.gov/content/ngaweb",
	"minVersion": "1.0.0b4.r5",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2016-12-28 11:55:43"
}

/* Multiple items examples (tests don't work)
http://www.nga.gov/content/ngaweb/collection-search-result.html?artist=
http://www.nga.gov/content/ngaweb/Collection/artist-info.1951.html
*/

function detectWeb(doc, url) {
	if (url.indexOf("art-object-page")!=-1) {
		return "artwork";
	}
	
	if (url.indexOf("artist-info")!=-1 || url.indexOf("search-result.html")!=-1) {
		return "multiple";
	} 	
}

//National Gallery USA translator. Code by Adam Crymble

function scrape(doc, url) {
	var style = 0;
	var title1;
	var newItem = new Zotero.Item("artwork");
	var authors = ZU.xpath(doc, '//dl[@class="artist-details"]/dt[@class="artist"]/a');
	for (var i in authors){
		//there are occasional empty items
		if (authors[i].textContent) newItem.creators.push(ZU.cleanAuthor(authors[i].textContent, "artist", true))
	}
	newItem.title = ZU.xpathText(doc, '//dl[@class="artwork-details"]/dt[@class="title"]');
	newItem.date = ZU.xpathText(doc, '//dl[@class="artwork-details"]/dt[@class="created"]');
	newItem.medium = ZU.xpathText(doc, '//dl[@class="artwork-details"]/dd[@class="medium"]');
	newItem.artworkSize = ZU.xpathText(doc, '//dl[@class="artwork-details"]/dd[@class="dimensions"]');
	newItem.callNumber = ZU.xpathText(doc, '//dl[@class="artwork-details"]/dd[@class="accession"]');
	newItem.attachments.push({document: doc, title: "US National Gallery Snapshot", mimeType: "text/html"});
	
	newItem.complete();
}

function doWeb(doc, url) {
	var articles = new Array();
	
	if (detectWeb(doc, url) == "multiple") {
		var items = new Object();
		
		var titles = doc.evaluate('//dt[@class="title"]/a', doc, null, XPathResult.ANY_TYPE, null);
		
		var next_title;
		while (next_title = titles.iterateNext()) {
			items[next_title.href] = next_title.textContent;
		}
		Zotero.selectItems(items, function (items) {
			if (!items) {
				return true;
			}
			for (var i in items) {
				articles.push(i);
			}
			Zotero.Utilities.processDocuments(articles, scrape);
		});
	} else {
		scrape(doc, url)
	}
}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.nga.gov/content/ngaweb/Collection/art-object-page.1237.html",
		"items": [
			{
				"itemType": "artwork",
				"title": "Girl with a Flute",
				"creators": [
					{
						"firstName": "Johannes",
						"lastName": "Vermeer",
						"creatorType": "artist"
					}
				],
				"date": "probably 1665/1675",
				"artworkMedium": "oil on panel",
				"artworkSize": "painted surface: 20 x 17.8 cm (7 7/8 x 7 in.), framed: 39.7 x 37.5 x 5.1 cm (15 5/8 x 14 3/4 x 2 in.)",
				"callNumber": "1942.9.98",
				"libraryCatalog": "National Gallery of Art - U.S.A.",
				"attachments": [
					{
						"title": "US National Gallery Snapshot",
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