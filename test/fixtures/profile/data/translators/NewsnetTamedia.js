{
	"translatorID": "caecaea0-5d06-11df-a08a-0800200c9a66",
	"label": "Newsnet/Tamedia",
	"creator": "Philipp Zumstein",
	"target": "^https?://((www\\.)?(tagesanzeiger|(bo\\.)?bernerzeitung|bazonline|derbund|lematin|24heures|landbote|zuonline|zsz)\\.ch/.)",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2017-01-07 09:02:05"
}


/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2016 Philipp Zumstein

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
	if (url.indexOf("/story/") != -1) {
		return "newspaperArticle";
	} else if (url.indexOf("suche.html?") != -1 && getSearchResults(doc, true)) {
		return "multiple";
	}
}


function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = ZU.xpath(doc, '//div[@id="panelArticleItems"]//h3/a[contains(@href, "/story/")]');
	for (var i=0; i<rows.length; i++) {
		var href = rows[i].href;
		var title = ZU.trimInternal(rows[i].textContent);
		if (!href || !title) continue;
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
				articles.push(i);
			}
			ZU.processDocuments(articles, scrape);
		});
	} else {
		scrape(doc, url);
	}
}


function scrape(doc, url) {
	var translator = Zotero.loadTranslator('web');
	// Embedded Metadata
	translator.setTranslator('951c027d-74ac-47d4-a107-9c3069ab7b48');
	//translator.setDocument(doc);

	translator.setHandler('itemDone', function (obj, item) {
		
		
		var authors = ZU.xpath(doc, '//div[@id="mainColLeft"]//div[contains(@class, "storyInfo")]/span[contains(@class, "author")]')
		if (authors) {
			for (var i=0; i<authors.length; i++) {
				item.creators.push(ZU.cleanAuthor(authors[i].textContent, "author"));
			}
		}
		
		var date = ZU.xpathText(doc, '//div[@id="mainColLeft"]//div[contains(@class, "storyInfo")]/time/span') ||
			ZU.xpathText(doc, '//div[@id="mainColLeft"]//div[contains(@class, "storyInfo")]/time');
		if (date) {
			item.date = ZU.strToISO(date);
		}
		
		item.section = ZU.xpathText(doc, '//div[@id="mainNav"]/ul/li/a[contains(@class, "active")]');
		
		var newspaperName = ZU.xpathText(doc, '//img[@id="mainLogo"]/@alt');
		if (newspaperName) {
			item.publicationTitle = newspaperName;
		}
		
		if (url.indexOf("24heures.ch")>-1 || url.indexOf("lematin.ch")>-1) {
			item.language = "fr";
		} else {
			item.language = "de";
		}
		
		item.ISSN = issnMapping(url);
		
		var tags = ZU.xpath(doc, '//span[contains(@class, "tagWrapper")]');
		if (tags) {
			for (var i=0; i<tags.length; i++) {
				item.tags.push(tags[i].textContent.trim());
			}
		}
		
		item.complete();
	});

	translator.getTranslatorObject(function(trans) {
		trans.itemType = "newspaperArticle";
		trans.doWeb(doc, url);
	});
}


function issnMapping(url) {
	if (url.indexOf("tagesanzeiger.ch")>-1) return "1422-9994";
	if (url.indexOf("bernerzeitung.ch")>-1) return "1424-1021";
	if (url.indexOf("bazonline.ch")>-1) return "1420-3006";
	if (url.indexOf("derbund.ch")>-1) return "0774-6156";
	if (url.indexOf("lematin.ch")>-1) return "1018-3736";
	if (url.indexOf("24heures.ch")>-1) return "1424-4039";
}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.tagesanzeiger.ch/wissen/natur/Duestere-Fakten-zum-Klimawandel/story/13137025",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Düstere Fakten zum Klimawandel",
				"creators": [],
				"date": "2011-10-11",
				"ISSN": "1422-9994",
				"abstractNote": "Der neueste Bericht der Internationalen Energieagentur ist besorgniserregend. Das Klima könnte sich noch viel stärker erwärmen als bisher erwartet.",
				"language": "de",
				"libraryCatalog": "www.tagesanzeiger.ch",
				"publicationTitle": "Tages-Anzeiger",
				"section": "Wissen",
				"url": "http://www.tagesanzeiger.ch/wissen/natur/Duestere-Fakten-zum-Klimawandel/story/13137025",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					"IEA",
					"Klimaschutz"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.tagesanzeiger.ch/service/suche/suche.html?date=alle&order=date&key=arbeitsmarkt",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://www.bernerzeitung.ch/schweiz/wie-praegt-uns-die-reformation-heute-noch/story/28184086",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Wie prägt uns die Reformation heute noch?",
				"creators": [
					{
						"firstName": "Christoph",
						"lastName": "Aebischer",
						"creatorType": "author"
					}
				],
				"date": "2016-12-28",
				"ISSN": "1424-1021",
				"abstractNote": "Vor bald 500 Jahren ging ein Ruck durch Europa. Martin Luthers Thesen erschütterten die Kirchenwelt. Nun sucht die reformierte Kirche der Schweiz im Jubiläumsjahr neue Thesen, die sie heute voranbringen.",
				"language": "de",
				"libraryCatalog": "www.bernerzeitung.ch",
				"publicationTitle": "Berner Zeitung",
				"section": "Schweiz",
				"url": "http://www.bernerzeitung.ch/schweiz/wie-praegt-uns-die-reformation-heute-noch/story/28184086",
				"attachments": [
					{
						"title": "Snapshot"
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
		"url": "http://bazonline.ch/wirtschaft/konjunktur/warum-die-nationalbank-zurueckhaltung-ueben-kann/story/15326375",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Drei Gründe, warum sich SNB-Jordan entspannen kann",
				"creators": [
					{
						"firstName": "Markus Diem",
						"lastName": "Meier",
						"creatorType": "author"
					}
				],
				"date": "2016-12-28",
				"ISSN": "1420-3006",
				"abstractNote": "Devisen-Berg und Negativzinsen: Hat der Notenbanker-Albtraum der letzten Jahre den Tiefpunkt überwunden?",
				"language": "de",
				"libraryCatalog": "bazonline.ch",
				"publicationTitle": "Basler Zeitung",
				"section": "Wirtschaft",
				"url": "http://bazonline.ch/wirtschaft/konjunktur/warum-die-nationalbank-zurueckhaltung-ueben-kann/story/15326375",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					"Franken"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.derbund.ch/bern/stadt/der-letzte-stapi-geht/story/21950637",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Der letzte Stapi geht",
				"creators": [
					{
						"firstName": "Simon",
						"lastName": "Preisig@simsimst",
						"creatorType": "author"
					}
				],
				"date": "2016-12-28",
				"ISSN": "0774-6156",
				"abstractNote": "Ob Wyss oder von Graffenried: Mit dem Rücktritt von Alexander Tschäppät geht in Bern – ja, in der Schweiz – eine Ära zu Ende. Die neue Generation von Stadtpräsidenten zählt mehr Manager als Charismatiker.",
				"language": "de",
				"libraryCatalog": "www.derbund.ch",
				"publicationTitle": "Der Bund",
				"section": "Bern",
				"url": "http://www.derbund.ch/bern/stadt/der-letzte-stapi-geht/story/21950637",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					"Alec von Graffenried",
					"Alexander Tschäppät",
					"Ursula Wyss"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.lematin.ch/monde/alep-prepare-reconstruction-titanesque/story/15949402",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Alep se prépare à une reconstruction titanesque",
				"creators": [],
				"date": "2016-12-28",
				"ISSN": "1018-3736",
				"abstractNote": "Les habitants attendent avec impatience les travaux de reconstruction dans ce qui était l'une des plus belles villes de Syrie avant la guerre.",
				"language": "fr",
				"libraryCatalog": "www.lematin.ch",
				"publicationTitle": "Le Matin",
				"url": "http://www.lematin.ch/monde/alep-prepare-reconstruction-titanesque/story/15949402",
				"attachments": [
					{
						"title": "Snapshot"
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
		"url": "http://www.zuonline.ch/front/ein-steuerstreit-weniger-fuer-die-zkb/story/31314504",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Ein Steuerstreit weniger für die ZKB",
				"creators": [
					{
						"firstName": "Philipp",
						"lastName": "Lenherr",
						"creatorType": "author"
					}
				],
				"date": "2016-12-28",
				"abstractNote": "Die Zürcher Kantonalbank beendet den Steuerstreit mit Deutschland durch eine einmalige Zahlung von 5,7 Millionen Euro.",
				"language": "de",
				"libraryCatalog": "www.zuonline.ch",
				"publicationTitle": "Zürcher Unterländer",
				"url": "http://www.zuonline.ch/front/ein-steuerstreit-weniger-fuer-die-zkb/story/31314504",
				"attachments": [
					{
						"title": "Snapshot"
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
		"url": "http://www.zsz.ch/horgen/der-beste-elektroinstallateur-europas-kommt-aus-huetten/story/31921047",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Der beste Elektroinstallateur Europas kommt aus Hütten",
				"creators": [
					{
						"firstName": "Reto",
						"lastName": "Bächli",
						"creatorType": "author"
					}
				],
				"date": "2016-12-27",
				"abstractNote": "Yvan Fässler gewann anfangs Dezember die Goldmedaille als bester Elektroinstallateur an den europäischen Berufsmeisterschaften in Göteborg. Es ist die Krönung nach Jahren intensiver Vorbereitung.",
				"language": "de",
				"libraryCatalog": "www.zsz.ch",
				"publicationTitle": "Zürichsee-Zeitung",
				"section": "Horgen",
				"url": "http://www.zsz.ch/horgen/der-beste-elektroinstallateur-europas-kommt-aus-huetten/story/31921047",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/