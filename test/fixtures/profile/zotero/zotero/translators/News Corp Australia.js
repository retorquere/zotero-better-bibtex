{
	"translatorID": "393afc28-212d-47dd-be87-ec51bc7a58a4",
	"translatorType": 4,
	"label": "News Corp Australia",
	"creator": "Michael Berkowitz and Abe Jellinek",
	"target": "^https?://(www\\.)?(news|theaustralian|couriermail|adelaidenow|heraldsun|dailytelegraph|goldcoastbulletin|themercury|dailymercury|ntnews|northshoretimes|geelongadvertiser|townsvillebulletin|cairnspost|themorningbulletin|gladstoneobserver|sunshinecoastdaily|qt|thechronicle)\\.com\\.au/",
	"minVersion": "1.0.0b3.r1",
	"maxVersion": null,
	"priority": 100,
	"inRepository": true,
	"browserSupport": "gcsibv",
	"lastUpdated": "2021-06-02 13:50:00"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2021 Abe Jellinek
	
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


let jsonSelector = 'script[type="application/ld+json"]';

function detectWeb(doc, url) {
	if ((url.includes('/news-story/') || url.includes('/news/')) && doc.querySelector(jsonSelector)) {
		return "newspaperArticle";
	}
	else if (getSearchResults(doc, true)) {
		return "multiple";
	}
	return false;
}

function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = doc.querySelectorAll('h3.story-block__heading a');
	for (let row of rows) {
		let href = row.href;
		let title = ZU.trimInternal(row.textContent);
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
			if (items) ZU.processDocuments(Object.keys(items), scrape);
		});
	}
	else {
		scrape(doc, url);
	}
}

function scrape(doc, url) {
	let meta = JSON.parse(text(doc, jsonSelector));

	let item = new Zotero.Item('newspaperArticle');
	item.title = meta.headline;
	item.date = ZU.strToISO(meta.datePublished);
	item.abstractNote = meta.description;
	if (meta.author) {
		item.creators = meta.author.name
			.split(/ and |, /)
			.map(name => ZU.cleanAuthor(name, 'author', false));
	}
	item.publicationTitle = meta.publisher.name;
	item.section = getSection(doc);
	item.url = meta.mainEntityOfPage['@id'];
	item.libraryCatalog = '';
	item.attachments.push({
		title: "Snapshot",
		url: item.url,
		mimeType: 'text/html',
		snapshot: true
	});
	item.complete();
}

function getSection(doc) {
	let breadcrumbs = doc.querySelector('#breadcrumbs');
	if (!breadcrumbs || breadcrumbs.childElementCount < 2) {
		// we want to return null, not '', if we can't find a section tag
		return text(doc, '.tg-tlc-storyheader_sectiontag') || null;
	}
	
	return ZU.capitalizeTitle(breadcrumbs.lastChild.innerText, true);
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://www.theaustralian.com.au/breaking-news/all-eyes-on-australias-debate-over-net-zero-emissions-by-2050/news-story/ba601f16b82a9bec3b899be8a3d21566",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "All eyes on Australia’s debate over net zero emissions by 2050",
				"creators": [
					{
						"firstName": "Jade",
						"lastName": "Gailberger",
						"creatorType": "author"
					}
				],
				"date": "2021-04-20",
				"abstractNote": "Scott Morrison is attempting to divide Australians over climate policies, opposition energy spokesman Chris Bowen says.",
				"publicationTitle": "The Australian",
				"section": "Breaking News",
				"url": "https://www.theaustralian.com.au/breaking-news/all-eyes-on-australias-debate-over-net-zero-emissions-by-2050/news-story/ba601f16b82a9bec3b899be8a3d21566",
				"attachments": [
					{
						"title": "Snapshot",
						"mimeType": "text/html",
						"snapshot": true
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
		"url": "https://www.theaustralian.com.au/business/margin-call/sezzle-founders-set-for-11m-payday/news-story/d8e94aa1b86abd41bb14fced6117340e",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Sezzle founders set for $11m payday",
				"creators": [
					{
						"firstName": "Melissa",
						"lastName": "Yeo",
						"creatorType": "author"
					},
					{
						"firstName": "Christine",
						"lastName": "Lacy",
						"creatorType": "author"
					}
				],
				"date": "2021-05-21",
				"publicationTitle": "The Australian",
				"section": "Margin Call",
				"url": "https://www.theaustralian.com.au/business/margin-call/sezzle-founders-set-for-11m-payday/news-story/d8e94aa1b86abd41bb14fced6117340e",
				"attachments": [
					{
						"title": "Snapshot",
						"mimeType": "text/html",
						"snapshot": true
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
		"url": "https://www.news.com.au/lifestyle/real-life/news-life/degustation-menu-american-baffled-by-aussie-dinner-item/news-story/d6fa0985cfae88e47ea91412ae7a0e2c",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Degustation menu: American baffled by Aussie dinner item",
				"creators": [
					{
						"firstName": "Rebekah",
						"lastName": "Scanlan",
						"creatorType": "author"
					}
				],
				"date": "2021-05-25",
				"abstractNote": "Degustation menu: American baffled by Aussie dinner item",
				"publicationTitle": "news.com.au",
				"section": "News Life",
				"shortTitle": "Degustation menu",
				"url": "https://www.news.com.au/lifestyle/real-life/news-life/degustation-menu-american-baffled-by-aussie-dinner-item/news-story/d6fa0985cfae88e47ea91412ae7a0e2c",
				"attachments": [
					{
						"title": "Snapshot",
						"mimeType": "text/html",
						"snapshot": true
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
