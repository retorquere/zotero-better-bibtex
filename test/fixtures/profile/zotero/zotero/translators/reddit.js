{
	"translatorID": "23bacc11-98e3-4b78-b1ef-cc2c9a04b893",
	"label": "reddit",
	"creator": "Lukas Kawerau",
	"target": "^https?://www\\.reddit\\.com",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2020-10-29 20:46:27"
}

/*
	***** BEGIN LICENSE BLOCK *****
	Copyright © 2020 Lukas Kawerau
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


// attr()/text() v2
// eslint-disable-next-line
function attr(docOrElem,selector,attr,index){var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector);return elem?elem.getAttribute(attr):null}function text(docOrElem,selector,index){var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector);return elem?elem.textContent:null}

function detectWeb(doc, url) {
	var regex = new RegExp("\\/r\\/[a-z\\d]+\\/comments\\/");
	if (regex.test(url)) {
		return 'forumPost';
	}
	else if (getSearchResults(doc, true)) {
		return 'multiple';
	}
	return false;
}

function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = ZU.xpath(doc, '//a[div/h3]');
	for (let row of rows) {
		var href = row.href + '.json';
		var title = ZU.trimInternal(row.textContent);
		if (!href || !title) continue;
		if (checkOnly) return true;
		found = true;
		items[href] = title;
	}

	return found ? items : false;
}

function doWeb(doc, url) {
	var jsonUrl = url.split("?")[0] + '.json';
	var commentRegex = new RegExp("\\/r\\/[a-z\\d]+\\/comments\\/[a-z\\d]+\\/[a-z\\d_]+\\/[a-z\\d]+\\/");
	if (detectWeb(doc, url) == "multiple") {
		Zotero.selectItems(getSearchResults(doc, false), function (items) {
			if (!items) {
				return;
			}
			var articles = [];
			for (var i in items) {
				articles.push(i);
			}
			ZU.doGet(articles, scrape);
		});
	}
	else if (detectWeb(doc, url) == "forumPost" && commentRegex.test(url)) {
		ZU.doGet(jsonUrl, scrapeComment);
	}
	else {
		ZU.doGet(jsonUrl, scrape);
	}
}


function scrape(text) {
	var newItem = new Zotero.Item("forumPost");
	var redditJson = JSON.parse(text);
	var redditData = redditJson[0].data.children[0].data;
	newItem.title = redditData.title;
	newItem.creators.push(ZU.cleanAuthor(redditData.author, "author", true));
	newItem.url = 'www.reddit.com' + redditData.permalink;
	var postDate = new Date(redditData.created_utc * 1000);
	newItem.date = postDate.toISOString();
	newItem.postType = "Reddit Post";
	newItem.forumTitle = 'r/' + redditData.subreddit;
	newItem.websiteTitle = "reddit.com";
	newItem.attachments.push({
		url: 'https://www.reddit.com' + redditData.permalink,
		title: "Reddit Post Snapshot",
		mimetype: "text/html"
	});
	newItem.complete();
}

function scrapeComment(text) {
	var newItem = new Zotero.Item("forumPost");
	var redditJson = JSON.parse(text);
	var parentData = redditJson[0].data.children[0].data;
	var redditData = redditJson[1].data.children[0].data;
	newItem.title = ZU.ellipsize(redditData.body, 20);
	newItem.creators.push(ZU.cleanAuthor(redditData.author, "author", true));
	newItem.url = 'www.reddit.com' + redditData.permalink;
	var postDate = new Date(redditData.created_utc * 1000);
	newItem.date = postDate.toISOString();
	newItem.postType = "Reddit Comment";
	newItem.forumTitle = 'r/' + redditData.subreddit;
	newItem.websiteTitle = "reddit.com";
	newItem.extra = 'Post URL: www.reddit.com' + parentData.permalink;
	newItem.attachments.push({
		url: 'https://www.reddit.com' + redditData.permalink,
		title: "Reddit Comment Snapshot",
		mimetype: "text/html"
	});
	newItem.complete();
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://www.reddit.com/search/?q=zotero",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://www.reddit.com/r/zotero/",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://www.reddit.com/",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://www.reddit.com/r/zotero/comments/j7ityb/zotero_ipad_bookmarklet_not_working/",
		"items": [
			{
				"itemType": "forumPost",
				"title": "Zotero iPad bookmarklet not working",
				"creators": [
					{
						"lastName": "cegmondiale",
						"creatorType": "author"
					}
				],
				"date": "2020-10-08T18:43:48.000Z",
				"forumTitle": "r/zotero",
				"postType": "Reddit Post",
				"url": "www.reddit.com/r/zotero/comments/j7ityb/zotero_ipad_bookmarklet_not_working/",
				"attachments": [
					{
						"title": "Reddit Post Snapshot",
						"mimetype": "text/html"
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
		"url": "https://www.reddit.com/r/zotero/comments/j7ityb/zotero_ipad_bookmarklet_not_working/g88zfcp/",
		"items": [
			{
				"itemType": "forumPost",
				"title": "I use the exact same…",
				"creators": [
					{
						"lastName": "lukelbd93",
						"creatorType": "author"
					}
				],
				"date": "2020-10-09T20:07:37.000Z",
				"extra": "Post URL: www.reddit.com/r/zotero/comments/j7ityb/zotero_ipad_bookmarklet_not_working/",
				"forumTitle": "r/zotero",
				"postType": "Reddit Comment",
				"url": "www.reddit.com/r/zotero/comments/j7ityb/zotero_ipad_bookmarklet_not_working/g88zfcp/",
				"attachments": [
					{
						"title": "Reddit Comment Snapshot",
						"mimetype": "text/html"
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
