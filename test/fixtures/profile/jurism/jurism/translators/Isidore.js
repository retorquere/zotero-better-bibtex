{
	"translatorID": "43a53465-0354-42fd-aba9-dc1af8be7061",
	"label": "Isidore",
	"creator": "Guillaume Adreani and Aurimas Vinckevicius",
	"target": "^https?://(www\\.)?rechercheisidore\\.fr/search(/resource/|\\?)",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2017-01-01 15:22:12"
}

var typeMap = {
	'Articles': 'journalArticle',
	'Actualités': 'newspaperArticle',
	'Billets de blog' : 'blogPost',
	'Colloques et conférences': 'conferencePaper',
	"Livres et chapitres d'ouvrages" : 'book',
	'Manuscrits': 'manuscript',
	'Mémoires, Thèses et HDR': 'thesis',
	'Ouvrages': 'book',
	'Page Web': 'webpage',
	'Photos et images': 'artwork'
};

function getSearchResults(doc) {
	return ZU.xpath(doc, '//div[@class="ressource_bloc"]\
		[./p[@class="titre_ressource"]\
			and ./p[not(@class)][1]/a[not(@onclick)][1]/@href]');
}

function detectWeb(doc, url) {
	if (getSearchResults(doc).length) return "multiple";

	var type = ZU.xpathText(doc, '//meta[@name="DC.type"]/@content');
	//Z.debug(type);
	if (type) return typeMap[type] || 'journalArticle';	//default to journalArticle if we can't recognize it
}

function doWeb(doc, url) {
	var type = detectWeb(doc, url);
	if (type == 'multiple') {
		var res = getSearchResults(doc);
		var items = {};
		var title, href;
		for (var i=0, n=res.length; i<n; i++) {
			title = ZU.xpathText(res[i], './p[@class="titre_ressource"]');
			url = ZU.xpathText(res[i], './p[not(@class)][1]/a[not(@onclick)][1]/@href');
			if (title && url) {
				items[url] = title;
			}
		}

		Zotero.selectItems(items, function(selectedItems) {
			if (!selectedItems) return true;

			var urls = [];
			for (var i in selectedItems) {
				urls.push(i);
			}
			ZU.processDocuments(urls, scrape);
		})
	} else {
		scrape(doc, url, type);
	}
}

function scrape(doc, url, type) {
	if (!type) type = detectWeb(doc, url);
	if (!type) return;	//this should not happen, but if it does, allow to proceed importing remaining items

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
		"url": "https://rechercheisidore.fr/search/resource/?uri=10670/1.v00h5m",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Sur la géométrie anallagmatique (addition à l'article précédent)",
				"creators": [
					{
						"firstName": "J.",
						"lastName": "Hadamard",
						"creatorType": "author"
					}
				],
				"date": "1927",
				"archiveLocation": "XVIIe siècle",
				"language": "Français",
				"libraryCatalog": "rechercheisidore.fr",
				"url": "http://www.numdam.org/item?id=NAM_1927_6_2__314_0",
				"attachments": [
					{
						"title": "Snapshot"
					},
					{
						"title": "Isidore Record",
						"snapshot": false
					}
				],
				"tags": [
					"Addition",
					"Anthropologie religieuse",
					"Architecture",
					"Economies et finances",
					"Espace",
					"Géométrie",
					"Histoire",
					"Pensée",
					"Philosophie et Sociologie des sciences",
					"Représentations",
					"aménagement de l'espace",
					"géométrie",
					"société et territoire",
					"Économie",
					"Épistémologie",
					"Études des sciences"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://rechercheisidore.fr/search/resource/?uri=10670/1.ny16mx",
		"items": [
			{
				"itemType": "book",
				"title": "Introduction",
				"creators": [
					{
						"firstName": "Florence",
						"lastName": "Weber",
						"creatorType": "author"
					}
				],
				"date": "2000",
				"abstractNote": "Weber Florence. Introduction. In: Genèses, 41, 2000. Comment décrire les transactions, sous la direction de Susanna Magri. pp. 2-4.",
				"archiveLocation": "Florence",
				"language": "Français",
				"libraryCatalog": "rechercheisidore.fr",
				"publisher": "MESR",
				"url": "http://www.persee.fr/doc/genes_1155-3219_2000_num_41_1_1644",
				"attachments": [
					{
						"title": "Snapshot"
					},
					{
						"title": "Isidore Record",
						"snapshot": false
					}
				],
				"tags": [
					"Gestion",
					"Géographie urbaine",
					"Histoire",
					"Histoire urbaine",
					"Sociologie",
					"Sociologie de la culture",
					"Sociologie économique",
					"Études du politique",
					"Études urbaines"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.rechercheisidore.fr/search/resource/?uri=10670/1.ys05aw",
		"items": [
			{
				"itemType": "blogPost",
				"title": "Séminaire - Quand la santé questionne le couple. Correspondances Sud et Nord",
				"creators": [
					{
						"firstName": "",
						"lastName": "corpsetmedecine",
						"creatorType": "author"
					}
				],
				"date": "2010-07-06",
				"abstractNote": "L'équipe \"Genre et santé\" du CEPED organise un séminaire le jeudi 21 octobre 2010, à l'Université Paris Descartes : \"Quand la santé questionne le couple. Correspondances Sud et Nord\" Voir la présentation et le bulletin d'inscription en pièces jointes (pdf).",
				"language": "Français",
				"url": "http://corpsetmedecine.hypotheses.org/995",
				"websiteType": "Billets de blog",
				"attachments": [
					{
						"title": "Snapshot"
					},
					{
						"title": "Isidore Record",
						"snapshot": false
					}
				],
				"tags": [
					"Couple",
					"Nord (point cardinal)",
					"Pièces",
					"Santé",
					"Sociologie de la santé",
					"Sud (point cardinal)",
					"santé"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.rechercheisidore.fr/search/resource/?uri=10670/1.5tkdos",
		"items": [
			{
				"itemType": "conferencePaper",
				"title": "LES CHERCHEURS ALGERIENS ET LA PUBLICATION ELECTRONIQUE DANS LES ARCHIVES OUVERTES : CAS D'ARCHIVALG",
				"creators": [
					{
						"firstName": "Karima",
						"lastName": "Ben Allal",
						"creatorType": "author"
					},
					{
						"firstName": "Madjid",
						"lastName": "Dahmane",
						"creatorType": "author"
					},
					{
						"firstName": "Rahima",
						"lastName": "Slimani",
						"creatorType": "author"
					}
				],
				"date": "2008-05-29",
				"abstractNote": "Au cours de la dernière décennie, le monde de la communication scientifique a subi des mutations majeures engendrées principalement par la généralisation de l'utilisation des Technologies de l'Information et de la Communication. Ces mutations se distinguent par le développement de nouvelles tendances dont le mouvement des Archives ouvertes. En effet, l'initiative en faveur des archives ouvertes a émergé dans les milieux de la recherche dans le but de prôner un Accès Libre et gratuit à la littérature scientifique mondiale. Afin d'accompagner ce mouvement et de maîtriser ses principes et ses techniques, un prototype d'archive ouverte institutionnelle (CERIST d'Alger) et multidisciplinaire a été mis en place pour les communautés scientifiques algériennes. Ce prototype d'archive nommé ‘ArchivAlg' permet aux chercheurs de diffuser librement sur Internet leurs travaux de recherche. L'expérimentation de ce dispositif a montré que les chercheurs algériens sont peu familiarisés au dépôt dans les bases d'archives. Aujourd'hui, la question des archives ouvertes est stratégique pour le contexte algérien, elle est même indispensable pour valoriser et offrir une meilleure visibilité aux publications scientifiques et enrichir le patrimoine scientifique national d'où la nécessité de sensibiliser les chercheurs algériens et leurs institutions aux intérêts et retombées positifs de l'adoption de ces systèmes ouverts d'accès à l'Information Scientifique et Technique.",
				"archiveLocation": "Époque contemporaine",
				"language": "Français",
				"libraryCatalog": "www.rechercheisidore.fr",
				"publisher": "Centre pour la communication scientifique directe",
				"shortTitle": "LES CHERCHEURS ALGERIENS ET LA PUBLICATION ELECTRONIQUE DANS LES ARCHIVES OUVERTES",
				"url": "https://archivesic.ccsd.cnrs.fr/sic_00284311",
				"attachments": [
					{
						"title": "Snapshot"
					},
					{
						"title": "Isidore Record",
						"snapshot": false
					}
				],
				"tags": [
					"Adoption",
					"Algériennes",
					"Algériens",
					"Archives",
					"Bénédiction et malédiction",
					"Chercheurs",
					"Communautés",
					"Communication",
					"Digital humanities",
					"Documentation technique",
					"Développement",
					"Expériences",
					"Information",
					"Information scientifique",
					"Information technique",
					"Internet",
					"Littérature",
					"Monde",
					"Mouvement",
					"Mutations",
					"Nouvelles",
					"Nécessité",
					"Patrimoine",
					"Rapports techniques",
					"Recherche",
					"Sciences de l'information",
					"Sciences de l'information et de la communication",
					"Scientifiques",
					"Technique",
					"Thèses et écrits académiques",
					"Utilisation",
					"Visibilité",
					"administrations",
					"adoption",
					"archives",
					"cosmos",
					"dépôt",
					"expérimentation",
					"littérature",
					"mouvement/immobilité",
					"nécessité",
					"patrimoine",
					"place",
					"publication",
					"recherche",
					"technologie",
					"Édition",
					"Édition scientifique",
					"Édition électronique",
					"Électronique"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.rechercheisidore.fr/search/resource/?uri=10670/1.gmcezm",
		"items": [
			{
				"itemType": "thesis",
				"title": "Théories pré-keynésiennes de l’instabilité financière : Marx, Veblen, Hawtrey",
				"creators": [
					{
						"firstName": "Julien",
						"lastName": "Mendez",
						"creatorType": "author"
					}
				],
				"date": "2012-05-02",
				"abstractNote": "Cette thèse montre que l’on peut trouver chez Marx, Veblen et Hawtrey trois théories pré-keynésiennes de l’instabilité financière. Elle dégage, pour chacun d’eux, le cadre théorique qu’il met en place et qui lui permet de poser la question du rôle de la finance dans la dynamique économique. Elle analyse ensuite leurs écrits pour montrer que l’on peut en déduire des théories (incomplètes) de l’instabilité financière, c’est-à-dire que les perturbations économiques sont dues à la manière dont les entreprises se financent. Le chapitre I reconstruit la théorie marxienne des marchés financiers, ce qui permet, dans le chapitre II, de montrer le rôle central joué par la finance dans l’explication du cycle économique chez Marx. Le chapitre III dégage les éléments qui font de la théorie de Veblen une théorie du capitalisme financier, puis, dans le chapitre IV, discute cette dernière pour montrer qu’il s’agit d’une théorie de l’instabilité financière. Le chapitre V propose une représentation du modèle macroéconomique de Hawtrey, à partir de laquelle le chapitre VI dégage les conditions dans lesquelles le crédit est instable dans sa théorie. Le chapitre VII fait le lien entre les théories de ces auteurs et les faits économiques dont la connaissance a nourri leur réflexion : les théories de l’instabilité financière sont à la fois une explication, une représentation et un projet de régulation du capitalisme financier",
				"language": "Français",
				"libraryCatalog": "www.rechercheisidore.fr",
				"shortTitle": "Théories pré-keynésiennes de l’instabilité financière",
				"thesisType": "Mémoires, Thèses et HDR",
				"university": "ABES",
				"url": "http://www.theses.fr/2012PA100060/document",
				"attachments": [
					{
						"title": "Snapshot"
					},
					{
						"title": "Isidore Record",
						"snapshot": false
					}
				],
				"tags": [
					"Analyse",
					"Capitalisme",
					"Cognition",
					"Commande",
					"Crédit",
					"Cycles",
					"Discussion",
					"Dynamique",
					"Economies et finances",
					"Entreprises",
					"Explication",
					"Finances",
					"Histoire économique",
					"Main",
					"Marché financier",
					"Places financières",
					"Projet",
					"Stabilité",
					"Terrains de golf",
					"Théorie de la",
					"capitalisme",
					"crédit",
					"main",
					"modèle",
					"place",
					"réflexion",
					"Économie",
					"Économie politique",
					"Écrivains"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.rechercheisidore.fr/search?q=libert%C3%A9",
		"items": "multiple"
	}
]
/** END TEST CASES **/