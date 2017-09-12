{
	"translatorID": "96a92909-f23c-4f16-ae93-1948c2459932",
	"label": "medes",
	"creator": "Philipp Zumstein",
	"target": "^https?://(www\\.)?medes\\.com/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2016-12-27 13:01:58"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2015 Philipp Zumstein

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
	if (url.indexOf('idmedes=')>-1 || url.indexOf('/publication/')>-1) {
		return "journalArticle";
	} else if (getSearchResults(doc, true)) {
		return "multiple";
	}
}

function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = ZU.xpath(doc, '//li[contains(@class, "resultados")]/div[contains(@class, "row")]');
	for (var i=0; i<rows.length; i++) {
		var id = ZU.xpathText(rows[i], './/input[@id="PublicationHidden"]/@value');
		var href = "/Public/ResumePublication.aspx?idmedes=" + id;
		var title = ZU.xpathText(rows[i], '.');
		title = ZU.trimInternal(title);
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
			var articles = new Array();
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
	translator.setTranslator('951c027d-74ac-47d4-a107-9c3069ab7b48');//https://github.com/zotero/translators/blob/master/Embedded%20Metadata.js
	translator.setDocument(doc);
	
	translator.setHandler('itemDone', function (obj, item) {
		//issn
		if (item.ISSN) {
			item.ISSN = item.ISSN.replace(/(\d{4})(\d{4})/, "$1-$2");
		}
		
		//doi
		var doiLink = doc.getElementById('aDoi');
		if (doiLink && !item.DOI) {
			item.DOI = doiLink.textContent;
		}
		
		//abstract
		var abstractLink = doc.getElementById('TextControl');
		if (abstractLink) {
			item.abstractNote = abstractLink.textContent;
		}
		
		//pdf
		var pdfLink = doc.getElementById('aFullText');
		if (pdfLink) {
			item.attachments.push({
				"url": pdfLink.href,
				"title": "Full Text PDF",
				"mimeType": "application/pdf"
			});
		}
		
		item.complete();
	});
	
	translator.translate();

}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://www.medes.com/Public/ResumePublication.aspx?idmedes=88102",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "El consumo de tabaco como automedicación de depresión/ansiedad entre los jóvenes: resultados de un estudio con método mixto",
				"creators": [
					{
						"firstName": "N.",
						"lastName": "Carceller-Maicas",
						"creatorType": "author"
					},
					{
						"firstName": "S.",
						"lastName": "Ariste",
						"creatorType": "author"
					},
					{
						"firstName": "A.",
						"lastName": "Martínez-Hernáez",
						"creatorType": "author"
					},
					{
						"firstName": "M. A.",
						"lastName": "Martorell-Poveda",
						"creatorType": "author"
					},
					{
						"firstName": "M.",
						"lastName": "Correa-Urquiza",
						"creatorType": "author"
					},
					{
						"firstName": "S. M.",
						"lastName": "DiGiacomo",
						"creatorType": "author"
					}
				],
				"date": "2014",
				"ISSN": "0214-4840",
				"abstractNote": "El consumo de tabaco y los problemas de salud mental de tipo depresivo/ansioso son dos fenómenos que suelen iniciarse en la adolescencia y juventud con cierta co-ocurrencia. Ambos fenómenos guardan una relación bidireccional que, en el caso de los jóvenes, la hipótesis de automedicación parece explicar de forma más exhaustiva que otras opciones. El objetivo de este estudio es explorar la relación entre consumo de tabaco, síntomas de depresión y ansiedad y percepción de los jóvenes sobre el uso del tabaco como forma de automedicación. Para ello se seleccionaron 105 jóvenes (17-21 años) de un estudio sociológico longitudinal previo considerando tres grupos de participantes: 1) sujetos con diagnóstico de depresión/ ansiedad en anteriores oleadas, 2) sujetos con malestar depresivo/ ansioso autopercibido y sin diagnóstico previo y 3) sujetos control. Se aplicó un cuestionario mixto cuantitativo/cualitativo de consumo de substancias y las escalas BDI-II de depresión y GHQ en su cribado de ansiedad-depresión, así como la escala MISS (Mannheim Interview on Social Support). Los resultados indican que los sujetos afectados por síntomas de depresión/ansiedad en la adolescencia se inician más tarde en el consumo de cigarrillos, pero los que son fumadores alegan principalmente como motivo la automedicación. La asociación entre consumo habitual de tabaco y niveles de depresión de la escala BDI no fue significativa para la muestra general, pero sí para los jóvenes varones (OR: 6,22, IC95%, 1,06-36,21, p=.042). Las iniciativas antitabáquicas dirigidas a los jóvenes deben considerar los problemas de malestar emocional y el consumo de tabaco como forma de automedicación.",
				"issue": "1",
				"language": "ES",
				"libraryCatalog": "www.medes.com",
				"pages": "34-45",
				"publicationTitle": "Adicciones",
				"shortTitle": "El consumo de tabaco como automedicación de depresión/ansiedad entre los jóvenes",
				"url": "https://medes.com/publication/88102",
				"volume": "26",
				"attachments": [
					{
						"title": "Snapshot"
					},
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					}
				],
				"tags": [
					"Adolescentes",
					"Ansiedad",
					"Automedicación",
					"Conducta del adolescente",
					"Depresión",
					"Medes",
					"Medicina en español",
					"Tabaco",
					"Trastornos adictivos"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://medes.com/publication/96231",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Descripción de las enfermedades autoinmunes acompañantes de la diabetes mellitus tipo 1 en un área sanitaria",
				"creators": [
					{
						"firstName": "P.",
						"lastName": "del Villar-Guerra",
						"creatorType": "author"
					},
					{
						"firstName": "D.",
						"lastName": "de Luis-Román",
						"creatorType": "author"
					},
					{
						"firstName": "M.",
						"lastName": "González-Sagrado",
						"creatorType": "author"
					},
					{
						"firstName": "J. C.",
						"lastName": "Hernando-Mayor",
						"creatorType": "author"
					},
					{
						"firstName": "F.",
						"lastName": "Centeno-Malfaz",
						"creatorType": "author"
					},
					{
						"firstName": "R.",
						"lastName": "Del Villar-Galán",
						"creatorType": "author"
					}
				],
				"date": "2015",
				"DOI": "10.1016/j.avdiab.2014.12.004",
				"ISSN": "1134-3230",
				"abstractNote": "Fundamento y objetivo : Describir la patología autoinmune al inicio y en el seguimiento asociadas a la diabetes mellitus tipo 1 (DM1), así como exponer la importancia del cribado al comienzo y en el seguimiento de la DM1 en nuestro entorno de trabajo.  Pacientes y métodos : Estudio observacional descriptivo transversal del periodo 2001-2011 de pacientes con inicio de DM1 menores de 19 años, correspondientes al Área de Salud Oeste de Valladolid. A todos los pacientes de nuestra muestra durante el período estudiado se realizaron estudios para las enfermedades comórbiles de la DM1 (síndromes autoinmunes poliendocrinos, enfermedad de Addison, anemia perniciosa, vitíligo, enfermedad tiroidea, enfermedad celíaca).  Resultados : Se realizaron anticuerpos antitiroideos al ingreso (anticuerpos antiperoxidasa, anti-TPO) en el 85,9% de los pacientes (67 casos), siendo positivos en el 23,9% (16 casos) tanto al inicio como en el seguimiento. La patología tiroidea más común fue la tiroiditis linfocitaria crónica. Se realizó al inicio de la DM1 el cribado de la enfermedad celíaca en el 75,6% (59 casos) de los pacientes, siendo positivos el 3,4% de los pacientes (2 casos), y el 1,7% (un caso) en el seguimiento. Ningún paciente de nuestra población presentó síndromes autoinmunes poliendocrinos, enfermedad de Addison, anemia perniciosa, ni vitíligo.  Conclusiones : Quizá con las recomendaciones internacionales actuales y el consenso médico se pueda realizar el cribado rutinario de las enfermedades autoinmunes comórbiles con DM1 de manera estandarizada. Es conveniente realizar el cribado de enfermedades autoinmunes relacionadas con la DM1, tanto en el momento del diagnóstico de la enfermedad como periódicamente en el seguimiento posterior.",
				"issue": "1",
				"language": "ES",
				"libraryCatalog": "medes.com",
				"pages": "30-35",
				"publicationTitle": "Avances en Diabetología",
				"url": "https://medes.com/publication/96231",
				"volume": "31",
				"attachments": [
					{
						"title": "Snapshot"
					},
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					}
				],
				"tags": [
					"Anemia perniciosa",
					"Diabetes mellitus",
					"Diabetes mellitus insulino-dependiente",
					"Endocrinología",
					"Enfermedad celíaca",
					"Enfermedad de Addison",
					"Enfermedades autoinmunes",
					"Estudios descriptivos",
					"Estudios observacionales",
					"Estudios retrospectivos",
					"Estudios transversales",
					"Medes",
					"Medicina en español",
					"Tiroiditis autoinmune",
					"Vitíligo"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.medes.com/Public/PublicationsResults.aspx?term=diabetes",
		"items": "multiple"
	}
]
/** END TEST CASES **/