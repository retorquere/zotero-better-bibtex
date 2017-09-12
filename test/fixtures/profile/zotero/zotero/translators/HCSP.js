{
	"translatorID": "3e375db7-5f6e-4861-ab8b-3ddb0f4accc9",
	"label": "HCSP",
	"creator": "Joris Muller",
	"target": "^https?://(www\\.)?hcsp\\.fr/explore\\.cgi/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2016-10-31 19:16:45"
}

/*
HCSP Translator
A Zotero's Translator for the website of "Haut Conseil de Santé Publique"
Copyright (C) 2015 Joris Muller

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

// Usage of Zotero.Utilities.xpath() function. Exist only since Zotero 2.1
// https://www.zotero.org/support/dev/client_coding/changes_in_zotero_2.1#xpath_utility_functions
// Zotero.selctItems used only since 3.0
// Then minimal version of Zotero needed is 3.0

function detectWeb(doc, url) {
	/* The URLs have upper or lower case on the website
	depending the way you access to a page */
	if (url.indexOf("avisrapportsdomaine") != -1) {
		return 'report';
	} else if (url.indexOf("avisrapports") != -1 || url.indexOf("AvisRapports") != -1  ) {
		// Detect if there is at last one result
		return getSearchResults(doc) ? 'multiple' : false;
	}
}

function doWeb(doc, url) {

	if (detectWeb(doc, url) == "multiple") {

		var allItems = getSearchResults(doc);

		Zotero.selectItems(allItems, function(items) {
			if (!items) return true;

			var articlesURLs = [];
			
			for (var itemURL in items) {
				articlesURLs.push(itemURL);
			}

			ZU.processDocuments(articlesURLs, scrape);
		  
		})

	} else {
		scrape(doc, url);
	}
}

// For multiple articles
function getSearchResults(doc) {
	// Flag to check if something was found
	var found = false;

	// Titles and URLs of each item are on the third column of the only table
	// This column is the only one with links (<a>)
	var xpath_titles = '//tbody/tr/td/a';
	var titles = ZU.xpath(doc, xpath_titles);

	// Put all the titles and their URLs in the items object
	var allItems = {};

	for (var i = 0; i< titles.length; i++) {
		var nextTitle = titles[i];
		allItems[nextTitle.href] = nextTitle.textContent;
		found = true;
	}

	// if no item found (no result in search), return false, else the items
	return found ? allItems : false;
}

function scrape(doc, url) {

	// init a new Zotero's item
	var newItem = new Zotero.Item("report");

	/*---------- Constants items ----------*/
	newItem.publicationTitle = "Rapport de l'HCSP";
	newItem.language = "fr-FR";
	newItem.institution = "Haut Conseil de la Santé Publique";
	newItem.place = "Paris";

	// Creator is the institution (HCSP)
	// Names of the author are inside the PDFs (if there is one)
	newItem.creators.push({"lastName": "HCSP", "creatorType": "author", "fieldMode": 1});

	/*---------- URL ----------*/
	newItem.url = url;
	
	/*---------- Title ----------*/
	var xpathTitle = '//li[@class="active"]';
	var title = ZU.xpathText(doc, xpathTitle);
	if (title) {
		newItem.title = ZU.trimInternal(title);
	}

	/*---------- Date ----------*/
	// Date is not easy to find because it is not in a named bloc. It is
	// somewhere in one of the <p> in the div 'doc-donnees'
	// Then to find it, use a Regex on each <p> bloc
	var xpathDate = "//div[@id='doc-donnees']/p[contains(text(),'Date du document')]";
	var dateString = ZU.xpathText(doc, xpathDate);
	if (dateString) {
		var regexDate = /\b(\d{2})\/(\d{2})\/(\d{4})\b/;
		var date = dateString.match(regexDate);
		if (date) {
			var dateISO8601 = date[3] + "-" + date[2] + "-" + date[1];
			newItem.date = dateISO8601;
		}
	}
	
	/*---------- Tags ----------*/
	var xpathTags = '//div[@id="doc-donnees"]/span/a';
	var xresultTags = ZU.xpath(doc, xpathTags);

	for (var i = 0; i < xresultTags.length; i++) {
		var actualTag = xresultTags[i].textContent;
		var actualTagTrimmed = actualTag.trim();
		newItem.tags.push(actualTagTrimmed);
	}

	/* --------- abstract -----------*/
	var xpath_abstract = '//div[@class="avistexte"]';
	var abstract_note = ZU.xpathText(doc, xpath_abstract, null, "\n");
	if (abstract_note) {
		newItem.abstractNote = ZU.trimInternal(abstract_note);
	}

	/* ----------- attachment --------- */
	// PDFs are in a div on the right part of the page.
	var xpath_pdf = '//div[@id="doc-donnees"]/p/a[@target="_blank"]';
	// ZU.xpath produce Arrays of HTMLAnchorElement
	var xresultsPdf = ZU.xpath(doc, xpath_pdf);

	// For each PDF anchor get the url and push it
	for (var i = 0; i < xresultsPdf.length; i++) {
		
		var nextResult = xresultsPdf[i];
		var pdfUrl = nextResult.href;

		// Get the first word
		var typeOfDoc = nextResult.textContent.match(/^\w+/i);
		var pdfTitle = typeOfDoc + " HCSP Full Text PDF";

		var one_pdf_attachement = {
			url: pdfUrl,
			title: pdfTitle,
			mimeType: "application/pdf"
		}

		newItem.attachments.push(one_pdf_attachement);
	}

	newItem.complete();
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.hcsp.fr/Explore.cgi/avisrapportsdomaine?clefr=474",
		"items": [
			{
				"itemType": "report",
				"title": "Vaccination contre les infections invasives à méningocoque C au-delà de 24 ans, notamment chez les hommes ayant des relations sexuelles avec d’autres hommes (HSH)",
				"creators": [
					{
						"lastName": "HCSP",
						"creatorType": "author",
						"fieldMode": 1
					}
				],
				"date": "2014-11-07",
				"abstractNote": "Depuis 2012, le nombre de cas signalés d’infection invasive à méningocoque de sérogroupe C (IIM C) augmente en Ile-de-France comme sur le reste du territoire. Sont concernés les adultes âgés de 25 à 49 ans et de 50 ans et plus, en majorité des hommes et notamment ceux ayant des relations sexuelles avec des hommes (HSH) chez qui circule un variant particulier de méningocoque C. Le HCSP rappelle que la protection des adultes âgés de plus de 24 ans, repose sur l’obtention d’une couverture vaccinale élevée dans la tranche d’âge ciblée dans le calendrier vaccinal (1 à 24 ans révolus). Celle ci est nettement insuffisante, chez les adolescents et les adultes jeunes. Le HCSP recommande la vaccination méningococcique C conjuguée pour les HSH ainsi que pour les personnes âgées de 25 ans et plus qui fréquentent les lieux de convivialité ou de rencontre gays. Compte tenu de la pénurie prévisible en doses de vaccin méningococcique conjugué monovalent C, le HCSP recommande, l’utilisation d’un des vaccins tétravalents conjugués ACWY pour la vaccination des adultes concernés par cet avis. L’utilisation de ce vaccin chez des personnes susceptibles de voyager présente l’avantage d’une protection plus large. Une protection de longue durée vis-à-vis du méningocoque de sérogroupe C est aussi attendue avec ce type de vaccin dans cette catégorie de population. Le schéma vaccinal recommandé est celui correspondant aux AMM des vaccins méningococciques conjugués et comporte une seule dose de vaccin.",
				"institution": "Haut Conseil de la Santé Publique",
				"language": "fr-FR",
				"libraryCatalog": "HCSP",
				"place": "Paris",
				"url": "http://www.hcsp.fr/Explore.cgi/avisrapportsdomaine?clefr=474",
				"attachments": [
					{
						"title": "Avis HCSP Full Text PDF",
						"mimeType": "application/pdf"
					}
				],
				"tags": [
					"Adulte",
					"HSH",
					"Infection invasive à méningocoque C",
					"Maladies transmissibles",
					"Méningocoque C",
					"Vaccin méningococcique C",
					"Vaccin tétravalent",
					"Vaccination"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.hcsp.fr/Explore.cgi/avisrapportsdomaine?clefr=518",
		"items": [
			{
				"itemType": "report",
				"title": "Prise en charge médicale des personnes atteintes par le virus Zika",
				"creators": [
					{
						"lastName": "HCSP",
						"creatorType": "author",
						"fieldMode": 1
					}
				],
				"date": "2015-07-28",
				"abstractNote": "Le virus Zika est un arbovirus. La transmission est presque exclusivement vectorielle par les moustiques du genre Aedes qui sont également vecteurs de la dengue et du chikungunya. Depuis 2007, des épidémies d’infections à virus Zika sont survenues en Micronésie, en Polynésie française, en Nouvelle-Calédonie et une épidémie, identifiée en mai 2015, sévit actuellement au Brésil. Le HCSP fait le point des connaissances sur le virus Zika, les modalités de transmission, la situation épidémiologique, l’expression clinique des infections par ce virus et les moyens de diagnostic biologique. Compte tenu de la présence des moustiques vecteurs et des flux de voyageurs, le HCSP a évalué le risque d’introduction de la maladie Zika et l’impact épidémique possible dans les départements français d’Amérique (DFA), à La Réunion, à Mayotte ainsi que dans les départements métropolitains où Aedes albopictus est implanté. Le HCSP fait des recommandations en termes de stratégie de surveillance épidémiologique de la maladie Zika, de diagnostic biologique en distinguant les zones où co-circule le virus de la dengue, et de prise en charge des patients.",
				"institution": "Haut Conseil de la Santé Publique",
				"language": "fr-FR",
				"libraryCatalog": "HCSP",
				"place": "Paris",
				"url": "http://www.hcsp.fr/Explore.cgi/avisrapportsdomaine?clefr=518",
				"attachments": [
					{
						"title": "Avis HCSP Full Text PDF",
						"mimeType": "application/pdf"
					},
					{
						"title": "Rapport HCSP Full Text PDF",
						"mimeType": "application/pdf"
					}
				],
				"tags": [
					"Aedes albopictus®",
					"Arbovirose",
					"Arbovirus",
					"Diagnostic biologique",
					"Maladies transmissibles",
					"Surveillance",
					"Virus Zika"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.hcsp.fr/Explore.cgi/avisrapportsdomaine?clefr=9",
		"items": [
			{
				"itemType": "report",
				"title": "Recommandations sanitaires pour les voyageurs 2007",
				"creators": [
					{
						"lastName": "HCSP",
						"creatorType": "author",
						"fieldMode": 1
					}
				],
				"date": "2007-06-12",
				"abstractNote": "Ces recommandations ont été élaborées par le comité des maladies liées aux voyages et des maladies d’importation (CMVI), désormais rattaché à la commission sécurité sanitaire du Haut Conseil de la santé publique. Elles concernent tous les voyageurs, quelles que soient leur destination et les conditions du voyage, pour : les vaccinations, le paludisme, les risques liés aux insectes et autres animaux, la diarrhée, les risques accidentels et également les précautions à prendre en fonction des personnes, l’hygiène et la trousse à pharmacie et les aspects administratifs. Les recommandations sanitaires pour les voyageurs 2007 sont publiées dans le Bulletin épidémiologique hebdomadaire, n° 24 du 12 juin 2007 et téléchargeables sur le site de l’Institut de veille sanitaire : http://www.invs.sante.fr/beh/2007/24/index.htm.",
				"institution": "Haut Conseil de la Santé Publique",
				"language": "fr-FR",
				"libraryCatalog": "HCSP",
				"place": "Paris",
				"url": "http://www.hcsp.fr/Explore.cgi/avisrapportsdomaine?clefr=9",
				"attachments": [
					{
						"title": "Rapport HCSP Full Text PDF",
						"mimeType": "application/pdf"
					}
				],
				"tags": [
					"Diarrhée",
					"Maladies transmissibles",
					"Paludisme",
					"Recommandations sanitaires",
					"Vaccination",
					"Voyageur"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/
