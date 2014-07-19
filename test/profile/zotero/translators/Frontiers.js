{
	"translatorID": "cb9e794e-7a65-47cd-90f6-58cdd191e8b0",
	"label": "Frontiers",
	"creator": "Jason Friedman and Simon Kornblith",
	"target": "^https?://(www|journal)\\.frontiersin\\.org.*/",
	"minVersion": "2.1.10",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2014-04-28 20:54:37"
}

/*
   Frontiers translator 
   Copyright (C) 2009-2011 Jason Friedman, write.to.jason@gmail.com
						   Simon Kornblith, simon@simonster.com

   This program is free software: you can redistribute it and/or modify
   it under the terms of the GNU Affero General Public License as published by
   the Free Software Foundation, either version 3 of the License, or
   (at your option) any later version.

   This program is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   GNU Affero General Public License for more details.

   You should have received a copy of the Affero GNU General Public License
   along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

function detectWeb(doc, url) {

	if (url.indexOf("abstract") != -1) {
		return "journalArticle";
	} else if (url.indexOf("full") != -1) {
		return "journalArticle";
	} else if (!ZU.isEmpty(getItems(doc, url))) {
		return "multiple";
	}
}

function getItems(doc, url) {
	var items = {};
	var links = doc.evaluate('//*[@class="AS55"]/a[contains(@title, " ") or contains(@title, "/")]', doc, null, XPathResult.ANY_TYPE, null);
	while (link = links.iterateNext()) {
		if (link.href.indexOf("/abstract") === -1) continue;
		items[link.href] = link.textContent;
	}
	return items;
}

function doWeb(doc, url) {
	var articles = new Array();

	// individual article
	if (detectWeb(doc, url) === "journalArticle") {
		scrape(doc, url);
		// search results / other page
	} else {
		var items = getItems(doc, url);
		Zotero.selectItems(items, function (items) {
			if (!items) {
				return true;
			}
			for (var i in items) {
				articles.push(i);
			}
			Zotero.Utilities.processDocuments(articles, scrape);
		});
	}
}

function scrape(doc, url) {
	var newItem = new Zotero.Item("journalArticle");

	// save the url
	newItem.url = doc.location.href;

	//title
	var title1 = doc.evaluate('//div[@class="JournalAbstract"]/h1', doc, null, XPathResult.ANY_TYPE, null).iterateNext();

	if (title1 == null) title1 = doc.evaluate('//div[@class="JournalAbstract"]/div/h1', doc, null, XPathResult.ANY_TYPE, null).iterateNext();

	newItem.title = Zotero.Utilities.trim(title1.textContent);

	// journal name
	var docTitle = doc.evaluate('//head/title', doc, null, XPathResult.ANY_TYPE, null).iterateNext().textContent;
	newItem.publicationTitle = Zotero.Utilities.trimInternal(docTitle.split('|')[2]);

	//authors - can be in two ways, depending on which page
	var authors = doc.evaluate('//meta[@name="citation_author"]/@content', doc, null, XPathResult.ANY_TYPE, null);
	while (author = authors.iterateNext()) {
		newItem.creators.push(Zotero.Utilities.cleanAuthor(Zotero.Utilities.trimInternal(author.textContent), "author", true));
	}

	authors = doc.evaluate('//div[@class="paperauthor"]/a', doc, null, XPathResult.ANY_TYPE, null);

	while (author = authors.iterateNext()) {
		newItem.creators.push(Zotero.Utilities.cleanAuthor(Zotero.Utilities.trimInternal(author.textContent), "author"));
	}

	// abstract
	var abstract1;
	abstract1 = doc.evaluate('//div[@class="JournalAbstract"]/p', doc, null, XPathResult.ANY_TYPE, null).iterateNext();

	if (abstract1 == null) abstract1 = doc.evaluate('//div[@class="JournalAbstract"]/div[@class="abstracttext"]', doc, null, XPathResult.ANY_TYPE, null).iterateNext();

	if (!(abstract1 == null)) newItem.abstractNote = Zotero.Utilities.trim(abstract1.textContent);

	// Get volume, DOI, pages and year from the citation. It can appear in various places
	var citation1 = doc.evaluate('//div[@class="AbstractSummary"]/p[2]', doc, null, XPathResult.ANY_TYPE, null).iterateNext(2);
	if (citation1 != null) {
		if (!citation1.textContent.match(/Citation:/)) citation1 = null;
	}

	if (citation1 == null) {
		citation1 = doc.evaluate('//div[@class="AbstractSummary"]/p[1]', doc, null, XPathResult.ANY_TYPE, null).iterateNext();
		if (citation1 != null) {
			if (!citation1.textContent.match(/Citation:/)) citation1 = null;
		}
	}

	if (citation1 == null) {
		citation1 = doc.evaluate('//div[@class="metacontainer"]/div[@class="metavalue"][2]', doc, null, XPathResult.ANY_TYPE, null).iterateNext(2);
		if (citation1 != null) {
			if (!doc.evaluate('//div[@class="metacontainer"]/div[@class="metakey"][2]', doc, null, XPathResult.ANY_TYPE, null).iterateNext(2).textContent.match(/Citation:/)) citation1 = null;
		}
	}

	if (citation1 == null) citation1 = doc.evaluate('//div[@class="AbstractSummary"]/p', doc, null, XPathResult.ANY_TYPE, null).iterateNext(2);

	if (citation1.textContent.match(/Received/)) citation1 = doc.evaluate('//div[@class="metacontainer"]/div[@class="metavalue"]', doc, null, XPathResult.ANY_TYPE, null).iterateNext();

	var citation = citation1.textContent;

	if (!(citation == null)) {
		// DOI
		var doipart = citation.split('doi:')[1];
		if (doipart != null) newItem.DOI = Zotero.Utilities.trim(doipart);
		var citation2 = citation.match(/:([0-9]*)\./);
		// If it has been recently released, there may be no page number
		if (citation2 != null) newItem.pages = citation2[1];
		var citation3 = citation.match(/\((20[0-9][0-9])\)/);
		if (citation3 != null) newItem.date = citation3[1];
	}

	// Look for keywords
	var keywords1 = doc.evaluate('//div[@class="AbstractSummary"]/p[1]', doc, null, XPathResult.ANY_TYPE, null).iterateNext();
	if (keywords1 != null) {
		if (!(keywords1.textContent.match(/Keywords/))) keywords1 = null;
	}
	var withoutKeywordsColon = 0;

	if (keywords1 == null) {
		// In these articles, "Keyword:" appears inside  a separate div
		keywords1 = doc.evaluate('//div[@class="metacontainer"]/div[@class="metavalue"][1]', doc, null, XPathResult.ANY_TYPE, null).iterateNext();
		withoutKeywordsColon = 1;
	}

	if (keywords1 != null) {

		var keywords = keywords1.textContent;

		if (!(keywords == null)) {
			var keywordspart = "a,b";
			if (withoutKeywordsColon) keywordspart = keywords;
			else keywordspart = Zotero.Utilities.trim(keywords.split('Keywords:')[1]);
			var keywordsall = keywordspart.split(',');
			for (i = 0; i < keywordsall.length; i++) {
				newItem.tags[i] = Zotero.Utilities.cleanTags(Zotero.Utilities.trim(keywordsall[i]), "");
			}
		}
	}

	var abbrev = doc.evaluate('//div[@class="AbstractSummary"]/p[2]/i', doc, null, XPathResult.ANY_TYPE, null).iterateNext();

	if (abbrev == null) abbrev = doc.evaluate('//div[@class="metacontainer"]/div[@class="metavalue"]/i', doc, null, XPathResult.ANY_TYPE, null).iterateNext();

	if (!(abbrev == null)) newItem.journalAbbreviation = Zotero.Utilities.trim(abbrev.textContent);

	var vol = doc.evaluate('//div[@class="AbstractSummary"]/p[2]/b', doc, null, XPathResult.ANY_TYPE, null).iterateNext();
	if (vol == null) vol = doc.evaluate('//div[@class="metacontainer"]/div[@class="metavalue"]/b', doc, null, XPathResult.ANY_TYPE, null).iterateNext();

	if (!(vol == null)) newItem.volume = vol.textContent;

	var pdfurl = ZU.xpathText(doc, '//meta[@name="citation_pdf_url"]/@content')
	if (pdfurl) {
		newItem.attachments = [{
			url: pdfurl,
			title: "Full Text PDF",
			mimeType: "application/pdf"
		}];
	}
	newItem.complete();
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.frontiersin.org/SearchData.aspx?sq=key+visual+features",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://journal.frontiersin.org/Journal/10.3389/fpsyg.2011.00326/abstract",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"firstName": "Sébastien M.",
						"lastName": "Crouzet",
						"creatorType": "author"
					},
					{
						"firstName": "Thomas",
						"lastName": "Serre",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [
					"rapid visual object recognition",
					"computational models",
					"visual features",
					"computer vision",
					"feedforward"
				],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					}
				],
				"url": "http://journal.frontiersin.org/Journal/10.3389/fpsyg.2011.00326/abstract",
				"title": "What are the visual features underlying rapid object recognition?",
				"publicationTitle": "Perception Science",
				"abstractNote": "Research progress in machine vision has been very significant in recent years. Robust face detection and identification algorithms are already readily available to consumers, and modern computer vision algorithms for generic object recognition are now coping with the richness and complexity of natural visual scenes. Unlike early vision models of object recognition that emphasized the role of figure-ground segmentation and spatial information between parts, recent successful approaches are based on the computation of loose collections of image features without prior segmentation or any explicit encoding of spatial relations. While these models remain simplistic models of visual processing, they suggest that, in principle, bottom-up activation of a loose collection of image features could support the rapid recognition of natural object categories and provide an initial coarse visual representation before more complex visual routines and attentional mechanisms take place. Focusing on biologically plausible computational models of (bottom-up) pre-attentive visual recognition, we review some of the key visual features that have been described in the literature. We discuss the consistency of these feature-based representations with classical theories from visual psychology and test their ability to account for human performance on a rapid object categorization task.",
				"DOI": "10.3389/fpsyg.2011.00326",
				"pages": "326",
				"date": "2011",
				"journalAbbreviation": "Front. Psychology",
				"volume": "2",
				"libraryCatalog": "Frontiers",
				"accessDate": "CURRENT_TIMESTAMP"
			}
		]
	}
]
/** END TEST CASES **/