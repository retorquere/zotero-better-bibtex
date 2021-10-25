{
	"translatorID": "7f45c3f9-e387-4589-9679-225ddcf6f00e",
	"translatorType": 4,
	"label": "Ynet",
	"creator": "Eran Rosenthal and Abe Jellinek",
	"target": "^https?://www\\.ynet(\\.co\\.il|news\\.com)/",
	"minVersion": "3.0",
	"maxVersion": null,
	"priority": 100,
	"inRepository": true,
	"browserSupport": "gcsibv",
	"lastUpdated": "2021-06-07 22:20:00"
}

/**
	Copyright (c) 2021 Eran Rosenthal and Abe Jellinek
	
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

function detectWeb(doc, _url) {
	if (attr(doc, 'meta[property="og:type"]', 'content') == 'article') {
		return 'newspaperArticle';
	}
	// no multiples - search is Google in an iframe
	return false;
}

function doWeb(doc, url) {
	let translator = Zotero.loadTranslator('web');
	// Embedded Metadata
	translator.setTranslator('951c027d-74ac-47d4-a107-9c3069ab7b48');

	translator.setHandler('itemDone', function (obj, item) {
		// Ynet/Ynetnews stylize their names in lowercase, even in the metadata
		item.publicationTitle = ZU.capitalizeTitle(item.publicationTitle, true);
		item.tags = []; // always the same
		var json = text(doc, 'script[type="application/ld+json"]');
		var data = JSON.parse(json);
		if (data.author) {
			for (let name of data.author.name.split(', ')) {
				item.creators.push(ZU.cleanAuthor(name, 'author', false));
			}
		}
		item.complete();
	});

	translator.getTranslatorObject(function (em) {
		em.itemType = 'newspaperArticle';
		em.doWeb(doc, url);
	});
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://www.ynet.co.il/articles/0,7340,L-4690772,00.html",
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
				"date": "2015-08-15T05:14:22.05522Z",
				"abstractNote": "הכותרות בישרו השבוע לפני 15 שנים על פרשת ריגול מהסרטים: אמריקני-יהודי שהתגייר, בא לישראל עם חומר סודי ביותר ומטריף את הממשל מדאגה. חברתו העידה שהסתובב עם פאה ושפם והתקשר אליה מטלפונים ציבוריים לסניף הדואר. בסוף מצאו אותו במצפה רמון, והאמת התבררה. בערך",
				"language": "he",
				"libraryCatalog": "www.ynet.co.il",
				"publicationTitle": "Ynet",
				"url": "https://www.ynet.co.il/articles/0,7340,L-4690772,00.html",
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
		"url": "https://www.ynet.co.il/health/article/SkqOFf8qd",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "השפעת כוח הכבידה על האוזניים: בדיקת שמיעה ישראלית תשוגר לחלל",
				"creators": [
					{
						"firstName": "אלכסנדרה",
						"lastName": "לוקש",
						"creatorType": "author"
					},
					{
						"firstName": "ניר (שוקו)",
						"lastName": "כהן",
						"creatorType": "author"
					}
				],
				"date": "2021-06-03T09:59:52.444818Z",
				"abstractNote": "בדיקות השמיעה של החברה הישראלית Tunefork  נבחרו לקחת חלק במשימת החלל הפרטית \"רקיע\" בהשתתפות האסטרונאוט הישראלי איתן סטיבה: \"כולם זקוקים לחוויית סאונד טובה במכשירים החכמים שלהם\"",
				"language": "he",
				"libraryCatalog": "www.ynet.co.il",
				"publicationTitle": "Ynet",
				"shortTitle": "השפעת כוח הכבידה על האוזניים",
				"url": "https://www.ynet.co.il/health/article/SkqOFf8qd",
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
		"url": "https://www.ynetnews.com/article/BkexUbIcO",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Historic coalition deal could help divided Israel heal",
				"creators": [
					{
						"firstName": "Merav",
						"lastName": "Batito",
						"creatorType": "author"
					}
				],
				"date": "2021-06-03T20:30:56.063619Z",
				"abstractNote": "Opinion: With the dark cloud of the sectarian violence of last month still hovering over the country, Mansour Abbas' decision to join 'coalition for change' marks an opportunity for genuine partnership and cooperation between Israeli Jews and Arabs",
				"language": "en",
				"libraryCatalog": "www.ynetnews.com",
				"publicationTitle": "Ynetnews",
				"url": "https://www.ynetnews.com/article/BkexUbIcO",
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
