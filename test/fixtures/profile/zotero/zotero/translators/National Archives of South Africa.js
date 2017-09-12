{
	"translatorID": "5b02e8d4-d8fb-4143-af3d-3576d4c1b49c",
	"label": "National Archives of South Africa",
	"creator": "Adam Crymble",
	"target": "^https?://www\\.national\\.archsrch\\.gov\\.za",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsb",
	"lastUpdated": "2014-03-12 22:00:51"
}

function detectWeb(doc, url) {
	if (doc.title.match("Results Summary")) {
		return "multiple";
	} else if (doc.title.match("Results Detail")) {
		return "book";
	}
}

//National Archives of South Africa Translator. Code by Adam Crymble
function associateData(newItem, dataTags, field, zoteroField) {
	if (dataTags[field]) {
		newItem[zoteroField] = dataTags[field];
	}
}

function scrape(doc, url) {

	var dataTags = new Object();
	var tagsContent = new Array();
	var fieldTitle;

	var newItem = new Zotero.Item("book");


	var headers = doc.evaluate('//td[2]/pre/b', doc, null, XPathResult.ANY_TYPE, null);
	var xPathCount = doc.evaluate('count (//td[2]/pre/b)', doc, null, XPathResult.ANY_TYPE, null);
	var contents = doc.evaluate('//td[2]/pre', doc, null, XPathResult.ANY_TYPE, null).iterateNext().textContent;

	var headersArray = new Array();
	var oneHeader = '';

	if (xPathCount.numberValue > 1) {
		for (var i = 0; i < xPathCount.numberValue; i++) {
			fieldTitle = headers.iterateNext().textContent;
			headersArray.push(fieldTitle);
		}
	} else {
		oneHeader = (headers.iterateNext().textContent);
	}

	var contentsArray = new Array();
	var j = 0;

	if (oneHeader.length < 1) {

		for (var i = headersArray.length - 1; i > -1; i--) {

			var fieldIndex = contents.indexOf(headersArray[i]);
			var shorten = headersArray[i].length;

			contentsArray.push(contents.substr(fieldIndex));
			contents = contents.substr(0, fieldIndex);
			fieldTitle = headersArray[i].replace(/\s+/g, '');

			dataTags[fieldTitle] = contentsArray[j].substr(shorten).replace(/^\s*|\s+$/g, '');
			j++;
		}
	}

	associateData(newItem, dataTags, "DEPOT", "repository");
	associateData(newItem, dataTags, "REFERENCE", "callNumber");
	associateData(newItem, dataTags, "STARTING", "date");
	associateData(newItem, dataTags, "ENDING", "date");
	associateData(newItem, dataTags, "VOLUME_NO", "volume");
	associateData(newItem, dataTags, "REMARKS", "extra");
	associateData(newItem, dataTags, "SUMMARY", "abstractNote");
	associateData(newItem, dataTags, "SOURCE", "series");
	if (dataTags["DESCRIPTION"]) {
		associateData(newItem, dataTags, "DESCRIPTION", "title");
		newItem.title = ZU.capitalizeTitle(newItem.title, ignorePreference = "true")
	} else {
		newItem.title = "No Title Found";
	}
	newItem.complete();
}

function doWeb(doc, url) {
	var articles = new Array();
	if (detectWeb(doc, url) == "multiple") {
		var items = new Object();
		var titles = doc.evaluate('//td/a', doc, null, XPathResult.ANY_TYPE, null);
		var lastLink;
		var next_title;
		while (next_title = titles.iterateNext()) {

			if (!next_title.textContent.match(/^\d\d\d\d/) && !next_title.textContent.match(/\\/) && next_title.textContent.length > 3 && next_title.textContent.match(/\w/)) {
				Zotero.debug(next_title.textContent);
				items[next_title.href] = next_title.textContent.trim();
			}

		}
		Zotero.selectItems(items, function (items) {
			if (!items) {
				return true;
			}
			for (var i in items) {
				articles.push(i);
			}
			ZU.processDocuments(articles, scrape)
		});	
	}
	else {
		scrape(doc, url);
	}
} 
/** BEGIN TEST CASES **/
var testCases = []
/** END TEST CASES **/