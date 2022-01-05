{
	"translatorID": "87766765-919e-4d3b-9071-3dd7efe984c8",
	"label": "Revues.org",
	"creator": "Aurimas Vinckevicius, Pierre-Alain Mignot, and Michael Berkowitz",
	"target": "^https?://.*\\.revues\\.org",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2014-04-03 18:55:44"
}

function detectWeb(doc, url) {
	// don't do anything on main domain, because there's nothing to fetch there
	if (url.match(/http:\/\/(www\.)?revues\.org/)) return false;

	var types = ZU.xpath(doc, '//meta[@name="DC.type"]/@content');
	for (var i=0, n=types.length; i<n; i++) {
		switch (types[i].textContent.toLowerCase()) {
			case 'journalarticle':
				return 'journalArticle';
			case 'collection':
				return 'multiple';
			case 'booksection':
				return 'bookSection';
		}
	}

	if (ZU.xpath(doc, '//div[@id="inside"]/div[@class="sommaire"]\
			/dl[@class="documents"]/dd[@class="titre"]/a').length ||
		ZU.xpath(doc, '//ul[@class="summary"]//div[@class="title"]/a').length) {
		return "multiple";
	} else if (ZU.xpath(doc, '//h1[@id="docTitle"]/span[@class="text"]').length ||
		url.match(/document\d+/)) {
		return "journalArticle";
	}
}

function scrape(doc, url) {
	//is this still necessary??
	if (url.match(/persee\-\d+/)) {
		// the article is on Persée portal, getting it to be translated by COinS
		var translator = Zotero.loadTranslator("web");
		translator.setTranslator("05d07af9-105a-4572-99f6-a8e231c0daef");
		translator.setDocument(doc);
		translator.translate();
	} else {
		//use Embeded Metadata
		var translator = Zotero.loadTranslator('web');
		translator.setTranslator('951c027d-74ac-47d4-a107-9c3069ab7b48');
		translator.setDocument(doc);
		translator.setHandler('itemDone', function(obj, item) {
			//editor and translator declarations not part of DC spec
			//editors (and compilers)
			var editors = ZU.xpath(doc, '//meta[@name="DC.contributor.edt" \
				or @name="DC.contributor.com"]/@content');
			for (var i=0, n=editors.length; i<n; i++) {
				item.creators.push(
					ZU.cleanAuthor(editors[i].textContent, 'editor', true));
			}
			//translators
			var trans = ZU.xpath(doc,
				'//meta[@name="DC.contributor.trl"]/@content');
			for (var i=0, n=trans.length; i<n; i++) {
				item.creators.push(
					ZU.cleanAuthor(trans[i].textContent, 'translator', true));
			}
			//fix all caps for author last names
			for (var i=0; i<item.creators.length; i++){
				if (item.creators[i].lastName == item.creators[i].lastName.toUpperCase()){
					item.creators[i].lastName = ZU.capitalizeTitle(item.creators[i].lastName.toLowerCase(), true)
				}
			}
			//set abstract and keywords based on preferred locale
			var locale = doc.cookie.match(/\blanguage=([a-z]{2})/i);
			//default to french if not set
			locale = locale ? locale[1].toLowerCase() : 'fr';

			//get abstract  and tags in preferred locale
			//or the first locale available
			item.abstractNote = ZU.xpathText(doc,
				'//meta[@name="description" or @name="DC.description"]\
						[lang("' + locale + '") or @lang="' + locale + '"][1]\
						/@content') ||
				ZU.xpathText(doc,
					'//meta[@name="description" or @name="DC.description"][1]\
						/@content');

			var tags = ZU.xpathText(doc,
				'//meta[@name="keywords" or @name="DC.subject"]\
						[lang("' + locale + '") or @lang="' + locale + '"][1]\
						/@content') ||
				ZU.xpathText(doc,
					'//meta[@name="keywords" or @name="DC.subject"][1]\
						/@content');
			if (tags) {
				item.tags = tags.trim().split(/\s*,\s*/);
			}

			delete item.extra;
		
			//The site lists all editor of journals as editor in the header. Turn them into contributors. 
			//I don't think there is a use case for editors for journal articles
			if (item.itemType === "journalArticle"){
				for (i in item.creators){
					if (item.creators[i].creatorType === "editor"){
						item.creators[i].creatorType = "contributor";
					}
				}
			}
				//store the language-specific url
			item.url = url;

			item.complete();
		});

		translator.getTranslatorObject(function(trans) {
			//override some of the mappings
			trans.addCustomFields({
				'prism.number': 'issue',
				'prism.volume': 'volume',
				'DC.title': 'title'
			});

			trans.doWeb(doc, url);
		});
	}
}

function doWeb(doc, url) {
	if (detectWeb(doc, url) == "multiple") {
		var results = ZU.xpath(doc, '//div[@id="inside"]/div[@class="sommaire"]\
			/dl[@class="documents"]/dd[@class="titre"]');
		if (!results.length) {
			results = ZU.xpath(doc, '//ul[@class="summary"]//div[@class="title"]');
		}

/* From old code: When is this needed?
		if (doc.evaluate('//meta[@name="DC.description.tableOfContents"]', doc, null, XPathResult.ANY_TYPE, null).iterateNext()) {
			var titles = doc.evaluate('//meta[@name="DC.description.tableOfContents"]', doc, null, XPathResult.ANY_TYPE, null).iterateNext().content.split(' -- ');
			var articles = doc.evaluate('//meta[@name="DC.relation.hasPart"]', doc, null, XPathResult.ANY_TYPE, null);
			var article;
			var i = 0;
			while (article = articles.iterateNext()) {
				items[article.content] = titles[i++];
			}
		} */

		Zotero.selectItems(ZU.getItemArray(doc, results), function(selectedItems) {
			if (!selectedItems) return true;

			var urls = new Array();
			for (var i in selectedItems) {
				urls.push(i);
			}

			ZU.processDocuments(urls, function(doc) {
				scrape(doc, doc.location.href)
			});
		});
	} else {
		scrape(doc, url);
	}
}
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://amerika.revues.org/1283",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://e-spania.revues.org/12303?lang=fr",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Le testament d’Elvire (Tábara, 1099)",
				"creators": [
					{
						"firstName": "Georges",
						"lastName": "Martin",
						"creatorType": "author"
					},
					{
						"firstName": "Georges",
						"lastName": "Martin",
						"creatorType": "contributor"
					}
				],
				"date": "2008/02/01",
				"DOI": "10.4000/e-spania.12303",
				"ISSN": "1951-6169",
				"abstractNote": "Le testament d’Elvire livre de précieuses informations sur la réalité historique de l’infantat : son implantation, la composition de ses biens, ses évolutions, les formes de son acquisition et de sa transmission, sa fonction politique. Mais il nous renseigne aussi sur une infante de niveau moyen, sur son cadre de vie, son entourage, ses activités, les réseaux de son pouvoir et même sur sa foi.",
				"issue": "5",
				"language": "fr",
				"libraryCatalog": "e-spania.revues.org",
				"publicationTitle": "e-Spania. Revue interdisciplinaire d’études hispaniques médiévales et modernes",
				"rights": "Les contenus de la revue e-Spania sont mis à disposition selon les termes de la Licence Creative Commons Attribution - Pas d'Utilisation Commerciale - Pas de Modification 4.0 International.",
				"url": "http://e-spania.revues.org/12303?lang=fr",
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
					"Alphonse VI de Castille et de León",
					"Elvire Fernandez",
					"Ferdinand Ier de Castille et de León",
					"Saint-Isidore de León",
					"Sancie Raimundez",
					"Urraque Fernandez",
					"XIe siècle",
					"infantat",
					"infantaticum",
					"infante Elvire",
					"infante Sancie",
					"infante Urraque",
					"testament"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://e-spania.revues.org/12303?lang=es",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Le testament d’Elvire (Tábara, 1099)",
				"creators": [
					{
						"firstName": "Georges",
						"lastName": "Martin",
						"creatorType": "author"
					},
					{
						"firstName": "Georges",
						"lastName": "Martin",
						"creatorType": "contributor"
					}
				],
				"date": "2008/02/01",
				"DOI": "10.4000/e-spania.12303",
				"ISSN": "1951-6169",
				"abstractNote": "El testamento de Elvira brinda una preciosísima información sobre la realidad del infantazgo : su extensión, la composición de sus bienes, sus evoluciones, las formas de su adquisición y transmisión, su papel político. También nos informa sobre una infanta de nivel mediano, sobre el marco de su vida, su entorno personal, sus actividades, la red de sus influencias e incluso sobre su fe.",
				"issue": "5",
				"language": "fr",
				"libraryCatalog": "e-spania.revues.org",
				"publicationTitle": "e-Spania. Revue interdisciplinaire d’études hispaniques médiévales et modernes",
				"rights": "Les contenus de la revue e-Spania sont mis à disposition selon les termes de la Licence Creative Commons Attribution - Pas d'Utilisation Commerciale - Pas de Modification 4.0 International.",
				"url": "http://e-spania.revues.org/12303?lang=es",
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
					"Alfonso VI de Castilla y León",
					"Elvira Fernández",
					"Fernando I de Castilla y León",
					"Infanta Elvira",
					"Infanta Sancha",
					"Infanta Urraca",
					"Infantazgo",
					"San Isidoro de León",
					"Sancha Raimundez",
					"Urraca Fernández",
					"siglo XI",
					"testamento"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://chs.revues.org/142",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "L’encadrement des Algériens de Paris (1944-1954), entre contraintes juridiques et arbitraire policier",
				"creators": [
					{
						"firstName": "Emmanuel",
						"lastName": "Blanchard",
						"creatorType": "author"
					}
				],
				"date": "2007/06/01",
				"DOI": "10.4000/chs.142",
				"ISSN": "1422-0857",
				"abstractNote": "Au sortir de la Seconde Guerre mondiale, pour sauvegarder son empire colonial, la France est contrainte de reconnaître la citoyenneté des Français musulmans d’Algérie (FMA). Dès lors, ceux-ci se retrouvent en métropole dans une situation proche de celle d’autres citoyens diminués (vagabonds, prostituées…) qui, bien que juridiquement peu accessibles à la répression policière sont considérés comme « indésirables » et constituent la clientèle privilégiée de forces de l’ordre agissant aux marges de la loi. Si l’ethnicité, la xénophobie, et la situation coloniale contribuent à définir les Algériens comme « indésirables », le répertoire d’actions policier envers les FMA tient avant tout à la façon dont l’arène policière est médiatisée par le contrôle et la représentation politiques.",
				"issue": "1",
				"language": "fr",
				"libraryCatalog": "chs.revues.org",
				"pages": "5-25",
				"publicationTitle": "Crime, Histoire & Sociétés / Crime, History & Societies",
				"rights": "© Droz",
				"url": "http://chs.revues.org/142",
				"volume": "11",
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
		"url": "http://poldev.revues.org/135",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Développement économique et legs coloniaux en Afrique",
				"creators": [
					{
						"firstName": "Gareth",
						"lastName": "Austin",
						"creatorType": "author"
					},
					{
						"firstName": "Emmanuelle",
						"lastName": "Chauvet",
						"creatorType": "translator"
					}
				],
				"date": "2010/03/01",
				"DOI": "10.4000/poldev.135",
				"ISSN": "1663-9375",
				"abstractNote": "Cet article étudie les effets du gouvernement colonial et de l’action des Africains pendant la période coloniale sur le contexte institutionnel et la situation en matière de ressources qui ont posé le cadre du futur développement économique au sud du Sahara. Cette question est placée dans la perspective de la dynamique du développement dans une région qui était, en 1900, extrêmement riche en terres et caractérisée par un manque de main-d’œuvre et de capital, par des activités marchandes indigènes dont l’ampleur peut étonner et par des degrés variables mais souvent peu élevés de centralisation politique. L’article explore la différence entre les effets des gouvernements français et britannique, mais il affirme que la différence visible dans l’évolution de la pauvreté, du bien-être et du changement structurel a davantage été déterminée par l’opposition entre économies « de peuplement » et « d’exploitation ».",
				"issue": "1",
				"language": "fr",
				"libraryCatalog": "poldev.revues.org",
				"pages": "11-36",
				"publicationTitle": "International Development Policy | Revue internationale de politique de développement",
				"rights": "International Development Policy is licensed under a Creative Commons Attribution-NonCommercial 4.0 International License.",
				"url": "http://poldev.revues.org/135",
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
					"Afrique subsaharienne"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/