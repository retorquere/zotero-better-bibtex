{
	"translatorID": "7f45c3f9-e387-4589-9679-225ddcf6f00e",
	"label": "Ynet",
	"creator": "Eran Rosenthal",
	"target": "^https?://www\\.ynet\\.co\\.il/articles/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2017-06-17 15:34:41"
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
	return 'newspaperArticle';
}
function doWeb(doc, url) { 
	var item = new Zotero.Item('newspaperArticle');
	
	item.title = ZU.xpathText(doc, '//meta[@property="og:title"]/@content');
	item.publicationTitle = 'Ynet';
	item.url = url;
	item.language = 'he';
	var abstract = ZU.xpathText(doc, '//div[@class="art_header_sub_title"]');
	if (!abstract) abstract = ZU.xpathText(doc, '//meta[@property="og:description"]/@content');
	item.abstractNote = abstract;
	
	var json = ZU.xpathText(doc, '//script[@type="application/ld+json"]');
	var data = JSON.parse(json);
	if (data) {
		if (data.author) {
			item.creators.push(Zotero.Utilities.cleanAuthor(data.author.name, 'author'));
		}
		if (data.datePublished) {
			item.date = ZU.strToISO(data.datePublished);
		}
	}

	item.complete();
}
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.ynet.co.il/articles/0,7340,L-4690772,00.html",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "תעלומת הקצין מארה\"ב, הסודות והמאהבת",
				"creators": [
					{
						"firstName": "ירון",
						"lastName": "דרוקמן",
						"creatorType": "author"
					}
				],
				"date": "2015-08-15",
				"abstractNote": "הכותרות בישרו השבוע לפני 15 שנים על פרשת ריגול מהסרטים: אמריקני-יהודי שהתגייר, בא לישראל עם חומר סודי ביותר ומטריף את הממשל מדאגה. חברתו העידה שהסתובב עם פאה ושפם והתקשר אליה מטלפונים ציבוריים לסניף הדואר. בסוף מצאו אותו במצפה רמון, והאמת התבררה. בערך",
				"language": "he",
				"libraryCatalog": "Ynet",
				"publicationTitle": "Ynet",
				"url": "http://www.ynet.co.il/articles/0,7340,L-4690772,00.html",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/