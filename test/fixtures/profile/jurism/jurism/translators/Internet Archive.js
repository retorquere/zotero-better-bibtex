{
	"translatorID": "db0f4858-10fa-4f76-976c-2592c95f029c",
	"label": "Internet Archive",
	"creator": "Adam Crymble, Sebastian Karcher",
	"target": "^https?://(www\\.)?archive\\.org/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2015-08-06 01:24:43"
}

function detectWeb(doc, url) {
	var icon = ZU.xpathText(doc, '//h1/div[@class="left-icon"]/span[contains(@class, "iconochive")]/@class');
	if (icon) {
		if (icon.indexOf("texts") != -1) {
			return "book";
		} else if (icon.indexOf("movies") != -1) {
			return "film";
		} else if (icon.indexOf("audio") != -1) {
			return "audioRecording";
		} else if (icon.indexOf("etree") != -1) {
			return "audioRecording";
		} else if (icon.indexOf("software") != -1) {
			return "computerProgram";
		} else if (icon.indexOf("image") != -1) {
			return "artwork";
		}
	} else if (getSearchResults(doc, url, true)) {
		return "multiple";
	}
}

var typemap = {
	"texts": "book",
	"movies": "film",
	"image": "artwork",
	"audio": "audioRecording",
	"etree": "audioRecording",
	"software": "computerProgram"
}

function test(data) {
	var clean = data ? data[0] : undefined;
	return clean;
}

function getSearchResults(doc, url, testOnly) {
	var results = ZU.xpath(doc, '//div[@class="results"]//div[contains(@class, "ttl ")]/a');
	if (testOnly && results.length > 0) {
		return true;
	} else if (results.length > 0) {
		return results;
	} else return false
}

function scrape(doc, url) {
	//maximum PDF size to be downloaded. default to 10 MB
	var pref_maxPdfSizeMB = 10;
	var pdfurl = ZU.xpathText(doc, '//div[contains(@class, "thats-right")]/div/div/a[contains(text(), "PDF") and not(contains(text(), "B/W"))]/@href');
	var pdfSize = ZU.xpathText(doc, '//div[contains(@class, "thats-right")]/div/div/a[contains(text(), "PDF") and not(contains(text(), "B/W"))]/@data-original-title');
	//Z.debug(pdfurl);
	var apiurl = url  + "&output=json";
	ZU.doGet(apiurl, function(text) {
		//Z.debug(text);
		try {
			var obj = JSON.parse(text).metadata;
		} catch (e) {
			Zotero.debug("JSON parse error");
			throw e;
		}
		var type = obj.mediatype[0];
		var itemType = typemap[type];

		if (itemType) var newItem = new Zotero.Item(itemType);
		else var newItem = new Zotero.Item("Document");
		newItem.title = obj.title[0];
		var creators = obj.creator;
		//sometimes authors are in one field delimiter by ;
		if (creators && creators[0].match(/;/)) {
			creators = creators[0].split(/\s*;\s*/);
		}
		for (var i in creators) {
			//authors are lastname, firsname, additional info - only use the first two.
			var author = creators[i].replace(/(\,[^\,]+)(\,.+)/, "$1");
			newItem.creators[i] = ZU.cleanAuthor(author, "author", true);
		}
		var contributors = obj.contributor;
		for (i in contributors) {
			//authors are lastname, firsname, additional info - only use the first two.
			var contributor = contributors[i].replace(/(\,[^\,]+)(\,.+)/, "$1");
			newItem.creators.push(ZU.cleanAuthor(contributor, "contributor", true));
		}

		for (i in newItem.creators) {
			if (!newItem.creators[i].firstName) {
				newItem.creators[i].fieldMode = 1;
			}
		}
		//abstracts can be in multiple fields;
		if (obj.description) newItem.abstractNote = ZU.cleanTags(obj.description.join("; "));

		var date = obj.date;
		if (!date) date = obj.year;
		var tags = test(obj.subject);
		if (tags) tags = tags.split(/\s*;\s*/);
		for (i in tags) {
			newItem.tags.push(tags[i]);
		}
		//download PDFs; We're being conservative here, only downloading if we understand the filesize
		if (pdfurl && pdfSize && parseFloat(pdfSize)){
			//calculate file size in MB
			var pdfSizeMB;
			if (pdfSize.indexOf("M")!=-1){
				pdfSizeMB = parseFloat(pdfSize);
			} else if (pdfSize.indexOf("K")!=-1){
				pdfSizeMB = parseFloat(pdfSize) / 1000;
			} else if (pdfSize.indexOf("G")!=-1){
				pdfSizeMB = parseFloat(pdfSize) * 1000;
			};
			Z.debug(pdfSizeMB);
			if (pdfSizeMB < pref_maxPdfSizeMB){
				newItem.attachments.push({"url": pdfurl, "title": "Internet Archive Fulltext PDF", "mimeType": "application/pdf" })	
			}
		}
		newItem.date = test(date);
		newItem.medium = test(obj.medium);
		newItem.publisher = test(obj.publisher);
		newItem.language = test(obj.language);
		newItem.callNumber = test(obj.call_number);
		newItem.numPages = test(obj.imagecount);
		newItem.runningTime = test(obj.runtime);
		newItem.rights = test(obj.licenseurl);
		if (!newItem.rights) newItem.rights = test(obj.rights);
		newItem.url = "http://archive.org/details/" + test(obj.identifier);

		newItem.complete();
	});
}

function doWeb(doc, url) {

	var items = {};
	var articles = new Array();

	if (detectWeb(doc, url) == "multiple") {
		Zotero.debug("multiple");
		var items = new Object();

		var titles = getSearchResults(doc, url);
		for (var i = 0; i < titles.length; i++) {
			items[titles[i].href] = titles[i].textContent;
		}

		Zotero.selectItems(items, function(items) {
			if (!items) {
				return true;
			}
			for (var i in items) {
				articles.push(i);
			}
			ZU.processDocuments(articles, scrape)
		});
	} else {
		scrape(doc, url);
	}
}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://archive.org/details/gullshornbookstu00dekk",
		"items": [
			{
				"itemType": "book",
				"title": "The gull's hornbook : Stultorum plena sunt omnia. Al savio mezza parola basta",
				"creators": [
					{
						"firstName": "Thomas",
						"lastName": "Dekker",
						"creatorType": "author"
					},
					{
						"firstName": "John",
						"lastName": "Nott",
						"creatorType": "author"
					},
					{
						"lastName": "University of Pittsburgh Library System",
						"creatorType": "contributor",
						"fieldMode": 1
					}
				],
				"date": "1812",
				"abstractNote": "Notes by John Nott; Bibliography of Dekker: p. iii-ix",
				"callNumber": "31735060398496",
				"language": "eng",
				"libraryCatalog": "Internet Archive",
				"numPages": "228",
				"publisher": "Bristol, Reprinted for J.M. Gutch and Sold in London by R. Baldwin, and R. Triphook",
				"shortTitle": "The gull's hornbook",
				"url": "http://archive.org/details/gullshornbookstu00dekk",
				"attachments": [
					{
						"title": "Internet Archive Fulltext PDF",
						"mimeType": "application/pdf"
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
		"url": "http://www.archive.org/search.php?query=cervantes%20AND%20mediatype%3Atexts",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "http://archive.org/details/Allen_Ginsberg__Anne_Waldman__Steven_Tay_89P046",
		"items": [
			{
				"itemType": "audioRecording",
				"title": "Allen Ginsberg, Anne Waldman, Steven Taylor and Bobbi Louise Hawkins performance, July, 1989.",
				"creators": [
					{
						"firstName": "Allen",
						"lastName": "Ginsberg",
						"creatorType": "author"
					},
					{
						"firstName": "Bobbie Louise",
						"lastName": "Hawkins",
						"creatorType": "author"
					},
					{
						"firstName": "Steven",
						"lastName": "Taylor",
						"creatorType": "author"
					},
					{
						"firstName": "Anne",
						"lastName": "Waldman",
						"creatorType": "author"
					}
				],
				"date": "1989-07-08 00:00:00",
				"abstractNote": "Second half of a reading with Allen Ginsberg, Bobbie Louise Hawkins, Anne Waldman, and Steven Taylor.  This portion of the reading features Waldman and Ginsberg. (Continued from 89P045)",
				"accessDate": "CURRENT_TIMESTAMP",
				"libraryCatalog": "Internet Archive",
				"publisher": "Jack Kerouac School of Disembodied Poetics",
				"rights": "http://creativecommons.org/licenses/by-nd-nc/1.0/",
				"runningTime": "1:30:05",
				"url": "http://archive.org/details/Allen_Ginsberg__Anne_Waldman__Steven_Tay_89P046",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://archive.org/details/AboutBan1935",
		"items": [
			{
				"itemType": "film",
				"title": "About Bananas",
				"creators": [
					{
						"lastName": "Castle Films",
						"creatorType": "author",
						"fieldMode": 1
					}
				],
				"date": "1935",
				"abstractNote": "Complete presentation of the banana industry from the clearing of the jungle and the planting to the shipment of the fruit to the American markets.",
				"accessDate": "CURRENT_TIMESTAMP",
				"libraryCatalog": "Internet Archive",
				"rights": "http://creativecommons.org/licenses/publicdomain/",
				"runningTime": "11:03",
				"url": "http://archive.org/details/AboutBan1935",
				"attachments": [],
				"tags": [
					"Agriculture: Bananas",
					"Central America"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://archive.org/details/msdos_Oregon_Trail_The_1990",
		"items": [
			{
				"itemType": "computerProgram",
				"title": "Oregon Trail, The",
				"creators": [
					{
						"lastName": "MECC",
						"creatorType": "author",
						"fieldMode": 1
					}
				],
				"date": "1990",
				"abstractNote": "PLEASE NOTE: Due to a bug in Chrome Version 51, Oregon Trail does not work in that version of Chrome. It is expected to work in Version 52. The program continues to run in Firefox, Internet Explorer, and Safari, and in Beta/Canary versions of Chrome.\n\nPublished by\n   MECC\nDeveloped by\n   MECC\nReleased\n   1990\nAlso For\n   Apple II, Atari 8-bit, Macintosh, Windows, Windows 3.x \nGenre\n   Adventure, Educational, Simulation\nPerspective\n   3rd-Person Perspective, Side-Scrolling\nSport\n   Hunting\nTheme\n   Managerial, Real-Time\nEducational\n   Geography, HistoryDescription\n  As a covered wagon party of pioneers, you head out west from Independence, Missouri to the Willamette River and valley in Oregon. You first must stock up on provisions, and then, while traveling, make decisions such as when to rest, how much food to eat, etc. The Oregon Trail incorporates simulation elements and planning ahead, along with discovery and adventure, as well as mini-game-like activities (hunting and floating down the Dalles River). From Mobygames.com. Original Entry",
				"libraryCatalog": "Internet Archive",
				"url": "http://archive.org/details/msdos_Oregon_Trail_The_1990",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://archive.org/details/mma_albert_einstein_pasadena_270713",
		"items": [
			{
				"itemType": "artwork",
				"title": "Albert Einstein, Pasadena",
				"creators": [],
				"date": "1931",
				"artworkMedium": "Gelatin silver print",
				"libraryCatalog": "Internet Archive",
				"rights": "<a href=\"http://www.metmuseum.org/information/terms-and-conditions\" rel=\"nofollow\">Metropolitan Museum of Art Terms and Conditions</a>",
				"url": "http://archive.org/details/mma_albert_einstein_pasadena_270713",
				"attachments": [],
				"tags": [
					"Photographs"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/