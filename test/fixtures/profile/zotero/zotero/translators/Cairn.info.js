{
	"translatorID": "f46cc903-c447-47d6-a2cf-c75ed22dc96b",
	"label": "Cairn.info",
	"creator": "Sebastian Karcher, Sylvain Machefert and Nicolas Chachereau",
	"target": "^https?://www\\.cairn\\.info/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2018-03-17 13:48:44"
}

/*
	Translator
   Copyright (C) 2013 Sebastian Karcher

   This program is free software: you can redistribute it and/or modify
   it under the terms of the GNU Affero General Public License as published by
   the Free Software Foundation, either version 3 of the License, or
   (at your option) any later version.

   This program is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   GNU Affero General Public License for more details.

   You should have received a copy of the GNU Affero General Public License
   along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

function detectWeb(doc,url) {
	breadcrumbPage = ZU.xpathText(doc, '//div[@id="breadcrump"]/a[last()]');
	if (breadcrumbPage == "Ouvrage collectif") {
		return "book";
	} else if (breadcrumbPage == "Article") {
		return "journalArticle";
	} else if (breadcrumbPage == "Chapitre") {
		return "bookSection";
	} else if (breadcrumbPage == "Résumé") {
		typeDocument = ZU.xpathText(doc, '//div[@id="breadcrump"]/a[2]');
		if (typeDocument == "Revues") {
			return "journalArticle";
		} else if (typeDocument == "Ouvrages") {
			return "bookSection";
		}
	}

	if (ZU.xpathText(doc, '//div[contains(@class, "list_articles")]//div[contains(@class, "article") or contains(@class, "articleBookList")]')) {
		return "multiple";
	}
}


function doWeb(doc,url) {
	if (detectWeb(doc, url) == "multiple") {
		var hits = {};
		var urls = [];
		var title;
		var link;
		var resultsrow = ZU.xpath(doc, '//div[contains(@class, "list_articles")]/div[contains(@class, "article")]');
		for (var i=0; i<resultsrow.length; i++) {
			title = ZU.xpathText(resultsrow[i], './/div[@class="meta"]//div[@class="title"]');
			if (!title) {
				title = ZU.xpathText(resultsrow[i], './/div[@class="wrapper_title"]/h2/text()');
			}
			link = ZU.xpathText(resultsrow[i], './/div[@class="state"]/a[1]/@href');
			//Z.debug(title + ": " + link)
			hits[link] = title.replace(/^[\s\,]+/, "").trim();
		}
		Z.selectItems(hits, function(items) {
			if (items == null) return true;
			for (var j in items) {
				urls.push(j);
			}
			ZU.processDocuments(urls, scrape);
		});
	} else {
		scrape(doc, url);
	}
}


function scrape(doc, url) {
	var type = detectWeb(doc, url);
	// We call the Embedded Metadata translator to do the actual work
	var translator = Zotero.loadTranslator("web");
	translator.setTranslator("951c027d-74ac-47d4-a107-9c3069ab7b48");
	translator.setDocument(doc);
	translator.setHandler("itemDone", function(obj, item) {
		
		item.itemType = type;
		
		item.title = item.title.replace(/^Chapitre \d+\./, '');
		
		if (type == "bookSection" && item.publicationTitle == "Cairn.info") {
			delete item.publicationTitle;
			// otherwise the bookTitle will be overwritten with that
		}
		
		// Cairn.info uses non-standard keywords:
		// we import them here, as the Embedded Metadata translator
		// cannot catch them.
		item.tags = [];
		var keywords = ZU.xpathText(doc, '//meta[@name="article-mot_cle"]/@content');
		if (keywords) {
			keywords = keywords.split(/\s*[,;]\s*/);
			for (var i=0; i<keywords.length; i++) {
				if (keywords[i].trim()) {
					item.tags.push(keywords[i]);
				}
			}
		}

		for (var i=0; i<item.attachments.length; i++) {
			if (item.attachments[i].mimeType == 'application/pdf') {
				// attachment always contains a https url, error when user access through http. We need to use the current protocol
				if (doc.location.protocol == "http") {
					item.attachments[i].url = item.attachments[i].url.replace("https", "http");					
				}
			}
		}

		// Correct volume and issue information
		if (item.volume) {
			if (item.volume.search(/^n°/i) != -1) {
				item.issue = item.volume.split(/n°/i)[1].trim();
				item.volume = '';
			} else if (item.volume.search(/^Vol./i) != -1) {
				item.volume = item.volume.split(/Vol./i)[1].trim();
			}
			if (item.volume.search(/^\d+-\d+$/) != -1) {
				var volume = item.volume.split('-');
				item.volume = volume[0];
				item.issue = volume[1];
			}
		}
		
		if (!item.date || item.date == '0000-00-00') {
			item.date = ZU.xpathText(doc, '//meta[@name="DCSext.annee_tomaison"]/@content');
		}
		
		if (!item.pages) {
			item.pages = ZU.xpathText(doc, '//meta[@name="DCSext.doc_nb_pages"]/@content');
		}
		
		var doi = ZU.xpathText(doc, '//li[contains(., "DOI :")]');
		if (!item.DOI && doi) {
			item.DOI = doi.replace('DOI :', '');
		}

		// Other fixes
		delete item.libraryCatalog;
		item.title = ZU.unescapeHTML(item.title);
		if (item.abstractNote) {
			item.abstractNote = ZU.unescapeHTML(item.abstractNote);
		}

		item.complete();
	});
	translator.translate();
}


/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://www.cairn.info/revue-d-economie-du-developpement-2012-4.htm",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://www.cairn.info/resultats_recherche.php?searchTerm=artiste",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://www.cairn.info/publications-de-Topalov-Christian--1020.htm",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://www.cairn.info/resume.php?ID_ARTICLE=RESS_521_0065",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Les enjeux normatifs et politiques de la diffusion de la recherche",
				"creators": [
					{
						"firstName": "Xavier",
						"lastName": "Landes",
						"creatorType": "author"
					}
				],
				"date": "2014-05-13",
				"ISSN": "0048-8046",
				"abstractNote": "Le savoir est une activité coopérative essentielle pour les sociétés industrielles. Base de leur modèle économique, il produit par ailleurs de nombreux bénéfices matériels, socio-politiques et distants, en particulier au travers de sa diffusion. Dans ce contexte, il devient important de déterminer les principes qui devraient orienter la répartition des coûts qu’une telle diffusion implique. La Recommandation de la Commission européenne du 17 juillet 2012 va dans ce sens en proposant de rendre gratuit l’accès aux résultats des recherches financées par des fonds publics. Elle offre ainsi un cadre idéal pour discuter de la juste répartition des coûts de diffusion du savoir.",
				"issue": "1",
				"language": "fr",
				"libraryCatalog": "Cairn.info",
				"pages": "65-92",
				"publicationTitle": "Revue européenne des sciences sociales",
				"url": "https://www.cairn.info/resume.php?ID_ARTICLE=RESS_521_0065",
				"volume": "52",
				"attachments": [
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					},
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					{
						"tag": "bénéfices sociaux"
					},
					{
						"tag": "libre accès"
					},
					{
						"tag": "publications académiques"
					},
					{
						"tag": "recherche"
					},
					{
						"tag": "État"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.cairn.info/resume.php?ID_ARTICLE=RHIS_121_0049",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Le mouvement pétitionnaire pour la restauration d'Henri V (automne 1873-hiver 1874). Tactique politique et expression d'un légitimisme populaire",
				"creators": [
					{
						"firstName": "Éric",
						"lastName": "Derennes",
						"creatorType": "author"
					}
				],
				"date": "2012-04-17",
				"DOI": "10.3917/rhis.121.0049",
				"ISSN": "0035-3264",
				"abstractNote": "Résumé1873 marque le dernier temps du possible pour une éventuelle restauration monarchique dans la personne du comte de Chambord. Le mouvement pétitionnaire populaire qui naît à l’automne 1873 permet à un peuple royaliste de faire irruption sur la scène politique, en s’appropriant un des outils codifiés sous la Révolution : le droit de pétition. Au-delà du refus du prince exprimé dans sa lettre de Salzbourg (27 octobre 1873) d’abandonner son drapeau blanc et qui empêche la restauration monarchique, les milliers de pétitions royalistes tentèrent de faire entendre les voix habituellement muettes d’artisans et d’agriculteurs, de citadins et de ruraux, d’intellectuels et d’illettrés, d’hommes et de femmes du peuple de la diversité française. L’Ouest bocager et le Midi, le Nord et les pays riverains de la Garonne affirment leur foi « inséparatiste » suivant en cela celle du prince en exil : à la fois royaliste en politique et catholique en religion. Malgré son importance, ce mouvement pétitionnaire apparaît comme le dernier sursaut d’une époque révolue ; quelques pétitions seulement ont un écho à la Chambre des députés. Cela explique en partie son échec à faire pression sur des parlementaires qui sont davantage attentifs à tracer une voie médiane entre monarchie et république dans le dessein de préserver l’avenir du pays.",
				"issue": "661",
				"language": "fr",
				"libraryCatalog": "Cairn.info",
				"pages": "49-99",
				"publicationTitle": "Revue historique",
				"url": "https://www.cairn.info/resume.php?ID_ARTICLE=RHIS_121_0049",
				"attachments": [
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					},
					{
						"title": "Snapshot"
					}
				],
				"tags": [
					{
						"tag": "assemblée nationale"
					},
					{
						"tag": "député"
					},
					{
						"tag": "légitimisme"
					},
					{
						"tag": "pétition"
					},
					{
						"tag": "restauration"
					},
					{
						"tag": "royaliste"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.cairn.info/resume.php?ID_ARTICLE=RFS_523_0537",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Transformation de l'État ou changement de régime ? De quelques confusions en théorie et sociologie de l'État",
				"creators": [
					{
						"firstName": "Paul Du",
						"lastName": "Gay",
						"creatorType": "author"
					},
					{
						"firstName": "Alan",
						"lastName": "Scott",
						"creatorType": "author"
					}
				],
				"date": "2011-10-26",
				"DOI": "10.3917/rfs.523.0537",
				"ISSN": "0035-2969",
				"abstractNote": "Cet article a pour objet la question de la définition de l’État afin de rendre compte de ses transformations contemporaines. Fermement inscrits dans la tradition wébérienne, les auteurs développent une critique des travaux, qu’ils soient néomarxistes ou néowébériens, mesurant le changement de l’État contemporain par rapport à l’État tel qu’il a été défini pendant les Trente Glorieuses. La critique porte à la fois sur la périodisation et sur la conceptualisation. Partant d’une conception minimaliste de l’État défini en termes de fonctions (sécurité) et de ses moyens, de ses institutions, ils mettent en évidence la confusion d’une partie de la littérature et suggèrent de bien différencier la question de l’État de celle du gouvernement. Soucieux de réhabiliter la longue durée de l’État, ils s’appuient tout d’abord sur les travaux de l’École de Cambridge d’histoire de la pensée politique et leur méthode dite « Ideas in context », afin de montrer la lente émergence de l’État et de l’idée de l’État, invalidant ainsi toute perspective de transformation radicale de période courte. Prenant des points de comparaison plus espacés dans le passé, ils suggèrent au contraire la remarquable permanence de l’État. Ils s’appuient ensuite sur la théorie de l’État constitutionnel de Gianfranco Poggi pour affiner leur conception minimaliste de l’État. Enfin, ils mobilisent la notion de régime développée par Raymond Aron pour caractériser une partie des transformations observées, labellisées transformations de l’État de manière erronée puisqu’elles concernent le gouvernement et la politique. Cette proposition est testée à partir des travaux de Colin Crouch sur le keynésianisme privé.",
				"issue": "3",
				"language": "fr",
				"libraryCatalog": "Cairn.info",
				"pages": "537-557",
				"publicationTitle": "Revue française de sociologie",
				"shortTitle": "Transformation de l'État ou changement de régime ?",
				"url": "https://www.cairn.info/resume.php?ID_ARTICLE=RFS_523_0537",
				"volume": "52",
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
		"url": "https://www.cairn.info/jeu-d-echecs-comme-representation--9782728835904-p-111.htm",
		"items": [
			{
				"itemType": "bookSection",
				"title": "Des figurines de chair et de sang (sur l'échiquier de la passion), d'après une mise en scène de Daniel Mesguich : La Seconde Surprise de l'amour de Marivaux",
				"creators": [
					{
						"firstName": "Sébastien",
						"lastName": "Lenglet",
						"creatorType": "author"
					}
				],
				"date": "2009",
				"ISBN": "9782728835904",
				"abstractNote": "Dans La Seconde Surprise de l’amour, Marivaux a choisi de représenter une marquise, récemment séparée de son mari (la mort de celui-ci précédant le début de la pièce), qui a décidé de rompre avec tous les hommes. « Eh ! Que m’importe qu’il reste des hommes », dit-elle en s’adressant à sa suivante, Lisette. Pour remédier à son désespoir, la Marquise a engagé un bibliothécaire, Hortensius, une figure...",
				"bookTitle": "Le jeu d'échecs comme représentation",
				"language": "fr",
				"libraryCatalog": "Cairn.info",
				"pages": "111-119",
				"publisher": "Éditions Rue d'Ulm",
				"shortTitle": "Des figurines de chair et de sang (sur l'échiquier de la passion), d'après une mise en scène de Daniel Mesguich",
				"url": "https://www.cairn.info/jeu-d-echecs-comme-representation--9782728835904-p-111.htm",
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
