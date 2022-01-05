{
	"translatorID": "8e66aa6d-5b2a-4b44-b384-a838e23b8538",
	"label": "Library Catalog (Koha)",
	"creator": "Sebastian Karcher",
	"target": "^https?://[^/]+/cgi-bin/koha/opac-(detail|search|shelves)\\.pl\\?",
	"minVersion": "2.1.9",
	"maxVersion": "",
	"priority": 260,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2015-10-17 18:23:11"
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
	if (url.search(/\/opac-(search|shelves)\.pl\?/)!=-1 && getSearchResults(doc, true)) return "multiple";
	if (url.indexOf("/opac-detail.pl?")!=-1) return "book";
}

function getSearchResults(doc, checkOnly) {
	var items = {}, found = false;
	var resultContainer = doc.getElementsByClassName('searchresults')[0];
	if (!resultContainer) return false;
	
	resultContainer = doc.getElementsByTagName('tr');
	for (var i=0; i<resultContainer.length; i++) {
		//newer KOHA versions, e.g. http://catalog.bywatersolutions.com
		var item = ZU.xpath(resultContainer[i], '(.//a[@class="title" and contains(@href, "opac-detail.pl")])[1]')[0];
		if (!item){
			//older KOHA versions, e.g. https://catalogue.univ-lyon3.fr/
			item = ZU.xpath(resultContainer[i], '(.//a[contains(@href, "opac-detail.pl")])[1]')[0];
		}
		
		if (!item) continue;
		
		if (checkOnly) return true;
		found = true;
		items[item.href] = ZU.trimInternal(item.textContent);
	}
	
	return found ? items : false;
}

function doWeb(doc, url) {
	if (detectWeb(doc, url) == "multiple") {
		Zotero.selectItems(getSearchResults(doc), function (items) {
			if (!items) return true;
			
			var articles = [];
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
		// Use MARC translator
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
				"title": "Synopsis: revue de cinéma",
				"creators": [
					{
						"lastName": "Collège Ahuntsic",
						"creatorType": "editor",
						"fieldMode": true
					}
				],
				"date": "2011",
				"abstractNote": "Les finissants et finissantes du Collège Ahuntsic soulignent les connaissances acquises au sein du profil Cinéma et médias en faisant découvrir leurs coups de coeur, « des films qui, à leur façon, les ont marqués par une recherche formelle, une originalité thématique, une authenticité sociologique et/ou une valeur historique. » -- P. 5",
				"libraryCatalog": "Library Catalog (Koha)",
				"place": "Montréal",
				"publisher": "Collège Ahuntsic",
				"shortTitle": "Synopsis",
				"attachments": [],
				"tags": [
					"Cinéma"
				],
				"notes": [],
				"seeAlso": []
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
				"title": "Les jeunes et la sexualité: initiations, interdits, identités (XIXe-XXIe siècle)",
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
				"date": "2010",
				"ISBN": "9782746713666",
				"abstractNote": "« Le sujet préoccupe les jeunes eux-mêmes, bien entendu, mais aussi les adultes qui les entourent, parents, enseignants, travailleurs sociaux, médecins, juges, responsables politiques... Il inquiète, il paraît sulfureux, ou tabou. L'émotion suscitée dans les médias en témoigne : tournantes, tourisme sexuel, \"dédipix\" échangés, pilule du lendemain, difficulté d'assumer son homosexualité, etc. Sur les plateaux de télévision, à la radio ou dans les magazines, la parole est donnée aux \"psy\" ou aux \"témoins\", qui renforcent bien souvent les normes et les idées reçues. En contrepoint, ici sont réunis des historiens, des sociologues, des philosophes : trente-cinq chercheurs qui ont dépouillé les archives et mené l'enquête sur le terrain, en France, en Espagne, aux États-Unis, mais aussi en Argentine, au Cameroun, à Madagascar, en Iran, en Thaïlande, en Nouvelle-Zélande... Ce vaste panorama en trois volets, initiations, interdits, identités, permet de s'interroger sur notre actualité sexuelle : peu réprimée jusqu'à une époque récente, pourquoi la pédophilie est-elle aujourd'hui considérée comme le crime le plus abominable? Quel rôle joue la pornographie dans l'éducation sexuelle? La violence sexuelle des jeunes est-elle plus marquée aujourd'hui? Comment se construisent les identités de genre et les orientations sexuelles chez les jeunes? Faut-il avoir peur des jeunes et de la sexualité? Voilà de quoi alimenter la réflexion individuelle et les débats publics tout à la fois... » -- P. 4 de la couv",
				"callNumber": "HQ 27 J485",
				"libraryCatalog": "Library Catalog (Koha)",
				"numPages": "407",
				"place": "Paris",
				"publisher": "Éditions Autrement",
				"series": "Mutations",
				"seriesNumber": "262",
				"shortTitle": "Les jeunes et la sexualité",
				"attachments": [],
				"tags": [
					"Abus sexuels à l'égard des enfants",
					"Adolescents",
					"Éducation sexuelle des jeunes",
					"Prostitution juvénile",
					"Sexualité",
					"Tourisme sexuel"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://rdl.koha.ccsr.qc.ca/cgi-bin/koha/opac-search.pl?q=test",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://catalog.bywatersolutions.com/cgi-bin/koha/opac-search.pl?idx=&q=thelen&branch_group_limit=",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://librarytestnew-opac.usj.edu.mo/cgi-bin/koha/opac-shelves.pl?viewshelf=3&sortfield=",
		"items": "multiple"
	}
]
/** END TEST CASES **/