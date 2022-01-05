{
	"translatorID": "c3edb423-f267-47a1-a8c2-158c247f87c2",
	"label": "Common-Place",
	"creator": "Frederick Gibbs, Philipp Zumstein",
	"target": "^https?://(www\\.)?(common-place\\.org/|common-place-archives\\.org/)",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2016-09-10 09:34:34"
}

function detectWeb(doc, url) {
	if (getSearchResults(doc, true)) {//multiples works only on search pages
		return "multiple";
	} else if (doc.body.className.indexOf("single-article")>-1 || url.indexOf("common-place-archives.org")>-1) {
		return "journalArticle";
	}
}


function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = ZU.xpath(doc, '//h3[contains(@class, "article-title")]/a|//h2/a');
	for (var i=0; i<rows.length; i++) {
		var href = rows[i].href;
		var title = ZU.trimInternal(rows[i].textContent);
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

function scrape(doc, url) {
	var newItem = new Zotero.Item("journalArticle");
	newItem.publicationTitle = "Common-Place";
	newItem.url = url;
	
	if (doc.body.className.indexOf("single-article")>-1) {
		newItem.title = ZU.xpathText(doc, '//article/h1');
		var author = ZU.xpathText(doc, '//article/h1/following-sibling::p');
		if (author) {
			newItem.creators.push(ZU.cleanAuthor(author, "author"));
		}
		newItem.abstractNote = ZU.xpathText(doc, '//article/div[contains(@class, "entry-excerpt")]');
		newItem.date = ZU.strToISO(ZU.trimInternal(ZU.xpathText(doc, '//article/ol[contains(@class, "breadcrumb")]/li/text()')));
		var volno = ZU.xpathText(doc, '//article/ol[contains(@class, "breadcrumb")]/li[1]/a');
		var m = volno.match(/Vol\. (\d+) No\. (\d+)/);
		if (m) {
			newItem.volume = m[1];
			newItem.issue = m[2];
		}
	
	} else {
		//get issue year and month
		//these will determine what xpaths we use for title and author
		//e.g. <a href="/vol-12/no-01/">vol. 12 · no. 1 · October 2011</a>
		var dateRe = /<a href="\/vol-(\d+)\/no-(\d+)\/">([^<]*)<\/a>/;
		var m = dateRe.exec(ZU.trimInternal(doc.getElementsByTagName("body")[0].innerHTML));
		if (m) {
			newItem.volume = m[1];
			newItem.issue = m[2];
			var n = m[3].match(/· ([\w\s]+)$/);
			if (n) {
				newItem.date = ZU.strToISO(n[1]);
			}
		}
		
		var author = ZU.xpathText(doc, '//div[@id="content"]/p/span[1]');
		var title = ZU.xpathText(doc, '//div[@id="content"]/p/span[2]');
		if (author) {
			//determine if we have a book review
			// if so, get the publication information
			if (author.indexOf("Review by") != -1 ) {
				title = String.concat("Review of ", title);
				author = author.substring(10);
			} 
			newItem.creators.push(ZU.cleanAuthor(author, "author"));
		} else { //we have older issue
			//check if we are on a review
			var review = ZU.xpathText(doc, '/html/body/table/tbody/tr/td[2]/p[2]');
			if (review.indexOf("Review") != -1) {
				title = ZU.xpathText(doc, '/html/body/table/tbody/tr/td[2]/p/i');
				title = "Review of " + title; 
				author = review.substring(10);
			} else { //for articles
				title = ZU.xpathText(doc, '/html/body/table/tbody/tr/td[2]/p/b');
				author = ZU.xpathText(doc, '/html/body/table/tbody/tr/td[2]/p[1]').split(/\n/)[1];;	
			}
			newItem.creators.push(ZU.cleanAuthor(author, "author"));
		}
		newItem.title = title;
	}
	
	newItem.attachments.push({document:doc, title:doc.title});
	newItem.complete();
}
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.common-place-archives.org/vol-12/no-01/tales/",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Looking for Limbs in all the Right Places",
				"creators": [
					{
						"firstName": "Megan Kate",
						"lastName": "Nelson",
						"creatorType": "author"
					}
				],
				"date": "2011-10",
				"issue": "01",
				"libraryCatalog": "Common-Place",
				"publicationTitle": "Common-Place",
				"url": "http://www.common-place-archives.org/vol-12/no-01/tales/",
				"volume": "12",
				"attachments": [
					{
						"title": "Common-place: Tales from the Vault"
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
		"url": "http://www.common-place-archives.org/vol-03/no-03/mccaffrey/",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "American Originals",
				"creators": [
					{
						"firstName": "Katherine Stebbins",
						"lastName": "McCaffrey",
						"creatorType": "author"
					}
				],
				"date": "2003-04",
				"issue": "03",
				"libraryCatalog": "Common-Place",
				"publicationTitle": "Common-Place",
				"url": "http://www.common-place-archives.org/vol-03/no-03/mccaffrey/",
				"volume": "03",
				"attachments": [
					{
						"title": "Common-place: American Originals"
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
		"url": "http://common-place.org/book/alive-with-the-sound-of-music/",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Alive with the Sound of Music",
				"creators": [
					{
						"firstName": "Douglas",
						"lastName": "Shadle",
						"creatorType": "author"
					}
				],
				"date": "2008-04",
				"abstractNote": "Next to Stephen Foster, William Henry Fry was arguably the most important American composer working before the Civil War.",
				"issue": "3",
				"libraryCatalog": "Common-Place",
				"publicationTitle": "Common-Place",
				"url": "http://common-place.org/book/alive-with-the-sound-of-music/",
				"volume": "08",
				"attachments": [
					{
						"title": "Alive with the Sound of Music - Common-placeCommon-place: The Journal of early American Life"
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