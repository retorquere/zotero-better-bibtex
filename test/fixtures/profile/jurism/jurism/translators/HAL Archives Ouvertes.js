{
	"translatorID": "f20f91fe-d875-47e7-9656-0abb928be472",
	"label": "HAL Archives Ouvertes",
	"creator": "Sebastian Karcher",
	"target": "^https?://hal\\.archives-ouvertes\\.fr",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2017-12-21 03:11:03"
}

/*
	***** BEGIN LICENSE BLOCK *****
	HAL translator
	Copyright © 2012-2014 Sebastian Karcher 
	
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
	if (url.search(/\/search\/index\//)!=-1) return "multiple";
	if (url.search(/\index\.php\?halsid=|\.fr\/[a-z]+-\d+/)!=-1) return findItemType(doc, url);
}

function findItemType(doc, url){
	var itemType= ZU.xpathText(doc, '//div[contains(@class, "label")]');
	//Z.debug(itemType)
	var typeMap = {
		"Books": "book",
		"Ouvrage (y compris édition critique et traduction)": "book",
		"Book sections": "bookSection",
		"Chapitre d'ouvrage": "bookSection",
		"Conference papers": "conferencePaper",
		"Communication dans un congrès": "conferencePaper",
		"Directions of work or proceedings": "book",
		"Direction d'ouvrage, Proceedings": "book",
		"Journal articles": "journalArticle",
		"Article dans des revues": "journalArticle",
		"Lectures": "presentation",
		"Cours": "presentation",
		"Other publications": "book",  //this could also be report, not sure here but bibtex guesses book
		"Autre publication": "book",  //this could also be report, not sure here but bibtex guesses book		
		"Patents": "patent",
		"Brevet": "patent",
		"Preprints, Working Papers, ...": "manuscript",
		"Pré-publication, Document de travail": "manuscript",
		"Reports": "report",
		"Rapport": "report",
		"Theses": "thesis", 
		"Thèse": "thesis"
	}
	if (typeMap[itemType]) return typeMap[itemType];
	else if (url.indexOf("medihal-")!=-1) return "artwork";
	else return "journalArticle";
}

function doWeb(doc, url) {
	var articles = new Array();
	if (detectWeb(doc, url) == "multiple") {
		var items = {};
		var titles = doc.evaluate('//strong/a[@data-original-title="Display the resource" or @data-original-title="Voir la ressource"]', doc, null, XPathResult.ANY_TYPE, null);
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
			Zotero.Utilities.processDocuments(articles, scrape)
		});
	} else {
		//work on PDF pages
		if (url.search(/\/document$/) != -1 ) {
			var articleURL = url.replace(/\/document$/, "")
			//Z.debug(articleURL)
			ZU.processDocuments(articleURL, scrape);
		}
		else scrape(doc, url);
	}
}

function scrape(doc, url) {
	var bibtexUrl = url.replace(/#.+|\/$/, "") + "/bibtex";
	var abstract = ZU.xpathText(doc, '//div[@class="abstract-content"]');
	var pdfUrl = ZU.xpathText(doc, '//meta[@name="citation_pdf_url"]/@content'); 
	//Z.debug("pdfURL " + pdfUrl)
	ZU.doGet(bibtexUrl, function (bibtex) {
		//Z.debug(bibtex)
		var translator = Zotero.loadTranslator("import");
		translator.setTranslator("9cb70025-a888-4a29-a210-93ec52da40d4");
		translator.setString(bibtex);
		translator.setHandler("itemDone", function (obj, item) {
			if (abstract){
				item.abstractNote=abstract.replace(/(Abstract|Résumé)\s*:/, "");
			}
			if (pdfUrl){	
				item.attachments = [{
					url: pdfUrl,
					title: "HAL PDF Full Text",
					mimeType: "application/pdf"
				}];
			}
			else {
				item.attachments = [{
					document: doc,
					title: "HAL Snapshot",
					mimeType: "text/html"
				}];
			}
			if (detectWeb(doc, url)=="artwork"|detectWeb(doc, url)=="presentation"){
				item.itemType= detectWeb(doc, url);
			}
			item.complete();
		});
		translator.translate();
	})
}
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://hal.archives-ouvertes.fr/hal-00328427",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Tropopause referenced ozone climatology and inter-annual variability (1994–2003) from the MOZAIC programme",
				"creators": [
					{
						"firstName": "V.",
						"lastName": "Thouret",
						"creatorType": "author"
					},
					{
						"firstName": "Jean-Pierre",
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
				"date": "March 2006",
				"abstractNote": "The MOZAIC programme collects ozone and water vapour data using automatic equipment installed on board five long-range Airbus A340 aircraft flying regularly all over the world since August 1994. Those measurements made between September 1994 and August 1996 allowed the first accurate ozone climatology at 9–12 km altitude to be generated. The seasonal variability of the tropopause height has always provided a problem when constructing climatologies in this region. To remove any signal from the seasonal and synoptic scale variability in tropopause height we have chosen in this further study of these and subsequent data to reference our climatology to the altitude of the tropopause. We define the tropopause as a mixing zone 30 hPa thick across the 2 pvu potential vorticity surface. A new ozone climatology is now available for levels characteristic of the upper troposphere (UT) and the lower stratosphere (LS) regardless of the seasonal variations of the tropopause over the period 1994–2003. Moreover, this new presentation has allowed an estimation of the monthly mean climatological ozone concentration at the tropopause showing a sine seasonal variation with a maximum in May (120 ppbv) and a minimum in November (65 ppbv). Besides, we present a first assessment of the inter-annual variability of ozone in this particular critical region. The overall increase in the UTLS is about 1%/yr for the 9 years sampled. However, enhanced concentrations about 10–15 % higher than the other years were recorded in 1998 and 1999 in both the UT and the LS. This so-called \"1998–1999 anomaly\" may be attributed to a combination of different processes involving large scale modes of atmospheric variability, circulation features and local or global pollution, but the most dominant one seems to involve the variability of the North Atlantic Oscillation (NAO) as we find a strong positive correlation (above 0.60) between ozone recorded in the upper troposphere and the NAO index. A strong anti-correlation is also found between ozone and the extremes of the Northern Annular Mode (NAM) index, attributing the lower stratospheric variability to dynamical anomalies. Finally this analysis highlights the coupling between the troposphere, at least the upper one, and the stratosphere, at least the lower one.",
				"issue": "4",
				"itemID": "thouret:hal-00328427",
				"libraryCatalog": "HAL Archives Ouvertes",
				"pages": "1051",
				"publicationTitle": "Atmospheric Chemistry and Physics",
				"url": "https://hal.archives-ouvertes.fr/hal-00328427",
				"volume": "6",
				"attachments": [
					{
						"title": "HAL PDF Full Text",
						"mimeType": "application/pdf"
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
		"url": "https://hal.archives-ouvertes.fr/hal-00472553v1",
		"items": [
			{
				"itemType": "book",
				"title": "Les sites préhistoriques de la région de Fejej, Sud-Omo, Éthiopie, dans leur contexte stratigraphique et paléontologique.",
				"creators": [
					{
						"firstName": "Henry",
						"lastName": "De Lumley",
						"creatorType": "author"
					},
					{
						"firstName": "Beyene",
						"lastName": "Yonas",
						"creatorType": "author"
					}
				],
				"date": "2004",
				"abstractNote": "Parmi les nombreux sites paléontologiques et préhistoriques de la région de Fejej, dans la région Sud-Omo, en Éthiopie, le site FJ-1, situé à seulement 5 km au nord de la frontière avec le Kenya et daté de 1,96 Ma, parfaitement en place, très riche en faune et en industrie, étudié avec une approche interdisciplinaire, apporte des informations exceptionnelles pour reconstituer l'habitat, le comportement et le mode de vie, ainsi que les paléoenvironnements des premiers hommes. Des Homo habilis s'étaient installés sur un bourrelet de sables fluviatiles, grossier et meuble, bordé par un dénivelé de 50 cm de hauteur, à proximité de la berge d'une rivière, pendant une période d'étiage, et au coeur d'une plaine d'inondation. Peu de temps sans doute après leur départ, en période de pluie une remontée des eaux de la rivière a provoqué l'enfouissement du sol d'occupation par de nouveaux dépôt de sables qui ont protégé l'ensemble sans le déplacer. La bonne conservation du matériel archéologique et paléontologique, l'enfouissement rapide et le maintien des objets en place, les nombreux remontages effectués, que ce soit en ce qui concerne las artefacts lithiques ou les reste fauniques, les traces de fracturations anthropiques et la non-intervention d'autres prédateurs carnivores, sont, entre autre les conditions exceptionnelles de mise en place et d'étude de ce gisement, qui nous apporte autant de renseignements rares et précieux sur un épisode de la vie des hominidés d'il y a presque 2 millions d'années.",
				"itemID": "delumley:hal-00472553",
				"libraryCatalog": "HAL Archives Ouvertes",
				"numPages": "637 p.",
				"publisher": "Éditions Recherche sur les Civilisations",
				"url": "https://hal.archives-ouvertes.fr/hal-00472553",
				"attachments": [
					{
						"title": "HAL Snapshot",
						"mimeType": "text/html"
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
		"url": "https://hal.archives-ouvertes.fr/hal-00973502",
		"items": [
			{
				"itemType": "report",
				"title": "Learning Centre de l'UHA : comment accompagner son ouverture et inciter les futurs usagers à exploiter ce nouveau centre de ressources ?",
				"creators": [
					{
						"firstName": "Bernard",
						"lastName": "Coulibaly",
						"creatorType": "author"
					},
					{
						"firstName": "Hélène",
						"lastName": "Hermann",
						"creatorType": "author"
					}
				],
				"date": "March 2014",
				"itemID": "coulibaly:hal-00973502",
				"libraryCatalog": "HAL Archives Ouvertes",
				"shortTitle": "Learning Centre de l'UHA",
				"url": "https://hal.archives-ouvertes.fr/hal-00973502",
				"attachments": [
					{
						"title": "HAL PDF Full Text",
						"mimeType": "application/pdf"
					}
				],
				"tags": [
					"Bibliothèque universitaire",
					"ICT appropriation",
					"Learning Centre",
					"Pedagogy",
					"University Library",
					"appropriation TICE",
					"innovation",
					"pédagogie universitaire"
				],
				"notes": [
					{
						"note": "<p>140 pages</p>"
					}
				],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://hal.archives-ouvertes.fr/medihal-00772952v1",
		"items": [
			{
				"itemType": "artwork",
				"title": "Children playing in a park",
				"creators": [
					{
						"firstName": "François",
						"lastName": "Gipouloux",
						"creatorType": "author"
					}
				],
				"date": "March 2012",
				"abstractNote": "Description : Children performing for a crowd of passersby in a park in Kunming. (Enfants jouant dans un parc à Kunming Photo d'enfants jouant dans un parc à Kunming",
				"itemID": "gipouloux:medihal-00772952",
				"libraryCatalog": "HAL Archives Ouvertes",
				"url": "https://medihal.archives-ouvertes.fr/medihal-00772952",
				"attachments": [
					{
						"title": "HAL PDF Full Text",
						"mimeType": "application/pdf"
					}
				],
				"tags": [
					"China",
					"Kunming",
					"children",
					"park",
					"town"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://hal.archives-ouvertes.fr/search/index/q/%2A/docType_s/THESE/",
		"items": "multiple"
	}
]
/** END TEST CASES **/
