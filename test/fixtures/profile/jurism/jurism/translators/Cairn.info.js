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
	"lastUpdated": "2017-11-13 19:29:53"
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
		"url": "http://www.cairn.info/revue-d-economie-du-developpement-2012-4.htm",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://www.cairn.info/resultats_recherche.php?searchTerm=artiste",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://www.cairn.info/publications-de-Topalov-Christian--1020.htm",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://www.cairn.info/resume.php?ID_ARTICLE=RESS_521_0065",
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
				"abstractNote": "Le savoir est une activité coopérative essentielle pour les sociétés industrielles. Base de leur modèle économique, il produit par ailleurs de nombreux bénéfices matériels, socio-politiques et distants, en particulier au travers de sa diffusion. Dans ce contexte, il devient important de déterminer les principes qui devraient orienter la répartition des coûts qu’une telle diffusion implique. La Recommandation de la Commission européenne du 17 juillet 2012 va dans ce sens en proposant de rendre gratuit l’accès aux résultats des recherches financées par des fonds publics. Elle offre ainsi un cadre idéal pour discuter de la juste répartition des coûts de diffusion du savoir., Knowledge is a cooperative activity, which is essential to industrial societies. Basis of their economic model, it also produces numerous material, socio-political and distant benefits. In this context, it becomes important to determine the principles that should orientate the reparation of the costs of knowledge diffusion. The Recommendation of the European Commission of July 17th 2012 goes in this direction by proposing to make free the access to research results financed by public funds. It then offers an ideal framework for discussing the just repartition of the costs of knowledge diffusion.",
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
					"bénéfices sociaux",
					"libre accès",
					"publications académiques",
					"recherche",
					"État"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.cairn.info/resume.php?ID_ARTICLE=RHIS_121_0049",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Le mouvement pétitionnaire pour la restauration d'Henri V (automne 1873-hiver 1874). Tactique politique et expression d'un légitimisme populaire, Abstract",
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
				"abstractNote": "Résumé1873 marque le dernier temps du possible pour une éventuelle restauration monarchique dans la personne du comte de Chambord. Le mouvement pétitionnaire populaire qui naît à l’automne 1873 permet à un peuple royaliste de faire irruption sur la scène politique, en s’appropriant un des outils codifiés sous la Révolution : le droit de pétition. Au-delà du refus du prince exprimé dans sa lettre de Salzbourg (27 octobre 1873) d’abandonner son drapeau blanc et qui empêche la restauration monarchique, les milliers de pétitions royalistes tentèrent de faire entendre les voix habituellement muettes d’artisans et d’agriculteurs, de citadins et de ruraux, d’intellectuels et d’illettrés, d’hommes et de femmes du peuple de la diversité française. L’Ouest bocager et le Midi, le Nord et les pays riverains de la Garonne affirment leur foi « inséparatiste » suivant en cela celle du prince en exil : à la fois royaliste en politique et catholique en religion. Malgré son importance, ce mouvement pétitionnaire apparaît comme le dernier sursaut d’une époque révolue ; quelques pétitions seulement ont un écho à la Chambre des députés. Cela explique en partie son échec à faire pression sur des parlementaires qui sont davantage attentifs à tracer une voie médiane entre monarchie et république dans le dessein de préserver l’avenir du pays., 1873 is the last opportunity for an eventual restoration of the monarchy in France, and the last chance for the Comte de Chambord to assume the crown. The popular movement of petitions which arose during the autumn of 1873 allowed the royalist people to burst into political action. Beyond the prince’s refusal in his Letter of Salzbourg (27th October 1873) to yield his « Drapeau blanc » (white flag) thus preventing the restoration of the monarchy, thousands of royalist petitions attempted to let resonate the usually mute voices of craftsmen and farmers, city dwellers and countrymen, intellectuals and illiterates, men and women from almost all origins of France. The West bocage lands (Brittany, the Vendée), the South lands (particularly the Gard), departments of the North and counties all along the Garonne river claim like « the King » in Exile their strong and undivided faith: royalism and Catholicism above all. In spite of its importance, the campaign of petitions seems to be like the last expression of former times. Only a few of these petitions are dealt with in The Chamber of Deputies. This is partly why the movement of 1873 fails as the Deputies are more interested in preserving in such unsteady times the future of France by finding a middle road between monarchy and a republican system of government.",
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
					"assemblée nationale",
					"député",
					"légitimisme",
					"pétition",
					"restauration",
					"royaliste"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.cairn.info/resume.php?ID_ARTICLE=RFS_523_0537",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Transformation de l'État ou changement de régime ? De quelques confusions en théorie et sociologie de l'État, A changing State or regime change ? On a few points of confusion in theory and sociology of the State., Staatsveränderung oder Regimewechsel ? Zu einigen Verwirrungen in Theorie und Soziologie des Staats., ¿ La transformación del Estado o una reforma de régimen ? Algunas confuciones en la teoría y la sociología del Estado.",
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
				"abstractNote": "Cet article a pour objet la question de la définition de l’État afin de rendre compte de ses transformations contemporaines. Fermement inscrits dans la tradition wébérienne, les auteurs développent une critique des travaux, qu’ils soient néomarxistes ou néowébériens, mesurant le changement de l’État contemporain par rapport à l’État tel qu’il a été défini pendant les Trente Glorieuses. La critique porte à la fois sur la périodisation et sur la conceptualisation. Partant d’une conception minimaliste de l’État défini en termes de fonctions (sécurité) et de ses moyens, de ses institutions, ils mettent en évidence la confusion d’une partie de la littérature et suggèrent de bien différencier la question de l’État de celle du gouvernement. Soucieux de réhabiliter la longue durée de l’État, ils s’appuient tout d’abord sur les travaux de l’École de Cambridge d’histoire de la pensée politique et leur méthode dite « Ideas in context », afin de montrer la lente émergence de l’État et de l’idée de l’État, invalidant ainsi toute perspective de transformation radicale de période courte. Prenant des points de comparaison plus espacés dans le passé, ils suggèrent au contraire la remarquable permanence de l’État. Ils s’appuient ensuite sur la théorie de l’État constitutionnel de Gianfranco Poggi pour affiner leur conception minimaliste de l’État. Enfin, ils mobilisent la notion de régime développée par Raymond Aron pour caractériser une partie des transformations observées, labellisées transformations de l’État de manière erronée puisqu’elles concernent le gouvernement et la politique. Cette proposition est testée à partir des travaux de Colin Crouch sur le keynésianisme privé., The focus here is how to define the State in such a way as to account for contemporary changes in it. Firmly anchored in the Weberian tradition, the authors develop a critique of both neo-Marxist and neo-Weberian studies that measure change in the contemporary state by comparing it to the State as it was defined during the thirty-year post-World War II economic boom. The critique targets both periodization and conceptualization. Starting with a minimalist notion of the State defined in terms of functions (security) and means as well as institutions, the authors bring to light the confusion afflicting a part of the literature and suggest the importance of clearly differentiating the question of the State from that of government. Concerned to rehabilitate the longue durée of the State, they first cite Cambridge School studies in the history of political thought with their « Ideas in context » method to show the slow emergence of both the State and the idea of the State, thereby invalidating any perspective that would assert radical change occurring over a short period. Comparing more temporally distant points in the past, they point up what is in fact the remarkable endurance of the State. They then cite Gianfranco Poggi’s theory of the constitutional State to refine their own minimalist conception. Lastly, they mobilize Raymond Aron’s notion of regime to characterize some of the changes that have been observed : those changes have been misnamed changes in the State since they actually concern not the State but government and politics. That proposition is then tested using Colin Crouch’s studies on privatized Keynesianism., Der vorliegende Aufsatz beschäftigt sich mit der Definition des Staates, um heutige Veränderungen hervorzuheben. Fest gestützt auf die Webersche Tradition entwickeln die Verfasser eine Kritik der neomarxistischen oder neoweberschen Arbeiten, die die Veränderungen des heutigen Staats messen an Vergleichen zum Staat, wie er in den 30 « goldenen Nachkriegsjahren » definiert wurde. Diese Kritik betrifft sowohl die zeitliche Begrenzung als auch das Konzept selbst. Sie gehen von einem minimalistischen Konzept des Staats in seiner Funktion (Sicherheitsfunktion) und in seinen Mitteln aus sowie von seinen Institutionen, unterstreichen die Wirren eines Teils der Fachliteratur und schlagen vor, die Frage zum Staat streng von der Frage zur Regierung zu trennen. Zunächst gestützt auf die Arbeiten der Schule der Geschichte des politischen Denkens und auf die sog. Methode der « Ideas in context » der Universität Cambridge möchten sie die Langlebigkeit des Staats als solcher rehabilitieren und somit die lange Entstehungsgeschichte des Staats und des Staatsgedankens aufzeigen, was für sie jegliche Perspektive der kurzzeitigen radikalen Staatsänderung ausschließt. Durch zeitlich weit auseinander liegende Vergleiche unterstreichen sie im Gegenteil die bemerkenswerte Dauerhaftigkeit des Staats. Anhand der Theorie des Konstitutionsstaats nach Gianfranco Poggi verfeinern sie anschließend ihr Konzept des Minimalstaats und mithilfe des von Raymond Aron entwickelten Begriffs des Regimes charakterisieren sie schließlich einen Teil der festgestellten Veränderungen, die irrtümlich als Staatsveränderungen bezeichnet werden, da sie die Regierung und die Politik betreffen. Sie unterwerfen diesen Vorschlag dem Test der Arbeiten von Colin Crouch zum Privaten Keynesianismus., Este artículo enfoca el problema de la definición del Estado con el fin de comprender sus innovaciones contemporáneas. Completamente fieles de la tradición weberiana, los autores desarrollan una crítica de los trabajos ; sean estos neomarxistas o neoweberianos evaluando el cambio del Estado contemporáneo en relación al Estado tal como a sido definido durante los Treinta Gloriosos. La crítica se manifiesta a la vez sobre la periodicidad y sobre la conceptualización. Partiendo de una concepción minimista del Estado definido en término de funciones (la seguridad) y como de sus medios, de sus instituciones, ponen en evidencia la confusión de una parte de la literatura y sugieren diferenciar de mejor manera el problema del Estado con el gobierno. Cuidadosos de rehabilitar la extensa durabilidad del Estado, basándose primero en los trabajos de la escuela de Cambridge sobre la historia del pensamiento político y de su método conocido como « Ideas in context », con el fin de mostrar la lenta aparición del Estado y la idea del Estado, invalidando así toda perspectiva de transformación radical de corto período. Tomando del pasado puntos de comparación más espaciados, al contrario sugieren la extraordinaria consistencia del Estado. Para afinar su concepción minimista del Estado se apoyan después sobre la teoría del, Estado constitucional de Gianfranco Poggi. Para especificar una parte de las innovaciones observadas, innovaciones etiquetadas del Estado de manera errónea puesto que conciernen al gobierno y la política. Finalmente movilizan la noción de régimen desarrollada por Raymond Aron. Esta proposición es evaluada a partir de los trabajos de Colin Crouch sobre el keynesianismo privado.",
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
		"url": "http://www.cairn.info/jeu-d-echecs-comme-representation--9782728835904-page-111.htm",
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
				"date": "2014-07-02",
				"ISBN": "9782728835904",
				"abstractNote": "Dans La Seconde Surprise de l’amour, Marivaux a choisi de représenter une marquise, récemment séparée de son mari (la mort de celui-ci précédant le début de la pièce), qui a décidé de rompre avec tous les hommes. « Eh ! Que m’importe qu’il reste des hommes », dit-elle en s’adressant à sa suivante, Lisette. Pour remédier à son désespoir, la Marquise a engagé un bibliothécaire, Hortensius, une figure...",
				"bookTitle": "Le jeu d'échecs comme représentation",
				"language": "fr",
				"libraryCatalog": "Cairn.info",
				"pages": "111-119",
				"publisher": "Éditions Rue d'Ulm",
				"shortTitle": "Des figurines de chair et de sang (sur l'échiquier de la passion), d'après une mise en scène de Daniel Mesguich",
				"url": "https://www.cairn.info/jeu-d-echecs-comme-representation--9782728835904-page-111.htm",
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
