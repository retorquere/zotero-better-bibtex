{
	"translatorID": "b33af0e1-d122-45b2-b144-4b4eedd12d5d",
	"label": "Wildlife Biology in Practice",
	"creator": "Michael Berkowitz and Aurimas Vinckevicius",
	"target": "^https?://[^/]*socpvs\\.org/journals/index\\.php/wbp",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2017-01-01 15:47:15"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2017-2019 Michael Berkowitz and Aurimas Vinckevicius
	
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

function scrape(doc) {
	var translator = Zotero.loadTranslator('web');
	//use Embedded Metadata
	translator.setTranslator("951c027d-74ac-47d4-a107-9c3069ab7b48");
	translator.setDocument(doc);
	translator.setHandler("itemDone", function(obj, item) {
		//keywords are all present in a single "subjct" entry, we need to split them up
		var newTags = new Array();
		for (var i=0, n=item.tags.length; i<n; i++) {
			//keywords may also contain html tags, so we strip them
			newTags = newTags.concat( ZU.cleanTags(item.tags[i]).split('; ') );
		}
		//get rid of any duplicates
		item.tags = ZU.arrayUnique(newTags);

		//abstract ends up in extra. Moving it to abstractNote
		if (item.extra) {
			item.abstractNote = item.extra;
			delete item.extra;
		}

		item.complete();
	});
	translator.translate();
}

function detectWeb(doc, url) {
	//Google adsense first loads an empty page, and then reloads the page properly
	//discard the empty page
	if ( !Zotero.Utilities.xpath(doc,'//body/*[not(self::iframe) and not(self::script)]').length ) return null;

	if (url.includes('/showToc') || 
		( url.includes('/search/results') && Zotero.Utilities.xpath(doc, '//tr[td/a[2]]').length ) ) {
		return "multiple";
	} else if (url.includes('/article/viewArticle/')) {
		return "journalArticle";
	}
}

function doWeb(doc, url) {
	if (detectWeb(doc, url) == "multiple") {
		var items = new Object();
		var itemx = '//tr[td/a[2]]';
		var linkx = './/a[text()="Abstract"]/@href';
		if ( url.includes('/showToc') ) {
			var titlex = './td[1]/em';
		} else if (url.includes('/search/results')) {
			var titlex = './td[2]';
		}

		var results = ZU.xpath(doc, itemx);
		for ( var i=0, n=results.length; i<n; i++) {
			var result = results[i];
			var title = ZU.xpathText(result, titlex);
			var link = ZU.xpathText(result, linkx).replace(/\/view\//, '/viewArticle/');
			items[link] = Zotero.Utilities.trimInternal(title);
		}

		Zotero.selectItems(items, function(selectedItems) {
			if (!selectedItems) return true;

			var urls = new Array();
			for (var i in selectedItems) {
				urls.push(i);
			}

			ZU.processDocuments(urls, scrape);
		});
	} else {
		scrape(doc);
	}
}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://socpvs.org/journals/index.php/wbp/article/viewArticle/10.2461-wbp.2005.1.12",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"firstName": "D.",
						"lastName": "Kaplan",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [
					"Golan",
					"Quercus ithaburensis",
					"acorn",
					"cattle grazing",
					"fire",
					"seedlings survival",
					"wild boar (Sus scrofa)"
				],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					},
					{
						"title": "Snapshot"
					}
				],
				"rights": "Kaplan under Creative Commons Attribution 2.5 Portugal License:http://creativecommons.org/licenses/by/2.5/pt/deed.en_US",
				"issue": "2",
				"DOI": "10.2461/wbp.2005.1.12",
				"ISSN": "1646-1509",
				"language": "en",
				"url": "http://socpvs.org/journals/index.php/wbp/article/view/10.2461-wbp.2005.1.12",
				"libraryCatalog": "socpvs.org",
				"abstractNote": "Yahudia Forest Nature Reserve covers an area of 6620 ha, and is situated northeast of the Sea of Galilee. The vegetation is a park forest of Quercus ithaburensis, over rich herbaceous vegetation. This woodland is a remnant of a vast park forest that covered the Golan up to the middle of the 19th Century. Most of the oaks are girded by cairns, which are tumuli from the Calcolithic Era (4000-3150 B.C.), or dolmens from the Middle Bronze (2200-2000 B.C.).\nThe following factors, affecting the germination and establishment of  Q. ithaburensis , were assessed:\nAcorns: Productivity and consumption (by wild boar,  Sus scrofa , and rodents).\nHabitat: Competition with herbaceous vegetation, lack of water and microclimate.\nManagement: Fire and grazing by cattle.\nA high yield of acorns per tree was found. Even though 70% of acorns were eaten by wild boar, cows and rodents, many were left to germinate.\nAcorns buried by wild boar, and others, which have fallen behind the cairn stones, are unreachable. Rodents eat acorns and store many more in the cairns. Some of these germinate, even though partly eaten. Wild boar consumes acorns, but also buries them, providing a better chance of germination.\nCompetition with herbaceous vegetation for water is dominant. Thus, water added in May led to a significantly higher establishment of seedlings. Irrigation, during the late spring period, increased survival from 35.5% to 61.5%.\nGrazing by cattle and wild boar contributes positively to the establishment of seedlings, mainly through fire prevention.\nThe effect of fire on seedling survival was important. Only 23.7% of the seedlings not affected by fire desiccated in their first summer, whereas the proportion of those affected by fire was three times higher (69.3%).\nEcological niche: seedlings growing in cairns had a better chance of survival than those growing in open places. The cairns play a decisive role in the establishment of the oaks by protecting them from fire, from browsing and from wild boars, by serving as a place for rodents to hide acorns, and by providing a more humid habitat, protected from competition and desiccation.\nPrior to the man-made cairns, establishment took place mainly on slopes and on the frontier of basalt flows. Thus, the anthropogenic factor has played a dominant role in forming the landscape, affecting the distribution and density of the  Q. ithaburensis  trees, but wildlife has also played an important role in their establishment.",
				"shortTitle": "The Enigma of the Establishment of Quercus ithaburensis Park Forest in Northern Israel",
				"title": "The Enigma of the Establishment of Quercus ithaburensis Park Forest in Northern Israel: Co-Evolution of Wild Boar and Men?",
				"publicationTitle": "Wildlife Biology in Practice",
				"volume": "1",
				"pages": "95-107-107",
				"date": "2005-12-27"
			}
		]
	},
	{
		"type": "web",
		"url": "http://socpvs.org/journals/index.php/wbp/issue/view/1646-2742.12/showToc",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://socpvs.org/journals/index.php/wbp/search/results?query=habitat",
		"items": "multiple"
	}
];
/** END TEST CASES **/
