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
	"lastUpdated": "2017-06-04 10:03:10"
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
		} else if (icon.indexOf("tv") != -1) {
			return "tvBroadcast";
		} else {
			Z.debug("Unknown Item Type: " + icon);
		}
	} else if (url.indexOf('/stream/')>-1) {
		return "book";
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

function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = ZU.xpath(doc, '//div[@class="results"]//div[contains(@class, "item-ttl")]//a[@href]');
	for (var i=0; i<rows.length; i++) {
		var href = rows[i].href;
		var title = ZU.trimInternal(rows[i].textContent);
		if (!href || !title) continue;
		if (checkOnly) return true;
		found = true;
		items[href] = title;
	}
	return found ? items : false;
}


function scrape(doc, url) {
	//maximum PDF size to be downloaded. default to 10 MB
	var pref_maxPdfSizeMB = 10;
	var pdfurl = ZU.xpathText(doc, '//div[contains(@class, "thats-right")]/div/div/a[contains(text(), "PDF") and not(contains(text(), "B/W"))]/@href');
	var pdfSize = ZU.xpathText(doc, '//div[contains(@class, "thats-right")]/div/div/a[contains(text(), "PDF") and not(contains(text(), "B/W"))]/@data-original-title');
	//Z.debug(pdfurl);
	var canonicalurl = ZU.xpathText(doc, '//link[@rel="canonical"]/@href');
	if (canonicalurl) {
		var apiurl = canonicalurl + "&output=json";
		//alternative is
		//var apiurl = url.replace('/details/', '/metadata/').replace('/stream/', '/metadata/');
	} else {
		var apiurl = url.replace('/stream/', '/details/').replace(/#.*$/, '')  + "&output=json";
	}
	//Z.debug(apiurl);
	ZU.doGet(apiurl, function(text) {
		//Z.debug(text);
		try {
			var obj = JSON.parse(text).metadata;
		} catch (e) {
			Zotero.debug("JSON parse error");
			throw e;
		}
		var type = obj.mediatype[0];
		var itemType = typemap[type] || "document";
		if (type=="movies" && obj.collection.indexOf("tvarchive")>-1) {
			itemType = "tvBroadcast";
		}
		
		var newItem = new Zotero.Item(itemType);
		
		newItem.title = obj.title[0];
		var creators = obj.creator;
		if (creators) {
			//sometimes authors are in one field delimiter by ;
			if (creators && creators[0].match(/;/)) {
				creators = creators[0].split(/\s*;\s*/);
			}
			for (var i = 0; i<creators.length; i++) {
				//authors are lastname, firstname, additional info - only use the first two.
				var author = creators[i].replace(/(\,[^\,]+)(\,.+)/, "$1");
				if (author.indexOf(',')>-1) {
					newItem.creators.push(ZU.cleanAuthor(author, "author", true));
				} else {
					newItem.creators.push({"lastName": author, "creatorType": "author", "fieldMode": 1});
				}
			}
		}
		var contributors = obj.contributor;
		if (contributors) {
			for (var i = 0; i<contributors.length; i++) {
				//authors are lastname, firstname, additional info - only use the first two.
				var contributor = contributors[i].replace(/(\,[^\,]+)(\,.+)/, "$1");
				if (contributor.indexOf(',')>-1) {
					newItem.creators.push(ZU.cleanAuthor(contributor, "contributor", true));
				} else {
					newItem.creators.push({"lastName": contributor, "creatorType": "contributor", "fieldMode": 1});
				}
			}
		}

		for (var i = 0; i<newItem.creators.length; i++) {
			if (!newItem.creators[i].firstName) {
				newItem.creators[i].fieldMode = 1;
			}
		}
		//abstracts can be in multiple fields;
		if (obj.description) newItem.abstractNote = ZU.cleanTags(obj.description.join("; "));

		var date = obj.date || obj.year;
		
		var tags = test(obj.subject);
		if (tags) {
			tags = tags.split(/\s*;\s*/);
			for (var i =0; i<tags.length; i++) {
				newItem.tags.push(tags[i]);
			}
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
	if (detectWeb(doc, url) == "multiple") {
		Zotero.selectItems(getSearchResults(doc, false), function (items) {
			if (!items) {
				return true;
			}
			var articles = [];
			for (var i in items) {
				articles.push(i);
			}
			ZU.processDocuments(articles, scrape);
		});
	} else {
		scrape(doc, url);
	}
}
/** BEGIN TEST CASES **/
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
				"abstractNote": "Published by\n   MECC\nDeveloped by\n   MECC\nReleased\n   1990\nAlso For\n   Apple II, Atari 8-bit, Macintosh, Windows, Windows 3.x \nGenre\n   Adventure, Educational, Simulation\nPerspective\n   3rd-Person Perspective, Side-Scrolling\nSport\n   Hunting\nTheme\n   Managerial, Real-Time\nEducational\n   Geography, HistoryDescription\n  As a covered wagon party of pioneers, you head out west from Independence, Missouri to the Willamette River and valley in Oregon. You first must stock up on provisions, and then, while traveling, make decisions such as when to rest, how much food to eat, etc. The Oregon Trail incorporates simulation elements and planning ahead, along with discovery and adventure, as well as mini-game-like activities (hunting and floating down the Dalles River). From Mobygames.com. Original Entry",
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
	},
	{
		"type": "web",
		"url": "https://archive.org/stream/siopsecretusplan0000prin#page/n85/mode/2up",
		"items": [
			{
				"itemType": "book",
				"title": "SIOP, the secret U.S. plan for nuclear war",
				"creators": [
					{
						"firstName": "Peter",
						"lastName": "Pringle",
						"creatorType": "author"
					},
					{
						"lastName": "Internet Archive",
						"creatorType": "contributor",
						"fieldMode": 1
					}
				],
				"date": "1983",
				"abstractNote": "Bibliography: p. 263-277; Includes index",
				"language": "eng",
				"libraryCatalog": "Internet Archive",
				"numPages": "298",
				"publisher": "New York : Norton",
				"url": "http://archive.org/details/siopsecretusplan0000prin",
				"attachments": [],
				"tags": [
					"Nuclear warfare"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://archive.org/details/MSNBCW_20170114_020000_The_Rachel_Maddow_Show/start/60/end/120",
		"items": [
			{
				"itemType": "tvBroadcast",
				"title": "The Rachel Maddow Show : MSNBCW : January 13, 2017 6:00pm-7:01pm PST",
				"creators": [
					{
						"lastName": "MSNBCW",
						"creatorType": "contributor",
						"fieldMode": 1
					}
				],
				"date": "2017-01-14",
				"abstractNote": "Rachel Maddow takes a look at the day's top political news stories.",
				"language": "eng",
				"libraryCatalog": "Internet Archive",
				"runningTime": "01:01:00",
				"shortTitle": "The Rachel Maddow Show",
				"url": "http://archive.org/details/MSNBCW_20170114_020000_The_Rachel_Maddow_Show",
				"attachments": [],
				"tags": [
					"amd",
					"atlas",
					"backups",
					"bernie sanders",
					"breo",
					"britain",
					"charleston",
					"chuck schumer",
					"chuck todd",
					"cialis",
					"clinton",
					"comcast business",
					"directv",
					"donald trump",
					"donald trump jr.",
					"downy fabric conditioner",
					"fbi",
					"geico",
					"james comey",
					"john lewis",
					"london",
					"michael beschloss",
					"moscow",
					"nancy pelosi",
					"nbc news",
					"obama",
					"oregon",
					"osteo bi-flex",
					"rachel",
					"rachel maddow",
					"richard nixon",
					"russia",
					"south carolina",
					"titan atlas",
					"washington",
					"waterloo"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/