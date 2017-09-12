{
	"translatorID": "8381bf68-11fa-418c-8530-2e00284d3efd",
	"label": "IRIS",
	"creator": "Chad Mills and Michael Berkowitz",
	"target": "^https?://[^/]*www[\\.\\-]iris[\\.\\-]rutgers[\\.\\-]edu[^/]*/",
	"minVersion": "1.0.0b4.r5",
	"maxVersion": "",
	"priority": 90,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2013-06-08 12:14:42"
}

function detectWeb(doc, url) {
	if (doc.evaluate('//div[@class="content_container"]/div[@class="content"]/form[@id="hitlist"]', doc, null, XPathResult.ANY_TYPE, null).iterateNext()) {
		return "multiple";
	} else if (doc.evaluate('//div[@class="content_container item_details"]/div[@class="content"]/ul[contains(@class, "detail_page")]/li/div/table', doc, null, XPathResult.ANY_TYPE, null).iterateNext()) {
		return "book";
	}
}

function scrape(doc) {

	var xpath = '//div[@class="content_container item_details"]/div[@class="content"]/ul[contains(@class, "detail_page")]/li/div/table//tr[th[@class="viewmarctags1"]][td[@class="viewmarctags"]]';

	var elmts = doc.evaluate(xpath, doc, null, XPathResult.ANY_TYPE, null);

	var elmt = elmts.iterateNext();

	if (!elmt) {
		return false;
	}

	var newItem = new Zotero.Item("book");
	newItem.extra = "";

	newItem.series = "";
	var seriesItemCount = 0;

	while (elmt) {
		try {
			var node = doc.evaluate('./TD[1]/A[1]/text()[1]', elmt, null, XPathResult.ANY_TYPE, null).iterateNext();
			if (!node) {
				var node = doc.evaluate('./TD[1]/text()[1]', elmt, null, XPathResult.ANY_TYPE, null).iterateNext();
			}
			if (node) {
				var casedField = Zotero.Utilities.superCleanString(doc.evaluate('./TH[1]/text()', elmt, null, XPathResult.ANY_TYPE, null).iterateNext().nodeValue);
				field = casedField.toLowerCase();

				var value = Zotero.Utilities.superCleanString(node.nodeValue);

				if (field == "publisher") {
					newItem.publisher = value;
				} else if (field == "pub date") {
					var re = /[0-9]+/;
					var m = re.exec(value);
					newItem.date = m[0];
				} else if (field == "isbn") {
					var re = /^[0-9](?:[0-9X]+)/;
					var m = re.exec(value);
					newItem.ISBN = m[0];
				} else if (field == "title") {
					Zotero.debug(value);
					var titleParts = value.split(" / ");
					re = /\[(.+)\]/i;
					if (re.test(titleParts[0])) {
						var ar = re.exec(titleParts[0]);
						var itype = ar[1].toLowerCase();
						if (itype == "phonodisc" || itype == "sound recording") {
							newItem.itemType = "audioRecording";
						} else if (itype == "videorecording") {
							newItem.itemType = "videoRecording";
						} else if (itype == "electronic resource") {
							newItem.itemType = "webPage";
						}
					}
					newItem.title = Zotero.Utilities.capitalizeTitle(titleParts[0]);
				} else if (field == "series") { //push onto item, delimit with semicolon when needed
					if (seriesItemCount != 0) {
						newItem.series += "; " + value;
					} else if (seriesItemCount == 0) {
						newItem.series = value;
					}
					seriesItemCount++; //bump counter
				} else if (field == "dissertation note") {
					newItem.itemType = "thesis";
					var thesisParts = value.split("--");
					var uniDate = thesisParts[1].split(", ");
					newItem.university = uniDate[0];
					newItem.date = uniDate[1];
				} else if (field == "edition") {
					newItem.edition = value;
				} else if (field == "physical descrip") {
					//support
					var physParts = value.split(" : ");
					var physParts = physParts[0].split(" ; ");
					//determine pages, split on " p."
					var physPages = value.split(" p.");
					//break off anything in the beginning before the numbers
					var pageParts = physPages[0].split(" ");
					newItem.numPages = pageParts[pageParts.length - 1];
				} else if (field == "publication info") {
					var pubParts = value.split(" : ");
					newItem.place = pubParts[0];
					//drop off first part of array and recombine
					pubParts.shift();
					var i;
					var publisherInfo;
					for (i in pubParts) {
						if (i == 0) {
							publisherInfo = pubParts[i] + " : ";
						} else {
							publisherInfo = publisherInfo + pubParts[i] + " : ";
						}
					} //END for
					//drop off last colon
					publisherInfo = publisherInfo.substring(0, (publisherInfo.length - 3));
					//break apart publication parts into Publisher and Date
					var publisherParts = publisherInfo.split(",");
					newItem.publisher = publisherParts[0];
					//check that first character isn't a 'c', if so drop it
					if (publisherParts[1].substring(1, 2) == "c") {
						newItem.date = publisherParts[1].substring(2);
					} else {
						newItem.date = publisherParts[1];
					}
				} else if (field == "personal author") {
					newItem.creators.push(Zotero.Utilities.cleanAuthor(value, "author", true));
				} else if (field == "performer") {
					newItem.creators.push(Zotero.Utilities.cleanAuthor(value, "performer", true));
				} else if (field == "author") {
					newItem.creators.push(Zotero.Utilities.cleanAuthor(value, "author", true));
				} else if (field == "added author") {
					newItem.creators.push(Zotero.Utilities.cleanAuthor(value, "contributor", true));
				} else if (field == "conference author" || field == "corporate author") {
					newItem.creators.push(value);
				} else if (field == "subject" || field == "corporate subject" || field == "geographic term") {
					var subjects = value.split("--");
					newItem.tags = newItem.tags.concat(subjects);
				} else if (field == "personal subject") {
					var subjects = value.split(", ");
					newItem.tags = newItem.tags.push(value[0] + ", " + value[1]);
				} else if (value && field != "http") {
					newItem.extra += casedField + ": " + value + "\n";
				}
			}
		} catch (e) {}
		elmt = elmts.iterateNext();
	} //END if node
	if (newItem.extra) {
		newItem.extra = newItem.extra.substr(0, newItem.extra.length - 1);
	}

	var callNumber = doc.evaluate('//tr/td[1][@class="holdingslist"]/strong/text()', doc, null, XPathResult.ANY_TYPE, null).iterateNext();

	if (callNumber && callNumber.nodeValue) {
		newItem.callNumber = callNumber.nodeValue;
	}

	newItem.libraryCatalog = "IRIS";
	newItem.complete();
	return true;
} //END try
function doWeb(doc, url) {
	if (!scrape(doc)) {
		var checkboxes = new Array();
		var urls = new Array();
		var availableItems = new Array();
		//pull items
		var tableRows = doc.evaluate('//ul[@class="hit_list"]/li/ul[contains(@class, "hit_list_row")][//input[@value="Details"]]', doc, null, XPathResult.ANY_TYPE, null);

		// Go through table rows
		while (tableRow = tableRows.iterateNext()) {
			var input = doc.evaluate('.//input[@value="Details"]', tableRow, null, XPathResult.ANY_TYPE, null).iterateNext();
			var text = doc.evaluate('.//strong', tableRow, null, XPathResult.ANY_TYPE, null).iterateNext().textContent;
			if (text) {
				availableItems[input.name] = text;
			}
		} //END while
		var items = Zotero.selectItems(availableItems);
		if (!items) {
			return true;
		}
		var hostRe = new RegExp("^http(?:s)?://[^/]+");
		var m = hostRe.exec(doc.location.href);
		Zotero.debug("href: " + doc.location.href);
		var hitlist = doc.forms.namedItem("hitlist");
		var baseUrl = m[0] + hitlist.getAttribute("action") + "?first_hit=" + hitlist.elements.namedItem("first_hit").value + "&last_hit=" + hitlist.elements.namedItem("last_hit").value;
		var uris = new Array();
		for (var i in items) {
			uris.push(baseUrl + "&" + i + "=Details");
		}
		Zotero.Utilities.processDocuments(uris, function (doc) {
			scrape(doc)
		}, function () {
			Zotero.done()
		}, null);
		Zotero.wait();
	} //END if not scrape(doc)
} //END scrape function
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://www-iris-rutgers-edu.proxy.libraries.rutgers.edu/uhtbin/cgisirsi/0/0/0/123?srchfield1=&searchdata1=4835224%7bCKEY%7d&library=",
		"items": [
			{
				"itemType": "book",
				"creators": [
					{
						"firstName": "Kōzō",
						"lastName": "Yamamura",
						"creatorType": "contributor"
					},
					{
						"firstName": "Wolfgang",
						"lastName": "Streeck",
						"creatorType": "contributor"
					}
				],
				"notes": [],
				"tags": [
					"Capitalism",
					"Capitalism",
					"Economic policy",
					"Economic policy",
					"Germany",
					"Germany",
					"Japan",
					"Japan"
				],
				"seeAlso": [],
				"attachments": [],
				"extra": "Contents: Convergence or diversity? : stability and change in German and Japanese capitalism / Wolfgang Streeck and Kozo Yamamura -- Germany and Japan : binding versus autonomy / Erica R. Gould and Stephen D. Krasner -- Regional states : Japan and Asia,  Germany in Europe / Peter J. Katzenstein -- Germany and Japan in a new phase of capitalism / Kozo Yamamura -- The embedded innovation systems of Germany and Japan / Robert Boyer -- The future of nationally embedded capitalism / Kathleen Thelen and Ikuo Kume -- Transformation and interaction / Ulrich Jürgens -- From banks to markets / Sigurt Vitols -- Corporate governance in Germany and Japan / Gregory Jackson -- The re-organization of organized capitalism / Steven K. Vogel -- Competitive party democracy and political-economic reform in Germany and Japan / Herbert Kitschelt\nSecondary subject: Capitalisme--Allemagne\nSecondary subject: Capitalisme--Japon\nSecondary subject: Allemagne--Politique économique\nSecondary subject: Japon--Politique économique\n: e!Cr, 耕造\nRelated info: Book review (H-Net) http://www.h-net.org/review/hrev-a0e5q7-aa",
				"series": "Cornell studies in political economy; Cornell studies in political economy",
				"title": "The end of diversity?: prospects for German and Japanese capitalism",
				"place": "Ithaca",
				"publisher": "Cornell University Press",
				"date": "2003",
				"numPages": "401",
				"callNumber": "HC286.8.E39 2003",
				"libraryCatalog": "IRIS",
				"shortTitle": "The end of diversity?"
			}
		]
	}
]
/** END TEST CASES **/