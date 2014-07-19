{
	"translatorID": "96b9f483-c44d-5784-cdad-ce21b984fe01",
	"translatorType": 4,
	"label": "Amazon.com",
	"creator": "Sean Takats, Michael Berkowitz, and Simon Kornblith",
	"target": "^https?://(?:www\\.)?amazon",
	"minVersion": "3.0",
	"maxVersion": null,
	"priority": 100,
	"inRepository": true,
	"browserSupport": "gcsbv",
	"lastUpdated": "2014-07-11 01:15:00"
}

function detectWeb(doc, url) {
	if(getSearchResults(doc, url)) {
		return (Zotero.isBookmarklet ? "server" : "multiple");
	} else {
		var xpath = '//input[contains(@name, "ASIN")]';
		if(doc.evaluate(xpath, doc, null, XPathResult.ANY_TYPE, null).iterateNext()) {
			if(Zotero.isBookmarklet) return "server";
			
			var elmt = doc.evaluate('//input[@name="storeID"]', doc, null, XPathResult.ANY_TYPE, null).iterateNext();
			if(elmt) {
				var storeID = elmt.value;
				//Z.debug(storeID);
				if (storeID=="music"|storeID=="dmusic"){
					return "audioRecording";
				} else if (storeID=="dvd"|storeID=="dvd-de"|storeID=="video"|storeID=="movies-tv"){
					return "videoRecording";
				} else if (storeID=="videogames"|storeID=="mobile-apps") {
					return "computerProgram";
				} else {
					return "book";
				}
			} else {
				return "book";
			}
		}
	}
}

function getSearchResults(doc, url) {
	//search results
	var links = [],
		container = doc.getElementById('atfResults')
			|| doc.getElementById('mainResults'); //e.g. http://www.amazon.com/Mark-LeBar/e/B00BU8L2DK
	if(container) {
		links = ZU.xpath(container, './div[starts-with(@id,"result_")]//h3/a')
	}
	
	if(!links.length) {
		//wish lists
		container = doc.getElementById('item-page-wrapper');
		if(container) {
			links = ZU.xpath(container, './/a[starts-with(@id, "itemName_")]');
		}
	}
	
	if(!links.length) return false;
	
	var availableItems = {}, found = false,
		asinRe = /\/(?:dp|product)\/(?:[^?#]+)\//;
	for(var i=0; i<links.length; i++) {
		var elmt = links[i];
		if(asinRe.test(elmt.href)) {
			availableItems[elmt.href] = elmt.textContent.trim();
			found = true;
		}
	}
	
	return found ? availableItems : false;
}

function doWeb(doc, url) {
	if(detectWeb(doc, url) == 'multiple') {
		Zotero.selectItems(getSearchResults(doc, url), function(items) {
			if(!items) return true;
			
			var links = [];
			for(var i in items) links.push(i);
			Zotero.Utilities.processDocuments(links, scrape);
		});

	} else {
		scrape(doc, url);
	}
}

function addLink(doc, item) {
	item.attachments.push({title:"Amazon.com Link", snapshot:false, mimeType:"text/html", url:doc.location.href});
}


var CREATOR = {
	"Actor":"castMember",
	"Director":"director",
	"Producer":"producer",
	"Writer":"scriptwriter",
	"Translator":"translator",
	"Author":"author",
	"Illustrator":"contributor"
};

var DATE = [
	"Original Release Date",
	"DVD Release Date"
];

//localization
var i15dFields = {
	'ISBN' : ['ISBN-13', 'ISBN-10', 'ISBN', '条形码'],
	'Publisher': ['Publisher', 'Verlag', 'Editora', '出版社', 'Editeur',  'Éditeur', 'Editore', 'Editor'],
	'Hardcover': ['Hardcover', 'Gebundene Ausgabe', '精装', 'ハードカバー', 'Relié', 'Copertina rigida', 'Tapa dura'],
	'Paperback' : ['Paperback', 'Taschenbuch', '平装', 'ペーパーバック', 'Broché', 'Copertina flessibile', 'Tapa blanda'],
	'Print Length' : ['Print Length', 'Seitenzahl der Print-Ausgabe', '紙の本の長さ', "Nombre de pages de l'édition imprimée", "Longueur d'impression", 'Lunghezza stampa', 'Longitud de impresión', 'Número de páginas'],//TODO: Chinese label
	'Language' : ['Language', 'Sprache', '语种', '言語', 'Langue', 'Lingua', 'Idioma'],
	'Author' : ['Author', '著', '作者'],
	'Actor' : ['Actors', 'Actor', 'Darsteller', 'Acteurs', 'Attori', 'Attore', 'Actores', '出演'],
	'Director' : ['Directors', 'Director', 'Regisseur', 'Regisseur(e)', 'Réalisateurs', 'Regista', 'Directores', '監督'],
	'Producer' : ['Producers', 'Producer'],
	'Run Time' : ['Run Time', 'Spieldauer', 'Durée', 'Durata', 'Duración', '時間'],
	'Studio' : ['Studio', 'Estudio', '販売元'],
	'Audio CD' : ['Audio CD', 'CD', 'CD de audio'],
	'Label' : ['Label', 'Etichetta', 'Étiquette', 'Sello', '发行公司', 'レーベル'],
	'Total Length' : ['Total Length', 'Gesamtlänge', 'Durée totale', 'Lunghezza totale', 'Duración total', '収録時間'],
	'Translator' : ["Translator", "Übersetzer", "Traduttore", "Traductor", "翻訳"],
	'Illustrator' : ["Illustrator", "Illustratore", "Ilustrador", "イラスト"],
	'Writer' : ['Writers']
};

function getField(info, field) {
	//returns the value for the key 'field' or any of its
	//corresponding (language specific) keys of the array 'info'
	
	if(!i15dFields[field]) return;
	
	for(var i=0; i<i15dFields[field].length; i++) {
		if(info[i15dFields[field][i]] !== undefined) return info[i15dFields[field][i]];	
	}
}

function translateField(str) {
	for(var f in i15dFields) {
		if(i15dFields[f].indexOf(str) != -1) {
			return f;
		}
	}
}

function get_nextsibling(n) {
	//returns next sibling of n, or if it was the last one
	//returns next sibling of its parent node, or... --> while(x == null)
	//accepts only element nodes (type 1) or nonempty textnode (type 3)
	//and skips everything else
	var x=n.nextSibling;
	while (x == null || (x.nodeType != 1 && (x.nodeType != 3 || x.textContent.match(/^\s*$/) ))) {
		if (x==null) {
			x = get_nextsibling(n.parentNode);
		} else {
			x=x.nextSibling;
		}
	}
	return x;	
}

function scrape(doc, url) {
	var isAsian = url.search(/^https?:\/\/[^\/]+\.(?:jp|cn)[:\/]/) != -1;
	// Scrape HTML for items without ISBNs, because Amazon doesn't provide an easy way for
	// open source projects like us to use their API
	Z.debug("Scraping from Page")		
	var department = ZU.xpathText(doc, '//li[contains(@class, "nav-category-button")]/a').trim();
	var item = new Zotero.Item(detectWeb(doc, url) || "book");

	var title = doc.getElementById('btAsinTitle')
		|| doc.getElementById('title_row')
		|| doc.getElementById('productTitle');
	// get first non-empty text node (other text nodes are things like [Paperback] and dates)
	item.title = ZU.trimInternal(
			ZU.xpathText(title, '(.//text()[normalize-space(self::text())])[1]')
		)
		// though sometimes [Paperback] or [DVD] is mushed with the title...
		.replace(/(?: [(\[].+[)\]])+$/, "");
	
	var baseNode = title.parentNode, bncl = baseNode.classList;
	while(baseNode &&
		!(baseNode.id == 'booksTitle' || bncl.contains('buying')
			|| bncl.contains('content') || bncl.contains('DigitalMusicInfoColumn'))
	) {
		baseNode = baseNode.parentNode;
		bncl = baseNode.classList;
	}
	
	if(baseNode) {
		var authors = ZU.xpath(baseNode, './/span[@id="artistBlurb"]/a');
		if(!authors.length) authors = baseNode.getElementsByClassName('contributorNameID');
		if(!authors.length) authors = ZU.xpath(baseNode, './/span[@class="contributorNameTrigger"]/a[not(@href="#")]');
		if(!authors.length) authors = ZU.xpath(baseNode, './/a[following-sibling::*[1][@class="byLinePipe"]]');
		if(!authors.length) authors = ZU.xpath(baseNode, './/a[contains(@href, "field-author=")]');
		for(var i=0; i<authors.length; i++) {
			var role = ZU.xpathText(authors[i], '(.//following::text()[normalize-space(self::text())])[1]');
			if(role) role = CREATOR[translateField(role.replace(/^.*\(\s*|\s*\).*$/g, ''))];
			if(!role) role = 'author';
			
			var name = ZU.trimInternal(authors[i].textContent)
				.replace(/\s*\([^)]+\)/, '');
			
			if(item.itemType == 'audioRecording') {
				item.creators.push({
					lastName: name,
					creatorType: 'performer',
					fieldMode: 1
				});
			} else {
				if(isAsian && name.indexOf(' ') == -1) name = name.replace(/.$/, ' $&');
				item.creators.push(ZU.cleanAuthor(name, role, false));
			}
		}
	}
	
	//Abstract
	var abstractNode = doc.getElementById('postBodyPS');
	if (abstractNode) {
		item.abstractNote = abstractNode.textContent.trim();
		if (!item.abstractNote) {
			var iframe = abstractNode.getElementsByTagName('iframe')[0];
			if(iframe) {
				abstractNode = iframe.contentWindow.document.getElementById('iframeContent');
				item.abstractNote = abstractNode.textContent.trim();
			}
		}
	}
	
	// Extract info into an array
	var info = {},
		els = ZU.xpath(doc, '//div[@class="content"]/ul/li[b]');
	if(els.length) {
		for(var i=0; i<els.length; i++) {
			var el = els[i],
				key = ZU.xpathText(el, 'b[1]').trim()
			if(key) {
				info[key.replace(/\s*:$/, "")] = el.textContent.substr(key.length+1).trim();
			}
		}
	} else {
		// New design encountered 06/30/2013
		els = ZU.xpath(doc, '//tr[td[@class="a-span3"]][td[@class="a-span9"]]');
		for(var i=0; i<els.length; i++) {
			var el = els[i],
				key = ZU.xpathText(el, 'td[@class="a-span3"]'),
				value = ZU.xpathText(el, 'td[@class="a-span9"]');
			if(key && value) info[key.trim()] = value.trim();
		}
	}
	// Date
	for(var i=0; i<DATE.length; i++) {
		item.date = info[DATE[i]];
		if(item.date) break;
	}
	if(!item.date) {
		for(var i in info) {
			var m = /\(([^)]+ [0-9]{4})\)/.exec(info[i]);
			if(m) item.date = m[1];
		}
	}
	
	// Books
	var publisher = getField(info, 'Publisher');
	if(publisher) {
		var m = /([^;(]+)(?:; *([^(]*))?( \([^)]*\))?/.exec(publisher);
		item.publisher = m[1];
		item.edition = m[2];
	}
	item.ISBN = getField(info, 'ISBN');
	if (item.ISBN) {
		item.ISBN = ZU.cleanISBN(item.ISBN);
	}
	var pages = getField(info, 'Hardcover') || getField(info, 'Paperback') || getField(info, 'Print Length');
	if(pages) item.numPages = parseInt(pages, 10);
	item.language = getField(info, 'Language');
	//add publication place from ISBN translator, see at the end
	
	// Video
	var clearedCreators = false;
	for(var i in CREATOR) {
		if(getField(info, i)) {
			if(!clearedCreators) {
				item.creators = [];
				clearedCreators = true;
			}
			var creators = getField(info, i).split(/ *, */);
			for(var j=0; j<creators.length; j++) {
				item.creators.push(ZU.cleanAuthor(creators[j], CREATOR[i]));
			}
		}
	}
	item.studio = getField(info, 'Studio');
	item.runningTime = getField(info, 'Run Time');
	if (!item.runningTime) item.runningTime = getField(info, 'Total Length');
	item.language = getField(info, 'Language');
	// Music
	item.label = getField(info, 'Label');
	if(getField(info, 'Audio CD')) {
		item.audioRecordingFormat = "Audio CD";
	} else if(department == "Amazon MP3 Store") {
		item.audioRecordingFormat = "MP3";
	}
	
	addLink(doc, item);
	
	//we search for translators for a given ISBN
	//and try to figure out the missing publication place
	if(item.ISBN && !item.place) {
		Z.debug("Searching for additional metadata by ISBN: " + item.ISBN);
		var search = Zotero.loadTranslator("search");
		search.setHandler("translators", function(obj, translators) {
			search.setTranslator(translators);
			search.setHandler("itemDone", function(obj, lookupItem) {
				Z.debug(lookupItem.libraryCatalog);
				if (lookupItem.place) {
					//e.g. [Paris]
					item.place = lookupItem.place.replace("[","").replace("]","");
				}
			});
			search.translate();
		});
		search.setHandler("error", function(error) {
			// we mostly need this handler to prevent the default one from kicking in
			Z.debug("ISBN search for " + item.ISBN + " failed: " + error);
		});
		search.setHandler("done", function() {
			item.complete();
		});
		search.setSearch({ ISBN: item.ISBN });
		search.getTranslators();
		
	} else {
		item.complete();
	}
	
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.amazon.com/Test-William-Sleator/dp/0810989891/ref=sr_1_1?ie=UTF8&qid=1308010556&sr=8-1",
		"items": [
			{
				"itemType": "book",
				"title": "Test",
				"creators": [
					{
						"firstName": "William",
						"lastName": "Sleator",
						"creatorType": "author"
					}
				],
				"date": "April 1, 2010",
				"ISBN": "9780810989894",
				"abstractNote": "Now in paperback! Pass, and have it made. Fail, and suffer the consequences. A master of teen thrillers tests readers’ courage in an edge-of-your-seat novel that echoes the fears of exam-takers everywhere. Ann, a teenage girl living in the security-obsessed, elitist United States of the very near future, is threatened on her way home from school by a mysterious man on a black motorcycle. Soon she and a new friend are caught up in a vast conspiracy of greed involving the mega-wealthy owner of a school testing company. Students who pass his test have it made; those who don’t, disappear . . . or worse. Will Ann be next? For all those who suspect standardized tests are an evil conspiracy, here’s a thriller that really satisfies! Praise for Test “Fast-paced with short chapters that end in cliff-hangers . . . good read for moderately reluctant readers. Teens will be able to draw comparisons to contemporary society’s shift toward standardized testing and ecological concerns, and are sure to appreciate the spoofs on NCLB.” —School Library Journal “Part mystery, part action thriller, part romance . . . environmental and political overtones . . . fast pace and unique blend of genres holds attraction for younger teen readers.” —Booklist",
				"edition": "Reprint edition",
				"language": "English",
				"libraryCatalog": "Amazon.com",
				"numPages": 320,
				"place": "New York",
				"publisher": "Amulet Paperbacks",
				"attachments": [
					{
						"title": "Amazon.com Link",
						"snapshot": false,
						"mimeType": "text/html"
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
		"url": "http://www.amazon.com/s/ref=nb_sb_noss?url=search-alias%3Dstripbooks&field-keywords=foot&x=0&y=0",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://www.amazon.com/Loveless-My-Bloody-Valentine/dp/B000002LRJ/ref=ntt_mus_ep_dpi_1",
		"items": [
			{
				"itemType": "audioRecording",
				"title": "Loveless",
				"creators": [
					{
						"lastName": "My Bloody Valentine",
						"creatorType": "performer",
						"fieldMode": 1
					}
				],
				"date": "November 5, 1991",
				"audioRecordingFormat": "Audio CD",
				"label": "Sire / London/Rhino",
				"libraryCatalog": "Amazon.com",
				"attachments": [
					{
						"title": "Amazon.com Link",
						"snapshot": false,
						"mimeType": "text/html"
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
		"url": "http://www.amazon.com/s?ie=UTF8&keywords=The%20Harvard%20Concise%20Dictionary%20of%20Music%20and%20Musicians&index=blended&Go=o",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://www.amazon.com/Adaptation-Superbit-Collection-Nicholas-Cage/dp/B00005JLRE/ref=sr_1_1?ie=UTF8&qid=1309683150&sr=8-1",
		"items": [
			{
				"itemType": "videoRecording",
				"title": "Adaptation",
				"creators": [
					{
						"firstName": "Nicolas",
						"lastName": "Cage",
						"creatorType": "castMember"
					},
					{
						"firstName": "Meryl",
						"lastName": "Streep",
						"creatorType": "castMember"
					},
					{
						"firstName": "Chris",
						"lastName": "Cooper",
						"creatorType": "castMember"
					},
					{
						"firstName": "Tilda",
						"lastName": "Swinton",
						"creatorType": "castMember"
					},
					{
						"firstName": "Jay",
						"lastName": "Tavare",
						"creatorType": "castMember"
					},
					{
						"firstName": "Spike",
						"lastName": "Jonze",
						"creatorType": "director"
					},
					{
						"firstName": "Charlie",
						"lastName": "Kaufman",
						"creatorType": "producer"
					},
					{
						"firstName": "Edward",
						"lastName": "Saxon",
						"creatorType": "producer"
					},
					{
						"firstName": "Jonathan",
						"lastName": "Demme",
						"creatorType": "producer"
					},
					{
						"firstName": "Peter",
						"lastName": "Saraf",
						"creatorType": "producer"
					},
					{
						"firstName": "Charlie",
						"lastName": "Kaufman",
						"creatorType": "scriptwriter"
					},
					{
						"firstName": "Donald",
						"lastName": "Kaufman",
						"creatorType": "scriptwriter"
					},
					{
						"firstName": "Susan",
						"lastName": "Orlean",
						"creatorType": "scriptwriter"
					}
				],
				"date": "May 20, 2003",
				"language": "English (Dolby Digital 2.0 Surround), English (Dolby Digital 5.1), English (DTS 5.1), French (Dolby Digital 5.1)",
				"libraryCatalog": "Amazon.com",
				"runningTime": "114 minutes",
				"studio": "Sony Pictures Home Entertainment",
				"attachments": [
					{
						"title": "Amazon.com Link",
						"snapshot": false,
						"mimeType": "text/html"
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
		"url": "http://www.amazon.com/gp/registry/registry.html?ie=UTF8&id=1Q7ELHV59D7N&type=wishlist",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://www.amazon.fr/Candide-Fran%C3%A7ois-Marie-Voltaire-Arouet-dit/dp/2035866014/ref=sr_1_2?s=books&ie=UTF8&qid=1362329827&sr=1-2",
		"items": [
			{
				"itemType": "book",
				"title": "Candide",
				"creators": [
					{
						"firstName": "François-Marie",
						"lastName": "Voltaire",
						"creatorType": "author"
					}
				],
				"date": "17 août 2011",
				"ISBN": "9782035866011",
				"abstractNote": "Que signifie ce nom \"Candide\" : innocence de celui qui ne connaît pas le mal ou illusion du naïf qui n'a pas fait l'expérience du monde ? Voltaire joue en 1759, après le tremblement de terre de Lisbonne, sur ce double sens. Il nous fait partager les épreuves fictives d'un jeune homme simple, confronté aux leurres de l'optimisme, mais qui n'entend pas désespérer et qui en vient à une sagesse finale, mesurée et mystérieuse. Candide n'en a pas fini de nous inviter au gai savoir et à la réflexion.",
				"language": "Français",
				"libraryCatalog": "Amazon.com",
				"numPages": 176,
				"place": "Paris",
				"publisher": "Larousse",
				"attachments": [
					{
						"title": "Amazon.com Link",
						"snapshot": false,
						"mimeType": "text/html"
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
		"url": "http://www.amazon.de/Fiktionen-Erz%C3%A4hlungen-Jorge-Luis-Borges/dp/3596105811/ref=sr_1_1?ie=UTF8&qid=1362329791&sr=8-1",
		"items": [
			{
				"itemType": "book",
				"title": "Fiktionen: Erzählungen 1939 - 1944",
				"creators": [
					{
						"firstName": "Jorge Luis",
						"lastName": "Borges",
						"creatorType": "author"
					}
				],
				"date": "1. Mai 1992",
				"ISBN": "9783596105816",
				"abstractNote": "Gleich bei seinem Erscheinen in den 40er Jahren löste Jorge Luis Borges’ erster Erzählband »Fiktionen« eine literarische Revolution aus. Erfundene Biographien, fiktive Bücher, irreale Zeitläufe und künstliche Realitäten verflocht Borges zu einem geheimnisvollen Labyrinth, das den Leser mit seinen Rätseln stets auf neue herausfordert. Zugleich begründete er mit seinen berühmten Erzählungen wie»›Die Bibliothek zu Babel«, «Die kreisförmigen Ruinen« oder»›Der Süden« den modernen »Magischen Realismus«.   »Obwohl sie sich im Stil derart unterscheiden, zeigen zwei Autoren uns ein Bild des nächsten Jahrtausends: Joyce und Borges.« Umberto Eco",
				"edition": "Auflage: 12",
				"language": "Deutsch",
				"libraryCatalog": "Amazon.com",
				"numPages": 192,
				"place": "Frankfurt am Main",
				"publisher": "FISCHER Taschenbuch",
				"shortTitle": "Fiktionen",
				"attachments": [
					{
						"title": "Amazon.com Link",
						"snapshot": false,
						"mimeType": "text/html"
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
		"url": "http://www.amazon.co.uk/Tale-Two-Cities-ebook/dp/B004EHZXVQ/ref=sr_1_1?s=books&ie=UTF8&qid=1362329884&sr=1-1",
		"items": [
			{
				"itemType": "book",
				"title": "A Tale of Two Cities",
				"creators": [
					{
						"firstName": "Charles",
						"lastName": "Dickens",
						"creatorType": "author"
					}
				],
				"date": "1 Dec 2010",
				"language": "English",
				"libraryCatalog": "Amazon.com",
				"numPages": 238,
				"publisher": "Public Domain Books",
				"attachments": [
					{
						"title": "Amazon.com Link",
						"snapshot": false,
						"mimeType": "text/html"
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
		"url": "http://www.amazon.it/Emil-Astrid-Lindgren/dp/888203867X/ref=sr_1_1?s=books&ie=UTF8&qid=1362324961&sr=1-1",
		"items": [
			{
				"itemType": "book",
				"title": "Emil",
				"creators": [
					{
						"firstName": "Astrid",
						"lastName": "Lindgren",
						"creatorType": "author"
					},
					{
						"firstName": "B.",
						"lastName": "Berg",
						"creatorType": "contributor"
					},
					{
						"firstName": "A. Palme",
						"lastName": "Sanavio",
						"creatorType": "translator"
					}
				],
				"date": "26 giugno 2008",
				"ISBN": "9788882038670",
				"abstractNote": "Si pensa che soprattutto in una casa moderna, con prese elettriche, gas, balconi altissimi un bambino possa mettersi in pericolo: Emil vive in una tranquilla casa di campagna, ma riesce a ficcare la testa in una zuppiera e a rimanervi incastrato, a issare la sorellina Ida in cima all'asta di una bandiera, e a fare una tale baldoria alla fiera del paese che i contadini decideranno di organizzare una colletta per spedirlo in America e liberare così la sua povera famiglia. Ma questo succederà nel prossimo libro di Emil, perché ce ne sarà un altro, anzi due, tante sono le sue monellerie. Età di lettura: da 7 anni.",
				"edition": "3 edizione",
				"language": "Italiano",
				"libraryCatalog": "Amazon.com",
				"numPages": 72,
				"place": "Milano",
				"publisher": "Nord-Sud",
				"attachments": [
					{
						"title": "Amazon.com Link",
						"snapshot": false,
						"mimeType": "text/html"
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
		"url": "http://www.amazon.cn/%E5%9B%BE%E4%B9%A6/dp/B007CUSP3A",
		"items": [
			{
				"itemType": "book",
				"title": "汉语语音合成:原理和技术",
				"creators": [
					{
						"firstName": "吕士",
						"lastName": "楠",
						"creatorType": "author"
					},
					{
						"firstName": "初",
						"lastName": "敏",
						"creatorType": "author"
					},
					{
						"firstName": "许洁",
						"lastName": "萍",
						"creatorType": "author"
					},
					{
						"firstName": "贺",
						"lastName": "琳",
						"creatorType": "author"
					}
				],
				"ISBN": "9787030329202",
				"abstractNote": "《汉语语音合成:原理和技术》介绍语音合成的原理和针对汉语的各项合成技术，以及应用的范例。全书分基础篇和专题篇两大部分。基础篇介绍语音合成技术的发展历程和作为语音合成技术基础的声学语音学知识，尤其是作者获得的相关研究成果（填补了汉语语音学知识中的某些空白），并对各种合成器的工作原理和基本结构进行系统的阐述。专题篇结合近十年来国内外技术发展的热点和方向，讨论韵律分析与建模、数据驱动的语音合成方法、语音合成数据库的构建技术、文语转换系统的评估方法、语音合成技术的应用等。 《汉语语音合成:原理和技术》面向从事语言声学、语音通信技术，特别是语音合成的科学工作者、工程技术人员、大学教师、研究生和高年级的大学生，可作为他们研究、开发、进修的参考书。",
				"edition": "第1版",
				"libraryCatalog": "Amazon.com",
				"numPages": 373,
				"place": "Beijing",
				"publisher": "科学出版社",
				"shortTitle": "汉语语音合成",
				"attachments": [
					{
						"title": "Amazon.com Link",
						"snapshot": false,
						"mimeType": "text/html"
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
		"url": "http://www.amazon.co.uk/Walt-Disney-Pixar-Up-DVD/dp/B0029Z9UQ4/ref=sr_1_1?s=dvd&ie=UTF8&qid=1395560537&sr=1-1&keywords=up",
		"items": [
			{
				"itemType": "videoRecording",
				"title": "Walt Disney / Pixar - Up",
				"creators": [
					{
						"firstName": "Ed",
						"lastName": "Asner",
						"creatorType": "castMember"
					},
					{
						"firstName": "Christopher",
						"lastName": "Plummer",
						"creatorType": "castMember"
					},
					{
						"firstName": "Jordan",
						"lastName": "Nagai",
						"creatorType": "castMember"
					},
					{
						"firstName": "Pete",
						"lastName": "Docter",
						"creatorType": "director"
					},
					{
						"firstName": "Bob",
						"lastName": "Peterson",
						"creatorType": "director"
					}
				],
				"date": "15 Feb 2010",
				"language": "English",
				"libraryCatalog": "Amazon.com",
				"runningTime": "96 minutes",
				"studio": "Walt Disney Studios Home Entertainment",
				"attachments": [
					{
						"title": "Amazon.com Link",
						"snapshot": false,
						"mimeType": "text/html"
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
		"url": "http://www.amazon.de/dp/B00GKBYC3E/",
		"items": [
			{
				"itemType": "audioRecording",
				"title": "Die Eiskönigin Völlig Unverfroren",
				"creators": [
					{
						"lastName": "Various artists",
						"creatorType": "performer",
						"fieldMode": 1
					}
				],
				"libraryCatalog": "Amazon.com",
				"runningTime": "1:08:59",
				"attachments": [
					{
						"title": "Amazon.com Link",
						"snapshot": false,
						"mimeType": "text/html"
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
		"url": "http://www.amazon.co.jp/gp/product/0099578077/",
		"items": [
			{
				"itemType": "book",
				"title": "1Q84: Books 1, 2 and 3",
				"creators": [
					{
						"firstName": "Haruki",
						"lastName": "Murakami",
						"creatorType": "author"
					}
				],
				"date": "August 2, 2012",
				"ISBN": "9780099578079",
				"language": "英語, 英語, 不明",
				"libraryCatalog": "Amazon.com",
				"numPages": 1328,
				"place": "London",
				"publisher": "Vintage",
				"shortTitle": "1Q84",
				"attachments": [
					{
						"title": "Amazon.com Link",
						"snapshot": false,
						"mimeType": "text/html"
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
		"url": "http://www.amazon.com/Mark-LeBar/e/B00BU8L2DK",
		"items": "multiple"
	}
]
/** END TEST CASES **/