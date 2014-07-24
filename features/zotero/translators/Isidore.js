{
	"translatorID": "43a53465-0354-42fd-aba9-dc1af8be7061",
	"label": "Isidore",
	"creator": "Guillaume Adreani and Aurimas Vinckevicius",
	"target": "https?://(www\\.)?rechercheisidore\\.fr/search/(resource/)?\\?",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2014-04-28 21:06:26"
}

var typeMap = {
	'Articles': 'journalArticle',
	'Ouvrages': 'book',
	'Actualités': 'newspaperArticle',
	'Colloques et conférences': 'conferencePaper',
	'Mémoires, Thèses et HDR': 'thesis',
	'Page Web': 'webpage',
	'Photos et images': 'artwork',
	'Manuscrits': 'manuscript'
};

function getSearchResults(doc) {
	return ZU.xpath(doc, '//div[@class="ressource_bloc"]\
		[./p[@class="titre_ressource"]\
			and ./p[not(@class)][1]/a[not(@onclick)][1]/@href]');
}

function detectWeb(doc, url) {
	if(getSearchResults(doc).length) return "multiple";

	var type = ZU.xpathText(doc, '//meta[@name="DC.type"]/@content');
	if(type) return typeMap[type] || 'journalArticle';	//default to journalArticle if we can't recognize it
}

function doWeb(doc, url) {
	var type = detectWeb(doc, url);
	if(type == 'multiple') {
		var res = getSearchResults(doc);
		var items = {};
		var title, href;
		for(var i=0, n=res.length; i<n; i++) {
			title = ZU.xpathText(res[i], './p[@class="titre_ressource"]');
			url = ZU.xpathText(res[i], './p[not(@class)][1]/a[not(@onclick)][1]/@href');
			if(title && url) {
				items[url] = title;
			}
		}

		Zotero.selectItems(items, function(selectedItems) {
			if(!selectedItems) return true;

			var urls = [];
			for(var i in selectedItems) {
				urls.push(i);
			}
			ZU.processDocuments(urls, scrape);
		})
	} else {
		scrape(doc, url, type);
	}
}

function scrape(doc, url, type) {
	if(!type) type = detectWeb(doc, url);
	if(!type) return;	//this should not happen, but if it does, allow to proceed importing remaining items

	var translator = Zotero.loadTranslator("web");
	//use embedded metadata
	translator.setTranslator("951c027d-74ac-47d4-a107-9c3069ab7b48");
	translator.setDocument(doc);

	translator.setHandler("itemDone", function(obj, item) {
		//this is a catalog translator. URL should not be filled in
		item.attachments.push({
			title: "Isidore Record",
			url: item.url,
			snapshot: false
		});

		//we can get a link to the real source
		item.url = ZU.xpathText(doc, '//a[@class="fiche_titre"]/@href');
		if (!item.language) item.language = ZU.xpathText(doc, '//td[@class="titre_meta" and contains(text(), "Langue")]/following-sibling::td')

		item.complete();
	});

	translator.getTranslatorObject(function(trans) {
		trans.itemType = type;
		trans.doWeb(doc, url);
	});
}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://rechercheisidore.fr/search/resource/?uri=10670/1.v5517l",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"firstName": "J.",
						"lastName": "Hadamard",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [
					"Géométrie",
					"géométrie",
					"Addition"
				],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Snapshot"
					},
					{
						"title": "Isidore Record",
						"snapshot": false
					}
				],
				"title": "Sur la géométrie anallagmatique (addition à l'article précédent)",
				"publisher": "Cellule Mathdoc",
				"institution": "Cellule Mathdoc",
				"company": "Cellule Mathdoc",
				"label": "Cellule Mathdoc",
				"distributor": "Cellule Mathdoc",
				"date": "1927",
				"reportType": "Articles",
				"letterType": "Articles",
				"manuscriptType": "Articles",
				"mapType": "Articles",
				"thesisType": "Articles",
				"websiteType": "Articles",
				"presentationType": "Articles",
				"postType": "Articles",
				"audioFileType": "Articles",
				"url": "http://www.numdam.org/item?id=NAM_1927_6_2__314_0",
				"libraryCatalog": "rechercheisidore.fr",
				"accessDate": "CURRENT_TIMESTAMP",
				"language": "Français"
			}
		]
	},
	{
		"type": "web",
		"url": "http://rechercheisidore.fr/search/resource/?uri=10670/1.ny16mx",
		"items": [
			{
				"itemType": "book",
				"creators": [
					{
						"firstName": "Florence",
						"lastName": "Weber",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [
					"Sociologie",
					"Anthropologie sociale et ethnologie",
					"Géographie",
					"Economies et finances",
					"Géographie",
					"Ethnologie",
					"anthropologie",
					"Études urbaines",
					"Économie",
					"Migrations",
					"immigrations",
					"minorités",
					"Études du politique",
					"Sociologie",
					"tisserand"
				],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Snapshot"
					},
					{
						"title": "Isidore Record",
						"snapshot": false
					}
				],
				"title": "Introduction",
				"publisher": "MESR",
				"institution": "MESR",
				"company": "MESR",
				"label": "MESR",
				"distributor": "MESR",
				"date": "2000",
				"abstractNote": "Weber Florence, . Introduction. In: Genèses, 41, 2000. Comment décrire les transactions. pp. 2-4.",
				"reportType": "Ouvrages",
				"letterType": "Ouvrages",
				"manuscriptType": "Ouvrages",
				"mapType": "Ouvrages",
				"thesisType": "Ouvrages",
				"websiteType": "Ouvrages",
				"presentationType": "Ouvrages",
				"postType": "Ouvrages",
				"audioFileType": "Ouvrages",
				"url": "http://www.persee.fr/web/revues/home/prescript/article/genes_1155-3219_2000_num_41_1_1644",
				"libraryCatalog": "rechercheisidore.fr",
				"accessDate": "CURRENT_TIMESTAMP",
				"language": "Français"
			}
		]
	},
	{
		"type": "web",
		"url": "http://rechercheisidore.fr/search/resource/?uri=10670/1.c2463y",
		"items": [
			{
				"itemType": "conferencePaper",
				"creators": [
					{
						"firstName": "Liens",
						"lastName": "socio",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [
					"Education",
					"Mars",
					"Pensée",
					"Philosophie",
					"Philosophie",
					"Philosophie",
					"Psychisme",
					"Psychologie",
					"Psychologie",
					"Psychologie",
					"Psychologie de l'éducation",
					"Sciences de l'éducation",
					"Sciences et civilisation",
					"philosophie",
					"psychologie",
					"Éducation",
					"Éducation",
					"Épistémologie",
					"Épistémologie et méthodes",
					"Étudiants",
					"éducation",
					"épistémologie"
				],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Snapshot"
					},
					{
						"title": "Isidore Record",
						"snapshot": false
					}
				],
				"archiveLocation": "Époque contemporaine",
				"abstractNote": "L'objectif de ce colloque est de réunir les étudiants, doctorants, et professionnels en psychologie, sociologies, philosophie, épistémologie, histoire et sciences de l'éducation autour d'Alfred Binet. Colloque international, Lyon, 9-10 mars 2007",
				"language": "Français",
				"url": "http://calenda.revues.org/nouvelle13432.html",
				"libraryCatalog": "rechercheisidore.fr",
				"title": "De la psychopédagogie aux sciences de l'éducation",
				"publisher": "OpenEdition",
				"date": "2007-03-10"
			}
		]
	},
	{
		"type": "web",
		"url": "http://rechercheisidore.fr/search/resource/?uri=10670/1.a0o7by",
		"items": [
			{
				"itemType": "thesis",
				"creators": [
					{
						"firstName": "Karima",
						"lastName": "Ben Allal",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [
					"Algériennes",
					"Archives",
					"Cas",
					"Communautés",
					"Création",
					"Documentation technique",
					"Information scientifique",
					"Information technique",
					"Marche",
					"Modes",
					"Mouvement",
					"Organisation",
					"Origines",
					"Paysage",
					"Production",
					"Recherche",
					"Sciences -- Documentation",
					"Sciences -- Vulgarisation",
					"Sciences de l'information",
					"Sciences de l'information et de la             communication",
					"Scientifiques",
					"Vers",
					"archives",
					"dépôt",
					"exploitation",
					"lieu",
					"mouvement/immobilité",
					"place",
					"production",
					"recherche",
					"représentation de paysage",
					"Édition scientifique",
					"Électronique"
				],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Snapshot"
					},
					{
						"title": "Isidore Record",
						"snapshot": false
					}
				],
				"archiveLocation": "Époque contemporaine",
				"abstractNote": "L'exploitation rationnelle des résultats de la recherche scientifique dépend en premier lieu de l'accès à ces résultats. C'est de ce principe qu'a émergé le mouvement des archives ouvertes dans les milieux de la recherche afin de prôner un accès libre et gratuit à la littérature scientifique mondiale. La maîtrise de ce mouvement quand à ses principes, ses techniques....justifie cette étude qui se propose de définir un prototype d'archive ouverte institutionnelle (CERIST d'Alger) et multidisciplinaire pour les communautés scientifiques algériennes. Pour atteindre cet objectif, nous avons, dans un premier lieu, fait un rappel sur les origines et les évolutions du mouvement des archives ouvertes (Open Archive) dans le paysage de la communication scientifique. Puis, nous avons étudié quelques dépôts d'archives afin de nous inspirer de leur modes d'organisation et de fonctionnement dans la réalisation de notre prototype d'archive ouverte que nous avons nommé ArchivAlg. La suite de cette recherche expose dans une démarche constructive les étapes de création et de mise en oeuvre de notre prototype et propose vers la fin quelques perspectives de promotion de l'archivage libre en Algérie.",
				"thesisType": "Mémoires, Thèses et HDR",
				"language": "Arabe",
				"url": "http://tel.archives-ouvertes.fr/tel-00167331",
				"libraryCatalog": "rechercheisidore.fr",
				"shortTitle": "Mise en place d'un prototype d'archive ouverte institutionnelle ARCHIVALG",
				"title": "Mise en place d'un prototype d'archive ouverte institutionnelle ARCHIVALG : cas de la production scientifique du CERIST d'ALGER",
				"university": "Centre pour la communication scientifique directe",
				"date": "2007-05-30"
			}
		]
	},
	{
		"type": "web",
		"url": "http://rechercheisidore.fr/search/resource/?uri=10670/1.mucjwn",
		"items": [
			{
				"itemType": "webpage",
				"creators": [
					{
						"firstName": "Institut de recherche sur le",
						"lastName": "développement",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [
					"Sociologie",
					"Sociologie",
					"Sociologie de la santé",
					"Santé",
					"santé",
					"Couple",
					"Enfants",
					"enfant",
					"Sud (point cardinal)",
					"Nord (point cardinal)",
					"Hommes",
					"Sein",
					"mère",
					"bien",
					"Cas",
					"Sphère",
					"sphère",
					"mariage",
					"Mariage",
					"Prévention",
					"Information scientifique",
					"Sciences -- Documentation",
					"Sciences -- Vulgarisation",
					"Information technique",
					"Documentation technique",
					"rapports sociaux",
					"Relations humaines",
					"Développement",
					"Concept",
					"Reproduction",
					"restitution",
					"Et les femmes",
					"Nouvelle",
					"nouvelle",
					"sexualité",
					"Sexualité",
					"Risque",
					"Vie",
					"vie",
					"Membres",
					"Soins",
					"père",
					"lieu",
					"place",
					"Matière",
					"matière",
					"source",
					"Monde",
					"cosmos",
					"Évolution",
					"Âge",
					"entrée",
					"Concorde",
					"union",
					"Femmes",
					"Arrestine 4",
					"Nouvelles",
					"concubinage",
					"polygamie",
					"Polygamie",
					"Africains",
					"Africains",
					"Pacte civil de solidarité",
					"Contexte",
					"Couples homosexuels",
					"droit",
					"Droit",
					"coudée",
					"Enquêtes",
					"Sida",
					"Vie sexuelle -- Enquêtes",
					"Expériences",
					"recherche",
					"Recherche",
					"réflexion",
					"Sciences sociales",
					"Propriété foncière",
					"Domaine public",
					"Virus de l'immunodéficience humaine",
					"Planification",
					"Reproduction humaine",
					"espace",
					"Espace",
					"rue",
					"Autobus",
					"Télécopie",
					"Cédéroms"
				],
				"seeAlso": [],
				"attachments": [
					{
						"title": "Snapshot"
					},
					{
						"title": "Isidore Record",
						"snapshot": false
					}
				],
				"title": "Séminaire \"Quand la santé questionne le couple - Correspondances Sud et Nord\"",
				"publisher": "Institut de recherche sur le développement",
				"institution": "Institut de recherche sur le développement",
				"company": "Institut de recherche sur le développement",
				"label": "Institut de recherche sur le développement",
				"distributor": "Institut de recherche sur le développement",
				"date": "2010-10-21",
				"archiveLocation": "Époque contemporaine",
				"abstractNote": "Séminaire organisé par Annabel DESGREES du LOU, Agnès GUILLAUME et Dolorès POURETTE Équipe &quot;Genre et Santé&quot; du Ceped \n\n\n\nLes dernières décennies ont été marquées par la prise en compte croissante des rapports sociaux entre les sexes, dans le champ de la santé comme dans les autres champs du développement. À partir de 1994, le concept de santé de la reproduction tel que défini lors de la conférence du Caire conduit à prendre en compte les hommes et les femmes et implique donc une nouvelle façon d’aborder les questions de santé au sein des couples : avoir une sexualité sans risque et avoir des enfants sans mettre en danger ni la vie de la mère ni celle de l’enfant concerne bien les deux membres d’un couple. Plus tard, les soins à porter à l’enfant impliqueront aussi, dans la majorité des cas, son père (biologique ou social) et sa mère. La sphère conjugale est donc le lieu où prennent place les décisions et les pratiques en matière de santé sexuelle et reproductive et de santé de l’enfant.\n\n\nMais à quelle entité correspond cette sphère conjugale selon les contextes sociaux ?\n\n\n\nD’une part, on observe, dans le monde entier, une profonde évolution des structures familiales. Celle-ci s’est accompagnée d’un bouleversement des situations conjugales : dans de nombreux pays, l’âge « d’entrée en union » a reculé tant pour les femmes que pour les hommes, les unions durent moins longtemps car on se sépare plus vite et plus facilement.\n\n\nD’autre part, de nouvelles formes de mise en couple existent, en dehors du mariage : unions libres avec ou sans cohabitation, système de polygamie officieuse dans les pays africains où celle-ci est devenue légalement interdite, PACS dans le cas de la France. Dans ce contexte, émerge aussi une revendication à la reconnaissance des couples homosexuels (droit au mariage, à avoir des enfants).\n\n\nDans cette multiplicité des formes conjugales actuelles, la notion même de couple reste peu questionnée. \nElle est même bien souvent évitée. Dans de nombreuses enquêtes ce sont les catégories matrimoniales classiques qui restent utilisées, et qui ne prennent pas en compte les formes conjugales non formalisées, ou non cohabitantes. Dans le champ de la prévention des IST et du Sida ou dans les enquêtes sur la sexualité, on parle de partenariat (sous entendu sexuel) occasionnel ou régulier, notion sensiblement différente de celle de relation conjugale.\n\n\nÀ partir d’expériences croisées de recherche au Sud et au Nord, ce séminaire interrogera cette notion de couple et de conjugalité. \nLa matinée sera consacrée à une réflexion sur la pluralité des situations qu’elle recouvre et conduira à analyser la façon dont les différentes sciences sociales appréhendent la relation conjugale.\n\n\nL’après-midi, nous examinerons, à travers différentes recherches, comment se structurent les choix et décisions de santé au sein de ces &quot;couples&quot; dans quatre domaines de la santé reproductive : la prévention des IST et du VIH, la planification des grossesses et des naissances, l’assistante médicale à la procréation, les soins de santé des petits enfants.\n\n\n\nCe séminaire se tiendra à l’Espace MONCASSIN, 164 rue de Javel, 75015 ParisMétro Félix Faure, Bus 70-88-62\n\n\n\nContact : \nYvonne LAFITTE : \n\n\n\n\n\t\n\t\t\tyvonne.lafitte@ceped.org \n\n\t\n\n\n\n\nTél. : 01 78 94 98 72 − Fax : 01 78 94 98 79\n\n\nSéminaire  &quot;Quand la santé questionne le couple&quot; - Bulletin d'inscription\n\n\nTélécharger le document (DOC, 113 Ko)Séminaire  &quot;Quand la santé questionne le couple&quot; - Bulletin d'inscription\t\t\n\t\t\nSéminaire &quot;Quand la santé questionne le couple&quot; - Description\n\n\nTélécharger le document (PDF, 115 Ko)Séminaire &quot;Quand la santé questionne le couple&quot; - Description\t\t\n\t\t\nSéminaire &quot;Quand la santé questionne le couple&quot; - Programme provisoire\n\n\nTélécharger le document (PDF, 112 Ko)Séminaire &quot;Quand la santé questionne le couple&quot; - Programme provisoire",
				"reportType": "Page Web",
				"letterType": "Page Web",
				"manuscriptType": "Page Web",
				"mapType": "Page Web",
				"thesisType": "Page Web",
				"websiteType": "Page Web",
				"presentationType": "Page Web",
				"postType": "Page Web",
				"audioFileType": "Page Web",
				"url": "http://www.ird.fr/index.php/toute-l-actualite/evenements-et-manifestations/colloques/seminaire-quand-la-sante-questionne-le-couple-correspondances-sud-et-nord",
				"libraryCatalog": "rechercheisidore.fr",
				"accessDate": "CURRENT_TIMESTAMP",
				"language": "Français"
			}
		]
	},
	{
		"type": "web",
		"url": "http://rechercheisidore.fr/search/?type=http://www.rechercheisidore.fr/ontology/art",
		"items": "multiple"
	}
]
/** END TEST CASES **/