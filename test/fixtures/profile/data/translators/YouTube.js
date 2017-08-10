{
	"translatorID": "d3b1d34c-f8a1-43bb-9dd6-27aa6403b217",
	"label": "YouTube",
	"creator": "Sean Takats, Michael Berkowitz, Matt Burton and Rintze Zelle",
	"target": "^https?://([^/]+\\.)?youtube\\.com/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsbv",
	"lastUpdated": "2015-09-18 21:24:14"
}

function detectWeb(doc, url) {
	if (url.search(/\/watch\?(?:.*)\bv=[0-9a-zA-Z_-]+/) != -1) {
		return "videoRecording";
	}

	//Search results
	if (getSearchResults(doc, true)) {
		return "multiple";
	}
}

function getSearchResults(doc, checkOnly) {
	var container = doc.getElementById('results') || doc.getElementById('browse-items-primary');
	if (!container) return false;

	var links = container.getElementsByClassName('yt-uix-tile-link');

	var items = {},
		found = false;
	for (var i = 0, n = links.length; i < n; i++) {
		var title = ZU.trimInternal(links[i].textContent);
		var link = links[i].href;
		if (!title || !link) continue;

		if (checkOnly) return true;

		found = true
		items[link] = title;
	}
	return found ? items : false;
}

function doWeb(doc, url) {
	if (detectWeb(doc, url) != 'multiple') {
		scrape(doc, url);
	} else {
		Zotero.selectItems(getSearchResults(doc), function(items) {
			if (!items) return true;

			var ids = [];
			for (var i in items) {
				ids.push(i);
			}
			ZU.processDocuments(ids, scrape);
		});
	}
}

function scrape(doc, url) {
	var newItem = new Zotero.Item("videoRecording");
	//grab the JSON in the header of the page and remove JS code
	var data = ZU.xpathText(doc, '//script[contains(text(), "ytplayer.config")]');
	data = data.match(/ytplayer\.config\s*=(.+?);\s*ytplayer\.load/)[1];
	//Z.debug(data)
	try {
		var obj = JSON.parse(data);
	} catch (e) {
		Zotero.debug("JSON parse error trying to parse: " + data);
		throw e;
	}
	
	var args = obj.args;
	if (!args.title) {
		Z.debug(args);
		throw new Error("args.title is missing");
	}
	
	newItem.title = args.title;
	if (args.keywords) {
		Z.debug(args.keywords);
		var keywords = args.keywords.split(/\s*,\s*/);
		for (var i = 0; i < keywords.length; i++) {
			newItem.tags.push(Zotero.Utilities.trimInternal(keywords[i]));
		}
	}

	newItem.date = ZU.xpathText(doc, '//meta[@itemProp="datePublished"]/@content');

	var author;
	if (author = args.author) {
		author = {"lastName": author, "creatorType": "author", "fieldMode": 1 }
		newItem.creators.push(author);
	}

	newItem.url = url;
	var runningTime;
	if (runningTime = args.length_seconds) {
		newItem.runningTime = runningTime + " seconds";
	}
	//the description is not in the JSON
	var description;
	if (description = doc.getElementById("watch-description-text")) {
		newItem.abstractNote = ZU.cleanTags(description.innerHTML);
	}
	newItem.complete();
}
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.youtube.com/results?search_query=zotero&oq=zotero&aq=f&aqi=g4&aql=&gs_sm=3&gs_upl=60204l61268l0l61445l6l5l0l0l0l0l247l617l1.2.1l4l0",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://www.youtube.com/watch?v=pq94aBrc0pY",
		"items": [
			{
				"itemType": "videoRecording",
				"title": "Zotero Intro",
				"creators": [
					{
						"lastName": "Zoteron",
						"creatorType": "author",
						"fieldMode": 1
					}
				],
				"date": "2007-01-01",
				"abstractNote": "Zotero is a free, easy-to-use research tool that helps you gather and organize resources (whether bibliography or the full text of articles), and then lets you to annotate, organize, and share the results of your research. It includes the best parts of older reference manager software (like EndNote)—the ability to store full reference information in author, title, and publication fields and to export that as formatted references—and the best parts of modern software such as del.icio.us or iTunes, like the ability to sort, tag, and search in advanced ways. Using its unique ability to sense when you are viewing a book, article, or other resource on the web, Zotero will—on many major research sites—find and automatically save the full reference information for you in the correct fields.",
				"libraryCatalog": "YouTube",
				"runningTime": "172 seconds",
				"url": "https://www.youtube.com/watch?v=pq94aBrc0pY",
				"attachments": [],
				"tags": [
					"2.0",
					"Center",
					"George",
					"History",
					"Mason",
					"Media",
					"Mozilia",
					"New",
					"Reference",
					"Research",
					"University",
					"Web",
					"Zotero",
					"and",
					"bibliography",
					"for"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.youtube.com/playlist?list=PL793CABDF042A9514",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://www.youtube.com/user/Zoteron",
		"items": "multiple"
	}
]
/** END TEST CASES **/