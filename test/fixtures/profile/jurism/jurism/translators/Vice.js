{
	"translatorID": "131310dc-854c-4629-acad-521319ab9f19",
	"label": "Vice",
	"creator": "czar",
	"target": "^https?://(.+?\\.)?vice\\.com",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2019-06-13 19:09:19"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2018 czar
	http://en.wikipedia.org/wiki/User_talk:Czar

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


function scrubLowercaseTags(tags) {
	for (let tag of tags) {
		if (tag == tag.toLowerCase()) {
			tags[tags.indexOf(tag)] = ZU.capitalizeTitle(tag, true);
		}
	}
	return tags;
}


function detectWeb(doc, url) {
	if (/\/(article|story)\//.test(url)) {
		return "blogPost";
	}
	else if (/vice\.com\/?($|\w\w(_\w\w)?\/?$)|\/(search\?q=)|topic\/|category\/|(latest|read)($|\?page=)/.test(url) && getSearchResults(doc, true)) {
		return "multiple";
	}
	else if (attr(doc, 'meta[property="og:type"]', 'content') == "article") { /* Amuse i-D */
		return "blogPost";
	}
	return false;
}


function scrape(doc, url) {
	url = url.replace(/(\?|#).+/, '');
	var jsonURL = url + '?json=true';
	ZU.doGet(jsonURL, function (text) {
		var isValidJSON = true;
		try {
			JSON.parse(text);
		}
		catch (e) {
			isValidJSON = false;
		}
		if (isValidJSON) {
			var json = JSON.parse(text);
			var item = new Zotero.Item("blogPost");
			item.url = url;
			item.publicationTitle = json.data.channel.name;
			item.publicationTitle = ZU.capitalizeTitle(item.publicationTitle, true);
			item.title = json.metadata.share_title;
			item.date = new Date(json.data.publish_date).toJSON();
			item.abstractNote = json.metadata.description;
			var tags = json.metadata.news_keywords.split(',');
			for (let tag of tags) {
				item.tags.push(tag);
			}
			var authorMetadata = json.data.contributions;
			for (let author of authorMetadata) {
				item.creators.push(ZU.cleanAuthor(author.contributor.full_name, "author"));
			}
			item.language = json.data.locale.replace('_', '-').replace(/-\w{2}$/, c => c.toUpperCase());
			item.tags = scrubLowercaseTags(item.tags);
			item.complete();
		}
		else {
			// Embedded Metadata for News, i-D & Amuse
			var translator = Zotero.loadTranslator('web');
			translator.setTranslator('951c027d-74ac-47d4-a107-9c3069ab7b48'); // EM
			translator.setDocument(doc);
			
			translator.setHandler('itemDone', function (obj, item) { // corrections to EM
				item.itemType = "blogPost";
				if (url.includes('news.vice.com')) {
					item.publicationTitle = ZU.capitalizeTitle(item.publicationTitle.toLowerCase(), true);
					var jsonLD = doc.querySelector('script[type="application/ld+json"]');
					if (jsonLD) {
						jsonLD = jsonLD.textContent;
						item.date = jsonLD.match(/"datePublished"\s?:\s?"([^"]*)"/)[1].split(":")[0];
						var ldAuthors = JSON.parse(jsonLD.match(/"author"\s?:\s?\[([^\]]*)\]/)[0].replace(/"author"\s?:\s?/, ''));
						for (let author of ldAuthors) {
							item.creators.push(ZU.cleanAuthor(author.name, "author"));
						}
					}
				}
				else {
					item.publicationTitle = item.publicationTitle.replace('I-d', 'i-D');
					var authorMetadata = doc.querySelectorAll('.header-info-module__info span');
					for (let author of authorMetadata) {
						item.creators.push(ZU.cleanAuthor(author.textContent, "author"));
					}
				}
				item.tags = scrubLowercaseTags(item.tags);
				item.complete();
			});
		
			translator.getTranslatorObject(function (trans) {
				trans.doWeb(doc, url);
			});
		}
	});
}


function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = doc.querySelectorAll('.lede__content__title, .search__results__item__title, .grid__wrapper__card__text__title, .lede__content__title, .blog-grid__wrapper__card__text__title, .title-container h1.title, .item .item-title');
	var links = doc.querySelectorAll('.lede__content__link > a, .search__results__item, .grid__wrapper__card, .lede__content__title, .blog-grid__wrapper__card, .title-container h1.title a, .item .item-title a, .item > a');
	for (let i = 0; i < rows.length; i++) {
		var href = links[i].href;
		var title = ZU.trimInternal(rows[i].textContent);
		if (!href || !title) continue;
		if (checkOnly) return true;
		found = true;
		items[href] = title;
	}
	return found ? items : false;
}


function doWeb(doc, url) {
	switch (detectWeb(doc, url)) {
		case "multiple":
			Zotero.selectItems(getSearchResults(doc, false), function (items) {
				if (!items) return;

				var articles = [];
				for (var i in items) {
					articles.push(i);
				}
				ZU.processDocuments(articles, scrape);
			});
			break;
		default:
			scrape(doc, url);
			break;
	}
}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://www.vice.com/en_us/article/padaqv/anti-g20-activists-told-us-what-they-brought-to-the-protest-in-hamburg",
		"items": [
			{
				"itemType": "blogPost",
				"title": "Anti-G20 Activists Told Us What They Brought to the Protest in Hamburg",
				"creators": [
					{
						"firstName": "Alexander",
						"lastName": "Indra",
						"creatorType": "author"
					}
				],
				"date": "2017-07-07T15:44:00.000Z",
				"abstractNote": "\"My inflatable crocodile works as a shield against police batons, and as a seat. It also just lightens the mood.\"",
				"blogTitle": "Vice",
				"language": "en-UK",
				"url": "https://www.vice.com/en_us/article/padaqv/anti-g20-activists-told-us-what-they-brought-to-the-protest-in-hamburg",
				"attachments": [],
				"tags": [
					{
						"tag": "Demo"
					},
					{
						"tag": "Demonstration"
					},
					{
						"tag": "G20"
					},
					{
						"tag": "Hamburg"
					},
					{
						"tag": "Protest"
					},
					{
						"tag": "VICE Germany"
					},
					{
						"tag": "VICE International"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://waypoint.vice.com/en_us/article/bjxjbw/nina-freemans-games-really-get-millennial-romance",
		"items": [
			{
				"itemType": "blogPost",
				"title": "Nina Freeman’s Games Really Get Millennial Romance",
				"creators": [
					{
						"firstName": "Kate",
						"lastName": "Gray",
						"creatorType": "author"
					}
				],
				"date": "2017-07-09T18:00:00.000Z",
				"abstractNote": "And by rummaging around our own pasts through them, we can better understand where we are, and where we’ve been, on all things sexual.",
				"blogTitle": "Waypoint",
				"language": "en-US",
				"url": "https://waypoint.vice.com/en_us/article/bjxjbw/nina-freemans-games-really-get-millennial-romance",
				"attachments": [],
				"tags": [
					{
						"tag": "Awkward Teenage Rituals"
					},
					{
						"tag": "Cibelle"
					},
					{
						"tag": "How Do You Do It"
					},
					{
						"tag": "Lost Memories Dot Net"
					},
					{
						"tag": "Msn"
					},
					{
						"tag": "Nina Freeman"
					},
					{
						"tag": "Romance"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.vice.com/de/article/59pdy5/wie-kaputte-handys-und-profite-die-g20-gegner-antreiben",
		"items": [
			{
				"itemType": "blogPost",
				"title": "Wie kaputte Handys und Profite die G20-Gegner antreiben",
				"creators": [
					{
						"firstName": "Laura",
						"lastName": "Meschede",
						"creatorType": "author"
					}
				],
				"date": "2017-07-09T10:47:09.008Z",
				"abstractNote": "Der Rüstungsgegner, die Umweltschützerin und die Hippiefrau: Ich glaube, eigentlich haben sie das gleiche Ziel. Sie haben es auf ihren Plakaten nur unterschiedlich formuliert.",
				"blogTitle": "Vice",
				"language": "de",
				"url": "https://www.vice.com/de/article/59pdy5/wie-kaputte-handys-und-profite-die-g20-gegner-antreiben",
				"attachments": [],
				"tags": [
					{
						"tag": "Hamburg"
					},
					{
						"tag": "Kapitalismus"
					},
					{
						"tag": "Laura Meschede"
					},
					{
						"tag": "Meinung"
					},
					{
						"tag": "Wirtschaft"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://waypoint.vice.com/en_us/latest?page=2",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://amuse-i-d.vice.com/category/well-being/",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://i-d.vice.com/en_us/article/j5mm37/anish-kapoor-has-been-banned-from-using-yet-another-rare-paint",
		"items": [
			{
				"itemType": "blogPost",
				"title": "anish kapoor has been banned from using yet another rare paint",
				"creators": [
					{
						"firstName": "Isabelle",
						"lastName": "Hellyer",
						"creatorType": "author"
					}
				],
				"date": "2017-07-07T14:18:46.000Z",
				"abstractNote": "Contemporary art's most bizarre feud heats up with the creation of a new color-changing paint available to all — except Kapoor.",
				"blogTitle": "I-D",
				"language": "en-US",
				"url": "https://i-d.vice.com/en_us/article/j5mm37/anish-kapoor-has-been-banned-from-using-yet-another-rare-paint",
				"attachments": [],
				"tags": [
					{
						"tag": "Anish Kapoor"
					},
					{
						"tag": "Art"
					},
					{
						"tag": "Stuart Semple"
					},
					{
						"tag": "Vantablack"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://i-d.vice.com/en_us/topic/music",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://news.vice.com/en_us/article/434pxm/voters-may-soon-toughen-up-americas-weakest-police-shootings-law",
		"items": [
			{
				"itemType": "blogPost",
				"title": "Voters may soon toughen up America’s weakest police shootings law",
				"creators": [
					{
						"firstName": "Carter",
						"lastName": "Sherman",
						"creatorType": "author"
					}
				],
				"date": "2017-07-07T12",
				"abstractNote": "Watch VICE News Tonight on HBO weekdays at 7:30.",
				"blogTitle": "Vice News",
				"language": "en",
				"url": "https://news.vice.com/en_us/article/434pxm/voters-may-soon-toughen-up-americas-weakest-police-shootings-law",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					{
						"tag": "Ballot Initiative"
					},
					{
						"tag": "Charleena Lyles"
					},
					{
						"tag": "Che Taylor"
					},
					{
						"tag": "Crime"
					},
					{
						"tag": "Criminal Justice"
					},
					{
						"tag": "Law Enforcement"
					},
					{
						"tag": "News"
					},
					{
						"tag": "Not This Time"
					},
					{
						"tag": "Police"
					},
					{
						"tag": "Police Deadly Force"
					},
					{
						"tag": "Politics"
					},
					{
						"tag": "Seattle"
					},
					{
						"tag": "Washington State"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.vice.com/de",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://thump.vice.com/en_us/search?q=venetian",
		"items": "multiple"
	}
]
/** END TEST CASES **/
