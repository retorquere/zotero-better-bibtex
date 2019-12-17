{
	"translatorID": "a326fc49-60c2-405b-8f44-607e5d18b9ad",
	"label": "Code4Lib Journal",
	"creator": "Michael Berkowitz",
	"target": "^https?://journal\\.code4lib\\.org/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2018-08-23 11:15:21"
}

// attr()/text() v2
function attr(docOrElem,selector,attr,index){var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector);return elem?elem.getAttribute(attr):null;}function text(docOrElem,selector,index){var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector);return elem?elem.textContent:null;}


function detectWeb(doc, url) {
	if (getSearchResults(doc, true)) {
		return "multiple";
	} else if (text(doc, 'h1[class="articletitle"]')) {
		return "journalArticle";
	}
}


function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = doc.querySelectorAll('div.article>h2.articletitle>a');
	for (let i=0; i<rows.length; i++) {
		let href = rows[i].href;
		let title = ZU.trimInternal(rows[i].textContent);
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
			if (!items) {
				return true;
			}
			var articles = [];
			for (var i in items) {
				articles.push(i);
			}
			ZU.processDocuments(articles, scrape);
		});
	} else {
		scrape(doc, url);
	}
}


function scrape(doc, url){
	var newItem = new Zotero.Item("journalArticle");
	newItem.repository = "Code4Lib Journal";
	newItem.publicationTitle = "The Code4Lib Journal";
	newItem.ISSN = "1940-5758";
	newItem.url = url;
	newItem.title = ZU.xpathText(doc, '//div[@class="article"]/h1[@class="articletitle"]');
	newItem.abstractNote = ZU.xpathText(doc, '//div[@class="article"]/div[@class="abstract"]/p');
	
	var issdate = ZU.xpathText(doc, '//p[@id="issueDesignation"]');
	newItem.issue = issdate.match(/([^,]*)/)[0].match(/\d+/)[0];
	newItem.date = issdate.match(/,\s+(.*)$/)[1];
	
	var axpath = '//div[@class="article"]/div[@class="entry"]/p[1]';
	var authors = ZU.xpathText(doc, axpath).replace(/By\s+/i, "");
	var next_author = authors.split(/\s*and\s*|\s*,\s*/);
	for (var i in next_author) {
		newItem.creators.push(Zotero.Utilities.cleanAuthor(next_author[i], "author"));
	}
	
	newItem.attachments.push({
		document: doc,
		title: "Code4Lib Journal Snapshot",
		mimeType: "text/html"
	});
	newItem.complete();
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://journal.code4lib.org/articles/5001",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"firstName": "Joe",
						"lastName": "Ryan",
						"creatorType": "author"
					},
					{
						"firstName": "Josh",
						"lastName": "Boyer",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Code4Lib Journal Snapshot",
						"mimeType": "text/html"
					}
				],
				"publicationTitle": "The Code4Lib Journal",
				"ISSN": "1940-5758",
				"url": "http://journal.code4lib.org/articles/5001",
				"title": "GroupFinder: A Hyper-Local Group Study Coordination System",
				"abstractNote": "GroupFinder is a system designed to help users working in groups let each other know where they are, what they are working on, and when they started. Students can use the GroupFinder system to arrange meetings within the library.  GroupFinder also works with the phpScheduleIt room reservation system used to reserve group study rooms at the D.H. Hill Library at NCSU.  Information from GroupFinder is presented on the GroupFinder web site, the mobile web site and on electronic bulletin boards within the library.  How GroupFinder was developed from the initial concept through the implementation is covered in the article.",
				"issue": "13",
				"date": "2011-04-11",
				"libraryCatalog": "Code4Lib Journal",
				"accessDate": "CURRENT_TIMESTAMP",
				"shortTitle": "GroupFinder"
			}
		]
	},
	{
		"type": "web",
		"url": "http://journal.code4lib.org/?s=zotero",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://journal.code4lib.org/issues/issue14",
		"items": "multiple"
	}
]
/** END TEST CASES **/
