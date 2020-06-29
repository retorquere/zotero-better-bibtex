{
	"translatorID": "b2d61bb5-5b21-41b7-9c83-1abcbf14639b",
	"label": "TheMarker",
	"creator": "Eran Rosenthal",
	"target": "^https?://www\\.themarker\\.com/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2017-07-03 10:47:30"
}

/**
	Copyright (c) 2015 Eran Rosenthal
	
	This program is free software: you can redistribute it and/or
	modify it under the terms of the GNU Affero General Public License
	as published by the Free Software Foundation, either version 3 of
	the License, or (at your option) any later version.
	
	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
	Affero General Public License for more details.
	
	You should have received a copy of the GNU Affero General Public
	License along with this program. If not, see
	<http://www.gnu.org/licenses/>.
*/

function detectWeb(doc, url) {
	if (ZU.xpathText(doc, '//header//h1')) {
		return "magazineArticle";
	}
}

function doWeb(doc, url) {
	newItem = new Zotero.Item("magazineArticle");
	newItem.url = url;
	newItem.publicationTitle = "TheMarker";

	newItem.title = ZU.xpathText(doc, '//header//h1');

	var abstract = ZU.xpathText(doc, '//header/p');
	if (!abstract) abstract = ZU.xpathText(doc, '//meta[@property="og:description"]/@content');
	newItem.abstractNote = abstract;
	
	newItem.date = ZU.xpathText(doc, '(//meta[@itemprop="datePublished"]/@content)[1]');
	
	var authors = ZU.xpath(doc, '//address/a[@rel="author"]');
	for (var i=0; i<authors.length; i++) {
		newItem.creators.push(ZU.cleanAuthor(authors[i].textContent, 'author'));
	}
	var keywordsString = ZU.xpathText(doc, '//meta[@name="news_keywords"]/@content');
	if (keywordsString) {
		var keywords = keywordsString.split(',');
		for (var i=0; i<keywords.length; i++) {
				if (keywords[i].length>0) newItem.tags.push(keywords[i].trim());
		}
	}

	newItem.attachments = [{
		document: doc,
		title: "TheMarker"
	}];

	newItem.complete();
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.themarker.com/markerweek/thisweek/1.2707370",
		"items": [
			{
				"itemType": "magazineArticle",
				"title": "השופט גרוסקופף מציג: הבובות של נוחי דנקנר",
				"creators": [
					{
						"firstName": "גיא",
						"lastName": "רולניק",
						"creatorType": "author"
					}
				],
				"date": "2015-08-15T13:23:18+0300",
				"abstractNote": "כאשר במשק יש ריכוזי כוח כלכלי ופוליטי, לאיש אין עניין לצעוק שהמלך הוא עירום, ורוב האנשים יעדיפו לשכנע את עצמם שאלה בגדי המלך החדשים והיפים",
				"libraryCatalog": "TheMarker",
				"publicationTitle": "TheMarker",
				"shortTitle": "השופט גרוסקופף מציג",
				"url": "http://www.themarker.com/markerweek/thisweek/1.2707370",
				"attachments": [
					{
						"title": "TheMarker"
					}
				],
				"tags": [
					"ריכוזיות"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/