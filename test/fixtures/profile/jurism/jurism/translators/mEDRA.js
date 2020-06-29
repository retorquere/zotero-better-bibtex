{
	"translatorID": "d9b57cd5-5a9c-4946-8616-3bdf8edfcbb5",
	"label": "mEDRA",
	"creator": "Aurimas Vinckevicius",
	"target": "^https?://www\\.medra\\.org/servlet/view\\?",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 105,
	"inRepository": true,
	"translatorType": 12,
	"browserSupport": "g",
	"lastUpdated": "2014-05-26 03:50:55"
}

function scrapeMasterTable(doc) {
	var meta = {};
	var td = doc.getElementById('contenuto');
	if (!td) return false;
	
	scrapeTable(td.firstElementChild, meta);
	if (!Object.keys(meta).length) return false; // DOI not found page
	
	return meta;
}

function scrapeTable(node, meta) {
	if (!node) return;
	var section;
	do {
		var tagName = node.tagName.split(':').pop(); // drop XHTML prefix
		if (tagName == 'BR') continue;
		
		if (tagName == 'SPAN') {
			var sectionHeading = ZU.trimInternal(node.textContent).toLowerCase();
			switch (sectionHeading) {
				case 'doi resolution data:':
				case 'serial article data:':
				case 'content item data:':
				case 'metadata:':
					// Metadata describes the actual item being referenced
					section = 'top';
				break;
				case 'serial publication data:':
				case 'journal issue data:':
				case 'monographic publication data:':
					// Metadata describes the container
					section = 'container';
				break;
				default:
					Zotero.debug('Unknown section: ' + sectionHeading);
					section = null;
			}
			continue;
		}
		
		if (tagName == 'TABLE') {
			if (node.getElementsByTagName('span').length) {
				//there are subtables, dig deeper
				var tr = node.firstElementChild.firstElementChild;
				while (tr) {
					if (tr.firstElementChild) {
						scrapeTable(tr.firstElementChild.firstElementChild, meta);
					}
					tr = tr.nextElementSibling;
				}
			} else {
				scrapeMeta(node.firstElementChild.firstElementChild, section, meta);
			}
		}
	} while (node = node.nextElementSibling);
}

var map = {
	'all': {
		'doi': 'DOI',
		'url': 'url',
		'publisher': 'publisher',
		'country of publication': 'place',
		'issn': 'ISSN',
		'product form': 'itemType',
		'journal issue number': 'issue',
		'language of text': 'language',
		'first page': 'firstPage', // Combine with lastPage later
		'last page': 'lastPage',
		'copyright year': 'cDate', // Copyright date. To be combined with copyright holder later
		'copyright owner': 'cOwner', // Copyright holder
		'descriptive text': 'abstractNote'
	},
	'container': {
		'full title': 'publicationTitle'
	},
	'top': {
		'full title': 'title'
	}
};

var creatorMap = {
	author: 'author' // Haven't seen any others yet
};

function scrapeMeta(tr, section, meta) {
	if (!tr) return;
	do {
		var label = tr.firstElementChild;
		var value = ZU.trimInternal(label.nextElementSibling.textContent);
		label = ZU.trimInternal(label.textContent).toLowerCase();
		
		if (!label || !value) continue;
		
		var zLabel = map.all[label] || map[section][label];
		if (zLabel) {
			meta[zLabel] = value;
			continue;
		}
		
		// Some special cases
		if (label.indexOf('by ') == 0) {
			// Authors. Role indicated in first set of parentheses
			var role = label.match(/\(([^(]+?)\)/);
			if (role && (role = creatorMap[role[1].trim()])) {
				if (!meta.creators) meta.creators = [];
				meta.creators.push({
					// We will split this up properly later. Authors may be
					// already incorrectly split across a number of "authors" if
					// the supplied metadata used HTML numeric character escapes.
					// mEDRA seems to think that a semicolon indicates another author
					lastName: value,
					creatorType: role
				});
			} else {
				Zotero.debug("Unknown creator role: " + label);
			}
		} else if (label.indexOf('journal issue date') == 0
			|| label.indexOf('publication date') == 0) {
			// These all seem to be the same. We "turn" them into ISO dates
			meta.date = value.replace(/\s*\/\s*/g, '-');
		} else if (label.indexOf('other product identifier') == 0) {
			// Some of these are ISBNs
			var isbn = ZU.cleanISBN(value);
			if (isbn) meta.ISBN = isbn;
		} else {
			Zotero.debug('Unknwon label: ' + label);
		}
	} while (tr = tr.nextElementSibling);
}

function detectWeb(doc, url) {
	var meta = scrapeMasterTable(doc);
	if (!meta) return;
	
	return mapItemType(meta);
}

var itemTypeMap = {
	DH: 'journalArticle',
	JB: 'journalArticle',
	JD: 'journalArticle',
	BA: 'bookSection' // Haven't seen a DOI for the whole book yet
};

function  mapItemType(meta) {
	var value = meta.itemType;
	delete meta.itemType; // So we don't bother with it later
	if (value) {
		var type = value.match(/\(\s*([A-Z]{2})\s*\)/);
		if (type) {
			if (!itemTypeMap[type[1]]) {
				Zotero.debug("Unknown item type: " + value);
			} else {
				return itemTypeMap[type[1]];
			}
		}
	}
	
	Z.debug('Using default item type: journalArticle');
	return 'journalArticle';
}

function doWeb(doc, url) {
	var meta = scrapeMasterTable(doc);
	if (!meta) return;
	
	var type = mapItemType(meta);
	
	var item = new Zotero.Item(type);
	for (var label in meta) {
		var value = meta[label];
		switch (label) {
			case 'language':
				// We only want to the 3 letter code, which is in parentheses
				var lang = value.match(/\(\s*(\w{3})\s*\)/);
				if (lang) {
					value = lang[1].trim();
				}
			break;
			case 'place':
				// Don't need the 2 letter code
				value = value.replace(/\s*\(.*/, '');
			break;
			case 'cDate':
			case 'cOwner':
				// Combine whatever we have about the copyright
				value = '©' + (meta.cDate ? meta.cDate + ' ' : '')
					+ (meta.cOwner || '');
				delete meta.cOwner; // Don't bother with this later
				delete meta.cDate;
				label = 'rights';
			break;
			case 'firstPage':
				if (meta.lastPage) {
					value += '–' + meta.lastPage;
				}
				label = 'pages';
			break;
			case 'lastPage':
				// We deal with this when we encounter firstPage.
				// Not sure what to do if we just had lastPage.
				continue;
			break;
			case 'creators':
				// Looks like if mENDRA receives HTML special chars,
				// it will split the name into multiples on the semicolon
				// When this happens, the names will end with what look like
				// HTML numeric character escapes, but without the semicolon
				// We use this to combine consecutive names and fix the escapes
				var name;
				for (var i=0; i<value.length; i++) {
					if (/\&#\d{2,4}$/.test(value[i].lastName)) {
						name = value[i].lastName + ';';
						for (var j=i+1; j<value.length; j++) {
							if (value[j].lastName.charAt(0).toUpperCase() == value[j].lastName.charAt(0)) {
								// This could actually be a new author
								if (name.indexOf(',') != -1
									&& (value[j].lastName.indexOf(',') != -1)) {
									// We already have a comma and the next name
									// contains a comma so the current name is done.
									// This may miss some cases (e.g. the following
									// name contains an escaped character in the last
									// name) and we should probably work backwards
									// to be certain, but... eh
									break;
								}
							}
							name += value[j].lastName;
							
							value.splice(j,1);
							j--;
							
							if (!/\&#\d{2,4}$/.test(name)) {
								// There doesn't seem to be another split
								break;
							} else {
								name += ';';
							}
						}
						name = ZU.unescapeHTML(name);
						value[i] = ZU.cleanAuthor(name, value[i].creatorType, true);
					} else {
						// Time to properly split, since we didn't do it before
						value[i] = ZU.cleanAuthor(
							value[i].lastName,
							value[i].creatorType,
							value[i].lastName.indexOf(',') != -1
						);
					}
				}
			break;
		}
		
		if ((label == 'title' || label == 'publicationTitle')) {
			if (value.toUpperCase() == value) {
				value = ZU.capitalizeTitle(value, true);
			}
			value = value.replace(/\s+:/g, ':');
		}
		
		item[label] = value;
	}
	
	item.complete();
}

function sanitizeQueries(queries) {
	if (typeof queries == 'string' || !queries.length) queries = [queries];
	
	var dois = [], doi;
	for (var i=0; i<queries.length; i++) {
		if (queries[i].DOI) {
			doi = ZU.cleanDOI(queries[i].DOI);
		} else if (typeof queries[i] == 'string') {
			doi = ZU.cleanDOI(queries[i]);
		} else {
			doi = undefined;
		}
		
		if (doi) dois.push(doi);
	}
	
	return dois;
}

function detectSearch(queries) {
	if (!queries) return;
	
	return !!sanitizeQueries(queries).length;
}

function doSearch(queries) {
	var dois = sanitizeQueries(queries);
	var urls = [];
	for (var i=0; i<dois.length; i++) {
		urls.push('https://www.medra.org/servlet/view?lang=en&doi='
			+ encodeURIComponent(dois[i]));
	}
	ZU.processDocuments(urls, doWeb);
}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://www.medra.org/servlet/view?lang=en&doi=10.12908/SEEJPH-2014-05",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Level of competencies of family physicians from patients’ viewpoint in post-war Kosovo",
				"creators": [
					{
						"firstName": "Gazmend",
						"lastName": "Bojaj",
						"creatorType": "author"
					},
					{
						"firstName": "Katarzyna",
						"lastName": "Czabanowska",
						"creatorType": "author"
					},
					{
						"firstName": "Fitim",
						"lastName": "Skeraj",
						"creatorType": "author"
					}
				],
				"date": "2014-02-09",
				"DOI": "10.12908/SEEJPH-2014-05",
				"language": "ger",
				"libraryCatalog": "mEDRA",
				"url": "http://www.seejph.com/index.php/seejph/article/view/25",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.medra.org/servlet/view?lang=en&doi=10.1446/38900",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Mostar story. Results and challenges of post-war recovery",
				"creators": [
					{
						"firstName": "Medina",
						"lastName": "Hadzihasanovic-Katana",
						"creatorType": "author"
					}
				],
				"date": "2012",
				"DOI": "10.1446/38900",
				"ISSN": "1122-7885",
				"issue": "3",
				"language": "ita",
				"libraryCatalog": "mEDRA",
				"pages": "305–314",
				"publicationTitle": "Economia della Cultura",
				"rights": "©2012 Societ� Editrice Il Mulino S.p.A.",
				"url": "http://www.mulino.it/rivisteweb/scheda_articolo.php?id_articolo=38900",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.medra.org/servlet/view?lang=en&doi=10.1400/221264",
		"items": [
			{
				"itemType": "bookSection",
				"title": "Sir John Moore Speaks Spanish: His Views on Spanish People and on Patriot Spain in the Peninsular War",
				"creators": [
					{
						"firstName": "Tamara",
						"lastName": "Pérez Fernández",
						"creatorType": "author"
					}
				],
				"ISBN": "9788490120989",
				"bookTitle": "Current trends in Anglophone studies: cultural, linguistic and literary research / eds., Javier Ruano García ... [et al.]",
				"language": "eng",
				"libraryCatalog": "mEDRA",
				"place": "Spain",
				"publisher": "Ediciones Universidad de Salamanca",
				"shortTitle": "Sir John Moore Speaks Spanish",
				"url": "http://digital.casalini.it/inc/DOInotfound.asp?DOI=10.1400/221264",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.medra.org/servlet/view?lang=en&doi=10.12851/EESJ201404ART32",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "The Triple Control System During the Civil War in Soviet Russia",
				"creators": [
					{
						"firstName": "Alexander L.",
						"lastName": "Filonenko",
						"creatorType": "author"
					},
					{
						"firstName": "Rustam Z.",
						"lastName": "Yarmuhametov",
						"creatorType": "author"
					}
				],
				"date": "2014-04",
				"DOI": "10.12851/EESJ201404ART32",
				"issue": "2/2014",
				"language": "rus",
				"libraryCatalog": "mEDRA",
				"publicationTitle": "Eastern European Scientific Journal",
				"url": "http://auris-verlag.de/journale.html",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.medra.org/servlet/view?lang=en&doi=10.7410/1100",
		"items": [
			{
				"itemType": "bookSection",
				"title": "Attrition war e patronato: ufficiali spagnoli ed élite lombarde nella seconda fase delle Guerre d'Italia",
				"creators": [
					{
						"firstName": "Michele Maria",
						"lastName": "Rabà",
						"creatorType": "author"
					}
				],
				"ISBN": "9788897317135",
				"bookTitle": "El que del amistad mostró el camino: omaggio a Giuseppe Bellini / a cura di Patrizia Spinato Bruschi, coordinamento di Emilia del Giudice e Michele Maria Rabà",
				"language": "ita",
				"libraryCatalog": "mEDRA",
				"place": "Italy",
				"publisher": "ISEM - Istituto di Storia dell'Europa Mediterranea",
				"shortTitle": "Attrition war e patronato",
				"url": "http://digital.casalini.it/10.7410/1100",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.medra.org/servlet/view?lang=en&doi=10.3269/1970-5492.2014.9.2",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Treatment of the Chronic War Tibial Osteomyelitis, Gustilo Type Iiib and Cierny-Mader Iiib, Using Various Methods. a Retrospective Study.",
				"creators": [
					{
						"firstName": "Predrag",
						"lastName": "Grubor",
						"creatorType": "author"
					}
				],
				"date": "2014",
				"DOI": "10.3269/1970-5492.2014.9.2",
				"ISSN": "2279-7165",
				"issue": "9",
				"language": "eng",
				"libraryCatalog": "mEDRA",
				"pages": "7–18",
				"publicationTitle": "Euromediterranean Biomedical Journal",
				"url": "http://www.embj.org/images/ISSUE_2014/grubor_2.pdf",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.medra.org/servlet/view?lang=en&doi=10.3239/9783656578857",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "The Iraq War 2003 - A Just or Unjust War?",
				"creators": [
					{
						"firstName": "Dennis",
						"lastName": "Trom",
						"creatorType": "author"
					}
				],
				"DOI": "10.3239/9783656578857",
				"libraryCatalog": "mEDRA",
				"url": "http://www.grin.com/en/e-book/267324/the-iraq-war-2003-a-just-or-unjust-war",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.medra.org/servlet/view?lang=en&doi=10.7336/academicus.2014.09.05",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Second world war, communism and post-communism in Albania, an equilateral triangle of a tragic trans-Adriatic story. The Eftimiadi’s Saga",
				"creators": [
					{
						"firstName": "Muner",
						"lastName": "Paolo",
						"creatorType": "author"
					}
				],
				"date": "2014-01",
				"DOI": "10.7336/academicus.2014.09.05",
				"ISSN": "20793715",
				"abstractNote": "The complicated, troubled and tragic events of a wealthy family from Vlorë, Albania, which a century ago expanded its business to Italy, in Brindisi and Trieste, and whose grand land tenures and financial properties in Albania were nationalized by Communism after the Second World War. Hence the life-long solitary and hopeless fight of the last heir of the family to reconquer his patrimony that had been nationalized by Communism. Such properties would have been endowed to a planned foundation, which aims at perpetuating the memory of his brother, who was active in the resistance movement during the war and therefore hung by the Germans. His main institutional purpose is to help students from the Vlorë area to attend the University of Trieste. The paper is a travel in time through history, sociology and the consolidation of a state’s fundamentals, by trying to read the past aiming to understand the presence and save the future. The paper highlights the need to consider past models of social solidarity meanwhile renewing the actual one. This as a re-establishment of rule and understanding, a strategy to cope with pressures to renegotiate the social contract, as a universal need, by considering the past’s experiences as a firm base for successful social interaction. All this, inside a story which in the first look seems to be too personal and narrow, meanwhile it highlights the present and the past in a natural organic connection, dedicated to a nation in continuous struggle for its social reconstruction.",
				"language": "eng",
				"libraryCatalog": "mEDRA",
				"pages": "69–78",
				"publicationTitle": "Academicus International Scientific Journal",
				"rights": "©2014 Academicus",
				"url": "http://academicus.edu.al/?subpage=volumes&nr=9",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "search",
		"input": {
			"DOI": "10.3239/9783656578857"
		},
		"items": [
			{
				"itemType": "journalArticle",
				"title": "The Iraq War 2003 - A Just or Unjust War?",
				"creators": [
					{
						"firstName": "Dennis",
						"lastName": "Trom",
						"creatorType": "author"
					}
				],
				"DOI": "10.3239/9783656578857",
				"libraryCatalog": "mEDRA",
				"url": "http://www.grin.com/en/e-book/267324/the-iraq-war-2003-a-just-or-unjust-war",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/