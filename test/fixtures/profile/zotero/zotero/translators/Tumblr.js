{
	"translatorID": "552cdac3-f130-4763-a88e-8e74b92dcb1b",
	"translatorType": 4,
	"label": "Tumblr",
	"creator": "febrezo",
	"target": "^https?://[^/]+\\.tumblr\\.com/",
	"minVersion": "3.0",
	"maxVersion": null,
	"priority": 100,
	"inRepository": true,
	"browserSupport": "gcsibv",
	"lastUpdated": "2021-06-02 15:35:00"
}

/*
	Tumblr Translator
	Copyright (C) 2020 Félix Brezo, felixbrezo@gmail.com
	
	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.
	
	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU General Public License for more details.
	
	You should have received a copy of the Affero GNU General Public License
	along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/


function detectWeb(doc, url) {
	if (url.match(/^https?:\/\/www\./)) {
		// only try to translate subdomain blogs
		return false;
	}
	if (url.includes('/post/')) {
		return "blogPost";
	}
	if (url.includes('/search/') && getSearchResults(doc, true)) {
		return "multiple";
	}
	return "webpage";
}

function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = doc.querySelectorAll('#posts article');
	for (let row of rows) {
		let href = row.querySelector('a.post-notes').href;
		let title = ZU.trimInternal(text(row, '.body-text p') || text(row, 'a.tag-link'));
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
	var resourceType = detectWeb(doc, url);
	// Creating the item
	var newItem = new Zotero.Item(resourceType);

	var urlParts = url.split('/');
	
	var tmpDate;
	if (resourceType == "blogPost") {
		newItem.blogTitle = ZU.xpathText(doc, "//meta[@property='og:site_name']/@content");
		newItem.title = ZU.xpathText(doc, "//meta[@property='og:title']/@content");
		tmpDate = ZU.xpathText(doc, '(//div[@class="date-note-wrapper"]/a)[1]');
		if (!tmpDate) {
			tmpDate = ZU.xpathText(doc, '//div[@class="date"]/text()');
		}
		newItem.date = ZU.strToISO(tmpDate);
	}
	else {
		newItem.title = ZU.xpathText(doc, "//title/text()");
		newItem.websiteTitle = ZU.xpathText(doc, "//meta[@name='description']/@content");
	}
	var tmpAuthor = urlParts[2].split(".")[0];
	if (tmpAuthor) {
		newItem.creators.push({ lastName: tmpAuthor, creatorType: "author", fieldMode: 1 });
	}
	newItem.websiteType = "Tumblr";
	newItem.url = url;
	
	// Adding the attachment
	newItem.attachments.push({
		title: "Tumblr Snapshot",
		mimeType: "text/html",
		url: url
	});
	
	newItem.complete();
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://blogdeprogramacion.tumblr.com/post/167688373297/c%C3%B3mo-integrar-opencv-y-python-en-windows",
		"items": [
			{
				"itemType": "blogPost",
				"title": "¿Cómo integrar OpenCV y Python en Windows?",
				"creators": [
					{
						"lastName": "blogdeprogramacion",
						"creatorType": "author",
						"fieldMode": 1
					}
				],
				"date": "2017-11-19",
				"blogTitle": "Blog de Programacion y Tecnologia",
				"url": "https://blogdeprogramacion.tumblr.com/post/167688373297/c%C3%B3mo-integrar-opencv-y-python-en-windows",
				"websiteType": "Tumblr",
				"attachments": [
					{
						"title": "Tumblr Snapshot",
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
		"url": "https://blogdeprogramacion.tumblr.com/",
		"items": [
			{
				"itemType": "webpage",
				"title": "Blog de Programacion y Tecnologia",
				"creators": [
					{
						"lastName": "blogdeprogramacion",
						"creatorType": "author",
						"fieldMode": 1
					}
				],
				"url": "https://blogdeprogramacion.tumblr.com/",
				"websiteTitle": "Blog de programacion, tecnologia, electronica, tutoriales, informatica y sistemas computacionales.",
				"websiteType": "Tumblr",
				"attachments": [
					{
						"title": "Tumblr Snapshot",
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
		"url": "https://montereybayaquarium.tumblr.com/search/turtle",
		"items": "multiple"
	}
]
/** END TEST CASES **/
