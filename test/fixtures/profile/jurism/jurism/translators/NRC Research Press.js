{
	"translatorID": "fc08c878-ac92-40dc-9105-ca36ca20665d",
	"label": "NRC Research Press",
	"creator": "Sebastian Karcher",
	"target": "^https?://www\\.nrcresearchpress\\.com",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcbv",
	"lastUpdated": "2016-05-24 13:18:11"
}

 /*
	***** BEGIN LICENSE BLOCK *****

	NRC Research Press
	(Closely based on the ESA journals translator)
	Copyright © 2013 Sebastian Karcher

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

function detectWeb(doc, url) {
	if (url.match(/\/doi\/abs\/10\.|\/doi\/full\/10\./)) return "journalArticle";
	else if (url.match(/\/action\/doSearch|\/toc\//) && getSearchResults(doc).length) return "multiple";
}

function getSearchResults(doc) {
	return ZU.xpath(doc,
		'//div[@class="item-details clearfix"]//a[contains(@href, "/doi/abs/")]|\
		//div[@class="art_title"]/a[contains(@href, "/doi/abs/")][1]');
}

function doWeb(doc, url) {
	var arts = new Array();
	if (detectWeb(doc, url) == "multiple") {
		var items = new Object();
		var rows = getSearchResults(doc);
		for (var i=0, n=rows.length; i<n; i++) {
			//Z.debug(rows[i].href)
			items[rows[i].href] = rows[i].textContent;
		}
		Zotero.selectItems(items, function (items) {
			if (!items) {
				return true;
			}
			urls = new Array();
			for (var itemurl in items) {
				//some search results have some "baggage" at the end - remove
				urls.push(itemurl.replace(/\?prev.+/, ""));
			}
			ZU.processDocuments(urls, scrape)
		});

	} else {
		scrape(doc, url)
	}
}

function scrape(doc, url) {
	url = url.replace(/[?#].+/, "");
	var doi = url.match(/10\.[^?#]+/)[0];
	var pdfurl = url.replace(/\/(abs|full)\//, "/pdfplus/");
	var exportUrl = '/action/downloadCitation';
	var post = 'downloadFileName=export.ris&format=ris&direct=true&include=cit&doi=' + doi;
	Zotero.Utilities.HTTP.doPost(exportUrl, post, function (text) {
		var translator = Zotero.loadTranslator("import");
		// Calling the RIS translator
		translator.setTranslator("32d59d2d-b65a-4da4-b0a3-bdd3cfb979e7");
		translator.setString(text);
		translator.setHandler("itemDone", function (obj, item) {
			item.url = url;
			item.notes = [];
			item.abstractNote = ZU.xpathText(doc, '//meta[@name="dc.Description"]/@content');
			if (item.title === item.title.toUpperCase()){
				item.title = ZU.capitalizeTitle(item.title.toLowerCase(), true);
			}
			for (var i = 0; i<item.creators.length; i++) {
				if (item.creators[i].lastName === item.creators[i].lastName.toUpperCase()){
					item.creators[i].lastName = ZU.capitalizeTitle(item.creators[i].lastName.toLowerCase(), true);
				}
			}
			item.attachments = [{
				document: doc,
				title: "NRC Research Press Snapshot",
				mimeType: "text/html"
			}];

			if (pdfurl) {
				item.attachments.push({
					url: pdfurl,
					title: "NRC Research Press PDF fulltext",
					mimeType: "application/pdf"
				});
			}

			item.complete();
		});
		translator.translate();
	});
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.nrcresearchpress.com/toc/cjc/41/10",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://www.nrcresearchpress.com/doi/abs/10.1139/v63-354#.UbTHgBXft0w",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"lastName": "Mazurek",
						"firstName": "M.",
						"creatorType": "author"
					},
					{
						"lastName": "Perlin",
						"firstName": "A. S.",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "NRC Research Press Snapshot",
						"mimeType": "text/html"
					},
					{
						"title": "NRC Research Press PDF fulltext",
						"mimeType": "application/pdf"
					}
				],
				"title": "BORATE COMPLEXING BY FIVE-MEMBERED-RING vic-DIOLS VAPOR PRESSURE EQUILIBRIUM AND N.M.R. SPECTRAL OBSERVATIONS",
				"date": "October 1, 1963",
				"DOI": "10.1139/v63-354",
				"publicationTitle": "Canadian Journal of Chemistry",
				"journalAbbreviation": "Can. J. Chem.",
				"pages": "2403-2411",
				"volume": "41",
				"issue": "10",
				"publisher": "NRC Research Press",
				"ISSN": "0008-4042",
				"url": "http://www.nrcresearchpress.com/doi/abs/10.1139/v63-354",
				"abstractNote": "Thermometric measurement of vapor pressure equilibria in reaction mixtures containing borate ion and cis-3,4-dihydroxytetrahydrofuran (I) or D-glucose 5,6-carbonate (II) indicate that complexing involves at least three different equilibria. Borate complexing by I is characterized by a gross change in n.m.r. spectral characteristics, most striking being a strong overall decoupling effect. Alterations in the spectrum of II and of 5-O-methyl D-glucose in the presence of borate, when compared with those of D-glucose, suggest that complex formation by the latter sugar proceeds with a pyranose-to-furanose interconversion. The O—C—C—O dihedral angle, within the range 0° to about 40°, does not appear to be a factor determining the stability of borate complexes. Crystalline spirane-type complexes of I, II, and of D-threose have been prepared, illustrating the usefulness of borate complexing for the isolation of some furanose sugars and derivatives.Solutions of alkali tetraborates are found by thermometric vapor pr..., non disponible",
				"libraryCatalog": "NRC Research Press",
				"accessDate": "CURRENT_TIMESTAMP"
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.nrcresearchpress.com/action/doSearch?sortBy=&startPage=0&pageSize=20&AllField=cell&Title=&Contrib=&Abstract=&stemming=yes&AfterMonth=&AfterYear=&BeforeMonth=&BeforeYear=",
		"items": "multiple"
	}
]
/** END TEST CASES **/