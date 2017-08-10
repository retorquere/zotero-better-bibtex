{
	"translatorID": "2d174277-7651-458f-86dd-20e168d2f1f3",
	"label": "Canadiana.ca",
	"creator": "Adam Crymble, Sebastian Karcher",
	"target": "^https?://eco\\.canadiana\\.ca",
	"minVersion": "1.0.0b4.r5",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2012-07-03 16:44:04"
}

function detectWeb(doc, url) {
	if (url.match(/\/view\//)) {
		return "book";
	} else if (url.match(/\/search\?/)) {
		return "multiple";
	}
}


//Canadiana Translator Coding by Adam Crymble updated and cleaned by Sebastian Karcher
//because the site uses so many random formats for the "Published" field, it's not always perfect. But it works for MOST entries

function associateData(newItem, dataTags, field, zoteroField) {
	if (dataTags[field]) {
		newItem[zoteroField] = dataTags[field];
	}
}

function scrape(doc, url) {
	//declaring variables to be used later.
	var newItem = new Zotero.Item("book");
	var dataTags = new Object();
	var fieldTitle;
	var tagsContent = new Array();

	//these variables tell the program where to find the data we want in the HTML file we're looking at.
	//in this case, the data is found in a table.
	var xPath1 = '//div[@id="documentRecord"]//table/tbody/tr/th';
	var xPath2 = '//div[@id="documentRecord"]//table/tbody/tr/td';


	//at this point, all the data we want has been saved into the following 2 Objects: one for the headings, one for the content.
	// The 3rd object tells us how many items we've found.
	if (doc.evaluate('//div[@id="documentRecord"]//table/tbody/tr/th', doc, null, XPathResult.ANY_TYPE, null)) {
		var xPath1Results = doc.evaluate(xPath1, doc, null, XPathResult.ANY_TYPE, null);
		var xPath2Results = doc.evaluate(xPath2, doc, null, XPathResult.ANY_TYPE, null);
		var xPathCount = doc.evaluate('count (//div[@id="documentRecord"]//table/tbody/tr/th)', doc, null, XPathResult.ANY_TYPE, null);
	}

	//At this point we have two lists (xPath1Results and xPath2Results). this loop matches the first item in the first list
	//with the first item in the second list, and on until the end. 
	//If we then ask for the "Principal Author" the program returns "J.K. Rowling" instead of "Principal Author"
	if (doc.evaluate('//div[@id="documentRecord"]//table/tbody/tr/th', doc, null, XPathResult.ANY_TYPE, null)) {
		for (i = 0; i < xPathCount.numberValue; i++) {
			fieldTitle = xPath1Results.iterateNext().textContent.replace(/\s+/g, '');
			//gets the author's name without cleaning it away using cleanTags.
			if (fieldTitle == "Creator" || fieldTitle == "Créateur") {
				fieldTitle = "PrincipalAuthor";
				dataTags[fieldTitle] = (xPath2Results.iterateNext().textContent);
				var authorName = dataTags["PrincipalAuthor"];
				newItem.creators.push(Zotero.Utilities.cleanAuthor(dataTags["PrincipalAuthor"], "author"));

				//Splits Adressebibliographique or Imprint into 3 fields and cleans away any extra whitespace or unwanted characters.      		
			} else if (fieldTitle == "Adressebibliographique" || fieldTitle == "Published") {

				fieldTitle = "Imprint";
				dataTags[fieldTitle] = Zotero.Utilities.cleanTags(xPath2Results.iterateNext().textContent);

				var justDate = dataTags["Imprint"].match(/\d+[-\?\s\d]*/)[0];
				if (justDate) dataTags["Date"] = justDate;
				var place = dataTags["Imprint"].match(/.+?:/)[0];
				if (place) dataTags["Place"] = place.trim().replace(/[\[\]\:]*/g, "")
				var publisher = dataTags["Imprint"].match(/\:[^,\d]+/)[0];
				if (publisher) dataTags["Publisher"] = publisher.replace(/[\[\]:\?]/g, "").trim();

				// determines how many tags there will be, pushes them into an array and clears away whitespace.
			} else if (fieldTitle == "Subject" || fieldTitle == "Sujet") {
				tagsContent = Zotero.Utilities.cleanTags(xPath2Results.iterateNext().textContent.trim());
				tagsContent = tagsContent.replace(/\s*\n+\s*/g, "||").split(/\|\|/);
				Z.debug(tagsContent)

			}
			//Adds a string to CIHM no: and ICMH no: so that the resulting number makes sense to the reader.
			else if (fieldTitle == "Identifier" || fieldTitle == "Identificateur") {
				fieldTitle = "CIHMno.";
				dataTags[fieldTitle] = xPath2Results.iterateNext().textContent;

				dataTags["CIHMno."] = "CIHM Number: " + dataTags["CIHMno."].trim();
			} else {

				dataTags[fieldTitle] = Zotero.Utilities.cleanTags(xPath2Results.iterateNext().textContent.replace(/^\s*|\s*$/g, ''));

			}
		}
	}

	//makes tags of the items in the "tagsContent" array.
	for (var i = 0; i < tagsContent.length; i++) {
		newItem.tags[i] = tagsContent[i];
	}

	//calls the associateData function to put the data in the correct Zotero field.	
	//English
	associateData(newItem, dataTags, "Title", "title");
	associateData(newItem, dataTags, "Place", "place");
	associateData(newItem, dataTags, "Publisher", "publisher");
	associateData(newItem, dataTags, "Date", "date");
	associateData(newItem, dataTags, "Language", "language");
	associateData(newItem, dataTags, "Pages", "pages");
	associateData(newItem, dataTags, "CIHMno.", "extra");
	associateData(newItem, dataTags, "DocumentSource", "rights");
	associateData(newItem, dataTags, "PermanentLink", "URL");

	//French
	associateData(newItem, dataTags, "Titre", "title");
	associateData(newItem, dataTags, "Langue", "language");
	associateData(newItem, dataTags, "Nombredepages", "pages");
	associateData(newItem, dataTags, "ICMHno", "extra");
	associateData(newItem, dataTags, "Documentoriginal", "rights");
	associateData(newItem, dataTags, "Lienpermanent", "URL");
	//make sure that English language date is marked as en-US so Zotero doesn't get confused
	//about title casing.
	newItem.title = ZU.trimInternal(newItem.title)
	if (newItem.language) {
		if (newItem.language.match(/English|Anglais/)) newItem.language = "en-CA";
	}
	//Saves everything to Zotero.	
	newItem.complete();

}


function doWeb(doc, url) {
	var articles = new Array();
	if (detectWeb(doc, url) == "multiple") {
		var items = new Object();
		var titles = doc.evaluate('//h2/a[contains(@href, "/view")]', doc, null, XPathResult.ANY_TYPE, null);
		var next_title;
		while (next_title = titles.iterateNext()) {
			items[next_title.href] = next_title.textContent;
		}
		Zotero.selectItems(items, function (items) {
			if (!items) {
				return true;
			}
			for (var i in items) {
				articles.push(i);
			}
			Zotero.Utilities.processDocuments(articles, scrape, function () {
				Zotero.done();
			});
		});
	} else {
		scrape(doc, url);
	}
} 

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://eco.canadiana.ca/view/oocihm.44987/2?r=0&s=1",
		"items": [
			{
				"itemType": "book",
				"title": "Toronto Lying-In Hospital. Report of the Toronto Lying-In Hospital : for the year 1857.",
				"creators": [],
				"date": "1857?",
				"extra": "CIHM Number: 44987",
				"language": "eng",
				"libraryCatalog": "Canadiana.ca",
				"place": "Toronto?",
				"publisher": "s.n.",
				"shortTitle": "Toronto Lying-In Hospital. Report of the Toronto Lying-In Hospital",
				"attachments": [],
				"tags": [
					"Hospitals -- Ontario -- Toronto.",
					"Hôpitaux -- Ontario -- Toronto.",
					"Toronto Lying-In Hospital."
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://eco.canadiana.ca/search?q=Toronto&field=",
		"items": "multiple"
	}
]
/** END TEST CASES **/