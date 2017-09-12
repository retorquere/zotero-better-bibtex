{
	"translatorID": "09e8f8a2-a7e6-4430-b86c-47c99ca40a38",
	"label": "Hispanic-American Periodical Index",
	"creator": "Sebastian Karcher",
	"target": "^https?://hapi\\.ucla\\.edu",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsb",
	"lastUpdated": "2013-12-10 17:20:41"
}

function detectWeb(doc, url) {
	if (url.indexOf("search/detail.php") != -1) return "journalArticle"
	else if (url.indexOf("search/results.php") != -1) return "multiple";
}

function associateData(newItem, dataTags, field, zoteroField) {
	if (dataTags[field]) {
		newItem[zoteroField] = dataTags[field];
	}
}

function scrape(doc, url) {
	var dataTags = new Object();
	var newItem = new Zotero.Item("journalArticle");
	var Date = "";
	var fieldTitles = ZU.xpath(doc, './tr/td[1]');
	var fieldContents = ZU.xpath(doc, './tr/td[2]');

	for (i = 0, j = 0; i < fieldContents.length && j < fieldTitles.length; i++, j++) {
		var label = fieldTitles[j].textContent.trim().replace(/:$/, "");
		var content = fieldContents[i].textContent.trim();
		Z.debug(label + ": " + content);
		if (label == "Volume/Issue") {
			var volume = content.match(/(.+):/)[1]
			var issue = content.match(/:(.+)/)[1]
			newItem.volume = volume;
			newItem.issue = issue;
		} else if (label == "Month" || label == "Year") {
			Date += " " + content;
		} else if (label == "Subjects") {
			var tags = content.split(/\n/)
			for (var tag in tags) {
				newItem.tags.push(tags[tag].trim());
			}
		} else if (label == "Additional Descriptors") {
			var tags = content.split(/\s*,\s*/);
			for (var tag in tags) {
				newItem.tags.push(tags[tag].trim());
			}
		} else if (label == "Author") {
			var authors = content.split(/\s*,\s*|\sand\s/);
			for (var a in authors) {
				newItem.creators.push(ZU.cleanAuthor(authors[a], "author"));
			}
		}

		dataTags[label] = content;
	}
	newItem.date = Date;
	associateData(newItem, dataTags, "Title", "title");
	associateData(newItem, dataTags, "Pages", "pages");
	associateData(newItem, dataTags, "Volume", "volume");
	associateData(newItem, dataTags, "Issue", "issue");
	associateData(newItem, dataTags, "Journal", "publicationTitle");
	newItem.complete();
}

function bibNode(doc, url) {
	//points scrape to the right node
	var node = ZU.xpath(doc, '//table[@class="tbl_results"]/tbody');
	scrape(node, url);
}

function doWeb(doc, url) {

	var articles = new Array();
	var items = {};
	if (detectWeb(doc, url) == "multiple") {
		
		/* There are two different search results/lists views: brief and full
		For the brief view we follow links to item displays. For the full view
		we scrape right from the page - we need to slight addjust the node where we look
		so the same scrape function works for multiples and singles */
		
		if (ZU.xpathText(doc, '//tbody/tr/td/h4/a')) {
			//Brief Display
			var titles = doc.evaluate('//h4/a', doc, null, XPathResult.ANY_TYPE, null);
			var next_title;
			while (next_title = titles.iterateNext()) {
				items[next_title.href] = next_title.textContent;
			}

			Zotero.selectItems(items, function (items) {
				if (!items) {
					return true;
				}
				for (var i in items) {
					articles.push(i);
				}
				Zotero.Utilities.processDocuments(articles, bibNode);
			});
		} else {
			//Full Display
			var titles = ZU.xpath(doc, '//tbody/tr/td/h4');
			var number = ZU.xpath(doc, '//tr[@valign="top"]/td/input[@type="checkbox"]/@value')
			for (i = 0, j = 0; i < number.length && j < titles.length; i++, j++) {
				items[number[i].textContent] = titles[j].textContent;
			}
			Zotero.selectItems(items, function (items) {
				if (!items) {
					return true;
				}
				for (i in items) {
					var xpath = '//tr[@valign="top"]/td/input[@value="' + i + '"]/preceding-sibling::table/tbody'
					var node = ZU.xpath(doc, xpath);
					scrape(node, url);
				}
			});
		}
	} else {
		bibNode(doc, url);
	}
}/** BEGIN TEST CASES **/
var testCases = []
/** END TEST CASES **/