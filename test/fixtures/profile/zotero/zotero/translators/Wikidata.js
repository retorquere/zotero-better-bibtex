{
	"translatorID": "eaef8d43-2f17-45b3-a5cb-affb49bc5e81",
	"label": "Wikidata",
	"creator": "Philipp Zumstein",
	"target": "^https?://(www\\.)?wikidata\\.org/wiki/Q",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2018-12-13 10:42:07"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2017 Philipp Zumstein
	
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


//see also https://github.com/UB-Mannheim/zotkat/blob/master/Wikidata%20QuickStatements.js
var typeMapping = {
	"Q838948" : "artwork",
	"Q30070318" : "audioRecording",
	"Q686822" : "bill",
	"Q17928402" : "blogPost",
	"Q571" : "book",
	"Q3331189" : "book", // Edition
	"Q47461344" : "book", // written work
	"Q1980247" : "bookSection",
	"Q2334719" : "case",
	"Q40056" : "computerProgram",
	"Q23927052" : "conferencePaper",
	"Q30070414" : "dictionaryEntry",
	"Q49848" : "document",
	"Q30070439" : "email",
	"Q17329259" : "encyclopediaArticle",
	"Q11424" : "film",
	"Q7216866" : "forumPost",
	"Q30070550" : "hearing",
	"Q30070565" : "instantMessage",
	"Q178651" : "interview",
	"Q13442814" : "journalArticle",
	"Q133492" : "letter",
	"Q30070590" : "magazineArticle",
	"Q87167" : "manuscript",
	"Q4006" : "map",
	"Q5707594" : "newspaperArticle",
	"Q253623" : "patent",
	"Q24634210" : "podcast",
	"Q604733" : "presentation",
	"Q1555508" : "radioBroadcast",
	"Q10870555" : "report",
	"Q820655" : "statute",
	"Q1266946" : "thesis",
	"Q15416" : "tvBroadcast",
	"Q30070675" : "videoRecording",
	"Q36774" : "webpage"
};

//see also https://www.wikidata.org/wiki/Template:Bibliographical_properties
var mapping = {
	'wdt:P1476': 'title',
	'wdt:P1680': 'subtitle',
	'wdt:P123': 'publisher',
	'wdt:P577': 'date',
	'wdt:P356': 'DOI',
	'wdt:P407': 'language',
	'wdt:P1433': 'publicationTitle',
	'wdt:P921': 'tagString', 
	'wdt:P50': 'creator',
	'wdt:P2093': 'creator',
	'wdt:P98': 'creator',
	'wdt:P655': 'creator',
	'wdt:P110': 'creator',
	'wdt:P57': 'creator',
	'wdt:P58': 'creator',
	'wdt:P161': 'creator',
	'wdt:P162': 'creator',
	'wdt:P953': 'url',
	'wdt:P478': 'volume',
	'wdt:P433': 'issue',
	'wdt:P304': 'pages',
	'wdt:P179': 'series',
	'wdt:P212':	'ISBN',
	'wdt:P957': 'ISBN',
	'wdt:P236': 'ISSN',
	'wdt:P136': 'genre',
	'wdt:P275': 'rights',
	'wdt:P2047': 'runningTime',
	'wdt:P750': 'distributor'
};

//creators with no special role here are treated as contributor
var creatorMapping = {
	'wdt:P50': 'author',
	'wdt:P2093': 'author',
	'wdt:P98': 'editor',
	'wdt:P655': 'translator',
	'wdt:P110': 'illustrator',
	'wdt:P57': 'director',
	'wdt:P58': 'scriptwriter',
	'wdt:P162': 'producer'
};


var namespaces = {
	"rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
	"xsd": "http://www.w3.org/2001/XMLSchema#",
	"rdfs": "http://www.w3.org/2000/01/rdf-schema#",
	"owl": "http://www.w3.org/2002/07/owl#",
	"wikibase": "http://wikiba.se/ontology-beta#",
	"wdata": "https://www.wikidata.org/wiki/Special:EntityData/",
	"wd": "http://www.wikidata.org/entity/",
	"wds": "http://www.wikidata.org/entity/statement/",
	"wdref": "http://www.wikidata.org/reference/",
	"wdv": "http://www.wikidata.org/value/",
	"wdt": "http://www.wikidata.org/prop/direct/",
	"p": "http://www.wikidata.org/prop/",
	"ps": "http://www.wikidata.org/prop/statement/",
	"psv": "http://www.wikidata.org/prop/statement/value/",
	"psn": "http://www.wikidata.org/prop/statement/value-normalized/",
	"pq": "http://www.wikidata.org/prop/qualifier/",
	"pqv": "http://www.wikidata.org/prop/qualifier/value/",
	"pqn": "http://www.wikidata.org/prop/qualifier/value-normalized/",
	"pr": "http://www.wikidata.org/prop/reference/",
	"prv": "http://www.wikidata.org/prop/reference/value/",
	"prn": "http://www.wikidata.org/prop/reference/value-normalized/",
	"wdno": "http://www.wikidata.org/prop/novalue/",
	"skos": "http://www.w3.org/2004/02/skos/core#",
	"schema": "http://schema.org/",
	"cc": "http://creativecommons.org/ns#",
	"geo": "http://www.opengis.net/ont/geosparql#",
	"prov": "http://www.w3.org/ns/prov#",
	//usually the defintion of the xml namespace is not needed, but
	//here we have to explicitely define it before using ZU.xpath
	"xml": "http://www.w3.org/XML/1998/namespace"
};


function detectWeb(doc, url) {
	var p31statement = doc.getElementById("P31");
	if (p31statement) {
		var p31values = ZU.xpath(p31statement, './/div[contains(@class, "wikibase-statementlistview")]//div[contains(@class, "wikibase-snakview-value")]/a/@title');
		for (var i=0; i<p31values.length; i++) {
			if (p31values[i] && typeMapping[p31values[i].textContent]) {
				return typeMapping[p31values[i].textContent];
			}
		}
	}
}


function doWeb(doc, url) {
	scrape(doc, url);
}


function scrape(doc, url) {
	var type = detectWeb(doc, url);
	url = url.replace(/#.*/, '');
	var qposition = url.indexOf('Q');
	var qnumber = url.substr(qposition);
	var xmlUrl = ZU.xpathText(doc, '//link[@rel="alternate" and @type="application/rdf+xml"]/@href');
	ZU.doGet(xmlUrl, function(data) {
		var parser = new DOMParser();
		var xml = parser.parseFromString(data, "application/xml");
		
		var item = new Zotero.Item(type);
		var nodes = ZU.xpath(xml, '//rdf:Description', namespaces);
		var creatorsArray = [];
		for (var i=0; i<nodes.length; i++) {
			var rdfabout = nodes[i].getAttribute("rdf:about");
			if (rdfabout) {
				var id = rdfabout.substr(rdfabout.length-qnumber.length);
				if (id==qnumber) {
					for (var prop in nodes[i].childNodes) {
						var propstatement = nodes[i].childNodes[prop];
						var tagname = propstatement.tagName;
						if (tagname && mapping[tagname]) {
							var zprop = mapping[tagname];
							var value = propstatement.textContent;
							var resource = propstatement.getAttribute("rdf:resource");
							if (!value && resource) {
								//Z.debug("Internal look up resource: " + resource);
								value = ZU.xpathText(xml, '//rdf:Description[@rdf:about="'+resource+'"]/rdfs:label[contains(@xml:lang, "en")][1]', namespaces)
									|| ZU.xpathText(xml, '//rdf:Description[@rdf:about="'+resource+'"]/rdfs:label[1]', namespaces);
									
								//Z.debug(value);
							}
							if (zprop=="creator") {
								var seriesOrdinal = ZU.xpathText(xml, '//rdf:Description[ps:P50[@rdf:resource="'+resource+'"]]/pq:P1545[1]', namespaces)
									|| ZU.xpathText(xml, '//rdf:Description[ps:P2093[text()="'+value+'"]]/pq:P1545[1]', namespaces);
								var func = creatorMapping[tagname] || 'contributor';
								creatorsArray.push([value, func, seriesOrdinal]);
							} else if (item[zprop]) {
								item[zprop] += ', ' + value;
							} else {
								item[zprop] = value;
							}
						}
					}
				}
			}
		}
		if (item.title && item.subtitle) {
			item.title += ': ' + item.subtitle;
			delete item.subtitle;
		}
		creatorsArray.sort(function(a,b) {
			return a[2] - b[2];
		});
		for (let aut of creatorsArray) {
			item.creators.push(ZU.cleanAuthor(aut[0], aut[1]));
		}
		//in Zotero we cannot allow multiple DOIs
		if (item.DOI && item.DOI.includes(', ')) {
			item.DOI = ZU.xpathText(xml, '(//rdf:Description[wikibase:rank[contains(@rdf:resource, "#PreferredRank")]]/ps:P356)[1]', namespaces)
				|| ZU.xpathText(xml, '(//rdf:Description[wikibase:rank[contains(@rdf:resource, "#NormalRank")]]/ps:P356)[1]', namespaces)
				|| ZU.xpathText(xml, '(//rdf:Description[wikibase:rank[contains(@rdf:resource, "#DeprecatedRank")]]/ps:P356)[1]', namespaces);
		}
		if (item.tagString) {
			var tags = item.tagString.split(', ');
			for (var j=0; j<tags.length; j++) {
				item.tags.push(tags[j]);
			}
			delete item.tagString;
		}

		item.complete();
	});
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://www.wikidata.org/wiki/Q30000000",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "The Synergistic Activity of Thyroid Transcription Factor 1 and Pax 8 Relies on the Promoter/Enhancer Interplay",
				"creators": [
					{
						"firstName": "Stefania",
						"lastName": "Miccadei",
						"creatorType": "author"
					},
					{
						"firstName": "Rossana De",
						"lastName": "Leo",
						"creatorType": "author"
					},
					{
						"firstName": "Enrico",
						"lastName": "Zammarchi",
						"creatorType": "author"
					},
					{
						"firstName": "Pier Giorgio",
						"lastName": "Natali",
						"creatorType": "author"
					},
					{
						"firstName": "Donato",
						"lastName": "Civitareale",
						"creatorType": "author"
					}
				],
				"date": "2002-04-01T00:00:00Z",
				"DOI": "10.1210/MEND.16.4.0808",
				"issue": "4",
				"language": "English",
				"libraryCatalog": "Wikidata",
				"pages": "837-846",
				"publicationTitle": "Molecular Endocrinology",
				"volume": "16",
				"attachments": [],
				"tags": [
					{
						"tag": "transcription"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.wikidata.org/wiki/Q29121277",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "FindZebra: A search engine for rare diseases",
				"creators": [
					{
						"firstName": "Radu",
						"lastName": "Dragusin",
						"creatorType": "author"
					},
					{
						"firstName": "Paula",
						"lastName": "Petcu",
						"creatorType": "author"
					},
					{
						"firstName": "Christina",
						"lastName": "Lioma",
						"creatorType": "author"
					},
					{
						"firstName": "Birger",
						"lastName": "Larsen",
						"creatorType": "author"
					},
					{
						"firstName": "Henrik L.",
						"lastName": "Jørgensen",
						"creatorType": "author"
					},
					{
						"firstName": "Ingemar J.",
						"lastName": "Cox",
						"creatorType": "author"
					},
					{
						"firstName": "Lars Kai",
						"lastName": "Hansen",
						"creatorType": "author"
					},
					{
						"firstName": "Peter",
						"lastName": "Ingwersen",
						"creatorType": "author"
					},
					{
						"firstName": "Ole",
						"lastName": "Winther",
						"creatorType": "author"
					}
				],
				"date": "2013-06-01T00:00:00Z",
				"DOI": "10.1016/J.IJMEDINF.2013.01.005",
				"issue": "6",
				"libraryCatalog": "Wikidata",
				"pages": "528-538",
				"publicationTitle": "International Journal of Medical Informatics",
				"shortTitle": "FindZebra",
				"volume": "82",
				"attachments": [],
				"tags": [
					{
						"tag": "rare disease"
					},
					{
						"tag": "search engine"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.wikidata.org/wiki/Q470573",
		"items": [
			{
				"itemType": "film",
				"title": "Les Charlots en folie: À nous quatre Cardinal !",
				"creators": [
					{
						"firstName": "André",
						"lastName": "Hunebelle",
						"creatorType": "director"
					},
					{
						"firstName": "Jean",
						"lastName": "Halain",
						"creatorType": "scriptwriter"
					},
					{
						"firstName": "Gérard",
						"lastName": "Rinaldi",
						"creatorType": "contributor"
					},
					{
						"firstName": "Jean-Guy",
						"lastName": "Fechner",
						"creatorType": "contributor"
					},
					{
						"firstName": "Jean",
						"lastName": "Sarrus",
						"creatorType": "contributor"
					},
					{
						"firstName": "Gérard",
						"lastName": "Filippelli",
						"creatorType": "contributor"
					},
					{
						"firstName": "André",
						"lastName": "Badin",
						"creatorType": "contributor"
					},
					{
						"firstName": "André",
						"lastName": "Dumas",
						"creatorType": "contributor"
					},
					{
						"firstName": "Bernard",
						"lastName": "Haller",
						"creatorType": "contributor"
					},
					{
						"firstName": "Bernard",
						"lastName": "Lajarrige",
						"creatorType": "contributor"
					},
					{
						"firstName": "Bernard",
						"lastName": "Menez",
						"creatorType": "contributor"
					},
					{
						"firstName": "Catherine",
						"lastName": "Jourdan",
						"creatorType": "contributor"
					},
					{
						"firstName": "Daniel",
						"lastName": "Ceccaldi",
						"creatorType": "contributor"
					},
					{
						"firstName": "Dominique",
						"lastName": "Zardi",
						"creatorType": "contributor"
					},
					{
						"firstName": "Gib",
						"lastName": "Grossac",
						"creatorType": "contributor"
					},
					{
						"firstName": "Henri",
						"lastName": "Attal",
						"creatorType": "contributor"
					},
					{
						"firstName": "Igor De",
						"lastName": "Savitch",
						"creatorType": "contributor"
					},
					{
						"firstName": "Jacques",
						"lastName": "Dynam",
						"creatorType": "contributor"
					},
					{
						"firstName": "Jacques",
						"lastName": "Legras",
						"creatorType": "contributor"
					},
					{
						"firstName": "Jacques",
						"lastName": "Seiler",
						"creatorType": "contributor"
					},
					{
						"firstName": "Jean",
						"lastName": "Valmont",
						"creatorType": "contributor"
					},
					{
						"firstName": "Jean-Marie",
						"lastName": "Proslier",
						"creatorType": "contributor"
					},
					{
						"firstName": "Josephine",
						"lastName": "Chaplin",
						"creatorType": "contributor"
					},
					{
						"firstName": "Karin",
						"lastName": "Petersen",
						"creatorType": "contributor"
					},
					{
						"firstName": "Max",
						"lastName": "Montavon",
						"creatorType": "contributor"
					},
					{
						"firstName": "Paul",
						"lastName": "Mercey",
						"creatorType": "contributor"
					},
					{
						"firstName": "Paul",
						"lastName": "Préboist",
						"creatorType": "contributor"
					},
					{
						"firstName": "Yvan",
						"lastName": "Chiffre",
						"creatorType": "contributor"
					},
					{
						"firstName": "Yvan",
						"lastName": "Tanguy",
						"creatorType": "contributor"
					},
					{
						"firstName": "Georges",
						"lastName": "Mansart",
						"creatorType": "contributor"
					},
					{
						"firstName": "Robert",
						"lastName": "Favart",
						"creatorType": "contributor"
					}
				],
				"date": "1974-08-30T00:00:00Z",
				"genre": "comedy film, parody film, swashbuckler film, film adaptation",
				"libraryCatalog": "Wikidata",
				"runningTime": "+75",
				"shortTitle": "Les Charlots en folie",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.wikidata.org/wiki/Q480743",
		"items": [
			{
				"itemType": "book",
				"title": "Eichmann in Jerusalem: A Report on the Banality of Evil",
				"creators": [
					{
						"firstName": "Hannah",
						"lastName": "Arendt",
						"creatorType": "author"
					}
				],
				"date": "1963-01-01T00:00:00Z",
				"language": "English",
				"libraryCatalog": "Wikidata",
				"publisher": "Viking Press",
				"shortTitle": "Eichmann in Jerusalem",
				"attachments": [],
				"tags": [
					{
						"tag": "Adolf Eichmann"
					},
					{
						"tag": "the Holocaust"
					},
					{
						"tag": "war crimes trial"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.wikidata.org/wiki/Q30051491",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Characterization of Agouti-Related Protein Binding to Melanocortin Receptors",
				"creators": [
					{
						"firstName": "Ying-kui",
						"lastName": "Yang",
						"creatorType": "author"
					},
					{
						"firstName": "Darren A.",
						"lastName": "Thompson",
						"creatorType": "author"
					},
					{
						"firstName": "Chris J.",
						"lastName": "Dickinson",
						"creatorType": "author"
					},
					{
						"firstName": "Jill",
						"lastName": "Wilken",
						"creatorType": "author"
					},
					{
						"firstName": "Greg S.",
						"lastName": "Barsh",
						"creatorType": "author"
					},
					{
						"firstName": "Stephen B. H.",
						"lastName": "Kent",
						"creatorType": "author"
					},
					{
						"firstName": "Ira",
						"lastName": "Gantz",
						"creatorType": "author"
					}
				],
				"date": "1999-01-01T00:00:00Z",
				"issue": "1",
				"libraryCatalog": "Wikidata",
				"pages": "148-155",
				"publicationTitle": "Molecular Endocrinology",
				"volume": "13",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	}
];
/** END TEST CASES **/
