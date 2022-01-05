{
	"translatorID": "8efcb7cb-4180-4555-969a-08e8b34066c4",
	"translatorType": 4,
	"label": "Trove",
	"creator": "Tim Sherratt and Abe Jellinek",
	"target": "^https?://trove\\.nla\\.gov\\.au/(?:newspaper|gazette|work|book|article|picture|music|map|collection|search)/",
	"minVersion": "3.0",
	"maxVersion": null,
	"priority": 100,
	"inRepository": true,
	"browserSupport": "gcsibv",
	"lastUpdated": "2021-06-28 18:50:00"
}

/*
   Trove Translator
   Copyright (C) 2016-2021 Tim Sherratt (tim@discontents.com.au, @wragge)
						   and Abe Jellinek

   This program is free software: you can redistribute it and/or modify
   it under the terms of the GNU Affero General Public License as published by
   the Free Software Foundation, either version 3 of the License, or
   (at your option) any later version.

   This program is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   GNU Affero General Public License for more details.

   You should have received a copy of the GNU Affero General Public License
   along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/


function detectWeb(doc, url) {
	if (url.includes('/search/') || url.includes('/newspaper/page')) {
		return getSearchResults(doc, url, true) ? 'multiple' : false;
	}
	else if (url.includes('/newspaper/article')) {
		return "newspaperArticle";
	}
	else if (url.includes('/work/')) {
		let formatContainer = doc.querySelector('#workContainer .format');
		if (!formatContainer) {
			if (doc.querySelector('.versions')) {
				return "multiple";
			}
			else {
				// monitoring the entire body feels like overkill, but no other
				// selector works. we just monitor until the page is built and
				// we can detect a type.
				Zotero.monitorDOMChanges(doc.body);
				return false;
			}
		}
		
		return checkType(formatContainer.innerText);
	}
	return false;
}


function getSearchResults(doc, url, checkOnly) {
	var items = {};
	var urls = [];
	var titles = [];
	var found = false;
	if (url.includes('/search/')) {
		for (let container of doc.querySelectorAll('.result')) {
			let link = container.querySelector('.title a');
			urls.push(link.href);
			titles.push(link.textContent);
		}
	}
	else if (url.includes('/work/')) {
		for (let container of doc.querySelectorAll('.version-container')) {
			urls.push(attr(container, 'a', 'href'));
			// titles are usually the same, so we'll disambiguate using the publication year
			titles.push(text(container, '.year') + ': ' + text(container, '.title'));
		}
	}
	else {
		for (let container of doc.querySelectorAll('ol.articles li a.link')) {
			urls.push(container.href);
			titles.push(container.textContent);
		}
	}
	for (var i = 0; i < urls.length; i++) {
		var link = urls[i];
		var title = ZU.trimInternal(titles[i]);
		if (!title || !link) continue;
		if (checkOnly) return true;
		found = true;
		items[link] = title;
	}
	return found ? items : false;
}


function doWeb(doc, url) {
	if (detectWeb(doc, url) == "multiple") {
		Zotero.selectItems(getSearchResults(doc, url), function (items) {
			if (!items) return;

			for (var i in items) {
				scrape(null, i);
			}
		});
	}
	else {
		scrape(doc, url);
	}
}


function scrape(doc, url) {
	if (url.includes('/newspaper/article/')) {
		scrapeNewspaper(doc, url);
	}
	else {
		scrapeWork(doc, url);
	}
}


function scrapeNewspaper(doc, url) {
	var articleID = url.match(/newspaper\/article\/(\d+)/)[1];
	var bibtexURL = "http://trove.nla.gov.au/newspaper/citations/bibtex-article-" + articleID + ".bibtex";

	ZU.HTTP.doGet(bibtexURL, function (bibtex) {
		var translator = Zotero.loadTranslator("import");
		translator.setTranslator("9cb70025-a888-4a29-a210-93ec52da40d4");
		translator.setString(bibtex);

		// Clean up the BibTex results and add some extra stuff.
		translator.setHandler("itemDone", function (obj, item) {
			item.itemType = 'newspaperArticle';
			item.pages = item.numPages;
			item.publicationTitle = cleanPublicationTitle(item.publicationTitle);
			item.place = cleanPlace(item.place);
			delete item.numPages;
			delete item.type;
			delete item.itemID;

			// doc is null during multiple call
			if (doc) {
				item.abstractNote = ZU.xpathText(doc, "//meta[@property='og:description']/@content");
				// Add tags
				var tags = ZU.xpath(doc, "//ul[contains(@class,'nlaTagContainer')]/li");
				for (let tag of tags) {
					tag = ZU.xpathText(tag, "div/a[not(contains(@class,'anno-remove'))]");
					item.tags.push(tag);
				}
			}

			// I've created a proxy server to generate the PDF and return the URL without locking up the browser.
			var proxyURL = "https://trove-proxy.herokuapp.com/pdf/" + articleID;
			ZU.doGet(proxyURL, function (pdfURL) {
				// With the last argument 'false' passed to doGet
				// we allow all status codes to continue and reach
				// the item.complete() command.
				if (pdfURL.startsWith('http')) {
					item.attachments.push({
						url: pdfURL,
						title: 'Trove newspaper PDF',
						mimeType: 'application/pdf'
					});
				}
				else {
					Zotero.debug("No PDF because unexpected return from trove-proxy " + proxyURL);
					Zotero.debug(pdfURL);
				}

				// Get the OCRd text and save in a note.
				var textURL = "http://trove.nla.gov.au/newspaper/rendition/nla.news-article" + articleID + ".txt";
				ZU.HTTP.doGet(textURL, function (text) {
					item.notes.push({
						note: text.trim()
					});
					item.complete();
				});
			}, null, null, null, false);
		});
		translator.translate();
	});
}


function cleanPublicationTitle(pubTitle) {
	if (!pubTitle) return pubTitle;
	// Australian Worker (Sydney, NSW : 1913 - 1950) -> Australian Worker
	// the place info is duplicated in the place field
	return pubTitle.replace(/\([^)]+\)/, '');
}


function cleanPlace(place) {
	if (!place) return place;
	
	let replacements = {
		'Vic.': 'Victoria',
		'Qld.': 'Queensland',
		SA: 'South Australia',
		'S.A.': 'South Australia',
		'S.Aust.': 'South Australia',
		'Tas.': 'Tasmania',
		WA: 'Western Australia',
		'W.A.': 'Western Australia',
		NSW: 'New South Wales',
		'N.S.W.': 'New South Wales',
		ACT: 'Australian Capital Territory',
		'A.C.T.': 'Australian Capital Territory',
		NT: 'Northern Territory',
		'N.T.': 'Northern Territory'
	};
	
	for (let [from, to] of Object.entries(replacements)) {
		place = place.replace(from, to);
	}
	
	return place;
}


var troveTypes = {
	Book: "book",
	"Article/Book chapter": "bookSection",
	Thesis: "thesis",
	"Archived website": "webpage",
	"Conference Proceedings": "book",
	"Audio book": "book",
	Article: "journalArticle",
	"Article/Journal or magazine article": "journalArticle",
	"Article/Conference paper": "conferencePaper",
	"Article/Report": "report",
	Map: "map",
	"Map/Aerial photograph; Photograph": "map",
	Photograph: "artwork",
	"Poster, chart, other": "artwork",
	"Art work": "artwork",
	Object: "artwork",
	Sound: "audioRecording",
	Video: "videoRecording",
	"Printed music": "book",
	Unpublished: "manuscript",
	Published: "document"
};


// Map a semicolon-separated Trove item type string to one Zotero item type
function checkType(string) {
	for (let [trove, zotero] of Object.entries(troveTypes)) {
		if (string.endsWith(trove)) {
			return zotero;
		}
	}
	
	let lastSemicolon = string.lastIndexOf('; ');
	if (lastSemicolon != -1) {
		return checkType(string.substring(0, lastSemicolon));
	}
	else {
		return 'book';
	}
}


// Sometimes authors are a little messy and we need to clean them
// e.g. author = { Bayley, William A. (William Alan), 1910-1981 },
// results in
//   "firstName": "1910-1981, William A. (William Alan)",
//   "lastName": "Bayley"
// Trove occasionally gives us author strings like "Australian Institute of
// Health and Welfare" that the BibTeX translator will split, but there's not
// much we can do, because that's the correct behavior. we could try to compare
// BibTeX authors to the HTML, but that won't work for multiples.
function cleanCreators(creators) {
	for (let creator of creators) {
		if (creator.fieldMode || !creator.firstName) continue;
		var name = creator.firstName;
		name = name.replace(/\(?\d{4}-\d{0,4}\)?,?/, "").trim();
		var posParenthesis = name.indexOf("(");
		if (posParenthesis > -1) {
			var first = name.substr(0, posParenthesis);
			var second = name.substr(posParenthesis + 1, name.length - posParenthesis - 2);
			if (second.includes(first.replace('.', '').trim())) {
				name = second;
			}
			else {
				name = first;
			}
		}
		creator.firstName = name.trim();
	}
	return creators;
}


function cleanPublisher(publisher) {
	if (!publisher) return publisher;
	
	let parts = publisher.split(':').map(s => s.trim());
	if (parts.length == 2) {
		return { place: cleanPlace(parts[0]), publisher: parts[1] };
	}
	else {
		return { place: parts[0] };
	}
}


function cleanEdition(text) {
	if (!text) return text;
	
	// from Taylor & Francis eBooks translator, slightly adapted
	
	const ordinals = {
		first: "1",
		second: "2",
		third: "3",
		fourth: "4",
		fifth: "5",
		sixth: "6",
		seventh: "7",
		eighth: "8",
		ninth: "9",
		tenth: "10"
	};
	
	text = ZU.trimInternal(text).replace(/[[\]]/g, '');
	// this somewhat complicated regex tries to isolate the number (spelled out
	// or not) and make sure that it isn't followed by any extra info
	let matches = text
		.match(/^(?:(?:([0-9]+)(?:st|nd|rd|th)?)|(first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth))(?:\s?ed?\.?|\sedition)?$/i);
	if (matches) {
		let edition = matches[1] || matches[2];
		edition = ordinals[edition.toLowerCase()] || edition;
		return edition == "1" ? null : edition;
	}
	else {
		return text;
	}
}

function scrapeWork(doc, url) {
	var thumbnailURL;

	var workID = url.match(/\/work\/([0-9]+)/)[1];
	// version ID seems to always be undefined now
	var bibtexURL = `https://trove.nla.gov.au/api/citation/work/${workID}?version=undefined`;
	
	if (doc) {
		thumbnailURL = attr(doc, '.thumbnail img', 'src');
	}

	// Get the BibTex and feed it to the translator.
	ZU.HTTP.doGet(bibtexURL, function (respText) {
		// bibtex puts tags in the wrong field, but it's alright, they're mostly... bad
		// we should restore if we can come up with a good cleaning method
		// (exclude dates, tags that are the same as the item title or author,
		//  approximate duplicates, ...)
		var bibtex = JSON.parse(respText).bibtex;
		var translator = Zotero.loadTranslator("import");
		translator.setTranslator("9cb70025-a888-4a29-a210-93ec52da40d4");
		translator.setString(bibtex);
		translator.setHandler("itemDone", function (obj, item) {
			item.itemType = checkType(item.type);
			item.creators = cleanCreators(item.creators);
			item.edition = cleanEdition(item.edition);
			
			Object.assign(item, cleanPublisher(item.publisher));
			
			if (item.itemType == 'artwork' && item.type) {
				item.artworkMedium = item.type;
				delete item.type;
			}
			
			if (item.notes && item.notes.length == 1) {
				// abstract goes into a note, but we want it in abstractNote
				// (with HTML tags removed)
				item.abstractNote = ZU.cleanTags(item.notes.pop().note);
			}

			// Attach a link to the contributing repository if available
			if (item.url) {
				item.attachments.push({
					title: "Record from contributing repository",
					url: item.url,
					mimeType: 'text/html',
					snapshot: false
				});
			}

			if (thumbnailURL) {
				item.attachments.push({
					url: thumbnailURL,
					title: 'Trove thumbnail image',
					mimeType: 'image/jpeg'
				});
			}
			item.complete();
		});
		translator.translate();
	}, null, null, {
		Referer: 'https://trove.nla.gov.au/',
		apikey: '3b84ac7cec64f3e346f9a8f063230949'
		// the API key is the one that the site uses for client-side requests,
		// so it and the Referer have to be exactly right.
	});
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://trove.nla.gov.au/work/9958833",
		"defer": true,
		"items": [
			{
				"itemType": "book",
				"title": "Experiences of a meteorologist in South Australia",
				"creators": [
					{
						"firstName": "Clement Lindley",
						"lastName": "Wragge",
						"creatorType": "author"
					}
				],
				"date": "1980",
				"ISBN": "9780908065073",
				"abstractNote": "Reprinted from Good words for 1887/ edited by Donald Macleod, published: London: Isbister and Co",
				"itemID": "trove.nla.gov.au/work/9958833",
				"language": "English",
				"libraryCatalog": "Trove",
				"place": "Warradale, South Australia",
				"publisher": "Pioneer Books",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://trove.nla.gov.au/newspaper/article/70068753",
		"defer": true,
		"items": [
			{
				"itemType": "newspaperArticle",
				"title": "'WRAGGE.'",
				"creators": [],
				"date": "7 Feb 1903",
				"abstractNote": "We have received a copy of the above which is a journal devoted chiefly to the science of meteorology. It is owned and conducted by Mr. Clement ...",
				"libraryCatalog": "Trove",
				"place": "Victoria",
				"publicationTitle": "Sunbury News",
				"url": "http://nla.gov.au/nla.news-article70068753",
				"attachments": [
					{
						"title": "Trove newspaper PDF",
						"mimeType": "application/pdf"
					}
				],
				"tags": [
					{
						"tag": "Meteorology Journal - Clement Wragge"
					}
				],
				"notes": [
					{
						"note": "<html>\n  <head>\n    <title>07 Feb 1903 - 'WRAGGE.'</title>\n  </head>\n  <body>\n      <p>Sunbury News (Vic. : 1900 - 1927), Saturday 7 February 1903, page 4</p>\n      <hr/>\n    <div class='zone'><p>'WRAGGE' - we have received a copy of the above, which is a journal devoted chiefly to the science of meteorology. It is owned and conducted by Mr. Clement Wragge. </p></div>\n  </body>\n</html>"
					}
				],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://trove.nla.gov.au/search/advanced/category/newspapers?l-artType=newspapers&l-australian=y&keyword=wragge",
		"defer": true,
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://trove.nla.gov.au/search/category/books?keyword=wragge",
		"defer": true,
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://trove.nla.gov.au/newspaper/page/7013947",
		"defer": true,
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://trove.nla.gov.au/work/9531118?q&sort=holdings+desc&_=1483112824975&versionId=14744047",
		"defer": true,
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://trove.nla.gov.au/work/208456891",
		"defer": true,
		"items": [
			{
				"itemType": "artwork",
				"title": "Walter Wragge",
				"creators": [],
				"date": "1912",
				"artworkMedium": "Photograph",
				"itemID": "trove.nla.gov.au/work/208456891",
				"language": "en",
				"libraryCatalog": "Trove",
				"url": "http://collections.slsa.sa.gov.au/resource/B+49301",
				"attachments": [
					{
						"title": "Record from contributing repository",
						"mimeType": "text/html",
						"snapshot": false
					},
					{
						"title": "Trove thumbnail image",
						"mimeType": "image/jpeg"
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
		"url": "https://trove.nla.gov.au/work/11424419/version/264796991%20264796992",
		"defer": true,
		"items": [
			{
				"itemType": "journalArticle",
				"title": "AUSTRALIA'S WELFARE 1993 Services and Assistance (30 June 1994)",
				"creators": [
					{
						"firstName": "Australian Institute of",
						"lastName": "Health",
						"creatorType": "author"
					},
					{
						"lastName": "Welfare",
						"creatorType": "author",
						"fieldMode": 1
					}
				],
				"date": "1994-06-30",
				"ISSN": "1321-1455",
				"issue": "14 of 1994",
				"itemID": "trove.nla.gov.au/work/11424419",
				"language": "English",
				"libraryCatalog": "Trove",
				"publicationTitle": "Australia's welfare : services and assistance",
				"attachments": [
					{
						"title": "Trove thumbnail image",
						"mimeType": "image/jpeg"
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
		"url": "https://trove.nla.gov.au/work/245696250",
		"defer": true,
		"items": [
			{
				"itemType": "bookSection",
				"title": "Conducting a systematic review : a practical guide",
				"creators": [
					{
						"firstName": "Freya",
						"lastName": "MacMillan",
						"creatorType": "author"
					},
					{
						"firstName": "Kate A.",
						"lastName": "McBride",
						"creatorType": "author"
					},
					{
						"firstName": "Emma S.",
						"lastName": "George",
						"creatorType": "author"
					},
					{
						"firstName": "Genevieve Z.",
						"lastName": "Steiner",
						"creatorType": "author"
					}
				],
				"date": "2018",
				"itemID": "trove.nla.gov.au/work/245696250",
				"language": "eng",
				"libraryCatalog": "Trove",
				"place": "Singapore, Springer",
				"publisher": "Singapore, Springer",
				"shortTitle": "Conducting a systematic review",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/
