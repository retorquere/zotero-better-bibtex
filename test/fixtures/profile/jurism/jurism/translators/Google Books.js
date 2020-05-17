{
	"translatorID": "3e684d82-73a3-9a34-095f-19b112d88bbf",
	"label": "Google Books",
	"creator": "Simon Kornblith, Michael Berkowitz, Rintze Zelle, and Sebastian Karcher",
	"target": "^https?://(books|www)\\.google\\.[a-z]+(\\.[a-z]+)?/(books(/.*)?\\?(.*id=.*|.*q=.*)|search\\?.*?(btnG=Search\\+Books|tbm=bks)|books/edition/)|^https?://play\\.google\\.[a-z]+(\\.[a-z]+)?/(store/)?(books|search\\?.*c=books)",
	"minVersion": "2.1.9",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsbv",
	"lastUpdated": "2019-12-09 13:35:39"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2012-2019 Simon Kornblith, Michael Berkowitz, Rintze Zelle, and Sebastian Karcher
	This file is part of Zotero.

	Zotero is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	Zotero is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU Affero General Public License for more details.

	You should have received a copy of the GNU Affero General Public License
	along with Zotero.  If not, see <http://www.gnu.org/licenses/>.

	***** END LICENSE BLOCK *****
*/

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

Single item - New Google Books November 2019
https://www.google.com/books/edition/_/U4NmPwAACAAJ?hl=en

Personal play store book lists
https://play.google.com/books (no test)

Play Store Individual Books
https://play.google.com/store/books/details/Adam_Smith_The_Wealth_of_Nations?id=-WxKAAAAYAAJ

Play Store Book Searches
https://play.google.com/store/search?q=doyle+arthur+conan&c=books
*/
// attr()/text() v2
// eslint-disable-next-line
function attr(docOrElem,selector,attr,index){var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector);return elem?elem.getAttribute(attr):null;}function text(docOrElem,selector,index){var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector);return elem?elem.textContent:null;}


function detectWeb(doc, url) {
	if (url.search(/[&?]v?id=/) != -1) {
		return "book";
	}
	else if (url.includes("/books/edition/")) {
		return "book";
	}
	else if (getSearchResults(doc, true)) {
		return "multiple";
	}
	return false;
}


function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	// regular books
	var rows = ZU.xpath(doc, '//div[@class="srg"]//a[h3]');
	if (!rows.length) {
		// play store
		rows = doc.querySelectorAll('div.Q9MA7b>a');
	}
	for (let row of rows) {
		let href = row.href;
		// h3 for google books, div for google play
		let title = text(row, 'h3, div');
		// exclude audiobooks on google play
		// audiobooks aren't in Google's book metadata
		if (!href || !title || href.includes("/store/audiobooks/")) continue;
		if (checkOnly) return true;
		found = true;
		items[href] = ZU.trimInternal(title);
	}
	return found ? items : false;
}

function doWeb(doc, url) {
	if (detectWeb(doc, url) == "multiple") {
		Zotero.selectItems(getSearchResults(doc, false), function (items) {
			if (items) ZU.processDocuments(Object.keys(items), scrape);
		});
	}
	else {
		scrape(doc, url);
	}
}

function scrape(doc, url) {
	var id;
	// New books format:
	if (url.includes("/books/edition/")) {
		id = url.split('/').pop().split('?')[0];
	}
	// All old formats with explicit id, including play store
	else if (url.search(/[&?]id=/) != -1) {
		id = url.match(/[&?]id=([^&]+)/)[1];
	}
	else if (url.search(/[&?]vid=/) != -1) {
		var canonicalUrl = ZU.xpath(doc, '/html/head/link[@rel="canonical"]')[0].href;
		id = canonicalUrl.match(/[&?]id=([^&]+)/)[1];
	}
	ZU.doGet("//books.google.com/books/feeds/volumes/" + id, parseXML);
}

function parseXML(text) {
	// Z.debug(text);
	// Remove xml parse instruction and doctype
	var parser = new DOMParser();
	var xml = parser.parseFromString(text, "text/xml").documentElement;
	
	var ns = { dc: "http://purl.org/dc/terms",
		atom: "http://www.w3.org/2005/Atom" };
		
	var newItem = new Zotero.Item("book");
	
	var authors = ZU.xpath(xml, "dc:creator", ns);
	for (let author of authors) {
		newItem.creators.push(ZU.cleanAuthor(author.textContent, "author"));
	}
	
	var pages = ZU.xpathText(xml, "dc:format", ns);
	const pagesRe = /(\d+)( pages)/;
	var pagesMatch = pagesRe.exec(pages);
	if (pagesMatch !== null) {
		newItem.numPages = pagesMatch[1];
	}
	else {
		newItem.numPages = pages;
	}
	
	var ISBN;
	const ISBN10Re = /(?:ISBN:)(\w{10})$/;
	const ISBN13Re = /(?:ISBN:)(\w{13})$/;
	const booksIDRe = /^(\w{12})$/;
	var identifiers = ZU.xpath(xml, "dc:identifier", ns);
	for (let identifier of identifiers) {
		var ISBN10Match = ISBN10Re.exec(identifier.textContent);
		var ISBN13Match = ISBN13Re.exec(identifier.textContent);
		var booksIDMatch = booksIDRe.exec(identifier.textContent);
		if (ISBN10Match !== null) {
			ISBN = ISBN10Match[1];
		}
		if (ISBN13Match !== null) {
			ISBN = ISBN13Match[1];
		}
		if (booksIDMatch !== null) {
			newItem.extra = "Google-Books-ID: " + booksIDMatch[1];
		}
	}
	newItem.ISBN = ISBN;
	
	newItem.publisher = ZU.xpathText(xml, "dc:publisher", ns);
	newItem.title = ZU.xpathText(xml, "dc:title", ns, ": ");
	newItem.language = ZU.xpathText(xml, 'dc:language', ns);
	newItem.abstractNote = ZU.xpathText(xml, 'dc:description', ns);
	newItem.date = ZU.xpathText(xml, "dc:date", ns);

	var url = "/books?id=" + identifiers[0].textContent;
	newItem.attachments = [{ title: "Google Books Link", snapshot: false, mimeType: "text/html", url: url }];
	
	var subjects = ZU.xpath(xml, 'dc:subject', ns);
	for (let subject of subjects) {
		newItem.tags.push(subject.textContent);
	}
	
	newItem.complete();
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
						"firstName": "Nick",
						"lastName": "Collins",
						"creatorType": "author"
					},
					{
						"firstName": "Nicholas",
						"lastName": "Collins",
						"creatorType": "author"
					},
					{
						"firstName": "Julio d' Escrivan",
						"lastName": "Rincón",
						"creatorType": "author"
					},
					{
						"firstName": "Julio",
						"lastName": "d'Escrivan",
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
					{
						"tag": "Music / General"
					},
					{
						"tag": "Music / Genres & Styles / Electronic"
					},
					{
						"tag": "Music / Instruction & Study / Techniques"
					}
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
				"title": "Gabriel García Márquez",
				"creators": [
					{
						"firstName": "Rubén",
						"lastName": "Pelayo",
						"creatorType": "author"
					},
					{
						"firstName": "Rubén Pelayo",
						"lastName": "Coutiño",
						"creatorType": "author"
					},
					{
						"firstName": "Rube ́n",
						"lastName": "Pelayo",
						"creatorType": "author"
					}
				],
				"date": "2001",
				"ISBN": "9780313312601",
				"abstractNote": "Winner of the Nobel Prize for Literature in 1982 for his masterpiece One Hundred Years of Solitude, Gabriel Garc^D'ia M^D'arquez had already earned tremendous respect and popularity in the years leading up to that honor, and remains, to date, an active and prolific writer. Readers are introduced to Garc^D'ia M^D'arquez with a vivid account of his fascinating life; from his friendships with poets and presidents, to his distinguished career as a journalist, novelist, and chronicler of the quintessential Latin American experience. This companion also helps students situate Garc^D'ia M^D'arquez within the canon of Western literature, exploring his contributions to the modern novel in general, and his forging of literary techniques, particularly magic realism, that have come to distinguish Latin American fiction.Full literary analysis is given for One Hundred Years of Solitude, as well as Chronicle of a Death Foretold (1981), Love in the Time of Cholera (1985), two additional novels, and five of Garc^D'ia M^D'arquez's best short stories. Students are given guidance in understanding the historical contexts, as well as the characters and themes that recur in these interrelated works. Narrative technique and alternative critical perspectives are also explored for each work, helping readers fully appreciate the literary accomplishments of Gabriel Garc^D'ia M^D'arquez.",
				"extra": "Google-Books-ID: skf3LSyV_kEC",
				"language": "en",
				"libraryCatalog": "Google Books",
				"numPages": "208",
				"publisher": "Greenwood Publishing Group",
				"attachments": [
					{
						"title": "Google Books Link",
						"snapshot": false,
						"mimeType": "text/html"
					}
				],
				"tags": [
					{
						"tag": "Literary Criticism / Caribbean & Latin American"
					},
					{
						"tag": "Literary Criticism / European / Spanish & Portuguese"
					}
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
	},
	{
		"type": "web",
		"url": "https://www.google.com/books/edition/_/U4NmPwAACAAJ?hl=en",
		"items": [
			{
				"itemType": "book",
				"title": "Ronia, the Robber's Daughter",
				"creators": [
					{
						"firstName": "Astrid",
						"lastName": "Lindgren",
						"creatorType": "author"
					}
				],
				"date": "1985",
				"ISBN": "9780613096249",
				"abstractNote": "Ronia, who lives with her father and his band of robbers in a castle in the woods, causes trouble when she befriends the son of a rival robber chieftain.",
				"extra": "Google-Books-ID: U4NmPwAACAAJ",
				"language": "en",
				"libraryCatalog": "Google Books",
				"numPages": "176",
				"publisher": "Perfection Learning Corporation",
				"attachments": [
					{
						"title": "Google Books Link",
						"snapshot": false,
						"mimeType": "text/html"
					}
				],
				"tags": [
					{
						"tag": "Juvenile Fiction / Action & Adventure / General"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://books.google.com.au/books?id=xylqIkDQ-gEC&pg=PA111&dq=clinical+psychology&hl=en&sa=X&ved=0ahUKEwidzdfqiKjmAhXNF3IKHhttps://books.google.com.au/books?id=xylqIkDQ-gEC&pg=PA111&dq=clinical+psychology&hl=en&sa=X&ved=0ahUKEwidzdfqiKjmAhXNF3IKHejiBPoQ6AEIQTAD#v=onepage&q=clinical%20psychology&f=true",
		"items": [
			{
				"itemType": "book",
				"title": "Contemporary Clinical Psychology",
				"creators": [
					{
						"firstName": "Thomas G.",
						"lastName": "Plante",
						"creatorType": "author"
					}
				],
				"date": "2010-08-20",
				"ISBN": "9780470872116",
				"abstractNote": "Contemporary Clinical Psychology, Third Edition introduces students to this fascinating profession from an integrative, biopsychosocial perspective. Thoroughly updated to include the latest information on topics central to the field, this innovative approach to studying clinical psychology delivers an engaging overview of the roles and responsibilities of today's clinical psychologists that is designed to inform and spark interest in a future career in this dynamic field. Highlighting evidence-based therapies, multiple case studies round out the portrayal of clinical practice. Designed for graduate and undergraduate students in introductory clinical psychology courses.",
				"language": "en",
				"libraryCatalog": "Google Books",
				"numPages": "625",
				"publisher": "John Wiley & Sons",
				"attachments": [
					{
						"title": "Google Books Link",
						"snapshot": false,
						"mimeType": "text/html"
					}
				],
				"tags": [
					{
						"tag": "Psychology / Clinical Psychology"
					},
					{
						"tag": "Psychology / General"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/
