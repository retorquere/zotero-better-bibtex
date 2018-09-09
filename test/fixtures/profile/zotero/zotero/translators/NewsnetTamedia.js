{
	"translatorID": "caecaea0-5d06-11df-a08a-0800200c9a66",
	"label": "Newsnet/Tamedia",
	"creator": "Philipp Zumstein",
	"target": "^https?://((www\\.)?(tagesanzeiger|(bo\\.)?bernerzeitung|bazonline|derbund|lematin|24heures|landbote|zuonline|zsz|tdg|letemps)\\.ch/.)",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2018-04-29 11:03:04"
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
	if (url.includes("/story/")) {
		return "newspaperArticle";
	} else if (url.includes("letemps.ch") && ZU.xpathText(doc, '//meta[@property="og:type"]/@content')) {
		return "newspaperArticle";
	} else if (url.includes("suche.html?") && getSearchResults(doc, true)) {
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
		
		
		var authors = ZU.xpath(doc, '//div[@id="mainColLeft"]//div[contains(@class, "storyInfo")]/span[contains(@class, "author")]/a[1]');
		if (!authors || authors.length===0) authors = ZU.xpath(doc, '//div[@id="mainColLeft"]//div[contains(@class, "storyInfo")]/span[contains(@class, "author")]');
		if (!authors || authors.length===0) authors = ZU.xpath(doc, '(//section[contains(@class, "article-info")])[1]//a[contains(@class, "article-author")]');
		if (authors) {
			for (let i=0; i<authors.length; i++) {
				// Delete "Par" = From in authors name
				let author = authors[i].textContent.replace(/^Par /, '');
				item.creators.push(ZU.cleanAuthor(author, "author"));
			}
		}
		
		var date = ZU.xpathText(doc, '//div[@id="mainColLeft"]//div[contains(@class, "storyInfo")]/time/span') ||
			ZU.xpathText(doc, '//div[@id="mainColLeft"]//div[contains(@class, "storyInfo")]/time');
		if (date) {
			item.date = ZU.strToISO(date);
		}
		
		item.section = ZU.xpathText(doc, '//div[@id="mainNav"]/ul/li/a[contains(@class, "active")]');
		
		var newspaperName = ZU.xpathText(doc, '(//img[@id="mainLogo"]/@alt)[1]');
		if (newspaperName) {
			item.publicationTitle = newspaperName;
		}
		
		if (url.includes("24heures.ch")
			|| url.includes("lematin.ch")
			|| url.includes("tdg.ch")
			|| url.includes("letemps.ch")) {
				item.language = "fr";
		} else {
			item.language = "de";
		}
		
		if (item.url && item.url.slice(0,2) == "//") {
			item.url = "https:" + item.url;
		}
		
		item.ISSN = issnMapping(url);
		
		var tags = ZU.xpath(doc, '//span[contains(@class, "tagWrapper")]');
		if (tags) {
			for (let i=0; i<tags.length; i++) {
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
	if (url.includes("tagesanzeiger.ch")) return "1422-9994";
	if (url.includes("bernerzeitung.ch")) return "1424-1021";
	if (url.includes("bazonline.ch")) return "1420-3006";
	if (url.includes("derbund.ch")) return "0774-6156";
	if (url.includes("lematin.ch")) return "1018-3736";
	if (url.includes("24heures.ch")) return "1424-4039";
	if (url.includes("tdg.ch")) return "1010-2248";
	if (url.includes("letemps.ch")) return "1423-3967";
}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://www.tagesanzeiger.ch/wissen/natur/Duestere-Fakten-zum-Klimawandel/story/13137025",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Düstere Fakten zum Klimawandel",
				"creators": [],
				"date": "2011-11-10",
				"ISSN": "1422-9994",
				"abstractNote": "Der neueste Bericht der Internationalen Energieagentur ist besorgniserregend. Das Klima könnte sich noch viel stärker erwärmen als bisher erwartet.",
				"language": "de",
				"libraryCatalog": "www.tagesanzeiger.ch",
				"publicationTitle": "Tages-Anzeiger",
				"section": "Wissen",
				"url": "https://www.tagesanzeiger.ch/wissen/natur/Duestere-Fakten-zum-Klimawandel/story/13137025",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					{
						"tag": "IEA"
					},
					{
						"tag": "Klimaschutz"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.tagesanzeiger.ch/service/suche/suche.html?date=alle&order=date&key=arbeitsmarkt",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://www.bernerzeitung.ch/schweiz/wie-praegt-uns-die-reformation-heute-noch/story/28184086",
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
				"url": "https://www.bernerzeitung.ch/schweiz/wie-praegt-uns-die-reformation-heute-noch/story/28184086",
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
		"url": "https://bazonline.ch/wirtschaft/konjunktur/warum-die-nationalbank-zurueckhaltung-ueben-kann/story/15326375",
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
				"url": "https://bazonline.ch/wirtschaft/konjunktur/warum-die-nationalbank-zurueckhaltung-ueben-kann/story/15326375",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					{
						"tag": "Franken"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.derbund.ch/bern/stadt/der-letzte-stapi-geht/story/21950637",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Der letzte Stapi geht",
				"creators": [
					{
						"firstName": "Simon",
						"lastName": "Preisig",
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
				"url": "https://www.derbund.ch/bern/stadt/der-letzte-stapi-geht/story/21950637",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					{
						"tag": "Alec von Graffenried"
					},
					{
						"tag": "Alexander Tschäppät"
					},
					{
						"tag": "Ursula Wyss"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.lematin.ch/monde/alep-prepare-reconstruction-titanesque/story/15949402",
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
				"url": "https://www.lematin.ch/monde/alep-prepare-reconstruction-titanesque/story/15949402",
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
		"url": "https://www.zuonline.ch/front/ein-steuerstreit-weniger-fuer-die-zkb/story/31314504",
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
				"url": "https://www.zuonline.ch/front/ein-steuerstreit-weniger-fuer-die-zkb/story/31314504",
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
		"url": "https://www.zsz.ch/horgen/der-beste-elektroinstallateur-europas-kommt-aus-huetten/story/31921047",
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
				"url": "https://www.zsz.ch/horgen/der-beste-elektroinstallateur-europas-kommt-aus-huetten/story/31921047",
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
		"url": "https://www.tdg.ch/geneve/actu-genevoise/visite-pape-prepare-secret-geneve/story/24171745",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "La visite du pape se prépare en secret à Genève",
				"creators": [
					{
						"firstName": "Sébastien",
						"lastName": "Jubin",
						"creatorType": "author"
					}
				],
				"date": "2018-04-18",
				"ISSN": "1010-2248",
				"abstractNote": "Dans 64 jours, le pape François sera en visite à Genève. Discrètement, sa garde rapprochée a repéré les lieux cette semaine.",
				"language": "fr",
				"libraryCatalog": "www.tdg.ch",
				"publicationTitle": "TDG",
				"section": "Genève",
				"url": "https://www.tdg.ch/geneve/actu-genevoise/visite-pape-prepare-secret-geneve/story/24171745",
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
		"url": "https://www.letemps.ch/suisse/cantons-alemaniques-veulent-raboter-montants-laide-sociale",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Des cantons alémaniques veulent raboter les montants de l’aide sociale",
				"creators": [
					{
						"firstName": "Céline",
						"lastName": "Zünd",
						"creatorType": "author"
					}
				],
				"date": "2018-04-17T18:33:00",
				"ISSN": "1423-3967",
				"abstractNote": "Le compromis intercantonal sur la définition du minimum vital est remis en question. Le sujet est au cœur de débats houleux dans plusieurs cantons, qui envisagent de réduire nettement les forfaits d’entretien",
				"language": "fr",
				"libraryCatalog": "www.letemps.ch",
				"publicationTitle": "Le Temps",
				"url": "https://www.letemps.ch/suisse/cantons-alemaniques-veulent-raboter-montants-laide-sociale",
				"attachments": [
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					{
						"tag": "Economie suisse"
					},
					{
						"tag": "Finances publiques"
					},
					{
						"tag": "Impôts"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.tdg.ch/editorial/surveillance-assures-reveil-tardif/story/27369648",
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "Surveillance des assurés: un réveil tardif",
				"creators": [
					{
						"firstName": "Sophie",
						"lastName": "Simon",
						"creatorType": "author"
					}
				],
				"date": "2018-04-27",
				"ISSN": "1010-2248",
				"language": "fr",
				"libraryCatalog": "www.tdg.ch",
				"publicationTitle": "TDG",
				"shortTitle": "Surveillance des assurés",
				"url": "https://www.tdg.ch/editorial/surveillance-assures-reveil-tardif/story/27369648",
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
