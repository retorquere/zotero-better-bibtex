{
	"translatorID": "b10bf941-12e9-4188-be04-f6357fa594a0",
	"label": "Old Bailey Online",
	"creator": "Adam Crymble",
	"target": "^https?://www\\.oldbaileyonline\\.org/",
	"minVersion": "1.0.0b4.r5",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2017-01-08 16:37:54"
}

function detectWeb(doc, url) {
	if (doc.location.href.match("search")) {
		return "multiple";
	} else if (doc.location.href.match("browse")) {
		return "case";
	}
}

function scrape(doc, url) {	
	var newItem = new Zotero.Item("case");
	newItem.title = doc.evaluate('//div[@class="sessionsPaperTitle"]', doc, null, XPathResult.ANY_TYPE, null).iterateNext().textContent;	
	newItem.url = doc.location.href;

	//More information is saved in the childrens of the "apparatus" node
	//where the label is always bold (b-node) and we will use them to separate
	//the the text content into different fields.
	var headers = ZU.xpath(doc, '//div[@class="apparatus"]/b');
	var contents = ZU.xpathText(doc, '//div[@class="apparatus"]');
	
	var j = 0;
	
	for (var i=headers.length-1; i>-1; i--) {
		var label = headers[i].textContent;
		var fieldIndex = contents.indexOf(label);
		var text = contents.substr(fieldIndex);
		
		label = label.replace(/\s+/g, '');
		if (label == "ReferenceNumber:") {
			var startValue = text.indexOf(":")+2;
			newItem.docketNumber = text.substr(startValue);
		} else if (label != "Navigation:") {
			newItem.tags.push(text);
		}
		
		contents = contents.substr(0, fieldIndex);
		j++;
	}

	newItem.complete();
}


function doWeb(doc, url) {

	var articles = new Array();
	var onlyResultSet = false;
	
	if (detectWeb(doc, url) == "multiple") {
		var items = new Object();
		
		var titles = doc.evaluate('//li/p[@class="srchtitle"]/a', doc, null, XPathResult.ANY_TYPE, null);
			
		var next_title;
		while (next_title = titles.iterateNext()) {
			items[next_title.href] = next_title.textContent;
		}
		// add option to save search URL as single item
		items["resultSet"] = "Save search URL as item";

		items = Zotero.selectItems(items);
		
		for (var i in items) {
			articles.push(i);
		}
		// if option to save result set is selected
		if (items["resultSet"]) {
			if (articles.length == 1) {
				onlyResultSet = true;
			}
			var newItem = new Zotero.Item("case");
			
			newItem.title = 'Old Bailey Search Result Set';
			
			var searchURL = doc.location.href;
			newItem.url = searchURL;
	
			// define dictionary for easier reading
			var defs = {
			"_divs_fulltext": "Keywords",
			"_persNames_surname": "Surname",
			"_persNames_given": "Given name",
			"_persNames_alias": "Alias",
			"_offences_offenceCategory_offenceSubcategory": "Offence",
			"_verdicts_verdictCategory_verdictSubcategory": "Verdicts",
			"_punishments_punishmentCategory_punishmentSubcategory": "Punishment",
			"_divs_div0Type_div1Type": "Corpus",
			"fromMonth": "From month",
			"fromYear": "From year",
			"toMonth": "To month",
			"toYear": "To year"
			};
	
			// parse URL into human-readable elements
			var noteText = '<b>Search Parameters</b><br/>';
			var re  = /(?:\?|&(?:amp;)?)([^=]+)=?([^&]*)?/g;
			var match;
			var key='';
			while (match = re.exec(searchURL)) {
				if (defs[match[1]] != null) {
					key = defs[match[1]];
					noteText += key + ": " + unescape(match[2]) + "<br/>";
				}
			}
			
			// save them in the notes field
			newItem.notes.push({note: noteText});
			newItem.complete();
			
			// remove dummy url for result set from articles list 
			articles.pop();
		}
	}
	else if (doc.evaluate('//div[@id="main2"]/p/a', doc, null, XPathResult.ANY_TYPE, null).iterateNext()) {

		var xmlOrText = doc.evaluate('//div[@id="main2"]/p/a', doc, null, XPathResult.ANY_TYPE, null).iterateNext();
	
		if (xmlOrText.textContent.match("Text")) {
			articles = [xmlOrText.href];	
		} 
		else {
			articles = [url];
		}
	}
		
	if (!onlyResultSet) {
		Zotero.Utilities.processDocuments(articles, scrape);	
	}	
}
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://www.oldbaileyonline.org/browse.jsp?id=t16780828-12&div=t16780828-12&terms=hog#highlight",
		"items": [
			{
				"itemType": "case",
				"caseName": "Theft > animal theft, 28th August 1678.",
				"creators": [],
				"docketNumber": "t16780828-12",
				"url": "https://www.oldbaileyonline.org/browse.jsp?id=t16780828-12&div=t16780828-12&terms=hog#highlight",
				"attachments": [],
				"tags": [
					"Offence: Theft > animal theft",
					"Verdict: Guilty"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.oldbaileyonline.org/search.jsp?form=custom&_divs_fulltext=animal&kwparse=and&_persNames_surname=&_persNames_given=&_persNames_alias=&_persNames_gender=&fromAge=&toAge=&_occupations_value=&_persNames_home=&_offences_offenceCategory_offenceSubcategory=&_offences_offenceDescription=&_verdicts_verdictCategory_verdictSubcategory=&_punishments_punishmentCategory_punishmentSubcategory=&_punishments_punishmentDescription=&_crimeDates_value=&_offences_crimeLocation=&_divs_div0Type_div1Type=&fromMonth=&fromYear=&toMonth=&toYear=&ref=&submit.x=0&submit.y=0",
		"items": "multiple"
	}
]
/** END TEST CASES **/