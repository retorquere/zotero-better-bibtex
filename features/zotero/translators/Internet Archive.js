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
	"lastUpdated": "2012-07-10 06:51:49"
}

function detectWeb(doc, url) {
	var mediaType = "1";

	if (doc.evaluate('//h3', doc, null, XPathResult.ANY_TYPE, null).iterateNext()) {
		mediaType = doc.evaluate('//h3', doc, null, XPathResult.ANY_TYPE, null).iterateNext().textContent;

	} else if (doc.evaluate('//div[@class="box"][@id="spotlight"]/h1', doc, null, XPathResult.ANY_TYPE, null).iterateNext()) {
		mediaType = doc.evaluate('//div[@class="box"][@id="spotlight"]/h1', doc, null, XPathResult.ANY_TYPE, null).iterateNext().textContent;

	} else if (doc.evaluate('//div[@class="box"]/h1', doc, null, XPathResult.ANY_TYPE, null).iterateNext()) {
		mediaType = doc.evaluate('//div[@class="box"]/h1', doc, null, XPathResult.ANY_TYPE, null).iterateNext().textContent;
	}

	if (mediaType == "The Item") {
		return "artwork";
	} else if (mediaType.indexOf("Spotlight") != -1) {
		return "book";
	} else if (mediaType.indexOf("book") != -1) {
		return "book";
	} else if (mediaType.indexOf("movie") != -1) {
		return "film";
	} else if (mediaType.indexOf("audio") != -1) {
		return "audioRecording";
	} else if (doc.location.href.match("search") && mediaType == "1") {
		return "multiple";
	}
}

var typemap = {
	"texts": "book",
	"movies": "film",
	"audio": "audioRecording",
	"etree": "audioRecording",
	"software": "computerProgram"
}

function test(data){
	var clean = data ? data[0] : undefined;
	return clean;
}

function scrape(apiurl) {
		ZU.doGet(apiurl, function (text) {
			Z.debug(text)
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
			if(obj.description) newItem.abstractNote = obj.description.join("; ");

			var date = obj.date;
			if (!date) date = obj.year;
			var tags = test(obj.subject);
			if (tags) tags = tags.split(/\s*;\s*/);
			for (i in tags) {
				newItem.tags.push(tags[i]);
			}
			newItem.date = test(date);
			newItem.publisher = test(obj.publisher);
			newItem.language = test(obj.language);
			newItem.callNumber = test(obj.call_number);
			newItem.numPages = test(obj.imagecount);
			newItem.runningTime = test(obj.runtime);
			newItem.rights = test(obj.licenseurl);
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

			var titles = doc.evaluate('//td[2][@class="hitCell"]/a[@class="titleLink"]', doc, null, XPathResult.ANY_TYPE, null);
			var next_title;
			while (next_title = titles.iterateNext()) {
				items[next_title.href] = next_title.textContent;
			}

			Zotero.selectItems(items, function (items) {
				if (!items) {
					return true;
				}
				for (var i in items) {
					articles.push(i + "&output=json");
				}
				scrape(articles, function () {})
			});
		} else {
			scrape(url + "&output=json");
		}
	}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://archive.org/details/gullshornbookstu00dekk",
		"items": [
			{
				"itemType": "book",
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
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [],
				"title": "The gull's hornbook : Stultorum plena sunt omnia. Al savio mezza parola basta",
				"abstractNote": "Notes by John Nott; Bibliography of Dekker: p. iii-ix",
				"date": "1812",
				"publisher": "Bristol, Reprinted for J.M. Gutch and Sold in London by R. Baldwin, and R. Triphook",
				"language": "eng",
				"callNumber": "31735060398496",
				"numPages": "228",
				"url": "http://archive.org/details/gullshornbookstu00dekk",
				"libraryCatalog": "Internet Archive",
				"accessDate": "CURRENT_TIMESTAMP",
				"shortTitle": "The gull's hornbook"
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
				"notes": [],
				"tags": [],
				"seeAlso": [],
				"attachments": [],
				"title": "Allen Ginsberg, Anne Waldman, Steven Taylor and Bobbi Louise Hawkins performance, July, 1989.",
				"abstractNote": "Second half of a reading with Allen Ginsberg, Bobbie Louise Hawkins, Anne Waldman, and Steven Taylor.  This portion of the reading features Waldman and Ginsberg. (Continued from 89P045)",
				"date": "1989-07-08 00:00:00",
				"publisher": "Jack Kerouac School of Disembodied Poetics",
				"runningTime": "1:30:05",
				"rights": "http://creativecommons.org/licenses/by-nd-nc/1.0/",
				"url": "http://archive.org/details/Allen_Ginsberg__Anne_Waldman__Steven_Tay_89P046",
				"libraryCatalog": "Internet Archive",
				"accessDate": "CURRENT_TIMESTAMP"
			}
		]
	},
	{
		"type": "web",
		"url": "http://archive.org/details/AboutBan1935",
		"items": [
			{
				"itemType": "film",
				"creators": [
					{
						"lastName": "Castle Films",
						"creatorType": "author",
						"fieldMode": 1
					}
				],
				"notes": [],
				"tags": [
					"Agriculture: Bananas",
					"Central America"
				],
				"seeAlso": [],
				"attachments": [],
				"title": "About Bananas",
				"abstractNote": "Complete presentation of the banana industry from the clearing of the jungle and the planting to the shipment of the fruit to the American markets.",
				"date": "1935",
				"runningTime": "11:03",
				"rights": "http://creativecommons.org/licenses/publicdomain/",
				"url": "http://archive.org/details/AboutBan1935",
				"libraryCatalog": "Internet Archive",
				"accessDate": "CURRENT_TIMESTAMP"
			}
		]
	}
]
/** END TEST CASES **/