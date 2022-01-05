{
	"translatorID": "d6f64d96-aa6f-4fd3-816f-bdef842c7088",
	"label": "Haaretz",
	"creator": "Eran Rosenthal",
	"target": "^https?://www\\.haaretz\\.(co\\.il|com)/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2016-10-31 17:33:48"
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
		return 'newspaperArticle';
	}
}

function doWeb(doc, url) {
	var item = new Zotero.Item('newspaperArticle');
	item.title = ZU.xpathText(doc, '//header//h1');
	item.url = url;
	if (url.indexOf('haaretz.com') != -1) {
		item.publicationTitle = 'Haaretz';
		item.language = 'en';
	} else {
		item.publicationTitle = 'הארץ';
		item.language = 'he';
	}

	var abstract = ZU.xpathText(doc, '//header/p');
	if (!abstract) abstract = ZU.xpathText(doc, '//meta[@property="og:description"]/@content');
	item.abstractNote = abstract;

	var authors = ZU.xpath(doc, '//address/a[@rel="author"]');
	for (var i=0; i<authors.length; i++) {
		item.creators.push(ZU.cleanAuthor(authors[i].textContent, 'author'));
	}

	item.date = ZU.strToISO(ZU.xpathText(doc, '//time[@itemprop="datePublished"]/@datetime'));
	var keywords = ZU.xpathText(doc, '//meta[@name="news_keywords"]/@content').split(',');
	for (var i=0; i<keywords.length; i++) {
		if (keywords[i].length>0) item.tags.push(keywords[i].trim());
	}
	item.complete();
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.haaretz.com/israel-news/1.671202",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Islamic Jihad: If Hunger Striker Dies, We'll Respond With Force Against Israel",
				"creators": [
					{
						"firstName": "Jack",
						"lastName": "Khoury",
						"creatorType": "author"
					},
					{
						"firstName": "Shirly",
						"lastName": "Seidler",
						"creatorType": "author"
					},
					{
						"firstName": "Ido",
						"lastName": "Efrati",
						"creatorType": "author"
					}
				],
				"date": "2015-08-14",
				"abstractNote": "Islamic Jihad says it will no longer be committed to maintaining calm if Mohammed Allaan, who lost consciousness after 60-day hunger strike, dies.",
				"language": "en",
				"libraryCatalog": "Haaretz",
				"publicationTitle": "Haaretz",
				"shortTitle": "Islamic Jihad",
				"url": "http://www.haaretz.com/israel-news/1.671202",
				"attachments": [],
				"tags": [
					"Palestinian hunger strike"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.haaretz.co.il/news/politics/1.2708080",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "פלסטיני דקר חייל ופצע אותו באורח קל בכביש 443 סמוך לבית חורון",
				"creators": [
					{
						"firstName": "גילי",
						"lastName": "כהן",
						"creatorType": "author"
					},
					{
						"firstName": "עמירה",
						"lastName": "הס",
						"creatorType": "author"
					}
				],
				"date": "2015-08-15",
				"abstractNote": "כוח צה\"ל שהיה במקום פתח באש לעבר הפלסטיני ופצע אותו באורח קל, והוא נעצר. החייל והדוקר פונו לבית החולים שערי צדק. בתחילת השבוע נדקר באזור צעיר ישראלי נוסף שנפצע בינוני",
				"language": "he",
				"libraryCatalog": "Haaretz",
				"publicationTitle": "הארץ",
				"url": "http://www.haaretz.co.il/news/politics/1.2708080",
				"attachments": [],
				"tags": [
					"טרור",
					"פיגוע",
					"פלסטינים",
					"צה\"ל"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/