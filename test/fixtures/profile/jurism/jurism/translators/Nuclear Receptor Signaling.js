{
	"translatorID": "ba10b5bc-562f-11e1-b20d-a3084924019b",
	"label": "Nuclear Receptor Signaling",
	"creator": "Aurimas Vinckevicius",
	"target": "^https?://[^/]*nursa\\.org/(article|nrs|abstract)",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2014-03-03 22:02:54"
}

/*
   Nuclear Receptor Signaling Translator
   Copyright (C) 2012 Aurimas Vinckevicius

   This program is free software: you can redistribute it and/or modify
   it under the terms of the GNU Affero General Public License as published by
   the Free Software Foundation, either version 3 of the License, or
   (at your option) any later version.

   This program is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   GNU Affero General Public License for more details.

   You should have received a copy of the GNU Affero General Public License
   along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */


/*
 Translator for Nuclear Receptor Signaling journal. Example URLs:
 	Multiple:
 		http://www.nursa.org/nrs.cfm?detail=Perspectives&journalVolume=9
 		http://www.nursa.org/nrs.cfm?detail=Reviews&journalVolume=9
 		http://www.nursa.org/nrs.cfm?detail=Most%20Viewed&journalVolume=9
 		http://www.nursa.org/nrs.cfm?detail=Methods&journalVolume=9
 	Journal Article:
 		http://www.nursa.org/abstract.cfm?doi=10.1621/nrs.07008
 		http://www.nursa.org/article.cfm?doi=10.1621/nrs.09001
*/

function relativeToAbsolute(doc, url) {
	if ( typeof(url) == 'undefined' || url.length < 1 ) {
		return doc.location.toString();
	}

	//check whether it's not already absolute
	if (url.match(/^\w+:\/\//)) {
		return url;
	}

	if (url.indexOf('/') == 0) {
	//relative to root
		return doc.location.protocol + '//' + doc.location.host +
			( (doc.location.port.length)?':' + doc.location.port:'' ) +
			url;
	} else {
	//relative to current directory
		var location = doc.location.toString();
		if ( location.indexOf('?') > -1 ) {
			location = location.slice(0, location.indexOf('?'));
		}
		return location.replace(/([^\/]\/)[^\/]+$/,'$1') + url;
	}
}

function detectWeb(doc, url) {
	if ( url.match('nrs.cfm') &&
		url.match(/detail=(perspectives|reviews|most%20viewed|methods)(&|$)/i) ) {
		return 'multiple';
	} else if ( !doc.title.match(/^Error/i) &&
		   doc.title.trim().toLowerCase() != 'nursa |' ) {
		return 'journalArticle';
	}
}

function doWeb(doc, url) {
	var namespace = doc.documentElement.namespaceURI;
	var nsResolver = namespace ? function(prefix) {
		if (prefix == 'x') return namespace; else return null;
	} : null;

	if ( detectWeb(doc, url) == 'multiple' ) {
		var items = Zotero.Utilities.xpath(doc, '//div[@class="articleItemFull"]');
		var title, itemUrl;
		var selectFrom = new Object();
		for ( var i in items ) {
			title = Zotero.Utilities.xpathText(items[i], './i[text()="Nucl Recept Signal"]/preceding-sibling::node()', null, ' ');
			itemUrl = Zotero.Utilities.xpath(items[i], './a[text()="Full Text"]').shift();
			if (title && itemUrl) {
				title = Zotero.Utilities.trimInternal( title.slice(title.indexOf(')')+1).trim() );
				selectFrom[relativeToAbsolute(doc, itemUrl.href)] = title;
			}
		}

		Zotero.selectItems(selectFrom,
			function(selectedItems) {
				if ( selectedItems == null ) return true;

				var urls = new Array();
				for ( var item in selectedItems ) {
					urls.push(item);
				}

				Zotero.Utilities.processDocuments(urls,
					function(newDoc) {
						doWeb(newDoc, newDoc.location.href)
					},
					function() { Zotero.done(); });
			});
	} else {
		//load full text instead of abstract to get the full auhor names
		if ( url.match('abstract.cfm') ) {
			Zotero.Utilities.processDocuments(url.replace(/abstract.cfm/,'article.cfm'),
				function(newDoc) {
					doWeb(newDoc, newDoc.location.href)
				},
				function() { Zotero.done(); });
			return null;
		}

		var item = new Zotero.Item('journalArticle');

		item.title = Zotero.Utilities.xpathText(doc, '//div[contains(@class,"articleTitle")]').trim();

		var authors = doc.evaluate('//div[@class="topAuthors"]//span', doc, nsResolver, XPathResult.ANY_TYPE, null);
		var author;
		while ( author = authors.iterateNext() ) {
			author = author.textContent.trim().replace(/\s+and$/,'');
			item.creators.push( Zotero.Utilities.cleanAuthor(author, 'author', false) );
		}

		item.publicationTitle = 'Nuclear Receptor Signaling';
		item.journalAbbreviation = 'Nucl. Recept. Signaling';

		var published = Zotero.Utilities.xpathText(doc, '//div[contains(@class,"bottomHeader")]/p[1]').trim();
		var pubDelim = 'Published:';
		if ( published && published.indexOf(pubDelim) != -1 ) {
			item.date = published.slice( published.lastIndexOf(pubDelim) + pubDelim.length ).trim();
		}

		item.volume = Zotero.Utilities.xpathText(doc, '//div[contains(@class,"volumeCiteInfo")][2]/b');

		var page = Zotero.Utilities.xpathText(doc, '//div[contains(@class,"volumeCiteInfo")][2]/text()[2]');
		if (page) {
			item.pages = page.replace(/\W/g,'');
		}

		item.abstractNote = Zotero.Utilities.xpathText(doc, '//div[contains(@class,"abstract")]/p', null, "\n");

		var doi = Zotero.Utilities.xpathText(doc, '//div[contains(@class,"bottomHeader")]/p[3]/text()[normalize-space()]');
		if (doi) {
			item.DOI = doi.trim();
		}

		item.url = url;

		item.ISSN = "1550-7629";
		

		var rights = Zotero.Utilities.xpathText(doc, '//div[contains(@class,"bottomHeader")]/p[2]');
		if (rights) {
			item.rights = rights;
		}

		item.accessDate = 'CURRENT_TIMESTAMP';

		var pdfURL = Zotero.Utilities.xpath(doc, '//div[span/text() = "Download PDF"]/a').shift();
		if (pdfURL) {
			item.attachments = [{
				url: relativeToAbsolute(doc, pdfURL.href),
				title: 'Full Text PDF',
				mimeType: 'application/pdf'}];
		}

		item.complete();
	}
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.nursa.org/article.cfm?doi=10.1621/nrs.09002",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"firstName": "Stephen",
						"lastName": "Safe",
						"creatorType": "author"
					},
					{
						"firstName": "Kyounghyun",
						"lastName": "Kim",
						"creatorType": "author"
					},
					{
						"firstName": "Xi",
						"lastName": "Li",
						"creatorType": "author"
					},
					{
						"firstName": "Syng-Ook",
						"lastName": "Lee",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"url": "http://www.nursa.org/retrieveFile.cfm?type=NRS&file=nrs09002.pdf",
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					}
				],
				"title": "NR4A orphan receptors and cancer",
				"publicationTitle": "Nuclear Receptor Signaling",
				"journalAbbreviation": "Nucl. Recept. Signaling",
				"date": "March 18, 2011",
				"volume": "9",
				"pages": "e002",
				"abstractNote": "NR4A orphan receptors are members of the nuclear receptor (NR) superfamily of transcription factors and include NR4A1 (Nur77, TR3, NGFI-B), NR4A2 (Nurr1), and NR4A3 (Nor1). NR4A receptors are immediate-early genes induced by multiple stimuli and modulate gene expression by interacting as monomers or homodimers to NGFI-B response elements (NBREs) and Nur-responsive elements (NuREs), respectively. NR4A1 and NR4A2 (but not NR4A3) also form heterodimers with the retinoic acid X receptor (RXR) that bind a DR5 motif, and there is evidence that NR4A1 can activate or deactivate gene expression in cancer cells through interactions with DNA-bound specificity protein 1(Sp1) transcription factor. NR4A receptors play important roles in cellular homeostasis and disease, and there is increasing evidence that they exhibit pro-oncogenic activity in most tumors and thereby represent novel targets for chemotherapeutic drugs. Many apoptosis-inducing drugs induce nuclear export of NR4A1 and activate apoptosis in cancer cell lines through formation of extranuclear complexes including a pro-apoptotic mitochondrial NR4A1-bcl-2 complex. 1,1-Bis(3'-indolyl)-1-(p-substituted phenyl)methane analogs exhibit structure-dependent activation or deactivation of nuclear NR4A1 to induce apoptosis, whereas cytosporone B and structural analogs activate both nuclear and extranuclear NR4A1-dependent pro-apoptotic pathways. The roles of NR4A2 and NR4A3 in carcinogenesis are less well-defined; however, there is evidence suggesting that NR4A receptors are important targets for development of new mechanism-based anticancer drugs.",
				"DOI": "10.1621/nrs.09002",
				"url": "http://www.nursa.org/article.cfm?doi=10.1621/nrs.09002",
				"ISSN": "1550-7629",
				"rights": "Copyright © 2011, Safe et al. This is an open-access article distributed under the terms of the Creative Commons Non-Commercial Attribution License, which permits unrestricted non-commercial use distribution and reproduction in any medium, provided the original work is properly cited.",
				"accessDate": "CURRENT_TIMESTAMP",
				"libraryCatalog": "Nuclear Receptor Signaling"
			}
		]
	}
]
/** END TEST CASES **/