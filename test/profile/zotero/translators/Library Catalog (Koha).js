{
	"translatorID": "8e66aa6d-5b2a-4b44-b384-a838e23b8538",
	"label": "Library Catalog (Koha)",
	"creator": "Sebastian Karcher",
	"target": "cgi-bin/koha/opac-(detail|search)",
	"minVersion": "2.1.9",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2012-12-13 18:14:13"
}

/*
	***** BEGIN LICENSE BLOCK *****
	
	KOHA Translator, Copyright © 2012 Sebastian Karcher 
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
	if (url.match(/\/opac-search\.pl\?/)) return "multiple";
	else if (url.match(/\/opac-detail\.pl\?/)) return "book";
}

function doWeb(doc, url) {
	if (detectWeb(doc, url) == "multiple") {
		var articles = [];
		var items = {};
		var titles = doc.evaluate('//span[@class="results_summary"]/span[@class="label"]/a[contains(@href, "opac-detail.pl")]|//span[@class="results_summary"]/preceding-sibling::a[contains(@href, "opac-detail.pl")]', doc, null, XPathResult.ANY_TYPE, null);
		var title;
		while (title = titles.iterateNext()) {
			items[title.href] = title.textContent.trim();
		}
		Zotero.selectItems(items, function (items) {
			if (!items) {
				return true;
			}
			for (var i in items) {
				articles.push(marcURL(i));
			}
			scrape(articles);
		});
	} else {
		scrape(marcURL(url));
	}
}

function scrape(marcurl) {
	Zotero.Utilities.HTTP.doGet(marcurl, function (text) {
		var translator = Zotero.loadTranslator("import");
		translator.setTranslator("a6ee60df-1ddc-4aae-bb25-45e0537be973");
		translator.setString(text);
		translator.setHandler("itemDone", function (obj, item) {
			//editors get mapped as contributors - but so do many others who should be
			// --> for books that don't have an author, turn contributors into editors.
			if (item.itemType=="book"){
				var hasAuthor = false;
				for (var i in item.creators) {
					if (item.creators[i].creatorType=="author") {
						hasAuthor = true;
						break;
					}
				}
				if (!hasAuthor) {
					for (var i in item.creators) {
						if (item.creators[i].creatorType=="contributor") {
						item.creators[i].creatorType="editor";
						}
					}
				}
			}
			item.complete();
		});
		translator.translate();
	}) //doGet end
} 

function marcURL(url){
	var bibnumber = url.match(/(biblionumber=)(\d+)/)[2];
	var host = url.match(/^.+cgi-bin\/koha\//)[0];
	var marcURL = host + "opac-export.pl?format=utf8&op=export&bib=" + bibnumber +"save=Go";
	return marcURL;
}
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://ahuntsic.koha.ccsr.qc.ca/cgi-bin/koha/opac-detail.pl?biblionumber=145770",
		"items": [
			{
				"itemType": "book",
				"creators": [
					{
						"lastName": "Collège Ahuntsic",
						"fieldMode": true
					}
				],
				"notes": [
					{
						"note": "Les finissants et finissantes du Collège Ahuntsic soulignent les connaissances acquises au sein du profil Cinéma et médias en faisant découvrir leurs coups de coeur, « des films qui, à leur façon, les ont marqués par une recherche formelle, une originalité thématique, une authenticité sociologique et/ou une valeur historique. » -- P. 5"
					}
				],
				"tags": [
					"Cinéma"
				],
				"seeAlso": [],
				"attachments": [],
				"title": "Synopsis: revue de cinéma",
				"place": "Montréal",
				"publisher": "Collège Ahuntsic",
				"date": "2011",
				"libraryCatalog": "Library Catalog (Koha)",
				"shortTitle": "Synopsis"
			}
		]
	},
	{
		"type": "web",
		"url": "https://catalogue.univ-lyon3.fr/cgi-bin/koha/opac-search.pl?q=thelen",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://nmwa.kohalibrary.com/cgi-bin/koha/opac-search.pl?q=image&idx=&submit=Search+Catalog",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://ahuntsic.koha.ccsr.qc.ca/cgi-bin/koha/opac-detail.pl?biblionumber=71166",
		"items": [
			{
				"itemType": "book",
				"creators": [
					{
						"firstName": "Véronique",
						"lastName": "Blanchard",
						"creatorType": "editor"
					},
					{
						"firstName": "Régis",
						"lastName": "Revenin",
						"creatorType": "editor"
					},
					{
						"firstName": "Jean-Jacques",
						"lastName": "Yvorel",
						"creatorType": "editor"
					}
				],
				"notes": [
					{
						"note": "« Le sujet préoccupe les jeunes eux-mêmes, bien entendu, mais aussi les adultes qui les entourent, parents, enseignants, travailleurs sociaux, médecins, juges, responsables politiques... Il inquiète, il paraît sulfureux, ou tabou. L'émotion suscitée dans les médias en témoigne : tournantes, tourisme sexuel, \"dédipix\" échangés, pilule du lendemain, difficulté d'assumer son homosexualité, etc. Sur les plateaux de télévision, à la radio ou dans les magazines, la parole est donnée aux \"psy\" ou aux \"témoins\", qui renforcent bien souvent les normes et les idées reçues. En contrepoint, ici sont réunis des historiens, des sociologues, des philosophes : trente-cinq chercheurs qui ont dépouillé les archives et mené l'enquête sur le terrain, en France, en Espagne, aux États-Unis, mais aussi en Argentine, au Cameroun, à Madagascar, en Iran, en Thaïlande, en Nouvelle-Zélande... Ce vaste panorama en trois volets, initiations, interdits, identités, permet de s'interroger sur notre actualité sexuelle : peu réprimée jusqu'à une époque récente, pourquoi la pédophilie est-elle aujourd'hui considérée comme le crime le plus abominable? Quel rôle joue la pornographie dans l'éducation sexuelle? La violence sexuelle des jeunes est-elle plus marquée aujourd'hui? Comment se construisent les identités de genre et les orientations sexuelles chez les jeunes? Faut-il avoir peur des jeunes et de la sexualité? Voilà de quoi alimenter la réflexion individuelle et les débats publics tout à la fois... » -- P. 4 de la couv"
					}
				],
				"tags": [
					"Adolescents",
					"Sexualité",
					"Abus sexuels à l'égard des enfants",
					"Tourisme sexuel",
					"Éducation sexuelle des jeunes",
					"Prostitution juvénile"
				],
				"seeAlso": [],
				"attachments": [],
				"ISBN": "9782746713666",
				"title": "Les jeunes et la sexualité: initiations, interdits, identités (XIXe-XXIe siècle)",
				"place": "Paris",
				"publisher": "Éditions Autrement",
				"date": "2010",
				"numPages": "407",
				"series": "Mutations",
				"seriesNumber": "262",
				"callNumber": "HQ 27 J485",
				"libraryCatalog": "Library Catalog (Koha)",
				"shortTitle": "Les jeunes et la sexualité"
			}
		]
	},
	{
		"type": "web",
		"url": "http://biblio.esd.ipl.pt/cgi-bin/koha/opac-detail.pl?biblionumber=2367",
		"items": [
			{
				"itemType": "book",
				"creators": [
					{
						"firstName": "Úxia",
						"lastName": "Vaello",
						"creatorType": "author"
					},
					{
						"firstName": "Inês",
						"lastName": "Oliveira",
						"creatorType": "author"
					},
					{
						"firstName": "Catarina",
						"lastName": "Câmara",
						"creatorType": "author"
					},
					{
						"firstName": "Bruno",
						"lastName": "Alexandre",
						"creatorType": "author"
					},
					{
						"firstName": "Maria",
						"lastName": "Cerveira",
						"creatorType": "author"
					},
					{
						"firstName": "Célia",
						"lastName": "Cardoso",
						"creatorType": "author"
					},
					{
						"firstName": "Ricardo",
						"lastName": "Carmona",
						"creatorType": "author"
					},
					{
						"firstName": "Catarina",
						"lastName": "Ascensão",
						"creatorType": "author"
					},
					{
						"firstName": "Ana Sofia",
						"lastName": "Leite",
						"creatorType": "author"
					},
					{
						"firstName": "Claúdia",
						"lastName": "Silva",
						"creatorType": "author"
					},
					{
						"firstName": "Diana",
						"lastName": "Alves",
						"creatorType": "author"
					},
					{
						"firstName": "Eliana",
						"lastName": "Campos",
						"creatorType": "author"
					},
					{
						"firstName": "Guida",
						"lastName": "Maurício",
						"creatorType": "author"
					},
					{
						"firstName": "Lib",
						"lastName": "Pitalúa",
						"creatorType": "author"
					},
					{
						"firstName": "Mariana",
						"lastName": "Saraiva",
						"creatorType": "author"
					},
					{
						"firstName": "Francisco",
						"lastName": "Pedro",
						"creatorType": "author"
					},
					{
						"firstName": "João Carlos",
						"lastName": "Andrade",
						"creatorType": "author"
					},
					{
						"firstName": "Miguel",
						"lastName": "Oliveira",
						"creatorType": "author"
					},
					{
						"firstName": "Luísa",
						"lastName": "Taveira",
						"creatorType": "author"
					},
					{
						"lastName": "Escola Superior de Dança",
						"creatorType": "contributor",
						"fieldMode": true
					},
					{
						"lastName": "Escola Vocacional de Dança",
						"creatorType": "contributor",
						"fieldMode": true
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [],
				"language": "por",
				"title": "Dia Mundial da Dança: Dança Caldas 21h30",
				"place": "Lisboa",
				"publisher": "ESD",
				"date": "2005",
				"libraryCatalog": "Library Catalog (Koha)",
				"shortTitle": "Dia Mundial da Dança"
			}
		]
	}
]
/** END TEST CASES **/