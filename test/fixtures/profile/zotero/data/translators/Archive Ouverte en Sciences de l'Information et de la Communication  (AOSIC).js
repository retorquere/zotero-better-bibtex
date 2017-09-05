{
	"translatorID": "dedcae51-073c-48fb-85ce-2425e97f128d",
	"label": "Archive Ouverte en Sciences de l'Information et de la Communication  (AOSIC)",
	"creator": "Michael Berkowitz",
	"target": "^https?://archivesic\\.ccsd\\.cnrs\\.fr/",
	"minVersion": "1.0.0b4.r5",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2015-06-02 05:58:49"
}

function detectWeb(doc, url) {
	if (doc.title.toLowerCase().match(/::\ search|::\ recherche/)) {
	return "multiple";
	//return false;
	} else if (url.match(/sic_\d+|tel-\d+/)) {
		return "journalArticle";
	}
}

var metaTags = {
	"DC.relation":"url",
	"DC.date":"date",
	"DC.description":"abstractNote",
	"DC.creator":"creators",
	"DC.title":"title"
}

function doWeb(doc, url) {
	var articles = new Array();
	if (detectWeb(doc, url) == "multiple") {
		var items = Zotero.Utilities.getItemArray(doc, doc, /sic_\d+|tel-\d+/);
		items = Zotero.selectItems(items) 
		for (var i in items) {
			articles.push(i);
		}
	} else {
		articles = [url];
	}
	Zotero.Utilities.processDocuments(articles, function(doc) {
		var xpath = '//meta[@name]';
		var data = new Object();
		var metas = doc.evaluate(xpath, doc, null, XPathResult.ANY_TYPE, null);
		var meta;
		while (meta = metas.iterateNext()) {
			if (data[meta.name]) {
				data[meta.name] = data[meta.name] + ";" + meta.content;
			} else {
				data[meta.name] = meta.content;
			}
		}
		Zotero.debug(data);
		var item = new Zotero.Item("journalArticle");
		for (var tag in metaTags) {
			if (tag == "DC.creator") {
				var authors = data['DC.creator'].split(";");
				for (var i=0; i<authors.length; i++) {
					var aut = authors[i];
					aut = aut.replace(/^([^,]+),\s+(.*)$/, "$2 $1");
					item.creators.push(Zotero.Utilities.cleanAuthor(aut, "author"));
				}
			} else {
				item[metaTags[tag]] = data[tag];
			}
		}
		var pdfurl = doc.evaluate('//a[contains(@href, ".pdf")]', doc, null, XPathResult.ANY_TYPE, null).iterateNext().href //.href.match(/url=([^&]+)&/)[1];
		Zotero.debug(pdfurl);
		item.attachments = [
			{url:item.url, title:"AOSIC Snapshot", mimeType:"text/html"},
			{url:pdfurl, title:"AOSIC Full Text PDF", mimeType:"application/pdf"}
		];
		item.complete();
	}, function() {Zotero.done();});
	Zotero.wait();
}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://archivesic.ccsd.cnrs.fr/sic_00665224/fr/",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"firstName": "Brigitte",
						"lastName": "Guyot",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"url": "http://archivesic.ccsd.cnrs.fr/sic_00665224",
						"title": "AOSIC Snapshot",
						"mimeType": "text/html"
					},
					{
						"url": "http://archivesic.ccsd.cnrs.fr/docs/00/66/52/24/PDF/PAROSIC_BG.pdf",
						"title": "AOSIC Full Text PDF",
						"mimeType": "application/pdf"
					}
				],
				"url": "http://archivesic.ccsd.cnrs.fr/sic_00665224",
				"date": "2011",
				"abstractNote": "s'appuyer sur des observables que sont les documents d'entreprise donne à voir à la fois une dynamique de formalisation des écrits professionnels, une activité particulière, celle d'éditorialisation, ainsi que des traces d'intervention institutionnelle ; tout cela fait du document un miroir et un porteur d'ordre.",
				"title": "comprendre une organisation par l'analyse de ses documents",
				"libraryCatalog": "Archive Ouverte en Sciences de l'Information et de la Communication  (AOSIC)",
				"accessDate": "CURRENT_TIMESTAMP"
			}
		]
	},
	{
		"type": "web",
		"url": "http://tel.archives-ouvertes.fr/tel-00483442/fr/",
		"items": [
			{
				"itemType": "journalArticle",
				"creators": [
					{
						"firstName": "Caroline",
						"lastName": "Djambian",
						"creatorType": "author"
					}
				],
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [
					{
						"url": "http://tel.archives-ouvertes.fr/tel-00483442",
						"title": "AOSIC Snapshot",
						"mimeType": "text/html"
					},
					{
						"url": "http://tel.archives-ouvertes.fr/docs/00/67/11/78/PDF/ThA_se_C_Djambian.pdf",
						"title": "AOSIC Full Text PDF",
						"mimeType": "application/pdf"
					}
				],
				"url": "http://tel.archives-ouvertes.fr/tel-00483442",
				"date": "2010-04-14",
				"abstractNote": "Le patrimoine documentaire des entreprises s'est souvent accumulé sans que ces dernières puissent s'adapter au rythme des évolutions des technologies de l'information. La mémoire collective qui ne cesse d'être produite voit sa masse croître et est devenue éparse et hétérogène. Comme nombre d'entreprises, des problématiques transverses imposent aujourd'hui à la Division Ingénierie Nucléaire (DIN) d'EDF d'être capable de mobiliser ses connaissances de façon opérationnelle. Mais la valorisation de son patrimoine informationnel dépasse largement les aspects techniques pour prendre en compte l'organisation dans sa globalité. Ce sont en effet les métiers cœurs de l'entreprise qui sont le point de départ de notre réflexion. Dans ce contexte d'ingénierie c'est par la documentation que les connaissances techniques transitent et sont exprimées par des concepts propres aux métiers. La terminologie métiers est la clé permettant de valoriser les connaissances et de mieux gérer le patrimoine de la DIN. Elle nous permet d'aller vers une représentation explicite, au sein d'une base de connaissances centrée sur le ' sens métier ' de l'organisation. Notre approche résolument empirique et qualitative aboutit à une méthode de construction d'une base de connaissances métiers appliquée à un domaine délimité de la Division Ingénierie Nucléaire d'EDF.",
				"title": "Valorisation d'un patrimoine documentaire industriel et évolution vers un système de gestion des connaissances orienté métiers",
				"libraryCatalog": "Archive Ouverte en Sciences de l'Information et de la Communication  (AOSIC)",
				"accessDate": "CURRENT_TIMESTAMP"
			}
		]
	}
]
/** END TEST CASES **/