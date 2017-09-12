{
	"translatorID": "a571680e-6338-46c2-a740-3cd9eb80fc7f",
	"label": "Beobachter",
	"creator": "ibex",
	"target": "^https?://((www\\.)?beobachter\\.ch/.)",
	"minVersion": "2.1.9",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2016-09-07 21:24:35"
}

/*
	Beobachter Translator - Parses Beobachter articles and creates Zotero-based
	metadata.
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
  Article: http://www.beobachter.ch/natur/natuerlich-leben/wohnen-freizeit/artikel/beleuchtung_es-werde-led/
  Topic list: http://www.beobachter.ch/natur/forschung-wissen/
*/

/* Zotero API */
function detectWeb(doc, url) {
	// Z.debug("ibex detectWeb URL = " + url);
	if (doc.location.href.match(/.*\/artikel\//i) && (ZU.xpath(doc, '//div[' + containingClass('mediaarticleSingleView') + ']//h3').length > 0)) {
		return "magazineArticle";
	// AJAX-ified results are currently not compatible with Zotero.
	// The following condition is not useful:
	// http://forums.zotero.org/discussion/18518/import-citation-from-an-ajaxbased-site/
	// } else if (doc.location.href.match(/\/suche\//i) && (ZU.xpath(doc, '//div[@id = "multiSerachListContainer"]') + ']').length > 0)) {
	} else if (ZU.xpath(doc, '//html/body[' + containingClass('article') + ']').length > 0) {
		return "multiple";
	}
}

/* Zotero API */
function doWeb(doc, url) {
	// Z.debug("ibex doWeb URL = " + url);
	var urls = new Array();
	if (detectWeb(doc, url) == "multiple") {
		var items = ZU.getItemArray(doc, doc.getElementById("mainContent").getElementsByTagName('h3'), '.*');
		if (!items || countObjectProperties(items) == 0) {
			return true;
		}
		items = Z.selectItems(items);
		if (!items) {
			return true;
		}

		for (var i in items) {
			urls.push(i);
		}
	} else {
		urls.push(doc.location.href);
	}
	ZU.processDocuments(urls, scrape);
}

/* Zotero API */
function scrape(doc) {
	// Z.debug("ibex scrape URL = " + doc.location.href);

	// Fetch meta tags and fill meta tag array for associateMeta() function
	var metaTags = fetchMeta(doc);

	var newItem = new Z.Item('magazineArticle');
	newItem.url = doc.location.href;
	var shortTitle = ZU.xpath(doc, '//div[' + containingClass('mediaarticleSingleView') + ']//h3');
	if (shortTitle.length > 0) {
		newItem.shortTitle = ZU.trimInternal(shortTitle[0].textContent);
	}

	associateMeta(newItem, metaTags, "DC.title", "title");
	associateMeta(newItem, metaTags, "DC.date", "date");
	associateMeta(newItem, metaTags, "publisher", "publicationTitle");
	associateMeta(newItem, metaTags, "abstract", "abstractNote");
	associateMeta(newItem, metaTags, "DC.Language", "language");
	// Other potentially usful meta data: DC.keywords

	newItem.ISSN = "1661-7444";

	var authorline = ZU.xpath(doc, '//div[' + containingClass('mediaarticleSingleView') + ']//dl/dt[. = "Autor:"]');
	if (authorline.length > 0) {
		authorline = ZU.trimInternal(authorline[0].nextSibling.textContent);
		// Assumption of authorline: "name1[, name2] [und Name3]"
		var authors = authorline.split(/,|und/);
		for (var i = 0; i < authors.length && authorline.length > 0; i++) {
			newItem.creators.push(ZU.cleanAuthor(authors[i], "author"));
		}
	}

	var issueDt = ZU.xpath(doc, '//div[' + containingClass('mediaarticleSingleView') + ']//dl/dt[. = "Ausgabe:"]');
	if (issueDt.length > 0) {
		issueArray = issueDt[0].nextSibling.textContent.split("/");
		newItem.issue = ZU.trimInternal(issueArray[0]);
		newItem.volume = ZU.trimInternal(issueArray[1]);
	}

	// A print dialog is shown to the user. The print page listens to the
	// onload JavaScriptevent and executes window.print().
	// I do not know how to disable this behaviour.
	newItem.attachments.push({title: "Beobachter Article Snapshot", mimeType: "text/html", url: doc.location.href + "/print.html", snapshot: true});

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
	* Fetch meta tags and fill meta tag array for associateMeta() function
	*
	* @param {element} doc Document DOM
	* @return {Object} Associative array (Object) of meta tags, array[name] = value
	*/
function fetchMeta(doc) {
	var metaTagHTML = doc.getElementsByTagName("meta");
	var metaTags = new Object();
	for (var i = 0 ; i < metaTagHTML.length ; i++) {
		metaTags[metaTagHTML[i].getAttribute("name")] = metaTagHTML[i].getAttribute("content");
	}
	return metaTags;
}

/**
 * Adds an HTML meta tag to a Zotero item field.
 * The meta tags array can be filled with fetchMeta() function.
 *
 * @param {Object} newItem The Zotero item
 * @param {Object} metaTags Associative array (Object) of meta tags, array[name] = value
 * @param {String} name The meta tag name
 * @param {String} zoteroField The Zotero field name in the Zotero item.
 * @return {null} Nothing is returned
 */
function associateMeta(newItem, metaTags, name, zoteroField) {
  if (metaTags[name]) {
	newItem[zoteroField] = ZU.trimInternal(ZU.unescapeHTML(metaTags[name]));
  }
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
}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.beobachter.ch/natur/forschung-wissen/",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://www.beobachter.ch/natur/forschung-wissen/klima-wetter/artikel/blitzschlag_suche-nicht-die-buche/",
		"items": [
			{
				"itemType": "magazineArticle",
				"creators": [
					{
						"firstName": "Tanja",
						"lastName": "Polli",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Beobachter Article Snapshot",
						"mimeType": "text/html",
						"snapshot": true
					}
				],
				"url": "http://www.beobachter.ch/natur/forschung-wissen/klima-wetter/artikel/blitzschlag_suche-nicht-die-buche/",
				"shortTitle": "Neun Tipps, was man tun und lassen soll, wenn man von Blitz und Donner überrascht wird.",
				"title": "Blitze: Suche nicht die Buche!",
				"publicationTitle": "Beobachter",
				"abstractNote": "Neun Tipps, was man tun und lassen soll, wenn man von Blitz und Donner überrascht wird.",
				"language": "de",
				"ISSN": "1661-7444",
				"issue": "23. August 2013, Beobachter 17",
				"volume": "2013",
				"libraryCatalog": "Beobachter",
				"accessDate": "CURRENT_TIMESTAMP"
			}
		]
	}
]
/** END TEST CASES **/
