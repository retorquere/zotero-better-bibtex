{
	"translatorID": "f20f91fe-d875-47e7-9656-0abb928be472",
	"label": "HAL Archives Ouvertes",
	"creator": "Sebastian Karcher",
	"target": "^https?://hal\\.archives-ouvertes\\.fr",
	"minVersion": "2.1.9",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2012-09-23 23:44:54"
}

/*
	***** BEGIN LICENSE BLOCK *****
	HAL translator
	Copyright © 2012 Sebastian Karcher 
	
	This file is part of Zotero.
	
	Zotero is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.
	
	Zotero is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU Affero General Public License for more details.
	
	You should have received a copy of the GNU Affero General Public License
	along with Zotero.  If not, see <http://www.gnu.org/licenses/>.
	
	***** END LICENSE BLOCK *****
*/

function detectWeb(doc, url) {
	if (ZU.xpath(doc, '//a[@class="metadata"]').length > 0) return "multiple";
	if (url.match(/\index\.php\?halsid=|\.fr\/hal-\d+/)) return "journalArticle";
}

function doWeb(doc, url) {
	var articles = new Array();
	if (detectWeb(doc, url) == "multiple") {
		var items = {};
		var titles = doc.evaluate('//a[@class="metadata"]', doc, null, XPathResult.ANY_TYPE, null);
		var title;
		while (title = titles.iterateNext()) {
			items[title.href] = title.textContent;
		}
		Zotero.selectItems(items, function (items) {
			if (!items) {
				return true;
			}
			for (var i in items) {
				articles.push(i);
			}
			Zotero.Utilities.processDocuments(articles, scrape, function () {
				Zotero.done();
			});
		});
	} else {
		scrape(doc, url);
	}
}

function scrape(doc, url) {
	var data = ZU.xpathText(doc, '//span[@id="ind_bibtex"]/following-sibling::a/@onclick');
	var halsid = data.match(/halsid:'.+'/)[0].replace(/:'/, "=").replace(/'$/, "");
	var haldoc = data.match(/'\d+'/)[0].replace(/'/g, "");
	Z.debug("HALSID: " + halsid);
	Z.debug("HALDOC: " + haldoc);
	var postUrl = "http://hal.archives-ouvertes.fr/action_ajax/browse.php";
	var postBody = "action=export_in_format&docid=" + haldoc + "&format=BIBTEX&" + halsid;
	ZU.doPost(postUrl, postBody, function (bibtex) {
		//Z.debug(bibtex)
		var translator = Zotero.loadTranslator("import");
		translator.setTranslator("9cb70025-a888-4a29-a210-93ec52da40d4");
		translator.setString(bibtex);
		translator.setHandler("itemDone", function (obj, item) {
			item.attachments = [{
				url: item.url,
				title: "HAL Snapshot",
				mimeType: "text/html"
			}];
			item.complete();
		});
		translator.translate();
	})
}
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://hal.archives-ouvertes.fr/hal-00328427",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"firstName": "V.",
						"lastName": "Thouret",
						"creatorType": "author"
					},
					{
						"firstName": "J.-P.",
						"lastName": "Cammas",
						"creatorType": "author"
					},
					{
						"firstName": "B.",
						"lastName": "Sauvage",
						"creatorType": "author"
					},
					{
						"firstName": "G.",
						"lastName": "Athier",
						"creatorType": "author"
					},
					{
						"firstName": "R.",
						"lastName": "Zbinden",
						"creatorType": "author"
					},
					{
						"firstName": "P.",
						"lastName": "Nédélec",
						"creatorType": "author"
					},
					{
						"firstName": "P.",
						"lastName": "Simon",
						"creatorType": "author"
					},
					{
						"firstName": "F.",
						"lastName": "Karcher",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"title": "HAL Snapshot",
						"mimeType": "text/html"
					}
				],
				"itemID": "thouret:hal-00328427",
				"url": "http://hal.archives-ouvertes.fr/hal-00328427",
				"title": "Tropopause referenced ozone climatology and inter-annual variability (1994–2003) from the MOZAIC programme",
				"abstractNote": "The MOZAIC programme collects ozone and water vapour data using automatic equipment installed on board five long-range Airbus A340 aircraft flying regularly all over the world since August 1994. Those measurements made between September 1994 and August 1996 allowed the first accurate ozone climatology at 9–12 km altitude to be generated. The seasonal variability of the tropopause height has always provided a problem when constructing climatologies in this region. To remove any signal from the seasonal and synoptic scale variability in tropopause height we have chosen in this further study of these and subsequent data to reference our climatology to the altitude of the tropopause. We define the tropopause as a mixing zone 30 hPa thick across the 2 pvu potential vorticity surface. A new ozone climatology is now available for levels characteristic of the upper troposphere (UT) and the lower stratosphere (LS) regardless of the seasonal variations of the tropopause over the period 1994–2003. Moreover, this new presentation has allowed an estimation of the monthly mean climatological ozone concentration at the tropopause showing a sine seasonal variation with a maximum in May (120 ppbv) and a minimum in November (65 ppbv). Besides, we present a first assessment of the inter-annual variability of ozone in this particular critical region. The overall increase in the UTLS is about 1%/yr for the 9 years sampled. However, enhanced concentrations about 10–15 % higher than the other years were recorded in 1998 and 1999 in both the UT and the LS. This so-called \"1998–1999 anomaly\" may be attributed to a combination of different processes involving large scale modes of atmospheric variability, circulation features and local or global pollution, but the most dominant one seems to involve the variability of the North Atlantic Oscillation (NAO) as we find a strong positive correlation (above 0.60) between ozone recorded in the upper troposphere and the NAO index. A strong anti-correlation is also found between ozone and the extremes of the Northern Annular Mode (NAM) index, attributing the lower stratospheric variability to dynamical anomalies. Finally this analysis highlights the coupling between the troposphere, at least the upper one, and the stratosphere, at least the lower one.",
				"language": "Anglais",
				"pages": "1051",
				"publicationTitle": "Atmospheric Chemistry and Physics",
				"volume": "6",
				"issue": "4",
				"date": "March 2006",
				"libraryCatalog": "HAL Archives Ouvertes"
			}
		]
	}
]
/** END TEST CASES **/