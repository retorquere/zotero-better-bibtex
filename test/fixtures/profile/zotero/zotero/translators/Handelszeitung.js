{
	"translatorID": "cfbb3e2c-8292-43d0-86d5-e457399107de",
	"label": "Handelszeitung",
	"creator": "ibex",
	"target": "^https?://((www\\.)?(handelszeitung|bilanz|stocks)\\.ch/.)",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2016-10-31 18:41:26"
}

/*
	Handelszeitung Translator - Parses Handelszeitung and Bilanz articles
	and creates Zotero-based metadata.
	Copyright (C) 2011 ibex

	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
	GNU General Public License for more details.

	You should have received a copy of the GNU General Public License
	along with this program. If not, see <http://www.gnu.org/licenses/>.
*/


/* Zotero API */
function detectWeb(doc, url) {
	//Z.debug("ibex detectWeb URL = " + url);
	var classes = doc.body.className;
	if (classes.indexOf("page-type-article")>-1) {
		return "newspaperArticle";
	}
	if (getSearchResults(doc, true)) {
		return "multiple";
	}
}

function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = ZU.xpath(doc, '//dl[contains(@class, "search-results")]/dt/a|//div[@id="main-content"]//div[contains(@class, "views-row")]//h2/a');
	for (var i=0; i<rows.length; i++) {
		var href = rows[i].href;
		var title = ZU.trimInternal(rows[i].textContent);
		if (!href || !title) continue;
		//distinguish article urls from dossiers urls
		//by looking at the slashes in the url
		//e.g. dossier: http://www.handelszeitung.ch/die-enthuellungen-der-panama-papers
		//e.g. article: http://www.handelszeitung.ch/unternehmen/technologie/google-drive-startschuss-fuer-den-online-speicher
		var slash = href.indexOf("/", 10);
		var slash2 = href.indexOf("/", slash+1);
		if (slash2 == -1) continue;
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
				// Bildergalerien are not supported - don't show them in the results
				if (i.search(/\/bildergalerie\//) != -1) {
					continue;
				}
				articles.push(i);
			}
			ZU.processDocuments(articles, scrape);
		});
	} else {
		scrape(doc, url);
	}
}


/* Zotero API */
function scrape(doc, url) {
	//Z.debug("ibex scrape URL = " + doc.location.href);

	var newItem = new Z.Item('newspaperArticle');
	newItem.url = url;
	var title = ZU.xpathText(doc, '//div[contains(@class, "field field-title")]/h1');
	if (title) {
		newItem.title = ZU.trimInternal(title);
	}
	newItem.shortTitle = null;

	var abstract = ZU.xpathText(doc, '//div[contains(@class, "field-article-lead")]//p[@class="lead"]');
	if (abstract) {
		newItem.abstractNote = ZU.trimInternal(abstract);
	}

	var date = ZU.xpathText(doc, '//div[contains(@class, "region-middle")]/div[contains(@class, "field-publish-date") or contains(@class, "field-update-info")]|//span[@class="date-display-single"]');
	if (date) {
		newItem.date = ZU.strToISO(date.replace(/\|.*$/, ''));
	}

	if (url.indexOf('handelszeitung.ch') != -1) {
		newItem.publicationTitle = 'Handelszeitung';
		newItem.ISSN = "1422-8971";
	} else if (url.indexOf('bilanz.ch') != -1) {
		newItem.publicationTitle = 'Bilanz';
		newItem.ISSN = "1022-3487";
	} else if (url.indexOf('stocks.ch') != -1) {
		newItem.publicationTitle = 'Stocks';
		newItem.ISSN = "1424-7739";
	}

	newItem.language = "de-CH";

	var section = ZU.xpath(doc, '//div[' + containingClass('node-type-article') + ']//div[' + containingClass('channel') + ']');
	if (section.length > 0) {
		newItem.section = ZU.trimInternal(section[0].textContent);
	}
	else newItem.section = ZU.xpathText(doc, '//div[@class="menu-content"]//li[contains(@class, "expanded")]/a')

	// Use the CSS media print stylesheet for the snapshot.
	//switchDomMediaPrint(doc);
	newItem.attachments.push({title: newItem.publicationTitle + " Article Snapshot", document: doc});

	newItem.complete();
}


/**
 * Generates a partial xpath expression that matches an element whose 'class' attribute
 * contains the given CSS className. So to match &lt;div class='foo bar'&gt; you would
 * say "//div[" + containingClass("foo") + "]".
 *
 * Reference: http://pivotallabs.com/users/alex/blog/articles/427-xpath-css-class-matching
 *
 * @param {String} className CSS class name
 * @return {String} XPath fragment
 */
function containingClass(className) {
  return "contains(concat(' ',normalize-space(@class),' '),' " + className + " ')";
}

/**
 * Manipulates the DOM document tree by switching CSS media from screen to print.
 *
 * @param {element} doc Document DOM tree (Remember: Javascript parameters are passed by reference)
 * @return {element} document Document DOM tree
 */
function switchDomMediaPrint(doc) {
	var nodes = doc.getElementsByTagName('link');
	for (var i = 0; i < nodes.length; i++) {
		//Z.debug("ibex media before = " + nodes[i].getAttribute('media'));
		if (nodes[i].getAttribute('media') == 'print') {
			nodes[i].setAttribute('media', 'all');
		} else if (nodes[i].getAttribute('media') == 'screen') {
			nodes[i].setAttribute('media', 'DISABLE');
		}
		//Z.debug("ibex media after = " + nodes[i].getAttribute('media'));
	}
	return doc;
}
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.bilanz.ch/unternehmen/google-kauft-daily-deal",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Google kauft Daily Deal",
				"creators": [],
				"date": "2011-09-19",
				"ISSN": "1022-3487",
				"abstractNote": "Gutscheine für Google: Der Online-Riese hat das Portal Daily Deal übernommen. Das Unternehmen verkauft in der Schweiz, in Deutschland und in Österreich Rabattgutscheine im Internet.",
				"language": "de-CH",
				"libraryCatalog": "Handelszeitung",
				"publicationTitle": "Bilanz",
				"section": "Unternehmen",
				"url": "http://www.bilanz.ch/unternehmen/google-kauft-daily-deal",
				"attachments": [
					{
						"title": "Bilanz Article Snapshot"
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
		"url": "http://www.handelszeitung.ch/unternehmen/google-kauft-daily-deal",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Google kauft Daily Deal",
				"creators": [],
				"date": "2011-09-19",
				"ISSN": "1422-8971",
				"abstractNote": "Gutscheine für Google: Der Online-Riese hat das Portal Daily Deal übernommen. Das Unternehmen verkauft in der Schweiz, in Deutschland und in Österreich Rabattgutscheine im Internet.",
				"language": "de-CH",
				"libraryCatalog": "Handelszeitung",
				"publicationTitle": "Handelszeitung",
				"section": "Unternehmen",
				"url": "http://www.handelszeitung.ch/unternehmen/google-kauft-daily-deal",
				"attachments": [
					{
						"title": "Handelszeitung Article Snapshot"
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
		"url": "http://www.handelszeitung.ch/unternehmen/technologie/google-drive-startschuss-fuer-den-online-speicher",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Google Drive: Startschuss für den Online-Speicher",
				"creators": [],
				"date": "2012-04-24",
				"ISSN": "1422-8971",
				"abstractNote": "Lange erwartet, jetzt da: Google hat sein virtuelles Laufwerk vorgestellt. Drive tritt in Konkurrenz mit Systemen wie Dropbox, iCloud und SkyDrive, kommt jedoch reichlich spät.",
				"language": "de-CH",
				"libraryCatalog": "Handelszeitung",
				"publicationTitle": "Handelszeitung",
				"section": "Unternehmen",
				"url": "http://www.handelszeitung.ch/unternehmen/technologie/google-drive-startschuss-fuer-den-online-speicher",
				"attachments": [
					{
						"title": "Handelszeitung Article Snapshot"
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
		"url": "http://www.bilanz.ch/search/site/google",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://www.handelszeitung.ch/search/site/argentinien",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://www.handelszeitung.ch/die-enthuellungen-der-panama-papers",
		"items": "multiple"
	}
]
/** END TEST CASES **/
