{
	"translatorID": "570d4c35-a16d-48f9-aa73-6161d067da79",
	"label": "Integrum",
	"creator": "Sebastian Karcher",
	"target": "^https?://aafnet\\.integrum\\.ru/",
	"minVersion": "3",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2017-12-05 03:14:12"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2017 Sebastian Karcher

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
function attr(docOrElem,selector,attr,index){var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector);return elem?elem.getAttribute(attr):null;}function text(docOrElem,selector,index){var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector);return elem?elem.textContent:null;}


function detectWeb(doc, url) {
	if (ZU.xpath(doc, '//td[dt[a[@class="aftitle"]]]').length) {
		return "multiple";
	} else {
		var articleframe = ZU.xpath(doc, '//frame[@name="fb"]');
		if (articleframe.length) {
			return "magazineArticle";
		}
	}
}


function doWeb(doc, url) {
	if (detectWeb(doc, url) == "multiple") {
		var rows = ZU.xpath(doc, '//td[dt[a[@class="aftitle"]]]');
		var items = {};
		for (let i = 0; i < rows.length; i++) {
			var infoArray = [];

			var title = ZU.xpathText(rows[i], './dt/a[@class="aftitle"]');
			infoArray.push("Title: " + title);
			// Z.debug(title);
			var info = ZU.xpathText(rows[i], './dd/div[@class="docs"]/text()');
			infoArray.push("\nInfo: " + ZU.trimInternal(info));
			// Z.debug(info);
			var link = ZU.xpathText(rows[i], './dt/a[@class="aftitle"]/@href');
			// Z.debug(link)
			infoArray.push("\nLink: " + link);
			// Z.debug(infoArray);
			items[infoArray] = title;

		}

		Zotero.selectItems(items, function(items) {
			// Z.debug(items)
			if (!items) {
				return true;
			}
			var articles = [];
			for (var i in items) {
				// Z.debug(i)
				articles.push(i);
			}
			for (let i = 0; i < articles.length; i++) {
				scrapeMultiples(articles[i]);
			}
		});
	} else {
		scrapeFrames(doc, url);
	}
}

function scrapeMultiples(article) {
	// Z.debug(articles)
	var item = new Z.Item('magazineArticle');
	var title = article.match(/Title: (.+?),\n/)[1];
	// Z.debug(title)
	item.title = fixCasing(title);
	var info = article.match(/Info: (.+?),\n/)[1];
	// Z.debug(info);
	item.publicationTitle = info.match(/^(.+?);/)[1].trim();
	var date = info.match(/;(.+);/)[1];
	item.date = ISOdate(date);
	item.issue = info.match(/;.+?;(.+)$/)[1];
	var link = article.match(/Link: (.+)/)[1];
	// Z.debug(link);
	ZU.processDocuments(link, function(doc) {
		var frameurl = ZU.xpathText(doc, '//frame[@name="fb"]/@src');
		// Z.debug(frameurl)
		item.attachments.push({
			url: frameurl,
			title: "Integrum Snapshot",
			mimeType: "text/html"
		})
		item.complete()
	})

}

function ISOdate(date) {
	if (date) {
		return date.replace(/(\d+)\.(\d+)\.(\d+)/, "$3-$2-$1");
	} else return null;
}

function fixCasing(string) {
	if (string && string.toUpperCase() == string) {
		return ZU.capitalizeTitle(string.toLowerCase(), true);
	} else return string;
}

function scrapeFrames(doc, url) {
	var framedoc = ZU.xpath(doc, '//frame[@name="fb"]')[0].contentDocument;
	var frametitle = ZU.xpath(doc, '//frame[@name="ft"]')[0].contentDocument;
	var item = new Z.Item('magazineArticle');
	item.title = fixCasing(text(framedoc, 'title'));
	item.date = ISOdate(attr(framedoc, 'meta[name="_YR"]', 'content'));
	item.publicationTitle = attr(framedoc, 'meta[name="_SO"]', 'content');
	item.issue = attr(framedoc, 'meta[name="_NR"]', 'content');
	if (!item.date || !item.publicationTitle || !item.issue) {
		var info = ZU.xpath(frametitle, '//body/table/tbody/tr[4]//tr[@class="maintxt"]//td[a[contains(@href, "ia5.aspx?")]]');

		var date = ZU.xpathText(info, './a[contains(@href, "dis=")]/@href');
		if (date && !item.date) {
			date = date.match(/dis=(\d+)/)[1];
			item.date = date.replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3");
		}
		infoParts = info[0].textContent.split(/\n\s*:\s*/);
		// Z.debug(infoParts)
		if (infoParts.length == 4) {
			if (!item.publicationTitle) {
				item.publicationTitle = infoParts[1];
			}
			if (!item.issue) {
				item.issue = infoParts[3].match(/\d+$/)[0];
			}
			if (!item.date) {
				item.date = infoParts[2];
			}
		}
	}
	item.attachments.push({
		document: framedoc,
		title: "Integrum Snapshot"
	});
	item.complete();
}

/** BEGIN TEST CASES **/
var testCases = []
/** END TEST CASES **/
