{
	"translatorID": "4c6b4c5f-7286-45bb-8e99-0c518d177fa7",
	"label": "OpenEdition Books",
	"creator": "Cédric Chatelain",
	"target": "^https?://books\\.openedition\\.org/",
	"minVersion": "1.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2017-01-03 11:17:56"
}

function detectWeb(doc, url){
	//testing if a link to a rdf file exist
	if (doc.getElementById('zotero_rdf')){
		//testing to know if we have a book or a chapter
		var met = doc.getElementsByName('DC.type')[0];
		var cont = met.content
		Zotero.debug(cont);
		if (cont == 'Book' || cont == 'book'){
			return 'book';
		} else {
			return 'bookSection';
		}
	} else {
		return false;
	}
}

function doWeb(doc, url) {
	var rdf = doc.getElementById('zotero_rdf').href;
		//Zotero.debug(rdf);
		var translator = Zotero.loadTranslator("import");
		translator.setTranslator("14763d25-8ba0-45df-8f52-b8d1108e7ac9");
		Zotero.Utilities.HTTP.doGet(rdf, function (text) {
			//Zotero.debug(text);
			translator.setString(text);
				 translator.translate();
		});
}
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://books.openedition.org/cemca/182",
		"items": [
			{
				"itemType": "book",
				"title": "Debates históricos contemporáneos: africanos y afrodescendientes en México y Centroamérica",
				"creators": [
					{
						"lastName": "Velásquez",
						"firstName": "María Elisa",
						"creatorType": "editor"
					}
				],
				"date": "2013-04-24",
				"ISBN": "9782821827769",
				"abstractNote": "En los últimos años, nuevos datos históricos sobre los africanos y afrodescendientes en México y países de América Central han aparecido en las investigaciones del periodo virreinal. Ello ha dado lugar a diversos debates y formas de interpretación sobre el papel que desempeñó la población de origen africano en la construcción de las sociedades americanas. Este libro, coordinado por María Elisa Velázquez, reúne artículos de investigadores de varios países y de distintas corrientes historiográficas; están presentes autores clásicos, pero también otros de nuevas generaciones interesados en incursionar en las experiencias de los descendientes de africanos. Tres grandes temas forman parte de este libro: las redes de comunicación y comercio en las que estuvieron inmersos \"negros y mulatos\" de la época colonial; reflexiones y polémicas sobre las categorías y denominaciones que existieron y existen para identificarlos y, finalmente, experiencias de la vida cotidiana y de las características de las comunidades domésticas a las que pertenecieron. Así, la reflexión comparativa entre países, y también entre diversas interpretaciones sobre procesos históricos, abre nuevos debates sobre la participación de los africanos y afrodescendientes en el pasado y presente.",
				"language": "es",
				"libraryCatalog": "OpenEdition Books",
				"numPages": "295",
				"place": "Mexico",
				"publisher": "Centro de estudios mexicanos y centroamericanos",
				"series": "Africanías",
				"shortTitle": "Debates históricos contemporáneos",
				"url": "http://books.openedition.org/cemca/182",
				"attachments": [],
				"tags": [
					{
						"tag": "africanos",
						"type": 0
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://books.openedition.org/oep/423",
		"items": [
			{
				"itemType": "book",
				"title": "Qu’est-ce qu’un lieu de savoir ?",
				"creators": [
					{
						"lastName": "Jacob",
						"firstName": "Christian"
					}
				],
				"date": "2014-03-21",
				"ISBN": "9782821834583",
				"abstractNote": "Comment les savoirs sont-ils produits ? Comment se transmettent-ils ? Quelle approche adopter pour apprendre à les observer ?  Qu’il s’agisse d’un laboratoire, d’une agora grecque, d’un jardin botanique, d’une table de travail ou d’une bibliothèque, chaque lieu de savoir possède une dynamique propre, conséquence de son histoire et de ses spécificités. En mêlant l’observation des pratiques à l’interprétation des méthodes de pensée, cet ouvrage étudie les lieux de l’activité savante dans une approche comparatiste.  Construit comme une invitation à la réflexion, situé à la frontière entre histoire et anthropologie, cet ouvrage tente de baliser les hypothèses et les enjeux d’une nouvelle approche des savoirs humains. Il s’adresse à tous les lecteurs qui souhaitent s’engager dans des cheminements parallèles ; il déploie des pistes de réflexion pour les humanités d’aujourd’hui et de demain.  Cet ouvrage a été réalisé avec le soutien du Labex Hastec.",
				"language": "fr",
				"libraryCatalog": "OpenEdition Books",
				"numPages": "122",
				"place": "Marseille",
				"publisher": "OpenEdition Press",
				"rights": "CC BY-NC-ND 3.0",
				"series": "Encyclopédie numérique",
				"url": "http://books.openedition.org/oep/423",
				"attachments": [],
				"tags": [
					{
						"tag": "savoirs",
						"type": 0
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://books.openedition.org/ifpo/754",
		"items": [
			{
				"itemType": "book",
				"title": "Enseignement supérieur et marché du travail dans le monde arabe",
				"creators": [
					{
						"lastName": "Labaki",
						"firstName": "Boutros",
						"creatorType": "editor"
					}
				],
				"date": "2010-05-13",
				"ISBN": "9782351592649",
				"abstractNote": "Cet ouvrage, qui est le fruit d’une coopération entre l’Ifpo et la Fondation Ford, examine le décalage existant dans la majorité des pays arabes  entre les débouchés de l’enseignement supérieur et les besoins du marché de l’emploi. Sept études de cas sont présentées qui concernent le Maroc, l’Algérie, la Tunisie, l’Égypte, la Jordanie, la Syrie et le Liban.  Toutes soulignent le chômage des diplômés, dont les causes sont multiples et pour partie liées au manque de croissance économique et aux politiques conduites en matière d’enseignement supérieur et de recherche.  Tous les auteurs signalent le développement quantitativiste de l’enseignement supérieur au détriment de la qualité, son manque de relation avec le secteur privé et ses méthodes pédagogiques passives et déconnectée des réalités professionnelles d’aujourd’hui. Ces auteurs explorent aussi les pistes d’une sortie de crise pour l’enseignement supérieur en relevant tout de même l’amélioration globale des qualifications de la force de travail dans les différents pays.",
				"language": "fr",
				"libraryCatalog": "OpenEdition Books",
				"numPages": "248",
				"place": "Beyrouth",
				"publisher": "Presses de l’Ifpo",
				"series": "Contemporain publications",
				"url": "http://books.openedition.org/ifpo/754",
				"attachments": [],
				"tags": [
					{
						"tag": "chômage",
						"type": 0
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/