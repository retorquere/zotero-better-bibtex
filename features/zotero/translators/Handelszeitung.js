{
	"translatorID": "cfbb3e2c-8292-43d0-86d5-e457399107de",
	"label": "Handelszeitung",
	"creator": "ibex",
	"target": "^https?://((www\\.)?(handelszeitung|bilanz|stocks)\\.ch/.)",
	"minVersion": "2.1.9",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2014-06-01 19:22:55"
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

/*
Reference URLs:
  Article: http://www.handelszeitung.ch/unternehmen/google-kauft-daily-deal
  Search: http://www.handelszeitung.ch/search/apachesolr_search/Google

  Article: http://www.bilanz.ch/unternehmen/google-kauft-daily-deal
  Search: http://www.bilanz.ch/search/apachesolr_search/Google

*/

/* Zotero API */
function detectWeb(doc, url) {
	//Z.debug("ibex detectWeb URL = " + url);
	if (doc.location.href.match(/\/search\//) && (ZU.xpath(doc, '//dl[contains(@class, "search-results")]').length > 0)) {
		return "multiple";
	} else if (doc.location.href.match(/./) && (ZU.xpath(doc, '//div[' + containingClass('node-type-article') + ']').length > 0)) {
		return "newspaperArticle";
	}
}

/* Zotero API */
function doWeb(doc, url) {
	//Z.debug("ibex doWeb URL = " + url);
	var urls = new Array();
	if (detectWeb(doc, url) == "multiple") {
		var items = ZU.getItemArray(doc, doc.getElementsByClassName('title'), 'http://.+/.+');
		if (!items || countObjectProperties(items) == 0) {
			return true;
		}
		// Bildergalerien are not supported - don't show them in the results
		for (var i in items) {
 			if (i.match(/\/bildergalerie\//)) {
 				delete items[i];
 			}
		}
		Zotero.selectItems(items, function (items) {
			if (!items) {
				return true;
			}
			for (var i in items) {
				urls.push(i);
			}
			Zotero.Utilities.processDocuments(urls, scrape);	
		});	
	} else {
	 scrape(doc, url);
	}
}

/* Zotero API */
function scrape(doc) {
	//Z.debug("ibex scrape URL = " + doc.location.href);

	var newItem = new Z.Item('newspaperArticle');
	newItem.url = doc.location.href;
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
		newItem.date = ZU.trimInternal(date.replace(/\|.*$/, ''));
	}

	if (doc.location.href.match('handelszeitung.ch')) {
		newItem.publicationTitle = 'Handelszeitung';
		newItem.ISSN = "1422-8971";
	} else if (doc.location.href.match('bilanz.ch')) {
		newItem.publicationTitle = 'Bilanz';
		newItem.ISSN = "1022-3487";
	} else if (doc.location.href.match('stocks.ch')) {
		newItem.publicationTitle = 'Stocks';
		newItem.ISSN = "1424-7739";
	}

	newItem.language = "de";

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

/*
 * There is no built-in function to count object properties which often are used as associative arrays.
 *
 * @param {Object} obj Associative array
 * @return {int} Number of object properties = ength of associative array
 */
function countObjectProperties(obj) {
	var size = 0;
	for (var key in obj) {
		if (obj.hasOwnProperty(key)) size++;
	}
	return size;
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
				"creators": [],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Bilanz Article Snapshot"
					}
				],
				"url": "http://www.bilanz.ch/unternehmen/google-kauft-daily-deal",
				"title": "Google kauft Daily Deal",
				"abstractNote": "Gutscheine für Google: Der Online-Riese hat das Portal Daily Deal übernommen. Das Unternehmen verkauft in der Schweiz, in Deutschland und in Österreich Rabattgutscheine im Internet.",
				"date": "19.09.2011",
				"publicationTitle": "Bilanz",
				"ISSN": "1022-3487",
				"language": "de",
				"section": "Unternehmen",
				"libraryCatalog": "Handelszeitung"
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.handelszeitung.ch/unternehmen/google-kauft-daily-deal",
		"items": [
			{
				"itemType": "newspaperArticle",
				"creators": [],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Handelszeitung Article Snapshot"
					}
				],
				"url": "http://www.handelszeitung.ch/unternehmen/google-kauft-daily-deal",
				"title": "Google kauft Daily Deal",
				"abstractNote": "Gutscheine für Google: Der Online-Riese hat das Portal Daily Deal übernommen. Das Unternehmen verkauft in der Schweiz, in Deutschland und in Österreich Rabattgutscheine im Internet.",
				"date": "19.09.2011",
				"publicationTitle": "Handelszeitung",
				"ISSN": "1422-8971",
				"language": "de",
				"section": "Unternehmen",
				"libraryCatalog": "Handelszeitung",
				"accessDate": "CURRENT_TIMESTAMP"
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.bilanz.ch/news/google-eroeffnet-online-speicher-google-drive",
		"items": [
			{
				"itemType": "newspaperArticle",
				"creators": [],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Bilanz Article Snapshot"
					}
				],
				"url": "http://www.bilanz.ch/news/google-eroeffnet-online-speicher-google-drive",
				"title": "Google eröffnet Online-Speicher Google Drive",
				"date": "24.04.2012",
				"publicationTitle": "Bilanz",
				"ISSN": "1022-3487",
				"language": "de",
				"libraryCatalog": "Handelszeitung",
				"accessDate": "CURRENT_TIMESTAMP"
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
	}
]
/** END TEST CASES **/