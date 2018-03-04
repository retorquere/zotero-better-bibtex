{
	"translatorID": "daad5868-6e6a-414e-b2da-14fa013879fc",
	"label": "Erudit",
	"creator": "Philipp Zumstein",
	"target": "^https?://(www\\.)?erudit\\.org/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2018-01-02 22:48:58"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2018 Philipp Zumstein
	
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


// attr()/text() v2
function attr(docOrElem,selector,attr,index){var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector);return elem?elem.getAttribute(attr):null;}function text(docOrElem,selector,index){var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector);return elem?elem.textContent:null;}


function detectWeb(doc, url) {
	var type = attr(doc, 'meta[property="og:type"]', 'content');
	if ((url.includes('/revues/') || url.includes('/journals/')) && type == "article") {
		return "journalArticle";
	} else if (getSearchResults(doc, true)) {
		return "multiple";
	}
}


function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = doc.querySelectorAll('.result h3 a, .article-item h6 a');
	for (let i=0; i<rows.length; i++) {
		let href = rows[i].href;
		let title = ZU.trimInternal(rows[i].textContent);
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
	var abstractFR = text(doc, '#resume-fr>p');
	var abstractEN = text(doc, '#resume-en>p');
	var abstract;
	if (url.includes('/en/')) {
		abstract = abstractEN || abstractFR;
	} else {
		abstract = abstractFR || abstractEN;
	}
	var translator = Zotero.loadTranslator('web');
	// Embedded Metadata
	translator.setTranslator('951c027d-74ac-47d4-a107-9c3069ab7b48');
	translator.setDocument(doc);
	
	translator.setHandler('itemDone', function (obj, item) {
		if (abstract) {
			item.abstractNote = abstract.replace(/^\s*/mg, '').replace(/\n/g, ' ');
		}
		if (item.publicationTitle) {
			item.publicationTitle = ZU.unescapeHTML(item.publicationTitle);
		}
		item.complete();
	});

	translator.translate();
}


/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://www.erudit.org/fr/revues/ri/1989-v44-n2-ri1155/050499ar/",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Employee Performance as a Function of Job Orientation and Job Design",
				"creators": [
					{
						"firstName": "Carol",
						"lastName": "Sales",
						"creatorType": "author"
					},
					{
						"firstName": "Eliahu",
						"lastName": "Levanoni",
						"creatorType": "author"
					},
					{
						"firstName": "Robert",
						"lastName": "Knoop",
						"creatorType": "author"
					}
				],
				"date": "1989",
				"DOI": "10.7202/050499ar",
				"ISSN": "0034-379X, 1703-8138",
				"abstractNote": "Les approches contemporaines à l'étude de la structuration des tâches ont démontré la nécessité d'un ajustement approprié entre l'individu et le poste qu'il occupe. À l'occasion d'un examen récent de la complexité des tâches, un auteur concluait qu'il fallait considérer à la fois les caractéristiques de la tâche et celles de la personne pour apprécier le rendement au travail.De nombreux auteurs ont exprimé des doutes à propos de la justesse de la méthodologie utilisée pour mesurer simultanément les différences individuelles et les caractéristiques d'un poste. Essentiellement, la méthodologie recourt à des moyens qui se fondent sur l'appréciation propre du salarié pour déterminer les caractéristiques d'une tâche. Un auteur distingue entre la complexité objective d'une tâche et la complexité subjective que le titulaire en perçoit. En conséquence, des employés différents définissent d'une façon différente les caractéristiques d'un même poste. Quelques recherchistes estiment que les individus ont tendance à s'accorder dans leurs appréciations en général. Selon ce point de vue, si les travailleurs affirment que leur poste comporte les caractéristiques cotées, il est fort probable qu'ils décriront leurs attitudes touchant celui-ci d'une manière positive. De plus, certains chercheurs soutiennent que les corrélations substantielles souvent notées dans les études en matière de conception des tâches ne peuvent pas indiquer les rapports réels, mais être plutôt le produit de l'ordre des échelles utilisées dans une étude particulière. De façon à surmonter ces déficiences, les caractéristiques des tâches ont été évaluées dans la présente étude par les supérieurs immédiats des employés.On a beaucoup appuyé sur le rôle des différences entre les individus dans les recherches en matière de structuration des tâches. La force du désir de progrès (FDP), notion abstraite traduisant l'aspiration innée de l'individu de se réaliser et de se développer, est l'une des variables relatives aux différences individuelles qui est la plus fréquemment vérifiée. Cependant, l'utilité de cette formule comme variable régulatrice dans la recherche sur la structuration des tâches a été mise en doute dans des travaux récents.    La présente étude examine l'orientation des tâches en tant que substitut à la FDP comme modérateur entre les exigences de l'emploi, le rendement, la satisfaction au travail et le degré de motivation de l'employé. L'adaptation au poste d'orientation des tâches est une tendance individuelle, un attribut relativement stable fondé sur le système des valeurs d'un individu. On peut identifier deux catégories principales d'orientation : l'une intrinsèque, où l'employé recherche les responsabilités, le défi, le progrès; l'autre, extrinsèque, lui fait préférer les bonnes conditions de travail, un salaire équitable et des relations amicales avec les contremaîtres.L'échantillonnage de cette enquête comprenait 333 salariés appartenant à 47 groupes de travail différents et leurs contremaîtres dans 18 organisations diversifiées. Pour chaque employé, les contremaîtres ont rempli les formulaires suivants : le formulaire de notation des emplois (lesquels évaluaient cinq caractéristiques du poste) et les neuf points de l'échelle de rendement. Pour leur part, les employés ont rempli l'échelle des comportements au travail (mesure de l'orientation des tâches), l'échelle de satisfaction au travail de l'index descriptif du poste et un court formulaire portant sur la motivation au travail.Le processus statistique principal comprenait une régression hiérarchique. Les résultats ont indiqué que l'orientation des tâches atténuait dans une certaine mesure le rapport entre les caractéristiques du poste et le rendement en général (qualité du rendement et non-quantité). On n'a remarqué aucun effet de modération en ce qui a trait au travail même et à la motivation. En ce qui touche la performance, on peut estimer que les travailleurs qui aiment les responsabilités, les défis et l'avancement réagissent d'une façon plus positive à des postes dont les exigences sont plus considérables, parce que ces individus cherchent à combler les aspirations plus hautes qu'ils découvrent dans le contenu de la tâche. Les emplois dont les exigences sont plus élevées offrent en conséquence l'occasion voulue de satisfaire leurs ambitions professionnelles, compte tenu des connaissances du titulaire.Le manque d'orientation des tâches comme agent modérateur du rapport entre les cinq caractéristiques, d'une part, la satisfaction au travail et la motivation, d'autre part, peuvent s'expliquer parce que les contremaîtres ont évalué les caractéristiques de la tâche de leurs subordonnés, tandis que ce sont les employés eux-mêmes qui ont estimé leur degré de satisfaction et de motivation au travail. Il est normal que des divergences de perception existent entre contremaîtres et subordonnés.À l'avenir, la recherche devrait scruter les comparaisons qu'il y a lieu d'établir entre les réactions des contremaîtres et celles de leurs subordonnés et le rôle joué par le type de direction en plus de l'orientation des tâches en tant que variable modératrice dans les études en matière de structuration des tâches.",
				"issue": "2",
				"journalAbbreviation": "ri",
				"language": "en",
				"libraryCatalog": "www.erudit.org",
				"pages": "409-420",
				"publicationTitle": "Relations industrielles / Industrial Relations",
				"url": "http://www.erudit.org/fr/revues/ri/1989-v44-n2-ri1155/050499ar/",
				"volume": "44",
				"attachments": [
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					},
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
		"url": "https://www.erudit.org/en/journals/ri/1989-v44-n2-ri1155/050499ar/",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Employee Performance as a Function of Job Orientation and Job Design",
				"creators": [
					{
						"firstName": "Carol",
						"lastName": "Sales",
						"creatorType": "author"
					},
					{
						"firstName": "Eliahu",
						"lastName": "Levanoni",
						"creatorType": "author"
					},
					{
						"firstName": "Robert",
						"lastName": "Knoop",
						"creatorType": "author"
					}
				],
				"date": "1989",
				"DOI": "10.7202/050499ar",
				"ISSN": "0034-379X, 1703-8138",
				"abstractNote": "Two weaknesses in previous job design research were examined: the overuse of self-report measurements and the questionable use of Growth Need Strength as a moderator between job characteristics and employee performance. Job orientation was hypothesized to moderate the relationship between job characteristics and employee performance. Results indicated that job orientation moderated the relationship between job characteristics and quality of performance but not between job characteristics and quantity of performance, job involvement and satisfaction with work.",
				"issue": "2",
				"journalAbbreviation": "ri",
				"language": "en",
				"libraryCatalog": "www.erudit.org",
				"pages": "409-420",
				"publicationTitle": "Relations industrielles / Industrial Relations",
				"url": "http://www.erudit.org/en/journals/ri/1989-v44-n2-ri1155/050499ar/",
				"volume": "44",
				"attachments": [
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					},
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
		"url": "https://www.erudit.org/en/journals/documentation/2015-v61-n2-3-documentation02049/1032808ar/",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Les techniques de la documentation : un programme de formation collégiale en évolution",
				"creators": [
					{
						"firstName": "Stéphane",
						"lastName": "Ratté",
						"creatorType": "author"
					}
				],
				"date": "2015",
				"DOI": "10.7202/1032808ar",
				"ISSN": "0315-2340, 2291-8949",
				"abstractNote": "In order to maintain the relevance of the curriculum and to ensure current labour market requirements, a revision of the library technology programme of the Collège de Maisonneuve was launched in 2014. The department identified a number of challenges that were assembled around seven themes: cataloguing, public services, records management, automated information systems, project management, professional attitudes and field experience. This article presents an overview of these challenges and establishes a portrait of the library technology programme. It also enables a better understanding of the competencies expected of a library technician.",
				"issue": "2-3",
				"journalAbbreviation": "documentation",
				"language": "fr",
				"libraryCatalog": "www.erudit.org",
				"pages": "45-52",
				"publicationTitle": "Documentation et bibliothèques",
				"shortTitle": "Les techniques de la documentation",
				"url": "http://www.erudit.org/en/journals/documentation/2015-v61-n2-3-documentation02049/1032808ar/",
				"volume": "61",
				"attachments": [
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					},
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
		"url": "https://www.erudit.org/fr/recherche/?basic_search_term=zotero&basic_search_field=all&advanced_search_operator1=AND&advanced_search_term1=&advanced_search_field1=all&advanced_search_operator2=AND&advanced_search_term2=&advanced_search_field2=all&advanced_search_operator3=AND&advanced_search_term3=&advanced_search_field3=all&advanced_search_operator4=AND&advanced_search_term4=&advanced_search_field4=all&advanced_search_operator5=AND&advanced_search_term5=&advanced_search_field5=all&pub_year_start=1900&pub_year_end=2017",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://www.erudit.org/fr/revues/memoires/2016-v8-n1-memoires02805/",
		"items": "multiple"
	}
]
/** END TEST CASES **/
