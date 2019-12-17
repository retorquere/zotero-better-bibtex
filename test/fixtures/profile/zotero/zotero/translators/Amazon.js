{
	"translatorID": "96b9f483-c44d-5784-cdad-ce21b984fe01",
	"label": "Amazon",
	"creator": "Sean Takats, Michael Berkowitz, and Simon Kornblith",
	"target": "^https?://((www\\.)|(smile\\.))?amazon",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsbv",
	"lastUpdated": "2019-08-11 10:33:35"
}

// attr()/text() v2
// eslint-disable-next-line
function attr(docOrElem,selector,attr,index){var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector);return elem?elem.getAttribute(attr):null;}function text(docOrElem,selector,index){var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector);return elem?elem.textContent:null;}


function detectWeb(doc, _url) {
	if (getSearchResults(doc, true)) {
		return (Zotero.isBookmarklet ? "server" : "multiple");
	}
	else if (attr(doc, 'input[name*="ASIN"]', 'value')) {
		if (Zotero.isBookmarklet) return "server";
		
		var productClass = attr(doc, 'div[id="dp"]', 'class');
		if (!productClass) {
			Z.debug("No product class found, try store ID instead.");
			productClass = attr(doc, 'input[name="storeID"]', 'value');
		}
		// delete language code
		productClass = productClass.replace(/[a-z][a-z]_[A-Z][A-Z]/, "").trim();
		
		if (productClass) {
			if (productClass.includes("book")) { // also ebooks
				return "book";
			}
			else if (productClass == "music" | productClass == "dmusic") {
				return "audioRecording";
			}
			else if (productClass == "dvd" | productClass == "dvd-de" | productClass == "video" | productClass == "movies-tv") {
				return "videoRecording";
			}
			else if (productClass == "videogames" | productClass == "mobile-apps") {
				return "computerProgram";
			}
			else {
				Z.debug("Unknown product class" + productClass + "will be ignored by Zotero");
			}
		}
		else {
			// audio books are purchased as audible abo
			if (text(doc, 'form[class="a-spacing-none"][action*="/audible/"]')) {
				return "audioRecording";
			}
			var mainCategory = text(doc, '#wayfinding-breadcrumbs_container li a');
			if (mainCategory && mainCategory.includes('Kindle')) {
				return "book";
			}
			else {
				Z.debug("Items in this category will be ignored by Zotero: " + mainCategory);
			}
		}
	}
	return false;
}

function getSearchResults(doc, checkOnly) {
	// search results
	var links = doc.querySelectorAll('div.s-result-list h2>a');
	
	if (!links.length) {
		// wish lists
		var container = doc.getElementById('item-page-wrapper');
		if (container) {
			links = ZU.xpath(container, './/a[starts-with(@id, "itemName_")]');
		}
	}
	
	if (!links.length) {
		// author pages
		links = ZU.xpath(doc, '//div[@id="searchWidget"]//a[span[contains(@class, "a-size-medium")]]');
	}
	
	if (!links.length) return false;
	var availableItems = {}, found = false,
		asinRe = /\/(?:dp|product)\/(?:[^?#]+)\//;
	for (var i = 0; i < links.length; i++) {
		var elmt = links[i];
		if (asinRe.test(elmt.href)) {
			if (checkOnly) return true;
			availableItems[elmt.href] = elmt.textContent.trim();
			found = true;
		}
	}
	
	return found ? availableItems : false;
}

function doWeb(doc, url) {
	if (detectWeb(doc, url) == 'multiple') {
		Zotero.selectItems(getSearchResults(doc), function (items) {
			if (!items) return;
			
			var links = [];
			for (var i in items) links.push(i);
			Zotero.Utilities.processDocuments(links, scrape);
		});
	}
	else {
		scrape(doc, url);
	}
}

function addLink(doc, item) {
	item.attachments.push({ title: "Amazon.com Link", snapshot: false, mimeType: "text/html", url: doc.location.href });
}


var CREATOR = {
	Actor: "castMember",
	Director: "director",
	Producer: "producer",
	Writer: "scriptwriter",
	Translator: "translator",
	Author: "author",
	Illustrator: "contributor",
	Editor: "editor"
};

var DATE = [
	"Original Release Date",
	"DVD Release Date",
	"Erscheinungstermin",
	"Date de sortie du DVD"
];

// localization
var i15dFields = {
	ISBN: ['ISBN-13', 'ISBN-10', 'ISBN', '条形码'],
	Publisher: ['Publisher', 'Verlag', '出版社'],
	Hardcover: ['Hardcover', 'Gebundene Ausgabe', '精装', 'ハードカバー', 'Relié', 'Copertina rigida', 'Tapa dura'],
	Paperback: ['Paperback', 'Taschenbuch', '平装', 'ペーパーバック', 'Broché', 'Copertina flessibile', 'Tapa blanda'],
	'Print Length': ['Print Length', 'Seitenzahl der Print-Ausgabe', '紙の本の長さ', "Nombre de pages de l'édition imprimée", "Longueur d'impression", 'Poche', 'Broché', 'Lunghezza stampa', 'Longitud de impresión', 'Número de páginas'], // TODO: Chinese label
	Language: ['Language', 'Sprache', '语种', '言語', 'Langue', 'Lingua', 'Idioma'],
	Author: ['Author', '著', '作者'],
	Actor: ['Actors', 'Actor', 'Darsteller', 'Acteurs', 'Attori', 'Attore', 'Actores', '出演'],
	Director: ['Directors', 'Director', 'Regisseur', 'Regisseur(e)', 'Réalisateurs', 'Regista', 'Directores', '監督'],
	Producer: ['Producers', 'Producer'],
	'Run Time': ['Run Time', 'Spieldauer', 'Durée', 'Durata', 'Duración', '時間'],
	Studio: ['Studio', 'Estudio', '販売元'],
	'Audio CD': ['Audio CD', 'CD', 'CD de audio'],
	Label: ['Label', 'Etichetta', 'Étiquette', 'Sello', '发行公司', 'レーベル'],
	'Total Length': ['Total Length', 'Gesamtlänge', 'Durée totale', 'Lunghezza totale', 'Duración total', '収録時間'],
	Translator: ["Translator", "Übersetzer", "Traduttore", "Traductor", "翻訳"],
	Illustrator: ["Illustrator", "Illustratore", "Ilustrador", "イラスト"],
	Writer: ['Writers'],
	Editor: ['Editor', 'Editora', 'Editeur', 'Éditeur', 'Editore']
};

function getField(info, field) {
	// returns the value for the key 'field' or any of its
	// corresponding (language specific) keys of the array 'info'
	
	if (!i15dFields[field]) return false;
	
	for (var i = 0; i < i15dFields[field].length; i++) {
		if (info[i15dFields[field][i]] !== undefined) return info[i15dFields[field][i]];
	}
	return false;
}

function translateField(str) {
	for (var f in i15dFields) {
		if (i15dFields[f].includes(str)) {
			return f;
		}
	}
	return false;
}


function scrape(doc, url) {
	var isAsian = url.search(/^https?:\/\/[^/]+\.(?:jp|cn)[:/]/) != -1;
	// Scrape HTML for items without ISBNs, because Amazon doesn't provide an easy way for
	// open source projects like us to use their API
	Z.debug("Scraping from Page");
	var item = new Zotero.Item(detectWeb(doc, url) || "book");

	var title = doc.getElementById('btAsinTitle')
		|| doc.getElementById('title_row')
		|| doc.getElementById('productTitle')
		|| doc.getElementById('ebooksProductTitle')
		|| doc.getElementById('title_feature_div')
		|| doc.getElementById('dmusicProductTitle_feature_div');
	// get first non-empty text node (other text nodes are things like [Paperback] and dates)
	item.title = ZU.trimInternal(
		ZU.xpathText(title, '(.//text()[normalize-space(self::text())])[1]')
	)
		// though sometimes [Paperback] or [DVD] is mushed with the title...
		.replace(/(?: [([].+[)\]])+$/, "");
	
	var baseNode = title.parentElement, bncl;
	while (baseNode && (bncl = baseNode.classList)
		&& !(// ways to identify a node encompasing title and authors
			baseNode.id == 'booksTitle'
			|| baseNode.id == 'ppd-center'
			|| baseNode.id == 'title_feature_div'
			|| bncl.contains('buying')
			|| bncl.contains('content')
			|| bncl.contains('DigitalMusicInfoColumn')
			|| (baseNode.id == 'centerCol' && baseNode.firstElementChild.id.indexOf('title') == 0)
		)
	) {
		baseNode = baseNode.parentElement;
	}
	
	if (baseNode) {
		var authors = ZU.xpath(baseNode, './/span[@id="artistBlurb"]/a');
		// if (!authors.length) authors = baseNode.getElementsByClassName('contributorNameID');
		if (!authors.length) authors = ZU.xpath(baseNode, '(.//*[@id="byline"]/span[contains(@class, "author")] | .//*[@id="byline"]/span[contains(@class, "author")]/span)/a[contains(@class, "a-link-normal")][1]');
		if (!authors.length) authors = ZU.xpath(baseNode, './/span[@class="contributorNameTrigger"]/a[not(@href="#")]');
		if (!authors.length) authors = ZU.xpath(baseNode, './/span[contains(@class, "author")]/a|.//span[contains(@class, "author")]/span/a');
		if (!authors.length) authors = ZU.xpath(baseNode, './/a[following-sibling::*[1][@class="byLinePipe"]]');
		if (!authors.length) authors = ZU.xpath(baseNode, './/a[contains(@href, "field-author=")]');
		if (!authors.length) authors = ZU.xpath(baseNode, './/a[@id="ProductInfoArtistLink"]');
		if (!authors.length) authors = ZU.xpath(baseNode, './/a[@id="ProductInfoArtistLink"]');
		for (let i = 0; i < authors.length; i++) {
			var role = ZU.xpathText(authors[i], '(.//following::text()[normalize-space(self::text())])[1]');
			if (role) {
				role = CREATOR[translateField(
					role.replace(/^.*\(\s*|\s*\).*$/g, '')
						.split(',')[0] // E.g. "Actor, Primary Contributor"
						.trim()
				)];
			}
			if (!role) role = 'author';
			
			var name = ZU.trimInternal(authors[i].textContent)
				.replace(/\s*\([^)]+\)/, '');
			
			if (item.itemType == 'audioRecording') {
				item.creators.push({
					lastName: name,
					creatorType: 'performer',
					fieldMode: 1
				});
			}
			else {
				var invertName = isAsian && !(/[A-Za-z]/.test(name));
				if (invertName) {
					// Use last character as given name if there is no space
					if (!name.includes(' ')) name = name.replace(/.$/, ' $&');
					name = name.replace(/\s+/, ', '); // Surname comes first
				}
				item.creators.push(ZU.cleanAuthor(name, role, name.includes(',')));
			}
		}
	}
	
	// Abstract
	var abstractNode = doc.getElementById('postBodyPS');
	if (abstractNode) {
		item.abstractNote = abstractNode.textContent.trim();
		if (!item.abstractNote) {
			var iframe = abstractNode.getElementsByTagName('iframe')[0];
			if (iframe) {
				abstractNode = iframe.contentWindow.document.getElementById('iframeContent');
				item.abstractNote = abstractNode.textContent.trim();
			}
		}
	}
	
	// Extract info into an array
	var info = {},
		els = ZU.xpath(doc, '//div[@class="content"]/ul/li[b]');
	if (els.length) {
		for (let i = 0; i < els.length; i++) {
			let el = els[i],
				key = ZU.xpathText(el, 'b[1]').trim();
			if (key) {
				info[key.replace(/\s*:$/, "")] = el.textContent.substr(key.length + 1).trim();
			}
		}
	}
	else {
		// New design encountered 06/30/2013
		els = ZU.xpath(doc, '//tr[td[@class="a-span3"]][td[@class="a-span9"]]');
		for (let i = 0; i < els.length; i++) {
			let el = els[i],
				key = ZU.xpathText(el, 'td[@class="a-span3"]'),
				value = ZU.xpathText(el, 'td[@class="a-span9"]');
			if (key && value) info[key.trim()] = value.trim();
		}
	}
	
	item.ISBN = getField(info, 'ISBN');
	if (item.ISBN) {
		item.ISBN = ZU.cleanISBN(item.ISBN);
	}
	
	// Date
	for (let i = 0; i < DATE.length; i++) {
		item.date = info[DATE[i]];
		if (item.date) break;
	}
	if (!item.date) {
		for (let i in info) {
			let m = /\(([^)]+ [0-9]{4})\)/.exec(info[i]);
			if (m) item.date = m[1];
		}
	}
	
	// Books
	var publisher = getField(info, 'Publisher') || getField(info, 'Editor');
	if (publisher) {
		var m = /([^;(]+)(?:;? *([^(]*))?(?:\(([^)]*)\))?/.exec(publisher);
		item.publisher = m[1].trim();
		if (m[2]) item.edition = m[2].trim().replace(/^(Auflage|Édition)\s?:/, '');
		if (m[3] && m[3].search(/\b\d{4}\b/) != -1) item.date = m[3].trim(); // Looks like a date
	}
	var pages = getField(info, 'Hardcover') || getField(info, 'Paperback') || getField(info, 'Print Length');
	if (pages) item.numPages = parseInt(pages);
	item.language = getField(info, 'Language');
	// add publication place from ISBN translator, see at the end
	
	// Video
	if (item.itemType == 'videoRecording') {
		// This seems to only be worth it for videos
		var clearedCreators = false;
		for (var i in CREATOR) {
			if (getField(info, i)) {
				if (!clearedCreators) {
					item.creators = [];
					clearedCreators = true;
				}
				var creators = getField(info, i).split(/ *, */);
				for (var j = 0; j < creators.length; j++) {
					item.creators.push(ZU.cleanAuthor(creators[j], CREATOR[i]));
				}
			}
		}
	}
	item.studio = getField(info, 'Studio');
	item.runningTime = getField(info, 'Run Time');
	if (!item.runningTime) item.runningTime = getField(info, 'Total Length');
	item.language = getField(info, 'Language');
	// Music
	item.label = getField(info, 'Label');
	var department = ZU.xpathText(doc, '//li[contains(@class, "nav-category-button")]/a');
	if (getField(info, 'Audio CD')) {
		item.audioRecordingFormat = "Audio CD";
	}
	else if (department && department.trim() == "Amazon MP3 Store") {
		item.audioRecordingFormat = "MP3";
	}
	
	addLink(doc, item);
	
	// we search for translators for a given ISBN
	// and try to figure out the missing publication place
	if (item.ISBN && !item.place) {
		Z.debug("Searching for additional metadata by ISBN: " + item.ISBN);
		var search = Zotero.loadTranslator("search");
		search.setHandler("translators", function (obj, translators) {
			search.setTranslator(translators);
			search.setHandler("itemDone", function (obj, lookupItem) {
				Z.debug(lookupItem.libraryCatalog);
				if (lookupItem.place) {
					// e.g. [Paris]
					item.place = lookupItem.place.replace("[", "").replace("]", "");
				}
				
				if (!item.date && lookupItem.date) {
					item.date = lookupItem.date;
				}
			});
			search.translate();
		});
		search.setHandler("error", function (error) {
			// we mostly need this handler to prevent the default one from kicking in
			Z.debug("ISBN search for " + item.ISBN + " failed: " + error);
		});
		search.setHandler("done", function () {
			item.complete();
		});
		search.setSearch({ ISBN: item.ISBN });
		search.getTranslators();
	}
	else {
		item.complete();
	}
}


/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://www.amazon.com/Test-William-Sleator/dp/0810989891/ref=sr_1_1?ie=UTF8&qid=1308010556&sr=8-1",
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
				"abstractNote": "Now in paperback! Pass, and have it made. Fail, and suffer the consequences. A master of teen thrillers tests readers’ courage in an edge-of-your-seat novel that echoes the fears of exam-takers everywhere. Ann, a teenage girl living in the security-obsessed, elitist United States of the very near future, is threatened on her way home from school by a mysterious man on a black motorcycle. Soon she and a new friend are caught up in a vast conspiracy of greed involving the mega-wealthy owner of a school testing company. Students who pass his test have it made; those who don’t, disappear . . . or worse. Will Ann be next? For all those who suspect standardized tests are an evil conspiracy, here’s a thriller that really satisfies! Praise for Test “Fast-paced with short chapters that end in cliff-hangers . . . good read for moderately reluctant readers. Teens will be able to draw comparisons to contemporary society’s shift toward standardized testing and ecological concerns, and are sure to appreciate the spoofs on NCLB.” ―School Library Journal “Part mystery, part action thriller, part romance . . . environmental and political overtones . . . fast pace and unique blend of genres holds attraction for younger teen readers.” ―Booklist",
				"edition": "Reprint",
				"language": "English",
				"libraryCatalog": "Amazon",
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
		"url": "https://www.amazon.com/Loveless-My-Bloody-Valentine/dp/B000002LRJ/ref=ntt_mus_ep_dpi_1",
		"items": [
			{
				"itemType": "audioRecording",
				"title": "Loveless",
				"creators": [],
				"date": "November 5, 1991",
				"audioRecordingFormat": "Audio CD",
				"label": "Sire",
				"libraryCatalog": "Amazon",
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
		"url": "https://www.amazon.com/Adaptation-Superbit-Collection-Nicholas-Cage/dp/B00005JLRE/ref=sr_1_1?ie=UTF8&qid=1309683150&sr=8-1",
		"items": [
			{
				"itemType": "videoRecording",
				"title": "Adaptation",
				"creators": [
					{
						"firstName": "Maggie",
						"lastName": "Gyllenhaal",
						"creatorType": "castMember"
					},
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
						"firstName": "Tilda",
						"lastName": "Swinton",
						"creatorType": "castMember"
					},
					{
						"firstName": "Chris",
						"lastName": "Cooper",
						"creatorType": "castMember"
					},
					{
						"firstName": "Spike",
						"lastName": "Jonze",
						"creatorType": "director"
					}
				],
				"date": "May 20, 2003",
				"language": "English (Dolby Digital 2.0 Surround), English (Dolby Digital 5.1), English (DTS 5.1), French (Dolby Digital 5.1)",
				"libraryCatalog": "Amazon",
				"runningTime": "115 minutes",
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
				"edition": "Larousse",
				"language": "Français",
				"libraryCatalog": "Amazon",
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
		"url": "https://www.amazon.de/Fiktionen-Erz%C3%A4hlungen-Jorge-Luis-Borges/dp/3596105811/ref=sr_1_1?ie=UTF8&qid=1362329791&sr=8-1",
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
				"abstractNote": "Gleich bei seinem Erscheinen in den 40er Jahren löste Jorge Luis Borges’ erster Erzählband »Fiktionen« eine literarische Revolution aus. Erfundene Biographien, fiktive Bücher, irreale Zeitläufe und künstliche Realitäten verflocht Borges zu einem geheimnisvollen Labyrinth, das den Leser mit seinen Rätseln stets auf neue herausfordert. Zugleich begründete er mit seinen berühmten Erzählungen wie»›Die Bibliothek zu Babel«, «Die kreisförmigen Ruinen« oder»›Der Süden« den modernen »Magischen Realismus«. »Obwohl sie sich im Stil derart unterscheiden, zeigen zwei Autoren uns ein Bild des nächsten Jahrtausends: Joyce und Borges.« Umberto Eco",
				"edition": "14",
				"language": "Deutsch",
				"libraryCatalog": "Amazon",
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
				"date": "1 Dec. 2010",
				"abstractNote": "Novel by Charles Dickens, published both serially and in book form in 1859. The story is set in the late 18th century against the background of the French Revolution. Although Dickens borrowed from Thomas Carlyle's history, The French Revolution, for his sprawling tale of London and revolutionary Paris, the novel offers more drama than accuracy. The scenes of large-scale mob violence are especially vivid, if superficial in historical understanding. The complex plot involves Sydney Carton's sacrifice of his own life on behalf of his friends Charles Darnay and Lucie Manette. While political events drive the story, Dickens takes a decidedly antipolitical tone, lambasting both aristocratic tyranny and revolutionary excess--the latter memorably caricatured in Madame Defarge, who knits beside the guillotine. The book is perhaps best known for its opening lines, \"It was the best of times, it was the worst of times,\" and for Carton's last speech, in which he says of his replacing Darnay in a prison cell, \"It is a far, far better thing that I do, than I have ever done; it is a far, far better rest that I go to, than I have ever known.\" -- The Merriam-Webster Encyclopedia of Literature",
				"language": "English",
				"libraryCatalog": "Amazon",
				"numPages": 477,
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
		"url": "https://www.amazon.it/Emil-Astrid-Lindgren/dp/888203867X/ref=sr_1_1?s=books&ie=UTF8&qid=1362324961&sr=1-1",
		"items": [
			{
				"itemType": "book",
				"title": "Emil. Ediz. illustrata",
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
						"firstName": "A.",
						"lastName": "Palme Larussa Sanavio",
						"creatorType": "translator"
					}
				],
				"date": "26 giugno 2008",
				"ISBN": "9788882038670",
				"abstractNote": "Si pensa che soprattutto in una casa moderna, con prese elettriche, gas, balconi altissimi un bambino possa mettersi in pericolo: Emil vive in una tranquilla casa di campagna, ma riesce a ficcare la testa in una zuppiera e a rimanervi incastrato, a issare la sorellina Ida in cima all'asta di una bandiera, e a fare una tale baldoria alla fiera del paese che i contadini decideranno di organizzare una colletta per spedirlo in America e liberare così la sua povera famiglia. Ma questo succederà nel prossimo libro di Emil, perché ce ne sarà un altro, anzi due, tante sono le sue monellerie. Età di lettura: da 7 anni.",
				"edition": "3 edizione",
				"language": "Italiano",
				"libraryCatalog": "Amazon",
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
		"url": "https://www.amazon.cn/%E5%9B%BE%E4%B9%A6/dp/B007CUSP3A",
		"items": [
			{
				"itemType": "book",
				"title": "汉语语音合成:原理和技术",
				"creators": [
					{
						"firstName": "楠",
						"lastName": "吕士",
						"creatorType": "author"
					},
					{
						"firstName": "敏",
						"lastName": "初",
						"creatorType": "author"
					},
					{
						"firstName": "萍",
						"lastName": "许洁",
						"creatorType": "author"
					},
					{
						"firstName": "琳",
						"lastName": "贺",
						"creatorType": "author"
					}
				],
				"date": "2012年1月1日",
				"ISBN": "9787030329202",
				"abstractNote": "《汉语语音合成:原理和技术》介绍语音合成的原理和针对汉语的各项合成技术，以及应用的范例。全书分基础篇和专题篇两大部分。基础篇介绍语音合成技术的发展历程和作为语音合成技术基础的声学语音学知识，尤其是作者获得的相关研究成果（填补了汉语语音学知识中的某些空白），并对各种合成器的工作原理和基本结构进行系统的阐述。专题篇结合近十年来国内外技术发展的热点和方向，讨论韵律分析与建模、数据驱动的语音合成方法、语音合成数据库的构建技术、文语转换系统的评估方法、语音合成技术的应用等。 《汉语语音合成:原理和技术》面向从事语言声学、语音通信技术，特别是语音合成的科学工作者、工程技术人员、大学教师、研究生和高年级的大学生，可作为他们研究、开发、进修的参考书。",
				"edition": "第1版",
				"libraryCatalog": "Amazon",
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
				"title": "Up",
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
				"date": "15 Feb. 2010",
				"language": "English, Hindi",
				"libraryCatalog": "Amazon",
				"runningTime": "93 minutes",
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
		"url": "https://www.amazon.de/gp/product/B00GKBYC3E?ie=UTF8&*Version*=1&*entries*=0",
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
				"libraryCatalog": "Amazon",
				"runningTime": "1:08:58",
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
		"url": "https://www.amazon.co.jp/gp/product/0099578077/",
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
				"date": "2012/8/2",
				"ISBN": "9780099578079",
				"edition": "Combined volume版",
				"language": "英語",
				"libraryCatalog": "Amazon",
				"numPages": 1328,
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
	},
	{
		"type": "web",
		"url": "https://www.amazon.com/First-Quarto-Hamlet-Cambridge-Shakespeare-dp-0521418194/dp/0521418194/ref=mt_hardcover?_encoding=UTF8&me=&qid=",
		"items": [
			{
				"itemType": "book",
				"title": "The First Quarto of Hamlet",
				"creators": [
					{
						"firstName": "William",
						"lastName": "Shakespeare",
						"creatorType": "author"
					},
					{
						"firstName": "Kathleen O.",
						"lastName": "Irace",
						"creatorType": "editor"
					}
				],
				"date": "28. April 1998",
				"ISBN": "9780521418195",
				"abstractNote": "The first printed text of Shakespeare's Hamlet is about half the length of the more familiar second quarto and Folio versions. It reorders and combines key plot elements to present its own workable alternatives. This is the only modernized critical edition of the 1603 quarto in print. Kathleen Irace explains its possible origins, special features and surprisingly rich performance history, and while describing textual differences between it and other versions, offers alternatives that actors or directors might choose for specific productions.",
				"edition": "First Edition",
				"language": "English",
				"libraryCatalog": "Amazon",
				"numPages": 144,
				"place": "New York",
				"publisher": "Cambridge University Press",
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
		"url": "https://www.amazon.co.jp/dp/4003314212",
		"items": [
			{
				"itemType": "book",
				"title": "日本イデオロギー論",
				"creators": [
					{
						"firstName": "潤",
						"lastName": "戸坂",
						"creatorType": "author"
					}
				],
				"date": "1977/9/16",
				"ISBN": "9784003314210",
				"language": "日本語",
				"libraryCatalog": "Amazon",
				"publisher": "岩波書店",
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
		"url": "https://www.amazon.com/gp/product/B00TWK3NFS",
		"items": [
			{
				"itemType": "book",
				"title": "Key Performance Indicators: Developing, Implementing, and Using Winning KPIs",
				"creators": [
					{
						"firstName": "David",
						"lastName": "Parmenter",
						"creatorType": "author"
					}
				],
				"date": "April 3, 2015",
				"abstractNote": "Streamline KPIs to craft a simpler, more effective system of performance measurement Key Performance Indicators provides an in-depth look at how KPIs can be most effectively used to assess and drive organizational performance. Now in its third edition, this bestselling guide provides a model for simplifying KPIs and avoiding the pitfalls ready to trap the unprepared organization. New information includes guidance toward defining critical success factors, project leader essentials, new tools including worksheets and questionnaires, and real-world case studies that illustrate the practical application of the strategies presented. The book includes a variety of templates, checklists, and performance measures to help streamline processes, and is fully supported by the author’s website to provide even more in-depth information. Key Performance Indicators are a set of measures that focus on the factors most critical to an organization’s success. Most companies have too many, rendering the strategy ineffective due to overwhelming complexity. Key Performance Indicators guides readers toward simplification, paring down to the most fundamental issues to better define and measure progress toward goals. Readers will learn to:  separate out performance measures between those that can be tied to a team and result in a follow-up phone call (performance measures) and those that are a summation of a number of teams working together (result indicators) look for and eradicate those measures that have a damaging unintended consequence, a major darkside Sell a KPI project to the Board, the CEO, and the senior management team using best practice leading change techniques Develop and use KPIs effectively with a simple five stage  model Ascertain essential performance measures, and develop a reporting strategy   Learn the things that a KPI project leader needs to know  A KPI project is a chance at a legacy – the project leader, facilitator, or coordinator savvy enough to craft a winning strategy can affect the organization for years to come. KPI projects entail some risk, but this book works to minimize that risk by arming stakeholders with the tools and information they need up front. Key Performance Indicators helps leaders shape a performance measurement initiative that works.",
				"edition": "3",
				"language": "English",
				"libraryCatalog": "Amazon",
				"numPages": 412,
				"publisher": "Wiley",
				"shortTitle": "Key Performance Indicators",
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
		"url": "https://www.amazon.com/Studies-Saiva-Siddhanta-Classic-Reprint-Nallasvami/dp/1333821387/ref=sr_1_1?keywords=saiva+siddhanta&s=gateway",
		"items": [
			{
				"itemType": "book",
				"title": "Studies in Saiva-Siddhanta",
				"creators": [
					{
						"firstName": "J. M. Nallasvami",
						"lastName": "Pillai",
						"creatorType": "author"
					}
				],
				"date": "24. April 2018",
				"ISBN": "9781333821388",
				"abstractNote": "Excerpt from Studies in Saiva-SiddhantaEuropean Sanskritist, unaware perhaps of the bearings of the expression, rendered the collocation Parama-hamsa' into 'great goose'. The strictly pedagogic purist may endeavour to justify such puerile versions on etymological grounds, but they stand Self-condemned as mal-interpretations reﬂecting anything but the sense and soul of the original. Such lapses into unwitting ignorance, need never be expected in any of the essays contained in the present collection, as our author is not only a sturdy and indefatigable researcher in Tamil philosophic literature illuminative Of the Agamic religion, but has also, in his quest after Truth, freely utilised the services of those Indigenous savam's, who represent the highest water-mark of Hindu traditional learning and spiritual associations at the present-day.About the PublisherForgotten Books publishes hundreds of thousands of rare and classic books. Find more at www.forgottenbooks.comThis book is a reproduction of an important historical work. Forgotten Books uses state-of-the-art technology to digitally reconstruct the work, preserving the original format whilst repairing imperfections present in the aged copy. In rare cases, an imperfection in the original, such as a blemish or missing page, may be replicated in our edition. We do, however, repair the vast majority of imperfections successfully; any imperfections that remain are intentionally left to preserve the state of such historical works.",
				"language": "English",
				"libraryCatalog": "Amazon",
				"numPages": 398,
				"place": "Place of publication not identified",
				"publisher": "Forgotten Books",
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
	}
]
/** END TEST CASES **/
