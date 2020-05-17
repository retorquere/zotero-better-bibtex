{
	"translatorID": "4e9c34ef-89bb-4c7e-97dd-abb61d8b9254",
	"label": "Globes",
	"creator": "Eran Rosenthal",
	"target": "^https?://(www\\.)?(en\\.)?globes\\.co\\.il/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2019-12-21 07:49:34"
}

/**
	Copyright (c) 2019 Eran Rosenthal
	
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


// attr()/text() v2
// eslint-disable-next-line
function attr(docOrElem,selector,attr,index){var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector);return elem?elem.getAttribute(attr):null;}function text(docOrElem,selector,index){var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector);return elem?elem.textContent:null;}


function detectWeb(doc, _url) {
	if (attr(doc, 'meta[property="og:type"]', 'content') == "article") {
		return 'newspaperArticle';
	}
	return false;
}
function doWeb(doc, url) {
	var i;
	var item = new Zotero.Item('newspaperArticle');
	
	item.title = ZU.xpathText(doc, '//meta[@property="og:title"]/@content');
	item.publicationTitle = 'Globes';
	item.url = url;
	item.abstractNote = ZU.xpathText(doc, '//meta[@name="description"]/@content');
	item.section = ZU.xpathText(doc, '//meta[@property="article:section"]/@content');
	var tags = ZU.xpath(doc, '//meta[@property="article:tag"]');
	for (i = 0; i < tags.length; i++) {
		item.tags.push(tags[i].content);
	}

	var json = ZU.xpathText(doc, '//script[@type="application/ld+json"]');
	var data = JSON.parse(json);

	if (data) {
		if (data.author && Array.isArray(data.author)) {
			for (i = 0; i < data.author.length; i++) {
				// note the author sometimes include date in form of Month Year
				// and possibly Day Month Year
				var author = data.author[i].name;
				var isDate = /19[0-9]{2}$/.test(author)
					|| /2[0-9]{3}$/.test(author);
				if (!isDate) {
					author = Zotero.Utilities.cleanAuthor(author, 'author');
					item.creators.push(author);
				}
			}
		}
		if (data.inLanguage) {
			item.language = data.inLanguage;
		}

		if (data.datePublished) {
			item.date = ZU.strToISO(data.datePublished);
		}
	}

	item.attachments.push({
		title: "Globes Snapshot",
		document: doc,
		mimeType: "text/html"
	});
	item.complete();
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://www.globes.co.il/news/article.aspx?did=1001302127",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "הקרטל התאילנדי שובר שיאים של אכזריות. האם אדם אחד יצליח לעצור אותם?",
				"creators": [],
				"abstractNote": "גורמים עלומים בצפון-מזרח תאילנד מנהלים כבר שנים מערך מתוחכם ומורכב להפליא של ציד בלתי חוקיים, ומרוויחים הון עתק מהכליה שהם ממיטים על כמה מהמינים האקזוטיים בעולם ● האם האדם היחיד שנאבק בתופעה יצליח להפיל את סינדיקט ההברחות שאיש לא יכול לו?&nbsp;●&nbsp;גיליון שכולו קנאה&nbsp;&nbsp;",
				"libraryCatalog": "Globes",
				"publicationTitle": "Globes",
				"section": "מגזין G",
				"url": "https://www.globes.co.il/news/article.aspx?did=1001302127",
				"attachments": [
					{
						"title": "Globes Snapshot",
						"mimeType": "text/html"
					}
				],
				"tags": [
					{
						"tag": "אקטיביזם"
					},
					{
						"tag": "בעלי חיים"
					},
					{
						"tag": "גיליון שכולו קנאה"
					},
					{
						"tag": "יבשת אפריקה"
					},
					{
						"tag": "תאילנד"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.globes.co.il/news/article.aspx?did=1001303186",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "\"עשיתי חשבון נפש. גם שאר המעורבים בפרשה צריכים לעשות אחד\"",
				"creators": [
					{
						"firstName": "שלומית",
						"lastName": "לן",
						"creatorType": "author"
					},
					{
						"firstName": "נעמה",
						"lastName": "סיקולר",
						"creatorType": "author"
					}
				],
				"date": "2019-08-10",
				"abstractNote": "שנה וחצי אחרי תחקיר \"עובדה\", רמי ברכה, מהאנשים החזקים בהייטק, מדבר לראשונה, ביחד עם אשתו תמי מלחין ברכה, על הטענות שהטריד מינית&nbsp;● הוא עונה על כל השאלות, מכיר בטעויות שעשה אבל לא מתנצל, מצטער שהתפטר מקרן פיטנגו וחושב שגם תנועת MeToo צריכה לעשות חשבון נפש",
				"language": "he",
				"libraryCatalog": "Globes",
				"publicationTitle": "Globes",
				"section": "בארץ",
				"url": "https://www.globes.co.il/news/article.aspx?did=1001303186",
				"attachments": [
					{
						"title": "Globes Snapshot",
						"mimeType": "text/html"
					}
				],
				"tags": [
					{
						"tag": "MeToo"
					},
					{
						"tag": "הטרדה מינית"
					},
					{
						"tag": "רמי ברכה"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://en.globes.co.il/en/article-will-competition-authority-approve-taboola-outbrain-merger-1001302929",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Will the regulator approve Taboola-Outbrain merger?",
				"creators": [],
				"date": "2019-06-10",
				"abstractNote": "There are very real grounds for the Israel Competition Authority to nix the merger of the content recommendation companies.",
				"language": "en",
				"libraryCatalog": "Globes",
				"publicationTitle": "Globes",
				"section": "Features",
				"url": "https://en.globes.co.il/en/article-will-competition-authority-approve-taboola-outbrain-merger-1001302929",
				"attachments": [
					{
						"title": "Globes Snapshot",
						"mimeType": "text/html"
					}
				],
				"tags": [
					{
						"tag": "Artimedia"
					},
					{
						"tag": "Competition Authority"
					},
					{
						"tag": "Israel"
					},
					{
						"tag": "Outbrain"
					},
					{
						"tag": "Taboola"
					},
					{
						"tag": "advertising"
					},
					{
						"tag": "business"
					},
					{
						"tag": "content recommendations"
					},
					{
						"tag": "digital advertising"
					},
					{
						"tag": "media"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/
