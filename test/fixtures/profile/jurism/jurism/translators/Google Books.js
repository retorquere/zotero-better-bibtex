{
	"translatorID": "3e684d82-73a3-9a34-095f-19b112d88bbf",
	"label": "Google Books",
	"creator": "Simon Kornblith, Michael Berkowitz and Rintze Zelle",
	"target": "^https?://(books|www)\\.google\\.[a-z]+(\\.[a-z]+)?/(books(/.*)?\\?(.*id=.*|.*q=.*)|search\\?.*?(btnG=Search\\+Books|tbm=bks))|^https?://play\\.google\\.[a-z]+(\\.[a-z]+)?/(store/)?(books|search\\?.+&c=books)",
	"minVersion": "2.1.9",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsbv",
	"lastUpdated": "2017-12-03 04:20:33"
}

/*
The various types of Google Books URLs are:

Search results - List view
http://books.google.com/books?q=asimov&btnG=Search+Books

Search results - Cover view
http://books.google.com/books?q=asimov&btnG=Search%20Books&rview=1

Single item - URL with "id"
http://books.google.com/books?id=skf3LSyV_kEC&source=gbs_navlinks_s
http://books.google.com/books?hl=en&lr=&id=Ct6FKwHhBSQC&oi=fnd&pg=PP9&dq=%22Peggy+Eaton%22&ots=KN-Z0-HAcv&sig=snBNf7bilHi9GFH4-6-3s1ySI9Q#v=onepage&q=%22Peggy%20Eaton%22&f=false

Single item - URL with "vid" (see http://code.google.com/apis/books/docs/static-links.html)
http://books.google.com/books?printsec=frontcover&vid=ISBN0684181355&vid=ISBN0684183951&vid=LCCN84026715#v=onepage&q&f=false

Personal play store book lists
https://play.google.com/books (no test)

Play Store Individual Books
https://play.google.com/store/books/details/Adam_Smith_The_Wealth_of_Nations?id=-WxKAAAAYAAJ

Play Store Book Searches
https://play.google.com/store/search?q=doyle+arthur+conan&c=books

*/

var singleRe = /^https?:\/\/(?:books|www|play)\.google\.[a-z]+(?:\.[a-z]+)?(?:\/store)?\/books(?:\/.*)?\?(?:[^q].*&)?(id|vid)=([^&]+)/i;

function detectWeb(doc, url) {
	if(singleRe.test(url)) {
		return "book";
	} else {
		return "multiple";
	}
}

var itemUrlBase;
function doWeb(doc, url) {
	
	// get local domain suffix
	var psRe = new RegExp("https?://(books|www|play)\.google\.([^/]+)/");
	var psMatch = psRe.exec(url);
	var suffix = psMatch[2];
	var prefix = "books"; //Where is it not books? psMatch[1];
	itemUrlBase = "/books?id=";
	
	var m = singleRe.exec(url);
	if(m && m[1] == "id") {
		ZU.doGet("//books.google.com/books/feeds/volumes/"+m[2], parseXML);
	} else if (m && m[1] == "vid") {
		var itemLinkWithID = ZU.xpath(doc, '/html/head/link[@rel="canonical"]')[0].href;
		var m = singleRe.exec(itemLinkWithID);
		ZU.doGet("//books.google.com/books/feeds/volumes/"+m[2], parseXML);
	} else {
		var items = getItemArrayGB(doc, doc, 'google\\.' + suffix + '/books\\?id=([^&]+)', '^(?:All matching pages|About this Book|Table of Contents|Index)');
		// Drop " - Page" thing
		for(var i in items) {
			items[i] = items[i].replace(/- Page [0-9]+\s*$/, "");
		}
		Zotero.selectItems(items, function(items) {
			if(!items) Z.done();
			var baseurl = url.match(psRe)[0];
			var newUris = [];
			for(var i in items) {
				//the singleRe has the full URL - we may only be getting the URL w/o host correct for that.
				if (i.search(psRe)===-1){
					i = baseurl.replace(/\/$/, "") + i;
				}
				var m = singleRe.exec(i);
				newUris.push("//books.google.com/books/feeds/volumes/"+m[2]);
			}
			ZU.doGet(newUris, parseXML);
		});
	}
}
	
function parseXML(text) {
	//Z.debug(text)
	// Remove xml parse instruction and doctype
	var parser = new DOMParser();
	var xml = parser.parseFromString(text, "text/xml").documentElement;
	
	var ns = {"dc":"http://purl.org/dc/terms",
		"atom":"http://www.w3.org/2005/Atom"};
		
	var newItem = new Zotero.Item("book");
	
	var authors = ZU.xpath(xml, "dc:creator", ns);
	for (var i in authors) {
		newItem.creators.push(Zotero.Utilities.cleanAuthor(authors[i].textContent, "author"));
	}
	
	var pages = ZU.xpathText(xml, "dc:format", ns);
	const pagesRe = /(\d+)( pages)/;
	var pagesMatch = pagesRe.exec(pages);
	if (pagesMatch!=null) {
		newItem.numPages = pagesMatch[1];
	} else {
		newItem.numPages = pages;
	}
	
	var ISBN;
	const ISBN10Re = /(?:ISBN:)(\w{10})$/;
	const ISBN13Re = /(?:ISBN:)(\w{13})$/;
	const booksIDRe = /^(\w{12})$/;
	var identifiers = ZU.xpath(xml, "dc:identifier", ns);
	for (var i in identifiers) {
		var ISBN10Match = ISBN10Re.exec(identifiers[i].textContent);
		var ISBN13Match = ISBN13Re.exec(identifiers[i].textContent);
		var booksIDMatch = booksIDRe.exec(identifiers[i].textContent);
		if (ISBN10Match != null) {
			ISBN = ISBN10Match[1];
		}
		if (ISBN13Match != null) {
			ISBN = ISBN13Match[1];
		}
		if (booksIDMatch != null) {
			newItem.extra = "Google-Books-ID: " + booksIDMatch[1];
		}
	}
	newItem.ISBN = ISBN;
	
	newItem.publisher = ZU.xpathText(xml, "dc:publisher", ns);
	newItem.title = ZU.xpathText(xml, "dc:title", ns, ": ");
	newItem.language = ZU.xpathText(xml, 'dc:language', ns);
	newItem.abstractNote = ZU.xpathText(xml, 'dc:description', ns);
	newItem.date = ZU.xpathText(xml, "dc:date", ns);

	var url = itemUrlBase + identifiers[0].textContent;
	newItem.attachments = [{title:"Google Books Link", snapshot:false, mimeType:"text/html", url:url}];
	
	var subjects = ZU.xpath(xml, 'dc:subject', ns);
	for(var i in subjects) {
		newItem.tags.push(subjects[i].textContent);
	}
	
	newItem.complete();
}

/**
 * Grabs items based on URLs, modified for Google Books
 *
 * @param {Document} doc DOM document object
 * @param {Element|Element[]} inHere DOM element(s) to process
 * @param {RegExp} [urlRe] Regexp of URLs to add to list
 * @param {RegExp} [urlRe] Regexp of URLs to reject
 * @return {Object} Associative array of link => textContent pairs, suitable for passing to
 *	Zotero.selectItems from within a translator
 */
function getItemArrayGB (doc, inHere, urlRe, rejectRe) {
	
	var availableItems = new Object();	// Technically, associative arrays are objects

	//quick check for new format
	//As of 09/23/2015 I only see the last of these options, but leaving the others in for now to be safe.
	var bookList = ZU.xpath(doc, '//*[@id="rso"]/li|//*[@id="rso"]/div/li|//*[@id="rso"]/div/div[@class="g"]');
	if(bookList.length) {
		Z.debug("newFormat")
		for(var i=0, n=bookList.length; i<n; i++) {
			var link = ZU.xpathText(bookList[i], './/h3[@class="r"]/a/@href');
			var title = ZU.xpathText(bookList[i], './/h3[@class="r"]/a');
			if(link && title) {
				availableItems[link] = title;
			}
		}
		return availableItems;
	}
	var altformat = ZU.xpath(doc, '//div[@class="rsiwrapper"]//a[@class="primary"]' )
	if (altformat.length){
		for(var i=0, n=altformat.length; i<n; i++) {
			var link = ZU.xpathText(altformat[i], './@href');
			var title = altformat[i].textContent;
			if(link && title) {
				availableItems[link] = title;
			}
		}
		return availableItems;
	}
	var googleplay = ZU.xpath(doc, '//div[contains(@class, "details")]//a[@class="title"]');
	if(googleplay.length) {
		for(var i=0, n=googleplay.length; i<n; i++) {
			var link = ZU.xpathText(googleplay[i], './@href');
			var title = googleplay[i].textContent;
			if(link && title) {
				availableItems[link] = title;
			}
		}
		return availableItems;
	}


	// Require link to match this
	if(urlRe) {
		if(urlRe.exec) {
			var urlRegexp = urlRe;
		} else {
			var urlRegexp = new RegExp();
			urlRegexp.compile(urlRe, "i");
		}
	}
	// Do not allow text to match this
	if(rejectRe) {
		if(rejectRe.exec) {
			var rejectRegexp = rejectRe;
		} else {
			var rejectRegexp = new RegExp();
			rejectRegexp.compile(rejectRe, "i");
		}
	}
	
	if(!inHere.length) {
		inHere = new Array(inHere);
	}
	
	for(var j=0; j<inHere.length; j++) {
		var coverView = doc.evaluate('//div[@class="thumbotron"]', doc, null, XPathResult.ANY_TYPE, null).iterateNext();//Detect Cover view
		if(coverView){
			var links = inHere[j].getElementsByTagName("a");
			for(var i=0; i<links.length; i++) {
				if(!urlRe || urlRegexp.test(links[i].href)) {
					var text = links[i].textContent;
					if(!text) {
						var text = links[i].firstChild.alt;
					}
					if(text) {
						text = Zotero.Utilities.trimInternal(text);
						if(!rejectRe || !rejectRegexp.test(text)) {
							if(availableItems[links[i].href]) {
								if(text != availableItems[links[i].href]) {
									availableItems[links[i].href] += " "+text;
								}
							} else {
								availableItems[links[i].href] = text;
							}
						}
					}
				}
			}
		}
		else {
			var links = inHere[j].querySelectorAll("h3.r a");
			for(var i=0; i<links.length; i++) {
				if(!urlRe || urlRegexp.test(links[i].href)) {
					var text = links[i].parentNode.textContent;
					//Z.debug(text)
					if(text) {
						text = Zotero.Utilities.trimInternal(text);
						if(!rejectRe || !rejectRegexp.test(text)) {
							if(availableItems[links[i].href]) {
								if(text != availableItems[links[i].href]) {
									availableItems[links[i].href] += " "+text;
								}
							} else {
								availableItems[links[i].href] = text;
							}
						}
					}
					else {
							var imagelink = links[i];
							var booktitle = ZU.xpathText(imagelink, './*');
							Z.debug(booktitle)
					}
				}
			}
		}
	}
	
	return availableItems;
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://www.google.com/search?tbo=p&tbm=bks&q=asimov",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://books.google.de/books/about/The_Cambridge_companion_to_electronic_mu.html?id=AJbdPZv1DjgC&redir_esc=y",
		"items": [
			{
				"itemType": "book",
				"title": "The Cambridge Companion to Electronic Music",
				"creators": [
					{
						"firstName": "Nicholas",
						"lastName": "Collins",
						"creatorType": "author"
					},
					{
						"firstName": "Julio d' Escrivan",
						"lastName": "Rincón",
						"creatorType": "author"
					}
				],
				"date": "2007-12-13",
				"ISBN": "9780521868617",
				"abstractNote": "Musicians are always quick to adopt and explore new technologies. The fast-paced changes wrought by electrification, from the microphone via the analogue synthesiser to the laptop computer, have led to a wide diversity of new musical styles and techniques. Electronic music has grown to a broad field of investigation, taking in historical movements such as musique concrète and elektronische musik, and contemporary trends such as electronic dance music and electronica. A fascinating array of composers and inventors have contributed to a diverse set of technologies, practices and music. This book brings together some novel threads through this scene, from the viewpoint of researchers at the forefront of the sonic explorations empowered by electronic technology. The chapters provide accessible and insightful overviews of core topic areas and uncover some hitherto less publicised corners of worldwide movements. Recent areas of intense activity such as audiovisuals, live electronic music, interactivity and network music are actively promoted.",
				"extra": "Google-Books-ID: AJbdPZv1DjgC",
				"language": "en",
				"libraryCatalog": "Google Books",
				"numPages": "260",
				"publisher": "Cambridge University Press",
				"attachments": [
					{
						"title": "Google Books Link",
						"snapshot": false,
						"mimeType": "text/html"
					}
				],
				"tags": [
					"Music / General",
					"Music / Genres & Styles / Electronic",
					"Music / Instruction & Study / Techniques"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://books.google.de/books?id=skf3LSyV_kEC&source=gbs_navlinks_s&redir_esc=y",
		"items": [
			{
				"itemType": "book",
				"title": "Gabriel García Márquez: A Critical Companion",
				"creators": [
					{
						"firstName": "Rubén",
						"lastName": "Pelayo",
						"creatorType": "author"
					}
				],
				"date": "2001",
				"ISBN": "9780313312601",
				"abstractNote": "Winner of the Nobel Prize for Literature in 1982 for his masterpiece \"One Hundred Years of Solitude,\" Gabriel Garc DEGREESD'ia M DEGREESD'arquez had already earned tremendous respect and popularity in the years leading up to that honor, and remains, to date, an active and prolific writer. Readers are introduced to Garc DEGREESD'ia M DEGREESD'arquez with a vivid account of his fascinating life; from his friendships with poets and presidents, to his distinguished career as a journalist, novelist, and chronicler of the quintessential Latin American experience. This companion also helps students situate Garc DEGREESD'ia M DEGREESD'arquez within the canon of Western literature, exploring his contributions to the modern novel in general, and his forging of literary techniques, particularly magic realism, that have come to distinguish Latin American fiction. Full literary analysis is given for \"One Hundred Years of Solitude,\" as well as \"Chronicle of a Death Foretold\" (1981), \"Love in the Time of Cholera\" (1985), two additional novels, and five of Garc DEGREESD'ia M DEGREESD'arquez's best short stories. Students are given guidance in understanding the historical contexts, as well as the characters and themes that recur in these interrelated works. Narrative technique and alternative critical perspectives are also explored for each work, helping readers fully appreciate the literary accomplishments of Gabriel Garc DEGREESD'ia M DEGREESD'arquez.",
				"extra": "Google-Books-ID: skf3LSyV_kEC",
				"language": "en",
				"libraryCatalog": "Google Books",
				"numPages": "208",
				"publisher": "Greenwood Publishing Group",
				"shortTitle": "Gabriel García Márquez",
				"attachments": [
					{
						"title": "Google Books Link",
						"snapshot": false,
						"mimeType": "text/html"
					}
				],
				"tags": [
					"Literary Criticism / Caribbean & Latin American",
					"Literary Criticism / European / Spanish & Portuguese"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://books.google.de/books?hl=en&lr=&id=Ct6FKwHhBSQC&oi=fnd&pg=PP9&dq=%22Peggy+Eaton%22&ots=KN-Z0-HAcv&sig=snBNf7bilHi9GFH4-6-3s1ySI9Q&redir_esc=y#v=onepage&q=%22Peggy%20Eaton%22&f=false",
		"items": [
			{
				"itemType": "book",
				"title": "Some American Ladies: Seven Informal Biographies ...",
				"creators": [
					{
						"firstName": "Meade",
						"lastName": "Minnigerode",
						"creatorType": "author"
					}
				],
				"date": "1926",
				"ISBN": "9780836913620",
				"extra": "Google-Books-ID: Ct6FKwHhBSQC",
				"language": "en",
				"libraryCatalog": "Google Books",
				"numPages": "332",
				"publisher": "G.P. Putnam's Sons",
				"shortTitle": "Some American Ladies",
				"attachments": [
					{
						"title": "Google Books Link",
						"snapshot": false,
						"mimeType": "text/html"
					}
				],
				"tags": [
					"Biography & Autobiography / Women"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://books.google.de/books?printsec=frontcover&vid=LCCN84026715&redir_esc=y#v=onepage&q&f=false",
		"items": [
			{
				"itemType": "book",
				"title": "Electronic and Experimental Music: Pioneers in Technology and Composition",
				"creators": [
					{
						"firstName": "Thomas B.",
						"lastName": "Holmes",
						"creatorType": "author"
					},
					{
						"firstName": "Thom",
						"lastName": "Holmes",
						"creatorType": "author"
					}
				],
				"date": "2002",
				"ISBN": "9780415936446",
				"abstractNote": "Annotation Electronic and Experimental Music details the history of electronic music throughout the world, and the people who created it. From the theory of sound production to key composers and instrument designers, this is a complete introduction to the genre from its early roots to the present technological explosion. Every major figure is covered including: Thaddeus Cahill, Peire Henry, Gorden Mumma, Pauline Oliveros, Brian Eno, and D.J. Spooky. The vast array of forms and instruments that these innovators introduced and expanded are also included--tape composition, the synthesizer, \"live\" electronic performance, the ONCE festivals, ambient music, and turntablism. This new edition, includes a thoroughly updated and enlarged theoretical and historical sections and includes new material on using home computers (PCs) and the many resources now available in software and the Internet.",
				"extra": "Google-Books-ID: ILkquoGXEq0C",
				"language": "en",
				"libraryCatalog": "Google Books",
				"numPages": "332",
				"publisher": "Psychology Press",
				"shortTitle": "Electronic and Experimental Music",
				"attachments": [
					{
						"title": "Google Books Link",
						"snapshot": false,
						"mimeType": "text/html"
					}
				],
				"tags": [
					"Music / Genres & Styles / New Age"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.google.com/search?q=asimov&btnG=Search+Books&tbm=bks&tbo=1#hl=en&q=asimov&sei=guBGUIDOCJP8qQG7u4DYCg&start=10&tbm=bks",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://play.google.com/store/search?q=doyle+arthur+conan&c=books",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://play.google.com/store/books/details/Adam_Smith_The_Wealth_of_Nations?id=-WxKAAAAYAAJ",
		"items": [
			{
				"itemType": "book",
				"title": "The Wealth of Nations",
				"creators": [
					{
						"firstName": "Adam",
						"lastName": "Smith",
						"creatorType": "author"
					}
				],
				"date": "1902",
				"language": "en",
				"libraryCatalog": "Google Books",
				"numPages": "458",
				"publisher": "Collier",
				"attachments": [
					{
						"title": "Google Books Link",
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
